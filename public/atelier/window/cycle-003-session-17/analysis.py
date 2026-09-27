"""Is the slope's climb one choice, or an interaction? — the Field's question of 2026-09-27.

Input: seq.json (derive.py). Output: results.json.

Session 16 found that re-estimating the Gutenberg-Richter slope b at each completeness floor
makes it climb at every step (0.816 -> 0.989 from maximum curvature +0.0 to +0.8), and the
Studio's count of unwritten earthquakes with it. It left open why. Tonight the floor offset is
crossed with the other choices a slope depends on, all at once, and the climb is decomposed.

Factors (a full lattice, 5 x 3 x 9 = 135 cells):
  rule    how b is estimated
          AU        Aki-Utsu maximum likelihood, bin correction 0.005 (the Studio's, session 16's)
          AU<3      the same, fitted only below M 3.0 with the truncated-exponential likelihood:
                    below 3.0 the record is almost all one magnitude type (Md), above it ML/Mw
          b+ .01, b+ .1, b+ .3
                    b-positive (van der Elst 2021, as described in SeismoStats, arXiv:2511.04521
                    §3.2): differences between consecutive magnitudes, kept when >= a threshold,
                    fed to the classical estimator. CHOICE: three thresholds — one bin (0.01,
                    that package's default), 0.1 and 0.3. CHOICE, following the same text
                    ("considering only the complete catalog ... before taking the differences"):
                    only events at or above their year's floor enter the sequence.
  era     pooled 1974-2025 | 1974-99 | 2000-25
  offset  floor = the year's maximum-curvature bin + 0.0 ... 0.8 (the session-16 scan)

Count (the Studio's, unchanged): unwritten(year) = max(0, N(M>=Mc)*10**(b*(Mc-1.0)) - N(M>=1.0)).
"""
import json, math
from pathlib import Path

HERE = Path(__file__).parent
LOG10E = math.log10(math.e)
SEQ = [(y, m, t) for y, m, t in json.loads((HERE / "seq.json").read_text())["events"]]
YEARS = sorted({y for y, _, _ in SEQ})
BY = {y: [m for yy, m, _ in SEQ if yy == y] for y in YEARS}
ERAS = {"pooled": (1974, 2025), "1974-99": (1974, 1999), "2000-25": (2000, 2025)}
RULES = ["AU", "AU<3", "b+ .01", "b+ .1", "b+ .3"]
OFFSETS = list(range(9))            # tenths
TOPM = 300                          # the scale boundary, hundredths


def maxc(ms):
    bins = {}
    for m in ms:
        bins[m // 10] = bins.get(m // 10, 0) + 1
    top = max(bins.values())
    return 10 * min(k for k, v in bins.items() if v == top)


MC = {y: maxc(BY[y]) for y in YEARS}


def kept(era, k):
    a, b = ERAS[era]
    return [(m, MC[y] + 10 * k) for y, m, _ in SEQ if a <= y <= b and m >= MC[y] + 10 * k]


def b_au(xs):
    s = sum(m / 100 - (f / 100 - 0.005) for m, f in xs)
    b = LOG10E / (s / len(xs))
    return b, len(xs)


def b_au_trunc(xs):
    """Truncated exponential on [f - 0.005, 2.995): solve mean(x) = 1/B - W/(exp(BW) - 1) per
    event (each event carries its own year's floor, so its own W), by bisection on B."""
    xs = [(m / 100 - (f / 100 - 0.005), TOPM / 100 - 0.005 - (f / 100 - 0.005))
          for m, f in xs if m < TOPM]
    def score(B):   # derivative of the log-likelihood, decreasing in B
        return sum(1 / B - W / math.expm1(B * W) - x for x, W in xs)
    lo, hi = 0.05, 20.0
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if score(mid) > 0 else (lo, mid)
    return (lo + hi) / 2 * LOG10E, len(xs)


def b_pos(xs, dmc):
    seq = [m for m, _ in xs]
    d = [q - p for p, q in zip(seq, seq[1:]) if q - p >= dmc]
    b = LOG10E / (sum(d) / len(d) / 100 - (dmc / 100 - 0.005))
    return b, len(d)


def slope(rule, xs):
    if rule == "AU":
        return b_au(xs)
    if rule == "AU<3":
        return b_au_trunc(xs)
    return b_pos(xs, {"b+ .01": 1, "b+ .1": 10, "b+ .3": 30}[rule])


def count(k, b):
    out = {}
    for y in YEARS:
        c = MC[y] + 10 * k
        w = sum(1 for m in BY[y] if m >= 100)
        est = w if c <= 100 else sum(1 for m in BY[y] if m >= c) * 10 ** (b * (c - 100) / 100)
        out[y] = max(0.0, est - w)
    return out


def share(e, ys):
    w = sum(sum(1 for m in BY[y] if m >= 100) for y in ys)
    return w / (w + sum(e[y] for y in ys))


def anova(cell):
    """Balanced three-way decomposition of the sum of squares of b over the lattice."""
    F = {"rule": RULES, "era": list(ERAS), "offset": OFFSETS}
    keys = list(F)
    vals = [cell[(r, e, k)] for r in RULES for e in ERAS for k in OFFSETS]
    g = sum(vals) / len(vals)
    tot = sum((v - g) ** 2 for v in vals)
    def mean_over(fix):
        grp = {}
        for (r, e, k), v in cell.items():
            key = tuple({"rule": r, "era": e, "offset": k}[f] for f in fix)
            grp.setdefault(key, []).append(v)
        return {kk: sum(v) / len(v) for kk, v in grp.items()}
    m1 = {f: mean_over([f]) for f in keys}
    ss = {}
    for f in keys:
        ss[f] = sum((m1[f][(lvl,)] - g) ** 2 for lvl in F[f]) * len(vals) / len(F[f])
    for i, f1 in enumerate(keys):
        for f2 in keys[i + 1:]:
            m2 = mean_over([f1, f2])
            s = 0
            for (a, b_), v in m2.items():
                s += (v - m1[f1][(a,)] - m1[f2][(b_,)] + g) ** 2
            ss[f"{f1} x {f2}"] = s * len(vals) / len(m2)
    ss["rule x era x offset"] = tot - sum(ss.values())
    return {k: round(v / tot, 4) for k, v in ss.items()}, round(tot, 6)


def run():
    cell, n, out = {}, {}, {"lattice": []}
    for r in RULES:
        for e in ERAS:
            for k in OFFSETS:
                b, nn = slope(r, kept(e, k))
                cell[(r, e, k)] = b
                out["lattice"].append({"rule": r, "era": e, "offset": k / 10, "b": round(b, 4),
                                       "n": nn, "se": round(b / math.sqrt(nn), 4)})
    out["drift"] = {f"{r} | {e}": round(cell[(r, e, 8)] - cell[(r, e, 0)], 4)
                    for r in RULES for e in ERAS}
    out["share_of_variance"], out["total_ss"] = anova(cell)
    # counts and shares under each rule, pooled slope, the Studio's formula
    out["counts"] = {}
    for r in RULES:
        rows = []
        for k in OFFSETS:
            e = count(k, cell[(r, "pooled", k)])
            rows.append({"offset": k / 10, "b": round(cell[(r, "pooled", k)], 4),
                         "total": round(sum(e.values())),
                         "share_1974_79": round(share(e, range(1974, 1980)), 4),
                         "share_2016_25": round(share(e, range(2016, 2026)), 4)})
        out["counts"][r] = rows
    out["studio_range"] = [5781, 8164]
    out["studio_total"] = 7043
    out["types_by_band"] = {}
    for y, m, t in SEQ:
        band = "M<3.0" if m < TOPM else "M>=3.0"
        d = out["types_by_band"].setdefault(band, {})
        d[t] = d.get(t, 0) + 1
    out["events"] = len(SEQ)
    return out


if __name__ == "__main__":
    R = run()
    (HERE / "results.json").write_text(json.dumps(R, indent=1) + "\n")
    for k, v in R["drift"].items():
        print(f"drift {k:22s} {v:+.3f}")
    print("share of variance", R["share_of_variance"])
    for r, rows in R["counts"].items():
        print(r, [x["total"] for x in rows], [(x["share_1974_79"], x["share_2016_25"]) for x in rows][2])
    print(R["types_by_band"])
