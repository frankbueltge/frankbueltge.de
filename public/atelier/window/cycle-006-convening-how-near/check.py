"""How near — checks recomputed from data.json alone. Run: python3 -I check.py"""
import json, re
d = json.load(open("data.json")); NEAR = "AI tangible harm near-miss"; LEX = re.compile(d["lexicon"], re.I)
n = 0
def ok(c, m):
    global n; n += 1; assert c, m
pairs = d["pairs_by_language"]
ok(len(pairs) == 158, "158 pairs")
either = [p for p in pairs if NEAR in (p["a"], p["b"])]; both = [p for p in either if p["a"] == p["b"] == NEAR]
ok((len(either), len(both)) == (14, 3), "14 pairs with a near-miss call, 3 joint (the Field's numbers)")
ok(sum(p["near_language"] for p in pairs) == 1 and not any(p["near_language"] for p in either), "1 near-language description, never called near")
calls = d["exploratory"]["calls"]
ok(len(calls) == 26, "26 near-miss calls")
ok(sum(c["description_has"] for c in calls) == 0, "0 descriptions carry the words")
ok(sum(c["note_has_counterfactual"] for c in calls) == 9 and sum(c["note_empty"] for c in calls) == 4, "9 notes carry them, 4 empty")
for c in d["cases"]:
    for r in c["readers"]:
        if r["level"] == NEAR:
            ok(bool(LEX.search(r["note"])) == any(x["note_has_counterfactual"] for x in calls if x["id"] == c["id"] and x["annotator"] == r["annotator"]), f"note flag {c['id']}")
    ok(bool(LEX.search(c["title"] + " " + c["description"])) == c["near_language"], f"description flag {c['id']}")
same = [r["note"] for c in d["cases"] for r in c["readers"] if "harm would have occurred if not for atypical intervention" in r["note"]]
ok(len(same) == 2, "two notes share the sentence")
ok(sum(1 for c in d["cases"] if (c["final"] or {}).get("level") == NEAR) == 10, "10 final near misses")
ok(all(any(r["annotator"] == "005" and r["level"] == NEAR for r in c["readers"]) for c in d["cases"] if (c["final"] or {}).get("level") == NEAR), "every final near miss called so by 005")
who = [(c["id"], r["annotator"]) for c in d["cases"] for r in c["readers"] if r["level"] == NEAR and LEX.search(r["note"])]
ok(len(who) == 9 and all(a == "005" for _, a in who), "all nine counterfactual notes are 005's")
label_only = [i for c in d["cases"] for r in c["readers"] if r["level"] == NEAR and LEX.search(r["note"]) and {m.group(0).lower().replace("-", " ") for m in LEX.finditer(r["note"])} == {"near miss"} for i in [c["id"]]]
ok(sorted(label_only) == [34, 124], "two notes only name the category")
ok(round(10 / 121, 3) == 0.083 and round(4 / 37, 3) == 0.108, "rates as printed")
print(f"check.py: {n} checks passed")
