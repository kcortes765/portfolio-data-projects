"""Create the review/download bundle using an explicit allowlist. No credentials or runtimes."""
import hashlib
import json
import shutil
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
folders=['.github','.openai','app','build','components','data','db','docs','drizzle','examples','hooks','lib','opsforge','pipeline','public','scripts','tests','vendor','worker']
names=['.gitattributes','.gitignore','.dockerignore','.npmrc','Dockerfile.pipeline','README.md','cloudflare-env.d.ts','components.json','drizzle.config.ts','eslint.config.mjs','next.config.ts','package-lock.json','package.json','postcss.config.mjs','tsconfig.json','vite.config.ts']
files=[ROOT/n for n in names if (ROOT/n).is_file()]
for folder in folders:
    for path in (ROOT/folder).rglob('*'):
        relative=path.relative_to(ROOT)
        if not path.is_file() or '__pycache__' in relative.parts or path.suffix in ('.pyc','.tmp'):
            continue
        if relative.parts[:2]==('public','downloads') or path.name.startswith('.env') or path.name=='.user.yml' or any(x in relative.parts for x in ['target','logs']):
            continue
        files.append(path)
output=ROOT/'public/downloads'
output.mkdir(parents=True,exist_ok=True)
archive=output/'gridops-source.zip'
manifest=[]
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for path in sorted(set(files)):
        name=path.relative_to(ROOT).as_posix()
        body=path.read_bytes()
        item=zipfile.ZipInfo('gridops/'+name,date_time=(2026,9,12,0,0,0))
        item.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(item,body)
        manifest.append(dict(path=name,bytes=len(body),sha256=hashlib.sha256(body).hexdigest()))
    item=zipfile.ZipInfo('gridops/SOURCE_MANIFEST.json',date_time=(2026,9,12,0,0,0))
    item.compress_type=zipfile.ZIP_DEFLATED
    z.writestr(item,json.dumps(manifest,ensure_ascii=False,indent=2).encode())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert all(not any(part in n.split('/') for part in ['.git','.venv','node_modules','.sites-runtime']) for n in z.namelist())
shutil.copyfile(ROOT/'README.md',output/'README.md')
shutil.copyfile(ROOT/'opsforge/README.md',output/'OPSFORGE.md')
shutil.copyfile(ROOT/'docs/REVISAR_EN_5_MINUTOS.md',output/'REVISAR_EN_5_MINUTOS.md')
shutil.copyfile(archive,output/'opsforge-source.zip')
digest=hashlib.sha256(archive.read_bytes()).hexdigest()
(output/'SHA256SUMS.txt').write_text(f'{digest}  gridops-source.zip\n{digest}  opsforge-source.zip\n',encoding='utf8')
print(json.dumps(dict(files=len(manifest)+1,bytes=archive.stat().st_size,sha256=digest)))
