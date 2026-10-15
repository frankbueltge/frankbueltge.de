# Re-derives species.json: per species, the Field's 2010+ observation-record count, the share with a still image or
# sound, the IUCN category as GBIF reports it (and the name it is attached to), synonyms and English vernacular names.
import json,urllib.request,time
def g(u):
    for i in range(6):
        try: return json.load(urllib.request.urlopen(u,timeout=60))
        except Exception: time.sleep(2*(i+1))
    raise SystemExit('unreachable '+u)
KEYS={'Euphrasia minima':7989064,'Perameles fasciata':5816535,'Zosterops conspicillatus':2489394,'Chelonoidis niger':9527499}
B=['HUMAN_OBSERVATION','MACHINE_OBSERVATION','OBSERVATION']
def cnt(k,extra=''):
    return sum(g(f"https://api.gbif.org/v1/occurrence/search?taxonKey={k}&basisOfRecord={b}&year=2010,2026{extra}&limit=0")['count'] for b in B)
out={}
for n,k in KEYS.items():
    iu=g(f"https://api.gbif.org/v1/species/{k}/iucnRedListCategory"); sp=g(f"https://api.gbif.org/v1/species/{k}")
    syn=[s['scientificName'] for s in g(f"https://api.gbif.org/v1/species/{k}/synonyms?limit=50")['results']]
    vn=sorted({x['vernacularName'] for x in g(f"https://api.gbif.org/v1/species/{k}/vernacularNames?limit=200")['results'] if x.get('language')=='eng'})
    out[n]=dict(taxonKey=k,records_2010plus=cnt(k),with_still_image=cnt(k,'&mediaType=StillImage'),with_sound=cnt(k,'&mediaType=Sound'),
      backbone_status=sp.get('taxonomicStatus'),iucn=dict(category=iu.get('category'),usageKey=iu.get('usageKey'),iucn_name=iu.get('scientificName'),
      iucn_name_status=iu.get('taxonomicStatus'),iucn_accepted_name=iu.get('acceptedName')),synonyms=syn,english_vernacular_names=vn)
json.dump(dict(retrieved=time.strftime('%F',time.gmtime()),note="From GBIF species and occurrence APIs on the retrieved date. records_2010plus counts HUMAN_OBSERVATION+MACHINE_OBSERVATION+OBSERVATION records dated 2010 or later, the Field's cohort definition.",species=out),open('species.json','w'),indent=1,ensure_ascii=False)
