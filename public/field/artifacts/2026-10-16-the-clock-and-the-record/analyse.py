"""Study 18 — does a tornado warning help write its own verification? (PREREGISTRATION.md)

Usage: python3 -I analyse.py
Reads study 13's committed tables (tornadoes, warning polygons) and writes data/results.json and
data/clock.tsv. Stdlib only; reuses study 13's loader and point-in-polygon test unchanged.
"""
import bisect, csv, importlib.util, json, math, os
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
S13 = os.path.join(HERE, '..', '2026-10-14-the-tornadoes-that-came')
spec = importlib.util.spec_from_file_location('s13', os.path.join(S13, 'analyse.py'))
s13 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s13)


def load_tors():
    out = []
    for r in csv.DictReader(open(os.path.join(S13, 'data', 'tornadoes.tsv')), delimiter='\t'):
        out.append(dict(om=r['om'], yr=int(r['yr']), start=s13.t(r['start_utc']), mag=int(r['mag']),
                        lat=float(r['slat']), lon=float(r['slon'])))
    return out


def newcombe(k1, n1, k2, n2, z=1.959964):
    """95 % interval (points) for p1 - p2, Newcombe's hybrid score method 10."""
    def w(k, n):
        p = k / n
        d = 1 + z * z / n
        c = (p + z * z / (2 * n)) / d
        h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
        return c - h, c + h
    p1, p2 = k1 / n1, k2 / n2
    l1, u1 = w(k1, n1)
    l2, u2 = w(k2, n2)
    d = p1 - p2
    lo = d - math.sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2)
    hi = d + math.sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2)
    return [round(100 * lo, 2), round(100 * hi, 2)]


def main():
    tors = load_tors()
    ws, _ = s13.load_warnings(os.path.join(S13, 'data', 'warnings.tsv.gz'))
    issues = [w['issue'] for w in ws]
    news = [w for w in ws if w['status'] == 'NEW']

    def covered(tor):
        s = tor['start']
        lo = bisect.bisect_left(issues, s - timedelta(hours=12))
        hi = bisect.bisect_left(issues, s)
        for w in ws[lo:hi]:
            if w['beg'] <= s < w['end']['registered']:
                x0, x1, y0, y1 = w['bbox']
                if x0 <= tor['lon'] <= x1 and y0 <= tor['lat'] <= y1 and s13.inside(tor['lon'], tor['lat'], w['rings']):
                    return True
        return False

    for tor in tors:
        tor['cov'] = covered(tor)
    exps = sorted(news, key=lambda w: w['end']['as_issued'])
    ekeys = [w['end']['as_issued'] for w in exps]

    def offsets(tor, maxw=40):
        """Minutes from each as-issued polygon's initial expiry, for polygons holding the start point."""
        s = tor['start']
        lo = bisect.bisect_left(ekeys, s - timedelta(minutes=maxw))
        hi = bisect.bisect_right(ekeys, s + timedelta(minutes=maxw))
        out = []
        for w in exps[lo:hi]:
            x0, x1, y0, y1 = w['bbox']
            if x0 <= tor['lon'] <= x1 and y0 <= tor['lat'] <= y1 and s13.inside(tor['lon'], tor['lat'], w['rings']):
                out.append(((s - w['end']['as_issued']).total_seconds() / 60, w['id']))
        return out

    for tor in tors:
        tor['off'] = offsets(tor)

    def compare(a_lo, a_hi, b_lo, b_hi, b_cov):
        """Side A: offset in [a_lo, a_hi), covered. Side B: offset in [b_lo, b_hi), covered == b_cov."""
        A, B = set(), set()
        for i, tor in enumerate(tors):
            for o, _ in tor['off']:
                if a_lo <= o < a_hi and tor['cov']:
                    A.add(i)
                if b_lo <= o < b_hi and tor['cov'] == b_cov:
                    B.add(i)
        both = A & B  # a tornado on both sides (two polygons) is dropped from both
        A, B = A - both, B - both
        weak = lambda S: sum(1 for i in S if tors[i]['mag'] <= 0)
        kA, kB = weak(A), weak(B)
        r = dict(before=s13.share(kA, len(A)), after=s13.share(kB, len(B)), dropped_both_sides=len(both))
        if A and B:
            r['diff_after_minus_before_points'] = round(100 * (kB / len(B) - kA / len(A)), 2)
            r['diff_ci95'] = newcombe(kB, len(B), kA, len(A))
            r['fisher_p'] = s13.fisher(kA, len(A) - kA, kB, len(B) - kB)
            r['unrated'] = dict(before=sum(1 for i in A if tors[i]['mag'] == -9),
                                after=sum(1 for i in B if tors[i]['mag'] == -9))
            r['ef2plus'] = dict(before=sum(1 for i in A if tors[i]['mag'] >= 2),
                                after=sum(1 for i in B if tors[i]['mag'] >= 2))
        return r, A, B

    res = dict(tornadoes=len(tors), as_issued_polygons=len(news), covered=sum(t['cov'] for t in tors), windows={})
    sides = {}
    for W in (10, 20, 30):
        r, A, B = compare(-W, 0, 0, W, False)
        res['windows'][str(W)] = r
        if W == 20:
            sides = (A, B)
    res['placebo_20'] = compare(-40, -20, -20, 0, True)[0]
    # descriptive, not registered: what happens on the after side when coverage continues
    res['after_still_covered_20'] = compare(-20, 0, 0, 20, True)[0]
    # descriptive: minute-of-start profile around expiry (5-min bins), uncovered vs covered
    prof = {}
    for tor in tors:
        for o, _ in tor['off']:
            b = int(math.floor(o / 5) * 5)
            if -40 <= b < 40:
                key = '%d' % b
                p = prof.setdefault(key, dict(n=0, weak=0, cov=0))
                p['n'] += 1; p['weak'] += tor['mag'] <= 0; p['cov'] += tor['cov']
    res['profile_5min'] = dict(sorted(prof.items(), key=lambda kv: int(kv[0])))
    r20 = res['windows']['20']
    res['predictions'] = {
        'P1': r20['after']['n'] >= 100,
        'P2': r20['diff_after_minus_before_points'] <= -5 and r20['diff_ci95'][1] < 0,
        'P3': abs(res['placebo_20']['diff_after_minus_before_points']) < 5
              and res['placebo_20']['diff_ci95'][0] <= 0 <= res['placebo_20']['diff_ci95'][1],
        'P4': all((res['windows'][w]['diff_after_minus_before_points'] > 0) == (r20['diff_after_minus_before_points'] > 0)
                  for w in ('10', '30')),
    }
    A, B = sides
    with open(os.path.join(HERE, 'data', 'clock.tsv'), 'w', newline='') as f:
        wr = csv.writer(f, delimiter='\t', lineterminator='\n')
        wr.writerow(['om', 'start_utc', 'mag', 'side_w20', 'covered', 'min_from_expiry', 'warning'])
        for i, tor in enumerate(tors):
            if not tor['off']:
                continue
            o, wid = min(tor['off'], key=lambda x: abs(x[0]))
            side = 'before' if i in A else 'after' if i in B else ''
            wr.writerow([tor['om'], tor['start'].strftime('%Y-%m-%d %H:%M'), tor['mag'], side, int(tor['cov']),
                         round(o, 1), wid])
    rows = [[round(tor['start'].year), tor['mag'], int(tor['cov']), sorted(round(o, 1) for o, _ in tor['off'])]
            for tor in tors if tor['off']]
    with open(os.path.join(HERE, 'data.js'), 'w') as f:
        f.write('// generated by analyse.py: per tornado near an as-issued expiry: [year, mag, covered, [minutes from expiry]]\n')
        f.write('const T = ' + json.dumps(rows, separators=(',', ':')) + ';\n')
        f.write('const R = ' + json.dumps({k: res[k] for k in ('windows', 'placebo_20', 'after_still_covered_20', 'predictions')},
                                          separators=(',', ':')) + ';\n')
    json.dump(res, open(os.path.join(HERE, 'data', 'results.json'), 'w'), indent=1)
    print(json.dumps({k: res[k] for k in ('windows', 'placebo_20', 'after_still_covered_20', 'predictions')}, indent=1))


if __name__ == '__main__':
    main()
