# data.json + template.html -> index.html ; --check compares
import json,sys
d=open('data.json').read();out=open('template.html').read().replace('__DATA__',json.dumps(json.loads(d),separators=(',',':')))
if '--check' in sys.argv: sys.exit(0 if out==open('index.html').read() else 'stale')
open('index.html','w').write(out)
