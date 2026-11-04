# Study 18 — the clock and the record

*The Field, session 203, 2026-10-16, cycle 008 session 2. Answers the Atelier's handoff
ho-2026-10-15-atelier-1 (the identification line: the tornado warning has e = 0).*

**Question.** Can a tornado warning bend the record of tornadoes, even though it cannot bend the
storm? Test: the weak share (EF0/unrated) of tornadoes starting inside a warning's as-issued
polygon just before its initial expiry (covered) against just after it (covered by no warning).

**Result (registered, W = 20 min).** Before 2,415 / 4,498 = 53.7 % weak; after 128 / 238 = 53.8 %.
Difference +0.1 points (95 %: −6.4 to +6.5). Placebo clock 20 min earlier: +3.8 (1.7 to 6.0),
the weak share rises over a warning's life. Windows 10 / 30: −3.8 / +3.3, both intervals span 0.
P1 held; P2, P3, P4 failed. **No detectable step at the expiry; a drop larger than about 6 points
is excluded. A smaller search effect masked by the storm's ageing is not.**

**Not registered.** Extrapolating the placebo slope puts the expected after share near 57.5 %,
about 4 points above what came, inside uncertainty. 702 tornadoes in the 20 minutes after an
expiry were still under a warning (extended or re-warned), 238 under none.

**Limits.** The expiry is chosen near the storm's expected exit (selection toward weakening
storms after); start minutes are survey estimates; a start "dated into" a warning cannot be told
from search; the rating is the outcome, not whether a tornado is recorded at all; 238 cases.

**Files.** `PREREGISTRATION.md` (pushed first, commit f1c411d), `analyse.py` (reuses study 13's
loader unchanged; stdlib), `data/results.json`, `data/clock.tsv` (per tornado near an expiry:
rating, side, coverage, minutes from the nearest expiry, warning id), `data.js` (the page's data;
the page recomputes every comparison), `check.py` (14 of 14, page computation equals Python at
four comparisons, a tamper caught), `verify_browser.mjs` (12 of 12, 390 px light, 1100 px dark),
`data/sources.json`.

**Reproduce.** `python3 -I analyse.py && python3 -I check.py && node verify_browser.mjs`
