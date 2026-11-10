"""Study 60 — the day North Kivu stops writing "sans échec" (session 258, 2026-11-06).

Answers the Studio's question offered with UNREAD, state 2 (2026-11-06): North Kivu's line on the dead
writes "sans échec" for the last time on 18 October; does a change in the reports' format coincide?

Reads INSP SitRep MVE-BDBV reports 108-174 as present in INRB-UMIE/BDBV2026-Data@338e5780 (PDFs; the
text by `pdftotext -layout`, the make by `pdfinfo`; no PDF or text committed) and the Studio's reading
(studio repo, etudes/unread/data.json, commit named in results60.json).

Usage: python3 -I analyse60.py <raw PDF dir> <dir of pdftotext output> <studio data.json> <processed csv dir>
Predictions: PREDICTIONS60.md (committed before this script was written).
"""
import csv, glob, hashlib, json, os, re, statistics, subprocess, sys

RAW, TXT, STUDIO, PROC = sys.argv[1:5]
HERE = os.path.dirname(os.path.abspath(__file__))
LO, HI = 108, 174


def num(p):
    m = re.search(r'_(\d+)[-_]', os.path.basename(p))
    return int(m.group(1)) if m else -1


def ws(s):
    s = s.replace('’', "'").replace(' ', ' ')
    return re.sub(r'\s+', ' ', s).strip()


def info(pdf):
    out = subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout
    d = {}
    for line in out.splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            d[k.strip()] = v.strip()
    return {'creator': d.get('Creator', ''), 'producer': d.get('Producer', ''),
            'pages': int(d.get('Pages', 0)), 'version': d.get('PDF version', '')}


HEAD = re.compile(r'^\s*(\d+(?:\.\d+)+)\.?\s+(\S.{0,80}?)\s*$')


def headings(text):
    out = []
    for line in text.splitlines():
        m = HEAD.match(line)
        if m and not re.match(r'^[\d\s.,%()]+$', m.group(2)) and len(m.group(2)) > 2 and m.group(2)[0].isupper():
            out.append(ws(line))
    return out


def titles(hs):
    """Looser reading, declared post hoc: the title without its numbering or punctuation."""
    return [re.sub(r'[^\w ]', '', re.sub(r'^[\d.\s]+', '', h)).lower().strip() for h in hs]


SANS = re.compile(r'sans\s+(?:aucun\s+)?[ée]chec', re.I)


def klass(q):
    if q is None:
        return None
    q = ws(q)
    if re.match(r'^sur \d+ alertes', q, re.I):
        return 'A'
    if re.match(r'^\d+ EDS r[ée]alis[ée]e?s? sur \d+ alertes', q, re.I):
        return 'B'
    return 'C'


studio = json.load(open(STUDIO, encoding='utf-8'))
sd = {'ituri': {x['report']: x for x in studio['days']}, 'nk': {x['report']: x for x in studio['nk']['days']}}

pdfs = {num(p): p for p in glob.glob(os.path.join(RAW, 'SitRep_MVE_*.pdf'))}
rows = []
for n in range(LO, HI + 1):
    r = {'report': n, 'present': False}
    p = pdfs.get(n)
    if p and open(p, 'rb').read(5) == b'%PDF-':
        t = open(os.path.join(TXT, f'SitRep_MVE_{n}_2026.txt'), encoding='utf-8').read()
        r.update(present=True, sha256=hashlib.sha256(open(p, 'rb').read()).hexdigest(), **info(p))
        r['headings'] = headings(t)
        flat = ws(t)
        r['sans_echec'] = len(SANS.findall(flat))
        for prov in ('ituri', 'nk'):
            x = sd[prov].get(n)
            q = x.get('q') if x else None
            r[prov] = {'q': q, 'class': klass(q), 'found': (ws(q).lower() in flat.lower()) if q else None,
                       'unread': x.get('unread') if x else None, 'date': x.get('date') if x else None}
    rows.append(r)

present = [r for r in rows if r['present']]
absent = [r['report'] for r in rows if not r['present']]
by = {r['report']: r for r in present}

# consecutive heading differences among present reports
prev = None
for r in present:
    if prev is not None:
        r['hdiff'] = len(set(r['headings']) ^ set(prev['headings']))
        r['tdiff'] = len(set(titles(r['headings'])) ^ set(titles(prev['headings'])))
        r['make_change'] = (r['creator'], r['producer']) != (prev['creator'], prev['producer'])
        r['prev_present'] = prev['report']
    prev = r

base = [by[n]['hdiff'] for n in range(141, 158) if n in by and 'hdiff' in by[n]]  # pairs inside 140-157
med = statistics.median(base)
d165 = len(set(by[165]['headings']) ^ set(by[157]['headings']))
t165 = len(set(titles(by[165]['headings'])) ^ set(titles(by[157]['headings'])))
tbase = [by[n]['tdiff'] for n in range(141, 158) if n in by and 'tdiff' in by[n]]

P = {}
P['P32'] = {'held': all((by[k]['creator'], by[k]['producer']) == (by[157]['creator'], by[157]['producer']) for k in (164, 165)),
            'r157': [by[157]['creator'], by[157]['producer']], 'r164': [by[164]['creator'], by[164]['producer']],
            'r165': [by[165]['creator'], by[165]['producer']]}
P['P33'] = {'held': d165 <= med, 'diff_157_165': d165, 'median_consecutive_140_157': med, 'consecutive_140_157': base,
            'loose_titles_diff_157_165': t165, 'loose_titles_median': statistics.median(tbase),
            'only_157': sorted(set(by[157]['headings']) - set(by[165]['headings'])),
            'only_165': sorted(set(by[165]['headings']) - set(by[157]['headings']))}
P['P34'] = {'held': by[165]['ituri']['class'] == by[157]['ituri']['class'] and by[157]['ituri']['class'] is not None,
            'c157': by[157]['ituri']['class'], 'c165': by[165]['ituri']['class'],
            'q157': by[157]['ituri']['q'], 'q165': by[165]['ituri']['q']}
pre = [by[n]['nk']['class'] for n in range(145, 158) if n in by and by[n]['nk']['class']]
post = [by[n]['nk']['class'] for n in range(165, 175) if n in by and by[n]['nk']['class']]
P['P35'] = {'held': pre.count('A') / len(pre) >= 0.8 and 'A' not in post, 'pre_145_157': pre, 'post_165_174': post}
after = {n: by[n]['sans_echec'] for n in range(164, 175) if n in by}
P['P36'] = {'held': sum(after.values()) == 0, 'counts_164_174': after}
dates = []
with open(os.path.join(PROC, 'insp_sitrep__national_cumulative_confirmed_cases__daily.csv'), encoding='utf-8') as f:
    for row in csv.DictReader(f):
        if '2026-10-19' <= row['date'] <= '2026-10-24':
            dates.append(row['date'])
P['P37'] = {'held': len(dates) > 0, 'dates_19_24_oct': dates}

# descriptive: where does each sentence keep its template, and where does the make change
last_sans = max(n for n in by if by[n]['nk']['unread'] == 0 or SANS.search(ws(by[n]['nk']['q'] or '')))
makes = sorted({(r['creator'], r['producer']) for r in present})
changes = [r['report'] for r in present if r.get('make_change')]
found = [r[p]['found'] for r in present for p in ('ituri', 'nk') if r[p]['q']]

out = {'study': 60, 'session': 258, 'date': '2026-11-06',
       'input': {'archive': 'https://github.com/INRB-UMIE/BDBV2026-Data/tree/338e578', 'reports_window': [LO, HI],
                 'present': len(present), 'absent': absent,
                 'studio_file': {'repo': 'frankbueltge/studio', 'path': 'etudes/unread/data.json',
                                 'sha256': hashlib.sha256(open(STUDIO, 'rb').read()).hexdigest()}},
       'predictions': P,
       'descriptive': {'last_nk_sans_echec_report': last_sans, 'makes': makes, 'make_changes_at': changes,
                       'studio_quotes_found': [sum(found), len(found)],
                       'sans_echec_by_report': {r['report']: r['sans_echec'] for r in present}},
       'reports': [{k: v for k, v in r.items() if k != 'headings'} | ({'n_headings': len(r['headings'])} if r['present'] else {}) for r in rows]}
json.dump(out, open(os.path.join(HERE, 'results60.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k, v in P.items():
    print(k, 'HELD' if v['held'] else 'FAILED', {a: b for a, b in v.items() if a not in ('held', 'only_157', 'only_165')})
print('absent', absent, 'last sans', last_sans, 'makes', makes, 'changes', changes, 'found', sum(found), len(found))
print('only157', P['P33']['only_157']); print('only165', P['P33']['only_165'])

# ---- post hoc, declared as such: what the failed predictions point at ----
def make(r):
    return r['creator'].replace('Microsoft® Word', '').replace('\xa0', ' ').strip()


def nk_sans(r):
    q = r['nk']['q'] or ''
    return r['nk']['unread'] == 0 or bool(SANS.search(ws(q)))


pre_r = [r for r in present if r['report'] <= 157]
post_r = [r for r in present if r['report'] >= 164]
w2016 = {'before_hole': [sum(make(r) == '2016' for r in pre_r), len(pre_r)],
         'after_hole': [sum(make(r) == '2016' for r in post_r), len(post_r)]}
pairs = [r for r in present if 'make_change' in r]
win = [r for r in present if 145 <= r['report'] <= 157]
sans_by_make = {}
for r in win:
    m = make(r)
    a = sans_by_make.setdefault(m, [0, 0])
    a[0] += nk_sans(r)
    a[1] += 1
post = {'word2016': w2016, 'make_changes': [len(changes), len(pairs)],
        'templates_after_hole': {'ituri_B': [sum(r['ituri']['class'] == 'B' for r in post_r), sum(r['ituri']['class'] is not None for r in post_r)],
                                 'nk_B': [sum(r['nk']['class'] == 'B' for r in post_r), sum(r['nk']['class'] is not None for r in post_r)]},
        'templates_145_157': {'ituri_A': [sum(r['ituri']['class'] == 'A' for r in win), sum(r['ituri']['class'] is not None for r in win)],
                              'nk_A': [sum(r['nk']['class'] == 'A' for r in win), sum(r['nk']['class'] is not None for r in win)]},
        'nk_sans_by_make_145_157': sans_by_make,
        'nk_sans_after_hole_by_make': {m: [sum(nk_sans(r) for r in post_r if make(r) == m), sum(make(r) == m for r in post_r)] for m in sorted({make(r) for r in post_r})}}
out['post_hoc'] = post
json.dump(out, open(os.path.join(HERE, 'results60.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(post))

strip = []
for r in rows:
    if not r['present']:
        strip.append({'n': r['report'], 'present': False})
        continue
    strip.append({'n': r['report'], 'present': True, 'date': r['nk']['date'] or r['ituri']['date'], 'make': make(r), 'pages': r['pages'],
                  'nk': r['nk']['class'], 'it': r['ituri']['class'], 'nkq': r['nk']['q'], 'itq': r['ituri']['q'],
                  'nksans': nk_sans(r), 'sans': r['sans_echec']})
D = {'strip': strip, 'P': {k: {'held': v['held']} for k, v in P.items()}, 'post': post, 'absent': absent,
     'p33': {'d': d165, 'med': med}, 'last': last_sans}
with open(os.path.join(HERE, 'data60.js'), 'w', encoding='utf-8') as f:
    f.write('// written by analyse60.py; do not edit\nwindow.D60=' + json.dumps(D, ensure_ascii=False) + ';\n')
