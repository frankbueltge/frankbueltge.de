"""Study 18 checks. Usage: python3 -I check.py  — counts what it ran, and runs a tamper."""
import json, os, subprocess, sys, csv
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, 'data', 'results.json')))
ran, fail = 0, 0


def ok(name, cond):
    global ran, fail
    ran += 1
    fail += not cond
    print(('PASS ' if cond else 'FAIL ') + name)


w20 = R['windows']['20']
ok('tornado universe is study 13\'s 19,631', R['tornadoes'] == 19631)
ok('shares recompute from k/n', all(abs(x['pct'] - 100 * x['k'] / x['n']) < 0.006
   for c in list(R['windows'].values()) + [R['placebo_20'], R['after_still_covered_20']] for x in (c['before'], c['after'])))
ok('difference recomputes', abs(w20['diff_after_minus_before_points'] - (w20['after']['pct'] - w20['before']['pct'])) < 0.02)
ok('difference sits inside its interval', w20['diff_ci95'][0] < w20['diff_after_minus_before_points'] < w20['diff_ci95'][1])
ok('P1 rule: after n >= 100', R['predictions']['P1'] == (w20['after']['n'] >= 100))
ok('P2 rule: drop >= 5 with CI below 0', R['predictions']['P2'] == (w20['diff_after_minus_before_points'] <= -5 and w20['diff_ci95'][1] < 0))
pl = R['placebo_20']
ok('P3 rule', R['predictions']['P3'] == (abs(pl['diff_after_minus_before_points']) < 5 and pl['diff_ci95'][0] <= 0 <= pl['diff_ci95'][1]))
ok('one of four predictions held', sum(R['predictions'].values()) == 1)
# the tsv's sides agree with results
rows = list(csv.DictReader(open(os.path.join(HERE, 'data', 'clock.tsv')), delimiter='\t'))
b = [r for r in rows if r['side_w20'] == 'before']
a = [r for r in rows if r['side_w20'] == 'after']
ok('clock.tsv sides match n', len(b) == w20['before']['n'] and len(a) == w20['after']['n'])
ok('clock.tsv weak counts match k', sum(int(r['mag']) <= 0 for r in b) == w20['before']['k'] and sum(int(r['mag']) <= 0 for r in a) == w20['after']['k'])
ok('after side is uncovered, before side covered', all(r['covered'] == '0' for r in a) and all(r['covered'] == '1' for r in b))
# the page's own computation equals Python's at W=10,20,30 and the placebo
src = open(os.path.join(HERE, 'data.js')).read().replace('const T =', 'globalThis.T =').replace('const R =', 'globalThis.R =')
page = open(os.path.join(HERE, 'index.html')).read()
fn = page[page.index('function compare'):page.index('window.__compare')]
prog = src + '\n' + fn + '\nconsole.log(JSON.stringify([10,20,30].map(W=>compare(W,0)).concat([compare(20,20)])));'
out = json.loads(subprocess.run(['node', '-'], input=prog, capture_output=True, text=True, check=True).stdout)
py = [R['windows'][k] for k in ('10', '20', '30')] + [pl]
ok('page recomputes Python, four comparisons', all(o['kA'] == p['before']['k'] and o['nA'] == p['before']['n'] and o['kB'] == p['after']['k']
   and o['nB'] == p['after']['n'] for o, p in zip(out, py)))
# tamper: relabel every after-side tornado as EF2 — the page's computation must see the drop
tam = src.replace('globalThis.T =', 'globalThis.T0 =') + '\nglobalThis.T=T0.map(t=>t[2]===0&&t[3].some(o=>o>=0&&o<20)?[t[0],2,t[2],t[3]]:t);\n' + fn + \
    '\nconsole.log(JSON.stringify(compare(20,0)));'
t = json.loads(subprocess.run(['node', '-'], input=tam, capture_output=True, text=True, check=True).stdout)
ok('tamper caught: relabelled after side reads 0 weak', t['kB'] == 0 and t['nB'] == w20['after']['n'])
N = 13
ok('suite ran every check written in it', ran == N)
print('%d of %d passed' % (ran - fail, ran))
sys.exit(1 if fail else 0)
