"""Study 54 — first met dead. State 2 of The Quiet Curve (session 251, 2026-11-05).

Reads the text of INSP's daily situation reports (SitRep MVE-BDBV, made with `pdftotext -layout`
from the PDFs in INRB-UMIE/BDBV2026-Data, commit a5ee90c0; no PDF or text is committed) and
study 53's breaks (results53.json). Writes results54.json and data54.js.

Usage: python3 -I analyse54.py <dir of SitRep_MVE_*.txt>

Predictions: PREDICTIONS54.md (committed before this script was written).
"""
import collections, glob, json, math, os, re, statistics as st, sys, unicodedata, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
TXT = sys.argv[1]

MON = {'janvier': 1, 'fevrier': 2, 'février': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6, 'juillet': 7,
       'aout': 8, 'août': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'decembre': 12, 'décembre': 12}
PROVINCES = {'ituri', 'nordkivu', 'hautuele', 'tshopo', 'sudkivu', 'basuele', 'sudubangi', 'nordubangi', 'total'}
NUM = r"(?:\d{1,3}(?: \d{3})+|\d+)"
ROW = re.compile(r"^\s*([A-Za-zÀ-ÿ'’\-\. ]+?)\s{2,}(" + NUM + r")\s{2,}(" + NUM + r")\*?\s{2,}(\d+[,.]\d)\s*%(.*)$")
START = re.compile(r"(Tableau|TABLEAU)\s*2\b|par province et zone de sant", re.I)
END = re.compile(r"(Tableau|TABLEAU)\s*3\b|suivi des contacts par|ventilation pour", re.I)


def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z]', '', s)


def report_date(t):
    m = re.search(r"[Dd]ate de rapportage\s*:?\s*(\d{1,2})\s*(?:er)?\s+([A-Za-zéûÉ]+)\s+(\d{4})", t)
    if m and MON.get(m.group(2).lower()):
        return f"{m.group(3)}-{MON[m.group(2).lower()]:02d}-{int(m.group(1)):02d}"
    m = re.search(r"SitRep\s*N°\s*\d+\s*/\s*MVE[-\w]*\s*/\s*(\d{2})\s*/\s*(\d{2})\s*/\s*(\d{4})", t)
    if m:
        return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    return None


def followup(t):
    """The day's contact follow-up rate from the report's opening banner (last % on the figures line)."""
    head = t[:6000]
    m = re.search(r"taux de suivi", head, re.I)
    if not m:
        return None
    lines = head[m.end():].splitlines()[:12]
    for ln in lines:
        p = re.findall(r"(\d{1,3}[,.]\d)\s*%", ln)
        cells = [c for c in re.split(r"\s{2,}", ln.strip()) if re.fullmatch(r"[\d ]+(?:[,.]\d+)?\s*%?", c)]
        if len(cells) >= 4 and p and cells[-1].endswith('%'):
            v = float(p[-1].replace(',', '.'))
            return v if 0 < v <= 100 else None
    return None


def numbers(tail, off):
    return [(int(m.group(1).replace(' ', '')), off + (m.start() + m.end()) / 2)
            for m in re.finditer(r"(?<!\d)(\d{1,3}(?: \d{3})+|\d+)(?!\d)", tail)]


def parse(path):
    t = open(path, encoding='utf-8', errors='replace').read()
    n = int(re.search(r'_(\d+)[-_]', path).group(1))
    raw = []
    m = START.search(t)
    if m:
        seg = t[m.start():]
        e = END.search(seg, 200)
        seg = seg[:e.start()] if e else seg[:25000]
        for pi, page in enumerate(seg.split('\f')):
            for line in page.splitlines():
                r = ROW.match(line)
                if not r or 'NA' in r.group(5):
                    continue
                raw.append(dict(page=pi, name=r.group(1).strip(), cum=int(r.group(2).replace(' ', '')),
                                dth=int(r.group(3).replace(' ', '')), cfr=float(r.group(4).replace(',', '.')),
                                tail=numbers(r.group(5), r.start(5))))
    # column centres learned from rows that print all four day-columns (new, community, CTE, total)
    cent = {}
    for pi in {x['page'] for x in raw}:
        k4 = [x['tail'] for x in raw if x['page'] == pi and len(x['tail']) == 4]
        if k4:
            cent[pi] = [st.median(c[i][1] for c in k4) for i in range(4)]
    allk4 = [x['tail'] for x in raw if len(x['tail']) == 4]
    tcent = [st.median(c[i][1] for c in allk4) for i in range(4)] if allk4 else None
    rows, seenprov = [], set()
    for x in raw:
        key = norm(x['name'])
        isprov = key in PROVINCES and key not in seenprov  # first occurrence is the province row (Tshopo is both)
        if isprov:
            seenprov.add(key)
        v, how = [None] * 4, 'k4'
        if len(x['tail']) == 4:
            v = [a for a, _ in x['tail']]
        elif not x['tail']:
            how = 'blank'
        else:
            c = cent.get(x['page'])
            if c is None and tcent is not None:
                # no full row on this page: shift the table's centres so the rightmost number sits on Total
                sh = x['tail'][-1][1] - tcent[3]
                c = [q + sh for q in tcent]
            if c is None:
                how = 'nocentre'
            else:
                how = 'pos'
                for a, pos in x['tail']:
                    i = min(range(4), key=lambda j: abs(c[j] - pos))
                    if v[i] is not None:
                        how = 'clash'
                    v[i] = a
        new, comm, cte, tot = v
        valid = how in ('k4', 'pos', 'blank')
        if x['cum'] and abs(100 * x['dth'] / x['cum'] - x['cfr']) >= 0.15:
            valid = False  # printed fatality does not match its own row: the row is shifted
        if tot is not None and (comm or 0) + (cte or 0) != tot:
            valid = False
        if comm is not None and comm > (new or 0):  # a community death is one of the day's new cases
            valid = False
        rows.append(dict(name=x['name'], key=key, prov=isprov, new=new or 0, comm=comm or 0, valid=valid, how=how))
    return dict(n=n, date=report_date(t), fu=followup(t), rows=rows,
                sha=hashlib.sha256(open(path, 'rb').read()).hexdigest())


def wilson(k, n, z=1.96):
    if n == 0:
        return [None, None]
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round((c - h) / d, 4), round((c + h) / d, 4)]


def spearman(x, y):
    def rk(a):
        o = sorted(range(len(a)), key=lambda i: a[i])
        r = [0] * len(a)
        i = 0
        while i < len(o):
            j = i
            while j + 1 < len(o) and a[o[j + 1]] == a[o[i]]:
                j += 1
            for k in range(i, j + 1):
                r[o[k]] = (i + j) / 2 + 1
            i = j + 1
        return r
    rx, ry = rk(x), rk(y)
    mx, my = sum(rx) / len(rx), sum(ry) / len(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    return num / math.sqrt(sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry))


reports = [parse(p) for p in sorted(glob.glob(os.path.join(TXT, 'SitRep_MVE_*.txt')),
                                    key=lambda s: int(re.search(r'_(\d+)[-_]', s).group(1)))]
assert len(reports) == 141, len(reports)

# a report is usable when its zone table carries the day's columns and at least 80 % of its zone rows are valid
usable = []
for r in reports:
    z = [x for x in r['rows'] if not x['prov']]
    r['zones'] = len(z)
    r['validshare'] = round(sum(x['valid'] for x in z) / len(z), 3) if z else 0
    r['daycols'] = any(x['how'] in ('k4', 'pos') for x in z)
    r['usable'] = bool(z) and r['daycols'] and r['validshare'] >= 0.8 and r['date'] is not None
    if r['usable']:
        usable.append(r)
dates = collections.Counter(r['date'] for r in usable)
dup = sorted(d for d, c in dates.items() if c > 1)

# P8 and the baseline, from valid zone rows of usable reports
NEW = COMM = 0
cd_k = cd_n = 0
series = []
for r in usable:
    z = [x for x in r['rows'] if not x['prov'] and x['valid']]
    new, comm = sum(x['new'] for x in z), sum(x['comm'] for x in z)
    NEW += new
    COMM += comm
    cdays = [x for x in z if x['new'] >= 1]
    cd_n += len(cdays)
    cd_k += sum(1 for x in cdays if x['comm'] >= 1)
    pv = [x for x in r['rows'] if x['prov'] and x['key'] != 'total' and x['valid']]
    series.append(dict(n=r['n'], date=r['date'], new=new, comm=comm, fu=r['fu'],
                       provNew=sum(x['new'] for x in pv), provComm=sum(x['comm'] for x in pv),
                       zonesWithCases=len(cdays), zonesMetDead=sum(1 for x in cdays if x['comm'] >= 1)))
baseline = cd_k / cd_n
# instrument check: the zone rows against the report's own province rows
cap = [s_['new'] / s_['provNew'] for s_ in series if s_['provNew']]
capture = dict(days=len(cap), median=round(st.median(cap), 4), exact=sum(1 for c in cap if abs(c - 1) < 1e-9),
               within5=sum(1 for c in cap if abs(c - 1) <= 0.05))
# P8's interval, by bootstrap over report days (cases cluster by day)
import random
rng = random.Random(54)
bs = []
for _ in range(2000):
    smp = [series[rng.randrange(len(series))] for _ in series]
    bs.append(sum(x['comm'] for x in smp) / sum(x['new'] for x in smp))
bs.sort()
p8boot = [round(bs[49], 4), round(bs[1949], 4)]

# the breaks of 2026 (study 53)
R53 = json.load(open(os.path.join(HERE, 'results53.json')))
breaks = [b for b in R53['breaks21'] if b['at'] >= '2026']
assert len(breaks) == 34
bydate = collections.defaultdict(list)
for r in usable:
    bydate[r['date']].append(r)
joined = []
for b in breaks:
    rs = sorted(bydate.get(b['at'], []), key=lambda r: r['n'])
    rec = dict(b, report=None, found=False, new=None, comm=None, metDead=None, why=None)
    if not rs:
        allr = [r for r in reports if r['date'] == b['at']]
        rec['why'] = 'no report of this date' if not allr else 'report has no usable day columns'
    else:
        r = rs[-1]
        rec['report'] = r['n']
        hit = [x for x in r['rows'] if not x['prov'] and x['key'] == norm(b['z'])]
        if not hit:
            rec['why'] = 'zone not in the report table'
        elif not hit[0]['valid']:
            rec['why'] = 'zone row invalid'
        else:
            x = hit[0]
            rec.update(new=x['new'], comm=x['comm'])
            if x['new'] >= 1:
                rec['found'] = True
                rec['metDead'] = x['comm'] >= 1
            else:
                rec['why'] = 'no new case in the zone that day'
    joined.append(rec)

found = [j for j in joined if j['found']]
md = [j for j in found if j['metDead']]
long42 = [j for j in found if j['L'] >= 42]
md42 = [j for j in long42 if j['metDead']]
fu = [(s['fu'], s['comm'] / s['new']) for s in series if s['fu'] is not None and s['new'] > 0]
rho = spearman([a for a, _ in fu], [b for _, b in fu]) if len(fu) >= 5 else None

P = {}
P['P7'] = dict(text='at least 90 % of the 34 breaks find their zone with a new case in the report of the same date',
               value=dict(k=len(found), n=34, s=round(len(found) / 34, 4)), held=len(found) / 34 >= 0.9)
inst_ok = P['P7']['held']
P['P8'] = dict(text='pooled, 15-40 % of new confirmed cases are community deaths',
               value=dict(k=COMM, n=NEW, s=round(COMM / NEW, 4), w=wilson(COMM, NEW), boot=p8boot),
               held=0.15 <= COMM / NEW <= 0.40)
s9 = len(md) / len(found) if found else None
P['P9'] = dict(text='share of breaks met dead at least 1.5 x the baseline share of zone case-days met dead',
               value=dict(k=len(md), n=len(found), s=round(s9, 4) if s9 is not None else None, w=wilson(len(md), len(found)),
                          base=dict(k=cd_k, n=cd_n, s=round(baseline, 4), w=wilson(cd_k, cd_n)),
                          ratio=round(s9 / baseline, 3) if s9 is not None else None),
               held=(s9 is not None and s9 >= 1.5 * baseline), informative=inst_ok)
s10 = len(md42) / len(long42) if long42 else None
P['P10'] = dict(text='of breaks ending a quiet of at least 42 days, at least a third are met dead',
                value=dict(k=len(md42), n=len(long42), s=round(s10, 4) if s10 is not None else None, w=wilson(len(md42), len(long42))),
                held=(s10 is not None and s10 >= 1 / 3), informative=inst_ok)
P['P11'] = dict(text="Spearman's rho between the day's follow-up rate and its share met dead is at most -0.20",
                value=dict(rho=round(rho, 3) if rho is not None else None, days=len(fu)),
                held=(rho is not None and rho <= -0.20))

why = collections.Counter(j['why'] for j in joined if not j['found'])
out = dict(study=54, session=251, date='2026-11-05', predictions=P,
           summary=dict(reports=len(reports), usable=len(usable),
                        usableWindow=[min(r['date'] for r in usable), max(r['date'] for r in usable)],
                        excluded=[dict(n=r['n'], date=r['date'], zones=r['zones'], validshare=r['validshare'], daycols=r['daycols'])
                                  for r in reports if not r['usable'] and r['zones']],
                        duplicateDates=dup, notFound=dict(why), newConfirmed=NEW, communityDeaths=COMM, capture=capture),
           series=series, breaks=joined,
           sources=dict(repoCommit='a5ee90c01fb8254d3b9a4a884ca3589f820bc2c2',
                        textSha256=[[r['n'], r['sha']] for r in reports]))
json.dump(out, open(os.path.join(HERE, 'results54.json'), 'w'), ensure_ascii=False, indent=1)
slim = dict(predictions=P, summary={k: v for k, v in out['summary'].items() if k != 'excluded'},
            series=series, breaks=[{k: j[k] for k in ('z', 'p', 'start', 'at', 'L', 'found', 'new', 'comm', 'metDead', 'why')} for j in joined])
open(os.path.join(HERE, 'data54.js'), 'w').write('window.DATA54 = ' + json.dumps(slim, ensure_ascii=False) + ';\n')

for k, v in P.items():
    print(k, 'HELD' if v['held'] else 'FAILED', '' if v.get('informative', True) else '(uninformative)', json.dumps(v['value']))
print('usable', len(usable), 'of', len(reports), out['summary']['usableWindow'], 'dup', dup)
print('not found', dict(why))
print('capture', capture, 'p8 boot', p8boot)
