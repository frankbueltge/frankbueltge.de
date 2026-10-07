"""Titles of each species' three largest source datasets (GBIF dataset API)."""
import json, collections, time, urllib.request
D = "artifacts/2026-10-07-how-many-sightings-of-the-gone/data/"
R = json.load(open(D + "records.json")); rec = R["records"]; out = {}
def get(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(u, timeout=60))
        except Exception as e: err = str(e); time.sleep(2 ** i)
    return {"_error": err}
for k, n in R["species"].items():
    for dk, cnt in collections.Counter(r["datasetKey"] for r in rec if str(r["speciesKey"]) == k).most_common(3):
        j = get("https://api.gbif.org/v1/dataset/" + dk)
        out.setdefault(n, []).append({"datasetKey": dk, "records": cnt, "title": j.get("title"), "type": j.get("type"), "error": j.get("_error")})
json.dump(out, open(D + "datasets.json", "w"), indent=1, ensure_ascii=False)
for n, v in out.items():
    print(n)
    for x in v: print("  ", x)
