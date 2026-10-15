#!/usr/bin/env python3
"""Session 16 — every number on the page, by a second route.

analysis.py works on sorted lists of events. This file never builds one: it works on the
per-year histograms in fmd.json (counts per 0.01 magnitude) through cumulative sums, and
re-implements each floor technique from the handbook's text rather than importing it. It
then compares with results.json and with the printed page, and tests the page's three
refutation conditions.

    python3 check.py            # exit 0 when every check passes
"""
import json, math, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
F = json.loads((HERE / "fmd.json").read_text())
R = json.loads((HERE / sys.argv[1] if len(sys.argv) > 1 else HERE / "results.json").read_text())
PAGE = (HERE / (sys.argv[2] if len(sys.argv) > 2 else "index.html")).read_text(encoding="utf-8")
LOG10E = 1 / math.log(10)
TOP = 700   # hundredths; above every magnitude in the record

fails = []
count = 0


def ok(name, cond):
    global count
    count += 1
    if not cond:
        fails.append(name)


class Year:
    def __init__(self, d):
        self.h = [0] * (TOP + 1)
        for k, c in d["m100"].items():
            self.h[int(k)] += c
        self.cnt = [0] * (TOP + 2)      # cnt[c] = N(M >= c)
        self.sm = [0] * (TOP + 2)       # sum of m (hundredths) for M >= c
        self.sq = [0] * (TOP + 2)
        for c in range(TOP, -1, -1):
            self.cnt[c] = self.cnt[c + 1] + self.h[c]
            self.sm[c] = self.sm[c + 1] + c * self.h[c]
            self.sq[c] = self.sq[c + 1] + c * c * self.h[c]
        nz = [k for k in range(TOP + 1) if self.h[k]]
        self.lo, self.hi = nz[0], nz[-1]

    def n(self, c):
        return self.cnt[c] if c <= TOP else 0

    def b(self, c):
        return LOG10E / (self.sm[c] / self.cnt[c] / 100 - (c / 100 - 0.005))

    def maxc(self):
        bins = [sum(self.h[10 * k:10 * k + 10]) for k in range(TOP // 10 + 1)]
        return 10 * bins.index(max(bins))      # index() is the lowest on a tie

    def gft(self, level):
        for c in range(10 * (self.lo // 10), self.hi + 1, 10):
            if self.n(c) < 20:
                return None
            b, n = self.b(c), self.n(c)
            obs = [self.n(mi) for mi in range(c, self.hi + 1, 10)]
            syn = [n * 10 ** (-b * i / 10) for i in range(len(obs))]
            if 100 - 100 * sum(abs(o - s) for o, s in zip(obs, syn)) / sum(obs) >= level:
                return c
        return None

    def mbs(self):
        for c in range(10 * (self.lo // 10), self.hi + 1, 10):
            if min(self.n(c + 10 * i) for i in range(5)) < 20:
                break
            bs = [self.b(c + 10 * i) for i in range(5)]
            n = self.n(c)
            var = (self.sq[c] - self.sm[c] ** 2 / n) / 1e4          # sum of squared deviations
            db = 2.3 * bs[0] ** 2 * math.sqrt(var / (n * (n - 1)))
            if abs(sum(bs) / 5 - bs[0]) <= db:
                return c
        return self.maxc()


Y = {int(y): Year(d) for y, d in F["years"].items()}


def pooled(fl):
    s = n = 0
    for y, v in Y.items():
        c = fl[y]
        s += v.sm[c] / 100 - v.cnt[c] * (c / 100 - 0.005)
        n += v.cnt[c]
    b = LOG10E * n / s
    return b, b / math.sqrt(n), n


def total(fl, b, years=None):
    t = 0.0
    for y in (years or Y):
        v, c = Y[y], fl[y]
        w = v.n(100)
        t += 0.0 if c <= 100 else max(0.0, v.n(c) * 10 ** (b * (c - 100) / 100) - w)
    return t


def share(fl, b, years):
    w = sum(Y[y].n(100) for y in years)
    return w / (w + total(fl, b, years))


FLOORS = {
    "MAXC": {y: v.maxc() for y, v in Y.items()},
    "MAXC+0.1": {y: v.maxc() + 10 for y, v in Y.items()},
    "MAXC+0.2": {y: v.maxc() + 20 for y, v in Y.items()},
    "MAXC+0.3": {y: v.maxc() + 30 for y, v in Y.items()},
    "GFT-90": {y: v.gft(90) if v.gft(90) is not None else v.maxc() for y, v in Y.items()},
    "GFT-95": {y: next((c for c in (v.gft(95), v.gft(90)) if c is not None), v.maxc()) for y, v in Y.items()},
    "MBS": {y: v.mbs() for y, v in Y.items()},
}

# ---- the Studio reproduced ---------------------------------------------------------------
ok("record · 21 555 events", sum(v.cnt[0] for v in Y.values()) + sum(d["no_magnitude"] for d in F["years"].values()) == 21555)
ok("record · 795 without magnitude", sum(d["no_magnitude"] for d in F["years"].values()) == 795)
st = FLOORS["MAXC+0.2"]
b0, se0, n0 = pooled(st)
ok("studio · b", abs(b0 - 0.8621) < 5e-5 and abs(b0 - R["studio"]["b"]) < 5e-5)
ok("studio · se", abs(se0 - 0.0083) < 5e-5)
ok("studio · events", n0 == 10694 == R["studio"]["b_events"])
ok("studio · total 7043", round(total(st, b0)) == 7043 == R["studio"]["total"])
combos = [total({y: c + dm for y, c in st.items()}, b0 + db * se0) for db in (-2, 0, 2) for dm in (-10, 0, 10)]
ok("studio · range", [round(min(combos)), round(max(combos))] == [5781, 8164] == R["studio"]["range"])
ok("studio · written M>=1", sum(v.n(100) for v in Y.values()) == 16981 == R["written_m1_total"])

# ---- every floor technique -------------------------------------------------------------
for name, fl in FLOORS.items():
    r = R["methods"][name]
    b, se, n = pooled(fl)
    ok(f"{name} · floors", all(abs(fl[int(y)] / 100 - c) < 1e-9 for y, c in r["floors"].items()))
    ok(f"{name} · b", abs(b - r["b"]) < 5e-5)
    ok(f"{name} · events", n == r["b_events"])
    ok(f"{name} · total", abs(total(fl, b) - r["total_own_b"]) <= 1)
    ok(f"{name} · total at studio b", abs(total(fl, b0) - r["total_studio_b"]) <= 1)
    ok(f"{name} · share 1974-79", abs(share(fl, b, range(1974, 1980)) - r["share_1974_79"]) < 1e-4)
    ok(f"{name} · share 2016-25", abs(share(fl, b, range(2016, 2026)) - r["share_2016_25"]) < 1e-4)
    ok(f"{name} · years <200 above floor",
       sorted(y for y in Y if Y[y].n(fl[y]) < 200) == r["years_above_floor_lt_200"])

# ---- the scan ------------------------------------------------------------------------------
ok("scan · nine steps", [s["offset"] for s in R["scan"]] == [k / 10 for k in range(9)])
for s in R["scan"]:
    fl = {y: v.maxc() + round(s["offset"] * 100) for y, v in Y.items()}
    b, se, n = pooled(fl)
    ok(f"scan +{s['offset']} · b", abs(b - s["b"]) < 5e-5 and abs(se - s["b_se"]) < 5e-5 and n == s["b_events"])
    ok(f"scan +{s['offset']} · totals", abs(total(fl, b) - s["total_own_b"]) <= 1 and abs(total(fl, b0) - s["total_studio_b"]) <= 1)
ok("years with <200 magnitudes", sorted(y for y, v in Y.items() if v.cnt[0] < 200) == R["years_with_magnitude_lt_200"])

# ---- the refutation conditions (the page says none holds) ---------------------------------
held = [s["total_studio_b"] for s in R["scan"][3:]]
bs = [s["b"] for s in R["scan"]]
ok("condition 1 does not hold: slope-held count stops climbing above +0.3", any(b2 <= a for a, b2 in zip(held, held[1:])))
ok("condition 2 does not hold: re-estimated b rises at every step", all(b2 > a for a, b2 in zip(bs, bs[1:])))
ok("condition 3 does not hold: every floor's early share below its late one",
   all(v["share_1974_79"] < v["share_2016_25"] for v in R["methods"].values()))

# ---- the page -----------------------------------------------------------------------------
ok("page · no script", not re.search(r"<script", PAGE, re.I))
ok("page · no external reference", not re.search(r"(src|href)\s*=\s*[\"']?(https?:)?//", PAGE, re.I))
ok("page · no url() or @import", not re.search(r"url\(|@import", PAGE))
ok("page · title", "<title>The slope moves with the floor</title>" in PAGE)
g = lambda n: f"{n:,}".replace(",", " ")
for s in R["scan"]:
    ok(f"page · scan row +{s['offset']}",
       f"<td class=\"n\">{g(s['total_own_b'])}</td><td class=\"n\">{g(s['total_studio_b'])}</td>" in PAGE)
for k, v in R["methods"].items():
    ok(f"page · method row {k}", f"<td class=\"n\">{v['b']:.3f}</td><td class=\"n\">{g(v['total_own_b'])}</td>" in PAGE)
for phrase in (f"about {g(7043)}, range {g(5781)}&#8211;{g(8164)}",
               f"between <em class=\"k\">{g(min(held))} and {g(max(held))}</em>",
               f"from <em class=\"k\">{g(R['scan'][0]['total_own_b'])} to {g(R['scan'][-1]['total_own_b'])}</em>",
               f"b goes from {bs[0]:.3f} to {bs[-1]:.3f}",
               "about 10 times as far",
               "three of five", "may not overlap", "sampling range"):
    ok(f"page · says {phrase[:40]!r}", phrase in PAGE)
ok("page · 10x claim is arithmetic", round((bs[-1] - bs[0]) / (2 * R["studio"]["b_se"])) == 10)
inside = [k for k in ("MAXC", "GFT-90", "GFT-95", "MBS", "MAXC+0.2")
          if 5781 <= R["methods"][k]["total_own_b"] <= 8164]
ok("page · three of five inside", sorted(inside) == ["GFT-95", "MAXC+0.2", "MBS"])

print(f"{count - len(fails)} of {count} checks passed")
for f in fails:
    print("  FAIL", f)
sys.exit(1 if fails else 0)
