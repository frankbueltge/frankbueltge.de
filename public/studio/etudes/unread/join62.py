"""UNREAD, state 6 — what the running total carried. On 30 October the report's own Ituri row and its zones
disagree by one community death (state 4). This étude asked the Field which of the two the next running total
keeps. The Field's study 62 (session 260) answered: Ituri's cumulative deaths step by the row's day, not the
zones'. This script takes that answer for 30 and 31 October and writes `carry.js`, which the page draws once
such a day is read whole: the deaths the zones print, the deaths the row prints, and the step of each running
total, one tick per death. Which deaths a total left out is not in the record, and the page does not say.

Source: the Field, field-research@<commit>, artifacts/after-cycle-012/the-two-days/results62.json
(`studio_day`: the province row and the zone sums of reports 168-171, and the zones of report 169).

Usage: python3 -I join62.py <results62.json> <commit of field-research it was read at>
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(sys.argv[1])); commit = sys.argv[2]
assert R['study'] == 62 and R['session'] == 260 and len(commit) == 40
S = R['studio_day']; A = S['answer']
it = {d['report']: d for d in S['ituri']}
assert sorted(it) == [168, 169, 170, 171]
cases = json.load(open(os.path.join(HERE, 'cases.json')))['days']
days = {}
for rep in (169, 170):
    d, p = it[rep], it[rep - 1]
    row, zon = d['row'], d['zones']
    # the step of each running total of deaths, against what each prints for the day
    row_step, zone_step = row['dth'] - p['row']['dth'], zon['dth'] - p['zones']['dth']
    days[rep] = dict(date=d['date'], prev=p['date'],
                     row=dict(comm=row['comm'], cte=row['cte'], day=row['comm'] + row['cte'], printed_total=row['tot'],
                              from_=p['row']['dth'], to=row['dth'], step=row_step),
                     zones=dict(comm=zon['comm'], cte=zon['cte'], day=zon['comm'] + zon['cte'], printed_total=zon['tot'],
                                from_=p['zones']['dth'], to=zon['dth'], step=zone_step, vent=d['vent']))
    # the zones' sum and this étude's corrected other table agree on the community deaths (state 4)
    assert zon['comm'] == cases[str(rep)]['comm'] and row['comm'] == cases[str(rep)]['provComm'], rep
# the Field's answer, re-derived from its own rows
a, b = days[169], days[170]
assert (a['row']['from_'], a['row']['to'], a['row']['step']) == (3436, 3455, 19) == (3436, 3455, A['row_step_30oct'])
assert a['row']['day'] == 12 + 7 == A['row_day_30oct']
assert a['zones']['day'] == 13 + 8 == A['zone_comm_cte_30oct'] == 21
assert a['zones']['step'] == A['zone_step_30oct'] == 18 and a['zones']['printed_total'] == A['zone_day_30oct'] == 30
assert (b['row']['step'], b['row']['day'], b['zones']['step'], b['zones']['day']) == (28, 28, 29, 28)
assert (A['row_step_31oct'], A['row_day_31oct'], A['zone_step_31oct'], A['zone_day_31oct']) == (28, 28, 29, 28)
assert b['row']['to'] == 3483 and b['zones']['to'] + b['zones']['vent'] == 3483   # the two totals meet again
assert a['zones']['to'] + a['zones']['vent'] == 3454 != a['row']['to']            # on 30 Oct they part by one
# the zones of report 169 whose own total did not move by what they printed
z = {r['zone']: r for r in S['zones_169']}
off = sorted(k for k, r in z.items() if r['step'] != r['comm'] + r['cte'])
assert off == ['Mambasa', 'Mongbwalu', 'Nizi'], off
assert (z['Mongbwalu']['comm'], z['Mongbwalu']['cte'], z['Mongbwalu']['tot'], z['Mongbwalu']['step']) == (1, 0, 10, 0)
days[169]['off'] = [dict(zone=k, comm=z[k]['comm'], cte=z[k]['cte'], printed_total=z[k]['tot'], step=z[k]['step']) for k in off]
days[170]['off'] = []
out = dict(source=f"the Field, study 62 (session 260), field-research@{commit}, artifacts/after-cycle-012/the-two-days/results62.json",
           days=days)
for k in days: days[k]['row']['from'] = days[k]['row'].pop('from_'); days[k]['zones']['from'] = days[k]['zones'].pop('from_')
js = json.dumps(out, indent=1, ensure_ascii=False)
open(os.path.join(HERE, 'carry.json'), 'w').write(js + '\n')
open(os.path.join(HERE, 'carry.js'), 'w').write('window.UNREAD_CARRY = ' + js + ';\n')
print('ok: 30 Oct row 12+7=19, total 3,436->3,455 (+19); zones print 13+8=21, their totals move 18; '
      'Mongbwalu prints 10 and does not move; 31 Oct row 28, total +28, zones +29; meet at 3,483')
