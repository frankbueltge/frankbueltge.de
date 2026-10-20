"""Study 32: checks by a second code path. Usage: python3 check32.py <studio data.js> <studio toll.js>
Recomputes every final-record exposure from the Studio's files with pandas (not build32.py's loops),
re-derives every prediction verdict from the fitted numbers, confirms the collinearity that made study
31's within-office deaths interval wrong, and counts its own checks so it proves it ran them."""
import sys, json, pathlib
import numpy as np, pandas as pd
HERE = pathlib.Path(__file__).resolve().parent
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)

def load(p):
    s = open(p).read(); return json.loads(s[s.index("{"):s.rindex("}") + 1])
W, TL = load(sys.argv[1]), load(sys.argv[2])
w = pd.DataFrame({"issue": W["issue"], "dur": W["dur"], "met": W["met"], "wfo": [W["wfos"][i] for i in W["wfo"]]})
w["fin"] = w.index.isin([int(k) for k, v in TL["wt"].items() if v]).astype(int)
t = pd.Timestamp("2008-01-01", tz="UTC") + pd.to_timedelta(w.issue, unit="m")
w["mon"] = t.dt.year * 12 + t.dt.month - 1
w["judged"] = (w.issue + w.dur) <= TL["end"]
check("47,441 warnings judged by the final database", int(w.judged.sum()) == 47441)
tab = pd.crosstab(w[w.judged].met, w[w.judged].fin)
check("Studio's counts: office-empty with a track 3,995", tab.loc[0, 1] == 3995)
check("Studio's counts: office-met without a track 1,428", tab.loc[1, 0] == 1428)

df = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
d32 = pd.read_csv(HERE / "data/tornadoes32.tsv", sep="\t")
R = json.loads((HERE / "data/results32.json").read_text())
check("rows aligned with study 31", (df[["om", "yr", "start_utc"]].values == d32[["om", "yr", "start_utc"]].values).all())
start = pd.to_datetime(df.start_utc, utc=True)
M = (start.dt.year * 12 + start.dt.month - 1).values
by_off = {o: g for o, g in w.groupby("wfo")}
cols = {k: [] for k in ("fp", "ff", "rev", "uns", "fo")}
for o, m in zip(df.office, M):
    g = by_off[o]; p = g[(g.mon >= m - 12) & (g.mon < m)]; f = g[(g.mon >= m + 1) & (g.mon < m + 13)]
    cols.setdefault("unj", []).append(int((~p.judged).sum() + (~f.judged).sum()))
    cols["fo"].append(1 - p.met.mean() if len(p) else np.nan)
    cols["fp"].append(1 - p.fin.mean() if len(p) else np.nan)
    cols["ff"].append(1 - f.fin.mean() if len(f) else np.nan)
    e, h = p[p.met == 0], p[p.met == 1]
    cols["rev"].append(e.fin.mean() if len(e) else np.nan)
    cols["uns"].append(1 - h.fin.mean() if len(h) else np.nan)
check("no window holds an unjudged warning", sum(cols["unj"]) == 0)
same = lambda a, b: np.allclose(np.nan_to_num(np.array(a, float), nan=-1), b.fillna(-1).values, atol=1e-5)
check("office FAR_past (study 31) recomputed", same(cols["fo"], df.far_past))
check("final FAR_past recomputed", same(cols["fp"], d32.far_final_past))
check("final FAR_future recomputed", same(cols["ff"], d32.far_final_future))
check("revision_past recomputed", same(cols["rev"], d32.revision_past))
check("unseen_past recomputed", same(cols["uns"], d32.unseen_past))
ok = ~np.isnan(cols["fo"]) & ~np.isnan(cols["fp"])
check("correlation office/final recomputed",
      abs(np.corrcoef(np.array(cols["fo"])[ok], np.array(cols["fp"])[ok])[0, 1] - R["corr_office_final_past"]) < 1e-4)
check("scale sd of final FAR_past recomputed", abs(np.nanstd(cols["fp"], ddof=1) - R["scales"]["far_final_past"]["sd"]) < 1e-3)

F = R["fits"]; F31 = json.loads((HERE / "data/results31.json").read_text())["fits"]
inc1 = lambda f: f["lo"] <= 1 <= f["hi"]
v = {"P1": R["corr_office_final_past"] >= 0.85,
     "P2": F["final_past_inj"]["z_ffp"]["lo"] > 1,
     "P3": F31["past_inj"]["lo"] <= F["final_past_inj"]["z_ffp"]["irr"] <= F31["past_inj"]["hi"],
     "P4": F["final_future_fat"]["z_fff"]["lo"] > 1,
     "P5": inc1(F["final_past_fe_inj"]["z_ffp"]),
     "P6": inc1(F["revision_inj"]["z_rev"]),
     "P7": F["final_and_revision_inj"]["z_ffp"]["lo"] > 1}
for k, ok_ in v.items(): check(f"verdict {k} re-derived", bool(ok_) == R["predictions"][k]["held"])
read = ["final_past_inj", "final_past_fat", "final_future_inj", "final_future_fat", "revision_inj",
        "final_and_revision_inj", "final_past_fe_inj", "final_past_fe_fat", "office_past_fe_fat"]
for k in read:
    check(f"{k} converged", F[k]["converged"])
    check(f"{k} intervals finite and bracket", all(0 < x["lo"] <= x["irr"] <= x["hi"] < 50 for e, x in F[k].items() if e.startswith("z_")))
# study 31's within-office deaths fit: the West dummy and one office's dummy are the same column there
sub = df[df.groupby("office").fat.transform("sum") > 0]
west = (sub.region == "West").values
dup = [o for o in sub.office.unique() if ((sub.office == o).values == west).all()]
check("study 31 deaths FE subsample: West == one office (GGW)", dup == ["GGW"])
check("same point, finite interval on this path", F["office_past_fe_fat"]["z_far_past"]["irr"] == F31["past_fe_fat"]["irr"])
EXPECTED = 40   # first written as 41; the self-count caught the miscount (README)
check("this file ran every check it declares", len(ran) + 1 == EXPECTED)
print(f"{len(ran)} checks ran, {len(failed)} failed" + (": " + "; ".join(failed) if failed else ""))
sys.exit(1 if failed else 0)
