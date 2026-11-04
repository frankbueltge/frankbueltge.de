"""What stands behind the four species that hold 97 % of the census: country, dataset, year, species-name status, and a record sample."""
import json, urllib.request, urllib.parse
D = "artifacts/2026-10-05-the-sightings-of-the-gone/data/"
def get(u):
    for i in range(4):
        try: return json.load(urllib.request.urlopen(u, timeout=90))
        except Exception as e: err = str(e)
    return {"_error": err}
out = {}
for k in (7989064, 5816535, 2489394, 9527499):
    base = f"https://api.gbif.org/v1/occurrence/search?speciesKey={k}&basisOfRecord=HUMAN_OBSERVATION&year=2010,2026"
    f = get(base + "&limit=0&facet=country&facet=datasetKey&facet=year&facetLimit=8")
    fac = {x["field"]: x["counts"][:6] for x in f["facets"]}
    for c in fac.get("DATASET_KEY", []):
        t = get("https://api.gbif.org/v1/dataset/" + c["name"]); c["title"] = t.get("title")
    sp = get(f"https://api.gbif.org/v1/species/{k}")
    smp = get(base + "&limit=5")["results"]
    out[k] = {"name": sp.get("scientificName"), "status": sp.get("taxonomicStatus"), "facets": fac,
              "sample": [{"key": r["key"], "year": r.get("year"), "country": r.get("country"), "dataset": r.get("datasetName"), "verification": r.get("identificationVerificationStatus"), "remarks": (r.get("occurrenceRemarks") or "")[:120], "n_media": len(r.get("media", []))} for r in smp]}
json.dump(out, open(D + "top4.json", "w"), indent=1); print(json.dumps(out, indent=1)[:6000])
