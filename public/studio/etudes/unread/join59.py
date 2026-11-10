"""UNREAD, state 3 — join the Field's study 59 (new confirmed cases and community deaths in Ituri per
report day) to this étude's Ituri days, and write cases.json / cases.js for the page.

Source: the Field, field-research@163fe066eaf2a747e2ea9a26412c1e1796b59314,
artifacts/after-cycle-012/the-two-days/results59.json (session 257). Its `days` carry, per report day,
Ituri's new confirmed cases (`new`) and how many of them the report's table counts as
"décès communautaires" (`comm`), summed over Ituri's health zones by the Field's parser (study 54),
and the report's own Ituri row (`provNew`, `provComm`). The page draws the zone sums, as the Field's
pooled figures do, and says where the two differ.

Checks: the Field read this étude's data.json at state 1 (sha256 named in its `input`); its Ituri days are
unchanged at state 2, so every joined day must carry exactly our date, calls, swabs and failures.

Usage: python3 -I join59.py <results59.json> <data.json at state 1, e.g. from git show f9739e2:...>
"""
import hashlib, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(sys.argv[1])); old = open(sys.argv[2], 'rb').read()
assert R['study'] == 59 and R['session'] == 257
assert hashlib.sha256(old).hexdigest() == R['input']['studio_file']['sha256']
D = json.load(open(os.path.join(HERE, 'data.json')))
assert json.loads(old)['days'] == D['days']          # Ituri unchanged since the Field read it
ours = {d['report']: d for d in D['days']}
cases = {}
for j in R['days']:
    d = ours[j['report']]
    assert (d['date'], d['alerts'], d['swabbed'], d['unread']) == (j['date'], j['alerts'], j['swabbed'], j['unread']), j['report']
    assert (d['unread'] is not None) == j['written']
    assert 0 <= j['comm'] <= j['new']
    cases[j['report']] = dict(new=j['new'], comm=j['comm'], provNew=j['provNew'], provComm=j['provComm'])
# what the page states
assert len(cases) == 51 and sorted(R['input']['not_joined']) == [121, 127, 173, 174]
assert sum(c['new'] for c in cases.values()) == 1939 and sum(c['comm'] for c in cases.values()) == 583
assert (cases[110]['new'], cases[110]['comm']) == (39, 13)              # 1 September
diff = sorted(r for r, c in cases.items() if (c['new'], c['comm']) != (c['provNew'], c['provComm']))
assert diff == [145, 169], diff
mx = max(cases.items(), key=lambda kv: kv[1]['comm']); assert (mx[0], mx[1]['new'], mx[1]['comm']) == (148, 47, 25), mx   # 9 Oct
out = dict(source='the Field, study 59 (session 257), field-research@163fe066, '
                  'artifacts/after-cycle-012/the-two-days/results59.json',
           totals=dict(days=len(cases), new=1939, comm=583), not_joined=[121, 127, 173, 174],
           days={str(k): v for k, v in sorted(cases.items())})
json.dump(out, open(os.path.join(HERE, 'cases.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'cases.js'), 'w').write('window.UNREAD_CASES = ' + json.dumps(out, indent=1, ensure_ascii=False) + ';\n')
print('ok', len(cases), 'days joined')
