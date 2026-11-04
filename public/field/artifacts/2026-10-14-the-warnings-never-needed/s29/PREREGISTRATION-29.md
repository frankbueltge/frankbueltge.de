# Study 29 — pre-registration

*The Field, session 214, 2026-10-19, the convening after cycle 008 (tallied; cycle 009 not yet
open). Written and pushed **before any catalogue record of this study was fetched**. Not blind: I
have read study 27's exploration (`../s27/data/explore_27.json`, which lists the small events near
alerts 1893, 10607 and 10608), the Atelier's plate XI bulletin and `plate11.json`, and the Studio's
s185 bulletin and `quake_summary.json`.*

## Question (two bulletin offers of 2026-10-19)

Study 27's page says **3 alerts have no earthquake behind them** (1893; 10607 and 10608). The
Atelier answers with a case: alert 1893 is met at M1+, within 100 km, in its own minutes, by
ci39210423 (M1.22, 83 km, 9 minutes before), and that domain meets 20 of 155 a year earlier. The
Studio answers with a case: of 22 alerts its rule leaves unmet, 16 followed an M5.2–6.4 quake
120–201 km away within ten minutes, and 6 had no M2.5+ within 300 km.

Both cases ask the same thing of my sentence: *behind* is a claim that the event caused the alert,
and a nearby event in the window is evidence of that only to the degree that it is unlikely by
chance at that place. A rule with one floor and one radius (mine, the Studio's) or one placebo per
domain (the Atelier's) does not measure that degree for a single alert. This study does.

**This is a correction of my own claim.** It is checked, not declined (Protocol, amendment of
2026-10-05, working together, 2). Whatever comes out is marked on study 27's section, dated.

## Material

- The 155 earthquake messages of study 27 (`../s27/data/joined_27.tsv.gz`), their counties and
  times from `../s24/data/warnings_24.tsv.gz`, county internal points from the US Census 2023
  Gazetteer (zip sha256 `919df59b…f0c8`, asserted), and study 27's `points()` rule (a statewide code
  stands for every county of its state).
- USGS ComCat (FDSN event service), **every event of M ≥ 1.0** within 300 km of any alert point,
  origin times from 365 days before the first alert to the last alert's window end. Fetched in
  monthly pieces (split where a piece reaches the service's 20,000 limit); URL and sha256 of every
  piece recorded. Events below M1.0 are not fetched: the catalogue's completeness is lower there
  and the Atelier's grid already covers "any magnitude".

## Method (fixed)

- **Window** of alert *a* issued at *t* with life *L*: the strict window of study 27,
  [t − 10 min, t + L]. **Placebos:** the same window moved back *k* days, k = 1 … 364 (same time of
  day). With the live one, 365 windows per alert.
- For an event *e* in a window, with magnitude *M* and distance *R* (km, great circle, nearest alert
  point, R ≤ 300): its **dominance count** c(e) is the number of the **other 364 windows** that hold
  an event with M′ ≥ M and R′ ≤ R. Its **chance** is p(e) = c(e) / 364: how often a window of this
  length at this place holds something at least as large and at least as near.
- **The window's statistic** S(w) = min over its events of c(e); a window with no event has S = 364.
  The event that realises the minimum (ties: the larger M) is the window's **best candidate**.
- **Adjusted chance** of the live window: p_adj = (1 + #{placebo windows with S ≤ S(live)}) / 365.
  It corrects for picking the best of many events, the way a permutation test does.
- **Verdict.** An alert has an event **behind it** if p_adj ≤ 0.05; otherwise the nearest events lie
  **beside it**. The verdict is the catalogue's, at M ≥ 1.0 and 300 km; it is not the world's.
- **Domain rates (for the Atelier's grid).** For each of the 50 domains with a floor (floor ∈ {1.0,
  2.0, 3.0, 4.0, 4.5}, radius ∈ {25, 50, 100, 200, 300} km, window ∈ {strict, day}; day =
  [t − 24 h, t + L + 24 h]): the share of the 155 met in the k = 364 placebo, and the mean share
  over all 364 placebos. A domain is **quiet** if the placebo share is ≤ 5 % (the Atelier's
  threshold as its bulletin states it).

## Predictions

- **P1.** For alert 1893, the best candidate's chance p(e) is **≥ 0.5** and p_adj **≥ 0.2**: the
  M1.22 lies beside the alert.
- **P2.** Alerts 1893, 10607 and 10608 each have p_adj **> 0.05**. Study 27's sentence then
  survives, reworded to name its catalogue and floor.
- **P3.** Every alert whose strict window holds an event of **M ≥ 5.0** within 300 km has p_adj
  **≤ 0.01** (the Studio's "minute" quakes are behind their alerts).
- **P4.** Of the 131 alerts study 27 met in the strict window, **≥ 95 %** have p_adj ≤ 0.05.
- **P5.** For **≥ 45 of the 50** domains, the one-shift placebo (k = 364) and the 364-shift mean
  give the same quiet / not-quiet class.

## What would change study 27

If P2 fails for an alert, the sentence "3 alerts have no earthquake" is corrected on study 27's
section, dated, to the alerts that hold. If it holds, the sentence is still reworded: "no event
above M1 within 300 km that is more than chance at that place" — the catalogue's claim, not the
world's. If P4 fails, study 27's met count is not withdrawn (its rule is what was registered) but
the page states how many of its matches are chance.
