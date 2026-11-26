#!/usr/bin/env python3
"""RINGBACK, build of the second state (session 265, 2026-11-26): what was overheard.

Reads the Field's study 95 (cases95.json, sources95.json and its quote check check95.json) at their commit, and writes
overheard.js: every act the public record shows in the two cases of step 6 (the escape and the wiki case), in the order
of their dates, each at its door, with its passage word for word, its source, what owed it and how many days it came
before or after the first public account of its case. A door that study 94 names as a receiver speaks from that
receiver's line (the first line study 94 names for it); a door no text names stands beyond the far rim of the field, in
the order in which it first acted. The one door that was told and shows no act (the FBI) gets an open line with nothing
on it.

With --voices it also reads every passage aloud with an open speech model run here (Kokoro-82M, Apache-2.0, through
kokoro-onnx; the model files' paths in KOKORO_MODEL and KOKORO_VOICES), encodes each reading with ffmpeg to
voices/<n>.m4a and stores its loudness envelope (30 per second) in overheard.js. The page shows the passage as it
stands in the record; only the reading spells out what a voice would otherwise read sign by sign (SAY below).

    python3 build_overheard.py [--voices] [cache-dir]
"""
import hashlib, json, os, subprocess, sys, tempfile, urllib.request
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
VOICES = '--voices' in sys.argv
CACHE = ARGS[0] if ARGS else os.path.join('/tmp', 'ringback-cache')
os.makedirs(CACHE, exist_ok=True)

COMMIT = 'b1ee490d8c239ffa02af52e8884ac7925aa282f9'
BASE = 'https://raw.githubusercontent.com/frankbueltge/field-research/' + COMMIT + '/artifacts/cycle-019/on-receipt/'
SRC = {
    'cases95': dict(url=BASE + 'cases95.json',
                    sha256='18b60f2e68086b984556c3e916d6ef7a463e53b0d40e2bba0cb83dbfdb9ee6c9',
                    what="The Field's study 95, On Receipt, state 2 (2026-11-26): every receiver in the two cases of "
                         "step 6 that the public record shows receiving word of the agents' conduct or acting on it, "
                         "every act coded with its date, its passage and what owed it."),
    'sources95': dict(url=BASE + 'sources95.json',
                      sha256='a8d034dc601d5689cbede4f20c46587ca932616f58c5a69cfe228e94b3556f6c',
                      what="The Field's study 95: the sources of its passages, with their addresses."),
    'check95': dict(url=BASE + 'check95.json',
                    sha256='eec647ab01d71b7d1b3e7199aa08347d2c2fbbc4770f3dde27ee4c31714652bd',
                    what="The Field's study 95: its check of every passage against the copy of its source."),
}


def fetch(key):
    s = SRC[key]
    path = os.path.join(CACHE, key + '.json')
    if not os.path.exists(path):
        req = urllib.request.Request(s['url'], headers={'User-Agent': 'studio-build/1'})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, 'wb') as f:
            f.write(r.read())
    raw = open(path, 'rb').read()
    got = hashlib.sha256(raw).hexdigest()
    if got != s['sha256']:
        sys.exit(f'{key}: sha256 {got} differs from {s["sha256"]}')
    return json.loads(raw)


C95 = fetch('cases95')
S95 = fetch('sources95')['sources']
K95 = {(i['door'], i['what']): i for i in fetch('check95')['items']}

CASES = {c['id']: c for c in C95['cases']}
DOORS = C95['doors']
ON_LINES = {'EU4', 'COP3', 'COP5', 'CA4', 'CA5', 'CA6', 'CA7', 'CA8', 'CN1', 'CN2', 'AS1', 'G7-1', 'G7-3', 'PC3',
            'PC4', 'NY4', 'NY5', 'NY6', 'GPA2'}

# A short name for the label beside a light. The door's own name stands in its panel.
SHORT = {
    'W-MOD': "a wiki's volunteer", 'W-RES': 'outside researchers', 'W-MAKER': 'the maker', 'W-EC': 'the Commission',
    'E-MAKER': 'the maker', 'E-HF': 'the harmed company', 'E-FBI': 'the FBI', 'E-WH': 'the White House',
    'E-AGS': '15 attorneys general', 'E-AL': "Alabama's AG", 'E-HOUSE': 'members of the House',
    'E-ASM': 'the Assembly committee', 'E-OES': 'Cal OES', 'E-CAAG': "California's AG", 'E-SEN': 'Senator Hawley',
    'E-VH': 'Senator Van Hollen', 'E-FOUND': 'a foundation', 'E-EC': 'the Commission',
}
# The synthetic voice that reads a door. None is anyone's own voice, and none is chosen to sound like the person or
# office it reads; the maker and the Commission keep one voice across both cases.
VOICE = {
    'W-MOD': 'bm_lewis', 'W-RES': 'af_nicole', 'W-MAKER': 'am_adam', 'E-MAKER': 'am_adam', 'W-EC': 'bf_isabella',
    'E-EC': 'bf_isabella', 'E-HF': 'af_bella', 'E-WH': 'am_echo', 'E-AGS': 'af_jessica', 'E-AL': 'am_eric',
    'E-HOUSE': 'af_river', 'E-ASM': 'af_kore', 'E-OES': 'am_liam', 'E-CAAG': 'bm_george', 'E-SEN': 'am_onyx',
    'E-VH': 'bm_daniel', 'E-FOUND': 'af_aoede',
}
# What a voice reads where the passage holds signs it would spell out. The page always shows the passage itself.
SAY = {
    ('W-RES', 0): 'We found about eighteen thousand posts from autonomous AI agents, self-identifying as from OpenAI, '
                  'using the public internet to communicate during a web research task.',
    ('E-MAKER', 0): 'Responders investigated and linked the observed internal activity to an Exploit Gym evaluation '
                    'using Artifactory as an improvised message board and a network pivot.',
    ('E-MAKER', 3): 'On July sixth, OpenAI responsibly disclosed the vulnerability to J Frog, the developer of '
                    'Artifactory.',
    ('E-MAKER', 4): 'Shortly after investigating the initial alert, OpenAI stopped active Exploit Gym evaluations, '
                    'began disabling the evaluation across the environment',
    ('E-MAKER', 5): 'On July twentieth, after further investigation, OpenAI uncovered evidence suggesting potential '
                    'involvement of its models in the incident Hugging Face had disclosed.',
    ('E-MAKER', 8): 'On July twenty-fifth, OpenAI stopped all training and inference related to the internal-only '
                    'research model at issue.',
    ('E-MAKER', 10): 'Update on August twenty-sixth, twenty twenty-six:',
    ('E-HF', 4): 'Hugging Face confirmed that it had already rotated two of the credentials during its own response '
                 'to the security incident it disclosed on July sixteenth.',
    ('E-AGS', 2): 'Attorney General Brenna Bird announced today she is leading a coalition of fifteen states '
                  'demanding transparency and accountability from the AI company OpenAI',
    ('E-AL', 0): 'pursuant to the authority vested in the Attorney General by Section eight, nineteen, nine of the '
                 'Code of Alabama,',
    ('E-ASM', 0): 'Assemblymember Rebecca Bauer-Kahan, at the August tenth hearing, said it was "no secret" that '
                  'none of the frontier companies met S B fifty-three\'s threat-level "thresholds"',
    ('E-OES', 0): 'said that the OpenAI hack "did not meet the threshold" for reporting under S B fifty-three, which '
                  'requires frontier developers to report critical safety incidents to the Office of Emergency '
                  'Services within fifteen',
    ('E-OES', 1): 'Cal O E S report number. P. 2 0 2 6 0 9 1 3. 0 0 0 0 1.',
    ('E-SEN', 0): 'I am investigating your AI agents\' hack of Hugging Face in July twenty twenty-six in light of new, '
                  'disturbing evidence regarding the incident.',
    ('E-FOUND', 0): 'Filed thirteen September twenty twenty-six by Real Safety AI Foundation through the Cal O E S '
                    'Transparency in Frontier AI Act portal, as a member of the public',
    ('E-FOUND', 1): 'On thirteen September twenty twenty-six, Real Safety AI Foundation filed one and published it '
                    'here.',
    ('E-CAAG', 1): 'California Attorney General Rob Bonta yesterday served an investigative subpoena on OpenAI',
    ('E-CAAG', 3): 'this was only one of eighty known incidents',
    ('W-EC', 1): 'The AI Office has already requested and received serious incident reports and sent requests for '
                 'information on security practices.',
}
# What each code means, in the words the page uses.
DOES = {
    'tell_public': 'told the public', 'investigate': 'looked into it', 'order': 'stopped it, or asked for a stop',
    'pass_on': 'passed it on', 'reason_not': 'gave a reason not to act', 'acknowledge': 'answered one who sent word',
    'proceed': 'took it to court',
}
OWED = {
    'choice': 'by choice: nothing owed it', 'sender duty': "a sender's duty owed it",
    'receiver duty': "a receiver's duty owed it", 'power': 'a power an AI text gives',
    'other law': 'a power under another law',
}

d0 = lambda s: date.fromisoformat(s)

# ---------------------------------------------------------------- the doors: on a line, or beyond the rim
doors, first_act = {}, {}
for x in DOORS:
    named = x['named_in_94']
    for n in named:
        if n not in ON_LINES:
            sys.exit(f'{x["id"]}: {n} is no line of study 94')
    dated = sorted(a['date'] for a in x['acts'] if a['date'])
    first_act[x['id']] = dated[0] if dated else (x['received']['date'] or '9999')
    doors[x['id']] = dict(id=x['id'], case=x['case'], name=x['name'], kind=x['kind'], short=SHORT[x['id']],
                          named_in_94=named, line=named[0] if named else None, voice=VOICE.get(x['id']),
                          received=x['received'], not_found=x.get('not_found', ''), lag_days=x.get('lag_days'),
                          consequence=x.get('consequence'))
rim = sorted([d for d in doors.values() if d['line'] is None], key=lambda d: (first_act[d['id']], d['id']))
for i, d in enumerate(rim):
    d['rim_x'] = round(0.08 + 0.84 * i / (len(rim) - 1), 4)
    d['rim_order'] = i + 1

# ---------------------------------------------------------------- the sequence: every act, in the order of its date
seq = []
for x in DOORS:
    case = CASES[x['case']]
    for i, a in enumerate(x['acts']):
        k = K95.get((x['id'], f'{a["code"]}#{i}'))
        if not k or not k['found']:
            sys.exit(f'{x["id"]} act {i}: no passage found by the Field')
        src = S95[a['src']]
        when, bound = a['date'], a['bound']
        if not when:
            # undated in the record: placed on the day of the report that first shows it, as "by" that day
            when, bound = {'star': '2026-09-07', 'tnw_eu': '2026-10-14'}[a['src']], 'by'
        seq.append(dict(door=x['id'], case=x['case'], kind='act', i=i, code=a['code'], owed=a['owed'],
                        date=a['date'], when=when, bound=bound or 'on', dated=bool(a['date']),
                        days=(d0(when) - d0(case['first_public'])).days, quote=a['quote'], note=a.get('note', ''),
                        src_url=src['url'], src_what=src['what'], via=k['via'],
                        public=(x['id'] == 'E-HF' and a['code'] == 'tell_public' and when == case['first_public'])
                        or (x['id'] == 'W-RES' and a['code'] == 'tell_public'),
                        say=SAY.get((x['id'], i), a['quote'])))
    if not x['acts']:
        r = x['received']
        seq.append(dict(door=x['id'], case=x['case'], kind='silence', code=None, owed=None, date=r['date'],
                        when=r['date'], bound=r['bound'], dated=True,
                        days=(d0(r['date']) - d0(case['first_public'])).days, quote=r['quote'], note=x['not_found'],
                        src_url=S95[r['src']]['url'], src_what=S95[r['src']]['what'], via='', public=False, say=None))
# by date; on one day the first public account comes first, a door told by that day after the one that told it
seq.sort(key=lambda e: (e['when'], not e['public'], e['kind'] == 'silence'))
for n, e in enumerate(seq, 1):
    e['n'] = n

# ---------------------------------------------------------------- the figures the page prints, counted here and again there
acts = [e for e in seq if e['kind'] == 'act']
pub_kinds = ('public body', 'legislature')
counts = dict(
    acts=len(acts), doors=len(DOORS),
    owed={k: sum(1 for e in acts if e['owed'] == k) for k in OWED},
    on_lines=[d['id'] for d in doors.values() if d['line']], rim=[d['id'] for d in rim],
    answers=[e['n'] for e in acts if e['code'] == 'acknowledge'],
    pressure=[e['n'] for e in acts if doors[e['door']]['kind'] in pub_kinds and e['code'] in ('investigate', 'order', 'proceed')],
    silent=[d['id'] for d in doors.values() if not any(e['door'] == d['id'] for e in acts)],
)
first_public_body = {}
for e in acts:
    d = doors[e['door']]
    if d['kind'] == 'public body' and e['dated'] and e['door'] not in first_public_body:
        first_public_body[e['door']] = e['days']
counts['public_body_first_days'] = first_public_body

# ---------------------------------------------------------------- the readings
if VOICES:
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(os.environ['KOKORO_MODEL'], os.environ['KOKORO_VOICES'])
    os.makedirs(os.path.join(HERE, 'voices'), exist_ok=True)
    for e in seq:
        if not e['say']:
            e['clip'], e['dur'], e['env'] = None, 7.0, None
            continue
        audio, rate = k.create(e['say'], voice=doors[e['door']]['voice'], speed=1.0, lang='en-us')
        audio = np.asarray(audio, dtype=np.float32)
        nz = np.nonzero(np.abs(audio) > 0.004)[0]
        audio = audio[max(0, nz[0] - 1200): nz[-1] + 2400]
        audio = audio * (0.25 / max(1e-6, float(np.sqrt(np.mean(audio ** 2)))))
        audio = np.clip(audio, -0.95, 0.95)
        with tempfile.NamedTemporaryFile(suffix='.wav') as w:
            sf.write(w.name, audio, rate)
            out = os.path.join(HERE, 'voices', f'{e["n"]:02d}.m4a')
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', w.name, '-ac', '1', '-ar', '24000',
                            '-c:a', 'aac', '-b:a', '40k', out], check=True)
        hop = rate // 30
        env = [float(np.sqrt(np.mean(audio[j:j + hop] ** 2))) for j in range(0, len(audio), hop)]
        top = max(env) or 1.0
        e['clip'] = f'voices/{e["n"]:02d}.m4a'
        e['dur'] = round(len(audio) / rate, 3)
        e['env'] = [round(255 * v / top) for v in env]
        print(f'{e["n"]:02d} {e["door"]:8s} {e["dur"]:5.2f}s {doors[e["door"]]["voice"]}')
else:
    old = os.path.join(HERE, 'overheard.js')
    prev = {}
    if os.path.exists(old):
        txt = open(old, encoding='utf-8').read()
        prev = {(p['door'], p.get('i'), p['kind']): p for p in json.loads(txt[txt.index('{'):txt.rindex('}') + 1])['seq']}
    for e in seq:
        p = prev.get((e['door'], e.get('i'), e['kind']), {})
        e['clip'], e['dur'], e['env'] = p.get('clip'), p.get('dur', 7.0), p.get('env')

out = dict(
    what="RINGBACK, state 2: what was overheard. Every act of the two cases of step 6, as the Field's study 95 coded it, "
         "in the order of its date.",
    sources={k: dict(url=v['url'], sha256=v['sha256'], what=v['what']) for k, v in SRC.items()},
    model=dict(name='Kokoro-82M', licence='Apache-2.0', runtime='kokoro-onnx, kokoro-v1.0.onnx and voices-v1.0.bin',
               note='run in the build, on this machine; no service, no key'),
    cases=[dict(id=c['id'], name=c['name'], first_public=c['first_public'], first_public_who=c['first_public_who'])
           for c in C95['cases']],
    doors=list(doors.values()),
    does=DOES, owed=OWED,
    seq=seq,
    counts=counts,
)
with open(os.path.join(HERE, 'overheard.js'), 'w', encoding='utf-8') as f:
    f.write('// RINGBACK, state 2 (session 265): written by build_overheard.py from the Field\'s study 95. Do not edit.\n')
    f.write('window.RINGBACK_OVERHEARD = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(seq), 'entries;', counts['acts'], 'acts at', counts['doors'], 'doors;', 'owed', counts['owed'])
print('rim', [(d['id'], d['rim_x']) for d in rim])
print('first acts of public bodies, days after the public knew', first_public_body)
