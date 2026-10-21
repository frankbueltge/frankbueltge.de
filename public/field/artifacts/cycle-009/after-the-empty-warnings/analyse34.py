"""Study 34: the price of the precaution. Hand's B / L for a public under tornado warnings.
Usage: python3 -I analyse34.py <the Atelier's plate4.json at ulysses 522c7c3>
Reads data/warnings34.tsv (build34.py) and data/tornadoes31.tsv (study 31). Writes data/results34.json.
Frame, central values and bounds as fixed in PREREGISTRATION-34.md (commit 2996da1)."""
import csv, sys, json, pathlib, hashlib, statistics
HERE = pathlib.Path(__file__).resolve().parent
plate4 = sys.argv[1]
assert hashlib.sha256(open(plate4, "rb").read()).hexdigest() == \
    "220ff73b938b96eafff560dc362c1a21828e7526279cb32b87e7f876ad9a6c0a"
P4 = json.load(open(plate4))

W = list(csv.DictReader(open(HERE / "data/warnings34.tsv"), delimiter="\t"))
offices = {w["office"] for w in W}
N = len(W)
people = [int(w["people"]) for w in W]
hours_whole = [float(w["minutes"]) / 60 for w in W]

T = [t for t in csv.DictReader(open(HERE / "data/tornadoes31.tsv"), delimiter="\t")
     if 2016 <= int(t["yr"]) <= 2023 and t["office"] in offices and t["warned"] == "1"]
D = sum(int(t["fat"]) for t in T); I = sum(int(t["inj"]) for t in T)

# the Atelier's chance that a warning is met, pooled over its classes (2015-2024, its 72 offices)
cls = P4["classes"]
n_all = sum(c["n"] for c in cls.values())
P = {rec: 1 - sum(c[f"empty_{rec}"] for c in cls.values()) / n_all for rec in ("hour", "later")}
BAND = (cls["R"]["P_hour"], cls["R"]["P_later"])

C = {"vsl": 9.1e6, "inj": 0.047, "e": 0.5, "h": 0.25, "v": 15.0}
BOUNDS = {"vsl": (5.46e6, 12.74e6), "inj": (0.003, 0.105), "e": (0.1, 1.0), "h": ("5min", "whole"), "v": (5.0, 50.0)}

def person_hours(h):
    if h == "5min": return sum(people) * 5 / 60
    if h == "whole": return sum(p * x for p, x in zip(people, hours_whole))
    return sum(people) * h

def V(p, d=D, i=I): return p["vsl"] * (d + i * p["inj"])

def r(p, rec="later", d=D, i=I):
    """public's B / L: mean burden per warning over mean averted loss per met warning."""
    B = person_hours(p["h"]) * p["v"]
    return (B / N) / (p["e"] * V(p, d, i) / (P[rec] * N))

res = {"n_warnings": N, "n_offices": len(offices), "people": {
    "median": statistics.median(people), "mean": round(statistics.mean(people)),
    "p10": sorted(people)[N // 10], "p90": sorted(people)[9 * N // 10],
    "person_hours_central": round(person_hours(0.25)), "person_hours_whole": round(person_hours("whole")),
    "median_minutes": statistics.median(float(w["minutes"]) for w in W)},
    "tornadoes_warned": len(T), "deaths": D, "injuries": I, "P_met": P, "band": BAND}
res["V_central"] = V(C); res["deaths_share_V"] = D / (D + I * C["inj"])
res["r_central"] = {rec: r(C, rec) for rec in P}
res["breakeven_hour_value"] = {f"{rec}@{b:.3f}": b / r(C, rec) * C["v"] for rec in P for b in BAND}
sweep = {}
for k, (lo, hi) in BOUNDS.items():
    sweep[k] = [r({**C, k: lo}), r({**C, k: hi})]
res["sweep_later"] = sweep
allr = [x for v in sweep.values() for x in v]
res["sweep_span"] = max(allr) / min(allr)

# the costliest warned tornadoes
val = sorted(((int(t["fat"]) + int(t["inj"]) * C["inj"], t) for t in T), key=lambda x: -x[0])
top = val[:10]
res["top10"] = [{"om": t["om"], "yr": t["yr"], "office": t["office"], "fat": int(t["fat"]), "inj": int(t["inj"])} for _, t in top]
d10 = sum(int(t["fat"]) for _, t in top); i10 = sum(int(t["inj"]) for _, t in top)
res["top10_share_V"] = (d10 + i10 * C["inj"]) / (D + I * C["inj"])
res["r_without_top10"] = {rec: r(C, rec, D - d10, I - i10) for rec in P}

# how unequal the burden is: warnings whose own B_i exceeds the record's mean averted loss per warning
mean_PL = C["e"] * V(C) / N
Bi = [p * C["h"] * C["v"] for p in people]
res["share_Bi_above_mean_PL"] = sum(b > mean_PL for b in Bi) / N
res["mean_PL_per_warning"] = mean_PL; res["mean_B_per_warning"] = sum(Bi) / N

pred = {
    "P1": res["people"]["median"] > 10000,
    "P2": res["r_central"]["later"] < BAND[0] and res["r_central"]["hour"] < BAND[0],
    "P3": res["deaths_share_V"] > 0.5,
    "P4": res["sweep_span"] > 10,
    "P5": res["top10_share_V"] > 0.5 and min(res["r_without_top10"].values()) > BAND[1]}
res["predictions"] = pred
# a visitor's sliders need the sums, not the rows
res["page"] = {"sum_people": sum(people), "sum_person_hours_whole": person_hours("whole")}
json.dump(res, open(HERE / "data/results34.json", "w"), indent=1)
print(json.dumps({k: res[k] for k in res if k not in ("top10", "page")}, indent=1))
