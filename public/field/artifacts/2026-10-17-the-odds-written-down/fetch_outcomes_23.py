"""Study 23. For every update in data/updates.jsonl, fetch from ComCat every event inside the update's own
circle, from the start of its one-week window to its end, at magnitude >= its smallest bin minus 0.05.
Same rule and code path as fetch_outcomes.py. Writes data/outcomes_23.jsonl. Run only after
PREREGISTRATION-3.md was pushed (5a1c4ad). argv[1] = cache dir."""
import json, math, os, sys, time, urllib.request, urllib.parse
CACHE = sys.argv[1]; os.makedirs(CACHE, exist_ok=True)
Q = "https://earthquake.usgs.gov/fdsnws/event/1/query"
NOW = int(time.time() * 1000)

def hav(a, b, c, d):
    a, b, c, d = map(math.radians, (a, b, c, d))
    h = math.sin((c - a) / 2) ** 2 + math.cos(a) * math.cos(c) * math.sin((d - b) / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(h))

def iso(ms): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(ms / 1000))

F = {json.loads(l)["id"]: json.loads(l) for l in open("data/forecasts.jsonl")}
with open("data/outcomes_23.jsonl", "w") as out:
    for line in open("data/updates.jsonl"):
        r = json.loads(line); w = [w for w in r["windows"] if w["label"] == "1 Week"][0]
        if w["t1"] > NOW: continue
        mmin = min(b["M"] for b in w["bins"]) - 0.05
        qs = urllib.parse.urlencode({"format": "geojson", "starttime": iso(w["t0"] - 1000), "endtime": iso(w["t1"] + 1000),
             "latitude": r["rlat"], "longitude": r["rlon"], "maxradiuskm": r["rkm"] + 0.5,
             "minmagnitude": round(mmin, 2), "orderby": "time-asc", "limit": 20000})
        p = os.path.join(CACHE, "out23_%s.json" % r["id"])
        if not os.path.exists(p):
            for i in range(4):
                try:
                    with urllib.request.urlopen(Q + "?" + qs, timeout=120) as h: open(p, "wb").write(h.read()); break
                except Exception:
                    if i == 3: raise
                    time.sleep(2 ** (i + 1))
        d = json.load(open(p))
        assert len(d["features"]) < 20000, r["id"]
        own = set((F[r["id"]].get("ids") or "").strip(",").split(",")) | {r["id"]}
        ev = []
        for f in d["features"]:
            if f["id"] in own or set((f["properties"].get("ids") or "").strip(",").split(",")) & own:
                continue
            lon, lat = f["geometry"]["coordinates"][:2]
            ev.append([f["id"], f["properties"]["time"], f["properties"]["mag"], f["properties"].get("magType"),
                       round(hav(r["rlat"], r["rlon"], lat, lon), 3)])
        out.write(json.dumps({"id": r["id"], "fetched": NOW, "events": ev}) + "\n")
print("done")
