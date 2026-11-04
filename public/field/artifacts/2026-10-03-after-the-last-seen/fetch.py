"""GBIF occurrence facets for iucnRedListCategory=EX: year, basis, and per-species year facets."""
import json, time, urllib.request, urllib.parse, datetime, sys
O = "https://api.gbif.org/v1/occurrence/search"
def get(params):
    u = O + "?" + urllib.parse.urlencode(params, doseq=True)
    for i in range(4):
        try:
            with urllib.request.urlopen(u, timeout=60) as r: return json.load(r)
        except Exception: time.sleep(2 ** i)
    raise RuntimeError(u)
B = dict(iucnRedListCategory="EX", limit=0)
out = {"fetched": datetime.datetime.utcnow().isoformat() + "Z"}
out["total"] = get(B)["count"]
out["no_year"] = get(dict(B, year="*,*"))["count"] if False else None
f = get(dict(B, facet=["year", "basisOfRecord"], **{"year.facetLimit": 1000, "basisOfRecord.facetLimit": 20}))
fac = {x["field"]: {c["name"]: c["count"] for c in x["counts"]} for x in f["facets"]}
out["year"] = fac["YEAR"]; out["basis"] = fac["BASIS_OF_RECORD"]
out["species_total"] = len(get(dict(B, facet="speciesKey", facetLimit=200000))["facets"][0]["counts"])
def species(**kw):
    d = get(dict(B, facet="speciesKey", facetLimit=200000, **kw))
    return {int(c["name"]): c["count"] for c in d["facets"][0]["counts"]}
out["sp_all"] = species()
for lab, kw in {"y2000": dict(year="2000,2100"), "y2020": dict(year="2020,2100"), "y1950": dict(year="1950,2100"),
                "obs": dict(basisOfRecord="HUMAN_OBSERVATION"), "obs2000": dict(basisOfRecord="HUMAN_OBSERVATION", year="2000,2100"),
                "mach": dict(basisOfRecord="MACHINE_OBSERVATION"),
                "dated": dict(year="1000,2100")}.items():
    out["sp_" + lab] = species(**kw); out["n_" + lab] = get(dict(B, **kw))["count"]
    print(lab, len(out["sp_" + lab]), out["n_" + lab], file=sys.stderr, flush=True)
# kingdoms via backbone list of EX species
S = "https://api.gbif.org/v1/species/search"; BB = "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c"
kd = {}; off = 0
while True:
    u = S + "?" + urllib.parse.urlencode(dict(rank="SPECIES", status="ACCEPTED", threat="EXTINCT", datasetKey=BB, limit=1000, offset=off))
    d = json.load(urllib.request.urlopen(u, timeout=60))
    for r in d["results"]: kd[str(r.get("speciesKey"))] = r.get("kingdom")
    off += 1000
    if d.get("endOfRecords"): break
out["kingdom"] = kd
json.dump(out, open("data/raw.json", "w"))
