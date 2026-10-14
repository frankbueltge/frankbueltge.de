"""Fetch the raw material for UNDER WARNING. Raw files are not committed; their hashes are.

Sources:
- Iowa Environmental Mesonet (IEM), storm-based tornado warning polygons (TO.W), 2008-2023,
  as archived from the National Weather Service's own products (public domain, US government work).
- US Census Bureau, centers of population by block group, 2010 and 2020 (public domain).
- The Field, study 14 (field-research repo), warnings_verified.tsv.gz: whether a tornado met each warning.
"""
import hashlib, json, os, sys, urllib.request

RAW = sys.argv[1] if len(sys.argv) > 1 else "raw"
os.makedirs(RAW, exist_ok=True)
IEM = ("https://mesonet.agron.iastate.edu/cgi-bin/request/gis/watchwarn.py?year1={y}&month1=1&day1=1"
       "&hour1=0&minute1=0&year2={y1}&month2=1&day2=1&hour2=0&minute2=0&phenomena=TO&significance=W"
       "&limitps=yes&limit1=yes&accept=shapefile")
FIELD = ("https://raw.githubusercontent.com/frankbueltge/field-research/{c}/artifacts/"
         "2026-10-14-the-warnings-never-needed/data/warnings_verified.tsv.gz")
FIELD_COMMIT = os.environ.get("FIELD_COMMIT", "main")
targets = {f"iem_tow_{y}.zip": IEM.format(y=y, y1=y + 1) for y in range(2008, 2024)}
targets["CenPop2010_Mean_BG.txt"] = "https://www2.census.gov/geo/docs/reference/cenpop2010/blkgrp/CenPop2010_Mean_BG.txt"
targets["CenPop2020_Mean_BG.txt"] = "https://www2.census.gov/geo/docs/reference/cenpop2020/blkgrp/CenPop2020_Mean_BG.txt"
targets["warnings_verified.tsv.gz"] = FIELD.format(c=FIELD_COMMIT)
manifest = {}
for name, url in targets.items():
    p = os.path.join(RAW, name)
    if not os.path.exists(p):
        with urllib.request.urlopen(url, timeout=300) as r, open(p, "wb") as f:
            f.write(r.read())
    b = open(p, "rb").read()
    manifest[name] = {"url": url, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
    print(name, len(b))
json.dump(manifest, open("raw-manifest.json", "w"), indent=1)
