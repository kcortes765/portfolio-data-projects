"""Compare a running app with an independent Decimal aggregation of the raw CSV."""
import argparse
import csv
import io
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--base',default='http://localhost:4175')
args=parser.parse_args()
meta=json.loads((ROOT/'data/raw/source-metadata.json').read_bytes())
rows=list(csv.DictReader(io.StringIO((ROOT/'data/raw'/f"{meta['sha256']}.csv").read_text(encoding='utf-8-sig'))))
expected=[r for r in rows if r['anio']=='2025' and r['tecnologia']=='Solar Fotovoltaica' and r['subsistema']=='SING']
total=sum((Decimal(r['generacion_mwh'].replace(',','.')) for r in expected),Decimal(0))
query='/api/generation?start=2025-01&end=2025-12&technology=Solar%20Fotovoltaica&subsystem=SING'
checks=[]
with urllib.request.urlopen(args.base+query,timeout=30) as response:
    result=json.load(response)
assert result['count']==12 and abs(Decimal(str(result['total_mwh']))-total)<Decimal('0.00001')
assert sum(r['source_rows'] for r in result['data'])==len(expected)
checks.append(dict(name='API JSON vs independent raw Decimal aggregation',status='pass',raw_rows=len(expected),total_mwh=str(total)))
with urllib.request.urlopen(args.base+query+'&format=csv',timeout=30) as response:
    text=response.read().decode('utf-8-sig')
    assert 'attachment;' in response.headers['Content-Disposition']
    exported=list(csv.DictReader(io.StringIO(text)))
assert len(exported)==12 and abs(sum(Decimal(r['mwh']) for r in exported)-total)<Decimal('0.00001')
checks.append(dict(name='CSV download matches filters, count and energy',status='pass'))
for query in ['?start=2026-02&end=2025-01','?technology=Invented','?start=2099-01']:
    try:
        urllib.request.urlopen(args.base+'/api/generation'+query,timeout=30)
        raise AssertionError('Invalid request accepted')
    except urllib.error.HTTPError as exc:
        assert exc.code==400
checks.append(dict(name='Invalid dates and categories return HTTP 400',status='pass'))
with urllib.request.urlopen(args.base+'/api/generation?technology=Solar%20Fotovoltaica&classification=Convencional',timeout=30) as response:
    empty=json.load(response)
assert empty['count']==0 and empty['total_mwh']==0
checks.append(dict(name='No-data selection is empty, not invented observations',status='pass'))
try:
    with urllib.request.urlopen(args.base+'/api/source-status',timeout=30) as response:
        status=json.load(response)
    assert status['scope']=='metadata-only' and status['data_refreshed'] is False
    checks.append(dict(name='Live official metadata check',status='pass',result=status))
except urllib.error.HTTPError as exc:
    assert exc.code==502
    checks.append(dict(name='Live official metadata check',status='upstream-unavailable',http_status=502))
report=dict(executed_at=datetime.now(timezone.utc).isoformat(),base=args.base,checks=checks)
(ROOT/'docs/validation/http-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
