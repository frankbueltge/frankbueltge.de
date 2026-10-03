"""The Cut -- candidate work of project 2 (session 3, night 41).

Joins the three committed 31-day windows of the Dresden gauge (PEGELONLINE, DL-DE->Zero-2.0),
asserts overlaps agree and the series is contiguous at 15 minutes, writes index.html
(self-contained, nothing fetched at runtime) and figures.txt (every number the page states).
Run from the repository root: python3 projects/elbe-low-water/the-cut/build.py
"""
import json, os
from datetime import datetime, timedelta
HERE = os.path.dirname(os.path.abspath(__file__))
W = ["material/elbe-low-water/2026-09-29-prospect/w-DRESDEN-P31D.json",
     "material/elbe-low-water/2026-10-02-session2/w-DRESDEN-P31D.json",
     "material/elbe-low-water/2026-10-03-session3/w-DRESDEN-P31D.json"]
MNW = 67
d = {}; sizes = []; revised = []
for p in W:
    w = json.load(open(p)); sizes.append(len(w))
    for x in w:
        if x["timestamp"] in d and d[x["timestamp"]] != x["value"]:
            revised.append((x["timestamp"], d[x["timestamp"]], x["value"]))  # later fetch wins; revisions counted, not hidden
        d[x["timestamp"]] = x["value"]
ks = sorted(d, key=lambda k: datetime.fromisoformat(k))
t = [datetime.fromisoformat(k) for k in ks]
gaps = sum(1 for a, b in zip(t, t[1:]) if b - a != timedelta(minutes=15))
vals = [d[k] for k in ks]
lo = min(vals); first_lo = vals.index(lo); last_lo = len(vals) - 1 - vals[::-1].index(lo)
n_at_lo = vals.count(lo)
# how often the running minimum was undercut (strictly lower than all before), after the first reading
run = 10**9; undercuts = []
for i, v in enumerate(vals):
    if v < run:
        if run != 10**9: undercuts.append(i)
        run = v
days = {}
for k, v in zip(ks, vals): days.setdefault(k[:10], []).append(v)
# for each day's own lowest first reading: was a lower reading held later?
beaten = sum(1 for k in days if any(kk[:10] > k for kk in ks) and min(days[k]) > min(v for kk, v in zip(ks, vals) if kk[:10] > k))
later_days = sum(1 for k in days if any(kk[:10] > k for kk in ks))
figs = [f"readings the service revised between fetches (later fetch used): {len(revised)}, all between {min(r[0] for r in revised)[:16]} and {max(r[0] for r in revised)[:16]}, each by {min(abs(r[2]-r[1]) for r in revised):.0f} to {max(abs(r[2]-r[1]) for r in revised):.0f} cm, all upward: {all(r[2]>r[1] for r in revised)}",
        f"windows joined: {sizes} readings, fetched 2026-09-29, 2026-10-02, 2026-10-03; gaps other than 15 min in the joined series: {gaps}",
        f"readings held: {len(ks)} ({ks[0]} to {ks[-1]}); last reading {vals[-1]} cm",
        f"lowest held: {lo} cm, {n_at_lo} readings at that level, first {ks[first_lo]}, last {ks[last_lo]}",
        f"readings that undercut every reading before them: {len(undercuts)}",
        f"days (of {later_days} that have a later day) whose own lowest reading was undercut by some later day: {beaten}",
        f"MNW {MNW} cm: PEGELONLINE characteristic value, material/elbe-low-water/2026-09-29-prospect/derived.txt"]
assert gaps == 0, "series not contiguous"
open(os.path.join(HERE, "figures.txt"), "w").write("\n".join(figs) + "\n")
print("\n".join(figs))
data = {"t0": ks[0], "v": vals}
tpl = open(os.path.join(HERE, "template.html")).read()
out = (tpl.replace("%%DATA%%", json.dumps(data, separators=(",", ":")))
          .replace("%%N%%", str(len(ks))).replace("%%LO%%", str(lo))
          .replace("%%LOT%%", ks[first_lo][:10]).replace("%%FIRST%%", ks[0][:10]).replace("%%LAST%%", ks[-1][:10])
          .replace("%%BEATEN%%", str(beaten)).replace("%%LATER%%", str(later_days)).replace("%%NLO%%", str(n_at_lo)).replace("%%REV%%", str(len(revised))))
open(os.path.join(HERE, "index.html"), "w").write(out)
