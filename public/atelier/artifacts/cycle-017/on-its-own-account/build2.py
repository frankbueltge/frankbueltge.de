#!/usr/bin/env python3
"""On Its Own Account, state 2: the rules this practice keeps on its own record and never said how to count.

Run from this folder:  python3 build2.py            (needs git with full history, node, a Chromium for playwright,
                                                     and network for the Field's census at a pinned commit)
                       python3 build2.py --offline  (skips the census)

For every rule of length this practice's constitution sets on its own record (bulletin, journal, commit subject, score,
critique), every item the rule bound from the day it took effect up to UPTO is read by every reading of its unit
(readings.mjs). An item is KEPT if it is inside its limit on every admissible reading, BROKEN if it is over on every
one, OPEN otherwise: the rule as written does not decide it (a supervaluation: settled is what holds on every
sharpening). The digest of state 1 stands beside them as the one rule whose counter was declared.

Writes data/rules.json and data/rules.js. Nothing here asks a model; build.py of state 1 is unchanged and still runs.
"""
import json, math, os, re, subprocess, sys, tempfile, urllib.request
from collections import Counter
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(['git', '-C', HERE, 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip()
OFFLINE = '--offline' in sys.argv
UPTO = '78dd6f7bde32f23f7e84e7adbb9e9c14a06b9794'      # main as the session of 2026-11-20 that made state 2 found it
V7 = '155e603'                                           # 2026-08-30, protocol v7: bulletin and session note at most 40 lines
A1022 = '1110b8e'                                        # 2026-10-22: score and critique at most 20 lines
A1113 = 'fb60c16'                                        # 2026-11-13: bulletin 400 words and "a line is a sentence or two";
                                                         # journal 150 words; commit subject 100 characters
CENSUS = 'https://raw.githubusercontent.com/frankbueltge/field-research/a26d1dce78ac3b10c20c93997906d6904ba855a3/artifacts/cycle-017/what-the-house-did-unasked/items85.json'
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def git(*a):
    return subprocess.run(['git', '-C', REPO, *a], capture_output=True, text=True).stdout


def when(h):
    return datetime.fromisoformat(git('show', '-s', '--format=%aI', h).strip()).astimezone(timezone.utc)


def utc(s):
    return datetime.fromisoformat(s).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M')


ok(git('rev-parse', '--is-shallow-repository').strip() == 'false', 'the clone holds the full history')
T7, T1022, T1113 = when(V7), when(A1022), when(A1113)

# ———————————————————————————————————————————— 1. the rules, each quoted at the commit that set it
PROTO = 'PROTOCOL.md'
RULES = [
    {'id': 'bulletin-lines', 'what': 'the bulletin', 'limit': 40, 'unit': 'line', 'from': V7, 'to': A1113,
     'quote': 'overwrite `BULLETIN.md` (at most 40 lines, plain language)', 'at': V7,
     'readings': ['file', 'text', 'block']},
    {'id': 'bulletin-lines-defined', 'what': 'the bulletin', 'limit': 40, 'unit': 'line', 'from': A1113, 'to': None,
     'quote': 'the bulletin has at most 40 lines and at most 400 words, and a line is a sentence or two', 'at': A1113,
     'readings': ['pairs', 'sentences']},
    {'id': 'bulletin-words', 'what': 'the bulletin', 'limit': 400, 'unit': 'word', 'from': A1113, 'to': None,
     'quote': 'the bulletin has at most 40 lines and at most 400 words', 'at': A1113,
     'readings': ['declared', 'browser', 'spaces', 'field']},
    {'id': 'journal-lines', 'what': 'a journal note', 'limit': 40, 'unit': 'line', 'from': V7, 'to': A1113,
     'quote': 'Append a session note of at most 40 lines to `journal/`', 'at': V7,
     'readings': ['file', 'text', 'block']},
    {'id': 'journal-words', 'what': 'a journal entry', 'limit': 150, 'unit': 'word', 'from': A1113, 'to': None,
     'quote': 'The journal entry has at most 150 words', 'at': A1113,
     'readings': ['declared', 'browser', 'spaces', 'field']},
    {'id': 'subject-chars', 'what': 'a commit subject', 'limit': 100, 'unit': 'char', 'from': A1113, 'to': None,
     'quote': 'The commit subject names the session and the work\'s state in at most 100 characters', 'at': A1113,
     'readings': ['points', 'units', 'bytes', 'graphemes']},
    {'id': 'score-lines', 'what': 'a score', 'limit': 20, 'unit': 'line', 'from': A1022, 'to': None,
     'quote': 'It writes a score of at most 20 lines, `SCORE.md` beside the work', 'at': A1022,
     'readings': ['file', 'text', 'block']},
    {'id': 'critique-lines', 'what': 'a critique', 'limit': 20, 'unit': 'line', 'from': A1022, 'to': None,
     'quote': 'In at most 20 lines it says whether the work carries and what it lacks', 'at': A1022,
     'readings': ['file', 'text', 'block']},
]
for r in RULES:
    ok(re.sub(r'\s+', ' ', r['quote']) in re.sub(r'\s+', ' ', git('show', f'{r["at"]}:{PROTO}')), f'{r["id"]}: the rule is quoted as {r["at"]} wrote it')
    r['at_date'] = utc(git('show', '-s', '--format=%aI', r['at']).strip())
# the rules in force today still say the same (PROTOCOL.md 4.2, 5.4, 5.5)
now = re.sub(r'\s+', ' ', git('show', f'{UPTO}:{PROTO}'))
for q in ('at most 40 lines and at most 400 words, in plain language; a line is a sentence or two',
          'at most 150 words on how the session went', 'in at most 100 characters', 'in at most 20 lines'):
    ok(q in now, f'still in force at {UPTO[:7]}: "{q}"')
# no rule of the constitution names a counter for any of these units, then or now
for at in (V7, A1022, A1113, UPTO):
    t = git('show', f'{at}:{PROTO}')
    ok(not re.search(r'(count(ed)? (by|with)|segment|UAX|code point|byte)', t, re.I), f'{at[:7]}: the constitution names no counter')

# ———————————————————————————————————————————— 2. the items each rule bound
def versions(path_args, since):
    rows = []
    for l in git('log', '--reverse', '--format=@%H %aI %an', '--name-status', f'{since}..{UPTO}', '--', *path_args).split('\n'):
        if l.startswith('@'):
            H, d, a = l[1:].split(' ', 2)
        elif l.strip():
            st, *ps = l.split('\t')
            if st.startswith('D'):
                continue
            rows.append((H, d, a, ps[-1], st[0]))
    return rows


items, texts = [], {}


def add(rule, H, d, a, path, text, label):
    k = f'i{len(items):04d}'
    items.append({'k': k, 'rule': rule, 'h': H[:7], 'H': H, 'date': utc(d), 'author': a, 'path': path, 'label': label})
    texts[k] = text


rid = {r['id']: r for r in RULES}
for H, d, a, p, st in versions(['BULLETIN.md'], V7):
    t = git('show', f'{H}:{p}')
    dt = datetime.fromisoformat(d).astimezone(timezone.utc)
    if dt < T1113:
        add('bulletin-lines', H, d, a, p, t, 'bulletin')
    else:
        add('bulletin-lines-defined', H, d, a, p, t, 'bulletin')
        add('bulletin-words', H, d, a, p, t, 'bulletin')
# every committed version of a journal note, as of the bulletin and the digest; a note renamed keeps its versions. A note
# is bound by the rule in force when it was first written (a later edit of an older note does not move it to a new rule).
first = {}
for H, d, a, p, st in versions(['journal/'], V7):
    if not p.endswith('.md'):
        continue
    dt = datetime.fromisoformat(d).astimezone(timezone.utc)
    first.setdefault(p, dt)
    add('journal-lines' if first[p] < T1113 else 'journal-words', H, d, a, p, git('show', f'{H}:{p}'), p.split('/')[-1])
ok(not any(it['rule'] == 'journal-lines' and it['date'] >= utc(A1113 and git('show', '-s', '--format=%aI', A1113).strip()) for it in items), 'no note written before 13 November was edited after it')
for l in git('log', '--reverse', '--format=%H\t%aI\t%an\t%s', f'{A1113}..{UPTO}').strip().split('\n'):
    H, d, a, s = l.split('\t', 3)
    if a == 'Ulysses':
        add('subject-chars', H, d, a, None, s, 'atlas' if s.startswith('atlas:') else 'session')
# a score or critique is bound where it stands beside its work (artifacts/); the copies a presentation carries are the
# same text again and are not counted twice. The amendment of 2026-10-22 binds from cycle 010: "Cycle 009 finishes under
# the rules before them", so the score of cycle 009 is listed and marked as not bound.
copies = 0
for name, rule in (('SCORE.md', 'score-lines'), ('CRITIQUE.md', 'critique-lines')):
    for H, d, a, p, st in versions([f'*{name}'], A1022):
        if os.path.basename(p) != name:
            continue
        if p.startswith('presentations/'):
            copies += 1
            continue
        add(rule, H, d, a, p, git('show', f'{H}:{p}'), p.split('/')[-2])
        if p.startswith('artifacts/cycle-009/'):
            items[-1]['exempt'] = 'cycle 009 finishes under the rules before the amendment of 2026-10-22'
ok('Cycle 009 finishes under the rules before them' in re.sub(r'\s+', ' ', git('show', f'{A1022}:{PROTO}')), 'the amendment of 2026-10-22 exempts cycle 009, quoted')
ok(len(items) == len(texts), f'{len(items)} items bound by the rules')

# ———————————————————————————————————————————— 3. every reading of every item
with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as tf:
    json.dump(texts, tf)
res = subprocess.run(['node', os.path.join(HERE, 'readings.mjs'), tf.name], capture_output=True, text=True)
os.unlink(tf.name)
ok(res.returncode == 0, 'readings ran in this runtime and in a browser engine' + ('' if res.returncode == 0 else ': ' + res.stderr[-300:]))
RD = json.loads(res.stdout)
for it in items:
    r = rid[it['rule']]
    rd = RD['r'][it['k']]
    it['n'] = {x: rd[x] for x in r['readings']}
    lo, hi = min(it['n'].values()), max(it['n'].values())
    it['lo'], it['hi'] = lo, hi
    it['verdict'] = 'kept' if hi <= r['limit'] else ('broken' if lo > r['limit'] else 'open')
    if it.get('exempt'):
        it['verdict'] = 'not bound'
    it['all'] = rd
ok(all(it['all']['browser_sentences'] == it['all']['sentences'] for it in items), 'the browser engine finds the same sentences as this runtime')
ok(all(it['all']['browser_graphemes'] == it['all']['graphemes'] for it in items), 'and the same graphemes')

# ———————————————————————————————————————————— 4. what the bulletin said of itself while it counted itself
# From 2026-09-19 the bulletin carried a line "Counted by: …" about itself. Every form it took is read here, and every
# figure it gave is checked against the readings of the same version.
FULL = re.compile(r'Counted by:\s*([\d,]+) stored lines\s*·\s*([\d,]+) non-blank\s*·\s*([\d,]+) words under UAX29-C2-1')
WORDS = re.compile(r'Counted by:\s*UAX29-C2-1,\s*([\d,]+) words,\s*(\d+) min (\d+) s at 184')
MIN = re.compile(r'\**(\d+) minutes (\d+) seconds\**\s+at 184 words a minute')
selfc = []
for H, d, a, p, st in versions(['BULLETIN.md'], '63a84eb^'):
    t = git('show', f'{H}:{p}')
    m = re.search(r'Counted by:(.*?)\*?\s*(— The Atelier|$)', t, re.M)
    if not m:
        continue
    line = 'Counted by:' + m.group(1)
    rec = {'h': H[:7], 'H': H, 'date': utc(d), 'line': line.strip()}
    match = [it for it in items if it['H'] == H and it['label'] == 'bulletin']
    if not match:          # a version before v7 bound it is not in the items; read it here
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as tf:
            json.dump({'x': t}, tf)
        rd = json.loads(subprocess.run(['node', os.path.join(HERE, 'readings.mjs'), tf.name], capture_output=True, text=True).stdout)['r']['x']
        os.unlink(tf.name)
    else:
        rd = match[0]['all']
    f = FULL.search(line); w = WORDS.search(line); mn = MIN.search(line)
    if f:
        rec['form'] = 'lines and words'
        rec['said'] = {'file': int(f.group(1).replace(',', '')), 'text': int(f.group(2).replace(',', '')), 'declared': int(f.group(3).replace(',', ''))}
    elif w:
        rec['form'] = 'words'
        rec['said'] = {'declared': int(w.group(1).replace(',', ''))}
    else:
        rec['form'] = 'approximated' if 'approximated' in line else 'the counter\'s name'
        rec['said'] = {}
    if mn or w:
        mm, ss = (int(mn.group(1)), int(mn.group(2))) if mn else (int(w.group(2)), int(w.group(3)))
        rec['minutes'] = [mm, ss]
        # the line writes its own breach of the two-minute rule when it sets a longer time against "a limit of two"
        rec['over_said'] = 'against a limit of two' in line and (mm, ss) > (2, 0)
        # the minutes are the words over 184 a minute, rounded to the second
        secs = round(rec['said']['declared'] * 60 / 184)
        ok(secs == mm * 60 + ss, f'{H[:7]}: {rec["said"]["declared"]} words at 184 a minute are {secs // 60} min {secs % 60} s, as the line says')
    rec['is'] = {k: rd[k] for k in ('file', 'text', 'declared')}
    rec['exact'] = all(rec['is'][k] == v for k, v in rec['said'].items())
    selfc.append(rec)
ok(len(selfc) > 0, f'{len(selfc)} versions of the bulletin carry a line on their own count')
figs = [s for s in selfc if s['said']]
ok(all(s['exact'] for s in figs), f'every figure the bulletin gave of itself is exact ({len(figs)} versions)')
last_self = selfc[-1]
after_last = [it for it in items if it['label'] == 'bulletin' and it['date'] > last_self['date']]
stop = after_last[0] if after_last else None
SELFF = {'versions': len(selfc), 'with_figures': len(figs), 'forms': dict(Counter(s['form'] for s in selfc)),
         'said_over': sum(1 for s in selfc if s.get('over_said')), 'first': selfc[0]['date'], 'last': last_self['date'],
         'last_figure': figs[-1]['date'], 'stop': stop['h'] if stop else None, 'stop_date': stop['date'] if stop else None}
ov = [x for x in selfc if x.get('over_said')]
lim = [x for x in selfc if x.get('minutes') and not x.get('over_said')]
fmt_t = lambda m: f'{m[0]} min {m[1]} s'
SELFF.update({'over_first': fmt_t(ov[0]['minutes']), 'over_last': fmt_t(ov[-1]['minutes']), 'at_limit': fmt_t(lim[0]['minutes']),
              'at_limit_date': lim[0]['date'][:10], 'approx_first': next(x['date'][:10] for x in selfc if x['form'] == 'approximated'),
              'last_day': selfc[-1]['date'][:10]})
ok(all(a['minutes'] > b['minutes'] for a, b in zip(ov, ov[1:])), 'each night it wrote itself over, the time was shorter than the night before')
ok(lim and lim[0]['minutes'] == [2, 0] and lim[0]['date'] > ov[-1]['date'], 'the next version with a time stands on the limit')
# Every version's reading time at the bulletin's own rate, 184 words a minute, said or not (a correction of
# 2026-11-20 by the convened critic: the count stopped on the limit, and the next version was over again).
rate = lambda w: round(w * 60 / 184)
fmt_s = lambda x: f'{x // 60} min {x % 60} s'
for x in selfc:
    x['secs'] = rate(x['is']['declared'])
post = [x for x in selfc if x['date'] > lim[0]['date']]
after7 = [it for it in items if it['rule'] == 'bulletin-lines' and it['date'] > last_self['date']][:7]
pmax = max(post, key=lambda x: x['secs'])
SELFF.update({'post_n': len(post), 'post_over': sum(1 for x in post if x['secs'] > 120),
              'post_next': fmt_s(post[0]['secs']), 'post_next_words': post[0]['is']['declared'], 'post_next_date': post[0]['date'][:10],
              'post_max': fmt_s(pmax['secs']), 'post_max_words': pmax['is']['declared'],
              'after': [{'h': it['h'], 'date': it['date'], 'secs': rate(it['all']['declared'])} for it in after7]})
ok(all(x['secs'] == x['minutes'][0] * 60 + x['minutes'][1] for x in selfc if x.get('minutes')), 'the reading time drawn for each version is the one it gave, where it gave one')
ok(post[0]['secs'] > 120 and not post[0]['said'], f"the version after the limit reads in {SELFF['post_next']} and gives no figure")
ok(not any(x.get('over_said') for x in post), 'no version after the limit says it is over')
print('     ', SELFF)

# ———————————————————————————————————————————— 5. who wrote a breach down: the sessions' own sentences
# a sentence in this practice's bulletin or journal, after the rule took effect, that gives a figure in the rule's unit for
# the bulletin, the journal entry, the subject, the score or the critique, or names on which side of its limit it stood
WROTE = re.compile(r'(bulletin|journal|this entry|this note|subject|score|critique)[^.\n]{0,80}?(\b\d[\d,]*\s*(words|lines|characters)\b|over (its|the) (cap|limit)|under (its|the) (cap|limit)|trimmed to fit)', re.I)
said = []
for H, d, a, p, st in versions(['BULLETIN.md', 'journal/'], V7):
    if datetime.fromisoformat(d).astimezone(timezone.utc) < T7:
        continue
    diff = git('show', '--format=', '--unified=0', H, '--', p)
    for l in diff.split('\n'):
        if l.startswith('+') and not l.startswith('+++') and 'Counted by:' not in l:
            for m in WROTE.finditer(l):
                said.append({'h': H[:7], 'date': utc(d), 'file': p, 'text': l[1:].strip()[:400], 'hit': m.group(0)})
ok(True, f'{len(said)} candidate sentences on the record\'s own length found by the search (coded below)')

# the commit messages, searched the same way (a session often wrote its record's length there, not in the record)
MSG = re.compile(r'(\b\d[\d,]*\s*(stored )?(lines|words|characters)\b|line cap|40-line)', re.I)
for l in git('log', '--format=@@%H %aI%n%B', f'{V7}..{UPTO}', '--author=Ulysses').split('\n'):
    if l.startswith('@@'):
        H, d = l[2:].split(' ', 1); continue
    if MSG.search(l) and re.search(r'bulletin|journal|note|subject|score|critique|record|cap', l, re.I) and (not re.search(r'digest|2,500|2 500|STATE-OF', l) or 'line cap' in l):
        said.append({'h': H[:7], 'date': utc(d), 'file': '@message', 'text': l.strip()[:400], 'hit': MSG.search(l).group(0)})

# ———————————————————————————————————————————— 6. the Field's census, another practice reading the same items
census = {}
if not OFFLINE:
    C = json.loads(urllib.request.urlopen(CENSUS, timeout=60).read())
    for c in C:
        if c['practice'] == 'atelier':
            census.setdefault((c['rule'], c['commit'][:7], c.get('path')), c)
    for it in items:
        rule = {'bulletin-lines-defined': 'bulletin-lines'}.get(it['rule'], it['rule'])
        c = census.get((rule, it['h'], it['path'])) or census.get((rule, it['h'], None))
        if c:
            it['census'] = {'value': c['value'], 'breach': c['breach'], 'robust': c.get('robust')}

# ———————————————————————————————————————————— 7. figures
F = {}
for r in RULES:
    I = [it for it in items if it['rule'] == r['id']]
    v = Counter(it['verdict'] for it in I)
    F[r['id']] = {'items': len(I), 'kept': v['kept'], 'broken': v['broken'], 'open': v['open'],
                  'by': {x: sum(it['n'][x] > r['limit'] for it in I) for x in r['readings']},
                  'max': max((it['hi'] for it in I), default=None),
                  'census': sum(1 for it in I if it.get('census', {}).get('breach')),
                  'census_read': sum(1 for it in I if 'census' in it)}
    F[r['id']]['not_bound'] = v['not bound']
    ok(F[r['id']]['kept'] + F[r['id']]['broken'] + F[r['id']]['open'] + v['not bound'] == len(I), f'{r["id"]}: {len(I)} items: {v["kept"]} kept, {v["broken"]} broken, {v["open"]} open')
    print('     ', r['id'], F[r['id']])
F['copies'] = copies
F['all'] = {k: sum(F[r['id']][k] for r in RULES) for k in ('items', 'kept', 'broken', 'open', 'not_bound')}
F['all']['bound'] = F['all']['items'] - F['all']['not_bound']
F['self'] = SELFF
print('      all', F['all'])
for s in said:
    print('     said', s['h'], s['date'][:10], s['file'], '|', s['hit'])

# ———————————————————————————————————————————— 8. who wrote a breach down
# the search's hits, coded by hand (this practice reading itself, 2026-11-20): none names a breach of these six rules
CODES = {('63a84eb', 'BULLETIN.md'): 'names the rules, no item', ('c383101', 'journal/2026-09-22-the-hand-that-adds-nothing.md'): 'reading time, not a rule of length',
         ('9aee277', 'BULLETIN.md'): 'the digest', ('9aee277', 'journal/2026-10-14-the-least-the-words-allow.md'): 'the digest',
         ('78dd6f7', 'journal/2026-11-19-on-its-own-account-1.md'): 'says kept',
         ('21d4bb5', '@message'): 'names a breach', ('53f2f09', '@message'): 'corrects its own count',
         ('63a84eb', '@message'): 'names a breach', ('8c90218', '@message'): 'names no item; its own counts, kept'}
# the items each sighting names, read from what it points at: a note by its path, the window of 09-19 by its own list
NAMED = {'21d4bb5': ['journal/2026-09-06-dials.md'], '53f2f09': ['journal/2026-09-07-publish-the-range.md']}
w19 = json.loads(git('show', '63a84eb:window/cycle-003-session-10/data.json'))
NAMED['63a84eb'] = ['journal/' + x[len('journal-'):] + '.md' for x in w19['compliance']['L1']]
ok(len(NAMED['63a84eb']) == 8, f'the window of 2026-09-19 names {len(NAMED["63a84eb"])} records over the line cap as stored')
ok({(x['h'], x['file']) for x in said} == set(CODES), 'every hit of the search is coded, and no code is left without a hit')
for x in said:
    x['code'] = CODES[(x['h'], x['file'])]
# an item is written down if a sighting names its note, and the version it saw (the last at or before the sighting) is over
seen = {}
for h, paths in NAMED.items():
    t = utc(git('show', '-s', '--format=%aI', h).strip())
    for pth in paths:
        vs = [it for it in items if it['path'] == pth and it['date'] <= t and it['rule'] == 'journal-lines']
        if not vs:
            continue                                   # a note written before v7 bound it: named, but not an item here
        v = vs[-1] if h != '53f2f09' else [x for x in vs if x['h'] == '21d4bb5'][0]
        ok(v['n']['file'] > 40, f'{h} names {pth}: the version it saw, {v["h"]}, has {v["n"]["file"]} lines of the file')
        seen.setdefault(v['k'], {'by': h, 'date': t, 'lag': round((datetime.fromisoformat(t + '+00:00') - datetime.fromisoformat(v['date'] + '+00:00')).total_seconds() / 86400, 1)})
for it in items:
    if it['k'] in seen:
        it['seen'] = seen[it['k']]
F['seen_items'] = len(seen)
F['seen_verdicts'] = dict(Counter(it['verdict'] for it in items if it['k'] in seen))
F['seen_lag_max'] = max(x['lag'] for x in seen.values())
F['seen_last'] = max(x['date'] for x in seen.values())[:10]
F['seen_rules'] = sorted({it['rule'] for it in items if 'seen' in it})
ok(F['seen_rules'] == ['journal-lines'], 'every item this practice wrote down is a journal note under the line cap of 30 August')
F['said_breach_after'] = sum(1 for x in said if x['code'] == 'names a breach' and x['date'] > F['seen_last'] + 'T23:59')
ok(F['said_breach_after'] == 0, f'after {F["seen_last"]} no sentence of this practice names a breach of these rules')
F['said_n'] = len(said)
F['said_breach'] = sum(1 for x in said if x['code'] == 'names a breach')
# the one sentence on these rules since 2026-11-13 says the bulletin it closes was trimmed to fit "both counters"
claim = [x for x in said if x['code'] == 'says kept'][0]
claim['text'] = 'This bulletin was trimmed to fit both counters, since the protocol names none for it.'
ok(claim['text'] in git('show', f'{claim["h"]}:{claim["file"]}'), 'the sentence is quoted as committed')
bt = [it for it in items if it['h'] == claim['h'] and it['rule'] == 'bulletin-words'][0]
F['claim'] = {'h': claim['h'], 'declared': bt['n']['declared'], 'browser': bt['n']['browser'], 'spaces': bt['n']['spaces'], 'field': bt['n']['field']}
ok(bt['n']['declared'] <= 400 < bt['n']['browser'], f'the bulletin "trimmed to fit both counters" is {bt["n"]["declared"]} by the declared rule and {bt["n"]["browser"]} in a browser engine')
# the census: when another practice first marked them
if not OFFLINE:
    tc = datetime.fromisoformat(json.loads(urllib.request.urlopen('https://api.github.com/repos/frankbueltge/field-research/commits/a26d1dce78ac3b10c20c93997906d6904ba855a3', timeout=60).read())['commit']['author']['date'].replace('Z', '+00:00'))
    F['census_time'] = tc.strftime('%Y-%m-%dT%H:%M')
    marked = [it for it in items if it.get('census', {}).get('breach')]
    lag = sorted((tc - datetime.fromisoformat(it['date'] + '+00:00')).total_seconds() / 86400 for it in marked)
    F['census_marked'] = len(marked)
    F['census_by_verdict'] = dict(Counter(it['verdict'] for it in marked))
    F['census_lag_min'], F['census_lag_max'] = round(lag[0]), round(lag[-1])
    F['census_lag_median'] = round(lag[len(lag) // 2])
    # in this practice's lane the census also read the presentations' copies of scores and critiques
    cs = [c for c in C if c['practice'] == 'atelier' and c['rule'] in ('score-lines', 'critique-lines') and c['breach']]
    F['census_copies'] = sum(1 for c in cs if (c.get('path') or '').startswith('presentations/'))
    F['census_c009'] = sum(1 for c in cs if 'cycle-009' in (c.get('path') or ''))
    F['census_sc'] = len(cs)
    F['census_both'] = sum(1 for c in cs if (c.get('path') or '').startswith('presentations/cycle-009/'))
    F['census_read'] = F['census_sc'] - F['census_copies'] - F['census_c009'] + F['census_both']
    assert F['census_read'] == sum(1 for c in cs if not (c.get('path') or '').startswith('presentations/') and 'cycle-009' not in (c.get('path') or ''))
    unsettled = [it for it in items if it['verdict'] == 'open']
    F['open_census_breach'] = sum(1 for it in unsettled if it.get('census', {}).get('breach'))
    F['open_census_kept'] = sum(1 for it in unsettled if it.get('census') and not it['census']['breach'])
    print('      census', {k: F[k] for k in F if k.startswith('census') or k.startswith('open_')})
F['claim_said'] = claim['text']

# ———————————————————————————————————————————— 8b. the reading of Fine this state rests on, as fetched
if not OFFLINE:
    import hashlib, html as _html
    S = [x for x in json.load(open(os.path.join(HERE, 'sources.json')))['sources'] if x['id'] == 'sorensen2022'][0]
    raw = urllib.request.urlopen(S['url'], timeout=60).read()
    ok(hashlib.sha256(raw).hexdigest() == S['sha256'], 'the encyclopedia entry matches the hash recorded on 2026-10-14')
    page = re.sub(r'\s+', ' ', _html.unescape(re.sub(r'<[^>]+>', ' ', raw.decode('utf-8', 'replace'))))
    for q in S['passages']:
        ok(re.sub(r'\s+', ' ', q['text']) in page, f'sorensen2022: "{q["text"][:40]}…" on the page')

# ———————————————————————————————————————————— 9. write
RJ = {'rules': [{k: r[k] for k in ('id', 'what', 'limit', 'unit', 'quote', 'at', 'at_date', 'readings')} for r in RULES],
      'items': [{k: it[k] for k in ('k', 'rule', 'h', 'date', 'author', 'path', 'label', 'n', 'lo', 'hi', 'verdict') } |
                ({'census': it['census']} if 'census' in it else {}) | ({'exempt': it['exempt']} if 'exempt' in it else {}) | ({'seen': it['seen']} if 'seen' in it else {}) for it in items],
      'self': [{k: x[k] for k in x if k != 'H'} for x in selfc], 'said': said, 'figures': F,
      'runtime': {'icu': RD['icu'], 'unicode': RD['unicode'], 'browser': RD['browser']}}
json.dump(RJ, open(os.path.join(HERE, 'data', 'rules.json'), 'w'), ensure_ascii=False, indent=1)
wt = {it['k']: texts[it['k']] for it in items if rid[it['rule']]['unit'] == 'word'}
with open(os.path.join(HERE, 'data', 'rules.js'), 'w', encoding='utf-8') as f:
    f.write('window.RULES=' + json.dumps(RJ, ensure_ascii=False, separators=(',', ':')) + ';\n')
    f.write('window.RTEXTS=' + json.dumps(wt, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f'\n{len(fails)} failed' if fails else '\nall checks passed')
sys.exit(1 if fails else 0)
