"""Checks for study 6 (session 191): recompute the headline numbers from data/cells.json alone,
independently of analyse.py, and compare with data/results.json and the built page.
Counts itself: prints how many checks ran and fails if that differs from how many were defined."""
import json, os, collections
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(H, 'data', 'results.json')))
C = json.load(open(os.path.join(H, 'data', 'cells.json')))
page = open(os.path.join(H, 'index.html')).read()
NEAR, EVENT = 'AI tangible harm near-miss', 'AI tangible harm event'
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok:
        failed.append(name)

final = {c['id']: c['final'] for c in C if c['final'] is not None or c['status'] is not None}
pairs = [(c['id'], [a for a in c['ann'] if a[1]]) for c in C]
pairs = [(i, a[0], a[1]) for i, a in pairs if len(a) >= 2]
check('pair count', len(pairs) == R['pairs']['n'])
check('no pair has one annotator twice', all(a[0] != b[0] for _, a, b in pairs))
both = sum(a[1] == NEAR and b[1] == NEAR for _, a, b in pairs)
na = sum(a[1] == NEAR for _, a, _ in pairs); nb = sum(b[1] == NEAR for _, _, b in pairs)
check('near specific', abs(2 * both / (na + nb) - R['pairs']['specific'][NEAR]['value']) < 1e-3)
be = sum(a[1] == EVENT and b[1] == EVENT for _, a, b in pairs)
ea = sum(a[1] == EVENT for _, a, _ in pairs); eb = sum(b[1] == EVENT for _, _, b in pairs)
check('event specific', abs(2 * be / (ea + eb) - R['pairs']['specific'][EVENT]['value']) < 1e-3)
po = sum(a[1] == b[1] for _, a, b in pairs) / len(pairs)
ca = collections.Counter(a[1] for _, a, _ in pairs); cb = collections.Counter(b[1] for _, _, b in pairs)
pe = sum(ca[k] * cb[k] for k in ca) / len(pairs) ** 2
check('kappa', abs((po - pe) / (1 - pe) - R['pairs']['kappa']) < 1e-3)
fin_near = [c for c in C if c['final'] == NEAR]
check('final near count', len(fin_near) == R['final_counts'][NEAR] == 10)
top = R['exploratory']['top_annotator']['id']
check('every final near called near by top', all(any(a == [top, NEAR] for a in c['ann']) for c in fin_near))
check('final near also called by another', sum(any(a[0] != top and a[1] == NEAR for a in c['ann']) for c in fin_near) == R['exploratory']['top_annotator']['final_near_where_another_called_near'])
check('coverage', sum(1 for c in C if c['final'] is not None or c['status'] is not None) <= R['coverage']['final'])
check('max id', max(c['id'] for c in C if c['final'] is not None) <= R['coverage']['max_id'] == 619)
check('incident 65', any(c['id'] == 65 and c['final'] == 'none' for c in C))
check('incident 8 is the brief example and split', any(c['id'] == 8 and c['final'] == NEAR and sorted(a[1] for a in c['ann']) == sorted([NEAR, 'unclear']) for c in C))
check('page carries data', '/*DATA*/null' not in page and '/*CELLS*/null' not in page)
check('page has no external script', '<script src' not in page)
check('predictions verdicts', [p['verdict'] for p in R['predictions'].values()] == ['held', 'held', 'undecided', 'held', 'failed'])
DEFINED = 15
print(f'{len(ran)} checks ran, {len(failed)} failed', failed)
assert len(ran) == DEFINED, 'a check did not run'
assert not failed
