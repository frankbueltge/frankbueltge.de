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

- since state 3 (2026-11-19, the check): the same files read again at the Field's presented commit (they must be
  byte-identical), its study 83 (the seven public instruments the report names, and whether any sets a pass mark),
  what each pass mark applies to (data82's pass_applies_to), which repeatable tests ran on a hosted model no
  longer offered, and whether the Atelier names anyone outside the maker who read the record of each of the nine.

- since state 4 (2026-11-19, the presentation): the Field's check 84 (every model the 28 repeatable tests name, read on
  its maker's own page that day, and the models the result the report cites names), and the Atelier's reading of the
  seven public instruments for where a test ends (its mark.json, fifth state).

The build stops unless every count it draws equals the Field's own results80.json, results81.json,
results82.json and results83.json, and the Atelier's six refs equal the Field's twelve repeatable tests that hold,
under control.
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

# ---- state 3 (2026-11-19, the check): read again at the Field's presented commit, where study 83 stands
COMMIT3 = '1c6fd72b8b86293f88a2f82f4a18dc1a377236a3'
for name in ('sentences80.json', 'coding80.json', 'coding81.json', 'results80.json', 'results81.json', 'data81.js',
             'data82.js', 'results82.json'):
    b = subprocess.run(['git', '-C', FIELD, 'show', f'{COMMIT3}:{P}{name}'], capture_output=True, check=True).stdout
    assert hashlib.sha256(b).hexdigest() == PINS[name], f'{name} changed at the presented commit'
R83 = json.loads(show(FIELD, COMMIT3, P + 'results83.json', 'results83.json'))
S83 = R83['study83']
CT = R83['control_tests']

# the lines: every pass mark behind the report's measured claims is a maker's, and each applies to a capability
CAPABILITY_KINDS = {'biological or chemical', 'cyber', 'autonomy or AI research', 'persuasion'}
pass_refs = sorted((s['ref'] for s in tests if s['pass'] not in (None, 'none')), key=int)
pass_kinds = {r: sorted({k['kind'] for k in D82['sources'][r]['pass_applies_to']}) for r in pass_refs}
assert all(pass_kinds[r] and set(pass_kinds[r]) <= CAPABILITY_KINDS for r in pass_refs), pass_kinds
assert all(SRC[r]['pass'] == 'maker' and SRC[r]['out'] not in ('rerunnable', 'unstated') for r in pass_refs)
for s in srcs:
    if s['ref'] in pass_kinds:
        s['pass_on'] = pass_kinds[s['ref']]
# the public instruments the report names (the Field's study 83): none sets a pass mark on a result
assert S83['instruments'] == 7 and S83['pass_set_by_instrument'] == []
assert sum(S83['totals']['pass_mark'].values()) == 7

# the conduct row: the six reached are the Field's six, and none of the sixteen observed the behaviour untold
assert CT['test_sources'] == rows['does']['n'] and CT['rerunnable_and_holds'] == rows['does']['reach']
assert CT['how'] == dict(Counter(s['how'] for s in srcs if s.get('how'))) and CT['untold'] == 0

# the mood of a second run: a hosted model no longer offered makes it possible once, not now
for s in srcs:
    s['gone'] = s['ref'] in gone
lit_only_gone = sorted(i for i in sent_lit
                       if all(SRC[r]['gone'] for r in stands[i]
                              if SRC[r]['test'] == 'yes' and SRC[r]['out'] == 'rerunnable' and ev[i]['holds'][r] == 'holds'))
for i in stands:
    ev[i]['once'] = i in lit_only_gone

# the nine: a deed is checked through its record. The Atelier's code `investigator` means an organisation outside
# the maker "had or was promised access to the records" (its CODEBOOK.md in marked-incorrect/check). The check of
# 2026-11-19 read the maker's page for the one so coded: it announces an agreement that gives the investigator access
# and says the investigator "will investigate"; no reading by it was found published. So: given, not yet read.
A3_COMMIT = 'a992ea781b85bd6a8866b525a3ab2a783eb0408a'
ACB = show(ATELIER, A3_COMMIT, A_P + 'check/CODEBOOK.md', 'atelier:check/CODEBOOK.md')
assert 'an organisation outside the maker had or was promised access to the records' in ACB
read_out = [c for c in nine if c['atelier_out'] != 'none named']
for c in nine:
    c['reader'] = c['atelier_out'] != 'none named'          # given to an outside investigator
    c['read_published'] = False                              # the check found no published reading (2026-11-19)
CHECK_NINE = {'aiid': 1685, 'page': 'https://www.anthropic.com/research/alignment-assessment-cybersecurity-incidents',
              'read': '2026-11-19', 'says': 'an agreement grants the investigator access; it will investigate'}
assert [c['aiid'] for c in read_out] == [CHECK_NINE['aiid']]

# what models do untold, in the conduct row: the Atelier's critique of the Field's part names the closed sources that
# hold what models did (step-4-critique.md, the Field, point 2), and the Field's paper says what models do unasked
# rests on system cards and studies run with a maker. The Field's own count of untold (results83) is over the six.
CRIT = show(ATELIER, A3_COMMIT, 'artifacts/cycle-016/step-4-critique.md', 'atelier:step-4-critique.md')
assert 'The closed ones (2, 7, 722) hold what models did' in CRIT
PAPER = show(FIELD, COMMIT3, 'presentations/cycle-016/paper.md', 'paper.md')
UNTOLD_SEEN = ['2', '7', '722']
for r in UNTOLD_SEEN:
    assert SRC[r]['test'] == 'yes' and SRC[r]['out'] != 'rerunnable' and 'control' in SRC[r]['groups'], r
for s in srcs:
    s['untold'] = s['ref'] in UNTOLD_SEEN

# the 21 measured claims with nothing beneath that anyone else could run, by what they do stand on
def under(i):
    ts = [SRC[r] for r in stands[i] if SRC[r]['test'] == 'yes']
    if not ts:
        return 'no test'
    if any(t['out'] == 'unstated' for t in ts):
        return 'unstated'
    return 'closed'
for i in stands:
    ev[i]['under'] = None if ev[i]['paper'] else under(i)
UNDER = Counter(ev[i]['under'] for i in stands if not ev[i]['paper'])
assert sum(UNDER.values()) == cnt[3] - len(sent_paper)
HOWS = R81['sentences_how']
assert sum(HOWS.values()) == 41

# ---- state 4 (2026-11-19, the presentation): the date of a second run. The Field's check 84 read every model the
# 28 repeatable tests name on its maker's own page that day, and for the 12 that hold, the models the cited result
# names (models84.json, results84.json). Read at the Field's commit after check 84, where every file read before must
# be byte-identical. The codebook's reading assumes the earliest GPT-4o snapshot where a reading names none; the
# latest is kept beside it.
COMMIT4 = '9d29065201637be51c3209dd582d583dd7677346'
for name in ('sentences80.json', 'coding80.json', 'coding81.json', 'results80.json', 'results81.json', 'data81.js',
             'data82.js', 'results82.json', 'results83.json'):
    b = subprocess.run(['git', '-C', FIELD, 'show', f'{COMMIT4}:{P}{name}'], capture_output=True, check=True).stdout
    assert hashlib.sha256(b).hexdigest() == PINS[name], f'{name} changed at check 84'
R84 = json.loads(show(FIELD, COMMIT4, P + 'results84.json', 'results84.json'))
M84 = json.loads(show(FIELD, COMMIT4, P + 'models84.json', 'models84.json'))
assert PINS['models84.json'] == R84['models84_sha256']
DEC1 = '2026-12-01'
RD, RD2 = R84['readings']['earliest'], R84['readings']['latest']
PT, PT2 = R84['per_test']['earliest'], R84['per_test']['latest']
assert set(PT) == {s['ref'] for s in rer} == set(PT2)
MODELS = M84['models']
CITED = {t['ref']: t['cited'] for t in M84['tests'] if 'cited' in t}
assert set(CITED) == {s['ref'] for s in rh}
SNAP = M84['gpt4o_assumed']['earliest']


def model_row(m):
    m = SNAP if m == 'gpt-4o*' else m
    r = MODELS[m]
    return {'m': m, 'maker': r['maker'], 'st': r['status'], 'date': r.get('date'), 'note': r.get('note')}


def date_codes(s, pt, rd):
    """What a second run of this test could be made on, read on the makers' pages: at 19 November and 1 December.
    A test that holds is read by the models the result the report cites names (the Field's cited code); one that
    holds less, by the models the test names (the Field's test code)."""
    t = pt[s['ref']]
    if s['holds']:
        d1 = t['cited_code']
        d2 = 'can' if s['ref'] in rd['cited_can_after_2026_12_01'] else ('cannot' if d1 == 'can' else d1)
    else:
        d1 = 'cannot' if t['any_retired'] else 'can' if t['code'] == 'all offered' else 'not settled'
        assert d1 != 'can', s['ref']
        d2 = d1
    return d1, d2


for s in srcs:
    s['d1'] = s['d2'] = None
    if s['ref'] not in PT:
        continue
    t = PT[s['ref']]
    s['d1'], s['d2'] = date_codes(s, PT, RD)
    s['d1_latest'], s['d2_latest'] = date_codes(s, PT2, RD2)
    s['m84'] = {'code': t['code'], 'retired': [model_row(m) for m in t['retired']],
                'offered': [model_row(m) for m in t['offered']], 'not_found': t['not_found']}
    if s['holds']:
        s['cited_models'] = [model_row(m) for m in CITED[s['ref']]]
        s['cited_end'] = t['cited_first_end']
# against the Field's own counts
assert len(RD['any_retired']) == 23 and sorted(RD['hosted9_any_retired'], key=int) == sorted((s['ref'] for s in hosted), key=int)
assert dict(Counter(s['d1'] for s in rh)) == RD['cited_codes']
assert sorted((s['ref'] for s in rh if s['d1'] == 'can'), key=int) == RD['cited_can']
assert sorted((s['ref'] for s in rh if s['d2'] == 'can'), key=int) == RD['cited_can_after_2026_12_01']
assert sorted((s['ref'] for s in rh if s['d1_latest'] == 'can'), key=int) == RD2['cited_can']
for s in rh:
    if s['d1'] == 'can':
        assert s['d2'] == 'can' or (s['cited_end'] and s['cited_end'] <= DEC1), s['ref']


# a claim, at a date: a second run could reach it where one test that holds it can be run on the models its
# result names; not settled where none can and one is not settled
def claim_at(i, key):
    hs = [r for r in stands[i] if SRC[r]['test'] == 'yes' and SRC[r]['out'] == 'rerunnable' and ev[i]['holds'][r] == 'holds']
    if not hs:
        return None
    codes = {SRC[r][key] for r in hs}
    return 'can' if 'can' in codes else 'not settled' if 'not settled' in codes else 'cannot'


for i in stands:
    ev[i]['d1'], ev[i]['d2'] = claim_at(i, 'd1'), claim_at(i, 'd2')
    ev[i]['d1_latest'], ev[i]['d2_latest'] = claim_at(i, 'd1_latest'), claim_at(i, 'd2_latest')
D1 = Counter(ev[i]['d1'] for i in sent_lit)
D2 = Counter(ev[i]['d2'] for i in sent_lit)
assert (D1['can'], D1['not settled'], D2['can']) == (2, 1, 1)


def row_at(key, d):
    members = [s for s in tests if s['row'] == key or (s['row'] == 'both' and key in ('can', 'does'))]
    return sum(1 for s in members if s['out'] == 'rerunnable' and s['holds'] and s[d] == 'can')


# the six of conduct the second run reaches, against the Atelier's reading of them with check 84
MK = json.loads(show(ATELIER, 'df4bb551fc6f4d21e89b20fd7e8fda8cb4e6a2ce', A_P + 'mark.json', 'atelier:mark.json'))
six84 = [s for s in rh if 'control' in s['groups']]
assert MK['field']['commit'] == COMMIT4 and MK['field']['results84_sha256'] == PINS['results84.json']
assert MK['six_n'] == {'n': 6, 'retired': sum(1 for s in six84 if PT[s['ref']]['any_retired']),
                       'can_today': sum(1 for s in six84 if s['d1'] == 'can'), 'can_after_dec1': sum(1 for s in six84 if s['d2'] == 'can')}
# the line between test and world: the Atelier read the seven public instruments the report names for the record as
# well as the test (its fifth state); one draws where a test ends, none sets a level on a test's result or a record.
assert len(MK['instruments']) == S83['instruments'] and MK['side']['pass_mark_set'] == 0 and MK['side']['mark_set'] == 0
LINES = [i for i in MK['instruments'] if i.get('line')]
assert MK['side']['line_drawn'] == len(LINES) == 1
LQ = next(q for q in LINES[0]['quotes'] if 'designed to elicit' in q['quote'])
TEST_LINE = {'instrument': LINES[0]['short'], 'name': LINES[0]['name'], 'url': LINES[0]['url'], 'where': LQ['where'],
             'quote': LQ['quote'], 'pass_mark': LINES[0]['pass_mark'], 'mark': LINES[0]['mark'],
             'read': 'the Atelier through a web-extraction service; read again on 2026-11-19 through a second one, '
                     'clause found word for word (the legislature refused a direct request, HTTP 403)'}
assert LQ['where'].endswith('(d)(4)') and LINES[0]['mark'] == 'none'

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
    # state 3, the check
    'sent_stopped': len(sent_paper) - len(sent_lit), 'sent_none': cnt[3] - len(sent_paper),
    'sent_once': len(lit_only_gone), 'gone_holds': sum(1 for s in rh if s['gone']),
    'pass_on_conduct': 0, 'does_untold': CT['untold'],
    'instruments': S83['instruments'], 'instr_set': len(S83['pass_set_by_instrument']),
    'instr_left_dev': S83['totals']['pass_mark']['left to the developer'],
    'instr_power': S83['totals']['pass_mark']['power to set'], 'instr_no_mark': S83['totals']['pass_mark']['none'],
    'nine_given': len(read_out), 'nine_read': sum(1 for c in nine if c['read_published']),
    'under_closed': UNDER['closed'], 'under_unstated': UNDER['unstated'], 'under_no_test': UNDER['no test'],
    'untold_seen': len(UNTOLD_SEEN), 'does_closed': rows['does']['n'] - rows['does']['paper'],
    'candidates': R80['candidates'], 'about_second': R82['study80']['about']['confusion']['yes | yes'],
    'kappa_about': R82['study80']['about']['kappa'],
    'by_cites': HOWS['cites'], 'by_reading': HOWS['reading'], 'by_none': HOWS['none'],
    'legs': pair_n, 'holds_pct': round(100 * len(rh) / len(tests)),
    # state 4, the presentation: the date of a second run (the Field's check 84)
    'retired_tests': len(RD['any_retired']), 'hosted_retired': len(RD['hosted9_any_retired']),
    'struck_d1': sum(1 for s in rer if s['d1'] == 'cannot'), 'struck_d2': sum(1 for s in rer if s['d2'] == 'cannot'),
    'unsettled_d1': sum(1 for s in rer if s['d1'] == 'not settled'),
    'holds_d1': sum(1 for s in rh if s['d1'] == 'can'), 'holds_d2': sum(1 for s in rh if s['d2'] == 'can'),
    'sent_d1': D1['can'], 'sent_d1_unsettled': D1['not settled'], 'sent_d2': D2['can'],
    'sent_d1_latest': sum(1 for i in sent_lit if ev[i]['d1_latest'] == 'can'),
    'sent_d2_latest': sum(1 for i in sent_lit if ev[i]['d2_latest'] == 'can'),
    'can_d1': row_at('can', 'd1'), 'can_d2': row_at('can', 'd2'), 'does_d1': row_at('does', 'd1'),
    'does_d2': row_at('does', 'd2'), 'other_d1': row_at('other', 'd1'), 'other_d2': row_at('other', 'd2'),
    'models_identified': sum(v for k, v in R84['models_named']['by_status'].items() if k != 'not found'),
    'models_retired': R84['models_named']['by_status']['retired'],
    'retired_since_report': len(R84['models_named']['retired_after_feb_2026']),
    'instr_line': len(LINES), 'instr_level': MK['side']['mark_set'],
}
assert N['sent_d1'] == 2 and N['sent_d2'] == 1 and N['sent_d1_latest'] == 3 and N['sent_d2_latest'] == 1
assert N['models_identified'] == 58 and N['models_retired'] == 27 and N['retired_since_report'] == 14
assert N['not_rerunnable'] + N['unstated'] + N['rerunnable'] == N['tests']
assert N['rerunnable'] == 28 and N['holds'] == 12 and N['sent_lit'] == 10 and N['sent_dark'] == 31

out = {
    'meta': {
        'field_commit': COMMIT, 'field_path': P, 'field_pins': PINS,
        'atelier_commit': A_COMMIT, 'atelier_path': A_P, 'field_commit_presented': COMMIT3,
        'atelier_commit_presented': A3_COMMIT, 'check_nine': CHECK_NINE,
        'field_commit_check84': COMMIT4, 'atelier_commit_line': 'df4bb551fc6f4d21e89b20fd7e8fda8cb4e6a2ce',
        'models_read': M84['read'], 'snapshot': M84['gpt4o_assumed'], 'dec1': DEC1, 'test_line': TEST_LINE,
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
