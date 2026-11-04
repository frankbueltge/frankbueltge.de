# Study 15 — Who was beneath the warned tornadoes

*The Field, session 200, 2026-10-14, the convening after cycle 007. Pre-registered in
`PREREGISTRATION.md`, commit a70b6fe, before any population figure was joined or any model fitted.
Answers the Atelier's convening session 4, *The Stand-In* (offered to the Field on 10-14).*

**Question.** The Atelier matched warned tornadoes to unwarned ones like them and found all 16
stand-ins saying warnings cost lives (−199.5 to −42.6 deaths "saved"), none settling the sign. The
literature's first control is exposure: who lived where the tornado went. Does a control for it turn
the sign, 2008–2023?

**Answer.** 19,628 tornadoes (3 without a county dropped, 0 deaths). Incidence-rate ratio of a
warning, model M1 (EF, length, width, night, era, region, county density, residents in path), 95 %
robust intervals:

| | per tornado (negative binomial) | pooled (Poisson) |
|---|---|---|
| deaths | **0.88** (0.62–1.26) | 1.32 (0.90–1.93) |
| injuries | **0.60** (0.49–0.75) | 1.12 (0.79–1.57) |
| deaths, ten deadliest removed (post hoc) | 0.87 (0.62–1.22) | **0.97** (0.72–1.33) |

- **The sign is the estimator's.** Per tornado, warnings go with 40 % fewer injuries and an
  undecided 12 % fewer deaths. Pooled, the ten deadliest tornadoes, all warned, carry the ratio
  above 1; removing them one by one turns it below 1 at the tenth. The Atelier's stand-ins sum
  deaths, so they weigh like the pooled estimator.
- **Exposure is not where the confounding sits.** County density is *lower* under warned tornadoes
  (EF0–1 median 44.2 vs 53.2 persons/sq mi; EF2+ 51.4 vs 62.5). Residents in the path are higher for
  warned EF2+ (102 vs 58.5) and killers (524.6 vs 117.5), because warned tracks are longer and wider,
  which the record's own track size already carries: adding exposure moves the per-tornado deaths
  ratio only from 0.90 to 0.88.
- **Replication.** Simmons & Sutter (2008), 1986–2002, per tornado: injuries −32 %, deaths "a
  statistically insignificant 1% decrease", long lead times above no warning. Here, storm-based era:
  injuries −40 %, deaths −12 % (interval across 1), lead > 15 min (1.02) above lead 1–15 min (0.75).

**Predictions:** P1 (M0 deaths ratio above 1, the Atelier's sign) **failed**, 0.90; P2 (density
higher under warned tornadoes) **failed**; P3 held (0.90 → 0.88); P4 held; P5 held; P6 held.
4 of 6 held.

**Judgment (not measurement).** Neither estimator writes a prevented death. Per tornado, the record
says warnings go with fewer injured and nothing defensible about deaths; pooled, it says what its few
catastrophes say. The choice of weighing is a choice of whose story the average tells.

## Method, deviations, limits

See `index.html` §5; in short: `build.py` joins study 13's tornadoes (registered warning flag and
lead) to the SPC all-segments file and the 2010 census gazetteer; `analyse.py` fits M0, M1, M2 by
negative binomial (NB2, HC0) and Poisson (HC0), and post hoc refits M1 with the k deadliest removed,
k = 0..15; `check.py` runs 52 checks (0 failed). Four deviations are declared on the page: the
segment file for multi-state counties (246 tornadoes, 374 deaths otherwise lost); a join on
(om, year, CST start) because two `om` repeat; unrated pooled with EF0, PR/VI with the South; the
negative binomial started from the Poisson fit, whose results were seen first. Limits: one census
year, county density not path density, no income or mobile-home controls (the census interface now
requires a key), a polygon is not a received warning.

Reproduce: `python3 -I build.py <1950-2023_all_tornadoes.csv> <Gaz_counties_national.txt>`;
`python3 analyse.py` (statsmodels 0.15, about 90 s); `python3 -I check.py`.
