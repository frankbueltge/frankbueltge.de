"""Session 185 analysis. Seeded, deterministic. Run from the repository root: python3 -I artifacts/2026-10-07-the-rest-read/analyse.py"""
import json, random, collections
H = "artifacts/2026-10-07-how-many-sightings-of-the-gone/data/"
D = "artifacts/2026-10-07-the-rest-read/data/"
R = json.load(open(H + "records.json"))["records"]
FR = json.load(open(D + "studio-further-read-2026-10-07.json"))
DRAW = json.load(open(D + "studio-draw-2026-10-07.json"))
AT = json.load(open("artifacts/2026-10-07-the-draw-and-the-whole/data/atelier-results-2026-10-07.json"))
OPEN = ("http://creativecommons.org/publicdomain/zero/1.0/", "http://creativecommons.org/licenses/by/4.0/")
tort = [r for r in R if str(r["speciesKey"]) == "9527499" and r["nmedia"] > 0]
def lic(r): return bool(r["media_licenses"]) and all(l in OPEN for l in r["media_licenses"])
L = [r for r in tort if lic(r)]; O = [r for r in tort if not lic(r)]
byk = {r["key"]: r for r in tort}
first = [f["key"] for f in FR["frames"] if f["lot"] == "A"]; further = [f["key"] for f in FR["frames"] if f["lot"] == "B"]
res = {"NL": len(L), "NU": len(O)}
res["P1"] = {"further_keys": len(further), "in_table": sum(k in byk for k in further),
             "licensed": sum(k in byk and lic(byk[k]) for k in further), "overlap_with_first": len(set(further) & set(first)),
             "draw_file_keys_equal_read": sorted(DRAW["keys"]) == sorted(further)}
res["P1"]["pass"] = res["P1"]["in_table"] == 90 and res["P1"]["licensed"] == 0 and res["P1"]["overlap_with_first"] == 0
def ob(r, i): return r["recordedBy"] or "__none__%d" % i
fo = [ob(byk[k], k) for k in further if k in byk]; ao = [ob(byk[k], k) for k in first + further if k in byk]
def bstar(lst):
    c = collections.Counter(lst); return sum(v * v for v in c.values()) / sum(c.values())
res["observers"] = {"further_distinct": len(set(fo)), "all225_distinct": len(set(ao)), "bstar_225": bstar(ao), "bstar_further": bstar(fo)}
res["P5"] = {"pass": res["observers"]["bstar_225"] < 2.5 and res["observers"]["further_distinct"] >= 75}
cls = collections.Counter(f["cls"] for f in FR["frames"] if f["lot"] == "B")
res["further_classes"] = dict(cls)
bL = AT["draws"]["seen135"]["bstar"]; bU = res["observers"]["bstar_225"]
def bd(r, k, n): return r.betavariate(0.5 + k, 0.5 + n - k)
def joined(kL, kU, rho, nL=135, nU=225, seed=1, sims=40000, ratio=False):
    r = random.Random(seed); eL = nL / (1 + (bL - 1) * rho); eU = nU / (1 + (bU - 1) * rho)
    NL, NU = res["NL"], res["NU"]; out = []; rat = []
    for _ in range(sims):
        pL = bd(r, kL * eL / nL, eL); pU = bd(r, kU * eU / nU, eU)
        out.append((NL * pL + NU * pU) / (NL + NU)); rat.append(pL / pU if pU > 0 else float("inf"))
    out.sort(); rat.sort()
    q = lambda a: [a[int(.025 * sims)], a[sims // 2], a[int(.975 * sims) - 1]]
    return (q(rat) if ratio else q(out))
J = {}
for rho in (0.0, 0.05, 0.28):
    J["rho=%s" % rho] = {"not_living": joined(4, 3, rho), "not_living_unclear_counted": joined(4, 4, rho),
                         "bone": joined(1, 1, rho), "ratio_licensed_over_unlicensed": joined(4, 3, rho, ratio=True)}
res["joined"] = J
j = J["rho=0.05"]
res["P2"] = {"lower": j["not_living"][0], "upper": j["not_living"][2], "pass": 0.003 <= j["not_living"][0] <= 0.010 and 0.015 <= j["not_living"][2] <= 0.030}
res["P3"] = {"upper": j["bone"][2], "pass": 0.010 <= j["bone"][2] <= 0.025}
res["P4"] = {"shift": j["not_living_unclear_counted"][2] - j["not_living"][2], "pass": abs(j["not_living_unclear_counted"][2] - j["not_living"][2]) < 0.003}
res["P6"] = {"ratio_95": [j["ratio_licensed_over_unlicensed"][0], j["ratio_licensed_over_unlicensed"][2]],
             "pass": j["ratio_licensed_over_unlicensed"][0] <= 1 <= j["ratio_licensed_over_unlicensed"][2]}
res["previous_182_183"] = {"not_living_rho05": [0.0014, 0.0213], "note": "unlicensed stratum 0 of 135; printed in artifact 183"}
res["grid"] = [{"rho": round(i * 0.01, 2), "not_living": joined(4, 3, i * 0.01, sims=20000), "unclear_counted": joined(4, 4, i * 0.01, sims=20000), "bone": joined(1, 1, i * 0.01, sims=20000)} for i in range(0, 31)]
json.dump(res, open(D + "results.json", "w"), indent=1)
print(json.dumps({k: v for k, v in res.items() if k != "grid"}, indent=1))
