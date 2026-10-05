# Re-derives records.json from GBIF. Cohort: accepted bird species (class Aves, key 212) whose GBIF
# threat status is EXTINCT, minus species with >60 observation-basis records dated 1950+; then every
# HUMAN_OBSERVATION / MACHINE_OBSERVATION / OBSERVATION record dated 2010 or later.
import json,urllib.request,time
def g(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(u,timeout=60))
        except Exception: time.sleep(2*(i+1))
    raise SystemExit('unreachable: '+u)
sp=[];off=0
while True:
    d=g("https://api.gbif.org/v1/species/search?rank=SPECIES&status=ACCEPTED&highertaxonKey=212&threat=EXTINCT&limit=300&offset=%d"%off)
    sp+=d['results'];off+=300
    if d['endOfRecords']:break
keys={r.get('speciesKey',r['key']):r['canonicalName'] for r in sp}
BASES=['HUMAN_OBSERVATION','MACHINE_OBSERVATION','OBSERVATION']
from concurrent.futures import ThreadPoolExecutor
def count(k):
    return sum(g(f"https://api.gbif.org/v1/occurrence/search?taxonKey={k}&basisOfRecord={b}&year=1950,2026&limit=0")['count'] for b in BASES)
with ThreadPoolExecutor(8) as ex: tots=dict(zip(keys,ex.map(count,keys)))
cohort={keys[k]:t for k,t in tots.items() if 0<t<=60}
def recs(k):
    out=[]
    for b in BASES:
        for x in g(f"https://api.gbif.org/v1/occurrence/search?taxonKey={k}&basisOfRecord={b}&year=2010,2026&limit=100")['results']:
            rem=x.get('occurrenceRemarks') or ''
            out.append(dict(key=x['key'],species=keys[k],basis=b,year=x.get('year'),date=x.get('eventDate'),country=x.get('country'),
              publisher=x.get('institutionCode'),locality=x.get('locality'),lat=x.get('decimalLatitude'),lon=x.get('decimalLongitude'),
              media=[m.get('identifier') for m in x.get('media',[])],has_remarks=bool(rem),remarks_short=rem if len(rem)<=12 else ''))
    return out
with ThreadPoolExecutor(8) as ex: rows=[r for part in ex.map(recs,[k for k in keys if keys[k] in cohort]) for r in part]
rows.sort(key=lambda r:(r['species'],r['date'] or ''))
json.dump(dict(retrieved=time.strftime('%Y-%m-%d',time.gmtime()),species_in_backbone_extinct=len(keys),no_observation_records=sum(1 for t in tots.values() if t==0),over_60=sum(1 for t in tots.values() if t>60),cohort=cohort,records=rows),open('records.json','w'),indent=1)
print(len(keys),len(cohort),len(rows))
