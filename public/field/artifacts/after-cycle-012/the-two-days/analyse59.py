"""Study 59 — days that write failures (session 257, 2026-11-06).

Answers the Studio's question offered with UNREAD on 2026-11-06: on report days whose Ituri line on the
dead writes failures, is the share of community deaths among Ituri's new confirmed cases different?

Reads the same report texts as studies 54 and 57 (INSP SitRep MVE-BDBV, INRB-UMIE/BDBV2026-Data at
a5ee90c0, `pdftotext -layout`; no PDF or text committed) with study 54's parser, executed unchanged
from ../../cycle-012/the-quiet-curve/analyse54.py up to its first line of analysis. Joins the Studio's
reading of Ituri's line (studio repo, etudes/unread/data.json, read at the commit named in results59.json)
on the report number.

Usage: python3 -I analyse59.py <dir of SitRep_MVE_*.txt> <studio data.json>
Predictions: PREDICTIONS59.md (committed before this script was written).
"""
import glob, hashlib, json, math, os, random, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC54 = os.path.join(HERE, '..', '..', 'cycle-012', 'the-quiet-curve', 'analyse54.py')
src = open(SRC54, encoding='utf-8').read()
cut = src.index('reports = [parse(p)')
TXT, STUDIO = sys.argv[1], sys.argv[2]
g = {'__file__': SRC54, '__name__': 'study54'}
sys.argv = [SRC54, TXT]
exec(compile(src[:cut], SRC54, 'exec'), g)
parse, norm, spearman = g['parse'], g['norm'], g['spearman']

paths = sorted(glob.glob(os.path.join(TXT, 'SitRep_MVE_*.txt')), key=lambda s: int(re.search(r'_(\d+)[-_]', s).group(1)))
assert len(paths) == 141
reports, usable = {}, []
for p in paths:
    r = parse(p)
    r['path'] = p
    z = [x for x in r['rows'] if not x['prov']]
    vs = sum(x['valid'] for x in z) / len(z) if z else 0
    r['usable'] = bool(z) and any(x['how'] in ('k4', 'pos') for x in z) and vs >= 0.8 and r['date'] is not None
    reports[r['n']] = r
    if r['usable']:
        usable.append(r)
# study 54/55's series as published (before the correction of 26 July, which lies outside this window)
assert len(usable) == 80
assert sum(sum(x['comm'] for x in r['rows'] if not x['prov'] and x['valid']) for r in usable) == 1921


def ituri(r):
    """Ituri's zone rows: the rows after the Ituri province row and before the next province row."""
    out, inside = [], False
    for x in r['rows']:
        if x['prov']:
            if inside:
                break
            inside = x['key'] == 'ituri'
            prow = x if inside else None
            if inside:
                head = x
            continue
        if inside:
            out.append(x)
    return (head if out or inside else None), out


S = json.load(open(STUDIO, encoding='utf-8'))
sha_studio = hashlib.sha256(open(STUDIO, 'rb').read()).hexdigest()
lines = [d for d in S['days'] if d.get('alerts') is not None]
assert len(lines) == S['totals']['with_line'] == 55
assert sum(1 for d in lines if d['unread'] is not None) == S['totals']['written'] == 22

order = [r['n'] for r in usable]
joined = []
for d in lines:
    r = reports.get(d['report'])
    if r is None or not r['usable']:
        continue
    head, zs = ituri(r)
    v = [x for x in zs if x['valid']]
    new, comm = sum(x['new'] for x in v), sum(x['comm'] for x in v)
    i = order.index(r['n'])
    nxt = usable[i + 1] if i + 1 < len(usable) else None
    nnew = ncomm = None
    if nxt is not None:
        nh, nz = ituri(nxt)
        nv = [x for x in nz if x['valid']]
        nnew, ncomm = sum(x['new'] for x in nv), sum(x['comm'] for x in nv)
    joined.append(dict(report=r['n'], date=r['date'], written=d['unread'] is not None, unread=d['unread'],
                       alerts=d['alerts'], swabbed=d['swabbed'], new=new, comm=comm,
                       zones=len(zs), invalid=len(zs) - len(v),
                       provNew=head['new'] if head else None, provComm=head['comm'] if head else None,
                       provValid=bool(head and head['valid']),
                       next=dict(report=nxt['n'], date=nxt['date'], new=nnew, comm=ncomm) if nxt else None,
                       q=d['q'], uq=d.get('uq')))
joined.sort(key=lambda j: j['report'])
notjoined = [d['report'] for d in lines if d['report'] not in {j['report'] for j in joined}]
print('joined', len(joined), 'not joined', notjoined)


def pooled(js, key=None):
    if key == 'next':
        js = [j for j in js if j['next'] and j['next']['new']]
        k, n = sum(j['next']['comm'] for j in js), sum(j['next']['new'] for j in js)
    else:
        k, n = sum(j['comm'] for j in js), sum(j['new'] for j in js)
    return k, n, (k / n if n else None)


def wilson(k, n, z=1.96):
    if not n:
        return None
    p = k / n
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return [round(c - h, 4), round(c + h, 4)]


def compare(key=None, seed=59, B=4000):
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
    return dict(written=dict(days=len(W), k=kw, n=nw, share=round(sw, 4), wilson=wilson(kw, nw)),
                none=dict(days=len(U), k=ku, n=nu, share=round(su, 4), wilson=wilson(ku, nu)),
                diff=round(sw - su, 4), ci95=[round(lo, 4), round(hi, 4)], draws=len(diffs))


main = compare()
lag = compare('next')
P = {}
P['P27'] = dict(text='pooled shares differ by < 10 points and the 95 % bootstrap interval of the difference contains 0',
                value=main, held=abs(main['diff']) < 0.10 and main['ci95'][0] <= 0 <= main['ci95'][1])

# P28: runs test on the written/none sequence in report order
seq = [j['written'] for j in joined]
n1, n2 = sum(seq), len(seq) - sum(seq)
runs = 1 + sum(1 for a, b in zip(seq, seq[1:]) if a != b)
mu = 2 * n1 * n2 / (n1 + n2) + 1
var = 2 * n1 * n2 * (2 * n1 * n2 - n1 - n2) / ((n1 + n2) ** 2 * (n1 + n2 - 1))
zr = (runs - mu) / math.sqrt(var)
pr = 0.5 * math.erfc(-zr / math.sqrt(2))  # one-sided, fewer runs than expected
P['P28'] = dict(text='days that write failures cluster: fewer runs than expected, one-sided p < 0.05',
                value=dict(n_written=n1, n_none=n2, runs=runs, expected=round(mu, 2), z=round(zr, 3), p=round(pr, 4),
                           sequence=''.join('F' if s else '.' for s in seq)),
                held=pr < 0.05)

# P29: failure rate vs share on written days
W = [j for j in joined if j['written'] and j['new'] > 0]
rho = spearman([j['unread'] / j['alerts'] for j in W], [j['comm'] / j['new'] for j in W])
P['P29'] = dict(text="on written days Spearman rho(failures / calls, community share) inside (-0.3, 0.3)",
                value=dict(days=len(W), rho=round(rho, 3)), held=-0.3 < rho < 0.3)


# P30: the Studio's quotes in our texts
def nz(s):
    s = s.replace('’', "'").replace('‘', "'").replace(' ', ' ')
    return re.sub(r'\s+', ' ', s).strip()


q_found = []
for j in joined:
    t = nz(open(reports[j['report']]['path'], encoding='utf-8', errors='replace').read())
    ok_q = nz(j['q']) in t
    ok_u = (nz(j['uq']) in t) if j['uq'] else True
    q_found.append(dict(report=j['report'], q=ok_q, uq=ok_u if j['uq'] else None))
nq = sum(1 for x in q_found if x['q'] and x['uq'] is not False)
P['P30'] = dict(text="the Studio's quoted sentences are found in our text of the same report on >= 95 % of joined days",
                value=dict(days=len(q_found), found=nq, share=round(nq / len(q_found), 4),
                           missing=[x for x in q_found if not (x['q'] and x['uq'] is not False)]),
                held=nq / len(q_found) >= 0.95)

# P31: our Ituri zone sum against the report's own Ituri province row
m = [j for j in joined if j['provValid'] and j['provNew'] == j['new'] and j['provComm'] == j['comm']]
P['P31'] = dict(text="our Ituri zone sum equals the report's Ituri province row (new and community) on >= 90 % of joined days",
                value=dict(days=len(joined), match=len(m), share=round(len(m) / len(joined), 4),
                           mismatch=[dict(report=j['report'], date=j['date'], zones=[j['new'], j['comm']],
                                          prov=[j['provNew'], j['provComm']], provValid=j['provValid'], invalid=j['invalid'])
                                     for j in joined if j not in m]),
                held=len(m) / len(joined) >= 0.90)

for k, v in P.items():
    print(k, 'HELD' if v['held'] else 'FAILED', json.dumps(v['value'], ensure_ascii=False)[:400])
print('lag+1', json.dumps(lag))

out = dict(study=59, session=257, date='2026-11-06',
           input=dict(reports=141, usable=80, studio_file=dict(path='etudes/unread/data.json', sha256=sha_studio,
                                                              source=S['source'], with_line=55, written=22),
                      joined=len(joined), not_joined=notjoined),
           predictions=P, sensitivity_next_day=lag,
           days=[{k: j[k] for k in ('report', 'date', 'written', 'unread', 'alerts', 'swabbed', 'new', 'comm',
                                    'provNew', 'provComm', 'next')} for j in joined])
json.dump(out, open(os.path.join(HERE, 'results59.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'data59.js'), 'w', encoding='utf-8').write(
    'window.D59=' + json.dumps(dict(days=out['days'], main=main, lag=lag,
                                     P={k: dict(held=v['held'], text=v['text']) for k, v in P.items()},
                                     runs=P['P28']['value'], rho=P['P29']['value'], p30=P['P30']['value']['found'],
                                     p31=P['P31']['value']['match'], joined=len(joined)), ensure_ascii=False) + ';\n')
