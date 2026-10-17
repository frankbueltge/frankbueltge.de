"""Second route: recompute the primary-set observed and expected hits, the 'larger to come' count and
the count coverage from data/forecasts.jsonl and data/outcomes.jsonl by a separate code path
(one pass per mainshock over its stored event list, not the cell table),
compare with data/results.json, and prove a tamper is caught. Prints each check; exits non-zero on failure."""
import json, math, sys, copy
ok = fail = 0
def chk(name, cond):
    global ok, fail
    ok += bool(cond); fail += (not cond); print(("ok   " if cond else "FAIL ") + name)

F = [json.loads(l) for l in open("data/forecasts.jsonl")]
O = {json.loads(l)["id"]: json.loads(l) for l in open("data/outcomes.jsonl")}
R = json.load(open("data/results.json"))

def recompute(F, O):
    obs = exp = cov = n = ab = abn = 0
    for r in F:
        o = O[r["id"]]
        mc = r["Mcat"] if r["Mcat"] is not None else 3.0
        w = next((w for w in r["windows"] if w["label"] == "1 Week"), None)
        if w is None or w["t1"] > o["fetched"]: continue
        mags = []
        for e in o["events"]:
            if e[2] is not None and e[4] <= r["rkm"] and w["t0"] <= e[1] < w["t1"]: mags.append(round(e[2], 2))
        for b in w["bins"]:
            if b["M"] < mc - 1e-9: continue
            k = len([m for m in mags if m >= b["M"] - 1e-9])
            obs += k > 0; exp += b["p"]; n += 1; cov += b["lo"] <= k <= b["hi"]
        if w["above"] is not None:
            abn += 1; ab += any(m >= w["aboveM"] - 1e-9 for m in mags)
    return obs, round(exp, 2), cov, n, ab, abn

obs, exp, cov, n, ab, abn = recompute(F, O)
P = R["primary_1week_M_ge_Mcat"]
chk("primary cells %d = %d" % (n, P["cells"]), n == P["cells"])
chk("primary observed %d = %d" % (obs, P["observed"]), obs == P["observed"])
chk("primary expected %.2f = %.2f" % (exp, P["expected"]), abs(exp - P["expected"]) < 0.011)
chk("count coverage %d = %d" % (cov, P["count_in_95_range"]), cov == P["count_in_95_range"])
A = R["above_mainshock_1week"]
chk("larger-to-come %d of %d = %d of %d" % (ab, abn, A["observed"], A["mainshocks"]), ab == A["observed"] and abn == A["mainshocks"])
chk("every forecast has its outcome list", all(r["id"] in O for r in F))
chk("no outcome list contains the mainshock's own id", all(r["id"] not in {e[0] for e in O[r["id"]]["events"]} for r in F))
chk("stored distances are non-negative and finite", all(0 <= e[4] < 1e5 for o in O.values() for e in o["events"]))
# tamper: raise one event in a primary window above every bin; the recomputation must move
T = copy.deepcopy(O)
for r in F:
    w = next((w for w in r["windows"] if w["label"] == "1 Week"), None)
    if w and w["t1"] <= T[r["id"]]["fetched"]:
        mc = r["Mcat"] if r["Mcat"] is not None else 3.0
        T[r["id"]]["events"].append(["tamper", w["t0"] + 1, 9.0, "mw", 0.0]); break
chk("tamper caught (one fabricated M9 changes the primary hits)", recompute(F, T)[0] != obs)
print("%d of %d checks passed; %d ran" % (ok, ok + fail, ok + fail)); sys.exit(1 if fail else 0)
