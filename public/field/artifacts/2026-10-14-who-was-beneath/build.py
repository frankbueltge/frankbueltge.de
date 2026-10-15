"""Study 15: join study 13's tornadoes to the SPC fields and 2010 county density.
Usage: python3 -I build.py <1950-2023_all_tornadoes.csv> <Gaz_counties_national.txt>
(the all-segments file: its whole-track rows (sg=1) equal study 13's; its state segments (sg=2)
carry the counties a multi-state whole-track row leaves at 0)
Writes data/beneath.tsv (no third-party file committed raw)."""
import csv, sys, pathlib
from datetime import datetime, timedelta
HERE = pathlib.Path(__file__).resolve().parent
spc_path, gaz_path = sys.argv[1], sys.argv[2]

dens = {}
with open(gaz_path, encoding="latin-1") as f:
    r = csv.reader(f, delimiter="\t"); next(r)
    for row in r:
        row = [c.strip() for c in row]
        pop, sqmi = int(row[4]), float(row[8])
        if sqmi > 0: dens[int(row[1])] = pop / sqmi

spc, seg_fips = {}, {}
with open(spc_path) as f:
    for row in csv.DictReader(f):
        if not 2008 <= int(row["yr"]) <= 2023: continue
        key = (row["om"], row["yr"], row["date"] + " " + row["time"][:5])  # om repeats twice in a year
        if row["sg"] == "1":
            spc[key] = row
        if row["sg"] in ("1", "2"):
            # a multi-state track's whole record carries no counties; its state segments (sg=2) do
            stf = int(row["stf"])
            for k in ("f1", "f2", "f3", "f4"):
                if int(row[k]) > 0: seg_fips.setdefault(key, set()).add(stf * 1000 + int(row[k]))

REGION = {}
for st in "CT ME MA NH RI VT NJ NY PA".split(): REGION[st] = "Northeast"
for st in "IL IN MI OH WI IA KS MN MO NE ND SD".split(): REGION[st] = "Midwest"
for st in "DE DC FL GA MD NC SC VA WV AL KY MS TN AR LA OK TX".split(): REGION[st] = "South"
for st in "AZ CO ID MT NV NM UT WY AK CA HI OR WA".split(): REGION[st] = "West"

out, unmatched_spc, nodens = [], 0, 0
with open(HERE.parent / "2026-10-14-the-tornadoes-that-came/data/tornadoes.tsv") as f:
    for t in csv.DictReader(f, delimiter="\t"):
        cst = (datetime.strptime(t["start_utc"], "%Y-%m-%d %H:%M") - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M")
        key = (t["om"], t["yr"], cst)
        s = spc.get(key)
        if s is None: unmatched_spc += 1; continue
        ds = [dens[c] for c in sorted(seg_fips.get(key, ())) if c in dens]
        d = sum(ds) / len(ds) if ds else ""
        if not ds: nodens += 1
        ln, wd = float(s["len"]), float(s["wid"])
        E = d * ln * wd / 1760 if ds else ""
        hh = int(s["time"][:2])
        assert (s["st"], s["mag"], s["fat"], s["inj"]) == (t["st"], t["mag"], t["fat"], t["inj"])
        out.append(dict(om=t["om"], yr=t["yr"], st=t["st"], region=REGION.get(t["st"], "other"),
                        mag=t["mag"], fat=t["fat"], inj=t["inj"],
                        warned=1 if t["warning_registered"] else 0, lead=t["lead_registered"],
                        len_mi=ln, wid_yd=wd, night=1 if (hh >= 20 or hh < 6) else 0,
                        n_counties=len(ds), density=round(d, 3) if ds else "",
                        exposure=round(E, 3) if ds else ""))
with open(HERE / "data/beneath.tsv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(out[0]), delimiter="\t"); w.writeheader(); w.writerows(out)
print(f"rows {len(out)}; unmatched in SPC {unmatched_spc}; no county density {nodens}")
