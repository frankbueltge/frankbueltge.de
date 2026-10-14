"""Project 8: spoken-contribution totals per year 2000-2006 for both Houses, to test whether the Lords denominator's fall
between 2000 and 2005 is gradual (sittings) or a step (how the record is segmented). Writes probe_denominators.json."""
import json, sys
sys.path.insert(0, ".")
from fetch import get
out = {}
for y in range(2000, 2007):
    for h in ("Commons", "Lords"):
        out[f"{h}-{y}"] = get({"house": h, "startDate": f"{y}-01-01", "endDate": f"{y}-12-31", "take": 1})["TotalResultCount"]
        print(h, y, out[f"{h}-{y}"], flush=True)
json.dump(out, open("probe_denominators.json", "w"), indent=1)
