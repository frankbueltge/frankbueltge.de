#!/usr/bin/env python3
"""Session 17 — every number on the page, by a second route.

analysis.py filters event lists. This file builds per-year cumulative histograms for the classical
slope, walks the time-ordered sequence once per floor for b-positive with its own loop, solves the
truncated likelihood by Newton's method instead of bisection, and obtains the interaction share
from an additive model fitted by backfitting instead of from cell means. It then compares with
results.json and with the printed page, and tests the three predictions in PREDICTIONS.md.

    python3 check.py [results.json] [index.html]    # exit 0 when every check passes
"""
import json, math, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
S = json.loads((HERE / "seq.json").read_text())["events"]
R = json.loads((HERE / (sys.argv[1] if len(sys.argv) > 1 else "results.json")).read_text())
PAGE = (HERE / (sys.argv[2] if len(sys.argv) > 2 else "index.html")).read_text(encoding="utf-8")
LN10 = math.log(10)
TOP = 700
fails, count = [], 0


def ok(name, cond):
    global count
    count += 1
    if not cond:
        fails.append(name)


def near(a, b, tol):
    return abs(a - b) <= tol


years = sorted({e[0] for e in S})
hist = {y: [0] * (TOP + 1) for y in years}
for y, m, _ in S:
    hist[y][m] += 1
cnt = {y: [0] * (TOP + 2) for y in years}
sm = {y: [0] * (TOP + 2) for y in years}
for y in years:
    for c in range(TOP, -1, -1):
        cnt[y][c] = cnt[y][c + 1] + hist[y][c]
        sm[y][c] = sm[y][c + 1] + c * hist[y][c]
mc = {}
for y in years:
    bins = [sum(hist[y][10 * k:10 * k + 10]) for k in range(TOP // 10 + 1)]
    mc[y] = 10 * bins.index(max(bins))
ERAS = {"pooled": years, "1974-99": [y for y in years if y <= 1999], "2000-25": [y for y in years if y >= 2000]}


def b_classical(era, k):
    n = s = 0
    for y in ERAS[era]:
        c = mc[y] + 10 * k
        n += cnt[y][c]
        s += sm[y][c] - cnt[y][c] * (c - 0.5)
    return 100 / LN10 / (s / n), n


def b_trunc(era, k):
    data = []
    for y in ERAS[era]:
        c = mc[y] + 10 * k
        W = (299.5 - (c - 0.5)) / 100
        for m in range(c, 300):
            if hist[y][m]:
                data.append(((m - (c - 0.5)) / 100, W, hist[y][m]))
    B = 2.0
    for _ in range(60):    # Newton on the score
        f = fp = 0.0
        for x, W, w in data:
            e = math.exp(B * W)
            f += w * (1 / B - W / (e - 1) - x)
            fp += w * (-1 / B ** 2 + W * W * e / (e - 1) ** 2)
        B -= f / fp
    return B / LN10, sum(w for _, _, w in data)


def b_positive(era, k, dmc):
    lo, hi = min(ERAS[era]), max(ERAS[era])
    prev, tot, n = None, 0, 0
    for y, m, _ in S:
        if lo <= y <= hi and m >= mc[y] + 10 * k:
            if prev is not None and m - prev >= dmc:
                tot += m - prev
                n += 1
            prev = m
    return 100 / LN10 / (tot / n - (dmc - 0.5)), n


RULES = {"AU": b_classical, "AU<3": b_trunc,
         "b+ .01": lambda e, k: b_positive(e, k, 1), "b+ .1": lambda e, k: b_positive(e, k, 10),
         "b+ .3": lambda e, k: b_positive(e, k, 30)}
B = {}
for r, f in RULES.items():
    for e in ERAS:
        for k in range(9):
            B[(r, e, k)], n = f(e, k)
            got = next(x for x in R["lattice"] if x["rule"] == r and x["era"] == e and abs(x["offset"] - k / 10) < 1e-9)
            ok(f"b {r} {e} +{k}", near(got["b"], B[(r, e, k)], 6e-5))
            ok(f"n {r} {e} +{k}", got["n"] == n)
ok("lattice size", len(R["lattice"]) == 135)
for r in RULES:
    for e in ERAS:
        ok(f"drift {r} {e}", near(R["drift"][f"{r} | {e}"], B[(r, e, 8)] - B[(r, e, 0)], 1.5e-4))

# decomposition by backfitting an additive model; the residual is the interaction share
keys = list(B)
g = sum(B.values()) / len(B)
eff = {"r": {}, "e": {}, "k": {}}
for _ in range(200):
    for pos, name in ((0, "r"), (1, "e"), (2, "k")):
        grp = {}
        for key in keys:
            others = sum(eff[n].get(key[p], 0) for p, n in ((0, "r"), (1, "e"), (2, "k")) if n != name)
            grp.setdefault(key[pos], []).append(B[key] - g - others)
        eff[name] = {lvl: sum(v) / len(v) for lvl, v in grp.items()}
tot = sum((v - g) ** 2 for v in B.values())
resid = sum((B[key] - g - eff["r"][key[0]] - eff["e"][key[1]] - eff["k"][key[2]]) ** 2 for key in keys)
SV = R["share_of_variance"]
inter = sum(v for k, v in SV.items() if " x " in k)
ok("interaction share by backfitting", near(inter, resid / tot, 3e-4))
ok("floor share", near(SV["offset"], sum(eff["k"][k] ** 2 for k in range(9)) * 15 / tot, 2e-4))
ok("rule share", near(SV["rule"], sum(v ** 2 for v in eff["r"].values()) * 27 / tot, 2e-4))
ok("shares sum to one", near(sum(SV.values()), 1, 2e-4))

# counts and shares
w1 = {y: cnt[y][100] for y in years}


def unwritten(k, b):
    out = {}
    for y in years:
        c = mc[y] + 10 * k
        est = w1[y] if c <= 100 else cnt[y][c] * 10 ** (b * (c - 100) / 100)
        out[y] = max(0.0, est - w1[y])
    return out


for r in RULES:
    for x in R["counts"][r]:
        k = round(x["offset"] * 10)
        u = unwritten(k, B[(r, "pooled", k)])
        ok(f"count {r} +{k}", abs(round(sum(u.values())) - x["total"]) <= 1)
        e = sum(w1[y] for y in range(1974, 1980)); l = sum(w1[y] for y in range(2016, 2026))
        ok(f"early {r} +{k}", near(x["share_1974_79"], e / (e + sum(u[y] for y in range(1974, 1980))), 1e-4))
        ok(f"late {r} +{k}", near(x["share_2016_25"], l / (l + sum(u[y] for y in range(2016, 2026))), 1e-4))
ok("studio total reproduced", abs(round(sum(unwritten(2, B[("AU", "pooled", 2)]).values())) - 7043) <= 1)
ok("event count", R["events"] == len(S) == 20760)

# predictions
ok("P1 climb below M3 > 0.05", B[("AU<3", "pooled", 8)] - B[("AU<3", "pooled", 0)] > 0.05)
at02 = [next(x for x in R["counts"][r] if abs(x["offset"] - 0.2) < 1e-9)["total"] for r in ("b+ .01", "b+ .1", "b+ .3")]
ok("P2 b+ count at Studio floor above 8 164", min(at02) > 8164)
ok("P3 early below late under b+ everywhere", all(x["share_1974_79"] < x["share_2016_25"]
                                                   for r in ("b+ .01", "b+ .1", "b+ .3") for x in R["counts"][r]))

# the page
allc = [x["total"] for r in RULES for x in R["counts"][r]]
fmt = lambda n: f"{n:,}".replace(",", " ")
ok("page: no script", "<script" not in PAGE.lower())
ok("page: no external resource", not re.search(r'(src|href)="(https?:)?//', PAGE))
ok("page: title", "<title>Five slopes, one climb</title>" in PAGE)
ok("page: floor share", f"the floor accounts for <em class=\"k\">{100 * SV['offset']:.1f} %</em>" in PAGE)
ok("page: interaction share", f"All interactions together account for <em class=\"k\">{100 * inter:.1f} %</em>" in PAGE)
for k, v in SV.items():   # every share in the sentence under the first table, bounded on both sides
    lab = {"offset": "floor", "rule": "estimator", "era": "era", "rule x offset": "estimator &times; floor",
           "era x offset": "era &times; floor", "rule x era": "estimator &times; era", "rule x era x offset": "all three"}[k]
    ok(f"page: share {k}", re.search(rf"[ ,]{re.escape(lab)} {100 * v:.1f} %", PAGE) is not None)
ok("page: count span", f"{fmt(min(allc))} to {fmt(max(allc))}" in PAGE)
ok("page: inside count", f"{sum(5781 <= c <= 8164 for c in allc)} of the 45" in PAGE)
ok("page: below-3 climb", f"+{R['drift']['AU<3 | pooled']:.3f}" in PAGE)
ok("page: every lattice slope at +0.8 pooled", all(f"{B[(r, 'pooled', 8)]:.3f}" in PAGE for r in RULES))
ok("page: all 45 counts in table", all(f">{fmt(c)}</td>" in PAGE for c in allc))
ok("page: three predictions held", PAGE.count("<strong>held</strong>") == 3)
ok("page: figure lines", PAGE.count('<polyline class="ln') == 10)
ok("page: sources named", "arXiv:2511.04521" in PAGE and "e2020JB021027" in PAGE)

print(f"{count - len(fails)} of {count} checks passed")
for f in fails:
    print("  FAIL", f)
sys.exit(1 if fails else 0)
