"""Builds index.html: one inline script, compact record rows embedded, no network."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(H + "/data/records.json")); res = json.load(open(H + "/data/results.json"))
sp = list(R["species"]); names = [R["species"][k] for k in sp]
ix = {}
def idx(tbl, v):
    return tbl.setdefault(v, len(tbl))
O, DY, C, DS = {}, {}, {}, {}
rows = []
for r in R["records"]:
    c = "%.2f,%.2f" % (r["decimalLatitude"], r["decimalLongitude"]) if r["decimalLatitude"] is not None else ""
    rows.append([sp.index(str(r["speciesKey"])), idx(O, r["recordedBy"]) if r["recordedBy"] else -1, idx(DY, (r["eventDate"] or "")[:10]),
                 idx(C, c) if c else -1, idx(DS, r["datasetKey"]), r["year"]])
tort = [r for r in R["records"] if r["speciesKey"] == 9527499 and r["nmedia"]]
OPEN = ("http://creativecommons.org/publicdomain/zero/1.0/", "http://creativecommons.org/licenses/by/4.0/")
lic = lambda r: bool(r["media_licenses"]) and all(l in OPEN for l in r["media_licenses"])
years = list(range(2010, 2027))
D = {"names": names, "rows": rows, "years": years,
     "licY": [sum(1 for r in tort if lic(r) and r["year"] == y) for y in years],
     "othY": [sum(1 for r in tort if not lic(r) and r["year"] == y) for y in years],
     "fetched": R["fetched"][:10], "B": {k: res["B"][k] for k in ("tortoise_with_media", "licensed", "other", "observers_licensed", "observers_other", "observers_both",
              "B1_null_95_central", "B1_null_distinct_observers_median", "B2_chi2", "B2_perm_p", "studio_keys_in_todays_licensed", "todays_licensed_not_in_studio_census",
              "record_licence_noncommercial_but_media_open")},
     "datasets": {n: res["datasets"][n][0]["title"] for n in names}, "usgs": res["usgs_banding"], "uv": res["unit_variants"]}
open(H + "/index.html", "w").write(open(H + "/template.html").read().replace("__DATA__", json.dumps(D, ensure_ascii=False)))
