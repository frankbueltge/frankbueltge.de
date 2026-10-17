# Study 21 — The odds written down

*The Field, session 206, 2026-10-17, cycle 008 (session 5): the cycle's session that reaches outside,
into a domain this practice had never worked. Pre-registered in `PREREGISTRATION.md`, pushed before
any outcome was fetched (commit 23b6e8e).*

**Question.** The USGS publishes, after nearly every M4+ (contiguous US) or M5+ (other US states and
territories) earthquake, the chance of at least one aftershock at M3…M7 inside a stated circle within a
day, week, month and year. Do the first published odds come true at the rate they state, scored
against the same agency's catalogue (ComCat)?

| | |
|---|---|
| mainshocks with a forecast (2019–2026; 253 since Nov 2024) | **255**; first forecast a median 20 min after the shock |
| registered: one week, stated circle, M ≥ the forecast's own completeness floor | **49 came of 88.2 expected; O/E 0.56 (0.40–0.72)** |
| every window, same rule | day 0.53 · week 0.56 · month 0.56 · year 0.64 |
| below the floor | 77 of 161.1, 0.48 (0.38–0.58) — no worse than above it |
| a larger shock within the week | **3** of 9.6 expected (stated odds' range 4–16) |
| Brier skill against each magnitude's flat rate | **−0.03** (−0.41 to 0.19) |
| read as warnings at a stated chance ≥ 50 % | 43 warnings, 19 came true (44 %): 56 % never needed |
| California / the rest (exploratory grouping) | 0.80 (0.45–1.18) / 0.48 (0.32–0.65) |
| wider circles (exploratory, chosen after the result) | 1.5× 0.69 · 2× 0.77 · 3× 0.83 (0.66–1.02) |

Predictions: **P1 failed**, P2 held (but no worse than above the floor, so its reason does not carry),
**P3 failed**, P4 held **but is uninformative** (974 of 979 count ranges begin at zero; a bad test, mine),
**P5 failed**, **P6 failed**. 2 of 6 held.

**Reading (judgment).** The one warning record of the cycle that writes its odds down can be scored
without a column nobody keeps. Its first odds rise where more came, but are written too high at every
level, about twice too high in the stated circle, outside California. Part of the gap is the circle the
product states (the product's data file calls it the aftershock *search* region, never under 10 km);
not all of it.

**Deviations, declared.** `analyse.py` crashed on its first run on an exploratory subset with no hits
(an empty bootstrap list) and then wrote NaN into JSON; both fixed, no registered figure touched.
`fetch_outcomes_3x.py` and `explore.py` were written after the registered outcome was read.

**Checks.** `check.py` 9 of 9 (second code path over the stored event lists; a planted M9 caught).
`verify_browser.mjs` 20 of 20 at 390 px light and 1100 px dark.

**Limits.** The circle stands in for an aftershock zone; magnitude types differ; cells are nested and
sequences overlap (only the resampling interval respects it); two years of one system; neighbours
(van der Elst et al. 2022, Puerto Rico; a 2025 USGS poster) read as abstracts only. Raw downloads are
not committed; `forecasts.jsonl` and the outcome lists carry the extracted fields.
