"""Score every closed window of every first forecast against the ComCat events in its own circle.
Writes data/cells.tsv (one row per mainshock x window x magnitude) and data/results.json.
Rules are those of PREREGISTRATION.md; nothing here is tuned after the outcomes were read."""
import json, random, math, collections

F = {json.loads(l)["id"]: json.loads(l) for l in open("data/forecasts.jsonl")}
O = {json.loads(l)["id"]: json.loads(l) for l in open("data/outcomes.jsonl")}
SEED, B = 206, 2000

def mcat(r):
    return r["Mcat"] if r["Mcat"] is not None else 3.0

cells, above = [], []
for eid, r in F.items():
    o = O[eid]; ev = o["events"]
    for w in r["windows"]:
        if w["t1"] > o["fetched"]:
            continue                                    # window not yet closed
        inw = [e for e in ev if w["t0"] <= e[1] < w["t1"] and e[4] <= r["rkm"] and e[2] is not None]
        for b in w["bins"]:
            n = sum(1 for e in inw if round(e[2], 2) >= b["M"] - 1e-9)
            cells.append({"id": eid, "win": w["label"], "M": b["M"], "Mcat": mcat(r), "p": b["p"],
                          "lo": b["lo"], "hi": b["hi"], "n": n, "hit": int(n > 0), "model": r["model"],
                          "place": (r["place"] or "").split(", ")[-1], "mag": r["mag"]})
        if w["above"] is not None:
            k = sum(1 for e in inw if round(e[2], 2) >= w["aboveM"] - 1e-9)
            above.append({"id": eid, "win": w["label"], "p": w["above"], "hit": int(k > 0)})

def pb_interval(ps, q=0.025):
    d = [1.0]
    for p in ps:
        n = [0.0] * (len(d) + 1)
        for i, v in enumerate(d):
            n[i] += v * (1 - p); n[i + 1] += v * p
        d = n
    c, lo, hi = 0.0, None, None
    for i, v in enumerate(d):
        c += v
        if lo is None and c >= q: lo = i
        if hi is None and c >= 1 - q: hi = i
    return lo, hi

def brier(cs, base):
    return sum((c["p"] - c["hit"]) ** 2 for c in cs) / len(cs), sum((base[c["M"]] - c["hit"]) ** 2 for c in cs) / len(cs)

def summary(cs):
    if not cs: return None
    ids = sorted({c["id"] for c in cs}); by = collections.defaultdict(list)
    for c in cs: by[c["id"]].append(c)
    def stats(sample):
        o = sum(c["hit"] for c in sample); e = sum(c["p"] for c in sample)
        base = collections.defaultdict(lambda: [0, 0])
        for c in sample: base[c["M"]][0] += c["hit"]; base[c["M"]][1] += 1
        base = {m: v[0] / v[1] for m, v in base.items()}
        bs, bc = brier(sample, base)
        return o, e, (o / e if e else float("nan")), bs, bc, (1 - bs / bc if bc else float("nan"))
    o, e, r, bs, bc, bss = stats(cs)
    rng = random.Random(SEED); R, S = [], []
    for _ in range(B):
        smp = [c for i in (rng.choice(ids) for _ in ids) for c in by[i]]
        x = stats(smp); R.append(x[2]); S.append(x[5])
    R = sorted(v for v in R if v == v); S = sorted(v for v in S if v == v)
    q = lambda v, a: v[int(a * (len(v) - 1))] if v else float("nan")  # empty when a subset has no hits (fix after first run, declared)
    lo, hi = pb_interval([c["p"] for c in cs])
    cov = sum(1 for c in cs if c["lo"] <= c["n"] <= c["hi"])
    return {"mainshocks": len(ids), "cells": len(cs), "observed": o, "expected": round(e, 2),
            "O_over_E": round(r, 3), "O_over_E_ci": [round(q(R, .025), 3), round(q(R, .975), 3)],
            "poisson_binomial_95": [lo, hi], "brier": round(bs, 4), "brier_climatology": round(bc, 4),
            "BSS": round(bss, 3), "BSS_ci": [round(q(S, .025), 3), round(q(S, .975), 3)],
            "count_in_95_range": cov, "count_coverage": round(cov / len(cs), 4),
            "below_range": sum(1 for c in cs if c["n"] < c["lo"]), "above_range": sum(1 for c in cs if c["n"] > c["hi"])}

def reliab(cs):
    edges = [0, .01, .05, .2, .5, 1.0001]; out = []
    for a, b in zip(edges, edges[1:]):
        s = [c for c in cs if a <= c["p"] < b]
        if s: out.append({"p_from": a, "p_to": min(b, 1), "cells": len(s), "mean_p": round(sum(c["p"] for c in s) / len(s), 4),
                          "hit_rate": round(sum(c["hit"] for c in s) / len(s), 4), "hits": sum(c["hit"] for c in s)})
    return out

prim = [c for c in cells if c["win"] == "1 Week" and c["M"] >= c["Mcat"] - 1e-9]
below = [c for c in cells if c["win"] == "1 Week" and c["M"] < c["Mcat"] - 1e-9]
ab = [a for a in above if a["win"] == "1 Week"]
lo, hi = pb_interval([a["p"] for a in ab])
warned = [c for c in prim if c["p"] >= 0.5]
res = {
    "mainshocks_with_forecast": len(F),
    "primary_1week_M_ge_Mcat": summary(prim), "primary_reliability": reliab(prim),
    "below_Mcat_1week": summary(below),
    "above_mainshock_1week": {"mainshocks": len(ab), "observed": sum(a["hit"] for a in ab),
                              "expected": round(sum(a["p"] for a in ab), 2), "poisson_binomial_95": [lo, hi],
                              "hits": [a["id"] for a in ab if a["hit"]]},
    "as_warnings_p_ge_half": {"cells": len(warned), "came_true": sum(c["hit"] for c in warned)},
    "by_window_M_ge_Mcat": {w: summary([c for c in cells if c["win"] == w and c["M"] >= c["Mcat"] - 1e-9])
                            for w in ("1 Day", "1 Week", "1 Month", "1 Year")},
    "by_window_all_bins": {w: summary([c for c in cells if c["win"] == w]) for w in ("1 Day", "1 Week", "1 Month", "1 Year")},
    "by_M_primary": {str(m): summary([c for c in prim if c["M"] == m]) for m in sorted({c["M"] for c in prim})},
    "by_model_primary": {m: summary([c for c in prim if c["model"] == m]) for m in sorted({c["model"] for c in prim})},
    "by_place_primary": {pl: summary([c for c in prim if c["place"] == pl]) for pl in sorted({c["place"] for c in prim})
                         if sum(1 for c in prim if c["place"] == pl) >= 15},
}
with open("data/cells.tsv", "w") as fh:
    keys = ["id", "win", "M", "Mcat", "p", "lo", "hi", "n", "hit", "model", "place", "mag"]
    fh.write("\t".join(keys) + "\n")
    for c in cells: fh.write("\t".join(str(c[k]) for k in keys) + "\n")
def clean(o):  # NaN (no hits in a subset) is written as null, so the file stays valid JSON
    if isinstance(o, float) and o != o: return None
    if isinstance(o, dict): return {k: clean(v) for k, v in o.items()}
    if isinstance(o, list): return [clean(v) for v in o]
    return o
json.dump(clean(res), open("data/results.json", "w"), indent=1, allow_nan=False)
print(json.dumps({k: res[k] for k in ("primary_1week_M_ge_Mcat", "below_Mcat_1week", "above_mainshock_1week", "as_warnings_p_ge_half")}, indent=1))
