"""Census of recent observation records on species whose species-level category is extinct (GBIF, one day)."""
import json, time, urllib.request, urllib.parse, datetime
from concurrent.futures import ThreadPoolExecutor
D = "artifacts/2026-10-05-the-sightings-of-the-gone/"
S = json.load(open("artifacts/2026-10-04-the-label-and-the-species/data/raw.json"))["species"]
keys = sorted(int(k) for k, v in S.items() if v["cat"] in ("EXTINCT", "EXTINCT_IN_THE_WILD"))
errors = []
def get(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(u, timeout=90))
        except Exception as e: err = str(e); time.sleep(2 ** i)
    errors.append([u, err]); return None
def q(batch, extra, facets):
    p = [("speciesKey", k) for k in batch] + [("limit", 0), ("year", "2010,2026")] + extra + [("facet", f) for f in facets] + [("facetLimit", 2000)]
    return get("https://api.gbif.org/v1/occurrence/search?" + urllib.parse.urlencode(p))
batches = [keys[i:i + 60] for i in range(0, len(keys), 60)]
def one(b):
    out = {}
    for basis in ("HUMAN_OBSERVATION", "MACHINE_OBSERVATION"):
        base = [("basisOfRecord", basis)]
        out[basis] = {
            "all": q(b, base, ["speciesKey", "mediaType", "datasetKey", "classKey"]),
            "media": q(b, base + [("mediaType", m) for m in ("StillImage", "Sound", "MovingImage")], ["speciesKey"]),
        }
    return out
with ThreadPoolExecutor(4) as p: res = list(p.map(one, batches))
json.dump({"fetched": datetime.datetime.utcnow().isoformat() + "Z", "keys": keys, "batches": res, "errors": errors},
          open(D + "data/census-raw.json", "w"))
print(len(keys), len(batches), "errors", len(errors))
