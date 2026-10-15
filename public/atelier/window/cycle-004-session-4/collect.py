#!/usr/bin/env python3
"""collect.py: for each GBIF accepted bird species with threat status EXTINCT, ask the occurrence
endpoint for (a) the year histogram of all records, (b) of human observations only, (c) the
basisOfRecord split of records dated 1950 or later. Retries 3x. Output: data.json."""
import json,time,urllib.request,datetime
B="https://api.gbif.org/v1/occurrence/search"
def q(params):
    u=B+"?"+params
    for i in range(3):
        try:
            return json.load(urllib.request.urlopen(u,timeout=40))
        except Exception as e:
            err=str(e); time.sleep(2*(i+1))
    return {"error":err}
def facet(r):
    if "error" in r: return None
    return {c['name']:c['count'] for f in r['facets'] for c in f['counts']}
sp=json.load(open('species-list.json'))['results']
out={"asked":datetime.datetime.utcnow().isoformat()+"Z","species":{}}
for s in sp:
    k=s['key']; t=f"taxonKey={k}&limit=0&facetLimit=1000&"
    a=q(t+"facet=year"); h=q(t+"facet=year&basisOfRecord=HUMAN_OBSERVATION")
    m=q(t+"facet=basisOfRecord&year=1950,2030")
    out['species'][str(k)]={"name":s['canonicalName'],"total":a.get('count'),"all":facet(a),
      "human":facet(h),"human_total":h.get('count'),"late":facet(m),"late_total":m.get('count'),
      "errors":[x['error'] for x in(a,h,m) if 'error' in x]}
    time.sleep(0.3)
json.dump(out,open('data.json','w'),indent=0)
print(len(out['species']),sum(1 for v in out['species'].values() if v['errors']))
