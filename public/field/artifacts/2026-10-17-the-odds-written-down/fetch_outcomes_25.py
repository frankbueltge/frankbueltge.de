"""Study 25. For every row of data/lagged_25.jsonl whose one-week window has closed, fetch from ComCat every
event inside that version's own circle over its own week, at magnitude >= its smallest bin minus 0.05.
Study 23's code path (fetch_outcomes_23.py), one query per distinct version. Writes data/outcomes_25.jsonl
keyed by (id, issued). Run only after PREREGISTRATION-4.md was pushed (21ac42e). argv[1] = cache dir."""
import json, math, os, sys, threading, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
CACHE = sys.argv[1]; os.makedirs(CACHE, exist_ok=True)
Q = "https://earthquake.usgs.gov/fdsnws/event/1/query"
NOW = int(time.time() * 1000)

def hav(a, b, c, d):
    a, b, c, d = map(math.radians, (a, b, c, d))
    h = math.sin((c - a) / 2) ** 2 + math.cos(a) * math.cos(c) * math.sin((d - b) / 2) ** 2
    return 2 * 6371.0 * math.asin(math.sqrt(h))

def iso(ms): return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(ms / 1000))

F = {json.loads(l)["id"]: json.loads(l) for l in open("data/forecasts.jsonl")}
V = {}
for l in open("data/lagged_25.jsonl"):
    r = json.loads(l); w = [w for w in r["windows"] if w["label"] == "1 Week"]
    if w and w[0]["t1"] <= NOW: V[(r["id"], r["issued"])] = r

def one(key):
    r = V[key]; w = [w for w in r["windows"] if w["label"] == "1 Week"][0]
    mmin = min(b["M"] for b in w["bins"]) - 0.05
    qs = urllib.parse.urlencode({"format": "geojson", "starttime": iso(w["t0"] - 1000), "endtime": iso(w["t1"] + 1000),
         "latitude": r["rlat"], "longitude": r["rlon"], "maxradiuskm": r["rkm"] + 0.5,
         "minmagnitude": round(mmin, 2), "orderby": "time-asc", "limit": 20000})
    p = os.path.join(CACHE, "out25_%s_%d.json" % key)
    if not os.path.exists(p):
        for i in range(5):
            try:
                with urllib.request.urlopen(Q + "?" + qs, timeout=120) as h: b = h.read()
                json.loads(b); break
            except Exception:
                if i == 4: raise
                time.sleep(2 ** (i + 1))
        t = "%s.%d.part" % (p, threading.get_ident()); open(t, "wb").write(b); os.replace(t, p)
    d = json.load(open(p))
    assert len(d["features"]) < 20000, key
    own = set((F[r["id"]].get("ids") or "").strip(",").split(",")) | {r["id"]}
    ev = []
    for f in d["features"]:
        if f["id"] in own or set((f["properties"].get("ids") or "").strip(",").split(",")) & own:
            continue
        lon, lat = f["geometry"]["coordinates"][:2]
        ev.append([f["id"], f["properties"]["time"], f["properties"]["mag"], f["properties"].get("magType"),
                   round(hav(r["rlat"], r["rlon"], lat, lon), 3)])
    return {"id": key[0], "issued": key[1], "fetched": NOW, "events": ev}

with ThreadPoolExecutor(6) as ex: res = list(ex.map(one, sorted(V)))
with open("data/outcomes_25.jsonl", "w") as out:
    for o in res: out.write(json.dumps(o) + "\n")
print(len(res), "versions scored")
