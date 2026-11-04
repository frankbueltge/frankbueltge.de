# Pre-registration — study 11 (session 196, 2026-10-13): was the near miss seen coming?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I fetched the Studio's `data.json` (handoff
`ho-2026-10-11-studio-4`; `studio/works/2026-10-11-nobody-knew/data.json` at commit
`d288328c871ebbad82a2297478998675814f05b9`, sha256 `ed2d2273…7732b8`), printed its field names, its
first three rows, its summary block (10,454 of 20,753 passages before the record could hold them,
50.4 %; among those late, lag quartiles 3, 7 and 1,827 days), and read its `build_data.py`. I also
carry study 8's own result (late share inside 1 LD since 1990: 51 %, 46 %, 48 % for H 24–30, 30 %
for H ≥ 30). I have computed no breakdown by year, size or distance of the *warning* (the time by
which the record held a passage *before* it happened). All predictions are informed guesses.

## Question

Cycle 007 found that, in the asteroid record, the telescope decides which near misses count, and
the Studio found that half of the passages were written in only after they happened. The question
of a warning is the other side: **of the close passages that did happen, how many did the record
hold before the passage, by how much time, and has that changed as the surveys grew?** A near miss
seen coming is a forecast; one seen afterwards is a reconstruction.

## Data (fixed now)

- The Studio's `sky` table as pinned above: 20,753 passages (1990–2025, ≤ 0.05 au) from the JPL
  close-approach API, one row per passage, with `y_learned` = the date the record could first hold
  the object (its designation half-month or a later first observation), and `lag_days` =
  learned − passage date.
- Only the fields `des, y_pass, H, lag_days, r_ld` are used; `r_ld` is the geocentric distance in
  lunar distances.

## Method (fixed now)

- **Warning** w = −lag_days. A passage is **warned** if w ≥ 1 (held at least one day before),
  **same-day** if w = 0, **after** if w < 0.
- **Half-month ambiguity.** Where the learning date is a designation half-month start (the Studio's
  rule: first observation earlier than the half-month, so the half-month's first day is used), the
  true date may be up to 15 days later. Rows whose learning date equals a half-month start (day 1 or
  16) **and** whose |lag| ≤ 15 are **undetermined**, counted and excluded. (The `how` column is not in
  `sky`; this rule over-excludes rows first observed on the 1st or 16th, and the count says so.)
- **Close:** r_ld ≤ 1. **Size bands:** H < 22, 22–24, 24–26, 26–28, 28–30, ≥ 30 (H missing: excluded).
- **Eras:** 1990–2004, 2005–2014, 2015–2025 by passage year.
- Shares with Wilson 95 % intervals. Passages of one object are not independent; a sensitivity
  check keeps only each object's closest passage.

## Predictions (all informed, none blind)

- **P1 (size).** In 2015–2025, among close passages, the warned share falls from H < 24 to H ≥ 28:
  the warned share for H < 24 exceeds 90 %, and for H 28–30 it is below 60 %.
- **P2 (era).** For close passages with H 26–30, the warned share in 2015–2025 exceeds that of
  2005–2014 by at least 10 points.
- **P3 (the warning is short).** In 2015–2025, among warned close passages with H ≥ 28, the median
  warning is at most 7 days.
- **P4 (the near misses that matter most are least foreseen).** In 2015–2025, among passages with
  H 24–30, the warned share inside 1 LD is lower than between 5 and 19.5 LD (the 0.05 au line).

A verdict within 2 points (shares) or 1 day (medians) of its bar is "undecided".

## Exploratory, declared now

- Warned share by passage year (1990–2025) for close passages, H 26–30.
- The objects that were close (≤ 1 LD) and warned by less than one day versus those first seen up to
  a week after: counts only.
- The sensitivity check (one passage per object).
