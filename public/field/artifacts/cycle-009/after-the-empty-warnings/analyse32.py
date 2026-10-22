"""Study 32: does study 31's finding survive when "empty" is judged by the final database?
Usage: python3 analyse32.py   (reads data/tornadoes31.tsv, data/tornadoes32.tsv, data/results31.json;
writes data/results32.json). Models and predictions as fixed in PREREGISTRATION-32.md (commit 59db990).
Controls, model and fixed-effect rule are study 31's (analyse.py), repeated here unchanged."""
import json, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
df = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
d32 = pd.read_csv(HERE / "data/tornadoes32.tsv", sep="\t")
assert (df[["om", "yr", "start_utc", "office"]].values == d32[["om", "yr", "start_utc", "office"]].values).all()
for c in ("far_final_past", "far_final_future", "revision_past", "unseen_past"): df[c] = d32[c]
R31 = json.loads((HERE / "data/results31.json").read_text())

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

def standardise(col, src):
    x = df[src].astype(float); ok = x.notna()
    mu, sd = x[ok].mean(), x[ok].std()
    df[col] = ((x - mu) / sd).where(ok, 0.0)
    df[col + "_none"] = (~ok).astype(float)
    return {"mean": round(float(mu), 4), "sd": round(float(sd), 4), "undefined": int((~ok).sum())}

scales = {"far_final_past": standardise("z_ffp", "far_final_past"),
          "far_final_future": standardise("z_fff", "far_final_future"),
          "revision_past": standardise("z_rev", "revision_past"),
          "unseen_past": standardise("z_uns", "unseen_past"),
          "far_past": standardise("z_far_past", "far_past")}

def fit(y, cols, data=None, first="nm"):
    data = df if data is None else data
    cols = [c for c in cols if data[c].std() > 0]
    # declared deviation (README): two exposures undefined on the same rows share one indicator;
    # an exact duplicate column makes the covariance singular, so only the first is kept
    cols = [c for i, c in enumerate(cols) if not any((data[c] == data[k]).all() for k in cols[:i])]
    X = sm.add_constant(data[cols])
    pois = sm.GLM(data[y], X, family=sm.families.Poisson()).fit()
    m = sm.NegativeBinomial(data[y], X, loglike_method="nb2")
    res = m.fit(start_params=np.append(pois.params.values, 1.0), cov_type="HC0", disp=0,
                maxiter=2000 if first == "nm" else 5000, method=first)
    res = m.fit(start_params=res.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    return res, res.conf_int(), bool(res.mle_retvals.get("converged", False))

def irr(res, ci, c):
    return {"irr": round(float(np.exp(res.params[c])), 3), "lo": round(float(np.exp(ci.loc[c, 0])), 3),
            "hi": round(float(np.exp(ci.loc[c, 1])), 3), "p": float(res.pvalues[c])}

R = {"n": int(len(df)), "scales": scales, "fits": {}}
def run(name, expos, y, extra=(), data=None, first="nm"):
    cols = [c for e in expos for c in (e, e + "_none")] + M1 + list(extra)
    res, ci, conv = fit(y, cols, data, first)
    R["fits"][name] = {"y": y, "n": int(res.nobs), "converged": conv, "alpha": round(float(res.params["alpha"]), 3),
                       **{e: irr(res, ci, e) for e in expos}}
    return R["fits"][name]

for y in ("inj", "fat"):
    run(f"final_past_{y}", ["z_ffp"], y)
    run(f"final_future_{y}", ["z_fff"], y)
    run(f"revision_{y}", ["z_rev"], y)
    run(f"unseen_{y}", ["z_uns"], y)                                        # exploration
    run(f"final_and_revision_{y}", ["z_ffp", "z_rev"], y)                   # P7 (inj); fat exploration
    run(f"final_both_{y}", ["z_ffp", "z_fff"], y)                           # exploration
    run(f"office_and_final_{y}", ["z_far_past", "z_ffp"], y)                # exploration

offices = sorted(df.office.unique())
for o in offices[1:]: df["off_" + o] = (df.office == o).astype(float)
for y in ("inj", "fat"):
    keep = df.groupby("office")[y].transform("sum") > 0
    sub = df[keep].copy()
    fe = ["off_" + o for o in sorted(sub.office.unique())[1:]]
    run(f"final_past_fe_{y}", ["z_ffp"], y, extra=fe, data=sub, first="bfgs")
    R["fits"][f"final_past_fe_{y}"]["offices_dropped"] = int(df.office.nunique() - sub.office.nunique())
    run(f"final_future_fe_{y}", ["z_fff"], y, extra=fe, data=sub, first="bfgs")   # exploration
    run(f"office_past_fe_{y}", ["z_far_past"], y, extra=fe, data=sub, first="bfgs")  # study 31's fit, this path

both = df[["far_past", "far_final_past"]].dropna()
R["corr_office_final_past"] = round(float(both.corr().iloc[0, 1]), 4)
R["mean_far"] = {"office": round(float(both.far_past.mean()), 4), "final": round(float(both.far_final_past.mean()), 4)}
R["corr_final_past_future"] = round(float(df[["far_final_past", "far_final_future"]].dropna().corr().iloc[0, 1]), 3)

F, F31 = R["fits"], R31["fits"]
inc1 = lambda f: f["lo"] <= 1 <= f["hi"]
R["predictions"] = {
    "P1": {"text": "corr(office FAR_past, final FAR_past) >= 0.85", "held": bool(R["corr_office_final_past"] >= 0.85)},
    "P2": {"text": "final FAR_past injuries IRR > 1, interval above 1", "held": bool(F["final_past_inj"]["z_ffp"]["lo"] > 1)},
    "P3": {"text": "final FAR_past injuries IRR inside study 31's office interval",
           "held": bool(F31["past_inj"]["lo"] <= F["final_past_inj"]["z_ffp"]["irr"] <= F31["past_inj"]["hi"])},
    "P4": {"text": "final FAR_future deaths interval above 1", "held": bool(F["final_future_fat"]["z_fff"]["lo"] > 1)},
    "P5": {"text": "office FE: final FAR_past injuries interval includes 1", "held": bool(inc1(F["final_past_fe_inj"]["z_ffp"]))},
    "P6": {"text": "revision_past injuries interval includes 1", "held": bool(inc1(F["revision_inj"]["z_rev"]))},
    "P7": {"text": "with revision_past, final FAR_past injuries interval above 1",
           "held": bool(F["final_and_revision_inj"]["z_ffp"]["lo"] > 1)},
}
R["H3_refuted"] = (not R["predictions"]["P4"]["held"]) and (not R["predictions"]["P5"]["held"])
(HERE / "data/results32.json").write_text(json.dumps(R, indent=1))
print(json.dumps({k: R[k] for k in ("n", "corr_office_final_past", "mean_far", "corr_final_past_future", "predictions", "H3_refuted")}, indent=1))
for k, v in F.items():
    print(k, v["n"], v["converged"], {e: (v[e]["irr"], v[e]["lo"], v[e]["hi"]) for e in v if e.startswith("z_")})
