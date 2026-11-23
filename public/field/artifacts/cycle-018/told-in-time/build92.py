"""Check 92 -- reconcile the second codings, recount what the check changes, and write codes92.json, traces92.json,
results92.json and data92.js.

Usage: python3 build92.py
Reads signals90.json, blind92.json, agree92.json (part A), moved91.json, blind92-traces.json, search92.json,
quotes92.json (part B), window92.json, house91.json (part C) beside it. No network, no model.
Every state-3 figure on the page (data-k3) is computed here and recounted by verify92.mjs.
"""
import hashlib, json, os, statistics
from collections import Counter
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda f: json.load(open(os.path.join(HERE, f)))
EVENT = ('event short of harm', 'harm')
BEFORE = ('before deployment', 'schedule', 'event short of harm')
DUR = ['intergovernmental', 'public body', 'third party', 'sender']


def sha(f):
    return hashlib.sha256(open(os.path.join(HERE, f), 'rb').read()).hexdigest()


def kappa(a, b):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / (n * n)
    return (round((po - pe) / (1 - pe), 2) if pe < 1 else None), round(po, 3)


# ---- Part A: every disagreement, read again against the text, with the code kept and why -----------------------
# kept: 'first' (study 90's code stands), 'blind' (the second reader's code is taken), or a value of its own.
RULINGS = {
    ('CN5', 'kind'): ('first', "The passage pairs auditing with the handling of anomalies; what it discloses is how events "
                      "were handled, so incident stands. In doubt, as before."),
    ('AS2', 'kind'): ('first', "What deployers and users receive is information about the model's capabilities and limits, "
                      "coded evaluation as the AI Act's like signal (EU3) is; best practices are the guide's reason, not "
                      "its content."),
    ('PC5', 'kind'): ('first', "The record is the real-time monitoring of emergent capabilities; the reporting lines are "
                      "its route. A channel reading is noted as a doubt."),
    ('AS1', 'unit'): ('first', "The guide calls a failure an incident when its harm is of 'sufficient severity' and asks "
                      "for a common definition; it sets none, so named only stands."),
    ('AS1', 'receiver'): ('first', "The guide lists regulators, users, customers and value-chain participants and names "
                          "no body; the codebook's public body is a named one."),
    ('G7-2', 'unit'): ('blind', "The Code lists what a transparency report contains: the evaluations conducted, the "
                       "model's capacities and limits, its effects and the results of red-teaming. That defines the "
                       "content."),
    ('BIS1', 'unit'): ('first', "Each report gives, per product, its total processing performance and quantity: numbers "
                       "in stated units."),
    ('BIS1', 'deadline'): ('first', "The first business day of the next month: about a day at the shortest and 33 days "
                           "at the longest (24 to 792 hours); the second reader's 744 is the longest without the "
                           "business day."),
    ('BIS2', 'unit'): ('first', "The occasion is set by a number in a stated unit, 12,000,000 aggregate TPP."),
    ('BIS2', 'trigger'): ('first', "The notice is owed when the item is to be used at such a data centre, before the "
                          "use; nothing need have happened short of harm."),
    ('BIS3', 'unit'): ('first', "Quantity and value per item: numbers in stated units."),
    ('BIS3', 'deadline'): ('first', "Due by 15 February for the year before: 46 to 410 days (1104 to 9840 hours); the "
                           "second reader counted one day more."),
    ('GPA1', 'unit'): ('blind', "The resolution lists the record's fields: decisions, actions, tool calls, inputs, "
                       "outputs and human interventions. That defines the content."),
    ('GPA3', 'unit'): ('blind', "The inventory's fields are listed: purposes, models, tools, skills, data sources, "
                       "connections and permissions."),
    ('COP3', 'trigger'): ('first', "The Code's serious incidents include a self-exfiltration of model weights and a "
                          "serious cybersecurity breach, which need not have harmed anyone."),
    ('COP3', 'before_harm'): ('first', 'Follows the trigger.'),
    ('CA5', 'trigger'): ('first', "An imminent risk of death or injury is a risk, not a harm that happened or is likely "
                         "to have happened; the codebook's harm is the latter."),
    ('CA5', 'before_harm'): ('first', 'Follows the trigger.'),
    ('NY5', 'trigger'): ('first', 'As CA5: the same words.'),
    ('NY5', 'before_harm'): ('first', 'Follows the trigger.'),
    ('CN8', 'trigger'): ('first', "The text names no occasion; disclosure of capabilities and intended users is read as "
                         "made before use. Both readings can move before harm; the doubt stands."),
    ('PC2', 'trigger'): ('first', 'As CN8; the doubt stands.'),
    ('COP5', 'receiver'): ('first', "The third parties report to the Signatory or to the AI Office; study 90 coded the "
                           "first the Code lists. Noted as a doubt."),
    ('G7-3', 'receiver'): ('blind', "The Code's own words are to 'share and report relevant information to the public'; "
                           "the other organisations are those one collaborates with, not the first readers."),
    ('EU1', 'public'): ('first', "Article 52(6) has the Commission publish and keep up to date a list of the models with "
                        "systemic risk, so each notified model becomes public."),
    ('EU1', 'stranger'): ('first', 'Follows public.'),
    ('EU1', 'deadline'): ('first', "'Without delay and in any event within two weeks': the second reader recorded the "
                          "same two weeks as the longest delay, so the readings agree on the number."),
    ('CA8', 'clock'): ('first', "Both delays the text sets run after a disclosure has reached the developer: an update "
                       "back to the person every month, and a summary to officers every quarter. Neither runs to the "
                       "first reader."),
    ('CA8', 'deadline'): ('first', 'As the clock.'),
    ('G7-4', 'clock'): ('first', "The Code asks that policies be updated regularly and sets no interval; with no "
                        "deadline there is no clock."),
    ('CA3', 'deadline'): (2208, "Every three months: the longest quarter is 92 days, 2208 hours, by the rule that "
                          "deadlines are the texts' maxima; study 90 counted an average quarter."),
    ('NY3', 'deadline'): (2208, 'As CA3.'),
}

# the passages the second readers named as signals not on their list, ruled on by the conductor (not added: the unit
# list is not recoded in this check)
EXTRA_RULINGS = {
    ('A1', 'extra-1'): ('missed', 'A public summary of the framework and model reports, a distinct receiver and occasion.'),
    ('A1', 'extra-2'): ('missed', "A distinct reporter, the authorised representative, keeping a record for ten years."),
    ('A1', 'extra-3'): ('missed', 'A distinct reporter, the external evaluators, sending to the AI Office.'),
    ('A1', 'extra-4'): ('folded', 'Samples on request are part of COP4, detailed evaluations on request.'),
    ('A2', 'extra-1'): ('missed', 'A record of what was redacted, kept five years.'),
    ('A2', 'extra-2'): ('missed', "Copies of federal incident reports to New York's office, on a distinct occasion."),
    ('A2', 'extra-3'): ('missed', 'Incidents of foundation models that are not frontier models, encouraged.'),
    ('A2', 'extra-4'): ('missed', 'A submission to the export authority for an exclusion, with compute figures.'),
    ('A2', 'extra-5'): ('missed', 'A notice of shipment to the validated end user.'),
    ('A2', 'extra-6'): ('missed', 'Records of validated end-user shipments, kept under part 762.'),
    ('A3', 'extra-1'): ('missed', 'Documentation of reported incidents, kept by the organisation.'),
    ('A3', 'extra-2'): ('missed', 'The same information as G7-3, to public authorities: a distinct receiver.'),
    ('A3', 'extra-3'): ('missed', 'Documentation for traceability of datasets, processes and decisions.'),
    ('A3', 'extra-4'): ('folded', "A complaint and feedback mechanism is CN2's channel."),
    ('A3', 'extra-5'): ('out', 'A governance principle; no content or reporter is named.'),
    ('A3', 'extra-6'): ('folded', 'The same disclosure as CN8, in another section.'),
    ('A3', 'extra-7'): ('out', 'A description of practice, not a commitment.'),
    ('A3', 'extra-8'): ('out', 'Access for evaluators, not a record or report.'),
    ('A3', 'extra-9'): ('folded', "Incident records are within GPA1 and GPA2."),
    ('A3', 'extra-10'): ('out', 'A means to challenge a decision, not a record or report.'),
}

# ---- Part B: the traces the pages left unsearched added, each opened and checked by the conductor ---------------
NEW_TRACES = [
    {'signal': 'EU4', 'url': 'https://digital-strategy.ec.europa.eu/en/news/special-meeting-ai-scientific-panel',
     'date': '2026-10-12', 'date_where': "the page's 'Publication 12 October 2026'", 'host': 'public body',
     'who': "European Commission, on its own site, of its AI Office",
     'quote': 'The AI Office has already requested and received serious incident reports and sent requests for '
              'information on security practices.',
     'names': "in the receiver's own words, with the Act's term, serious incident reports, on a page filed under the AI "
              "Act",
     'archived': 'yes', 'archived_closest': '20261018051105', 'found_by': 'search of the pages left (EU, Korea, '
     'international texts)'},
    {'signal': 'CA3', 'url': 'https://apcp.assembly.ca.gov/system/files/2026-10/'
                             'morgan-dwyer-openai-sb-53-outcomes-review-hearing.pdf',
     'date': '2026-10-27', 'date_where': "the slides' cover, the day of the hearing", 'host': 'public body',
     'who': "OpenAI, slides to the California Assembly's Committee on Privacy and Consumer Protection, on the "
            "committee's site",
     'quote': 'We submitted our quarterly CalOES report and published a version.',
     'names': "the slides' title, 'SB 53 Outcomes Review Hearing', and the heading above the passage, 'SB 53 provides "
              "a strong foundation'",
     'archived': 'no', 'archived_closest': None, 'found_by': 'search of the pages left (US instruments)'},
    {'signal': 'CA3', 'url': 'https://www.govops.ca.gov/wp-content/uploads/sites/11/2026/11/'
                             'FINAL_-AI-Safety-in-2026-and-Beyond-v2.pdf',
     'date': '2026-11-16', 'date_where': "the report's cover", 'host': 'public body',
     'who': "California Government Operations Agency, report to the Governor, citing the sender's published version",
     'quote': 'OpenAI, “Periodic Summary of Internal Use Catastrophic-Risk Assessments,” September 26, 2026',
     'names': "cited beside Cal. Bus. & Prof. Code § 22757.11(d), a section of the Act",
     'archived': 'yes', 'archived_closest': '20261121134019', 'found_by': 'search of the pages left (US instruments)'},
]


def part_a():
    one = {s['id']: s for s in J('signals90.json')['signals']}
    two = {s['id']: s for r in J('blind92.json')['readers'] for s in r['signals']}
    ag = J('agree92.json')
    rows, final = [], {i: dict(s) for i, s in one.items()}
    for d in ag['disagreements']:
        k, why = RULINGS[(d['id'], d['code'])]
        val = d['first'] if k == 'first' else d['blind'] if k == 'blind' else k
        rows.append({**d, 'final': val, 'kept': k if k in ('first', 'blind') else 'neither', 'reason': why})
        if val != d['first'] and d['code'] != 'before_harm':
            key = 'deadline_h' if d['code'] == 'deadline' else d['code']
            final[d['id']][key] = val
    assert len(RULINGS) == len(ag['disagreements'])
    for s in final.values():
        s['before_harm'] = s['trigger'] in BEFORE
        s['says_unit'] = s['unit'] in ('quantity', 'defined')
        s['says_who'] = s['machine_or_person'] in ('required', 'by class')
    changed = [{'id': i, 'code': c, 'from': one[i][c], 'to': final[i][c]}
               for i in one for c in ('kind', 'unit', 'trigger', 'receiver', 'public', 'stranger', 'clock',
                                      'deadline_h', 'machine_or_person') if one[i][c] != final[i][c]]
    extras = []
    for r in J('blind92.json')['readers']:
        for x in r['extra']:
            v, why = EXTRA_RULINGS[(r['reader'], x['id'])]
            extras.append({'reader': r['reader'], 'id': x['id'], 'ref': x.get('ref'), 'passage': x['passage'],
                           'ruling': v, 'why': why})
    sig = list(final.values())
    rec = lambda key, rows: dict(Counter(s[key] for s in rows))
    law = [s for s in sig if s['binding'] == 'law']
    ev = [s for s in sig if s['trigger'] in EVENT]
    ev_dl = [s for s in ev if s['deadline_h'] is not None]
    res = {
        'agreement': ag['agreement'], 'P152': ag['P152'],
        'disagreements': len(rows), 'signals_differing': len({r['id'] for r in rows}),
        'kept_first': sum(r['kept'] == 'first' for r in rows), 'kept_blind': sum(r['kept'] == 'blind' for r in rows),
        'kept_neither': sum(r['kept'] == 'neither' for r in rows),
        'changed': changed, 'changed_signals': sorted({c['id'] for c in changed}),
        'final': {'unit': rec('unit', sig), 'receiver': rec('receiver', sig), 'says_unit': sum(s['says_unit'] for s in sig),
                  'public_law': sum(s['public'] == 'public' for s in law), 'events': len(ev),
                  'P148_n': len(ev_dl), 'P148_awareness': sum(s['clock'] == 'awareness' for s in ev_dl),
                  'all_four': [s['id'] for s in sig if s['says_unit'] and s['before_harm'] and s['public'] == 'public'
                               and s['says_who']],
                  'says_who_and_public': [s['id'] for s in sig if s['says_who'] and s['public'] == 'public']},
        'extras': len(extras), 'extras_ruling': dict(Counter(x['ruling'] for x in extras)),
        'extras_missed_by_reader': dict(Counter(x['reader'] for x in extras if x['ruling'] == 'missed')),
    }
    codes = {'what': 'Check 92, part A, reconciled: every disagreement between study 90 and the blind second coding, '
                     'read again by the conductor against the text, with the code kept and why; the final codes of '
                     'the 51 signals; and the passages the second readers named as signals not on their list, with '
                     'the ruling on each (CODEBOOK92.md, part A). Reconciled on 2026-11-23.',
             'rulings': rows, 'changed': changed, 'extras': extras,
             'signals': [{k: s[k] for k in ('id', 'instrument', 'kind', 'unit', 'trigger', 'before_harm', 'deadline_h',
                                            'deadline_max_h', 'clock', 'receiver', 'public', 'machine_or_person',
                                            'stranger', 'says_unit', 'says_who')} for s in sig],
             'blind': {i: {k: two[i].get(k) for k in ('kind', 'unit', 'trigger', 'deadline_h', 'deadline_max_h',
                                                      'clock', 'receiver', 'public', 'machine_or_person', 'stranger')}
                       for i in one}}
    return res, codes


def part_b(codes):
    mv = J('moved91.json')
    S = {s['id']: s for s in mv['signals']}
    due = [s for s in mv['signals'] if s['due'] == 'due']
    b1 = {s['id']: s for s in J('blind92-traces.json')['signals']}
    assert set(b1) == {s['id'] for s in due}
    a = [S[s['id']]['moved'] for s in due]
    st = [b1[s['id']]['strict']['moved'] for s in due]
    br = [b1[s['id']]['broad']['moved'] for s in due]
    k, po = kappa(a, st)
    diff = [{'id': s['id'], 'first': x, 'blind_strict': y, 'blind_broad': z,
             'reason_blind': b1[s['id']]['reason']} for s, x, y, z in zip(due, a, st, br) if x != y]
    q = {x['url']: x for x in J('quotes92.json')['items']}
    assert all(q[t['url']]['found'] for t in NEW_TRACES)
    # final codes: study 91's moved codes stand (the disagreements are the doubts study 91 noted); the new traces add
    # hosts. A signal's host is the most durable among its traces.
    final = []
    for s in due:
        tr = [dict(t) for t in S[s['id']]['traces']] + [dict(t) for t in NEW_TRACES if t['signal'] == s['id']]
        hosts = sorted({t['host'] for t in tr} | ({'sender'} if any(t.get('instance') for t in tr) else set()),
                       key=DUR.index)
        final.append({'id': s['id'], 'instrument': s['instrument'], 'receiver': s['receiver'],
                      'trigger': s['trigger'], 'moved': s['moved'], 'first': s['first'], 'hosts': hosts,
                      'host': hosts[0] if hosts else None, 'n_traces': len(tr),
                      'new_traces': [t['url'] for t in NEW_TRACES if t['signal'] == s['id']]})
    moved = [f for f in final if f['moved'] != 'no trace found']
    alarm = {i: b1[i]['alarm'] for i in b1 if b1[i]['alarm']}
    ev_moved = [f['id'] for f in moved if f['trigger'] in EVENT]
    res = {
        'B1': {'kappa': k, 'raw': po, 'same': sum(x == y for x, y in zip(a, st)), 'of': len(due),
               'moved_first': sum(x != 'no trace found' for x in a), 'moved_blind_strict': sum(y != 'no trace found' for y in st),
               'moved_blind_broad': sum(z != 'no trace found' for z in br), 'differ': diff},
        'new_traces': len(NEW_TRACES), 'new_signals_moved': 0,
        'moved': len(moved), 'moved_code': dict(Counter(f['moved'] for f in moved)),
        'host': {h: sum(f['host'] == h for f in moved) for h in DUR},
        'on_public_body_site': [f['id'] for f in moved if 'public body' in f['hosts']],
        'through_receiver': ['EU4'],
        'due_to_public_body': sum(f['receiver'] == 'public body' for f in final),
        'moved_to_public_body': [f['id'] for f in moved if f['receiver'] == 'public body'],
        'alarm': alarm,
        'P149': {'published': len(ev_moved), 'listed_after_outside': len([i for i in ev_moved if alarm.get(i) != 'listed after']),
                 'ids': ev_moved},
    }
    res['P153'] = {'strict': res['on_public_body_site'], 'broad': res['on_public_body_site'],
                   'held': not res['on_public_body_site']}
    traces = {'what': "Check 92, part B, reconciled: study 91's codes of the 42 due signals beside the blind reader's "
                      '(strict and broad rule), the traces the search of the pages left unsearched added, each opened '
                      'and checked by the conductor, and the final host of every signal that moved '
                      '(CODEBOOK92.md, part B). Reconciled on 2026-11-23.',
              'B1_differ': diff, 'new_traces': NEW_TRACES, 'signals': final,
              'reconciliation': {
                  'EU4': "Study 91 counted the press's report of the Commission's spokesperson, who named the AI "
                         "regulation; the blind reader found the instrument named on neither page. The pages left "
                         "unsearched hold the receiver's own statement on its own site, in the Act's term, so EU4 "
                         "stays counted, fact only, now standing on a public body's site.",
                  'CA3': "Study 91 counted the sender's public version of its quarterly summary, which names the "
                         "state office and the report and not the Act; the blind reader counted it under the broad "
                         "rule only. The pages left unsearched hold the sender's own statement at the legislature's "
                         "SB 53 hearing that it filed the report and published a version, and the state's operations "
                         "agency citing that version beside the Act's section: the doubt is resolved, and CA3 now "
                         "stands on a public body's site too.",
                  'G7-2': "Coded fact only by study 91 (the reports say release documents are published; the "
                          "documents do not name the Code) and content public by the blind reader; study 91's code "
                          "stands, since what can be read in the portal is the statement, not the reports."}}
    return res, traces


def part_c():
    w = J('window92.json')
    rows = w['rows']
    ear = Counter('closed by its own mending' if r['closed_by_mending'] else r['earliest_by_commit'] for r in rows)
    mend = Counter(r['mending_by_commit'] for r in rows)
    # the carried hours have one decimal, Git's two: a shift of more than 0.06 hours is not rounding
    first_differs = [r for r in rows if not r['first_is_mending'] and abs(r['first_hours_git'] - r['first_hours_carried']) > 0.06]
    noex = [r['no_exclusion_hours'] for r in rows]
    earlier = [r for r in rows if r['no_exclusion_earlier']]
    res = {
        'deeds': len(rows), 'remeasured': len(rows), 'remeasured_agree': sum(r['remeasured_agree'] for r in rows),
        'earliest': {k: ear.get(k, 0) for k in ('before', 'at', 'lands with it', 'after', 'closed by its own mending')},
        'mend': {k: mend.get(k, 0) for k in ('before', 'at', 'lands with it', 'after')},
        'first_hand': sum(not r['first_is_mending'] for r in rows), 'first_hours_shifted': len(first_differs),
        'mending_hours_max_diff': round(max(abs(r['mending_hours_git'] - r['mending_hours_carried']) for r in rows), 2),
        'closed_median_h': round(statistics.median(r['closed_hours_git'] for r in rows), 2),
        'no_exclusion_median_h': round(statistics.median(noex), 2),
        'no_exclusion_earlier': len(earlier), 'no_exclusion_earlier_rows': [[r['row'], r['deed']] for r in earlier],
        'no_exclusion_paths': sorted({p for r in earlier for p in r['no_exclusion_paths']}),
    }
    res['P154'] = {'earlier': len(earlier), 'of': len(rows), 'uninformative': len(rows) < 20,
                   'held': len(rows) >= 20 and len(earlier) > len(rows) / 2}
    page = [{'row': r['row'], 'deed': r['deed'], 'earliest': 'closed by its own mending' if r['closed_by_mending']
             else r['earliest_by_commit'], 'mend': r['mending_by_commit'], 'closed': r['closed_hours_git'],
             'noex': r['no_exclusion_hours'], 'earlier': r['no_exclusion_earlier']} for r in rows]
    return res, page


def wiki():
    """D1: the wiki case's first day, from the researchers' own time line."""
    c = next(x for x in J('moved91.json')['cases'] if x['id'] == 'wiki')
    began = '2026-05-24'
    d = lambda a, b: (date.fromisoformat(b) - date.fromisoformat(a)).days
    return {'began': began, 'began_src': ['https://collusion.wiki/',
                                          'On May 24, 2026, the agents find DSEWiki'],
            'state2_began': c['began'],
            'earliest_activity': {'date': '2026-05-11', 'src': ['https://collusion.wiki/',
                                  'On May 11, 2026, we see the first internet activity that we can attribute to this '
                                  'cluster of agents.']},
            'maker_staff_viewed': {'date': '2026-06-21', 'src': ['https://collusion.wiki/',
                                   'We believe OpenAI employees view the agents’ pages starting June 21st.'],
                                   'note': "the researchers' inference, from visits from addresses registered to the "
                                           "maker; the agents stopped posting on the wiki the next day"},
            'delays_days': {'began_to_noticed': d(began, c['noticed']['date']),
                            'began_to_first_public': d(began, c['first_public']['date']),
                            'ended_to_first_public': d(c['ended'], c['first_public']['date']),
                            'began_to_body': d(began, c['body'][0]['date']), 'lasted': d(began, c['ended']),
                            'first_public_to_maker': d(c['first_public']['date'], c['maker_public']['date']),
                            'first_public_to_body': d(c['first_public']['date'], c['body'][0]['date'])},
            'state2_delays_days': c['delays_days']}


def main():
    ra, codes = part_a()
    rb, traces = part_b(codes)
    rc, house = part_c()
    w = wiki()
    res = {'check': 92, 'session': 290, 'date': '2026-11-23', 'cycle': 18, 'programme_step': 6,
           'codebook_sha256': sha('CODEBOOK92.md'), 'predictions_sha256': sha('PREDICTIONS92.md'),
           'A': ra, 'B': rb, 'C': rc, 'wiki': w,
           'P152': {**ra['P152']}, 'P153': rb['P153'], 'P154': rc['P154']}
    res['held'] = [p for p in ('P152', 'P153', 'P154') if res[p]['held']]
    json.dump(codes, open(os.path.join(HERE, 'codes92.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump(traces, open(os.path.join(HERE, 'traces92.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump(res, open(os.path.join(HERE, 'results92.json'), 'w'), indent=1, ensure_ascii=False)
    page = {'results': res, 'rulings': codes['rulings'], 'changed': codes['changed'], 'extras': codes['extras'],
            'blind': codes['blind'], 'new_traces': NEW_TRACES, 'house': house}
    with open(os.path.join(HERE, 'data92.js'), 'w') as f:
        f.write('window.DATA92 = ' + json.dumps(page, separators=(',', ':'), ensure_ascii=False) + ';\n')
    print(json.dumps({'A': {k: ra[k] for k in ('disagreements', 'kept_first', 'kept_blind', 'kept_neither',
                                                 'changed_signals', 'final', 'extras_ruling')},
                      'B': {k: rb[k] for k in ('B1', 'moved', 'host', 'on_public_body_site', 'P149', 'P153')},
                      'C': rc, 'wiki': w['delays_days'], 'held': res['held']}, indent=0, ensure_ascii=False)[:4000])


if __name__ == '__main__':
    main()
