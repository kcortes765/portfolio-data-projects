"""Independent fixtures and failure tests. Run: python -m unittest discover -s pipeline -v."""
import contextlib
import csv
import hashlib
import io
import json
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch
import duckdb
import build as pipeline


def sample(**changes):
    row = dict(zip(pipeline.FIELDS, ['2025','1','Solar Fotovoltaica','SING','ERNC','Example unit','12,50','2026-03-16']))
    return row | changes


def encode(rows, fields=None):
    stream = io.StringIO()
    writer = csv.DictWriter(stream, fieldnames=fields or pipeline.FIELDS)
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue().encode()


class SourceContractTests(unittest.TestCase):
    def test_decimal_comma_and_negative_are_exact(self):
        self.assertEqual(pipeline.parse_number('12345,6789012345'), Decimal('12345.6789012345'))
        self.assertEqual(pipeline.parse_number('-3,16'), Decimal('-3.16'))

    def test_invalid_numbers_rejected(self):
        for value in ['', 'NaN', 'Infinity', '1.23', '1,2,3', 'abc']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                pipeline.parse_number(value)

    def test_schema_drift_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Schema drift'):
            pipeline.inspect_csv(b'anio,mes\n2025,1\n')

    def test_missing_or_truncated_fields_rejected(self):
        for data in [encode([sample(codigo_central='')]), ','.join(pipeline.FIELDS).encode()+b'\n2025,1\n']:
            with self.assertRaisesRegex(ValueError, 'Missing'):
                pipeline.inspect_csv(data)

    def test_invalid_month_and_unknown_categories_rejected(self):
        for change in [dict(mes='13'), dict(anio='2013'), dict(subsistema='SEN'), dict(clasificacion='New')]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                pipeline.inspect_csv(encode([sample(**change)]))

    def test_missing_calendar_month_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Missing calendar'):
            pipeline.inspect_csv(encode([sample(), sample(mes='3')]))

    def test_ambiguous_duplicates_and_negative_are_preserved(self):
        rows, report = pipeline.inspect_csv(encode([sample(),sample(),sample(generacion_mwh='-3,16')]))
        self.assertEqual(len(rows), 3)
        self.assertEqual(report['duplicate_key_excess'], 2)
        self.assertEqual(report['exact_duplicate_excess'], 1)
        self.assertEqual(len(report['negative_rows']), 1)
        self.assertEqual(Decimal(report['total_mwh']), Decimal('21.84'))

    def test_request_rejects_untrusted_host_without_network(self):
        for url in ['http://datos.gob.cl/file', 'https://example.com/file', 'https://datos.gob.cl.evil/file']:
            with self.assertRaises(ValueError):
                pipeline.request(url)


class ProductTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="gridops O'Connor ")
        self.root = Path(self.temp.name)
        self.raw = self.root/'data/raw'
        self.public = self.root/'public/data'
        self.raw.mkdir(parents=True)
        (self.root/'pipeline').mkdir()
        (self.root/'pipeline/models.sql').write_text((pipeline.ROOT/'pipeline/models.sql').read_text())
        body = encode([sample(),sample(),sample(generacion_mwh='-3,16'),sample(mes='2',generacion_mwh='20')])
        self.digest = hashlib.sha256(body).hexdigest()
        (self.raw/(self.digest+'.csv')).write_bytes(body)
        meta = dict(sha256=self.digest,retrieved_at='2026-09-12T00:00:00Z',license_title='CC BY',license_url='https://opendefinition.org/licenses/cc-by/',resources=[dict(id=pipeline.RESOURCE_ID,url='https://datos.gob.cl/test-fixture.csv',last_modified='2026-04-01T00:00:00Z')])
        (self.raw/'source-metadata.json').write_text(json.dumps(meta))
        self.patcher = patch.multiple(pipeline, ROOT=self.root, RAW=self.raw, PUBLIC=self.public)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()
        self.temp.cleanup()

    def run_build(self):
        with contextlib.redirect_stdout(io.StringIO()):
            pipeline.build()

    def test_sql_preserves_rows_and_exact_energy(self):
        self.run_build()
        db = duckdb.connect()
        path = str(self.public/self.digest[:12]/'observations.parquet')
        count, distinct, total = db.execute('SELECT count(*),count(DISTINCT source_row),sum(mwh) FROM read_parquet(?)',[path]).fetchone()
        self.assertEqual((count,distinct,total), (4,4,Decimal('41.84')))
        mart = json.loads((self.public/'dataset.json').read_bytes())
        self.assertEqual([r['mwh'] for r in mart['records']], [21.84,20.0])
        self.assertEqual([r['source_rows'] for r in mart['records']], [3,1])
        db.close()

    def test_rebuild_is_idempotent_for_every_data_product(self):
        self.run_build()
        before={p.relative_to(self.public):hashlib.sha256(p.read_bytes()).hexdigest() for p in self.public.rglob('*') if p.is_file()}
        self.run_build()
        after={p.relative_to(self.public):hashlib.sha256(p.read_bytes()).hexdigest() for p in self.public.rglob('*') if p.is_file()}
        self.assertEqual(before,after)

    def test_corrupt_source_does_not_replace_published_pointer(self):
        self.run_build()
        before=(self.public/'dataset.json').read_bytes()
        (self.raw/(self.digest+'.csv')).write_bytes(b'corrupted')
        with self.assertRaisesRegex(ValueError,'hash mismatch'):
            self.run_build()
        self.assertEqual(before,(self.public/'dataset.json').read_bytes())


if __name__ == '__main__':
    unittest.main()
