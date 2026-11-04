"""Study 16: do warnings over more people per km2 verify more often?
Usage: python3 analyse.py   (reads data/where.tsv, writes data/results.json)"""
import json, math, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
df = pd.read_csv(HERE / "data/where.tsv", sep="\t", keep_default_na=False)
df["n_V"], df["n_S"] = df.V, df.S  # study 14's columns count matched tornadoes
df["V"], df["S"] = (df.n_V > 0).astype(int), (df.n_S > 0).astype(int)
df["maxmag"] = pd.to_numeric(df.maxmag_V.replace("None", np.nan))
df["log_density"] = np.log10(df.people + 1) - np.log10(df.area_km2)
df["log_area"] = np.log10(df.area_km2)
df["log_minutes"] = np.log10(df.minutes.clip(lower=1))
df["night"] = (df.utc_hour < 12).astype(float)
df["q"] = pd.qcut(df.log_density.rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)

def wilson(k, n, z=1.96):
    p = k / n; d = 1 + z * z / n; c = p + z * z / (2 * n); h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round(100 * p, 2), round(100 * (c - h) / d, 2), round(100 * (c + h) / d, 2)]

R = {"n": int(len(df)), "people_zero": int((df.people == 0).sum()),
     "V_all": wilson(int(df.V.sum()), len(df)), "quintiles": []}
for q, g in df.groupby("q"):
    ver = g[g.V == 1]
    weak = int((ver.maxmag <= 0).sum())
    R["quintiles"].append({"q": int(q), "n": int(len(g)),
        "density_range": [round(10 ** g.log_density.min(), 3), round(10 ** g.log_density.max(), 3)],
        "median_density": round(float(10 ** g.log_density.median()), 2),
        "median_area_km2": round(float(g.area_km2.median()), 1),
        "V": wilson(int(g.V.sum()), len(g)), "S": wilson(int(g.S.sum()), len(g)),
        "weak_among_verified": wilson(weak, len(ver)) if len(ver) else None,
        "night_V": wilson(int(g[g.night == 1].V.sum()), int((g.night == 1).sum())),
        "day_V": wilson(int(g[g.night == 0].V.sum()), int((g.night == 0).sum())),
        "early_V": wilson(int(g[g.year <= 2011].V.sum()), int((g.year <= 2011).sum())),
        "late_V": wilson(int(g[g.year >= 2012].V.sum()), int((g.year >= 2012).sum())),
        "severe_among_never": wilson(int((g[g.V == 0].tier == "severe").sum()), int((g.V == 0).sum())),
        "nothing_among_never": wilson(int((g[g.V == 0].tier == "nothing").sum()), int((g.V == 0).sum()))})
Q = {d["q"]: d for d in R["quintiles"]}

# adjusted model: WFO and year fixed effects, cluster-robust by WFO
counts = df.wfo.value_counts()
df["stratum"] = np.where(df.wfo.map(counts) < 30, "_pooled", df.wfo)
def fit(outcome, extra=()):
    X = pd.concat([df[["log_density", "log_area", "log_minutes", "night", *extra]],
                   pd.get_dummies(df.stratum, prefix="w", drop_first=True, dtype=float),
                   pd.get_dummies(df.year, prefix="y", drop_first=True, dtype=float)], axis=1)
    X = sm.add_constant(X)
    groups = pd.factorize(df.stratum)[0]
    m = sm.Logit(df[outcome].astype(float), X).fit(disp=0, maxiter=200, cov_type="cluster", cov_kwds={"groups": groups})
    b, se = m.params["log_density"], m.bse["log_density"]
    out = {"or_per_tenfold_density": [round(math.exp(b), 3), round(math.exp(b - 1.96 * se), 3), round(math.exp(b + 1.96 * se), 3)],
           "or_per_tenfold_area": [round(math.exp(m.params["log_area"]), 3)],
           "or_night": round(math.exp(m.params["night"]), 3), "converged": bool(m.mle_retvals["converged"]),
           "n_strata": int(df.stratum.nunique())}
    return m, X, out
mV, XV, R["adjusted_V"] = fit("V")
_, _, R["adjusted_S"] = fit("S")

# exploratory counterfactual: every warning at its own covariates but its WFO's top-quintile density
top_density = df[df.q == 5].groupby("stratum").log_density.median()
X2 = XV.copy()
X2["log_density"] = np.maximum(df.log_density, df.stratum.map(top_density).fillna(df.log_density))
p0, p1 = mV.predict(XV).mean(), mV.predict(X2).mean()
R["counterfactual"] = {"far_model_now": round(float(100 * (1 - p0)), 2), "far_if_top_quintile_density": round(float(100 * (1 - p1)), 2)}

def verdict(diff, bar):
    return "undecided" if abs(diff - bar) <= 0.5 else ("held" if diff >= bar else "failed")
d1 = Q[5]["V"][0] - Q[1]["V"][0]
or_ = R["adjusted_V"]["or_per_tenfold_density"]
d3 = Q[5]["S"][0] - Q[1]["S"][0]
d4 = Q[5]["weak_among_verified"][0] - Q[1]["weak_among_verified"][0]
R["predictions"] = {
    "P1": {"top_minus_bottom_V": round(d1, 2), "bar": 5, "verdict": verdict(d1, 5)},
    "P2": {"or": or_, "verdict": "held" if or_[1] > 1 else "failed"},
    "P3": {"top_minus_bottom_S": round(d3, 2), "bar": 3, "verdict": verdict(d3, 3)},
    "P4": {"top_minus_bottom_weak": round(d4, 2), "bar": 5, "verdict": verdict(d4, 5)},
    "refutation_fired": bool(or_[2] < 1)}
(HERE / "data/results.json").write_text(json.dumps(R, indent=1))
print(json.dumps(R["predictions"], indent=1)); print(json.dumps(R["adjusted_V"]), json.dumps(R["adjusted_S"]), R["counterfactual"])
for d in R["quintiles"]: print(d["q"], d["n"], d["median_density"], d["median_area_km2"], d["V"], d["S"], d["weak_among_verified"], d["night_V"], d["day_V"], d["early_V"], d["late_V"], d["severe_among_never"], d["nothing_among_never"])

# ---- post hoc, declared in README (not registered) ----
P = {}
ver = df[df.V == 1]
P["maxmag_mix_among_verified_by_quintile"] = {int(q): {str(int(k)): round(100 * v, 2) for k, v in g.maxmag.value_counts(normalize=True).sort_index().items()}
                                              for q, g in ver.groupby("q")}
P["efu_years"] = {int(y): int(n) for y, n in ver[ver.maxmag == -9].year.value_counts().sort_index().items()}
P["ef0_only_q1_q5"] = [round(100 * ((g.maxmag == 0).mean()), 2) for q, g in ver.groupby("q") if q in (1, 5)]
P["efu_only_q1_q5"] = [round(100 * ((g.maxmag == -9).mean()), 2) for q, g in ver.groupby("q") if q in (1, 5)]
def fit_sub(mask):
    sub = df[mask]
    X = pd.concat([sub[["log_density", "log_area", "log_minutes"]],
                   pd.get_dummies(sub.stratum, prefix="w", drop_first=True, dtype=float),
                   pd.get_dummies(sub.year, prefix="y", drop_first=True, dtype=float)], axis=1)
    m = sm.Logit(sub.V.astype(float), sm.add_constant(X)).fit(disp=0, maxiter=200, cov_type="cluster",
                                                             cov_kwds={"groups": pd.factorize(sub.stratum)[0]})
    b, se = m.params["log_density"], m.bse["log_density"]
    return [round(math.exp(b), 3), round(math.exp(b - 1.96 * se), 3), round(math.exp(b + 1.96 * se), 3)]
P["or_density_night"] = fit_sub(df.night == 1)
P["or_density_day"] = fit_sub(df.night == 0)
P["or_density_2008_11"] = fit_sub(df.year <= 2011)
P["or_density_2012_23"] = fit_sub(df.year >= 2012)
P["or_density_people_gt0"] = fit_sub(df.people > 0)
R["post_hoc"] = P
(HERE / "data/results.json").write_text(json.dumps(R, indent=1, default=float))
print(json.dumps(P, indent=0))
