"""Plate V, The Uncertain Village. The Wolf's Ledger, cycle 009, increment 5 (2026-10-21).

The critique (CRITIQUE.md, kept unedited) found that the score's refutation condition was never tested:
plate I's village knew the watcher's chance exactly. This plate runs a village that keeps the warner's
words and the outcomes but does not know whether a word is calibrated, and learns each word's chance
from the record. Rules and predictions Q1-Q6 were committed before this script was run: plate5-rules.md
(commit 7f08338). Material: plate III's own sequences (plate3.js, P3.seq) and chances (P3.chance), and
plate IV's classes (plate4.js) for the repair the critique asked of plate IV. Nothing new is fetched.

Also asserted here: the short quotations of Williams used on the page, read through David Sussman,
"Is Agent-Regret Rational?" (47th Chapel Hill Colloquium in Philosophy; philosophy.unc.edu,
wp-content/uploads/sites/122/2014/07/Sussman_colloquium-.pdf, sha256 below; not committed), which quotes
Williams, Moral Luck (1981), p. 29. The 1976 paper itself was not reached.

The case summaries plate IV gives in its own words (Hyannis, lobster fishing, the buoy, four men lost,
twenty-one hours, the owner and the bargee) are asserted here against the two opinions, as the critique asked.

Usage: python3 -I plate5.py [SUSSMAN_TXT [CAP_DIR]]   (writes plate5.json and plate5.js here)
"""
import json, sys, re, math, hashlib
from pathlib import Path

HERE = Path(__file__).parent
read_js = lambda name, var: json.loads((HERE / name).read_text()[len('window.%s=' % var):].rstrip().rstrip(';'))
P3, P4 = read_js('plate3.js', 'P3'), read_js('plate4.js', 'P4')
ORDER, CH = P3['order'], P3['chance']
unpack = lambda c: (ORDER[c >> 2], (c >> 1) & 1, c & 1)

# the pooled national rate at the hour, from the classes (n-weighted chance)
NTOT = sum(P3['classes'][w]['n'] for w in ORDER)
POOL = sum(P3['classes'][w]['n'] * CH[w] for w in ORDER) / NTOT


def run(seq, n0=20.0, h=0.8, rec=1):
    """One office. rec=1 the hour's record, rec=0 the later one. Yields per warning: word, r_W, r_C, r_H,
    the run of empties before it, whether the one before was met, its index."""
    a = {w: n0 * CH[w] for w in ORDER}; b = {w: n0 * (1 - CH[w]) for w in ORDER}
    ca, cb = n0 * POOL, n0 * (1 - POOL)
    runlen, prev_hit, out = 0, None, []
    for i, (_, code) in enumerate(seq):
        w, hour, later = unpack(code); met = hour if rec == 1 else (hour or later)
        rW = (a[w] / (a[w] + b[w])) / CH[w]
        rC = (ca / (ca + cb)) / POOL
        rH = h ** runlen
        out.append((w, rW, rC, rH, runlen, prev_hit, i))
        a[w] += met; b[w] += 1 - met; ca += met; cb += 1 - met
        runlen = 0 if met else runlen + 1; prev_hit = bool(met)
    return out


def calibrated(seq, w='R'):
    k = n = 0
    for _, code in seq:
        ww, hour, _ = unpack(code)
        if ww == w: n += 1; k += hour
    p = CH[w]
    return n > 0 and abs(k - n * p) <= 1.96 * math.sqrt(n * p * (1 - p)), k, n


mean = lambda xs: sum(xs) / len(xs) if xs else None
cal = {o: calibrated(s) for o, s in P3['seq'].items()}
CAL = sorted(o for o, c in cal.items() if c[0])
rows = {o: run(P3['seq'][o]) for o in CAL}
R = [x for o in CAL for x in rows[o] if x[0] == 'R']
after_run = [x for x in R if x[4] >= 3]
after_hit = [x for x in R if x[5] is True]
half = lambda o, x: x[6] >= len(P3['seq'][o]) / 2
first = [x for o in CAL for x in rows[o] if x[0] == 'R' and x[4] >= 3 and not half(o, x)]
second = [x for o in CAL for x in rows[o] if x[0] == 'R' and x[4] >= 3 and half(o, x)]
d = lambda xs, k: 1 - mean([x[k] for x in xs])

res = {
    'rules_commit': '7f08338', 'defaults': {'n0': 20, 'h': 0.8, 'record': 'hour'}, 'pool': POOL,
    'offices': len(P3['seq']), 'calibrated_on_R': len(CAL), 'R_warnings': len(R),
    'after_run_n': len(after_run), 'after_hit_n': len(after_hit),
    'mean_r_W': mean([x[1] for x in R]), 'after_run_r_W': mean([x[1] for x in after_run]),
    'after_run_r_C': mean([x[2] for x in after_run]), 'after_run_r_H': mean([x[3] for x in after_run]),
    'after_hit_r_W': mean([x[1] for x in after_hit]),
    'disc_first_half': d(first, 1), 'disc_second_half': d(second, 1), 'first_n': len(first), 'second_n': len(second),
}
res['predictions'] = {
    'Q1': {'text': 'mean r_W over R warnings of calibrated offices in [0.95, 1.05]', 'held': 0.95 <= res['mean_r_W'] <= 1.05},
    'Q2': {'text': 'mean r_W after a run of 3+ empties below 0.97 (the refutation condition fires)', 'held': res['after_run_r_W'] < 0.97},
    'Q3': {'text': "W's discount after a run under a third of H's", 'held': d(after_run, 1) < d(after_run, 3) / 3},
    'Q4': {'text': 'mean r_W after a hit above 1', 'held': res['after_hit_r_W'] > 1},
    'Q5': {'text': "W's discount after a run no larger than C's", 'held': d(after_run, 1) <= d(after_run, 2)},
    'Q6': {'text': "W's discount after a run in the second half under half the first half's", 'held': res['disc_second_half'] < res['disc_first_half'] / 2},
}
# the same over all offices, calibrated or not, reported beside (no prediction)
allR = [x for o, s in P3['seq'].items() for x in run(s) if x[0] == 'R']
res['all_offices'] = {'R_warnings': len(allR), 'mean_r_W': mean([x[1] for x in allR]),
                      'after_run_r_W': mean([x[1] for x in allR if x[4] >= 3])}

# the repair of plate IV the critique asked for: a class below Hand's line is judged whole, before the
# outcome; every warning issued in it is over-warning by the formula's measure (met or empty alike).
C4 = P4['classes']
def whole(b, rec):
    below = [w for w in C4 if C4[w]['P_' + rec] <= b]
    return {'below': below, 'warnings': sum(C4[w]['n'] for w in below), 'of': sum(C4[w]['n'] for w in C4)}
res['plate4_repair'] = {'b': P4['band_mid'], 'hour': whole(P4['band_mid'], 'hour'), 'later': whole(P4['band_mid'], 'later')}

# Williams through Sussman: quotations asserted verbatim
SUSS = '86574d1423f11e3966909a1f34a6e30d5d63ba6fd671dc6da8fd89deef4ae2e4'
Q = {
    'insanity': '[I]t would be a kind of insanity never to experience sentiments of this kind towards anyone, and it would be an insane concept of rationality which insisted that a rational person never would',
    'object': 'unintended consequences of our intentional actions',
    'insurance': 'no insurance-payments from a common fund could substitute for my own efforts',
}
if len(sys.argv) > 1:
    txt = re.sub(r'\s+', ' ', Path(sys.argv[1]).read_text())
    for k, q in Q.items():
        assert q in txt, k
    res['williams_checked'] = True
res['williams'] = {'via': 'Sussman, Is Agent-Regret Rational?', 'sha256_pdf': SUSS, 'cites': 'Williams, Moral Luck (1981), p. 29', 'quotes': Q}

# the Field's handoff ho-2026-10-20-field-5: does the second record move a comparison between warners?
# Spearman over the 72 offices, empty share by the hour against the later record (plate IV's offices_mid)
OM = P4['offices_mid']; ks = sorted(OM)
def ranks(v):
    o = sorted(range(len(v)), key=lambda i: v[i]); r = [0] * len(v)
    for j, i in enumerate(o): r[i] = j
    return r
def corr(x, y):
    mx, my = mean(x), mean(y); sx = sum((a - mx) ** 2 for a in x) ** .5; sy = sum((b - my) ** 2 for b in y) ** .5
    return sum((a - mx) * (b - my) for a, b in zip(x, y)) / (sx * sy)
fh = [OM[k]['empty_hour'] / OM[k]['n'] for k in ks]; fl = [OM[k]['empty_later'] / OM[k]['n'] for k in ks]
res['second_record'] = {'offices': len(ks), 'spearman_far_hour_later': corr(ranks(fh), ranks(fl)),
    'offices_majority_charged_hour': sum(OM[k]['charged_hour'] * 2 > OM[k]['empty_hour'] for k in ks),
    'offices_majority_charged_later': sum(OM[k]['charged_later'] * 2 > OM[k]['empty_later'] for k in ks),
    'field_results32': {'commit': 'dae1049e13601da6be0934bf279b74aaeb74f310', 'sha256': '2317b32f8cbf038e0dbf416fc696dc85ec09079011f0e8f833f0699696ddc394',
                        'irr_final_past_inj': 1.18, 'corr_office_final_past': 0.7939}}

if len(sys.argv) > 2:
    cap = Path(sys.argv[2]); SH = {'carroll.json': '2c13a0d99f6fad58ed353a70bc9d5c8d4d4f9d9be29526c74fa6b48d58681ef6', 'brown.json': 'f332be07922762d9cf8b1ceea9dec73745afa86b5c78f1495ca8c26d380da00a'}
    T = {}
    for f, h in SH.items():
        b = (cap / f).read_bytes(); assert hashlib.sha256(b).hexdigest() == h, f
        T[f] = re.sub(r'\s+', ' ', ' '.join(o['text'] for o in json.loads(b)['casebody']['opinions']))
    FACTS = {'brown.json': ['set out from their home port of Hyannis, Massachusetts', 'to engage in lobster fishing', 'malfunctioning weather-reporting buoy',
                            'Three of her crew were lost', 'one of the SEA FEVER’S crew was swept overboard'],
             'carroll.json': ['twenty-one hours afterwards', 'The Conners Marine Co., Inc., was the owner of the barge', 'included the services of a bargee']}
    for f, ps in FACTS.items():
        for q in ps: assert q in T[f], q
    res['case_facts_checked'] = FACTS

(HERE / 'plate5.json').write_text(json.dumps(res, indent=1))
(HERE / 'plate5.js').write_text('window.P5=' + json.dumps(res, separators=(',', ':')) + ';\n')
print(json.dumps({k: v for k, v in res.items() if k not in ('williams',)}, indent=1))
