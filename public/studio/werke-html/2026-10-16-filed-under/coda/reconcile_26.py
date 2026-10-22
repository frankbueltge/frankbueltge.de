"""FILED UNDER, coda (session 184, increment: two readings). Traces the two differences between the coda's counts and
the Field's study 26 (field-research @ 4784983, artifacts/2026-10-17-the-odds-written-down/data/results_26.json,
sha256 91e35fa3...87e3), offered to the Studio on 2026-10-19:
  living   the coda counts 6 of 2,056 writings whose week already held an aftershock when written; the Field 7.
  moved    the coda counts 46 of 232 full sequences whose answer changes with the writing; the Field 50.
Rule tested, fixed before the fetch: both differences come from one choice of reading. The coda holds the card's one
magnitude (the first writing's floor bin) across all nine writings; the Field reads each writing at its own floor,
which the agency lowers in later writings. For every writing of the sequences the Field counts and the coda does not,
we ask USGS ComCat by our own route (same query as fetch_nine.py, minmagnitude = that writing's own floor as the Field
gives it) and compare with the Field's event_own_floor row.

Usage: python3 reconcile_26.py <results_26.json>  -> reconcile.js, reconcile_summary.json"""
import json, re, sys, time, urllib.request, urllib.parse

F = json.load(open(sys.argv[1]))
src = open("nine.js").read()
NINE = json.loads(re.search(r"const NINE = (.*?);\nconst NINE_SUMMARY", src, re.S).group(1))
rows = {r["id"]: r for r in F["floor_split_rows"]}
iso = lambda ms: time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(ms / 1000))

full = {i: s for i, s in NINE.items() if len(s) == 9}
ours_moved = {i for i, s in full.items() if len({w["fate"] for w in s}) > 1}
distinct = {"%s@%d" % (i, w["issued"]): w for i, s in NINE.items() for w in s}
ours_living = {k for k, w in distinct.items() if any(e["t"] < w["issued"] for e in w["ev"])}
field_living = set(F["studio_check"]["seen_ids"])

def comcat(w, m):
    q = {"format": "geojson", "starttime": iso(w["t0"]), "endtime": iso(w["t1"]), "latitude": w["c"][0],
         "longitude": w["c"][1], "maxradiuskm": w["rkm"], "minmagnitude": m, "orderby": "time-asc"}
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query?" + urllib.parse.urlencode(q)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=90) as fh:
                return url, json.load(fh)["features"]
        except Exception:
            time.sleep(2 ** (attempt + 1))
    raise SystemExit("failed: " + url)

seqs = {}
for i in sorted(set(rows) - ours_moved):
    r, out = rows[i], []
    for w, floor in zip(full[i], r["floors"]):
        url, feats = comcat(w, floor)
        ev = [{"t": f["properties"]["time"], "m": f["properties"]["mag"], "mt": f["properties"]["magType"], "id": f["id"]}
              for f in feats if f["id"] != i]
        out.append({"L": w["L"], "issued": w["issued"], "t0": w["t0"], "t1": w["t1"], "p": w["p"],
                    "card_M": w["M"], "card_n": len(w["ev"]), "floor": floor, "own": ev, "url": url,
                    "own_living": any(e["t"] < w["issued"] for e in ev)})
    seqs[i] = {"changes_with_field": r["changes_with"], "writings": out,
               "ours_own_floor": [int(bool(o["own"])) for o in out], "field_own_floor": r["event_own_floor"]}
    time.sleep(0.5)

S = {
    "fetched": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "field_source": "field-research @ 478498355e7d822fd69b542ba5e9a3cd817a9186, artifacts/2026-10-17-the-odds-written-down/data/results_26.json",
    "moved": {"ours": len(ours_moved), "field": len(rows), "field_not_ours": sorted(seqs), "ours_not_field": sorted(ours_moved - set(rows))},
    "living": {"ours": len(ours_living), "field": len(field_living), "field_not_ours": sorted(field_living - ours_living),
               "ours_not_field": sorted(ours_living - field_living)},
    "own_floor_rows_equal_field": sum(s["ours_own_floor"] == s["field_own_floor"] for s in seqs.values()),
    "own_floor_rows": len(seqs),
    "card_magnitude_all_one_answer": sum(len({o["card_n"] > 0 for o in s["writings"]}) == 1 for s in seqs.values()),
    "own_floor_living": sorted("%s@%d" % (i, o["issued"]) for i, s in seqs.items() for o in s["writings"] if o["own_living"]),
}
open("reconcile.js", "w").write("// FILED UNDER, coda: built by reconcile_26.py, session 184\nconst TWO_READINGS = " +
                                json.dumps(seqs, separators=(",", ":")) + ";\nconst TWO_READINGS_SUMMARY = " + json.dumps(S) + ";\n")
json.dump(S, open("reconcile_summary.json", "w"), indent=1)
print(json.dumps(S, indent=1))
for i, s in seqs.items():
    print(i, s["changes_with_field"], "ours", s["ours_own_floor"], "field", s["field_own_floor"])
