import json,sys,urllib.request
d=json.load(open('gbif-keepers.json'));r=json.load(open('results.json'));h=open('index.html').read();S=d['species']
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
src=json.load(open('../2026-10-03-who-writes-the-row/gbif-counts.json'))['species']
chk('same 84 taxon keys as session 150',[s['key'] for s in S]==[s['key'] for s in src])
chk('counts per species equal session 150 totals',all(a['n']==b['n'] for a,b in zip(S,src)))
chk('live n equals session 150 live n',all(a['live']['n']==b['g']['live']['n'] for a,b in zip(S,src)))
chk('preserved-specimen n never exceeds session 150 kept group (which also holds other specimen bases)',all(a['kept']['n']<=b['g']['spec']['n'] for a,b in zip(S,src)))
chk('org facets never exceed counts',all(sum(a[t]['orgs'].values())<=a[t]['n'] for a in S for t in('live','kept')))
chk('every org named',all(o in d['orgs'] and d['orgs'][o]['title'] for a in S for t in('live','kept') for o in a[t]['orgs']))
names={' '.join(s['name'].split()[:2]) for s in S}
chk('82 distinct names',len(names)==82==r['distinct_names'])
live=[s for s in S if s['live']['n']>0]
chk('26 rows / 24 names with living',len(live)==26 and len({' '.join(s['name'].split()[:2]) for s in live})==24==r['with_living'])
chk('animals with living = 0',all(s['live']['n']==0 for s in S if s['kingdom']=='Animalia'))
chk('9 single-publisher names',len({' '.join(s['name'].split()[:2]) for s in live if len(s['live']['orgs'])==1})==9==r['living_one_publisher'])
chk('three publishers erase 11',r['three_publishers_erase']==11)
for k in ('with_living','living_one_publisher','three_publishers_erase','kept_only_no_living','no_kept_record'):
    chk('page states '+k,f'<b>{r[k]}</b>' in h or f'{r[k]} ' in h)
chk('li count',h.count('<li data-live')==82)
chk('no script/network',('<script' not in h) and ('http://' not in h) and ('https://' not in h))
chk('neighbours named','Eva-Maria Lopez' in h and 'Agnes Meyer-Brandis' in h and 'Laura Cinti' in h)
if '--live' in sys.argv:
    import random;random.seed(2)
    for s in random.sample(live,5):
        u='https://api.gbif.org/v1/occurrence/search?limit=0&taxonKey=%d&basisOfRecord=LIVING_SPECIMEN'%s['key']
        n=json.load(urllib.request.urlopen(u,timeout=40))['count']
        chk(f'live requery {s["name"][:20]} {n} vs {s["live"]["n"]}',abs(n-s['live']['n'])<=max(2,s['live']['n']*0.05))
print(len(ok),'ok',len(bad),'failed',bad);sys.exit(1 if bad else 0)
