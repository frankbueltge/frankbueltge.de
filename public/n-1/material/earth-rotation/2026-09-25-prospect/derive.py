#!/usr/bin/env python3
"""Derive the prospect's figures from the IERS files, fetched fresh.

Usage: python3 derive.py DIR
DIR holds eopc04.1962-now, Leap_Second.dat and bulletinc.53 .. bulletinc.72,
fetched from https://hpiers.obspm.fr/iers/eop/eopc04/eopc04.1962-now and
https://hpiers.obspm.fr/iers/bul/bulc/ . The source files are not committed
(no reuse terms found, 2026-09-25); their sha256 at the prospect's fetch
stand in fetch.log. The IERS series is revised as it grows, so a later fetch
may differ in its newest rows; the figures in derived.txt are as of that fetch.
"""
import os, re, sys
from collections import Counter

d = sys.argv[1]
rows = []
for l in open(os.path.join(d, 'eopc04.1962-now')):
    if l.startswith('#') or not l.strip():
        continue
    p = l.split()
    # columns: year month day hour MJD x y UT1-UTC dX dY xrt yrt LOD ...
    rows.append((int(p[0]), int(p[1]), int(p[2]), float(p[7]), float(p[12])))

out = []
w = out.append
w('EOP 20 C04 rows: %d, first %04d-%02d-%02d, last %04d-%02d-%02d'
  % ((len(rows),) + rows[0][:3] + rows[-1][:3]))
last = rows[-1]
w('UT1-UTC on the last row: %+.4f s' % last[3])
w('')
w('UT1-UTC (s) and LOD excess over 86400 s (ms) on 1 January and 1 July, 2016 on:')
for y, m, dd, u, lod in rows:
    if dd == 1 and m in (1, 7) and y >= 2016:
        w('  %04d-%02d-01  UT1-UTC %+.4f  LOD %+.4f' % (y, m, u, lod * 1e3))
w('')
tot = Counter(r[0] for r in rows)
neg = Counter(r[0] for r in rows if r[4] < 0)
w('Days shorter than 86400 s (LOD excess < 0), per year, where any:')
for y in sorted(tot):
    if neg[y]:
        w('  %d  %3d of %d' % (y, neg[y], tot[y]))
w('')
w('The eight shortest days in the series (LOD excess, ms):')
for r in sorted(rows, key=lambda r: r[4])[:8]:
    w('  %04d-%02d-%02d  %+.4f' % (r[:3] + (r[4] * 1e3,)))
w('')
since = [r for r in rows if r[:3] >= (2017, 1, 1)]
w('Since 2017-01-01 (the last leap second):')
mn = min(since, key=lambda r: r[3]); mx = max(since, key=lambda r: r[3])
w('  lowest UT1-UTC  %+.4f s on %04d-%02d-%02d' % ((mn[3],) + mn[:3]))
w('  highest UT1-UTC %+.4f s on %04d-%02d-%02d' % ((mx[3],) + mx[:3]))
p25 = max([r for r in rows if r[0] >= 2025], key=lambda r: r[3])
w('  highest since 2025-01-01 %+.4f s on %04d-%02d-%02d' % ((p25[3],) + p25[:3]))
s = sum(r[4] for r in since)
w('  sum of daily LOD excess %+.4f s; change in UT1-UTC %+.4f s (check: should be minus the sum)'
  % (s, since[-1][3] - since[0][3]))
prev = None
for r in rows:
    if r[0] >= 2017:
        sg = r[3] >= 0
        if prev is not None and sg != prev:
            w('  UT1-UTC changes sign on %04d-%02d-%02d (%+.7f s)' % (r[:3] + (r[3],)))
        prev = sg
w('')
w('Bulletin C, 53 to 72 (the first line announcing or declining a leap second):')
for n in range(53, 73):
    t = open(os.path.join(d, 'bulletinc.%d' % n), errors='replace').read()
    date = re.search(r'Paris,\s*(\d+ \w+ \d{4})', t).group(1)
    line = re.search(r'[^\n]*leap second will be introduced[^\n]*', t).group(0).strip()
    w('  C %d  %-16s %s' % (n, date, line))
t = open(os.path.join(d, 'Leap_Second.dat')).read()
steps = re.findall(r'^\s+\d+\.0\s+1\s+[17]\s+(\d{4})\s+(\d+)\s*$', t, re.M)
w('')
w('Leap_Second.dat: %d table rows (TAI-UTC 10 s in 1972 to %s s); %s'
  % (len(steps), steps[-1][1], re.search(r'File expires on [^\n]*', t).group(0)))
print('\n'.join(out))
