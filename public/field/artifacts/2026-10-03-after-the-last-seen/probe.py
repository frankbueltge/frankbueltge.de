"""Top-10 species by EX-labelled records dated 2000+: name, own backbone threat flag, which taxon the EX label rides on."""
import json, time, urllib.request, urllib.parse
def get(u):
    for i in range(5):
        try:
            with urllib.request.urlopen(u, timeout=60) as r: return json.load(r)
        except Exception: time.sleep(2 ** i)
    raise RuntimeError(u)
r = json.load(open("data/results.json")); raw = json.load(open("data/raw.json")); kd = raw["kingdom"]; out = []
for k, n, _ in r["top10_2000plus_records_species_keys"]:
    sp = get(f"https://api.gbif.org/v1/species/{k}")
    q = urllib.parse.urlencode(dict(speciesKey=k, iucnRedListCategory="EX", limit=0, year="2000,2100", facet=["taxonKey", "scientificName"]))
    f = {x["field"]: x["counts"] for x in get("https://api.gbif.org/v1/occurrence/search?" + q)["facets"]}
    q2 = urllib.parse.urlencode(dict(speciesKey=k, limit=0, year="2000,2100"))
    allrec = get("https://api.gbif.org/v1/occurrence/search?" + q2)["count"]
    out.append(dict(speciesKey=int(k), name=sp.get("scientificName"), kingdom=sp.get("kingdom"), in_ex_backbone_list=(k in kd),
        own_threatStatuses=sp.get("threatStatuses"), ex_records_2000plus=n, all_records_2000plus_same_species=allrec,
        ex_labelled_taxa=f.get("SCIENTIFIC_NAME", [])[:4]))
    print(out[-1], flush=True)
json.dump(out, open("data/top10.json", "w"), indent=1)
# share of 2000+ EX records from species not in the EX backbone list
sp = raw["sp_y2000"]; unl = sum(v for a, v in sp.items() if a not in kd)
print("unlisted species in 2000+:", sum(1 for a in sp if a not in kd), "records", unl, "of", raw["n_y2000"], round(100*unl/raw["n_y2000"],1))
spo = raw["sp_obs2000"]; print("obs2000 species unlisted:", sum(1 for a in spo if a not in kd), "of", len(spo))
