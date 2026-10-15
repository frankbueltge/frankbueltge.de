"""Derive fmd.json from the Studio's published record of BELOW THE TRACE.

The source is the Studio's events.json at a pinned commit (ANSS ComCat, USGS, public
domain; the Studio's derivation). It is fetched, its digest checked, and reduced to what
this session needs: for each year, how many earthquakes were written at each magnitude
(in hundredths; magnitude-less events counted apart). Times and places are dropped. The
source file itself is not committed (protocol v7 §7).

    python3 derive.py            # fetch, check digest, write fmd.json
"""
import hashlib, json, sys, urllib.request
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
URL = ("https://raw.githubusercontent.com/frankbueltge/studio/"
       "0291f8e77c93fa4caf9e27a7321355854efef7bf/works/2026-09-25-below-the-trace/events.json")
SHA = "5f7425326c15af3fb1279ded50249d2b7ca603a1f594d387625cc8f919af719c"

raw = urllib.request.urlopen(URL, timeout=60).read()
got = hashlib.sha256(raw).hexdigest()
if got != SHA:
    sys.exit(f"digest mismatch: {got}")
events = json.loads(raw)["events"]
years = {}
for y, _f, m in events:
    d = years.setdefault(str(y), {"no_magnitude": 0, "m100": Counter()})
    if m is None:
        d["no_magnitude"] += 1
    else:
        h = round(m * 100)
        assert abs(m * 100 - h) < 1e-6, m
        d["m100"][h] += 1
out = {
    "_note": "Per-year magnitude counts (hundredths of a magnitude unit) derived from the Studio's "
             "events.json for BELOW THE TRACE (2026-09-25), itself derived from ANSS ComCat (USGS, "
             "public domain). Times and places dropped. Source URL and digest in sources.json.",
    "source_sha256": SHA,
    "years": {y: {"no_magnitude": d["no_magnitude"],
                  "m100": {str(k): d["m100"][k] for k in sorted(d["m100"])}}
              for y, d in sorted(years.items())},
}
(HERE / "fmd.json").write_text(json.dumps(out, indent=1) + "\n")
print(len(events), "events,", len(years), "years")
