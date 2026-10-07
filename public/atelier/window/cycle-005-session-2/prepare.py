"""Join the Studio's 135 drawn frames (reading.json) to the Field's record rows by GBIF key; write drawn135.json.
Usage: python3 -I prepare.py <dir holding records.json and studio-reading.json>   (fetched, never committed)
Observer numbers use the same mapping as cycle-005-session-1/prepare.py (sorted names over the species' records), so they
join to tortoise135.json and unseen.json. The names are not written."""
import json, sys, os
d = sys.argv[1]
rec = [r for r in json.load(open(os.path.join(d, "records.json")))["records"] if r["speciesKey"] == 9527499]
byk = {r["key"]: r for r in rec}
no = {n: i + 1 for i, n in enumerate(sorted({r["recordedBy"] for r in rec if r["recordedBy"]}))}
rows = []
for x in json.load(open(os.path.join(d, "studio-reading.json")))["rows"]:
    r = byk[x["key"]]
    rows.append({"key": x["key"], "obs": no[r["recordedBy"]], "year": r["year"], "month": r["month"],
                 "cell": "%.2f,%.2f" % (round(r["decimalLatitude"], 2), round(r["decimalLongitude"], 2)) if r["decimalLatitude"] is not None else None,
                 "reading": x["reading"]})
json.dump({"n": len(rows), "rows": rows}, open("drawn135.json", "w"), indent=0)
print(len(rows), len({r["obs"] for r in rows}))
