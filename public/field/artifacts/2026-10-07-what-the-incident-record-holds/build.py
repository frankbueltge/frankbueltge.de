"""Inline data/*.json into template.html -> index.html (the page then needs no fetch)."""
import os
H = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(H, 'template.html')).read()
for k, f in (('RESULTS', 'results.json'), ('CELLS', 'cells.json'), ('STUDIO', 'studio-check.json')):
    s = s.replace('/*%s*/null' % k, open(os.path.join(H, 'data', f)).read().strip())
open(os.path.join(H, 'index.html'), 'w').write(s)
print(len(s))
