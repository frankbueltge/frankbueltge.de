import json
d = json.load(open("data/raw.json")); kd = d["kingdom"]
N = d["total"]; S = d["species_total"]
r = {"records": N, "species_with_records": S}
r["records_dated"] = d["n_dated"]; r["records_undated_share"] = round(100 * (N - d["n_dated"]) / N, 1)
r["share_2000plus"] = round(100 * d["n_y2000"] / N, 1); r["share_2020plus"] = round(100 * d["n_y2020"] / N, 1)
r["share_2000plus_of_dated"] = round(100 * d["n_y2000"] / d["n_dated"], 1)
r["species_2000plus"] = len(d["sp_y2000"]); r["species_2020plus"] = len(d["sp_y2020"]); r["species_1950plus"] = len(d["sp_y1950"])
r["species_dated"] = len(d["sp_dated"]); r["species_no_dated_record"] = S - len(d["sp_dated"])
r["species_no_dated_share"] = round(100 * (S - len(d["sp_dated"])) / S, 1)
r["species_human_obs"] = len(d["sp_obs"]); r["species_human_obs_2000plus"] = len(d["sp_obs2000"])
r["species_machine_obs"] = len(d["sp_mach"]); r["machine_obs_records"] = d["n_mach"]
r["basis"] = d["basis"]; r["basis_share"] = {k: round(100 * v / N, 1) for k, v in d["basis"].items()}
k = {}
for lab in ("all", "y2000", "obs2000"):
    for sp in d["sp_" + lab]:
        e = k.setdefault(kd.get(sp, "unlisted"), {}); e[lab] = e.get(lab, 0) + 1
r["kingdom"] = k
for kk, e in k.items(): e["share_2000plus"] = round(100 * e.get("y2000", 0) / e["all"], 1)
# top species by 2000+ records
top = sorted(d["sp_y2000"].items(), key=lambda x: -x[1])[:10]
r["top10_2000plus_records_species_keys"] = [[a, b, kd.get(a, "unlisted")] for a, b in top]
r["top10_share_of_2000plus_records"] = round(100 * sum(b for _, b in top) / d["n_y2000"], 1)
yr = {int(a): b for a, b in d["year"].items()}
r["records_by_decade_since_1900"] = {str(x): sum(v for y, v in yr.items() if x <= y < x + 10) for x in range(1900, 2030, 10)}
r["records_before_1900"] = sum(v for y, v in yr.items() if y < 1900)
json.dump(r, open("data/results.json", "w"), indent=1)
print(json.dumps(r, indent=1))
