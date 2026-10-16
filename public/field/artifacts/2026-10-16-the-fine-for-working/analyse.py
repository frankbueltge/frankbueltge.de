"""Study 19: the fine a proper score charges a tornado warning that worked (PREREGISTRATION.md).
Usage: python3 analyse.py   (reads study 15's data/beneath.tsv, writes data/results.json, data/fines.tsv)"""
import json, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent / "2026-10-14-who-was-beneath" / "data" / "beneath.tsv"
df = pd.read_csv(SRC, sep="\t")
df = df[df.density.notna()].copy()

# Covariates exactly as study 15's analyse.py builds them
df["ef"] = df.mag.clip(lower=0).clip(upper=4)
for k in (1, 2, 3, 4): df[f"EF{k}{'+' if k == 4 else ''}"] = (df.ef == k).astype(float)
df["region"] = df.region.replace({"other": "South"})
for r in ("Northeast", "Midwest", "West"): df[r] = (df.region == r).astype(float)
df["era_2012_16"] = df.yr.between(2012, 2016).astype(float)
df["era_2017_23"] = (df.yr >= 2017).astype(float)
df["log_len"] = np.log(df.len_mi + 0.01)
df["log_wid"] = np.log(df.wid_yd)
df["log_density"] = np.log(df.density)
df["log_exposure"] = np.log(df.exposure + 1)
df["night"] = df.night.astype(float); df["warned"] = df.warned.astype(float)
COLS = ["warned", "EF1", "EF2", "EF3", "EF4+", "log_len", "log_wid", "night", "era_2012_16", "era_2017_23",
        "Northeast", "Midwest", "West", "log_density", "log_exposure"]
df["H"] = ((df.inj + df.fat) > 0).astype(float)
df["D"] = (df.fat > 0).astype(float)
X = sm.add_constant(df[COLS])
W = df.warned == 1
X1 = X[W].copy(); X0 = X1.copy(); X0["warned"] = 0.0
expit = lambda z: 1 / (1 + np.exp(-z))

def quantities(beta):
    q = expit(X1.values @ beta); p = expit(X0.values @ beta)
    f = (p - q) ** 2
    F = f.sum()
    return dict(OR=float(np.exp(beta[1])), F=float(F), R=float(F / (q * (1 - q)).sum()),
                z_one=float(F / np.sqrt((q * (1 - q) * (1 - 2 * p) ** 2).sum())),
                z_two=float(F / np.sqrt((4 * f * q * (1 - q)).sum()))), p, q, f

out = {"n_analysed": int(len(df)), "n_warned": int(W.sum()), "source": str(SRC.relative_to(HERE.parent.parent))}
rng = np.random.default_rng(20261016)
fines = {}
for y in ("H", "D"):
    res = sm.Logit(df[y], X).fit(cov_type="HC0", disp=0, maxiter=200)
    b = res.params.values; V = res.cov_params().values
    pt, p, q, f = quantities(b)
    draws = rng.multivariate_normal(b, V, size=2000)
    sims = [quantities(d)[0] for d in draws]
    ci = {k: [round(float(np.percentile([s[k] for s in sims], 2.5)), 6), round(float(np.percentile([s[k] for s in sims], 97.5)), 6)] for k in pt}
    n = int(W.sum())
    strong = (df.ef[W] >= 3).values
    ef = df.ef[W].values
    by_ef = {f"EF{k}" if k < 4 else "EF4+": {"n": int((ef == k).sum()), "F": round(float(f[ef == k].sum()), 4),
             "mean_p": round(float(p[ef == k].mean()), 4), "mean_q": round(float(q[ef == k].mean()), 4)} for k in range(5)}
    out[y] = {
        "events_warned": int(df[y][W].sum()), "events_unwarned": int(df[y][~W].sum()),
        "converged": bool(res.mle_retvals["converged"]),
        "OR_warned": round(pt["OR"], 4), "OR_ci": ci["OR"], "OR_p": float(res.pvalues["warned"]),
        "mean_p": round(float(p.mean()), 5), "mean_q": round(float(q.mean()), 5),
        "mean_e": round(float((1 - q / p).mean()), 4),
        "F": round(pt["F"], 4), "F_ci": ci["F"], "mean_fine": pt["F"] / n,
        "R": round(pt["R"], 5), "R_ci": ci["R"],
        "z_one": round(pt["z_one"], 4), "z_one_ci": ci["z_one"],
        "z_two": round(pt["z_two"], 4), "z_two_ci": ci["z_two"],
        "N_one": float(n * (2 / pt["z_one"]) ** 2), "N_two": float(n * (2 / pt["z_two"]) ** 2),
        "share_EF3plus": round(float(f[strong].sum() / pt["F"]), 4),
        "by_ef": by_ef,
    }
    fines[y] = (p, q, f)

H, D = out["H"], out["D"]
out["predictions"] = {
    "P1": {"held": H["OR_warned"] < 1 and H["OR_ci"][1] < 1, "value": [H["OR_warned"], H["OR_ci"]]},
    "P2": {"held": H["R"] < 0.05, "value": H["R"]},
    "P3": {"held": H["z_one"] < 1, "value": H["z_one"]},
    "P4": {"held": H["z_two"] > 2, "value": H["z_two"]},
    "P5": {"held": H["share_EF3plus"] > 0.5, "value": H["share_EF3plus"]},
    "P6": {"held": D["z_two"] < H["z_two"], "value": [D["z_two"], H["z_two"]]},
}
out["held"] = sum(v["held"] for v in out["predictions"].values())
(HERE / "data").mkdir(exist_ok=True)
json.dump(out, open(HERE / "data/results.json", "w"), indent=1)
w = df[W][["om", "yr", "st", "mag", "inj", "fat"]].copy()
for y in ("H", "D"):
    p, q, f = fines[y]
    w[f"p_{y}"] = p.round(6); w[f"q_{y}"] = q.round(6)
w.to_csv(HERE / "data/fines.tsv", sep="\t", index=False)
print(json.dumps({k: out[k] for k in ("n_analysed", "n_warned", "held")}, indent=0))
for y in ("H", "D"): print(y, json.dumps({k: v for k, v in out[y].items() if k != "by_ef"}))
print(json.dumps(out["predictions"]))
print(json.dumps(out["H"]["by_ef"]))
