import json,re,sys,urllib.request,urllib.parse
d=json.load(open('gbif-counts.json'));S=d['species'];h=open('index.html').read();r=json.load(open('results.json'))
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
chk('84 species',len(S)==84==r['species'])
chk('rows in page',h.count('<li data-obs')==84)
chk('per-species group sums equal totals',all(sum(g['n'] for g in x['g'].values())==x['n'] for x in S))
chk('year facets sum <= n',all(sum(sum(g['year'].values()) for g in x['g'].values())<=x['n'] for x in S))
chk('total',sum(x['n'] for x in S)==r['records'])
noobs=[x for x in S if x['g']['obs']['n']==0]
chk('no observer',len(noobs)==r['no_observer_record']==39)
def lo(x):
    y=[int(k) for k in x['g']['obs']['year']];return max(y) if y else 0
chk('since 2020',sum(1 for x in S if lo(x)<2020)==r['no_observer_since_2020']==52)
chk('zero',sum(1 for x in S if x['n']==0)==2)
for k in ('no_observer_record','no_observer_since_2020','records'):
    chk('page states '+k,(f'{r[k]:,}' if k=='records' else str(r[k])) in h)
chk('no script',('<script' not in h) and ('http://' not in h))
chk('attribution words','CC BY 4.0' in h and 'Apache-2.0' in h)
chk('neighbours named','Laura Cinti' in h and 'Ọnụọha' in h)
if '--live' in sys.argv:
    import random
    random.seed(1)
    for x in random.sample(S,6):
        u='https://api.gbif.org/v1/occurrence/search?limit=0&taxonKey=%d'%x['key']
        n=json.load(urllib.request.urlopen(u,timeout=40))['count']
        chk('live '+x['name'][:20]+f' {n} vs {x["n"]}',abs(n-x['n'])<=max(3,x['n']*0.02))
print(len(ok),'ok',len(bad),'failed',bad);sys.exit(1 if bad else 0)
