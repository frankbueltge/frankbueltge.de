"""Study 23. Score each update's one-week window (own circle, M >= own Mcat) and pair it with study 21's
first-forecast cells on the same sequences. Rules are those of PREREGISTRATION-3.md (pushed 5a1c4ad).
Writes data/updates_cells.tsv and data/results_23.json."""
import json, random, collections

U = {json.loads(l)["id"]: json.loads(l) for l in open("data/updates.jsonl")}
O = {json.loads(l)["id"]: json.loads(l) for l in open("data/outcomes_23.jsonl")}
F = {json.loads(l)["id"]: json.loads(l) for l in open("data/forecasts.jsonl")}
SEED, B = 208, 2000
mcat = lambda r: r["Mcat"] if r["Mcat"] is not None else 3.0

upd = []
for eid, o in O.items():
    r = U[eid]; w = [w for w in r["windows"] if w["label"] == "1 Week"][0]
    inw = [e for e in o["events"] if w["t0"] <= e[1] < w["t1"] and e[4] <= r["rkm"] and e[2] is not None]
    for b in w["bins"]:
        if b["M"] < mcat(r) - 1e-9: continue
        n = sum(1 for e in inw if round(e[2], 2) >= b["M"] - 1e-9)
        upd.append({"id": eid, "M": b["M"], "p": b["p"], "n": n, "hit": int(n > 0), "model": r["model"],
                    "first_model": F[eid]["model"], "lag_h": r["lag_h"]})

rows = [l.rstrip("\n").split("\t") for l in open("data/cells.tsv")]
H = rows[0]; cells = [dict(zip(H, x)) for x in rows[1:]]
first = [{"id": c["id"], "M": float(c["M"]), "p": float(c["p"]), "hit": int(c["hit"])} for c in cells
         if c["win"] == "1 Week" and float(c["M"]) >= float(c["Mcat"]) - 1e-9 and c["id"] in O]

def stats(cs):
    o = sum(c["hit"] for c in cs); e = sum(c["p"] for c in cs)
    base = collections.defaultdict(lambda: [0, 0])
    for c in cs: base[c["M"]][0] += c["hit"]; base[c["M"]][1] += 1
    bs = sum((c["p"] - c["hit"]) ** 2 for c in cs) / len(cs)
    bc = sum((base[c["M"]][0] / base[c["M"]][1] - c["hit"]) ** 2 for c in cs) / len(cs)
    return o, e, (o / e if e else float("nan")), (1 - bs / bc if bc else float("nan"))

def group(cs):
    g = collections.defaultdict(list)
    for c in cs: g[c["id"]].append(c)
    return g

gu, gf = group(upd), group(first)
ids = sorted(O)
q = lambda v, a: v[int(a * (len(v) - 1))]
rng = random.Random(SEED); RU, RF, RP, SU, SF = [], [], [], [], []
for _ in range(B):
    smp = [rng.choice(ids) for _ in ids]
    su = stats([c for i in smp for c in gu[i]]); sf = stats([c for i in smp for c in gf[i]])
    RU.append(su[2]); RF.append(sf[2]); SU.append(su[3]); SF.append(sf[3])
    if sf[2] > 0: RP.append(su[2] / sf[2])
for v in (RU, RF, RP, SU, SF): v.sort()
ci = lambda v: [round(q(v, .025), 3), round(q(v, .975), 3)]

def summ(cs):
    o, e, r, s = stats(cs)
    return {"sequences": len({c["id"] for c in cs}), "cells": len(cs), "observed": o, "expected": round(e, 2), "O_over_E": round(r, 3)}

su, sf = stats(upd), stats(first)
res = {
    "updates_fetched": len(U), "update_weeks_closed": len(O),
    "lag_h_median": sorted(r["lag_h"] for r in U.values())[len(U) // 2],
    "update": {**summ(upd), "O_over_E_ci": ci(RU), "BSS": round(su[3], 3), "BSS_ci": ci(SU)},
    "first_same_sequences": {**summ(first), "O_over_E_ci": ci(RF), "BSS": round(sf[3], 3), "BSS_ci": ci(SF)},
    "paired_ratio": {"point": round(su[2] / sf[2], 3), "ci": ci(RP), "share_above_1": round(sum(x > 1 for x in RP) / len(RP), 3),
                     "resamples": [round(x, 3) for x in RP]},
    "exploratory_by_first_model": {m: summ([c for c in upd if c["first_model"] == m]) for m in sorted({c["first_model"] for c in upd})},
    "exploratory_update_as_warnings_p_ge_half": {"cells": sum(1 for c in upd if c["p"] >= .5), "came_true": sum(c["hit"] for c in upd if c["p"] >= .5)},
}
res["predictions_held"] = {"R1": res["update"]["O_over_E"] >= 0.75, "R2": res["paired_ratio"]["point"] > 1,
                           "R3": res["paired_ratio"]["ci"][0] <= 1 <= res["paired_ratio"]["ci"][1], "R4": res["update"]["BSS"] > 0}
with open("data/updates_cells.tsv", "w") as fh:
    keys = ["id", "M", "p", "n", "hit", "model", "first_model", "lag_h"]
    fh.write("\t".join(keys) + "\n")
    for c in upd: fh.write("\t".join(str(c[k]) for k in keys) + "\n")
json.dump(res, open("data/results_23.json", "w"), indent=1, allow_nan=False)
print(json.dumps(res, indent=1))
