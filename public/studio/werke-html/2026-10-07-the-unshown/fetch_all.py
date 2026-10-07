# Walks all GBIF still-image human-observation records of Chelonoidis niger since 2010 (taxonKey 9527499),
# keeps every record with the licence of its first still image and a short hash of its observer string (names are not committed). Output: all_records.json
import json,urllib.request,time,collections,datetime,hashlib
def g(u):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(u,timeout=60))
        except Exception: time.sleep(2*(i+1))
    raise SystemExit('unreachable '+u)
base="https://api.gbif.org/v1/occurrence/search?taxonKey=9527499&mediaType=StillImage&year=2010,2026&basisOfRecord=HUMAN_OBSERVATION"
tot=g(base+"&limit=0")['count']; allr=[]
for o in range(0,tot,300): allr+=g(base+f"&limit=300&offset={o}")['results']
def short(l):
    l=l or 'none'
    return 'CC0' if 'zero' in l else 'CC-BY-NC' if 'by-nc' in l else 'CC-BY' if '/by/' in l else 'other/none'
rows=[]
for r in allr:
    xs=[x for x in r.get('media',[]) if x.get('type')=='StillImage']
    if not xs: continue
    x=xs[0]
    rows.append(dict(key=r['key'],year=r.get('year'),dataset=r.get('datasetName'),observer=hashlib.sha1((r.get('recordedBy') or x.get('creator') or 'none').encode()).hexdigest()[:8],licence=short(x.get('license')),img=x.get('identifier'),src=x.get('references'),day=r.get('eventDate','')[:10]))
rows.sort(key=lambda r:r['key'])
json.dump(dict(retrieved=datetime.date.today().isoformat(),records=tot,fetched=len(allr),rows=rows),open('all_records.json','w'),indent=1,ensure_ascii=False)
print(tot,len(allr),len(rows),collections.Counter(r['licence'] for r in rows))
