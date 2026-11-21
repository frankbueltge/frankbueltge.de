#!/usr/bin/env python3
"""Check 87: writes data87.js for the page from results87.json, commits87.json and the census of study 85 as the
Atelier's correction leaves it. Standard library only. Run after scores87.py."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import analyse85 as A  # noqa: E402

J = lambda f: json.load(open(os.path.join(HERE, f), encoding='utf-8'))
res = J('results87.json')
cor = res['correction85']
key = lambda d: (d['rule'], d['practice'], d['commit'], d['path'])
items85 = J('items85.json')
res85 = J('results85.json')
first = J('first87.json')
rules85 = J('rules85.json')
start = {r['rule']: r['start'] for r in rules85 if r['practice'] == 'atelier' and r['rule'] in ('score-lines', 'critique-lines')}
mine = [i for i in items85 if i['practice'] == 'atelier' and i['rule'] in start]
art = {(i['rule'], i['blob']) for i in mine if not i['path'].startswith('presentations/')}
drop = [i for i in mine if (i['path'].startswith('presentations/') and (i['rule'], i['blob']) in art)
        or first[i['path']]['time'] < start[i['rule']]]
assert len(drop) == cor['removed']['bound']
dk = {key(i) for i in drop}
census = A.summarise([i for i in items85 if key(i) not in dk], rules85, res85['unread_blobs'],
                     res85['journal_edits_not_counted'], res85['signatures'])
LABEL = {'journal-words-400': 'Journal entry: at most 400 words', 'score-lines-60': 'Score: at most 60 lines',
         'line-chars-160': 'Line of the proposal: at most 160 characters', 'foundation-4000': 'Foundation files: under 4,000 words'}
PR = {'field': 'Field', 'atelier': 'Atelier', 'studio': 'Studio'}
C = {(c['row'], c['deed']): c for c in J('commits87.json')['deeds']}
ARCH = lambda t: t.replace("Frank's", "the architect's").replace('Frank', 'the architect')
deeds = []
for d in res['deeds']:
    c = C[(d['row'], d['n'])]
    d = dict(d, deed_line=ARCH(d['deed_line']))   # the page names him by his role, as everywhere else on it
    deeds.append({k: d[k] for k in ('row', 'n', 'date', 'log_line', 'kind', 'actor', 'relation', 'seer', 'trace',
                                    'lag_days', 'source', 'found', 'legible', 'signed', 'deed_line')}
                 | {'commits': [[x['repo'], x['hash'][:12]] for x in c['commits']], 'repair': c['repair'],
                    'why': ARCH(c['legible_why'].replace('Frank Bültge', "the architect's name"))})
data = {
    'check': 87, 'session': 285, 'built': '2026-11-20',
    'drop': [[i['rule'], i['practice'], i['commit'][:12], i['path']] for i in drop],
    'census': {k: census[k] for k in ('bound', 'breach', 'by_kind', 'table', 'second_readings', 'p134', 'pairs_bound',
                                      'pairs_breached', 'predictions', 'unread_blobs')},
    'correction': {k: cor[k] for k in ('atelier_marks', 'presentation_copies', 'before_the_rule', 'removed', 'standing',
                                       'census_was')},
    'struck': [{'rule': r, 'practice': p, 'label': LABEL[r], 'practice_label': PR[p], **v}
                for (r, p), v in ((tuple(k.split('/')), v) for k, v in res['partA']['by_rule'].items())],
    'partA': {k: res['partA'][k] for k in ('struck', 'candidates', 'process_record_3000', 'p135', 'foundation_4000')},
    'B': {k: res['partB'][k] for k in ('rows', 'agreement', 'decisions', 'rows_with_deeds', 'deeds', 'kind', 'seer',
                                       'relation', 'seers_all', 'seers_by_kind')},
    'C': res['partC'], 'predictions': res['predictions'], 'deeds': deeds,
    'log': 'https://github.com/frankbueltge/frankbueltge.de/blob/7f92ac31d892470110bb97b8ae10bc1ab164dce0/docs/decision-log.md?plain=1',
}
with open(os.path.join(HERE, 'data87.js'), 'w', encoding='utf-8') as f:
    f.write('/* Check 87, written by build87.py from results87.json, commits87.json and the corrected census. */\n')
    f.write('window.DATA87=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(drop), 'items set aside', len(deeds), 'deeds', os.path.getsize(os.path.join(HERE, 'data87.js')), 'bytes')
