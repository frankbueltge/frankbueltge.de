"""Cycle 005 s1: what 135 read frames from 44 observers can say about frames from other observers. Stdlib only, seeded.
Inputs: tortoise135.json, unseen.json (from prepare.py). Output: results.json.
Design effect: Kish deff = 1 + (b-1)rho (equal cluster sizes, equal weights); unequal sizes use b* = sum(b_c^2)/sum(b_c)
(Lynn & Gabler 2005, Survey Methodology 31(1), eq. 3 with all weights equal)."""
import json, random, math, collections
S = json.load(open("tortoise135.json"))["rows"]; U = json.load(open("unseen.json"))
Z = 1.959964
def wilson(k, n):
    if n <= 0: return (0.0, 1.0)
    p = k / n; d = 1 + Z * Z / n; c = p + Z * Z / (2 * n); h = Z * math.sqrt(p * (1 - p) / n + Z * Z / (4 * n * n))
    return ((c - h) / d, (c + h) / d)
def sizes(obs): return list(collections.Counter(obs).values())
def bbar(sz): return sum(sz) / len(sz)
def bstar(sz): return sum(b * b for b in sz) / sum(sz)
def pct(v, q): v = sorted(v); return v[min(len(v) - 1, max(0, int(round(q * (len(v) - 1)))))]
R = {}
n = len(S); k = sum(r["odd"] for r in S)
sz = sizes([r["obs"] for r in S])
R["seen"] = {"n": n, "odd": k, "observers": len(sz), "bbar": bbar(sz), "bstar": bstar(sz), "max_cluster": max(sz),
             "singletons": sum(1 for b in sz if b == 1), "wilson": wilson(k, n)}
R["seen"]["deff_at"] = {str(rho): {"kish_bbar": 1 + (R["seen"]["bbar"] - 1) * rho, "bstar": 1 + (R["seen"]["bstar"] - 1) * rho,
                                   "neff_bbar": n / (1 + (R["seen"]["bbar"] - 1) * rho), "neff_bstar": n / (1 + (R["seen"]["bstar"] - 1) * rho)}
                        for rho in (0.02, 0.05, 0.1, 0.2)}
# cluster bootstrap over observers (ratio estimator odd/n), seeded
rng = random.Random(20261007)
byobs = collections.defaultdict(list)
for r in S: byobs[r["obs"]].append(r["odd"])
cl = list(byobs.values()); C = len(cl); shares = []
for _ in range(10000):
    ks = ns = 0
    for _ in range(C):
        c = cl[rng.randrange(C)]; ks += sum(c); ns += len(c)
    shares.append(ks / ns)
R["bootstrap"] = {"draws": 10000, "lo": pct(shares, .025), "hi": pct(shares, .975), "zero_share_draws": sum(1 for s in shares if s == 0) / len(shares)}
R["bootstrap"]["inside_wilson"] = R["bootstrap"]["lo"] >= R["seen"]["wilson"][0] and R["bootstrap"]["hi"] <= R["seen"]["wilson"][1]
# permutation on the odd label: year, and number of distinct observers among the odd frames, and anova rho
yrs = [r["year"] for r in S]; lab = [r["odd"] for r in S]; obs = [r["obs"] for r in S]
def meanyr(l): return sum(y for y, t in zip(yrs, l) if t) / sum(l)
def distinct(l): return len({o for o, t in zip(obs, l) if t})
def anova_rho(l):
    g = collections.defaultdict(list)
    for o, t in zip(obs, l): g[o].append(t)
    N = len(l); Cn = len(g); m = sum(l) / N
    ssb = sum(len(v) * (sum(v) / len(v) - m) ** 2 for v in g.values()); ssw = sum(sum((t - sum(v) / len(v)) ** 2 for t in v) for v in g.values())
    msb = ssb / (Cn - 1); msw = ssw / (N - Cn); n0 = (N - sum(len(v) ** 2 for v in g.values()) / N) / (Cn - 1)
    return (msb - msw) / (msb + (n0 - 1) * msw)
obsd = {"mean_year": meanyr(lab), "distinct_obs": distinct(lab), "rho": anova_rho(lab)}
perm = [lab[:] for _ in range(1)]; my = []; ds = []; rh = []
for _ in range(10000):
    l = lab[:]; rng.shuffle(l); my.append(meanyr(l)); ds.append(distinct(l)); rh.append(anova_rho(l))
mm = sum(my) / len(my)
R["permutation"] = {"draws": 10000, "observed": obsd, "year_two_sided_p": sum(1 for v in my if abs(v - mm) >= abs(obsd["mean_year"] - mm)) / len(my),
                    "all_five_distinct_share": sum(1 for v in ds if v == 5) / len(ds),
                    "rho_range_95": [pct(rh, .025), pct(rh, .975)], "rho_ge_observed_share": sum(1 for v in rh if v >= obsd["rho"]) / len(rh),
                    "years_odd": sorted(y for y, t in zip(yrs, lab) if t), "share_2024_on_all": sum(1 for y in yrs if y >= 2024) / n}
# the unseen part
usz = sizes([r["obs"] for r in U["rows"]]); un = U["n"]
R["unseen"] = {"n": un, "observers": len(usz), "bbar": bbar(usz), "bstar": bstar(usz), "max_cluster": max(usz),
               "singletons": sum(1 for b in usz if b == 1), "bstar_over_bbar": bstar(usz) / bbar(usz),
               "licensed_not_read": U["licensed_not_read"], "with_media_total": U["with_media_total"]}
# designs for a fresh draw of 135 frames from the unseen part: expected b*, deff and half-width ratio vs independent draw
uo = [r["obs"] for r in U["rows"]]; uidx = list(range(un)); NSIM = 3000
def frames_draw():
    s = rng.sample(uidx, 135); return bstar(sizes([uo[i] for i in s]))
def observers_draw():
    ob = list(set(uo)); rng.shuffle(ob); tot = 0; chosen = []
    cnt = collections.Counter(uo)
    for o in ob:
        chosen.append(cnt[o]); tot += cnt[o]
        if tot >= 135: break
    return bstar(chosen), tot
fb = [frames_draw() for _ in range(NSIM)]; ob_ = [observers_draw() for _ in range(NSIM)]
def ratio(bs, rho): return math.sqrt(1 + (bs - 1) * rho)
fm = sum(fb) / NSIM; om = sum(x[0] for x in ob_) / NSIM; otot = sum(x[1] for x in ob_) / NSIM
R["draws"] = {"sims": NSIM, "frames": {"bstar_mean": fm, "halfwidth_ratio_at": {str(r): ratio(fm, r) for r in (0.02, 0.05, 0.1, 0.2)}},
              "observers": {"bstar_mean": om, "mean_frames": otot, "halfwidth_ratio_at": {str(r): ratio(om, r) for r in (0.02, 0.05, 0.1, 0.2)}},
              "seen135": {"bstar": R["seen"]["bstar"], "halfwidth_ratio_at": {str(r): ratio(R["seen"]["bstar"], r) for r in (0.02, 0.05, 0.1, 0.2)}}}
# predictions P1-P5 as stated in PREDICTIONS.md
neffdiff = abs(R["seen"]["deff_at"]["0.05"]["neff_bbar"] - R["seen"]["deff_at"]["0.05"]["neff_bstar"]) / R["seen"]["deff_at"]["0.05"]["neff_bstar"]
R["predictions"] = {
 "P1": {"bstar_ge_6": R["seen"]["bstar"] >= 6, "bstar_ge_2x_bbar": R["seen"]["bstar"] >= 2 * R["seen"]["bbar"], "neff_diff_at_0.05": neffdiff, "differ_ge_20pct": neffdiff >= 0.2},
 "P2": {"lower_below_wilson": R["bootstrap"]["lo"] < R["seen"]["wilson"][0], "upper_ge_8.4": R["bootstrap"]["hi"] >= 0.084, "R1_fired": R["bootstrap"]["inside_wilson"]},
 "P3": {"year_p_gt_05": R["permutation"]["year_two_sided_p"] > 0.05},
 "P4": {"bbar_lt_2": R["unseen"]["bbar"] < 2.0, "bstar_ge_1.5x": R["unseen"]["bstar_over_bbar"] >= 1.5},
 "P5": {"frames_within_1.3": R["draws"]["frames"]["halfwidth_ratio_at"]["0.05"] <= 1.3, "observers_wider_than_1.3": R["draws"]["observers"]["halfwidth_ratio_at"]["0.05"] > 1.3}}
# sweep of draw size for the page's designer: mean b* of the sample under each design
def frames_n(m): s = rng.sample(uidx, m); return bstar(sizes([uo[i] for i in s]))
def observers_n(m):
    ob = list(set(uo)); rng.shuffle(ob); tot = 0; chosen = []; cnt = collections.Counter(uo)
    for o in ob:
        chosen.append(cnt[o]); tot += cnt[o]
        if tot >= m: break
    return bstar(chosen), tot
R["sweep"] = []
for m in (50, 100, 135, 200, 300, 400, 600):
    a = [frames_n(m) for _ in range(1500)]; b = [observers_n(m) for _ in range(1500)]
    R["sweep"].append({"n": m, "frames_bstar": sum(a) / 1500, "observers_bstar": sum(x[0] for x in b) / 1500, "observers_frames": sum(x[1] for x in b) / 1500})
json.dump(R, open("results.json", "w"), indent=1, sort_keys=True)
print(json.dumps(R, indent=1, sort_keys=True))
