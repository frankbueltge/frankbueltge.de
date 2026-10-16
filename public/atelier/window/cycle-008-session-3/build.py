#!/usr/bin/env python3
"""The Warner's Column. Cycle 008, session 3. A keeper that published both conditions for the same danger:
the Bank of England's CPI projections, February 2004 to May 2013, each made twice, once on the market's
expected path of Bank Rate and once on Bank Rate held where it stood. The gap between the two is the
keeper's own written estimate of what acting does; Bank Rate's daily record says which antecedent came.

  python3 build.py <cpiinternet.xls> <bankrate.csv> <field_results.json>
     cpiinternet.xls: Bank of England, 'Parameters for MPC CPI Inflation Projections from February 2004'
       (web archive copy of 2013-11-16). Needs xlrd.
     bankrate.csv: Bank of England database, series IUDBEDR (Official Bank Rate, daily), 2003-2017.
     field_results.json: the Field's study 18 results (field-research@0007a67), the tornado's e = 0 test.
     Outturns are read from ../cycle-008-session-2/data.js (ONS D7G7, already hash-checked there).
  writes data.js and results.json. All three inputs hash-checked."""
import csv, datetime as dt, hashlib, json, math, os, statistics as st, sys
import xlrd
here = os.path.dirname(os.path.abspath(__file__))
SRC = json.load(open(os.path.join(here, 'sources.json')))['sources']
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()
xls, brc, fld = sys.argv[1:4]
assert sha(xls) == SRC['boe_cpi']['sha256'], 'xls hash'
assert sha(brc) == SRC['bank_rate']['sha256'], 'bank rate hash'
assert sha(fld) == SRC['field_18']['sha256'], 'field hash'

# --- the Bank's workbook: one report = a constant-rate block and a market-rate block -----------------
s = xlrd.open_workbook(xls).sheet_by_name('CPI Forecast')
qcol = {c: s.cell_value(4, c) for c in range(4, s.ncols) if 'Q' in str(s.cell_value(4, c))}
qt = lambda t: int(t[:4]) + (int(t[5]) - 1) / 4
MON = {'February': 0, 'May': .25, 'August': .5, 'November': .75}
KEY = {'Mode': ('const', 1), 'Market Mode': ('market', 1), 'Uncertainty': ('u', 0), 'Skew': ('g', 0)}
reps, year, cur, conflicts = [], None, None, []
for r in range(5, s.nrows):
    lab = s.cell_value(r, 3)
    if lab in ('Mode', 'Market Mode') and r + 1 < s.nrows and s.cell_value(r + 1, 1) in MON:
        y = s.cell_value(r + 1, 0)
        if isinstance(y, float) and y > 2000: year = int(y)
        cur = dict(t0=year + MON[s.cell_value(r + 1, 1)], const={}, market={}, u={}, g={}, rate=None); reps.append(cur)
    if isinstance(s.cell_value(r, 2), float): cur['rate'] = s.cell_value(r, 2)
    if lab not in KEY: continue
    k, own = KEY[lab]
    for c, t in qcol.items():
        x = s.cell_value(r, c)
        if x == '': continue
        if not own and qt(t) in cur[k] and abs(cur[k][qt(t)] - x) > 1e-9:
            conflicts.append(abs(cur[k][qt(t)] - x))   # the two blocks repeat u and skew; a few differ by rounding
        cur[k][qt(t)] = x
assert len(reps) == 38 and reps[0]['t0'] == 2004 and reps[-1]['t0'] == 2013.25

# --- session 2's file was the market-rate one: settle its stated limit -------------------------------
D = open(os.path.join(here, '..', 'cycle-008-session-2', 'data.js')).read()
S2 = json.loads(D[D.index('{'):D.rindex('}') + 1])
CPI = {float(k): v for k, v in S2['cpi'].items()}
mk = cs = n = 0
for R in reps:
    P = {round(x[0], 2): x[1] for x in S2['params']['%.2f' % R['t0']]}
    for t, m in R['market'].items(): n += 1; mk += abs(P[round(t, 2)] - m) < 1e-9
    cs += sum(abs(P[round(t, 2)] - m) < 1e-9 for t, m in R['const'].items())
settle = dict(market_rows=n, market_rows_equal_to_session2=mk, const_rows_equal=cs,
              const_rows=sum(len(R['const']) for R in reps))
assert mk == n == 486

# --- Bank Rate, daily: did the constant-rate antecedent hold for the whole two years? ----------------
BR = sorted((dt.datetime.strptime(a, '%d %b %Y').date(), float(b)) for a, b in csv.reader(open(brc)) if a != 'DATE')
PUB = {0: 2, .25: 5, .5: 8, .75: 11}   # Inflation Reports appear mid-February, May, August, November
def qend(t): y = int(t); q = round((t - y) * 4); return dt.date(y, 3 * q + 3, 28)
Phi = lambda z: 0.5 * (1 + math.erf(z / math.sqrt(2)))
def cdf(x, m, u, g):   # two-piece normal, Britton, Fisher & Whitley 1998 (the 'bfw' reading of session 2)
    s1, s2 = (u / math.sqrt(1 - g), u / math.sqrt(1 + g)) if g else (u, u); w = s1 / (s1 + s2)
    return 2 * w * Phi((x - m) / s1) if x <= m else w + 2 * (1 - w) * (Phi((x - m) / s2) - .5)
rows = []
for R in reps:
    t0 = R['t0']; pub = dt.date(int(t0), PUB[round(t0 - int(t0), 2)], 15); t8 = t0 + 2
    path = [(d, v) for d, v in BR if pub <= d <= qend(t8)]
    rate_at_pub = [v for d, v in BR if d <= pub][-1]
    assert rate_at_pub == R['rate'], ('constant rate', t0)
    c, m, u, g = round(R['const'][t8], 2), R['market'][t8], R['u'][t8], R['g'][t8]
    o = CPI[t8]
    rows.append(dict(t0=t0, rate=R['rate'], c=c, m=m, u=u, g=g, gap=round(c - m, 2), out=o,
                     held=all(v == R['rate'] for _, v in path), lo=min(v for _, v in path), hi=max(v for _, v in path),
                     pit_c=round(cdf(o, c, u, g), 3), pit_m=round(cdf(o, m, u, g), 3),
                     fanC=[[t, round(R['const'][t], 2)] for t in sorted(R['const'])],
                     fanM=[[t, R['market'][t], R['u'][t], R['g'][t]] for t in sorted(R['market'])]))
held = [r for r in rows if r['held']]; moved = [r for r in rows if not r['held']]
gaps = [r['gap'] for r in rows]
res = dict(
    reports=38, settle_session2=settle, u_skew_conflicts=dict(n=len(conflicts), max=round(max(conflicts), 4)),
    gap=dict(mean=round(st.mean(gaps), 2), min=min(gaps), max=max(gaps), within_tenth=sum(abs(x) <= .1 for x in gaps),
             mean_ratio_to_u=round(st.mean(abs(r['gap']) / r['u'] for r in rows), 2),
             max_ratio_to_u=round(max(abs(r['gap']) / r['u'] for r in rows), 2),
             above_half_u=sum(abs(r['gap']) > r['u'] / 2 for r in rows)),
    held=dict(n=len(held), first=held[0]['t0'], last=held[-1]['t0'], rate=held[0]['rate'],
              mae_const=round(st.mean(abs(r['out'] - r['c']) for r in held), 2),
              mae_market=round(st.mean(abs(r['out'] - r['m']) for r in held), 2),
              const_closer=sum(abs(r['out'] - r['c']) < abs(r['out'] - r['m']) for r in held),
              tie=sum(abs(r['out'] - r['c']) == abs(r['out'] - r['m']) for r in held),
              above95_const=sum(r['pit_c'] > .95 for r in held), above95_market=sum(r['pit_m'] > .95 for r in held),
              gap_mean=round(st.mean(r['gap'] for r in held), 2)),
    moved=dict(n=len(moved), gap_mean=round(st.mean(r['gap'] for r in moved), 2),
               gap_within_tenth=sum(abs(r['gap']) <= .1 for r in moved)),
)
F = json.load(open(fld))['windows']['20']
res['tornado'] = dict(before=F['before'], after=F['after'], diff=F['diff_after_minus_before_points'], ci=F['diff_ci95'])
json.dump(res, open(os.path.join(here, 'results.json'), 'w'), indent=1)
out = {round(t, 2): v for t, v in CPI.items() if 2003.75 <= t <= 2015.5}
BRq = {}
for d, v in BR: BRq.setdefault(round(d.year + (d.month - 1) // 3 / 4, 2), []).append(v)
with open(os.path.join(here, 'data.js'), 'w') as f:
    f.write('// generated by build.py; projections and Bank Rate: Bank of England; outturns: ONS D7G7 (OGL v3.0);'
            ' tornado window: the Field, study 18\n')
    f.write('const DATA = ' + json.dumps(dict(rows=rows, cpi=out, rate={k: [min(v), max(v)] for k, v in sorted(BRq.items())},
                                             results=res), separators=(',', ':')) + ';\n')
print(json.dumps(res, indent=1))
