"""CLEAR AIR — builds data.js from two inputs and asserts every number the page states.

1. The Studio's own étude ONLY THE CONFIRMED, etudes/only-the-confirmed/data.json (committed): the
   HDX file's 70 health zones over 169 days, joined to the Field's check 51 (report states by day).
2. The HDX file itself, for the national row of open suspected cases (not in the étude's data):
   OCHA DRC, drc_ebola_cases_consolidated.csv (CC BY). Fetched, checksum asserted, not committed.

Run: python3 -I build.py  (from this folder)
"""
import csv, hashlib, io, json, math, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ETUDE = HERE.parent.parent / "etudes" / "only-the-confirmed" / "data.json"
URL = ("https://data.humdata.org/dataset/e902b209-b7bc-42f9-893a-294276d7cc62/resource/"
       "f7c9b552-0d41-4559-9fae-c450175fc39c/download/drc_ebola_cases_consolidated.csv")
SHA = "761e1ed4f11db45a28ff8338a22ae78d9d78fd942603177bb8cbc16fb8352dbf"
Q = 42

D = json.loads(ETUDE.read_text())
days = D["days"]; N = len(days); idx = {d: i for i, d in enumerate(days)}
assert (N, days[0], days[-1], len(D["zones"])) == (169, "2026-05-14", "2026-10-29", 70)

raw = urllib.request.urlopen(URL, timeout=60).read()
assert hashlib.sha256(raw).hexdigest() == SHA, "the HDX file changed; re-read before building"
rows = list(csv.DictReader(io.StringIO(raw.decode("utf-8"))))

# national open suspects: labelled cumulative, but it falls, so it is a standing count (the Field, 11-01)
nat = {"cases": {}, "deaths": {}}
for r in rows:
    if r["location_level"] == "0" and r["case_classification"] == "suspected" and r["value"] != "":
        nat[r["measure"]][r["reference_date"]] = float(r["value"])
falls = {m: sum(1 for a, b in zip(sorted(s), sorted(s)[1:]) if s[b] < s[a]) for m, s in nat.items()}
assert falls == {"cases": 31, "deaths": 12}, falls
nat_s = [None] * N
for d, v in nat["cases"].items():
    nat_s[idx[d]] = round(v)
peak = max(v for v in nat_s if v is not None)
assert (peak, days[nat_s.index(peak)], nat_s[idx["2026-08-04"]]) == (1077, "2026-05-26", 270)
assert max(i for i, v in enumerate(nat_s) if v is not None) == idx["2026-08-04"]
nat_days = sum(1 for v in nat_s if v is not None)

# zones: cumulative confirmed, written suspicion, quiet by the étude's rule
zones = []
for z in D["zones"]:
    cum, c = [], 0
    for n in z["new"]:
        c += n; cum.append(c)
    last, lamps, breaks = -1, [], []
    for i, n in enumerate(z["new"]):
        if n > 0:
            if last >= 0 and i - last > Q: breaks.append(i)
            last = i
        elif last >= 0 and i - last == Q: lamps.append(i)
    zones.append({"name": z["name"], "first": z["first"], "cum": cum, "susp": z["susp"],
                  "lamps": lamps, "breaks": breaks})

susp_days = sorted({i for z in zones for i, v in enumerate(z["susp"]) if v > 0})
assert len(susp_days) == 15 and days[susp_days[-1]] == "2026-05-30"
named = [z for z in zones if z["name"] != "NA"]
def last_rise(z):
    return max((i for i, n in enumerate(D["zones"][zones.index(z)]["new"]) if n > 0), default=-1)
quiet_end = [z["name"] for z in named if last_rise(z) >= 0 and (N - 1) - last_rise(z) >= Q]
broken = [(z["name"], b) for z in named for b in z["breaks"]]
assert len(quiet_end) == 11, quiet_end
assert len(broken) == 11 and len({n for n, _ in broken}) == 10, broken
clear_from = susp_days[-1] + 1
total_end = sum(z["cum"][-1] for z in zones)

facts = {
    "days": N, "zones": len(zones), "zone_fog_days": len(susp_days), "last_zone_fog": days[susp_days[-1]],
    "national_days": nat_days, "last_national": "2026-08-04", "national_peak_day": "2026-05-26",
    "national_peak": 1077, "national_last": 270, "falls_cases": 31, "falls_deaths": 12,
    "clear_after_national": (N - 1) - idx["2026-08-04"], "quiet_on_last_day": len(quiet_end),
    "broken_lamps": len(broken), "broken_zones": len({n for n, _ in broken}),
    "drawn_confirmed_end": total_end, "national_confirmed_end": D["national_confirmed"][-1],
    "confirmed_after_last_national": D["national_confirmed"][-1] - D["national_confirmed"][idx["2026-08-04"]],
    "report_absent_days": len(D["report_absent"]), "province_days": len(D["province_suspicion"]),
}
assert facts["confirmed_after_last_national"] == 6378 and facts["clear_after_national"] == 86 and facts["national_confirmed_end"] == 10351
assert facts["report_absent_days"] == 24 and facts["province_days"] == 66

# increment 2 (s222): the Field's finding of 11-03 (7-8 Oct silent, 9 Oct covers three days), re-counted
i9 = idx["2026-10-09"]; nc = D["national_confirmed"]
assert nc[i9 - 2] == nc[i9 - 1] == nc[i9 - 3] and nc[i9] - nc[i9 - 1] == 186
assert [z["cum"][-1] for z in zones if z["name"] == "NA"] == [97]
facts["rise_9_oct"] = 186; facts["na_confirmed"] = 97
out = {"days": days, "national_suspects": nat_s, "national_confirmed": D["national_confirmed"],
       "report_absent": D["report_absent"], "report_untranscribed": D["report_untranscribed"],
       "province": D["province_suspicion"], "zones": zones, "facts": facts}
(HERE / "data.js").write_text("window.CLEAR_AIR=" + json.dumps(out, separators=(",", ":")) + ";\n")
(HERE / "summary.json").write_text(json.dumps(facts, indent=1) + "\n")
print("ok", json.dumps(facts))
