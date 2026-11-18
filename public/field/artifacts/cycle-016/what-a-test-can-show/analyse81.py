"""Study 81: count the first coding of the sources behind the report's measured sentences, test P120-P122, and
lay step 3's nine losses of control beside the Atelier's coding of the same cases.

Usage: python3 -I analyse81.py
Reads sentences80.json, coding80.json, coding81.json, PREDICTIONS81.md; writes results81.json and data81.js.
Every rule here is CODEBOOK81.md's; nothing is coded here, only counted.
"""
import hashlib
import json
import math
from collections import Counter

S = {s['id']: s for s in json.load(open('sentences80.json'))['sentences']}
C80 = {r['id']: r for r in json.load(open('coding80.json'))['rows']}
K = json.load(open('coding81.json'))
SRC = {s['ref']: s for s in K['sources']}
assert len(SRC) == len(K['sources']), 'each source coded once'

RUNNERS = ['maker', 'maker and others', 'third party', 'public body', 'unstated']
OUTSIDE = ['rerunnable', 'materials closed', 'model closed', 'closed', 'unstated']
for s in K['sources']:
    assert s['test'] in ('yes', 'no', 'unreached'), s['ref']
    if s['test'] == 'yes':
        assert s['runner'] in RUNNERS and s['outside'] in OUTSIDE and s['pass'] in (
            'none', 'maker', 'third party', 'public body'), s['ref']


def wilson(k, n, z=1.96):
    if n == 0:
        return [None, None]
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return [round(100 * (c - h), 1), round(100 * (c + h), 1)]


# --- the measured sentences and their sources (codebook: selection, addendum readings 1-3) ---
measured = [i for i, r in C80.items() if r.get('about') and r['grade'] == 'measured']
assert len(measured) == 41
READ = {int(k): v for k, v in K['sources_by_reading'].items()}  # sentences whose sources the addendum fixed
NONE = set(K['no_source_named'])
sent_src = {}
for i in measured:
    own = [r.rstrip('*') for r in S[i]['refs']]
    if own:
        assert i not in READ and i not in NONE, i
        sent_src[i] = own
    elif i in READ:
        sent_src[i] = READ[i]
    else:
        assert i in NONE, f'sentence {i} has no citation, no reading and is not marked no source named'
        sent_src[i] = []
used = {r for v in sent_src.values() for r in v}
assert used == set(SRC), ('sources and sentences disagree', sorted(used ^ set(SRC)))

# the group of a source: the tests code of every measured sentence that cites it (codebook, predictions)
groups = {r: sorted({C80[i]['tests'] for i, v in sent_src.items() if r in v}) for r in SRC}
tests = [s for s in K['sources'] if s['test'] == 'yes']
T = {s['ref'] for s in tests}


def maker_part(s):
    return s['runner'] in ('maker', 'maker and others')


def share(pred, pool):
    k = sum(1 for s in pool if pred(s))
    return {'k': k, 'n': len(pool), 'share': round(100 * k / len(pool), 1) if pool else None, 'ci': wilson(k, len(pool))}


ctrl = [SRC[r] for r in T if 'control' in groups[r]]
capa = [SRC[r] for r in T if 'capability' in groups[r]]
p120_inf = len(ctrl) >= 5 and len(capa) >= 5
m_ctrl, m_capa = share(maker_part, ctrl), share(maker_part, capa)
p120 = (m_ctrl['share'] - m_capa['share'] >= 20) if p120_inf else None
rer = share(lambda s: s['outside'] == 'rerunnable', tests)
p121 = rer['k'] <= len(tests) / 2
pub = [s['ref'] for s in tests if s['runner'] == 'public body']
p122 = len(pub) == 0


# --- per measured sentence, by the codebook's rule ---
def sent_outside(refs):
    ts = [SRC[r] for r in refs if SRC[r]['test'] == 'yes']
    if not refs:
        return 'no source named'
    if not ts:
        return 'no test in its sources'
    if any(s['outside'] == 'rerunnable' for s in ts):
        return 'rerunnable'
    o = {s['outside'] for s in ts}
    return o.pop() if len(o) == 1 else 'mixed'


def sent_runner(refs):
    ts = [SRC[r] for r in refs if SRC[r]['test'] == 'yes']
    if not refs:
        return 'no source named'
    if not ts:
        return 'no test in its sources'
    rs = {s['runner'] for s in ts}
    if 'public body' in rs:
        return 'public body'
    if rs <= {'maker'}:
        return 'maker'
    if rs & {'maker', 'maker and others'}:
        return 'maker with others'
    return rs.pop() if len(rs) == 1 else 'third party'


rows = []
for i in sorted(measured):
    refs = sent_src[i]
    rows.append({'id': i, 'page': S[i]['page'], 'section': S[i]['section'], 'tests': C80[i]['tests'],
                 'text': S[i]['text'], 'sources': refs, 'how': ('cites' if S[i]['refs'] else
                                                                ('reading' if i in READ else 'none')),
                 'runner': sent_runner(refs), 'outside': sent_outside(refs)})
sent_out = Counter(r['outside'] for r in rows)
sent_run = Counter(r['runner'] for r in rows)
by_tests = {t: dict(Counter(r['outside'] for r in rows if r['tests'] == t)) for t in ('capability', 'control', 'safeguards', 'general')}
by_tests_run = {t: dict(Counter(r['runner'] for r in rows if r['tests'] == t)) for t in ('capability', 'control', 'safeguards', 'general')}

# --- step 3's nine, beside the Atelier ---
nine = K['nine']
assert len(nine) == 9 and len({c['aiid'] for c in nine}) == 9

R = {
    'study': 81, 'session': 279, 'date': '2026-11-18', 'cycle': 16, 'programme_step': 4,
    'predictions_file_sha256': hashlib.sha256(open('PREDICTIONS81.md', 'rb').read()).hexdigest(),
    'codebook_file_sha256': hashlib.sha256(open('CODEBOOK81.md', 'rb').read()).hexdigest(),
    'measured_sentences': len(measured),
    'sentences_how': dict(Counter(r['how'] for r in rows)),
    'sources': len(SRC), 'sources_found_by_reading': sorted(set(SRC) - {r.rstrip('*') for i in measured for r in S[i]['refs']}, key=int),
    'sources_industry': sum(1 for s in K['sources'] if s['industry']),
    'reached': sum(1 for s in K['sources'] if s['test'] != 'unreached'),
    'unreached': [s['ref'] for s in K['sources'] if s['test'] == 'unreached'],
    'test_sources': len(tests), 'no_test': sorted([s['ref'] for s in K['sources'] if s['test'] == 'no'], key=int),
    'runner': dict(Counter(s['runner'] for s in tests)),
    'outside': dict(Counter(s['outside'] for s in tests)),
    'pass': dict(Counter(s['pass'] for s in tests)),
    'pass_refs': sorted([s['ref'] for s in tests if s['pass'] != 'none'], key=int),
    'runner_by_outside': {o: dict(Counter(s['runner'] for s in tests if s['outside'] == o)) for o in OUTSIDE},
    'industry_by_runner': {r: dict(Counter('marked' if s['industry'] else 'unmarked' for s in tests if s['runner'] == r)) for r in RUNNERS},
    'groups': {g: len([r for r in T if g in groups[r]]) for g in ('capability', 'control', 'safeguards', 'general')},
    'maker_part': {'control': m_ctrl, 'capability': m_capa},
    'rerunnable': rer,
    'rerunnable_by_group': {g: share(lambda s: s['outside'] == 'rerunnable', [SRC[r] for r in T if g in groups[r]])
                            for g in ('capability', 'control', 'general')},
    'public_body_refs': pub,
    'sentence_outside': dict(sent_out), 'sentence_runner': dict(sent_run),
    'sentence_outside_by_tests': by_tests, 'sentence_runner_by_tests': by_tests_run,
    'nine': {'outside': dict(Counter(c['outside'] for c in nine)),
             'atelier_outside': dict(Counter(c['atelier_outside'] for c in nine)),
             'setting': dict(Counter(c['setting_class'] for c in nine)),
             'rerunnable': sum(1 for c in nine if c['outside'] == 'rerunnable')},
    'pass_marked': [{'ref': s['ref'], 'pass': s['pass'], 'runner': s['runner'], 'outside': s['outside']}
                    for s in tests if s['pass'] != 'none'],
    'rerunnable_by_runner': {r: share(lambda s: s['outside'] == 'rerunnable', [s for s in tests if s['runner'] == r])
                             for r in RUNNERS if any(s['runner'] == r for s in tests)},
    'framework_table': {'rows': len(K['framework_table']['rows']),
                        'industry_marked': sum(1 for r in K['framework_table']['rows'] if r['industry']),
                        'public_body': K['framework_table']['public_body']},
    'predictions': {'P120': p120, 'P121': p121, 'P122': p122},
}
R['predictions_held'] = sum(1 for v in R['predictions'].values() if v is True)
R['predictions_informative'] = sum(1 for v in R['predictions'].values() if v is not None)
json.dump(R, open('results81.json', 'w'), indent=1)

srcs = []
for s in K['sources']:
    srcs.append({k: s.get(k) for k in ('ref', 'industry', 'entry', 'url', 'test', 'runner', 'pass', 'outside',
                                       'what', 'why_runner', 'why_outside', 'quote', 'note')} |
                {'groups': groups[s['ref']], 'cited_by': sorted(i for i, v in sent_src.items() if s['ref'] in v)})
open('data81.js', 'w').write('window.D81=' + json.dumps({'R': R, 'sources': srcs, 'rows': rows, 'nine': nine},
                                                        ensure_ascii=False) + ';\n')
print(json.dumps({k: R[k] for k in ['sources', 'reached', 'test_sources', 'runner', 'outside', 'pass', 'groups',
                                     'maker_part', 'rerunnable', 'public_body_refs', 'sentence_outside',
                                     'sentence_runner', 'nine', 'predictions']}, indent=1))
