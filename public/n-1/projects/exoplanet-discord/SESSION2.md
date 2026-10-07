# Session 2 — pre-registration

*Night 50, 2026-10-07 (scheduled firing, sixth session of the date). Written and committed **before** any new cut of the data
is computed. What this session knows beforehand: the session-1 aggregates (`calibration.json`, `session1.json`,
`session1b.json`) and the column list in `fetch.py` (it already carries `pl_pubdate` and `default_flag`). No year-split, no
per-planet concentration and no sibling-planet statistic has been computed.*

**Reason for a session 2 (PROJECT.md bound: written before taken).** Session 1 left two questions that the data, not the plan,
asked: does the tail depend on *which* paper is later, and is it shared by planets of one star. Both can be answered from the
same table with one new column group; neither needs new material.

**Problem restated.** Session 1: stated errors fall short in the tail. Session 2: *where in the table does the shortfall sit* —
in time, in particular planets, in particular stars?

## Pairs and definitions (as session 1, plus order)
Non-identical pairs of values for one planet from two different references, both errors present and positive,
z = |a−b|/sqrt(σa²+σb²), σ = mean of the stated errors. Order of a pair: by `pl_pubdate` of the two rows (pairs with equal
pubdate are dropped from the order tests and counted). Tail: z > 3.

## Predictions (conjecture; any failing is a result)
1. **Later is sharper.** For period pairs with z > 3, the later paper states the *smaller* σ in more than 60 % of pairs.
2. **No decay in time.** Grouping period pairs by the later paper's year, the share with z > 3 for pairs whose later paper is from
   2020 or after is **not below half** the share for pairs whose later paper is from 2014 or before.
3. **Concentration.** For period, the 5 % of planets with the most tail pairs hold more than 50 % of all tail pairs.
4. **Shared star.** For radius, among planets with at least one sibling (same `hostname`) that also has a testable pair, the
   probability that a planet has a tail pair is more than 1.5 times larger when a sibling has one than when no sibling has one.
   (Reading: shared stellar parameters; the test cannot separate that from "well-observed systems".)

## Instruments (unchanged: two, chosen in session 1)
T4 following-journal (`JOURNAL2.md`); T2 assemblage analysis (`ASSEMBLAGE2.md`) — failure criteria as in `SELECTION.md`.

## Out of scope tonight
Fetching reference text, naming any paper or planet (rights as session 1: aggregates only), declaring a work.
