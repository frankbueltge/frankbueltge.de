#!/usr/bin/env python3
"""build_data.py — STRUCK OFF: the two Sentry lists as one ledger, with every number the page states.

    python3 build_data.py [RAW_DIR]      # RAW_DIR as written by fetch.py

Conventions (the work's own, stated on the page):
- FIRST SEEN is the half-month a provisional designation encodes ("2026 TT2" = 1-15 October 2026);
  the date used is the first day of that half-month, so a 'days held' figure is good to about
  +/- 15 days. Numbered objects take the designation in their full name; the eight removed objects
  listed only by number or survey name take it from JPL's small-body database (fetch.py).
- The list does not publish when it LISTED an object. A warning is drawn standing from its first
  sighting, or from 2002-01-01 if seen earlier (the removed table's oldest entry is 2002-01-15).
- 'Not seen for N days' counts from the standing list's last_obs to the fetch date.
- A reason is counted as written only where the removed designation appears, as a whole token,
  in an entry of Sentry's operational notes.
"""
import datetime, html, json, os, re, statistics, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.environ.get('TMPDIR', '/tmp'), 'struck-off-raw')
man = json.load(open(os.path.join(HERE, 'raw-manifest.json')))
TODAY = datetime.date.fromisoformat(man['fetched_utc'][:10])
L = lambda n: json.load(open(os.path.join(RAW, n)))
rem = L('removed.json')['data']; cur = L('current.json')['data']

H = 'ABCDEFGHJKLMNOPQRSTUVWXY'
def halfmonth(prov):
    m = re.match(r'(\d{4}) ([A-HJ-Y])[A-HJ-Z]\d*$', prov)
    if not m: return None
    i = H.index(m.group(2)); return datetime.date(int(m.group(1)), i // 2 + 1, 1 if i % 2 == 0 else 16)
def prov_of(fullname):
    m = re.search(r'\((\d{4} [A-Z]{2}\d*)\)', fullname); return m.group(1) if m else None

SBDB = {}
for s in ['620100', '99942', '410777', '153814', '144898', '6344 P-L', 'P/2005 JQ5', 'P/2003 KV2']:
    o = L('sbdb-' + s.replace('/', '_').replace(' ', '_') + '.json')['object']; SBDB[s] = o['fullname']
SURVEY = {'6344 P-L': datetime.date(1960, 9, 16)}  # Palomar-Leiden survey, Sept-Oct 1960; half-month convention

rows = []
for x in rem:
    des = x['des']; p = halfmonth(des) and des
    full = SBDB.get(des, des)
    if not p: p = prov_of(full) or (re.sub(r'^P/', '', des) if des.startswith('P/') else None)
    seen = halfmonth(p) if p else SURVEY.get(des)
    assert seen, des
    t = datetime.datetime.strptime(x['removed'], '%Y-%m-%d %H:%M:%S')
    rows.append({'des': des, 'full': full, 'seen': seen.isoformat(), 'struck': x['removed'][:16],
                 'held': (t.date() - max(seen, datetime.date(2002, 1, 1))).days, 'held_from_seen': (t.date() - seen).days})
def lastobs(s):
    y, m, d = s.split('-'); return datetime.date(int(y), int(m), int(float(d)))
for x in cur:
    p = prov_of(x['fullname']) or (x['des'] if halfmonth(x['des']) else None)
    assert p, x['fullname']
    lo = lastobs(x['last_obs'])
    rows.append({'des': x['des'], 'full': x['fullname'].strip(), 'seen': halfmonth(p).isoformat(),
                 'last_obs': lo.isoformat(), 'unseen': (TODAY - lo).days, 'ip': float(x['ip']),
                 'diam_km': float(x['diameter']) if x.get('diameter') else None, 'range': x['range'], 'ps': float(x['ps_cum'])})
rows.sort(key=lambda r: (r['seen'], r['des']))

# reasons: designations named in the operational notes
t = open(os.path.join(RAW, 'notes.html'), encoding='utf-8').read()
t = re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)
t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t)))
parts = re.split(r'(\d{4}-[A-Z][a-z]{2}-\d{2})', t)
notes = [(parts[i], parts[i + 1].strip()) for i in range(1, len(parts) - 1, 2)]
named = {}
for d, tx in notes:
    for r in rows:
        if 'struck' in r and re.search(r'(?<![\w/])' + re.escape(r['des']) + r'(?![\w])', tx):
            named.setdefault(r['des'], []).append(d)
for r in rows:
    if r['des'] in named: r['notes'] = sorted(named[r['des']], key=lambda s: datetime.datetime.strptime(s, '%Y-%b-%d'))
BATCH = 'The objects for which the new algorithm cannot find virtual impactors have been moved to the Removed Objects table.'
assert BATCH in t
REMOVED_PAGE = 'such objects for which all previously detected potential impacts have been eliminated'
rp = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', open(os.path.join(RAW, 'removed-page.html'), encoding='utf-8').read())))
assert REMOVED_PAGE in rp
APO = 'rule out any possible impact for the next 100 years'
assert APO in t

S = [r for r in rows if 'struck' in r]; K = [r for r in rows if 'struck' not in r]
held = sorted(r['held_from_seen'] for r in S); unseen = sorted(r['unseen'] for r in K)
yr = {}
for r in S: yr[r['struck'][:4]] = yr.get(r['struck'][:4], 0) + 1
week = sum(1 for r in S if '2021-07-22' <= r['struck'][:10] <= '2021-07-29')

# the thirteen strikes predicted before they came (UNDERNEATH, this practice, 2026-10-13)
U = json.load(open(os.path.join(HERE, '..', '2026-10-13-underneath', 'data.json')))['rows']
alld = {r['des']: r for r in rows}
strikes = [{'des': u['des'], 'impact_utc': u['impact_utc'], 'place': u['place'], 'on_list': u['des'] in alld,
            'struck': alld[u['des']].get('struck') if u['des'] in alld else None} for u in U]

summary = {
    'fetched': man['fetched_utc'], 'struck': len(S), 'standing': len(K), 'total': len(rows),
    'first_struck': min(r['struck'] for r in S), 'last_struck': max(r['struck'] for r in S),
    'held_median_days': statistics.median(held), 'held_le_31': sum(h <= 31 for h in held),
    'held_gt_365': sum(h > 365 for h in held), 'held_max_days': held[-1],
    'struck_by_year': dict(sorted(yr.items())), 'week_2021_07_22_29': week,
    'unseen_median_days': statistics.median(unseen), 'unseen_gt_365': sum(u > 365 for u in unseen),
    'unseen_gt_3650': sum(u > 3650 for u in unseen), 'unseen_le_30': sum(u <= 30 for u in unseen),
    'notes_entries': len(notes), 'notes_first': notes[-1][0], 'notes_last': notes[0][0],
    'reasons_named': len(named), 'reasons_named_des': sorted(named),
    'strikes_on_list': sum(s['on_list'] for s in strikes), 'strikes': len(strikes),
}
# the numbers the page states, asserted against the lists as fetched
assert summary['struck'] == 3581 and summary['standing'] == 2223, (summary['struck'], summary['standing'])
assert summary['reasons_named'] == 3 and set(named) == {'99942', '410777', '2006 QV89'}
assert summary['strikes_on_list'] == 1 and [s['des'] for s in strikes if s['on_list']] == ['2014 AA']
assert alld['2014 AA']['struck'] == '2014-01-03 01:23' and alld['99942']['struck'] == '2021-02-21 08:22'
assert '2021-Mar-26' in alld['99942']['notes']
quotes = {'removed_page': REMOVED_PAGE, 'batch_2021_08_23': BATCH, 'apophis_2021_03_26': APO}
json.dump({'summary': summary, 'quotes': quotes, 'strikes': strikes, 'rows': rows},
          open(os.path.join(HERE, 'data.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print(json.dumps(summary, indent=1))
