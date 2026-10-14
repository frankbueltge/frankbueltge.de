#!/usr/bin/env python3
"""Check every source against its pinned hash and every quotation word for word, compare the two
readings, recompute the Studio's count from the first reading, find the least and the most the
keeper's words allow, decide which claims are true under every sharpening, and write results.json
and index.html (from template.html).
Usage: python3 -I build.py <srcdir>   (srcdir holds the files named in sources.json)"""
import hashlib, html, json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(here, 'sources.json')))
R1 = json.load(open(os.path.join(here, 'reader1.json')))['codes']
R2 = json.load(open(os.path.join(here, 'reader2.json')))['codes']
src = sys.argv[1]

def path(meta):
    f = os.path.join(src, meta['file'])
    assert hashlib.sha256(open(f, 'rb').read()).hexdigest() == meta['sha256'], 'hash ' + meta['file']
    return f

def text(meta):
    s = open(path(meta), encoding='utf-8', errors='replace').read()
    s = re.sub(r'(?is)<(script|style).*?</\1>', ' ', s); s = re.sub(r'<[^>]+>', ' ', s); s = html.unescape(s)
    return re.sub(r'\s+', ' ', s)

def body(t): return t[t.find(' Summary '):t.find('Hidden System Updates')]

ids = list(S['pages']); nq = 0
for d in ids:
    b = body(text(S['pages'][d])); assert len(b) > 1500, d
    for r in (R1, R2):
        for c in r[d]: assert c['q'] in b, f'quote not found {d}: {c["q"][:50]}'; nq += 1
for k, m in S['reference'].items():
    t = text(m)
    for q in m['quotes']: assert q in t, f'quote not found {k}: {q[:50]}'; nq += 1
W = json.load(open(path(S['siblings']['studio_written'])))
D = {r['des'].replace(' ', ''): r for r in json.load(open(path(S['siblings']['studio_data'])))['rows']}
print(f'{len(ids) + len(S["reference"]) + len(S["siblings"])} sources match their hashes; {nq} quotations found word for word')

# 1. the two readings. The load-bearing phrases are those that count people, reports or places.
LOAD = ('person', 'report', 'place')
key = lambda c: (c['U'], c['Q'], c['F'], c['C'])
agree = {'load_phrases_r1': 0, 'load_phrases_r2': 0, 'load_identical': 0, 'differences': []}
for d in ids:
    a = sorted(key(c) for c in R1[d] if c['U'] in LOAD); b = sorted(key(c) for c in R2[d] if c['U'] in LOAD)
    agree['load_phrases_r1'] += len(a); agree['load_phrases_r2'] += len(b)
    agree['load_identical'] += sum(min(a.count(x), b.count(x)) for x in set(a))
    oa = sorted(map(str, (key(c) for c in R1[d] if c['U'] not in LOAD))); ob = sorted(map(str, (key(c) for c in R2[d] if c['U'] not in LOAD)))
    if oa != ob: agree['differences'].append({'page': d, 'reader1': oa, 'reader2': ob})
assert agree['load_identical'] == agree['load_phrases_r1'] == agree['load_phrases_r2'], agree

# 2. per page: the least each unit choice allows, and whether the words fix any most
INF = None
def page(d, report_is_person, strict):
    ppl = [c for c in R1[d] if c['U'] == 'person' or (report_is_person and c['U'] == 'report')]
    if not ppl: return {'lo': 0 if R1[d] else None, 'hi': 0 if R1[d] else None}
    f = lambda c: c['F'] - (1 if (not strict and c['Q'] == 'over') else 0)
    lo = max(f(c) for c in ppl)          # phrases on one page may count the same people: take the largest
    hi = INF if any(c['C'] in ('none', 'vague') for c in ppl) else sum(c['C'] for c in ppl)
    return {'lo': lo, 'hi': hi}
inh = [d for d in ids if D[d]['residents_50km'] > 0]
beneath = sum(D[d]['residents_50km'] for d in inh)
rows = []
for d in ids:
    rows.append({'id': d, 'des': D[d]['des'], 'place': D[d]['place'], 'beneath': D[d]['residents_50km'],
                 'phrases': R1[d], 'studio': W['by_strike'][D[d]['des']]['written'],
                 'strict_reports': page(d, True, True), 'persons': page(d, False, True)})
studio_rule = sum(page(d, True, False)['lo'] or 0 for d in inh)
assert studio_rule == W['summary']['written_inhabited'] == 261, studio_rule
strict = sum(page(d, True, True)['lo'] or 0 for d in inh)
persons = sum(page(d, False, True)['lo'] or 0 for d in inh)
persons_all = sum(page(d, False, True)['lo'] or 0 for d in ids)
assert strict == 263, strict   # the ledger's first claim names this number
open_pages = [d for d in inh if page(d, True, True)['hi'] is INF]
second = {'page': '2022WJ1', 'keeper_floor': page('2022WJ1', True, True)['lo'], 'second_floor': 1101,
          'quote': S['reference']['second_keeper']['quotes'][0]}
second['ratio'] = round(second['second_floor'] / second['keeper_floor'], 1)

# 3. claims, decided over every admissible sharpening: a floor stays, a ceiling never comes
def claim(txt, kind, x):
    st = (strict >= x) if kind == 'atleast' else False   # 'fewer' claims need a most, and the words fix none
    return {'text': txt, 'kind': kind, 'x': x, 'supertrue': st}
claims = [claim('The six pages over people write at least 263 who saw it (a report counted as one)', 'atleast', 263),
          claim('The six pages write at least 264 who saw it (a report counted as one)', 'atleast', 264),
          claim('Fewer than 1 in 10,000 of the people beneath are written', 'fewer', beneath / 1e4),
          claim('Fewer than 1 in 1,000 of the people beneath are written', 'fewer', beneath / 1e3),
          claim('Fewer are written than lived beneath', 'fewer', beneath),
          claim('The Ontario page writes more people than the Normandy page', 'order', 0)]
res = {'pages': len(ids), 'inhabited': len(inh), 'beneath': beneath, 'agree': agree,
       'studio_rule': studio_rule, 'strict_floor': strict, 'persons_floor_inhabited': persons,
       'persons_floor_all': persons_all, 'report_phrases_inhabited': sum(1 for d in inh for c in R1[d] if c['U'] == 'report'),
       'open_pages': open_pages, 'ceiling': None, 'second_keeper': second, 'claims': claims,
       'supertrue': sum(c['supertrue'] for c in claims), 'rows': rows,
       'unreachable': S['unreachable'], 'refs': {k: {'url': m['url'], 'quotes': m['quotes'], 'cite': m.get('cite', '')} for k, m in S['reference'].items()}}
json.dump(res, open(os.path.join(here, 'results.json'), 'w'), indent=1, ensure_ascii=False)
t = open(os.path.join(here, 'template.html')).read()
open(os.path.join(here, 'index.html'), 'w').write(t.replace('/*DATA*/null', json.dumps(res, ensure_ascii=False)))
print(f"Studio's rule: {studio_rule}; strict floor: {strict}; persons written as persons: {persons} ({persons_all} on all 13); "
      f"pages with no most: {len(open_pages)} of {len(inh)}; second keeper {second['second_floor']} vs {second['keeper_floor']} "
      f"(x{second['ratio']}); supertrue claims {res['supertrue']} of {len(claims)}; load phrases agree {agree['load_identical']} of {agree['load_phrases_r1']}")
