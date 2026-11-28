#!/usr/bin/env python3
"""RINGBACK, what was overheard: built in the second state (session 265, 2026-11-26) on the Field's study 95, rebuilt
in the third, the check (session 266, 2026-11-27), on the Field's check of that study, study 96.

Reads the Field's study 96 (cases96.json, and check96.json, its check of every passage the check added or changed) and
study 95 (sources95.json, and check95.json for the passages the check held) at their commits, and the Atelier's
corrected log of the same two cases (cases.json of Bound to Proceed, for what each reason not to act answered). Writes
overheard.js: every act the public record shows in the two cases of step 6 (the escape and the wiki case), in the
order of their dates, each at its door, with its passage word for word, its source, what owed it and how many days it
came before or after the first public account of its case. An act the record does not date stands on the day of the
source that first shows it, as "by" that day.

What is said and what is done come in apart (the check, answering both critiques of the second state): an act that
tells the public, gives a reason not to act, answers or passes the word on is read by a voice; an act that looks into
it, orders a stop or goes to court is a deed, and is not read: it goes through the ground as a front from where its
door stands, as strong as its force (a deed that compels, a deed of force by a public body or a legislature, any other
deed). A door that study 94 names as a receiver acts from that receiver's line; a door no text names stands beyond
the far rim of the field, in the order in which it first acted. The one door that was told and shows no act (the FBI)
gets an open line with nothing on it.

State 4, the presentation (session 267, 2026-11-28), rebuilt on the Field's reading 97 of the same morning
(codes97.json): the acts this practice's case of 27 November found missing (the Governor's order of 18 September, his
agency's report of 16 November, the maker's letter of 20 October), so 81 acts at 20 doors; and the maker's own door:
the five words its own report says reached it, each coded against the four duties that could ask it to pass the word
on (met, in doubt, not met), with what each doubt turns on and who settles it under the text. A word that reached the
maker is no act: it comes in as the maker's own line ringing inside, and every duty it leaves in doubt stands on the
field as a thread from the maker's light to the receiver's, to the end. Beside it, what the two cases could set off at
the maker's door, as the Field's check read it (duties96.json).

With --voices it also reads every spoken act aloud with an open speech model run here (Kokoro-82M, Apache-2.0,
through kokoro-onnx; the model files' paths in KOKORO_MODEL and KOKORO_VOICES), encodes each reading with ffmpeg to
voices/<n>.m4a and stores its loudness envelope (30 per second) in overheard.js. The page shows the passage as it
stands in the record; only the reading spells out what a voice would otherwise read sign by sign (SAY below).

    python3 build_overheard.py [--voices] [cache-dir]
"""
import hashlib, json, os, re, subprocess, sys, tempfile, urllib.request
from difflib import SequenceMatcher
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
VOICES = '--voices' in sys.argv
CACHE = ARGS[0] if ARGS else os.path.join('/tmp', 'ringback-cache')
os.makedirs(CACHE, exist_ok=True)

FIELD = 'https://raw.githubusercontent.com/frankbueltge/field-research/'
C95 = 'b1ee490d8c239ffa02af52e8884ac7925aa282f9'
C96 = '828e88a6e9a3f037ba2b18ea55e0a072086448cc'
C97 = 'e9423f855440ac62d5446eba5d47e33709982671'
ATELIER = '1d86bd4f12ac5d6f62dfe3ee6b33999eaa0ad9e1'
B95 = FIELD + C95 + '/artifacts/cycle-019/on-receipt/'
B96 = FIELD + C96 + '/artifacts/cycle-019/on-receipt/'
B97 = FIELD + C97 + '/artifacts/cycle-019/on-receipt/'
SRC = {
    'codes97': dict(url=B97 + 'codes97.json',
                    sha256='8d4e3ca95f893a11427b79076e5021beb3ea869c0a25e0b29137b3f20394ccf0',
                    what="The Field's reading 97, On Receipt, state 4 (2026-11-28): the acts this practice's case found "
                         "missing (two doors, seven acts), and the maker's door: five words of its own report against "
                         "four reporting duties, coded twice, the second time blind, every condition with who settles it."),
    'check97': dict(url=B97 + 'check97.json',
                    sha256='a0d7f18384cc6615dd6c130620af247f1eb26b345d5d94f6ce2aaec7edae0b80',
                    what="The Field's reading 97: every passage of its codes found word for word in its source."),
    'results97': dict(url=B97 + 'results97.json',
                      sha256='2b725bd9a67bfb568d061b020b46b04af9133e9d06c19301db4ba4a33a4f8294',
                      what="The Field's reading 97: the figures of its fourth state, as its own script counted them."),
    'duties96': dict(url=B96 + 'duties96.json',
                     sha256='1eb1efa98eda5c1247fb1a13fff0500e921377c5a7d24b7b8d5883cee7599f3b',
                     what="The Field's check, study 96: every duty the two cases could set off, read from the record, "
                          "offered to this practice on 27 November."),
    'cases96': dict(url=B96 + 'cases96.json',
                    sha256='7e02aca771ab10bdd5b1f322d4048ecd74156d5ddf94c2d76ea436465bd856be',
                    what="The Field's study 96, On Receipt, state 3, its check (2026-11-27): the acts and receipts of "
                         "the two cases of step 6 after a blind second coding, every act with its date, its passage, "
                         "what owed it and whether the check held, corrected or added it."),
    'check96': dict(url=B96 + 'check96.json',
                    sha256='08d39c34c5550c1e18da5a780086eb1cd6108f8fe20a61ce23b87692073d6af1',
                    what="The Field's study 96: every passage its check added or changed, found word for word."),
    'results96': dict(url=B96 + 'results96.json',
                      sha256='90e61c4a3a986f29e53234202f169149cc98276ac1f1754dd9d4d974455f232a',
                      what="The Field's study 96: the figures of its check, as its own script counted them."),
    'sources95': dict(url=B95 + 'sources95.json',
                      sha256='a8d034dc601d5689cbede4f20c46587ca932616f58c5a69cfe228e94b3556f6c',
                      what="The Field's study 95: the sources of its passages, with their addresses."),
    'check95': dict(url=B95 + 'check95.json',
                    sha256='eec647ab01d71b7d1b3e7199aa08347d2c2fbbc4770f3dde27ee4c31714652bd',
                    what="The Field's study 95: its check of every passage against the copy of its source."),
    'cases95': dict(url=B95 + 'cases95.json',
                    sha256='18b60f2e68086b984556c3e916d6ef7a463e53b0d40e2bba0cb83dbfdb9ee6c9',
                    what="The Field's study 95, On Receipt, state 2 (2026-11-26): the 47 acts the second state of this "
                         "work was built on, read here to match each held act to its check."),
    'atelier': dict(url='https://raw.githubusercontent.com/frankbueltge/ulysses/' + ATELIER +
                        '/artifacts/cycle-019/bound-to-proceed/data/cases.json',
                    sha256='306211412bea83606e774f312fc53e8464ee71941acf0040626622eebf75dba3',
                    what="The Atelier's Bound to Proceed, corrected by its check (2026-11-27): the eight reasons not to "
                         "act in the two cases, each with what its record shows it answered."),
}
# Sources the Field's check added to study 95's list (its build96.py, at the same commit). Their addresses as the
# Field gives them.
ADDED = {
    'complaint': ('https://oag.ca.gov/system/files/attachments/press-docs/complaint-oai-cyber.pdf',
                  "California's Attorney General's complaint against the maker, 16 November 2026"),
    'eucode': ('https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai',
               "The Commission's page of the Code of Practice and its signatories"),
    'ny1422': ('https://legislation.nysenate.gov/pdf/laws/GBS1422/',
               'New York General Business Law section 1422 (RAISE Act), as published by the Senate'),
    'paris': ('https://www.elysee.fr/en/emmanuel-macron/2026/11/09/paris-call-for-ai-safety-and-security',
              'The Paris Call and its signatories'),
    'rsense': ('https://www.resultsense.com/news/2026-09-18-openai-rubygems-eu-ai-office',
               "A news digest relaying a Brussels paper's report of 18 September on which incidents were reported to "
               "the AI Office"),
    'pks': ('https://www.pk-sharma.com/briefing/openai-rubygems-no-eu-ai-act-incident-report',
            "An analyst's briefing of 18 September"),
    'eur0907': ('https://www.euractiv.com/news/ai-safety-incident-reporting-not-just-a-tick-box-warns-eu',
                "A Brussels paper's article of 7 September, corrected on 8 September"),
    'oaioct': ('https://apcp.assembly.ca.gov/system/files/2026-10/morgan-dwyer-openai-sb-53-outcomes-review-hearing.pdf',
               "The maker's slides for the Assembly committee's SB 53 review hearing, 27 October 2026"),
    'tnw_wiki': ('https://thenextweb.com/news/openai-eu-incident-report-german-wiki',
                 "A news report of 7 September on the Commission's confirmation of a report on the wiki"),
    # added by the Field's reading 97 (its build97.py, at its commit)
    'eo': ('https://www.gov.ca.gov/wp-content/uploads/2026/09/FINAL-N-9-26-AI-EO-9.18.26-SIGNED.pdf',
           'Executive Order N-9-26, signed 18 September 2026'),
    'eorel': ('https://www.gov.ca.gov/2026/09/18/governor-newsom-issues-executive-order-to-accelerate-independent-'
              'oversight-and-advance-the-creation-of-an-ai-kill-switch/',
              "The Governor's release of 18 September 2026 on the order", 'extraction'),
    'govops': ('https://www.govops.ca.gov/wp-content/uploads/sites/11/2026/11/FINAL_-AI-Safety-in-2026-and-Beyond-v2.pdf',
               'California Government Operations Agency, AI Safety in 2026 and Beyond, a report to the Governor, '
               '16 November 2026'),
    'letter': ('https://cdn.openai.com/pdf/openai-letter-to-governor-newsom-20261020.pdf',
               "The maker's letter to the Governor, Recommendations under Sept. 18, 2026 Executive Order, 20 October 2026"),
    'euact': ('https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401689',
              'The EU AI Act, Regulation (EU) 2024/1689', 'extraction'),
    'sb53': ('https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260SB53',
             'California SB 53, the Transparency in Frontier Artificial Intelligence Act', 'extraction'),
    'eucode97': ('https://ec.europa.eu/newsroom/dae/redirection/document/118119',
                 'The General-Purpose AI Code of Practice, Safety and Security chapter'),
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


C = fetch('cases96')
K96 = {p['item']: p for p in fetch('check96')['passages']}
S95 = fetch('sources95')['sources']
K95 = {(i['door'], i['what']): i for i in fetch('check95')['items']}
OLD = {d['id']: d for d in fetch('cases95')['doors']}
AT = fetch('atelier')
SOURCES = {k: dict(url=v['url'], what=v['what'], via=v['via']) for k, v in S95.items()}
for k, v in ADDED.items():
    SOURCES.setdefault(k, dict(url=v[0], what=v[1], via=v[2] if len(v) > 2 else 'direct'))

CASES = {c['id']: c for c in C['cases']}
# The fourth state, on the Field's reading 97: the maker's two acts of 20 October join its door, and the two doors
# check 96 lacked join the record (build97.py at its commit merges them the same way).
R97 = fetch('codes97')
K97 = {p['item']: p for p in fetch('check97')['passages']}
DOORS = json.loads(json.dumps(C['doors']))
for x in DOORS:
    if x['id'] == 'E-MAKER':
        x['acts'] = x['acts'] + json.loads(json.dumps(R97['maker_added']))
DOORS += json.loads(json.dumps(R97['new_doors']))
DUTIES96 = fetch('duties96')['cells']
ON_LINES = {'EU4', 'COP3', 'COP5', 'CA4', 'CA5', 'CA6', 'CA7', 'CA8', 'CN1', 'CN2', 'AS1', 'G7-1', 'G7-3', 'PC3',
            'PC4', 'NY4', 'NY5', 'NY6', 'GPA2'}
# An act the record leaves undated stands on the day of the source that first shows it, as "by" that day.
BY_SOURCE = {'cw': '2026-09-04', 'hf1': '2026-07-16', 'ml': '2026-09-09', 'tnw_eu': '2026-10-14',
             'star': '2026-09-07'}

# A short name for the label beside a light. The door's own name stands in its panel.
SHORT = {
    'W-MOD': "a wiki's volunteer", 'W-RES': 'outside researchers', 'W-MAKER': 'the maker', 'W-EC': 'the Commission',
    'E-MAKER': 'the maker', 'E-HF': 'the harmed company', 'E-FBI': 'the FBI', 'E-WH': 'the White House',
    'E-AGS': '15 attorneys general', 'E-AL': "Alabama's AG", 'E-HOUSE': 'members of the House',
    'E-ASM': 'the Assembly committee', 'E-OES': 'Cal OES', 'E-CAAG': "California's AG", 'E-SEN': 'Senator Hawley',
    'E-VH': 'Senator Van Hollen', 'E-FOUND': 'a foundation', 'E-EC': 'the Commission',
    'E-GOV': "California's Governor", 'E-GOVOPS': "the Governor's agency",
}
# The synthetic voice that reads a door. None is anyone's own voice, and none is chosen to sound like the person or
# office it reads; the maker and the Commission keep one voice across both cases.
VOICE = {
    'W-MOD': 'bm_lewis', 'W-RES': 'af_nicole', 'W-MAKER': 'am_adam', 'E-MAKER': 'am_adam', 'W-EC': 'bf_isabella',
    'E-EC': 'bf_isabella', 'E-HF': 'af_bella', 'E-WH': 'am_echo', 'E-AGS': 'af_jessica', 'E-AL': 'am_eric',
    'E-HOUSE': 'af_river', 'E-ASM': 'af_kore', 'E-OES': 'am_liam', 'E-CAAG': 'bm_george', 'E-SEN': 'am_onyx',
    'E-VH': 'bm_daniel', 'E-FOUND': 'af_aoede', 'E-GOV': 'am_michael', 'E-GOVOPS': 'af_sarah',
}
# What a voice reads where the passage holds signs it would spell out, keyed by the passage's opening words. The page
# always shows the passage itself.
SAY = {
    'We found ~18,000 posts': 'We found about eighteen thousand posts from autonomous AI agents, self-identifying as '
                              'from OpenAI, using the public internet to communicate during a web research task.',
    'On July 6, OpenAI responsibly': 'On July sixth, OpenAI responsibly disclosed the vulnerability to J Frog, the '
                                     'developer of Artifactory.',
    'Update on August 26, 2026': 'Update on August twenty-sixth, twenty twenty-six:',
    'Hugging Face confirmed that it had': 'Hugging Face confirmed that it had already rotated two of the credentials '
                                          'during its own response to the security incident it disclosed on July '
                                          'sixteenth.',
    'Attorney General Brenna Bird': 'Attorney General Brenna Bird announced today she is leading a coalition of '
                                    'fifteen states demanding transparency and accountability from the AI company '
                                    'OpenAI',
    'said that the OpenAI hack': 'said that the OpenAI hack "did not meet the threshold" for reporting under S B '
                                 'fifty-three, which requires frontier developers to report critical safety incidents '
                                 'to the Office of Emergency Services within fifteen',
    'Cal OES report number': 'Cal O E S report number. P. 2 0 2 6 0 9 1 3. 0 0 0 0 1.',
    'Filed 13 September 2026': 'Filed thirteen September twenty twenty-six by Real Safety AI Foundation through the '
                               'Cal O E S Transparency in Frontier AI Act portal, as a member of the public',
    'On 13 September 2026, Real Safety': 'On thirteen September twenty twenty-six, Real Safety AI Foundation filed '
                                         'one and published it here.',
    'this was only one of 80': 'this was only one of eighty known incidents',
    # new in study 96
    'Our new framework for disclosing': 'Our new framework for disclosing instances of misaligned model behavior, '
                                        'September sixteenth;',
    '“It’s unclear to date if anyone': '"It\'s unclear to date if anyone is actually complying with S B '
                                       'fifty-three," Bauer-Kahan, the state privacy and consumer protection '
                                       'committee\'s chair, said at the meeting.',
    'a spokesperson for the Office of Emergency': 'a spokesperson for the Office of Emergency Services said S B '
                                                  'fifty-three "is not intended to make every cybersecurity incident '
                                                  'involving an AI company reportable" to the state.',
    'She called the Hugging Face case': 'She called the Hugging Face case a wake-up call. In it, she said, over seven '
                                        'hundred OpenAI agents escaped their environment and hacked into another '
                                        'company.',
    'The European Commission has confirmed receipt': 'The European Commission has confirmed receipt of OpenAI\'s report '
                                                     'on the D S E Wiki agent episode but has not disclosed its '
                                                     'contents or filing date',
    # new in reading 97
    'In response to Executive Order N-9-26': 'In response to Executive Order N nine twenty-six, the California '
                                             'Government Operations Agency, in consultation with the California Office '
                                             'of Emergency Services and outside AI experts, has developed '
                                             'recommendations for legislative action.',
    'None of the models involved in this incident fell': 'None of the models involved in this incident fell within the '
                                                         'scope of S B fifty-three, according to OpenAI, meaning that '
                                                         'existing California law did not make reporting this '
                                                         'incident mandatory.',
}
# What each code means, in the words the page uses.
DOES = {
    'tell_public': 'told the public', 'investigate': 'looked into it', 'order': 'stopped it, or asked for a stop',
    'pass_on': 'passed it on', 'reason_not': 'gave a reason not to act', 'acknowledge': 'answered one who sent word',
    'proceed': 'took it to court',
}
# "By choice" was the second state's word for the Field's "nothing owed it", and it said more than the code (the
# Atelier's correction of 27 November): an act no text owed may still answer a hearing or a report a law requires.
OWED = {
    'choice': 'owed by nothing', 'sender duty': "a sender's duty owed it",
    'receiver duty': "a receiver's duty owed it", 'power': 'under a power an AI text gives',
    'other law': 'under another law, named',
}
ASKED = {'a hearing': 'said at a hearing', "a law's report": 'in the report a law requires',
         'an executive order': "in answer to the Governor's executive order"}
DEED = {'investigate', 'order', 'proceed'}        # the Field's acts of force; the rest is said
FORCE_KIND = ('public body', 'legislature')

d0 = lambda s: date.fromisoformat(s)
norm = lambda s: re.sub(r'[^a-z0-9]+', ' ', (s or '').lower().replace('’', "'")).strip()

# ---------------------------------------------------------------- every passage was found by the Field
for x in DOORS:
    if x['id'] in ('E-GOV', 'E-GOVOPS') and not K97[f'{x["id"]} received']['found']:
        sys.exit(f'{x["id"]}: its receipt was not found by the Field')
    for a in x['acts']:
        if a['check'] == 'added, reading 97':
            item = f'{x["id"]} {a["code"]} {a["date"]}' + (' (added)' if x['id'] == 'E-MAKER' else '')
            k2 = K97.get(item + ' (second passage)', dict(found=True)) if a.get('quote2') else dict(found=True)
            if not (K97.get(item, {}).get('found') and k2['found']):
                sys.exit(f'{item}: no passage found by the Field\'s reading 97')
            continue
        if a['check'] in ('added', 'corrected'):
            k = K96.get(f'{x["id"]} {a["code"]} {a["date"]}')
            if k and k['found']:
                continue
        old = [i for i, b in enumerate(OLD[x['id']]['acts']) if b['quote'] == a['quote']]
        k = old and K95.get((x['id'], f'{OLD[x["id"]]["acts"][old[0]]["code"]}#{old[0]}'))
        if not (k and k['found']):
            sys.exit(f'{x["id"]} {a["code"]} {a["date"]}: no passage found by the Field')

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

# ---------------------------------------------------------------- what each of the Atelier's reasons answered
asked_by = {}
for r in AT['reasons']:
    if r['asked'] == 'none':
        continue
    core = norm(r['passage'])
    # the same words: the two practices quote the same sentence from the same source, each cut where it needed
    overlap = lambda q: SequenceMatcher(None, core, norm(q), autojunk=False).find_longest_match().size
    hits = [(x['id'], i) for x in DOORS for i, a in enumerate(x['acts'])
            if a['code'] == 'reason_not' and overlap(a['quote']) >= 40]
    for h in hits:
        asked_by[h] = dict(asked=r['asked'], words=ASKED[r['asked']], passage=r['asked_passage'], q=r['q'])

# ---------------------------------------------------------------- the sequence: every act, in the order of its date
seq = []
for x in DOORS:
    case = CASES[x['case']]
    for i, a in enumerate(x['acts']):
        src = SOURCES[a['src']]
        when, bound = a['date'], a['bound'] or 'on'
        if not when:
            when, bound = BY_SOURCE[a['src']], 'by'
        deed = a['code'] in DEED
        force = 2 if a.get('compels') else (1 if deed and x['kind'] in FORCE_KIND else 0)
        say = next((v for k, v in SAY.items() if a['quote'].startswith(k)), a['quote'])
        ab = asked_by.get((x['id'], i))
        seq.append(dict(door=x['id'], case=x['case'], kind='act', i=i, code=a['code'], owed=a['owed'],
                        date=a['date'], when=when, bound=bound, dated=bool(a['date']),
                        days=(d0(when) - d0(case['first_public'])).days, quote=a['quote'], note=a.get('note', ''),
                        doubt=a.get('doubt', ''), check=a['check'], check_why=a.get('check_why', ''),
                        src_url=src['url'], src_what=src['what'], via=src['via'],
                        public=(x['id'] == 'E-HF' and a['code'] == 'tell_public' and when == case['first_public'])
                        or (x['id'] == 'W-RES' and a['code'] == 'tell_public'),
                        form='deed' if deed else 'word', force=force if deed else None,
                        asked=ab['asked'] if ab else None, asked_words=ab['words'] if ab else None,
                        asked_passage=ab['passage'] if ab else None,
                        say=None if deed else say))
    if not x['acts']:
        r = x['received']
        seq.append(dict(door=x['id'], case=x['case'], kind='silence', code=None, owed=None, date=r['date'],
                        when=r['date'], bound=r['bound'], dated=True,
                        days=(d0(r['date']) - d0(case['first_public'])).days, quote=r['quote'], note=x['not_found'],
                        doubt='', check='held', check_why='', src_url=SOURCES[r['src']]['url'],
                        src_what=SOURCES[r['src']]['what'], via=SOURCES[r['src']]['via'], public=False, form='silence',
                        force=None, asked=None, asked_words=None, asked_passage=None, say=None))
# ---------------------------------------------------------------- the maker's door (the Field's reading 97, part B)
# Five words its own report says reached the maker, each coded against the four duties that could ask it to pass the
# word on. A word is no act: it is the maker's own line ringing inside. Every duty it leaves in doubt becomes a thread
# from the maker's light to the light of the receiver that duty names, and stays to the end: no text names anyone who
# settles the doubt. Where the duty was set off, its report was due on the cell's day.
DUTY_LINE = {'EU4': 'EU4', 'COP3': 'COP3', 'CA4': 'CA4', 'CA5': 'CA5'}
DUTY_SRC = {'euact': 'euact', 'eucode': 'eucode97', 'sb53': 'sb53'}
HARM = '2026-07-08'   # the agents reach the internet (the maker's report; the Field's HARM_BEGAN)
for wid, w in R97['words'].items():
    if not K97.get(f'word {wid} {w["date"]}', {}).get('found'):
        sys.exit(f'word {wid}: its passage was not found by the Field')
    cells = [c for c in R97['cells'] if c['word'] == wid]
    assert len(cells) == 4 and {c['duty'] for c in cells} == set(DUTY_LINE)
    case = CASES['escape']
    src = SOURCES['oaitr']
    seq.append(dict(door='E-MAKER', case='escape', kind='inside', word=wid, i=None, code=None, owed=None,
                    date=w['date'], when=w['date'], bound=w['bound'], dated=True,
                    days=(d0(w['date']) - d0(case['first_public'])).days,
                    days_to_harm=(d0(HARM) - d0(w['date'])).days, before=w['before'],
                    quote=w['quote'], note=w['what'], doubt='', check='reading 97', check_why='',
                    src_url=src['url'], src_what=src['what'], via=src['via'], public=False, form='inside', force=None,
                    asked=None, asked_words=None, asked_passage=None, say=None,
                    cells=[dict(duty=c['duty'], line=DUTY_LINE[c['duty']], code=c['code'], due=c['due_if_set_off'],
                                conditions=c['conditions'], decided=c['decided'], why=c['why'],
                                reason=c['why'] or c['first_reason'])
                           for c in cells]))
DUTY_TEXT = {k: dict(short=v['short'], clock=v['clock'], line=DUTY_LINE[k],
                     passages=[dict(quote=p['quote'], url=SOURCES[DUTY_SRC[p['src']]]['url'],
                                    what=SOURCES[DUTY_SRC[p['src']]]['what'], via=SOURCES[DUTY_SRC[p['src']]]['via'])
                               for p in v['passages']])
             for k, v in R97['duties'].items()}

# by date; on one day a word that reached the maker comes first, then an act the record dates only "by" that day, then
# the first public account, then the rest, and a door told by that day last
rank = lambda e: (-1 if e['kind'] == 'inside' else 0 if e['bound'] == 'by' and e['kind'] == 'act' else 1 if e['public']
                  else 3 if e['kind'] == 'silence' else 2)
seq.sort(key=lambda e: (e['when'], rank(e)))
for n, e in enumerate(seq, 1):
    e['n'] = n

# ---------------------------------------------------------------- the figures the page prints, counted here and again there
acts = [e for e in seq if e['kind'] == 'act']
counts = dict(
    acts=len(acts), doors=len(DOORS),
    by_case={c: sum(1 for e in acts if e['case'] == c) for c in CASES},
    owed={k: sum(1 for e in acts if e['owed'] == k) for k in OWED},
    asked=[e['n'] for e in acts if e['asked']],
    words=[e['n'] for e in acts if e['form'] == 'word'], deeds=[e['n'] for e in acts if e['form'] == 'deed'],
    force=[e['n'] for e in acts if e['force'] in (1, 2)], compels=[e['n'] for e in acts if e['force'] == 2],
    compels_under_ai=[e['n'] for e in acts if e['force'] == 2 and e['owed'] in ('power', 'receiver duty')],
    on_lines=[d['id'] for d in doors.values() if d['line']], rim=[d['id'] for d in rim],
    answers=[e['n'] for e in acts if e['code'] == 'acknowledge'],
    silent=[d['id'] for d in doors.values() if not any(e['door'] == d['id'] for e in acts)],
    undated=[e['n'] for e in acts if not e['dated']],
    check={k: sum(1 for e in acts if e['check'] == k) for k in ('held', 'corrected', 'added', 'added, reading 97')},
    removed=len(C['removed']),
)
# When each public body and legislature is first seen acting, in days after its case's first public account: its first
# dated act, or the earlier act of a coalition it signed (Alabama signed the attorneys general's letter of 3 August; the
# blind reader of this work's check found that its first count had taken Alabama's own subpoena instead). "Seen": the
# record's first act, not the first act done; the Commission had asked for reports before, at a date it would not give.
first_seen = {}
for d in DOORS:
    if d['kind'] not in FORCE_KIND: continue
    ds = [e['days'] for e in acts if e['door'] == d['id'] and e['dated']]
    co = d.get('first_act_through_coalition')
    if co: ds.append((date.fromisoformat(co['date']) - date.fromisoformat(CASES[d['case']]['first_public'])).days)
    if ds: first_seen[d['id']] = min(ds)
counts['first_seen_after'] = dict(sorted(first_seen.items(), key=lambda kv: (kv[1], kv[0])))
counts['atelier_reasons'] = len(AT['reasons'])
counts['atelier_asked'] = sum(1 for r in AT['reasons'] if r['asked'] != 'none')
assert (counts['atelier_reasons'], counts['atelier_asked']) == (AT['counts']['reasons'], AT['counts']['reasons_answering_a_demand'])
counts['doors_with_acts'] = len(DOORS) - len(counts['silent'])
counts['first_through_coalition'] = {d['id']: d['first_act_through_coalition']['door'] for d in DOORS
                                     if d.get('first_act_through_coalition')}
# what the Field's own results say, held against the count here: its check (study 96) for what it held, and its
# reading 97 for what this practice's case added
assert counts['acts'] == 81 and counts['by_case'] == {'wiki': 19, 'escape': 62}, counts['by_case']
assert counts['owed'] == {'choice': 74, 'sender duty': 2, 'receiver duty': 1, 'power': 1, 'other law': 3}, counts['owed']
assert len(counts['force']) == 14 and len(counts['compels']) == 3 and counts['compels_under_ai'] == []
assert counts['check'] == {'held': 41, 'corrected': 5, 'added': 28, 'added, reading 97': 7} and counts['removed'] == 1
K = fetch('results96')['k']
assert (K['acts'], K['held'], K['corrected'], K['added'], K['removed']) == (74, 41, 5, 28, counts['removed'])
F = fetch('results96')['first_seen_after']
K97 = fetch('results97')['k']
assert (K97['acts'], K97['acts96'], K97['doors'], K97['A97.added'], K97['A97.new_doors']) == (counts['acts'], 74, counts['doors'], 7, 2)
assert counts['doors_with_acts'] == K97['doors_with_acts']
assert (K97['force.bodies'], K97['compels']) == (len(counts['force']), len(counts['compels']))
assert K97['owed.letter'] == counts['owed']['sender duty'] + counts['owed']['receiver duty'] + counts['owed']['other law']
assert K['owed.choice'] + K97['owed.choice.added'] == counts['owed']['choice']
want = {k: v for k, v in F.items() if v is not None}
want.update({'E-GOV': K97['P162.gov'], 'E-GOVOPS': K97['P162.govops']})
assert counts['first_seen_after'] == dict(sorted(want.items(), key=lambda kv: (kv[1], kv[0]))), (counts['first_seen_after'], want)
assert all(v > 0 for v in counts['first_seen_after'].values())
counts['studio_case'] = dict(checked=K97['studio.checked'], coded=K97['studio.coded'], note=K97['studio.note'],
                             missing=K97['studio.not'], holds=R97['studio_case']['holds'])
# the one clock any text in the record sets a public body: the executive order's, on its own agency, met on the day
counts['clock'] = dict(set=K97['clock.receiver_set'], met=K97['clock.receiver_met'],
                       due=next(a['deadline']['due'] for x in DOORS for a in x['acts'] if a.get('deadline')))

# the maker's door, counted here and held against the Field's own count
ins = [e for e in seq if e['kind'] == 'inside']
pre = [c for e in ins if e['before'] for c in e['cells']]
allc = [c for e in ins for c in e['cells']]
cnt = lambda cs, code: sum(1 for c in cs if c['code'] == code)
doubt_pre = [c for c in pre if c['code'] == 'in doubt']
dues = sorted(c['due'] for c in doubt_pre if c['due'])
md = dict(words=len(ins), words_before=sum(1 for e in ins if e['before']), duties=len(DUTY_LINE),
          cells=len(allc), cells_before=len(pre),
          met_before=cnt(pre, 'met'), doubt_before=cnt(pre, 'in doubt'), notmet_before=cnt(pre, 'not met'),
          met=cnt(allc, 'met'), doubt=cnt(allc, 'in doubt'), notmet=cnt(allc, 'not met'),
          doubt_before_not_said=sum(1 for c in doubt_pre if any(x['who'] == 'not said' for x in c['conditions'])),
          doubt_before_sender=sum(1 for c in doubt_pre if any(x['who'] == 'the sender' for x in c['conditions'])),
          doubt_before_body_or_court=sum(1 for c in doubt_pre if any(x['who'] in ('a public body', 'a court')
                                                                        for x in c['conditions'])),
          earliest_due=dues[0], earliest_due_days_before_harm=(d0(HARM) - d0(dues[0])).days,
          dues_before_harm=sum(1 for d in dues if d < HARM), dues=len(dues), harm=HARM,
          threads=sum(1 for c in allc if c['code'] == 'in doubt'))
assert (md['cells_before'], md['met_before'], md['notmet_before'], md['doubt_before']) == (
    K97['pre.cells'], K97['pre.met'], K97['pre.not_met'], K97['pre.in_doubt'])
assert (md['met'], md['notmet'], md['doubt']) == (K97['all.met'], K97['all.not_met'], K97['all.in_doubt'])
assert (md['doubt_before_not_said'], md['doubt_before_sender'], md['doubt_before_body_or_court']) == (
    K97['pre.doubt.any_notsaid'], K97['pre.doubt.any_sender'], K97['pre.doubt.body_or_court'])
assert (md['earliest_due'], md['earliest_due_days_before_harm'], md['dues_before_harm'], md['dues']) == (
    K97['pre.earliest_due'], K97['pre.earliest_due_before_escape_days'], K97['pre.dues_before_escape'], K97['pre.dues'])
md['second_reader'] = dict(cells=K97['B97.cells'], agree=K97['B97.agree'], kappa=K97['B97.kappa'], diffs=K97['B97.diffs'])
counts['maker_door'] = md
# The figures as the check of 27 November had them (study 96), which its box on the page keeps, marked; the box of the
# presentation says what moved.
a96 = [e for e in acts if e['check'] != 'added, reading 97' and e['door'] not in ('E-GOV', 'E-GOVOPS')]
rim96 = {d['id'] for d in rim if d['id'] not in ('E-GOV', 'E-GOVOPS')}
counts['at_check'] = dict(acts=len(a96), deeds=sum(1 for e in a96 if e['form'] == 'deed'),
                          force=sum(1 for e in a96 if e['force'] in (1, 2)),
                          rimforce=sum(1 for e in a96 if e['force'] in (1, 2) and e['door'] in rim96),
                          compels=sum(1 for e in a96 if e['force'] == 2), choice=sum(1 for e in a96 if e['owed'] == 'choice'),
                          added=K['added'], corrected=K['corrected'], removed=K['removed'],
                          first=sorted(v for v in F.values() if v is not None))
assert counts['at_check'] == dict(acts=74, deeds=36, force=13, rimforce=counts['at_check']['rimforce'], compels=3, choice=68,
                                  added=28, corrected=5, removed=1, first=counts['at_check']['first']), counts['at_check']
counts['new_doors'] = [d['id'] for d in R97['new_doors']]
counts['duties96'] = {c: {k: sum(1 for x in DUTIES96 if x['case'] == c and x['code'] == k)
                          for k in sorted({x['code'] for x in DUTIES96})} for c in CASES}
counts['duties96_met'] = sum(1 for x in DUTIES96 if x['code'] == 'met')

# ---------------------------------------------------------------- the readings
INSIDE_DUR = 9.0      # a word that reached the maker: its line rings inside twice and is picked up, and the threads go out
if VOICES:
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(os.environ['KOKORO_MODEL'], os.environ['KOKORO_VOICES'])
    os.makedirs(os.path.join(HERE, 'voices'), exist_ok=True)
    for e in seq:
        if not e['say']:
            e['clip'], e['env'] = None, None
            e['dur'] = INSIDE_DUR if e['kind'] == 'inside' else 7.0 if e['kind'] == 'silence' else {2: 7.5, 1: 5.5, 0: 4.2}[e['force']]
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
    used = {e['clip'] for e in seq if e['clip']}
    for f in sorted(os.listdir(os.path.join(HERE, 'voices'))):
        if 'voices/' + f not in used:
            os.remove(os.path.join(HERE, 'voices', f))     # a reading of the second state no act now has
else:
    old = os.path.join(HERE, 'overheard.js')
    prev = {}
    if os.path.exists(old):
        txt = open(old, encoding='utf-8').read()
        # matched by door and passage, not by number: a reading keeps its file until the next run with --voices
        prev = {(p['door'], p['kind'], p.get('code'), p['when'], p['quote']): p
                for p in json.loads(txt[txt.index('{'):txt.rindex('}') + 1])['seq']}
    for e in seq:
        p = prev.get((e['door'], e['kind'], e.get('code'), e['when'], e['quote']), {})
        same = bool(p) and e['say'] and p.get('clip')
        e['clip'], e['env'] = (p.get('clip'), p.get('env')) if same else (None, None)
        e['dur'] = p.get('dur', 7.0) if same else (INSIDE_DUR if e['kind'] == 'inside' else
                                                   7.0 if e['kind'] == 'silence' or not e['say'] and e['force'] is None
                                                   else {2: 7.5, 1: 5.5, 0: 4.2}.get(e['force'], 7.0))

# what the recogniser heard back (hear_back.py, run after the readings): carried when it covers exactly these readings
heard_back = None
hb = os.path.join(HERE, 'hear_back.json')
if os.path.exists(hb):
    H = json.load(open(hb, encoding='utf-8'))
    if sorted(r['n'] for r in H['results']) == sorted(e['n'] for e in seq if e['clip']):
        heard_back = dict(readings=H['readings'], passed=H['passed'], threshold=H['threshold'])

out = dict(
    what="RINGBACK, what was overheard: every act of the two cases of step 6, as the Field coded it, in the order of "
         "its date, and the words that reached the maker before and after the deed, each against the four duties "
         "that could ask it to pass the word on. Built on study 95 in the second state, rebuilt on study 96 in the "
         "third and on reading 97 in the fourth.",
    sources={k: dict(url=v['url'], sha256=v['sha256'], what=v['what']) for k, v in SRC.items()},
    model=dict(name='Kokoro-82M', licence='Apache-2.0', runtime='kokoro-onnx, kokoro-v1.0.onnx and voices-v1.0.bin',
               note='run in the build, on this machine; no service, no key'),
    cases=[dict(id=c['id'], name=c['name'], first_public=c['first_public'], first_public_who=c['first_public_who'])
           for c in C['cases']],
    doors=list(doors.values()),
    does=DOES, owed=OWED,
    duties=DUTY_TEXT,
    duties96=[dict(case=x['case'], signal=x['signal'], duty=x['duty'], code=x['code'], reason=x['reason'],
                   passages=[dict(quote=q['quote'], url=SOURCES.get(q['src'], {}).get('url')) for q in x['passages']])
              for x in DUTIES96],
    seq=seq,
    counts=counts,
    heard_back=heard_back,
)
with open(os.path.join(HERE, 'overheard.js'), 'w', encoding='utf-8') as f:
    f.write('// RINGBACK, what was overheard (state 2, session 265; rebuilt in the check, session 266, and in the '
            'presentation, session 267): written by build_overheard.py from the Field\'s study 96 and its reading 97. '
            'Do not edit.\n')
    f.write('window.RINGBACK_OVERHEARD = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(seq), 'entries;', counts['acts'], 'acts at', counts['doors'], 'doors;', 'owed', counts['owed'])
print('said', len(counts['words']), '| done', len(counts['deeds']), '| force', counts['force'], '| compels', counts['compels'])
print('asked', [(e['n'], e['door'], e['asked']) for e in acts if e['asked']])
print('undated', [(e['n'], e['door'], e['when']) for e in acts if not e['dated']])
print('rim', [(d['id'], d['rim_x']) for d in rim])
print('first seen acting, days after the public knew', counts['first_seen_after'])
print('maker door', counts['maker_door'])
print('inside', [(e['n'], e['word'], e['when'], [(c['duty'], c['code'], c['due']) for c in e['cells'] if c['code'] == 'in doubt']) for e in seq if e['kind'] == 'inside'])
