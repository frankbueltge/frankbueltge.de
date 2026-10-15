"""Fetch every federal disaster declaration area with an incident beginning 2012 or later
(OpenFEMA DisasterDeclarationsSummaries v2, public domain). Writes a raw cache outside the
repository (argument 1); build.py reduces it.
Source: https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries
"""
import json, sys, time, urllib.request, urllib.parse, os

OUT = sys.argv[1]
BASE = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries"
SELECT = ("femaDeclarationString,disasterNumber,state,declarationType,declarationDate,incidentType,"
          "declarationTitle,incidentBeginDate,incidentEndDate,tribalRequest,fipsStateCode,"
          "fipsCountyCode,designatedArea,incidentId,id")
os.makedirs(OUT, exist_ok=True)
rows, skip = [], 0
while True:
    q = urllib.parse.urlencode({"$filter": "incidentBeginDate ge '2012-01-01'", "$select": SELECT,
                                "$orderby": "id", "$top": 10000, "$skip": skip}, safe="$,'")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(BASE + "?" + q, timeout=300) as r:
                page = json.load(r)["DisasterDeclarationsSummaries"]
            break
        except Exception as e:
            print("retry", e); time.sleep(2 ** attempt)
    rows += page
    print(skip, len(page), flush=True)
    if len(page) < 10000: break
    skip += 10000
json.dump(rows, open(f"{OUT}/declarations.json", "w"))
print("rows", len(rows))
