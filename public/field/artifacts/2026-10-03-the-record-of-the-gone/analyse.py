"""Offline: data/raw.json -> data/results.json. Per IUCN category: share of backbone species with
zero GBIF occurrences, as a LOWER bound (numerator = all species with records under the category,
including ones the backbone list does not carry) and, where the list was read (EX, EW, CR), an
exact-overlap figure. Wilson 95% intervals. The five registered predictions evaluated."""
import json, math
raw = json.load(open("data/raw.json"))
def wilson(k, n, z=1.96):
    p = k/n; d = 1+z*z/n; c = (p+z*z/(2*n))/d; h = z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d
    return [round(100*(c-h), 2), round(100*(c+h), 2)]
res = {"fetched": raw["fetched"], "cats": {}, "kingdom": {}}
for c, v in raw["cats"].items():
    n = v["backbone_species"]; w = min(v["species_with_records"], n)
    r = {"backbone_species": n, "species_with_records_facet": v["species_with_records"],
         "zero_pct_lower_bound": round(100*(n-w)/n, 2), "ci95": wilson(n-w, n),
         "occurrence_records": v["occurrence_records"]}
    if "listed_with_records" in v:
        lw = v["listed_with_records"]
        r["listed_with_records"] = lw; r["zero_pct_exact_overlap"] = round(100*(n-lw)/n, 2)
        r["ci95_exact"] = wilson(n-lw, n); r["records_outside_list"] = v["species_with_records"]-lw
    res["cats"][c] = r
for k, (n, w) in raw["cats"]["EX"]["kingdom"].items():
    res["kingdom"][k] = {"n": n, "with_records": w, "zero_pct": round(100*(n-w)/n, 2), "ci95": wilson(n-w, n)}
Z = lambda c: res["cats"][c]["zero_pct_lower_bound"]
seq = [Z(c) for c in ["EX","CR","EN","VU","NT","LC"]]
kd = res["kingdom"]
res["predictions"] = {
 "P1_EX_zero_above_80": res["cats"]["EX"]["zero_pct_exact_overlap"] > 80 and Z("EX") > 80,
 "P2_EX_above_LC": Z("EX") > Z("LC"),
 "P3_DD_above_LC": Z("DD") > Z("LC"),
 "P4_not_monotone": any(seq[i] < seq[i+1] for i in range(5)),
 "P5_animalia_plantae_gap_over_20": abs(kd["Animalia"]["zero_pct"]-kd["Plantae"]["zero_pct"]) > 20 if "Animalia" in kd and "Plantae" in kd else None,
 "sequence_EX_CR_EN_VU_NT_LC": seq}
json.dump(res, open("data/results.json", "w"), indent=1)
print(json.dumps(res, indent=1))
