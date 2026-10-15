#!/usr/bin/env python3
"""keep.py -> keep.json. Asks the Internet Archive availability endpoint about atlas source pages.
Sets A,B,C,D as in PREDICTIONS.md. Seeded sampling; slow serial queries; empty/error answers re-asked."""
import json,random,time,urllib.request,urllib.parse,collections,sys
S1='window/cycle-004-session-1/';S2='window/cycle-004-session-2/'
rows=json.load(open(S1+'rows.json')); p3={r['url']:r for r in json.load(open(S2+'pass3.json'))['results']}
ok=lambda c:c.startswith('answers')
A=[r['url'] for r in rows if r['group']=='own' and r['c1'] in('gone','silent') and r['c2'] in('gone','silent') and p3[r['url']]['status'] in(404,410)]
D=[r['url'] for r in rows if r['group']=='own' and r['hard_loss'] and r['url'] not in A]
Bpool=sorted(r['url'] for r in rows if r['group']=='own' and r['c1']=='answers' and r['c2']=='answers' and p3[r['url']]['status'] and 200<=p3[r['url']]['status']<300)
Cpool=sorted(r['url'] for r in rows if r['group']=='rhizome')
rng=random.Random(20261003)
B=rng.sample(Bpool,80); C=rng.sample(Cpool,40)
sets={'A':A,'B':B,'C':C,'D':D}
UA='Mozilla/5.0 (compatible; atelier-probe; research; +https://frankbueltge.de)'
def ask(u):
    q='https://archive.org/wayback/available?url='+urllib.parse.quote(u,safe='')
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(q,headers={'User-Agent':UA}),timeout=40) as f:
                j=json.loads(f.read()); s=j.get('archived_snapshots',{}).get('closest')
                return {'err':None,'snap':s}
        except urllib.error.HTTPError as e:
            err='http%d'%e.code
        except Exception as e:
            err=type(e).__name__
        time.sleep(8*(k+1))
    return {'err':err,'snap':None}
out={'started':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'sets':{k:{'urls':v} for k,v in sets.items()},'ask':{}}
order=[(k,u) for k in 'ABCD' for u in sets[k]]
for i,(k,u) in enumerate(order):
    out['ask'][u]=[ask(u)]; time.sleep(3)
    if i%10==0: print(i,len(order),flush=True)
# re-ask every url whose latest answer is empty or error, twice, spaced
for rnd in (2,3):
    time.sleep(20)
    for k,u in order:
        if out['ask'][u][-1]['snap'] is None:
            out['ask'][u].append(ask(u)); time.sleep(3)
out['finished']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
json.dump(out,open('window/cycle-004-session-3/keep.json','w'),indent=0)
print('done')
