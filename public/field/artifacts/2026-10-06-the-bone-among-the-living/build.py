"""Builds index.html (self-contained, one inline script) from data/ and the 10-05 census results."""
import json, os, itertools, collections
H = os.path.dirname(os.path.abspath(__file__))
res = json.load(open(H + "/data/results.json"))
top = json.load(open(H + "/../2026-10-05-the-sightings-of-the-gone/data/results.json"))
R = json.load(open(H + "/data/studio-reading.json"))
S = {str(r["key"]): r for r in json.load(open(H + "/data/studio-sample.json"))["rows"]}
keys = sorted(R)
cds = collections.Counter((S[k]["date"][:10], S[k]["country"], S[k]["state"]) for k in keys)
recs = []
for k in keys:
    r = S[k]
    st = sum(1 for q in keys if S[q]["state"] == r["state"] and S[q]["country"] == r["country"]) > 1
    recs.append({"k": k, "sp": r["species"], "y": r["year"], "bone": R[k]["reading"] != "alive",
     "f": [int(cds[(r["date"][:10], r["country"], r["state"])] > 1), int(bool(r["remarks"])), int(r["locality"] is None), int(r["year"] >= 2018), int(st)]})
D = {"N": top["records_total"], "rows": [{"n": t["name"], "r": t["records"], "m": t["with_media"]} for t in top["top12"]],
     "recs": recs, "names": ["same date and state as another", "has remarks", "locality empty", "year 2018 or later", "state shared with another"],
     "res": res}
page = open(H + "/template.html").read().replace("__DATA__", json.dumps(D))
open(H + "/index.html", "w").write(page)
