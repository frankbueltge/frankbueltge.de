"""Session 3: event detail documents. Usage: session3.py MONTH.csv RAWDIR -> session3.json (counts only)"""
import csv, sys, json, random, os, time, urllib.request, statistics as S
from collections import Counter
rows = [r for r in csv.DictReader(open(sys.argv[1])) if r["net"] == "us"]
raw = sys.argv[2]; os.makedirs(raw, exist_ok=True)
dec = lambda r: float(r["depth"]) in (10.0, 35.0)
rnd = random.Random(48)
ids_d = sorted(r["id"] for r in rows if dec(r)); ids_s = sorted(r["id"] for r in rows if not dec(r))
sample = [(i, "decided") for i in rnd.sample(ids_d, 150)] + [(i, "solved") for i in rnd.sample(ids_s, 150)]
def get(i):
    p = f"{raw}/{i}.json"
    if not os.path.exists(p):
        for k in range(3):
            try:
                open(p, "wb").write(urllib.request.urlopen(f"https://earthquake.usgs.gov/fdsnws/event/1/query?eventid={i}&format=geojson", timeout=30).read()); break
            except Exception: time.sleep(2)
    return json.load(open(p))
out = {"month_us_rows": len(rows), "decided_pool": len(ids_d), "solved_pool": len(ids_s), "classes": {}}
for c in ("decided", "solved"):
    nver, dtype, dtype_vs_class, changed, ever_fixed = [], Counter(), Counter(), 0, 0
    keys = Counter(); n = 0
    for i, cl in sample:
        if cl != c: continue
        d = get(i); n += 1
        og = d["properties"]["products"].get("origin", [])
        nver.append(len(og))
        for o in og:
            for k in o["properties"]: keys[k] += 1
        dtype[tuple(sorted({o["properties"].get("depth-type", "absent") for o in og}))] += 1
        depths = {o["properties"].get("depth") for o in og}
        changed += len(depths) > 1
    out["classes"][c] = {"n": n, "origin_versions_median": S.median(nver), "origin_versions_max": max(nver), "events_with_more_than_one_depth": changed,
                         "depth_type_values": {"|".join(k): v for k, v in dtype.items()},
                         "origin_property_keys_top": dict(keys.most_common(12))}
json.dump(out, open("session3.json", "w"), indent=1)
print(json.dumps(out, indent=1))
