"""Checks for study 13. Usage: python3 -I check.py  (reads data/ only; counts itself)."""
import csv, gzip, json, random, statistics
from datetime import datetime
from pathlib import Path
D = Path(__file__).resolve().parent / "data"
r = json.load(open(D / "results.json"))
t = list(csv.DictReader(open(D / "tornadoes.tsv"), delimiter="\t"))
ran, failed = [], []


def check(name, cond):
    ran.append(name)
    if not cond:
        failed.append(name)


reg = r["rules"]["registered"]
warned = [x for x in t if x["lead_registered"] != ""]
check("tornado count recomputed", len(t) == r["tornadoes"] == reg["all"]["n"])
check("warned-ahead count recomputed", len(warned) == reg["all"]["k"])
check("every lead is positive (issued strictly before the start minute)",
      all(int(x["lead_registered"]) >= 1 for x in warned) and all(int(x["lead_as_issued"]) >= 1 for x in t if x["lead_as_issued"]))
check("years 2008-2023 only", {int(x["yr"]) for x in t} == set(range(2008, 2024)))
check("by-year sums to all", sum(v["n"] for v in reg["by_year"].values()) == len(t)
      and sum(v["k"] for v in reg["by_year"].values()) == len(warned))
strong = [x for x in t if int(x["mag"]) >= 2]
check("EF2+ arm recomputed", len(strong) == reg["ef2plus"]["n"]
      and sum(1 for x in strong if x["lead_registered"]) == reg["ef2plus"]["k"])
killer = [x for x in t if int(x["fat"]) >= 1]
c = reg["cells_2x2_killer"]
check("killer cells recomputed", c["warned_harm"] == sum(1 for x in killer if x["lead_registered"])
      and c["unwarned_harm"] == sum(1 for x in killer if not x["lead_registered"]))
check("2x2 cells sum to all", sum(c.values()) == len(t))
check("deaths recomputed", reg["deaths"]["total"] == sum(int(x["fat"]) for x in t)
      and reg["deaths"]["in_warned_ahead"] == sum(int(x["fat"]) for x in warned))
leads = [int(x["lead_registered"]) for x in warned if int(x["yr"]) >= 2012]
check("median lead 2012-2023 recomputed", statistics.median(leads) == reg["lead_2012-2023"]["median"])
j = [x for x in t if x["om"] == "296616" and x["yr"] == "2011"]
check("Joplin 2011: SGF warning 31, 17 min (NWS service assessment)",
      len(j) == 1 and j[0]["warning_registered"] == "SGF.2011.31" and j[0]["lead_registered"] == "17")
check("every replication year lies within 5 points of Brooks & Correia",
      all(abs(v["bc"] - v["ours"]) <= 0.05 for v in reg["replication_bc"].values()))
check("rules disagree count recomputed", r["rules_disagree"]["any"]
      == sum(1 for x in t if (x["lead_registered"] == "") != (x["lead_as_issued"] == "")))
check("five predictions under both rules", all(set(r["predictions"][k]) == {"P1", "P2", "P3", "P4", "P5"}
                                              for k in ("registered", "as_issued")))

# An independent second matcher on a random sample: winding number instead of ray casting,
# no bounding boxes, no bisect, all polygon rows scanned.
rows = list(csv.DictReader(gzip.open(D / "warnings.tsv.gz", "rt", newline=""), delimiter="\t"))
issue = {}
for w in rows:
    k = (w["wfo"], w["vtec_year"], w["etn"])
    if w["issued"] and (k not in issue or w["issued"] < issue[k]):
        issue[k] = w["issued"]
polys = [(issue[(w["wfo"], w["vtec_year"], w["etn"])], w["poly_beg"], w["poly_end"],
          [[tuple(map(float, p.split())) for p in ring.split(";")] for ring in w["rings"].split("|")])
         for w in rows if (w["wfo"], w["vtec_year"], w["etn"]) in issue]


def winding(lon, lat, ring):
    wn = 0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        cross = (x2 - x1) * (lat - y1) - (lon - x1) * (y2 - y1)
        if y1 <= lat < y2 and cross > 0:
            wn += 1
        elif y2 <= lat < y1 and cross < 0:
            wn -= 1
    return wn


def warned2(x):
    s = x["start_utc"]
    lon, lat = float(x["slon"]), float(x["slat"])
    return any(iss < s and beg <= s < end and sum(winding(lon, lat, ring) for ring in rings) % 2 != 0
               for iss, beg, end, rings in polys)


random.seed(13)
sample = random.sample(t, 300)
agree = sum(1 for x in sample if warned2(x) == (x["lead_registered"] != ""))
check("second matcher agrees on a 300-tornado sample", agree == 300)
# tamper: shift every start by a day; the second matcher must then disagree somewhere
shifted = [dict(x, start_utc=(datetime.strptime(x["start_utc"], "%Y-%m-%d %H:%M").replace(year=int(x["yr"]))
                              .strftime("%Y-%m-") + "%02d" % (1 + (int(x["start_utc"][8:10]) % 28)) + x["start_utc"][10:]))
           for x in sample[:60]]
check("tamper is caught", any(warned2(x) != (x["lead_registered"] != "") for x in shifted))
print(f"{len(ran)} checks ran, {len(failed)} failed, sample agreement {agree} of 300")
[print("FAILED:", f) for f in failed]
assert len(ran) == 16, "the suite did not run what it counts"
raise SystemExit(1 if failed else 0)
