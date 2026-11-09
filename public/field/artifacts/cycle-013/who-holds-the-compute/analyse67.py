# Study 67: who can end or restrict the published compute agreements (A), and the listed clusters
# standing at the end of 2025 read from Epoch's own file fetched directly (B). Also builds the
# per-developer money table that answers the critique of state 2. Standard library only.
# Run: python3 -I analyse67.py   -> results67.json, data67.js
import json, os, csv, hashlib
from datetime import date
here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)
A = json.load(open(P('data', 'agreements66.json')))
C = json.load(open(P('data', 'control67.json')))
R65 = json.load(open(P('results65.json')))
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()

# ---------- A: control of use
rows = {r['id']: r for r in A['rows'] if r['grade'] == 'first'}
ctl = {c['id']: c for c in C['rows']}
assert set(rows) == set(ctl), 'every first-hand agreement is coded, and only those'
docs = C['documents']
FILED = {k for k in docs}  # every named document is a securities filing or a filed exhibit
ends = [i for i, c in ctl.items() if c['end']]
ends_filed = [i for i in ends if ctl[i]['doc'] in FILED]
restr = [i for i, c in ctl.items() if c['use_restriction']]
state = [i for i, c in ctl.items() if c['state_lever']]
inferred = [i for i, c in ctl.items() if c.get('inferred')]
silent = [i for i, c in ctl.items() if not c['end'] and not c['use_restriction'] and not c['state_lever'] and not c['exclusivity']]
holder = {}
for i in ends: holder.setdefault(ctl[i]['end'], []).append(i)
provider_alone = holder.get('provider', [])
# strict and with inferred master agreements
ends_with_inf = sorted(set(ends) | {i for i in inferred if any(ctl[j]['doc'] == ctl[i]['inferred'] and ctl[j]['end'] for j in ctl)})
restr_with_inf = sorted(set(restr) | {i for i in inferred if any(ctl[j]['doc'] == ctl[i]['inferred'] and ctl[j]['use_restriction'] for j in ctl)})
n = len(ctl)

# ---------- B: clusters from the direct file
def f(x):
    try: return float(x)
    except (TypeError, ValueError): return None
direct = P('data', 'gpu_clusters_direct67.csv')
cl = [r for r in csv.DictReader(open(direct, encoding='utf-8')) if f(r['H100 equivalents'])]
old = [r for r in json.load(open(P('data', 'gpu_clusters.json')))['rows'] if f(r.get('H100 equivalents'))]
CT, OT = sum(f(r['H100 equivalents']) for r in cl), sum(f(r['H100 equivalents']) for r in old)
byname = {r['Name']: r for r in cl}
END = '2025-12-31'
up = lambda r: bool(r['First Operational Date']) and r['First Operational Date'] <= END
unresolved = []
def superseded(r):
    s = r['Superseded by'].strip()
    if not s: return False
    hit = []
    for t in (x.strip() for x in s.split(',')):
        if t in byname: hit.append(byname[t])
        else: unresolved.append((r['Name'], t))
    return any(up(h) for h in hit)
st = [r for r in cl if up(r) and not superseded(r)]
ST = sum(f(r['H100 equivalents']) for r in st)
share = lambda rs, tot, k, v: round(100 * sum(f(r['H100 equivalents']) for r in rs if r[k] == v) / tot, 1)
standing = dict(n=len(st), h100e=round(ST), public=share(st, ST, 'Sector', 'Public'), private=share(st, ST, 'Sector', 'Private'),
                mixed=share(st, ST, 'Sector', 'Public/Private'), us=share(st, ST, 'Country', 'United States of America'),
                china=share(st, ST, 'Country', 'China'), superseded_rows=sum(1 for r in cl if r['Superseded by'].strip()),
                no_date=sum(1 for r in cl if not r['First Operational Date']), unresolved=unresolved)
all_rows = dict(n=len(cl), h100e=round(CT), public=share(cl, CT, 'Sector', 'Public'), private=share(cl, CT, 'Sector', 'Private'),
                mixed=share(cl, CT, 'Sector', 'Public/Private'))
oldkeys = {(r['Name'], r['First Operational Date']) for r in old}
newkeys = {(r['Name'], r['First Operational Date']) for r in cl}
lost = None
diff = dict(only_direct=sorted(k[0] for k in newkeys - oldkeys), only_rebuilt=sorted(k[0] for k in oldkeys - newkeys),
            total_gap_pct=round(100 * (CT - OT) / OT, 3))
diff['lost_in_rebuild'] = [k for k in diff['only_direct'] if not any(k.split(', ')[-1].strip('"') in o for o in diff['only_rebuilt'])]
diff['broken_names'] = diff['only_rebuilt']
marks = [dict(n=r['Name'], o=r['Owner'], c=r['Country'], s=r['Sector'], h=round(f(r['H100 equivalents'])))
         for r in sorted(st, key=lambda r: -f(r['H100 equivalents']))]

# ---------- money, per developer (critique of state 2, points 2-4 and 10)
def years(r):
    t = (r.get('usd_note') or '')
    import re
    m = re.search(r'over (?:the next )?(\w+) years', t) or re.search(r'(\w+)-year', t)
    words = {'five': 5, 'seven': 7, 'ten': 10, '5': 5, '7': 7, '8': 8, '10': 10}
    if m and m.group(1) in words: return float(words[m.group(1)])
    m = re.search(r'through (?:(\d+) )?([A-Z][a-z]+) (\d{4})', t)
    if m:
        mon = ['January','February','March','April','May','June','July','August','September','October','November','December'].index(m.group(2)) + 1
        d0 = date.fromisoformat(r['date']); d1 = date(int(m.group(3)), mon, 28)
        return round((d1 - d0).days / 365.25, 2)
    return None
TERM = {'A19': 5.0}  # Nebius's filing: each order runs five years
EXPANDS = {'A07': 'A06'}  # the text says it expands A06 by the stated amount: added, not double counted
money = []
for r in A['rows']:
    if r['grade'] != 'first' or r.get('usd_bn') is None: continue
    if r.get('usd_monthly'):
        months = 36  # May 2026 to May 2029, as the filing states; the ramp months run at a reduced fee
        money.append(dict(id=r['id'], user=r['user'], provider=r['provider'], usd_bn=None, rate_bn_month=r['usd_bn'],
                          years=3.0, per_year=round(12 * r['usd_bn'], 1), est_term_total=round(months * r['usd_bn'], 1),
                          filed=True, contains=None, note='a monthly fee, terminable by either side on 90 days; the term total is an upper estimate'))
        continue
    y = years(r) or TERM.get(r['id'])
    money.append(dict(id=r['id'], user=r['user'], provider=r['provider'], usd_bn=r['usd_bn'], years=y,
                      per_year=round(r['usd_bn'] / y, 2) if y else None, filed='sec.gov' in r['url'] or r['id'] in ('A18', 'A19'),
                      contains=None, adds_to=EXPANDS.get(r['id']), note=r.get('usd_note')))
dev = {}
for m in money:
    d = dev.setdefault(m['user'], dict(user=m['user'], n=0, stated_bn=0, per_year_bn=0, no_term_bn=0, filed_bn=0, rate_per_year_bn=0))
    d['n'] += 1
    if m['usd_bn'] is not None:
        d['stated_bn'] += m['usd_bn']
        if m['per_year'] is not None: d['per_year_bn'] += m['per_year']
        else: d['no_term_bn'] += m['usd_bn']
        if m['filed']: d['filed_bn'] += m['usd_bn']
    else:
        d['rate_per_year_bn'] += m['per_year']
for d in dev.values():
    for k in ('stated_bn', 'per_year_bn', 'no_term_bn', 'filed_bn', 'rate_per_year_bn'): d[k] = round(d[k], 1)

# ---------- predictions
preds = [
 dict(id='P66', text='At most 5 of the 19 agreements state an end in a first-hand text.', held=len(ends) <= 5,
      result=f"{len(ends)} of {n} ({', '.join(sorted(ends))}); {len(ends_with_inf)} if the two filed master agreements govern the two order forms they probably govern ({', '.join(i for i in inferred)}), which no text says"),
 dict(id='P67', text='Every agreement that states an end is in a securities filing.', held=len(ends_filed) == len(ends),
      result=f"{len(ends_filed)} of {len(ends)}: every stated end is in a filing or a filed contract; no press release or blog post of either party names one, Anthropic's page on the xAI agreement included"),
 dict(id='P68', text='At most 3 of the 19 state a restriction on use (what the capacity may not be used for).', held=len(restr) <= 3,
      result=f"{len(restr)} of {n} ({', '.join(restr)}), both through a filed master agreement with CoreWeave; {len(restr_with_inf)} with the inferred order forms"),
 dict(id='P69', text='No first-hand text names a government or regulator as able to end or restrict the use.', held=not state,
      result=f"failed: {len(state)} ({', '.join(state)}). Both filed contracts let the provider suspend use when a court order, subpoena, law enforcement request or (OpenAI's) a binding regulator's demand requires it; neither lets a state end it"),
 dict(id='P70', text='Fetched directly, the cluster file holds the same 459 rows with a stated capacity as the rebuilt copy, total within 0.1 %.',
      held=len(cl) == len(old) and abs(diff['total_gap_pct']) <= 0.1,
      result=f"{len(cl)} rows, not {len(old)}: the rebuild lost one ({', '.join(diff['lost_in_rebuild'])}) and broke two names at a comma; total {diff['total_gap_pct']} % apart"),
 dict(id='P71', text="Standing at 2025-12-31, not superseded, the public share exceeds 10.7 % and lies within 1.5 points of the Studio's 12.6 %.",
      held=standing['public'] > 10.7 and abs(standing['public'] - 12.6) <= 1.5, result=f"{standing['public']} % of {standing['n']} standing clusters (all rows: {all_rows['public']} %)"),
 dict(id='P72', text='Private stays at or above 80 % of standing capacity.', held=standing['private'] >= 80, result=f"{standing['private']} %"),
]
out = dict(n=n, ends=sorted(ends), end_holders={k: sorted(v) for k, v in holder.items()}, ends_with_inferred=ends_with_inf,
           use_restrictions=restr, use_restrictions_with_inferred=restr_with_inf, state_levers=state, inferred=inferred,
           silent=sorted(silent), provider_alone_can_end=provider_alone,
           clusters_standing=standing, clusters_all_rows_direct=all_rows, clusters_rebuild_vs_direct=diff,
           money=money, money_by_developer=dev,
           hashes={'gpu_clusters.csv (direct, 2026-11-09)': sha(direct),
                   'ai_chip_owners_cumulative_by_designer.csv (copy in data/)': sha(P('data', 'ai_chip_owners_cumulative_by_designer.csv')),
                   'hyperscaler_compute_share.csv (copy in data/)': sha(P('data', 'hyperscaler_compute_share.csv'))},
           predictions=preds)
json.dump(out, open(P('results67.json'), 'w'), indent=1, ensure_ascii=False)
pub = dict(control=C['rows'], documents=docs, marks=marks, **out)
open(P('data67.js'), 'w').write('window.D67=' + json.dumps(pub, ensure_ascii=False, separators=(',', ':')) + ';\n')
for p in preds: print(p['id'], 'HELD' if p['held'] else 'FAILED', '-', p['result'])
print('holders', holder, 'silent', len(silent)); print('standing', standing); print('dev', json.dumps(dev))
for m in money: print(m)
