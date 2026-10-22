"""Study 37: why does one mid-sized hit outweigh the largest run? (second coda to the presented cycle 009)
Usage: python3 -I analyse37.py   (writes data/results37.json)
Model, data and predictions as fixed in PREREGISTRATION-37.md (commit ae059fb)."""
import json, sys, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
from scipy.stats import spearmanr
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
LA, JOPLIN, TUSCALOOSA = 613559, 296616, 314625
d = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
d = d[d.warned == 1].copy().reset_index(drop=True)

# study 35's design matrix, unchanged (as analyse36.py)
d["ef"] = d.mag.clip(lower=0).clip(upper=4)
for k in (1, 2, 3, 4): d[f"EF{k}{'+' if k == 4 else ''}"] = (d.ef == k).astype(float)
d["region"] = d.region.replace({"other": "South"})
for r in ("Northeast", "Midwest", "West"): d[r] = (d.region == r).astype(float)
d["era_2012_16"] = d.yr.between(2012, 2016).astype(float)
d["era_2017_23"] = (d.yr >= 2017).astype(float)
d["log_len"] = np.log(d.len_mi + 0.01)
d["log_wid"] = np.log(d.wid_yd)
d["log_density"] = np.log(d.density)
d["log_exposure"] = np.log(d.exposure + 1)
d["night"] = d.night.astype(float)
M1 = ["EF1", "EF2", "EF3", "EF4+", "log_len", "log_wid", "night", "era_2012_16", "era_2017_23",
      "Northeast", "Midwest", "West", "log_density", "log_exposure"]
def cat(r):
    if r.warnings_county_1y == 0: return "none"
    if r.run_county == 0: return "hit"
    return "run12" if r.run_county <= 2 else "run3"
d["cat"] = d.apply(cat, axis=1)
for c in ("none", "run12", "run3"): d["c_" + c] = (d.cat == c).astype(float)
CATS = ["c_none", "c_run12", "c_run3"]

def fit(df):
    X = sm.add_constant(df[CATS + M1])
    pois = sm.GLM(df["inj"], X, family=sm.families.Poisson()).fit()
    m = sm.NegativeBinomial(df["inj"], X, loglike_method="nb2")
    res = m.fit(start_params=np.append(pois.params.values, 1.0), cov_type="HC0", disp=0, maxiter=2000, method="nm")
    res = m.fit(start_params=res.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    return m, res
def ratio(res):
    ci = res.conf_int()
    return {"irr": round(float(np.exp(res.params["c_run3"])), 3), "lo": round(float(np.exp(ci.loc["c_run3", 0])), 3),
            "hi": round(float(np.exp(ci.loc["c_run3", 1])), 3), "converged": bool(res.mle_retvals.get("converged", False))}

m, res = fit(d)
full = ratio(res)
b0 = float(res.params["c_run3"])
alpha = float(res.params["alpha"])
mu = np.asarray(res.predict(), dtype=float)
y = d.inj.to_numpy(float)
d["mu"] = mu
d["surprise"] = y / mu
d["u"] = (y - mu) / (1 + alpha * mu)
# one-step leave-one-out: removing tornado i leaves gradient -s_i at the fit; a Newton step gives H^-1 s_i
H = m.hessian(res.params.values)
S = m.score_obs(res.params.values)
j = list(res.params.index).index("c_run3")
d["delta"] = (S @ np.linalg.inv(H).T)[:, j]

def row(r):
    return {"om": int(r.om), "date": r.start_utc[:10], "st": r.st, "cat": r["cat"], "ef": int(r.ef),
            "len_mi": round(float(r.len_mi), 2), "wid_yd": int(r.wid_yd), "inj": int(r.inj), "fat": int(r.fat),
            "mu": round(float(r.mu), 2), "surprise": round(float(r.surprise), 2), "u": round(float(r.u), 3),
            "delta": round(float(r.delta), 4), "rank_delta": int(r.rank_delta)}
d["rank_delta"] = d.delta.abs().rank(ascending=False, method="min").astype(int)

R36 = json.loads((HERE / "data/results36.json").read_text())
loo36 = {x["om"]: x["inj_run3"]["irr"] for x in R36["loo"]}
cmp = []
for om, irr in loo36.items():
    r = d[d.om == om].iloc[0]
    cmp.append({**row(r), "actual": round(float(np.log(irr) - np.log(full["irr"])), 4), "irr_loo": irr})
rho = float(spearmanr([c["delta"] for c in cmp], [c["actual"] for c in cmp]).correlation)

new = d[~d.om.isin(loo36)].sort_values("delta", key=abs, ascending=False).head(10)
refits = []
for _, r in new.iterrows():
    _, rs = fit(d[d.om != r.om].reset_index(drop=True))
    refits.append({**row(r), "refit": ratio(rs)})
    print(r.om, r["cat"], refits[-1]["refit"]["irr"], file=sys.stderr)

R = {"n_warned": int(len(d)), "full": full, "alpha": round(alpha, 3),
     "named": {k: row(d[d.om == om].iloc[0]) for k, om in (("louisiana", LA), ("joplin", JOPLIN), ("tuscaloosa", TUSCALOOSA))},
     "loo36": cmp, "spearman_rho": round(rho, 3), "top_delta": [row(r) for _, r in d.sort_values("delta", key=abs, ascending=False).head(15).iterrows()],
     "refits": refits,
     "by_cat": {c: {"n": int((d.cat == c).sum()), "sum_u": round(float(d.u[d.cat == c].sum()), 3)} for c in ("hit", "run3")}}
N = R["named"]; LEARN, HABIT = 1.04, 1.46
la_move = abs(R36["sets"]["all"]["inj"]["irr"] - loo36[LA])
R["predictions"] = {
    "P1": {"text": "613559's y/mu above Joplin's and Tuscaloosa's, and its mu below 10",
           "held": bool(N["louisiana"]["surprise"] > max(N["joplin"]["surprise"], N["tuscaloosa"]["surprise"]) and N["louisiana"]["mu"] < 10)},
    "P2": {"text": "one-step and actual shift agree in rank over study 36's 30, Spearman rho >= 0.8", "held": bool(rho >= 0.8)},
    "P3": {"text": "613559 in the top three by |delta| of all warned", "held": bool(N["louisiana"]["rank_delta"] <= 3)},
    "P4": {"text": "no new refit moves the point further than 613559 (0.088), every interval holds 1.04 and 1.46",
           "held": bool(all(abs(x["refit"]["irr"] - 1.214) <= la_move and x["refit"]["lo"] <= LEARN and x["refit"]["hi"] >= HABIT for x in refits))},
}
(HERE / "data/results37.json").write_text(json.dumps(R, indent=1) + "\n")
print(json.dumps({k: R[k] for k in ("full", "alpha", "named", "spearman_rho", "predictions")}, indent=1))
