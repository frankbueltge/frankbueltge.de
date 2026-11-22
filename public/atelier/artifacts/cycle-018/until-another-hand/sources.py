#!/usr/bin/env python3
"""Until Another Hand: the passages the page quotes, checked against the texts as fetched, and the Field's clocks.

Run from this folder:  python3 sources.py <download dir> <dir of bare clones>
  <download dir>/pk/cscw92.pdf  Prakash and Knister, "Undoing Actions in Collaborative Work", CSCW '92, pp. 273-280,
                                 https://web.eecs.umich.edu/~aprakash/papers/prakash-knister-cscw92.pdf (fetched 2026-11-22)
  <download dir>/ax/ws.pdf      Waghmare and Sufi, arXiv:2611.22075v1 (2026-11-17)
  <download dir>/ax/abs.xml     the arXiv API's record of 2607.27773 and 2611.22075 (abstracts); on 2026-11-22, session 2,
                                 the API answered 503 and 429, and the abstract page arxiv.org/abs/2607.27773v2 was read
  <download dir>/ww/ww.pdf      Woo and Walsh, "On the shoulders of fallen giants", Quantitative Science Studies 5(1),
                                 2024, https://doi.org/10.1162/qss_a_00303, open-access copy fetched 2026-11-22 from
                                 https://re.public.polimi.it/retrieve/f85a6ad4-5340-4258-ba0f-ccba54cfad60/Woo%26Walsh24FallenGiantsQSS.pdf
The source texts are not committed; their hashes and the quoted passages are (sources.json). A passage counts as
found when it stands in the text once whitespace and line-end hyphens are removed, so a quotation cannot drift from
its source. Also writes data/clocks.json and data/clocks.js: the signals of the Field's study 90 (field-research
b6fd73a, signals90.json) that an event sets off and that carry a deadline or a call for speed.
"""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DL, CLONES = sys.argv[1], sys.argv[2]
FIELD_AT = 'b6fd73a4b4b86b09ab4809957b0dae5758ed440e'
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def squash(t):
    t = t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    t = re.sub(r'-\s*\n\s*', '', t)
    return re.sub(r'\s+', '', t)


def pdf_text(path, mode):
    return subprocess.run(['pdftotext', mode, path, '-'], capture_output=True).stdout.decode('utf-8', 'replace')


PK = os.path.join(DL, 'pk', 'cscw92.pdf')
WS = os.path.join(DL, 'ax', 'ws.pdf')
WW = os.path.join(DL, 'ww', 'ww.pdf')
ABS = open(os.path.join(DL, 'ax', 'abs.xml'), encoding='utf-8').read()
pk_text = squash(pdf_text(PK, '-raw'))
ws_text = squash(pdf_text(WS, '-raw'))
ww_text = squash(pdf_text(WW, '-raw'))

SOURCES = [
    {'id': 'pk', 'cite': 'A. Prakash and M. J. Knister, "Undoing Actions in Collaborative Work", Proceedings of CSCW '
                         '92 (ACM, November 1992), pp. 273-280',
     'url': 'https://web.eecs.umich.edu/~aprakash/papers/prakash-knister-cscw92.pdf', 'sha256': sha(PK),
     'read': 'in full, 2026-11-22, the reach outside of cycle 018 (computer-supported cooperative work); a scan, read '
             'through its text layer', 'text': pk_text,
     'passages': [
         ('5.2.1', 'an operation cannot be undone if it conflicts with a later operation, unless the later operation '
                   'is undone first'),
         ('5.2.1', 'A conflict between two adjacent operations A and B implies that the second operation, B depends '
                   'on A and is not meaningful without having performed A.'),
         ('5.2.2', "B' is the operation that would have been done to the document instead of B if operation A had "
                   "not been done before B."),
         ('4', 'user A may not be aware that operations B2 and B3 have been carried out on the document by other '
               'users'),
         ('4', 'upon an undo, the inverse of an operation is appended at the end of the history list'),
         ('6.2', 'placing a pointer into the history list that links an operation to its corresponding undo '
                 'operation'),
         ('7.1', 'the interface can inform the user of the problem and show whose work must be undone'),
     ]},
    {'id': 'ws', 'cite': 'D. Waghmare and S. Sufi, "Can You Undo It? Reversibility Classes for AI Agent Actions", '
                         'arXiv:2611.22075v1 (17 November 2026)',
     'url': 'https://arxiv.org/abs/2611.22075', 'sha256': sha(WS), 'read': 'abstract and section 6, 2026-11-22',
     'text': ws_text,
     'passages': [
         ('abstract', 'permission to call a tool does not establish whether a mistake can be undone'),
         ('abstract', 'recovery depends on captured state, later changes, editor storage and recovery route'),
         ('6', 'Restoring the starting bytes and preserving later legitimate work are different endpoints.'),
     ]},
    {'id': 'su', 'cite': 'Y. Su, W. Xu, C. Zuo and E. Bertino, "ChronoMem: Version Control and Semantic Rollback for '
                         'Large Language Model Agent Memory", arXiv:2607.27773v2 (2026)',
     'url': 'https://arxiv.org/abs/2607.27773', 'sha256': None, 'read': 'abstract, from the arXiv API, 2026-11-22',
     'text': squash(re.sub('<[^>]+>', ' ', ABS)),
     'passages': [
         ('abstract', 'tests whether an agent can behave counterfactually after rollback by answering queries and '
                      'summarizing history as if future updates had never occurred'),
     ]},
    {'id': 'ww', 'cite': 'S. Woo and J. P. Walsh, "On the shoulders of fallen giants: What do references to retracted '
                         'research tell us about citation behaviors?", Quantitative Science Studies 5(1) (2024), 1-30',
     'url': 'https://doi.org/10.1162/qss_a_00303', 'sha256': sha(WW),
     'read': 'sections 3 and 6.2, 2026-11-22, session 2 (open-access copy of the published article)', 'text': ww_text,
     'passages': [
         ('3', 'retracted articles often continue to be cited as if they were legitimate scientific findings'),
         ('3', 'such a citation should at minimum include a caveat'),
         ('6.2', 'many journals and indexing databases, such as PubMed and Web of Science, fail to display retraction '
                 'notices'),
         ('6.2', 'this intervention rests on a strong, and likely fallacious, assumption'),
     ]},
]
out = []
for s in SOURCES:
    ps = []
    for where, p in s['passages']:
        found = squash(p) in s['text']
        ok(found, f"{s['id']} {where}: {p[:60]}")
        ps.append({'where': where, 'text': p})
    out.append({k: s[k] for k in ('id', 'cite', 'url', 'sha256', 'read')} | {'passages': ps})

# ---------------------------------------------------------------- the clocks the Field coded (study 90)
p = subprocess.run(['git', '--git-dir', os.path.join(CLONES, 'field-research.git'), 'show',
                    f'{FIELD_AT}:artifacts/cycle-018/told-in-time/signals90.json'], capture_output=True, check=True)
S = json.loads(p.stdout)
sig = S['signals']
ok(len(sig) == 51, f'the Field codes 51 signals ({len(sig)})')
names = {i['id']: i['short'] for i in S['instruments']}
WORDS = {'CA4': 'within 15 days of discovering', 'NY4': 'from a determination that a critical safety incident has occurred',
         'COP3': 'establish or suspect with reasonable likelihood', 'EU4': 'without undue delay', 'PC3': 'timely'}
clocks = []
for s in sig:
    if s['trigger'] in ('event short of harm', 'harm') and s['deadline_h'] is not None:
        w = WORDS.get(s['id'])
        if w:
            ok(w in s['quote'], f"{s['id']}: its clock words stand in the Field's quote")
        clocks.append({'id': s['id'], 'instrument': names[s['instrument']], 'ref': s['ref'], 'what': s['what'],
                       'quote': s['quote'], 'words': w, 'clock': s['clock'], 'deadline_h': s['deadline_h'],
                       'deadline_max_h': s['deadline_max_h'], 'receiver': s['receiver_name'], 'binding': s['binding'],
                       'public': s['public'], 'note': s['note']})
by_clock = {}
for s in sig:
    by_clock[s['clock']] = by_clock.get(s['clock'], 0) + 1
ok(len(clocks) == 7, f'7 signals set off by an event carry a deadline or a call for speed ({len(clocks)})')
ok(not any(c['clock'] == 'occurrence' for c in clocks), 'no event clock runs from the event itself')
doc = {'field_at': FIELD_AT, 'signals': len(sig), 'by_clock': by_clock, 'clocks': clocks,
       'awareness': sum(c['clock'] == 'awareness' for c in clocks), 'no_start': sum(c['clock'] == 'none' for c in clocks)}
with open(os.path.join(HERE, 'data', 'clocks.json'), 'w') as f:
    json.dump(doc, f, indent=1, ensure_ascii=False)
with open(os.path.join(HERE, 'data', 'clocks.js'), 'w') as f:
    f.write('window.CLOCKS = ' + json.dumps(doc, ensure_ascii=False) + ';\n')
with open(os.path.join(HERE, 'sources.json'), 'w') as f:
    json.dump(out, f, indent=1, ensure_ascii=False)
with open(os.path.join(HERE, 'data', 'sources.js'), 'w') as f:
    f.write('window.SOURCES = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print(json.dumps(by_clock), doc['awareness'], doc['no_start'])
print('FAILS:', len(fails))
sys.exit(1 if fails else 0)
