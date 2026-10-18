"""Verify deployed APIs/downloads against independent raw values. Optional owner token stays in memory."""
import argparse,csv,hashlib,io,json,os,urllib.request,urllib.parse,zipfile
from collections import defaultdict
from datetime import datetime,timezone
from decimal import Decimal
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--base',default='https://sebastian-cortes-gridops.sebastian-cortes-ing.chatgpt.site')
parser.add_argument('--report',required=True)
args=parser.parse_args()
base=args.base.rstrip('/')
parsed=urllib.parse.urlsplit(base)
allowed=['https://sebastian-cortes-gridops.sebastian-cortes-ing.chatgpt.site','http://localhost:4175','http://localhost:4176','http://127.0.0.1:4175','http://127.0.0.1:4176']
assert base in allowed,'Unrecognized verification origin'
token=os.environ.get('GRIDOPS_RELEASE_TOKEN')
headers={'OAI-Sites-Authorization':'Bearer '+token} if token else {}
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
def fetch(path):
    with opener.open(urllib.request.Request(base+path,headers=headers),timeout=40) as response:
        assert response.status==200 and urllib.parse.urlsplit(response.url).netloc==parsed.netloc
        return response.read(),{k.lower():v for k,v in response.headers.items()}

meta=json.loads((ROOT/'data/raw/source-metadata.json').read_bytes())
raw=(ROOT/'data/raw'/f"{meta['sha256']}.csv").read_bytes()
assert hashlib.sha256(raw).hexdigest()==meta['sha256']
observations=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))))
quality=json.loads((ROOT/'public/data/dataset.json').read_bytes())['quality']
checks=[]
cases=[dict(start=quality['first_period'],end=quality['last_period']),dict(start='2025-01',end='2025-12',technology='Solar Fotovoltaica',subsystem='SING'),dict(start='2016-03',end='2016-03',technology='Mini Hidráulica de Pasada',subsystem='SIC'),dict(start='2025-01',end='2025-12',technology='Solar Fotovoltaica',classification='Convencional'),dict(start='2025-01',end='2025-12',subsystem='SIC',classification='Convencional')]
for filters in cases:
    expected=defaultdict(lambda: {'mwh':Decimal(0),'rows':0})
    for row in observations:
        period=f"{int(row['anio']):04d}-{int(row['mes']):02d}"
        if not filters['start']<=period<=filters['end']:continue
        if any(filters.get(key,'all') not in ('all',row[column]) for key,column in [('technology','tecnologia'),('subsystem','subsistema'),('classification','clasificacion')]):continue
        key=(period,row['tecnologia'],row['subsistema'],row['clasificacion'])
        expected[key]['mwh']+=Decimal(row['generacion_mwh'].replace(',','.'));expected[key]['rows']+=1
    body,_=fetch('/api/generation?'+urllib.parse.urlencode(filters))
    result=json.loads(body)
    assert result['source_sha256']==meta['sha256'] and result['count']==len(expected)
    assert abs(Decimal(str(result['total_mwh']))-sum((v['mwh'] for v in expected.values()),Decimal(0)))<Decimal('0.00001')
    for row in result['data']:
        key=tuple(row[k] for k in ['period','technology','subsystem','classification'])
        assert key in expected and row['source_rows']==expected[key]['rows']
        assert abs(Decimal(str(row['mwh']))-expected[key]['mwh'])<Decimal('0.00001')
    csv_body,_=fetch('/api/generation?'+urllib.parse.urlencode(filters|{'format':'csv'}))
    csv_rows=list(csv.DictReader(io.StringIO(csv_body.decode('utf-8-sig'))))
    assert len(csv_rows)==len(expected)
    assert abs(sum((Decimal(r['mwh']) for r in csv_rows),Decimal(0))-sum((v['mwh'] for v in expected.values()),Decimal(0)))<Decimal('0.00001')
    checks.append({'type':'api+csv','filters':filters,'groups':len(expected),'status':'pass'})

for path in ['/','/gridops','/gridops/caso']:
    body,h=fetch(path)
    assert 'text/html' in h.get('content-type','') and b'GridOps' in body
    assert b'codex-preview' not in body
    checks.append({'type':'page','path':path,'bytes':len(body),'status':'pass'})

for path in ['/downloads/gridops-source.zip','/downloads/README.md',f"/data/{meta['sha256'][:12]}/monthly.parquet",f"/data/{meta['sha256'][:12]}/observations.parquet"]:
    body,_=fetch(path)
    assert body==(ROOT/'public'/path.lstrip('/')).read_bytes(),'Published download differs from source: '+path
    if path.endswith('.zip'):
        with zipfile.ZipFile(io.BytesIO(body)) as archive:
            assert archive.testzip() is None
            manifest=json.loads(archive.read('gridops/SOURCE_MANIFEST.json'))
            for item in manifest:
                assert hashlib.sha256(archive.read('gridops/'+item['path'])).hexdigest()==item['sha256']
    checks.append({'type':'download','path':path,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'status':'pass'})

report={'executed_at':datetime.now(timezone.utc).isoformat(),'base':base,'access':'owner credential' if token else 'anonymous','checks':checks}
target=Path(args.report);target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'base':base,'access':report['access'],'checks_passed':len(checks),'report':str(target)},ensure_ascii=False))
