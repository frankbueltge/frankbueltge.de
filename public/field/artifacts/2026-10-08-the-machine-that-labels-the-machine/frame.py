"""Keyword frame and reading sample (session 188). Fixed before any count was taken.

Usage: python3 -I frame.py <path to mongodump_full_snapshot/>
Writes data/frame.json: candidate ids (with the terms that matched), the three labelled 7.1 ids,
and the seeded sample of 60 classified non-candidates. No incident text is written out.
"""
import csv, json, os, random, re, sys

csv.field_size_limit(10**9)
SNAP = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))

# Behaviours named in the 7.1 definition and its section text (Slattery et al., arXiv:2408.12622),
# plus the plain words reports use for them.
TERMS = [
    r'reward hack', r'reward tamper', r'specification gaming', r'gaming the', r'proxy gam',
    r'goal misgeneral', r'misgeneral', r'misalign', r'own goals?', r'power[- ]seeking',
    r'self[- ]preserv', r'shut ?down', r'switch(ed)? off', r'turn(ed)? off', r'oversight',
    r'self[- ]replicat', r'self[- ]exfiltrat', r'exfiltrat', r'scheming', r'alignment faking',
    r'sandbag', r'blackmail', r'sabotag', r'deceiv', r'decept', r'lied', r'\blie[sd]?\b',
    r'cheat', r'rogue', r'went rogue', r'disobey', r'defied', r'refused to stop', r'ignored (the )?instruction',
    r'without (being asked|permission|authori[sz]ation)', r'loophole', r'exploit(ed|ing)? (a )?(bug|glitch)',
    r'unintended (behaviou?r|strateg)', r'hid(e|ing)? its', r'covered up', r'evade', r'escape',
]
RX = re.compile('|'.join('(?:%s)' % t for t in TERMS), re.I)


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


inc = rows('incidents.csv')
mit = {int(r['Incident ID']): r for r in rows('classifications_MIT.csv')}
cand = {}
for r in inc:
    text = (r['title'] or '') + ' \n ' + (r['description'] or '')
    hits = sorted(set(m.group(0).lower() for m in RX.finditer(text)))
    if hits:
        cand[int(r['incident_id'])] = hits
lab71 = sorted(i for i, r in mit.items() if r['Risk Subdomain'].startswith('7.1'))
pool = sorted(i for i in mit if i not in cand and i not in lab71)
rng = random.Random(20261008)
sample = sorted(rng.sample(pool, 60))
out = {'snapshot': 'backup-20261005101424', 'terms': TERMS,
       'candidates': {str(k): v for k, v in sorted(cand.items())},
       'n_candidates': len(cand), 'labelled_7_1': lab71, 'sample_seed': 20261008,
       'sample_pool': len(pool), 'sample': sample}
os.makedirs(os.path.join(HERE, 'data'), exist_ok=True)
json.dump(out, open(os.path.join(HERE, 'data', 'frame.json'), 'w'), indent=1)
print(len(cand), 'candidates;', len(lab71), 'labelled 7.1;', len(pool), 'in sample pool')
