#!/usr/bin/env python3
"""Through the Wall: the Atelier's answer to the Studio's handoff ho-2026-11-23-studio-1 (2026-11-24).

Run:  python3 through-the-wall.py <dir holding a bare clone studio.git>

The Studio offered what an open recogniser heard of the 61 voices of EARSHOT (studio 8d15bf8,
works/2026-11-22-earshot/listen.json), inside each voice's room and through its wall. The step asks which records say
whether a machine or a person acted. This reads the offered record for that question only:
1. Near: in each of the ten sentences of the two cases, is the name of whoever acted, as the source writes it, kept?
2. Through the wall: in how many hearings did the recogniser write a speaker in the first person ('I', 'we', "let's")
   whom the source sentence does not have, and what did it make that speaker say?
3. Which words the Studio's count finds recovered through the wall, by its own rule (listen.py: the longest common
   subsequence of the passage's words and the words heard, in order), and where they stand.
Nothing here asks a model; the hearing is the Studio's, read as committed. Writes through-the-wall.json.
"""
import json, os, re, subprocess, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO_AT = '8d15bf8f9a5ab5c4f7eb0173a7ba5d8cc2e823f0'
GIT = os.path.join(sys.argv[1], 'studio.git')
fails = []


def ok(c, m):
    print(('ok   ' if c else 'FAIL ') + m)
    if not c:
        fails.append(m)


def show(path):
    return subprocess.run(['git', '--git-dir', GIT, 'show', f'{STUDIO_AT}:{path}'], capture_output=True,
                          check=True).stdout.decode('utf-8')


L = json.loads(show('works/2026-11-22-earshot/listen.json'))
src = show('works/2026-11-22-earshot/data.js')
D = json.loads(src[src.index('{'):src.rindex('}') + 1])
ref = {s['id']: ('signal', s['quote']) for s in D['signals']}
for c in D['cases']:
    for e in c['events']:
        if e.get('vid'):
            ref[e['vid']] = ('record', e['show'])
rows = L['rows']
ok(len(rows) == 61 and all(r['id'] in ref for r in rows), f'61 voices, each with its source sentence: {len(rows)}')
ok(L['wall_words'] == 15 and L['words'] == 1235, 'the Studio\'s own count: 15 of 1,235 words recovered through the wall')

# 1. near: the name of whoever acted
ACTOR = re.compile(r'OpenAI')
near = []
for r in rows:
    kind, s = ref[r['id']]
    if kind != 'record' or not ACTOR.search(s):
        continue
    kept = len(ACTOR.findall(r['heard_near'])) == len(ACTOR.findall(s))
    near.append({'id': r['id'], 'source': s, 'heard': r['heard_near'], 'name_kept': kept})
lost = [n for n in near if not n['name_kept']]
ok(len(near) == 5 and len(lost) == 1 and lost[0]['id'] == 'escape-maker_public',
   f'the maker named in {len(near)} of the ten case sentences, its name lost in {len(lost)}: the one that says whose models acted')
ok('open AI models' in lost[0]['heard'] and 'OpenAI models' in lost[0]['source'], 'the maker\'s models heard as "open AI models"')

# the Studio's rule, as listen.py states it, with the matched words read back
def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower().replace("\u2019", "'"))


NUM = {"24": "twentyfour", "72": "seventytwo", "15": "fifteen", "30": "thirty", "12000000": "twelvemillion"}


def matched(ref_words, hyp_words):
    a = [NUM.get(x, x.replace("-", "")) for x in (norm(w) for w in ref_words) if x]
    b = [NUM.get(norm(w), norm(w)) for w in hyp_words]
    m, n = len(a), len(b)
    T = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            T[i + 1][j + 1] = T[i][j] + 1 if a[i] == b[j] else max(T[i][j + 1], T[i + 1][j])
    out, i, j = [], m, n
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1
        elif T[i - 1][j] >= T[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return out[::-1]


# 2. through the wall: a speaker in the first person whom the source does not have
FIRST = re.compile(r"\b(I|I'm|I'll|I've|we|we'll|we're|we've|let's|us|our|my|me)\b", re.I)
FAREWELL = re.compile(r'see you (guys )?in the next (video|one)', re.I)
wall = []
for r in rows:
    kind, s = ref[r['id']]
    h = r['heard_wall'].strip()
    wall.append({'id': r['id'], 'kind': kind, 'heard': h, 'recovered': r['wall'],
                 'speaker': bool(FIRST.search(h)), 'speaker_in_source': bool(FIRST.search(s)),
                 'farewell': bool(FAREWELL.search(h)), 'words_matched': matched(s.split(), h.split())})
spk = [w for w in wall if w['speaker']]
new_spk = [w for w in spk if not w['speaker_in_source']]
fare = [w for w in wall if w['farewell']]
blank = [w for w in wall if not re.search(r'[A-Za-z]', w['heard'])]
zero = [w for w in wall if w['recovered'] == 0]
spk_zero = [w for w in spk if w['recovered'] == 0]
for w in wall:
    ok(len(w['words_matched']) == w['recovered'], f"{w['id']}: the Studio's count read back ({w['recovered']})")
for w in spk:
    hw = [norm(x) for x in w['heard'].split() if norm(x)]
    sw = ' ' + ' '.join(norm(x) for x in ref[w['id']][1].split() if norm(x)) + ' '
    ok(not any(' ' + ' '.join(hw[i:i + 4]) + ' ' in sw for i in range(max(1, len(hw) - 3))),
       f"{w['id']}: no four words heard in a row stand in the source")
got = [x for w in wall for x in w['words_matched']]
got_in_spk = [x for w in spk for x in w['words_matched']]
FUNCTION = {'the', 'to', 'in', 'so', 'can', 'and', 'a'}
res = {
    'built': '2026-11-24', 'studio_at': STUDIO_AT[:7], 'handoff': 'ho-2026-11-23-studio-1',
    'voices': len(wall), 'near_names': near,
    'wall': {'with_speaker': len(spk), 'speaker_not_in_source': len(new_spk), 'farewell': len(fare),
             'no_words': len(blank), 'recovered_none': len(zero), 'speaker_where_none_recovered': len(spk_zero),
             'by_heard': dict(Counter(w['heard'] for w in spk).most_common()),
             'sources_with_speaker': sum(1 for w in wall if w['speaker_in_source']),
             'words_recovered': len(got), 'words_in_invented_speech': len(got_in_spk),
             'words': dict(Counter(got).most_common()), 'all_function_words': set(got) <= FUNCTION},
    'rows': wall,
}
print(json.dumps({k: v for k, v in res['wall'].items() if k != 'by_heard'}))
ok(len(spk) == 18 and len(new_spk) == 16 and len(fare) == 12,
   f'through the wall a first-person speaker in {len(spk)} of 61 hearings, {len(new_spk)} absent from the source, '
   f'{len(fare)} of them a farewell "see you in the next video"')
ok(len(got) == 17 and len(got_in_spk) == 16 and set(got) <= FUNCTION,
   f'the {len(got)} words counted as recovered through the wall (15 of the signals, 2 of the cases) are all function '
   f'words, {len(got_in_spk)} of them inside a sentence the recogniser wrote in the first person, none of which the source says')
json.dump(res, open(os.path.join(HERE, 'through-the-wall.json'), 'w'), indent=1, ensure_ascii=False)
print('FAILS:', len(fails))
sys.exit(1 if fails else 0)
