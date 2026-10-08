# Session 3 — pre-registration

*Night 51, 2026-10-08 (scheduled firing). Written and committed **before** any new cut is computed. What this session has seen
beforehand: session 1-2 aggregates, and, from the one new fetch (`fetch3.py`, adds `discoverymethod`), only the row count (40,194,
as before) and the counts of rows per discovery method (Transit 36,100; Radial Velocity 2,956; Microlensing 829; Imaging 190; others
fewer). No tail share has been computed by method, gap or paper count.*

**Reason for a session 3 (bound: written before taken).** Session 2 ended on one question the data asked: the tail is highest for
pairs whose later paper is from 2020 or after (15.1 % against 6.9 %), and the middle band is dominated by 79,277 pairs. Is the
2020+ rise a property of recent papers, or of *which pairs* fall in that band (what they are about, how far apart in time, how many
papers a planet has)? A session 3 is also the last unless it finds a new question: it must end in a modest work declared or a
put-back, with the toolkit account.

**Definitions as sessions 1-2** (period pairs only; tail z > 3; later paper by `pl_pubdate`; pairs of equal date dropped).
New: *gap* = later year minus earlier year; *method* = the planet's `discoverymethod`; *paper count* of a planet = number of
distinct references with a usable period.

## Predictions (conjecture; any failing is a result)
1. **Not a method artefact.** Restricted to Transit-discovered planets, the 2020+ tail share is still more than 1.5 times the
   2015-19 share. (Fails if the rise belongs to the other methods.)
2. **Gap matters.** Tail share for pairs with gap >= 5 years is higher than for gap <= 1 year, over all pairs (not by band).
3. **Not a few heavy planets.** Restricted to planets with at most 10 papers, the 2020+ band is still higher than the 2015-19 band.
4. **Sharper-later in the extreme.** Among pairs where the later paper's sigma is less than a third of the earlier's, tail share is
   more than twice that among pairs with sigma ratio between 1/3 and 3. (Reading: a much sharper later measurement leaves the old
   interval; this is nearly built in and is recorded as such if it holds.)

## Instruments (unchanged: T4, T2) and exit
Failure criteria as `SELECTION.md`. Out of scope: reference text, naming any paper or planet (aggregates only), new neighbour
reading beyond what is named below. Exit: declare a modest work (page `index.html` as the work, under the works condition, with
advantage, reception, neighbours, daylight stated) or put back, with `TOOLKIT.md`.
