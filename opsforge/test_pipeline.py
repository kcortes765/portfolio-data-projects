import json,unittest,uuid,os
from pathlib import Path
from .pipeline import Warehouse,ROOT,parse

FIX=json.loads((ROOT/'lib/opsforge/fixtures.json').read_text(encoding='utf8'))['batches'];EXPECTED=json.loads((ROOT/'opsforge/expected.json').read_text())
class PipelineTests(unittest.TestCase):
 def setUp(self):self.db=Warehouse(os.environ.get('OPSFORGE_TEST_DSN',':memory:'));self.scope='test-'+uuid.uuid4().hex
 def tearDown(self):self.db.execute('DELETE FROM of_spaces WHERE id=?',(self.scope,));self.db.close()
 def load(self,name,fail=False):b=FIX[name];return self.db.load(b['csv'].encode(),b['file'],self.scope,name,fail)
 def rows(self):return self.db.reconcile(self.scope)
 def test_initial_oracle(self):
  run=self.load('base');rows=self.rows();self.assertEqual(len(rows),24);self.assertEqual([r['order_id'] for r in rows if r['status']!='matched'],EXPECTED['initial_open_orders']);self.assertEqual((run['accepted'],run['duplicates'],run['rejected']),(68,4,2))
 def test_idempotence(self):
  self.load('base');before=self.rows();run=self.load('base');self.assertEqual(run['accepted'],0);self.assertEqual(run['duplicates'],72);self.assertEqual(self.rows(),before);self.assertEqual(len(self.db.rows('SELECT * FROM of_quarantine WHERE scope=?',(self.scope,))),2)
 def test_late_corrections(self):
  self.load('base');self.load('late');rows=self.rows();self.assertEqual(len(rows),25);self.assertTrue(all(r['status']=='matched' for r in rows));self.assertEqual(len(self.db.rows("SELECT * FROM of_events WHERE scope=? AND entity_id='I-0005'",(self.scope,))),2)
 def test_atomic_failure_and_recovery(self):
  self.load('base');before=self.rows();run=self.load('late',True);self.assertEqual(run['status'],'rolled_back');self.assertEqual(before,self.rows());self.assertEqual(self.load('late')['accepted'],13);self.assertTrue(all(r['status']=='matched' for r in self.rows()))
 def test_version_conflict(self):
  self.load('base');before=self.rows();run=self.load('conflict');self.assertEqual(run['accepted'],0);self.assertEqual(run['rejected'],1);self.assertEqual(before,self.rows())
 def test_schema_rejection(self):
  self.load('base');before=self.rows();self.assertEqual(self.load('schema')['status'],'blocked');self.assertEqual(before,self.rows())
 def test_currency_and_unit_separation(self):
  self.load('base');rows={r['order_id']:r for r in self.rows()};self.assertEqual(rows['PED-0007']['status'],'currency');self.assertEqual(rows['PED-0007']['invoiced_minor'],0);self.assertEqual(rows['PED-0011']['status'],'unit');self.assertEqual(rows['PED-0011']['delivered_qty'],0)
 def test_invoice_aggregation_no_join_fanout(self):
  self.load('base');r=next(r for r in self.rows() if r['order_id']=='PED-0024');self.assertEqual(r['invoice_count'],2);self.assertEqual(r['amount_delta'],0);self.assertEqual(r['quantity_delta'],0)
 def test_scope_isolation(self):
  self.load('base');self.assertEqual(self.db.reconcile('other'),[])
 def test_malformed_date_and_amount(self):
  csv=FIX['base']['csv'].splitlines();header=csv[0];row=csv[1].replace('2026-08-01','2026-02-30');events,rejected=parse((header+'\n'+row+'\n').encode(),'bad.csv');self.assertEqual(len(events),0);self.assertEqual(len(rejected),1)
 def test_order_identity_cannot_fanout(self):
  csv=FIX['base']['csv'].splitlines();row=csv[1].replace('O-0001','O-OTHER');events,rejected=parse((csv[0]+'\n'+row+'\n').encode(),'bad-id.csv');self.assertEqual(events,[]);self.assertEqual(rejected[0]['reason'],'Identidad del pedido inconsistente')
if __name__=='__main__':unittest.main()
