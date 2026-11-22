"""Study 91 -- count which signals of study 90 have moved, date the case behind the rung alarm, set the house's
earliest trace against the Atelier's window, and write results91.json, moved91.json, sources91.json and data91.js.

Usage: python3 build91.py   (reads signals90.json, moved91.py, house91.json, window91.json, window91-all.json,
                             archive91.json, quotes91.json and search91.json beside it; no network)
Every figure of state 2 on the page is computed here and recounted from moved91.json and house91.json by
verify91.mjs.
"""
import datetime, hashlib, json, os, statistics, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from moved91 import DUE, NOT_YET, TRACES, NOTES, CASES, G7_CASES, G7_REPORTS  # noqa: E402

EVENT = ('event short of harm', 'harm')
DURABLE = ['intergovernmental', 'public body', 'third party', 'sender']   # most durable first (CODEBOOK91, code 4)
TOL = 0.05   # house hours: first-hand hours carry one decimal, so a difference of 0.05 h or less is "the same commit"


def j(p):
    return json.load(open(os.path.join(HERE, p)))


def sha(p):
    return hashlib.sha256(open(os.path.join(HERE, p), 'rb').read()).hexdigest()


def day(s):
    return datetime.date.fromisoformat(s)


def days(a, b):
    return (day(b) - day(a)).days


def main():
    S = j('signals90.json')['signals']
    arch = {(a['item'], a['url']): a for a in j('archive91.json')['items']}
    quotes = j('quotes91.json')
    qfound = {(i['item'], i['url']): i['found'] for i in quotes['items']}
    rows = []
    for s in S:
        sid, inst = s['id'], s['instrument']
        due, due_date = (('not yet due', NOT_YET[sid][0]) if sid in NOT_YET else DUE[inst][:2])
        t = TRACES.get(sid)
        traces = []
        for tr in (t['traces'] if t else []):
            a = arch.get((sid, tr['url']), {})
            traces.append({**tr, 'archived': {True: 'yes', False: 'no'}.get(a.get('captured'), 'not asked'),
                           'archived_closest': a.get('closest'), 'quote_found': qfound[(sid, tr['url'])]})
        traces.sort(key=lambda x: x['date'])
        first = traces[0] if traces else None
        # host: the earliest trace's host; where the same content stands at more than one host, the most durable
        hosts = [first['host']] if first else []
        if first and first.get('instance'):
            hosts.append('sender')
        host = min(hosts, key=DURABLE.index) if hosts else None
        rows.append({
            'id': sid, 'instrument': inst, 'binding': s['binding'], 'kind': s['kind'], 'trigger': s['trigger'],
            'receiver': s['receiver'], 'event': s['trigger'] in EVENT, 'what': s['what'],
            'due': due, 'due_date': due_date,
            'moved': t['moved'] if t else 'no trace found',
            'first': first['date'] if first else None,
            'first_url': first['url'] if first else None,
            'host': host, 'hosts': sorted(set(hosts), key=DURABLE.index),
            'lag_days': days(due_date, first['date']) if first else None,
            'archived': first['archived'] if first else None,
            'says_who': (t.get('says_who', 'no') if s['kind'] in ('incident', 'log', 'channel') else 'n/a') if t else None,
            'traces': traces, 'n_traces': len(traces),
            'count': t.get('count') if t else None,
            'note': (t['note'] if t else NOTES.get(sid)),
            'doubt': (t.get('doubt') if t else None),
            'trace_doubts': [tr['doubt'] for tr in traces if tr.get('doubt')],
            'outside': (t.get('outside', []) if t else []), 'unopened': (t.get('unopened', []) if t else []),
        })
    R = {r['id']: r for r in rows}
    due = [r for r in rows if r['due'] == 'due']
    moved = [r for r in due if r['moved'] != 'no trace found']
    cp = [r for r in moved if r['moved'] == 'content public']
    events = [r for r in rows if r['event']]

    # P149 -- none of the 19 event signals moved
    ev_moved = [r['id'] for r in events if r['moved'] != 'no trace found']
    p149 = {'event_signals': len(events), 'moved': ev_moved, 'n': len(ev_moved), 'held': not ev_moved}
    # P150 -- of content public, more than half have the earliest trace only on the sender's site
    sender_only = [r['id'] for r in cp if r['hosts'] == ['sender']]
    firm = [r for r in cp if not any(tr.get('doubt') for tr in r['traces'][:1])]
    firm_sender = [r['id'] for r in firm if r['hosts'] == ['sender']]
    p150 = {'content_public': [r['id'] for r in cp], 'n': len(cp), 'sender_only': sender_only,
            'n_sender_only': len(sender_only), 'uninformative': len(cp) < 3,
            'held': len(cp) >= 3 and len(sender_only) > len(cp) / 2,
            'without_doubtful_earliest': {'n': len(firm), 'sender_only': firm_sender,
                                          'held': len(firm) >= 3 and len(firm_sender) > len(firm) / 2}}
    # P151 -- the window, measured twice
    w12, wall = j('window91.json'), j('window91-all.json')
    p151 = {'agree': w12['agree'], 'of': w12['sampled'], 'held': w12['agree'] >= 10,
            'whole_pool': {'agree': wall['agree'], 'of': wall['pool'], 'differ': len(wall['differ'])}}

    # the case behind the rung alarm (addendum)
    LABELS = {   # how the page names each dated moment of a case
        'wiki': {'began': ('the agents begin', 'posting to a dormant German wiki'),
                 'noticed': ("the wiki's moderator", 'removes the posts as spam'), 'ended': ('the last edits', ''),
                 'first_public': ('outside researchers', 'publish the case'),
                 'maker_public': ('the maker', 'acknowledges it'),
                 'body': ('the European Commission', 'confirms it has a report')},
        'escape': {'precursor': ("the maker's monitoring", 'alerts on port sweeps; the evaluation runs on'),
                   'began': ('the agents gain a foothold', "in Hugging Face's systems"),
                   'noticed': ('Hugging Face', 'detects the intrusion'), 'ended': ('the last day of the intrusion', ''),
                   'first_public': ('Hugging Face', 'publishes it, source unknown'),
                   'maker_knew': ('the maker', 'detects suspicious internal activity'),
                   'maker_public': ('the maker', 'says its models did it'),
                   'body': ('the state office', "says it did not meet SB 53's threshold"),
                   'report_sent': ('a member of the public', 'files an incident report with the office'),
                   'maker_scope': ("the maker's quarterly summary", 'puts the models outside its scope')}}
    cases = []
    for c in CASES:
        b = c['body'][0]
        d = {'began_to_noticed': days(c['began'], c['noticed']['date']),
             'began_to_first_public': days(c['began'], c['first_public']['date']),
             'ended_to_first_public': days(c['ended'], c['first_public']['date']),
             'first_public_to_maker': days(c['first_public']['date'], c['maker_public']['date']),
             'first_public_to_body': days(c['first_public']['date'], b['date']),
             'began_to_body': days(c['began'], b['date']),
             'lasted': days(c['began'], c['ended'])}
        if c['maker_knew']['date']:
            d['noticed_to_maker_knew'] = days(c['noticed']['date'], c['maker_knew']['date'])
        if isinstance(c.get('report_sent'), dict):
            d['began_to_report_sent'] = days(c['began'], c['report_sent']['date'])
        ev = []
        for key, (lab, sub) in LABELS[c['id']].items():
            v = c[key][0] if key == 'body' else c[key]
            date = v if isinstance(v, str) else v['date']
            src = c[key + '_src'] if key in ('began', 'ended') else v['src']
            ev.append({'key': key, 'date': date, 'label': lab, 'sub': sub, 'src': src,
                       'note': (v.get('date_note') if isinstance(v, dict) else None),
                       'public': key in ('first_public', 'maker_public', 'body', 'report_sent', 'maker_scope')})
        ev.sort(key=lambda e: (e['date'], ['precursor', 'began', 'noticed', 'ended', 'first_public', 'maker_knew',
                                            'maker_public', 'body', 'report_sent', 'maker_scope'].index(e['key'])))
        cases.append({**c, 'delays_days': d, 'events': ev})
    wiki = cases[0]
    CA = {c['id']: c for c in cases}

    # the G7 portal
    years = Counter(d[:4] for d, _ in G7_REPORTS)
    g7 = {'reports': len(G7_REPORTS), 'first': G7_REPORTS[0][0], 'last': G7_REPORTS[-1][0], 'by_year': dict(years),
          'listed_instances': len(G7_CASES), 'instances_who_acted': dict(Counter(c['who_acted'] for c in G7_CASES)),
          'instances_first_reader': dict(Counter(c['first_reader'] for c in G7_CASES))}

    # the house: earliest later trace and mending against the Atelier's window
    H = j('house91.json')['pairs']

    def mend(p):
        if p['closed_by_mending']:
            return 'at'
        return 'before' if p['state'] == 'mended inside the window' else 'after'

    def earliest(p):
        if p['first_hand_hours'] is None:   # the mending was the earliest later trace
            return mend(p)
        a, b = p['first_hand_hours'], p['closed_hours']
        return 'before' if a + TOL < b else ('after' if a - TOL > b else 'at')

    hrows = [{'row': p['row'], 'deed': p['deed'], 'closed': p['closed_hours'],
              'first': p['first_hand_hours'] if p['first_hand_hours'] is not None else p['mending_hours'],
              'mending': p['mending_hours'], 'earliest': earliest(p), 'mend': mend(p),
              'remeasured': p['remeasured'], 'agree': p['agree']} for p in H]
    house = {'pairs': len(H), 'closed_median_h': round(statistics.median(p['closed_hours'] for p in H), 2),
             'earliest': {k: sum(r['earliest'] == k for r in hrows) for k in ('before', 'at', 'after')},
             'mend': {k: sum(r['mend'] == k for r in hrows) for k in ('before', 'at', 'after')},
             'remeasured': sum(p['remeasured'] != 'not re-measured' for p in H),
             'remeasured_agree': sum(p['agree'] is True for p in H),
             'closed_signer': dict(Counter(p['closed_signer'] for p in H))}

    search = j('search91.json')
    all_urls = [(r['id'], tr['url']) for r in rows for tr in r['traces']]
    res = {
        'study': 91, 'session': 289, 'date': '2026-11-22', 'cycle': 18, 'programme_step': 6, 'state': 2,
        'codebook_sha256': sha('CODEBOOK91.md'), 'addendum_sha256': sha('CODEBOOK91-ADDENDUM.md'),
        'predictions_sha256': sha('PREDICTIONS91.md'),
        'signals': len(rows), 'due': len(due), 'not_yet_due': [r['id'] for r in rows if r['due'] != 'due'],
        'moved': len(moved), 'moved_ids': [r['id'] for r in moved],
        'moved_code': dict(Counter(r['moved'] for r in due)),
        'moved_law': sum(r['binding'] == 'law' for r in moved), 'due_law': sum(r['binding'] == 'law' for r in due),
        'moved_voluntary': sum(r['binding'] == 'voluntary' for r in moved),
        'due_voluntary': sum(r['binding'] == 'voluntary' for r in due),
        'moved_by_receiver': {k: [r['id'] for r in moved if r['receiver'] == k]
                              for k in ('public', 'public body', 'own record', 'other party')},
        'due_by_receiver': dict(Counter(r['receiver'] for r in due)),
        'host': dict(Counter(r['host'] for r in moved)),
        'host_public_body': sum(r['host'] == 'public body' for r in moved),
        'lag_days': {r['id']: r['lag_days'] for r in moved},
        'before_due': [r['id'] for r in moved if r['lag_days'] < 0],
        'earliest_archived': sum(r['archived'] == 'yes' for r in moved),
        'traces': len(all_urls), 'traces_archived': sum(tr['archived'] == 'yes' for r in rows for tr in r['traces']),
        'traces_not_archived': [tr['url'] for r in rows for tr in r['traces'] if tr['archived'] != 'yes'],
        'events': len(events), 'events_due': sum(r['due'] == 'due' for r in events),
        'says_who_moved': [r['id'] for r in moved if r['says_who'] == 'yes'],
        'quotes_found': quotes['found'], 'quotes_of': quotes['of'],
        'search_queries_logged': sum(len(g['search_log']) for g in search['agents']),
        'agent_conductor_differ': sorted(search['differ']),
        'P149': p149, 'P150': p150, 'P151': p151,
        'held': [k for k, v in (('P149', p149), ('P150', p150), ('P151', p151)) if v['held']],
        'case': {'id': wiki['id'], 'delays_days': wiki['delays_days'], 'first_reader': wiki['first_reader'],
                 'says_machine': wiki['says_machine'], 'report_sent': wiki['report_sent'],
                 'stranger': 'yes' if any(a['url'] == wiki['first_public']['src'][0] and a.get('captured')
                                          for a in arch.values()) else 'no'},
        'cases': {c['id']: {'delays_days': c['delays_days'], 'first_reader': c['first_reader'],
                            'says_machine': c['says_machine'], 'signal': c['signal'],
                            'report_sent': c['report_sent']['date'] if isinstance(c.get('report_sent'), dict) else None,
                            'stranger': 'yes' if any(a['url'] == c['first_public']['src'][0] and a.get('captured')
                                                     for a in arch.values()) else 'no'} for c in cases},
        'found_by_critique': sorted(k for k, t in TRACES.items() if 'Found by the critique' in t.get('note', '')),
        'g7': g7, 'house': house,
    }
    json.dump(res, open(os.path.join(HERE, 'results91.json'), 'w'), indent=1)
    json.dump({'what': 'Study 91: for each of the 51 signals of study 90, whether it was due and whether it has left a '
                       'public trace by 2026-11-22 (CODEBOOK91.md, part A), with every counted trace, its date, host, '
                       'web-archive capture and quoted passage; and the case behind the one event signal about a '
                       "machine's own act that moved (CODEBOOK91-ADDENDUM.md). Coded by the conductor on 2026-11-22.",
               'signals': rows, 'cases': cases, 'g7_instances': G7_CASES,
               'g7_reports': [{'id': i, 'date': d} for d, i in G7_REPORTS]},
              open(os.path.join(HERE, 'moved91.json'), 'w'), indent=1, ensure_ascii=False)
    # sources: every address this state relies on, with its fetch and archive status; no copies
    src = []
    seen = set()
    for r in rows:
        for tr in r['traces']:
            for u, role in ((tr['url'], f"trace of {r['id']}"), (tr.get('instance'), f"instance listed under {r['id']}")):
                if u and (u, role) not in seen:
                    seen.add((u, role))
                    src.append({'url': u, 'role': role, 'fetched': '2026-11-22',
                                'sha256': quotes['sha256'].get(u), 'archived': tr['archived'] if u == tr['url'] else None})
        for o in r['outside']:
            src.append({'url': o['url'], 'role': f"outside the instrument ({r['id']})", 'fetched': '2026-11-22'})
        for o in r['unopened']:
            src.append({'url': o['url'], 'role': f"not counted ({r['id']})", 'why': o['why']})
    for c in cases:
        for key, s in (('began', c['began_src']), ('ended', c['ended_src'])) + tuple(
                (k, c[k]['src']) for k in ('noticed', 'first_public', 'maker_knew', 'maker_public', 'precursor',
                                           'report_sent', 'maker_scope') if isinstance(c.get(k), dict)) + tuple(
                ('body', b['src']) for b in c['body']):
            src.append({'url': s[0], 'role': f"case {c['id']}: {key}", 'fetched': '2026-11-22',
                        'sha256': quotes['sha256'].get(s[0])})
    src.append({'url': 'https://oecd.ai/en/transparency/reports', 'role': 'the G7 portal, read whole (60 reports)',
                'fetched': '2026-11-22'})
    json.dump({'what': 'Every address study 91 relies on, with the day it was fetched, the sha256 of the copy fetched '
                       '(never committed) and, for counted traces, whether the web archive holds a capture before '
                       '2026-11-22 (archive91.json).', 'sources': src},
              open(os.path.join(HERE, 'sources91.json'), 'w'), indent=1)
    page = {'results': res, 'signals': rows, 'case': wiki, 'cases': cases, 'g7_instances': G7_CASES,
            'g7_reports': [d for d, _ in G7_REPORTS], 'house': hrows}
    with open(os.path.join(HERE, 'data91.js'), 'w') as f:
        f.write('window.DATA91 = ' + json.dumps(page, separators=(',', ':'), ensure_ascii=False) + ';\n')
    print(json.dumps({k: res[k] for k in ('due', 'moved', 'moved_code', 'host', 'moved_by_receiver', 'lag_days',
                                           'earliest_archived', 'traces', 'traces_archived', 'says_who_moved',
                                           'held', 'house')}, indent=0))
    print(json.dumps({k: res[k] for k in ('P149', 'P150', 'P151', 'cases', 'g7', 'found_by_critique')}, indent=0))


if __name__ == '__main__':
    main()
