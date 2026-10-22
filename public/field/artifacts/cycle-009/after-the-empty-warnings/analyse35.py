"""Study 35: the habit village's price, sought in casualties; and the Studio's 39 %.
Usage: python3 -I analyse35.py <studio record.js @c746704>   (writes data/results35.json)
Models and predictions as fixed in PREREGISTRATION-35.md (commit c0edd05)."""
import json, sys, hashlib, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
REC = pathlib.Path(sys.argv[1])
assert hashlib.sha256(REC.read_bytes()).hexdigest().startswith("51297c2d"), "record.js is not c746704's"
df = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
df = df[df.warned == 1].copy()

# study 31's M1 controls, without `warned`
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
df["night"] = df.night.astype(float)
M1 = ["EF1", "EF2", "EF3", "EF4+", "log_len", "log_wid", "night", "era_2012_16", "era_2017_23",
      "Northeast", "Midwest", "West", "log_density", "log_exposure"]

def cat(r):
    if r.warnings_county_1y == 0: return "none"
    if r.run_county == 0: return "hit"
    return "run12" if r.run_county <= 2 else "run3"
df["cat"] = df.apply(cat, axis=1)
for c in ("none", "run12", "run3"): df["c_" + c] = (df.cat == c).astype(float)
CATS = ["c_none", "c_run12", "c_run3"]

def fit(y, cols):
    X = sm.add_constant(df[cols])
    pois = sm.GLM(df[y], X, family=sm.families.Poisson()).fit()
    m = sm.NegativeBinomial(df[y], X, loglike_method="nb2")
    res = m.fit(start_params=np.append(pois.params.values, 1.0), cov_type="HC0", disp=0, maxiter=2000, method="nm")
    res = m.fit(start_params=res.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    return res

def irr(res, c):
    ci = res.conf_int()
    return {"irr": round(float(np.exp(res.params[c])), 3), "lo": round(float(np.exp(ci.loc[c, 0])), 3),
            "hi": round(float(np.exp(ci.loc[c, 1])), 3), "p": float(res.pvalues[c])}

R = {"n_warned": int(len(df)), "by_cat": {}, "fits": {}}
for c, g in df.groupby("cat"):
    R["by_cat"][c] = {"n": int(len(g)), "injured": int(g.inj.sum()), "dead": int(g.fat.sum()),
                      "inj_per_100": round(100 * g.inj.mean(), 2), "dead_per_100": round(100 * g.fat.mean(), 2),
                      "share_EF2plus": round(float((g.ef >= 2).mean()), 3)}
for y in ("inj", "fat"):
    res = fit(y, CATS + M1)
    R["fits"][y] = {"n": int(res.nobs), "converged": bool(res.mle_retvals.get("converged", False)),
                    "alpha": round(float(res.params["alpha"]), 3), **{c[2:]: irr(res, c) for c in CATS}}

# the villages' prices (PREREGISTRATION-35, table)
w = {"inj": 1 - 0.614, "fat": 1 - 0.894}
P5J = {"after_run_r_W": 0.9588637051705554, "after_hit_r_W": 1.0216736458723723, "after_run_r_H": 0.27194614941384854}
price = lambda y, br, bh: (1 - w[y] * br) / (1 - w[y] * bh)
R["prices"] = {y: {"habit": round(price(y, P5J["after_run_r_H"], 1.0), 3),
                   "learning": round(price(y, P5J["after_run_r_W"], P5J["after_hit_r_W"]), 3)} for y in w}
# exploration (after the registered results were seen; the registered h-search hit its grid floor):
# the largest price any habit can charge is total disbelief after a run, 1 / (1 - w); and the sample
# multiple at which the injuries interval would separate habit from learning (80 % power, 5 % two-sided)
f = R["fits"]["inj"]["run3"]
se = (np.log(f["hi"]) - np.log(f["lo"])) / (2 * 1.959964)
gap = np.log(Pr0 := R["prices"]["inj"]["habit"]) - np.log(R["prices"]["inj"]["learning"])
R["explore"] = {"habit_price_total_disbelief_inj": round(1 / (1 - w["inj"]), 3),
                "habit_price_total_disbelief_fat": round(1 / (1 - w["fat"]), 3),
                "se_log_run3_inj": round(float(se), 4),
                "sample_multiple_80pct": round(float((se / (gap / (1.959964 + 0.841621))) ** 2), 2)}

# Part B: the Studio's deadly tornadoes
rec = json.loads(REC.read_text().strip()[len("window.TCA_RECORD="):].rstrip(";"))
dead = [d for d in rec["dead"] if d[4] >= 0]
deaths = np.array([d[1] for d in dead]); deep = np.array([d[4] >= 3 for d in dead])
share_w = float(deaths[deep].sum() / deaths.sum())
share_t = float(deep.mean())
rng = np.random.default_rng(35)
bs = []
for _ in range(10000):
    i = rng.integers(0, len(dead), len(dead))
    bs.append(deaths[i][deep[i]].sum() / deaths[i].sum())
lo, hi_b = np.percentile(bs, [2.5, 97.5])
top = sorted(dead, key=lambda d: -d[1])[:10]
R["studio"] = {"deadly_all": len(rec["dead"]), "deadly_warned": len(dead), "dead_warned": int(deaths.sum()),
               "dead_run3": int(deaths[deep].sum()), "share_deaths_run3": round(share_w, 4),
               "boot95": [round(float(lo), 4), round(float(hi_b), 4)], "share_tornadoes_run3": round(share_t, 4),
               "tornadoes_run3": int(deep.sum()), "baseline_hits": 0.3125,
               "top10": [{"om": d[0], "dead": d[1], "year": d[2], "run": d[4]} for d in top]}

F = R["fits"]; Pr = R["prices"]
inside = lambda f, v: f["lo"] <= v <= f["hi"]
R["predictions"] = {
    "P1": {"text": "injuries run3 vs hit: upper bound below habit's 1.46", "held": bool(F["inj"]["run3"]["hi"] < Pr["inj"]["habit"])},
    "P2": {"text": "injuries run3 vs hit: interval includes learning's 1.04", "held": bool(inside(F["inj"]["run3"], Pr["inj"]["learning"]))},
    "P3": {"text": "deaths run3 vs hit: interval includes both 1.01 and 1.09",
           "held": bool(inside(F["fat"]["run3"], Pr["fat"]["learning"]) and inside(F["fat"]["run3"], Pr["fat"]["habit"]))},
    "P4": {"text": "injuries run1-2 vs hit: interval includes 1", "held": bool(inside(F["inj"]["run12"], 1.0))},
    "P5": {"text": "bootstrap 95% of death-weighted share includes 0.31", "held": bool(lo <= 0.31 <= hi_b)},
    "P6": {"text": "per-tornado share nearer 0.31 than death-weighted share", "held": bool(abs(share_t - 0.31) < abs(share_w - 0.31))},
}
(HERE / "data/results35.json").write_text(json.dumps(R, indent=1) + "\n")
print(json.dumps(R, indent=1))
