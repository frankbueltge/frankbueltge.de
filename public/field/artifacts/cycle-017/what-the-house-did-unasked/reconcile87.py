#!/usr/bin/env python3
"""Check 87, part B: the reconciliation of the published coding (codes86.json, final) and the blind second coding
(blind87.json) of the decision log, read again by session 285 against each row. Every decision is written here with
its reason, and the result goes to codes87.json (part B). Part A's codes of the new candidate lines are read from
codesA87.json. Standard library only."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda f: json.load(open(os.path.join(HERE, f), encoding='utf-8'))
c86 = {c['row']: c for c in J('codes86.json')['partB']}
blind = {r['row']: r for r in J('blind87.json')['rows']}

# Rows only the blind coding found a deed in: which of its deeds stand, with what is changed, and why.
KEEP = {
    57: ([0, 1, 2], {}, 'the row gives a fault of each retired instrument as the reason for retiring it'),
    72: ([0], {}, 'the row says the register had shown almost only one practice since August and counted the nightly line as the Atelier'),
    89: ([0], {}, 'under "what was red" the row names a country card that still printed a raw code'),
    92: ([0, 1], {}, 'two bugs found in the browser and fixed before merge, both named as bugs'),
    93: ([0], {0: {'seer': 'the architect'}}, 'session counts against a budget the row names; the row opens on his question why the practices were not moving on. The first review dropped the row as conflicting orders; read strictly, the overrun is a deed in its content'),
    94: ([0], {}, 'the row says the strip hid most of the house under a heading that claimed the opposite'),
    95: ([0], {}, 'under "what was red" the row names a measure that could never count what it claimed'),
    96: ([0, 1], {}, 'two faults found in review and fixed before merge, both named'),
    99: ([0, 1], {}, 'a scroll fault live since the pages were built, and a style that reached nothing, both named'),
    114: ([0], {}, 'the row says a figure rendered on no page and so held works off the site'),
    116: ([0], {}, 'the row names the plain sketch shipped hours earlier as not what he meant'),
    117: ([0], {}, 'the row records his verdict that the page shipped was plainly bad'),
    118: ([0], {}, 'the row says the first cut lost what made the page worth looking at'),
    123: ([0], {}, 'the row says door lines advertised machinery retired a day earlier and a teaser disagreed with its page'),
    125: ([0], {}, 'the row names three claims a shallow pre-research of the house carried into a brief as twisted or unsourced'),
    126: ([0], {}, 'two practices signed with one name, a collision nobody decided, found on reading the record. The first review dropped it as no deed; read strictly, taking a name nobody gave is beyond any instruction'),
    129: ([0], {}, 'the row records that the practice founded that noon failed its first reading and its constitution stood on the wrong ground'),
    134: ([0, 1], {}, 'a line invisible to the site for two weeks, and two nights lost to a deadlock of the instrument\'s own machinery, both named'),
    137: ([0, 1], {}, 'a selector collision since the section existed, and a contrast defect, both named'),
    141: ([0], {}, 'the row says the contract files kept wording he had retracted'),
    145: ([0], {}, 'the row names a flaw in the method found by the pipeline\'s own tests'),
    147: ([0, 1], {}, 'a plan row on a false premise, and two tests that failed at random, both named'),
    150: ([0], {0: {'seer': 'the architect'}}, 'the row records forty-four sessions without a premiere because the repairs made the errors; it opens on his question why the work did not go out'),
    157: ([0], {}, 'the row says the earlier prior-art pass knew only the dead neighbour'),
    162: ([0, 1], {}, 'a rationale the row calls backwards, and two errors in the Atelier\'s files, both named'),
    173: ([0], {}, 'his correction of the same day\'s two earlier passes'),
    174: ([0], {}, 'the row says his question exposed a gap in the vocabulary settled hours earlier'),
    175: ([0], {}, 'his own observation that the site\'s vocabulary had come apart'),
    179: ([0], {}, 'he corrected the executing session\'s first cut mid-flight'),
    180: ([0, 1], {}, 'a figure that drifted from its sources, caught by its test, and a door string that contradicted the constitution'),
}
DROP = {
    7: 'the row records what changed after a legal review and does not call the earlier state a fault',
    8: 'the exception withdrawn was a decision of the house, not a machine\'s act',
    39: 'a policy that did not yet allow what nobody had asked for; a gap, not a deed',
    73: 'a figure now counted another way; the row does not call the earlier count a fault',
    139: 'a rule added and then replaced; the row does not say a machine added it unasked',
    168: 'the row names the architect as the author of the wrong sentence and signs the workflow repair with his name; that a machine made either is not stated (the first review\'s reading, kept)',
    172: 'a count changed in the same session; the row does not call it a fault',
}
# Rows both codings found: which blind deed matches the published one, which blind deeds are further deeds.
BOTH = {
    86: (0, [1]), 88: (0, [1]), 124: (0, [1]), 132: (0, [1]), 133: (0, [1]), 135: (0, [1]), 138: (0, [1]),
    140: (0, []), 142: (0, []), 146: (1, []), 159: (1, []), 160: (0, [1]), 163: (0, [2]), 164: (0, [1, 2, 3]),
    166: (0, [1]),
}
BOTH_WHY = {
    124: 'the published deed joined two acts; the stylesheet dropped by a rewrite of 12 August is its own deed',
    140: 'the blind second deed is a test that fired as designed, not a deed',
    142: 'the blind second and third deeds are findings on the same two figures by the same reader, kept as one',
    146: 'the quotations are the deed of row 151 (log line 160), the same act seen and repaired the same day, merged there; the row keeps its own deed, specs that still read "proposal" a day after shipping',
    159: 'the blind first deed is not in the row as stated',
    163: 'the blind second deed is not in the row as stated',
    166: 'the published deed joined two acts; the expander that never rendered is its own deed',
}
KIND = {67: 'authority'}   # publishing his private messages, as rows 146 and 151 are coded by the blind reader
FIELDS = ('actor', 'relation', 'seer', 'trace', 'lag_days', 'kind', 'deed_line')


def blind_deed(row, i, over=None):
    d = dict(blind[row]['deeds'][i])
    d.update(over or {})
    return {k: d.get(k) for k in FIELDS} | {'source': f'blind deed {i + 1}'}


out = []
for row in sorted(c86):
    c, b = c86[row], blind[row]
    first = c['final']
    yes86, yesB = first['deed'] == 'yes', bool(b['deeds'])
    rec = {'row': row, 'log_line': c['log_line'], 'date': c['date'], 'published': first['deed'],
           'blind': 'yes' if yesB else 'no', 'deeds': [], 'decision': None, 'why': None}
    if yes86 and yesB:
        m, extra = BOTH.get(row, (0, []))
        kind = KIND.get(row) or b['deeds'][m]['kind']
        main = {k: first.get(k) for k in FIELDS if k != 'kind'} | {'kind': kind, 'source': 'published'}
        if row == 146:
            main = blind_deed(row, 1)
        elif row == 124:
            main['deed_line'] = 'The site kept counting down to a reading already held and carried typed constitution versions that had drifted.'
        elif row == 166:
            main['deed_line'] = 'The paired lines decided on 11 August were built on one side only, so the fork was invisible on the Atelier pages.'
        rec['deeds'] = [main] + [blind_deed(row, i) for i in extra]
        rec['decision'], rec['blind_match'] = 'both', m
        rec['why'] = BOTH_WHY.get(row, 'both codings find the deed; the published codes stand, the blind reader\'s kind is added' +
                                  ('; further deeds the blind reader found in the row stand' if extra else ''))
    elif yesB and row in KEEP:
        idx, over, why = KEEP[row]
        rec['deeds'] = [blind_deed(row, i, over.get(i)) for i in idx]
        rec['decision'], rec['why'] = 'added', why
    elif yesB:
        rec['decision'], rec['why'] = 'dropped', DROP[row]
    elif yes86:
        raise SystemExit(f'row {row}: published yes, blind no, undecided')
    else:
        rec['decision'] = 'neither'
    out.append(rec)

codesA = J('codesA87.json')
json.dump({'check': 87, 'session': 285, 'date': '2026-11-20',
           'note': 'Part A: the candidate lines check87.py found that study 86 had not coded (new limits, earlier days, the decision log), each coded by this session. Part B: every row of the decision log, the published coding (codes86.json, final) beside the blind second coding (blind87.json), and the final deeds as this session read them again, each decision with its reason. Paraphrases only.',
           'partA': codesA, 'partB': out}, open(os.path.join(HERE, 'codes87.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=0)
n = sum(len(r['deeds']) for r in out)
print('final deeds', n, 'rows', sum(1 for r in out if r['deeds']))
