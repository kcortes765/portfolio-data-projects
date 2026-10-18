"""Reference ingestion pipeline. PostgreSQL or SQLite, immutable raw and atomic loads."""
import argparse,csv,hashlib,io,json,os,re,sqlite3,time,uuid,urllib.request,urllib.parse
from contextlib import contextmanager
from datetime import date
from decimal import Decimal
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
FIELDS=['kind','entity_id','order_id','version','amount_minor','currency','quantity','unit','event_date']
COLS=FIELDS+['body_hash','raw_json','source_file','source_row','batch_hash']
def canonical(raw):return json.dumps(raw,ensure_ascii=False,separators=(',',':'))
def json_number(value):
    if isinstance(value,Decimal) and value==value.to_integral_value():return int(value)
    raise TypeError(f'Non-integral or unsupported JSON value: {type(value).__name__}')

def parse(content:bytes,filename:str):
    if len(content)>2*1024*1024:raise ValueError('Input exceeds 2 MiB')
    sha=hashlib.sha256(content).hexdigest();reader=csv.reader(io.StringIO(content.decode('utf8'),newline=''),strict=True)
    if next(reader,None)!=FIELDS:raise ValueError('Schema mismatch')
    events=[];rejections=[]
    for line,cells in enumerate(reader,2):
        raw=dict(zip(FIELDS,cells));body=canonical(raw)
        def reject(reason):rejections.append(dict(source_file=filename,source_row=line,raw_json=body,reason=reason))
        if len(cells)!=len(FIELDS):reject('Número de columnas inválido');continue
        if raw['kind'] not in ['order','invoice','delivery'] or not re.fullmatch(r'\w[\w-]{0,40}',raw['entity_id'],re.ASCII) or not re.fullmatch(r'PED-\d{4}',raw['order_id']):reject('Tipo o identificador inválido');continue
        if raw['kind']=='order' and raw['entity_id']!='O-'+raw['order_id'][4:]:reject('Identidad del pedido inconsistente');continue
        if raw['currency'] not in ['CLP','USD'] or raw['unit'] not in ['ea','kg']:reject('Moneda o unidad fuera de contrato');continue
        if not re.fullmatch(r'[1-9]\d{0,4}',raw['version']) or not re.fullmatch(r'\d{1,12}',raw['amount_minor']) or not re.fullmatch(r'\d{1,6}',raw['quantity']) or int(raw['quantity'])==0:reject('Importe, cantidad o versión inválidos');continue
        try:
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',raw['event_date']) or date.fromisoformat(raw['event_date']).isoformat()!=raw['event_date']:raise ValueError()
        except ValueError:reject('Fecha inválida');continue
        if raw['kind']=='delivery' and raw['amount_minor']!='0':reject('Una entrega no tiene importe monetario');continue
        events.append(dict(raw,version=int(raw['version']),quantity=int(raw['quantity']),amount_minor=int(raw['amount_minor']),body_hash=hashlib.sha256(body.encode()).hexdigest(),raw_json=body,source_file=filename,source_row=line,batch_hash=sha))
    return events,rejections

class Warehouse:
    def __init__(self,target=':memory:'):
        self.postgres=target.startswith(('postgresql://','postgres://'))
        if self.postgres:
            import psycopg
            from psycopg.rows import dict_row
            self.connection=psycopg.connect(target,autocommit=True,row_factory=dict_row)
            self.connection.execute('CREATE SCHEMA IF NOT EXISTS opsforge')
            self.connection.execute('SET search_path TO opsforge')
        else:
            if target!=':memory:':Path(target).parent.mkdir(parents=True,exist_ok=True)
            self.connection=sqlite3.connect(target,isolation_level=None);self.connection.row_factory=sqlite3.Row
            self.connection.execute('PRAGMA foreign_keys=ON')
        migration=(ROOT/'drizzle/0000_outstanding_franklin_richards.sql').read_text()
        migration=migration.replace('`','"').replace('CREATE TABLE ','CREATE TABLE IF NOT EXISTS ').replace('CREATE INDEX ','CREATE INDEX IF NOT EXISTS ')
        if self.postgres:migration=migration.replace(' integer',' bigint')
        # Parent first: PostgreSQL requires referenced tables at create time.
        statements=[x.strip() for x in migration.replace('--> statement-breakpoint','').split(';') if x.strip()]
        statements.sort(key=lambda s:0 if s.startswith('CREATE TABLE IF NOT EXISTS "of_spaces"') else 2 if s.startswith('CREATE INDEX') else 1)
        for statement in statements:self.execute(statement)
    def execute(self,sql,args=()):return self.connection.execute(sql.replace('?', '%s') if self.postgres else sql,args)
    def rows(self,sql,args=()):return [dict(r) for r in self.execute(sql,args).fetchall()]
    @contextmanager
    def transaction(self):
        if self.postgres:
            with self.connection.transaction():yield
        else:
            self.execute('BEGIN IMMEDIATE')
            try:yield;self.execute('COMMIT')
            except Exception:self.execute('ROLLBACK');raise
    def scope(self,scope):
        self.execute('INSERT INTO of_spaces(id,created,expires,revision) VALUES(?,?,?,0) ON CONFLICT(id) DO NOTHING',(scope,int(time.time()*1000),4102444800000))
    def reconcile(self,scope):return self.rows((ROOT/'opsforge/reconciliation.sql').read_text().replace(':scope','?'),(scope,))
    def load(self,content,filename,scope='reference',scenario='custom',fail=False,raw_dir=None):
        self.scope(scope);started=time.perf_counter();sha=hashlib.sha256(content).hexdigest();run_id=str(uuid.uuid4());now=int(time.time()*1000)
        if raw_dir:
            folder=Path(raw_dir);folder.mkdir(parents=True,exist_ok=True);raw_path=folder/(sha+'.csv')
            if raw_path.exists():assert raw_path.read_bytes()==content,'Immutable raw mismatch'
            else:
                with raw_path.open('xb') as f:f.write(content)
        revision=self.rows('SELECT revision FROM of_spaces WHERE id=?',(scope,))[0]['revision']
        def log(status,accepted,duplicates,rejected,message,rev):
            self.execute('INSERT INTO of_runs(id,scope,scenario,status,started,duration_ms,accepted,duplicates,rejected,revision,message,batch_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',(run_id,scope,scenario,status,now,int((time.perf_counter()-started)*1000),accepted,duplicates,rejected,rev,message,sha))
        try:incoming,rejections=parse(content,filename)
        except (ValueError,csv.Error,UnicodeError) as e:
            log('blocked',0,0,0,str(e),revision);return dict(status='blocked',accepted=0,duplicates=0,rejected=0,revision=revision)
        fault_armed=False
        try:
            with self.transaction():
                if self.postgres:self.execute('SELECT revision FROM of_spaces WHERE id=? FOR UPDATE',(scope,))
                revision=self.rows('SELECT revision FROM of_spaces WHERE id=?',(scope,))[0]['revision']
                existing={(e['kind'],e['entity_id'],e['version']):e['body_hash'] for e in self.rows('SELECT kind,entity_id,version,body_hash FROM of_events WHERE scope=?',(scope,))}
                accepted=0;duplicates=0
                for event in incoming:
                    key=(event['kind'],event['entity_id'],event['version']);prior=existing.get(key)
                    if prior==event['body_hash']:duplicates+=1;continue
                    if prior:
                        rejections.append(dict(source_file=filename,source_row=event['source_row'],raw_json=event['raw_json'],reason='Conflicto: misma identidad y versión con contenido distinto'));continue
                    existing[key]=event['body_hash']
                    self.execute('INSERT INTO of_events(scope,'+','.join(COLS)+') VALUES('+','.join(['?']*(len(COLS)+1))+')',[scope]+[event[c] for c in COLS]);accepted+=1
                for item in rejections:
                    self.execute('INSERT INTO of_quarantine(scope,source_file,source_row,raw_json,reason) VALUES(?,?,?,?,?) ON CONFLICT DO NOTHING',[scope,item['source_file'],item['source_row'],item['raw_json'],item['reason']])
                self.execute('UPDATE of_spaces SET revision=revision+1 WHERE id=?',(scope,))
                log('completed',accepted,duplicates,len(rejections),'Atomic load',revision+1)
                if fail:
                    fault_armed=True
                    self.execute('INSERT INTO of_guards(id,valid) VALUES(?,0)',(run_id,))
        except Exception:
            if not fault_armed:raise
            log('rolled_back',0,0,0,'Injected interruption, transaction rolled back',revision)
            return dict(status='rolled_back',accepted=0,duplicates=0,rejected=0,revision=revision)
        return dict(status='completed',accepted=accepted,duplicates=duplicates,rejected=len(rejections),revision=revision+1)
    def close(self):self.connection.close()

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--dsn',default=os.environ.get('OPSFORGE_DSN','var/opsforge.sqlite'));parser.add_argument('--scope',default='reference');parser.add_argument('--fixture',choices=['base','late','conflict','schema']);parser.add_argument('--input',type=Path);parser.add_argument('--url');parser.add_argument('--fail',action='store_true');parser.add_argument('--output',type=Path,default=Path('var/opsforge-report.json'));parser.add_argument('--raw-dir',type=Path,default=Path('var/raw'))
    args=parser.parse_args()
    if sum(bool(x) for x in [args.fixture,args.input,args.url])!=1:parser.error('Choose one fixture, input or test URL')
    if args.fixture:
        bundle=json.loads((ROOT/'lib/opsforge/fixtures.json').read_text(encoding='utf8'))['batches'][args.fixture];content=bundle['csv'].encode();filename=bundle['file'];assert hashlib.sha256(content).hexdigest()==bundle['sha256']
    elif args.input:content=args.input.read_bytes();filename=args.input.name
    else:
        parsed=urllib.parse.urlsplit(args.url)
        if parsed.scheme!='http' or parsed.hostname not in ['127.0.0.1','localhost']:parser.error('REST fixture connector only accepts the local test server')
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self,*a,**k):return None
        with urllib.request.build_opener(NoRedirect).open(args.url,timeout=15) as response:
            content=response.read(2*1024*1024+1);filename=Path(parsed.path).name or 'rest.csv'
    warehouse=Warehouse(args.dsn)
    try:result=warehouse.load(content,filename,args.scope,args.fixture or 'custom',args.fail,args.raw_dir);report=dict(run=result,rows=warehouse.reconcile(args.scope),engine='PostgreSQL' if warehouse.postgres else 'SQLite');args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2,default=json_number)+'\n',encoding='utf8');print(json.dumps({'run':result,'orders':len(report['rows']),'output':str(args.output)}))
    finally:warehouse.close()
if __name__=='__main__':main()
