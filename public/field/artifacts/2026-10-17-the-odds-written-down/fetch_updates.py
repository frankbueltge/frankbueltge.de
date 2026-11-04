"""Study 23 (session 208). For every mainshock in data/forecasts.jsonl, fetch the UPDATE: the earliest
non-deleted 'oaf' version issued at least 24 h after the first forecast that study 21 scored.
Inputs only: no outcome catalogue is read here. Writes data/updates.jsonl (same fields as
forecasts.jsonl, plus 'first_issued' and 'lag_h'). Raw downloads are cached under argv[1], not committed."""
import json, os, sys, time, urllib.request

CACHE = sys.argv[1]
os.makedirs(CACHE, exist_ok=True)
Q = "https://earthquake.usgs.gov/fdsnws/event/1/query"
DAY = 86400000

def get(url, name):
    p = os.path.join(CACHE, name)
    if not os.path.exists(p):
        for i in range(4):
            try:
                with urllib.request.urlopen(url, timeout=90) as r: b = r.read()
                break
            except Exception:
                if i == 3: raise
                time.sleep(2 ** (i + 1))
        open(p, "wb").write(b)
    return json.load(open(p))

out, none = [], []
for line in open("data/forecasts.jsonl"):
    first = json.loads(line); eid = first["id"]
    det = get(Q + "?eventid=%s&format=geojson&includesuperseded=true" % eid, "det_%s.json" % eid)
    vers = [v for v in det["properties"]["products"].get("oaf", []) if v.get("status") != "DELETE"
            and "forecast.json" in v.get("contents", {}) and v["updateTime"] >= first["issued"] + DAY]
    if not vers:
        none.append(eid); continue
    v = min(vers, key=lambda v: v["updateTime"])
    fc = get(v["contents"]["forecast.json"]["url"], "fc_%s_%d.json" % (eid, v["updateTime"]))
    m = fc["model"]["parameters"]
    out.append({
        "id": eid, "time": first["time"], "mag": first["mag"], "place": first["place"],
        "first_issued": first["issued"], "issued": v["updateTime"], "lag_h": round((v["updateTime"] - first["issued"]) / 3.6e6, 2),
        "model": fc["model"]["name"], "Mcat": m.get("Mcat", m.get("Mc")), "magMain": m.get("magMain"),
        "regionType": m.get("regionType"), "rlat": m.get("regionCenterLat"), "rlon": m.get("regionCenterLon"),
        "rkm": m.get("regionRadius"), "template": fc.get("template"),
        "windows": [{"label": w["label"], "t0": w["timeStart"], "t1": w["timeEnd"],
                     "bins": [{"M": b["magnitude"], "p": b["probability"], "lo": b["p95minimum"],
                               "hi": b["p95maximum"], "med": b.get("median")} for b in w["bins"]],
                     "above": (w.get("aboveMainshockMag") or {}).get("probability"),
                     "aboveM": (w.get("aboveMainshockMag") or {}).get("magnitude")} for w in fc["forecast"]],
    })
with open("data/updates.jsonl", "w") as fh:
    for r in out: fh.write(json.dumps(r) + "\n")
print(len(out), "updates;", len(none), "without a version 24 h after the first:", none)
