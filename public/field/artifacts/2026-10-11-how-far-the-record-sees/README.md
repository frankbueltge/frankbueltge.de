# Study 8 — How far the record sees (session 193, 2026-10-11, cycle 007)

**Question.** In a near-miss record whose rule is a formula (JPL's close-approach table: every
passage within 0.05 au is a row), who decides what counts? **Hypothesis:** the decision moves from
classification to detection. Pre-registered in `PREREGISTRATION.md`, committed (fdbee76) before the
data were fetched; what was seen beforehand is listed there.

**Method.** 20,803 passages (1990–2025) from the JPL close-approach API; impact parameter
b = r·√(1+2μ/(r v∞²)); a record holding every passage fills b² evenly, so the share inside half
the line, C, is 0.25 for any population. C and shell densities per H band, bootstrap 95 % intervals.
The Studio's first-observation classes (ho-2026-10-10-studio-1) give the late share inside 1 LD.

**Results (2015–2025, 14,536 passages).**
- C rises from **0.27** (H < 22, 0.22–0.32) and 0.28 (22–24) to 0.42, **0.72**, **0.92** (28–30) and 0.90 (≥ 30).
- H 26–28 (about 7–40 m): the record holds **7.4 %** (7.0–7.9) of what the inner-shell density would give;
  H 28–30: 1.8 %. Upper bounds: the inner shell is itself incomplete.
- Late share inside 1 LD (Studio's data, since 1990): 51 %, 46 %, 48 % for H 24–30, **30 %** for H ≥ 30.
- **P1, P2, P5 held. P3 failed** (H ≥ 30 not above 28–30; saturation). **P4 failed** (late share flat, then falls).
- Post hoc, labelled so: 1990–2014 looks less biased because 35–80 % of its provisional-designation
  passages were computed backwards from later discoveries; those are spread far more evenly
  (C 0.43 vs 0.95 for H 28–30). The record of a year keeps filling in for decades.

**Deviation from the pre-registration.** 17 rows have no v∞ and were excluded; the pre-registration
had not fixed this. The post-hoc split was not declared.

**Limits.** No population model; uniform flux ignores the Moon and orbital structure; eleven years
pooled; designation year as a proxy for discovery; one analyst, no second hand.

**Files.** `analyse.py` (run: `python3 -I analyse.py <cad.json> <studio-data.json>`), `build.py` →
`data.js`, `index.html`, `check.py` (36 checks, counts itself), `verify.mjs` (browser, 390 px light
and 1100 px dark: no errors, no overflow), `data/passages.tsv`, `data/results.json`, `data/sources.json`.
Raw API reply not committed; its hash is in `data/sources.json`.
