"""Supplied, session 4 — the test the model is set.

Both papers that build and use the open corpus of session 2 state how a restoration model is tested:
a stretch of letters is cut out of the text the corpus gives as surviving, and the model is asked to
put it back. Cullhed 2024 (arXiv:2409.13870v3, §2): masks of 3–20 characters "randomly selected" among
"intact characters". Cullhed and Thörn Cleland 2026 (arXiv:2608.07249v1, Limitations): lacunae "sampled
from surviving text, uniformly over L=1–10 characters, following Assael et al. (2022)".

This script asks, of the 532 drawn documents the corpus holds: if such a test gap is cut, how often is
the answer it scores (in part, or whole) a letter the editor wrote out from an abbreviation?

The corpus's rule is taken as session 2 measured it (paths.json): the scribe's sure letters and the
editor's written-out letters are given as surviving (99.5 % and 98.4 % kept); restored, added and
doubtful letters are dashes (98.4 %, 95.7 %, 94.2 % masked); deleted and struck letters are dropped.
So a run of "surviving" text is broken by a dash, by a stated or unstated loss, and by nothing else;
line ends do not break it (the corpus joins lines). Every window of each length is counted exactly,
not sampled; lengths are weighted equally, as both protocols draw them uniformly.

Usage: python3 -I bench.py      reads supplied.json and paths.json here, writes bench.json and bench.js.
"""
import json, os, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))


def norm(ch):
    b = ''.join(c for c in unicodedata.normalize('NFD', ch) if not unicodedata.combining(c)).lower()
    return b if len(b) == 1 and b.isalpha() else None


def runs(doc):
    """The document as the corpus gives it: runs of surviving letters, each letter 's' or 'x'."""
    out, cur = [], []
    for _, toks in doc['L']:
        for k in toks:
            if isinstance(k, str):
                st = k[0]
                if st in 'dp':
                    continue
                if st in 'rou':
                    if cur: out.append(cur); cur = []
                    continue
                for ch in k[1:]:
                    if norm(ch): cur.append(st)
            else:
                if cur: out.append(cur); cur = []
    if cur: out.append(cur)
    return out


def windows(rs, lo, hi):
    per = {}
    for L in range(lo, hi + 1):
        n = anyx = allx = 0
        for r in rs:
            if len(r) < L: continue
            pre = [0]
            for s in r: pre.append(pre[-1] + (s == 'x'))
            for i in range(len(r) - L + 1):
                k = pre[i + L] - pre[i]
                n += 1; anyx += k > 0; allx += k == L
        per[L] = (n, anyx, allx)
    return per


def summarise(docs, lo, hi):
    tot = {L: [0, 0, 0] for L in range(lo, hi + 1)}
    for d in docs:
        for L, v in windows(runs(d), lo, hi).items():
            for j in range(3): tot[L][j] += v[j]
    share_any = sum(t[1] / t[0] for t in tot.values() if t[0]) / len(tot)
    share_all = sum(t[2] / t[0] for t in tot.values() if t[0]) / len(tot)
    return {'lengths': [lo, hi], 'windows': sum(t[0] for t in tot.values()),
            'any_editor': round(share_any, 4), 'all_editor': round(share_all, 4),
            'by_length': {L: {'windows': t[0], 'any_editor': round(t[1] / t[0], 4) if t[0] else None,
                              'all_editor': round(t[2] / t[0], 4) if t[0] else None} for L, t in tot.items()}}


def main():
    sup = json.load(open(os.path.join(HERE, 'supplied.json'), encoding='utf-8'))
    held = {r['id'] for r in json.load(open(os.path.join(HERE, 'paths.json'), encoding='utf-8'))['corpus']['docs']}
    docs = [d for d in sup['docs'] if d['id'] in held]
    letters = sum(len(r) for d in docs for r in runs(d))
    xs = sum(r.count('x') for d in docs for r in runs(d))
    with_x = sum(1 for d in docs if any('x' in r for r in runs(d)))
    res = {'docs': len(docs), 'docs_with_expansions': with_x, 'surviving_letters': letters,
           'of_them_editor': xs, 'editor_share': round(xs / letters, 4),
           'protocol_2026': summarise(docs, 1, 10), 'protocol_2024': summarise(docs, 3, 20),
           'sources': {'2024': 'arXiv:2409.13870v3, section 2 (Method)',
                       '2026': 'arXiv:2608.07249v1, Limitations ("Artificial gaps are not real damage") and section 1 ("Editorial layering")'}}
    for name in ('bench.json', 'bench.js'):
        with open(os.path.join(HERE, name), 'w', encoding='utf-8') as f:
            body = json.dumps(res, ensure_ascii=False, separators=(',', ':'))
            f.write(body if name.endswith('json') else 'window.BENCH=' + body + ';\n')
    print({k: v for k, v in res.items() if not k.startswith('protocol')})
    for p in ('protocol_2026', 'protocol_2024'):
        q = res[p]; print(p, q['windows'], 'any', q['any_editor'], 'all', q['all_editor'])


if __name__ == '__main__':
    main()
