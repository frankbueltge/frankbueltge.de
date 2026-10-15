"""Session 2: nst, status, review lag, low magnitude. Usage: session2.py RAWDIR LOW.csv -> session2.json"""
import csv, sys, glob, json, statistics as S
from datetime import datetime
def load(files):
    r = []
    for f in files: r += list(csv.DictReader(open(f)))
    return r
def cls(r): d = float(r["depth"]); return "decided" if d in (10.0, 35.0) else "solved"
def ts(x): return datetime.fromisoformat(x.replace("Z", "+00:00"))
rows = load(sorted(glob.glob(sys.argv[1] + "/*.csv"))); low = load([sys.argv[2]])
out = {"n": len(rows)}
for c in ("decided", "solved"):
    sel = [r for r in rows if cls(r) == c]
    nst = [int(r["nst"]) for r in sel if r["nst"]]
    gap = [float(r["gap"]) for r in sel if r["gap"]]
    rev = sum(r["status"] == "reviewed" for r in sel)
    lag = [(ts(r["updated"]) - ts(r["time"])).days for r in sel]
    out[c] = {"n": len(sel), "nst_present": len(nst), "nst_median": S.median(nst), "nst_le10_share": round(sum(x <= 10 for x in nst) / len(nst), 4),
              "gap_median": S.median(gap), "reviewed": rev, "reviewed_share": round(rev / len(sel), 4), "lag_days_median": S.median(lag)}
# decided share by nst band
bands = [(0, 10), (11, 20), (21, 40), (41, 80), (81, 10**6)]
out["by_nst"] = {}
for lo, hi in bands:
    sel = [r for r in rows if r["nst"] and lo <= int(r["nst"]) <= hi]
    out["by_nst"][f"{lo}-{hi}"] = {"n": len(sel), "decided_share": round(sum(cls(r) == "decided" for r in sel) / len(sel), 4)}
nn = [r for r in rows if not r["nst"]]
out["nst_missing"] = {"n": len(nn), "decided_share": round(sum(cls(r) == "decided" for r in nn) / len(nn), 4)}
# status by decided
st = {}
for s in sorted({r["status"] for r in rows}):
    sel = [r for r in rows if r["status"] == s]
    st[s] = {"n": len(sel), "decided_share": round(sum(cls(r) == "decided" for r in sel) / len(sel), 4)}
out["by_status"] = st
# year-recent: updated within 30 days of time = never revisited?
q = {}
for y in map(str, range(2020, 2026)):
    sel = [r for r in rows if r["time"][:4] == y]
    q[y] = {"n": len(sel), "reviewed_share": round(sum(r["status"] == "reviewed" for r in sel) / len(sel), 4),
            "decided_share_reviewed": round(sum(cls(r) == "decided" for r in sel if r["status"] == "reviewed") / max(1, sum(r["status"] == "reviewed" for r in sel)), 4)}
out["by_year"] = q
# low magnitude month
def block(sel):
    return {"n": len(sel), "decided_share": round(sum(cls(r) == "decided" for r in sel) / len(sel), 4),
            "d10_share": round(sum(float(r["depth"]) == 10 for r in sel) / len(sel), 4)}
out["low_month_2025_06_M2.5+"] = block(low)
out["low_month_us_net"] = block([r for r in low if r["net"] == "us"])
out["low_month_nonus"] = block([r for r in low if r["net"] != "us"])
out["m4_same_month"] = block([r for r in low if float(r["mag"]) >= 4])
out["low_month_M2.5-4"] = block([r for r in low if float(r["mag"]) < 4])
import collections
out["low_nets_top"] = collections.Counter(r["net"] for r in low).most_common(6)
json.dump(out, open("session2.json", "w"), indent=1); print(json.dumps(out, indent=1))
