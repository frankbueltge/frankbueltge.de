"""Study 25. Score each lagged version's one-week window (own circle, M >= own Mcat) and summarise per lag.
Rules are those of PREREGISTRATION-4.md (pushed 21ac42e). Writes data/lagged_cells_25.tsv and
data/results_25.json."""
import json, random, collections

LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
SEED, B = 210, 2000
R = [json.loads(l) for l in open("data/lagged_25.jsonl")]
O = {(o["id"], o["issued"]): o for o in map(json.loads, open("data/outcomes_25.jsonl"))}
mcat = lambda r: r["Mcat"] if r["Mcat"] is not None else 3.0

cells = []
for r in R:
    o = O.get((r["id"], r["issued"]))
    if o is None: continue
    w = [w for w in r["windows"] if w["label"] == "1 Week"][0]
    inw = [e for e in o["events"] if w["t0"] <= e[1] < w["t1"] and e[4] <= r["rkm"] and e[2] is not None]
    for b in w["bins"]:
        if b["M"] < mcat(r) - 1e-9: continue
        n = sum(1 for e in inw if round(e[2], 2) >= b["M"] - 1e-9)
        cells.append({"lag": r["lag_rule_h"], "id": r["id"], "issued": r["issued"], "lag_h": r["lag_h"],
                      "M": b["M"], "p": b["p"], "n": n, "hit": int(n > 0), "model": r["model"]})

by = collections.defaultdict(lambda: collections.defaultdict(list))
for c in cells: by[c["lag"]][c["id"]].append(c)
common = sorted(set.intersection(*[set(by[l]) for l in LAGS]))
q = lambda v, a: v[int(a * (len(v) - 1))]

def oe(g, ids):
    o = sum(c["hit"] for i in ids for c in g[i]); e = sum(c["p"] for i in ids for c in g[i])
    return o, e

def summarise(lag, ids, seed):
    g = by[lag]; o, e = oe(g, ids); rng = random.Random(seed); bs = []
    for _ in range(B):
        s = [rng.choice(ids) for _ in ids]; so, se = oe(g, s)
        if se > 0: bs.append(so / se)
    bs.sort(); lo, hi = q(bs, .025), q(bs, .975)
    verdict = "too high" if hi < 1 else "too low" if lo > 1 else "cannot be told from right"
    return {"lag_rule_h": lag, "sequences": len(ids), "cells": sum(len(g[i]) for i in ids), "observed": o,
            "stated": round(e, 2), "O_over_E": round(o / e, 3), "ci": [round(lo, 3), round(hi, 3)], "verdict": verdict,
            "median_lag_h": sorted(g[i][0]["lag_h"] for i in ids)[len(ids) // 2]}

prim = [summarise(l, sorted(by[l]), SEED) for l in LAGS]
comm = [summarise(l, common, SEED) for l in LAGS]

def spearman(x, y):
    rk = lambda v: [sorted(v).index(a) + (sorted(v).count(a) - 1) / 2 for a in v]
    a, b = rk(x), rk(y); n = len(a); ma, mb = sum(a) / n, sum(b) / n
    num = sum((p - ma) * (r - mb) for p, r in zip(a, b))
    return num / (sum((p - ma) ** 2 for p in a) * sum((r - mb) ** 2 for r in b)) ** .5

ratios = [s["O_over_E"] for s in prim]
rho = spearman(LAGS, ratios)
res = {
    "lags_h": LAGS, "primary": prim, "common_set": comm, "common_sequences": len(common),
    "spearman_lag_vs_OE": round(rho, 3), "spearman_common": round(spearman(LAGS, [s["O_over_E"] for s in comm]), 3),
    "range_of_points": round(max(ratios) - min(ratios), 3),
    "atelier_sighted_range": [0.218, 1.34],
    "checks": {"lag0_is_study21": [prim[0]["observed"], prim[0]["stated"]],
               "lag24_is_study23": [prim[3]["observed"], prim[3]["stated"]]},
    "verdicts": dict(collections.Counter(s["verdict"] for s in prim)),
    "versions_scored": len(O),
}
# The pre-registered check, at cell level: on the cells studies 21 and 23 scored, every p and every hit must agree.
def tsv(f):
    rows = [l.rstrip("\n").split("\t") for l in open(f)]; return [dict(zip(rows[0], x)) for x in rows[1:]]
def agree(old, lag):
    new = {(c["id"], c["M"]): c for c in cells if c["lag"] == lag}
    bad = [k for k in ((c["id"], float(c["M"])) for c in old) if k not in new]
    bad += [(c["id"], c["M"]) for c in old if (c["id"], float(c["M"])) in new and (int(c["hit"]) != new[(c["id"], float(c["M"]))]["hit"]
            or abs(float(c["p"]) - new[(c["id"], float(c["M"]))]["p"]) > 1e-12)]
    return {"cells": len(old), "disagree": len(bad), "observed_old": sum(int(c["hit"]) for c in old),
            "observed_new_same_cells": sum(new[(c["id"], float(c["M"]))]["hit"] for c in old if (c["id"], float(c["M"])) in new),
            "sequences_closed_since": sorted({c["id"] for c in cells if c["lag"] == lag} - {c["id"] for c in old})}
old21 = [c for c in tsv("data/cells.tsv") if c["win"] == "1 Week" and float(c["M"]) >= float(c["Mcat"]) - 1e-9]
res["checks"]["lag0_vs_study21_cells"] = agree(old21, 0)
res["checks"]["lag24_vs_study23_cells"] = agree(tsv("data/updates_cells.tsv"), 24)
assert res["checks"]["lag0_vs_study21_cells"]["disagree"] == 0 and res["checks"]["lag24_vs_study23_cells"]["disagree"] == 0
res["predictions_held"] = {
    "P1": rho >= 0.6,
    "P2": ratios[0] == min(ratios),
    "P3": all(s["ci"][0] <= 1 for s in prim),
    "P4": res["range_of_points"] < 0.56,
    "P5": all(s["O_over_E"] < 1 for s in prim if s["lag_rule_h"] >= 168),
}
with open("data/lagged_cells_25.tsv", "w") as fh:
    keys = ["lag", "id", "issued", "lag_h", "M", "p", "n", "hit", "model"]
    fh.write("\t".join(keys) + "\n")
    for c in cells: fh.write("\t".join(str(c[k]) for k in keys) + "\n")
json.dump(res, open("data/results_25.json", "w"), indent=1, allow_nan=False)
print(json.dumps({k: v for k, v in res.items() if k not in ("primary", "common_set")}, indent=1))
for s in prim: print(s)
print("common:"); [print(s) for s in comm]
