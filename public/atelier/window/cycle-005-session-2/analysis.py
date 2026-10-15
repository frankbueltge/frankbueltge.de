"""Cycle 005 s2: is the licensed lot a model of the unlicensed one, and how much may cross the licence line?
Power prior on the unlicensed rate q: Beta(0.5 + a0*k1, 0.5 + a0*(n1-k1)) from the licensed lot (Chen & Ibrahim 2000), data 0 of 135 drawn.
Stdlib only, no randomness. Inputs: ../cycle-005-session-1/tortoise135.json (licensed 135), drawn135.json. Output: results.json."""
import json, math, collections
L = json.load(open("../cycle-005-session-1/tortoise135.json"))["rows"]; D = json.load(open("drawn135.json"))["rows"]
lg = math.lgamma
def lbeta(a, b): return lg(a) + lg(b) - lg(a + b)
def bstar(obs): s = list(collections.Counter(obs).values()); return sum(b * b for b in s) / sum(s)
def neff(rows, rho): return len(rows) / (1 + (bstar([r["obs"] for r in rows]) - 1) * rho)
A0 = [i / 20 for i in range(21)]
R = {"p1": {}, "classes": {}}
R["p1"] = {"drawn_observers": len({r["obs"] for r in D}), "drawn_largest": max(collections.Counter(r["obs"] for r in D).values()),
           "shared_with_licensed": len({r["obs"] for r in D} & {r["obs"] for r in L}), "bstar_drawn": bstar([r["obs"] for r in D]),
           "bstar_licensed": bstar([r["obs"] for r in L]), "neff_drawn_05": neff(D, .05), "neff_licensed_05": neff(L, .05),
           "all_drawn_alive": all(r["reading"] == "alive" for r in D)}
def bbin_pmf_table(a, b, m, kmax):  # Beta-binomial(m; a, b) pmf for k=0..kmax
    out = []; 
    for k in range(kmax + 1):
        out.append(math.exp(lg(m + 1) - lg(k + 1) - lg(m - k + 1) + lbeta(a + k, b + m - k) - lbeta(a, b)))
    return out
def count_q(a, b, m, qs=(.025, .5, .975)):
    pm = bbin_pmf_table(a, b, m, m); c = 0; res = {}; todo = list(qs)
    for k, p in enumerate(pm):
        c += p
        while todo and c >= todo[0]: res[todo.pop(0)] = k
    for q in todo: res[q] = m
    return res
def curve(k1, n1, n2, label, discount):
    """discount: scale both lots to effective size (counts scaled by neff/n)."""
    f1 = (neff(L, .05) / len(L)) if discount else 1.0; f2 = (neff(D, .05) / len(D)) if discount else 1.0
    k1e, n1e, n2e = k1 * f1, n1 * f1, n2 * f2
    rows = []
    for a0 in A0:
        a = .5 + a0 * k1e; b = .5 + a0 * (n1e - k1e)
        p0 = math.exp(lbeta(a, b + n2e) - lbeta(a, b))
        cq = count_q(a, b + n2e, 1255)  # unread unlicensed frames; the 135 read are 0
        rows.append({"a0": a0, "pred0": p0, "q_mean": a / (a + b + n2e), "unread_count": {"lo": cq[.025], "median": cq[.5], "hi": cq[.975]}})
    return rows
R["by_k"] = {}
for k1 in range(0, 6):
    pl = curve(k1, 135, 135, "k", False); ds = curve(k1, 135, 135, "k", True)
    R["by_k"][k1] = {"ratio_plain": pl[0]["pred0"] / pl[-1]["pred0"], "ratio_discounted": ds[0]["pred0"] / ds[-1]["pred0"],
                     "pred0_a0_1": pl[-1]["pred0"], "median_unread_a0_1": pl[-1]["unread_count"]["median"], "hi_unread_a0_1": pl[-1]["unread_count"]["hi"]}
for name, k1 in (("all_odd", 5), ("bone_only", 1), ("no_animal_or_bone", 3)):
    cs = {}
    for disc in (False, True):
        cs["discounted" if disc else "plain"] = curve(k1, 135, 135, name, disc)
        r = cs["discounted" if disc else "plain"]; cs["ratio_" + ("discounted" if disc else "plain")] = r[0]["pred0"] / r[-1]["pred0"]
    R["classes"][name] = cs
# covariate shift on year: licensed odd rate by 2024-on vs earlier; expected odd in the draw at the drawn year mix
yo = collections.defaultdict(lambda: [0, 0])
for r in L: g = int(r["year"] >= 2024); yo[g][0] += r["odd"]; yo[g][1] += 1
dn24 = sum(1 for r in D if r["year"] >= 2024); dp = len(D) - dn24
R["year"] = {"licensed_by_2024_on": {"k_on": yo[1][0], "n_on": yo[1][1], "k_pre": yo[0][0], "n_pre": yo[0][1]},
             "drawn_on": dn24, "drawn_pre": dp,
             "expected_raw": 135 * 5 / 135, "expected_reweighted": dn24 * yo[1][0] / yo[1][1] + dp * yo[0][0] / yo[0][1]}
R["year"]["change"] = R["year"]["expected_reweighted"] / R["year"]["expected_raw"] - 1
# two-sided Fisher 5/135 vs 0/135 as a check of the Studio's figure
def hyp(k, K, n, N): return math.exp(lg(K + 1) - lg(k + 1) - lg(K - k + 1) + lg(N - K + 1) - lg(n - k + 1) - lg(N - K - n + k + 1) - (lg(N + 1) - lg(n + 1) - lg(N - n + 1)))
tot = 270; K = 5; pobs = hyp(0, K, 135, tot)
R["fisher_5v0_two_sided"] = sum(p for p in (hyp(k, K, 135, tot) for k in range(0, 6)) if p <= pobs + 1e-12)
# where the evidence changes: smallest a0 at which predictive P(0) falls under half of its a0=0 value, per class (plain)
for name, cs in R["classes"].items():
    base = cs["plain"][0]["pred0"]; cs["a0_half"] = next((r["a0"] for r in cs["plain"] if r["pred0"] <= base / 2), None)
json.dump(R, open("results.json", "w"), indent=1, sort_keys=True)
a = R["classes"]["all_odd"]
print(json.dumps(R["p1"], indent=1)); print("year", R["year"]); print({k:(round(v["ratio_plain"],3),round(v["ratio_discounted"],3)) for k,v in R["by_k"].items()}); print("fisher", R["fisher_5v0_two_sided"])
for n_, c in R["classes"].items():
    print(n_, "ratio plain %.3f discounted %.3f a0_half %s" % (c["ratio_plain"], c["ratio_discounted"], c["a0_half"]))
    for i in (0, 10, 20): print("  a0", c["plain"][i]["a0"], "pred0 %.4f" % c["plain"][i]["pred0"], c["plain"][i]["unread_count"], "qmean %.4f" % c["plain"][i]["q_mean"])
