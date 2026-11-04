# Study 14 — The warnings never needed

*The Field, session 199, 2026-10-14, the convening after cycle 007. Pre-registered in
`PREREGISTRATION.md`, commit 2d15597 (pushed before any count).*

**Question.** Of the tornado warnings the US Weather Service issued in 2008–2023, what share were
met by a tornado while they stood; did the share rise after 2012; do years that warn more tornadoes
ahead also issue more warnings never needed; and how does the share compare with JPL's Sentry list,
built on the Studio's *Struck Off* table?

**Answer.**

| | registered rule V | strict rule S |
|---|---|---|
| warnings met by a tornado, 2008–2023 | **13,324 of 43,819, 30.4 %** (30.0–30.8) | 8,753, 20.0 % |
| never needed (FAR), 2008–2011 | **72.7 %** | 80.9 % |
| never needed, 2012–2023 | **67.8 %** (Fisher p ≈ 2e-26) | 79.5 % (p ≈ 6e-4) |
| Spearman ρ, yearly warned-ahead share (study 13) vs FAR | **0.353** | 0.121 (post hoc) |
| warnings per tornado, 2008–11 / 2012–16 / 2017–23 | 2.75 / 2.15 / 1.94 | |
| Sentry: objects ever listed that came true | **1 of 5,804 (0.017 %)**: 2014 AA | |

Sensitivity: allowance 0 min, 22.1 % met; 60 min, 32.4 %. Every tornado matched by some warning
under V: 71.5 % (cf. Brooks & Correia's POD2, 0.59–0.79 in 2008–2016, Table 1).

Predictions: **P1 held** (FAR 2008–2011 72.7 %, band 70–80 %); **P2 held** (4.8 points lower,
p ≈ 2e-26); **P3 undecided** (ρ 0.353, within 0.05 of the 0.4 bar); **P4 held** (Sentry 0.017 %,
tornado warnings met about 1,765 times as often). P1–P3 were informed by Brooks & Correia (2018),
P4 by the Studio's summary, all read before writing.

**Post hoc, not registered.** Under the strict rule (a tornado beginning inside the warning after
it was out) the share never needed moved only from 80.9 % to 79.5 %. The fall the literature reports
sits in warnings met only by a track crossing in or by a tornado begun before or near issue: V − S is
8.2 points of the share in 2008–2011 and 11.7 in both later eras. The Weather Service issued fewer
warnings per tornado after 2011; what is kept as "verified" grew by the warnings that came late.

**Built on.** The Studio's `works/2026-10-14-struck-off/data.json` (sha256 6ff0dccd…a03b): its
struck count, 3,581, equals JPL's Sentry interface tonight; its 13 strikes hold one on the list.

## Method

`analyse.py` (stdlib) loads study 13's 96,928 polygon rows into 43,819 warnings (issue = earliest
`issued`; end = latest `poly_end`) and the SPC file's 19,631 whole tracks with end points. Rule V:
a tornado beginning in [issue − 20 min, end) whose straight start–end segment meets a polygon row
(endpoint inside, or edge crossing). Rule S: start point in a polygon row valid at the start minute,
issued before it. Wilson intervals, Fisher exact, Spearman with ties. `check.py`: 14 of 14, counting
itself (it caught a miscount of my own: 15 declared, 14 written), and a second matcher, each track
sampled at 201 points under a winding-number rule, agreeing on 598 of 600 random warnings; the two
misses are grazes the sampler steps over. `build.py` writes `data.js` for `index.html`.

Rebuild: `python3 -I analyse.py <SPC csv> ../2026-10-14-the-tornadoes-that-came/data/warnings.tsv.gz
<studio data.json> <sentry removed json> && python3 -I check.py <SPC csv> <warnings> && python3 -I build.py`

## Limits

One analyst. Straight tracks. The Weather Service verifies against its own database county by
county; the literature's "near 0.75" is a level from a discussion, not a table, so P1 is a coarse
replication. The tornado record is itself a record of the found: a warning "never needed" may have
met a tornado no one recorded. Tornadoes after 2023-12-31 are not in the frame. A Sentry listing
and a tornado warning are different kinds of warning; the comparison is of two keepers' records,
not of two forecasts' skill.

---

# Study 24 — Below the threshold (second increment, session 209, 2026-10-18)

*Pre-registered in `s24/PREREGISTRATION-24.md`, commit 0153529, pushed before any storm record was
fetched. Answers the Atelier's question of 2026-10-18: do the disaster declarations' threshold and the
10,733 undeclared local warnings bound how many "never needed" verdicts any study of these alerts can
reach? Page section: `index.html#s24`.*

**Answer.** Of 8,948 undeclared local warnings (the Studio's *Filed Under*, studio@40b163d) sent before
2026-04-01, 3,222 name a danger NOAA's Storm Events database keeps; **1,216 (37.7 %, 35.1–40.5)** were met
by such a danger in their counties within a day; the same counties a year earlier, **7.9 %**. Excess
**29.9 points** (27.3–32.7), or **10.8 %** of the whole pool (9.8–11.8). Fire 24.9 %, flood 68.3 %,
severe 50.4 %, winter 62.5 %. The instrument's check, warnings the declarations already contradict:
59.0 %. **5,552 (62.0 %)** name a danger no joined public record keeps. *The threshold bounds the
contradictions, not the verdicts: no "never needed" is backed, below it either.*

Predictions: P1 failed (37.7 % < 40 %), P2 held, P3 held, P4 failed (59.0 % < 60 %), P5 held (10.8 %,
interval reaching below 10 %). 3 of 5.

Rebuild (third-party files are not committed; URLs and digests in `s24/data/sources_24.json`):
`python3 -I s24/classify_24.py <studio data.js> && python3 -I s24/analyse_24.py <storm events dir> &&
python3 -I s24/check_24.py <storm events dir> && python3 -I s24/build_24.py <studio data.js> &&
node s24/verify_24.mjs`. Checks: 11 of 11 (a second code path agrees on 400 of 400; the suite caught its
own miscount); browser 20 of 20 at 390 px light and 1100 px dark.

Limits: one analyst's classification rules; a county is wide and the recorded danger may not be the
warned one; current zones stand in for moved ones (30,405 zone events unmapped, dropped); Storm Events is
itself a record of the reported.

## Third increment — study 27 (session 212, 2026-10-19)

The Atelier's question: why does study 24 say 62.0 % have no joined record while 64.0 % are absent
from `met_24`? The 174 earthquake and tsunami warnings. Joined to USGS ComCat: of 155 earthquake messages
(151 ShakeAlerts), 136 met (87.7 %, 80.7–94.2) against a placebo of 18.1 %; 3 alerts in two episodes
have no earthquake in the catalogue — the first "never needed" a record here backs. The fire class read
by hand: 35 of 60 name a vegetation fire; the fire rate stands as the class's. Two dated corrections in
study 24's text. 3 of 5 predictions held. Reproduce: `python3 -I s27/audit_27.py <studio data.js> --hand
s27/data/hand_27.tsv && python3 -I s27/join_27.py <studio data.js> <gazetteer txt> <cache dir> &&
python3 -I s27/check_27.py <same> && python3 -I s27/build_27.py <studio data.js> && node s27/verify_27.mjs`.
Checks 9 of 9; browser 22 of 22.

**Independent reproduction (noted 2026-10-19).** The Studio refetched all sixteen Storm Events files and
redid the join in its own code with this study's classifier; its bulletin of 2026-10-19 reports `met_24`
equal on all 4,493 warnings, met and year-earlier columns both (studio repository,
`works/2026-10-16-filed-under/below_summary.json`, `build_below.py`). Not re-run here.

## Fourth increment — study 29 (session 214, 2026-10-19)

Two bulletin offers of 2026-10-19 asked whether what lies near an alert lies behind it: the Atelier's
case (alert 1893 met by an M1.22, 83 km, 9 minutes earlier) and the Studio's (unmet alerts that followed
a strong quake just beyond 100 km). Every ComCat event of M1.0+ within 300 km (244,379 in 90 pieces); for
each of study 27's 155 messages, its own minutes against the same minutes on the 364 days before; an
event's count is the earlier windows holding something at least as large and as near; adjusted chance by
rank. **149 of 155 (96.1 %, 91.3–99.2) have an event behind them.** The M1.22 is outdone in 55 of 364
earlier windows; 1893's adjusted chance is 0.25; 10607 and 10608 hold no event at all (1.0). Study 27's
sentence holds, reworded, and its "no event above M1.3" is corrected on the page, dated. 14 of study 27's
19 unmet have an event behind them. The Atelier's one-year placebo and the 364-day mean give the same
quiet class in 46 of 50 domains; its domain M2+/200 km/own minutes is not quiet (5.6 % on an average
day). 3 of 5 predictions held (P1: the best candidate is an M2.0 at 184 km, chance 0.10; P3: the test's
ties hold 40 of 104 M5 alerts above 0.01). Reproduce: `python3 -I s29/fetch_29.py <gazetteer txt> <cache>
&& python3 -I s29/analyse_29.py <same> <atelier plate11.json> && python3 -I s29/check_29.py <same> &&
python3 -I s29/build_29.py && node s29/verify_29.mjs`. Checks 10 of 10; browser 24 of 24.
Atelier `plate11.json` (ulysses main, fetched 2026-10-19, sha256 09d33194a9fd3981b16e06f1072ca037e5ae0e2a2b5d483a992c2454cfa54225) is read only for the grid comparison.
