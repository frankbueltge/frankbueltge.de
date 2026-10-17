"""FILED UNDER, coda (session 178). For every mainshock in the Field's study 21 forecasts
(field-research, artifacts/2026-10-17-the-odds-written-down/data/forecasts.jsonl, first published
USGS aftershock forecast per mainshock), ask the USGS ComCat catalogue directly, by our own route,
for the events inside the forecast's own stated circle during its own one-week window, at or above
the card's magnitude (the lowest forecast bin at or above the forecast's completeness floor Mcat).

Usage: python3 fetch_outcomes.py <forecasts.jsonl>   -> writes outcomes.json: only the
extracted event fields (time, magnitude, place, id) and the query URL; committed as evidence."""
import json, sys, time, urllib.request, urllib.parse

def card_bin(win, mcat):
    bins = sorted(win["bins"], key=lambda b: b["M"])
    for b in bins:
        if b["M"] >= mcat - 1e-9:
            return b
    return None

rows = [json.loads(l) for l in open(sys.argv[1])]
out = {}
for i, r in enumerate(rows):
    wk = next(w for w in r["windows"] if w["label"] == "1 Week")
    mcat = r["Mcat"] if r["Mcat"] is not None else 3.0
    b = card_bin(wk, mcat)
    if b is None:
        continue
    q = {"format": "geojson", "starttime": wk["t0"], "endtime": wk["t1"],
         "latitude": r["rlat"], "longitude": r["rlon"], "maxradiuskm": r["rkm"],
         "minmagnitude": b["M"], "orderby": "time-asc"}
    q["starttime"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(wk["t0"] / 1000))
    q["endtime"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(wk["t1"] / 1000))
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?" + urllib.parse.urlencode(q)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as fh:
                gj = json.load(fh)
            break
        except Exception as e:
            time.sleep(2 ** attempt)
    else:
        raise SystemExit("failed: " + r["id"])
    ev = [{"t": f["properties"]["time"], "m": f["properties"]["mag"], "mt": f["properties"]["magType"],
           "lon": f["geometry"]["coordinates"][0], "lat": f["geometry"]["coordinates"][1], "id": f["id"]}
          for f in gj["features"]]
    out[r["id"]] = {"M": b["M"], "url": url, "events": ev}
    if i % 25 == 0:
        print(i, r["id"], len(ev), flush=True)
    time.sleep(0.25)
json.dump({"fetched": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "outcomes": out}, open("outcomes.json", "w"))
print("done", len(out))
