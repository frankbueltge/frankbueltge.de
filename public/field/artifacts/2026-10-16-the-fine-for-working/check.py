"""Checks for study 19. Usage: python3 check.py   (exit 1 on any failure; counts what it ran)"""
import json, pathlib, sys
import numpy as np, pandas as pd
HERE = pathlib.Path(__file__).resolve().parent
r = json.load(open(HERE / "data/results.json"))
w = pd.read_csv(HERE / "data/fines.tsv", sep="\t")
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)
    print(("ok   " if ok else "FAIL ") + name)

def totals(p, q):
    f = (p - q) ** 2; F = f.sum()
    return F, F / (q * (1 - q)).sum(), F / np.sqrt((q * (1 - q) * (1 - 2 * p) ** 2).sum()), F / np.sqrt((4 * f * q * (1 - q)).sum())

# 1-2: the committed per-tornado columns reproduce the reported totals
for y in ("H", "D"):
    F, R, z1, z2 = totals(w[f"p_{y}"].values, w[f"q_{y}"].values)
    check(f"{y}: fines.tsv reproduces F, R, z_one, z_two",
          abs(F - r[y]["F"]) < 1e-3 and abs(R - r[y]["R"]) < 1e-4 and abs(z1 - r[y]["z_one"]) < 1e-3 and abs(z2 - r[y]["z_two"]) < 1e-3)
check("row count equals n_warned", len(w) == r["n_warned"])
check("q < p for every warned tornado when OR < 1 (H)", (w.q_H < w.p_H).all() == (r["H"]["OR_warned"] < 1))

# 3: independent logistic fit (plain Newton-Raphson in numpy, no statsmodels) gives the same OR
src = pd.read_csv(HERE.parent / "2026-10-14-who-was-beneath/data/beneath.tsv", sep="\t")
src = src[src.density.notna()].copy()
ef = src.mag.clip(lower=0).clip(upper=4)
reg = src.region.replace({"other": "South"})
Xc = np.column_stack([np.ones(len(src)), src.warned] + [(ef == k) for k in (1, 2, 3, 4)] +
                     [np.log(src.len_mi + 0.01), np.log(src.wid_yd), src.night, src.yr.between(2012, 2016), src.yr >= 2017] +
                     [(reg == k) for k in ("Northeast", "Midwest", "West")] + [np.log(src.density), np.log(src.exposure + 1)]).astype(float)
for y, yv in (("H", ((src.inj + src.fat) > 0)), ("D", (src.fat > 0))):
    yv = yv.values.astype(float); b = np.zeros(Xc.shape[1])
    for _ in range(50):
        m = 1 / (1 + np.exp(-Xc @ b)); g = Xc.T @ (yv - m); Hs = (Xc * (m * (1 - m))[:, None]).T @ Xc
        b = b + np.linalg.solve(Hs, g)
    check(f"{y}: independent Newton fit OR matches ({np.exp(b[1]):.4f} vs {r[y]['OR_warned']})", abs(np.exp(b[1]) - r[y]["OR_warned"]) < 1e-3)

# 4: the closed form is what a simulated scorer sees: mean of B(p) - B(q) under Y ~ q equals F
rng = np.random.default_rng(1)
p, q = w.p_H.values, w.q_H.values
diffs = [((p - Y) ** 2 - (q - Y) ** 2).sum() for Y in (rng.random((4000, len(q))) < q)]
check(f"simulated paired difference mean {np.mean(diffs):.2f} within 3 SE of F {r['H']['F']}",
      abs(np.mean(diffs) - r["H"]["F"]) < 3 * np.std(diffs) / np.sqrt(len(diffs)))
check("simulated paired z near reported z_two (±10 %)", abs(np.mean(diffs) / np.std(diffs) / r["H"]["z_two"] - 1) < 0.1)

# 5: prediction verdicts follow from the numbers
pr = r["predictions"]
check("P1..P6 verdicts recomputed", [pr[k]["held"] for k in ("P1", "P2", "P3", "P4", "P5", "P6")] == [
    r["H"]["OR_ci"][1] < 1, r["H"]["R"] < .05, r["H"]["z_one"] < 1, r["H"]["z_two"] > 2, r["H"]["share_EF3plus"] > .5, r["D"]["z_two"] < r["H"]["z_two"]])
check("held count equals verdicts", r["held"] == sum(v["held"] for v in pr.values()))

# 6: tamper — one changed q must move F beyond tolerance
t = q.copy(); t[int(np.argmax((p - q) ** 2))] = p[int(np.argmax((p - q) ** 2))]
check("tamper of one row is caught", abs(totals(p, t)[0] - r["H"]["F"]) > 1e-3)

print(f"{len(ran) - len(failed)} of {len(ran)} checks passed; {len(ran)} ran")
sys.exit(1 if failed else 0)
