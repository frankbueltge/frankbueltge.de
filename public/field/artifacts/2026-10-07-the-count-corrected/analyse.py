"""Session 183: the licensed count corrected. Seeded, deterministic. Run from the repository root."""
import json, random, math
P = "artifacts/2026-10-07-the-draw-and-the-whole/data/"
D = "artifacts/2026-10-07-the-count-corrected/data/"
OLD = json.load(open(P + "results.json"))
AT = json.load(open(P + "atelier-results-2026-10-07.json"))
FR = json.load(open(D + "studio-two-that-turn-data.json"))
ST = json.load(open(D + "studio-two-that-turn-results.json"))
bL, bU = AT["draws"]["seen135"]["bstar"], OLD["draw_bstar"]
NL, NU = OLD["licensed_ours"], OLD["other_ours"]

# P1: the five licensed rows, with the Studio's re-read
def final(f): return f["settled"] or f["studio_reread"]
rows = [(f["id"], final(f)) for f in FR["frames"]]
non = sum(1 for _, c in rows if c in ("none", "bone")); bone = sum(1 for _, c in rows if c == "bone")
res = {"rows": rows, "P1": {"non_living": non, "bone": bone, "pass": len(rows) == 5 and non == 4 and bone == 1}}

def beta_draw(r, k, n): return r.betavariate(0.5 + k, 0.5 + n - k)
def joined(kL, nL, kU, nU, rho, seed=1, sims=40000):
    r = random.Random(seed)
    eL, eU = nL / (1 + (bL - 1) * rho), nU / (1 + (bU - 1) * rho)
    out = sorted((NL * beta_draw(r, kL * eL / nL, eL) + NU * beta_draw(r, kU * eU / nU, eU)) / (NL + NU) for _ in range(sims))
    return [out[int(.025 * sims)], out[sims // 2], out[int(.975 * sims) - 1]]

# the scenarios a reader can choose: calls of the two open frames (mud clod, B15 tortoise)
SC = {"both alive (3 not living)": (3, 1), "mud clod none, B15 alive (4)": (4, 1),
      "mud clod alive, B15 none (4)": (4, 1), "both none (5)": (5, 1), "mud clod a bone, B15 none (5, 2 bones)": (5, 2)}
res["scenarios"] = {}
for name, (k, b) in SC.items():
    res["scenarios"][name] = {"k": k, "bone": b, "rho0.05": {"non_living": joined(k, 135, 0, 135, .05), "bone": joined(b, 135, 0, 135, .05)},
                              "rho0.28": {"non_living": joined(k, 135, 0, 135, .28), "bone": joined(b, 135, 0, 135, .28)}}
new = joined(4, 135, 0, 135, .05); old = OLD["joined"]["rho=0.05"]["non_living"]; oldb = OLD["joined"]["rho=0.05"]["bone"]
newb = joined(1, 135, 0, 135, .05)
res["P3"] = {"old": old, "new": new, "pass": new[0] >= old[0] and new[2] <= old[2]}
res["P4"] = {"d_lo": new[0] - old[0], "d_hi": new[2] - old[2], "pass": abs(new[2] - old[2]) < .001 and abs(new[0] - old[0]) < .001}
res["P5"] = {"old": oldb, "new": newb, "max_abs_diff": max(abs(a - b) for a, b in zip(newb, oldb)), "pass": max(abs(a - b) for a, b in zip(newb, oldb)) < 5e-4}
def fisher(a, n1, b, n2):
    N = n1 + n2; K = a + b
    pm = lambda x: math.comb(n1, x) * math.comb(n2, K - x) / math.comb(N, K)
    p0 = pm(a); return sum(pm(x) for x in range(0, K + 1) if pm(x) <= p0 * (1 + 1e-9))
res["P6"] = {"fisher_4_v_0": fisher(4, 135, 0, 135), "fisher_5_v_0": fisher(5, 135, 0, 135), "pass": abs(fisher(4, 135, 0, 135) - .122) < .0006}
dev = []
for rho, key in (("0.05", "0.05"), ("0.28", "0.28")):
    mine = joined(5, 135, 0, 135, float(rho))
    theirs = ST["field_check"][key]["field"]
    dev.append(max(abs(a - b) for a, b in zip(mine, theirs)))
    s_js = ST["field_check"][key]["studio_js"]; dev.append(max(abs(a - b) for a, b in zip(mine, s_js)))
res["P7"] = {"max_abs_dev": max(dev), "pass": max(dev) < .002}
# P2 is a reading, recorded by hand in my_reading.json, not computed
res["P2"] = json.load(open(D + "my_reading.json"))
json.dump(res, open(D + "results.json", "w"), indent=1, default=list)
for k in ("P1", "P3", "P4", "P5", "P6", "P7"): print(k, res[k])
