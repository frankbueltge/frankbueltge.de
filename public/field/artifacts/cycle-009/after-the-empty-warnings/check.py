"""Study 31: checks by a second code path. Usage: python3 check.py <studio take-cover-again data.js>
Recomputes every exposure from the Studio's file with pandas (not build.py's loops), re-derives every
prediction verdict from the fitted numbers, and counts its own checks so it proves it ran them."""
import sys, json, pathlib
import numpy as np, pandas as pd
HERE = pathlib.Path(__file__).resolve().parent
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)

s = open(sys.argv[1]).read(); W = json.loads(s[s.index("{"):s.rindex("}") + 1])
w = pd.DataFrame({"issue": W["issue"], "met": W["met"], "wfo": [W["wfos"][i] for i in W["wfo"]]})
w["t"] = pd.Timestamp("2008-01-01", tz="UTC") + pd.to_timedelta(w.issue, unit="m")
w["mon"] = w.t.dt.year * 12 + w.t.dt.month - 1
cw = pd.DataFrame([(u, i) for u, _n, seq in W["counties"] for i in seq], columns=["ugc", "w"])
cw = cw.merge(w, left_on="w", right_index=True)
office = cw.groupby("ugc").wfo.agg(lambda x: x.value_counts().sort_index().idxmax())
df = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
R = json.loads((HERE / "data/results31.json").read_text())

check("rows 17596", len(df) == 17596)
check("one row per (om, yr, start)", not df.duplicated(["om", "yr", "start_utc"]).any())
check("years 2009-2023", df.yr.min() == 2009 and df.yr.max() == 2023)
check("totals match results", int(df.fat.sum()) == R["deaths"] and int(df.inj.sum()) == R["injuries"])
# office: majority office; ties are resolved differently by the two paths, so compare only untied
cnt = cw.groupby(["ugc", "wfo"]).size()
tied = {u for u, g in cnt.groupby(level=0) if (g == g.max()).sum() > 1}
d = df[~df.ugc.isin(tied)]
check("office = majority office (untied counties)", (d.office.values == office.loc[d.ugc].values).all())

by_off = {o: g for o, g in w.groupby("wfo")}
def far(g, m0, m1):
    x = g[(g.mon >= m0) & (g.mon < m1)]
    return (np.nan if len(x) == 0 else 1 - x.met.mean()), len(x)
start = pd.to_datetime(df.start_utc, utc=True)
M = start.dt.year * 12 + start.dt.month - 1
fp, ff, n_p = [], [], []
for o, m in zip(df.office, M):
    a, n = far(by_off[o], m - 12, m); b, _ = far(by_off[o], m + 1, m + 13)
    fp.append(a); ff.append(b); n_p.append(n)
fp, ff = np.array(fp), np.array(ff)
check("far_past recomputed", np.allclose(np.nan_to_num(fp, nan=-1), df.far_past.fillna(-1), atol=1e-5))
check("far_future recomputed", np.allclose(np.nan_to_num(ff, nan=-1), df.far_future.fillna(-1), atol=1e-5))
check("n_past recomputed", (np.array(n_p) == df.n_past.values).all())
# county window: 365 days to 24 h before start
T = ((start - pd.Timestamp("2008-01-01", tz="UTC")).dt.total_seconds() // 60).astype(int)
by_cty = {u: g.sort_values(["issue", "w"]) for u, g in cw.groupby("ugc")}
emp, runs, nwin = [], [], []
for u, t in zip(df.ugc, T):
    g = by_cty[u]; x = g[(g.issue >= t - 365 * 1440) & (g.issue < t - 1440)]
    emp.append(int((1 - x.met).sum())); nwin.append(len(x))
    m = x.met.values[::-1]; k = np.argmax(m == 1) if (m == 1).any() else len(m); runs.append(int(k))
check("empties_county recomputed", (np.array(emp) == df.empties_county.values).all())
check("warnings_county_1y recomputed", (np.array(nwin) == df.warnings_county_1y.values).all())
check("run_county recomputed", (np.array(runs) == df.run_county.values).all())
check("run never exceeds empties", (df.run_county <= df.empties_county).all())

F = R["fits"]
def inside(a, b): return b["lo"] <= a["irr"] <= b["hi"]
v = {"P1": F["past_inj"]["lo"] > 1, "P2": 1.0 <= F["past_fat"]["irr"] <= 1.30,
     "P3": inside(F["future_inj"], F["past_inj"]),
     "P4": F["past_fe_inj"]["lo"] <= 1 <= F["past_fe_inj"]["hi"],
     "P5": F["empties_inj"]["lo"] <= 1 <= F["empties_inj"]["hi"],
     "P6": F["run_inj"]["lo"] <= 1 <= F["run_inj"]["hi"]}
for k, ok in v.items(): check(f"verdict {k} re-derived", bool(ok) == R["predictions"][k]["held"])
for k in ("past_inj", "past_fat", "future_inj", "future_fat", "empties_inj", "run_inj", "past_fe_inj", "past_fe_fat"):
    check(f"{k} converged", F[k]["converged"])
    check(f"{k} interval brackets its ratio", F[k]["lo"] <= F[k]["irr"] <= F[k]["hi"])
check("scale sd of far_past recomputed", abs(np.nanstd(fp, ddof=1) - R["scales"]["far_past"]["sd"]) < 1e-3)
EXPECTED = 36   # first written as 32; the self-count caught the miscount (README)
check("this file ran every check it declares", len(ran) + 1 == EXPECTED)
print(f"{len(ran)} checks ran, {len(failed)} failed" + (": " + "; ".join(failed) if failed else ""))
sys.exit(1 if failed else 0)
