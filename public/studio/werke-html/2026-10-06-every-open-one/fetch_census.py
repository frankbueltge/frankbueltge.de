# Walks all of GBIF's still-image human-observation records of Chelonoidis niger since 2010 (taxonKey 9527499),
# splits them by the licence of the first still image, and keeps the openly licensed ones (CC0, CC BY) as census.json.
import json,urllib.request,time,collections,datetime
def g(u):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(u,timeout=60))
        except Exception: time.sleep(2*(i+1))
    raise SystemExit('unreachable '+u)
OK=('creativecommons.org/publicdomain/zero/','creativecommons.org/licenses/by/')
base="https://api.gbif.org/v1/occurrence/search?taxonKey=9527499&mediaType=StillImage&year=2010,2026&basisOfRecord=HUMAN_OBSERVATION"
tot=g(base+"&limit=0")['count']; allr=[]
for o in range(0,tot,300): allr+=g(base+f"&limit=300&offset={o}")['results']
lic=collections.Counter(); rows=[]
def short(l):
    l=l or 'none'
    return 'CC0' if 'zero' in l else 'CC-BY-NC' if 'by-nc' in l else 'CC-BY' if '/by/' in l else 'other/none'
for r in allr:
    xs=[x for x in r.get('media',[]) if x.get('type')=='StillImage']
    if not xs: lic['no still image in record']+=1; continue
    x=xs[0]; lic[short(x.get('license'))]+=1
    if any(s in (x.get('license') or '') for s in OK):
        rows.append(dict(key=r['key'],year=r.get('year'),country=r.get('country'),state=r.get('stateProvince'),dataset=r.get('datasetName'),verification=r.get('identificationVerificationStatus'),has_remarks=bool(r.get('occurrenceRemarks')),has_coords=r.get('decimalLatitude') is not None,licence=short(x.get('license')),creator=x.get('creator'),img=x.get('identifier'),src=x.get('references')))
rows.sort(key=lambda r:r['key'])
json.dump(dict(retrieved=datetime.date.today().isoformat(),records=tot,fetched=len(allr),by_licence=lic,rows=rows),open('census.json','w'),indent=1,ensure_ascii=False)
print(tot,len(allr),dict(lic),len(rows))
