#!/usr/bin/env python3
"""Second pass over the extracted order-list text (session 46).

Session 45's parse answered "who is in the CERTIORARI DENIED section". This pass answers a
different question: *which sentence disposed of them*. The section's 792 entries are not
disposed of alike. The bulk of the list is followed by one sentence — "The petitions for writs
of certiorari are denied." — and AFTER that sentence a further run of entries is printed, each
with its own disposition. This pass splits the section at that sentence and classifies every
individuated disposition.

Usage:  python3 extract.py ol.pdf > ol.txt && python3 dispositions.py   (writes entries.json)

Caveat that travels with the output: the extraction is lossy (mis-decoded punctuation, small-caps
runs split across lines). Verbatim disposition text is whitespace-flattened, never re-worded, and
must be re-checked against the PDF before any of it reaches a work's face.
"""
import re, json, collections

lines = [l.rstrip() for l in open('ol.txt', encoding='utf-8')]
lines = [l for l in lines if not l.startswith('%%% obj')]

SECTIONS = ['ORDERS IN PENDING CASES', 'CERTIORARI DENIED', 'HABEAS CORPUS DENIED',
            'MANDAMUS DENIED', 'REHEARINGS DENIED', 'CERTIORARI GRANTED',
            'ORDERS IN MISCELLANEOUS CASES']
MASS_SENTENCE = 'The petitions for writs of certiorari are denied.'

docket_re = re.compile(r'^\s*(\d{2}[-M]\d{1,5})\s*(?:\)|,)?\s*$')

mass_line = next(i for i, l in enumerate(lines) if MASS_SENTENCE.rstrip('.') in l)

cur_section = 'HEADER'
entries = []      # dicts, in document order
pending = []      # dockets awaiting a caption (grouped entries share one)

for i, raw in enumerate(lines):
    l = raw.strip()
    if not l:
        continue
    hit = None
    for s in SECTIONS:
        if l.startswith(s):
            hit = s
    if hit:
        cur_section = hit
        pending = []
        continue
    m = docket_re.match(l)
    if m:
        pending.append((m.group(1), i))
        continue
    if pending and (' V. ' in l or l.startswith('IN RE') or ' V.' in l):
        cap = re.sub(r'\s+', ' ', l).strip()
        for d, li in pending:
            n = d.split('-')[1] if '-' in d else ''
            entries.append({'section': cur_section, 'docket': d, 'caption': cap,
                            'ifp': (n.isdigit() and int(n) >= 5001) if n else None,
                            'line': li})
        pending = []
        continue

# --- the individuated tail of CERTIORARI DENIED: dockets printed after the mass sentence,
#     each followed by its own prose disposition (grouped dockets share one).
end = next(i for i, l in enumerate(lines) if l.strip().startswith('HABEAS CORPUS DENIED'))
tail, cur = [], None
for l in lines[mass_line + 1:end]:
    s = l.strip()
    if not s:
        continue
    if docket_re.match(s):
        if cur and cur['prose']:
            tail.append(cur)
            cur = None
        if cur is None:
            cur = {'dockets': [s], 'prose': ''}
        else:
            cur['dockets'].append(s)
        continue
    if cur is None:
        continue
    if (' V. ' in s or s.startswith('IN RE')) and not cur['prose']:
        continue                      # caption line, already captured above
    if re.fullmatch(r'\d{1,2}', s):
        continue                      # a printed folio spliced into the middle of a sentence.
        # Session 46: this line is the bug fix, and it is the third time this house has been bitten
        # by the same thing — a phrase broken across a printed line ("repeatedly / 33 / abused")
        # defeats a literal search. Without it this script counted 2 Rule 38(a) filing bars in
        # CERTIORARI DENIED where there are 3 (24-7281, 24-7381, 25-5294).
    cur['prose'] += ' ' + s
if cur:
    tail.append(cur)


def classify(p):
    if 'Rule 39.8' in p:
        return 'rule_39_8_dismissed'
    if 'took no part' in p:
        return 'recusal'
    if 'before judgment' in p:
        return 'before_judgment'
    return 'motion_granted'


disp = {}
for g in tail:
    p = re.sub(r'\s+', ' ', g['prose']).strip()
    for d in g['dockets']:
        disp[d] = (classify(p), p)

for e in entries:
    if e['section'] != 'CERTIORARI DENIED':
        e['disposition'] = None
        e['disposition_text'] = None
        continue
    if e['docket'] in disp and e['line'] > mass_line:
        e['disposition'], e['disposition_text'] = disp[e['docket']]
    else:
        e['disposition'] = 'mass_sentence'
        e['disposition_text'] = MASS_SENTENCE

for e in entries:
    del e['line']

cert = [e for e in entries if e['section'] == 'CERTIORARI DENIED']
counts = collections.Counter(e['disposition'] for e in cert)
print('total entries          :', len(entries))
print('CERTIORARI DENIED      :', len(cert))
print('  disposed by the one sentence:', counts['mass_sentence'])
print('  individuated                :', len(cert) - counts['mass_sentence'])
for k in ('rule_39_8_dismissed', 'recusal', 'before_judgment', 'motion_granted'):
    print('    %-22s: %d' % (k, counts[k]))
print('5000-series (IFP) in section  :', sum(1 for e in cert if e['ifp']))
print('  of those, under the sentence:',
      sum(1 for e in cert if e['ifp'] and e['disposition'] == 'mass_sentence'))
print('future-filing bars (Rule 38(a)):',
      len({e['docket'] for e in cert
           if e['disposition_text'] and 'repeatedly abused' in e['disposition_text']}))

json.dump(entries, open('entries.json', 'w'), indent=0)
