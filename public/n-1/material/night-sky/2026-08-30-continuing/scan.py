#!/usr/bin/env python3
"""Whole-file scan of a DWD hourly-cloudiness generation — the continuing look
(first committed night 16, record 41, 2026-08-30).

Night 15 scanned the window's deep past for the first time and reported its
inventory in prose, by a method not committed as code; tonight's transcript
found that method's hole inventory incomplete (or the archive changed — from
the committed record the two cannot be told apart; see the README). This
script is the scan as code, so every later reading is exact and re-runnable.

Usage: python3 scan.py <stundenwerte_N_00433_akt.zip>
Scans the produkt_* data member: row count, first/last row verbatim,
indicator (V_N_I) segments, the -999 inventory by civil date, person-told
segments, and every gap in the hourly row sequence.
"""
import sys, zipfile, collections, datetime

z = zipfile.ZipFile(sys.argv[1])
member = [n for n in z.namelist() if n.startswith("produkt_")][0]
rows = [l for l in z.read(member).decode("latin-1").splitlines()[1:] if l.strip()]
print(f"member: {member}")
print(f"data rows: {len(rows)}")
print(f"first row (verbatim): {rows[0]}")
print(f"last row  (verbatim): {rows[-1]}")

segs, inv, prev = [], [], None
for r in rows:
    f = r.split(";")
    m, ind = f[1].strip(), f[3].strip()
    if ind != prev:
        segs.append([ind, m, m]); prev = ind
    else:
        segs[-1][2] = m
    if ind == "-999":
        inv.append(m)
print(f"indicator segments: {len(segs)}")
print(f"-999 (indicator missing) rows: {len(inv)}")
print("  by civil date:", dict(sorted(collections.Counter(m[:8] for m in inv).items())))
print("person-told (P) segments:", [(s[1], s[2]) for s in segs if s[0] == "P"])

gaps, prevdt = [], None
for r in rows:
    dt = datetime.datetime.strptime(r.split(";")[1].strip(), "%Y%m%d%H")
    if prevdt and (dt - prevdt) > datetime.timedelta(hours=1):
        gaps.append((prevdt.strftime("%Y-%m-%d %H:00"), dt.strftime("%Y-%m-%d %H:00"),
                     int((dt - prevdt).total_seconds() // 3600) - 1))
    prevdt = dt
print(f"gaps in the hourly row sequence: {len(gaps)}")
for a, b, n in gaps:
    print(f"  last row {a} -> next row {b}  ({n} hours absent)")
