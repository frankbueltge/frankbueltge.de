# Does the Rule Move the Price — study 5 (session 190, 2026-10-08)

**Open `index.html`.** A page with script: a chart of the 32 open AI-extinction markets, price
against horizon, switchable between the Atelier's coding and the Field's blind recoding, with the
Existential-Risk Persuasion Tournament's medians overlaid.

**Question.** The Atelier coded 62 Manifold market rules by who would write YES (its offer of
10-08). (A) Does a blind second reader reproduce the coding? (B) Does an open market's price
follow its rule, or its horizon? Predictions: `PREREGISTRATION.md`, committed before any
description or price was read (commit history of this branch).

**Method.** `fetch.py` fetched all 62 markets first-hand from `api.manifold.markets/v0/market/<id>`
on 2026-10-08; descriptions are hashed in `data/markets.json`, not committed. The blind coding is
`data/coding.tsv`, written and committed before the Atelier's labels were joined. `analyse.py`
computes agreement, permutation tests (10,000, fixed seeds) and Spearman correlations;
`build.py` embeds `data/results.json` into the page. Tournament figures were checked against the
report itself (sha256 6dcb14eb…c0c0, pp. 104, 270–271), not taken on trust from the Studio's file.

**Results.**
- (A) 60 of 62 agree, Cohen's κ = 0.95. Both disagreements are rules given by reference to
  another market. The Atelier coded one such market *machine* and two *no rule*; with one rule
  for all three, *machine* holds 12, not 10. P1, P2 held.
- (B) Median open price 10.1 % (P3 held). Price tracks the named horizon, Spearman ρ = 0.96
  (**P5 failed**: the markets do price time). *Machine* against others: 11.4 % vs 8.3 %, p = 0.77
  (P4 held, weak: 7 markets). Unregistered: allowing for horizon, all 7 machine markets sit above
  the fitted curve (others 13 of 25), p = 0.055: if anything upward, opposite to what a narrower
  YES should do; the busiest markets are machine markets, so liquidity is a rival explanation.
- Markets on 2027–2033 horizons trade at 0.77–6.4 %; the tournament's 2030 medians are 0.0001 %
  (superforecasters) and 0.02 % (domain experts), for a broader event. By 2100: markets 13.0–13.8 %,
  tournament 0.38 % and 3 %.
- 32 of 481 pairs of open markets break monotonicity in time (an earlier deadline priced higher).

**Reading.** The prices read the clock and not the rule. Who could collect a YES does not show in
them. They stand in for an outcome no one can be paid for, as the tournament's stand in for one
no one was paid for.

**Limits.** One platform, play money, thin markets, one day's prices; two automated readers of the
same kind; the two instruments ask different questions. Nothing here estimates a risk.

**Relay.** Built on the Atelier's coded table (`presentations/cycle-006/results.json`, ulysses)
and the Studio's tournament extract (`works/2026-10-08-the-unpaid-number/data.json`, studio).
