"""Checks for study 14. Usage: python3 -I check.py <SPC csv> <study 13 warnings.tsv.gz>  (counts itself).

The second matcher is independent of analyse.py's geometry: it samples each track at 201 points and
tests each with a winding-number rule, on 600 warnings drawn with a fixed seed.
"""
import csv, gzip, json, os, random, sys
from datetime import timedelta
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyse as A

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
r = json.load(open(os.path.join(D, 'results.json')))
rows = list(csv.DictReader(gzip.open(os.path.join(D, 'warnings_verified.tsv.gz'), 'rt'), delimiter='\t'))
ran, failed = [], []


def check(name, cond):
    ran.append(name)
    if not cond:
        failed.append(name)
        print('FAILED:', name)


V = sum(1 for x in rows if int(x['V']) > 0)
S = sum(1 for x in rows if int(x['S']) > 0)
check('warning count recomputed', len(rows) == r['frame']['warnings'] == r['V']['all']['n'] == 43819)
check('V verified count recomputed', V == r['V']['all']['k'])
check('S verified count recomputed', S == r['S']['all']['k'])
check('S implies V (strict is a subset)', all(int(x['V']) > 0 for x in rows if int(x['S']) > 0))
check('V0 <= V <= V60 per warning', all(int(x['V0']) <= int(x['V']) <= int(x['V60']) for x in rows))
check('eras sum to all', sum(e['n'] for e in r['V']['eras'].values()) == len(rows)
      and sum(e['k'] for e in r['V']['eras'].values()) == V)
check('years 2008-2023 only', {int(x['year']) for x in rows} == set(range(2008, 2024)))
y = list(csv.DictReader(open(os.path.join(D, 'years.tsv')), delimiter='\t'))
check('years.tsv sums to all', sum(int(x['warnings']) for x in y) == len(rows)
      and sum(int(x['verified_V']) for x in y) == V)
j = [x for x in rows if x['warning'] == 'SGF.2011.31']
check('Joplin warning SGF 2011 #31 verified under V and S', len(j) == 1 and int(j[0]['V']) >= 1 and int(j[0]['S']) >= 1
      and int(j[0]['fat_V']) >= 158)
check('Sentry removed count: API equals Studio table', r['sentry']['api_matches_studio'] and r['sentry']['struck_off'] == 3581)
check('Sentry: one listed object came true, 2014 AA', r['sentry']['came_true'] == ['2014 AA'])
check('P1 verdict from numbers', (r['P1']['verdict'] == 'held') == (0.70 <= r['P1']['far_2008_2011'] <= 0.80))
check('P3 undecided band', r['P3']['verdict'] == 'undecided' and abs(r['P3']['spearman_rho'] - 0.4) <= 0.05)


def winding(pt, ring):
    x, y = pt
    wn = 0
    n = len(ring)
    for i in range(n):
        (x1, y1), (x2, y2) = ring[i], ring[(i + 1) % n]
        c = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1)
        if y1 <= y < y2 and c > 0:
            wn += 1
        elif y2 <= y < y1 and c < 0:
            wn -= 1
    return wn != 0


def meets_sampled(a, b, rings):
    for i in range(201):
        f = i / 200
        p = (a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1]))
        if any(winding(p, ring) for ring in rings):
            return True
    return False


if len(sys.argv) >= 3:
    tors = A.load_tornadoes(sys.argv[1])
    starts = [x['start'] for x in tors]
    ws, _ = A.load_warnings(sys.argv[2])
    random.seed(14)
    sample = random.sample(ws, 600)
    agree = disagree = 0
    for e in sample:
        mine = len(A.verify_V(e, tors, starts, 20)) > 0
        other = False
        for tr in A.candidates(tors, starts, e['issue'] - timedelta(minutes=20), e['end']):
            if any(meets_sampled(tr['a'], tr['b'], p['rings']) for p in e['polys']):
                other = True
                break
        agree += mine == other
        if mine != other:
            print('  disagree:', e['id'], 'analyse', mine, 'sampled', other)
        disagree += mine != other
    print('second matcher: %d agree, %d disagree of 600' % (agree, disagree))
    check('second matcher (sampled track, winding number) agrees on >= 597 of 600', agree >= 597)

declared = 14
print('%d checks declared, %d ran, %d failed' % (declared, len(ran), len(failed)))
assert len(ran) == declared, 'suite did not run what it declares'
sys.exit(1 if failed else 0)
