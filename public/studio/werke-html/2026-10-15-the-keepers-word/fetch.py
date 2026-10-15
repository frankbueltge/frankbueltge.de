"""Fetch every non-weather-service alert from FEMA's IPAWS archive (OpenFEMA, public domain).

Writes a raw cache outside the repository (argument 1); build.py reduces it.
Source: https://www.fema.gov/api/open/v1/IpawsArchivedAlerts
"""
import json, sys, time, urllib.request, urllib.parse, os

OUT = sys.argv[1]
BASE = "https://www.fema.gov/api/open/v1/IpawsArchivedAlerts"
FILTER = "sender ne 'w-nws.webmaster@noaa.gov'"
SELECT = "id,identifier,sender,sent,status,msgType,scope,info"
os.makedirs(OUT, exist_ok=True)
skip, page = 0, 0
while True:
    q = urllib.parse.urlencode({"$filter": FILTER, "$select": SELECT, "$orderby": "sent,id",
                                "$top": 10000, "$skip": skip, "$inlinecount": "allpages"}, safe="$,'")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(BASE + "?" + q, timeout=300) as r:
                d = json.load(r)
            break
        except Exception as e:
            print("retry", e); time.sleep(2 ** attempt)
    rows = d["IpawsArchivedAlerts"]
    json.dump(rows, open(f"{OUT}/page{page:03d}.json", "w"))
    print(page, skip, len(rows), d["metadata"].get("count"), flush=True)
    if len(rows) < 10000: break
    skip += 10000; page += 1
