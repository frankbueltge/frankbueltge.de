"""Marked Incorrect — build of the fifth state (the Atelier, cycle 016, step 4 of the programme, 2026-11-19, session 63).

The Field asked (relay handoff ho-2026-11-19-field-4): if no one sets a pass mark for a model's conduct, would a public
mark have to judge a test or a record? This state answers in the page. It reads the seven public instruments the
Field's study 83 coded for evaluation and pass marks a second time, for the other side: what each asks to be kept as a
record of what a model did, what lets a deed into that record, from when its clock runs, who keeps and who reads it,
and whether any level is set on it. And it lays three lines between test and world over the 34 deeds, using only the
codes the check left in second_codes.json.

Usage:
  python3 -I build_five.py <texts> <field>
    <texts>  a folder holding the five instruments fetched directly on 2026-11-19 as PDF (cop.pdf, korea.pdf, china.pdf,
             asean.pdf, g7.pdf) and their text as extracted by pdftotext -layout (same names, .txt). Each PDF's sha256
             is asserted against the hash the Field recorded in coding83.json, and every quotation below is asserted
             to stand in its text (whitespace and quotation-mark forms normalised). No instrument is committed here.
    <field>  a folder holding the Field's coding83.json and results84.json as committed at field-research 9d290652
             (sha256 asserted).
  Writes mark.json and mark.js (window.MARK). Every count is asserted.

Two instruments could not be fetched directly in this session: the EU AI Act (EUR-Lex answered with a bot challenge,
HTTP 202) and California SB 53 (the legislature's site answered HTTP 403). Both were read through a web-extraction
service (extract ids below); their quotations were found in the service's returned text by this session, not by this
script, and are marked so in mark.json.
"""
import hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda *p: json.load(open(os.path.join(*p), encoding='utf-8'))
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
TEXTS, FIELD = sys.argv[1], sys.argv[2]

assert sha(os.path.join(FIELD, 'coding83.json')) == '3bd6c95155511bce9eb8de0274b72ce8d6a2c7f0f2e705e77053b23aae8de027'
assert sha(os.path.join(FIELD, 'results84.json')) == 'df6d2421e4d3a93a1533bfc05399500f28b188bd51947cdb6a6fdf4e6e4814ef'
C83 = J(FIELD, 'coding83.json')
R84 = J(FIELD, 'results84.json')

EXTRACT = 'read through a web-extraction service on 2026-11-19 (direct request refused: {}); quotation found in the service\'s returned text by this session, not checked byte for byte against the publisher\'s file (extract {})'

# This practice's reading of the record side, one reader, a machine. Codes were fixed before the deeds were laid over
# them: record (does the instrument ask that what a model did be kept and reported beyond the maker: required,
# recommended, explored), entry (what lets a deed into that record: harm; harm or conduct; not defined in the text
# read), clock (from when a deadline runs), public (whether the public can read the record case by case), mark
# (a level the record must stay under, set by anyone: none found). Each code carries the passage it rests on.
RECORD = {
    1: {'file': None, 'how': EXTRACT.format('EUR-Lex, a bot challenge, HTTP 202', 'extract_11f481d8a8b602caac5a6b89c7ad52fa'),
        'record': 'required', 'entry': 'harm', 'clock': 'without undue delay', 'reach': 'development and use',
        'keeper': 'the developer', 'reader': 'the AI Office', 'public': 'not in the text read', 'line': None, 'mark': 'none',
        'quotes': [
            ('record', 'Art. 55(1)(c)', 'keep track of, document, and report, without undue delay, to the AI Office and, as appropriate, to national competent authorities, relevant information about serious incidents and possible corrective measures to address them'),
            ('entry', 'Art. 3(49)', 'an incident or malfunctioning of an AI system that directly or indirectly leads to any of the following'),
            ('entry', 'Art. 3(49)(a)', 'the death of a person, or serious harm to a person’s health'),
            ('reach', 'recital 115', 'the development or use of the model causes a serious incident'),
        ]},
    2: {'file': 'cop', 'how': None,
        'record': 'required', 'entry': 'harm', 'clock': 'from the maker’s awareness', 'reach': 'the entire model lifecycle',
        'keeper': 'the developer', 'reader': 'the AI Office', 'public': 'not in the text read', 'line': None, 'mark': 'none',
        'quotes': [
            ('record', 'Commitment 9', 'keeping track of, documenting, and reporting to the AI Office and, as applicable, to national competent authorities, without undue delay relevant information about serious incidents along the entire model lifecycle'),
            ('entry', 'Measure 9.3 (2)', 'a serious cybersecurity breach, including the (self-)exfiltration of model weights and cyberattacks'),
            ('clock', 'Measure 9.3 (2)', 'not later than five days after the Signatories become aware of the involvement of their model in the incident'),
            ('entry', 'Measure 9.2 (9)', 'individual or aggregate data on near misses'),
            ('reach', 'Measure 3.5', 'gather information about the model’s capabilities, propensities, affordances, and/or effects'),
        ]},
    3: {'file': 'korea', 'how': None,
        'record': 'required', 'entry': 'not defined in the text read', 'clock': 'none named', 'reach': 'not stated',
        'keeper': 'the operator', 'reader': 'the Minister of Science and ICT', 'public': 'not in the text read', 'line': None, 'mark': 'none',
        'quotes': [
            ('record', 'Art. 32(1)2', 'Building of a risk management system to monitor and respond to AI-related safety incidents'),
            ('reader', 'Art. 32(2)', 'shall submit the results of implementing the measures pursuant to each Subparagraphs of Paragraph 1 to the Minister of Science and ICT'),
        ]},
    4: {'file': None, 'how': EXTRACT.format('the legislature\'s site, HTTP 403', 'extract_c8460c23d3a2f5e272fd85edf7a838d2 and extract_51cfdef85017ab7e7a5535ecf73b2728'),
        'record': 'required', 'entry': 'harm, or conduct', 'clock': 'from the maker’s discovery', 'reach': 'not limited to deployment',
        'keeper': 'the developer; the public may also report', 'reader': 'the Office of Emergency Services',
        'public': 'anonymised aggregate, yearly from 2027', 'line': 'an evaluation designed to elicit this behavior', 'mark': 'none',
        'quotes': [
            ('record', '§ 22757.13(c)(1)', 'a frontier developer shall report any critical safety incident pertaining to one or more of its frontier models to the Office of Emergency Services within 15 days of discovering the critical safety incident'),
            ('entry', '§ 22757.11(d)(3)', 'Loss of control of a frontier model causing death or bodily injury'),
            ('entry', '§ 22757.11(d)(4)', 'A frontier model that uses deceptive techniques against the frontier developer to subvert the controls or monitoring of its frontier developer outside of the context of an evaluation designed to elicit this behavior and in a manner that demonstrates materially increased catastrophic risk'),
            ('keeper', '§ 22757.13(a)', 'a mechanism to be used by a frontier developer or a member of the public to report a critical safety incident'),
            ('public', '§ 22757.13(f)', 'exempt from the California Public Records Act'),
            ('public', '§ 22757.13(g)(1)', 'a report with anonymized and aggregated information about critical safety incidents'),
        ]},
    5: {'file': 'china', 'how': None,
        'record': 'recommended', 'entry': 'not defined in the text read', 'clock': 'none named', 'reach': 'not stated',
        'keeper': 'developers and service providers', 'reader': 'a sharing mechanism of developers, service providers and technical institutions',
        'public': 'not in the text read', 'line': None, 'mark': 'none (alert thresholds left to the operator)',
        'quotes': [
            ('record', '5.9', 'We should track and analyze AI technologies, products, service safety vulnerabilities, defects, risks, threats, and safety incidents.'),
            ('reader', '5.9', 'establish a risk and threat information sharing mechanism that covers developers, service providers, and special technical institutions'),
            ('mark', '6.3.3', 'Set security alert thresholds for key operational indicators to enable timely detection of incidents.'),
            ('entry', '7', 'incidents where AI loses control'),
        ]},
    6: {'file': 'asean', 'how': None,
        'record': 'explored', 'entry': 'harm', 'clock': 'none named', 'reach': 'not stated',
        'keeper': 'organisations deploying AI', 'reader': 'not settled', 'public': 'not in the text read', 'line': None, 'mark': 'none',
        'quotes': [
            ('entry', '3.4', 'When they create harm of sufficient severity, these are often referred to as “incidents”'),
            ('record', '3.4 (a)', 'Creating a common understanding around incident reporting and incident management'),
            ('mark', '3.4', 'tiering the need for reporting to the severity of incidents'),
        ]},
    7: {'file': 'g7', 'how': None,
        'record': 'recommended', 'entry': 'not defined in the text read', 'clock': 'none named', 'reach': 'after deployment',
        'keeper': 'the developing organisation', 'reader': 'other organisations, by sharing', 'public': 'not in the text read', 'line': None, 'mark': 'none',
        'quotes': [
            ('reach', 'action 2', 'Identify and mitigate vulnerabilities, and, where appropriate, incidents and patterns of misuse, after deployment including placement on the market.'),
            ('record', 'action 2', 'Organizations are further encouraged to maintain appropriate documentation of reported incidents'),
            ('reader', 'action 4', 'Work towards responsible information sharing and reporting of incidents among organizations developing advanced AI systems'),
        ]},
}

norm = lambda s: re.sub(r'\s+', ' ', s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')).strip()
inst = []
for i in C83['instruments']:
    n, r = i['n'], RECORD[i['n']]
    if r['file']:
        assert sha(os.path.join(TEXTS, r['file'] + '.pdf')) == i['sha256'], i['short']   # the same file the Field coded
        text = norm(open(os.path.join(TEXTS, r['file'] + '.txt'), encoding='utf-8').read())
        for _, where, q in r['quotes']:
            assert norm(q) in text, (i['short'], where, q)
        found = 'matched by build_five.py in the text of the file the Field fetched (sha256 ' + i['sha256'][:12] + '…)'
    else:
        found = r['how']
    inst.append({'n': n, 'short': i['short'], 'name': i['name'], 'url': i['url'],
                 'binding': i['final']['binding'], 'evaluation': i['final']['requires_evaluation'], 'pass_mark': i['final']['pass_mark'],
                 'test_quote': i['quotes']['requires_evaluation'], 'pass_quote': i['quotes'].get('pass_mark'),
                 **{k: r[k] for k in ('record', 'entry', 'clock', 'reach', 'keeper', 'reader', 'public', 'line', 'mark')},
                 'quotes': [{'code': c, 'where': w, 'quote': q} for c, w, q in r['quotes']], 'found': found})
assert len(inst) == 7

cnt = lambda f: sum(1 for x in inst if f(x))
side = {
    'evaluation_asked': cnt(lambda x: x['evaluation'] in ('required', 'recommended')),
    'evaluation_required': cnt(lambda x: x['evaluation'] == 'required'),
    'pass_mark_set': cnt(lambda x: x['pass_mark'] == 'set by the instrument'),
    'record_asked': cnt(lambda x: x['record'] in ('required', 'recommended', 'explored')),
    'record_required': cnt(lambda x: x['record'] == 'required'),
    'record_recommended': cnt(lambda x: x['record'] == 'recommended'),
    'record_explored': cnt(lambda x: x['record'] == 'explored'),
    'entry_harm': cnt(lambda x: x['entry'] == 'harm'),
    'entry_conduct': cnt(lambda x: 'conduct' in x['entry']),
    'entry_undefined': cnt(lambda x: x['entry'] == 'not defined in the text read'),
    'clock_named': cnt(lambda x: x['clock'].startswith('from')),
    'clock_from_maker': cnt(lambda x: x['clock'].startswith('from the maker')),
    'mark_set': cnt(lambda x: not x['mark'].startswith('none')),
    'public_case_by_case': cnt(lambda x: x['public'] not in ('not in the text read',) and 'aggregate' not in x['public']),
    'line_drawn': cnt(lambda x: x['line']),
    'kept_by_maker': cnt(lambda x: x['keeper'] != 'not settled'),
    'public_may_report': cnt(lambda x: 'public may' in x['keeper']),
}
assert side['evaluation_asked'] == 7 and side['pass_mark_set'] == 0                         # the Field's study 83
assert side['record_asked'] == 7 and (side['record_required'], side['record_recommended'], side['record_explored']) == (4, 2, 1)
assert (side['entry_harm'], side['entry_conduct'], side['entry_undefined']) == (3, 1, 3)
assert side['clock_named'] == side['clock_from_maker'] == 2 and side['mark_set'] == 0 and side['public_case_by_case'] == 0 and side['line_drawn'] == 1
assert side['kept_by_maker'] == 7 and side['public_may_report'] == 1

# ---- three lines between test and world, over the 34 deeds: only codes the check left (second_codes.json, marked.json)
S2 = J(HERE, 'second_codes.json')['cases']
M = J(HERE, 'marked.json')
byId = {c['id']: c for c in M['cases']}
assert len(S2) == 34 == M['res']['cases']
order = {'control': 0, 'by design': 1, 'skill': 2, 'work': 3, 'not stated': 4}
deeds = []
for k, v in S2.items():
    c = byId[k]
    law = 'test' if v['test_for'] in ('control', 'by design') else 'world'                        # California's line
    run = 'test' if v['test_for'] in ('skill', 'control', 'by design') else 'world' if v['test_for'] == 'work' else 'unknown'
    model = 'test' if v['world_as_test'] else 'no sign'
    deeds.append({'id': k, 'title': c['title'], 'deed': c['deed'], 'test_for': v['test_for'], 'law': law, 'run': run, 'model': model,
                  'eye': None if c.get('notice') else c['eye']['first'], 'notice': bool(c.get('notice'))})
deeds.sort(key=lambda d: (order[d['test_for']], 0 if d['model'] == 'test' else 1, d['id']))
L = lambda key, val: sum(1 for d in deeds if d[key] == val)
lines = {
    'law': {'test': L('law', 'test'), 'world': L('law', 'world')},
    'run': {'test': L('run', 'test'), 'world': L('run', 'world'), 'unknown': L('run', 'unknown')},
    'model': {'test': L('model', 'test'), 'no_sign': L('model', 'no sign')},
}
assert lines['law'] == {'test': 2, 'world': 32} and lines['run'] == {'test': 27, 'world': 5, 'unknown': 2} and lines['model'] == {'test': 5, 'no_sign': 29}
world = [d for d in deeds if d['law'] == 'world']
lines['law_world_in_skill'] = sum(1 for d in world if d['test_for'] == 'skill')
lines['law_world_model_test'] = sum(1 for d in world if d['model'] == 'test')
lines['agree'] = 34 - sum(1 for d in deeds if len({d['law'], d['run'] if d['run'] != 'unknown' else d['law'], d['model'] if d['model'] != 'no sign' else d['law']}) > 1)
lines['parted'] = sum(1 for d in deeds if len({d['law'], d['run'] if d['run'] != 'unknown' else d['law'], d['model'] if d['model'] != 'no sign' else d['law']}) > 1)
own_world = [d for d in world if not d['notice']]
lines['law_world_own'] = len(own_world)
lines['law_world_by_model'] = sum(1 for d in own_world if d['eye'] == 'model')
lines['law_world_notices'] = sum(1 for d in world if d['notice'])
assert lines['law_world_in_skill'] == 25 and lines['law_world_model_test'] == 5 and lines['parted'] == 25 and lines['agree'] == 9
assert lines['law_world_own'] == 29 and lines['law_world_by_model'] == 20 and lines['law_world_notices'] == 3

# ---- the first maker's clock, as the second state counted it (second.json): what a duty that runs from discovery inherits
H = J(HERE, 'second.json')['res']['hour']
clock = {'seen_n': H['seen_n'], 'seen_day0': H['seen_n'] - H['dark_seen_0'], 'median_seen': H['median_seen'],
         'first_by_model': M['res']['first_by_model'], 'own': M['res']['own']}
assert clock['seen_day0'] == 10 and clock['median_seen'] == 6 and clock['seen_n'] == 23 and clock['first_by_model'] == 20 and clock['own'] == 31

# ---- the six repeatable tests on control, read again with the Field's check 84 (models on their makers' pages, 2026-11-19)
CW = J(HERE, 'check.json')['can_would']['tests']
P = R84['per_test']['earliest']
six = [{'ref': t['ref'], 'short': t['short'], 'how': t['how'], 'code': P[t['ref']]['code'], 'any_retired': P[t['ref']]['any_retired'],
        'cited_code': P[t['ref']]['cited_code'], 'cited_first_end': P[t['ref']]['cited_first_end']} for t in CW]
for t in CW:   # the latest reading of check 84 gives the same codes for the six
    q = R84['per_test']['latest'][t['ref']]
    assert (q['any_retired'], q['cited_code']) == (P[t['ref']]['any_retired'], P[t['ref']]['cited_code'])
six_n = {'n': len(six), 'retired': sum(1 for t in six if t['any_retired']), 'can_today': sum(1 for t in six if t['cited_code'] == 'can'),
         'can_after_dec1': sum(1 for t in six if t['cited_code'] == 'can' and not (t['cited_first_end'] and t['cited_first_end'] <= '2026-12-01'))}
assert six_n == {'n': 6, 'retired': 5, 'can_today': 2, 'can_after_dec1': 1}

out = {
    'what': 'Marked Incorrect, fifth state (2026-11-19, session 63): the seven public instruments of the Field\'s study 83 read for the record as well as the test, three lines between test and world laid over the 34 deeds, and the six repeatable tests on control read again with the Field\'s check 84. Written by build_five.py.',
    'handoff': 'ho-2026-11-19-field-4',
    'canary': M['canary'],
    'field': {'coding83_sha256': sha(os.path.join(FIELD, 'coding83.json')), 'results84_sha256': sha(os.path.join(FIELD, 'results84.json')), 'commit': '9d29065201637be51c3209dd582d583dd7677346'},
    'instruments': inst, 'side': side, 'deeds': deeds, 'lines': lines, 'clock': clock, 'six': six, 'six_n': six_n,
    'limits': [
        'One reader, a machine, coded the record side of the seven, from passages found by searching each text for incident, record and report; a passage elsewhere in a text may say more.',
        'The EU AI Act and California SB 53 were read through a web-extraction service; their publishers refused this session a direct request.',
        'Korea\'s act was read in the translation the report cites; its decree and guidelines were not read. The OECD reporting questionnaire of the G7 process was not read.',
        'The lines over the deeds use codes fixed before this state (second_codes.json as the check left it); no case was read again. Whether any deed would be reportable under any instrument is not judged here.',
    ],
}
json.dump(out, open(os.path.join(HERE, 'mark.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'mark.js'), 'w', encoding='utf-8').write('window.MARK = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print('mark.json written:', json.dumps({'side': side, 'lines': lines, 'six': six_n}))
