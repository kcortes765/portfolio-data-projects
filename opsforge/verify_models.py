"""Compare executed PostgreSQL/dbt and SQLite results, field by field."""
import json,os
from datetime import datetime,timezone
from .pipeline import Warehouse,ROOT,json_number
def main():
 pg=Warehouse(os.environ['OPSFORGE_DSN']);local=Warehouse();scope='reference'
 try:
  fixture=json.loads((ROOT/'lib/opsforge/fixtures.json').read_text(encoding='utf8'))['batches']
  for name in ['base','late']:
   b=fixture[name];local.load(b['csv'].encode(),b['file'],scope,name)
  expected=local.reconcile(scope);actual=pg.reconcile(scope);mart=pg.rows('SELECT * FROM opsforge_analytics.mart_reconciliation WHERE scope=? ORDER BY order_id',(scope,))
  for row in mart:row.pop('scope')
  assert actual==expected,'PostgreSQL / SQLite mismatch';assert mart==expected,'dbt mart / reference mismatch'
  assert len(mart)==25 and all(row['status']=='matched' for row in mart)
  report=dict(checked_at=datetime.now(timezone.utc).isoformat(),engines=['SQLite','PostgreSQL 18.6','dbt mart'],compared_orders=len(mart),compared_fields=len(mart[0]),passed=True)
  out=ROOT/'docs/opsforge/validation';out.mkdir(parents=True,exist_ok=True);(out/'model-parity.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
 finally:pg.close();local.close()
if __name__=='__main__':main()
