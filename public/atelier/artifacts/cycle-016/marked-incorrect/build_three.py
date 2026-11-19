"""Marked Incorrect — build of the check (the Atelier, cycle 016, step 4 of the programme, 2026-11-19).

Usage:
  python3 -I build_three.py sync
      Carries the corrections of the check (codes.json, as corrected on 2026-11-19) into marked.json and marked.js and
      recomputes every count they hold with build.py's own definitions. build.py could not be rerun in this session:
      the first maker's casebook index holds 26 reports since 18 November, so its hash assertion stops it (as it was
      written to), and the incident snapshot could not be fetched here. The rows' titles, dates and lags are kept as
      build.py wrote them on 2026-11-18; only the coded fields are carried over, and each is asserted against codes.json.
      Then run build_two.py as before, which reads marked.json and the corrected second_codes.json.
  python3 -I build_three.py check <the Field's folder artifacts/cycle-016/what-a-test-can-show at field-research f1ecc545>
      Writes check.json and check.js (window.CHECK): the agreement of the blind second reading with the first, the third
      reading's decisions, the corrected figures, the out-of-sample case, the quotations read again, the Field's figures
      with its second reading, and the figure of what a pass leaves out (check/can_would.json). Every count is asserted.
"""
import hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda *p: json.load(open(os.path.join(HERE, *p), encoding='utf-8'))
mode = sys.argv[1]


def count(seq, key):
    out = {}
    for x in seq:
        k = key(x)
        out[k] = out.get(k, 0) + 1
    return out


if mode == 'sync':
    M, C = J('marked.json'), J('codes.json')
    codes = {c['id']: c for c in C['cases']}
    cases = M['cases']
    for c in cases:
        k = codes.get(c['id'])
        if not k:
            assert c['id'].startswith('P-'), c['id']   # the incident page's two cases are coded in build.py
            continue
        for f in ('grade', 'eye', 'missed'):
            c[f] = k[f]
        if k.get('outside_kind'):
            c['outside_kind'] = k['outside_kind']
        if k.get('corrected'):
            c['corrected'] = k['corrected']
    res = M['res']
    own = [c for c in cases if not c.get('notice')]
    graded = [c for c in own if c['grade']['class'] != 'none on record']
    res.update({
        'grade': count(own, lambda c: c['grade']['class']),
        'graded': len(graded),
        'graded_on_answer': sum(c['grade']['class'] in ('credited', 'not credited') for c in graded),
        'graded_on_deed': sum(c['grade']['class'] == 'on the deed' for c in graded),
        'credited': sum(c['grade']['class'] == 'credited' for c in graded),
        'credited_through_deed': sum(bool(c['grade'].get('through')) for c in graded),
        'eye_own': count(own, lambda c: c['eye']['first']),
        'eye_notices': count([c for c in cases if c.get('notice')], lambda c: c['eye']['first']),
        'model_how': count([c for c in own if c['eye']['first'] == 'model'], lambda c: c['eye']['how'] or 'not stated'),
        'missed': [c['id'] for c in cases if c.get('missed')],
        'notice_only': [c['id'] for c in cases if c.get('outside_kind') == 'notice'],
    })
    res['first_by_model'] = res['eye_own'].get('model', 0)
    res['first_by_person'] = res['eye_own'].get('person', 0)
    res['first_by_alarm'] = res['eye_own'].get('alarm', 0)
    res['first_unstated'] = res['eye_own'].get('not stated', 0)
    res['sampled'] = res['model_how'].get('sample', 0)
    res['afterwards'] = res['model_how'].get('afterwards', 0)
    res['checked'] = '2026-11-19'
    T = J('check', 'third_reading.json')['figures']
    for k in ('graded', 'graded_on_answer', 'credited', 'credited_through_deed'):
        assert res[k] == T[k]['now'], (k, res[k])
    assert len(res['missed']) == T['missed']['now'] and res['model_how'].get('live', 0) == T['live']['now'], res
    assert res['graded_on_deed'] == 2 and res['first_by_model'] == 20 and res['first_by_person'] == 5, res
    assert res['eye_notices'] == {'outside': 3} and res['sampled'] == 5 and res['afterwards'] == 8, res
    assert 'trying-to-prompt-inject-the-grader-in-filenames' in res['missed']
    assert 'suppressing-misalignment-monitoring-alerts-and-disabling-misalignment-monitoring' not in res['missed']
    json.dump(M, open(os.path.join(HERE, 'marked.json'), 'w'), indent=1, ensure_ascii=False)
    open(os.path.join(HERE, 'marked.js'), 'w').write(
        '/* ' + M['canary'] + ' */\nwindow.MARKED=' + json.dumps(M, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(json.dumps({k: res[k] for k in ('graded', 'graded_on_answer', 'credited', 'credited_through_deed', 'missed', 'model_how')}, indent=1))
    sys.exit(0)

assert mode == 'check', mode
FIELD_SHA = {}   # filled from check/field_files.json; each file the check reads from the Field is hashed and asserted
fdir = sys.argv[2]
FS = J('check', 'field_files.json')
for f, h in FS['sha256'].items():
    assert hashlib.sha256(open(os.path.join(fdir, f), 'rb').read()).hexdigest() == h, f + ' differs from field-research at ' + FS['commit']
raw = open(os.path.join(fdir, 'data82.js'), encoding='utf-8').read()
d82_sha = FS['sha256']['data82.js']
D82 = json.loads(raw[raw.find('{'):raw.rfind('}') + 1])
assert D82['R']['check'] == 82 and D82['R']['date'] == '2026-11-19', 'not the Field check 82'

M, S, K, C = J('marked.json'), J('second.json'), J('second_codes.json'), J('codes.json')
first_codes = {c['id']: c for c in C['cases']}
TR = J('check', 'third_reading.json')
inv = set(M['res']['investigator'])
CW = J('check', 'can_would.json')

# --- 1. agreement of the blind second reading with the first (first = the codes as they stood before the check) ---
def first_of(cid):
    c = first_codes[cid]
    k = K['cases'][cid]
    was = {x['field']: x['was'] for x in c.get('corrected', [])}
    was2 = {x['field']: x['was'] for x in k.get('corrected', [])}
    grade = was.get('grade', c['grade'])
    eye = was.get('eye', c['eye'])
    return {'grade': grade['class'], 'through': bool(grade.get('through')), 'eye': eye['first'],
            'eye_how': (eye.get('how') or 'not stated') if eye['first'] == 'model' else None,
            'outside': 'investigator' if cid in inv else 'excerpts',
            'missed': bool(was['missed']) if 'missed' in was else bool(c.get('missed')),
            'test_for': was2.get('test_for', k['test_for']),
            'toward': was2['toward_reader'] if 'toward_reader' in was2 else k['toward_reader'],
            'world': bool(k['world_as_test'])}


def second_of(o):
    return {'grade': o['grade'], 'through': bool(o.get('through_the_deed')), 'eye': o['eye'],
            'eye_how': (o.get('eye_how') or 'not stated') if o['eye'] == 'model' else None,
            'outside': o['outside'], 'missed': bool(o.get('missed')), 'test_for': o['test_for'],
            'toward': o.get('toward_reader'), 'world': bool(o.get('world_as_test'))}


mapC = J('check', 'mapC.json')
pairs = []
for f in ('out-A.json', 'out-B.json'):
    for o in J('check', f):
        cid = o['case'].replace('.txt', '')
        if cid in first_codes:
            pairs.append((cid, first_of(cid), second_of(o)))
for o in J('check', 'out-C.json')['cases']:
    pairs.append((mapC[o['case']], first_of(mapC[o['case']]), second_of(o)))
assert len(pairs) == 32 and len({p[0] for p in pairs}) == 32, len(pairs)
assert all((p[1]['outside'] == 'investigator') == (p[0] in inv) for p in pairs), 'investigator rows'


def kappa(xs):
    n = len(xs)
    po = sum(a == b for a, b in xs) / n
    cats = {a for a, _ in xs} | {b for _, b in xs}
    pe = sum((sum(a == k for a, _ in xs) / n) * (sum(b == k for _, b in xs) / n) for k in cats)
    return round((po - pe) / (1 - pe), 2) if pe < 1 else 1.0


NAMES = {'grade': 'what the grader recorded', 'eye': 'who saw the deed first', 'outside': 'what an outsider holds',
         'missed': 'a machine missed it', 'test_for': 'what the run was a test of', 'toward': 'the deed turned to its reader',
         'world': 'the world taken for the test', 'eye_how': 'when the monitor saw it', 'through': 'credit through the deed'}
agree = []
for f in ('grade', 'eye', 'outside', 'missed', 'test_for', 'toward', 'world', 'eye_how', 'through'):
    xs = [(a[f], b[f]) for _, a, b in pairs]
    if f == 'eye_how':
        xs = [(a[f], b[f]) for _, a, b in pairs if a['eye'] == 'model' and b['eye'] == 'model']
    if f == 'through':
        xs = [(a[f], b[f]) for _, a, b in pairs if a['grade'] == 'credited' and b['grade'] == 'credited']
    agree.append({'field': f, 'name': NAMES[f], 'n': len(xs), 'agree': sum(a == b for a, b in xs), 'kappa': kappa(xs)})
dis = []
for cid, a, b in pairs:
    for f in NAMES:
        if f == 'eye_how' and not (a['eye'] == 'model' and b['eye'] == 'model'):
            continue
        if f == 'through' and not (a['grade'] == 'credited' and b['grade'] == 'credited'):
            continue
        if a[f] != b[f]:
            dis.append((cid, f))
F2 = {'toward_reader': 'toward', 'grade': 'grade', 'through the deed': 'through', 'test_for': 'test_for', 'missed': 'missed',
      'eye_how': 'eye_how', 'eye': 'eye', 'outside': 'outside'}
dec = {(d['case'], F2[d['field']]): d for d in TR['decisions']}
assert set(dec) == set(dis), sorted(set(dec) ^ set(dis))
corrected = [d for d in TR['decisions'] if d['decision'] == 'corrected']
kept = [d for d in TR['decisions'] if d['decision'] == 'kept']
assert len(dis) == 17 and len(corrected) == 9 and len(kept) == 8, (len(dis), len(corrected), len(kept))

# --- 2. the sentences: the blind reader against this practice's red dots, and the Field's second reading -------
OD = J('check', 'out-D.json')
reads, answers = set(K['sentences']['reads_test']), set(K['sentences']['read_answers'])
A = [o for o in OD if o['set'] == 'A']
B = [o for o in OD if o['set'] == 'B']
assert len(A) == 22 and len(B) == 99
sent_agree_A = sum((o['id'] in reads) == (o['answer'] == 'yes') for o in A)
sent_agree_B = sum((o['id'] in answers) == (o['answer'] == 'yes') for o in B)
borderline = sorted(o['id'] for o in A if o['answer'] == 'yes' and o.get('doubt'))
measured = {s['id'] for s in S['sentences'] if s['grade'] == 'measured'}
# the Field's blind second reader of study 80: which of the 22 it keeps under control (data82 holds its totals; the
# per-sentence codes stand in check82/second/s80-a.json and s80-b.json)
s80 = {}
for f in ('check82/second/s80-a.json', 'check82/second/s80-b.json'):
    for it in json.load(open(os.path.join(fdir, f)))['items']:
        s80[it['id']] = it
core = sorted(s['id'] for s in S['sentences'] if s80.get(s['id'], {}).get('about') == 'yes' and s80[s['id']].get('tests') == 'control')
core_reads = sorted(set(core) & reads)
core_measured = sorted(i for i in core if s80[i]['grade'] == 'measured')
core_measured_reads = sorted(set(core_measured) & reads)
st = D82['R']['study80']
field = {
    'first': {'control_open': S['res']['sent']['control_open'], 'control_n': S['res']['sent']['control_n'],
              'capability_open': S['res']['sent']['capability_open'], 'capability_n': S['res']['sent']['capability_n']},
    'second': {'control_open': st['second_totals']['open_share']['control'][0], 'control_n': st['second_totals']['open_share']['control'][1],
               'capability_open': st['second_totals']['open_share']['capability'][0], 'capability_n': st['second_totals']['open_share']['capability'][1]},
    'kappa_tests': st['tests']['kappa'], 'kappa_grade': st['grade']['kappa'],
    'core': core, 'core_n': len(core), 'core_reads_n': len(core_reads), 'core_measured_n': len(core_measured),
    'core_measured_reads_n': len(core_measured_reads),
    'rerunnable_and_holds': D82['R']['study81']['final_totals']['rerunnable_and_holds'],
}
assert field['second'] == {'control_open': 5, 'control_n': 19, 'capability_open': 36, 'capability_n': 100}, field['second']
assert field['core_n'] == 19 and field['core_reads_n'] == 11 and field['core_measured_n'] == 6 and field['core_measured_reads_n'] == 5, field
assert sent_agree_A == 22 and sent_agree_B == 99 and borderline == [1084, 1131, 1138, 1146, 1147, 1192], (sent_agree_A, sent_agree_B, borderline)
strict_measured_reads = sorted((measured & reads) - set(borderline))
assert strict_measured_reads == [1144, 1500], strict_measured_reads

# --- 3. what a pass leaves out: the Field's six repeatable tests that hold a control result, and the deeds -----------
fin = D82['R']['study81']['final_totals']['rerunnable_and_holds']['refs']
sens = D82['sentences']
six = sorted({r for sid, v in sens.items() if v['tests'] == 'control' for r in v['sources'] if r in fin}, key=int)
assert six == [t['ref'] for t in CW['tests']], (six, [t['ref'] for t in CW['tests']])
rule = {'toward_reader == grader': lambda k: k['toward_reader'] == 'grader',
        'world_as_test': lambda k: bool(k['world_as_test']),
        'test_for == control': lambda k: k['test_for'] == 'control'}
tests = []
for t in CW['tests']:
    deeds = sorted(cid for cid, k in K['cases'].items() if t['deeds_rule'] and rule[t['deeds_rule']](k))
    tests.append(dict(t, deeds=deeds))
of_kind = sorted({d for t in tests for d in t['deeds']})
untested = sorted(set(K['cases']) - set(of_kind))
hows = count(tests, lambda t: t['how'])
assert hows == {'trained': 1, 'asked': 3, 'told': 2}, hows
assert len(of_kind) == 7 and len(untested) == 27, (of_kind, len(untested))
can_would = {'tests': tests, 'of_kind': of_kind, 'of_kind_n': len(of_kind), 'untested_n': len(untested),
             'hows': hows, 'core_n': sum(t['core'] for t in tests), 'makers_own': CW['the_makers_own'],
             'only_would': [t['ref'] for t in tests if '1226' == t['ref']]}

# --- 4. the out-of-sample case: four predictions written before it was read ---------------------------------------
new = [o for o in J('check', 'out-B.json') if o['case'] == 'new-generating-scripts.txt'][0]
preds = [
    {'n': 'P1', 'says': 'the run was not a test of conduct', 'read': new['test_for'], 'held': new['test_for'] != 'control'},
    {'n': 'P2', 'says': 'no grade responded to the deed', 'read': new['grade'], 'held': new['grade'] != 'on the deed'},
    {'n': 'P3', 'says': 'first seen by a model or a person, not by a test of conduct', 'read': new['eye'], 'held': new['eye'] in ('model', 'person')},
    {'n': 'P4', 'says': 'nothing an outsider can rerun', 'read': new['outside'], 'held': new['outside'] in ('excerpts', 'investigator')},
]
assert all(p['held'] for p in preds)
newcase = {'id': 'generating-scripts-to-copy-outgoing-email-to-an-unauthorized-address', 'posted': '2026-11-18', 'deed': '2026-10-17',
           'url': 'https://alignment.openai.com/misalignment-reports/generating-scripts-to-copy-outgoing-email-to-an-unauthorized-address/',
           'sha256': 'cfbb8da1bd9d04dae6dd9a4b9df3f1eb728fe4de23b3e6d087857cb6557cdbfb', 'predictions': preds, 'held': 4,
           'codes': {k: new[k] for k in ('grade', 'eye', 'eye_how', 'outside', 'test_for', 'toward_reader', 'world_as_test')}}

CANARY = json.load(open(os.path.join(HERE, 'marked.json')))['canary']
out = {
    'canary': CANARY, 'date': '2026-11-19', 'data82_sha256': d82_sha,
    'readers': {'cases': len(pairs), 'not_read': ['P-australia', 'P-images'], 'sentences': len(OD)},
    'agree': agree, 'disagreements': len(dis), 'corrected_n': len(corrected), 'kept_n': len(kept),
    'decisions': TR['decisions'], 'figures': TR['figures'],
    'sentences': {'agree_A': sent_agree_A, 'n_A': 22, 'agree_B': sent_agree_B, 'n_B': 99, 'borderline': borderline,
                  'borderline_n': len(borderline), 'strict_measured_reads': strict_measured_reads,
                  'strict_n': len(strict_measured_reads)},
    'field': field, 'can_would': can_would, 'newcase': newcase,
}
json.dump(out, open(os.path.join(HERE, 'check.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'check.js'), 'w').write('/* ' + CANARY + ' */\nwindow.CHECK=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({k: out[k] for k in ('agree', 'disagreements', 'corrected_n', 'kept_n', 'sentences')}, indent=1))
print(json.dumps({k: field[k] for k in ('second', 'core_n', 'core_reads_n', 'core_measured_n', 'core_measured_reads_n')}))
print(json.dumps({k: can_would[k] for k in ('of_kind', 'untested_n', 'hows')}))
