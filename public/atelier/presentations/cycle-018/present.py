#!/usr/bin/env python3
"""Until Another Hand, state 4 (2026-11-24): what the presentation adds, built and asserted.

Run from this folder:  python3 present.py <download dir> <dir of bare clones named <repo>.git>

1. A voice of philosophy, answered in section V. Kiener, "AI and Responsibility: No Gap, but Abundance", Journal of
   Applied Philosophy 42(1), 2025, 357-374, open access (CC BY 4.0). The publisher refused a direct download of the PDF
   on 2026-11-24 (HTTP 403) and the repository copy (TUHH, doi.org/10.15480/882.13767) did not answer at a file
   address, so the published article was read as the publisher's HTML through a page-extraction service:
   <download dir>/ki/kiener.md. Its hash is kept; it cannot be checked byte for byte against the publisher's file.
   Each passage quoted counts as found when it stands in that text once whitespace and emphasis marks are removed.
   The entry is added to sources.json and data/sources.js beside the passages sources.py checked on 22 and 23
   November, which are left as they were (the host of Prakash and Knister's paper did not answer on 2026-11-24).
2. Whose name the deeds stand under. For every deed of data/window.json that names its commits, the Git author name of
   each commit, read from the bare clones. The record the Field's reading 93 says a stranger can read without the
   model (its finding S5.4) is this one.
3. The Field's reading 93 (field-research 5bb7db7, artifacts/cycle-018/told-in-time/codes93.json), offered to this
   practice on 24 November: how many of the programme's 28 findings rest on this house's own Git and log, and how it
   codes S5.4.
Writes data/present.json and data/present.js. Nothing here asks a model.
"""
import hashlib, json, os, re, subprocess, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
DL, CLONES = sys.argv[1], sys.argv[2]
FIELD_AT = '5bb7db7dd42fe9a61ad479c8911807be58100e9a'
ARCHITECT = 'Frank Bültge'
fails = []


def ok(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        fails.append(msg)


def git(repo, *a):
    p = subprocess.run(['git', '--git-dir', os.path.join(CLONES, repo + '.git'), *a], capture_output=True)
    return p.returncode, p.stdout.decode('utf-8', 'replace')


def squash(t):
    t = t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    t = re.sub(r'[_*]', '', t)
    t = re.sub(r'-\s*\n\s*', '', t)
    return re.sub(r'\s+', '', t)


# ---------------------------------------------------------------- 1. Kiener, passages checked
KI = os.path.join(DL, 'ki', 'kiener.md')
ki_raw = open(KI, encoding='utf-8').read()
ki_text = squash(ki_raw)
ok('AI and Responsibility: No Gap, but Abundance' in ki_raw and '5 Re-Interpreting the Challenge' in ki_raw,
   'the fetched text is the article, sections 1 to 6')
KIENER = {
    'id': 'ki', 'cite': 'M. Kiener, "AI and Responsibility: No Gap, but Abundance", Journal of Applied Philosophy 42(1) '
                        '(2025), 357-374 (first published 12 September 2024), open access, CC BY 4.0',
    'url': 'https://doi.org/10.1111/japp.12765',
    'sha256': hashlib.sha256(open(KI, 'rb').read()).hexdigest(),
    'read': 'sections 1 to 3, 4.2, 5 and 6 in full, 2026-11-24, the presentation, on the critique\'s ask to answer a '
            'voice of philosophy; read as the publisher\'s HTML through a page-extraction service (the publisher '
            'refused the PDF, 403), so the hash is of the extracted text',
    'passages': [
        ('abstract', 'a situation in which numerous agents are responsible for the harm caused by AI'),
        ('2', 'a person is morally answerable for some harm if that person caused the harm and had a prospective '
              'obligation to guard against such harm'),
        ('2', 'a morally answerable person plays a very different role compared to an eyewitness, who merely provides '
              'a detached report on what happened'),
        ('2', 'answerability, properly understood, is not identical to explainability'),
        ('5', 'whereas the problem with a responsibility gap is that we lack what we want, the problem with '
              'responsibility abundance is that we cannot use what we have'),
        ('5', 'giving others permission to hold one answerable without running into arbitrariness or injustice'),
    ],
}
for where, p in KIENER['passages']:
    ok(squash(p) in ki_text, f'ki {where}: {p[:60]}')
KIENER['passages'] = [{'where': w, 'text': p} for w, p in KIENER['passages']]
src = json.load(open(os.path.join(HERE, 'sources.json')))
src = [s for s in src if s['id'] != 'ki'] + [KIENER]
json.dump(src, open(os.path.join(HERE, 'sources.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'data', 'sources.js'), 'w').write('window.SOURCES = ' + json.dumps(src, ensure_ascii=False) + ';\n')

# ---------------------------------------------------------------- 2. the deeds' Git names
W = json.load(open(os.path.join(HERE, 'data', 'window.json')))
named = [d for d in W['deeds'] if d.get('commits')]
per = []
for d in named:
    names = set()
    for repo, h in d['commits']:
        rc, out = git(repo, 'show', '-s', '--format=%an', h)
        ok(rc == 0 and out.strip(), f'deed row {d["row"]}.{d["n"]}: {repo} {h} read')
        names.add(out.strip())
    per.append({'row': d['row'], 'n': d['n'], 'names': sorted(names)})
only_arch = sum(1 for p in per if p['names'] == [ARCHITECT])
with_arch = sum(1 for p in per if ARCHITECT in p['names'])
only_persona = sum(1 for p in per if ARCHITECT not in p['names'])
deeds = {'read': len(named), 'at_commit': W['results']['at_commit'], 'only_architect': only_arch,
         'with_architect': with_arch, 'only_personas': only_persona,
         'by_names': {' + '.join(k): v for k, v in Counter(tuple(p['names']) for p in per).most_common()},
         'rows': per}
ok(only_arch + (with_arch - only_arch) + only_persona == len(named), 'the deeds by name add up')
print('deeds read', len(named), 'only the architect', only_arch, 'with him', with_arch, 'personas only', only_persona)

# ---------------------------------------------------------------- 3. the Field's reading 93
rc, out = git('field-research', 'show', f'{FIELD_AT}:artifacts/cycle-018/told-in-time/codes93.json')
ok(rc == 0, 'the Field\'s codes93.json at its pinned commit')
F = json.loads(out)
fs = F['findings']
src_count = Counter(f['source'] for f in fs)
s54 = [f for f in fs if f['id'] == 'S5.4'][0]
s53 = [f for f in fs if f['id'] == 'S5.3'][0]
house = [f['id'] for f in fs if f['source'] == 'house']
ok(len(fs) == 28, f'the programme\'s findings of steps 1 to 5: {len(fs)}')
ok(src_count['house'] == 6, f'resting on the house\'s own Git and log: {src_count["house"]}')
ok(s54['says_who'] is True and s54['carried'] == ['GPA1'], 'S5.4 carried by GPA1, which asks the record to say who acted')
ok('under the person\'s name' in s54['verdict'], 'S5.4\'s verdict: under the person\'s name')
ok(str(W['results']['at_commit']) in s54['lead'], 'S5.4\'s count of deeds at a commit is the one this work measured')
field = {'at': FIELD_AT, 'findings': len(fs), 'by_source': dict(src_count), 'house': house,
         'with_signal': sum(1 for f in fs if f['carried']),
         's54': {k: s54[k] for k in ('lead', 'verdict', 'carried', 'says_who', 'note')},
         's53': {k: s53[k] for k in ('lead', 'verdict', 'carried', 'says_who')}}

# ---------------------------------------------------------------- 4. where this practice addressed case A's correction
# The walk of section IV shows, beside the commit that marked a work, the commit in which this practice offered the
# correction to the work's makers: the bulletin line, new at that commit. Pinned by hand, asserted here.
OFFERS = [
    {'id': 'ho-2026-11-22-atelier-2', 'to': 'studio', 'commit': '71b136c0b7578fc4f6fb2c3cd1da2f1a661711b9',
     'line': r'Offered to Studio: a correction\. NO PUBLIC LAND'},
    {'id': 'ho-2026-11-23-atelier-1', 'to': 'studio', 'commit': '7186be73b6240d42f6662c50c0c8296453601e38',
     'line': r'Offered to Studio: a correction\. WHOSE GATE', 'note': True},   # addresses the state's note of 15 November
]
offers = []
for o in OFFERS:
    rc, now = git('ulysses', 'show', f"{o['commit']}:BULLETIN.md")
    rc2, before = git('ulysses', 'show', f"{o['commit']}^:BULLETIN.md")
    ok(re.search(o['line'], now) and not re.search(o['line'], before), f"offer {o['id']} is new in ulysses {o['commit'][:7]}")
    t = int(git('ulysses', 'show', '-s', '--format=%ct', o['commit'])[1].strip())
    offers.append({**o, 'commit': o['commit'][:7], 't': t})

# ---------------------------------------------------------------- 5. the check's own reading of section IV, kept as checked
# The box "Checked, 23 November" reports what the check found that day. Section IV is rebuilt at today's heads, so the
# box reads its figures from the build the check committed (ulysses 7186be7), not from today's.
CHECK_AT = '7186be73b6240d42f6662c50c0c8296453601e38'
rc, out = git('ulysses', 'show', f'{CHECK_AT}:artifacts/cycle-018/until-another-hand/data/programme.json')
ok(rc == 0, 'the check\'s build of section IV at ulysses 7186be7')
P3 = json.loads(out)
A3 = [c for c in P3['cases'] if c['id'] == 'A'][0]
checked_iv = {'at': CHECK_AT[:7], 'built': P3['built'], 'cases': P3['summary']['cases'], 'late': P3['summary']['late'],
              'pages_asserting_today': P3['summary']['pages_asserting_today'],
              'widened': sum(1 for x in A3['today'] if re.search(r'cycle-014|whose-gate', x['path']) and not x['marked'])}
ok(checked_iv['built'] == '2026-11-23', 'the check\'s build is of 23 November')

res = {'built': '2026-11-24', 'deeds': deeds, 'field93': field, 'offers': offers, 'checked_iv': checked_iv}
json.dump(res, open(os.path.join(HERE, 'data', 'present.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'data', 'present.js'), 'w').write('window.PRESENT=' + json.dumps(res, ensure_ascii=False) + ';\n')
print('FAILS:', len(fails))
sys.exit(1 if fails else 0)
