#!/usr/bin/env python3
"""Re-derive every published number from data/ — no network, no working files. Session 170.
Usage: python3 check.py [artifact_dir]. Exits non-zero on any failure, naming the check."""
import json, math, os, random, re, sys

ART = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'a-number-you-cannot-check'))
from handover import _matches  # noqa: E402

D = lambda f: json.load(open(os.path.join(ART, 'data', f), encoding='utf-8'))
RESULTS, DECLARED = [], 20


def check(name):
    def deco(fn):
        try:
            fn(); RESULTS.append((name, True, ''))
        except Exception as e:  # noqa: BLE001
            RESULTS.append((name, False, f'{type(e).__name__}: {e}'))
        return fn
    return deco


def wilson(k, n, z=1.959963985):
    p = k / n; d = 1 + z * z / n; c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [round(100 * (c - h), 2), round(100 * (c + h), 2)]


C, U, R, E, P = D('corpus.json'), D('units.json'), D('reading.json')['reading'], D('estimates.json'), D('predictions.json')
units = U['units']
cp = [r for r in R if r['verdict'] != 'NA']
rec = [r for r in cp if r['verdict'] in ('RC', 'RI')]


@check('C01 corpus: 1,000 abstracts, every one matches its 09-23 digest')
def _():
    a = C['abstracts']
    assert len(a) == 1000 and all(r['returned'] and r['digest_match'] for r in a)
    pin = json.load(open(os.path.join(ROOT, 'artifacts/2026-09-23-a-number-you-cannot-check/data/corpora.json')))['M']['docs']
    assert [r['id'] for r in a] == [d['id'] for d in pin]
    assert E['availability']['digest_match'] == 1000


@check('C02 availability: PMC IDs, returned full texts and bodies agree with estimates')
def _():
    a, f = C['abstracts'], C['fulltexts']
    assert sum(bool(r['pmcid']) for r in a) == E['availability']['with_pmcid'] == len(f)
    assert {r['pmcid'] for r in a if r['pmcid']} == {r['pmcid'] for r in f}
    b = sum(r['has_body'] for r in f)
    assert b == E['availability']['fulltext_with_body']
    assert all((not r['has_body']) or r['returned'] for r in f)
    assert E['availability']['rate'] == round(100 * b / 1000, 2) and E['availability']['rate_95'] == wilson(b, 1000)


@check('C03 population: units come only from papers with a body')
def _():
    body = {r['id'] for r in C['fulltexts'] if r['has_body']}
    assert all(x['doc'] in body for x in units)
    assert len(units) == E['population']['units'] and len({x['doc'] for x in units}) == E['population']['papers_with_a_unit']
    assert len({x['uid'] for x in units}) == len(units)


@check('C04 sample: the seeded draw reproduces the committed index')
def _():
    idx = sorted(random.Random(U['seed']).sample(range(len(units)), 120))
    assert idx == U['sample_index']


@check('C05 reading: one verdict per sampled unit, in order, matching its unit')
def _():
    assert [r['s'] for r in R] == list(range(120))
    for r in R:
        x = units[U['sample_index'][r['s']]]
        assert r['uid'] == x['uid'] and r['printed'] == x['printed'], r['s']


@check('C06 verdict vocabulary and integer fields')
def _():
    for r in R:
        assert r['verdict'] in ('RC', 'RI', 'NR', 'NA'), r['s']
        if r['verdict'] in ('RC', 'RI'):
            assert isinstance(r['k'], int) and isinstance(r['n'], int) and 0 <= r['k'] <= r['n'] and r['n'] >= 2, r['s']
        else:
            assert r['k'] is None and r['n'] is None, r['s']
        assert r['note'].strip(), r['s']
        assert (r['nr_class'] is not None) == (r['verdict'] == 'NR'), r['s']
    cls = {}
    for r in R:
        if r['nr_class']:
            cls[r['nr_class']] = cls.get(r['nr_class'], 0) + 1
    assert cls == E['not_recovered_by_class'], cls


@check('C07 arithmetic: every RC reproduces its printed value, every RI does not (09-23 rounding test)')
def _():
    for r in rec:
        x = units[U['sample_index'][r['s']]]
        m = _matches(x['value'], x['decimals'], r['k'], r['n'])
        assert m == (r['verdict'] == 'RC'), (r['s'], r['verdict'], r['k'], r['n'])
        assert abs(r['recomputed'] - round(100 * r['k'] / r['n'], 4)) < 1e-9, r['s']


@check('C08 verdict counts')
def _():
    for v in ('RC', 'RI', 'NR', 'NA'):
        assert sum(r['verdict'] == v for r in R) == E['sample']['verdicts'][v], v
    assert E['sample']['papers'] == len({r['doc'] for r in R})


@check('C09 recovered rate and its interval')
def _():
    e = E['recovered']
    assert (e['k'], e['n']) == (len(rec), len(cp))
    assert e['rate'] == round(100 * len(rec) / len(cp), 2) and e['rate_95'] == wilson(len(rec), len(cp))


@check('C10 strict reading: units flagged [strict: NR] are exactly the strict_nr ones')
def _():
    for r in R:
        assert r['strict_nr'] == ('[strict: NR]' in r['note']), r['s']
        assert (not r['strict_nr']) or r['verdict'] in ('RC', 'RI'), r['s']
    k = sum(1 for r in rec if not r['strict_nr'])
    assert E['recovered_strict']['k'] == k and E['recovered_strict']['rate'] == round(100 * k / len(cp), 2)


@check('C11 sensitivity: header-N alternative adds exactly the NR units that name it')
def _():
    s = [r['s'] for r in R if 'Sensitivity: coded RI' in r['note']]
    assert all(R[i]['verdict'] == 'NR' for i in s)
    assert E['recovered_if_header_n_taken']['added_as_RI'] == s
    assert E['recovered_if_header_n_taken']['k'] == len(rec) + len(s)


@check('C12 not-a-count-proportion share')
def _():
    na = sum(r['verdict'] == 'NA' for r in R)
    e = E['sample']['not_a_count_proportion']
    assert (e['k'], e['n']) == (na, 120) and e['rate'] == round(100 * na / 120, 2) and e['rate_95'] == wilson(na, 120)


@check('C13 paper-clustered bootstrap reproduces')
def _():
    rnd = random.Random(U['seed'])
    docs = sorted({r['doc'] for r in R}); by = {d: [r for r in R if r['doc'] == d] for d in docs}
    b = []
    for _ in range(10000):
        rr = [r for d in [rnd.choice(docs) for _ in docs] for r in by[d] if r['verdict'] != 'NA']
        if rr:
            b.append(100 * sum(r['verdict'] in ('RC', 'RI') for r in rr) / len(rr))
    b.sort()
    assert E['recovered']['paper_cluster_bootstrap_95'] == [round(b[249], 2), round(b[9749], 2)]


@check('C14 screen: population hit counts and rates')
def _():
    t = sum(x['screen_true'] for x in units); z = sum(x['screen_null'] for x in units)
    s = E['screen']
    assert (s['population_true_hits'], s['population_null_hits'], s['units']) == (t, z, len(units))
    assert s['true_rate'] == round(100 * t / len(units), 2) and s['null_rate'] == round(100 * z / len(units), 2)
    assert s['true_rate_95'] == wilson(t, len(units)) and s['null_rate_95'] == wilson(z, len(units))


@check('C15 screen: the null is a derangement (no unit screened against its own paper)')
def _():
    assert all(x['null_doc'] != x['doc'] for x in units)
    m = {}
    for x in units:
        assert m.setdefault(x['doc'], x['null_doc']) == x['null_doc']
    assert sorted(m.values()) == sorted(m.keys())


@check('C16 screen against the reading, on the sample')
def _():
    by = {x['uid']: x for x in units}; c = {}
    for r in R:
        k = ('screen_hit' if by[r['uid']]['screen_true'] else 'screen_miss') + \
            ('_and_recovered' if r['verdict'] in ('RC', 'RI') else '_not_recovered')
        c[k] = c.get(k, 0) + 1
    assert all(E['screen']['sample_confusion'][k] == c.get(k, 0) for k in E['screen']['sample_confusion'])


@check('C17 predictions: each verdict follows from its band and the observed value')
def _():
    ob = {'P1': E['availability']['rate'], 'P2': E['recovered']['rate'],
          'P3': E['sample']['not_a_count_proportion']['rate'], 'P4': E['inconsistent']['k'],
          'P5': E['screen']['null_rate']}
    for p in P['predictions']:
        lo, hi = p['band']
        assert p['observed'] == ob[p['id']], p['id']
        inside = lo <= p['observed'] <= hi
        if p['id'] == 'P5':
            inside = inside and E['screen']['true_rate'] > E['screen']['null_rate']
        assert p['verdict'] == ('HELD' if inside else 'REFUTED'), p['id']
    k = {q['id']: q for q in P['kill_conditions']}
    assert k['K1']['fired'] == (E['population']['papers_with_a_unit'] < 25)
    assert k['K2']['fired'] == ((1000 - E['availability']['digest_match']) > 50)
    assert k['K3']['fired'] == (E['screen']['null_rate'] >= E['screen']['true_rate'])


@check('C18 no third-party text beyond one short sentence per read unit')
def _():
    for r in R:
        assert len(r['abstract_sentence']) <= 320 and len(r['note']) <= 400, r['s']
    for x in units:
        assert set(x) == {'uid', 'doc', 'printed', 'value', 'decimals', 'screen_true', 'screen_null', 'null_doc'}


@check('C19 the page and the summary print the figures the data give')
def _():
    page = open(os.path.join(ART, 'index.html'), encoding='utf-8').read()
    summ = open(os.path.join(ART, 'SUMMARY.md'), encoding='utf-8').read()
    need = [f"{E['recovered']['k']} of {E['recovered']['n']}", f"{E['recovered']['rate']:.1f}",
            f"{E['availability']['fulltext_with_body']} of 1,000", f"{E['screen']['true_rate']:.1f}",
            f"{E['screen']['null_rate']:.1f}", f"{E['sample']['verdicts']['NA']} of 120",
            f"{E['recovered_strict']['rate']:.1f}"]
    for s in need:
        assert s in page, f'page lacks {s!r}'
        assert s in summ, f'summary lacks {s!r}'
    assert '<script' not in page.lower()


@check('C20 the pre-registration was committed before the data (it names no result)')
def _():
    pre = open(os.path.join(ART, 'PREREGISTRATION.md'), encoding='utf-8').read()
    for s in ('541', '1,790', '65.1', '27.04', '5.47'):
        assert s not in pre, s


if __name__ == '__main__':
    bad = [r for r in RESULTS if not r[1]]
    for n, ok, msg in RESULTS:
        print(('PASS ' if ok else 'FAIL ') + n + ('' if ok else '  -> ' + msg))
    assert len(RESULTS) == DECLARED, f'declared {DECLARED} checks, ran {len(RESULTS)}'
    print(f'{len(RESULTS)} checks run, {len(bad)} failed')
    sys.exit(1 if bad else 0)
