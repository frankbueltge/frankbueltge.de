"""Study 14 — of the warnings issued, how many were needed?

Usage: python3 -I analyse.py <SPC 1950-2023_actual_tornadoes.csv> <study 13 warnings.tsv.gz>
                             <Studio struck-off data.json> <Sentry API removed=1 json>
Writes data/warnings_verified.tsv.gz, data/years.tsv and data/results.json. Stdlib only.
See PREREGISTRATION.md (commit 2d15597) for the registered rules.
"""
import bisect, csv, gzip, hashlib, json, math, os, sys
from collections import defaultdict
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
SPC_SHA = 'fa616e2f829c553acc7b60f5130a3ac498198e0b9d69e37a0e1289df71dc5fcc'
ERAS = {'2008-2011': range(2008, 2012), '2012-2016': range(2012, 2017), '2017-2023': range(2017, 2024)}


def t(s):
    return datetime.strptime(s, '%Y-%m-%d %H:%M')


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def load_tornadoes(path):
    """Study 13's frame (whole tracks, 2008-2023, CST or UTC rows), now with the end point."""
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
        out.append(dict(om=r['om'], yr=y, start=start, mag=int(r['mag']), inj=int(r['inj']),
                        fat=int(r['fat']), a=(slon, slat), b=(elon, elat)))
    out.sort(key=lambda x: x['start'])
    return out


def load_warnings(path):
    rows = list(csv.DictReader(gzip.open(path, 'rt', newline=''), delimiter='\t'))
    ev = defaultdict(lambda: dict(issue=None, end=None, polys=[]))
    for r in rows:
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
            out.append(e)
    out.sort(key=lambda e: e['issue'])
    return out, len(rows)


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
    o1, o2, o3, o4 = _orient(p1, p2, q1), _orient(p1, p2, q2), _orient(q1, q2, p1), _orient(q1, q2, p2)
    return o1 != o2 and o3 != o4


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


def bbox(rings):
    xs = [x for r in rings for x, _ in r]
    ys = [y for r in rings for _, y in r]
    return min(xs), max(xs), min(ys), max(ys)


def candidates(tors, starts, lo, hi):
    i, j = bisect.bisect_left(starts, lo), bisect.bisect_left(starts, hi)
    return tors[i:j]


def verify_V(e, tors, starts, allow):
    """Registered rule V: a tornado beginning in [issue - allow, end) whose track meets a polygon row."""
    hits = []
    for p in e['polys']:
        p.setdefault('bb', bbox(p['rings']))
    for tr in candidates(tors, starts, e['issue'] - timedelta(minutes=allow), e['end']):
        tx = (min(tr['a'][0], tr['b'][0]), max(tr['a'][0], tr['b'][0]),
              min(tr['a'][1], tr['b'][1]), max(tr['a'][1], tr['b'][1]))
        for p in e['polys']:
            bb = p['bb']
            if tx[1] < bb[0] or tx[0] > bb[1] or tx[3] < bb[2] or tx[2] > bb[3]:
                continue
            if meets(tr['a'], tr['b'], p['rings']):
                hits.append(tr)
                break
    return hits


def verify_S(e, tors, starts):
    """Strict rule S: a tornado's start point in a polygon row valid at its start, issued before it."""
    hits = []
    for tr in candidates(tors, starts, e['issue'] + timedelta(minutes=1), e['end']):
        for p in e['polys']:
            if p['beg'] <= tr['start'] < p['end'] and inside(tr['a'], p['rings']):
                hits.append(tr)
                break
    return hits


def wilson(k, n, z=1.959964):
    if n == 0:
        return (None, None)
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return (round((c - h) / d, 4), round((c + h) / d, 4))


def _lchoose(n, k):
    return math.lgamma(n + 1) - math.lgamma(k + 1) - math.lgamma(n - k + 1)


def fisher(a, b, c, d):
    """Two-sided Fisher exact p for [[a, b], [c, d]], via log-hypergeometric sums."""
    r1, r2, c1, n = a + b, c + d, a + c, a + b + c + d
    lo, hi = max(0, c1 - r2), min(r1, c1)
    lp = lambda x: _lchoose(r1, x) + _lchoose(r2, c1 - x) - _lchoose(n, c1)
    obs = lp(a)
    ps = [lp(x) for x in range(lo, hi + 1)]
    m = max(ps)
    tot = sum(math.exp(v - m) for v in ps)
    sel = sum(math.exp(v - m) for v in ps if v <= obs + 1e-7)
    return min(1.0, sel / tot)


def spearman(x, y):
    def ranks(v):
        o = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        i = 0
        while i < len(o):
            j = i
            while j + 1 < len(o) and v[o[j + 1]] == v[o[i]]:
                j += 1
            for k in range(i, j + 1):
                r[o[k]] = (i + j) / 2 + 1
            i = j + 1
        return r
    rx, ry = ranks(x), ranks(y)
    mx, my = sum(rx) / len(rx), sum(ry) / len(ry)
    num = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    den = math.sqrt(sum((a - mx) ** 2 for a in rx) * sum((b - my) ** 2 for b in ry))
    return num / den


def share(k, n):
    return dict(k=k, n=n, share=round(k / n, 4) if n else None, ci95=wilson(k, n))


def main(spc, warn, studio, sentry):
    assert sha(spc) == SPC_SHA, 'SPC file differs from study 13'
    tors = load_tornadoes(spc)
    assert len(tors) == 19631, len(tors)
    starts = [x['start'] for x in tors]
    ws, nrows = load_warnings(warn)

    res = dict(frame=dict(tornadoes=len(tors), polygon_rows=nrows, warnings=len(ws)))
    per = {}
    for e in ws:
        v = verify_V(e, tors, starts, 20)
        per[e['id']] = dict(
            yr=e['issue'].year, hour=e['issue'].hour, wfo=e['wfo'],
            V=len(v), S=len(verify_S(e, tors, starts)),
            V0=len(verify_V(e, tors, starts, 0)), V60=len(verify_V(e, tors, starts, 60)),
            fat=sum(x['fat'] for x in v), maxmag=max([x['mag'] for x in v], default=None),
            mins=int((e['end'] - e['issue']).total_seconds() // 60))

    def count(rule, years=None, pred=None):
        sel = [p for p in per.values() if (years is None or p['yr'] in years) and (pred is None or pred(p))]
        return sum(1 for p in sel if p[rule] > 0), len(sel)

    for rule in ('V', 'S', 'V0', 'V60'):
        k, n = count(rule)
        res[rule] = dict(all=share(k, n), eras={})
        for name, yrs in ERAS.items():
            res[rule]['eras'][name] = share(*count(rule, yrs))
        for name, s in res[rule]['eras'].items():
            s['far'] = round(1 - s['share'], 4)
        res[rule]['all']['far'] = round(1 - res[rule]['all']['share'], 4)

    # P1, P2
    e1, e23 = count('V', ERAS['2008-2011']), count('V', range(2012, 2024))
    far1, far23 = 1 - e1[0] / e1[1], 1 - e23[0] / e23[1]
    p2_p = fisher(e1[0], e1[1] - e1[0], e23[0], e23[1] - e23[0])
    res['P1'] = dict(far_2008_2011=round(far1, 4), bar='0.70-0.80',
                     verdict='held' if 0.70 <= far1 <= 0.80 else
                     ('undecided' if min(abs(far1 - 0.70), abs(far1 - 0.80)) <= 0.005 else 'failed'))
    diff = far1 - far23
    res['P2'] = dict(far_2012_2023=round(far23, 4), diff_points=round(100 * diff, 2), fisher_p=p2_p,
                     verdict='held' if diff >= 0.02 and p2_p < 0.01 else
                     ('undecided' if abs(diff - 0.02) <= 0.005 else 'failed'))

    # P3: trade-off against study 13's annual warned-ahead share
    s13 = json.load(open(HERE + '/../2026-10-14-the-tornadoes-that-came/data/results.json'))
    pod = {int(y): v['pct'] / 100 for y, v in s13['rules']['registered']['by_year'].items()}
    years = list(range(2008, 2024))
    far_y = {}
    with open(HERE + '/data/years.tsv', 'w') as f:
        f.write('year\twarnings\tverified_V\tfar_V\tverified_S\tfar_S\twarned_ahead_share_s13\n')
        for y in years:
            kV, n = count('V', [y])
            kS, _ = count('S', [y])
            far_y[y] = 1 - kV / n
            f.write('%d\t%d\t%d\t%.4f\t%d\t%.4f\t%.4f\n' % (y, n, kV, 1 - kV / n, kS, 1 - kS / n, pod[y]))
    rho = spearman([pod[y] for y in years], [far_y[y] for y in years])
    res['P3'] = dict(spearman_rho=round(rho, 3), bar=0.4,
                     verdict='held' if rho >= 0.4 else ('undecided' if abs(rho - 0.4) <= 0.05 else 'failed'))
    res['far_by_year_V'] = {y: round(far_y[y], 4) for y in years}

    # Sentry, built on the Studio's table
    sd = json.load(open(studio))
    sen = json.load(open(sentry))
    rows = sd['rows']
    struck = sum(1 for r in rows if 'struck' in r)
    on_list = [s['des'] for s in sd['strikes'] if s['on_list']]
    listed = {r['des'] for r in rows}
    came_true = [d for d in on_list if d in listed]
    res['sentry'] = dict(
        studio_sha256=sha(studio), sentry_api_sha256=sha(sentry),
        ever_listed=len(rows), struck_off=struck, standing=len(rows) - struck,
        api_removed_count=int(sen['count']), api_matches_studio=int(sen['count']) == struck,
        strikes_seen_coming=len(sd['strikes']), strikes_on_list=on_list, came_true=came_true,
        came_true_share=share(len(came_true), len(rows)))
    vs = res['V']['all']['share']
    ct = len(came_true) / len(rows)
    ratio = vs / ct if ct else None
    res['P4'] = dict(sentry_share=round(ct, 6), tornado_share_V=vs, ratio=round(ratio, 1) if ratio else None,
                     verdict='held' if ct < 0.001 and ratio and ratio >= 100 else 'failed')

    # Exploratory
    night = lambda p: p['hour'] < 12
    res['exploratory'] = dict(
        by_utc_half={'00-11': share(*count('V', pred=night)),
                     '12-23': share(*count('V', pred=lambda p: not night(p)))},
        V_not_S=sum(1 for p in per.values() if p['V'] and not p['S']),
        S_not_V=sum(1 for p in per.values() if p['S'] and not p['V']),
        killer_verified=sum(1 for p in per.values() if p['fat'] > 0),
        median_minutes_standing=sorted(p['mins'] for p in per.values())[len(per) // 2],
        tornadoes_matched_by_any_warning_V=None)
    matched = set()
    for e in ws:
        for tr in verify_V(e, tors, starts, 20):
            matched.add(tr['om'] + tr['start'].isoformat())
    res['exploratory']['tornadoes_matched_by_any_warning_V'] = share(len(matched), len(tors))
    wfo = defaultdict(lambda: [0, 0])
    for p in per.values():
        wfo[p['wfo']][1] += 1
        wfo[p['wfo']][0] += p['V'] > 0
    big = sorted(((k, v) for k, v in wfo.items() if v[1] >= 200), key=lambda kv: kv[1][0] / kv[1][1])
    res['exploratory']['wfo_ge_200'] = dict(n=len(big), lowest=[(k, v[0], v[1]) for k, v in big[:3]],
                                            highest=[(k, v[0], v[1]) for k, v in big[-3:]])

    # Post hoc, declared as such in README: the strict rule's eras, and warnings per tornado
    s1, s23 = count('S', ERAS['2008-2011']), count('S', range(2012, 2024))
    far_s = {y: 1 - count('S', [y])[0] / count('S', [y])[1] for y in years}
    tor_era = {name: sum(1 for x in tors if x['yr'] in yrs) for name, yrs in ERAS.items()}
    res['post_hoc'] = dict(
        S_far_2008_2011=round(1 - s1[0] / s1[1], 4), S_far_2012_2023=round(1 - s23[0] / s23[1], 4),
        S_fisher_p=fisher(s1[0], s1[1] - s1[0], s23[0], s23[1] - s23[0]),
        S_spearman_rho=round(spearman([pod[y] for y in years], [far_s[y] for y in years]), 3),
        warnings_per_tornado={name: round(count('V', yrs)[1] / tor_era[name], 3) for name, yrs in ERAS.items()},
        warnings_per_year={name: round(count('V', yrs)[1] / len(yrs), 1) for name, yrs in ERAS.items()},
        tornadoes_per_year={name: round(tor_era[name] / len(yrs), 1) for name, yrs in ERAS.items()})

    with gzip.open(HERE + '/data/warnings_verified.tsv.gz', 'wt') as f:
        f.write('warning\tyear\tutc_hour\tminutes\tV\tS\tV0\tV60\tfat_V\tmaxmag_V\n')
        for k in sorted(per):
            p = per[k]
            f.write('%s\t%d\t%d\t%d\t%d\t%d\t%d\t%d\t%d\t%s\n' % (k, p['yr'], p['hour'], p['mins'], p['V'], p['S'],
                                                                  p['V0'], p['V60'], p['fat'], p['maxmag']))
    json.dump(res, open(HERE + '/data/results.json', 'w'), indent=1, default=str)
    print(json.dumps({k: res[k] for k in ('frame', 'P1', 'P2', 'P3', 'P4')}, indent=1, default=str))


if __name__ == '__main__':
    main(*sys.argv[1:5])
