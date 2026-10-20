"""Study 31: does a record of empty warnings go with more harm under the next tornado?
Usage: python3 analyse.py   (reads data/tornadoes31.tsv, writes data/results31.json)
Models and predictions as fixed in PREREGISTRATION.md (commit 983df95)."""
import json, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
df = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")

# study 15's M1 controls, same declared conventions (unrated with EF0; PR/VI with the South)
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
M1 = ["warned", "EF1", "EF2", "EF3", "EF4+", "log_len", "log_wid", "night", "era_2012_16",
      "era_2017_23", "Northeast", "Midwest", "West", "log_density", "log_exposure"]

def standardise(col, src, log=False):
    x = df[src].astype(float)
    if log: x = np.log1p(x)
    ok = x.notna()
    mu, sd = x[ok].mean(), x[ok].std()
    df[col] = ((x - mu) / sd).where(ok, 0.0)
    df[col + "_none"] = (~ok).astype(float)
    return {"mean": round(float(mu), 4), "sd": round(float(sd), 4), "undefined": int((~ok).sum())}

scales = {"far_past": standardise("z_far_past", "far_past"),
          "far_future": standardise("z_far_future", "far_future"),
          "far_state_past": standardise("z_far_state", "far_state_past"),
          "empties_county": standardise("z_empties", "empties_county", log=True),
          "run_county": standardise("z_run", "run_county", log=True)}

def fit(y, cols, data=None, first="nm"):
    data = df if data is None else data
    cols = [c for c in cols if data[c].std() > 0]          # drop constant indicators
    X = sm.add_constant(data[cols])
    pois = sm.GLM(data[y], X, family=sm.families.Poisson()).fit()
    start = np.append(pois.params.values, 1.0)
    m = sm.NegativeBinomial(data[y], X, loglike_method="nb2")
    res = m.fit(start_params=start, cov_type="HC0", disp=0, maxiter=2000 if first == "nm" else 5000, method=first)
    res = m.fit(start_params=res.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    ci = res.conf_int()
    conv = bool(res.mle_retvals.get("converged", False))
    return res, ci, conv, cols

def irr(res, ci, c):
    return {"irr": round(float(np.exp(res.params[c])), 3), "lo": round(float(np.exp(ci.loc[c, 0])), 3),
            "hi": round(float(np.exp(ci.loc[c, 1])), 3), "p": float(res.pvalues[c])}

R = {"n": int(len(df)), "deaths": int(df.fat.sum()), "injuries": int(df.inj.sum()),
     "tornadoes_with_deaths": int((df.fat > 0).sum()), "tornadoes_with_injuries": int((df.inj > 0).sum()),
     "scales": scales, "fits": {}}

def run(name, expo, y, extra=(), data=None, first="nm"):
    cols = [expo, expo + "_none"] + M1 + list(extra)
    res, ci, conv, used = fit(y, cols, data, first)
    R["fits"][name] = {"exposure": expo, "y": y, "n": int(res.nobs), "converged": conv,
                       "alpha": round(float(res.params["alpha"]), 3),
                       **irr(res, ci, expo), "warned": irr(res, ci, "warned")}
    return R["fits"][name]

for y in ("inj", "fat"):
    run(f"past_{y}", "z_far_past", y)
    run(f"future_{y}", "z_far_future", y)
    run(f"empties_{y}", "z_empties", y)
    run(f"run_{y}", "z_run", y)
    run(f"state_{y}", "z_far_state", y)                       # exploration

# P4: office fixed effects (within-office change over time)
offices = sorted(df.office.unique())
for o in offices[1:]: df["off_" + o] = (df.office == o).astype(float)
FE = ["off_" + o for o in offices[1:]]
for y in ("inj", "fat"):
    try:                                                        # as registered; did not converge
        run(f"past_fe_all_{y}", "z_far_past", y, extra=FE, first="bfgs")
    except Exception as e:                                      # reported, not replaced
        R["fits"][f"past_fe_all_{y}"] = {"error": repr(e)[:200]}
    # declared deviation (README): an office with no event of y has no within-office information
    # and its dummy runs to minus infinity; its tornadoes are dropped for this fit only
    keep = df.groupby("office")[y].transform("sum") > 0
    sub = df[keep].copy()
    fe = ["off_" + o for o in sorted(sub.office.unique())[1:]]
    run(f"past_fe_{y}", "z_far_past", y, extra=fe, data=sub, first="bfgs")
    R["fits"][f"past_fe_{y}"]["offices_dropped"] = int(df.office.nunique() - sub.office.nunique())
    run(f"future_fe_{y}", "z_far_future", y, extra=fe, data=sub, first="bfgs")   # exploration

# exploration: past and future in one model
for y in ("inj", "fat"):
    cols = ["z_far_past", "z_far_past_none", "z_far_future", "z_far_future_none"] + M1
    res, ci, conv, used = fit(y, cols)
    R["fits"][f"both_{y}"] = {"n": int(res.nobs), "converged": conv, "past": irr(res, ci, "z_far_past"),
                             "future": irr(res, ci, "z_far_future")}

# descriptive: casualties per tornado by FAR_past tercile (as Simmons & Sutter tabulated)
d = df[df.far_past.notna()].copy()
d["tercile"] = pd.qcut(d.far_past, 3, labels=["low", "mid", "high"])
R["by_tercile"] = {str(k): {"n": int(len(g)), "far_range": [round(float(g.far_past.min()), 3), round(float(g.far_past.max()), 3)],
                            "deaths_per_100": round(100 * g.fat.mean(), 2), "injuries_per_100": round(100 * g.inj.mean(), 2),
                            "share_EF2plus": round(float((g.ef >= 2).mean()), 3), "share_south": round(float((g.region == "South").mean()), 3),
                            "share_night": round(float(g.night.mean()), 3)}
                   for k, g in d.groupby("tercile", observed=True)}
R["corr_past_future"] = round(float(df[["far_past", "far_future"]].dropna().corr().iloc[0, 1]), 3)

F = R["fits"]
def inside(a, b): return b["lo"] <= a["irr"] <= b["hi"]
R["predictions"] = {
    "P1": {"text": "FAR_past injuries IRR > 1, interval above 1", "held": bool(F["past_inj"]["lo"] > 1)},
    "P2": {"text": "FAR_past deaths IRR in [1.00, 1.30]", "held": bool(1.0 <= F["past_fat"]["irr"] <= 1.30)},
    "P3": {"text": "FAR_future injuries IRR inside FAR_past's interval", "held": bool(inside(F["future_inj"], F["past_inj"]))},
    "P4": {"text": "office FE: FAR_past injuries interval includes 1",
           "held": bool("lo" in F["past_fe_inj"] and F["past_fe_inj"]["lo"] <= 1 <= F["past_fe_inj"]["hi"])},
    "P5": {"text": "empties_county injuries interval includes 1", "held": bool(F["empties_inj"]["lo"] <= 1 <= F["empties_inj"]["hi"])},
    "P6": {"text": "run_county injuries interval includes 1", "held": bool(F["run_inj"]["lo"] <= 1 <= F["run_inj"]["hi"])},
}
R["H2_refuted"] = (not R["predictions"]["P3"]["held"]) and ("lo" in F["past_fe_inj"] and F["past_fe_inj"]["lo"] > 1)
(HERE / "data/results31.json").write_text(json.dumps(R, indent=1))
print(json.dumps({k: R[k] for k in ("n", "deaths", "injuries", "predictions", "H2_refuted", "corr_past_future")}, indent=1))
for k, v in F.items(): print(k, {kk: v[kk] for kk in v if kk in ("irr", "lo", "hi", "n", "converged", "past", "future", "error")})
