#!/usr/bin/env python3
"""build.py — inline warnings.json, pop.json and summary.json into template.html as index.html."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: json.load(open(os.path.join(H, n), encoding='utf-8'))
d = json.dumps({"w": rd('warnings.json'), "pop": rd('pop.json'), "s": rd('summary.json')}, separators=(',', ':'))
t = open(os.path.join(H, 'template.html'), encoding='utf-8').read()
assert t.count('/*DATA*/null') == 1
open(os.path.join(H, 'index.html'), 'w', encoding='utf-8').write(t.replace('/*DATA*/null', d.replace('</', '<\\/')))
print('index.html', os.path.getsize(os.path.join(H, 'index.html')), 'bytes')
