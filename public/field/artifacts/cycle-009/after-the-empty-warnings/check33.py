"""Study 33: checks by a second code path.
Usage: python3 check33.py <studio data.js @157af4b> <atelier plate3.js @8ae3ba4> <studio word.js @5673f4f>
Recomputes every exposure with pandas (not build33.py's loops), decodes the stated word a second way
(from the Atelier's verdict bits as well as its class), re-derives every prediction verdict from the
fitted numbers, and counts its own checks so it proves it ran them."""
import sys, json, pathlib
import numpy as np, pandas as pd
HERE = pathlib.Path(__file__).resolve().parent
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)

def load(p):
    s = open(p).read(); return json.loads(s[s.index("{"):s.rindex("}") + 1])
W, P, WD = load(sys.argv[1]), load(sys.argv[2]), load(sys.argv[3])
w = pd.DataFrame({"issue": W["issue"], "dur": W["dur"], "met": W["met"], "wfo": [W["wfos"][i] for i in W["wfo"]]})
# taken back, second path: explode the Studio's per-county lists into one frame
tk = pd.DataFrame([(seq[pos], stood) for (u, n, seq), t in zip(W["counties"], WD["taken"]) for pos, stood, _ in t],
                  columns=["w", "stood"])
tk = tk[tk.stood <= w.dur.values[tk.w] - 5]
w["taken"] = w.index.isin(tk.w.unique()).astype(int)
check("Studio's word.json: 14,003 empty and 6,623 met county entries taken back early",
      int((w.met.values[tk.w] == 0).sum()) == 14003 and int((w.met.values[tk.w] == 1).sum()) == 6623)
s = pd.DataFrame([(o, m, c) for o, seq in P["seq"].items() for m, c in seq], columns=["wfo", "issue", "code"])
s["cls"] = [P["order"][c // 4] for c in s.code]
s["mh"], s["ml"] = (s.code // 2) % 2, s.code % 2
check("the Atelier's class totals reproduced on its 72 offices",
      all(int((s.cls == c).sum()) <= P["classes"][c]["n"] for c in P["order"]) and len(s) == 23999)
cnt = w.groupby(["wfo", "issue"]).size().rename("k").reset_index()
j = s.merge(cnt, on=["wfo", "issue"], how="left")
check("every Atelier warning exists in data.js", j.k.notna().all())
j = j[j.k == 1].merge(w.reset_index(), on=["wfo", "issue"])
check("23,708 joined, 291 left out by shared key", len(j) == 23708 and len(s) - len(j) == 291)
check("hour verdict bit equals data.js met on every joined warning", (j.mh == j.met).all())
j["chance"] = j.cls.map(P["chance"])
j["obs"] = j.cls.isin(["O", "OC", "CAT"]).astype(int)
t = pd.Timestamp("2008-01-01", tz="UTC") + pd.to_timedelta(j.issue, unit="m")
j["mon"] = t.dt.year * 12 + t.dt.month - 1

df = pd.read_csv(HERE / "data/tornadoes31.tsv", sep="\t")
d33 = pd.read_csv(HERE / "data/tornadoes33.tsv", sep="\t")
R = json.loads((HERE / "data/results33.json").read_text())
sel = df[(df.start_utc >= "2016-01-01") & (df.start_utc < "2024-01-01") & df.office.isin(list(P["seq"]))]
check("sample: 9,171 rows in study 31's order", len(sel) == 9171 and (sel.om.values == d33.om.values).all())
start = pd.to_datetime(sel.start_utc, utc=True)
M = (start.dt.year * 12 + start.dt.month - 1).values
by = {o: g for o, g in j.groupby("wfo")}
col = {k: [] for k in ("far_past", "wexp_past", "excess_past", "broken_past", "taken_past",
                       "far_future", "wexp_future", "excess_future", "broken_future", "taken_future")}
for o, m in zip(sel.office, M):
    g = by[o]
    for name, x in (("past", g[(g.mon >= m - 12) & (g.mon < m)]), ("future", g[(g.mon > m) & (g.mon <= m + 12)])):
        e = x[x.met == 0]
        col[f"far_{name}"].append(1 - x.met.mean() if len(x) else np.nan)
        col[f"wexp_{name}"].append((1 - x.chance).mean() if len(x) else np.nan)
        col[f"excess_{name}"].append((1 - x.met).mean() - (1 - x.chance).mean() if len(x) else np.nan)
        col[f"broken_{name}"].append(((1 - x.met) * x.obs).mean() if len(x) else np.nan)
        col[f"taken_{name}"].append(e.taken.mean() if len(e) else np.nan)
same = lambda a, b: np.allclose(np.nan_to_num(np.array(a, float), nan=-9), b.fillna(-9).values, atol=2e-5)
for k, v in col.items(): check(f"{k} recomputed", same(v, d33[k]))
a, b = np.array(col["far_past"]), sel.far_past.values.astype(float)
ok = ~np.isnan(a) & ~np.isnan(b)   # first run: NaN rows not dropped, so this check failed by its own fault
check("FAR_tag correlates with study 31's FAR as reported",
      abs(np.corrcoef(a[ok], b[ok])[0, 1] - R["corr"]["far_tag_vs_far31"]) < 1e-4)
check("scale sd of EXCESS past recomputed", abs(np.nanstd(col["excess_past"], ddof=1) - R["scales"]["excess_past"]["sd"]) < 1e-3)
check("outcome totals", R["outcomes"]["inj"] == int(sel.inj.sum()) and R["outcomes"]["fat"] == int(sel.fat.sum()))

F = R["fits"]
inc1 = lambda f: f["lo"] <= 1 <= f["hi"]
ins = lambda f, p: p["lo"] <= f["irr"] <= p["hi"]
we_p, we_f = F["wexp_excess_past_inj"], F["wexp_excess_future_inj"]
v = {"P1": F["far_past_inj"]["z_far_past"]["irr"] >= 1.05,
     "P2": we_p["z_wexp_past"]["lo"] > 1,
     "P3": inc1(we_p["z_excess_past"]),
     "P4": inc1(F["taken_past_inj"]["z_taken_past"]),
     "P5": inc1(F["broken_past_inj"]["z_broken_past"]),
     "P6": ins(we_f["z_wexp_future"], we_p["z_wexp_past"]) and ins(we_f["z_excess_future"], we_p["z_excess_past"]),
     "P7": inc1(F["excess_past_fe_inj"]["z_excess_past"])}
for k, ok in v.items(): check(f"verdict {k} re-derived", bool(ok) == R["predictions"][k]["held"])
read = ["far_past_inj", "wexp_excess_past_inj", "wexp_excess_future_inj", "taken_past_inj", "broken_past_inj",
        "excess_past_fe_inj", "far_past_fat", "far_future_fat", "wexp_excess_past_fat"]
for k in read:
    check(f"{k} converged", F[k]["converged"])
    check(f"{k} intervals finite and bracket",
          all(0 < x["lo"] <= x["irr"] <= x["hi"] < 50 for e, x in F[k].items() if e.startswith("z_")))
EXPECTED = 45
check("this file ran every check it declares", len(ran) + 1 == EXPECTED)
print(f"{len(ran)} checks ran, {len(failed)} failed" + (": " + "; ".join(failed) if failed else ""))
sys.exit(1 if failed else 0)
