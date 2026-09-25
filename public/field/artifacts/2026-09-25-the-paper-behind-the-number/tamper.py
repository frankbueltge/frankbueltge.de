#!/usr/bin/env python3
"""Corrupt a copy of the artifact in fourteen ways; each must be caught by a NAMED check.
Session 170. Read and write are separate steps (the 09-23 harness truncated what it read)."""
import json, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))


def load(d, f):
    with open(os.path.join(d, 'data', f), encoding='utf-8') as fh:
        return json.load(fh)


def save(d, f, obj):
    txt = json.dumps(obj, indent=1, ensure_ascii=False)
    with open(os.path.join(d, 'data', f), 'w', encoding='utf-8') as fh:
        fh.write(txt)


def edit(f, fn):
    def go(d):
        o = load(d, f); fn(o); save(d, f, o)
    return go


def text(f, old, new):
    def go(d):
        p = os.path.join(d, f)
        with open(p, encoding='utf-8') as fh:
            s = fh.read()
        assert old in s, (f, old)
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(s.replace(old, new, 1))
    return go


def rd(o, s):
    return next(r for r in o['reading'] if r['s'] == s)


T = [
    ('a digest mismatch hidden in the corpus', 'C01', edit('corpus.json', lambda o: o['abstracts'][7].update(digest_match=False))),
    ('one full text quietly loses its body', 'C02', edit('corpus.json', lambda o: next(r for r in o['fulltexts'] if r['has_body']).update(has_body=False))),
    ('the sample index is re-drawn by hand', 'C04', edit('units.json', lambda o: o['sample_index'].__setitem__(0, o['sample_index'][0] + 1))),
    ('a verdict line points at the wrong unit', 'C05', edit('reading.json', lambda o: rd(o, 10).update(uid='0#0'))),
    ('an NA gains a k and n', 'C06', edit('reading.json', lambda o: rd(o, 0).update(k=1, n=2))),
    ('an RC whose counts do not divide right', 'C07', edit('reading.json', lambda o: rd(o, 7).update(k=160))),
    ('the RI is relabelled RC', 'C07', edit('reading.json', lambda o: rd(o, 92).update(verdict='RC'))),
    ('the recovered rate is rounded up', 'C09', edit('estimates.json', lambda o: o['recovered'].update(rate=66.0))),
    ('a strict flag dropped from one note', 'C10', edit('reading.json', lambda o: rd(o, 108).update(note=rd(o, 108)['note'].replace(' [strict: NR]', '')))),
    ('the bootstrap interval is widened', 'C13', edit('estimates.json', lambda o: o['recovered'].update(paper_cluster_bootstrap_95=[50.0, 80.0]))),
    ('a null hit is removed', 'C14', edit('units.json', lambda o: next(x for x in o['units'] if x['screen_null']).update(screen_null=False))),
    ('the null screens a unit against its own paper', 'C15', edit('units.json', lambda o: o['units'][0].update(null_doc=o['units'][0]['doc']))),
    ('a refuted prediction is marked held', 'C17', edit('predictions.json', lambda o: o['predictions'][0].update(verdict='HELD'))),
    ('the page prints a friendlier rate', 'C19', text('index.html', '65.1 %', '70.1 %')),
]


def main():
    caught = 0
    for desc, want, fn in T:
        tmp = tempfile.mkdtemp()
        d = os.path.join(tmp, 'a')
        shutil.copytree(HERE, d, ignore=shutil.ignore_patterns('__pycache__'))
        fn(d)
        out = subprocess.run([sys.executable, os.path.join(HERE, 'check.py'), d], capture_output=True, text=True).stdout
        fails = [l for l in out.splitlines() if l.startswith('FAIL')]
        ok = any(l.startswith('FAIL ' + want) for l in fails)
        caught += ok
        print(('CAUGHT ' if ok else 'MISSED ') + f'{desc} -> expected {want}; failed: ' + ', '.join(l.split()[1] for l in fails))
        shutil.rmtree(tmp)
    print(f'{caught}/{len(T)} corruptions caught by the named check')
    sys.exit(0 if caught == len(T) else 1)


if __name__ == '__main__':
    main()
