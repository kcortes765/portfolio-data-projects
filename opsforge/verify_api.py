"""Exercise real HTTP operations; temporary cookies stay in memory, never in reports."""
import argparse,csv,hashlib,io,json,time,urllib.request,urllib.error,urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from pathlib import Path

class Client:
 def __init__(self,base):
  self.base=base.rstrip('/');self.cookie='';self.headers={};self.space_cookie_header=''
  assert self.base in ['http://localhost:4175','http://127.0.0.1:4175','https://sebastian-cortes-gridops.sebastian-cortes-ing.chatgpt.site'],'Only the authorized project and local test origin are allowed'
 def request(self,path='/api/opsforge',method='GET',body=None,headers=None):
  h={'User-Agent':'Mozilla/5.0 OpsForge verification','Accept':'application/json'}
  if self.cookie:h['Cookie']=self.cookie
  if method=='POST':h.update({'Origin':self.base,'Content-Type':'application/json'})
  h.update(headers or {});data=body.encode() if isinstance(body,str) else json.dumps(body).encode() if body is not None else None
  request=urllib.request.Request(self.base+path,data=data,headers=h,method=method)
  try:r=urllib.request.urlopen(request,timeout=45)
  except urllib.error.HTTPError as e:r=e
  with r:
   raw=r.read();self.headers=r.headers
   for cookie in r.headers.get_all('Set-Cookie',[]):
    if cookie.startswith('opsforge_space='):self.cookie=cookie.split(';')[0];self.space_cookie_header=cookie
   try:value=json.loads(raw)
   except (ValueError,UnicodeError):value=raw
   return r.status,value
 def run(self,scenario):
  status,data=self.request(method='POST',body={'scenario':scenario});assert status==200,(status,data);return data

def verify(base):
 checks=[];a=Client(base);b=Client(base)
 def check(name,condition):
  assert condition,name;checks.append(name)
 status,data=a.request();check('Empty session',status==200 and data=={'workspace':False})
 check('Export requires workspace',a.request('/api/opsforge/export')[0]==401)
 for name,body,headers,expected in [('Origin rejected',{'scenario':'base'},{'Origin':'https://example.invalid'},403),('Unknown scenario',{'scenario':'oops'},{},400),('Invalid object',None,{},400),('Unsupported media','{}',{'Content-Type':'text/plain'},415),('Oversized body','x'*1025,{},413),('Start with base',{'scenario':'late'},{},409)]:
  check(name,a.request(method='POST',body=body,headers=headers)[0]==expected)
 first=a.run('base');check('Independent initial oracle',first['summary']['orders']==24 and first['summary']['matched']==14 and first['summary']['open']==10)
 check('Accepted, duplicates and quarantine',len(first['events'])==68 and len(first['quarantine'])==2 and first['runs'][0]['duplicates']==4)
 check('Cookie isolation flags',all(x in a.space_cookie_header for x in ['HttpOnly','SameSite=Strict','Path=/api/opsforge','Max-Age=86400']))
 if base.startswith('https:'):check('Secure cookie', 'Secure' in a.space_cookie_header)
 check('Orphan retained',len(first['orphans'])==1)
 check('No workspace identifiers in records',all('scope' not in row for row in first['events']+first['runs']))
 check('Second visitor stays empty',b.request()[1]=={'workspace':False})
 second=a.run('base');check('Idempotent replay',second['rows']==first['rows'] and len(second['events'])==68 and second['runs'][0]['accepted']==0)
 failed=a.run('failure');check('Transactional rollback',failed['rows']==first['rows'] and len(failed['events'])==68 and failed['space']['revision']==second['space']['revision'] and failed['runs'][0]['status']=='rolled_back')
 final=a.run('late');check('Recovery and late corrections',final['summary']['orders']==25 and final['summary']['matched']==25 and len(final['events'])==81 and len(final['orphans'])==0)
 check('Version history preserved',len([e for e in final['events'] if e['entity_id']=='I-0005'])==2)
 conflict=a.run('conflict');check('Conflict quarantined without overwrite',conflict['rows']==final['rows'] and len(conflict['quarantine'])==3)
 schema=a.run('schema');check('Schema gate preserves publication',schema['rows']==final['rows'] and schema['space']['revision']==conflict['space']['revision'] and schema['runs'][0]['status']=='blocked')
 restored=a.request()[1];check('Persistence after fresh request',restored['rows']==final['rows'])
 status,raw=a.request('/api/opsforge/export');export=list(csv.DictReader(io.StringIO(raw.decode('utf-8-sig'))));check('CSV export',status==200 and len(export)==25 and all(r['status']=='matched' for r in export))
 check('Download disposition','attachment' in a.headers.get('Content-Disposition',''))
 bfirst=b.run('base');check('Visitor data separated',bfirst['summary']['orders']==24 and a.request()[1]['summary']['orders']==25 and a.cookie!=b.cookie)
 # Shared token, concurrent requests: conflict is recoverable or requests serialize.
 def replay(_):
  c=Client(base);c.cookie=b.cookie;return c.request(method='POST',body={'scenario':'late'})[0]
 with ThreadPoolExecutor(max_workers=2) as pool:statuses=list(pool.map(replay,range(2)))
 current=b.request()[1];check('Concurrent publish is atomic',200 in statuses and set(statuses)<=set([200,409]) and len(current['events'])==81 and current['summary']['matched']==25)
 status,manifest=a.request('/opsforge/fixtures/manifest.json');check('Manifest available',status==200 and manifest['synthetic'] is True)
 for fixture in manifest['batches'].values():
  status,body=a.request('/opsforge/fixtures/'+fixture['file']);check('Source SHA256 '+fixture['id'],status==200 and hashlib.sha256(body).hexdigest()==fixture['sha256'])
 for route,needle in [('/','OpsForge'),('/opsforge','Cada diferencia'),('/opsforge/caso','OpsForge'),('/gridops','GridOps')]:
  status,html=a.request(route);check('Page '+route,status==200 and needle.encode() in html)
 return dict(checked_at=datetime.now(timezone.utc).isoformat(),base=base,passed=len(checks),checks=checks,concurrent_statuses=statuses,initial=dict(orders=24,matched=14,events=68),final=dict(orders=25,matched=25,events=81),limitations='Synthetic bounded workloads; no production SLA or load-test claim.')

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('base');p.add_argument('--output',type=Path,required=True);a=p.parse_args();report=verify(a.base);a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
