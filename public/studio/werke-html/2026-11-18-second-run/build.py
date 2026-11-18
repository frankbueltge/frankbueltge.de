"""SECOND RUN: build the work's data (cycle 016, step 4 of the programme).

Usage: python3 -I build.py <field-research checkout>

Reads the Field's studies 80 and 81 (*What a Test Can Show*) at a pinned commit with `git show` and writes
data.js. Nothing is coded here and nothing is copied from the report beyond what the Field's own files carry:

- every body sentence of the International AI Safety Report 2026 (2,323, pages 14 to 146), with its page and
  its class: not on evaluation, or on evaluation and graded inferred, open or measured (the Field's coding80);
- the text of the 201 sentences on evaluation (the Field's sentences80, Open Government Licence v3.0);
- the sources behind the 41 measured sentences, each with the Field's codes for test, runner, pass mark and
  whether someone outside the maker could repeat it (coding81), and which sentences stand on which source,
  by the Field's own rule (analyse81.py: a sentence's citations, else the readings of its codebook's addendum);
- step 3's nine losses of control, coded the same way, beside the Atelier's code.

The build stops unless every count it draws equals the Field's own results80.json and results81.json.
"""
import hashlib
import json
import os
import subprocess
import sys
from collections import Counter

FIELD = sys.argv[1]
COMMIT = 'e7148b9cd6e77db041d212f7937ea4197910c4c5'
P = 'artifacts/cycle-016/what-a-test-can-show/'
HERE = os.path.dirname(os.path.abspath(__file__))
PINS = {}


def field(name):
    b = subprocess.run(['git', '-C', FIELD, 'show', f'{COMMIT}:{P}{name}'], capture_output=True, check=True).stdout
    PINS[name] = hashlib.sha256(b).hexdigest()
    return json.loads(b.decode('utf-8'))


S80 = field('sentences80.json')
C80 = {r['id']: r for r in field('coding80.json')['rows']}
K81 = field('coding81.json')
R80 = field('results80.json')
R81 = field('results81.json')

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

maker_ran = sum(1 for s in tests if s['runner'] in ('maker', 'maker and others'))
N = {
    'sentences': 2323, 'pages': last - first + 1, 'empty_pages': len(empty_pages),
    'on_evaluation': 201, 'inferred': cnt[1], 'open': cnt[2], 'measured': cnt[3],
    'sources': len(srcs), 'tests': len(tests), 'no_test': len(R81['no_test']), 'unreached': len(R81['unreached']),
    'rerunnable': R81['outside']['rerunnable'], 'not_rerunnable': len(tests) - R81['outside']['rerunnable'] - R81['outside']['unstated'],
    'unstated': R81['outside']['unstated'],
    'rerun_lo': R81['rerunnable']['ci'][0], 'rerun_hi': R81['rerunnable']['ci'][1],
    'maker_ran': maker_ran, 'third_party': R81['runner']['third party'], 'public_body': R81['runner']['public body'],
    'pass_tests': len(R81['pass_refs']), 'pass_sentences': R80['pass_marks']['n'],
    'pass_developer': R80['pass_marks']['setters']['developer'], 'pass_unstated': R80['pass_marks']['setters']['unstated'],
    'sent_rerunnable': R81['sentence_outside']['rerunnable'], 'sent_every': len(every),
    'sent_dark': cnt[3] - R81['sentence_outside']['rerunnable'],
    'no_footing': cnt[1] + cnt[2],
    'nine': len(nine),
}
assert N['not_rerunnable'] == 17
assert N['rerunnable'] == 27 and N['sent_rerunnable'] == 19

out = {
    'meta': {
        'field_commit': COMMIT, 'field_path': P, 'field_pins': PINS,
        'report': R80['report'],
        'first_page': first, 'empty_pages': empty_pages, 'chapter': chap,
        'built_by': 'build.py',
    },
    'N': N,
    'pages': pages,
    'ev': {str(k): v for k, v in sorted(ev.items())},
    'sources': srcs,
    'every': every,
    'nine': nine,
}
with open(os.path.join(HERE, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.SR=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(N, indent=1))
