# Session 2 tests (predictions in SESSION2.md). Usage: python3 -I session2.py <scratch dir with ps.csv> > session2.json
import csv, sys, json, math, re, itertools, collections
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
def pairs(q):
    v, e1, e2 = Q[q]; per = collections.defaultdict(dict)
    for r in rows:
        a, u, l = f(r[v]), f(r[e1]), f(r[e2])
        if None in (a, u, l): continue
        s = (abs(u) + abs(l)) / 2
        if s > 0: per[r["pl_name"]].setdefault(ref(r), (a, s, r["pl_pubdate"]))
    res = []   # (planet, z, later_sigma, earlier_sigma, later_year) ; order None if equal pubdate
    for p, d in per.items():
        for (a, sa, da), (b, sb, db) in itertools.combinations(d.values(), 2):
            if a == b: continue
            z = abs(a - b) / math.hypot(sa, sb)
            if not (da and db) or da == db: res.append((p, z, None, None, None)); continue
            (ls, es, ld) = (sa, sb, da) if da > db else (sb, sa, db)
            res.append((p, z, ls, es, int(ld[:4])))
    return res, per
for q in Q:
    res, per = pairs(q); n = len(res)
    tail = [x for x in res if x[1] > 3]
    o = {"pairs_nonidentical": n, "tail_pairs": len(tail), "tail_share": len(tail) / n}
    ordered = [x for x in tail if x[2] is not None]
    o["tail_ordered"] = len(ordered); o["tail_unordered_dropped"] = len(tail) - len(ordered)
    o["p1_share_later_smaller_sigma"] = sum(x[2] < x[3] for x in ordered) / len(ordered)
    o["p1_share_later_equal_sigma"] = sum(x[2] == x[3] for x in ordered) / len(ordered)
    allord = [x for x in res if x[2] is not None]
    o["p1_baseline_all_pairs_later_smaller"] = sum(x[2] < x[3] for x in allord) / len(allord)
    bands = [("<=2014", lambda y: y <= 2014), ("2015-2019", lambda y: 2015 <= y <= 2019), ("2020+", lambda y: y >= 2020)]
    o["p2_by_later_year"] = {}
    for name, fn in bands:
        g = [x for x in allord if fn(x[4])]
        o["p2_by_later_year"][name] = {"pairs": len(g), "tail_share": (sum(x[1] > 3 for x in g) / len(g)) if g else None}
    cnt = collections.Counter(x[0] for x in tail); planets = len(per)
    top = max(1, math.ceil(0.05 * planets)); share = sum(c for _, c in cnt.most_common(top)) / len(tail)
    o["p3_planets_with_values"] = planets; o["p3_planets_with_tail"] = len(cnt)
    o["p3_top5pct_planets"] = top; o["p3_top5pct_share_of_tail"] = share
    # restricted to planets that can have a pair at all
    testable = {x[0] for x in res}; top2 = max(1, math.ceil(0.05 * len(testable)))
    o["p3_testable_planets"] = len(testable); o["p3_top5pct_of_testable_share"] = sum(c for _, c in cnt.most_common(top2)) / len(tail)
    # p4: sibling
    has_tail = {p: (p in cnt) for p in testable}
    byhost = collections.defaultdict(list)
    for p in testable: byhost[host[p]].append(p)
    a = [0, 0]; b = [0, 0]   # [planets with tail, planets]: sibling has tail / no sibling has tail
    for h, ps_ in byhost.items():
        if len(ps_) < 2: continue
        for p in ps_:
            sib = any(has_tail[s] for s in ps_ if s != p)
            tgt = a if sib else b; tgt[0] += has_tail[p]; tgt[1] += 1
    o["p4_with_sibling_tail"] = {"planets": a[1], "share_tail": a[0] / a[1] if a[1] else None}
    o["p4_without_sibling_tail"] = {"planets": b[1], "share_tail": b[0] / b[1] if b[1] else None}
    o["p4_ratio"] = (a[0] / a[1]) / (b[0] / b[1]) if a[1] and b[1] and b[0] else None
    out[q] = o
print(json.dumps(out, indent=1))
