"""Supplied, session 2 — where the marks drop on the paths that bring these texts to readers.

Predictions fixed before looking: PREDICTIONS.md (committed first, 2026-10-24T23:03Z).

Usage: python3 -I paths.py <dir>   where <dir> holds
  papyri_train.jsonl, papyri_test.jsonl   Ericu950/Papyri_1 (Hugging Face, sha 020c4f5, licence "cc"),
                                          a corpus built from the DDbDP and HGV for training language models
  Translations/                           papyri/idp.data at commit 41a1c87, the translations directory
Reads supplied.json (session 1) and writes paths.json and paths.js here.

Path A, the corpus. Each record carries two strings: "Edition_with_brackets" (which, despite its name,
holds no bracket) and "Edition_without_brackets" (the same text with some letters replaced by "-", the
input from which a model is trained to restore). Every letter of a drawn document is aligned to both
strings, and the share of each writer's letters that the corpus keeps, masks or drops is counted.
Path B, the translations. For each drawn document, its English translation in the same open data is read,
and whether any square bracket or gap survives in the English is counted.
"""
import difflib, json, os, re, sys, unicodedata, xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
T = '{http://www.tei-c.org/ns/1.0}'
STATUSES = 'suroxdp'


def norm(ch):
    """A letter as the corpus writes it: no accents, lower case, one sigma; None for a non-letter."""
    b = ''.join(c for c in unicodedata.normalize('NFD', ch) if not unicodedata.combining(c)).lower()
    b = b.replace('ς', 'σ')
    return b if len(b) == 1 and b.isalpha() else None


def our_seq(doc):
    out = []
    for _, toks in doc['L']:
        for k in toks:
            if isinstance(k, str):
                for ch in k[1:]:
                    n = norm(ch)
                    if n: out.append((n, k[0]))
    return out


def corpus_letters(s):
    """Positions of letters and of masks in a corpus string: [(char, index)]."""
    return [(c, i) for i, c in enumerate(s) if c.isalpha() or c == '-']


def path_a(docs, base):
    rows = {}
    for f in ('papyri_train.jsonl', 'papyri_test.jsonl'):
        for line in open(os.path.join(base, f), encoding='utf-8'):
            r = json.loads(line)
            rows.setdefault(r['TM_Number'], []).append(r)
    tally = {s: {'kept': 0, 'masked': 0, 'dropped': 0} for s in STATUSES}
    per_doc, unmatched, weak = [], 0, 0
    ell = {'unknown_gaps_ours': 0, 'ellipses_corpus': 0, 'stated_letters_ours': 0, 'dashes_in_with': 0}
    for d in docs:
        cand = rows.get(d['tm'])
        if not cand:
            unmatched += 1; continue
        seq = our_seq(d)
        mine = ''.join(c for c, _ in seq)
        # where one TM number has several records, take the one whose letters match ours best
        best, br = None, -1
        for r in cand:
            w = ''.join(c for c in r['Edition_with_brackets'] if c.isalpha())
            q = difflib.SequenceMatcher(None, mine, w, autojunk=False).ratio()
            if q > br: best, br = r, q
        if br < 0.8:
            weak += 1; continue
        W, X = best['Edition_with_brackets'], best['Edition_without_brackets']
        wl = [(c, i) for i, c in enumerate(W) if c.isalpha()]
        # with → without, character by character
        masked_at = set()
        for op, a0, a1, b0, b1 in difflib.SequenceMatcher(None, W, X, autojunk=False).get_opcodes():
            if op in ('replace', 'delete'):
                for i in range(a0, a1): masked_at.add(i)
        sm = difflib.SequenceMatcher(None, mine, ''.join(c for c, _ in wl), autojunk=False)
        hit = [None] * len(seq)
        for a, b, n in sm.get_matching_blocks():
            for k in range(n): hit[a + k] = wl[b + k][1]
        c = {s: {'kept': 0, 'masked': 0, 'dropped': 0} for s in STATUSES}
        for (ch, st), pos in zip(seq, hit):
            if pos is None: c[st]['dropped'] += 1
            elif pos in masked_at: c[st]['masked'] += 1
            else: c[st]['kept'] += 1
        for s in STATUSES:
            for k in c[s]: tally[s][k] += c[s][k]
        g = d['gaps']
        ell['unknown_gaps_ours'] += g['lost_unknown'] + g['illeg_unknown'] + g['lost_lines_unknown']
        ell['ellipses_corpus'] += W.count('…')
        ell['stated_letters_ours'] += g['lost_q'] + g['illeg_q']
        ell['dashes_in_with'] += W.count('-')
        per_doc.append({'id': d['id'], 'match': round(br, 3), 'c': c,
                        'with': W[:600], 'without': X[:600]})
    return {'source': 'Ericu950/Papyri_1 on Hugging Face, revision 020c4f516965e34f4e76e9dbf8606ab17133fda8 (2024-09-20), licence stated as "cc"; built from DDbDP and HGV (papyri.info)',
            'records': sum(len(v) for v in rows.values()), 'matched': len(per_doc),
            'not_in_corpus': unmatched, 'weak_match_skipped': weak, 'tally': tally, 'gaps': ell, 'docs': per_doc}


def path_b(docs, base):
    tdir = os.path.join(base, 'Translations')
    by = {}
    files = 0
    for root, _, fs in os.walk(tdir):
        for f in fs:
            if not f.endswith('.xml'): continue
            files += 1
            x = ET.parse(os.path.join(root, f)).getroot()
            hyb = next((i.text for i in x.iter(f'{T}idno') if i.get('type') == 'ddb-hybrid'), None)
            for dv in x.iter(f'{T}div'):
                if dv.get('type') == 'translation' and dv.get('{http://www.w3.org/XML/1998/namespace}lang') == 'en':
                    txt = ''.join(t for e in dv.iter() if e.tag != f'{T}note' for t in (e.text or '', ))
                    txt += ''.join(e.tail or '' for e in dv.iter())
                    gaps = sum(1 for _ in dv.iter(f'{T}gap'))
                    by.setdefault(hyb, []).append({'text': re.sub(r'\s+', ' ', txt).strip(), 'gaps': gaps})
    out = {'files': files, 'drawn': len(docs), 'with_english': 0, 'with_english_and_restored': 0,
           'bracket_in_english': 0, 'gap_or_bracket_in_english': 0, 'expanded_and_english': 0, 'examples': []}
    for d in docs:
        tr = by.get(d['id'])
        if not tr: continue
        out['with_english'] += 1
        if d['c']['r'] == 0:
            out['examples'].append({'id': d['id'], 'restored': 0, 'bracket': '[' in tr[0]['text'], 'en': ' '.join(t['text'] for t in tr)[:500]})
            continue
        out['with_english_and_restored'] += 1
        txt = ' '.join(t['text'] for t in tr)
        br = '[' in txt
        gp = br or any(t['gaps'] for t in tr) or '...' in txt or '…' in txt
        out['bracket_in_english'] += br
        out['gap_or_bracket_in_english'] += gp
        out['examples'].append({'id': d['id'], 'restored': d['c']['r'], 'bracket': br, 'en': txt[:500]})
    return out


def boot(per_doc, num, den, n=2000, seed=20261024):
    """A share summed over documents, with a 95 % interval from resampling documents."""
    import random
    rnd = random.Random(seed)
    def share(ds):
        a = sum(num(d) for d in ds); b = sum(den(d) for d in ds)
        return a / b if b else 0
    xs = sorted(share([rnd.choice(per_doc) for _ in per_doc]) for _ in range(n))
    return [round(share(per_doc), 4), round(xs[int(.025 * n)], 4), round(xs[int(.975 * n) - 1], 4)]


def wilson(k, n, z=1.96):
    if not n: return None
    p = k / n; c = (p + z * z / (2 * n)) / (1 + z * z / n); h = z * ((p * (1 - p) / n + z * z / (4 * n * n)) ** .5) / (1 + z * z / n)
    return [round(p, 4), round(c - h, 4), round(c + h, 4)]


def main():
    base = sys.argv[1]
    sup = json.load(open(os.path.join(HERE, 'supplied.json'), encoding='utf-8'))
    docs = sup['docs']
    a = path_a(docs, base)
    b = path_b(docs, base)
    P = a['docs']
    tot = lambda s: (lambda d: sum(d['c'][s].values()))
    a['ci'] = {'restored_masked': boot(P, lambda d: d['c']['r']['masked'], tot('r')),
               'doubtful_masked': boot(P, lambda d: d['c']['u']['masked'], tot('u')),
               'expanded_kept_as_scribe': boot(P, lambda d: d['c']['x']['kept'], tot('x')),
               'editor_letters_unmasked': boot(P, lambda d: d['c']['x']['kept'] + d['c']['r']['kept'] + d['c']['o']['kept'],
                                               lambda d: tot('x')(d) + tot('r')(d) + tot('o')(d))}
    b['ci_bracket'] = wilson(b['bracket_in_english'], b['with_english_and_restored'])
    res = {'drawn': len(docs), 'corpus': a, 'translations': b,
           'site': {'url': 'https://papyri.info/', 'checked': '2026-10-24T23:03Z',
                    'result': 'every document page answered a scripted reader with a proof-of-work bot challenge (Anubis v1.27.0) instead of the edition; not circumvented'}}
    for name in ('paths.json', 'paths.js'):
        with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
            body = json.dumps(res, ensure_ascii=False, separators=(',', ':'))
            f.write(body if name.endswith('json') else 'window.PATHS=' + body + ';\n')
    t = a['tally']
    print('corpus records', a['records'], 'matched', a['matched'], 'not in corpus', a['not_in_corpus'], 'weak', a['weak_match_skipped'])
    for s in STATUSES:
        n = sum(t[s].values()) or 1
        print(s, sum(t[s].values()), {k: f'{100*v/n:.1f}%' for k, v in t[s].items()})
    print('gaps', a['gaps']); print('ci', a['ci'], b['ci_bracket'])
    print({k: v for k, v in b.items() if k != 'examples'})


if __name__ == '__main__':
    main()
