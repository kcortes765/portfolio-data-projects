"""GridOps: immutable CNE snapshots -> DuckDB SQL -> validated data products.

Run with Python 3.11+ and duckdb==1.4.4. No credentials or LLM required.
"""
from __future__ import annotations
import argparse, csv, hashlib, io, json, math, os, time, urllib.request
from collections import Counter
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
import duckdb

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'data/raw'
PUBLIC = ROOT / 'public/data'
PACKAGE_URL = 'https://datos.gob.cl/api/3/action/package_show?id=generacion-bruta'
RESOURCE_ID = '389a1943-9c3d-4957-982a-58e3fb0c1bdb'
FIELDS = ['anio','mes','tecnologia','subsistema','clasificacion','codigo_central','generacion_mwh','fecha_act']
KEY_FIELDS = FIELDS[:6]

def json_bytes(obj):
    return json.dumps(obj,ensure_ascii=False,allow_nan=False,separators=(',',':')).encode('utf-8')

def atomic_write(path: Path, data: bytes):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_name(path.name+'.tmp')
    temp.write_bytes(data)
    os.replace(temp,path)

def request(url: str, attempts=3) -> bytes:
    if not url.startswith('https://datos.gob.cl/'):
        raise ValueError('Only the allowlisted official HTTPS host is supported')
    error=None
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'GridOps/1.0 (open-data portfolio)'}),timeout=45) as response:
                if not response.url.startswith('https://datos.gob.cl/'):
                    raise ValueError('Source redirected outside the official HTTPS host')
                data=response.read(25*1024*1024+1)
                if len(data)>25*1024*1024:raise ValueError('Source exceeds the 25 MiB safety limit; review the new resource')
                return data
        except (OSError,TimeoutError) as exc:
            error=exc
            if attempt+1<attempts:time.sleep(2**attempt)
    raise RuntimeError(f'Official source unavailable after {attempts} attempts') from error

def refresh():
    response=json.loads(request(PACKAGE_URL))
    if not response.get('success'):raise ValueError('CKAN reported a failure')
    meta=response['result']
    resource=next((r for r in meta['resources'] if r['id']==RESOURCE_ID),None)
    if not resource or resource['format'].lower()!='csv':raise ValueError('Expected CSV resource missing')
    body=request(resource['url'])
    # Validate before updating even the local latest-source pointer.
    inspect_csv(body)
    digest=hashlib.sha256(body).hexdigest()
    RAW.mkdir(parents=True,exist_ok=True)
    target=RAW/(digest+'.csv')
    if target.exists() and target.read_bytes()!=body:raise ValueError('Snapshot checksum collision')
    if not target.exists():atomic_write(target,body)
    meta.update(sha256=digest,retrieved_at=datetime.now(timezone.utc).isoformat())
    atomic_write(RAW/(digest+'.metadata.json'),json_bytes(meta))
    atomic_write(RAW/'source-metadata.json',json_bytes(meta))

def parse_number(value):
    if not value or '.' in value or value.count(',')>1:raise ValueError(f'Unexpected decimal-comma value: {value!r}')
    try:n=Decimal(value.replace(',','.'))
    except InvalidOperation as exc:raise ValueError('Invalid generation') from exc
    if not n.is_finite():raise ValueError('Non-finite generation')
    return n

def inspect_csv(body: bytes):
    reader=csv.DictReader(io.StringIO(body.decode('utf-8-sig')))
    if reader.fieldnames!=FIELDS:raise ValueError(f'Schema drift: {reader.fieldnames}')
    rows=list(reader)
    if not rows:raise ValueError('Empty source')
    keys=Counter(); signatures=Counter(); periods=set(); negative=[]; total=Decimal(0)
    for line,row in enumerate(rows,2):
        if any(not (row.get(k) or '').strip() for k in FIELDS) or None in row:raise ValueError(f'Missing or extra field at line {line}')
        year,month=int(row['anio']),int(row['mes'])
        date(year,month,1)
        if year<2014 or year>date.today().year:raise ValueError(f'Year outside the data contract at line {line}')
        if row['subsistema'] not in ('SIC','SING'):raise ValueError('New subsystem requires review')
        if row['clasificacion'] not in ('ERNC','Convencional'):raise ValueError('New classification requires review')
        date.fromisoformat(row['fecha_act'])
        n=parse_number(row['generacion_mwh']); total+=n
        key=tuple(row[k] for k in KEY_FIELDS);keys[key]+=1;signatures[tuple(row.values())]+=1;periods.add(f'{year:04d}-{month:02d}')
        if n<0:negative.append({'source_line':line,**row})
    ordered=sorted(periods); expected=(int(ordered[-1][:4])-int(ordered[0][:4]))*12+int(ordered[-1][5:])-int(ordered[0][5:])+1
    if len(periods)!=expected:raise ValueError('Missing calendar months in the source')
    return rows,{'source_rows':len(rows),'periods':len(periods),'first_period':ordered[0],'last_period':ordered[-1],
        'duplicate_key_excess':sum(v-1 for v in keys.values()),'exact_duplicate_excess':sum(v-1 for v in signatures.values()),
        'negative_rows':negative,'zero_rows':sum(parse_number(r['generacion_mwh'])==0 for r in rows),'total_mwh':str(total)}

def build():
    started=time.perf_counter()
    meta=json.loads((RAW/'source-metadata.json').read_text(encoding='utf-8'))
    path=RAW/(meta['sha256']+'.csv'); body=path.read_bytes()
    if hashlib.sha256(body).hexdigest()!=meta['sha256']:raise ValueError('Raw snapshot hash mismatch')
    rows,quality=inspect_csv(body)
    conn=duckdb.connect(config={'threads':2,'memory_limit':'256MB'})
    conn.execute('CREATE TABLE raw AS SELECT * FROM read_csv(?, all_varchar=true, parallel=false)',[str(path)])
    conn.execute((ROOT/'pipeline/models.sql').read_text(encoding='utf-8'))
    total=conn.sql('SELECT SUM(mwh) FROM observations').fetchone()[0]
    if abs(total-Decimal(quality['total_mwh']))>Decimal('0.00001'):raise ValueError('Source / SQL reconciliation failed')
    mart_total=conn.sql('SELECT SUM(mwh) FROM monthly').fetchone()[0]
    if abs(total-mart_total)>Decimal('0.00001'):raise ValueError('Observation / mart reconciliation failed')
    if conn.sql('SELECT COUNT(*)-COUNT(DISTINCT source_row) FROM observations').fetchone()[0]:raise ValueError('Lineage key collision')
    records=[]
    for period,tech,system,kind,mwh,n,plants in conn.sql('SELECT * FROM monthly ORDER BY period,technology,subsystem,classification').fetchall():
        records.append({'period':period,'technology':tech,'subsystem':system,'classification':kind,'mwh':float(mwh),'source_rows':n,'plant_codes':plants})
    resource=next(r for r in meta['resources'] if r['id']==RESOURCE_ID)
    checks=[{'name':'Esquema de origen','status':'pass','detail':'8 columnas esperadas; tipos y campos obligatorios comprobados.'},
        {'name':'Cobertura temporal','status':'pass','detail':f"{quality['periods']} meses consecutivos; sin meses ausentes a nivel del conjunto."},
        {'name':'Trazabilidad de observaciones','status':'pass','detail':f"{len(rows):,} filas preservadas, con identificador de línea y SHA-256 de origen."},
        {'name':'Reconciliación de energía','status':'pass','detail':'Suma del CSV = observaciones SQL = agregación mensual; tolerancia 0,00001 MWh.'},
        {'name':'Claves de central y mes','status':'warning','detail':f"{quality['duplicate_key_excess']} filas adicionales comparten la clave aparente. No se eliminan: pueden representar desgloses que la fuente no identifica."},
        {'name':'Filas idénticas','status':'warning' if quality['exact_duplicate_excess'] else 'pass','detail':f"{quality['exact_duplicate_excess']} repetición exacta. Se conserva en la suma del origen y se documenta."},
        {'name':'Valores negativos','status':'warning' if quality['negative_rows'] else 'pass','detail':f"{len(quality['negative_rows'])} registro negativo conservado; no se imputan ceros."}]
    dataset={'version':'1.0','snapshot':meta['sha256'],'source':{'publisher':'Comisión Nacional de Energía','origin':'Coordinador Eléctrico Nacional',
        'catalog':'https://datos.gob.cl/dataset/generacion-bruta','download':resource['url'],'api':PACKAGE_URL,'resource_id':RESOURCE_ID,
        'license':meta['license_title'],'license_url':meta['license_url'],'retrieved_at':meta['retrieved_at'],
        'resource_modified':resource['last_modified'],'source_updated':max(r['fecha_act'] for r in rows)},
        'quality':quality,'checks':checks,'technologies':sorted({r['technology'] for r in records}),'records':records}
    # All assertions run before publishing a new web snapshot. Export SQL products
    # into a source-addressed folder, then atomically move the pointer.
    # The Git revision also identifies the transformation used for these products.
    target=PUBLIC/meta['sha256'][:12];target.mkdir(parents=True,exist_ok=True)
    for table in ('observations','monthly'):
        for extension,options in [('parquet','FORMAT PARQUET, COMPRESSION ZSTD'),('csv',"FORMAT CSV, HEADER true")]:
            dest=target/(table+'.'+extension);temp=dest.with_name(dest.name+'.tmp')
            order='source_row' if table=='observations' else 'period,technology,subsystem,classification'
            sql_path=temp.as_posix().replace("'", "''")
            conn.execute(f"COPY (SELECT * FROM {table} ORDER BY {order}) TO '{sql_path}' ({options})")
            os.replace(temp,dest)
    atomic_write(target/'dataset.json',json_bytes(dataset))
    atomic_write(PUBLIC/'dataset.json',json_bytes(dataset))
    atomic_write(ROOT/'lib/generated/dataset.json',json_bytes(dataset))
    conn.close()
    report={'elapsed_seconds':round(time.perf_counter()-started,3),'source_rows':len(rows),'mart_rows':len(records),
        'dataset_sha256':hashlib.sha256(json_bytes(dataset)).hexdigest(),'source_sha256':meta['sha256'],'checks':checks,
        'duckdb_version':duckdb.__version__,'executed_at':datetime.now(timezone.utc).isoformat()}
    atomic_write(ROOT/'docs/validation/pipeline-run.json',json_bytes(report))
    print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--refresh',action='store_true');args=parser.parse_args()
    if args.refresh:refresh()
    build()
