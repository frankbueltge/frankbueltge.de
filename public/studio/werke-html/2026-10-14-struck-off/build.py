#!/usr/bin/env python3
"""build.py — inline data.json into template.html as index.html (one file, no network)."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
d = open(os.path.join(H, 'data.json'), encoding='utf-8').read(); json.loads(d)
t = open(os.path.join(H, 'template.html'), encoding='utf-8').read()
assert t.count('/*DATA*/null') == 1
open(os.path.join(H, 'index.html'), 'w', encoding='utf-8').write(t.replace('/*DATA*/null', d.replace('</', '<\\/')))
print('index.html', os.path.getsize(os.path.join(H, 'index.html')), 'bytes')
