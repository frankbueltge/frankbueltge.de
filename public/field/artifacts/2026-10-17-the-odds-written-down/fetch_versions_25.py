"""Study 25 (session 210). Inputs only: no outcome catalogue is read here.
For every mainshock in data/forecasts.jsonl, list every non-deleted 'oaf' version with a forecast.json
(ComCat event detail, includesuperseded=true), then fetch, for each lag t in LAGS_H, the earliest version
issued at least t hours after the first forecast study 21 scored (t = 0 is that first forecast's own
version, or the earliest at or after it). Writes data/versions_25.jsonl (the version index: per mainshock,
every version's updateTime) and data/lagged_25.jsonl (one row per mainshock and lag, same fields as
updates.jsonl plus 'lag_rule_h'). Raw downloads cached under argv[1], not committed."""
import json, os, re, sys, threading, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

CACHE = sys.argv[1]; os.makedirs(CACHE, exist_ok=True)
Q = "https://earthquake.usgs.gov/fdsnws/event/1/query"
H = 3600000
LAGS_H = [0, 6, 12, 24, 48, 96, 168, 336, 720]

def get(url, name):
    p = os.path.join(CACHE, name)
    if not os.path.exists(p):
        for i in range(5):
            try:
                with urllib.request.urlopen(url, timeout=90) as r: b = r.read()
                parse(b)  # a truncated transfer is retried, never cached
                break
            except Exception:
                if i == 4: raise
                time.sleep(2 ** (i + 1))
        t = "%s.%d.part" % (p, threading.get_ident()); open(t, "wb").write(b); os.replace(t, p)  # atomic: two lags may share a version
    return parse(open(p, "rb").read(), name)

REPAIRED = []
def parse(b, name=None):
    """Strict JSON first. Some of the agency's forecast.json files carry a trailing comma ('},]'), which
    strict JSON refuses; only that defect is repaired, and every repaired file is listed in the output."""
    try: return json.loads(b)
    except json.JSONDecodeError:
        d = json.loads(re.sub(rb",\s*([\]}])", rb"\1", b))
        if name and name not in REPAIRED: REPAIRED.append(name)
        return d

FIRST = [json.loads(l) for l in open("data/forecasts.jsonl")]

def index(first):
    eid = first["id"]
    det = get(Q + "?eventid=%s&format=geojson&includesuperseded=true" % eid, "det_%s.json" % eid)
    vers = [v for v in det["properties"]["products"].get("oaf", []) if v.get("status") != "DELETE"
            and "forecast.json" in v.get("contents", {})]
    return eid, sorted(vers, key=lambda v: v["updateTime"])

with ThreadPoolExecutor(8) as ex: IDX = dict(ex.map(index, FIRST))

def row(first, v, lag):
    fc = get(v["contents"]["forecast.json"]["url"], "fc_%s_%d.json" % (first["id"], v["updateTime"]))
    m = fc["model"]["parameters"]
    return {
        "id": first["id"], "lag_rule_h": lag, "time": first["time"], "mag": first["mag"],
        "first_issued": first["issued"], "issued": v["updateTime"],
        "lag_h": round((v["updateTime"] - first["issued"]) / H, 2),
        "model": fc["model"]["name"], "Mcat": m.get("Mcat", m.get("Mc")), "magMain": m.get("magMain"),
        "regionType": m.get("regionType"), "rlat": m.get("regionCenterLat"), "rlon": m.get("regionCenterLon"),
        "rkm": m.get("regionRadius"), "template": fc.get("template"),
        "windows": [{"label": w["label"], "t0": w["timeStart"], "t1": w["timeEnd"],
                     "bins": [{"M": b["magnitude"], "p": b["probability"]} for b in w["bins"]]} for w in fc["forecast"]],
    }

jobs = []
for first in FIRST:
    for lag in LAGS_H:
        c = [v for v in IDX[first["id"]] if v["updateTime"] >= first["issued"] + lag * H]
        if c: jobs.append((first, c[0], lag))
with ThreadPoolExecutor(8) as ex: rows = list(ex.map(lambda j: row(*j), jobs))

with open("data/versions_25.jsonl", "w") as fh:
    for f in FIRST:
        fh.write(json.dumps({"id": f["id"], "first_issued": f["issued"],
                             "versions": [v["updateTime"] for v in IDX[f["id"]]]}) + "\n")
with open("data/lagged_25.jsonl", "w") as fh:
    for r in rows: fh.write(json.dumps(r) + "\n")
json.dump(sorted(REPAIRED), open("data/repaired_25.json", "w"), indent=0)
print(len(REPAIRED), "files repaired (trailing comma);", sum(len(v) for v in IDX.values()), "versions;", len(rows), "lagged rows")
