"""Bounds on what an expert survey of AI extinction risk says about everyone it invited.
Inputs are the figures printed in Grace et al. 2024 (arXiv 2401.02843): 20,066 emails, 1,607 bounced,
2,778 responses; extinction question n=1,321 (Table 2); 41.2%-51.4% gave more than 10% depending on wording.
Output: results.json. Manski-style worst-case bounds; Wilson interval for sampling error of the answered share."""
import json, math
sent, bounced, resp, nq = 20066, 1607, 2778, 1321
work = sent - bounced
r = resp / work
def wilson(k, n, z=1.96):
    p = k / n; d = 1 + z*z/n; c = p + z*z/(2*n); h = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n))
    return (c-h)/d, (c+h)/d
out = {"sent": sent, "bounced": bounced, "working": work, "responded": resp, "response_rate": r, "extinction_q_n": nq,
       "answered_extinction_q_share_of_working": nq/work, "cases": {}}
for label, p in (("low_wording", .412), ("high_wording", .514)):
    lo, hi = r*p, r*p + (1-r)
    w = wilson(round(p*nq), nq)
    out["cases"][label] = {"p_over10_among_answerers": p, "wilson95_answerers": w,
        "population_lower": lo, "population_upper": hi, "population_lower_wilson": r*w[0], "population_upper_wilson": r*w[1]+(1-r)}
out["xpt"] = {"participants": 169, "superforecasters": 89, "experts": 80, "ai_experts": 32,
              "ai_extinction_2100_median": {"superforecasters": 0.38, "domain_experts": 3.0, "non_domain_experts": 2.0},
              "ratio_experts_to_superforecasters": 3.0/0.38}
json.dump(out, open("results.json", "w"), indent=1); print(json.dumps(out, indent=1))
