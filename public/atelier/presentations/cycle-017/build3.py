#!/usr/bin/env python3
"""On Its Own Account, state 3: the check. It starts nothing new; it reads the work's claims a second time.

Run from this folder:  python3 build3.py            (needs git with full history, node and a Chromium for playwright,
                                                     and network for the Field's files at a pinned commit)
                       python3 build3.py --offline  (skips what lies in other repositories)
                       python3 build3.py --fine <path to a text of Fine 1975>   (also finds the passages in it)

What it checks, each against its source and without the first reading in view:
  1. the sentences of states 1 and 2, coded again by a convened reader who saw the sentences and the codebook, never
     the first codes (blind3-task.json is what the reader saw, blind3.json what it wrote); agreement, every
     disagreement read here, and what moves on the page;
  2. the weakest claim, chased to its source: section II and IV read vagueness through an encyclopedia; Fine's paper,
     read in full, separates vagueness from ambiguity, and the open items are sorted by which of the two opens them;
  3. the seventh limit the critique named: a session's record "cannot be understood in two minutes", every bulletin
     version read at four admissible reading rates and four readings of a word;
  4. every figure taken from a sibling, read again with the caveat the sibling now gives it (the Field's check 87);
  5. the Field's offer of 2026-11-20, six acts of authority, read at their commits where they are this practice's;
  6. Nisbett and Wilson's design, run: the doer's count of a version against the next session's count of the same one.
  7. the journal ceiling struck on 30 August, which state 2 left out and said the check would read.

Writes data/check.json and data/check.js. Nothing here asks a model; the blind codes were written before this ran.
"""
import hashlib, json, os, re, subprocess, sys, tempfile, urllib.request
from collections import Counter
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(['git', '-C', HERE, 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip()
OFFLINE = '--offline' in sys.argv
FINE = sys.argv[sys.argv.index('--fine') + 1] if '--fine' in sys.argv else None
UPTO = '78dd6f7bde32f23f7e84e7adbb9e9c14a06b9794'     # the same items as state 2
V7 = '155e603'
FIELD = 'ce3a5de5e069d3b76265d54cfd853e71471a1408'     # field-research main after its check 87 (session 285, 2026-11-20)
RAWF = 'https://raw.githubusercontent.com/frankbueltge/field-research/' + FIELD + '/artifacts/cycle-017/what-the-house-did-unasked/'
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def git(*a):
    return subprocess.run(['git', '-C', REPO, *a], capture_output=True, text=True).stdout


def flat(t):
    return re.sub(r'\s+', ' ', t)


def utc(s):
    return datetime.fromisoformat(s).astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M')


ok(git('rev-parse', '--is-shallow-repository').strip() == 'false', 'the clone holds the full history')
R2 = json.load(open(os.path.join(HERE, 'data', 'rules.json')))
D1 = json.load(open(os.path.join(HERE, 'data', 'digest.json')))
REP = json.load(open(os.path.join(HERE, 'reports.json')))
rules = {r['id']: r for r in R2['rules']}
items = R2['items']
C = {}

# ———————————————————————————————————————————— 1. the sentences, coded a second time, blind
task = json.load(open(os.path.join(HERE, 'blind3-task.json')))
blind = json.load(open(os.path.join(HERE, 'blind3.json')))
ok(not any(k in json.dumps(task) for k in ('"method"', '"says"', '"kind"', '"code"')), 'the reader\'s task carries none of the first codes')
ok([x['id'] for x in task['reports']] == [r['id'] for r in REP['reports']] == [x['id'] for x in blind['reports']], 'the reader coded every report, in order')
ok(len(task['said']) == len(R2['said']) == len(blind['said']), 'and every sentence of state 2')
for x, r in zip(task['reports'], REP['reports']):
    ok(flat(r['quote']) in x['context'] and x['sentence'] == r['quote'], f'{r["id"]}: the reader saw the sentence as committed')


def kappa(pairs):
    n = len(pairs)
    po = sum(a == b for a, b in pairs) / n
    ca, cb = Counter(a for a, _ in pairs), Counter(b for _, b in pairs)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / n / n
    return {'n': n, 'agree': sum(a == b for a, b in pairs), 'kappa': round((po - pe) / (1 - pe), 2) if pe < 1 else 1.0}


bb = {x['id']: x for x in blind['reports']}
agree = {f: kappa([(r.get(f), bb[r['id']].get(f)) for r in REP['reports']]) for f in ('kind', 'figure', 'says', 'method')}
bs = [x['code'] for x in blind['said']]
agree['said'] = kappa([(x['code'], b) for x, b in zip(R2['said'], bs)])
print('     agreement', agree)
# every disagreement, read here against the sentence in its file; the reading decides, and says why
ADJ = {
    ('report', 's07', 'method'): ('unstated', 'The label "(UAX#29 word count)" follows the second figure, 2,499; the 2,616 the session found stands bare. The blind reading holds.'),
    ('report', 's08', 'method'): ('declared', '"The strict count" can only be the rule declared on 19 September as "the strictest"; it gives no figure, so no count on the page moves. The blind reading holds.'),
    ('said', '21d4bb5', 'names a breach'): ('says kept', 'The subject "the session note to its 40-line cap" says the note was brought to its cap; it names no breach. The next commit corrected it to 42 lines. The first code was a slip; the page\'s prose already said so.'),
    ('said', '63a84eb', 'names a breach'): ('names a breach', 'The subject gives "8 of 37 records over the line cap as stored" and names none; the eight are named in the window it commits (data.json, compliance L1). The first code holds, by the window, not by the sentence.'),
}
dis = []
for r in REP['reports']:
    for f in ('kind', 'figure', 'says', 'method'):
        if r.get(f) != bb[r['id']].get(f):
            a = ADJ.get(('report', r['id'], f))
            ok(a is not None, f'{r["id"]} {f}: the disagreement is read here')
            dis.append({'what': 'report', 'id': r['id'], 'field': f, 'first': r.get(f), 'blind': bb[r['id']].get(f), 'final': a[0], 'why': a[1], 'quote': r['quote']})
for x, b, t in zip(R2['said'], blind['said'], task['said']):
    if x['code'] != b['code']:
        a = ADJ.get(('said', x['h'], x['code']))
        ok(a is not None, f'{x["h"]} said: the disagreement is read here')
        dis.append({'what': 'said', 'id': b['id'], 'h': x['h'], 'first': x['code'], 'blind': b['code'], 'final': a[0], 'why': a[1], 'quote': x['text']})
ok(len(ADJ) == len(dis), f'{len(dis)} disagreements, each read once')
# what moves: section I's figures rest on the end reports (all codes agree); the method sentence counts the sessions that
# counted a predecessor's file at open by the declared rule
reps = D1['reports']
final_method = {r['id']: next((d['final'] for d in dis if d['what'] == 'report' and d['id'] == r['id'] and d['field'] == 'method'), r['method']) for r in REP['reports']}
end_dis = [d for d in dis if d['what'] == 'report' and next(r for r in REP['reports'] if r['id'] == d['id'])['kind'] == 'end']
ok(not end_dis, 'no disagreement touches a report of the state a session left: every figure of section I holds')
op_first = [r for r in reps if r['kind'] == 'open' and r['method'] == 'declared' and r['figure']]
op_final = [r for r in reps if r['kind'] == 'open' and final_method[r['id']] == 'declared' and r['figure']]
C['blind'] = {'agree': agree, 'disagreements': dis, 'open_declared_first': len(op_first), 'open_declared_final': len(op_final),
              'open_bare_exact': sum(1 for r in reps if r['kind'] == 'open' and final_method[r['id']] == 'unstated' and r['figure'] and r['exact']),
              'open_figure_exact': sum(1 for r in reps if r['kind'] == 'open' and r['figure'] and r['exact']),
              'items': len(REP['reports']) + len(R2['said'])}
ok(C['blind']['open_declared_first'] == 6 and C['blind']['open_declared_final'] == 5, 'the method note said six sessions counted at open by the declared rule; five name it, one gives a bare figure')
ok(all(r['exact'] for r in op_first), 'all six figures are exact, so the rule has not moved under them')

# ———————————————————————————————————————————— 2. vagueness or ambiguity: Fine, read in full
# Fine (1975, 265-6) sets vagueness, "deficiency of meaning", apart from ambiguity: a vague word's meaning is
# under-determined, an ambiguous word's over-determined. The truth conditions match (282): true if true on every
# precisification, or on every disambiguation. How they are grasped does not: "to assert an ambiguous sentence is to
# assert, severally, each of its disambiguations"; precisifications "are extended from a common basis".
# Read on the six limits: a line of the file and a line with text extend one basis (does a blank line count?): a
# vagueness. A paragraph is another sense of "line", not a sharper one: an ambiguity. The readings of a word part
# only at its margin (a file name, a dash): a vagueness. The house's "a sentence or two" is vague by its own wording.
SENSES = {'line': [['file', 'text'], ['block']], 'word': [['declared', 'browser', 'spaces', 'field']]}


def sort_open(it):
    r = rules[it['rule']]
    if r['unit'] == 'word':
        return 'word'
    if it['rule'] == 'bulletin-lines-defined':
        return 'sentence'
    typo = [it['n'][x] for x in ('file', 'text')]
    return 'sense' if min(typo) > r['limit'] else 'blank'


opn = [it for it in items if it['verdict'] == 'open']
for it in opn:
    it['sort'] = sort_open(it)
srt = Counter(it['sort'] for it in opn)
ok(sum(srt.values()) == len(opn) == 38, f'the 38 open items sort into {dict(srt)}')
ok(all(it['n']['block'] <= rules[it['rule']]['limit'] for it in opn if it['sort'] in ('sense', 'blank')), 'every open item under a line limit is kept as paragraphs: the paragraph is what opens it')
ok(all(rules[it['rule']]['unit'] != 'char' for it in opn), 'no commit subject is open')
sense = [it for it in opn if it['sort'] == 'sense']
cen_b = [it for it in opn if it.get('census', {}).get('breach')]
cen_k = [it for it in opn if it.get('census') and not it['census']['breach']]
ok({it['k'] for it in cen_b} == {it['k'] for it in sense}, f'the census\'s {len(cen_b)} breaches among the open items are exactly the {len(sense)} that break a typed line on both counts')
ok(all(it['sort'] in ('blank', 'word') for it in cen_k), f'every one of the census\'s {len(cen_k)} "kept" among the open items is a gap of vagueness, closed for the writer')
seen = [it for it in items if 'seen' in it]
C['fine'] = {
    'open': len(opn), 'sense': srt['sense'], 'blank': srt['blank'], 'word': srt['word'], 'gaps': srt['blank'] + srt['word'],
    'sense_by_rule': dict(Counter(it['rule'] for it in sense)),
    'seen': len(seen), 'seen_sense': sum(1 for it in seen if it.get('sort') == 'sense'), 'seen_blank': sum(1 for it in seen if it.get('sort') == 'blank'),
    'census_breach': len(cen_b), 'census_kept': len(cen_k),
    'census_kept_blank': sum(1 for it in cen_k if it['sort'] == 'blank'), 'census_kept_word': sum(1 for it in cen_k if it['sort'] == 'word'),
    'struck_block': {'kept': sum(1 for it in items if it['verdict'] == 'kept'), 'broken': R2['figures']['all']['broken'] + srt['sense'], 'open': srt['blank'] + srt['word']},
    'sorts': {it['k']: it['sort'] for it in opn},
}
ok(C['fine']['seen'] == 8 and C['fine']['seen_sense'] + C['fine']['seen_blank'] == 8, f'of the 8 items this practice named over, {C["fine"]["seen_sense"]} broke a typed line on both counts, {C["fine"]["seen_blank"]} rest on a blank line')
# the a2ef1c1 note: the census read the lines a commit appended to a renamed note, not the note
C2 = None
if not OFFLINE:
    C2 = json.loads(urllib.request.urlopen('https://raw.githubusercontent.com/frankbueltge/field-research/a26d1dce78ac3b10c20c93997906d6904ba855a3/artifacts/cycle-017/what-the-house-did-unasked/items85.json', timeout=90).read())
    ap = [c for c in C2 if c['practice'] == 'atelier' and c['rule'] == 'journal-lines' and c['commit'].startswith('a2ef1c1')][0]
    mine = [it for it in items if it['h'] == 'a2ef1c1' and it['rule'] == 'journal-lines'][0]
    ok(ap.get('detail') == 'appended' and ap['value'] == 7 and mine['n']['text'] == 40, 'a2ef1c1: the census counted the 7 lines a commit appended to a renamed note; the note holds 40 with text')
    C['fine']['appended'] = {'h': 'a2ef1c1', 'path': mine['path'], 'census': ap['value'], 'text': mine['n']['text'], 'file': mine['n']['file']}
# the passages, as read; the text was fetched through a page-extraction service from a scan of the journal pages
SRC = json.load(open(os.path.join(HERE, 'sources.json')))
fine = [s for s in SRC['sources'] if s['id'] == 'fine1975'][0]
if FINE:
    t = flat(re.sub(r'\*\*', '', open(FINE, encoding='utf-8').read()))
    joined = re.sub(r'\s+', '', t).lower()
    for q in fine['passages']:
        ok(re.sub(r'\s+', '', q['text']).lower() in joined, f'fine1975: "{q["text"][:40]}…" in the text read')
else:
    print('     (fine1975: passages recorded in sources.json; run with --fine <text> to find them again)')

# ———————————————————————————————————————————— 3. the seventh limit: two minutes
# "the architect must be able to follow every session, and a session whose record cannot be understood in two minutes
# has failed its record" (v7, 2026-08-30; today PROTOCOL.md 4.2). It names no reader, no rate and no test of
# "understood". Read here: the bulletin alone (the reading kindest to the writer; the record as bulletin and session
# note together, as the window of 2026-09-20 read it, only adds), at four rates of four readings of a word.
RATES = [
    {'x': 'r175', 'wpm': 175, 'what': 'the slowest of most adults reading English non-fiction silently', 'src': 'brysbaert2019'},
    {'x': 'r184', 'wpm': 184, 'what': 'reading aloud, the all-language mean this practice took on 2026-09-20 and its bulletin used', 'src': 'irest2012'},
    {'x': 'r238', 'wpm': 238, 'what': 'the mean of adults reading English non-fiction silently', 'src': 'brysbaert2019'},
    {'x': 'r300', 'wpm': 300, 'what': 'the fastest of most adults reading English non-fiction silently', 'src': 'brysbaert2019'},
]
ok('a session whose record cannot be understood in two minutes' in flat(git('show', f'{V7}:PROTOCOL.md')), 'the rule as v7 wrote it')
ok('a record that cannot be understood in two minutes has failed' in flat(git('show', f'{UPTO}:PROTOCOL.md')), 'and as it stands now')
ok(not re.search(r'words (a|per) minute|reading (rate|speed)', git('show', f'{UPTO}:PROTOCOL.md'), re.I), 'the constitution names no reading rate')
vs = []
for l in git('log', '--reverse', '--format=@%H %aI', f'{V7}..{UPTO}', '--', 'BULLETIN.md').split('\n'):
    if l.startswith('@'):
        H, d = l[1:].split(' ', 1)
        vs.append((H, d))
want = [it for it in items if it['label'] == 'bulletin' and it['rule'] in ('bulletin-lines', 'bulletin-lines-defined')]
ok([H[:7] for H, _ in vs] == [it['h'] for it in want], f'the {len(vs)} versions are the bulletins of section II')
texts = {H[:7]: git('show', f'{H}:BULLETIN.md') for H, _ in vs}
with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as tf:
    json.dump(texts, tf)
res = subprocess.run(['node', os.path.join(HERE, 'readings.mjs'), tf.name], capture_output=True, text=True)
os.unlink(tf.name)
ok(res.returncode == 0, 'the words of every bulletin read in this runtime and in a browser engine')
RD = json.loads(res.stdout)['r']
W = ['declared', 'browser', 'spaces', 'field']
for it in want:
    if it['rule'] == 'bulletin-lines-defined':
        bw = [x for x in items if x['h'] == it['h'] and x['rule'] == 'bulletin-words'][0]
        ok(all(bw['n'][w] == RD[it['h']][w] for w in W), f'{it["h"]}: the words match the 400-word row')
titems = []
for (H, d), it in zip(vs, want):
    n = {w: RD[H[:7]][w] for w in W}
    secs = {f'{w}.{r["x"]}': round(n[w] * 60 / r['wpm'], 1) for w in W for r in RATES}
    over = {k: n[k.split('.')[0]] * 60 > 120 * int(k.split('.r')[1]) for k in secs}
    v = 'kept' if not any(over.values()) else 'broken' if all(over.values()) else 'open'
    titems.append({'k': 't' + it['k'][1:], 'rule': 'record-time', 'h': it['h'], 'date': it['date'], 'author': it['author'], 'path': 'BULLETIN.md',
                   'label': 'bulletin', 'n': n, 'lo': min(secs.values()), 'hi': max(secs.values()), 'verdict': v})
tv = Counter(t['verdict'] for t in titems)
T = {'items': len(titems), 'kept': tv['kept'], 'broken': tv['broken'], 'open': tv['open'],
     'by_rate': {r['x']: sum(1 for t in titems if t['n']['declared'] * 60 > 120 * r['wpm']) for r in RATES},
     'max_words': max(t['n']['declared'] for t in titems), 'max_secs': max(t['hi'] for t in titems)}
# the two limits of one paragraph, read together: 400 words in two minutes needs a reader of 200 words a minute
T['words_for_two_min'] = {r['x']: 2 * r['wpm'] for r in RATES}
T['need_wpm'] = 200
since = [t for t in titems if t['date'] >= utc(git('show', '-s', '--format=%aI', 'fb60c16').strip())]
T['since_1113'] = len(since)
T['since_1113_words_ok_time_broken'] = sum(1 for t in since if max(t['n'].values()) <= 400 and t['n']['declared'] * 60 > 120 * 184)
T['since_1113_over_184'] = sum(1 for t in since if t['n']['declared'] * 60 > 120 * 184)
ok(T['kept'] + T['broken'] + T['open'] == len(titems), f'record-time: {len(titems)} items: {T["kept"]} kept, {T["broken"]} broken, {T["open"]} open')
print('     ', {k: v for k, v in T.items()})
C['time'] = {'rule': {'id': 'record-time', 'what': 'a session\'s record, read as its bulletin', 'limit': 120, 'unit': 'time',
                      'quote': 'a session whose record cannot be understood in two minutes has failed its record', 'at': V7,
                      'readings': [f'{w}.{r["x"]}' for w in W for r in RATES]},
             'rates': RATES, 'items': titems, 'figures': T}

# ———————————————————————————————————————————— 4. the siblings' figures, with the caveats they give them now
if not OFFLINE:
    r87 = json.loads(urllib.request.urlopen(RAWF + 'results87.json', timeout=90).read())
    cor = r87['correction85']
    ok(cor['relay'] == 'ho-2026-11-20-atelier-1' and cor['holds'] is True, 'the Field checked this practice\'s correction of 2026-11-20 and found it holds')
    was, now = cor['census_was']['by_practice']['atelier']['breach'], cor['census_now']['by_practice']['atelier']['breach']
    marked = [it for it in items if it.get('census', {}).get('breach')]
    exempt = [it for it in marked if it.get('exempt')]
    dig = [c for c in C2 if c['practice'] == 'atelier' and c['rule'] == 'digest-words' and c['breach']]
    ok(len(marked) == 23 and len(exempt) == 5, 'state 2 counted 23 census marks on its items, 5 of them cycle 009\'s score, which no limit bound')
    ok(len(marked) - len(exempt) + len(dig) == now, f'the census now counts {now} breaches in this lane (it counted {was}): the 18 bound items here, and the digest of section I')
    C['census'] = {'was': was, 'now': now, 'marked': len(marked), 'marked_bound': len(marked) - len(exempt), 'digest': len(dig),
                   'removed': cor['removed']['breach'], 'all_was': cor['census_was']['breach'], 'all_now': cor['census_now']['breach'],
                   'robust_now': cor['census_now']['robust'],
                   'kappa_deed': r87['partB']['agreement']['deed']['kappa'], 'readers_note': 'readers and finders ran on a smaller model; every disagreement and hash was read by the Field'}
    print('     census', C['census'])

# ———————————————————————————————————————————— 5. the Field's offer: six acts of authority, this practice's at their commits
if not OFFLINE:
    auth = r87['partB']['authority_deeds']
    c87 = json.loads(urllib.request.urlopen(RAWF + 'commits87.json', timeout=90).read())
    ok(len(auth) == 6, 'the Field codes six of the log\'s deeds as acts of authority')
    rows = {a['row']: a for a in auth}
    lane = [r for r in (169, 138) if r in rows]
    ok(lane == [169, 138], 'two of the six are this practice\'s: rows 169 and 138')
    A = []
    for row in lane:
        a = rows[row]
        cs = [d for d in c87['deeds'] if d['row'] == row]
        A.append({'row': row, 'date': a['date'], 'seer': a['seer'], 'relation': a['relation'], 'deed_line': a['deed_line'],
                  'legible': [d['legible'] for d in cs], 'commits': [c['hash'][:7] for d in cs for c in d.get('commits', []) if c['repo'] == 'ulysses']})
    # row 169: the v5 protocol, its caption, and what v4 already held under the architect's own name
    v5 = git('show', '-s', '--format=%an|%s', 'f00897e').strip().split('|', 1)
    v4 = git('show', '-s', '--format=%an|%aI', '14b4bb0').strip().split('|', 1)
    ok(v5[0] == 'Ulysses' and "Frank Bültge's decision" in v5[1], 'row 169: v5 is signed by this practice and captioned as the architect\'s decision')
    ok(v4[0] == 'Frank Bültge' and 'may not be delegated away' in flat(git('show', '14b4bb0:PROTOCOL.md')), 'v4, six days earlier in the architect\'s name, already held publication undelegable')
    ok('Nothing reaches a public work surface except through Frank\'s PUBLICATION.json' in flat(git('show', 'f00897e:PROTOCOL.md')) and 'PUBLICATION.json' not in git('show', '14b4bb0:PROTOCOL.md'), 'what v5 added was the file only he could sign, and the word inviolable')
    # row 138: the one act of authority a machine saw first; it is this practice's, in the deed's own commit
    msg = flat(git('show', '-s', '--format=%B', 'b9c5899'))
    ok('which breaches the one-in-four floor' in msg and 'Recorded rather than argued away' in msg, 'row 138: the commit that made the deed names it a breach')
    ok(sum(1 for a in auth if a['seer'] == 'the acting machine itself') == 1, 'and it is the only act of authority of the six whose first seer is the acting machine')
    C['authority'] = {'n': len(auth), 'lane': A, 'by_seer': dict(Counter(a['seer'] for a in auth)),
                      'v4_author': v4[0], 'v4_date': v4[1][:10], 'v5_caption': v5[1]}

# ———————————————————————————————————————————— 6. Nisbett and Wilson's design: actor against observer, one file
pairs = []
for o in [r for r in reps if r['kind'] == 'open']:
    act = [r for r in reps if r['kind'] == 'end' and r['about'] == o['about']]
    for a in act:
        pairs.append({'version': o['about'], 'actor': {'id': a['id'], 'commit': a['commit'], 'figure': a['figure'], 'method': final_method[a['id']], 'says': a['says'], 'exact': a['exact'], 'quote': a['quote']},
                      'observer': {'id': o['id'], 'commit': o['commit'], 'figure': o['figure'], 'method': final_method[o['id']], 'says': o['says'], 'exact': o['exact'], 'quote': o['quote']}, 'n': o['n']})
ok(len(pairs) == 1, f'{len(pairs)} version has both the doer\'s count and the next session\'s')
p = pairs[0]
ok(p['actor']['method'] == 'stand-in' and not p['actor']['exact'] and p['observer']['method'] == 'declared' and p['observer']['exact'], 'there the doer, with a stand-in, said under; the next session, with the declared rule, was exact')
byproc = {}
for r in reps:
    if not r['figure']:
        continue
    m = final_method[r['id']]
    key = ('actor' if r['kind'] == 'end' else 'observer') + '.' + m
    b = byproc.setdefault(key, {'n': 0, 'exact': 0, 'wrong_side': 0})
    b['n'] += 1
    b['exact'] += bool(r['exact'])
    b['wrong_side'] += (r['figure'] > 2500) != (r['n'] > 2500)
print('     by procedure', byproc)
ok(byproc['actor.declared']['exact'] == byproc['actor.declared']['n'] and byproc['observer.declared']['exact'] == byproc['observer.declared']['n'], 'with the declared rule, doer and next session are both exact every time')
C['nw'] = {'pairs': pairs, 'by_procedure': byproc}

# ———————————————————————————————————————————— 7. the limits struck on 30 August, which state 2 left out and said the check reads
# "Journal entries are minutes: ≤ 400 words" (the record ceiling of 2026-08-05, carried into v6 on 2026-08-08 as a floor),
# "Binds forward; existing records stand", struck by v7. A note is bound if it was first written while the limit stood;
# each of its versions committed while it stood is an item, read on the four readings of a word of section II.
A0805, V6 = '5315620', 'b171605'
ok('Journal entries are minutes: **≤ 400 words**' in git('show', f'{A0805}:PROTOCOL.md') and 'Binds forward; existing records stand' in flat(git('show', f'{A0805}:PROTOCOL.md')), 'the journal ceiling as 5 August wrote it, binding forward')
ok('400 words' not in git('show', f'{A0805}^:PROTOCOL.md'), 'and it was not there the day before')
ok('Journal entries ≤ 400 words; a work\'s process record < 3,000 words' in git('show', f'{V6}:PROTOCOL.md'), 'v6 carried it as a floor')
ok('≤ 400 words' not in git('show', f'{V7}:PROTOCOL.md'), 'v7 struck it')
TA, TS = datetime.fromisoformat(git('show', '-s', '--format=%aI', A0805).strip()), datetime.fromisoformat(git('show', '-s', '--format=%aI', V7).strip())
first, av, atexts = {}, [], {}
for l in git('log', '--reverse', '--format=@%H %aI %an', '--name-status', f'{A0805}..{V7}^', '--', 'journal/').split('\n'):
    if l.startswith('@'):
        H, d, a = l[1:].split(' ', 2)
        continue
    if not l.strip():
        continue
    st, *ps = l.split('\t')
    p = ps[-1]
    if st.startswith('D') or not p.endswith('.md'):
        continue
    if st.startswith('R'):
        first.setdefault(p, first.get(ps[0]))
    elif st.startswith('A'):
        first.setdefault(p, datetime.fromisoformat(d))
    else:
        first.setdefault(p, None)          # modified, never added in the window: written before it, an existing record
    if first[p] and TA <= first[p] < TS:
        k = f'a{len(av):03d}'
        av.append({'k': k, 'h': H[:7], 'date': utc(d), 'path': p, 'author': a})
        atexts[k] = git('show', f'{H}:{p}')

ok(len(av) > 0 and all(TA <= datetime.fromisoformat(git('show', '-s', '--format=%aI', it['h']).strip()) < TS for it in av), f'{len(av)} versions of {len({it["path"] for it in av})} notes written while the ceiling stood')
with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as tf:
    json.dump(atexts, tf)
res = subprocess.run(['node', os.path.join(HERE, 'readings.mjs'), tf.name], capture_output=True, text=True)
os.unlink(tf.name)
ok(res.returncode == 0, 'the August notes read in this runtime and in a browser engine')
ARD = json.loads(res.stdout)['r']
A = {'items': len(av), 'notes': len({it['path'] for it in av}), 'kept': 0, 'broken': 0, 'open': 0, 'by': {x: 0 for x in W}}
for it in av:
    it['n'] = {x: ARD[it['k']][x] for x in W}
    lo, hi = min(it['n'].values()), max(it['n'].values())
    it['verdict'] = 'kept' if hi <= 400 else ('broken' if lo > 400 else 'open')
    A[it['verdict']] += 1
    for x in W:
        A['by'][x] += it['n'][x] > 400
A['max'] = max(max(it['n'].values()) for it in av)
A['max_note'] = max(av, key=lambda it: max(it['n'].values()))['path'].split('/')[-1]
A['broken_notes'] = len({it['path'] for it in av if it['verdict'] == 'broken'})
A['open_notes'] = len({it['path'] for it in av if it['verdict'] == 'open'})
A['last_broken'] = max((it['date'] for it in av if it['verdict'] == 'broken'), default=None)
ok(A['kept'] + A['broken'] + A['open'] == A['items'], f'the journal ceiling: {A["items"]} versions, {A["kept"]} kept, {A["broken"]} broken, {A["open"]} open; over by reading {A["by"]}')
# nothing counted it: the house's validator of 12 August counted the score and the trace by the runs between spaces,
# read the journal only for a header, and left the process record unenforced because no single file is one
VAL = git('show', 'b71ddd2:tools/validate_v4_projects.py')
ok('WORD_FLOORS' in VAL and 'path.read_text(encoding="utf-8").split()' in VAL, 'b71ddd2: the validator counts words as the runs between spaces')
ok(not re.search(r'JOURNAL\b.*(word|split)', VAL) and 'no single file that is "the work\'s process record"' in VAL, 'b71ddd2: it counts no journal and leaves the process record unenforced, saying why')
A['validator'] = {'commit': 'b71ddd2', 'date': utc(git('show', '-s', '--format=%aI', 'b71ddd2').strip()), 'counts': 'spaces', 'journal': False, 'process_record': False}
# who wrote an overrun down: a bulletin, journal or commit message of the window that names a journal entry's words
said = []
for l in git('log', '--format=%H\t%aI\t%s%n%b', f'{A0805}..{V7}^').split('\n'):
    if re.search(r'journal[^.\n]{0,60}\b\d{3,4} words|\b\d{3,4} words[^.\n]{0,60}journal|400[- ]word', l, re.I):
        said.append(l[:200])
for H, d in [(x.split(' ', 1)) for x in git('log', '--format=%H %aI', f'{A0805}..{V7}^', '--', 'journal/', 'BULLETIN.md').split('\n') if x]:
    for p in git('diff-tree', '--no-commit-id', '--name-only', '-r', H).split('\n'):
        if p.startswith('journal/') or p == 'BULLETIN.md':
            for m in re.finditer(r'[^.\n]*(journal[^.\n]{0,60}\b\d{3,4} words|400[- ]word)[^.\n]*', git('show', f'{H}:{p}') if p else '', re.I):
                said.append(f'{H[:7]} {p}: {m.group(0)[:160]}')
A['said'] = sorted(set(said))
print('     august', {k: v for k, v in A.items() if k != 'said'})
for s in A['said'][:12]:
    print('       said:', s)
C['august'] = {'rule': {'quote': 'Journal entries are minutes: ≤ 400 words', 'at': A0805, 'v6': V6, 'struck': V7, 'limit': 400, 'readings': W},
               'figures': A, 'items': av}

# ———————————————————————————————————————————— write
C['pins'] = {'upto': UPTO, 'field': FIELD}
json.dump(C, open(os.path.join(HERE, 'data', 'check.json'), 'w'), ensure_ascii=False, indent=1)
with open(os.path.join(HERE, 'data', 'check.js'), 'w', encoding='utf-8') as f:
    f.write('window.CHECK=' + json.dumps(C, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f'\n{len(fails)} failed' if fails else '\nall checks passed')
sys.exit(1 if fails else 0)
