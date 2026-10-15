"""The unwritten earthquakes under Berkeley, counted by every floor the handbook offers.

Input: fmd.json (per-year magnitude counts, derived by derive.py from the Studio's record).
Output: results.json.

The Studio (BELOW THE TRACE, 2026-09-25) estimated the M >= 1.0 earthquakes within 40 km
of BK.BKS that the catalogue never wrote, 1974-2025: about 7 043, range 5 781-8 164. Its
range moves the floor it chose (maximum curvature + 0.2) by 0.1 up and down and its slope
by two standard errors. This script first reproduces that, then replaces the floor by the
other catalogue-based techniques described in Mignan & Woessner (2012), CORSSA,
doi:10.5078/corssa-00180805, §6.1-6.3, and recounts.

Every rule is written here as it is used; where the handbook leaves a detail open, the
choice made is named in a comment marked CHOICE.

Estimate, per year (the Studio's, unchanged): with floor Mc and slope b,
    unwritten = max(0, N(M >= Mc) * 10**(b*(Mc - 1.0)) - N(M >= 1.0)),  0 if Mc <= 1.0.
"""
import json, math
from pathlib import Path

HERE = Path(__file__).parent
MREF = 100          # M 1.0, in hundredths
LOG10E = math.log10(math.e)

F = json.loads((HERE / "fmd.json").read_text())
YEARS = {int(y): sorted(int(k) for k, c in d["m100"].items() for _ in range(c))
         for y, d in F["years"].items()}


def above(mags, c):
    return [m for m in mags if m >= c]


def aki_utsu(mags, c):
    """b by maximum likelihood; magnitudes are written to 0.01, so the bin correction is 0.005."""
    xs = above(mags, c)
    mean = sum(xs) / len(xs) / 100
    return LOG10E / (mean - (c / 100 - 0.005)), len(xs)


def shi_bolt(mags, c, b):
    xs = [m / 100 for m in above(mags, c)]
    n = len(xs)
    mu = sum(xs) / n
    return 2.3 * b * b * math.sqrt(sum((x - mu) ** 2 for x in xs) / (n * (n - 1)))


def maxc(mags):
    """§6.1: the most populated 0.1 bin. Bins are [k/10, (k+1)/10), lowest bin on a tie (the Studio's)."""
    bins = {}
    for m in mags:
        bins[m // 10] = bins.get(m // 10, 0) + 1
    top = max(bins.values())
    return 10 * min(k for k, v in bins.items() if v == top)


# CHOICE: every scanning technique needs at least this many events above a cutoff to test it.
NSCAN = 20


def gft(mags, level):
    """§6.2, eq. 4: first cutoff at which R >= level, R = 100 - 100*sum|B_i - S_i|/sum B_i over
    the cumulative counts B_i (observed) and S_i (G-R with the cutoff's own a and b), bins of 0.1
    from the cutoff upward. ZMAP fallback as the handbook states it: 95 -> 90 -> MAXC."""
    lo = 10 * (min(mags) // 10)
    for c in range(lo, max(mags) + 1, 10):
        n = len(above(mags, c))
        if n < NSCAN:
            break
        b, _ = aki_utsu(mags, c)
        B, S = [], []
        for mi in range(c, max(mags) + 1, 10):
            B.append(len(above(mags, mi)))
            S.append(n * 10 ** (-b * (mi - c) / 100))
        R = 100 - 100 * sum(abs(x - y) for x, y in zip(B, S)) / sum(B)
        if R >= level:
            return c, "reached"
    return None, "not reached"


def gft_chain(mags, first):
    for level in ([95, 90] if first == 95 else [90]):
        c, _ = gft(mags, level)
        if c is not None:
            return c, f"R{level}"
    return maxc(mags), "fallback MAXC"


def mbs(mags):
    """§6.3 (Cao & Gao 2002 as modified by Woessner & Wiemer 2005): first cutoff with
    |b_ave - b| <= delta_b (Shi & Bolt). CHOICE: b_ave is the mean of b at the cutoff and the
    next four 0.1 cutoffs (0.5 units, five values); every one of the five must hold NSCAN events."""
    lo = 10 * (min(mags) // 10)
    for c in range(lo, max(mags) + 1, 10):
        cs = [c + 10 * i for i in range(5)]
        if any(len(above(mags, x)) < NSCAN for x in cs):
            break
        bs = [aki_utsu(mags, x)[0] for x in cs]
        b = bs[0]
        if abs(sum(bs) / 5 - b) <= shi_bolt(mags, c, b):
            return c, "stable"
    return maxc(mags), "fallback MAXC"


FLOORS = {
    "MAXC":       lambda m: (maxc(m), ""),
    "MAXC+0.1":   lambda m: (maxc(m) + 10, ""),
    "MAXC+0.2":   lambda m: (maxc(m) + 20, ""),      # the Studio's floor
    "MAXC+0.3":   lambda m: (maxc(m) + 30, ""),
    "GFT-90":     lambda m: gft_chain(m, 90),
    "GFT-95":     lambda m: gft_chain(m, 95),
    "MBS":        mbs,
}


def pooled_b(floors):
    s = n = 0
    for y, mags in YEARS.items():
        for m in above(mags, floors[y]):
            s += m / 100 - (floors[y] / 100 - 0.005)
            n += 1
    b = LOG10E / (s / n)
    return b, b / math.sqrt(n), n


def estimate(floors, b):
    out = {}
    for y, mags in YEARS.items():
        c = floors[y]
        written = len(above(mags, MREF))
        est = written if c <= MREF else len(above(mags, c)) * 10 ** (b * (c - MREF) / 100)
        out[y] = max(0.0, est - written)
    return out


def run():
    res = {"methods": {}, "years": sorted(YEARS)}
    studio_floor = {y: maxc(m) + 20 for y, m in YEARS.items()}
    b_st, se_st, n_st = pooled_b(studio_floor)
    res["studio"] = {"b": round(b_st, 4), "b_se": round(se_st, 4), "b_events": n_st}
    combos = []
    for db in (-2, 0, 2):
        for dm in (-10, 0, 10):
            fl = {y: c + dm for y, c in studio_floor.items()}
            combos.append(sum(estimate(fl, b_st + db * se_st).values()))
    res["studio"]["total"] = round(sum(estimate(studio_floor, b_st).values()))
    res["studio"]["range"] = [round(min(combos)), round(max(combos))]

    for name, fn in FLOORS.items():
        floors, notes = {}, {}
        for y, m in YEARS.items():
            floors[y], notes[y] = fn(m)
        b, se, n = pooled_b(floors)
        own = estimate(floors, b)
        fixed = estimate(floors, b_st)
        res["methods"][name] = {
            "b": round(b, 4), "b_se": round(se, 4), "b_events": n,
            "total_own_b": round(sum(own.values())),
            "total_studio_b": round(sum(fixed.values())),
            "floors": {str(y): floors[y] / 100 for y in sorted(floors)},
            "per_year_own_b": {str(y): round(own[y]) for y in sorted(own)},
            "fallbacks": sorted(y for y, t in notes.items() if t.startswith("fallback")),
            "years_above_floor_lt_200": sorted(y for y in YEARS
                                               if len(above(YEARS[y], floors[y])) < 200),
        }
    # The floor raised step by step above maximum curvature: does the count settle?
    res["scan"] = []
    for k in range(9):
        fl = {y: maxc(m) + 10 * k for y, m in YEARS.items()}
        b, se, n = pooled_b(fl)
        res["scan"].append({"offset": k / 10, "b": round(b, 4), "b_se": round(se, 4), "b_events": n,
                            "total_own_b": round(sum(estimate(fl, b).values())),
                            "total_studio_b": round(sum(estimate(fl, b_st).values()))})
    # The page's headline shares, 1974-79 and 2016-25, under every floor.
    for name, v in res["methods"].items():
        fl = {int(y): round(c * 100) for y, c in v["floors"].items()}
        e = estimate(fl, v["b"])
        for lab, ys in (("share_1974_79", range(1974, 1980)), ("share_2016_25", range(2016, 2026))):
            w = sum(len(above(YEARS[y], MREF)) for y in ys)
            v[lab] = round(w / (w + sum(e[y] for y in ys)), 4)
    res["written_m1_total"] = sum(len(above(m, MREF)) for m in YEARS.values())
    res["years_with_magnitude_lt_200"] = sorted(y for y, m in YEARS.items() if len(m) < 200)
    return res


if __name__ == "__main__":
    r = run()
    (HERE / "results.json").write_text(json.dumps(r, indent=1) + "\n")
    print("studio reproduced:", r["studio"])
    for k, v in r["methods"].items():
        print(f"{k:10s} b={v['b']:.4f} own-b total={v['total_own_b']:6d}  studio-b total={v['total_studio_b']:6d}"
              f"  fallbacks={len(v['fallbacks'])}  years<200 above floor={len(v['years_above_floor_lt_200'])}")
