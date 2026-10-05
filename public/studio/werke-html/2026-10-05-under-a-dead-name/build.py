# Builds index.html from sample.json (the 22 photographs), reading.json (the Studio's reading, made by looking) and
# species.json (counts and the archive's account of each name). `python3 build.py --check` fails on one byte of drift.
import json,random,sys,html
d=json.load(open('sample.json')); rd=json.load(open('reading.json')); sp=json.load(open('species.json'))
rows=[]
for r in d['rows']:
    r=dict(r); x=rd[str(r['key'])]; r['reading']=x['reading']; r['note']=x['note']
    for k in ('date','locality','state'): r.pop(k,None)
    rows.append(r)
order=list(range(len(rows))); random.Random(20261005).shuffle(order)
data=dict(retrieved=sp['retrieved'],species=sp['species'],rows=rows,order=order)
page=open('template.html').read().replace('__DATA__',json.dumps(data,ensure_ascii=False).replace('</','<\\/'))
if '--check' in sys.argv:
    cur=open('index.html').read()
    if cur!=page: raise SystemExit('index.html drifts from its sources')
    print('index.html matches its sources')
else:
    open('index.html','w').write(page); print('wrote index.html',len(page),'bytes')
