"""For every first forecast in data/forecasts.jsonl, fetch from ComCat every event inside the
forecast's own circle, from the start of its first window to the end of its last window (or the
fetch time, if earlier), at magnitude >= the smallest forecast bin minus 0.05. Writes
data/outcomes.jsonl: per mainshock, the list [id, time ms, mag, magType, distance km].
Run only after PREREGISTRATION.md is committed and pushed. argv[1] = cache dir."""
import json, math, os, sys, time, urllib.request, urllib.parse
CACHE = sys.argv[1]; os.makedirs(CACHE, exist_ok=True)
Q = "https://earthquake.usgs.gov/fdsnws/event/1/query"
NOW = int(time.time() * 1000)

def hav(a, b, c, d):
    a, b, c, d = map(math.radians, (a, b, c, d))
    h = math.sin((c - a) / 2) ** 2 + math.cos(a) * math.cos(c) * math.sin((d - b) / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(h))

def iso(ms): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(ms / 1000))

with open("data/outcomes.jsonl", "w") as out:
    for line in open("data/forecasts.jsonl"):
        r = json.loads(line)
        t0 = min(w["t0"] for w in r["windows"]); t1 = min(max(w["t1"] for w in r["windows"]), NOW)
        mmin = min(b["M"] for w in r["windows"] for b in w["bins"]) - 0.05
        qs = urllib.parse.urlencode({"format": "geojson", "starttime": iso(t0 - 1000), "endtime": iso(t1 + 1000),
             "latitude": r["rlat"], "longitude": r["rlon"], "maxradiuskm": r["rkm"] + 0.5,
             "minmagnitude": round(mmin, 2), "orderby": "time-asc", "limit": 20000})
        p = os.path.join(CACHE, "out_%s.json" % r["id"])
        if not os.path.exists(p):
            for i in range(4):
                try:
                    with urllib.request.urlopen(Q + "?" + qs, timeout=120) as h: open(p, "wb").write(h.read()); break
                except Exception:
                    if i == 3: raise
                    time.sleep(2 ** (i + 1))
        d = json.load(open(p))
        assert len(d["features"]) < 20000, r["id"]
        own = set((r.get("ids") or "").strip(",").split(",")) | {r["id"]}
        ev = []
        for f in d["features"]:
            if f["id"] in own or set((f["properties"].get("ids") or "").strip(",").split(",")) & own:
                continue
            lon, lat = f["geometry"]["coordinates"][:2]
            ev.append([f["id"], f["properties"]["time"], f["properties"]["mag"], f["properties"].get("magType"),
                       round(hav(r["rlat"], r["rlon"], lat, lon), 3)])
        out.write(json.dumps({"id": r["id"], "fetched": NOW, "query_t1": t1, "events": ev}) + "\n")
print("done")
