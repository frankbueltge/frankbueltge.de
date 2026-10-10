"""The Hinge — checks recomputed from coding.json and data.json alone. Run: python3 -I check.py"""
import json
c = json.load(open("coding.json")); d = json.load(open("data.json"))
n = 0
def ok(cond, m):
    global n; n += 1; assert cond, m
EV = c["events"]; E = [x for e in EV for x in e["entries"]]; H = [x for x in E if x["hinge"]]
ok(len(EV) == 14 and len(E) == 45, "14 events, 45 entries")
ok(all(len(e["entries"]) >= 3 for e in EV), "every event is listed by three or four keepers")
ok(len({(e["id"], x["k"]) for e in EV for x in e["entries"]}) == 45, "one entry per keeper per event")
ok(len(H) == 26 and len(E) - len(H) == 19, "26 hinges, 19 entries without")
for e in EV:
    for x in e["entries"]:
        if x["hinge"]:
            ok(x.get("quote") and x["kind"] in ("person", "system", "chance"), f"{e['id']} {x['k']}: a hinge has a quotation and a kind")
            ok(all(0 <= s < len(e["steps"]) for s in x["steps"]) and (x["steps"] or x.get("off")), f"{e['id']} {x['k']}: steps in range")
        else:
            ok("steps" not in x and "kind" not in x, f"{e['id']} {x['k']}: no hinge carries no step")
        ok(x["cons"] in ("war", "detonation", "misreading", "other", "unstated") and (x["cons"] == "unstated") == (not x.get("cons_quote")), f"{e['id']} {x['k']}: consequent coded with its quotation")
multi = [e for e in EV if sum(x["hinge"] for x in e["entries"]) >= 2]
ok(len(multi) == 9 and sum(e["same"] is False for e in multi) == 4, "9 events with two or more hinges, 4 different")
# 'different' is never claimed where every keeper's hinge shares a step
for e in multi:
    sets = [set(x["steps"]) for x in e["entries"] if x["hinge"]]
    if e["same"]: ok(set.intersection(*sets), f"{e['id']}: same hinge shares a step")
    else: ok(not set.intersection(*sets), f"{e['id']}: different hinges share no step across all keepers")
kinds = {k: sum(x["kind"] == k for x in H) for k in ("person", "system", "chance")}
ok(kinds == {"person": 20, "system": 4, "chance": 2}, "kinds 20/4/2")
stated = [x for x in E if x["cons"] != "unstated"]
ok(len(stated) == 17 and sum(x["cons"] == "war" for x in stated) == 8, "8 of 17 stated consequents are war")
ok([p["verdict"] for p in d["predictions"]] == ["held", "held", "held", "failed"], "P1-P3 held, P4 failed")
ok(d["results"]["no_hinge"] == 19 and d["quotations_checked"] == 60, "data.json agrees")
none_events = [e["id"] for e in EV if not any(x["hinge"] for x in e["entries"])]
ok(none_events == ["E03", "E10", "E30"], "three events with no hinge on any list")
doubts = [x for x in E if x.get("quote2") and "could have come to the same conclusion" in x["quote2"]]
ok(len(doubts) == 1, "one entry doubts its own hinge")
print(f"check.py: {n} checks passed")
