"""Marked Incorrect — build of the second state (the Atelier, cycle 016, step 4 of the programme).

Usage: python3 -I build_two.py <folder of the Field's study 80 files> <folder of fetched pages>

The first folder holds coding80.json and sentences80.json from the Field's repository at commit
bfe22dab487c6c2959e56807b339c60f801ecd7c (artifacts/cycle-016/what-a-test-can-show/); their sha256 is asserted.
The second folder holds the makers' pages as fetched on 2026-11-18 (not committed, as for build.py); only the short
phrases this state quotes are asserted in them, since the second maker's pages are served with changing markup.

Reads marked.json (the first state, written by build.py) and second_codes.json (this practice's second reading), and
writes second.js (window.SECOND) and second.json: per case the three new codes, the hours at which the maker's record
and the public record first hold each deed, and the report's 22 sentences on control with the Field's grade and this
practice's reading. Every count the page states is computed here and asserted at the end.
"""
import hashlib, html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FIELD_SHA = {
    'coding80.json': 'a319f086bd4e8526356c0881714ec92ce8c1870c3be4de934ce0b6f8fa3f4ee8',
    'sentences80.json': '4d1997e10f444c937ae6d6d6ec38d9deb3ac13cc2f1b2347caec42b6e2e9de6f',
}
fdir, pdir = sys.argv[1], sys.argv[2]
for f, h in FIELD_SHA.items():
    assert hashlib.sha256(open(os.path.join(fdir, f), 'rb').read()).hexdigest() == h, f + ' differs from study 80'


def text(path):
    s = open(path, encoding='utf-8', errors='replace').read()
    s = re.sub(r'<(script|style|svg|noscript)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s))


# the phrases the page quotes, each asserted in the page it comes from
QUOTES = {
    'b-july30.html': ['Situational awareness is one factor that allows the model to make aligned decisions',
                      'holding a false belief about whether the environment was real',
                      'arguably reasonably'],
    'b-assessment.html': ['Claude was told it was operating in a simulation without internet access',
                          'its next step would work whether the environment was real or simulated'],
    'using-peers-work-to-gain-unauthorized-access-to-openai-research-infrastructure.html':
        ['on the assumption that the environment was simulated', 'observed that the grader was automated'],
    'covert-underperformance-on-safety-research-tasks.html': ['paired safety-capability tasks'],
    'an-agent-used-dns-to-reach-an-external-chatbot.html': ['downloaded BrowseComp', 'access benchmark answers'],
}
for f, qs in QUOTES.items():
    t = text(os.path.join(pdir, f))
    for q in qs:
        assert q in t, (f, q)

M = json.load(open(os.path.join(HERE, 'marked.json')))
K = json.load(open(os.path.join(HERE, 'second_codes.json')))
cases = M['cases']
ids = [c['id'] for c in cases]
assert sorted(ids) == sorted(K['cases']), 'second reading does not cover the same 34 cases'

rows = []
for c in cases:
    k = K['cases'][c['id']]
    assert k['test_for'] in K['codebook']['test_for'], k
    assert k['toward_reader'] in (None, 'grader', 'check', 'monitor', 'answers'), k
    rows.append({'id': c['id'], 'test_for': k['test_for'], 'toward_reader': k['toward_reader'],
                 'world_as_test': k['world_as_test'], 'note': k['note'],
                 'lag_seen': c.get('lag_seen'), 'seen_by': bool(c.get('seen_by')), 'lag_posted': c.get('lag_posted')})

count = lambda f: sum(1 for r in rows if f(r))
test_for = {}
for r in rows:
    test_for[r['test_for']] = test_for.get(r['test_for'], 0) + 1
toward = {}
for r in rows:
    if r['toward_reader']:
        toward[r['toward_reader']] = toward.get(r['toward_reader'], 0) + 1

# --- the hour of reading: when each record first holds the deed ----------------------------------------------
seen = sorted(r['lag_seen'] for r in rows if r['lag_seen'] is not None)
# the first maker's own reports only (not its notices, nor the two cases of its incident page): the casebook's 25
own = lambda r: not r['id'].startswith(('B-', 'N-', 'P-'))
posted = sorted(r['lag_posted'] for r in rows if r['lag_posted'] is not None and own(r))
dark = lambda lags, h: sum(1 for x in lags if x > h)
med = lambda xs: (xs[len(xs) // 2] if len(xs) % 2 else (xs[len(xs) // 2 - 1] + xs[len(xs) // 2]) / 2)
hour = {'seen': seen, 'posted': posted, 'seen_n': len(seen), 'posted_n': len(posted),
        'seen_by_n': count(lambda r: r['lag_seen'] is not None and r['seen_by']),
        'max': max(posted), 'dark_seen_0': dark(seen, 0), 'dark_posted_0': dark(posted, 0),
        'dark_seen_30': dark(seen, 30), 'dark_posted_30': dark(posted, 30),
        'dark_posted_90': dark(posted, 90), 'median_seen': med(seen), 'median_posted': med(posted)}

# --- the report's sentences on control -------------------------------------------------------------------
cod = json.load(open(os.path.join(fdir, 'coding80.json')))['rows']
sen = {s['id']: s for s in json.load(open(os.path.join(fdir, 'sentences80.json')))['sentences']}
about = [r for r in cod if r.get('about')]
ctl = [r for r in about if r['tests'] == 'control']
cap = [r for r in about if r['tests'] == 'capability']
reads = set(K['sentences']['reads_test'])
answers = set(K['sentences']['read_answers'])
assert reads <= {r['id'] for r in ctl}, 'reads_test must be among the control sentences'
assert answers <= {r['id'] for r in cap}, 'read_answers must be among the capability sentences'
sentences = [{'id': r['id'], 'grade': r['grade'], 'page': sen[r['id']]['page'], 'text': sen[r['id']]['text'],
              'reads': r['id'] in reads} for r in ctl]
g = lambda xs, gr: sum(1 for x in xs if x['grade'] == gr)
rt = [s for s in sentences if s['reads']]
measured = [s for s in sentences if s['grade'] == 'measured']
sent = {'control_n': len(ctl), 'capability_n': len(cap), 'control_open': g(ctl, 'open'),
        'capability_open': g(cap, 'open'), 'reads_n': len(rt), 'reads_measured': g(rt, 'measured'),
        'reads_inferred': g(rt, 'inferred'), 'reads_open': g(rt, 'open'), 'measured_n': len(measured),
        'measured_reads': sum(1 for s in measured if s['reads']), 'answers_n': len(answers)}
assert 'capability known as' in sen[1085]['text'] and 'situational awareness' in sen[1085]['text']

res = {'cases': len(rows), 'test_for': test_for, 'control': test_for.get('control', 0),
       'skill': test_for.get('skill', 0), 'work': test_for.get('work', 0),
       'toward': toward, 'toward_n': count(lambda r: r['toward_reader']),
       'world_n': count(lambda r: r['world_as_test']),
       'world_told': count(lambda r: r['world_as_test'] and r['id'].startswith('B-')),
       'hour': hour, 'sent': sent}

# --- assertions: every figure the page states --------------------------------------------------------------
assert res['cases'] == 34 and res['control'] == 1, res['test_for']
# corrected by the check of 2026-11-19 (check/third_reading.json): one case from skill to work, one more toward the answers
assert res['test_for'] == {'work': 5, 'skill': 25, 'control': 1, 'by design': 1, 'not stated': 2}, res['test_for']
assert res['toward_n'] == 8 and toward == {'monitor': 1, 'check': 1, 'answers': 4, 'grader': 2}, toward
assert res['world_n'] == 5 and res['world_told'] == 4, (res['world_n'], res['world_told'])
assert hour['seen_n'] == M['res']['lag_seen_n'] == 23 and hour['posted_n'] == M['res']['lag_posted_n'] == 25, hour
assert hour['dark_seen_0'] == 23 - M['res']['seen_same_day'] == 13 and hour['dark_posted_0'] == 25, hour
assert sent['control_n'] == 22 and sent['capability_n'] == 99 and sent['control_open'] == 5 and sent['capability_open'] == 29, sent
assert sent['reads_n'] == 12 and sent['measured_n'] == 7 and sent['measured_reads'] == 5, sent
assert sent['reads_measured'] + sent['reads_inferred'] + sent['reads_open'] == 12, sent

out = {'res': res, 'rows': rows, 'sentences': sentences,
       'what': 'Marked Incorrect, second state: computed by build_two.py from marked.json, second_codes.json and the '
               "Field's study 80 (coding80.json, sentences80.json at field-research bfe22dab). The sentences are the "
               "International AI Safety Report 2026's, as the Field extracted them; quoted to be read one at a time."}
json.dump(out, open(os.path.join(HERE, 'second.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'second.js'), 'w').write(
    '/* ' + M['canary'] + ' */\nwindow.SECOND=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(res, indent=1))
