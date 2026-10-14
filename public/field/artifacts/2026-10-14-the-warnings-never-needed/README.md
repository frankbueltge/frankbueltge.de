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
