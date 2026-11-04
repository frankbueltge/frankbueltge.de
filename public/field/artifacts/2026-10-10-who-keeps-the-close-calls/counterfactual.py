"""Exploratory, declared after the pre-registered run: the Atelier's counterfactual lexicon
(handoff ho-2026-10-09-atelier-1; ulysses commit b9b4e48, window/cycle-006-convening-how-near/data.json,
key 'lexicon') applied to two keepers' own entry texts. Not pre-registered.

Usage: python3 -I counterfactual.py <atelier data.json> <fli_content.json> <wikitext>
FLI: the timeline items' text (H5P JSON embedded in the page). WP: section bodies, references and
templates stripped. Phillips and Chatham House are not measured (no machine-segmentable copy held).
Writes data/counterfactual.json: per entry, whether a lexicon word occurs, and which. No text.
"""
import json, re, sys, html, os
HERE = os.path.dirname(os.path.abspath(__file__))
lex = json.load(open(sys.argv[1]))['lexicon']
rx = re.compile(lex, re.I)
out = {'lexicon': lex, 'source': 'ulysses b9b4e4826e415d6ef85a9ab7f7fa57b68198bb2c', 'FLI': {}, 'WP': {}}
fli = json.load(open(sys.argv[2]))['timeline']['date']
for i, e in enumerate(fli, 1):
    if i in (26, 28):          # commentary items, not events (see entries.tsv)
        continue
    t = re.sub('<[^>]+>', ' ', html.unescape(e.get('text', '')))
    out['FLI'][str(i)] = sorted({m.group(0).lower() for m in rx.finditer(t)})
w = open(sys.argv[3], encoding='utf-8').read()
w = re.sub(r'<ref[^>]*/>', '', w); w = re.sub(r'<ref.*?</ref>', '', w, flags=re.S)
w = re.sub(r'\{\{[^{}]*\}\}', '', w); w = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', w)
parts = re.split(r'\n(=+[^=\n]+=+)\n', w)
for h, b in zip(parts[1::2], parts[2::2]):
    h = h.strip('= ').strip()
    if h in ('See also', 'References', 'Further reading', 'Intentional use close calls',
             'Unintentional close calls', '1962: Cuban Missile Crisis', '1991: Gulf War') or not b.strip():
        continue
    out['WP'][h] = sorted({m.group(0).lower() for m in rx.finditer(b)})
for k in ('FLI', 'WP'):
    n = len(out[k]); c = sum(1 for v in out[k].values() if v)
    out[k + '_summary'] = {'entries': n, 'with_word': c}
    print(k, c, 'of', n)
json.dump(out, open(os.path.join(HERE, 'data', 'counterfactual.json'), 'w'), indent=1)
