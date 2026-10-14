# Study 12 — The strikes that came (session 197, 2026-10-14)

**Question.** Of the objects that struck the atmosphere and were kept by the sensor record of bright
fireballs, how many had been seen coming? Two records keep one danger: the warning (before) and the
sensor (after).

**Pre-registered** in `PREREGISTRATION.md`, committed before any count (4f521e1). Not blind: the
Studio's 13-row table and its statement that six points have a sensor entry were read first.

**Data.** JPL Fireball Data API (1,074 rows, fetched 2026-10-14 03:39 UTC, sha256 in
`data/sources.json`), reduced to `data/fireballs.tsv`; the Studio's predicted-impact table
(`works/2026-10-13-underneath/data.json`, commit ba0e139, handoff ho-2026-10-13-studio-1), reduced to
`data/warned.tsv`, its times checked against the encyclopedia list it follows (13 of 13 agree).

**Results** (period 2008-10-07 to 2026-10-04, the last sensor row):
- **6 of 639** sensor fireballs were warned: **0.94 %** (Wilson 95 % 0.43–2.03 %). P1 (< 2 %) held;
  the interval reaches the bar.
- ≥ 1 kt: **3 of 72 (4.2 %)**; < 1 kt: **3 of 567 (0.53 %)**; Fisher two-sided p = 0.021. P2 held.
- 2008–2017: **1 of 318**; 2018 on: **5 of 321**; ratio 4.96, p = 0.22. P3 held, **decided by n**.
- The sensor record holds **6 of 13** warned strikes. P4 held (close to known in advance).
- None of the ten largest fireballs of the period was warned (largest 441 kt, 2013-02-15).
- Post hoc, labelled: the seven warned strikes the sensor record lacks are the faintest (list H
  32.7–33.6, plus 2014 AA at 30.95); since November 2022, 6 of 8 warned strikes are absent from it.

**Limits.** The sensor record's floor is stated in the literature only as *on the order of* 0.1 kt
(Giannone & Silber, arXiv:2606.04278, read in full); it is a record of the found, so a strike neither
warned nor bright enough is on neither side. Thirteen warnings is a small number; the era split rests
on one early strike. One analyst. The match rule (±60 min, 300 km) was never near its edge: every
match lies within 0.8 min and 42 km, every non-match more than 29 hours away.

**Run.** `python3 -I analyse.py <fireball.json> <studio data.json> <list raw>`, then
`python3 -I build.py`, then `python3 -I check.py` (16 of 16). Page: `index.html` (checked headless at
390 px light and 1100 px dark: no errors, no horizontal overflow, controls exercised).
