#!/usr/bin/env python3
"""Parse the extracted order-list text into sections and (docket, caption) entries."""
import re, json, sys

lines = [l.rstrip() for l in open('ol.txt', encoding='utf-8')]
lines = [l for l in lines if not l.startswith('%%% obj')]

SECTIONS = ['ORDERS IN PENDING CASES', 'CERTIORARI DENIED', 'HABEAS CORPUS DENIED',
            'MANDAMUS DENIED', 'REHEARINGS DENIED', 'CERTIORARI GRANTED',
            'ORDERS IN MISCELLANEOUS CASES']

docket_re = re.compile(r'^\s*(\d{2}[-M]\d{1,5})\s*(?:\)|,)?\s*$')

cur_section = 'HEADER'
entries = []          # (section, docket, caption)
pending = []          # dockets awaiting a caption (grouped entries)
seen_sections = []

for i, raw in enumerate(lines):
    l = raw.strip()
    if not l:
        continue
    up = l.replace(' ', ' ')
    hit = None
    for s in SECTIONS:
        if up.startswith(s):
            hit = s
    if hit:
        cur_section = hit
        seen_sections.append((hit, i))
        pending = []
        continue
    m = docket_re.match(l)
    if m:
        pending.append(m.group(1))
        continue
    # caption line: uppercase-ish, contains ' V. ' or 'IN RE'
    if pending and (' V. ' in l or l.startswith('IN RE') or ' V.' in l):
        cap = re.sub(r'\s+', ' ', l).strip()
        for d in pending:
            entries.append((cur_section, d, cap))
        pending = []
        continue

by_sec = {}
for s, d, c in entries:
    by_sec.setdefault(s, []).append((d, c))

for s in by_sec:
    print(s, len(by_sec[s]))

cert = by_sec.get('CERTIORARI DENIED', [])
ifp = [e for e in cert if int(e[0].split('-')[1]) >= 5001 and '-' in e[0]]
print('cert denied:', len(cert), 'ifp(5000-series):', len(ifp),
      'pct: %.1f' % (100.0 * len(ifp) / max(1, len(cert))))
json.dump([{'section': s, 'docket': d, 'caption': c} for s, d, c in entries],
          open('entries.json', 'w'), indent=0)
print('sections seen:', [s for s, _ in seen_sections])
