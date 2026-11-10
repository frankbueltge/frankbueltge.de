"""Study 62 — which count the cumulative keeps (session 260, 2026-11-07).

Answers the Studio's question offered with UNREAD state 4 (2026-11-07, relay ho-2026-11-07-studio-1): on
30 Oct the report's Ituri row counts one community death fewer than its zones (34/12 vs 34/13); does the
next cumulative count side with the row or with the zones?

Reads the same report texts as studies 54, 57, 59 and 61 (INSP SitRep MVE-BDBV, INRB-UMIE/BDBV2026-Data at
a5ee90c0, `pdftotext -layout`; no PDF or text committed) with study 54's parser, executed from
../../cycle-012/the-quiet-curve/analyse54.py up to its first line of analysis, with study 61's one change
(each row also carries its printed cells; the decision is unchanged and asserted to be).

Usage: python3 -I analyse62.py <dir of SitRep_MVE_*.txt>
Predictions: PREDICTIONS62.md (committed d1ce1806 before this script was written).
"""
import collections, glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC54 = os.path.join(HERE, '..', '..', 'cycle-012', 'the-quiet-curve', 'analyse54.py')
src = open(SRC54, encoding='utf-8').read()
cut = src.index('reports = [parse(p)')
OLD = "rows.append(dict(name=x['name'], key=key, prov=isprov, new=new or 0, comm=comm or 0, valid=valid, how=how))"
NEW = ("rows.append(dict(name=x['name'], key=key, prov=isprov, new=new or 0, comm=comm or 0, valid=valid, how=how,"
       " cte=cte, tot=tot, cum=x['cum'], dth=x['dth'], cfr=x['cfr'], page=x['page']))")
assert src[:cut].count(OLD) == 1
TXT = sys.argv[1]
g = {'__file__': SRC54, '__name__': 'study54'}
sys.argv = [SRC54, TXT]
exec(compile(src[:cut].replace(OLD, NEW), SRC54, 'exec'), g)
parse, norm, START, END, PROVINCES = g['parse'], g['norm'], g['START'], g['END'], g['PROVINCES']

paths = sorted(glob.glob(os.path.join(TXT, 'SitRep_MVE_*.txt')), key=lambda s: int(re.search(r'_(\d+)[-_]', s).group(1)))
assert len(paths) == 141
usable = {}
for p in paths:
    r = parse(p)
    r['path'] = p
    z = [x for x in r['rows'] if not x['prov']]
    vs = sum(x['valid'] for x in z) / len(z) if z else 0
    if bool(z) and any(x['how'] in ('k4', 'pos') for x in z) and vs >= 0.8 and r['date'] is not None:
        usable[r['n']] = r
assert len(usable) == 80  # studies 54, 59 and 61's usable reports


def readable(x):
    return x['how'] in ('k4', 'pos', 'blank')  # layout read; the fatality guard is not applied here


def day_deaths(x):
    if x['tot'] is not None:
        return x['tot']
    return (x['comm'] or 0) + (x['cte'] or 0)


def with_province(r):
    cur, out = None, []
    for x in r['rows']:
        if x['prov']:
            cur = x['key']
        out.append((cur, x))
    return out


# First run read only "A ventiler  NA  <deaths>"; it missed "A ventiler*", "A ventiler *", "À ventiler*" and report 140's "AN"
# (found after the scores were seen; both runs are recorded in results62.json and on the page).
VENT = re.compile(r"^\s*[AÀ]\s+ventiler\s*\*?\s+(?:NA|AN)\s+(\d{1,3}(?: \d{3})+|\d+)", re.I)
VENT0 = re.compile(r"^\s*A\s+ventiler\s+NA\s+(\d{1,3}(?: \d{3})+|\d+)", re.I)


def ventiler(r, rx=None):
    """'A ventiler' deaths (cases unassigned to a zone), attached to the province row printed above them."""
    t = open(r['path'], encoding='utf-8', errors='replace').read()
    m = START.search(t)
    seg = t[m.start():]
    e = END.search(seg, 200)
    seg = seg[:e.start()] if e else seg[:25000]
    cur, out, seen = None, collections.defaultdict(int), set()
    for line in seg.splitlines():
        v = (rx or VENT).match(line)
        if v and cur:
            out[cur] += int(v.group(1).replace(' ', ''))
            continue
        w = re.match(r"^\s*([A-Za-zÀ-ÿ'’\-\. ]+?)\s{2,}\d", line)
        if w:
            k = norm(w.group(1))
            if k in PROVINCES and k not in seen and k != 'total':
                seen.add(k)
                cur = k
    return out


pairs = [(usable[n], usable[n + 1]) for n in sorted(usable) if n + 1 in usable]
steps = []  # one per row present, readable, in both reports of a pair
for a, b in pairs:
    pa = {(p, x['key'], x['prov']): x for p, x in with_province(a) if readable(x)}
    for p, x in with_province(b):
        k = (p, x['key'], x['prov'])
        if k not in pa or not readable(x) or x['key'] == 'total':
            continue
        y = pa[k]
        steps.append(dict(a=a['n'], b=b['n'], date=b['date'], prov=p, zone=x['name'], is_prov=x['prov'],
                          d_step=x['dth'] - y['dth'], d_day=day_deaths(x), c_step=x['cum'] - y['cum'], c_day=x['new'] or 0))

P = {}


def share(rows, f):
    k = sum(1 for s in rows if f(s))
    return dict(k=k, n=len(rows), share=round(k / len(rows), 4) if rows else None)


pv = [s for s in steps if s['is_prov']]
zn = [s for s in steps if not s['is_prov']]
zd = [s for s in zn if s['d_day'] > 0 or s['d_step'] != 0]
zc = [s for s in zn if s['c_day'] > 0 or s['c_step'] != 0]
keep_d = lambda s: s['d_step'] == s['d_day']
keep_c = lambda s: s['c_step'] == s['c_day']
P['P39'] = dict(text='province rows keep their death step in >= 90 % of province-pairs', value=share(pv, keep_d))
P['P39']['held'] = P['P39']['value']['share'] >= 0.90
v40 = share(zd, keep_d)
P['P40'] = dict(text='zone rows keep their death step less often than provinces, and in < 90 % of zone-pairs with a death on either side',
                value=v40)
P['P40']['held'] = v40['share'] < P['P39']['value']['share'] and v40['share'] < 0.90
v41 = share(zc, keep_c)
P['P41'] = dict(text='zone rows keep their case step more often than their death step', value=v41)
P['P41']['held'] = v41['share'] > v40['share']

sums = []
for n in sorted(usable):
    r = usable[n]
    vent = ventiler(r)
    rows = with_province(r)
    for x in [x for _, x in rows if x['prov'] and x['key'] != 'total']:
        zs = [z for p, z in rows if p == x['key'] and not z['prov']]
        if not zs or not all(readable(z) for z in zs) or not readable(x):
            continue
        s = sum(z['dth'] for z in zs) + vent.get(x['key'], 0)
        sums.append(dict(report=n, date=r['date'], prov=x['key'], row=x['dth'], zones=s, vent=vent.get(x['key'], 0),
                         rowcases=x['cum'], zonecases=sum(z['cum'] for z in zs)))
P['P42'] = dict(text="zones' cumulative deaths + 'A ventiler' equal the province row's on >= 90 % of province-reports",
                value=share(sums, lambda s: s['row'] == s['zones']))
P['P42']['held'] = P['P42']['value']['share'] >= 0.90
first42 = []
for n in sorted(usable):
    r = usable[n]
    v0 = ventiler(r, VENT0)
    rows = with_province(r)
    for x in [x for _, x in rows if x['prov'] and x['key'] != 'total']:
        zs = [z for p, z in rows if p == x['key'] and not z['prov']]
        if zs and all(readable(z) for z in zs) and readable(x):
            first42.append(x['dth'] == sum(z['dth'] for z in zs) + v0.get(x['key'], 0))
P['P42']['first_run'] = dict(k=sum(first42), n=len(first42), share=round(sum(first42) / len(first42), 4))
by = {p: share([s for s in zd if s['prov'] == p], lambda s: not keep_d(s)) for p in ('ituri', 'nordkivu')}
P['P43'] = dict(text="Ituri's zones break their death step more often than North Kivu's", value=by)
P['P43']['held'] = by['ituri']['share'] > by['nordkivu']['share']

# The Studio's day: 30 Oct (report 169) and its neighbours, Ituri
def ituri(n):
    r = usable.get(n)
    if r is None:
        return None
    rows = with_province(r)
    row = [x for p, x in rows if x['prov'] and x['key'] == 'ituri'][0]
    zs = [x for p, x in rows if p == 'ituri' and not x['prov']]
    return dict(report=n, date=r['date'], row=dict(cum=row['cum'], dth=row['dth'], new=row['new'], comm=row['comm'], cte=row['cte'], tot=row['tot']),
                zones=dict(cum=sum(z['cum'] for z in zs), dth=sum(z['dth'] for z in zs), new=sum(z['new'] for z in zs),
                           comm=sum(z['comm'] for z in zs), cte=sum((z['cte'] or 0) for z in zs), tot=sum(day_deaths(z) for z in zs)),
                vent=ventiler(r).get('ituri', 0))


studio = [ituri(n) for n in (168, 169, 170, 171)]
assert all(studio)
s168, s169, s170 = studio[0], studio[1], studio[2]
answer = dict(
    row_step_30oct=s169['row']['dth'] - s168['row']['dth'], row_day_30oct=s169['row']['tot'],
    zone_step_30oct=(s169['zones']['dth'] + s169['vent']) - (s168['zones']['dth'] + s168['vent']),
    zone_day_30oct=s169['zones']['tot'], zone_comm_cte_30oct=s169['zones']['comm'] + s169['zones']['cte'],
    row_step_31oct=s170['row']['dth'] - s169['row']['dth'], row_day_31oct=s170['row']['tot'],
    zone_step_31oct=(s170['zones']['dth'] + s170['vent']) - (s169['zones']['dth'] + s169['vent']), zone_day_31oct=s170['zones']['tot'])
zone169 = [dict(zone=x['name'], comm=x['comm'], cte=x['cte'], tot=x['tot'],
                step=x['dth'] - {z['key']: z for p, z in with_province(usable[168]) if p == 'ituri'}[x['key']]['dth'])
           for p, x in with_province(usable[169]) if p == 'ituri' and not x['prov'] and (day_deaths(x) or x['new'])]

# per report, the zone death steps broken (for the figure)
per = collections.OrderedDict()
for s in zd:
    d = per.setdefault(s['b'], dict(report=s['b'], date=s['date'], ituri=[0, 0], nordkivu=[0, 0], other=[0, 0], gap=0))
    k = s['prov'] if s['prov'] in ('ituri', 'nordkivu') else 'other'
    d[k][1] += 1
    if not keep_d(s):
        d[k][0] += 1
        d['gap'] += s['d_step'] - s['d_day']
for s in pv:
    d = per.setdefault(s['b'], dict(report=s['b'], date=s['date'], ituri=[0, 0], nordkivu=[0, 0], other=[0, 0], gap=0))
    d.setdefault('prov_broken', [])
    if not keep_d(s):
        d['prov_broken'].append(dict(prov=s['prov'], step=s['d_step'], day=s['d_day']))
for d in per.values():
    d.setdefault('prov_broken', [])
broken_z = [s for s in zd if not keep_d(s)]
direction = dict(step_above_day=sum(1 for s in broken_z if s['d_step'] > s['d_day']),
                 step_below_day=sum(1 for s in broken_z if s['d_step'] < s['d_day']),
                 net=sum(s['d_step'] - s['d_day'] for s in broken_z),
                 step_zero_day_positive=sum(1 for s in broken_z if s['d_step'] == 0 and s['d_day'] > 0),
                 negative_steps=sum(1 for s in zn if s['d_step'] < 0))

for k in sorted(P):
    print(k, 'HELD' if P[k]['held'] else 'FAILED', json.dumps(P[k]['value'], ensure_ascii=False)[:400])
print('answer', answer)
print('direction', direction)
print('pairs', len(pairs), 'steps', len(steps))
# Decided after the scores above were seen, descriptive only: a row the parser reads with no name (under Tshopo,
# 22 of the 62 pairs) is not a zone that can be followed from report to report. Without it:
named = [s for s in zd if s['zone'].strip()]
post = dict(named_zone_pairs=share(named, keep_d), unnamed_breaks=sum(1 for s in zd if not s['zone'].strip() and not keep_d(s)),
            report94_province_steps=[dict(prov=s['prov'], step=s['d_step'], day=s['d_day']) for s in pv if s['b'] == 94])
print('post hoc', post)
out = dict(study=62, session=260, date='2026-11-07', predictions_commit='d1ce1806807f2fee2a6138477da3e3db410e9668',
           reports=len(usable), pairs=len(pairs), predictions=P, studio_day=dict(ituri=studio, answer=answer, zones_169=zone169),
           direction=direction, post_hoc=post, sums_failed=[s for s in sums if s['row'] != s['zones']],
           broken_province_steps=[s for s in pv if not keep_d(s)])
json.dump(out, open(os.path.join(HERE, 'results62.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
fig = []
for a, b in pairs:
    zb = [dict(zone=s['zone'], prov=s['prov'], step=s['d_step'], day=s['d_day']) for s in zd
          if s['b'] == b['n'] and s['zone'].strip() and not keep_d(s)]
    pb = [dict(prov=s['prov'], step=s['d_step'], day=s['d_day']) for s in pv if s['b'] == b['n'] and not keep_d(s)]
    fig.append(dict(report=b['n'], date=b['date'], zones=sum(1 for s in zd if s['b'] == b['n'] and s['zone'].strip()), zb=zb, pb=pb))
open(os.path.join(HERE, 'data62.js'), 'w', encoding='utf-8').write(
    'window.D62=' + json.dumps(dict(fig=fig, answer=answer, ituri=studio, zones169=zone169,
                                     P={k: dict(held=v['held'], value=v['value'], first_run=v.get('first_run')) for k, v in P.items()},
                                     direction=direction, post_hoc=post, pairs=len(pairs)), ensure_ascii=False, separators=(',', ':')) + ';\n')
