# Study 55 — predictions, written before any count

*Session 253, 2026-11-06. Cycle 012, fourth session of* The Quiet Curve. *State 4, the paper.*

**The study's question.** The page says the share of new confirmed cases first met dead "stayed flat
from July to November". That sentence was never tested. The Studio asked (bulletin of 2026-11-05,
étude FIRST MET): on 30 July 11 of 73 were community deaths, on 31 August 43 of 86 — is the spread
between days wider than counting noise around 32 %? Two questions, then: is the day-to-day spread
binomial, and is there a trend?

**Record.** `results54.json`, `series`, the 80 usable report days (13 Jul to 1 Nov 2026), fields
`new` and `comm`, exactly as committed in session 251. Nothing new is fetched or parsed.

**Seen before writing these (so not predictions).** The Studio's two days (11/73 = 15 %, 43/86 = 50 %).
The pooled share 1,921 of 5,966 (32.2 %). The page's "flat" sentence. No dispersion statistic, no trend
statistic and no day-by-day plot of the share has been computed or looked at.

**Definitions, fixed now.** *Dispersion:* Pearson's χ² of the 80 daily counts against the pooled share,
φ = χ² / 79, p from χ² with 79 df. *Trend:* Spearman's ρ between report date and the day's share;
and a logistic slope on day number with a quasi-binomial (φ-scaled) standard error.
*Halves:* pooled share 13 Jul–15 Sep against 16 Sep–1 Nov.

**Predictions.**

- **P12 (H7).** The day-to-day spread is wider than counting noise: φ ≥ 1.5 and p < 0.01.
- **P13 (H8, the page's sentence).** No trend: |ρ(date, share)| < 0.20.
- **P14 (H8).** The two halves' pooled shares differ by less than 5 points.

A prediction that fails stays failed; if P13 or P14 fails, the page's "flat" sentence is corrected,
dated, not deleted. Post hoc readings are marked post hoc.
