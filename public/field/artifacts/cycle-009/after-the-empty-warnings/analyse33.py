"""Study 33: do the empty warnings that broke a stated promise, or were left standing, carry the association?
Usage: python3 analyse33.py   (reads data/tornadoes31.tsv, data/tornadoes33.tsv; writes data/results33.json).
Models and predictions as fixed in PREREGISTRATION-33.md (commit c307e2e).
Controls, model and fixed-effect rule are study 31's (analyse.py), repeated here unchanged."""
import json, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
df = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
d33 = pd.read_csv(HERE / "data/tornadoes33.tsv", sep="\t", dtype={"start_utc": str, "office": str})
df = df.merge(d33.drop(columns=["yr"]), on=["om", "start_utc", "office"], how="inner", validate="one_to_one",
              suffixes=("_31", ""))
assert len(df) == len(d33) == 9171

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

V = ["far", "wexp", "excess", "broken", "taken"]
scales = {f"{v}_{w}": standardise(f"z_{v}_{w}", f"{v}_{w}") for v in V for w in ("past", "future")}
scales["far_past_31"] = standardise("z_far31", "far_past_31")

def fit(y, cols, data=None, first="nm"):
    data = df if data is None else data
    # declared deviation (README, found after the second run): a group of rows marked only by indicators
    # whose outcome is all zero sends those indicators to minus infinity and the fit does not converge
    # (study 31's P4, by rows). Such rows are left out and counted: each pattern of undefined exposures
    # with no event, and each binary control with no event among its rows.
    n0 = len(data)
    nones = [c for c in cols if c.endswith("_none")]
    if nones:
        pat = data[nones].astype(int).astype(str).agg("".join, axis=1)
        zero = data.groupby(pat)[y].transform("sum") == 0
        data = data[~(zero & (pat != "0" * len(nones)))]
    for c in [c for c in cols if c in M1 and set(data[c].unique()) <= {0.0, 1.0}]:
        if data.loc[data[c] == 1, y].sum() == 0: data = data[data[c] == 0]
    fit.rows_left_out = n0 - len(data)
    cols = [c for c in cols if data[c].std() > 0]
    cols = [c for i, c in enumerate(cols) if not any((data[c] == data[k]).all() for k in cols[:i])]
    # declared deviation (README, found after the first run): in 2016-2023 the two era dummies sum to the
    # constant, and within offices the region dummies are spanned by the office dummies; a column that
    # adds no rank to the ones before it is dropped, and the drop is recorded with the fit
    keep, dropped = [], []
    for c in cols:
        if np.linalg.matrix_rank(np.column_stack([np.ones(len(data))] + [data[k].values for k in keep + [c]])) == len(keep) + 2:
            keep.append(c)
        else:
            dropped.append(c)
    cols = keep; fit.dropped = dropped
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
                       "dropped_for_rank": fit.dropped, "rows_left_out": fit.rows_left_out,
                       **{e: irr(res, ci, e) for e in expos}}
    return R["fits"][name]

for y in ("inj", "fat"):
    run(f"far31_past_{y}", ["z_far31"], y)                                   # study 31's FAR on this subsample
    for w in ("past", "future"):
        run(f"far_{w}_{y}", [f"z_far_{w}"], y)                               # P1 (past, inj)
        run(f"wexp_excess_{w}_{y}", [f"z_wexp_{w}", f"z_excess_{w}"], y)     # P2, P3, P6
        run(f"taken_{w}_{y}", [f"z_far_{w}", f"z_taken_{w}"], y)             # P4
        run(f"broken_{w}_{y}", [f"z_far_{w}", f"z_broken_{w}"], y)           # P5
        run(f"wexp_{w}_{y}", [f"z_wexp_{w}"], y)                             # exploration
        run(f"excess_{w}_{y}", [f"z_excess_{w}"], y)                         # exploration
    run(f"excess_both_{y}", ["z_excess_past", "z_excess_future"], y)         # exploration

offices = sorted(df.office.unique())
for o in offices[1:]: df["off_" + o] = (df.office == o).astype(float)
for y in ("inj", "fat"):
    keep = df.groupby("office")[y].transform("sum") > 0
    sub = df[keep].copy()
    fe = ["off_" + o for o in sorted(sub.office.unique())[1:]]
    for e in ("excess", "far", "wexp", "taken"):
        run(f"{e}_past_fe_{y}", [f"z_{e}_past"], y, extra=fe, data=sub, first="bfgs")   # P7 = excess, inj
        R["fits"][f"{e}_past_fe_{y}"]["offices_dropped"] = int(df.office.nunique() - sub.office.nunique())

c = lambda a, b: round(float(df[[a, b]].dropna().corr().iloc[0, 1]), 4)
R["corr"] = {"far_tag_vs_far31": c("far_past", "far_past_31"), "wexp_vs_far": c("wexp_past", "far_past"),
             "excess_vs_far": c("excess_past", "far_past"), "taken_vs_far": c("taken_past", "far_past"),
             "broken_vs_far": c("broken_past", "far_past"), "wexp_past_future": c("wexp_past", "wexp_future"),
             "excess_past_future": c("excess_past", "excess_future")}
R["outcomes"] = {"inj": int(df.inj.sum()), "fat": int(df.fat.sum()), "offices": int(df.office.nunique())}

F = R["fits"]
inc1 = lambda f: f["lo"] <= 1 <= f["hi"]
inside = lambda fut, past: past["lo"] <= fut["irr"] <= past["hi"]
P = {
 "P1": ("FAR_tag past injuries IRR >= 1.05", F["far_past_inj"]["z_far_past"]["irr"] >= 1.05),
 "P2": ("with EXCESS, WEXP past injuries interval above 1", F["wexp_excess_past_inj"]["z_wexp_past"]["lo"] > 1),
 "P3": ("with WEXP, EXCESS past injuries interval includes 1", inc1(F["wexp_excess_past_inj"]["z_excess_past"])),
 "P4": ("with FAR, TAKEN past injuries interval includes 1", inc1(F["taken_past_inj"]["z_taken_past"])),
 "P5": ("with FAR, BROKEN past injuries interval includes 1", inc1(F["broken_past_inj"]["z_broken_past"])),
 "P6": ("WEXP and EXCESS future IRRs inside their past intervals",
        inside(F["wexp_excess_future_inj"]["z_wexp_future"], F["wexp_excess_past_inj"]["z_wexp_past"]) and
        inside(F["wexp_excess_future_inj"]["z_excess_future"], F["wexp_excess_past_inj"]["z_excess_past"])),
 "P7": ("office FE, EXCESS past injuries interval includes 1", inc1(F["excess_past_fe_inj"]["z_excess_past"])),
}
R["predictions"] = {k: {"text": t, "held": bool(h)} for k, (t, h) in P.items()}
ex_p, ex_f = F["wexp_excess_past_inj"]["z_excess_past"], F["wexp_excess_future_inj"]["z_excess_future"]
R["reputation_by_word"] = ("supported" if ex_p["lo"] > 1 and ex_f["irr"] < ex_p["lo"] else
                           "refuted" if P["P3"][1] and inside(ex_f, ex_p) else "undecided")
(HERE / "data/results33.json").write_text(json.dumps(R, indent=1))
print(json.dumps({k: R[k] for k in ("n", "outcomes", "corr", "predictions", "reputation_by_word")}, indent=1))
for k, v in F.items():
    print(k, v["n"], v["converged"], {e: (v[e]["irr"], v[e]["lo"], v[e]["hi"]) for e in v if e.startswith("z_")})
