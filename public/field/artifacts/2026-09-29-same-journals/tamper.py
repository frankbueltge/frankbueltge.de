#!/usr/bin/env python3
"""Same journals, two years — each corruption, made on a copy, must make check.py fail. No network."""
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


def first(x):
    return x['per_journal'][sorted(x['per_journal'])[0]]


TRIALS = [
    ('2026 panel C nudged', jedit('results.json', lambda x: x['C'].__setitem__('2026', 6.17))),
    ('one journal gains an agreeing percentage', jedit('results.json', lambda x: first(x)['2026'].__setitem__('con', first(x)['2026']['con'] + 1))),
    ('W interval narrowed to exclude zero', jedit('results.json', lambda x: x.__setitem__('W_ci95', [0.1, 1.14]))),
    ('P1 flipped to held', jedit('results.json', lambda x: x['predictions_held'].__setitem__('P1', True))),
    ('composition part inflated', jedit('results.json', lambda x: x['decomposition'].__setitem__('composition', 3.0))),
    ('a digest altered', jedit('panel-manifest.json', lambda x: x['docs'][sorted(x['docs'])[0]]['2021'][0].__setitem__('sha256', 'z' * 64))),
    ('abstract text leaked into data', jedit('panel-manifest.json', lambda x: x['docs'][sorted(x['docs'])[0]]['2021'][0].__setitem__('text', 'x'))),
]


def main():
    caught = 0
    for name, fn in TRIALS:
        with tempfile.TemporaryDirectory() as t:
            d = os.path.join(t, 'a')
            shutil.copytree(HERE, d, ignore=shutil.ignore_patterns('__pycache__'))
            fn(d)
            with open(os.path.join(d, 'data', 'results.json')) as fh:
                fh.read()                                         # read happens after the write is closed
            r = subprocess.run([sys.executable, os.path.join(d, 'check.py')], capture_output=True, text=True)
            ok = r.returncode != 0
            caught += ok
            print('caught' if ok else 'MISSED', name)
    print(f'{caught} of {len(TRIALS)} corruptions caught')
    sys.exit(0 if caught == len(TRIALS) else 1)


if __name__ == '__main__':
    main()
