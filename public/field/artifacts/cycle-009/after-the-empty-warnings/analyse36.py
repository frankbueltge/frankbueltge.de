"""Study 36: does study 35's ratio stand on one tornado? (coda to the presented cycle 009)
Usage: python3 -I analyse36.py <studio record.js @c746704>   (writes data/results36.json)
Model, data and predictions as fixed in PREREGISTRATION-36.md (commit a1aa9ef)."""
import json, sys, hashlib, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
REC = pathlib.Path(sys.argv[1])
assert hashlib.sha256(REC.read_bytes()).hexdigest().startswith("51297c2d"), "record.js is not c746704's"
JOPLIN, TUSCALOOSA = 296616, 314625
ALL = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
ALL = ALL[ALL.warned == 1].copy()

# study 35's design matrix, unchanged
d = ALL
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

def fit(df, y):
    X = sm.add_constant(df[CATS + M1])
    pois = sm.GLM(df[y], X, family=sm.families.Poisson()).fit()
    m = sm.NegativeBinomial(df[y], X, loglike_method="nb2")
    res = m.fit(start_params=np.append(pois.params.values, 1.0), cov_type="HC0", disp=0, maxiter=2000, method="nm")
    res = m.fit(start_params=res.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    ci = res.conf_int()
    return {"irr": round(float(np.exp(res.params["c_run3"])), 3), "lo": round(float(np.exp(ci.loc["c_run3", 0])), 3),
            "hi": round(float(np.exp(ci.loc["c_run3", 1])), 3),
            "converged": bool(res.mle_retvals.get("converged", False))}

R = {"n_warned": int(len(d)), "sets": {}, "loo": []}
sets = {"all": [], "without_joplin": [JOPLIN], "without_tuscaloosa": [TUSCALOOSA],
        "without_both": [JOPLIN, TUSCALOOSA]}
for name, drop in sets.items():
    s = d[~d.om.isin(drop)]
    R["sets"][name] = {"n": int(len(s)), "inj": fit(s, "inj"), "fat": fit(s, "fat")}
top = d.sort_values("inj", ascending=False).head(30)
for _, r in top.iterrows():
    s = d[d.om != r.om]
    R["loo"].append({"om": int(r.om), "date": r.start_utc[:10], "st": r.st, "inj": int(r.inj), "fat": int(r.fat),
                     "cat": r["cat"], "inj_run3": fit(s, "inj"), "fat_run3": fit(s, "fat")})
    print(R["loo"][-1]["om"], R["loo"][-1]["cat"], R["loo"][-1]["inj_run3"]["irr"], file=sys.stderr)

# the Studio's share, Joplin set aside. record.js rows: [id, deaths, ?, ?, run], run -1 = unwarned; only fields 1 and 4
# are read. Joplin is the one row with 158 dead (the Studio's resample.json names its largest tornado so).
rec = json.loads(REC.read_text().strip()[len("window.TCA_RECORD="):].rstrip(";"))
rows = rec["dead"]
jop = [x for x in rows if x[1] == 158]
assert len(jop) == 1, jop
keep = [x for x in rows if x is not jop[0]]
deaths = np.array([x[1] for x in keep]); deep = np.array([x[4] >= 3 for x in keep]); warned = np.array([x[4] >= 0 for x in keep])
rng = np.random.default_rng(36)
bs_all, bs_w = [], []
for _ in range(10000):
    i = rng.integers(0, len(keep), len(keep))
    bs_all.append(deaths[i][deep[i]].sum() / deaths[i].sum())
    wi = i[warned[i]]
    bs_w.append(deaths[wi][deep[wi]].sum() / deaths[wi].sum())
R["studio"] = {"joplin_row": jop[0], "deadly_without": len(keep),
               "share_all_dead": round(float(deaths[deep].sum() / deaths.sum()), 4),
               "boot95_all": [round(float(v), 4) for v in np.percentile(bs_all, [2.5, 97.5])],
               "share_warned_dead": round(float(deaths[deep & warned].sum() / deaths[warned].sum()), 4),
               "boot95_warned": [round(float(v), 4) for v in np.percentile(bs_w, [2.5, 97.5])],
               "studio_claim": {"share_all_dead": 0.3159, "interval": [0.2104, 0.4308]}}

S = R["sets"]; inside = lambda f, v: f["lo"] <= v <= f["hi"]
LEARN, HABIT = 1.04, 1.46
loo_pts = [x["inj_run3"]["irr"] for x in R["loo"]]
R["predictions"] = {
    "P1": {"text": "without Joplin, injuries run3 point below 1.21 and interval holds 1.04 and 1.46",
           "held": bool(S["without_joplin"]["inj"]["irr"] < 1.214 and inside(S["without_joplin"]["inj"], LEARN) and inside(S["without_joplin"]["inj"], HABIT))},
    "P2": {"text": "without both, injuries run3 interval holds 1.04 and 1.46",
           "held": bool(inside(S["without_both"]["inj"], LEARN) and inside(S["without_both"]["inj"], HABIT))},
    "P3": {"text": "without Joplin, deaths run3 point falls by more than 0.10 and interval holds 1",
           "held": bool(S["all"]["fat"]["irr"] - S["without_joplin"]["fat"]["irr"] > 0.10 and inside(S["without_joplin"]["fat"], 1.0))},
    "P4": {"text": "every one of 30 leave-one-out injuries run3 points inside 0.80-1.84",
           "held": bool(all(0.802 <= p <= 1.837 for p in loo_pts)), "range": [min(loo_pts), max(loo_pts)]},
    "P5": {"text": "Studio's 31.6 % without Joplin reproduces within 0.5 points, interval holds 0.31",
           "held": bool(abs(R["studio"]["share_all_dead"] - 0.3159) <= 0.005 and R["studio"]["boot95_all"][0] <= 0.31 <= R["studio"]["boot95_all"][1])},
}
(HERE / "data/results36.json").write_text(json.dumps(R, indent=1) + "\n")
print(json.dumps({"sets": R["sets"], "studio": R["studio"], "predictions": R["predictions"]}, indent=1))
