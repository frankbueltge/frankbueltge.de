#!/usr/bin/env python3
"""Check every source against its pinned hash and every quotation word for word, search the keeper's
thirteen pages for harm words, compare the two readings, join the siblings' data, and write
results.json and index.html (from template.html).
Usage: python3 -I build.py <srcdir>   (srcdir holds the files named in sources.json)"""
import hashlib, html, json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(here, 'sources.json')))
R1 = json.load(open(os.path.join(here, 'reader1.json')))['codes']
R2 = json.load(open(os.path.join(here, 'reader2.json')))['codes']
src = sys.argv[1]

def path(meta):
    f = os.path.join(src, meta['file'])
    assert hashlib.sha256(open(f, 'rb').read()).hexdigest() == meta['sha256'], 'hash ' + meta['file']
    return f

def text(meta):
    s = open(path(meta), encoding='utf-8', errors='replace').read()
    s = re.sub(r'(?is)<(script|style).*?</\1>', ' ', s); s = re.sub(r'<[^>]+>', ' ', s); s = html.unescape(s)
    return re.sub(r'\s+', ' ', s)

def body(t):  # the page's own account: from its summary to its footer, without the site menu
    i = t.find(' Summary '); j = t.find('Hidden System Updates')
    return t[i:j]

# 1. the keeper's thirteen pages
HARM = r'\b(harm\w*|threat\w*|danger\w*|hazard\w*|risk\w*|damag\w*|injur\w*|safe\w*|casualt\w*|victim\w*)\b'
pages, n_quotes = {}, 0
for d, meta in S['pages'].items():
    b = body(text(meta)); assert len(b) > 1500, d
    for r in (R1, R2):
        q = r[d]['P_q'].rstrip('.')
        if q != '—': assert q in b, f'quote not found {d}: {q[:50]}'; n_quotes += 1
    pages[d] = {'harm_words': re.findall(HARM, b, re.I), 'warning_words': re.findall(r'\bwarn\w*', b, re.I), 'words': len(b.split())}
# 2. the press pages and the encyclopedia
for k, meta in S['press'].items():
    t = text(meta)
    for q in meta['quotes']: assert q in t, f'quote not found {k}: {q[:50]}'; n_quotes += 1
print(f'{len(S["pages"]) + len(S["press"]) + len(S["data"])} sources match their hashes; {n_quotes} quotations found word for word')

ids = list(S['pages'])
agree = sum(R1[d][f] == R2[d][f] for d in ids for f in 'HPA')
cnt = lambda f, v: [d for d in ids if R1[d][f] == v]
harm_hits = {d: p['harm_words'] for d, p in pages.items() if p['harm_words']}
assert not harm_hits, harm_hits   # the machine search agrees with both readers on H, or the build stops

# 3. the siblings' data
fb = [l.rstrip('\n').split('\t') for l in open(path(S['data']['field_fireballs']), encoding='utf-8')][1:]
fr = json.load(open(path(S['data']['field_results'])))
lo, hi = fr['period']
fb = [r for r in fb if lo <= r[0] <= hi]
assert len(fb) == fr['all']['n'] == 639
pts = [[r[0][:16], float(r[2]) if r[2] else None, float(r[3]) if r[3] else None, float(r[4]) if r[4] else None] for r in fb]
pts.sort(key=lambda p: p[0])
st = {r['des'].replace(' ', ''): r for r in json.load(open(path(S['data']['studio_data'])))['rows']}
fw = {r['des'].replace(' ', ''): r for r in fr['warned_rows']}
warned = []
for d in ids:
    s, f = st[d], fw[d]
    nb = f.get('nearest') or {}
    in_rec = f.get('match') == 'time_and_place'   # the Field's own join, not a rule of mine
    warned.append({'id': d, 'des': s['des'], 't': s['impact_utc'], 'lat': s['lat'], 'lon': s['lon'], 'held_h': s['held_h'],
                   'place': s['place'], 'residents': s['residents_50km'], 'confirmed': s['confirmed'],
                   'kt': nb.get('impact_kt') if in_rec else None, 'rank': f.get('energy_rank'), 'url': S['pages'][d]['url'],
                   'P': R1[d]['P'], 'P_q': R1[d]['P_q'], 'H': R1[d]['H'], 'A': R1[d]['A']})
n_in = sum(w['kt'] is not None for w in warned)
assert n_in == fr['overlap']['in_sensor_record'] == 6, n_in
top = fr['top10'][0]; assert top['impact_kt'] == 441.0 and top['t'].startswith('2013-02-15')

# 4. a land outline, decoded from TopoJSON (Natural Earth 1:110m via world-atlas, ISC), rounded to 0.1 degree
topo = json.load(open(path(S['data']['land'])))
sx, sy = topo['transform']['scale']; tx, ty = topo['transform']['translate']
arcs = []
for a in topo['arcs']:
    x = y = 0; out = []
    for dx, dy in a: x += dx; y += dy; out.append((x * sx + tx, y * sy + ty))
    arcs.append(out)
def ring(r):
    pts_ = []
    for i in r:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts_ += a if not pts_ else a[1:]
    return 'M' + 'L'.join(f'{x + 180:.1f},{90 - y:.1f}' for x, y in pts_) + 'Z'
land = ''.join(ring(r) for g in topo['objects']['land']['geometries']
               for poly in (g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]) for r in poly)

universe = len(fb) + len(warned) - n_in
res = {'pages': len(ids), 'cells': 3 * len(ids), 'agree': agree,
       'H_yes': cnt('H', 'yes'), 'A_yes': cnt('A', 'yes'),
       'P': {v: cnt('P', v) for v in ('exposed', 'witness', 'none')},
       'harm_word_hits_in_keeper_pages': 0, 'warning_word_hits': {d: len(p['warning_words']) for d, p in pages.items() if p['warning_words']},
       'keeper_words': sum(p['words'] for p in pages.values()),
       'fireballs': len(fb), 'fireballs_placed': sum(p[2] is not None for p in pts), 'warned': len(warned), 'warned_in_sensor_record': n_in,
       'universe': universe,
       'cells_2x2': {'warned_harm': 0, 'warned_no_harm': len(warned), 'unwarned_harm': 1, 'unwarned_no_harm': universe - len(warned) - 1},
       'residents_beneath_warned': sum(w['residents'] for w in warned),
       'chelyabinsk': {'t': top['t'], 'kt': top['impact_kt'], 'lat': top['lat'], 'lon': top['lon'], 'warned': False, 'injured': 1491},
       'warned_kt_max': max(w['kt'] for w in warned if w['kt'] is not None),
       'admit_prevention': 0}
json.dump(res, open(os.path.join(here, 'results.json'), 'w'), indent=1)
press = {k: {'url': v['url'], 'quotes': v['quotes'], 'note': v['note']} for k, v in S['press'].items()}
data = {'pts': pts, 'warned': warned, 'res': res, 'press': press, 'land': land, 'codes2': R2}
tpl = open(os.path.join(here, 'template.html'), encoding='utf-8').read()
out = tpl.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(out)
print('agreement', agree, 'of', res['cells'], '| harm named', len(res['H_yes']), '| act named', len(res['A_yes']),
      '| witness', len(res['P']['witness']), 'none', len(res['P']['none']), 'exposed', len(res['P']['exposed']),
      '| universe', universe, '| residents', res['residents_beneath_warned'], '| max warned kt', res['warned_kt_max'])
