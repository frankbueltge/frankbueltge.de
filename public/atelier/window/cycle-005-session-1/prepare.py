"""Join the Studio's 135 read frames to the Field's record rows by GBIF key; write tortoise135.json and unseen.json.
Usage: python3 -I prepare.py <dir holding census.json, studio-results.json, records.json>   (fetched, never committed)
Observer strings are replaced by numbers; the mapping is not written."""
import json, sys, os
d = sys.argv[1]
cen = json.load(open(os.path.join(d, "census.json")))["rows"]
odd = {o["key"]: o["reading"] for o in json.load(open(os.path.join(d, "studio-results.json")))["odd_profiles"]}
rec = [r for r in json.load(open(os.path.join(d, "records.json")))["records"] if r["speciesKey"] == 9527499]
byk = {r["key"]: r for r in rec}
names = sorted({r["recordedBy"] for r in rec if r["recordedBy"]})
no = {n: i + 1 for i, n in enumerate(names)}
def row(r):
    ev = r["eventDate"] or ""
    return {"key": r["key"], "obs": no[r["recordedBy"]], "year": r["year"], "month": r["month"], "day": ev[:10],
            "cell": "%.2f,%.2f" % (round(r["decimalLatitude"], 2), round(r["decimalLongitude"], 2)) if r["decimalLatitude"] is not None else None}
seen = []
for c in cen:
    r = row(byk[c["key"]]); r["odd"] = int(c["key"] in odd); r["reading"] = odd.get(c["key"], "alive"); seen.append(r)
ckeys = {c["key"] for c in cen}
OPEN = ("publicdomain/zero", "licenses/by/4.0")
def licensed(r): return any(("publicdomain/zero" in m) or ("licenses/by/4.0" in m) for m in (r["media_licenses"] or []) if m)
unseen = [row(r) for r in rec if r["nmedia"] > 0 and not licensed(r)]
lic_not_read = [row(r) for r in rec if r["nmedia"] > 0 and licensed(r) and r["key"] not in ckeys]
json.dump({"n": len(seen), "rows": seen}, open("tortoise135.json", "w"), indent=0)
json.dump({"n": len(unseen), "rows": [{"obs": u["obs"], "year": u["year"]} for u in unseen],
           "licensed_not_read": len(lic_not_read), "with_media_total": sum(1 for r in rec if r["nmedia"] > 0)}, open("unseen.json", "w"), indent=0)
print(len(seen), sum(s["odd"] for s in seen), len(unseen), len(lic_not_read),
      len({s["obs"] for s in seen} & {u["obs"] for u in unseen}))
