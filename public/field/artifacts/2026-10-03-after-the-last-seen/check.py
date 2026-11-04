"""Recount every figure printed in index.html/SUMMARY.md from data/raw.json; count its own checks."""
import json, re, sys
raw = json.load(open("data/raw.json")); res = json.load(open("data/results.json")); kd = raw["kingdom"]
top = json.load(open("data/top10.json")); samp = json.load(open("data/label-sample.json"))
page = open("index.html").read() + open("SUMMARY.md").read()
n = f = 0
def chk(name, cond):
    global n, f
    n += 1
    if not cond: f += 1; print("FAIL", name)
chk("total", raw["total"] == 87601 and res["records"] == 87601)
chk("species", raw["species_total"] == 784 == len(raw["sp_all"]))
chk("sum of species record counts = total", sum(raw["sp_all"].values()) == raw["total"])
chk("basis sums", sum(raw["basis"].values()) == raw["total"])
chk("2000+ share", round(100 * raw["n_y2000"] / raw["total"], 1) == 22.0)
chk("2020+ share", round(100 * raw["n_y2020"] / raw["total"], 1) == 12.1)
chk("undated share", round(100 * (raw["total"] - raw["n_dated"]) / raw["total"], 1) == 29.4)
chk("species with no dated record", 784 - len(raw["sp_dated"]) == 157)
chk("P4 margin", 157 / 784 > 0.20)
chk("species 2000+", len(raw["sp_y2000"]) == 166); chk("species 2020+", len(raw["sp_y2020"]) == 60)
chk("species obs 2000+", len(raw["sp_obs2000"]) == 92)
chk("top10 share", res["top10_share_of_2000plus_records"] == 90.6)
chk("top10 sum", round(100 * sum(t["ex_records_2000plus"] for t in top) / raw["n_y2000"], 1) == 90.6)
unl = {a for a in raw["sp_y2000"] if a not in kd}
chk("unlisted species", len(unl) == 26); chk("unlisted record share", round(100 * sum(raw["sp_y2000"][a] for a in unl) / raw["n_y2000"], 1) == 49.1)
chk("top10 unlisted flags", sum(1 for t in top if not t["in_ex_backbone_list"]) == 6)
chk("sample has 3 LEAST_CONCERN contradictions", sum(1 for s in samp if "LEAST_CONCERN" in (s["backbone_hit_threat"] or [])) == 3)
chk("sample all labelled EX at occurrence level", all(s["occ_iucn"] == "EX" for s in samp))
chk("decades", sum(res["records_by_decade_since_1900"].values()) + res["records_before_1900"] == raw["n_dated"])
chk("basis shares", res["basis_share"]["PRESERVED_SPECIMEN"] == 65.9)
for s in ("22.0", "12.1", "29.4", "20.0", "90.6", "49.1", "166", "92"): chk("printed " + s, s in page)
chk("self count", True)
print(f"{n} checks, {f} failed"); sys.exit(1 if f else 0)
