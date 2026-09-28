#!/usr/bin/env python3
"""Twenty Augusts — each corruption, made on a copy, must be caught by a named check. No network."""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))


def jedit(f, fn):
    def go(d):
        p = os.path.join(d, 'data', f)
        x = json.load(open(p))
        fn(x)
        json.dump(x, open(p, 'w'))
    return go


def pedit(a, b):
    def go(d):
        p = os.path.join(d, 'index.html')
        s = open(p, encoding='utf-8').read()
        assert a in s
        open(p, 'w', encoding='utf-8').write(s.replace(a, b, 1))
    return go


TRIALS = [
    ('C nudged in 2021', 'C recomputes from totals', jedit('years.json', lambda x: x['years']['2021']['rates'].__setitem__('C', 2.52))),
    ('a 2026 digest altered', 'corpus digests recompute from their rows', jedit('corpora.json', lambda x: x['2026']['docs'][7].__setitem__('sha256', '0' * 64))),
    ('P1 flipped to held', 'prediction verdicts follow from the data', jedit('predictions.json', lambda x: x[0].__setitem__('verdict', 'held'))),
    ('2026 journal interval widened', 'page: 2026 and 2021 journal intervals do not overlap', jedit('explore.json', lambda x: x['frames']['2026'].__setitem__('C_ci95_journal_clustered', [3.5, 9.56]))),
    ('read-back inflated', 'read-back adds up', jedit('readback.json', lambda x: x.__setitem__('genuine', 32))),
    ('a script added to the page', 'page carries no script', pedit('</main>', '<script>1</script></main>')),
]


def main():
    caught = 0
    for name, want, fn in TRIALS:
        with tempfile.TemporaryDirectory() as t:
            d = os.path.join(t, '2026-09-28-twenty-augusts')
            shutil.copytree(HERE, d)
            os.symlink(os.path.join(HERE, '..', '2026-09-23-a-number-you-cannot-check'),
                       os.path.join(t, '2026-09-23-a-number-you-cannot-check'))
            fn(d)
            r = subprocess.run([sys.executable, os.path.join(d, 'check.py'), d], capture_output=True, text=True)
            ok = r.returncode != 0 and f'FAIL {want}' in r.stdout
            caught += ok
            print(('caught' if ok else 'MISSED'), '|', name, '|', want)
    print(f'{caught} of {len(TRIALS)} caught')
    sys.exit(0 if caught == len(TRIALS) else 1)


if __name__ == '__main__':
    main()
