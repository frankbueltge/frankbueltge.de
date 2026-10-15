"""Record-level fetch of the four top species' recent observation records (GBIF, one query day)."""
import json, time, urllib.request, urllib.parse, datetime
D = "artifacts/2026-10-07-how-many-sightings-of-the-gone/data/"
SP = {7989064: "Euphrasia minima", 5816535: "Perameles fasciata", 2489394: "Zosterops conspicillatus", 9527499: "Chelonoidis niger"}
F = ["key", "speciesKey", "recordedBy", "eventDate", "year", "month", "decimalLatitude", "decimalLongitude", "datasetKey",
     "license", "mediaType", "basisOfRecord", "stateProvince", "identifiedBy"]
def get(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(u, timeout=120))
        except Exception as e: err = str(e); time.sleep(2 ** i)
    raise RuntimeError(err)
out, counts = [], {}
for k in SP:
    off = 0
    while True:
        p = [("speciesKey", k), ("year", "2010,2026"), ("basisOfRecord", "HUMAN_OBSERVATION"), ("basisOfRecord", "MACHINE_OBSERVATION"), ("limit", 300), ("offset", off)]
        r = get("https://api.gbif.org/v1/occurrence/search?" + urllib.parse.urlencode(p))
        counts[k] = r["count"]
        for x in r["results"]:
            row = {f: x.get(f) for f in F}
            row["media"] = sorted({m.get("type") for m in x.get("media", [])})
            row["nmedia"] = len(x.get("media", []))
            row["media_licenses"] = [m.get("license") for m in x.get("media", [])]
            out.append(row)
        off += 300
        if r["endOfRecords"]: break
json.dump({"fetched": datetime.datetime.utcnow().isoformat() + "Z", "species": SP, "gbif_counts": counts, "records": out},
          open(D + "records.json", "w"))
print(counts, len(out))
