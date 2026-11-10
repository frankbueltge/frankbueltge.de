"""UNREAD, state 4 — the correction of 2026-11-07. The Field's study 61 (session 259) checked this étude's
note that on 6 and 30 October the zone sums of study 59 fell short of the report's own Ituri row. No zone was
missing: on 6 Oct Adja's one new case sits on a line of its own, and on 30 Oct seven Ituri rows were read whole
but rejected by the Field's guard against shifted rows. This script restores those cells to the state-3
cases.json and marks every restored square as restored; nothing earlier is overwritten without a mark.

Source: the Field, field-research@76314055b4f045797c889390fb1c035ded26c9ea,
artifacts/after-cycle-012/the-two-days/results61.json. `reports[].lone` holds the cells read on a line of their
own, `reports[].invalid` the rejected rows; their first two cells are new confirmed cases and community deaths.

Usage: python3 -I join61.py <results61.json> <cases.json at state 3, e.g. git show 3467d06:etudes/unread/cases.json>
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(sys.argv[1])); S3 = json.load(open(sys.argv[2]))
assert R['study'] == 61 and R['session'] == 259
assert S3['totals'] == dict(days=51, new=1939, comm=583)      # exactly the state-3 file
days = {int(k): dict(v) for k, v in S3['days'].items()}
fixes = {f['report']: f for f in R['predictions']['P35']['value']['fixes']}
assert sorted(fixes) == [145, 169]
restored = {}
for rep in R['reports']:
    if rep['report'] not in days: continue
    cells = [i['cells'] for i in rep['invalid'] if i['prov'] == 'ituri'] + [l['cells'] for l in rep['lone']]
    if not cells: continue
    n, c = sum(x[0] for x in cells), sum(x[1] for x in cells)
    restored[rep['report']] = (n, c, [i['name'] for i in rep['invalid'] if i['prov'] == 'ituri'] + ['(line of its own after ' + l['after'] + ')' for l in rep['lone']])
assert sorted(restored) == [145, 169], restored          # only the two days the Field names
for r, (n, c, names) in restored.items():
    d = days[r]; f = fixes[r]
    assert [d['new'], d['comm']] == f['was'], r
    d['new'] += n; d['comm'] += c
    assert [d['new'], d['comm']] == f['now'], r
    d['restored'] = dict(new=n, comm=c, rows=names, why=f['why'])
# what the page states
assert (days[145]['new'], days[145]['comm'], days[145]['provNew'], days[145]['provComm']) == (33, 10, 33, 10)
assert (days[169]['new'], days[169]['comm'], days[169]['provNew'], days[169]['provComm']) == (34, 13, 34, 12)
assert R['report169_self']['zones']['comm'] == 13 and R['report169_self']['province']['comm'] == 12
same = [x['name'] for x in R['post_hoc']['rows'] if x['report'] == 169 and x['prov'] == 'ituri' and x['same_as_prev']]
assert same == ['Lita', 'Mambasa', 'Mandima', 'Mangala', 'Rimba'], same
days[169]['stale_rate'] = same
diff = sorted(r for r, c in days.items() if (c['new'], c['comm']) != (c['provNew'], c['provComm']))
assert diff == [169], diff
tn, tc = sum(d['new'] for d in days.values()), sum(d['comm'] for d in days.values())
assert (tn, tc) == (1953, 589), (tn, tc)
out = dict(source=S3['source'],
           corrected=dict(date='2026-11-07', by='the Field, study 61 (session 259), field-research@76314055, '
                          'artifacts/after-cycle-012/the-two-days/results61.json',
                          was=S3['totals'], note='6 Oct: +1 new case (Adja, printed on a line of its own); 30 Oct: '
                          '+13 new cases, +6 community deaths (seven Ituri rows read whole but rejected by the guard)'),
           totals=dict(days=51, new=tn, comm=tc), not_joined=S3['not_joined'],
           days={str(k): v for k, v in sorted(days.items())})
json.dump(out, open(os.path.join(HERE, 'cases.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'cases.js'), 'w').write('window.UNREAD_CASES = ' + json.dumps(out, indent=1, ensure_ascii=False) + ';\n')
print('ok', tn, tc, {r: restored[r][:2] for r in restored})
