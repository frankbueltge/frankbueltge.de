"""Check 92, part A -- agreement between study 90's codes and the blind second coding (CODEBOOK92.md, part A).

Usage: python3 agree92.py
Reads signals90.json and blind92.json; writes agree92.json. No network, no model.
"""
import json, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
CODES = ['kind', 'unit', 'trigger', 'before_harm', 'receiver', 'public', 'machine_or_person', 'stranger', 'clock',
         'deadline']
BEFORE = {'before deployment', 'schedule', 'event short of harm'}


def norm_deadline(v):
    if v is None or v == 'none':
        return 'none'
    if v in ('prompt', 'prompt, no number'):
        return 'prompt'
    return float(v)


def kappa(a, b):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / (n * n)
    return (round((po - pe) / (1 - pe), 2) if pe < 1 else None), round(po, 3)


def first(s, code):
    if code == 'before_harm':
        return s['before_harm']
    if code == 'deadline':
        return norm_deadline(s['deadline_h'])
    return s[code]


def blind(s, code):
    if code == 'before_harm':
        return s['trigger'] in BEFORE
    if code == 'deadline':
        return norm_deadline(s['deadline_h'])
    return s[code]


def main():
    one = {s['id']: s for s in json.load(open(os.path.join(HERE, 'signals90.json')))['signals']}
    two = {s['id']: s for r in json.load(open(os.path.join(HERE, 'blind92.json')))['readers'] for s in r['signals']}
    assert set(one) == set(two), set(one) ^ set(two)
    ids = list(one)
    agree, diff = {}, []
    for c in CODES:
        a = [first(one[i], c) for i in ids]
        b = [blind(two[i], c) for i in ids]
        k, po = kappa(a, b)
        agree[c] = {'kappa': k, 'raw': po, 'same': sum(x == y for x, y in zip(a, b)), 'of': len(ids)}
        for i, x, y in zip(ids, a, b):
            if x != y:
                diff.append({'id': i, 'code': c, 'first': x, 'blind': y})
    out = {'what': "Check 92, part A: Cohen's kappa and raw agreement between study 90 (signals90.json) and the blind "
                   'second coding (blind92.json), on all 51 signals; every disagreement listed.',
           'agreement': agree, 'disagreements': diff,
           'P152': {c: agree[c]['kappa'] for c in ['receiver', 'public', 'trigger', 'unit', 'machine_or_person']}}
    out['P152']['held'] = all(v >= 0.6 for v in out['P152'].values())
    json.dump(out, open(os.path.join(HERE, 'agree92.json'), 'w'), indent=1)
    for c in CODES:
        print(c, agree[c])
    print('P152', out['P152'])
    print(len(diff), 'disagreements')


if __name__ == '__main__':
    main()
