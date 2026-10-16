#!/usr/bin/env python3
"""The Memberless Column. Cycle 008, session 5. The Field's study 19 writes, for each of 10,540 warned
US tornadoes (2008-2023), a model's two columns: the probability that someone is hurt (or killed) as
warned, q, and had it not been warned, p. That is a keeper other than the warner writing the
counterfactual the warner never writes. This build files each warned tornado by what the two columns
let a reader say of it: harm came (the world wrote it), or no harm came, and then the share of that
calm the warning bought, h = (p - q) / (1 - q), the rest being the share that was never needed.

  python3 build.py <fines.tsv> <results.json>
     both from field-research@ccdf5c5, artifacts/2026-10-16-the-fine-for-working/data/ (hash-checked).
  writes data.js and results.json.

q is recomputed from p and the odds ratio (q's odds = OR x p's odds), which is how the Field's model
makes it; the build asserts that this reproduces the Field's own q at its fitted OR."""
import csv, hashlib, json, os, sys
here = os.path.dirname(os.path.abspath(__file__))
SRC = json.load(open(os.path.join(here, 'sources.json')))['sources']
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()
tsv, res = sys.argv[1:3]
assert sha(tsv) == SRC['field_19_fines']['sha256'], 'fines hash'
assert sha(res) == SRC['field_19_results']['sha256'], 'results hash'
R = json.load(open(res))
rows = list(csv.DictReader(open(tsv), delimiter='\t'))
assert len(rows) == R['n_warned'] == 10540

def q_of(p, OR): return OR * p / (1 - p + OR * p)

OUT = {}
for k, name in (('H', 'anyone hurt or killed'), ('D', 'anyone killed')):
    OR, (lo, hi) = R[k]['OR_warned'], R[k]['OR_ci']
    hit = [(int(r['inj']) + int(r['fat']) > 0) if k == 'H' else int(r['fat']) > 0 for r in rows]
    assert sum(hit) == R[k]['events_warned']
    # the model's own q, reproduced
    dev = max(abs(q_of(float(r['p_' + k]), OR) - float(r['q_' + k])) for r in rows)
    assert dev < 2e-5, dev          # the published OR is rounded to four places

    def column(OR):
        hs = [None if h else (float(r['p_' + k]) - q_of(float(r['p_' + k]), OR)) / (1 - q_of(float(r['p_' + k]), OR))
              for r, h in zip(rows, hit)]
        calm = [x for x in hs if x is not None]
        tot, sq = sum(calm), sum(x * x for x in calm)
        return dict(OR=OR, total=round(tot, 2), largest=round(max(calm), 4), smallest=round(min(calm), 4),
                    over_half=sum(x > .5 for x in calm), over_quarter=sum(x > .25 for x in calm),
                    redrawn=round(sq / tot, 4) if tot > 0 else None, never_needed=round(len(calm) - tot, 2))
    # the odds ratio at which the most exposed calm tornado would first be more likely heeded than not:
    # h = 1/2  <=>  q = 2p - 1, so OR = odds(2p - 1) / odds(p) for the largest p among calm rows
    pmax = max(float(r['p_' + k]) for r, h in zip(rows, hit) if not h)
    odds = lambda x: x / (1 - x)
    OUT[k] = dict(outcome=name, events=sum(hit), calm=len(rows) - sum(hit), OR=OR, OR_ci=[lo, hi],
                  at=column(OR), at_lo=column(lo), at_hi=column(hi),
                  pmax=round(pmax, 6), OR_first_half=round(odds(2 * pmax - 1) / odds(pmax), 4) if pmax > .5 else None,
                  model_q_max_dev=dev)

# per tornado, for the page: year, state, rating (-9 = unrated), harm flags, p for both outcomes
D = [[int(r['yr']), r['st'], int(r['mag']), int(int(r['inj']) + int(r['fat']) > 0), int(int(r['fat']) > 0),
      round(float(r['p_H']), 6), round(float(r['p_D']), 6)] for r in rows]
D.sort(key=lambda d: (d[5], d[0]))          # least exposed first: the page lays them out in this order
with open(os.path.join(here, 'data.js'), 'w') as f:
    f.write('// The Memberless Column: per warned tornado [year, state, rating (-9 unrated), hurt, killed, p_hurt, p_killed],\n'
            '// p = the Field\'s model, had it not been warned (study 19, field-research@ccdf5c5). Built by build.py.\n')
    f.write('const ROWS=' + json.dumps(D, separators=(',', ':')) + ';\n')
    f.write('const FIT=' + json.dumps({k: dict(OR=v['OR'], ci=v['OR_ci']) for k, v in OUT.items()}) + ';\n')
json.dump(OUT, open(os.path.join(here, 'results.json'), 'w'), indent=1)
for k, v in OUT.items():
    print(k, v['events'], v['calm'], 'OR', v['OR'], v['at'], v['at_lo'], v['at_hi'], 'pmax', v['pmax'], 'OR@half', v['OR_first_half'])
