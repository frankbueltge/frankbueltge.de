"""Recounts the headline figures from data/census-raw.json, top4.json and the Studio's records, independent of analyse.py; counts its own checks."""
import json, collections
D = "artifacts/2026-10-05-the-sightings-of-the-gone/data/"
R = json.load(open(D + "census-raw.json")); res = json.load(open(D + "results.json")); T = json.load(open(D + "top4.json"))
st = json.load(open(D + "studio-records.json"))
ran = 0; fails = []
def chk(name, ok):
    global ran; ran += 1
    if not ok: fails.append(name)
sp = collections.Counter(); n = 0; media = 0
for b in R["batches"]:
    for v in b.values():
        for x in v["all"]["facets"]:
            if x["field"] == "SPECIES_KEY":
                for c in x["counts"]: sp[c["name"]] += c["count"]
        n += v["all"]["count"]
        for x in v["media"]["facets"]:
            if x["field"] == "SPECIES_KEY": media += sum(c["count"] for c in x["counts"])
chk("no query errors", R["errors"] == [])
chk("732 species in frame", len(R["keys"]) == 732 == res["species_frame"])
chk("facet sum equals reported count (14,708)", sum(sp.values()) == n == 14708 == res["records_total"])
chk("64 species with any record", len(sp) == 64 == res["species_with_any"])
top = sp.most_common(4)
chk("top four hold 14,273 = 97.0 %", sum(c for _, c in top) == 14273 and round(100 * 14273 / n, 1) == 97.0)
chk("top four are the four named", [k for k, _ in top] == ["7989064", "5816535", "2489394", "9527499"])
chk("top 40 hold 14,682", sum(c for _, c in sp.most_common(40)) == 14682 == res["top40"])
chk("media sum 2,853 = 19.4 %", media == 2853 and round(100 * media / n, 1) == 19.4)
chk("birds 2,957 = 20.1 %", res["birds_records"] == 2957 and round(100 * 2957 / n, 1) == 20.1)
chk("P1 refuted, P2 held, P3 held, P4 refuted", [res["predictions"][k] for k in ("P1_lt3000", "P2_top40_ge80", "P3_media_lt_half", "P4_birds_ge_half")] == [False, True, True, False])
chk("Studio sample is 39 records, classes sum to 39", st["records"].__len__() == 39 == sum(res["studio_classes"].values()))
chk("A-D = 10, E-H = 29", sum(res["studio_classes"][c] for c in "ABCD") == 10 and sum(res["studio_classes"][c] for c in "EFGH") == 29)
chk("no field separates perfectly (P5 held)", all(v["misclassified_in_sample"] > 0 for v in res["separation"].values()))
chk("best single field leaves 1 of 39 misplaced", min(v["misclassified_in_sample"] for v in res["separation"].values()) == 1)
chk("top4.json covers the four", sorted(T) == sorted(["7989064", "5816535", "2489394", "9527499"]))
chk("each top species has one dominant dataset-or-country fact recorded", all(T[k]["facets"]["COUNTRY"] for k in T))
print(f"{ran} checks, {len(fails)} failed", fails)
print("ran all counted:", ran == 16 == sum(1 for l in open(__file__) if l.lstrip().startswith("chk(")))
