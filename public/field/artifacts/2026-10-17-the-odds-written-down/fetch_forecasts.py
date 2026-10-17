"""Fetch, for every ComCat event carrying an 'oaf' (aftershock forecast) product, the FIRST
published forecast (earliest updateTime among non-deleted versions). Inputs only: no outcome
catalogue is read here. Writes data/forecasts.jsonl (one line per mainshock) and
data/forecast_index.json (versions seen). Raw downloads are cached under the scratch dir
given as argv[1] and are not committed."""
import json, os, sys, time, urllib.request

CACHE = sys.argv[1]
os.makedirs(CACHE, exist_ok=True)
Q = "https://earthquake.usgs.gov/fdsnws/event/1/query"

def get(url, name):
    p = os.path.join(CACHE, name)
    if not os.path.exists(p):
        for i in range(4):
            try:
                with urllib.request.urlopen(url, timeout=60) as r: b = r.read()
                break
            except Exception as e:
                if i == 3: raise
                time.sleep(2 ** (i + 1))
        open(p, "wb").write(b)
    return json.load(open(p))

lst = get(Q + "?producttype=oaf&starttime=2015-01-01&endtime=2026-10-17&format=geojson&orderby=time-asc", "list.json")
out, idx = [], {}
for f in lst["features"]:
    eid = f["id"]
    det = get(Q + "?eventid=%s&format=geojson&includesuperseded=true" % eid, "det_%s.json" % eid)
    vers = [v for v in det["properties"]["products"].get("oaf", []) if v.get("status") != "DELETE"
            and "forecast.json" in v.get("contents", {})]
    idx[eid] = {"versions": len(vers)}
    if not vers:
        continue
    v = min(vers, key=lambda v: v["updateTime"])
    fc = get(v["contents"]["forecast.json"]["url"], "fc_%s_%d.json" % (eid, v["updateTime"]))
    pr = det["properties"]
    m = fc["model"]["parameters"]
    out.append({
        "id": eid, "ids": pr.get("ids"), "time": pr["time"], "mag": pr["mag"], "magType": pr.get("magType"),
        "place": pr.get("place"), "lon": det["geometry"]["coordinates"][0], "lat": det["geometry"]["coordinates"][1],
        "issued": v["updateTime"], "creationTime": fc.get("creationTime"), "nversions": len(vers),
        "model": fc["model"]["name"], "Mcat": m.get("Mcat", m.get("Mc")), "magMain": m.get("magMain"),
        "regionType": m.get("regionType"), "rlat": m.get("regionCenterLat"), "rlon": m.get("regionCenterLon"),
        "rkm": m.get("regionRadius"), "advisory": fc.get("advisoryTimeFrame"), "template": fc.get("template"),
        "windows": [{"label": w["label"], "t0": w["timeStart"], "t1": w["timeEnd"],
                     "bins": [{"M": b["magnitude"], "p": b["probability"], "lo": b["p95minimum"],
                               "hi": b["p95maximum"], "med": b.get("median")} for b in w["bins"]],
                     "above": (w.get("aboveMainshockMag") or {}).get("probability"),
                     "aboveM": (w.get("aboveMainshockMag") or {}).get("magnitude")} for w in fc["forecast"]],
    })
os.makedirs("data", exist_ok=True)
with open("data/forecasts.jsonl", "w") as fh:
    for r in out: fh.write(json.dumps(r) + "\n")
json.dump(idx, open("data/forecast_index.json", "w"), indent=0)
print(len(lst["features"]), "events;", len(out), "with a first forecast")
