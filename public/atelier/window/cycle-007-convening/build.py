#!/usr/bin/env python3
"""Check every quoted segment against the fetched sources, compare the two readings, and write
results.json and index.html (from template.html).
Usage: python3 -I build.py <srcdir>   (srcdir holds nsa.html chatham.pdf ny.html aca.html wp.html)"""
import hashlib, html, json, os, re, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(here, 'passages.json')))
R1 = json.load(open(os.path.join(here, 'reader1.json')))
R2 = json.load(open(os.path.join(here, 'reader2.json')))
src = sys.argv[1]
FILES = {'nsa': 'nsa.html', 'chatham': 'chatham.pdf', 'ny': 'ny.html', 'aca': 'aca.html', 'wp': 'wp.html'}

def norm(s):
    s = re.sub(r'\s*\[\s*\d+\s*\]', '', s)          # citation markers
    s = re.sub(r'\s+', ' ', s)
    return re.sub(r' ([.,;:])', r'\1', s).strip()

T = {}
for k, meta in P['sources'].items():
    f = os.path.join(src, FILES[k])
    assert hashlib.sha256(open(f, 'rb').read()).hexdigest() == meta['sha256'], f'hash {k}'
    if f.endswith('.pdf'):
        s = subprocess.run(['pdftotext', f, '-'], capture_output=True, text=True).stdout
    else:
        s = open(f, encoding=meta.get('enc', 'utf-8'), errors='replace').read()
        s = re.sub(r'(?is)<(script|style).*?</\1>', ' ', s); s = re.sub(r'<[^>]+>', ' ', s); s = html.unescape(s)
    T[k] = norm(s)
n = 0
for t in P['tellings'] + [P['claim']]:
    for seg in t['segments']:
        assert norm(seg) in T[t['src']], f"segment not found: {t.get('id', 'claim')}: {seg[:60]}"
        n += 1
print(f'{n} segments found word for word')

ids = [t['id'] for t in P['tellings']]
cells = [(i, f) for i in ids for f in 'KEPW']
agree = sum(R1['codes'][i][f] == R2['codes'][i][f] for i, f in cells) + (R1['claim']['E'] == R2['claim']['E'])
c = R1['codes']
def count(f, v): return [i for i in ids if c[i][f] == v]
res = {
    'n': len(ids), 'cells': len(cells) + 1, 'agree': agree,
    'K_yes': count('K', 'yes'),
    'E': {v: count('E', v) for v in ('silence', 'report', 'none')},
    'P_yes': count('P', 'yes'),
    'W': {v: count('W', v) for v in ('intended', 'pending', 'none')},
    'P_source': {'gates': 'As he recounted it to me', 'aca': 'According to Brzezinski'},
}
res['E_named'] = res['E']['silence'] + res['E']['report']
# who carries the news of the ending: the segment holding the ending's words also names Odom
res['odom_carries'] = [t['id'] for t in P['tellings'] if any(c[t['id']]['E_q'].rstrip('.') in s and 'Odom' in s for s in t['segments'])]
json.dump(res, open(os.path.join(here, 'results.json'), 'w'), indent=1)
data = {'tellings': P['tellings'], 'claim': P['claim'], 'codes': c, 'codes2': R2['codes'], 'res': res,
        'urls': {k: v['url'] for k, v in P['sources'].items()}}
tpl = open(os.path.join(here, 'template.html'), encoding='utf-8').read()
out = tpl.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False).replace('</', '<\\/'))
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(out)
print('agreement', agree, 'of', res['cells'], '| cause named', len(res['K_yes']), '| ending named', len(res['E_named']),
      '(silence', len(res['E']['silence']), ') | person', len(res['P_yes']), '| intended', len(res['W']['intended']))
