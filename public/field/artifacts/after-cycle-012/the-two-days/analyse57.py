"""Study 57 — the two days outside the funnel (session 255, 2026-11-06).

Answers the Studio's question ho-2026-11-06-studio-1: on 30 July and 31 August 2026, did INSP's
daily reports change how community deaths were swabbed or tabled?

Reads the same report texts as study 54 (INSP SitRep MVE-BDBV, INRB-UMIE/BDBV2026-Data at a5ee90c0,
`pdftotext -layout`; no PDF or text committed) with study 54's parser, executed unchanged from
../../cycle-012/the-quiet-curve/analyse54.py up to its first line of analysis.

Usage: python3 -I analyse57.py <dir of SitRep_MVE_*.txt>
Predictions: PREDICTIONS57.md (committed before this script was written).
"""
import json, math, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
SRC54 = os.path.join(HERE, '..', '..', 'cycle-012', 'the-quiet-curve', 'analyse54.py')
src = open(SRC54, encoding='utf-8').read()
cut = src.index('reports = [parse(p)')
g = {'__file__': SRC54, '__name__': 'study54'}
sys.argv = [SRC54, sys.argv[1]]
exec(compile(src[:cut], SRC54, 'exec'), g)
TXT = sys.argv[1]
parse, norm = g['parse'], g['norm']

import glob
paths = sorted(glob.glob(os.path.join(TXT, 'SitRep_MVE_*.txt')), key=lambda s: int(re.search(r'_(\d+)[-_]', s).group(1)))
assert len(paths) == 141
reports = []
for p in paths:
    r = parse(p)
    r['path'] = p
    z = [x for x in r['rows'] if not x['prov']]
    r['validshare'] = sum(x['valid'] for x in z) / len(z) if z else 0
    r['usable'] = bool(z) and any(x['how'] in ('k4', 'pos') for x in z) and r['validshare'] >= 0.8 and r['date'] is not None
    reports.append(r)
usable = [r for r in reports if r['usable']]

# reproduce study 54/55's series exactly
R55 = json.load(open(os.path.join(HERE, '..', '..', 'cycle-012', 'the-quiet-curve', 'results55.json')))
days = []
for r in usable:
    z = [x for x in r['rows'] if not x['prov'] and x['valid']]
    days.append(dict(n=r['n'], date=r['date'], k=sum(x['comm'] for x in z), N=sum(x['new'] for x in z), zones=z, rep=r))
K, N = sum(d['k'] for d in days), sum(d['N'] for d in days)
assert (K, N) == (1921, 5966), (K, N)
p = K / N
Z = 3.0902  # two-sided 99.8 %


def z_of(k, n):
    return (k - n * p) / math.sqrt(n * p * (1 - p)) if n else 0.0


assert len(days) == len(R55['days']) == 80
for d, e in zip(days, R55['days']):  # one date (1 Oct) has two reports, so match in order
    assert (d['date'], d['k'], d['N']) == (e['date'], e['k'], e['n']) and abs(round(z_of(d['k'], d['N']), 2) - e['z']) < 0.006, d['date']
STUDIO = ['2026-07-30', '2026-08-31']
idx = {d['date']: i for i, d in enumerate(days)}

# ---- P21: one zone carries each day (and the same test for every day, as the control) ----
def drop_top(d):
    zs = [x for x in d['zones'] if x['new'] > 0]
    top = max(zs, key=lambda x: abs(x['comm'] - x['new'] * p))
    k, n = d['k'] - top['comm'], d['N'] - top['new']
    return top, k, n, z_of(k, n)


per_day = []
for d in days:
    if not d['N']:
        continue
    top, k2, n2, z2 = drop_top(d)
    zs = sorted([dict(zone=x['name'], new=x['new'], comm=x['comm']) for x in d['zones'] if x['new'] > 0],
                key=lambda x: -x['new'])
    dev = d['k'] - d['N'] * p
    contrib = sorted([dict(zone=x['name'], dev=round(x['comm'] - x['new'] * p, 2)) for x in d['zones'] if x['new'] > 0],
                     key=lambda c: -abs(c['dev']))
    per_day.append(dict(date=d['date'], report=d['n'], k=d['k'], n=d['N'], z=round(z_of(d['k'], d['N']), 3),
                        dev=round(dev, 2), topShare=round((top['comm'] - top['new'] * p) / dev, 3) if dev else None,
                        contrib=contrib[:4],
                        top=dict(zone=top['name'], new=top['new'], comm=top['comm']),
                        k2=k2, n2=n2, z2=round(z2, 3), zones=zs))
pd = {x['date']: x for x in per_day}
p21 = all(abs(pd[s]['z2']) < Z for s in STUDIO)

# ---- P19: the zone table's column labels ----
START, END, ROW = g['START'], g['END'], g['ROW']


TITLE = re.compile(r"^\s*(TABLEAU\s*2\s*[—–-]|Tableau\s*2\s*[.:—–-]|Cas et d[ée]c[èe]s confirm[ée]s par province et zone de sant[ée] \(situation)")


def header_v1(path):
    """First run (recorded, superseded): from study 54's START match to the first data row, whole lines."""
    t = open(path, encoding='utf-8', errors='replace').read()
    m = START.search(t)
    if not m:
        return None
    out = []
    for line in t[m.start():].splitlines()[:40]:
        if ROW.match(line):
            break
        s_ = re.sub(r'\s+', ' ', line).strip()
        if s_:
            out.append(s_)
    return out


def header(path):
    """Repaired after the first run (declared in READING57.md): the column labels only. From the table's
    title line (a line that begins 'TABLEAU 2 —', 'Tableau 2.' or, 11-26 Aug, 'Cas et décès confirmés par province et zone de santé (situation') to its first data row, title excluded,
    as a sorted list of normalised words, so that line wrapping and the title's date do not count."""
    lines = open(path, encoding='utf-8', errors='replace').read().splitlines()
    for i, line in enumerate(lines):
        if TITLE.match(line):
            words = []
            for ln in lines[i + 1:i + 40]:
                if ROW.match(ln):
                    break
                words += [norm(w) for w in ln.split() if norm(w)]
            return sorted(words)
    return None


def neighbours(date):
    i = idx[date]
    return days[i - 1], days[i + 1]


p19, p19v1 = {}, {}
for s in STUDIO:
    b, a = neighbours(s)
    h1 = header_v1(days[idx[s]]['rep']['path'])
    p19v1[s] = h1 == header_v1(b['rep']['path']) and h1 == header_v1(a['rep']['path'])
for s in STUDIO:
    b, a = neighbours(s)
    h, hb, ha = header(days[idx[s]]['rep']['path']), header(b['rep']['path']), header(a['rep']['path'])
    p19[s] = dict(before=b['date'], after=a['date'], same_before=h == hb, same_after=h == ha, header=h,
                  header_before=hb, header_after=ha)
# the control: how often does the header change between consecutive usable reports at all?
hs = [header(d['rep']['path']) for d in days]
changes = [dict(date=days[i]['date'], report=days[i]['n']) for i in range(1, len(days)) if hs[i] != hs[i - 1]]
missing = [days[i]['date'] for i in range(len(days)) if hs[i] is None]
distinct = []
for h in hs:
    if h not in distinct:
        distinct.append(h)

# each report day's wording version, and whether a version differs from the main one by layout only
from collections import Counter
main_v = max(distinct, key=lambda h: hs.count(h))


def classify(h):
    if h == main_v:
        return 'main'
    extra = list((Counter(h) - Counter(main_v)).elements())
    missing = list((Counter(main_v) - Counter(h)).elements())
    for m in list(missing):  # a word split across two lines comes back as two fragments
        for a in extra:
            for b in extra:
                if a != b and a + b == m and a in extra and b in extra:
                    extra.remove(a); extra.remove(b); missing.remove(m)
                    break
            else:
                continue
            break
    return 'layout' if not extra else 'reworded'


vclass = [classify(h) for h in distinct]
day_version = [dict(date=days[i]['date'], report=days[i]['n'], v=distinct.index(hs[i]), cls=vclass[distinct.index(hs[i])]) for i in range(len(days))]


# ---- P20: sentences on sampling the dead ----
KW = re.compile(r"pr[ée]l[èe]v|[ée]couvillon|swab|post[- ]?mortem|\bEDS\b|enterrement|inhumation|d[ée]c[èe]s communautaire", re.I)


def kw_lines(path):
    t = open(path, encoding='utf-8', errors='replace').read()
    return [re.sub(r'\s+', ' ', ln).strip() for ln in t.splitlines() if KW.search(ln)]


p20 = {}
for s in STUDIO:
    b, a = neighbours(s)
    me, lb, la = kw_lines(days[idx[s]]['rep']['path']), kw_lines(b['rep']['path']), kw_lines(a['rep']['path'])
    new = [ln for ln in me if ln not in lb and ln not in la]
    p20[s] = dict(lines=len(me), new_lines=new, before=b['date'], after=a['date'])

# ---- P22: the report's own province/total rows against our zone sum ----
p22 = {}
for s in STUDIO:
    r = days[idx[s]]['rep']
    prov = [x for x in r['rows'] if x['prov'] and x['key'] != 'total']
    tot = [x for x in r['rows'] if x['key'] == 'total']
    p22[s] = dict(zone_sum=days[idx[s]]['k'], zone_new=days[idx[s]]['N'],
                  prov_sum=sum(x['comm'] for x in prov), prov_new=sum(x['new'] for x in prov),
                  prov_valid=all(x['valid'] for x in prov),
                  total=[dict(new=x['new'], comm=x['comm'], valid=x['valid']) for x in tot])
    p22[s]['match'] = p22[s]['prov_sum'] == p22[s]['zone_sum'] and p22[s]['prov_new'] == p22[s]['zone_new']

# control for P21: of all 80 days, how many fall inside the funnel after the same single-zone drop?
outside_after = [x['date'] for x in per_day if abs(x['z2']) >= Z]

# ---- found while reading (post hoc): a defect in study 54's series, and study 55 recomputed without it ----
# On 26 July (report 73) study 54's START pattern matched the prose "voir tableau 2" above Tableau 1, so the
# province rows of Tableau 1 were taken as the provinces and Tableau 2's own Total, Ituri and Haut-Uele rows
# were counted as zones. Tshopo is both a province and a zone, so it is kept.
PROVX = g['PROVINCES'] - {'tshopo'}
leaked = []
corr = []
for d in days:
    z = [x for x in d['zones'] if x['key'] not in PROVX]
    if len(z) != len(d['zones']):
        leaked.append(dict(date=d['date'], report=d['n'], rows=[dict(name=x['name'], new=x['new'], comm=x['comm'])
                                                               for x in d['zones'] if x['key'] in PROVX],
                           before=dict(k=d['k'], n=d['N']), after=dict(k=sum(x['comm'] for x in z), n=sum(x['new'] for x in z))))
    corr.append(dict(date=d['date'], k=sum(x['comm'] for x in z), n=sum(x['new'] for x in z)))
Kc, Nc = sum(x['k'] for x in corr), sum(x['n'] for x in corr)
pc = Kc / Nc
chi = sum((x['k'] - x['n'] * pc) ** 2 / (x['n'] * pc * (1 - pc)) for x in corr if x['n'])
dfc = sum(1 for x in corr if x['n']) - 1
zc = [dict(date=x['date'], k=x['k'], n=x['n'], z=round((x['k'] - x['n'] * pc) / math.sqrt(x['n'] * pc * (1 - pc)), 3)) for x in corr if x['n']]
from datetime import date as _d
rho_c = g['spearman']([(_d.fromisoformat(x['date']) - _d(2026, 7, 13)).days for x in corr if x['n']], [x['k'] / x['n'] for x in corr if x['n']])
h1 = [x for x in corr if x['date'] <= '2026-09-15']; h2 = [x for x in corr if x['date'] > '2026-09-15']
correction = dict(
    what="study 54's series counted Tableau 2's Total, Ituri and Haut-Uele rows as zones on 26 July (report 73)",
    cause="START matched the prose 'voir tableau 2' above Tableau 1, so Tableau 1's province rows were read as the provinces",
    leaked=leaked,
    study55_as_published=dict(k=K, n=N, s=round(K / N, 4), phi=2.29, outside=['2026-07-30', '2026-08-31']),
    study55_corrected=dict(k=Kc, n=Nc, s=round(pc, 4), wilson=g['wilson'](Kc, Nc), chi2=round(chi, 1), df=dfc, phi=round(chi / dfc, 3),
                           rho_date=round(rho_c, 3),
                           halves=[round(sum(x['k'] for x in h) / sum(x['n'] for x in h), 4) for h in (h1, h2)],
                           outside=[x for x in zc if abs(x['z']) >= Z]))

out = dict(study=57, session=255, date='2026-11-06',
           input=dict(reports=len(reports), usable=len(usable), K=K, N=N, p=round(p, 5), funnelZ=Z),
           predictions=dict(
               P19=dict(text='zone-table column labels identical to both neighbours on both days',
                        value={s: dict(before=p19[s]['before'], same_before=p19[s]['same_before'],
                                       after=p19[s]['after'], same_after=p19[s]['same_after']) for s in STUDIO},
                        held=all(p19[s]['same_before'] and p19[s]['same_after'] for s in STUDIO),
                        firstRun=dict(instrument='whole lines from study 54 START match', held=all(p19v1.values()),
                                      note='superseded: caught a prose sentence and the title date; see READING57.md')),
               P20=dict(text='no new sentence on sampling the dead, read as a change of practice, on either day',
                        value={s: p20[s] for s in STUDIO}, held=True,
                        note='decided by one reading of every flagged line and its paragraph, recorded in READING57.md'),
               P21=dict(text='dropping the single most deviant zone brings both days inside the funnel',
                        value={s: dict(top=pd[s]['top'], z=pd[s]['z'], z2=pd[s]['z2'], k2=pd[s]['k2'], n2=pd[s]['n2'],
                                       dev=pd[s]['dev'], topShare=pd[s]['topShare'], contrib=pd[s]['contrib']) for s in STUDIO},
                        held=p21, informative=False,
                        note='weak: the same drop brings every one of the 80 days inside the funnel (outsideAfterDrop is empty)'),
               P22=dict(text="the report's province rows print the same day counts as our zone sum on both days",
                        value=p22, held=all(p22[s]['match'] for s in STUDIO))),
           headers=dict(distinct=len(distinct), changes=changes, missing=missing,
                        versions=[dict(first=days[hs.index(h)]['date'], days=sum(1 for x in hs if x == h), cls=vclass[j], words=h,
                                      extra=sorted((Counter(h) - Counter(main_v)).elements()), missing=sorted((Counter(main_v) - Counter(h)).elements()))
                                 for j, h in enumerate(distinct)],
                        byDay=day_version,
                        studio={s: dict(header=p19[s]['header'], before=p19[s]['header_before'], after=p19[s]['header_after']) for s in STUDIO}),
           outsideAfterDrop=outside_after,
           correction54=correction,
           days=per_day)
json.dump(out, open(os.path.join(HERE, 'results57.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'data57.js'), 'w').write('window.D57 = ' + json.dumps(out, ensure_ascii=False) + ';\n')
for k, v in out['predictions'].items():
    print(k, v['held'])
print('header changes', len(changes), changes, 'distinct', len(distinct), 'missing', missing)
for s in STUDIO:
    print(s, pd[s]['z'], pd[s]['top'], pd[s]['z2'], pd[s]['zones'][:6])
    print('  P22', p22[s])
    print('  P20 new lines', len(p20[s]['new_lines']))
print('outside after drop', outside_after)
print(json.dumps(correction, ensure_ascii=False)[:1500])
