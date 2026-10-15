"""v2. Backbone species per IUCN category (species/search, datasetKey=backbone) vs species that
have >=1 GBIF occurrence under the same category (occurrence facet on speciesKey).
For EX, EW the backbone species list is read in full, so overlap is checked exactly;
for the rest only counts exist, and the share is a ratio of two counts (upper-bound caveat in SUMMARY)."""
import json, time, urllib.request, urllib.parse, datetime, sys
BB = "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c"
CATS = {"EX":"EXTINCT","EW":"EXTINCT_IN_THE_WILD","CR":"CRITICALLY_ENDANGERED","EN":"ENDANGERED",
        "VU":"VULNERABLE","NT":"NEAR_THREATENED","LC":"LEAST_CONCERN","DD":"DATA_DEFICIENT"}
FULL = {"EX","EW"}
def get(url, params):
    u = url + "?" + urllib.parse.urlencode(params)
    for i in range(4):
        try:
            with urllib.request.urlopen(u, timeout=30) as r: return json.load(r)
        except Exception: time.sleep(2 ** i)
    raise RuntimeError(u)
S = "https://api.gbif.org/v1/species/search"; O = "https://api.gbif.org/v1/occurrence/search"
out = {"fetched": datetime.datetime.utcnow().isoformat() + "Z", "backbone": BB, "cats": {}}
for code, threat in CATS.items():
    base = dict(rank="SPECIES", status="ACCEPTED", threat=threat, datasetKey=BB)
    total = get(S, dict(base, limit=0))["count"]
    f = get(O, dict(iucnRedListCategory=code, limit=0, facet="speciesKey", facetLimit=200000))
    withrec = [int(c["name"]) for c in f["facets"][0]["counts"]]
    rec = {"backbone_species": total, "occurrence_records": f["count"], "species_with_records": len(withrec)}
    if code in FULL:
        keys = []; off = 0
        while off < total:
            d = get(S, dict(base, limit=1000, offset=off))
            keys += [[r.get("speciesKey"), r.get("kingdom")] for r in d["results"]]; off += 1000
            if d.get("endOfRecords"): break
        ws = set(withrec); rec["list_read"] = len(keys); rec["listed_with_records"] = sum(1 for k, _ in keys if k in ws)
        rec["kingdom"] = {}
        for k, kd in keys:
            e = rec["kingdom"].setdefault(kd, [0, 0]); e[0] += 1; e[1] += (k in ws)
    out["cats"][code] = rec
    print(code, rec["backbone_species"], rec["species_with_records"], rec.get("listed_with_records"), file=sys.stderr, flush=True)
json.dump(out, open("data/raw.json", "w"), indent=1)
