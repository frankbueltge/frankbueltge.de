"""Session 3, follow-up (not pre-registered; logged as deviation): the whole month's `us` events, the `depth-type` of the us-sourced origin.
Usage: session3b.py MONTH.csv RAWDIR -> session3b.json"""
import csv, sys, json, os, time, urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
rows = [r for r in csv.DictReader(open(sys.argv[1])) if r["net"] == "us"]; raw = sys.argv[2]
def get(i):
    p = f"{raw}/{i}.json"
    if not os.path.exists(p):
        for k in range(3):
            try: open(p, "wb").write(urllib.request.urlopen(f"https://earthquake.usgs.gov/fdsnws/event/1/query?eventid={i}&format=geojson", timeout=30).read()); break
            except Exception: time.sleep(2)
    return json.load(open(p)) if os.path.exists(p) else None
with ThreadPoolExecutor(6) as ex: docs = list(ex.map(get, [r["id"] for r in rows]))
c = Counter(); odd = Counter(); miss = 0
for r, d in zip(rows, docs):
    if d is None: miss += 1; continue
    og = [o for o in d["properties"]["products"].get("origin", []) if o["source"] == "us"]
    og.sort(key=lambda o: o["updateTime"])
    dt = og[-1]["properties"].get("depth-type", "absent") if og else "no-us-origin"
    csvdecided = float(r["depth"]) in (10.0, 35.0)
    c[(dt, "csv10/35" if csvdecided else "csv-other")] += 1
hist = Counter(); stamps = Counter(); srcs = Counter()
for r, d in zip(rows, docs):
    og = sorted(d["properties"]["products"].get("origin", []), key=lambda o: o["updateTime"])
    if len(og) < 2: hist["single_version"] += 1; continue
    last = og[-1]; lt = last["properties"].get("depth-type", "absent"); ld = last["properties"].get("depth")
    earlier = [o for o in og[:-1] if o["properties"].get("depth") != ld]
    if not earlier: hist["multi_version_same_depth"] += 1; continue
    if lt != "operator assigned":
        for o in earlier: hist["later_other__earlier_exactly_10_or_35" if float(o["properties"]["depth"]) in (10.0, 35.0) else "later_other__earlier_other"] += 1
    k = "later_is_operator_assigned" if lt == "operator assigned" else "later_is_other"
    hist["depth_changed_" + k] += 1
    if k == "later_is_operator_assigned":
        stamps[time.strftime("%Y-%m-%d", time.gmtime(last["updateTime"] / 1000))] += 1
        for o in earlier: srcs[o["source"]] += 1
out = {"history": dict(hist), "overwrite_dates_utc": dict(stamps), "overwritten_origin_sources": dict(srcs), "rows": len(rows), "missing": miss, "by_depth_type_and_csv_class": {f"{a} | {b}": n for (a, b), n in sorted(c.items())}}
json.dump(out, open("session3b.json", "w"), indent=1); print(json.dumps(out, indent=1))
