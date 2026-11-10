"""Build data-vi.json for THE REMAINDER, movement VI (session 209, 2026-10-28): the people the IPC's
open area table holds and its national count leaves out, in the two cases where the IPC's own text
names the areas and says why (Sudan, analysis of Sep 2025; Gaza Strip, analysis of Jul 2025).

Usage: python3 -I build_vi.py ipc_global_area_long.csv ipc_global_national_long.csv > data-vi.json

Data: HDX "Global: Acute Food Insecurity Country Data" (CC0, source National IPC Technical Working
Group), the same two files and checksums the Field read in session 234 (field-research,
notes/convening-after-010/unclassified/sources.json); fetched again 2026-10-28, checksums asserted.
The cases and the IPC's reasons are the Field's (pairing/readings.json, session 235).

An area is *counted* in a period when the table gives it people in a phase (1 to 5). Otherwise it is
*written as nobody*. Where the table writes such an area's people as 0, its width is taken from the
same area in the analysis's current period and marked `borrowed`. One period has a third state: in
Sudan's first projection, El Fasher and Kadugli towns carry phases in the area table, and their Phase 5
people are in the national Phase 5 row, but the national row's analysed population ("all") leaves
their 330,000 people out. They are marked `outside_total`. Asserted: for every period, the areas
counted (classified and inside the total) sum exactly to the IPC's national "all", and for that
period the national Phase 5 row equals the classified areas' Phase 5 sum, the two towns included.
"""
import csv, hashlib, json, sys

SHA = {"area": "33ed28dc5cb274770dc3bd4788620faad63d7d0d31d00fa9ef23606dd4554368",
       "national": "ec85a04b3704379e3a264680f92e8a70019f8e222900fcae4aca394f6f90ff28"}
for k, p in (("area", sys.argv[1]), ("national", sys.argv[2])):
    assert hashlib.sha256(open(p, "rb").read()).hexdigest() == SHA[k], p
CASES = [("Sep 2025", "SDN", "Sudan", ["current", "first projection", "second projection"]),
         ("Jul 2025", "PSE", "Gaza Strip", ["current", "first projection"])]
REASON = {  # the IPC's own words, as the Field read them (readings.json, sources.json)
    "SDN": {"Dilling Rural": "lack of data", **{a: "volatility of the situation and resulting uncertainty" for a in
            ("Al Fasher Urban", "Kadugli Urban", "As sunut", "Al lagowa", "Habila - sk")}},
    "PSE": {"North Gaza": "lack of data", "Rafah": "largely depopulated, not analysed"},
}
OUTSIDE = {("SDN", "first projection"): {"Al Fasher Urban", "Kadugli Urban"}}
keys = {(a, c) for a, c, _, _ in CASES}
area, nat = {}, {}
for r in csv.DictReader(open(sys.argv[1])):
    k = (r["Date of analysis"], r["Country"])
    if k in keys:
        area.setdefault((k, r["Validity period"]), {}).setdefault((r["Level 1"], r["Area"]), {})[r["Phase"]] = int(float(r["Number"] or 0))
for r in csv.DictReader(open(sys.argv[2])):
    k = (r["Date of analysis"], r["Country"])
    if k in keys:
        nat.setdefault((k, r["Validity period"]), {})[r["Phase"]] = int(float(r["Number"] or 0))
out, skipped = [], []
for a, c, name, periods in CASES:
    cur = area[((a, c), "current")]
    rows = []
    for p in periods:
        A, N = area[((a, c), p)], nat[((a, c), p)]
        cells, counted = [], 0
        for (l1, ar), ph in A.items():
            if all(v == 0 for v in ph.values()) and cur[(l1, ar)].get("all", 0) == 0:
                skipped.append([p, l1, ar])  # no people in this period nor in the current one: nothing to draw
                continue
            phases = [ph.get(str(i), 0) for i in range(1, 6)]
            people = ph.get("all", 0)
            if sum(phases) > 0:
                out_t = ar in OUTSIDE.get((c, p), set())
                if not out_t:
                    counted += people
                cells.append({"l1": l1, "area": ar, "people": people, "phases": phases, "outside_total": out_t})
            else:
                borrowed = people == 0
                w = cur[(l1, ar)].get("all", 0) if borrowed else people
                cells.append({"l1": l1, "area": ar, "people": w, "phases": None, "borrowed": borrowed,
                              "table_people": people, "reason": REASON[c].get(ar, "not named in the IPC's text")})
        assert counted == N["all"], (name, p, counted, N["all"])
        if (c, p) in OUTSIDE:
            assert sum(x["phases"][4] for x in cells if x["phases"]) == N["5"], (name, p)
            assert sum(N[str(i)] for i in range(1, 6)) - N["all"] > 0.99 * sum(x["people"] for x in cells if x.get("outside_total"))
        rows.append({"period": p, "national_all": N["all"], "national_p5": N.get("5", 0),
                     "national_phase_sum": sum(N[str(i)] for i in range(1, 6)),
                     "dark": sum(x["people"] for x in cells if x["phases"] is None),
                     "outside": sum(x["people"] for x in cells if x.get("outside_total")), "cells": cells})
    out.append({"analysis": a, "country": c, "name": name, "rows": rows})
json.dump({"source": "HDX global-acute-food-insecurity-country-data (CC0), National IPC Technical Working Group; fetched 2026-10-28",
           "cases": out, "skipped_zero_areas": skipped}, sys.stdout, separators=(",", ":"))
