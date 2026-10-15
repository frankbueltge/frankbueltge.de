"""Reads data/census-raw.json and the Studio's records.json; writes data/results.json."""
import json, collections, urllib.request
D = "artifacts/2026-10-05-the-sightings-of-the-gone/data/"
R = json.load(open(D + "census-raw.json")); S = json.load(open("artifacts/2026-10-04-the-label-and-the-species/data/raw.json"))["species"]
def fac(r, f): return {c["name"]: c["count"] for x in r["facets"] if x["field"] == f for c in x["counts"]}
tot = collections.Counter(); med = collections.Counter(); cls = collections.Counter(); bas = collections.Counter(); ds = collections.Counter()
for b in R["batches"]:
    for bs, v in b.items():
        bas[bs] += v["all"]["count"]
        for k, c in fac(v["all"], "SPECIES_KEY").items(): tot[k] += c
        for k, c in fac(v["media"], "SPECIES_KEY").items(): med[k] += c
        for k, c in fac(v["all"], "CLASS_KEY").items(): cls[k] += c
        for k, c in fac(v["all"], "DATASET_KEY").items(): ds[k] += c
N = sum(tot.values()); ranked = tot.most_common()
def cum(n): return sum(c for _, c in ranked[:n])
# class names and species names for the top of the list
import time
def get(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(u, timeout=60))
        except Exception: time.sleep(2 ** i)
    raise RuntimeError(u)
top = []
for k, c in ranked[:12]:
    sp = get(f"https://api.gbif.org/v1/species/{k}")
    top.append({"key": k, "name": sp.get("canonicalName"), "class": sp.get("class"), "records": c, "with_media": med.get(k, 0), "cat": S[k]["cat"], "ex_label_records": S[k]["ex"], "total_records": S[k]["total"]})
cls_names = {k: get(f"https://api.gbif.org/v1/species/{k}").get("canonicalName") for k, _ in cls.most_common(6)}
st = json.load(open(D + "studio-records.json"))["records"]
exec(urllib.request.urlopen("https://raw.githubusercontent.com/frankbueltge/studio/main/works/2026-10-04-proof-of-life/classes.py").read().decode())
lab = {r["key"]: BY_KEY.get(r["key"], "H") for r in st}
# P5: does any single field value separate A-D from E-H perfectly?
grp = lambda c: "ABCD" if c in "ABCD" else ("EFGH" if c in "EFGH" else "?")
feat = {"has_media": lambda r: bool(r["media"]), "has_remarks": lambda r: r["has_remarks"], "basis": lambda r: r["basis"], "country": lambda r: r["country"], "publisher": lambda r: r["publisher"], "year": lambda r: r["year"], "has_coord": lambda r: r["lat"] is not None}
sep = {}
for f, fn in feat.items():
    by = collections.defaultdict(collections.Counter)
    for r in st: by[fn(r)][grp(lab[r["key"]])] += 1
    # best rule: each value predicts its majority group; misclassified = minority counts (an in-sample, optimistic bound)
    mis = sum(sum(c.values()) - max(c.values()) for c in by.values())
    sep[f] = {"values": len(by), "misclassified_in_sample": mis}
sizes = collections.Counter(lab.values())
res = {"records_total": N, "by_basis": dict(bas), "species_with_any": len(tot), "species_frame": len(R["keys"]),
       "top12": top, "top1": cum(1), "top4": cum(4), "top40": cum(40), "with_media_sum": sum(med.values()),
       "classes": {cls_names.get(k, k): c for k, c in cls.most_common(6)}, "datasets": len(ds), "top_dataset_share": ds.most_common(1)[0][1] / N,
       "studio_classes": dict(sizes), "separation": sep, "studio_n": len(st),
       "predictions": {"P1_lt3000": N < 3000, "P2_top40_ge80": cum(40) / N >= .8, "P3_media_lt_half": sum(med.values()) / N < .5,
                       "P4_birds_ge_half": cls_names.get("220") is not None and False}}
birds = [k for k, v in cls_names.items() if v == "Aves"]
res["birds_records"] = sum(cls[k] for k in birds); res["predictions"]["P4_birds_ge_half"] = res["birds_records"] / N >= .5
res["predictions"]["P5_no_perfect_field"] = all(v["misclassified_in_sample"] > 0 for v in sep.values())
json.dump(res, open(D + "results.json", "w"), indent=1); print(json.dumps(res, indent=1))
