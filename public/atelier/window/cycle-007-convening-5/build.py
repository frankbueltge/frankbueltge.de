"""The Other Books — after cycle 007, the convening, session 5 (2026-10-14).

Of the tornado warnings the Field's study 14 found "never needed", what do the keeper's other books
hold inside them while they stood? Stdlib only.

  python3 -I build.py extract <StormEvents_details dir> <SPC hail csv> <SPC wind csv>
      -> books.tsv.gz (every Storm Events Tornado / Funnel Cloud and SPC hail / wind report,
         2008-2023, UTC minute, point, short id)
  python3 -I build.py <SPC 1950-2023_actual_tornadoes.csv> <Field study 13 warnings.tsv.gz>
                      <StormEvents_details dir>
      -> tiers.tsv.gz, results.json, data.js

The warning geometry and rule V (window [issue - 20 min, end), track meets a polygon row) are the
Field's, copied from field-research@c0a409d artifacts/2026-10-14-the-warnings-never-needed/analyse.py
and asserted to reproduce its 13,324.
"""
import bisect, csv, glob, gzip, hashlib, json, math, os, re, sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
ALLOW = 20
ERAS = {'2008-2011': range(2008, 2012), '2012-2016': range(2012, 2017), '2017-2023': range(2017, 2024)}
TIERS = ['tornado', 'other_tornado', 'funnel', 'severe', 'nothing']
SE_MON = {m: i + 1 for i, m in enumerate('JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split())}


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def t(s):
    return datetime.strptime(s, '%Y-%m-%d %H:%M')


# ---------- extract ----------

def se_time(s, tz):
    """Storm Events '01-APR-08 15:04:00' in standard local time 'CST-6' -> UTC datetime."""
    d, m, y = s[:2], s[3:6], s[7:9]
    local = datetime(2000 + int(y), SE_MON[m], int(d), int(s[10:12]), int(s[13:15]))
    off = int(re.search(r'-?\d+$', tz).group())
    return local - timedelta(hours=off)


def extract(se_dir, hail, wind):
    rows = []
    for f in sorted(glob.glob(os.path.join(se_dir, 'StormEvents_details-ftp_v1.0_d20*.csv.gz'))):
        y = int(re.search(r'_d(\d{4})_', f).group(1))
        if not 2008 <= y <= 2023:
            continue
        for r in csv.DictReader(gzip.open(f, 'rt', errors='replace')):
            k = {'Tornado': 'se_tornado', 'Funnel Cloud': 'funnel'}.get(r['EVENT_TYPE'])
            if not k or not r['BEGIN_LAT']:
                continue
            b = se_time(r['BEGIN_DATE_TIME'], r['CZ_TIMEZONE'])
            e = se_time(r['END_DATE_TIME'], r['CZ_TIMEZONE'])
            blat, blon = float(r['BEGIN_LAT']), float(r['BEGIN_LON'])
            elat = float(r['END_LAT'] or blat)
            elon = float(r['END_LON'] or blon)
            rows.append((k, 'SE' + r['EVENT_ID'], b, e, blon, blat, elon, elat, ''))
    for k, path in (('hail', hail), ('wind', wind)):
        for r in csv.DictReader(open(path, newline='')):
            y = int(r['yr'])
            if not 2008 <= y <= 2023:
                continue
            local = datetime.strptime(r['date'] + ' ' + r['time'][:5], '%Y-%m-%d %H:%M')
            if r['tz'] == '3':
                b = local + timedelta(hours=6)
            elif r['tz'] == '9':
                b = local
            else:
                continue
            lat, lon = float(r['slat']), float(r['slon'])
            if lat == 0 or lon == 0:
                continue
            rows.append((k, k[0].upper() + r['om'] + '.' + r['yr'], b, b, lon, lat, lon, lat, r['mag']))
    rows.sort(key=lambda x: x[2])
    with gzip.open(os.path.join(HERE, 'books.tsv.gz'), 'wt', newline='') as out:
        out.write('kind\tid\tbegin_utc\tend_utc\tblon\tblat\telon\telat\tmag\n')
        for r in rows:
            out.write('%s\t%s\t%s\t%s\t%.4f\t%.4f\t%.4f\t%.4f\t%s\n' % (r[0], r[1], r[2].strftime('%Y-%m-%d %H:%M'),
                                                                       r[3].strftime('%Y-%m-%d %H:%M'), *r[4:]))
    print(Counter(r[0] for r in rows))


# ---------- the Field's geometry and rule V (copied, see docstring) ----------

def load_tornadoes(path):
    out = []
    for r in csv.DictReader(open(path, newline='')):
        y = int(r['yr'])
        if not 2008 <= y <= 2023 or r['sg'] != '1':
            continue
        ns, sn = int(r['ns']), int(r['sn'])
        if not ((ns == 1 and sn == 1) or (ns > 1 and sn == 0)):
            continue
        local = datetime.strptime(r['date'] + ' ' + r['time'][:5], '%Y-%m-%d %H:%M')
        if r['tz'] == '3':
            start = local + timedelta(hours=6)
        elif r['tz'] == '9':
            start = local
        else:
            continue
        slat, slon = float(r['slat']), float(r['slon'])
        if slat == 0 or slon == 0:
            continue
        elat, elon = float(r['elat']), float(r['elon'])
        if elat == 0 or elon == 0:
            elat, elon = slat, slon
        out.append(dict(start=start, a=(slon, slat), b=(elon, elat)))
    out.sort(key=lambda x: x['start'])
    return out


def load_warnings(path):
    ev = defaultdict(lambda: dict(issue=None, polys=[]))
    for r in csv.DictReader(gzip.open(path, 'rt', newline=''), delimiter='\t'):
        k = '%s.%s.%s' % (r['wfo'], r['vtec_year'], r['etn'])
        e = ev[k]
        if r['issued'] and (e['issue'] is None or r['issued'] < e['issue']):
            e['issue'] = r['issued']
        rings = [[tuple(map(float, p.split())) for p in ring.split(';')] for ring in r['rings'].split('|')]
        e['polys'].append(dict(beg=t(r['poly_beg']), end=t(r['poly_end']), rings=rings))
    out = []
    for k, e in ev.items():
        if e['issue'] is None:
            continue
        e['id'], e['wfo'] = k, k.split('.')[0]
        e['issue'] = t(e['issue'])
        e['end'] = max(p['end'] for p in e['polys'])
        if datetime(2008, 1, 1) <= e['issue'] <= datetime(2023, 12, 31, 23, 59):
            for p in e['polys']:
                xs = [x for rg in p['rings'] for x, _ in rg]
                ys = [y for rg in p['rings'] for _, y in rg]
                p['bb'] = (min(xs), max(xs), min(ys), max(ys))
            out.append(e)
    out.sort(key=lambda e: e['issue'])
    return out


def inside(pt, rings):
    x, y = pt
    hit = False
    for ring in rings:
        n = len(ring)
        for i in range(n):
            x1, y1 = ring[i]
            x2, y2 = ring[(i + 1) % n]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
                hit = not hit
    return hit


def _orient(p, q, r):
    v = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    return (v > 0) - (v < 0)


def _cross(p1, p2, q1, q2):
    return _orient(p1, p2, q1) != _orient(p1, p2, q2) and _orient(q1, q2, p1) != _orient(q1, q2, p2)


def meets(a, b, rings):
    if inside(a, rings) or inside(b, rings):
        return True
    if a == b:
        return False
    for ring in rings:
        n = len(ring)
        for i in range(n):
            if _cross(a, b, ring[i], ring[(i + 1) % n]):
                return True
    return False


def hits(e, items, starts, allow=ALLOW):
    """Items (dicts with start, a, b) beginning in [issue - allow, end) whose segment meets a polygon row."""
    out = []
    i = bisect.bisect_left(starts, e['issue'] - timedelta(minutes=allow))
    j = bisect.bisect_left(starts, e['end'])
    for it in items[i:j]:
        tx = (min(it['a'][0], it['b'][0]), max(it['a'][0], it['b'][0]),
              min(it['a'][1], it['b'][1]), max(it['a'][1], it['b'][1]))
        for p in e['polys']:
            bb = p['bb']
            if tx[1] < bb[0] or tx[0] > bb[1] or tx[3] < bb[2] or tx[2] > bb[3]:
                continue
            if meets(it['a'], it['b'], p['rings']):
                out.append(it)
                break
    return out


# ---------- statistics ----------

def wilson(k, n, z=1.959964):
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [round((c - h) / d, 4), round((c + h) / d, 4)]


def _lchoose(n, k):
    return math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)


def fisher(a, b, c, d):
    r1, r2, c1, n = a + b, c + d, a + c, a + b + c + d
    lo, hi = max(0, c1 - r2), min(r1, c1)
    lp = lambda x: _lchoose(r1, x) + _lchoose(r2, c1 - x) - _lchoose(n, c1)
    obs = lp(a)
    ps = [lp(x) for x in range(lo, hi + 1)]
    m = max(ps)
    return min(1.0, sum(math.exp(v - m) for v in ps if v <= obs + 1e-7) / sum(math.exp(v - m) for v in ps))


def share(k, n):
    return dict(k=k, n=n, share=round(k / n, 4), ci95=wilson(k, n))


# ---------- build ----------

def narratives(se_dir, ids):
    out = {}
    for f in sorted(glob.glob(os.path.join(se_dir, 'StormEvents_details-ftp_v1.0_d20*.csv.gz'))):
        for r in csv.DictReader(gzip.open(f, 'rt', errors='replace')):
            k = 'SE' + r['EVENT_ID']
            if k in ids:
                out[k] = dict(state=r['STATE'].title(), county=r['CZ_NAME'].title(), when=r['BEGIN_DATE_TIME'],
                              tz=r['CZ_TIMEZONE'], source=r['SOURCE'], text=' '.join(r['EVENT_NARRATIVE'].split()))
    return out


def build(spc, warnings_path, se_dir):
    tors = load_tornadoes(spc)
    tstarts = [x['start'] for x in tors]
    W = load_warnings(warnings_path)
    books = defaultdict(list)
    for r in csv.DictReader(gzip.open(os.path.join(HERE, 'books.tsv.gz'), 'rt', newline=''), delimiter='\t'):
        kind = {'se_tornado': 'other_tornado', 'funnel': 'funnel', 'hail': 'severe', 'wind': 'severe'}[r['kind']]
        books[kind].append(dict(id=r['id'], kind=r['kind'], mag=float(r['mag'] or 0), start=t(r['begin_utc']),
                                a=(float(r['blon']), float(r['blat'])), b=(float(r['elon']), float(r['elat']))))
    starts = {k: [x['start'] for x in v] for k, v in books.items()}

    rows, funnel_ids = [], {}
    for e in W:
        flags = dict(tornado=bool(hits(e, tors, tstarts)))
        for k in ('other_tornado', 'funnel', 'severe'):
            h = hits(e, books[k], starts[k])
            flags[k] = bool(h)
            if k == 'funnel' and h:
                funnel_ids[e['id']] = [x['id'] for x in h]
            if k == 'severe':
                # the 2010 criterion (1-inch hail) applied to every year
                flags['severe1'] = any(x['kind'] == 'wind' or x['mag'] >= 1.0 for x in h)
        tier = next((k for k in TIERS[:-1] if flags[k]), 'nothing')
        p0 = e['polys'][0]['rings'][0]
        cx = sum(x for x, _ in p0) / len(p0)
        cy = sum(y for _, y in p0) / len(p0)
        rows.append(dict(id=e['id'], year=e['issue'].year, issue=e['issue'], wfo=e['wfo'],
                         minutes=int((e['end'] - e['issue']).total_seconds() // 60), tier=tier,
                         flags=flags, cx=cx, cy=cy))

    n = len(rows)
    for i, r in enumerate(rows):
        r['i'] = i
    V = sum(r['flags']['tornado'] for r in rows)
    assert (n, V) == (43819, 13324), (n, V)          # the Field's frame and its registered count
    unmet = [r for r in rows if not r['flags']['tornado']]
    U = len(unmet)
    tier_count = Counter(r['tier'] for r in unmet)
    any_count = {k: sum(r['flags'][k] for r in unmet) for k in TIERS[1:-1]}

    # rules of "needed": cumulative tiers
    RULES = [('tornado', ['tornado']), ('+ other book', ['tornado', 'other_tornado']),
             ('+ funnel', ['tornado', 'other_tornado', 'funnel']),
             ('+ severe storm', ['tornado', 'other_tornado', 'funnel', 'severe']),
             ('+ severe storm, 1-inch hail throughout', ['tornado', 'other_tornado', 'funnel', 'severe'], 'tier1')]
    for r in rows:
        f = r['flags']
        r['tier1'] = next((k for k in ('tornado', 'other_tornado', 'funnel') if f[k]), 'severe' if f['severe1'] else 'nothing')
    rules = []
    for name, ks, *fld in RULES:
        fld = fld[0] if fld else 'tier'
        need = lambda r: r[fld] in ks
        era = {}
        for en, yrs in ERAS.items():
            rr = [r for r in rows if r['year'] in yrs]
            k = sum(not need(r) for r in rr)
            era[en] = share(k, len(rr))
        a = [r for r in rows if r['year'] < 2012]
        b = [r for r in rows if r['year'] >= 2012]
        fa, fb = sum(not need(r) for r in a), sum(not need(r) for r in b)
        p = fisher(fa, len(a) - fa, fb, len(b) - fb)
        byyear = {}
        for y in range(2008, 2024):
            ry = [r for r in rows if r['year'] == y]
            byyear[y] = round(sum(not need(r) for r in ry) / len(ry), 4)
        rules.append(dict(name=name, tiers=ks, field=fld, never_needed=share(sum(not need(r) for r in rows), n), eras=era,
                          pre=round(fa / len(a), 4), post=round(fb / len(b), 4),
                          fall_points=round(100 * (fa / len(a) - fb / len(b)), 2), fisher_p=p, by_year=byyear))

    # tier composition of the unmet, by era
    era_tiers = {}
    for en, yrs in ERAS.items():
        rr = [r for r in unmet if r['year'] in yrs]
        c = Counter(r['tier'] for r in rr)
        era_tiers[en] = {k: share(c[k], len(rr)) for k in TIERS[1:]}

    # narratives for funnel-tier warnings (short quotation, US government work)
    funnel_tier = [r for r in unmet if r['tier'] == 'funnel']
    want = {i for r in funnel_tier for i in funnel_ids[r['id']]}
    nar = narratives(se_dir, want)
    cards = []
    for r in funnel_tier:
        for fid in funnel_ids[r['id']]:
            x = nar.get(fid)
            if x and len(x['text']) >= 40:
                cards.append(dict(i=r['i'], warning=r['id'], issued=r['issue'].strftime('%Y-%m-%d %H:%M'), event=fid,
                                  **{k: x[k] for k in ('state', 'county', 'when', 'tz', 'source')},
                                  text=x['text'][:240] + ('…' if len(x['text']) > 240 else '')))
                break
    words = Counter()
    for c in cards:
        tl = c['text'].lower()
        for w in ('did not touch down', 'never touched down', 'no damage', 'rotation', 'wall cloud',
                  'brief', 'spotter', 'public', 'law enforcement', 'photo', 'video', 'emergency manager'):
            words[w] += w in tl
    src = Counter(nar[i]['source'] for i in nar)

    preds = dict(
        Q1=dict(text='funnel clouds meet at most 10 % of the never-needed warnings',
                value=round(any_count['funnel'] / U, 4), held=any_count['funnel'] / U <= 0.10),
        Q2=dict(text='at least half of the never-needed warnings meet a severe hail or wind report',
                value=round(any_count['severe'] / U, 4), held=any_count['severe'] / U >= 0.5),
        Q3=dict(text='fewer than one in five never-needed warnings meet nothing in any book',
                value=round(tier_count['nothing'] / U, 4), held=tier_count['nothing'] / U < 0.2),
        Q4=dict(text='the post-2012 fall survives every rule of needed',
                value=[r['fall_points'] for r in rules[:4]], held=all(r['fall_points'] > 0 and r['fisher_p'] < 0.05
                                                                      for r in rules[:4])),
        refutation=dict(text='tiers 1 and 2 together meet fewer than 2 % of the never-needed warnings',
                        value=round((tier_count['other_tornado'] + tier_count['funnel']) / U, 4),
                        fired=(tier_count['other_tornado'] + tier_count['funnel']) / U < 0.02))

    res = dict(
        frame=dict(warnings=n, met_V=V, never_needed_V=U, tornadoes=len(tors),
                   books={k: len(v) for k, v in books.items()},
                   book_kinds=dict(Counter(x['kind'] for v in books.values() for x in v))),
        unmet_tiers={k: share(tier_count[k], U) for k in TIERS[1:]},
        unmet_any={k: share(v, U) for k, v in any_count.items()},
        rules=rules, era_tiers=era_tiers, predictions=preds,
        book_by_year={k: [sum(1 for x in books[g] if x['kind'] == k and x['start'].year == y) for y in range(2008, 2024)]
                      for g, k in (('funnel', 'funnel'), ('other_tornado', 'se_tornado'), ('severe', 'hail'), ('severe', 'wind'))},
        keeper_rule=dict(source='NWS Instruction 10-1605, Storm Data Preparation, 26 July 2021, Appendix A, entry 18 (p. A-27)',
                         quote='The funnel cloud should be large, noteworthy, or create strong public or media '
                               'interest to be entered.'),
        funnel_cards=dict(n=len(cards), sources=dict(src.most_common()), phrases=dict(words)),
    )
    json.dump(res, open(os.path.join(HERE, 'results.json'), 'w'), indent=1, default=str)

    with gzip.open(os.path.join(HERE, 'tiers.tsv.gz'), 'wt', newline='') as out:
        out.write('warning\tyear\tissue_utc\tminutes\ttornado\tother_tornado\tfunnel\tsevere\ttier\n')
        for r in rows:
            f = r['flags']
            out.write('%s\t%d\t%s\t%d\t%d\t%d\t%d\t%d\t%s\n' % (r['id'], r['year'], r['issue'].strftime('%Y-%m-%d %H:%M'),
                      r['minutes'], f['tornado'], f['other_tornado'], f['funnel'], f['severe'], r['tier']))

    # page data: one compact row per warning, ordered by issue time
    wfos = sorted({r['wfo'] for r in rows})
    wi = {w: i for i, w in enumerate(wfos)}
    page = dict(
        tiers=TIERS, wfos=wfos,
        w=''.join(str(TIERS.index(r['tier'])) for r in rows),
        w1=''.join(str(TIERS.index(r['tier1'])) for r in rows),
        y=[r['year'] - 2008 for r in rows],
        o=[wi[r['wfo']] for r in rows],
        x=[round(r['cx'], 2) for r in rows], z=[round(r['cy'], 2) for r in rows],
        t=[r['issue'].strftime('%y%m%d%H%M') for r in rows],
        cards=cards, results=res)
    with open(os.path.join(HERE, 'data.js'), 'w') as out:
        out.write('window.DATA=' + json.dumps(page, separators=(',', ':'), default=str) + ';\n')
    print(json.dumps(dict(unmet=res['unmet_tiers'], any=res['unmet_any'],
                          rules=[(r['name'], r['never_needed']['share'], r['pre'], r['post'], r['fall_points'],
                                  r['fisher_p']) for r in rules], preds=preds, cards=len(cards),
                          era_tiers=era_tiers), indent=1, default=str))


if __name__ == '__main__':
    if sys.argv[1] == 'extract':
        extract(*sys.argv[2:5])
    else:
        build(*sys.argv[1:4])
