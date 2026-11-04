"""Study 30 checks. A second code path re-picks "stated least by H", rebuilds the merged band rates and recomputes
A_c and A_sc for all picks, the picks with hindsight and the picks at H at 12, 24 and 48 h. Two kinds of simulated
world test the measure itself: in calibrated worlds (every cell true with p times its band rate, independently)
A_sc reads about 1; in planted-hindsight worlds (the same, but every version written after a hit in an earlier
version's week states three times more) A_sc of the picks with hindsight reads well above 1, so the measure can
see what it claims to see. Exits non-zero on any failure; counts what it ran and must run what it declares."""
import json, csv, random, sys
DECLARED = 17
ran, failed = [], []
def check(name, cond):
    ran.append(name); print(("PASS " if cond else "FAIL ") + name)
    if not cond: failed.append(name)

LAGS = (0, 6, 12, 24, 48, 96, 168, 336, 720)
res = json.load(open("data/results_30.json"))
with open("data/lagged_cells_25.tsv", newline="") as fh:
    T = [(r["id"], int(r["lag"]), float(r["p"]), int(r["hit"])) for r in csv.DictReader(fh, delimiter="\t")]
have = {}
for i, l, *_ in T: have.setdefault(i, set()).add(l)
ids = sorted(i for i, s in have.items() if s >= set(LAGS)); S = set(ids)
T = [t for t in T if t[0] in S]
check("232 sequences in the common set", len(ids) == 232)

def band(p):                                   # explicit comparisons, not a sum of booleans
    if p < 0.01: return 0
    if p < 0.03: return 1
    if p < 0.1: return 2
    if p < 0.3: return 3
    return 4

def rates(rows):
    """Merged band rate per (lag, band): groups stating < 2 merge into the next lower band, the lowest upward."""
    o, e = {}, {}
    for i, l, p, h in rows:
        k = (l, band(p)); o[k] = o.get(k, 0) + h; e[k] = e.get(k, 0.0) + p
    r, clock = {}, {}
    for l in LAGS:
        grp = [{"b": [b], "o": o.get((l, b), 0), "e": e.get((l, b), 0.0)} for b in range(5)]
        while len(grp) > 1:
            k = next((n for n, g in enumerate(grp) if g["e"] < 2), None)
            if k is None: break
            t = grp[k - 1] if k else grp[1]
            t["b"] += grp[k]["b"]; t["o"] += grp[k]["o"]; t["e"] += grp[k]["e"]; grp.pop(k)
        for g in grp:
            for b in g["b"]: r[(l, b)] = g["o"] / g["e"] if g["e"] else 1.0
        clock[l] = sum(g["o"] for g in grp) / sum(g["e"] for g in grp)
    return r, clock

def picks(rows, H):
    v = {}
    for i, l, p, h in rows:
        if l <= H: v[(i, l)] = v.get((i, l), 0.0) + p
    return {i: min((l for l in LAGS if l <= H), key=lambda l: (v[(i, l)], l)) for i in ids}

def ratios(rows, H, which):
    r, clock = rates(rows); pk = picks(rows, H)
    keep = {i for i in ids if which == "all" or (which == "hindsight") == (pk[i] < H)}
    o = sc = c = 0.0
    for i, l, p, h in rows:
        if i in keep and l == pk[i]: o += h; sc += p * r[(l, band(p))]; c += p * clock[l]
    return o, o / sc, o / c, len(keep)

for H in (12, 24, 48):
    for which in ("all", "hindsight", "at_H"):
        o, sc, c, n = ratios(T, H, which); R = res["least_by_H"][f"{H}h"][which]
        check(f"{H} h, {which}: {n} picks, {int(o)} observed, A_sc {sc:.3f}, A_c {c:.3f}",
              n == R["n"] and o == R["observed"] and abs(sc - R["A_sc"]) < 0.0006 and abs(c - R["A_c"]) < 0.0006)

def world(rng, plant):
    """Cells true with p times the record's band rate; with plant, later versions after a hit state 3x more."""
    r, _ = rates(T); hit_by = {}; out = []
    for i, l, p, h in sorted(T, key=lambda t: (t[0], t[1])):
        if plant and any(a < l and l - a < 168 for a in hit_by.get(i, ())): p = min(0.99, 3 * p)
        x = 1 if rng.random() < min(1.0, p * r[(l, band(p))]) else 0
        if x: hit_by.setdefault(i, set()).add(l)
        out.append((i, l, p, x))
    return out

rng = random.Random(30)
for plant in (False, True):
    acc = {(H, w): [] for H in (12, 24, 48) for w in ("all", "hindsight")}
    for _ in range(60):
        W = world(rng, plant)
        for H in (12, 24, 48):
            for w in ("all", "hindsight"): acc[H, w].append(ratios(W, H, w)[1])
    for H in (12, 24, 48):
        m = sum(acc[H, "hindsight"]) / 60
        if plant: check(f"planted-hindsight worlds, {H} h: picks with hindsight read {m:.2f} (> 1.2)", m > 1.2)
        else:
            a = sum(acc[H, "all"]) / 60
            check(f"calibrated worlds, {H} h: all picks read {a:.2f} (0.9-1.1)", 0.9 <= a <= 1.1)

check("the analysis reports its own calibrated worlds within 0.9-1.1", res["calibrated_worlds"]["within_0.9_1.1"])
print(f"{len(ran) - len(failed)} of {len(ran)} checks passed")
if len(ran) != DECLARED: print(f"FAIL ran {len(ran)} checks, declared {DECLARED}"); sys.exit(1)
sys.exit(1 if failed else 0)
