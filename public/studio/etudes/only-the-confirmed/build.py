"""ONLY THE CONFIRMED — build the étude's data from OCHA DRC's consolidated Ebola file on HDX.

Usage: python3 -I build.py <path to drc_ebola_cases_consolidated.csv> [out.json]
Source (CC BY, OCHA DRC, dataset 'republique-democratique-du-congo-cas-et-deces-d-ebola'):
https://data.humdata.org/dataset/e902b209-b7bc-42f9-893a-294276d7cc62/resource/f7c9b552-0d41-4559-9fae-c450175fc39c/download/drc_ebola_cases_consolidated.csv
Fetched 2026-11-01. The file is not committed; its checksum is asserted below.
"""
import csv, hashlib, json, sys, datetime as dt
from collections import defaultdict

SHA = "761e1ed4f11db45a28ff8338a22ae78d9d78fd942603177bb8cbc16fb8352dbf"
src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "data.json"
assert hashlib.sha256(open(src, "rb").read()).hexdigest() == SHA, "file changed since 2026-11-01"
rows = list(csv.DictReader(open(src, encoding="utf-8")))
assert len(rows) == 13363

d0, d1 = dt.date(2026, 5, 14), dt.date(2026, 10, 29)
days = [(d0 + dt.timedelta(i)).isoformat() for i in range((d1 - d0).days + 1)]
idx = {d: i for i, d in enumerate(days)}
N = len(days)

def key(r):
    return (r["measure"], r["case_classification"])

# zone-level confirmed cumulative -> new per day (carried forward; corrections counted, not drawn)
cum = defaultdict(dict)
for r in rows:
    if r["location_level"] == "3" and key(r) == ("cases", "confirmed") and r["value"] != "":
        cum[r["location_name"]][r["reference_date"]] = float(r["value"])
zones, corrections = [], 0
for z, s in cum.items():
    new = [0] * N
    prev = 0.0
    for d in sorted(s):
        v = s[d]
        if v > prev:
            new[idx[d]] += int(round(v - prev)); prev = v
        elif v < prev:
            corrections += 1
    if sum(new):
        first = next(i for i, x in enumerate(new) if x)
        zones.append({"name": z, "first": first, "new": new, "total": int(prev)})
zones.sort(key=lambda z: (z["first"], -z["total"]))

# suspicion: on which days, and in which zones, did the record write anything beyond a lab result?
susp_zone = defaultdict(lambda: [0] * N)
susp_days_zone, susp_days_nat = set(), set()
for r in rows:
    k = key(r)
    if k in (("cases", "suspected"), ("deaths", "suspected"), ("contacts", "")) and r["value"] != "":
        if r["location_level"] == "3":
            susp_zone[r["location_name"]][idx[r["reference_date"]]] += float(r["value"])
            susp_days_zone.add(r["reference_date"])
        else:
            susp_days_nat.add(r["reference_date"])
for zn in sorted(set(susp_zone) - {z["name"] for z in zones}):
    sz = susp_zone[zn]
    zones.append({"name": zn, "first": next(i for i, x in enumerate(sz) if x), "new": [0] * N, "total": 0})
zones.sort(key=lambda z: (z["first"], -z["total"]))
for z in zones:
    z["susp"] = [round(x) for x in susp_zone.get(z["name"], [0] * N)]
unconfirmed_zones = sorted(z["name"] for z in zones if z["total"] == 0)

nat = {}
for r in rows:
    if r["location_level"] == "0" and key(r) == ("cases", "confirmed") and r["value"] != "":
        nat[r["reference_date"]] = max(nat.get(r["reference_date"], 0), int(float(r["value"])))
natc, last = [], 0
for d in days:
    last = nat.get(d, last); natc.append(last)

last_zone_susp = max(susp_days_zone); last_nat_susp = max(susp_days_nat)
# the facts the page states, asserted
assert (min(susp_days_zone), last_zone_susp, len(susp_days_zone)) == ("2026-05-14", "2026-05-30", 15)
assert (min(susp_days_nat), last_nat_susp) == ("2026-05-14", "2026-08-04")
assert natc[-1] == 10351
assert len(zones) == 70 and unconfirmed_zones == ["Jiba", "Karisimbi"], (len(zones), unconfirmed_zones)
silent_zone = (d1 - dt.date.fromisoformat(last_zone_susp)).days
silent_nat = (d1 - dt.date.fromisoformat(last_nat_susp)).days
assert (silent_zone, silent_nat) == (152, 86)

json.dump({
    "source": "OCHA DRC on HDX, drc_ebola_cases_consolidated.csv (CC BY), sha256 " + SHA,
    "days": days, "national_confirmed": natc,
    "susp_days_zone": sorted(idx[d] for d in susp_days_zone),
    "susp_days_nat": sorted(idx[d] for d in susp_days_nat),
    "zones": zones, "corrections_skipped": corrections,
    "facts": {"last_zone_suspicion": last_zone_susp, "last_national_suspicion": last_nat_susp,
              "days_since_zone_suspicion": silent_zone, "days_since_national_suspicion": silent_nat,
              "confirmed_on_last_day": natc[-1], "zones_with_confirmed": len(zones) - 2,
              "zones_only_suspected": unconfirmed_zones},
}, open(out, "w"), separators=(",", ":"))
print("ok", len(zones), "zones; corrections skipped", corrections, "; silent", silent_zone, silent_nat)
