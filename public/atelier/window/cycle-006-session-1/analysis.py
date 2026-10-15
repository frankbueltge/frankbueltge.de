"""Cycle 006 session 1. Usage: python3 -I analysis.py <espai-response-csv>
Reads only the question columns, Finished and nothing that identifies a person (those columns are redacted in the file
and are never read). Writes results.json. The response file itself is not committed (source file, protocol §7)."""
import csv, hashlib, json, math, sys

path = sys.argv[1]
raw = open(path, "rb").read()
r = csv.reader(open(path, encoding="utf-8", errors="replace"))
H = next(r); ROWS = list(r)
ix = {n: H.index(n) for n in ["Finished", "hlmi_value_extremelybad", "extinction_basic_clean",
                              "extinction_controlproblem_clean", "extinction_100years_clean"]}
def vals(n, only=None):
    out = []
    for x in ROWS:
        if only is not None and x[ix["Finished"]] != only: continue
        try: out.append(float(x[ix[n]]))
        except Exception: pass
    return out

# fielding numbers, Grace et al. arXiv:2401.02843 section 6.4 and 6.2 (names collected "approximately 21,800")
FRAME = {"names_collected_approx": 21800, "emails_found": 20066, "working_addresses": 18459, "responses": 2778}
def wilson(k, n, z=1.959964):
    p = k / n; d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return c - h, c + h
def share_bounds(p, r):          # share of the whole frame at or above the line, nothing assumed about the missing
    return p * r, p * r + (1 - r)
def mix(p, r, k):                # share if missing people are k times as likely as respondents to be at or above
    return p * (r + (1 - r) * min(k, 1 / p))
def breakeven_k(p, r, t):        # k at which the frame share equals t
    return (t / p - r) / (1 - r)

Q = {"hlmi_extremely_bad_10pct_plus": "hlmi_value_extremelybad", "extinction_basic": "extinction_basic_clean",
     "extinction_control_problem": "extinction_controlproblem_clean", "extinction_100_years": "extinction_100years_clean"}
res = {"source": {"paper": "Grace et al., Thousands of AI Authors on the Future of AI, arXiv:2401.02843",
                  "response_file": "tinyurl.com/espai2023-clean-anon-responses (as linked in the paper, p. 2090 of the extracted text)",
                  "response_file_sha256": hashlib.sha256(raw).hexdigest(), "rows": len(ROWS)},
       "frame": FRAME, "questions": {}}
for name, col in Q.items():
    v = vals(col); n = len(v); k = sum(a >= 10 for a in v); p = k / n
    lo, hi = wilson(k, n)
    q = {"n": n, "at_least_10": k, "share": p, "median": sorted(v)[n // 2] if n % 2 else (sorted(v)[n // 2 - 1] + sorted(v)[n // 2]) / 2,
         "wilson95": [lo, hi], "sampling_halfwidth_pts": (hi - lo) / 2 * 100, "by_frame": {}}
    for label, N in [("working_addresses", 18459), ("emails_found", 20066), ("names_collected", 21800)]:
        rr = FRAME["responses"] / N; b = share_bounds(p, rr)
        q["by_frame"][label] = {"response_rate": rr, "bounds": list(b), "width_pts": (b[1] - b[0]) * 100,
                                "width_over_sampling_halfwidth": (b[1] - b[0]) * 100 / q["sampling_halfwidth_pts"],
                                "breakeven_k_over_a_third": breakeven_k(p, rr, 1 / 3), "breakeven_k_over_a_fifth": breakeven_k(p, rr, 0.2),
                                "share_if_k": {str(kk): mix(p, rr, kk) for kk in (0.25, 0.5, 0.6, 0.8, 1.0, 1.25)}}
    res["questions"][name] = q

# the median: identification set under no assumption on the missing
def median_set(sample, rr):
    s = sorted(sample); n = len(s)
    a = (0.5 - (1 - rr)) / rr; b = 0.5 / rr   # quantile levels among respondents that bracket the population median
    lo = s[0] if a <= 0 else s[min(n - 1, math.ceil(a * n) - 1)]
    hi = s[-1] if b >= 1 else s[min(n - 1, math.ceil(b * n) - 1)]
    return lo, hi, a, b
v = vals("hlmi_value_extremelybad")
res["median_identification"] = {}
for label, N in [("working_addresses", 18459), ("emails_found", 20066), ("names_collected", 21800)]:
    lo, hi, a, b = median_set(v, FRAME["responses"] / N)
    res["median_identification"][label] = {"level_low": a, "level_high": b, "set": [lo, hi]}
# the same set if half the frame had answered (what a response rate would have to be to bound the median)
res["median_identification"]["response_rate_needed_to_bound_median_below_100"] = 0.5

# did-not-finish respondents against finishers, among those who answered the long-run impact question
fin = vals("hlmi_value_extremelybad", "1"); par = vals("hlmi_value_extremelybad", "0")
kf = sum(a >= 10 for a in fin); kp = sum(a >= 10 for a in par)
res["unfinished_vs_finished"] = {"finished": {"n": len(fin), "k": kf, "share": kf / len(fin), "wilson95": list(wilson(kf, len(fin)))},
                                 "unfinished": {"n": len(par), "k": kp, "share": kp / len(par), "wilson95": list(wilson(kp, len(par)))},
                                 "difference_pts": (kp / len(par) - kf / len(fin)) * 100}
# what the file cannot support
res["redacted_columns_checked"] = {c: sorted({x[H.index(c)] for x in ROWS})[:3] for c in
    ["StartDate", "industry_academia_other", "thought_hlmi_impacts", "thought_hlmi_timeline", "IPAddress"] if c in H}

# the second record. XPT report (Forecasting Research Institute, 2023), Table 3, medians for "AI extinction by 2100"
res["xpt_table3_ai_extinction_by_2100"] = {
    "source": "Karger et al., Forecasting Existential Risks: Evidence from a Long-Run Forecasting Tournament, FRI 2023, Table 3; N=88 superforecasters, 59 domain experts",
    "superforecasters": {"median_pct": 0.38, "ci95_median": [0.10, 0.75]},
    "domain_experts": {"median_pct": 3.0, "ci95_median": [0.49, 10.0]},
    "public_survey": {"median_pct": 2.0, "ci95_median": [1, 2]},
    "participants": "signed up after open advertising; 80 experts selected from hundreds of expressions of interest; ~34 % attrition; report says they cannot be claimed representative"}
res["ratios"] = {"xpt_experts_over_superforecasters": 3.0 / 0.38, "espai_median_over_xpt_superforecasters": res["questions"]["extinction_basic"]["median"] / 0.38}
json.dump(res, open("results.json", "w"), indent=1)
q = res["questions"]
for n, d in q.items():
    b = d["by_frame"]["working_addresses"]
    print(f'{n:34s} n={d["n"]:5d} p={d["share"]:.4f} med={d["median"]} samp±{d["sampling_halfwidth_pts"]:.2f} bounds=[{b["bounds"][0]:.3f},{b["bounds"][1]:.3f}] w/s={b["width_over_sampling_halfwidth"]:.1f} k*={b["breakeven_k_over_a_third"]:.3f}')
print(json.dumps(res["median_identification"])); print(json.dumps(res["unfinished_vs_finished"])); print(res["redacted_columns_checked"]); print(res["ratios"])
