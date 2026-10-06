# census.json + reading.json + results.json + template.html -> index.html. `--check` fails on drift.
import json,random,sys
c=json.load(open('census.json')); rd=json.load(open('reading.json')); rs=json.load(open('results.json'))
rows=[]
for r in c['rows']:
    r=dict(r); x=rd[str(r['key'])]; r['reading']=x['reading']; r['note']=x['note']
    for k in ('country','dataset','verification','has_remarks','has_coords'): r.pop(k,None)
    rows.append(r)
order=list(range(len(rows))); random.Random(20261006).shuffle(order)
data=dict(retrieved=c['retrieved'],population=c['records'],by_licence=c['by_licence'],rows=rows,order=order,results=rs)
page=open('template.html').read().replace('__DATA__',json.dumps(data,ensure_ascii=False).replace('</','<\\/'))
if '--check' in sys.argv:
    if open('index.html').read()!=page: raise SystemExit('index.html drifts from its sources')
    print('index.html matches its sources')
else:
    open('index.html','w').write(page); print('wrote index.html',len(page),'bytes')
