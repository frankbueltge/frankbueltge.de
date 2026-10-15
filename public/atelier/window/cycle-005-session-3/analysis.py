"""Cycle 005 s3: with the licensed odd count settled (Studio's re-read), what did the draw decide and how many further reads would?
Power prior on the unlicensed rate q: Beta(0.5 + a0*k1, 0.5 + a0*(n1-k1)); data: j odd in m pooled unlicensed frames.
ratio = predictive(a0=0) / predictive(a0=1); above 1 favours separate lots, below 1 a shared lot. Stdlib only. Output: results.json."""
import json, math, collections
L = json.load(open("../cycle-005-session-1/tortoise135.json"))["rows"]
D = json.load(open("../cycle-005-session-2/drawn135.json"))["rows"]
lg = math.lgamma
def lbeta(a, b): return lg(a) + lg(b) - lg(a + b)
def bstar(obs): s = list(collections.Counter(obs).values()); return sum(b * b for b in s) / sum(s)
def neff(rows, rho): return len(rows) / (1 + (bstar([r["obs"] for r in rows]) - 1) * rho)
def lpred(k1, n1, a0, j, m):  # log P(j of m | power prior), binomial coefficient dropped (cancels in the ratio)
    a = .5 + a0 * k1; b = .5 + a0 * (n1 - k1)
    return lbeta(a + j, b + m - j) - lbeta(a, b)
def ratio(k1, n1, j, m): return math.exp(lpred(k1, n1, 0, j, m) - lpred(k1, n1, 1, j, m))
f1 = neff(L, .05) / len(L); f2 = neff(D, .05) / len(D)
def ratio_d(k1, j, m): return ratio(k1 * f1, 135 * f1, j * f2, m * f2)
CASES = {"all_odd_4": 4, "bone_1": 1, "bone_2_second_reader": 2, "all_odd_5_session2": 5}
R = {"licensed_odd": sum(r["odd"] for r in L), "f1": f1, "f2": f2, "draw": {}, "need": {}, "table": {}}
R["licensed_odd_in_file"] = R.pop("licensed_odd")
for name, k in CASES.items():
    R["draw"][name] = {"plain": ratio(k, 135, 0, 135), "discounted": ratio_d(k, 0, 135)}
def need(k, target, fn):  # smallest pooled m (>=135) at zero events with ratio >= target
    for m in range(135, 5000):
        if fn(k, m) >= target: return m
for name, k in CASES.items():
    R["need"][name] = {"plain": {t: need(k, t, lambda k_, m: ratio(k_, 135, 0, m)) for t in (3, 10)},
                       "discounted": {t: need(k, t, lambda k_, m: ratio_d(k_, 0, m)) for t in (3, 10)}}
for name in ("all_odd_4", "bone_2_second_reader"):
    k = CASES[name]
    R["table"][name] = {str(j): [{"extra": e, "ratio": ratio(k, 135, j, 135 + e)} for e in range(0, 601, 25)] for j in range(0, 5)}
R["one_in_100"] = {"all_odd_4": ratio(4, 135, 1, 235), "discounted": ratio_d(4, 1, 235)}
R["checks"] = {"fisher_4v0_two_sided": None}
def hyp(k, K, n, N): return math.exp(lg(K + 1) - lg(k + 1) - lg(K - k + 1) + lg(N - K + 1) - lg(n - k + 1) - lg(N - K - n + k + 1) - (lg(N + 1) - lg(n + 1) - lg(N - n + 1)))
po = hyp(0, 4, 135, 270); R["checks"]["fisher_4v0_two_sided"] = sum(p for p in (hyp(k, 4, 135, 270) for k in range(5)) if p <= po + 1e-12)

def binom(j, m, q): return math.exp(lg(m + 1) - lg(j + 1) - lg(m - j + 1) + (j * math.log(q) if j else 0) + ((m - j) * math.log(1 - q) if m > j else 0))
# power: for a further read of e frames from the 1,255 unread, chance the pooled ratio reaches 3x for strangers or 3x for one population, if the true rate is q
R["power"] = {}
for name in ("all_odd_4", "bone_2_second_reader"):
    k = CASES[name]; R["power"][name] = {}
    for q in (0.0, 0.004, 0.015, 0.03):
        row = []
        for e in (50, 100, 200, 400, 750):
            ps = pl = 0.0
            for j in range(e + 1):
                pj = binom(j, e, q) if q > 0 else (1.0 if j == 0 else 0.0)
                if pj < 1e-12: continue
                r = ratio(k, 135, j, 135 + e)
                if r >= 3: ps += pj
                if r <= 1 / 3: pl += pj
            row.append({"extra": e, "p_strangers_3x": ps, "p_one_population_3x": pl})
        R["power"][name][str(q)] = row
json.dump(R, open("results.json", "w"), indent=1, sort_keys=True)
print("odd in file", R["licensed_odd_in_file"], "f1 %.3f f2 %.3f" % (f1, f2))
for n_, v in R["draw"].items(): print(n_, "draw ratio plain %.3f disc %.3f" % (v["plain"], v["discounted"]), "need", R["need"][n_])
print("one in 100 more:", R["one_in_100"]); print("fisher 4v0", R["checks"]["fisher_4v0_two_sided"])
for q, row in R["power"]["all_odd_4"].items(): print("k=4 true q", q, [(r["extra"], round(r["p_strangers_3x"], 2), round(r["p_one_population_3x"], 2)) for r in row])
