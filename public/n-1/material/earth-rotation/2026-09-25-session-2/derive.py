"""Project 1, session 2: extract USNO Bulletin A UT1-UTC and LOD, and check them
against the figures night 35 derived from IERS EOP 20 C04.

Input: finals2000A.all from https://maia.usno.navy.mil/ser7/finals2000A.all
(sha256 in fetch.log). Only rows whose Bulletin A UT1-UTC flag is 'I' (IERS
values, not predictions) are used, and only the Bulletin A columns (USNO's own
product): date, UT1-UTC (s), LOD excess (ms). The Bulletin B columns in the
same file are the Paris Observatory's and are not extracted.

Writes bulletin-a-ut1.csv and prints derived.txt to stdout.
"""
import csv
import datetime as dt
import sys

src = sys.argv[1] if len(sys.argv) > 1 else "finals2000A.all"
rows = []
for ln in open(src):
    if len(ln) < 79 or ln[57] != "I":
        continue
    mjd = int(float(ln[7:15]))
    d = dt.date(1858, 11, 17) + dt.timedelta(days=mjd)
    u = float(ln[58:68])
    lod = ln[79:86].strip()
    rows.append((d, u, float(lod) if lod else None))

with open("bulletin-a-ut1.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["date", "ut1_minus_utc_s", "lod_excess_ms"])
    for d, u, l in rows:
        w.writerow([d.isoformat(), f"{u:.7f}", "" if l is None else f"{l:.4f}"])

print(f"Bulletin A rows flagged I: {len(rows)}, first {rows[0][0]}, last {rows[-1][0]}")
print(f"UT1-UTC on the last row: {rows[-1][1]:+.4f} s")
jumps = [(rows[i][0], rows[i - 1][1], rows[i][1]) for i in range(1, len(rows))
         if abs(rows[i][1] - rows[i - 1][1]) > 0.5]
print(f"Leap-second steps inside the series: {len(jumps)} (1972's two precede its first row)")
print(f"Last step: {jumps[-1][0]}  {jumps[-1][1]:+.4f} -> {jumps[-1][2]:+.4f} s")
print()
print("Check against night 35's C04-derived figures:")
for day, c04 in (("2026-08-25", +0.0071), ("2020-06-05", -0.2562), ("2025-10-17", +0.0948)):
    r = [x for x in rows if x[0].isoformat() == day][0]
    print(f"  {day}  Bulletin A {r[1]:+.4f} s   C04 {c04:+.4f} s   diff {r[1]-c04:+.4f} s")
lods = sorted((x for x in rows if x[2] is not None), key=lambda x: x[2])
print(f"  shortest day in Bulletin A: {lods[0][0]} ({lods[0][2]:+.4f} ms); C04: 2024-07-05 (-1.6508 ms)")
print()
cross = [rows[i][0] for i in range(1, len(rows))
         if (rows[i - 1][1] < 0) != (rows[i][1] < 0) and abs(rows[i][1] - rows[i - 1][1]) < 0.5]
print("Zero crossings of UT1-UTC since the last leap second (sign changes between consecutive days):")
for c in cross:
    if c.year >= 2017:
        print(f"  {c}")
print()
print("The newest thirty days (Bulletin A, rapid-service values; the newest rows may be revised):")
for d, u, l in rows[-30:]:
    print(f"  {d}  UT1-UTC {u:+.4f} s  LOD {'' if l is None else f'{l:+.4f} ms'}")
