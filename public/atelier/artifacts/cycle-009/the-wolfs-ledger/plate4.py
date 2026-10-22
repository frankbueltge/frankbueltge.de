"""Plate IV, The Burden and the Loss. The Wolf's Ledger, cycle 009, increment 4 (2026-10-21).

Question of the cycle (cycle.json): when a warning turns out never needed, who pays for it, and does a
record of false alarms make the next warning less believed?

This is the cycle's session that reaches outside (protocol section 5, point 3): law, a field this practice has
not worked (cycle 008 read regulations, never a court). Two opinions, read in full on 2026-10-21:
  - United States v. Carroll Towing Co., 159 F.2d 169 (2d Cir. 1947), L. Hand: the burden of a precaution
    against the probability and gravity of the injury it would prevent.
  - Brown v. United States, 790 F.2d 199 (1st Cir. 1986), Bailey Aldrich, Pettine concurring: fishermen lost in a
    storm the Weather Service did not forecast in time; the government's weather service held a discretionary
    function, and not liable.
Both from the Caselaw Access Project's static files (static.case.law/f2d/159/cases/0169-01.json and
static.case.law/f2d/790/cases/0199-01.json). US court opinions are in the public domain; the files are not
committed, their sha256 are asserted below, and every quotation on the page must occur verbatim in them.
Note on the scan: the Carroll Towing text renders Hand's inequality as "whether B PL" (the "<" lost in the
scan); the page quotes only the sentence before it, which states the test in words.

Material taken up: the Studio's TAKE COVER, AGAIN, works/2026-10-20-take-cover-again/words.json at studio@7d61e0c
(sha256 asserted): a fixed sample of 400 of the 16,768 statements that ended a tornado warning early, each with
its headline and first sentence (offered in the Studio's bulletin s189, 2026-10-20). And plate III's own
plate3.json / plate3.js, for the chance of each stated word and each office's sequence.

The rules and the predictions were written and committed before either opinion was read past its caption and
before any statement was read: plate4-rules.md, commit ac4b4fc. In short:
  Hand's line  a class of warnings (by stated word) is owed at b = B/L when its chance P > b. P is plate III's,
               at the hour or in the later record. Empties in owed classes are a burden the formula requires the
               public to bear; empties below the line are over-warning, charged to the warner. b is the visitor's.
  R1  Brown names no cost an unneeded forecast or warning puts on the public (term sweep + reading).
  R2  Brown grounds immunity in discretion and uncertainty, never states a B < PL test, never cites Carroll Towing.
  R3  Carroll Towing names P, L and B, and B is a burden on the party whose precaution is at issue.
  R4  none of the 400 statements states a chance (regex below, over headline and first sentence).

Usage: python3 -I plate4.py CAP_DIR STUDIO_WORDS_JSON   (writes plate4.json and plate4.js here)
"""
import json, sys, re, hashlib
from pathlib import Path

HERE = Path(__file__).parent
SHA = {
    'carroll.json': '2c13a0d99f6fad58ed353a70bc9d5c8d4d4f9d9be29526c74fa6b48d58681ef6',
    'brown.json': 'f332be07922762d9cf8b1ceea9dec73745afa86b5c78f1495ca8c26d380da00a',
    'words.json': '7bad6b3e8f560f1deedf913f9de9256dfce8b0e2c22ce672a58917e7bbc51c55',
}
fold = lambda s: re.sub(r'\s+', ' ', s).strip()


def load(p, name):
    b = Path(p).read_bytes()
    assert hashlib.sha256(b).hexdigest() == SHA[name], name
    return json.loads(b)


cap, words_path = sys.argv[1], sys.argv[2]
carroll, brown, words = load(Path(cap) / 'carroll.json', 'carroll.json'), load(Path(cap) / 'brown.json', 'brown.json'), load(words_path, 'words.json')
assert carroll['citations'][0]['cite'] == '159 F.2d 169' and brown['citations'][0]['cite'] == '790 F.2d 199'
ct = fold(' '.join(o['text'] for o in carroll['casebody']['opinions']))
bt = fold(' '.join(o['text'] for o in brown['casebody']['opinions']))
b_maj = fold(brown['casebody']['opinions'][0]['text'])

QUOTES = {  # (source, text) -- each asserted verbatim, whitespace folded
    'three': ('carroll', 'the owner’s duty, as in other similar situations, to provide against resulting injuries is a function of three variables: (1) The probability that she will break away; (2) the gravity of the resulting injury, if she does; (3) the burden of adequate precautions.'),
    'letters': ('carroll', 'if the probability be called P; the injury, L; and the burden, B; liability depends upon whether B is less than L multiplied by P'),
    'prison': ('carroll', 'the barge must not be the bargee’s prison, even though he lives aboard; he must go ashore at times.'),
    'sadie': ('carroll', 'it was actionable negligence to leave without a bargee on board a barge made fast outside another barge, in the face of storm warnings.'),
    'classic': ('brown', 'A weather forecast is a classic example of a prediction of indeterminate reliability, and a place peculiarly open to debatable decisions, including the desirable degree of investment of government funds and other resources.'),
    'fail': ('brown', 'Weather predictions fail on frequent occasions.'),
    'fisc': ('brown', 'the burden on the fisc would be both unlimited and intolerable.'),
    'weather': ('brown', 'the government did not create the weather; it merely failed, in the court’s opinion, to render adequate performance.'),
    'misstate': ('brown', 'the government here did not make an affirmative misstatement of fact'),
    'prediction': ('brown', 'the representation was not the buoy, but the prediction.'),
    'created': ('brown', '“In these cases [imposing liability] the government created the danger after the critical discretionary decision had been made.”'),
    'safe': ('brown', 'or place none at all and play it safe — from the government’s standpoint?'),
    'need': ('brown', 'who, because of lack of skill, might need warnings more?'),
    'respecters': ('brown', 'Surely weather phenomena are not respecters of persons or places.'),
}
for k, (src, q) in QUOTES.items():
    assert fold(q) in (ct if src == 'carroll' else bt), k

# R1: no named cost of an unneeded forecast or warning in either Brown opinion
R1_TERMS = ['false alarm', 'unnecessar', 'needless', 'over-warn', 'overwarn', 'cry wolf']
r1_hits = {t: bt.lower().count(t) for t in R1_TERMS}
# the passages read for R1, each with the reading recorded (the term sweep alone cannot carry R1)
R1_READ = {
    'warnings': 'the one use of "warnings" in Brown asks whether amateurs, "who, because of lack of skill, might need warnings more", are expected to rely: a need for more warning, not a cost of warning.',
    'safe': 'footnote 5: a duty of full care could make an official "place none at all and play it safe": the court foresees under-provision, not over-warning.',
    'fisc': 'the one burden weighed is "the burden on the fisc" of suits over failed predictions, not the cost to those who act on a prediction.',
}
r1 = all(v == 0 for v in r1_hits.values())
# R2: no B < PL test, no citation of Carroll Towing; the ground named is discretion and indeterminate reliability
r2_terms = {'Carroll': bt.count('Carroll'), 'multiplied': bt.count('multiplied'), 'probability': bt.lower().count('probabilit')}
r2 = r2_terms['Carroll'] == 0 and r2_terms['multiplied'] == 0 and fold(QUOTES['classic'][1]) in bt
# R3: letters named, and B is the owner's (the bargee's) burden: "the barge must not be the bargee's prison"
r3 = fold(QUOTES['letters'][1]) in ct and fold(QUOTES['prison'][1]) in ct
# R4: no stated chance in the Studio's 400
CHANCE = re.compile(r'\d+ ?%|percent|probab|chance|likel', re.I)
NOT_NEEDED = re.compile(r'not needed|false alarm|no tornado|error|mistak|unnecess', re.I)
items = words['items']
assert len(items) == words['sample'] == 400
r4_hits = [i['id'] for i in items if CHANCE.search(i['headline'] + ' ' + i['first'])]
r4 = not r4_hits
nn_hits = [i['id'] for i in items if NOT_NEEDED.search(i['headline'] + ' ' + i['first'])]

# Hand's line on plate III's counts
P3 = json.loads((HERE / 'plate3.json').read_text())
C, ORDER = P3['classes'], P3['order']
N = sum(c['n'] for c in C.values())
assert N == P3['join']['matched']
rec = {}
for w in ORDER:
    c = C[w]; met_later = round(c['hit_later'] * c['n'])
    rec[w] = {'n': c['n'], 'P_hour': c['hit_hour'], 'P_later': c['hit_later'],
              'empty_hour': c['empty_hour'], 'empty_later': c['n'] - met_later}
E_H, E_L = sum(r['empty_hour'] for r in rec.values()), sum(r['empty_later'] for r in rec.values())
assert E_H == P3['totals']['empty_hour']


def book(b, which):
    owed = sum(r['empty_' + which] for r in rec.values() if r['P_' + which] > b)
    return {'owed': owed, 'charged': (E_H if which == 'hour' else E_L) - owed}


grid = [round(0.005 * k, 3) for k in range(1, 200)]
curve = {wh: [[b, book(b, wh)['charged']] for b in grid] for wh in ('hour', 'later')}
band = [rec['R']['P_hour'], rec['R']['P_later']]          # where the two records disagree on radar indicated
said_obs = ['O', 'OC', 'CAT']                              # plate III's "said OBSERVED"
obs_empty = sum(C[w]['empty_hour'] for w in said_obs)
obs_filled = sum(C[w]['empty_filled_later'] for w in said_obs)

# per office, from plate3.js's sequences: at the band's middle, how much of each office's ledger turns on the record
src = (HERE / 'plate3.js').read_text()
P3js = json.loads(src[src.index('=') + 1:].rstrip().rstrip(';'))
mid = round((band[0] + band[1]) / 2, 3)
off = {}
for wfo, seq in P3js['seq'].items():
    u = [(ORDER[c >> 2], (c >> 1) & 1, c & 1) for _, c in seq]
    if len(u) < 100:
        continue
    ch_h = sum(1 for w, h, l in u if not h and rec[w]['P_hour'] <= mid)
    ch_l = sum(1 for w, h, l in u if not l and rec[w]['P_later'] <= mid)
    off[wfo] = {'n': len(u), 'charged_hour': ch_h, 'charged_later': ch_l,
                'empty_hour': sum(1 for _, h, _l in u if not h), 'empty_later': sum(1 for _, _h, l in u if not l)}
assert sum(o['n'] for o in off.values()) <= N

out = {
    'rules_commit': 'ac4b4fc',
    'sources': {'carroll': {'cite': '159 F.2d 169', 'date': carroll['decision_date'], 'url': 'https://static.case.law/f2d/159/cases/0169-01.json', 'sha256': SHA['carroll.json'], 'words': len(ct.split())},
                'brown': {'cite': '790 F.2d 199', 'date': brown['decision_date'], 'url': 'https://static.case.law/f2d/790/cases/0199-01.json', 'sha256': SHA['brown.json'], 'words': len(bt.split())},
                'studio_words': {'commit': '7d61e0c', 'sha256': SHA['words.json'], 'sample': 400, 'population': words['population']}},
    'quotes': {k: q for k, (_, q) in QUOTES.items()},
    'predictions': {'R1': {'held': r1, 'terms': r1_hits, 'read': R1_READ},
                    'R2': {'held': r2, 'terms': r2_terms},
                    'R3': {'held': r3},
                    'R4': {'held': r4, 'hits': r4_hits, 'not_needed_hits': nn_hits}},
    'statements': {'reasons': words['reasons'], 'shares': words['shares_of_found'],
                   'sample': [{'h': i['headline'], 'f': i['first'], 'r': i['reason']} for i in items]},
    'classes': rec, 'era_warnings': N, 'empty_hour': E_H, 'empty_later': E_L,
    'band': band, 'band_mid': mid, 'band_share': rec['R']['n'] / N,
    'absolve_below': {'hour': min(r['P_hour'] for r in rec.values()), 'later': min(r['P_later'] for r in rec.values())},
    'observed': {'empty_hour': obs_empty, 'filled_later': obs_filled, 'unbacked': obs_empty - obs_filled},
    'curve': curve, 'offices_mid': off,
}
(HERE / 'plate4.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
(HERE / 'plate4.js').write_text('window.P4=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('R1', r1, r1_hits, '| R2', r2, r2_terms, '| R3', r3, '| R4', r4, len(r4_hits), 'not-needed', len(nn_hits))
print('band', band, 'share', round(rec['R']['n'] / N, 4), 'absolve below', out['absolve_below'])
print('observed', out['observed'])
for b in (0.1, 0.2, mid, 0.35, 0.5):
    print(b, book(b, 'hour'), book(b, 'later'))
tot_h = sum(o['charged_hour'] for o in off.values()); tot_l = sum(o['charged_later'] for o in off.values())
print('offices', len(off), 'charged at mid: hour', tot_h, 'later', tot_l)
