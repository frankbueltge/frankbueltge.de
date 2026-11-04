"""Study 10 checks: recomputes the headline numbers from data/*.tsv alone and compares them with
data/results.json. Usage: python3 -I check.py (no network). Counts its own checks."""
import csv, json, os, sys
from itertools import combinations
H = os.path.dirname(os.path.abspath(__file__))
T = lambda n: list(csv.DictReader(open(os.path.join(H, 'data', n), encoding='utf-8'), delimiter='\t'))
r = json.load(open(os.path.join(H, 'data', 'results.json'), encoding='utf-8'))
ran, failed = [], []
def check(name, cond):
    ran.append(name)
    if not cond: failed.append(name)
hin = T('hinges.tsv'); ev = {}
for x in hin: ev.setdefault(x['event'], []).append(x)
pairs = [(a, b) for e in ev.values() for a, b in combinations(e, 2)]
both = [(a, b) for a, b in pairs if a['hinge'] == b['hinge'] == '1']
same = [(a, b) for a, b in both if set(a['steps'].split()) & set(b['steps'].split())]
check('14 events, 45 entries', len(ev) == 14 and len(hin) == 45)
check('26 hinges named', sum(x['hinge'] == '1' for x in hin) == 26 == r['inputs']['entries_with_hinge'])
check('51 pairs', len(pairs) == 51 == r['pairs']['pairs'])
check('22 both named', len(both) == 22 == r['pairs']['named_both'])
check('16 same hinge', len(same) == 16 == r['pairs']['same_hinge'])
check('two keepers per pair differ', all(a['keeper'] != b['keeper'] for a, b in pairs))
four = [e for e, xs in ev.items() if len(xs) == 4]
check('three events on four lists', sorted(four) == ['E23', 'E42', 'E52'])
check('E42 and E52 share no hinge', all(r['per_event'][e]['same'] == 0 for e in ('E42', 'E52')))
rd = T('readers.tsv')
check('readers 32 of 34', len(rd) == 34 and sum(x['reader1'] == x['reader2'] for x in rd) == 32)
check('kappa 0.90', abs(r['readers_kappa']['kappa'] - 0.9) < 0.0005)
orb = T('orbits.tsv')
check('215 bent of 1,159', len(orb) == 1159 and sum(float(x['moid_km']) > float(x['b_km']) for x in orb) == 215)
oc = r['orbit_check']
check('orbit bound inside its interval', oc['held_vs_inner_density_as_published'] == 0.0744 and oc['held_vs_inner_density_bent_set_aside'] <= 0.0790)
check('predictions', [r['predictions'][k]['verdict'] for k in ('H1', 'H2', 'H3')] == ['held'] * 3)
EXPECTED = 13
print(f'{len(ran)} checks ran, {len(failed)} failed' + (': ' + ', '.join(failed) if failed else ''))
if len(ran) != EXPECTED:
    print(f'expected {EXPECTED}, ran {len(ran)}'); sys.exit(1)
sys.exit(1 if failed else 0)
