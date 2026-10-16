"""Checks the cycle-008 paper's numbers against the seven studies' committed results files.
Usage: python3 check.py   (no network; exit 1 on any failure; counts what it ran)"""
import json, os, re, sys
H = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(H, "..", "..", "artifacts", *p)
J = lambda *p: json.load(open(A(*p), encoding="utf-8"))
paper = open(os.path.join(H, "paper.md"), encoding="utf-8").read()
flat = re.sub(r"\s+", " ", paper)
ran, failed = [], []
def check(name, ok):
    ran.append(name)
    if not ok: failed.append(name)
    print(("ok   " if ok else "FAIL ") + name)
def has(*texts): return all(t in flat for t in texts)

s1 = J("2026-10-14-the-tornadoes-that-came", "data", "results.json")["rules"]["registered"]
check("S1 53.7 % of 19,631, killers 227/314, deaths 1,148/1,347",
      (s1["all"]["k"], s1["all"]["n"], s1["all"]["pct"], s1["killer"]["k"], s1["killer"]["n"], s1["deaths"]["in_warned_ahead"], s1["deaths"]["total"]) == (10542, 19631, 53.7, 227, 314, 1148, 1347)
      and has("10,542 / 19,631 = **53.7 %** (53.0–54.4)", "227 / 314 = **72.3 %**", "1,148 / 1,347 = 85.2 %"))
check("S1 eras 63.1 / 50.4 / 49.4", [round(s1["by_era"][e]["pct"], 1) for e in ("2008-2011", "2012-2016", "2017-2023")] == [63.1, 50.4, 49.4]
      and has("63.1 % in 2008–2011, 50.4 % in 2012–2016 and 49.4 % in 2017–2023"))

s2 = J("2026-10-14-the-warnings-never-needed", "data", "results.json")
S = s2["S"]["eras"]; s_late = 1 - (S["2012-2016"]["k"] + S["2017-2023"]["k"]) / (S["2012-2016"]["n"] + S["2017-2023"]["n"])
check("S2 30.4 % met; FAR 72.7 -> 67.8; strict 80.9 -> 79.5",
      (s2["V"]["all"]["k"], s2["V"]["all"]["n"], round(s2["P1"]["far_2008_2011"] * 100, 1), round(s2["P2"]["far_2012_2023"] * 100, 1),
       round(S["2008-2011"]["far"] * 100, 1), round(s_late * 100, 1)) == (13324, 43819, 72.7, 67.8, 80.9, 79.5)
      and has("13,324 / 43,819 = **30.4 %**", "80.9 % to 79.5 %"))
check("S2 P3 undecided at rho 0.353", s2["P3"]["verdict"] == "undecided" and s2["P3"]["spearman_rho"] == 0.353 and has("ρ = 0.353"))

s3 = J("2026-10-14-who-was-beneath", "data", "results.json")["fits"]
fi, ff = s3["M1_inj_nb"]["coef"]["warned"], s3["M1_fat_nb"]["coef"]["warned"]
check("S3 per-tornado injuries 0.60 (0.49-0.75), deaths 0.88 (0.62-1.26)",
      [round(fi[k], 2) for k in ("irr", "lo", "hi")] == [0.60, 0.49, 0.75] and [round(ff[k], 2) for k in ("irr", "lo", "hi")] == [0.88, 0.62, 1.26]
      and has("0.60 (0.49–0.75)", "0.88 (0.62–1.26)"))
fp = s3["M1_fat_poisson"]["coef"]["warned"]
check("S3 pooled deaths 1.32 (0.90-1.93)", [round(fp[k], 2) for k in ("irr", "lo", "hi")] == [1.32, 0.90, 1.93] and has("1.32 (0.90–1.93)"))

s4 = J("2026-10-15-where-nobody-was", "data", "results.json")
q = s4["quintiles"]
check("S4 OR 1.19 (1.14-1.24); fifths 29.8 / 32.5; weak 65.4 vs 40.7",
      [round(x, 2) for x in s4["adjusted_V"]["or_per_tenfold_density"]] == [1.19, 1.14, 1.24]
      and round(q[0]["V"][0], 1) == 29.8 and round(q[4]["V"][0], 1) == 32.5
      and round(q[0]["weak_among_verified"][0], 1) == 65.4 and round(q[4]["weak_among_verified"][0], 1) == 40.7
      and has("**1.19** (1.14–1.24)", "65.4 % vs 40.7 %", "29.8 % and 32.5 %"))
check("S4 counterfactual 69.6 -> 65.9", (round(s4["counterfactual"]["far_model_now"], 1), round(s4["counterfactual"]["far_if_top_quintile_density"], 1)) == (69.6, 65.9)
      and has("from 69.6 % to 65.9 %"))
check("S4 verdicts: P2 held, P1 P3 P4 failed", [s4["predictions"][k]["verdict"] for k in ("P1", "P2", "P3", "P4")] == ["failed", "held", "failed", "failed"])

s5 = J("2026-10-15-the-end-written-in-advance", "correction-2026-10-16", "results.json")
check("S5 corrected 16,644 of 16,644; 5,676 of 5,711 = 99.4 %",
      (s5["P1"]["silent"], s5["P1"]["with_expiry_after_sent"], s5["P3"]["cancel_before_expiry"], s5["P3"]["cancelled_with_expiry"], round(s5["P3"]["share"] * 100, 1))
      == (16644, 16644, 5676, 5711, 99.4) and has("16,644 / 16,644", "5,676 / 5,711 = **99.4 %**"))
check("S5 eta2 0.50 vs 0.08; shuffles at most about 0.17",
      round(s5["exploratory"]["eta2_account"]["eta2"], 2) == 0.50 and round(s5["exploratory"]["eta2_code"]["eta2"], 2) == 0.08
      and round(s5["exploratory"]["eta2_account_shuffled_max_of_50"], 2) == 0.17 and has("η² 0.50 against 0.08"))
check("S5 cancel median 98 min", round(s5["P3"]["cancel_minutes_median"]) == 98 and has("a median 98 minutes in"))

s6 = J("2026-10-16-the-clock-and-the-record", "data", "results.json")
w, pl = s6["windows"]["20"], s6["placebo_20"]
check("S6 2,415/4,498 vs 128/238, +0.1 (-6.4 to +6.5); placebo +3.8 (1.7-6.0)",
      (w["before"]["k"], w["before"]["n"], w["after"]["k"], w["after"]["n"], round(w["diff_after_minus_before_points"], 1),
       [round(x, 1) for x in w["diff_ci95"]], round(pl["diff_after_minus_before_points"], 1), [round(x, 1) for x in pl["diff_ci95"]])
      == (2415, 4498, 128, 238, 0.1, [-6.4, 6.5], 3.8, [1.7, 6.0]) and has("(2,415 of 4,498)", "(128 of 238)", "+3.8 points (1.7–6.0"))
check("S6 windows 10 / 30: -3.8 / +3.3", abs(s6["windows"]["10"]["diff_after_minus_before_points"] + 3.8) < .051 and abs(s6["windows"]["30"]["diff_after_minus_before_points"] - 3.3) < .051
      and has("gave −3.8 and +3.3"))

s7 = J("2026-10-16-the-fine-for-working", "data", "results.json")
h, d = s7["H"], s7["D"]
check("S7 OR 0.68 (0.59-0.78); R 2.3 % (0.9-4.5); z 0.82 / 3.95",
      round(h["OR_warned"], 2) == 0.68 and [round(x, 2) for x in h["OR_ci"]] == [0.59, 0.78] and round(h["R"] * 100, 1) == 2.3
      and [round(x * 100, 1) for x in h["R_ci"]] == [0.9, 4.5] and round(h["z_one"], 2) == 0.82 and round(h["z_two"], 2) == 3.95
      and has("0.68 (0.59–0.78", "2.3 % (0.9–4.5)", "**0.82** (0.32–1.59); **3.95** (2.53–5.46)"))
yr = 16 / s7["n_warned"]
check("S7 years to z = 2: about 96 one column, four both", round(h["N_one"] * yr) == 96 and round(h["N_two"] * yr) == 4 and has("about 96 years"))
check("S7 F 11.4 (4.7-21.5); EF2 61 %, EF3+ 20 %",
      round(h["F"], 1) == 11.4 and [round(x, 1) for x in h["F_ci"]] == [4.7, 21.5]
      and round(h["by_ef"]["EF2"]["F"] / h["F"] * 100) == 61 and round(h["share_EF3plus"] * 100) == 20 and has("EF2 (61 %)", "EF3+ (20 %"))
check("S7 deaths R 0.2 %, z_two 0.68", round(d["R"] * 100, 1) == 0.2 and round(d["z_two"], 2) == 0.68 and has("z₂ = 0.68"))

# predictions tally: held / failed / undecided across the seven studies
tally = {"S1": (4, 1, 0), "S2": (3, 0, 1), "S3": (4, 2, 0), "S4": (1, 3, 0), "S5": (4, 1, 0), "S6": (1, 3, 0), "S7": (s7["held"], 6 - s7["held"], 0)}
p1 = J("2026-10-14-the-tornadoes-that-came", "data", "results.json")["predictions"]["registered"]
check("S1 tally from file: 4 held, 1 failed", sum(1 for v in p1.values() if (v.get("verdict") if isinstance(v, dict) else v) in ("held", True)) == 4)
check("S2 tally from file: 3 held, 1 undecided", [s2[k]["verdict"] for k in ("P1", "P2", "P3")] + [s2["P4"]["verdict"]] == ["held", "held", "undecided", "held"])
check("S7 tally from file: 5 held", s7["held"] == 5)
held = sum(t[0] for t in tally.values()); fail = sum(t[1] for t in tally.values()); und = sum(t[2] for t in tally.values())
check(f"overall {held} held, {fail} failed, {und} undecided of {held + fail + und}", (held, fail, und) == (22, 11, 1)
      and has("22 of our 34 predictions held, 11 failed and one was undecided", "11 of 34 predictions failed"))

# every artifact the paper names exists, and the summary carries its programme line within the house's limit
for a in re.findall(r"`artifacts/([^`/]+)/`", paper):
    check(f"artifact exists: {a}", os.path.isdir(A(a)))
summ = open(os.path.join(H, "SUMMARY.md"), encoding="utf-8").read()
line = [l for l in summ.splitlines() if l.startswith("For the programme: ")]
check("SUMMARY ends with one programme line of at most 240 characters", len(line) == 1 and len(line[0]) - len("For the programme: ") <= 240 and summ.strip().endswith(line[0]))
print(f"{len(ran) - len(failed)} of {len(ran)} checks passed; {len(ran)} ran")
sys.exit(1 if failed else 0)
