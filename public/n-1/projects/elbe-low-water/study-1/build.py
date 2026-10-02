"""Elbe at low water -- study 1 (project 2, session 2, night 40).

Reads only committed files:
  material/elbe-low-water/2026-09-29-prospect/w-DRESDEN-P31D.json   (PEGELONLINE, DL-DE->Zero-2.0)
  material/elbe-low-water/2026-10-02-session2/w-DRESDEN-P31D.json   (same service, same licence)
  material/elbe-low-water/2026-09-29-prospect/stones-excerpt.txt   (dates only, cited)
Joins the two 31-day windows (the service itself serves 31 days only), asserts that
overlapping readings agree, and writes index.html beside this file (self-contained,
nothing fetched at runtime) and figures.txt (every number the page states).

The rule of the study is its own and says so on the page: a stone's dates are legible
only while the held reading is below the gauge's mean low water (MNW). It is not a claim
that any stone is exposed at that reading (the stones' own thresholds are unknown, except
two, per the state table).

Run from the repository root: python3 projects/elbe-low-water/study-1/build.py
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
A = "material/elbe-low-water/2026-09-29-prospect/w-DRESDEN-P31D.json"
B = "material/elbe-low-water/2026-10-02-session2/w-DRESDEN-P31D.json"
MNW = 67  # Dresden, MNW 2010-11..2020-10, PEGELONLINE station characteristic values (derived.txt)
NNW = 21  # lowest recorded, 1947-08-12 / 1952-08-15 (derived.txt)

a = json.load(open(A)); b = json.load(open(B))
d = {x["timestamp"]: x["value"] for x in a}
overlap = 0
for x in b:
    if x["timestamp"] in d:
        overlap += 1
        assert d[x["timestamp"]] == x["value"], "overlap disagrees"
    d[x["timestamp"]] = x["value"]
ks = sorted(d)
vals = [d[k] for k in ks]
below = sum(1 for v in vals if v < MNW)
lo = min(vals)
lo_first = ks[vals.index(lo)]
only_a = len([k for k in ks if k not in {x["timestamp"] for x in b}])
# running minimum
run, m = [], 10**9
for v in vals:
    m = min(m, v); run.append(m)
figs = [
    f"readings held: {len(ks)} ({ks[0]} to {ks[-1]})",
    f"window 1 (fetched 2026-09-29): {len(a)}; window 2 (fetched 2026-10-02): {len(b)}; overlap {overlap}, all equal",
    f"readings held that the service no longer serves (only in window 1): {only_a}",
    f"readings below MNW {MNW} cm: {below} of {len(ks)} ({100*below/len(ks):.1f} %)",
    f"lowest reading held: {lo} cm, first at {lo_first}",
    f"highest reading held: {max(vals)} cm; last reading: {vals[-1]} cm at {ks[-1]}",
    f"MNW {MNW} cm and NNW {NNW} cm: PEGELONLINE characteristic values, derived.txt (session 1)",
]
open(os.path.join(HERE, "figures.txt"), "w").write("\n".join(figs) + "\n")
print("\n".join(figs))

stones = [
 ("Děčín stone (Tetschen), Czech Republic", "1616, 1746, 1790, 1800, 1842, 1868", "1417 and 1473 are listed as illegible"),
 ("Oberposta stone, Elbe-km 31.6", "1707, 1782, 1790, 1842, 1858, 1859, 1863, 1868, 1873, 1878, 1904, 1947, 1963, 2003, Aug 2015", "listed 'among others'; more than fifteen entries"),
 ("Pillnitz stone, Elbe-km 43.0", "19.07.1873, 18.07.1904, 17.08.2003", ""),
]
data = {"t": ks, "v": vals, "run": run, "mnw": MNW, "nnw": NNW}
tpl = open(os.path.join(HERE, "template.html")).read()
rows = "\n".join(
    f'<li class="stone"><h3>{n}</h3><p class="dates">{ds}</p><p class="note">{nt}</p></li>' for n, ds, nt in stones)
out = (tpl.replace("%%DATA%%", json.dumps(data, separators=(",", ":")))
          .replace("%%STONES%%", rows)
          .replace("%%N%%", str(len(ks))).replace("%%BELOW%%", f"{100*below/len(ks):.1f}")
          .replace("%%LO%%", str(lo)).replace("%%LOT%%", lo_first[:16].replace("T", " "))
          .replace("%%MNW%%", str(MNW)).replace("%%ONLYA%%", str(only_a))
          .replace("%%FIRST%%", ks[0][:10]).replace("%%LAST%%", ks[-1][:10]))
open(os.path.join(HERE, "index.html"), "w").write(out)
