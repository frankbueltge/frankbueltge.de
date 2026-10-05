"""THREE HUNDRED HEAPS — the record.

    python3 analysis.py [path/to/lattice.json]

Reads The Field's lattice of session 172 (2026-09-27) — 300 screens of one hand-over rule over
1,000 medical-trial abstracts — from its published address, checks it by digest, and writes
results.json: for every screen, the pairings it made that agree with the printed percentage
(white rice), that agree with its complement (brown rice) and that disagree (black rice), under
the registered matching arithmetic (round or truncate), and the heap each would make if poured.

The Field's file is read, never copied into this repository (protocol §7). With a path it reads
a local copy, which must carry the same digest.
"""
import hashlib, json, math, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
URL = ('https://raw.githubusercontent.com/frankbueltge/field-research/main/'
       'artifacts/2026-09-27-the-range-of-the-method/data/lattice.json')
SHA256 = '9a654e7692e570597fc2db27d3cd7d79d12e4481215a42827a2e37dcb6b38367'
MATCH = 'round-or-trunc'
KEYS = ['window', 'conn', 'split', 'pairing', 'text']
ORDER = {
    'window': [10, 20, 40, 80, None],
    'conn': ['all+slash', 'no-in', 'no-in-among', 'words-only', 'slash-only'],
    'split': ['.;!?', '.!?', 'newline'],
    'pairing': ['greedy', 'many'],
    'text': ['fetched', 'decoded'],
}
LABEL = {
    'window': {10: '10 characters', 20: '20 characters', 40: '40 characters', 80: '80 characters',
               None: 'the whole sentence'},
    'conn': {'all+slash': 'of, among, in, and k/n', 'no-in': 'of, among, and k/n',
             'no-in-among': 'of and k/n', 'words-only': 'of, among, in, and no k/n',
             'slash-only': 'k/n only'},
    'split': {'.;!?': 'at . ; ! ?', '.!?': 'at . ! ? only', 'newline': 'at line breaks only'},
    'pairing': {'greedy': 'one pair per percentage, once', 'many': 'pairs may be reused'},
    'text': {'fetched': 'as fetched', 'decoded': 'entities decoded'},
}
# The pour. These three constants are assumptions about rice, not data, and are printed as such.
GRAINS_PER_GRAM = 50          # long-grain white rice, order of magnitude
BULK_G_PER_ML = 0.8           # loose-poured
REPOSE_DEG = 32               # angle of repose of a poured heap

def pile(n):
    """A poured cone of n grains: radius and height in millimetres."""
    if n == 0:
        return {'r_mm': 0.0, 'h_mm': 0.0, 'grams': 0.0}
    v_mm3 = n / GRAINS_PER_GRAM / BULK_G_PER_ML * 1000.0
    t = math.tan(math.radians(REPOSE_DEG))
    r = (3 * v_mm3 / (math.pi * t)) ** (1 / 3)
    return {'r_mm': round(r, 2), 'h_mm': round(r * t, 2), 'grams': round(n / GRAINS_PER_GRAM, 2)}

def main():
    if len(sys.argv) > 1:
        raw = open(sys.argv[1], 'rb').read()
    else:
        raw = urllib.request.urlopen(URL, timeout=60).read()
    digest = hashlib.sha256(raw).hexdigest()
    if SHA256 != '__SHA__' and digest != SHA256:
        sys.exit(f'lattice.json digest {digest} is not the one this work was built on ({SHA256})')
    L = json.loads(raw)
    base = {k: L['base'][k] for k in KEYS}
    screens = {tuple(r[k] for k in KEYS): r for r in L['screens']}
    sheets = []
    for f in L['flags']:
        if f['match'] != MATCH:
            continue
        key = tuple(f[k] for k in KEYS)
        s = screens[key]
        w, c, b = f['M']['consistent'], f['M']['complement'], f['M']['inconsistent']
        assert w + c + b == s['M']['recomputable'], key
        sheets.append({
            'rule': {k: f[k] for k in KEYS},
            'index': [ORDER[k].index(f[k]) for k in KEYS],
            'base': all(f[k] == base[k] for k in KEYS),
            'tokens': s['M']['tokens'], 'recomputable': s['M']['recomputable'], 'rate': s['M']['rate'],
            'white': w, 'brown': c, 'black': b,
            'heaps': {'white': pile(w), 'brown': pile(c), 'black': pile(b)},
        })
    sheets.sort(key=lambda r: r['index'])
    assert len(sheets) == 300
    W = [s['white'] for s in sheets]; B = [s['black'] for s in sheets]; C = [s['brown'] for s in sheets]
    by = {}
    for s in sheets:
        by.setdefault(s['rule']['conn'], []).append(s)
    b0 = next(s for s in sheets if s['base'])
    top = max(sheets, key=lambda s: s['recomputable'])
    total = sum(W) + sum(B) + sum(C)
    out = {
        'work': 'THREE HUNDRED HEAPS', 'session': 146, 'date': '2026-09-27',
        'source': {'url': URL, 'sha256': digest, 'corpus': 'M (1,000 medical-trial abstracts)',
                   'matching': MATCH, 'screens': len(L['screens']), 'flags': len(L['flags'])},
        'assumptions': {'grains_per_gram': GRAINS_PER_GRAM, 'bulk_g_per_ml': BULK_G_PER_ML,
                        'angle_of_repose_deg': REPOSE_DEG,
                        'note': 'about rice, not about the record; they set only the size of a poured heap'},
        'order': {k: [('whole' if v is None else v) for v in ORDER[k]] for k in KEYS},
        'labels': {k: {('whole' if a is None else str(a)): b for a, b in LABEL[k].items()} for k in KEYS},
        'summary': {
            'sheets': len(sheets),
            'white': [min(W), max(W)], 'black': [min(B), max(B)], 'brown': [min(C), max(C)],
            'base': {'white': b0['white'], 'brown': b0['brown'], 'black': b0['black'], 'rate': b0['rate']},
            'top': {'rule': top['rule'], 'white': top['white'], 'brown': top['brown'], 'black': top['black'],
                    'rate': top['rate']},
            'white_by_connectives': {k: [min(s['white'] for s in v), max(s['white'] for s in v)] for k, v in by.items()},
            'black_by_connectives': {k: [min(s['black'] for s in v), max(s['black'] for s in v)] for k, v in by.items()},
            'sheets_black_over_white': sum(1 for s in sheets if s['black'] > s['white']),
            'sheets_black_over_half_of_white': sum(1 for s in sheets if 2 * s['black'] > s['white']),
            'growth_base_to_top': {'white': top['white'] - b0['white'], 'black': top['black'] - b0['black'],
                                   'brown': top['brown'] - b0['brown']},
            'grains_total': total, 'grains_white': sum(W), 'grains_black': sum(B), 'grains_brown': sum(C),
            'grams_total': round(total / GRAINS_PER_GRAM, 1),
            'largest_heap_mm': max(max(s['heaps'][c]['r_mm'] for c in ('white', 'black', 'brown')) for s in sheets),
        },
        'sheets': sheets,
    }
    json.dump(out, open(os.path.join(HERE, 'results.json'), 'w'), indent=1, ensure_ascii=False)
    open(os.path.join(HERE, 'results.json'), 'a').write('\n')
    print(digest)
    print(json.dumps(out['summary'], indent=1))

if __name__ == '__main__':
    main()
