"""Study 13 — of the tornadoes that came, how many were warned before they began?

Usage: python3 -I analyse.py <SPC 1950-2023_actual_tornadoes.csv> data/warnings.tsv.gz
Writes data/tornadoes.tsv and data/results.json. Stdlib only. See PREREGISTRATION.md.

Two validity rules for a warning polygon are run side by side (README, "Deviation"):
  registered — every polygon row (issuance NEW and updates CON/EXT...) is valid from poly_beg to
               poly_end, as pre-registered: the warning as it stood at the tornado's start minute.
  as_issued  — the issuance polygon alone, valid from issue to its initial expiry (init_exp): the
               warning exactly as first issued, ignoring later shrinking or extension. A check
               on the registered rule, declared before any count was computed.
"""
import bisect, csv, gzip, json, math, statistics, sys
from datetime import datetime, timedelta

BC_POD1 = {2008: 0.672, 2009: 0.614, 2010: 0.646, 2011: 0.701, 2012: 0.625,  # Brooks & Correia 2018,
           2013: 0.528, 2014: 0.469, 2015: 0.525, 2016: 0.502}               # Table 1, case 1 (POD1)
RULES = ('registered', 'as_issued')


def t(s):
    return datetime.strptime(s, '%Y-%m-%d %H:%M')


def load_tornadoes(path):
    out, excluded = [], {'tz_other': 0, 'no_point': 0}
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
            excluded['tz_other'] += 1
            continue
        lat, lon = float(r['slat']), float(r['slon'])
        if lat == 0 or lon == 0:
            excluded['no_point'] += 1
            continue
        out.append(dict(om=r['om'], yr=y, start=start, st=r['st'], mag=int(r['mag']),
                        inj=int(r['inj']), fat=int(r['fat']), lat=lat, lon=lon))
    return out, excluded


def load_warnings(path):
    f = gzip.open(path, 'rt', newline='') if path.endswith('.gz') else open(path, newline='')
    rows = list(csv.DictReader(f, delimiter='\t'))
    issue = {}  # an event's issue time = its earliest ISSUED over all its rows
    for r in rows:
        k = (r['wfo'], r['vtec_year'], r['etn'])
        if r['issued'] and (k not in issue or r['issued'] < issue[k]):
            issue[k] = r['issued']
    ws, no_issue = [], 0
    for r in rows:
        k = (r['wfo'], r['vtec_year'], r['etn'])
        if k not in issue:
            no_issue += 1
            continue
        r['issued'] = issue[k]
        rings = [[tuple(map(float, p.split())) for p in ring.split(';')] for ring in r['rings'].split('|')]
        xs = [x for ring in rings for x, _ in ring]
        ys = [y for ring in rings for _, y in ring]
        ws.append(dict(id='%s.%s.%s' % (r['wfo'], r['vtec_year'], r['etn']), issue=t(r['issued']), status=r['status'],
                       end={'registered': t(r['poly_end']), 'as_issued': t(r['init_exp'])},
                       beg=t(r['poly_beg']), rings=rings, bbox=(min(xs), max(xs), min(ys), max(ys))))
    ws.sort(key=lambda w: w['issue'])
    return ws, no_issue


def inside(lon, lat, rings):
    hit = False
    for ring in rings:
        n = len(ring)
        for i in range(n):
            x1, y1 = ring[i]
            x2, y2 = ring[(i + 1) % n]
            if (y1 > lat) != (y2 > lat) and lon < x1 + (lat - y1) * (x2 - x1) / (y2 - y1):
                hit = not hit
    return hit


def wilson(k, n, z=1.959964):
    if n == 0:
        return None
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [round(100 * (c - h), 2), round(100 * (c + h), 2)]


def share(k, n):
    return dict(k=k, n=n, pct=round(100 * k / n, 2) if n else None, ci95=wilson(k, n))


def fisher(a, b, c, d):
    """Two-sided Fisher exact p for [[a, b], [c, d]]."""
    def lp(x):
        r1, c1, n = a + b, a + c, a + b + c + d
        return (math.lgamma(r1 + 1) + math.lgamma(n - r1 + 1) + math.lgamma(c1 + 1) + math.lgamma(n - c1 + 1)
                - math.lgamma(n + 1) - math.lgamma(x + 1) - math.lgamma(r1 - x + 1)
                - math.lgamma(c1 - x + 1) - math.lgamma(n - r1 - c1 + x + 1))
    r1, c1, n = a + b, a + c, a + b + c + d
    lo, hi = max(0, r1 + c1 - n), min(r1, c1)
    p0 = lp(a)
    return min(1.0, sum(math.exp(lp(x)) for x in range(lo, hi + 1) if lp(x) <= p0 + 1e-9))


def main(tpath, wpath):
    tors, excluded = load_tornadoes(tpath)
    ws, no_issue = load_warnings(wpath)
    issues = [w['issue'] for w in ws]
    for tor in tors:
        s = tor['start']
        lo = bisect.bisect_left(issues, s - timedelta(hours=12))
        hi = bisect.bisect_left(issues, s)  # issued strictly before the start minute
        for rule in RULES:
            best = None
            for w in ws[lo:hi]:
                if rule == 'as_issued' and w['status'] != 'NEW':
                    continue
                if not (w['beg'] <= s < w['end'][rule]):
                    continue
                x0, x1, y0, y1 = w['bbox']
                if not (x0 <= tor['lon'] <= x1 and y0 <= tor['lat'] <= y1):
                    continue
                if inside(tor['lon'], tor['lat'], w['rings']) and (best is None or w['issue'] < best['issue']):
                    best = w
            tor[rule] = None if best is None else int((s - best['issue']).total_seconds() // 60)
            tor[rule + '_id'] = '' if best is None else best['id']

    with open('data/tornadoes.tsv', 'w', newline='') as f:
        wr = csv.writer(f, delimiter='\t', lineterminator='\n')
        wr.writerow(['om', 'yr', 'start_utc', 'st', 'mag', 'inj', 'fat', 'slat', 'slon',
                     'lead_registered', 'warning_registered', 'lead_as_issued', 'warning_as_issued'])
        for x in tors:
            wr.writerow([x['om'], x['yr'], x['start'].strftime('%Y-%m-%d %H:%M'), x['st'], x['mag'], x['inj'],
                         x['fat'], x['lat'], x['lon'], '' if x['registered'] is None else x['registered'],
                         x['registered_id'], '' if x['as_issued'] is None else x['as_issued'], x['as_issued_id']])

    res = dict(tornadoes=len(tors), excluded=excluded, warning_polygons=len(ws), polygons_without_event_issue=no_issue,
               polygons_by_status=dict(__import__('collections').Counter(w['status'] for w in ws)),
               warning_events=len({w['id'] for w in ws}), rules={})
    for rule in RULES:
        W = lambda xs: sum(1 for x in xs if x[rule] is not None)
        sel = lambda f: [x for x in tors if f(x)]
        r = {}
        r['all'] = share(W(tors), len(tors))
        r['by_year'] = {y: share(W(sel(lambda x: x['yr'] == y)), len(sel(lambda x: x['yr'] == y)))
                        for y in range(2008, 2024)}
        eras = {'2008-2011': (2008, 2011), '2012-2016': (2012, 2016), '2017-2023': (2017, 2023),
                '2008-2016': (2008, 2016), '2012-2023': (2012, 2023)}
        r['by_era'] = {k: share(W(sel(lambda x, a=a, b=b: a <= x['yr'] <= b)),
                                len(sel(lambda x, a=a, b=b: a <= x['yr'] <= b))) for k, (a, b) in eras.items()}
        r['by_rating'] = {str(m): share(W(sel(lambda x, m=m: x['mag'] == m)), len(sel(lambda x, m=m: x['mag'] == m)))
                          for m in (-9, 0, 1, 2, 3, 4, 5)}
        strong, weak = sel(lambda x: x['mag'] >= 2), sel(lambda x: x['mag'] in (0, 1))
        a, c = W(strong), W(weak)
        r['ef2plus'], r['ef01'] = share(a, len(strong)), share(c, len(weak))
        r['ef_diff_points'] = round(100 * (a / len(strong) - c / len(weak)), 2)
        r['ef_fisher_p'] = fisher(a, len(strong) - a, c, len(weak) - c)
        killer, harmful = sel(lambda x: x['fat'] >= 1), sel(lambda x: x['fat'] + x['inj'] >= 1)
        r['killer'] = share(W(killer), len(killer))
        r['harmful'] = share(W(harmful), len(harmful))
        r['deaths'] = dict(total=sum(x['fat'] for x in tors),
                           in_warned_ahead=sum(x['fat'] for x in tors if x[rule] is not None))
        r['injuries'] = dict(total=sum(x['inj'] for x in tors),
                             in_warned_ahead=sum(x['inj'] for x in tors if x[rule] is not None))
        r['cells_2x2_killer'] = dict(warned_harm=W(killer), warned_no_harm=W(tors) - W(killer),
                                     unwarned_harm=len(killer) - W(killer),
                                     unwarned_no_harm=len(tors) - W(tors) - (len(killer) - W(killer)))
        for k, (a_, b_) in {'2012-2023': (2012, 2023), '2008-2011': (2008, 2011), '2008-2023': (2008, 2023)}.items():
            leads = sorted(x[rule] for x in tors if x[rule] is not None and a_ <= x['yr'] <= b_)
            r['lead_' + k] = dict(n=len(leads), median=statistics.median(leads), mean=round(statistics.mean(leads), 1),
                                  q1=leads[len(leads) // 4], q3=leads[3 * len(leads) // 4])
        r['replication_bc'] = {y: dict(bc=BC_POD1[y], ours=round(r['by_year'][y]['k'] / r['by_year'][y]['n'], 3))
                               for y in BC_POD1}
        r['bc_mean_2008_2016'] = round(sum(BC_POD1.values()) / 9, 4)
        # Post hoc, labelled: night by the record's own clock (CST, 21:00-05:59).
        night = sel(lambda x: (x['start'] - timedelta(hours=6)).hour >= 21 or (x['start'] - timedelta(hours=6)).hour < 6)
        day = sel(lambda x: 6 <= (x['start'] - timedelta(hours=6)).hour < 21)
        r['post_hoc_night'] = dict(night=share(W(night), len(night)), day=share(W(day), len(day)),
                                   killer_night=share(W([x for x in night if x['fat'] >= 1]), sum(1 for x in night if x['fat'] >= 1)),
                                   killer_day=share(W([x for x in day if x['fat'] >= 1]), sum(1 for x in day if x['fat'] >= 1)))
        nk = sum(1 for x in tors if x['fat'] < 1)
        r['non_killer'] = share(W(tors) - W(killer), nk)
        r['killer_vs_nonkiller_fisher_p'] = fisher(W(killer), len(killer) - W(killer), W(tors) - W(killer), nk - (W(tors) - W(killer)))
        unw = sorted((x for x in killer if x[rule] is None), key=lambda x: -x['fat'])[:10]
        r['deadliest_unwarned'] = [dict(om=x['om'], start_utc=x['start'].strftime('%Y-%m-%d %H:%M'), st=x['st'],
                                        mag=x['mag'], fat=x['fat'], inj=x['inj']) for x in unw]
        top = sorted(tors, key=lambda x: -x['fat'])[:10]
        r['deadliest'] = [dict(om=x['om'], start_utc=x['start'].strftime('%Y-%m-%d %H:%M'), st=x['st'], mag=x['mag'],
                               fat=x['fat'], lead=x[rule]) for x in top]
        res['rules'][rule] = r

    def verdicts(r):
        def band(v, lo, hi):
            if abs(v - lo) <= 0.5 or abs(v - hi) <= 0.5:
                return 'undecided'
            return 'held' if lo <= v <= hi else 'failed'
        p1 = r['by_era']['2008-2016']['pct']
        p2 = r['by_era']['2008-2011']['pct'] - r['by_era']['2017-2023']['pct']
        p4 = r['killer']['pct']
        med = r['lead_2012-2023']['median']
        return {
            'P1': dict(value=p1, bar='53.7-63.7', verdict=band(p1, 53.7, 63.7)),
            'P2': dict(value=round(p2, 2), bar='>= 5 points',
                       verdict='undecided' if abs(p2 - 5) <= 0.5 else ('held' if p2 >= 5 else 'failed')),
            'P3': dict(value=r['ef_diff_points'], p=r['ef_fisher_p'], bar='>= 15 points, p < 0.01',
                       verdict='undecided' if abs(r['ef_diff_points'] - 15) <= 0.5 else
                       ('held' if r['ef_diff_points'] >= 15 and r['ef_fisher_p'] < 0.01 else 'failed')),
            'P4': dict(value=p4, bar='>= 75', verdict='undecided' if abs(p4 - 75) <= 0.5 else
                       ('held' if p4 >= 75 else 'failed')),
            'P5': dict(value=med, bar='8-20 min', verdict='held' if 8 <= med <= 20 else 'failed'),
        }
    res['predictions'] = {rule: verdicts(res['rules'][rule]) for rule in RULES}
    res['rules_disagree'] = dict(
        any=sum(1 for x in tors if (x['registered'] is None) != (x['as_issued'] is None)),
        as_issued_only=sum(1 for x in tors if x['registered'] is None and x['as_issued'] is not None),
        registered_only=sum(1 for x in tors if x['registered'] is not None and x['as_issued'] is None))
    json.dump(res, open('data/results.json', 'w'), indent=1, default=str)
    print(json.dumps(res['predictions'], indent=1))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
