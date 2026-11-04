"""Study 11: was the near miss seen coming? Run: python3 -I analyse.py <studio data.json>
Writes data/results.json and data/passages.tsv (the five fields used, nothing else)."""
import datetime as dt, hashlib, json, math, statistics as st, sys

SRC = sys.argv[1]
raw = open(SRC, "rb").read()
d = json.loads(raw)
F = d["sky_fields"]
rows = [dict(zip(F, r)) for r in d["sky"]]

def ydate(y):
    yr = int(y); return dt.date(yr, 1, 1) + dt.timedelta(days=round((y - yr) * 365.25))

def wilson(k, n, z=1.96):
    if n == 0: return [None, None]
    p = k / n; den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [round(c - h, 4), round(c + h, 4)]

BANDS = [("<22", -99, 22), ("22-24", 22, 24), ("24-26", 24, 26), ("26-28", 26, 28), ("28-30", 28, 30), (">=30", 30, 99)]
def band(h):
    if h is None: return None
    for name, lo, hi in BANDS:
        if lo <= h < hi: return name
def era(y):
    return "1990-2004" if y < 2005 else "2005-2014" if y < 2015 else "2015-2025"

undet = 0; clean = []
for r in rows:
    w = -r["lag_days"]
    learned = ydate(r["y_learned"])
    if learned.day in (1, 16) and abs(r["lag_days"]) <= 15:
        undet += 1; continue
    r["w"] = w; r["band"] = band(r["H"]); r["era"] = era(int(r["y_pass"])); r["close"] = r["r_ld"] <= 1
    clean.append(r)

def share(sel):
    n = len(sel); k = sum(1 for r in sel if r["w"] >= 1)
    same = sum(1 for r in sel if r["w"] == 0)
    return {"n": n, "warned": k, "same_day": same, "after": n - k - same,
            "warned_share": round(k / n, 4) if n else None, "ci": wilson(k, n)}

res = {"source": {"file": "studio/works/2026-10-11-nobody-knew/data.json",
                  "commit": "d288328c871ebbad82a2297478998675814f05b9",
                  "sha256": hashlib.sha256(raw).hexdigest(), "rows": len(rows)},
       "undetermined": undet, "analysed": len(clean)}
tab = {}
for e in ["1990-2004", "2005-2014", "2015-2025"]:
    for b, _, _ in BANDS:
        sel = [r for r in clean if r["era"] == e and r["band"] == b and r["close"]]
        tab[f"{e}|{b}"] = share(sel)
res["close_by_era_band"] = tab
recent = [r for r in clean if r["era"] == "2015-2025"]
# P1
p1_lo = share([r for r in recent if r["close"] and r["H"] is not None and r["H"] < 24])
p1_hi = tab["2015-2025|28-30"]
# P2
s26 = lambda e: share([r for r in clean if r["era"] == e and r["close"] and r["H"] is not None and 26 <= r["H"] < 30])
p2a, p2b = s26("2005-2014"), s26("2015-2025")
# P3
ws = sorted(r["w"] for r in recent if r["close"] and r["H"] is not None and r["H"] >= 28 and r["w"] >= 1)
p3 = {"n": len(ws), "median_days": st.median(ws) if ws else None,
      "quartiles": [ws[len(ws)//4], st.median(ws), ws[3*len(ws)//4]] if ws else None}
# P4
mid = [r for r in recent if r["H"] is not None and 24 <= r["H"] < 30]
p4_in = share([r for r in mid if r["r_ld"] <= 1]); p4_out = share([r for r in mid if 5 <= r["r_ld"] <= 19.5])

def verdict(x, bar, direction, tol):
    if x is None: return "undecided"
    if abs(x - bar) <= tol: return "undecided"
    return "held" if (x > bar) == (direction == ">") else "failed"

v1a = verdict(p1_lo["warned_share"], 0.90, ">", 0.02); v1b = verdict(p1_hi["warned_share"], 0.60, "<", 0.02)
P1 = "held" if v1a == v1b == "held" else "failed" if "failed" in (v1a, v1b) else "undecided"
diff = round(p2b["warned_share"] - p2a["warned_share"], 4)
res["predictions"] = {
 "P1": {"H<24": p1_lo, "H28-30": p1_hi, "parts": [v1a, v1b], "verdict": P1},
 "P2": {"2005-2014": p2a, "2015-2025": p2b, "diff": diff, "verdict": verdict(diff, 0.10, ">", 0.02)},
 "P3": {**p3, "verdict": verdict(p3["median_days"], 7, "<", 1) if p3["median_days"] != 7 else "undecided"},
 "P4": {"inside_1LD": p4_in, "5_to_19.5LD": p4_out, "diff": round(p4_in["warned_share"] - p4_out["warned_share"], 4),
        "verdict": verdict(p4_in["warned_share"] - p4_out["warned_share"], 0, "<", 0.02)},
}
bins = [(0, 0.25), (0.25, 0.5), (0.5, 1), (1, 2), (2, 5), (5, 10), (10, 19.5)]
# exploratory: by year, close, H 26-30
res["by_year_close_H26_30"] = {y: share([r for r in clean if int(r["y_pass"]) == y and r["close"] and r["H"] is not None and 26 <= r["H"] < 30]) for y in range(1990, 2026)}
# exploratory: warned <1 day vs first seen within a week after, close, recent
res["close_recent_same_day"] = sum(1 for r in recent if r["close"] and r["w"] == 0)
res["close_recent_after_le7"] = sum(1 for r in recent if r["close"] and -7 <= r["w"] < 0)
res["close_recent_warned_1to7"] = sum(1 for r in recent if r["close"] and 1 <= r["w"] <= 7)
# sensitivity: one passage per object (closest), recent, close
best = {}
for r in clean:
    if r["era"] == "2015-2025" and r["close"]:
        if r["des"] not in best or r["r_ld"] < best[r["des"]]["r_ld"]: best[r["des"]] = r
one = list(best.values())
res["sensitivity_one_per_object"] = {b: share([r for r in one if r["band"] == b]) for b, _, _ in BANDS}
res["sensitivity_one_per_object"]["P2_recent_H26_30"] = share([r for r in one if r["H"] is not None and 26 <= r["H"] < 30])
# all recent, by distance bin, H 24-30 (for the page)
res["recent_H24_30_by_distance"] = {f"{a}-{b}": share([r for r in mid if a < r["r_ld"] <= b]) for a, b in bins}
# the warning clock: close passages 2015-2025, days of warning from -30 to +30, by size group
groups = {"H<28": lambda h: h < 28, "H 28-30": lambda h: 28 <= h < 30, "H>=30": lambda h: h >= 30}
res["clock_close_recent"] = {g: {str(x): sum(1 for r in recent if r["close"] and r["H"] is not None and f(r["H"]) and r["w"] == x)
                                 for x in range(-30, 31)} for g, f in groups.items()}
res["clock_close_recent_outside"] = {g: {"before_-30": sum(1 for r in recent if r["close"] and r["H"] is not None and f(r["H"]) and r["w"] < -30),
                                         "beyond_30": sum(1 for r in recent if r["close"] and r["H"] is not None and f(r["H"]) and r["w"] > 30)}
                                     for g, f in groups.items()}
# by distance bin for each era (H 24-30), for the page
res["H24_30_by_distance_by_era"] = {e: {f"{a}-{b}": share([r for r in clean if r["era"] == e and r["H"] is not None and 24 <= r["H"] < 30 and a < r["r_ld"] <= b]) for a, b in bins}
                                    for e in ["2005-2014", "2015-2025"]}
# bounds: undetermined rows put all on the warned side, then all on the after side (recent, close, H 26-30, and P4)
und = []
for r in rows:
    learned = ydate(r["y_learned"])
    if learned.day in (1, 16) and abs(r["lag_days"]) <= 15:
        und.append(r)
def bounds(cond_c, cond_u):
    c = [r for r in clean if cond_c(r)]; u = [r for r in und if cond_u(r)]
    n = len(c) + len(u); k = sum(1 for r in c if r["w"] >= 1)
    return {"n_clean": len(c), "n_undetermined": len(u), "low": round(k / n, 4), "high": round((k + len(u)) / n, 4)}
yr = lambda r: int(r["y_pass"])
res["undetermined_bounds"] = {
 "2015-2025_close_H26_30": bounds(lambda r: r["era"] == "2015-2025" and r["close"] and r["H"] is not None and 26 <= r["H"] < 30,
                                  lambda r: yr(r) >= 2015 and r["r_ld"] <= 1 and r["H"] is not None and 26 <= r["H"] < 30),
 "2005-2014_close_H26_30": bounds(lambda r: r["era"] == "2005-2014" and r["close"] and r["H"] is not None and 26 <= r["H"] < 30,
                                  lambda r: 2005 <= yr(r) < 2015 and r["r_ld"] <= 1 and r["H"] is not None and 26 <= r["H"] < 30),
 "2015-2025_H24_30_inside_1LD": bounds(lambda r: r in mid and r["r_ld"] <= 1, lambda r: yr(r) >= 2015 and r["H"] is not None and 24 <= r["H"] < 30 and r["r_ld"] <= 1),
 "2015-2025_H24_30_5_19.5LD": bounds(lambda r: r in mid and 5 <= r["r_ld"] <= 19.5, lambda r: yr(r) >= 2015 and r["H"] is not None and 24 <= r["H"] < 30 and 5 <= r["r_ld"] <= 19.5),
}
json.dump(res, open("data/results.json", "w"), indent=1)
with open("data/passages.tsv", "w") as f:
    f.write("des\ty_pass\tH\tlag_days\tr_ld\n")
    for r in rows: f.write(f"{r['des']}\t{r['y_pass']}\t{r['H']}\t{r['lag_days']}\t{r['r_ld']}\n")
print(json.dumps({k: res[k] for k in ["undetermined", "analysed", "predictions", "close_recent_same_day", "close_recent_after_le7", "close_recent_warned_1to7", "undetermined_bounds"]}, indent=1))
