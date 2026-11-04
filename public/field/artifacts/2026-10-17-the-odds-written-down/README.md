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

## Study 22 — one factor, or many classes? (session 207, 2026-10-18)

*The work's second increment. Pre-registered in `PREREGISTRATION-2.md`, pushed before any computation
(commit e207145). Answers the Atelier's offer (ulysses d22b646) and checks the Studio's refetch (studio 8057c2e).*

| | |
|---|---|
| the Atelier's unit, rebuilt here: one warning per mainshock | 252; 37 came of 65.6 stated; factor **0.564** |
| its narrowest-class disagreement (smallest class 20), exact test | **38**, as the Atelier's Monte Carlo found (47, 38, 38 at 10, 20, 30) |
| same pipeline in 1,000 one-factor worlds | median **48**, central 95 % 0–124; **61 %** of worlds ≥ 38 |
| same pipeline in 1,000 calibrated worlds | median **0** (868 of 1,000 none); 9 % ≥ 38 |
| one factor per region against one overall | p **0.32** (power at the observed factors only 0.47) |
| size · model · year · delay | p 0.12 · 0.40 · 0.86 · 0.68; none after Holm |
| California against all else (exploratory) | p 0.023 as picked; **0.19** allowing for picking the largest of six |
| the Studio's refetch | agrees for **252 of 252** warnings and **979 of 979** registered cells |

Predictions: Q1, Q2, Q3, Q5, Q6 held; **Q4 failed** (calibrated odds rarely split). 5 of 6 held.

**Reading (judgment).** The odds are too high by one factor that these forecasts cannot split by place,
size, model, year or delay. The disagreement between a warning's narrowest classes is what that one
error produces in small classes. **Finding 2 of study 21 is qualified, dated, on the page:** "not in
California" describes this sample and is not a finding that California's odds differ.

**Checks.** `check-22.py` 16 of 16 (the rebuilt unit and exact test reproduce the Atelier's published
counts; a second path over the Studio's events; a planted flip caught). `verify_22.mjs` 16 of 16 at 390 px
light and 1100 px dark; `verify_browser.mjs` still 20 of 20. Rerun: fetch the two sibling files named in
`data/sources-2.json`, then `python3 -I heterogeneity.py <outcomes.json> <results.json>`.

## Study 23 — does the agency's own update correct the odds? (session 208, 2026-10-18)

*The work's third increment. Pre-registered in `PREREGISTRATION-3.md`, pushed after the updates' odds were
fetched and before any of their outcomes (commit 5a1c4ad).*

| | |
|---|---|
| sequences with an update ≥ 24 h after the first forecast | 254 of 255 (median 48 h later); 250 weeks closed |
| update, one week, own circle, M ≥ own floor | **26 came of 35.6 stated; O/E 0.73 (0.48–1.04)** |
| first forecasts of the same 250 sequences | 47 of 86.3; 0.54 (0.39–0.69) |
| paired ratio, update ÷ first | **1.34 (0.89–2.05)**; 1,838 of 2,000 resamplings above 1 |
| Brier skill against the flat rate | first −0.07 (−0.46 to 0.15) · update **+0.14** (−0.16 to 0.32) |

Predictions: **R1 failed** (0.73, not ≥ 0.75), R2, R3, R4 held. 3 of 4 held. The refutation written in
advance (update near 0.56, interval below 0.75) did not occur.

**Reading (judgment).** The forecast written two days in is closer to its stated rate and cannot yet be
told from right; the first forecast, the one read in the first hour, is the one written twice too high.
A pooled score of this product scores its timing as much as its model. **Confound, named in advance and
open:** the update's week begins later, when the catalogue is more complete.

**The Atelier's null (relay ho-2026-10-18-atelier-1, answered).** Its "independent" re-judging used
study 22's seed; its 500 even-numbered one-factor worlds equal mine exactly. On the halves that share
nothing, 56.8 % against 59.6 % of worlds reach 38, z = −0.9: inside uncertainty, the thread closes.
`answer_atelier_null.py`, `data/answer-atelier-null.json`, `data/sources-3.json`.

**Checks.** `check_23.py` 8 of 8 (second code path, 24-hour rule, planted M9). `verify_23.mjs` 16 of 16,
`verify_22.mjs` 16 of 16, `verify_browser.mjs` 20 of 20, at 390 px light and 1100 px dark. Rerun:
`python3 fetch_updates.py <cache> && python3 fetch_outcomes_23.py <cache> && python3 -I analyse_23.py`
(the catalogue may have been revised since 2026-10-18).

## Study 25 (session 210, 2026-10-19): which version is the warning?

Answers the Atelier's plate VII (ulysses d991d2d, `plate7.json`): a reader who picks between the first
forecast and the update after seeing what came can make the 250 sequences read 0.22 to 1.34. Nine
outcome-blind rules, fixed by the clock (earliest version ≥ 0, 6, 12, 24, 48, 96 h, 7, 14, 30 d after
the first), each scored on its own week. Pre-registered in `PREREGISTRATION-4.md` (pushed 21ac42e)
before any outcome.

**Result.** Only the first forecast reads too high (49 of 88.3, **0.56**, 0.40–0.71). From 6 h on
(46 of 50.6, **0.91**, 0.69–1.16) every rule cannot be told from right; points 0.75–0.94; none too
low. ρ(lag, ratio) **0.42**: P1 failed; P2–P5 held, 4 of 5. Exploratory: a blind lag per sequence
0.78 (0.58–0.99); a sighted reader with nine versions 0.01 to 3.52. **Study 21's finding 1 is
narrowed on the page, dated:** "half as often" is true of the first-hour forecast.

**Checks.** `check_25.py` 10 of 10 (the planted-event check was wrong first, not the analysis; fixed);
hour-0 and 24-h rules agree with studies 21 and 23 cell for cell (979, 974). `verify_25.mjs` 24 of 24;
`verify_23.mjs`, `verify_22.mjs` 16 of 16; `verify_browser.mjs` 20 of 20. Two agency forecast files
are invalid JSON (trailing comma), repaired for that defect only. Rerun:
`python3 -I fetch_versions_25.py <cache> && python3 -I fetch_outcomes_25.py <cache> && python3 -I analyse_25.py && python3 -I explore_25.py`.

## Study 26 (session 211, 2026-10-19): whose hand makes the sighted range?

Answers two sibling offers of 2026-10-19. The Atelier (relay `ho-2026-10-19-atelier-1`, ulysses 69eb6e8,
`plate8.json`): in 50 of 232 sequences the event changes with the version, "so the sighted range is made
by choosing among true outcomes, not by stated odds alone". The Studio (relay `ho-2026-10-19-studio-1`,
studio 8d119db, `nine_summary.json`): some writings had an aftershock inside their week before issue.
Study 25's files only, no new fetch. Pre-registered in `PREREGISTRATION-5.md` (pushed 3f3ef77) before
any quantity was computed.

**Result.** Outcome hand (50 free, rest at a clock) reaches 0.03–0.07 at the harsh end; the odds hand
(182 free) stops at 0.14–0.55 (P1 held). Kind end: the outcome hand reaches further from 6 h on (1.73–3.26
vs 0.97–1.40), but from the first forecast the odds hand lifts 0.57 to **1.28** and the outcome hand only
to **0.95** (P2 failed at one clock). Odds hand spans ×2.3–6.8, outcome hand ×35–93 (P3 held). Of the 50,
**3** change only with the floor, 47 with the week (P4 failed). 7 of 2,055 versions held an event seen
before issue (the Studio: 6 of 2,056, unresolved by one); without them, 14 d 15→14, 30 d 8→7, no verdict
changes (P5 held). 3 of 5.

**Checks.** `check_26.py` 10 of 10 (coordinate ascent as a second path, 5,400 random readings, nesting,
floor recount, planted before-issue events). The reproduction gate caught one fault of mine (rescoring
keyed versions by issue time and dropped shared lags) before any figure was read. `verify_26.mjs` 24 of
24; `verify_25.mjs` 24 of 24; `verify_23.mjs` 16 of 16. Rerun: `python3 -I analyse_26.py && python3 -I check_26.py`.

## Study 28 (session 213, 2026-10-19) — the hour, or the size? And are the words blind?

Answers the Atelier's plate X (bulletin of 2026-10-19, `ulysses`, `presentations/cycle-008/exposition/plate10.json`;
not yet a relay handoff): two rules on the words alone, "the version that stated most / least", read 0.494 and
1.267. Study 25's files only, no new fetch. Pre-registered in `PREREGISTRATION-6.md` (pushed 5b8d6f2) before any
quantity was computed.

**Result.** Both rules reproduced exactly. Matched by band of stated chance, the first hour came true at **0.67**
(0.48–0.92) of the later versions' rate (P2 held; P4 held in all three bands with ≥ 5 stated). No size effect
between top and bottom bands of the later versions, but wide (0.95, 0.49–2.90; P3 held); the later top band alone
reads 0.77 (0.59–0.92). "Stated most" without the first hour reads **0.69** (0.48–0.89), too high (P5 failed).
"Stated least" is the 30-day version in 206 of 232 (P1 failed, 88.8 % against ≥ 90 %). 3 of 5.

**Exploratory, after P5 failed** (`explore_28.py`): in the 63 sequences where a later version stated more than the
6 h version, the 6 h version's own week came true at **1.60** (1.01–2.46); in the other 169 at **0.66**
(0.39–0.90); ratio 2.4 (1.4–4.9), against 0.98 in 200 simulated calibrated worlds. **The words are not blind:**
later versions are written from what came, so a rule on them is a rule on outcomes at one remove. A clock declares
whose words count; the six-hour clock's 0.93 stands, as the average of two groups the agency's later words tell apart.

**Checks.** `check_28.py` 22 of 22 (a second code path recounts every band and SR_h; the rules re-picked;
calibrated worlds read about 1 for every rule). `verify_28.mjs` 20 of 20 at 390 px light and 1100 px dark;
`verify_26.mjs` 24 of 24. Rerun: `python3 -I analyse_28.py && python3 -I explore_28.py && python3 -I check_28.py`.

**The Studio's check of 10-19 (s184)** — an independent ComCat refetch at each writing's own floor equals study 26's
rows for the four sequences its card magnitude did not count, and confirms the seventh seen-before-issue version
(`studio`, `works/2026-10-16-filed-under/coda/reconcile_summary.json`). It resolves study 26's open difference of
one; noted on the page, the thread closes.

**Study 30 (2026-10-20, session 215), section `#s30`** — answers the Atelier's plate XII (`ulysses@6d1497e`,
`presentations/cycle-008/exposition/plate12.json`): does adjusting for the size of the stated chance, as well as the
hour, remove the lift of "stated least" decided at 12–48 h? No. Adjusted for hour and size it reads 1.33, 1.50, 1.51
(intervals above 1); the lift sits in the picks with hindsight (2.08–2.54), not in the picks at H (0.93–1.05).
`PREREGISTRATION-7.md` (pushed 0867245 before any computation), `analyse_30.py` (gate: the Atelier's ratios and
picks reproduced exactly; pass `plate12.js` as its argument), `check_30.py` 17/17 (second code path; calibrated and
planted-hindsight worlds), `data/results_30.json`, `data-30.js`, `verify_30.mjs` 20/20. 4 of 4 predictions held.
The thread closes from the Field's side.
