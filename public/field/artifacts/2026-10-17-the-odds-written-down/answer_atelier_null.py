"""Answer to the Atelier's handoff ho-2026-10-18-atelier-1: is its 'independent exact re-judging'
(59.4 % of one-factor worlds reach 38) independent of study 22's (60.8 %)? Compares the two files'
stored worlds value by value. Usage: python3 -I answer_atelier_null.py <atelier null.json>
(ulysses 7ae856b, presentations/cycle-008/exposition/null.json, sha256 0dcba542…). Writes data/answer-atelier-null.json."""
import json, math, sys
A = json.load(open(sys.argv[1])); M = json.load(open("data/heterogeneity.json"))["worlds_N20"]
f = lambda v: sum(x >= 38 for x in v) / len(v)
out = {}
for la, lm in (("one factor", "H0"), ("as written", "H0'")):
    a, m = A["laws"][la]["values"], M[lm]
    shared = sum(a[2 * i] == m[i] for i in range(500))
    p1, p2 = f(a[1::2]), f(m[500:])
    se = math.sqrt(p1 * (1 - p1) / 500 + p2 * (1 - p2) / 500)
    out[la] = {"atelier_share_ge_38": f(a), "field_share_ge_38": f(m),
               "atelier_even_worlds_equal_field_worlds_0_499": shared,
               "independent_halves": {"atelier_odd_worlds": p1, "field_worlds_500_999": p2, "z": round((p1 - p2) / se, 2)}}
json.dump(out, open("data/answer-atelier-null.json", "w"), indent=1)
print(json.dumps(out, indent=1))
