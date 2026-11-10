"""Study 61 — what the parser threw away (session 259, 2026-11-07).

Answers the Studio's correction offered with UNREAD state 3 (2026-11-06): our Ituri zone sums for study 59
differ from the report's own Ituri row on 6 Oct (32/10 vs 33/10) and 30 Oct (21/7 vs 34/12). Is a zone
missing from the parse?

Reads the same report texts as studies 54, 57 and 59 (INSP SitRep MVE-BDBV, INRB-UMIE/BDBV2026-Data at
a5ee90c0, `pdftotext -layout`; no PDF or text committed) with study 54's parser, executed from
../../cycle-012/the-quiet-curve/analyse54.py up to its first line of analysis, with one change only: each
row also carries the printed cells and the reasons it was judged invalid (the decision itself is unchanged
and is asserted to be unchanged). Reads results59.json for study 59's published days.

Usage: python3 -I analyse61.py <dir of SitRep_MVE_*.txt>
Predictions: PREDICTIONS61.md (committed before this script was written).
"""
import glob, json, math, os, random, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC54 = os.path.join(HERE, '..', '..', 'cycle-012', 'the-quiet-curve', 'analyse54.py')
src = open(SRC54, encoding='utf-8').read()
cut = src.index('reports = [parse(p)')
OLD = "rows.append(dict(name=x['name'], key=key, prov=isprov, new=new or 0, comm=comm or 0, valid=valid, how=how))"
NEW = ("rows.append(dict(name=x['name'], key=key, prov=isprov, new=new or 0, comm=comm or 0, valid=valid, how=how,"
       " cte=cte, tot=tot, cum=x['cum'], dth=x['dth'], cfr=x['cfr'], page=x['page'],"
       " why=[w for w, b in (('layout', how not in ('k4', 'pos', 'blank')),"
       " ('fatality', bool(x['cum']) and abs(100 * x['dth'] / x['cum'] - x['cfr']) >= 0.15),"
       " ('total', tot is not None and (comm or 0) + (cte or 0) != tot),"
       " ('community', comm is not None and comm > (new or 0))) if b]))")
assert src[:cut].count(OLD) == 1
TXT = sys.argv[1]
g = {'__file__': SRC54, '__name__': 'study54'}
sys.argv = [SRC54, TXT]
exec(compile(src[:cut].replace(OLD, NEW), SRC54, 'exec'), g)
parse, ROW, START, END = g['parse'], g['ROW'], g['START'], g['END']

paths = sorted(glob.glob(os.path.join(TXT, 'SitRep_MVE_*.txt')), key=lambda s: int(re.search(r'_(\d+)[-_]', s).group(1)))
assert len(paths) == 141
usable, every = [], {}
for p in paths:
    r = parse(p)
    every[r['n']] = r
    r['path'] = p
    for x in r['rows']:
        assert x['valid'] == (not x['why']), (r['n'], x['name'])  # the decision is study 54's, unchanged
    z = [x for x in r['rows'] if not x['prov']]
    vs = sum(x['valid'] for x in z) / len(z) if z else 0
    if bool(z) and any(x['how'] in ('k4', 'pos') for x in z) and vs >= 0.8 and r['date'] is not None:
        usable.append(r)
assert len(usable) == 80


def province_of(r):
    """Each zone row with the province row it sits under."""
    cur, out = None, []
    for x in r['rows']:
        if x['prov']:
            cur = x['key']
            continue
        out.append((cur, x))
    return out


ALL = [(r, prov, x) for r in usable for prov, x in province_of(r)]
pub_k = sum(x['comm'] for r, _, x in ALL if x['valid'])
pub_n = sum(x['new'] for r, _, x in ALL if x['valid'])
assert pub_k == 1921  # studies 54 and 59's series as published
TWO = [(r, p, x) for r, p, x in ALL if p in ('ituri', 'nordkivu')]

# P36: rows rejected only by the fatality-rate guard, with four day-cells printed and consistent
def guard_only(x):
    return x['why'] == ['fatality'] and x['how'] == 'k4'


g2 = [t for t in TWO if guard_only(t[2])]
inv2 = [t for t in TWO if not t[2]['valid']]
P = {}
P['P36'] = dict(text='rows rejected only by the fatality-rate guard (four day-cells, total = community + CTE, community <= new) are < 2 % of Ituri and North Kivu zone rows',
                value=dict(rows=len(TWO), invalid=len(inv2), guard_only=len(g2), share=round(len(g2) / len(TWO), 4),
                           guard_only_nonzero=sum(1 for t in g2 if t[2]['new'] or t[2]['comm']),
                           reports=sorted({t[0]['n'] for t in g2})),
                held=len(g2) / len(TWO) < 0.02)

# P37: a lone day number on its own line inside the zone table, left of the Total column (Adja's kind)
def lone_cells(r):
    t = open(r['path'], encoding='utf-8', errors='replace').read()
    m = START.search(t)
    if not m:
        return []
    seg = t[m.start():]
    e = END.search(seg, 200)
    seg = seg[:e.start()] if e else seg[:25000]
    hits = []
    for page in seg.split('\f'):
        lines = page.splitlines()
        full = [ln for ln in lines if ROW.match(ln)]
        # the Total column's right edge on this page: the rightmost end of a row's last number
        right = max((len(ln.rstrip()) for ln in full), default=None)
        prev = None
        for ln in lines:
            rm = ROW.match(ln)
            if rm:
                # only a row that prints no day-cell of its own can have them wrapped onto the next line
                prev = rm.group(1).strip() if not rm.group(5).strip() else None
                continue
            if not ln.strip():
                continue
            nums = [(int(m.group(1)), m.end()) for m in re.finditer(r'(?<!\S)(\d{1,3})(?!\S)', ln)]
            if prev is not None and right is not None and re.fullmatch(r'[\s\d]+', ln) and \
                    any(end < right - 8 for _, end in nums):
                hits.append(dict(after=prev, cells=[v for v, _ in nums],
                                 value=sum(v for v, end in nums if end < right - 8)))
            prev = None
    return hits


lone = {r['n']: lone_cells(r) for r in usable}
lone = {k: v for k, v in lone.items() if v}
P['P37'] = dict(text="a day number printed on a line of its own inside the zone table occurs in <= 5 of the 80 reports",
                value=dict(reports=len(lone), cells=sum(len(v) for v in lone.values()),
                           where={str(k): v for k, v in sorted(lone.items())}),
                held=len(lone) <= 5)

# P38: readmit guard-only rows (all provinces) into the series
ga = [x for r, _, x in ALL if guard_only(x)]
k2, n2 = pub_k + sum(x['comm'] for x in ga), pub_n + sum(x['new'] for x in ga)
P['P38'] = dict(text='readmitting guard-only rows changes the series\' pooled community share by < 0.5 points',
                value=dict(published=[pub_k, pub_n, round(pub_k / pub_n, 4)], readmitted_rows=len(ga),
                           readmitted=[k2, n2, round(k2 / n2, 4)], change=round(k2 / n2 - pub_k / pub_n, 4)),
                held=abs(k2 / n2 - pub_k / pub_n) < 0.005)

# P35: study 59 with its two days restored
R59 = json.load(open(os.path.join(HERE, 'results59.json'), encoding='utf-8'))
byn = {r['n']: r for r in usable}


def ituri_full(n, lone_fix=True):
    """Ituri's zone rows read whole: valid rows and every rejected row whose four day-cells are printed."""
    r = byn[n]
    zs = [x for p, x in province_of(r) if p == 'ituri']
    # P35 readmits every row whose four day-cells are printed (k4), whatever the guards said of it
    new = sum(x['new'] for x in zs if x['valid'] or x['how'] == 'k4')
    comm = sum(x['comm'] for x in zs if x['valid'] or x['how'] == 'k4')
    other = [x['name'] for x in zs if not (x['valid'] or x['how'] == 'k4')]
    return new, comm, other


def pooled(js, key=None):
    if key == 'next':
        js = [j for j in js if j['next'] and j['next']['new']]
        k, n = sum(j['next']['comm'] for j in js), sum(j['next']['new'] for j in js)
    else:
        k, n = sum(j['comm'] for j in js), sum(j['new'] for j in js)
    return k, n, (k / n if n else None)


def compare(joined, key=None, seed=59, B=4000):  # study 59's compare(), unchanged but for its argument
    W = [j for j in joined if j['written']]
    U = [j for j in joined if not j['written']]
    kw, nw, sw = pooled(W, key)
    ku, nu, su = pooled(U, key)
    rng = random.Random(seed)
    diffs = []
    for _ in range(B):
        bw = [W[rng.randrange(len(W))] for _ in W]
        bu = [U[rng.randrange(len(U))] for _ in U]
        a, b = pooled(bw, key)[2], pooled(bu, key)[2]
        if a is not None and b is not None:
            diffs.append(a - b)
    diffs.sort()
    lo, hi = diffs[int(0.025 * len(diffs))], diffs[int(0.975 * len(diffs)) - 1]
    return dict(written=dict(days=len(W), k=kw, n=nw, share=round(sw, 4)),
                none=dict(days=len(U), k=ku, n=nu, share=round(su, 4)),
                diff=round(sw - su, 4), ci95=[round(lo, 4), round(hi, 4)])


days = [dict(j, next=dict(j['next']) if j['next'] else None) for j in R59['days']]
base = compare(days)
pm = R59['predictions']['P27']['value']
assert (base['diff'], base['ci95']) == (pm['diff'], pm['ci95'])  # study 59 reproduced from its own days
fixes = []
for j in days:
    if j['report'] == 145:  # Adja's lone cell: one new case, no community death
        assert ('Adja', 1) in [(c['after'], c['value']) for c in lone.get(145, [])]
        fixes.append(dict(report=145, date=j['date'], was=[j['new'], j['comm']], now=[j['new'] + 1, j['comm']],
                          why="Adja's one new case is printed on a line of its own beneath Adja's row"))
        j['new'] += 1
    if j['report'] == 169:
        nw, cm, other = ituri_full(169)
        assert not other
        fixes.append(dict(report=169, date=j['date'], was=[j['new'], j['comm']], now=[nw, cm],
                          why='seven rows read whole but rejected by the guard against shifted rows; the zones then sum to 34/13, the report\'s own Ituri row says 34/12'))
        j['new'], j['comm'] = nw, cm
    if j['next'] and j['next']['report'] == 145:
        j['next']['new'] += 1
    if j['next'] and j['next']['report'] == 169:
        j['next']['new'], j['next']['comm'] = ituri_full(169)[:2]
fixed = compare(days)
lagfixed = compare(days, 'next')
P['P35'] = dict(text="restoring the two days moves study 59's pooled difference by < 1 point and its P27 still holds",
                value=dict(published=dict(diff=base['diff'], ci95=base['ci95']), restored=fixed,
                           move=round(fixed['diff'] - base['diff'], 4), lag_restored=lagfixed, fixes=fixes),
                held=abs(fixed['diff'] - base['diff']) < 0.01 and abs(fixed['diff']) < 0.10 and fixed['ci95'][0] <= 0 <= fixed['ci95'][1])

# report 169 read whole: does the report agree with itself?
z169 = [x for p, x in province_of(byn[169]) if p == 'ituri']
h169 = [x for x in byn[169]['rows'] if x['prov'] and x['key'] == 'ituri'][0]
self169 = dict(zones=dict(new=sum(x['new'] for x in z169), comm=sum(x['comm'] for x in z169),
                          cte=sum(x['cte'] or 0 for x in z169), tot=sum(x['tot'] or 0 for x in z169)),
               province=dict(new=h169['new'], comm=h169['comm'], cte=h169['cte'], tot=h169['tot']))

# post hoc (after the predictions were scored): does a guard-only row print the previous report's rate?
stale = []
for r in usable:
    prev = every.get(r['n'] - 1)
    if prev is None:
        continue
    pz = {(p, x['key']): x for p, x in province_of(prev)}
    for p, x in province_of(r):
        if guard_only(x):
            q = pz.get((p, x['key']))
            stale.append(dict(report=r['n'], prov=p, name=x['name'], printed=x['cfr'], calc=round(100 * x['dth'] / x['cum'], 2),
                              prev_printed=q['cfr'] if q else None, same_as_prev=bool(q) and q['cfr'] == x['cfr']))
post_hoc = dict(note='computed after P35-P38 were scored; descriptive',
                guard_only_rows=len(stale), same_as_previous_report=sum(s['same_as_prev'] for s in stale), rows=stale)
print('post hoc stale', post_hoc['same_as_previous_report'], 'of', post_hoc['guard_only_rows'])

# per report: every invalid zone row, for the figure (all provinces)
rep = []
for r in usable:
    inv = [dict(prov=p, name=x['name'], why=x['why'], how=x['how'], cells=[x['new'], x['comm'], x['cte'], x['tot']],
                cum=x['cum'], dth=x['dth'], cfr=x['cfr'], calc=round(100 * x['dth'] / x['cum'], 2) if x['cum'] else None)
           for p, x in province_of(r) if not x['valid']]
    rep.append(dict(report=r['n'], date=r['date'], zones=len(province_of(r)), invalid=inv, lone=lone.get(r['n'], [])))
why_counts = {}
for r, _, x in ALL:
    if not x['valid']:
        k = 'guard only' if guard_only(x) else '+'.join(x['why'])
        why_counts[k] = why_counts.get(k, 0) + 1

for k in ('P35', 'P36', 'P37', 'P38'):
    print(k, 'HELD' if P[k]['held'] else 'FAILED', json.dumps(P[k]['value'], ensure_ascii=False)[:600])
print('169 self', self169)
print('why', why_counts, 'zone rows', len(ALL))

out = dict(study=61, session=259, date='2026-11-07', input=dict(reports=141, usable=80, zone_rows=len(ALL)),
           predictions={k: P[k] for k in ('P35', 'P36', 'P37', 'P38')}, report169_self=self169,
           invalid_by_reason=why_counts, post_hoc=post_hoc, reports=rep)
json.dump(out, open(os.path.join(HERE, 'results61.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'data61.js'), 'w', encoding='utf-8').write(
    'window.D61=' + json.dumps(dict(reports=rep, why=why_counts, rows=len(ALL), self169=self169,
                                     P={k: dict(held=P[k]['held'], text=P[k]['text']) for k in ('P35', 'P36', 'P37', 'P38')},
                                     p35=P['P35']['value'], p36=P['P36']['value'], p37=dict(reports=P['P37']['value']['reports'], cells=P['P37']['value']['cells']),
                                     p38=P['P38']['value'], stale=post_hoc), ensure_ascii=False) + ';\n')
