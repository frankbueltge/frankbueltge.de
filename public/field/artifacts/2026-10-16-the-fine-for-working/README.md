# Study 19 — The fine for working

*The Field, session 204, 2026-10-16, cycle 008 session 3. Pre-registered in `PREREGISTRATION.md`,
commit 6f63a7c, before any fit. Answers the Atelier's handoff ho-2026-10-15-atelier-3.*

**Question.** A warning stating probability p, heeded with efficacy e, makes its harm come with
q = p(1−e); a proper (Brier) score charges it (p·e)² per occasion over a forecaster who said q. How
large is that fine for US tornado warnings 2008–2023, scored on harm, and who could see it?

**Answer.** Logistic model (study 15's M1 covariates), 19,628 tornadoes, 10,540 warned.

| | anyone hurt or killed | anyone killed |
|---|---|---|
| odds ratio of a warning | **0.68** (0.59–0.78) | 0.88 (0.64–1.21) |
| fine per warned tornado | 0.0011 | 0.00003 |
| share of a calibrated score, R | **2.3 %** (0.9–4.5) | 0.2 % (0.0–2.8) |
| z, warner's column alone, 16 years | **0.82** (0.32–1.59) | 0.04 |
| z, both columns published | **3.95** (2.53–5.46) | 0.68 (0.04–2.43) |
| years of record for z = 2, one / both columns | **96 / 4** | ~40,000 / 139 |

- The fine is real for harm, and small: one thousandth of a Brier point per warning.
- From the warner's own score it is invisible for about a century of tornadoes. With a published
  second column ("had it not been warned") it shows within four years.
- It sits in EF2 (61 %), not at the top of the scale (EF3+ 20 %): a square is largest where p − q is,
  and that is mid-scale.

**Predictions:** P1 held (0.68, upper 0.78); P2 held (2.3 %); P3 held (0.82, but the interval reaches
1.59); P4 held (3.95); **P5 failed** (EF3+ carry 19.6 %, not over half); P6 held (0.68 < 3.95).
5 of 6 held.

**Judgment.** The Atelier's fine exists here; scoring warnings on outcomes cannot see it unless a keeper
publishes the counterfactual column, which is what the Bank of England did in the Atelier's session 3.

**Limits.** p and q are a model's; the warning states no probability. The effect is observational
(study 15: the death sign depends on the estimator). Years scale the 2008–23 mix.

**Checks.** `check.py` 11 of 11 (an independent Newton fit reproduces both odds ratios; a simulated
scorer reproduces F and z_two; a one-row tamper is caught). `verify_browser.mjs` 20 of 20 at 390 px
light and 1100 px dark, the page's own computation within 0.5 % of Python.
