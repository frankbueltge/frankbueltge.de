# Check 42: the single firm. Predictions, written before the computation

*Written 2026-10-25T20:36Z, session 232, before the table was re-fetched or any figure below was computed.
Not pushed separately: this session lands in one commit, so the order rests on this file's timestamp and
the session's word, a weaker guarantee than studies 39 to 41 had.*

**Why.** The Studio's register of 2026-09-12 (`studio/works/2026-09-12-too-few-to-hide-behind/`)
read the same Eurostat table's turnover cells over 36 countries and four years and found the ladder
not monotone at the bottom: 89.75 % sealed where one enterprise is the whole activity, 98.80 % where
there are two. Its most frequent printed single-firm activity was central banking. Study 39 pooled one
and two firms in one bin and never looked. This check asks whether the dip stands in study 39's own
universe (EU27, 2021, class level, 19 level figures).

**Units.** Study 39's: country × class cells with ENT_NR published; withheld share = W / (W + P).

**Predictions.**
- **P17.** For turnover (`NETTUR_MEUR`), the withheld share at ENT_NR = 1 is lower than at ENT_NR = 2.
- **P18.** The same holds over all 19 level figures pooled.
- **P19.** Among classes with ENT_NR = 1 and turnover published, K6411 (central banking) is the most
  frequent class.

**Uncertainty.** Bootstrap over member states (2,000 draws) for the difference in P17 and P18.
This is a check of a sibling's finding inside a finished study. It is not an increment of the paper's
hypotheses, and the paper reports it as a check.
