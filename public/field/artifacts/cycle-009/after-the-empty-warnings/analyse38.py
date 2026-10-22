"""Study 38: do the tornadoes that carry the ratio stand in the Weather Service's own record? (third coda)
Usage: python3 -I analyse38.py <dir holding the NCEI StormEvents_details-*.csv.gz files>   (writes data/results38.json)
Method and predictions as fixed in PREREGISTRATION-38.md (commit 4441dbe). Manifest: data/sources38.json."""
import json, sys, re, glob, pathlib, warnings
import numpy as np, pandas as pd
import statsmodels.api as sm
warnings.simplefilter("ignore")
HERE = pathlib.Path(__file__).resolve().parent
SE_DIR = pathlib.Path(sys.argv[1])
STATE = {"OK": "OKLAHOMA", "TX": "TEXAS", "AR": "ARKANSAS", "LA": "LOUISIANA", "NC": "NORTH CAROLINA",
         "KY": "KENTUCKY", "IA": "IOWA", "NE": "NEBRASKA"}
LEARN, HABIT = 1.04, 1.46
R37 = json.loads((HERE / "data/results37.json").read_text())
# the eleven: study 37's ten new refits and om 613559 (study 36's refit of it: 1.302)
ELEVEN = [(x["om"], x["date"]) for x in R37["refits"]] + [(613559, "2016-02-23")]
REFIT = {(x["om"], x["date"]): x["refit"] for x in R37["refits"]}

# the NWS Norman office's own event page for 24 May 2011 (fetched this session; manifest in sources38.json)
OUN_D3 = {"url": "https://www.weather.gov/oun/events-20110524", "tornado": "D3", "injured": 1,
          "quote": "struck and semi truck, lifting and destroying the trailer, lofting the pieces to the north, and injuring the truck driver"}

se = pd.concat([pd.read_csv(f, low_memory=False) for f in sorted(glob.glob(str(SE_DIR / "StormEvents_details-*.csv.gz")))])
se = se[se.EVENT_TYPE == "Tornado"].copy()
off = se.CZ_TIMEZONE.str.extract(r"([-+]\d+)")[0].astype(int)
local = pd.to_datetime(se.BEGIN_YEARMONTH.astype(str) + se.BEGIN_DAY.astype(str).str.zfill(2)
                       + se.BEGIN_TIME.astype(str).str.zfill(4), format="%Y%m%d%H%M")
se["utc"] = local - pd.to_timedelta(off, unit="h")

d = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
d["date"] = d.start_utc.str[:10]
CONT = re.compile(r"moved (out of|from) \w[\w .]* (county|parish) into|continued (from|out of)", re.I)

recs = []
for om, date in ELEVEN:
    r = d[(d.om == om) & (d.date == date)].iloc[0]
    c = se[(se.STATE == STATE[r.st]) & ((se.utc - pd.Timestamp(r.start_utc)).abs() <= pd.Timedelta("10min"))
           & (se.TOR_F_SCALE == f"EF{int(r.mag)}")]
    rec = {"om": int(om), "date": date, "st": r.st, "spc": {"ef": int(r.mag), "inj": int(r.inj), "fat": int(r.fat),
           "len_mi": float(r.len_mi), "wid_yd": float(r.wid_yd)}, "n_candidates": int(len(c))}
    # tie rule, added after the first run (three ties, all read "unmatched"): the candidate nearest in begin time,
    # only if it is strictly nearer than the next; DEVIATIONS in results38.json records it
    if len(c) > 1:
        c = c.assign(gap=(c.utc - pd.Timestamp(r.start_utc)).abs()).sort_values("gap")
        if c.gap.iloc[0] < c.gap.iloc[1]: c = c.iloc[:1]
    if len(c) != 1:
        rec |= {"class": "unmatched", "n_candidates": int(len(c))}; recs.append(rec); continue
    s = c.iloc[0]
    # follow the track forward through TOR_OTHER_CZ_* within the same episode
    segs = [s]
    while isinstance(segs[-1].TOR_OTHER_CZ_NAME, str):
        nx = se[(se.EPISODE_ID == s.EPISODE_ID) & (se.CZ_NAME == segs[-1].TOR_OTHER_CZ_NAME)
                & (se.utc >= segs[-1].utc) & (se.utc <= segs[-1].utc + pd.Timedelta("30min"))].sort_values("utc")
        if not len(nx): break
        segs.append(nx.iloc[0])
    in_state = [x for x in segs if x.STATE == s.STATE]
    nar = s.EVENT_NARRATIVE if isinstance(s.EVENT_NARRATIVE, str) else ""
    inj = int(sum(x.INJURIES_DIRECT + x.INJURIES_INDIRECT for x in in_state))
    m = CONT.search(nar)
    rec |= {"event_id": int(s.EVENT_ID), "episode_id": int(s.EPISODE_ID), "county": s.CZ_NAME,
            "segments": [int(x.EVENT_ID) for x in segs], "se_inj": inj,
            "se_len_mi": round(float(sum(x.TOR_LENGTH for x in segs)), 2), "se_wid_yd": float(max(x.TOR_WIDTH for x in segs)),
            "other_state": any(x.STATE != s.STATE for x in segs),
            "narrative_mentions_injuries": bool(re.search(r"injur", nar, re.I)),
            "continues_from_earlier_segment": m.group(0) if m else None,
            "narrative": nar}
    rec["class"] = "agrees" if inj == int(r.inj) else "differs"
    recs.append(rec)

# om 315890: the issuing office's own event page gives 1 injured, not 32 (see sources38.json)
mc = next(x for x in recs if x["om"] == 315890)
mc["oun_page"] = OUN_D3
if mc["class"] == "agrees" and OUN_D3["injured"] != mc["spc"]["inj"]:
    mc["class"] = "contradicted"
# om 613559: the narrative says it entered St James from Assumption Parish; the SPC file splits it in two
la = next(x for x in recs if x["om"] == 613559)
prev = d[(d.date == "2016-02-23") & (d.st == "LA") & (d.ugc == "LAC007")].iloc[0]
la["spc_earlier_row"] = {"om": int(prev.om), "ef": int(prev.mag), "len_mi": float(prev.len_mi), "wid_yd": float(prev.wid_yd),
                         "inj": int(prev.inj), "warned": int(prev.warned)}

# study 35's injuries model, unchanged (as analyse37.py)
def design(d):
    d = d[d.warned == 1].copy().reset_index(drop=True)
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
    def cat(r):
        if r.warnings_county_1y == 0: return "none"
        if r.run_county == 0: return "hit"
        return "run12" if r.run_county <= 2 else "run3"
    d["cat"] = d.apply(cat, axis=1)
    for c in ("none", "run12", "run3"): d["c_" + c] = (d.cat == c).astype(float)
    return d
M1 = ["EF1", "EF2", "EF3", "EF4+", "log_len", "log_wid", "night", "era_2012_16", "era_2017_23",
      "Northeast", "Midwest", "West", "log_density", "log_exposure"]
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
def mu_of(res, df, om, date):
    i = df.index[(df.om == om) & (df.date == date)][0]
    return round(float(np.asarray(res.predict())[i]), 2)

base = design(d)
_, r0 = fit(base)
full = ratio(r0)
fits = {"full": full}
# step 5 (pre-registered): without every tornado classed differs / contradicted / unmatched, together
flag = [(x["om"], x["date"]) for x in recs if x["class"] != "agrees"]
keep = ~pd.Series([(o, t) in flag for o, t in zip(base.om, base.date)])
_, r5 = fit(base[keep.values].reset_index(drop=True))
fits["step5_without_flagged"] = ratio(r5) | {"left_out": [o for o, _ in flag]}

# exploratory, not pre-registered: correct the record instead of dropping it
def corrected(mcloud=False, louisiana=False):
    x = d.copy()
    if mcloud: x.loc[(x.om == 315890) & (x.date == "2011-05-24"), "inj"] = OUN_D3["injured"]
    if louisiana:
        i = x.index[(x.om == 613559) & (x.date == "2016-02-23")][0]
        x.loc[i, "mag"] = max(int(x.loc[i, "mag"]), la["spc_earlier_row"]["ef"])
        x.loc[i, "len_mi"] = la["spc"]["len_mi"] + la["spc_earlier_row"]["len_mi"]
        x.loc[i, "wid_yd"] = max(la["spc"]["wid_yd"], la["spc_earlier_row"]["wid_yd"])
        x = x[~((x.om == la["spc_earlier_row"]["om"]) & (x.date == "2016-02-23"))]
    return design(x)
for key, kw in (("mcloud_1_injured", {"mcloud": True}), ("louisiana_one_track", {"louisiana": True}),
                ("both", {"mcloud": True, "louisiana": True})):
    df = corrected(**kw)
    _, rs = fit(df)
    fits[key] = ratio(rs) | {"n": int(len(df)), "mu_mcloud": mu_of(rs, df, 315890, "2011-05-24"),
                             "mu_louisiana": mu_of(rs, df, 613559, "2016-02-23")}
    print(key, fits[key], file=sys.stderr)
fits["mu_full"] = {"mcloud": mu_of(r0, base, 315890, "2011-05-24"), "louisiana": mu_of(r0, base, 613559, "2016-02-23")}

matched = [x for x in recs if x["class"] != "unmatched"]
eq = [x for x in matched if x["se_inj"] == x["spc"]["inj"]]
P = {
    "P1": {"text": "at least 10 of 11 match, with Storm Events injured equal to SPC's",
           "held": bool(len(matched) >= 10 and len(eq) >= 10), "matched": len(matched), "equal": len(eq)},
    "P2": {"text": "at least 8 of the 11 matched narratives mention injuries",
           "held": bool(sum(x["narrative_mentions_injuries"] for x in matched) >= 8),
           "count": int(sum(x["narrative_mentions_injuries"] for x in matched))},
    "P3": {"text": "at least 1 continues into another state or is a segment of a longer track than the SPC row",
           "held": bool(any(x["other_state"] or x["continues_from_earlier_segment"] or x["se_len_mi"] > x["spc"]["len_mi"] + 0.05 for x in matched)),
           "which": [x["om"] for x in matched if x["other_state"] or x["continues_from_earlier_segment"] or x["se_len_mi"] > x["spc"]["len_mi"] + 0.05]},
    "P4": {"text": "if step 5 runs, its interval holds both 1.04 and 1.46", "ran": bool(flag),
           "held": bool(fits["step5_without_flagged"]["lo"] <= LEARN and fits["step5_without_flagged"]["hi"] >= HABIT)},
}
P["P1"]["before_tie_rule"] = {"matched": sum(x["n_candidates"] == 1 for x in recs), "held": False}
DEVIATIONS = ["Tie rule added after the first run: three tornadoes had two Storm Events segments of the same EF within "
              "10 minutes and read 'unmatched' (P1 failed, 8 of 11). Taking the candidate nearest in begin time matches all "
              "three at 0 minutes. P1 is reported both ways.",
              "The contradiction for om 315890 comes from the issuing office's event page, a source the pre-registration did "
              "not name (it named Storm Events narratives); its Storm Events narrative is silent on injuries."]
R = {"n_eleven": len(ELEVEN), "deviations": DEVIATIONS, "records": recs, "fits": fits, "predictions": P,
     "refits37": {f"{o} {t}": v for (o, t), v in REFIT.items()}}
(HERE / "data/results38.json").write_text(json.dumps(R, indent=1) + "\n")
print(json.dumps({"classes": {x["om"]: x["class"] for x in recs}, "fits": fits, "predictions": P}, indent=1))
