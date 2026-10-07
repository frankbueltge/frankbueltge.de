# Unregistered second pass (deviation, JOURNAL2.md items 3-4). Usage: python3 -I session2b.py <scratch dir> > session2b.json
# (a) is the concentration (P3) built in by pair counting? A planet with n references has n(n-1)/2 pairs.
# (b) does the shared-star reading (P4) show in the data: do sibling planets' tail pairs come from the SAME two references,
#     and do those pairs differ by the same factor?
import csv, sys, json, math, re, itertools, collections, statistics as S
rows = list(csv.DictReader(open(sys.argv[1] + "/ps.csv", newline="")))
def ref(r):
    m = re.search(r"refstr=(\S+)", r["pl_refname"]); return m.group(1) if m else r["pl_refname"]
def f(x):
    try: return float(x)
    except: return None
Q = {"period": ("pl_orbper", "pl_orbpererr1", "pl_orbpererr2"), "radius": ("pl_radj", "pl_radjerr1", "pl_radjerr2"),
     "mass": ("pl_bmassj", "pl_bmassjerr1", "pl_bmassjerr2")}
host = {r["pl_name"]: r["hostname"] for r in rows}
out = {}
for q, (v, e1, e2) in Q.items():
    per = collections.defaultdict(dict)
    for r in rows:
        a, u, l = f(r[v]), f(r[e1]), f(r[e2])
        if None in (a, u, l): continue
        s = (abs(u) + abs(l)) / 2
        if s > 0: per[r["pl_name"]].setdefault(ref(r), (a, s))
    allp = tail = 0; byn = collections.defaultdict(lambda: [0, 0, 0])   # n refs bucket -> [planets, pairs, tail pairs]
    grp = collections.defaultdict(list)     # (host, refpair) -> [(planet, ratio)] for tail pairs
    allgrp = collections.defaultdict(list)  # same for all non-identical pairs
    for p, d in per.items():
        n = len(d); b = "2" if n == 2 else "3-5" if n <= 5 else "6-10" if n <= 10 else "11+"
        byn[b][0] += 1
        for (ra, (a, sa)), (rb, (c, sc)) in itertools.combinations(d.items(), 2):
            if a == c: continue
            z = abs(a - c) / math.hypot(sa, sc); byn[b][1] += 1
            key = (host[p], tuple(sorted((ra, rb)))); ratio = (a / c) if ra < rb else (c / a)
            allgrp[key].append((p, ratio))
            if z > 3: byn[b][2] += 1; tail += 1; grp[key].append((p, ratio))
        allp += sum(1 for _ in itertools.combinations(d, 2))
    tot_pairs = sum(x[1] for x in byn.values())
    o = {"by_refs": {b: {"planets": x[0], "pairs": x[1], "share_of_all_pairs": x[1] / tot_pairs, "tail_pairs": x[2],
                         "share_of_tail": x[2] / tail, "tail_rate": x[2] / x[1] if x[1] else None} for b, x in sorted(byn.items())}}
    multi = {k: v for k, v in grp.items() if len({p for p, _ in v}) >= 2}
    tail_in_multi = sum(len(v) for v in multi.values())
    o["tail_pairs"] = tail
    o["tail_pairs_in_groups_with_2plus_planets"] = tail_in_multi
    o["share_tail_in_such_groups"] = tail_in_multi / tail
    # baseline: of all non-identical pairs, share lying in (host, refpair) groups of 2+ planets
    am = {k: v for k, v in allgrp.items() if len({p for p, _ in v}) >= 2}
    o["share_all_pairs_in_such_groups"] = sum(len(v) for v in am.values()) / sum(len(v) for v in allgrp.values())
    # do siblings in such a tail group differ by the same factor? max/min of ratios within 10 %, one value per planet
    agree = tot = 0
    for v in multi.values():
        rr = {}
        for p, r in v: rr.setdefault(p, r)
        rs = [r for r in rr.values() if r > 0]
        if len(rs) >= 2:
            tot += 1; agree += (max(rs) / min(rs) <= 1.10)
    o["tail_groups_2plus_planets"] = tot; o["share_groups_ratio_agree_within_10pct"] = agree / tot if tot else None
    # same, for all-pair groups (control: ratio agreement expected when the references are the same pair)
    agree2 = tot2 = 0
    for v in am.values():
        rr = {}
        for p, r in v: rr.setdefault(p, r)
        rs = [r for r in rr.values() if r > 0]
        if len(rs) >= 2:
            tot2 += 1; agree2 += (max(rs) / min(rs) <= 1.10)
    o["all_groups_2plus_planets"] = tot2; o["share_all_groups_ratio_agree_within_10pct"] = agree2 / tot2 if tot2 else None
    out[q] = o
print(json.dumps(out, indent=1))
