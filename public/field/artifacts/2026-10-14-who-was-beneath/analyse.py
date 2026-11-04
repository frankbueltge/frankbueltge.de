"""Study 15: does a control for exposure turn the sign of the warning's apparent effect?
Usage: python3 analyse.py   (reads data/beneath.tsv, writes data/results.json)"""
import json, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
from scipy import stats
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
df = pd.read_csv(HERE / "data/beneath.tsv", sep="\t")
n_all = len(df)
cells = {"warned_harm": int(((df.warned == 1) & (df.fat > 0)).sum()),
         "warned_no_harm": int(((df.warned == 1) & (df.fat == 0)).sum()),
         "unwarned_harm": int(((df.warned == 0) & (df.fat > 0)).sum()),
         "unwarned_no_harm": int(((df.warned == 0) & (df.fat == 0)).sum()),
         "deaths": int(df.fat.sum()), "deaths_warned": int(df.fat[df.warned == 1].sum()),
         "injuries": int(df.inj.sum())}
dropped = df[df.density.isna()]
df = df[df.density.notna()].copy()

# Declared deviations (README): unrated (-9) pooled with EF0 as base; PR/VI pooled with South
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
df["lead_1_15"] = ((df.warned == 1) & (df.lead <= 15)).astype(float)
df["lead_gt15"] = ((df.warned == 1) & (df.lead > 15)).astype(float)
df["night"] = df.night.astype(float); df["warned"] = df.warned.astype(float)

BASE = ["EF1", "EF2", "EF3", "EF4+", "log_len", "log_wid", "night", "era_2012_16", "era_2017_23",
        "Northeast", "Midwest", "West"]
EXPO = ["log_density", "log_exposure"]
MODELS = {"M0": ["warned"] + BASE, "M1": ["warned"] + BASE + EXPO,
          "M2": ["lead_1_15", "lead_gt15"] + BASE + EXPO}

def fit(y, cols, kind):
    X = sm.add_constant(df[cols])
    if kind == "nb":
        # start from the Poisson fit (alpha = 1); the default start failed to a NaN likelihood
        pois = sm.GLM(df[y], X, family=sm.families.Poisson()).fit()
        start = np.append(pois.params.values, 1.0)
        res = sm.NegativeBinomial(df[y], X, loglike_method="nb2").fit(start_params=start, cov_type="HC0", disp=0, maxiter=1000, method="nm")
        res = sm.NegativeBinomial(df[y], X, loglike_method="nb2").fit(start_params=res.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    else:
        res = sm.GLM(df[y], X, family=sm.families.Poisson()).fit(cov_type="HC0")
    ci = res.conf_int()
    out = {c: {"irr": round(float(np.exp(res.params[c])), 3), "lo": round(float(np.exp(ci.loc[c, 0])), 3),
               "hi": round(float(np.exp(ci.loc[c, 1])), 3), "p": float(res.pvalues[c])} for c in cols}
    conv = bool(res.mle_retvals.get("converged", True)) if hasattr(res, "mle_retvals") and res.mle_retvals else True
    extra = {"alpha": round(float(res.params["alpha"]), 3), "llf": round(float(res.llf), 2)} if kind == "nb" else {}
    return {"coef": out, "converged": conv, "n": int(res.nobs), **extra}

fits = {f"{m}_{y}_{k}": fit(y, cols, k) for m, cols in MODELS.items() for y in ("fat", "inj") for k in ("nb", "poisson")}

# P2: median density warned vs unwarned within EF0-1 and EF2+
p2 = {}
for name, mask in (("EF0-1", df.ef <= 1), ("EF2+", df.ef >= 2)):
    w, u = df.density[mask & (df.warned == 1)], df.density[mask & (df.warned == 0)]
    p2[name] = {"median_warned": round(float(w.median()), 1), "median_unwarned": round(float(u.median()), 1),
                "n_warned": int(len(w)), "n_unwarned": int(len(u)),
                "mannwhitney_p": float(stats.mannwhitneyu(w, u).pvalue)}
expo = {}
for name, mask in (("EF0-1", df.ef <= 1), ("EF2+", df.ef >= 2), ("killers", df.fat > 0)):
    w, u = df.exposure[mask & (df.warned == 1)], df.exposure[mask & (df.warned == 0)]
    expo[name] = {"median_warned": round(float(w.median()), 1), "median_unwarned": round(float(u.median()), 1)}

g = lambda f, c: fits[f]["coef"][c]
pred = {
    "P1": {"text": "M0 deaths IRR of WARNED above 1", "value": g("M0_fat_nb", "warned"), "held": g("M0_fat_nb", "warned")["irr"] > 1},
    "P2": {"text": "median density warned > unwarned in EF0-1 and EF2+", "value": p2,
           "held": all(v["median_warned"] > v["median_unwarned"] for v in p2.values())},
    "P3": {"text": "M1 deaths IRR of WARNED below M0's", "value": [g("M0_fat_nb", "warned")["irr"], g("M1_fat_nb", "warned")["irr"]],
           "held": g("M1_fat_nb", "warned")["irr"] < g("M0_fat_nb", "warned")["irr"]},
    "P4": {"text": "M1 deaths IRR interval contains 1", "value": g("M1_fat_nb", "warned"),
           "held": g("M1_fat_nb", "warned")["lo"] <= 1 <= g("M1_fat_nb", "warned")["hi"]},
    "P5": {"text": "M1 injuries IRR of WARNED wholly below 1", "value": g("M1_inj_nb", "warned"),
           "held": g("M1_inj_nb", "warned")["hi"] < 1},
    "P6": {"text": "M2 deaths IRR lead >15 above lead 1-15", "value": [g("M2_fat_nb", "lead_1_15"), g("M2_fat_nb", "lead_gt15")],
           "held": g("M2_fat_nb", "lead_gt15")["irr"] > g("M2_fat_nb", "lead_1_15")["irr"]},
}
signs = {k: {c: bool(np.sign(np.log(v["coef"][c]["irr"])) == np.sign(np.log(fits[k.replace("_nb", "_poisson")]["coef"][c]["irr"])))
             for c in v["coef"] if c in ("warned", "lead_1_15", "lead_gt15")} for k, v in fits.items() if k.endswith("_nb")}
res = {"n_all": n_all, "n_analysed": len(df), "dropped_no_density": int(len(dropped)),
       "dropped_deaths": int(dropped.fat.sum()), "cells": cells, "p2_density": p2, "exposure_median": expo,
       "fits": fits, "predictions": pred, "nb_poisson_sign_agree": signs}
(HERE / "data/results.json").write_text(json.dumps(res, indent=1, default=lambda o: bool(o) if isinstance(o, np.bool_) else str(o)))
for k, v in pred.items(): print(k, v["held"], json.dumps(v["value"], default=str)[:300])
for k, v in fits.items():
    c = [c for c in ("warned", "lead_1_15", "lead_gt15") if c in v["coef"]]
    print(k, v["converged"], {x: v["coef"][x] for x in c}, v.get("alpha"))
print(json.dumps(expo)); print(json.dumps(signs))

# POST HOC (not registered): is the NB/Poisson split carried by the few deadliest tornadoes?
# Both estimators of M1, refitted with the k deadliest tornadoes removed, k = 0..15 (the page's slider).
full = df
post = {"curve": []}
order = full.sort_values(["fat", "inj"], ascending=False)
for k in range(16):
    df = full.drop(order.index[:k])
    row = {"k": k}
    for y in ("fat", "inj"):
        for kind in ("nb", "poisson"):
            c = fit(y, MODELS["M1"], kind)
            row[f"{y}_{kind}"] = [c["coef"]["warned"][x] for x in ("irr", "lo", "hi")]
            row[f"{y}_{kind}_converged"] = c["converged"]
    post["curve"].append(row)
    print(row)
df = full
post["top15_by_deaths"] = order.head(15)[["om", "yr", "st", "mag", "fat", "inj", "warned", "lead", "density", "exposure"]].astype(str).to_dict("records")
res["post_hoc"] = post
(HERE / "data/results.json").write_text(json.dumps(res, indent=1, default=lambda o: bool(o) if isinstance(o, np.bool_) else str(o)))
