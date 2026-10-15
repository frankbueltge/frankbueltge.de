"""Cycle 005 s5: the Studio's further read (3 odd of 90 unlicensed frames) against the session-3/4 model and power table.
Same power prior as ../cycle-005-session-3/analysis.py. ratio = predictive(separate lots) / predictive(shared lot); above 1 favours separate.
Stdlib only. Output: results.json."""
import json, math, collections
L = json.load(open("../cycle-005-session-1/tortoise135.json"))["rows"]
D = json.load(open("../cycle-005-session-2/drawn135.json"))["rows"]
lg = math.lgamma
def lbeta(a, b): return lg(a) + lg(b) - lg(a + b)
def bstar(obs): s = list(collections.Counter(obs).values()); return sum(b * b for b in s) / sum(s)
def neff(rows, rho): return len(rows) / (1 + (bstar([r["obs"] for r in rows]) - 1) * rho)
def lpred(k1, n1, a0, j, m): a = .5 + a0 * k1; b = .5 + a0 * (n1 - k1); return lbeta(a + j, b + m - j) - lbeta(a, b)
def ratio(k1, n1, j, m): return math.exp(lpred(k1, n1, 0, j, m) - lpred(k1, n1, 1, j, m))
f1 = neff(L, .05) / len(L); f2 = neff(D, .05) / len(D)
# the further 90 frames: 81 observers (Studio results.json); b* of that draw is not published, so bounds b*=1.0 and 1.2 (nine pairs at most)
f3 = {"b1.0": 1.0, "b1.2": 1 / (1 + 0.2 * .05)}
def pooled_f(f3v): return (135 * f2 + 90 * f3v) / 225      # weighted share of effective frames over the pooled draws
def ratio_d(k1, j, m, fm): return ratio(k1 * f1, 135 * f1, j * fm, m * fm)
def binom_tail(m, q, j0):
    return sum(math.exp(lg(m + 1) - lg(j + 1) - lg(m - j + 1) + j * math.log(q) + (m - j) * math.log(1 - q)) for j in range(j0, m + 1))
R = {"f1": f1, "f2": f2, "f3": f3}
R["pooled"] = {}
for name, j in (("settled_3", 3), ("unclear_odd_4", 4)):
    R["pooled"][name] = {"plain": ratio(4, 135, j, 225),
                         "discounted_b1.0": ratio_d(4, j, 225, pooled_f(f3["b1.0"])), "discounted_b1.2": ratio_d(4, j, 225, pooled_f(f3["b1.2"]))}
R["bone_only"] = {"licensed_1_of_135_vs_unlicensed_1_of_225": ratio(1, 135, 1, 225)}   # Studio: bone 1 of 225 v 1 of 135
R["further_alone"] = {"licensed_vs_3_of_90": ratio(4, 135, 3, 90)}
R["draw1_v_draw2"] = {"draw1_0of135_as_base_draw2_3of90": ratio(0, 135, 3, 90), "licensed_4of135_as_base_pooled_3of225": ratio(4, 135, 3, 225)}
R["p5"] = {"p_ge3_of90_q0.03": binom_tail(90, .03, 3), "p_ge3_of90_q0.004": binom_tail(90, .004, 3), "p_ge3_of90_q0.015": binom_tail(90, .015, 3), "p_ge3_of90_q0.0133": binom_tail(90, 3 / 225, 3)}
# the pooled read still needed: frames at zero further odd to reach 3x for separate lots (licensed 4 of 135), with the draw now 3 of 225 -> what rate keeps ratio below 3?
R["still_needed"] = {}
for extra in (0, 100, 300, 600, 1000):
    R["still_needed"][str(extra)] = {"zero_odd_in_extra": ratio(4, 135, 3, 225 + extra), "same_rate_in_extra": ratio(4, 135, round(3 * (225 + extra) / 225), 225 + extra)}
# stages the page draws: for licensed odd count k and j2 odd in the further 90: draw 1 alone, draw 2 alone, both pooled (plain)
R["stages"] = {str(k): {str(j2): {"d1": ratio(k, 135, 0, 135), "d2": ratio(k, 135, j2, 90), "pool": ratio(k, 135, j2, 225)} for j2 in range(0, 7)} for k in range(1, 7)}
json.dump(R, open("results.json", "w"), indent=1, sort_keys=True)
print(json.dumps({k: v for k, v in R.items() if k != "stages"}, indent=1, sort_keys=True))
