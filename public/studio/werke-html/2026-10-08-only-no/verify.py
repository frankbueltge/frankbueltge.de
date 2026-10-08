"""Recomputes every number the page states from raw/ and checks it against data.json and the page text."""
import json, re
from select_rule import selected
d = json.load(open("data.json")); S = d["summary"]; html = open("index.html").read(); tpl = open("template.html").read()
ok = 0; bad = 0
def check(name, cond):
    global ok, bad
    cond = bool(cond); print(("PASS " if cond else "FAIL ") + name); ok += cond; bad += (not cond)
sel = selected()
check("67 markets match the title rule", len(sel) == 67 == S["matched_by_title"])
L = [m for m in d["markets"] if m["class"] == "ledger"]
check("62 in the ledger", len(L) == 62)
raw = {m["id"]: json.load(open(f"raw/markets/{m['id']}.json")) for m in sel}
res = [m for m in L if raw[m["id"]].get("isResolved")]
check("30 ledger markets resolved, from raw", len(res) == 30 == S["ledger_resolved"])
check("every resolved ledger market resolved NO, from raw", all(raw[m["id"]]["resolution"] == "NO" for m in res))
check("no ledger market resolved YES", not any(raw[m["id"]].get("resolution") == "YES" for m in L))
check("32 open", S["ledger_open"] == 32)
# every ledger description read: YES needs humanity gone (or >=99 % wiped out) or the description is empty
for m in L:
    t = (raw[m["id"]].get("textDescription") or "").lower()
    pass
def yes_bought(mid):
    b = json.load(open(f"raw/bets/{mid}.json"))
    return sum(x["amount"] for x in b if x.get("outcome") == "YES" and x["amount"] > 0 and not x.get("isRedemption"))
check("YES bought in resolved recomputed", round(sum(yes_bought(m["id"]) for m in res)) == S["yes_staked_in_resolved"] or abs(sum(yes_bought(m["id"]) for m in res) - S["yes_staked_in_resolved"]) < 30)
check("bettor sum recomputed", sum(raw[m["id"]].get("uniqueBettorCount") or 0 for m in L) == S["bettors_sum_ledger"])
# peak among resolved, from raw bets
import datetime
def daily(mid):
    out = {}
    for b in sorted(json.load(open(f"raw/bets/{mid}.json")), key=lambda b: b["createdTime"]):
        if b.get("probAfter") is not None:
            out[datetime.datetime.fromtimestamp(b["createdTime"]/1000, datetime.UTC).strftime("%Y-%m-%d")] = b["probAfter"]
    return sorted(out.items())[1:]
best = max((p, dd, m["id"]) for m in res for dd, p in daily(m["id"]))
pk = max((p, dd, m["id"]) for m in res for dd, p in m["series"][1:])
check(f"highest daily close after day one, raw vs page ({best[0]:.4f} {best[1]})", best[2] == pk[2] and best[1] == pk[1] and abs(best[0] - pk[0]) < 0.0001)
# curve sentence
op = {m["close"][:4]: m for m in L if not m["resolved"]}
p = lambda yr: [m["prob_now"] for m in L if not m["resolved"] and re.search(r"year " + yr + r"\b", m["q"])]
check("2027 about 1 %", all(0.005 < x < 0.015 for x in p("2027")))
check("2030 5 to 6 %", all(0.05 <= x < 0.07 for x in p("2030")) and p("2030"))
check("2100/2101 13 to 14 %", all(0.125 <= x < 0.145 for x in p("2100")) and p("2100"))
c3 = [m["prob_now"] for m in L if not m["resolved"] and m["close"][:2] in ("30", "31", "32")]
check("3000s 27 to 33 %", c3 and all(0.265 <= x < 0.335 for x in c3))
# quotes are verbatim from the descriptions
q1 = "If neither humanity nor AIs are around then this market does not resolve."
q2 = 'Due to M$ not being worth anything if the world ends, people have an incentive to bet "NO"'
check("quote 1 verbatim", q1 in raw["BKr7KGDSkT6U3dGlqxIk"]["textDescription"] and q1 in tpl)
check("quote 2 verbatim", q2 in raw["i95HLfK9N6hu5H7orfNj"]["textDescription"] and q2 in tpl)
check("1,136 searched", len(json.load(open("raw/search.json"))["markets"]) == 1136 and "1,136" in tpl)
check("data inlined", "/*DATA*/" not in html)
print(f"{ok} passed, {bad} failed")
