"""Session 184: what a further random read buys the joined interval. Stdlib only, seeded.
Run from the repository root: python3 -I artifacts/2026-10-07-what-the-next-read-buys/analyse.py"""
import json, math, random
A = "artifacts/2026-10-07-what-the-next-read-buys/"
OLD = json.load(open("artifacts/2026-10-07-the-draw-and-the-whole/data/results.json"))
AT = json.load(open("artifacts/2026-10-07-the-draw-and-the-whole/data/atelier-results-2026-10-07.json"))
ATP = json.load(open(A + "data/atelier-power-2026-10-07.json"))
NL, NU = OLD["licensed_ours"], OLD["other_ours"]          # 138, 1397 frames in the two classes
bL, bU = AT["draws"]["seen135"]["bstar"], OLD["draw_bstar"]  # observer-cluster design factors

# ---- P1: the Atelier's rule, run again from the definitions in its docstring
lg = math.lgamma
def lbeta(a, b): return lg(a) + lg(b) - lg(a + b)
def lpred(k1, n1, a0, j, m):
    a = .5 + a0 * k1; b = .5 + a0 * (n1 - k1)
    return lbeta(a + j, b + m - j) - lbeta(a, b)
def ratio(k1, n1, j, m): return math.exp(lpred(k1, n1, 0, j, m) - lpred(k1, n1, 1, j, m))
def binom_pmf(j, m, q):
    if q == 0: return 1.0 if j == 0 else 0.0
    return math.exp(lg(m + 1) - lg(j + 1) - lg(m - j + 1) + j * math.log(q) + (m - j) * math.log(1 - q))
def power(k, e, q, thr=3):
    ps = pl = 0.0
    for j in range(e + 1):
        pj = binom_pmf(j, e, q)
        if pj < 1e-12: continue
        r = ratio(k, 135, j, 135 + e)
        if r >= thr: ps += pj
        if r <= 1 / thr: pl += pj
    return ps, pl
def need(k, f, thr=3):
    for m in range(135, 5000):
        if f(m) >= thr: return m
f1, f2 = ATP["f1"], ATP["f2"]
res = {}
cell1 = power(4, 100, 0.03)[1]; cell2 = power(4, 200, 0.004)[0]
need_plain = need(4, lambda m: ratio(4, 135, 0, m)); need_disc = need(4, lambda m: ratio(4 * f1, 135 * f1, 0, m * f2))
res["P1"] = {"one_pop_q03_e100": cell1, "atelier": 0.8053778719536685, "strangers_q004_e200": cell2, "atelier2": 0.448608692780597,
             "need_plain": need_plain, "need_discounted": need_disc,
             "pass": abs(cell1 - .8054) < .005 and abs(cell2 - .4486) < .005 and need_plain == 219 and need_disc == 261}

# ---- the Field's question: the joined interval after e further reads from the unread class
def bdraw(r, k, n): return r.betavariate(.5 + k, .5 + n - k)
def joined(kL, kU, nU, rho, drop_L=False, seed=1, sims=6000):
    r = random.Random(seed)
    eL, eU = 135 / (1 + (bL - 1) * rho), nU / (1 + (bU - 1) * rho)
    out = sorted((0 if drop_L else NL * bdraw(r, kL * eL / 135, eL)) / (NL + NU) + NU * bdraw(r, kU * eU / nU, eU) / (NL + NU) for _ in range(sims))
    return [out[int(.025 * sims)], out[sims // 2], out[int(.975 * sims) - 1]]
ES = [0, 50, 100, 200, 400, 750, 1262]; QS = [0.0, 0.004, 0.015, 0.03]; RHOS = [0.05, 0.28]
def draw_j(r, e, q): return sum(1 for _ in range(e) if r.random() < q)
grid = {}
for rho in RHOS:
    for q in QS:
        for e in ES:
            rr = random.Random(hash((rho, q, e)) & 0xffff or 7)
            reps = 1 if q == 0 else 40   # q=0: j is always 0, so one run is exact
            los, his, ws = [], [], []
            for i in range(reps):
                j = draw_j(rr, e, q)
                lo, md, hi = joined(4, j, 135 + e, rho, seed=11 + i)
                los.append(lo); his.append(hi)
            grid["rho=%s|q=%s|e=%d" % (rho, q, e)] = {"lo": sum(los) / reps, "hi": sum(his) / reps, "hi_sd": (sum((x - sum(his) / reps) ** 2 for x in his) / reps) ** .5}
res["grid"] = grid
g = lambda rho, q, e: grid["rho=%s|q=%s|e=%d" % (rho, q, e)]
now = joined(4, 0, 135, 0.05)
res["now"] = now
res["P2"] = {"hi_e1262_q0": g(.05, 0.0, 1262)["hi"], "pass": .005 <= g(.05, 0.0, 1262)["hi"] <= .010}
res["P3"] = {"hi_e100_q0": g(.05, 0.0, 100)["hi"], "pass": .010 <= g(.05, 0.0, 100)["hi"] <= .016}
res["P4"] = {"lo_e400_q03": g(.05, 0.03, 400)["lo"], "lo_now": now[0], "pass": g(.05, 0.03, 400)["lo"] > .005}
zero = joined(4, 0, 135 + 1262, 0.05, drop_L=True)[2]; full = g(.05, 0.0, 1262)["hi"]
res["P5"] = {"hi_full": full, "hi_licensed_zeroed": zero, "licensed_share_of_upper": 1 - zero / full, "pass": zero < full / 2}
mono = all(g(r_, 0.0, ES[i + 1])["hi"] <= g(r_, 0.0, ES[i])["hi"] + 1e-9 for r_ in RHOS for i in range(len(ES) - 1))
res["P6"] = {"pass": mono}
json.dump(res, open(A + "data/results.json", "w"), indent=1)
for k in ("P1", "P2", "P3", "P4", "P5", "P6"): print(k, res[k])
print("now", now)
