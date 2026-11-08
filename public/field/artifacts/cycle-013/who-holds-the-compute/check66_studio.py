import json, sys
t = open(sys.argv[1]).read(); S = json.loads(t[t.index('{'):t.rstrip().rstrip(';').rindex('}') + 1])
R = json.load(open(sys.argv[2]))
ours = {q['q']: q for q in R['quarters']}
SM = 'China (smuggled)'; FIVE = ["Google", "Microsoft", "Meta", "Amazon", "Oracle"]
out = []
for q in S['quarters']:
    o = ours[q['q']]; own = q['owners']
    land = sum(v['m'] for k, v in own.items() if k != SM)
    m_gap = max(abs(own[k]['m'] - o['owner_h100e'][k]) for k in own)
    area = {k: 100 * v['m'] / land for k, v in own.items() if k != SM}
    g_tot = max(abs(area[k] - o['owner_share'][k]) for k in area)
    tot_ex = o['total'] - o['owner_h100e'].get(SM, 0)
    g_ex = max(abs(area[k] - 100 * o['owner_h100e'][k] / tot_ex) for k in area)
    five_area = sum(area.get(k, 0) for k in FIVE)
    out.append(dict(q=q['q'], incomplete=q['incomplete'], owner_sum_gap_h100e=m_gap, total_gap=q['total'] - o['total'],
                    max_gap_vs_share_of_total=round(g_tot, 2), max_gap_vs_share_ex_smuggled=round(g_ex, 4),
                    five_area=round(five_area, 2), five_label=q['top5'], five_ours=o['top5'], five_ours_ex=o['top5_ex_smuggled']))
json.dump(out, open(sys.argv[3], 'w'), indent=1)
for r in out: print(r)
