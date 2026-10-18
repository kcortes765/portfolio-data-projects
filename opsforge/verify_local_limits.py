"""Local-only expiry and execution cap tests. Alters only a freshly created test scope."""
import argparse,hashlib,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
from .verify_api import Client
from .pipeline import ROOT
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--node',required=True);args=parser.parse_args()
 client=Client('http://localhost:4175');state=client.run('base');initial=state['rows']
 for _ in range(39):state=client.run('base')
 assert len(state['runs'])==40 and state['rows']==initial and len(state['events'])==68
 assert client.request(method='POST',body={'scenario':'base'})[0]==429
 token=client.cookie.split('=',1)[1];scope=hashlib.sha256(token.encode()).hexdigest();assert len(scope)==64
 # The identifier derives only from this script's new anonymous test cookie.
 sql="UPDATE of_spaces SET expires=0 WHERE id='"+scope+"'"
 run=subprocess.run([args.node,'--import','./scripts/sites-env.mjs','node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',sql],cwd=ROOT,capture_output=True,text=True,encoding="utf-8",errors="replace")
 if run.returncode:raise RuntimeError('Local expiry setup failed; see local D1 configuration')
 assert client.request()[1]=={'workspace':False}
 assert client.request('/api/opsforge/export')[0]==401
 assert client.request(method='POST',body={'scenario':'late'})[0]==409
 restored=client.run('base');assert restored['space']['revision']==1 and client.cookie.split('=',1)[1]!=token
 report=dict(checked_at=datetime.now(timezone.utc).isoformat(),passed=True,checks=['40 runs do not duplicate facts','Run 41 returns 429','Expired token has no readable workspace','Expired export denied','Expired space requires fresh base','Fresh cookie and revision after expiration'],environment='Local D1 only; test-created synthetic scope')
 (ROOT/'docs/opsforge/validation/local-limits.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
if __name__=='__main__':main()
