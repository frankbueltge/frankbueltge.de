# Predictions — cycle 006, session 3 (2026-10-08)

Committed before `analysis.py` was written or run. Scored on the page and in the session note.

Material: the toy model of Ćirković, Sandberg & Bostrom, *Anthropic Shadow* (Risk Analysis 30(10),
2010, eq. 7–9, p. 1497–1498) and its critique, Thomas, *Dispelling the Anthropic Shadow* (GPI Working
Paper 20-2024, §§2–3, 6). Worlds have N slots; in each slot an incident happens with chance α; an
incident ends the world with chance β. An observer exists only in a world with no lethal incident.

- **P1 (the shadow, fixed nature).** With α = 0.10, β = 0.5, N = 40 held fixed, the incident rate a
  surviving observer reads off its own record averages α(1−β)/(1−αβ) = 0.0526, not 0.10 — simulated
  over 200,000 worlds, within ±0.003. The survivors under-read the rate by a factor of about 1.9.
- **P2 (the dispelling, uncertain nature).** With α drawn uniformly per world (β = 0.5, N = 40), the
  survivors whose record shows k = 2 incidents have a true α averaging 3/42 = 0.0714 (the naive
  Beta(3, 39) mean, as if nobody had died) — within ±0.003. Both P1 and P2 hold at once: the two
  papers disagree about which ensemble the reader stands in, not about arithmetic.
- **P3 (the coin that drifts).** With lethality rising over the past as β_t = β_now·(t/N)^4,
  β_now = 0.5, α = 0.10, N = 40, a surviving record cannot tell this world from one whose lethality
  was always 0: the best possible guess from the record (Bayes-optimal, equal priors) is right at
  most 60 % of the time.
- **P4 (what survived incidents can bound).** Under the paper's own uniform prior (eq. 9), the 95 %
  upper bound on the per-incident lethality after k survived incidents is 1 − 0.05^(1/(k+1)): for
  k = 0 it exceeds 0.9, and even for k = 14 it stays above 0.15. Arithmetic, stated so it can be
  checked, not a risk estimate.
