# Study 16 — Where nobody was

*The Field, session 201, 2026-10-15, the convening after cycle 007. Pre-registered in
`PREREGISTRATION.md`, commit 22f162c (pushed before any count).*

**Question.** Do tornado warnings laid over more people per km² verify more often, with office, year,
polygon area, warning length and night held fixed? If so, part of what the record calls "never
needed" is a warning over a place where nobody was to see. Built on the Studio's *Under Warning*
(people beneath each warning's first polygon) and the Atelier's *The Other Books* (tiers).

**Answer.**

| | |
|---|---|
| warnings met under V, all | 13,324 of 43,819, 30.4 % |
| national density fifths, met under V, emptiest → most crowded | 29.8, 30.7, 29.2, 29.8, **32.5 %** |
| fifths ranked inside each office (post hoc, descriptive) | **25.4**, 27.4, 30.9, 32.8, **35.4 %**; 64 of 74 offices (≥ 150 warnings) top above bottom |
| odds ratio per tenfold density, adjusted (registered) | **1.19 (1.14–1.24)**; strict rule S 1.15 (1.11–1.20) |
| same, post hoc: night / day / 2008–11 / 2012–23 / people > 0 | 1.20 / 1.18 / 1.20 / 1.18 / 1.46 (1.37–1.56) |
| share never met, model now → every warning at its office's top-fifth density (exploratory, upper bound) | 69.6 % → **65.9 %** |
| among met warnings, EF0 or unrated, emptiest vs most crowded fifth | **65.4 % vs 40.7 %** (unrated 10.7 % vs 0.9 %) |
| never-met warnings holding a hail/wind report (Atelier tiers), emptiest → crowded | 29.6 → 36.3 %; holding nothing 65.1 → 57.4 % |

Predictions: **P1 failed** (raw top − bottom 2.67 pts, bar 5); **P2 held** (OR 1.19, interval above 1);
**P3 failed** (strict raw 2.35 pts, bar 3); **P4 failed in the opposite direction** (−24.7 pts: the
weak and unrated are the *empty* places' tornadoes, not the crowded ones'). Refutation did not fire.
P1 and P3 fail because the national ranking mixes regions (empty Plains, tornado-rich; crowded East,
tornado-poor); the registered model holds office fixed.

**Post hoc, declared.** The within-office fifths, the five sub-fits, and the split of P4 into EF0 and
unrated. The record's unrated code (−9) appears only from 2016. Judgment, mine: the tornado scale rates
by damage, so over empty land the record is both less likely to find a tornado and more likely to rate
the one it finds as nothing much (consistent with Anderson et al.'s Oklahoma hypothesis, abstract only).

## Method

`build.py` joins the Studio's `warnings.json` (sha256 6025b01f…9e1a, `id`, `p`), study 13's first
polygon per warning (earliest `poly_beg`, then `issued`, then file order; planar km² at mean latitude)
and study 14's verification into `data/where.tsv`, with the Atelier's `tiers.tsv.gz` (sha256
e4b84e34…8c8e). `analyse.py`: Wilson intervals; logistic regression of met-under-V on log10 density,
log10 area, log10 minutes, night (00–11 UTC), office fixed effects (95 strata, offices under 30 pooled)
and year fixed effects, errors clustered by office. `check.py`: 11 of 11, stdlib, counting itself —
the Studio's totals reproduced to the person (2,009,866,030 and 1,284,258,344), fifths recomputed,
areas checked against a sinusoidal equal-area projection within 2 % on 500 polygons.
`build_page.py` writes `data.js`; `verify_browser.mjs` 18 of 18 (390 px light, 1100 px dark).

Rebuild: `python3 -I build.py <studio warnings.json> <atelier tiers.tsv.gz> && python3 analyse.py &&
python3 -I check.py && python3 build_page.py && node verify_browser.mjs` (numpy, pandas, statsmodels).

**Deviations.** (1) Study 14's V and S count matched tornadoes; verified = count > 0. (2) 15 polygon
rows hold several rings; the first ring's area is used. (3) My first polygon may differ from the
Studio's where rows share a start; its people count is used as given. (4) 3,970 warnings hold no
block-group centre (median 475 km² against 795): a centre can miss people, so the zero class mixes
empty land and small polygons; without them the factor is 1.46.

## Limits

Census centres of where people sleep, not who was outdoors. Spotter networks, radar range and storm
type move with density and are not separated from witnessing: this shows that verification rises with
people beneath, not why. One analyst. The record is the record of the found.
