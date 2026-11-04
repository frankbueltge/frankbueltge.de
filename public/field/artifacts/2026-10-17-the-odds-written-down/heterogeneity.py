"""Study 22 — one factor, or many classes? (PREREGISTRATION-2.md)
Rebuilds the Atelier's unit (ulysses d22b646, window/cycle-008-session-6/build.py) from this work's own
data, replaces its Monte Carlo test by the exact Poisson-binomial one, and re-runs the whole class
pipeline in worlds where one common factor (H0) or none (H0') holds. Also checks the Studio's refetch.
Usage: python3 -I heterogeneity.py <studio outcomes.json> <atelier results.json>"""
import hashlib, itertools, json, math, random, sys, time
from pathlib import Path

HERE = Path(__file__).parent
D = HERE / "data"
STUDIO, ATELIER = Path(sys.argv[1]), Path(sys.argv[2])
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
PIN = {"studio outcomes.json": "692248f89a48b4957812e3ced33741c7e3ae1f78c6c73c385d225fbc35136a9d",
       "atelier results.json": "6aa285b520939a71b2e44e0cb0eff0c684bfb2c4b5448da68dfb67b09a1abe0e"}
assert sha(STUDIO) == PIN["studio outcomes.json"] and sha(ATELIER) == PIN["atelier results.json"]

F = [json.loads(l) for l in open(D / "forecasts.jsonl")]
rows = [l.rstrip("\n").split("\t") for l in list(open(D / "cells.tsv"))[1:]]
week = {}
for r in rows:
    if r[1] == "1 Week":
        week.setdefault(r[0], []).append((float(r[2]), float(r[3]), float(r[4]), int(r[8])))

# --- the Atelier's unit and attributes, copied rule for rule -------------------------------------
def region(f):
    pl, lon, lat = f["place"], f["lon"], f["lat"]
    if lon > 100 or "Mariana" in pl or "Guam" in pl or "Micronesia" in pl: return "Marianas & Guam"
    if "Alaska" in pl or "Hubbard" in pl or (lat > 54 and lon < -125): return "Alaska"
    if "CA" in pl.split(", ")[-1] or "California" in pl or "Ridgecrest" in pl or (pl.endswith("MX") and lon < -114): return "California"
    if "Oregon" in pl or "Washington" in pl: return "Pacific Northwest"
    if -125 < lon < -66 and 24 < lat < 50: return "Rest of contiguous US"
    return "Elsewhere"
def band(p): return "stated < 20 %" if p < .2 else ("stated 20–50 %" if p < .5 else "stated ≥ 50 %")
KEYS = ["region", "size", "model", "year", "odds", "delay"]
W = []
for f in F:
    cs = [c for c in week.get(f["id"], []) if c[0] >= c[1] - 1e-9]
    if not cs: continue
    M, Mcat, p, hit = min(cs)
    y = time.gmtime(f["time"] / 1000).tm_year
    delay = (f["issued"] - f["time"]) / 60000
    m = f["mag"]
    W.append({"id": f["id"], "M": M, "p": p, "hit": hit, "a": {
        "region": region(f), "size": "mainshock < M5" if m < 5 else ("M5–6" if m < 6 else "M6 and over"),
        "model": "generic" if "Generic" in f["model"] else "fitted to the sequence",
        "year": "before 2025" if y < 2025 else str(y), "odds": band(p),
        "delay": "issued ≤ 20 min" if delay <= 20.5 else "issued later"}})
n = len(W); P = [w["p"] for w in W]; H = [w["hit"] for w in W]

# --- exact Poisson-binomial test and power, per class ---------------------------------------------
def pmf(ps):
    d = [1.0]
    for p in ps:
        e = [0.0] * (len(d) + 1)
        for k, v in enumerate(d): e[k] += v * (1 - p); e[k + 1] += v * p
        d = e
    return d
classes = {}
for depth in range(4):
    for ks in itertools.combinations(KEYS, depth):
        g = {}
        for i, w in enumerate(W): g.setdefault(tuple(w["a"][k] for k in ks), []).append(i)
        for vals, idx in g.items():
            if len(idx) >= 5: classes[tuple(zip(ks, vals))] = idx
C = []
for key, idx in classes.items():
    ps = [P[i] for i in idx]; f0 = pmf(ps); cdf = list(itertools.accumulate(f0))
    sf = [1 - c + v for c, v in zip(cdf, f0)]                      # P(K >= k)
    verdict = []
    for k in range(len(idx) + 1):
        pv = min(1, 2 * min(cdf[k], sf[k]))
        verdict.append("consistent" if pv >= .05 else ("too high" if k < sum(ps) else "too low"))
    cut = max([k for k in range(len(idx) + 1) if 2 * cdf[k] < .05], default=-1)
    fh = list(itertools.accumulate(pmf([p / 2 for p in ps])))
    power = fh[cut] if cut >= 0 else 0.0
    C.append({"def": set(key), "idx": idx, "verdict": verdict, "power": power, "stated": sum(ps)})

def narrow_sets(N):
    keep = [j for j, c in enumerate(C) if len(c["idx"]) >= N]
    per = [[] for _ in W]
    for j in keep:
        for i in C[j]["idx"]: per[i].append(j)
    out = []
    for js in per:
        nar = [j for j in js if not any(C[j]["def"] < C[k]["def"] for k in js)]
        out.append([j for j in nar if C[j]["power"] >= .8])
    return keep, out
NS = {N: narrow_sets(N) for N in (10, 20, 30)}

def stats(hits):
    obs = [sum(hits[i] for i in c["idx"]) for c in C]
    v = [c["verdict"][o] for c, o in zip(C, obs)]
    r = {}
    for N, (keep, nar) in NS.items():
        r[N] = sum({v[j] for j in js} == {"too high", "consistent"} for js in nar)
    r["too_low"] = sum(x == "too low" for x in v)
    return r

# --- likelihood-ratio statistic, one factor against one factor per level -------------------------
def g_stat(hits, key):
    O, E = {}, {}
    for w, h in zip(W, hits):
        g = w["a"][key]; O[g] = O.get(g, 0) + h; E[g] = E.get(g, 0) + w["p"]
    c = sum(O.values()) / sum(E.values())
    return 2 * sum((o * math.log(o / (c * E[g])) if o else 0) - (o - c * E[g]) for g, o in O.items())

ATTR = ["region", "size", "model", "year", "delay"]
obs_stats = stats(H); obs_g = {k: g_stat(H, k) for k in ATTR}
c_hat = sum(H) / sum(P)
rng = random.Random(20261018); R = 1000
sims = {"H0": [], "H0'": []}; gsim = {k: [] for k in ATTR}
for _ in range(R):
    h0 = [int(rng.random() < c_hat * p) for p in P]
    s = stats(h0); sims["H0"].append(s)
    for k in ATTR: gsim[k].append(g_stat(h0, k))
    sims["H0'"].append(stats([int(rng.random() < p) for p in P]))

def q(xs, a): xs = sorted(xs); return xs[min(len(xs) - 1, int(a * len(xs)))]
def summ(xs): return {"median": q(xs, .5), "central95": [q(xs, .025), q(xs, .975)], "mean": round(sum(xs) / len(xs), 2)}
res = {"unit": {"warnings": n, "came": sum(H), "stated": round(sum(P), 2), "c_hat": round(c_hat, 4), "classes_n_ge_5": len(C)},
       "observed": obs_stats, "atelier_reported_N20": 38}
for nm, ss in sims.items():
    res[nm] = {str(N): summ([s[N] for s in ss]) for N in (10, 20, 30)}
    res[nm]["too_low"] = summ([s["too_low"] for s in ss])
    res[nm]["share_ge_observed_N20"] = round(sum(s[20] >= obs_stats[20] for s in ss) / R, 3)
pv = {k: (1 + sum(x >= obs_g[k] for x in gsim[k])) / (R + 1) for k in ATTR}
order = sorted(ATTR, key=lambda k: pv[k]); holm = {}; run = 0
for r_, k in enumerate(order): run = max(run, min(1, (len(ATTR) - r_) * pv[k])); holm[k] = run
grp = {}
for key in ATTR:
    t = {}
    for w in W:
        g = w["a"][key]; t.setdefault(g, [0, 0.0, 0]); t[g][0] += w["hit"]; t[g][1] += w["p"]; t[g][2] += 1
    grp[key] = {g: {"n": v[2], "came": v[0], "stated": round(v[1], 2), "O_over_E": round(v[0] / v[1], 3)} for g, v in sorted(t.items())}
res["heterogeneity"] = {k: {"G": round(obs_g[k], 3), "p_boot": round(pv[k], 4), "p_holm": round(holm[k], 4), "levels": grp[k]} for k in ATTR}

# --- the Studio's refetch --------------------------------------------------------------------------
S = json.load(open(STUDIO))["outcomes"]
unit_agree = []; cell_cmp = {"compared": 0, "agree": 0, "differ": [], "missing": []}
for w in W:
    s = S.get(w["id"])
    if s is None: unit_agree.append((w["id"], "missing")); continue
    sh = int(any(round(e["m"], 2) >= w["M"] - 1e-9 for e in s["events"]))
    unit_agree.append((w["id"], "agree" if sh == w["hit"] else f"differ (mine {w['hit']}, studio {sh})"))
for r in rows:
    if r[1] != "1 Week" or float(r[2]) < float(r[3]) - 1e-9: continue
    s = S.get(r[0])
    if s is None: cell_cmp["missing"].append(r[0]); continue
    if float(r[2]) < s["M"] - 1e-9: cell_cmp["missing"].append(r[0] + " M" + r[2]); continue
    sh = int(any(round(e["m"], 2) >= float(r[2]) - 1e-9 for e in s["events"]))
    cell_cmp["compared"] += 1
    if sh == int(r[8]): cell_cmp["agree"] += 1
    else: cell_cmp["differ"].append({"id": r[0], "M": float(r[2]), "mine": int(r[8]), "studio": sh})
res["studio_refetch"] = {"fetched": json.load(open(STUDIO))["fetched"],
                         "unit": {"agree": sum(a == "agree" for _, a in unit_agree), "of": n,
                                  "other": [x for x in unit_agree if x[1] != "agree"]}, "primary_cells": cell_cmp}

# --- exploratory, chosen after the results above ---------------------------------------------------
# (a) could the region test have told? its power if each region's factor were what was observed
crit = q(gsim["region"], .95)
cg = {g: v["came"] / v["stated"] for g, v in grp["region"].items()}
pw = sum(g_stat([int(rng.random() < min(1, cg[w["a"]["region"]] * w["p"])) for w in W], "region") > crit for _ in range(R)) / R
# (b) California against all else, the contrast study 21's sentence drew
for w in W: w["a"]["ca"] = "California" if w["a"]["region"] == "California" else "all else"
g_ca = g_stat(H, "ca"); gca_sim = [g_stat([int(rng.random() < c_hat * p) for p in P], "ca") for _ in range(R)]
# (c) the same contrast, honest about having picked California after looking: the largest of the six
#     one-region-against-the-rest statistics, in worlds where one factor holds
REG = sorted(grp["region"])
def max_one_vs_rest(hits):
    best = 0
    for g in REG:
        for w in W: w["a"]["ovr"] = "in" if w["a"]["region"] == g else "out"
        best = max(best, g_stat(hits, "ovr"))
    return best
mx = [max_one_vs_rest([int(rng.random() < c_hat * p) for p in P]) for _ in range(R)]
p_sel = (1 + sum(x >= g_ca for x in mx)) / (R + 1)
res["exploratory"] = {
    "california_vs_rest_p_after_choosing_from_six": round(p_sel, 4),
    "region_test_power_at_observed_factors": pw,
    "california_vs_rest": {"G": round(g_ca, 3), "p_boot": round((1 + sum(x >= g_ca for x in gca_sim)) / (R + 1), 4),
                           "california": [14, 15.82], "rest": [sum(H) - 14, round(sum(P) - 15.82, 2)]},
    "H0_N20_histogram": {str(b): sum(b <= s[20] < b + 10 for s in sims["H0"]) for b in range(0, 200, 10)},
    "H0p_N20_histogram": {str(b): sum(b <= s[20] < b + 10 for s in sims["H0'"]) for b in range(0, 200, 10)}}

pred = {
    "Q1": q([s[20] for s in sims["H0"]], .025) <= obs_stats[20] <= q([s[20] for s in sims["H0"]], .975),
    "Q2": pv["region"] >= .05,
    "Q3": all(h >= .05 for h in holm.values()),
    "Q4": q([s[20] for s in sims["H0'"]], .5) >= 10,
    "Q5": res["studio_refetch"]["unit"]["agree"] == n,
    "Q6": cell_cmp["agree"] >= 975}
res["predictions_held"] = pred
res["worlds_N20"] = {"H0": [x[20] for x in sims["H0"]], "H0'": [x[20] for x in sims["H0'"]]}
res["sources"] = PIN
(D / "heterogeneity.json").write_text(json.dumps(res, indent=1, ensure_ascii=False))
(HERE / "data-22.js").write_text("window.D22=" + json.dumps({k: res[k] for k in ("unit", "observed", "H0", "H0'", "heterogeneity", "studio_refetch", "predictions_held", "exploratory", "worlds_N20")}, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(json.dumps({k: v for k, v in res.items() if k != "worlds_N20"}, indent=1, ensure_ascii=False))
