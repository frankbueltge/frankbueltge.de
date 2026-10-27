"""Supplied — read every letter of a drawn sample of documentary papyri by who wrote it.

Source: the Duke Databank of Documentary Papyri in EpiDoc XML (papyri/idp.data, CC BY 3.0,
attribution to the respective projects). The 800 files are a seeded draw (seed 20261024) from the
67,980 paths under DDbDP/ at commit 41a1c87; the list is sample.txt.

Usage: python3 supplied.py <path-to-idp.data-checkout>   (writes supplied.json and supplied.js here)

Each letter of an edition gets one status, from the Leiden signs the editors encoded:
  s  the scribe's letter, read without doubt
  u  the scribe's letter, read with doubt (underdot; <unclear>)
  r  restored by the editor where the papyrus is lost ([ ]; <supplied reason="lost">)
  o  added by the editor where the scribe left it out (< >; <supplied reason="omitted">)
  x  an abbreviation the editor wrote out (( ); <ex>)
  d  deleted by the scribe ([[ ]]; <del>)
  p  written by the scribe, struck by the editor ({ }; <surplus>)
Lost or illegible stretches the editor did not fill are gaps, kept with the size the editor stated:
a count, a range, a count marked approximate, or "extent unknown".
Where an edition offers two readings (<choice>, <app>), the scribe's (orig, sic) or the lemma is read.
"""
import json, os, re, sys, unicodedata, xml.etree.ElementTree as ET

T = '{http://www.tei-c.org/ns/1.0}'
HERE = os.path.dirname(os.path.abspath(__file__))
RANK = 'rpoxdus'  # where statuses nest, the more editorial wins (r over u, and so on)
LANGS = {'grc': 'Greek', 'la': 'Latin', 'cop': 'Coptic', 'grc-Latn': 'Greek (Latin script)', 'la-Grek': 'Latin (Greek script)'}


def tag(e):
    return e.tag[len(T):] if e.tag.startswith(T) else e.tag


def merge(a, b):
    return a if RANK.index(a) < RANK.index(b) else b


class Doc:
    def __init__(self):
        self.lines = []  # [n, [token, ...]]; a token is "<status><text>" or a gap dict
        self.newline('')

    def newline(self, n):
        self.lines.append([n, []])

    def text(self, s, st):
        if not s:
            return
        s = re.sub(r'\s+', ' ', unicodedata.normalize('NFC', s))
        toks = self.lines[-1][1]
        if toks and isinstance(toks[-1], str) and toks[-1][0] == st:
            toks[-1] += s
        else:
            toks.append(st + s)

    def gap(self, g):
        self.lines[-1][1].append(g)


def walk(e, st, d):
    t = tag(e)
    if t in ('note', 'figure', 'certainty', 'head') or (t == 'rdg'):
        return tail(e, st, d, None)
    own = st
    if t == 'lb':
        d.newline(e.get('n', ''))
    elif t == 'gap':
        g = {'g': 'i' if e.get('reason') == 'illegible' else ('e' if e.get('reason') == 'ellipsis' else 'l'),
             'u': 'l' if e.get('unit') == 'line' else 'c'}
        if e.get('quantity'):
            g['q'] = int(e.get('quantity'))
            if e.get('precision') == 'low':
                g['ca'] = 1
        elif e.get('atLeast'):
            g['q'] = [int(e.get('atLeast')), int(e.get('atMost'))]
        else:
            g['q'] = None
        d.gap(g)
        return tail(e, st, d, None)
    elif t == 'supplied':
        own = merge(st, 'o' if e.get('reason') == 'omitted' else 'r')
    elif t == 'unclear':
        own = merge(st, 'u')
    elif t == 'ex':
        own = merge(st, 'x')
    elif t == 'del':
        own = merge(st, 'd')
    elif t == 'surplus':
        own = merge(st, 'p')
    elif t == 'g':
        d.text(e.text or '•', own)
        return tail(e, st, d, None)
    if t == 'choice':
        kids = list(e)
        pick = next((k for k in kids if tag(k) in ('orig', 'sic')), kids[0] if kids else None)
        if pick is not None:
            walk_inner(pick, own, d)
        return tail(e, st, d, None)
    if t == 'app':
        lem = next((k for k in e if tag(k) == 'lem'), None)
        if lem is not None:
            walk_inner(lem, own, d)
        return tail(e, st, d, None)
    walk_inner(e, own, d)
    tail(e, st, d, None)


def walk_inner(e, st, d):
    if e.text:
        d.text(e.text, st)
    for k in e:
        walk(k, st, d)


def tail(e, st, d, _):
    if e.tail:
        d.text(e.tail, st)


def letters(s):
    return sum(1 for ch in s if ch.isalpha())


def read(path):
    root = ET.parse(path).getroot()
    body = root.find(f'{T}text/{T}body')
    ed = next((x for x in body.iter(f'{T}div') if x.get('type') == 'edition'), None)
    if ed is None:
        return None
    d = Doc()
    for ab in ed.iter(f'{T}ab'):
        if d.lines[-1][1]:
            d.newline('')
        walk_inner(ab, 's', d)
    lines = []
    for n, toks in d.lines:
        # trim spaces at line ends, drop empty lines
        while toks and isinstance(toks[0], str) and not toks[0][1:].strip(): toks.pop(0)
        while toks and isinstance(toks[-1], str) and not toks[-1][1:].strip(): toks.pop()
        if toks and isinstance(toks[0], str):
            toks[0] = toks[0][0] + toks[0][1:].lstrip()
        if toks and isinstance(toks[-1], str):
            toks[-1] = toks[-1][0] + toks[-1][1:].rstrip()
        if toks:
            lines.append([n, toks])
    c = dict.fromkeys('suroxdp', 0)
    gaps = {'lost_q': 0, 'lost_ca': 0, 'lost_range': 0, 'lost_unknown': 0, 'lost_lines_q': 0, 'lost_lines_unknown': 0,
            'illeg_q': 0, 'illeg_unknown': 0, 'n_lost_measured': 0}
    for _, toks in lines:
        for k in toks:
            if isinstance(k, str):
                c[k[0]] += letters(k[1:])
            elif k['g'] == 'l':
                q = k['q']
                if k['u'] == 'l':
                    if q is None: gaps['lost_lines_unknown'] += 1
                    else: gaps['lost_lines_q'] += q if isinstance(q, int) else q[0]
                elif q is None:
                    gaps['lost_unknown'] += 1
                else:
                    gaps['n_lost_measured'] += 1
                    if isinstance(q, list):
                        gaps['lost_range'] += 1; gaps['lost_q'] += q[0]
                    else:
                        gaps['lost_q'] += q
                        if k.get('ca'): gaps['lost_ca'] += 1
            elif k['g'] == 'i' and k['u'] == 'c':
                q = k['q']
                if q is None: gaps['illeg_unknown'] += 1
                else: gaps['illeg_q'] += q if isinstance(q, int) else q[0]
    head = body.find(f'{T}head')
    title, year = None, None
    if head is not None:
        r = head.find(f'{T}ref')
        if r is not None:
            title = (r.findtext(f'{T}title') or '').strip()
            year = (r.findtext(f'{T}date') or '').strip()
    if not title:
        title = next((x.text for x in root.iter(f'{T}title') if x.text and ' ' in x.text), os.path.basename(path))
    tm = next((x.text for x in root.iter(f'{T}idno') if x.get('type') == 'TM'), None)
    hyb = next((x.text for x in root.iter(f'{T}idno') if x.get('type') == 'ddb-hybrid'), None)
    lang = ed.get('{http://www.w3.org/XML/1998/namespace}lang', '')
    return {'id': hyb, 'title': title, 'tm': tm, 'year': year, 'lang': lang, 'c': c, 'gaps': gaps, 'L': lines}


def main():
    base = sys.argv[1]
    paths = [l.strip() for l in open(os.path.join(HERE, 'sample.txt')) if l.strip()]
    docs, skipped = [], {'no_edition': 0, 'under_20_letters': 0}
    for p in paths:
        r = read(os.path.join(base, p))
        if r is None:
            skipped['no_edition'] += 1; continue
        if sum(r['c'].values()) < 20:
            skipped['under_20_letters'] += 1; continue
        r['path'] = p
        docs.append(r)
    tot = dict.fromkeys('suroxdp', 0)
    gt = {}
    for r in docs:
        for k, v in r['c'].items(): tot[k] += v
        for k, v in r['gaps'].items(): gt[k] = gt.get(k, 0) + v
    langs = {}
    for r in docs: langs[r['lang']] = langs.get(r['lang'], 0) + 1
    out = {
        'source': 'Duke Databank of Documentary Papyri, EpiDoc XML, papyri/idp.data at commit 41a1c87fe2a2d0be7744aaf451143de0d87c4269; CC BY 3.0, attribution to the respective projects (papyri.info)',
        'draw': {'population': 67980, 'drawn': len(paths), 'seed': 20261024, 'kept': len(docs), 'skipped': skipped},
        'letters': tot, 'gaps': gt, 'langs': langs, 'docs': docs}
    with open(os.path.join(HERE, 'supplied.json'), 'w') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(HERE, 'supplied.js'), 'w') as f:
        f.write('window.SUPPLIED=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    allL = sum(tot.values())
    print('kept', len(docs), 'skipped', skipped, 'langs', langs)
    print('letters', allL, {k: f'{v} ({100*v/allL:.1f}%)' for k, v in tot.items()})
    print('gaps', gt)


if __name__ == '__main__':
    main()
