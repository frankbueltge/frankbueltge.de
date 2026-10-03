"""Pull species lists from the GBIF species API; write counts per threat status.
Output data/raw.json. Network required; analyse.py works offline from raw.json."""
import json, time, urllib.request, urllib.parse, datetime, sys
API = "https://api.gbif.org/v1/species/search"
CATS = ["EXTINCT","EXTINCT_IN_THE_WILD","CRITICALLY_ENDANGERED","ENDANGERED","VULNERABLE",
        "NEAR_THREATENED","LEAST_CONCERN","DATA_DEFICIENT"]
def get(params):
    url = API + "?" + urllib.parse.urlencode(params)
    for i in range(3):
        try:
            with urllib.request.urlopen(url, timeout=25) as r: return json.load(r)
        except Exception as e:
            time.sleep(2 ** i)
    raise RuntimeError(url)
out = {"fetched": datetime.datetime.utcnow().isoformat() + "Z", "api": API, "cats": {}}
for c in CATS:
    base = dict(rank="SPECIES", status="ACCEPTED", threat=c)
    total = get(dict(base, limit=0))["count"]
    # full census for small groups; fixed-seed-free systematic sample (every page of 1000 up to cap)
    cap = 20000 if c in ("EXTINCT","EXTINCT_IN_THE_WILD") else 4000
    recs = []; off = 0
    while off < min(total, cap):
        d = get(dict(base, limit=1000, offset=off))
        for r in d["results"]:
            recs.append([r.get("speciesKey"), r.get("kingdom"), r.get("numOccurrences", 0), r.get("threatStatuses")])
        off += 1000
        if d.get("endOfRecords"): break
    out["cats"][c] = {"total": total, "fetched": len(recs), "complete": len(recs) >= total, "recs": recs}
    print(c, total, len(recs), file=sys.stderr, flush=True)
    json.dump(out, open("data/raw.partial.json", "w"))
json.dump(out, open("data/raw.json", "w"))
