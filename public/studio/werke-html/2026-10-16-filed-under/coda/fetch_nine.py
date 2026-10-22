"""FILED UNDER, coda (session 182, increment: written nine times). For every distinct version in the Field's
study 25 table of nine clock-declared writings per sequence (field-research @ 99ca41d, artifacts/
2026-10-17-the-odds-written-down/data/lagged_25.jsonl, sha256 bcbfb914...4bbe), ask the USGS ComCat catalogue
directly, by our own route, for the events inside that version's own stated circle during its own one-week
window, at or above the card's magnitude (the coda's M for that sequence, from outcomes.json, held the same
across all nine writings so that they answer one question). Same query as fetch_outcomes.py.

Usage: python3 fetch_nine.py <lagged_25.jsonl> outcomes.json [out.json]  -> outcomes_nine.json, keyed "id|issued"."""
import json, sys, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

V = [json.loads(l) for l in open(sys.argv[1])]
M = {k: v["M"] for k, v in json.load(open(sys.argv[2]))["outcomes"].items()}
NOW = time.time() * 1000
iso = lambda ms: time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(ms / 1000))
todo = {}
for r in V:
    wk = next(w for w in r["windows"] if w["label"] == "1 Week")
    if r["id"] in M and wk["t1"] <= NOW:
        todo["%s|%d" % (r["id"], r["issued"])] = (r, wk)

def one(k):
    r, wk = todo[k]
    q = {"format": "geojson", "starttime": iso(wk["t0"]), "endtime": iso(wk["t1"]), "latitude": r["rlat"],
         "longitude": r["rlon"], "maxradiuskm": r["rkm"], "minmagnitude": M[r["id"]], "orderby": "time-asc"}
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?" + urllib.parse.urlencode(q)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=90) as fh:
                gj = json.load(fh)
            break
        except Exception:
            time.sleep(2 ** (attempt + 1))
    else:
        raise SystemExit("failed: " + k)
    ev = [{"t": f["properties"]["time"], "m": f["properties"]["mag"], "mt": f["properties"]["magType"],
           "lon": f["geometry"]["coordinates"][0], "lat": f["geometry"]["coordinates"][1], "id": f["id"]}
          for f in gj["features"]]
    return k, {"M": M[r["id"]], "url": url, "events": ev}

with ThreadPoolExecutor(4) as ex:
    out = dict(ex.map(one, sorted(todo)))
json.dump({"fetched": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(NOW / 1000)), "outcomes": out},
          open(sys.argv[3] if len(sys.argv) > 3 else "outcomes_nine.json", "w"))
print("done", len(out))
