import json,urllib.request,random,time
def g(u):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(u,timeout=60))
        except Exception: time.sleep(2*(i+1))
    raise SystemExit('unreachable '+u)
OK=('creativecommons.org/publicdomain/zero/','creativecommons.org/licenses/by/')
sp={'Euphrasia minima':(7989064,10),'Zosterops conspicillatus':(2489394,4),'Chelonoidis niger':(9527499,10)}
random.seed(20261005)
rows=[];meta={}
for n,(k,m) in sp.items():
    base=f"https://api.gbif.org/v1/occurrence/search?taxonKey={k}&mediaType=StillImage&year=2010,2026&basisOfRecord=HUMAN_OBSERVATION"
    tot=g(base+"&limit=0")['count']
    # walk pages in a seeded random order until enough qualifying records
    pages=list(range(0,tot,50)); random.shuffle(pages)
    cand=[]
    for o in pages[:12]:
        for r in g(base+f"&limit=50&offset={o}")['results']:
            for x in r.get('media',[]):
                if x.get('type')=='StillImage' and any(s in (x.get('license') or '') for s in OK):
                    cand.append((r,x));break
        if len(cand)>=3*m: break
    random.shuffle(cand)
    meta[n]=dict(records_with_image_all_licences=tot,pages_drawn=min(12,len(pages)),qualifying_drawn=len(cand))
    seen=set()
    for r,x in cand:
        if r["key"] in seen or sum(1 for y in rows if y["species"]==n and y["creator"]==x.get("creator"))>=2: continue
        seen.add(r['key'])
        rows.append(dict(species=n,key=r['key'],year=r.get('year'),date=r.get('eventDate'),country=r.get('country'),state=r.get('stateProvince'),locality=r.get('locality'),dataset=r.get('datasetName'),verification=r.get('identificationVerificationStatus'),remarks=(r.get('occurrenceRemarks') or '')[:200],lic=x.get('license'),creator=x.get('creator'),rights=x.get('rightsHolder'),img=x.get('identifier'),src=x.get('references')))
        if len([1 for y in rows if y['species']==n])>=m: break
json.dump(dict(meta=meta,rows=rows),open('sample.json','w'),indent=1)
print(meta)
for r in rows: print(r['species'][:6],r['key'],r['year'],r['country'],r['lic'][-12:],r['creator'],r['img'][-40:])
