"""Cycle 005 s4: what one open call is worth, in frames. Same model as s3 (power prior on the unlicensed odd rate, Jeffreys base,
Chen & Ibrahim 2000 via abstract). For each licensed odd count k (1..6): the draw's factor (0 of 135), the pooled size needed for 3x/10x for
separate lots at zero further odd frames, plain and cluster-discounted. Joined with the Field's five-call interval table (rho 0.05).
Stdlib only. Output: results.json."""
import json, math, collections
L = json.load(open("../cycle-005-session-1/tortoise135.json"))["rows"]
D = json.load(open("../cycle-005-session-2/drawn135.json"))["rows"]
lg = math.lgamma
def lbeta(a, b): return lg(a) + lg(b) - lg(a + b)
def bstar(obs): s = list(collections.Counter(obs).values()); return sum(b * b for b in s) / sum(s)
def neff(rows, rho): return len(rows) / (1 + (bstar([r["obs"] for r in rows]) - 1) * rho)
def lpred(k1, n1, a0, j, m): a = .5 + a0 * k1; b = .5 + a0 * (n1 - k1); return lbeta(a + j, b + m - j) - lbeta(a, b)
def ratio(k1, n1, j, m): return math.exp(lpred(k1, n1, 0, j, m) - lpred(k1, n1, 1, j, m))
f1 = neff(L, .05) / len(L); f2 = neff(D, .05) / len(D)
def ratio_d(k1, j, m): return ratio(k1 * f1, 135 * f1, j * f2, m * f2)
def need(fn, t):
    for m in range(135, 6000):
        if fn(m) >= t: return m
# the Field's joined "not living" interval over the licensed + drawn records, rho 0.05: [lo, point, hi] as printed in its results.json
FIELD = {"both alive": (3, 1, [0.000948694152158685, 0.00435926254569682, 0.02044677349352904]),
         "mud none, B15 alive": (4, 1, [0.001355025345994355, 0.005070081758854998, 0.021258435594609153]),
         "mud alive, B15 none": (4, 1, [0.001355025345994355, 0.005070081758854998, 0.021258435594609153]),
         "both none": (5, 1, [0.0017777539456312452, 0.005772383797275689, 0.021938724240154604]),
         "mud a bone, B15 none": (5, 2, [0.0017777539456312452, 0.005772383797275689, 0.021938724240154604])}
R = {"f1": f1, "f2": f2, "k": {}, "field": {}, "source_field": "field-research: artifacts/2026-10-07-the-count-corrected/data/results.json (scenarios, rho0.05 non_living)"}
for k in range(1, 7):
    R["k"][str(k)] = {"plain": ratio(k, 135, 0, 135), "discounted": ratio_d(k, 0, 135),
        "need3": need(lambda m: ratio(k, 135, 0, m), 3), "need10": need(lambda m: ratio(k, 135, 0, m), 10),
        "need3_d": need(lambda m: ratio_d(k, 0, m), 3), "need10_d": need(lambda m: ratio_d(k, 0, m), 10)}
for name, (k, bone, iv) in FIELD.items():
    R["field"][name] = {"k": k, "bone": bone, "interval": iv, "plain": R["k"][str(k)]["plain"], "need3": R["k"][str(k)]["need3"]}
json.dump(R, open("results.json", "w"), indent=1, sort_keys=True)
for k, v in R["k"].items(): print(k, {a: (round(b, 3) if isinstance(b, float) else b) for a, b in v.items()})
for n, v in R["field"].items(): print(n, v["k"], round(v["plain"], 4), v["need3"])
