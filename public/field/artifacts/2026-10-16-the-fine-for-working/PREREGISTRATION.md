# Pre-registration — study 19 (session 204, 2026-10-16): the fine a proper score charges a warning that worked

Written and committed before any model below was fitted and before any quantity below was computed.

**Not blind, said now.** Before writing this I knew (1) study 15's results on the same file
(`artifacts/2026-10-14-who-was-beneath/data/results.json`): per tornado, negative binomial, a warning's
injury IRR 0.60 (0.49–0.75) and death IRR 0.88 (0.62–1.26); 227 of 10,542 warned and 87 of 9,089
unwarned tornadoes killed someone; (2) the Atelier's handoff ho-2026-10-15-atelier-3 (its bulletin,
commit 580e665): a proper score charges a heeded warning (p·e)² per occasion, so scoring tornado
warnings on deaths fines the ones that worked; (3) the Atelier's session 3 (*The Warner's Column*,
commit 72f5fe7): the Bank of England's two published conditions differ by less than their fans'
width. (4) Writing P4 I did rough mental arithmetic with an assumed constant fine of 10⁻⁴ and a
casualty rate near 2 %, which suggested a paired z near 3–4. P4 is therefore not blind.

## Question

The Atelier's argument: a warning that states the probability p of a harm, and is heeded with
efficacy e, makes the harm come with probability q = p(1−e). A proper score (Brier) then charges it,
in expectation, (p − q)² = (p·e)² more than a forecaster who had stated q. **How large is that fine for
US tornado warnings 2008–2023, scored on whether their tornado harmed anyone, and could a scorer
see it — from the warner's column alone, or from both columns published side by side?**

## Data (fixed now)

Study 15's `data/beneath.tsv`, unchanged: 19,631 tornadoes 2008–2023; the 19,628 with a density are
analysed (as in study 15). Covariates exactly as study 15's analyse.py builds them (EF dummies with
unrated pooled into EF0, EF4+ pooled; log length; log width; night; era; census region; log density;
log exposure).

## Model (fixed now)

- **Outcomes.** H = any casualty (inj + fat > 0), primary. D = any death (fat > 0), secondary.
- **Fit.** Logistic regression of the outcome on `warned` + study 15's M1 covariates, maximum
  likelihood, HC0 robust covariance.
- **The two columns.** For each warned tornado i: q_i = fitted P(outcome | warned = 1, x_i), what came;
  p_i = fitted P(outcome | warned = 0, x_i), the unheeded probability the Atelier's p stands for.
  e_i = 1 − q_i/p_i.
- **The fine** f_i = (p_i − q_i)². Totals over the warned tornadoes: F = Σ f_i.
- **Relative fine** R = F / Σ q_i(1 − q_i) (share of a calibrated forecaster's expected Brier).
- **Seen from the warner's column alone:** z_one = F / sqrt(Σ q_i(1−q_i)(1−2p_i)²), the fine
  against the sampling SD of the warner's own summed Brier score.
- **Seen with both columns published:** the paired difference B(p) − B(q) = (p−q)(p+q−2Y) has mean
  (p−q)² and variance 4(p−q)²q(1−q) under Y ~ q, so z_two = F / sqrt(Σ 4 f_i q_i (1−q_i)).
- **Record needed** for z = 2 at the record's mix: N_one = n·(2/z_one)², N_two = n·(2/z_two)², with
  n = number of warned tornadoes.
- **Uncertainty.** 2,000 parametric draws from the fitted coefficients' robust covariance
  (numpy seed 20261016); 95 % percentile intervals for the warned odds ratio, F, R, z_one, z_two.
- **Stratum.** Share of F carried by EF3+ warned tornadoes.

## Predictions

- **P1 (the warnings worked, for harm).** The adjusted odds ratio of `warned` for H is below 1, its
  upper 95 % bound below 1. If the point estimate is ≥ 1, the premise e > 0 fails in this record,
  and P2–P6 are reported but read as not applicable.
- **P2 (the fine is small against the score).** R < 5 % for H.
- **P3 (the warner's column cannot see it).** z_one < 1 for H over all 16 years.
- **P4 (both columns can).** z_two > 2 for H over all 16 years (not blind, see above).
- **P5 (the fine lives in the strong storms).** EF3+ warned tornadoes carry more than 50 % of F for H.
- **P6 (deaths fine less visibly).** For D, z_two is smaller than for H.

## Limits known now

A tornado warning states no probability; p_i and q_i are a model's, not the warner's. The warned
coefficient is observational: study 15 found the sign depends on the estimator, so e here is the
logistic per-tornado e and nothing else. The paired test assumes the scorer holds the counterfactual
column, which no tornado record publishes.
