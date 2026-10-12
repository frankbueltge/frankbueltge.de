set -e
cd /tmp/claude-0/s121/mk/m04/scratch
python3 -c "
t=open('template.html').read(); d=open('data.txt').read()
open('/tmp/claude-0/s121/mk/m04/work/index.html','w').write(t.replace('__DATA__',d))"
python3 -c "
import re;t=open('/tmp/claude-0/s121/mk/m04/work/index.html').read()
s=re.search(r'<script>(.*)</script>',t,re.S).group(1); open('page.js','w').write(s)"
node -e "var m=require('./page.js');console.log(JSON.stringify(m.layout()))" > layout.json
python3 raster.py
