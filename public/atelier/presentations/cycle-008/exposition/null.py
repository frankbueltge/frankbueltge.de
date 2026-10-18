"""The Narrowest Class, checked against chance. Reads the window's own committed data
(window/cycle-008-session-6/data.js), re-judges every class exactly (Poisson-binomial, no
simulation noise), and counts the session-6 statistic in worlds where the outcomes are drawn
under two laws: one common factor (every chance x 37/65.6) and the odds as written.
Usage: python3 -I null.py   (writes null.json beside itself)"""
import json, random
from pathlib import Path

HERE = Path(__file__).parent
SRC = HERE / "../../../window/cycle-008-session-6/data.js"
blob = {}
for line in SRC.read_text().splitlines():
    name, val = line[6:].split("=", 1)
    blob[name] = json.loads(val.rstrip(";"))
W, C = blob["W"], blob["C"]
P = [w["p"] for w in W]

def pmf(ps):
    d = [1.0]
    for p in ps:
        n = [0.0] * (len(d) + 1)
        for k, x in enumerate(d):
            n[k] += x * (1 - p); n[k + 1] += x * p
        d = n
    return d

# the null law of each class and its power against a halving do not depend on the outcomes
LAW = []
for c in C:
    ps = [P[i] for i in c["members"]]
    d = pmf(ps); cdf = []; s = 0
    for x in d: s += x; cdf.append(s)
    sf = [1 - (cdf[k - 1] if k else 0) for k in range(len(d))]
    cut = next((k for k in range(len(d)) if 2 * cdf[k] >= .05), 0) - 1
    h = pmf([p / 2 for p in ps]); power = sum(h[:cut + 1]) if cut >= 0 else 0.0
    LAW.append((cdf, sf, sum(ps), power))

def verdicts(hits):
    out = []
    for c, (cdf, sf, exp, power) in zip(C, LAW):
        o = sum(hits[i] for i in c["members"])
        pv = min(1, 2 * min(cdf[o], sf[o]))
        out.append(("consistent" if pv >= .05 else ("too high" if o < exp else "too low"), power))
    return out

def stat(hits, N=20):
    v = verdicts(hits)
    keep = [j for j, c in enumerate(C) if c["n"] >= N]
    per = [[] for _ in W]
    for j in keep:
        for i in C[j]["members"]: per[i].append(j)
    strong = 0; low = 0
    for js in per:
        defs = [set(map(tuple, C[j]["def"])) for j in js]
        nar = [j for a, j in zip(defs, js) if not any(a < b for b in defs)]
        strong += {v[j][0] for j in nar if v[j][1] >= .8} == {"too high", "consistent"}
    low = sum(v[j][0] == "too low" for j in keep)
    return strong, low

obs = [w["hit"] for w in W]
o38, olow = stat(obs)
factor = sum(obs) / sum(P)
rng = random.Random(20261018)
R = 1000
worlds = {"one factor": [], "as written": []}
for law, f in (("one factor", factor), ("as written", 1.0)):
    for _ in range(R):
        worlds[law].append(stat([int(rng.random() < p * f) for p in P])[0])
res = {"observed": o38, "observed_too_low_classes": olow, "factor": round(factor, 4), "worlds": R,
       "laws": {k: {"share_ge_observed": round(sum(x >= o38 for x in v) / R, 3),
                    "share_zero": round(sum(x == 0 for x in v) / R, 3),
                    "median": sorted(v)[R // 2], "values": v} for k, v in worlds.items()}}
(HERE / "null.json").write_text(json.dumps(res, separators=(",", ":")))
print({k: (v if k != "laws" else {a: {b: c for b, c in d.items() if b != "values"} for a, d in v.items()}) for k, v in res.items()})

# the page's own copy of what it computes from: warnings, classes (members only), and these worlds
(HERE / "data.js").write_text(
    "const W=" + json.dumps([{"place": w["place"], "p": w["p"], "hit": w["hit"], "a": w["a"]} for w in W], ensure_ascii=False, separators=(",", ":"))
    + ";\nconst C=" + json.dumps([{"def": c["def"], "n": c["n"], "m": c["members"]} for c in C], ensure_ascii=False, separators=(",", ":"))
    + ";\nconst NULL=" + json.dumps(res, separators=(",", ":")) + ";\n")
