"""Builds index.html from template.html and the study-4 results (no network)."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(H, '..', '..', 'artifacts', '2026-10-08-who-saw-the-fourteen', 'data', 'results.json'), encoding='utf-8'))
keep = ('id', 'setting', 'observer', 'prong_a', 'prong_b', 'reports', 'first_report', 'reason', 'title')
emb = json.dumps([{k: x[k] for k in keep} for x in d['incidents']], ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
t = open(os.path.join(H, 'template.html'), encoding='utf-8').read()
open(os.path.join(H, 'index.html'), 'w', encoding='utf-8').write(t.replace('__DATA__', emb))
