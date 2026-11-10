"""UNREAD, state 5 (session 232, 2026-11-07): the form of the sentence.

The Field asked (session 258, handoff ho-2026-11-06-field-11): North Kivu's line leaves calls
unaccounted from 26 October, and its new template writes no failure count; is the silence the
sentence's form? This script answers from this etude's own hand reading (data.json, both provinces).

Each day's quoted line is classed by the Field's own rule, copied from its analyse60.py
(field-research@024f7cd9, artifacts/after-cycle-012/the-two-days/analyse60.py, function klass):
  A  "Sur <n> alertes ..."                       (the calls first)
  B  "<n> EDS realises sur <n> alertes ..."      (the burials first, the calls as their denominator)
  C  everything else
and it is checked that the classes equal the Field's results60.json, report by report, for North Kivu.

A failure is "written in the sentence" when the quoted line itself carries "echec"; "written apart"
when it stands in a sentence of its own (uq); otherwise not written. "Sans echec" counts as written:
it is a failure count of zero.

Run: python3 -I forms.py [results60.json]   (the second argument is optional: the cross-check)
Writes forms.json and forms.js, and asserts every figure the page states.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'data.json'), encoding='utf-8'))


def ws(s):
    return re.sub(r'\s+', ' ', s).strip()


def klass(q):  # the Field's rule, word for word in effect
    if q is None:
        return None
    q = ws(q)
    if re.match(r'^sur \d+ alertes', q, re.I):
        return 'A'
    if re.match(r'^\d+ EDS r[ée]alis[ée]e?s? sur \d+ alertes', q, re.I):
        return 'B'
    return 'C'


ECHEC = re.compile(r'[ée]chec', re.I)


def where(d):
    if ECHEC.search(d['q']):
        return 'in'
    if d.get('uq') and ECHEC.search(d['uq']):
        return 'apart'
    if d.get('uq') and d.get('unread') is not None:  # "n'ont pas pu etre swabes": a count of failures in other words
        return 'apart'
    return None


out = {}
for p, days in (('it', D['days']), ('nk', D['nk']['days'])):
    for d in days:
        if not d.get('q'):
            continue
        w = where(d)
        if w:
            assert d['unread'] is not None, (p, d['report'])
        out.setdefault(d['report'], {})[p] = {'f': klass(d['q']), 'w': w}

# cross-check against the Field's classes (North Kivu and Ituri)
if len(sys.argv) > 1:
    r60 = json.load(open(sys.argv[1], encoding='utf-8'))
    for r in r60['reports']:
        if not r['present']:
            continue
        for p, key in (('nk', 'nk'), ('it', 'ituri')):
            theirs = r[key].get('class')
            mine = out.get(r['report'], {}).get(p, {}).get('f')
            assert theirs == mine, (r['report'], p, theirs, mine)
    print('classes equal the Field\'s results60.json on every present report, both provinces')


def tally(p, reports, f=None):
    rows = [out[n][p] for n in reports if p in out.get(n, {}) and (f is None or out[n][p]['f'] == f)]
    return len(rows), sum(r['w'] == 'in' for r in rows), sum(r['w'] == 'apart' for r in rows)


ALL = sorted(out)
nkA = tally('nk', ALL, 'A'); nkB = tally('nk', ALL, 'B'); nkC = tally('nk', ALL, 'C')
assert nkA == (10, 5, 0) and nkB == (9, 0, 1) and nkC == (32, 9, 4), (nkA, nkB, nkC)

LATE = [n for n in ALL if n >= 165]
assert LATE == [165, 166, 167, 168, 169, 170, 171, 173, 174]
both_B = [n for n in LATE if out[n].get('it', {}).get('f') == 'B' and out[n].get('nk', {}).get('f') == 'B']
assert both_B == [165, 166, 167, 168, 170, 171, 173, 174], both_B   # 30 Oct: North Kivu's line is form C
it_w = [n for n in both_B if out[n]['it']['w']]
nk_w = [n for n in both_B if out[n]['nk']['w']]
assert it_w == [167, 168, 170, 171, 174] and nk_w == [166], (it_w, nk_w)
assert [out[n]['it']['w'] for n in it_w] == ['apart', 'apart', 'apart', 'in', 'apart']
assert out[166]['nk']['w'] == 'apart'
# the same form B, Ituri's first days: the failure in parentheses, inside the sentence
assert [out[n]['it']['w'] for n in (108, 109, 110)] == ['in', 'in', 'in'] and out[111]['it']['w'] is None

FIG = {'nk_A': nkA, 'nk_B': nkB, 'nk_C': nkC, 'both_B': both_B, 'it_written': it_w, 'nk_written': nk_w}
json.dump({'rule': 'the Field, analyse60.py klass (field-research@024f7cd9)', 'days': out, 'figures': FIG},
          open(os.path.join(HERE, 'forms.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'forms.js'), 'w').write(
    'window.UNREAD_FORMS = ' + open(os.path.join(HERE, 'forms.json'), encoding='utf-8').read() + ';\n')
print('ok', 'NK A', nkA, 'B', nkB, 'C', nkC, '| both B from 26 Oct:', len(both_B), 'Ituri writes failures on', len(it_w), 'North Kivu on', len(nk_w))
