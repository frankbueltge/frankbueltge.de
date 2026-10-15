"""Session 182 analysis. Seeded, deterministic. Run from the repository root."""
import json, random, collections, math
H = "artifacts/2026-10-07-how-many-sightings-of-the-gone/data/"
D = "artifacts/2026-10-07-the-draw-and-the-whole/data/"
R = json.load(open(H + "records.json"))["records"]
RD = json.load(open(D + "studio-reading-2026-10-07.json"))["rows"]
SR = json.load(open(D + "studio-results-2026-10-07.json"))
AT = json.load(open(D + "atelier-results-2026-10-07.json"))
OPEN = ("http://creativecommons.org/publicdomain/zero/1.0/", "http://creativecommons.org/licenses/by/4.0/")
tort = [r for r in R if str(r["speciesKey"]) == "9527499" and r["nmedia"] > 0]
def lic(r): return bool(r["media_licenses"]) and all(l in OPEN for l in r["media_licenses"])
L = [r for r in tort if lic(r)]; O = [r for r in tort if not lic(r)]
byk = {r["key"]: r for r in tort}
res = {"tortoise_with_media": len(tort), "licensed_ours": len(L), "other_ours": len(O)}
# C1
keys = [x["key"] for x in RD]
res["C1"] = {"readings": len(keys), "distinct_keys": len(set(keys)), "in_our_table": sum(k in byk for k in keys),
             "in_our_licensed": sum(k in byk and lic(byk[k]) for k in keys),
             "not_in_table": [k for k in keys if k not in byk]}
drawn = [byk[k] for k in keys if k in byk]
res["C1"]["pass"] = res["C1"]["in_our_table"] == 135 and res["C1"]["in_our_licensed"] == 0
def day(r): return (r["eventDate"] or "")[:10]
def ob(r, i): return r["recordedBy"] or "__none__%d" % i
# C2
rng = random.Random(20261007)
dobs = len({ob(r, i) for i, r in enumerate(drawn)})
lab = [ob(r, i) for i, r in enumerate(O)]
sims = sorted(len({lab[i] for i in rng.sample(range(len(O)), 135)}) for _ in range(10000))
years = sorted({r["year"] for r in tort if r["year"]})
def chi(a, b):
    ca = collections.Counter(r["year"] for r in a); cb = collections.Counter(r["year"] for r in b); s = 0
    na, nb = len(a), len(b)
    for y in years:
        t = ca[y] + cb[y]
        if t == 0: continue
        ea, eb = t * na / (na + nb), t * nb / (na + nb)
        s += (ca[y] - ea) ** 2 / ea + (cb[y] - eb) ** 2 / eb
    return s
dk = {r["key"] for r in drawn}; rest = [r for r in O if r["key"] not in dk]
real = chi(drawn, rest); ge = 0
for _ in range(10000):
    s = rng.sample(range(len(O)), 135); ss = set(s)
    ge += chi([O[i] for i in s], [O[i] for i in range(len(O)) if i not in ss]) >= real
ds = collections.Counter(r["datasetKey"] for r in drawn); do = collections.Counter(r["datasetKey"] for r in O)
res["C2"] = {"drawn_observers": dobs, "null_median": sims[5000], "null_95": [sims[249], sims[9749]],
             "obs_inside": sims[249] <= dobs <= sims[9749], "year_chi2": round(real, 2), "year_perm_p": (ge + 1) / 10001,
             "drawn_share_2024_on": sum(1 for r in drawn if r["year"] >= 2024) / 135,
             "other_share_2024_on": sum(1 for r in O if r["year"] >= 2024) / len(O),
             "drawn_dataset_share": {k: round(v / 135, 3) for k, v in ds.most_common(3)},
             "other_dataset_share": {k: round(v / len(O), 3) for k, v in do.most_common(3)}}
res["C2"]["pass"] = res["C2"]["obs_inside"] and res["C2"]["year_perm_p"] > 0.05
# C3: units of the draw
u = {(ob(r, i), day(r)) for i, r in enumerate(drawn)}
cl = collections.Counter(ob(r, i) for i, r in enumerate(drawn))
res["C3"] = {"observer_day_units": len(u), "observers": len(cl), "largest_observer": cl.most_common(1)[0][1],
             "pass": len(u) >= 125, "studio_reported_observers": SR["drawn_observers"],
             "atelier_unlicensed_observers": 777, "our_other_observers": len({ob(r, i) for i, r in enumerate(O)})}
# design effect with the draw's own cluster sizes (observer clusters): b* = sum m^2 / sum m
m = list(cl.values()); bstar = sum(x * x for x in m) / sum(m)
res["draw_bstar"] = bstar
# C4/C7: joined posterior (Jeffreys) with effective n = n / (1 + (b*-1) rho)
def beta_draw(r, k, n): return r.betavariate(0.5 + k, 0.5 + n - k)
def joined(kL, nL, kU, nU, rho, NL, NU, drop_L=False, seed=1, sims=40000):
    r = random.Random(seed)
    deffL = 1 + (AT["draws"]["seen135"]["bstar"] - 1) * rho; deffU = 1 + (bstar - 1) * rho
    eL, eU = nL / deffL, nU / deffU
    out = []
    for _ in range(sims):
        pL = 0.0 if drop_L else beta_draw(r, kL * eL / nL, eL)
        pU = beta_draw(r, kU * eU / nU, eU)
        out.append((NL * pL + NU * pU) / (NL + NU))
    out.sort(); return [out[int(.025 * sims)], out[sims // 2], out[int(.975 * sims) - 1]]
NL, NU = len(L), len(O)
res["joined"] = {}
for rho in (0.0, 0.05, 0.28):
    res["joined"]["rho=%s" % rho] = {"non_living": joined(5, 135, 0, 135, rho, NL, NU),
                                     "bone": joined(1, 135, 0, 135, rho, NL, NU),
                                     "non_living_licensed_stratum_zeroed": joined(5, 135, 0, 135, rho, NL, NU, True)}
j = res["joined"]["rho=0.05"]
res["C4"] = {"upper_rho05": j["non_living"][2], "studio_added_bounds_upper": SR["joined_non_living"]["hi"],
             "upper_rho028": res["joined"]["rho=0.28"]["non_living"][2],
             "pass": j["non_living"][2] < SR["joined_non_living"]["hi"], "method": "design-effect Jeffreys posterior; zero events make an observer bootstrap degenerate (deviation from the preregistered wording)"}
res["C5"] = {"field_interval": SR["field_n10_interval"], "joined_bone_rho05": j["bone"],
             "joined_bone_rho028": res["joined"]["rho=0.28"]["bone"],
             "pass": SR["field_n10_interval"][0] > res["joined"]["rho=0.28"]["bone"][2]}
# C6: observer-level permutation, licensed 5 odd (5 distinct observers) vs drawn 0
lo = [ob(r, i) for i, r in enumerate(L)]
# assign the five odd events to 5 distinct licensed observers at random: cluster permutation of the licence class
# over the pooled observer set, statistic = difference of odd rates when the pooled odd = 5 events on distinct observers
pool_obs = collections.defaultdict(list)
for i, r in enumerate(drawn): pool_obs["d:" + ob(r, i)].append(0)
pooled = {}
for i, r in enumerate(L): pooled.setdefault(ob(r, i), []).append(("L", r["key"]))
for i, r in enumerate(drawn): pooled.setdefault(ob(r, i), []).append(("D", r["key"]))
# the 135 licensed read frames are not individually identified in the inputs fetched; use all 138 licensed records as the frame set
obsL = collections.defaultdict(list)
for i, r in enumerate(L): obsL[ob(r, i)].append(r["key"])
obsD = collections.defaultdict(list)
for i, r in enumerate(drawn): obsD[ob(r, i)].append(r["key"])
allobs = list(obsL) + list(obsD)
sizes = {o: len(v) for o, v in list(obsL.items()) + list(obsD.items())}
# null: odd events fall on frames at random among the 273 pooled; observed: 5 odd, all in licensed. statistic = odd in licensed.
frames = [("L", o) for o, v in obsL.items() for _ in v] + [("D", o) for o, v in obsD.items() for _ in v]
def one(r):
    obs_all = list({o for _, o in frames}); odd_obs = set(r.sample(obs_all, 5))
    # odd frames: one frame in each of 5 random observers (observer-level assignment, as five distinct observers observed)
    cnt = 0
    for o in odd_obs:
        fs = [f for f in frames if f[1] == o]; cnt += r.choice(fs)[0] == "L"
    return cnt
# with observers disjoint between L and D, the chance that an observer is licensed is size-free: draw observers
rr = random.Random(7); N = 20000
hits = 0
nL_obs, nD_obs = len(obsL), len(obsD)
tot = nL_obs + nD_obs
def hyper_all5(): return math.comb(nL_obs, 5) / math.comb(tot, 5)
p_one = hyper_all5()
res["C6"] = {"licensed_observers": nL_obs, "drawn_observers": nD_obs, "p_all_five_odd_observers_licensed_one_sided": p_one,
             "p_two_sided": min(1.0, 2 * p_one), "fisher_frames": SR["fisher_two_sided_5of135_vs_0of135"],
             "note": "five odd events on five distinct observers (Atelier); observers are disjoint between the classes, so the chance all five fall in the licensed class is hypergeometric over observers"}
res["C6"]["pass"] = 0.03 <= res["C6"]["p_two_sided"] <= 0.15
# C7
z = res["joined"]["rho=0.05"]
res["C7"] = {"upper": z["non_living"][2], "upper_licensed_zeroed": z["non_living_licensed_stratum_zeroed"][2],
             "drop_share": 1 - z["non_living_licensed_stratum_zeroed"][2] / z["non_living"][2]}
res["C7"]["pass"] = res["C7"]["drop_share"] < 1 / 3
res["grid"] = [{"rho": round(i * 0.02, 2), "non_living": joined(5, 135, 0, 135, i * 0.02, NL, NU, sims=20000),
                "bone": joined(1, 135, 0, 135, i * 0.02, NL, NU, sims=20000)} for i in range(0, 21)]
json.dump(res, open(D + "results.json", "w"), indent=1, default=list)
print(json.dumps(res, indent=1, default=list))
