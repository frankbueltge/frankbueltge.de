"""SECOND RUN: build the work's data (cycle 016, step 4 of the programme).

Usage: python3 -I build.py <field-research checkout> <ulysses checkout>

Reads the Field's studies 80 and 81 (*What a Test Can Show*) and its check 82 (the blind second reading) at a
pinned commit with `git show`, and the Atelier's reading of the six repeatable tests on control at a pinned
commit, and writes data.js. Nothing is coded here and nothing is copied from the report beyond what the Field's own files carry:

- every body sentence of the International AI Safety Report 2026 (2,323, pages 14 to 146), with its page and
  its class: not on evaluation, or on evaluation and graded inferred, open or measured (the Field's coding80);
- the text of the 201 sentences on evaluation (the Field's sentences80, Open Government Licence v3.0);
- the sources behind the 41 measured sentences, each with the Field's codes for test, runner, pass mark and
  whether someone outside the maker could repeat it (coding81), and which sentences stand on which source,
  by the Field's own rule (analyse81.py: a sentence's citations, else the readings of its codebook's addendum);
- step 3's nine losses of control, coded the same way, beside the Atelier's code;
- since state 2 (2026-11-19): the Field's check 82, i.e. the final codes of every source after the blind second
  reading and its adjudication, whether each source holds the result each sentence cites it for (holds, partly,
  not found, not checkable), the groups of the sentences that cite each source (capability, control, general,
  safeguards), and the Atelier's reading of how the behaviour each of the six repeatable tests on control
  measures was brought about (trained, told, asked).

The build stops unless every count it draws equals the Field's own results80.json, results81.json and
results82.json, and the Atelier's six refs equal the Field's twelve repeatable tests that hold, under control.
"""
import hashlib
import json
import os
import subprocess
import sys
from collections import Counter

FIELD, ATELIER = sys.argv[1], sys.argv[2]
# state 1 read e7148b9c; the files of studies 80 and 81 are byte-identical at the check's commit (their pins below
# are the same), so state 2 reads everything at the check's commit
COMMIT = 'f1ecc54525c20e795761ef8458ccba1e413cb995'
P = 'artifacts/cycle-016/what-a-test-can-show/'
A_COMMIT = 'cc7cd1b8e4d4532e3de8ef225a954175b64df01f'
A_P = 'artifacts/cycle-016/marked-incorrect/'
HERE = os.path.dirname(os.path.abspath(__file__))
PINS = {}
STATE1_PINS = {
    'sentences80.json': '4d1997e10f444c937ae6d6d6ec38d9deb3ac13cc2f1b2347caec42b6e2e9de6f',
    'coding80.json': 'a319f086bd4e8526356c0881714ec92ce8c1870c3be4de934ce0b6f8fa3f4ee8',
    'coding81.json': '4dd6158c2a09f29939ccebe8d7823dcc26e49ce8490a780bef1dce8e167028b2',
    'results80.json': 'c15d28ef1755b4a44bdd61cebbcc6e10ec05eb14fd8f22b75410a26e2949cef8',
    'results81.json': '267a14e457474d17bae581069878ea079143d65469d2a9d24682b90fdd1ea1cc',
}


def show(repo, commit, path, pin):
    b = subprocess.run(['git', '-C', repo, 'show', f'{commit}:{path}'], capture_output=True, check=True).stdout
    PINS[pin] = hashlib.sha256(b).hexdigest()
    return b.decode('utf-8')


def field(name):
    return json.loads(show(FIELD, COMMIT, P + name, name))


def field_js(name):
    t = show(FIELD, COMMIT, P + name, name)
    return json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))


S80 = field('sentences80.json')
C80 = {r['id']: r for r in field('coding80.json')['rows']}
K81 = field('coding81.json')
R80 = field('results80.json')
R81 = field('results81.json')
D81 = field_js('data81.js')
D82 = field_js('data82.js')
R82 = field('results82.json')
for k, v in STATE1_PINS.items():
    assert PINS[k] == v, f'{k} changed since state 1'
CW = json.loads(show(ATELIER, A_COMMIT, A_P + 'check/can_would.json', 'atelier:check/can_would.json'))

sentences = S80['sentences']
assert len(sentences) == R80['body_sentences'] == 2323

# ---- the sentence classes: 0 not on evaluation, 1 inferred, 2 open, 3 measured
GRADE = {'inferred': 1, 'open': 2, 'measured': 3}
cls = {}
for s in sentences:
    r = C80.get(s['id'])
    cls[s['id']] = GRADE[r['grade']] if (r and r['about']) else 0
cnt = Counter(cls.values())
assert cnt[1] == R80['grade']['inferred'] and cnt[2] == R80['grade']['open'] and cnt[3] == R80['grade']['measured']
assert cnt[1] + cnt[2] + cnt[3] == R80['on_evaluation'] == 201

# pages 14 to 146; two of them (43, 104) hold no body sentence in the Field's extraction
first, last = 14, 146
pages = []
for p in range(first, last + 1):
    pages.append([[s['id'], cls[s['id']]] for s in sentences if s['page'] == p])
assert sum(len(p) for p in pages) == 2323
empty_pages = [first + i for i, p in enumerate(pages) if not p]
# the chapter a page opens in: the part of the section number before the first dot, of its first sentence
chap = []
for p in range(first, last + 1):
    sec = next((s['section'] for s in sentences if s['page'] == p), None)
    chap.append(sec.split('.')[0].split(' ')[0] if sec else None)

# ---- the sentences on evaluation: text, section, page, what their test is for, pass mark
ev = {}
for s in sentences:
    r = C80.get(s['id'])
    if r and r['about']:
        ev[s['id']] = {'p': s['page'], 'sec': s['section'], 't': s['text'], 'g': r['grade'], 'tests': r['tests'],
                       'pass': r.get('setter') if r.get('pass') else None}
assert sum(1 for v in ev.values() if v['pass']) == R80['pass_marks']['n'] == 8
assert sorted(i for i, v in ev.items() if v['pass']) == R80['pass_marks']['ids']
assert dict(Counter(v['pass'] for v in ev.values() if v['pass'])) == R80['pass_marks']['setters']

# ---- the measured sentences and their sources, by the Field's rule (analyse81.py)
SRC = {s['ref']: s for s in K81['sources']}
READ = {int(k): v for k, v in K81['sources_by_reading'].items()}
NONE = set(K81['no_source_named'])
stands = {}
for i, v in ev.items():
    if v['g'] != 'measured':
        continue
    own = [r.rstrip('*') for r in next(s for s in sentences if s['id'] == i)['refs']]
    stands[i] = own if own else (READ.get(i) or [])
    assert own or i in READ or i in NONE, i
assert len(stands) == R81['measured_sentences'] == 41
assert {r for v in stands.values() for r in v} == set(SRC)

srcs = []
for s in K81['sources']:
    srcs.append({
        'ref': s['ref'], 'ind': s['industry'], 'entry': s['entry'], 'url': s.get('url'),
        'test': s['test'], 'runner': s.get('runner'), 'pass': s.get('pass'), 'out': s.get('outside'),
        'what': s.get('what'), 'why_out': s.get('why_outside'), 'quote': s.get('quote'),
        'by': sorted(i for i, v in stands.items() if s['ref'] in v),
    })
tests = [s for s in srcs if s['test'] == 'yes']
assert len(srcs) == R81['sources'] == 58 and len(tests) == R81['test_sources'] == 48
assert dict(Counter(s['out'] for s in tests)) == R81['outside']
assert dict(Counter(s['runner'] for s in tests)) == R81['runner']
assert sorted((s['ref'] for s in tests if s['pass'] != 'none'), key=int) == R81['pass_refs']
assert [s['ref'] for s in srcs if s['test'] == 'unreached'] == R81['unreached']


# a sentence an outsider could check at most: one of its test sources could be rerun (the Field's rule);
# and the stricter reading the Field's critique names: every one of its test sources could be rerun
def outside_of(refs):
    ts = [SRC[r] for r in refs if SRC[r]['test'] == 'yes']
    if not refs:
        return 'no source named'
    if not ts:
        return 'no test in its sources'
    if any(t['outside'] == 'rerunnable' for t in ts):
        return 'rerunnable'
    o = {t['outside'] for t in ts}
    return o.pop() if len(o) == 1 else 'mixed'


sent_out = {i: outside_of(v) for i, v in stands.items()}
assert dict(Counter(sent_out.values())) == R81['sentence_outside']
every = sorted(i for i, v in stands.items()
               if [r for r in v if SRC[r]['test'] == 'yes']
               and all(SRC[r]['outside'] == 'rerunnable' for r in v if SRC[r]['test'] == 'yes'))
for i in stands:
    ev[i]['src'] = stands[i]
    ev[i]['out'] = sent_out[i]

# ---- step 3's nine, as the Field coded them beside the Atelier
nine = [{'aiid': c['aiid'], 'title': c['title'], 'maker': c['maker'], 'url': c['url'], 'setting': c['setting'],
         'out': c['outside'], 'why_out': c['why_outside'], 'atelier_out': c['atelier_outside']}
        for c in K81['nine']]
assert len(nine) == 9 and sum(1 for c in nine if c['out'] == 'rerunnable') == R81['nine']['rerunnable'] == 0

# ---- the first reading, as state 1 drew it: kept for the correction the page states
maker_ran = sum(1 for s in tests if s['runner'] in ('maker', 'maker and others'))
first_reading = {
    'rerunnable': R81['outside']['rerunnable'], 'not_rerunnable': len(tests) - R81['outside']['rerunnable'] - R81['outside']['unstated'],
    'unstated': R81['outside']['unstated'], 'sent_rerunnable': R81['sentence_outside']['rerunnable'], 'sent_every': len(every),
}
assert first_reading['rerunnable'] == 27 and first_reading['sent_rerunnable'] == 19 and first_reading['not_rerunnable'] == 17

# ---- the Field's check 82: final codes, and whether each source holds the result each sentence cites it for
F = {r: v['final'] for r, v in D82['sources'].items()}
assert set(F) == set(SRC)
SEC = {r: v['second'] for r, v in D82['sources'].items()}
HOLD = {}
for pr in D82['pairs']:
    HOLD[(pr['sentence'], pr['ref'])] = pr
pair_n = sum(len(v) for v in stands.values())
assert len(HOLD) == pair_n == R82['study81']['holds']['pairs'] == 79
assert dict(Counter(p['holds'] for p in HOLD.values())) == R82['study81']['holds']['codes']
GRP = {s['ref']: sorted(s['groups']) for s in D81['sources']}
assert set(GRP) == set(SRC)
for s in srcs:
    r = s['ref']
    s['out1'], s['runner1'], s['pass1'] = s['out'], s['runner'], s['pass']
    s['test'], s['runner'], s['pass'], s['out'] = F[r]['test'], F[r].get('runner'), F[r].get('pass'), F[r].get('outside')
    s['holds'] = any(HOLD[(i, r)]['holds'] == 'holds' for i in s['by'])
    s['groups'] = GRP[r]
    s['model_access'] = SEC[r].get('model_access')
    s['today'] = SEC[r].get('available_today')
    s['models'] = SEC[r].get('models')
SRC = {s['ref']: s for s in srcs}
tests = [s for s in srcs if s['test'] == 'yes']
FT = R82['study81']['final_totals']
assert len(tests) == FT['test_sources'] == 48
assert dict(Counter(s['out'] for s in tests)) == FT['outside']
assert dict(Counter(s['runner'] for s in tests)) == FT['runner']
rer = [s for s in tests if s['out'] == 'rerunnable']
rh = [s for s in rer if s['holds']]
assert len(rer) == FT['rerunnable']['k'] == 28
assert sorted((s['ref'] for s in rh), key=int) == FT['rerunnable_and_holds']['refs'] and len(rh) == 12
assert len([s for s in rer if any(HOLD[(i, s['ref'])]['holds'] in ('holds', 'partly') for i in s['by'])]) == FT['rerunnable_and_holds_at_least_partly']['k']
assert sorted((s['ref'] for s in tests if s['pass'] not in (None, 'none')), key=int) == FT['pass_refs']
for g, (k, n_rer, n) in R82['study81']['rerunnable_holds_by_group'].items():
    assert (sum(1 for s in rh if g in s['groups']), sum(1 for s in rer if g in s['groups']), sum(1 for s in tests if g in s['groups'])) == (k, n_rer, n), g

# the sentences: what the Field's check says each rests on
SENT82 = {int(k): v for k, v in D82['sentences'].items()}
assert set(SENT82) == set(stands)
for i in stands:
    hs = {r: HOLD[(i, r)]['holds'] for r in stands[i]}
    assert hs == SENT82[i]['holds'], i
    ev[i]['holds'] = hs
    ev[i]['quote'] = {r: HOLD[(i, r)].get('quote') for r in stands[i]}
    ts = [r for r in stands[i] if SRC[r]['test'] == 'yes']
    ev[i]['paper'] = any(SRC[r]['out'] == 'rerunnable' for r in ts)
    ev[i]['lit'] = any(SRC[r]['out'] == 'rerunnable' and hs[r] == 'holds' for r in ts)
    ev[i]['lit1'] = ev[i]['out'] == 'rerunnable'
    assert ev[i]['paper'] == SENT82[i]['any_rerunnable'] and ev[i]['lit'] == SENT82[i]['held_by_rerunnable'], i
SC = R82['study81']['sentences']
sent_lit = sorted(i for i in stands if ev[i]['lit'])
sent_paper = sorted(i for i in stands if ev[i]['paper'])
assert len(sent_lit) == SC['held_by_rerunnable'] == 10 and len(sent_paper) == SC['any_rerunnable'] == 20
assert sum(1 for i in stands if SENT82[i]['all_rerunnable']) == SC['all_rerunnable']

# ---- the tally: every test by what the sentences that cite it test for (the Field's groups), and the nine
# A test cited under capability and under control (only one: ref 7) stands in both rows, drawn once across them.
def row_of(s):
    g = set(s['groups'])
    if g == {'capability', 'control'}:
        return 'both'
    if g == {'capability'}:
        return 'can'
    if g == {'control'}:
        return 'does'
    assert g <= {'general', 'safeguards'}, s['ref']
    return 'other'


for s in tests:
    s['row'] = row_of(s)
both = [s['ref'] for s in tests if s['row'] == 'both']
assert both == ['7']

# the Atelier's reading of the six repeatable tests that hold under control: how the behaviour was brought about
six = {t['ref']: t for t in CW['tests']}
ctrl_rh = sorted((s['ref'] for s in rh if 'control' in s['groups']), key=int)
assert sorted(six, key=int) == ctrl_rh and len(six) == 6
for s in srcs:
    t = six.get(s['ref'])
    if t:
        s['how'] = t['how']
        s['how_what'] = t['what']
        s['how_also'] = t.get('also')

rows = {}
for key in ('can', 'does', 'other'):
    members = [s for s in tests if s['row'] == key or (s['row'] == 'both' and key in ('can', 'does'))]
    rows[key] = {'n': len(members), 'paper': sum(1 for s in members if s['out'] == 'rerunnable'),
                 'reach': sum(1 for s in members if s['out'] == 'rerunnable' and s['holds'])}
assert (rows['can']['reach'], rows['can']['paper'], rows['can']['n']) == tuple(R82['study81']['rerunnable_holds_by_group']['capability'])
assert (rows['does']['reach'], rows['does']['paper'], rows['does']['n']) == tuple(R82['study81']['rerunnable_holds_by_group']['control'])
assert rows['can']['reach'] + rows['does']['reach'] + rows['other']['reach'] == 12

# ---- step 3's nine, with the second reader's code
for c in nine:
    sc = D82['nine'][str(c['aiid'])]
    c['out2'] = sc['second']
    c['atelier_for'] = sc['atelier_test_for']
assert sum(1 for c in nine if c['out2'] == 'rerunnable') == R82['nine']['rerunnable_second'] == 0

hosted = [s for s in rer if s['model_access'] == 'public product or API']
gone = sorted((s['ref'] for s in hosted if s['today'] == 'no'), key=int)
assert len(hosted) == FT['rerunnable_hosted']['k'] and gone == FT['rerunnable_hosted']['gone_today']

N = {
    'sentences': 2323, 'pages': last - first + 1, 'empty_pages': len(empty_pages),
    'on_evaluation': 201, 'inferred': cnt[1], 'open': cnt[2], 'measured': cnt[3],
    'sources': len(srcs), 'tests': len(tests), 'no_test': len(R81['no_test']), 'unreached': len(R81['unreached']),
    'rerunnable': len(rer), 'holds': len(rh), 'paper_only': len(rer) - len(rh),
    'holds_partly': FT['rerunnable_and_holds_at_least_partly']['k'],
    'holds_lo': FT['rerunnable_and_holds']['ci'][0], 'holds_hi': FT['rerunnable_and_holds']['ci'][1],
    'not_rerunnable': sum(1 for s in tests if s['out'] in ('closed', 'model closed', 'materials closed')),
    'unstated': FT['outside']['unstated'],
    'maker_ran': sum(1 for s in tests if s['runner'] in ('maker', 'maker and others')),
    'pass_tests': len(FT['pass_refs']), 'pass_sentences': R80['pass_marks']['n'],
    'sent_paper': len(sent_paper), 'sent_lit': len(sent_lit), 'sent_dark': cnt[3] - len(sent_lit),
    'no_footing': cnt[1] + cnt[2],
    'nine': len(nine),
    'can_n': rows['can']['n'], 'can_paper': rows['can']['paper'], 'can_reach': rows['can']['reach'],
    'does_n': rows['does']['n'], 'does_paper': rows['does']['paper'], 'does_reach': rows['does']['reach'],
    'other_n': rows['other']['n'], 'other_paper': rows['other']['paper'], 'other_reach': rows['other']['reach'],
    'hosted': len(hosted), 'gone_today': len(gone),
    'kappa_outside': R82['study81']['outside']['kappa'], 'kappa_rerun': R82['study81']['rerunnable_or_not']['kappa'],
    'first_rerunnable': first_reading['rerunnable'], 'first_sent': first_reading['sent_rerunnable'],
}
assert N['not_rerunnable'] + N['unstated'] + N['rerunnable'] == N['tests']
assert N['rerunnable'] == 28 and N['holds'] == 12 and N['sent_lit'] == 10 and N['sent_dark'] == 31

out = {
    'meta': {
        'field_commit': COMMIT, 'field_path': P, 'field_pins': PINS,
        'atelier_commit': A_COMMIT, 'atelier_path': A_P,
        'report': R80['report'],
        'first_page': first, 'empty_pages': empty_pages, 'chapter': chap,
        'built_by': 'build.py',
    },
    'N': N,
    'first': first_reading,
    'pages': pages,
    'ev': {str(k): v for k, v in sorted(ev.items())},
    'sources': srcs,
    'every': every,
    'nine': nine,
}
with open(os.path.join(HERE, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.SR=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(N, indent=1))
print(json.dumps(PINS, indent=1))
