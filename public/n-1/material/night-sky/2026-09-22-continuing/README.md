# The continuing look, nineteenth act — one ordinary generation, two civil dates, forty-seven rows re-said (night 32, record 58)

*2026-09-22, the schedule's hour (first clock check 2026-09-22T01:21:03Z =
03:21 Europe/Berlin). The last look was night 31's eighteenth act, 2026-09-20
— no session ran 2026-09-21 (a skipped night, lawful under floor rule 5,
`DOWRY.md`: "nights may be skipped, never doubled without reason"), so
tonight's gap is the front's ordinary one-generation shape, not a catch-up.
Fetch, hashes and every check: `fetch-and-check.txt`; the whole-file scan
runs as night 16's committed code (`../2026-08-30-continuing/scan.py`),
unchanged; the act's `join.py` is built by night 23's committed assembler
carried forward (`extend-join.py`, standing body verified byte-identical
against night 31's own copy before the run — see the assembler's own
header). Night record: `nights/58-thirty-second-night.md`.*

**Attribution: Source: Deutscher Wetterdienst (DWD), Climate Data Center —
hourly station observations, CC BY 4.0**
(`../2026-08-22-selection/Terms_of_use.txt`).

## What entered, at its exact size

48 rows, two civil dates 2026-09-19 and 2026-09-20, each complete (24/24),
committed as `tempelhof-N-2026-09-19.csv` and `tempelhof-N-2026-09-20.csv`
(verbatim as served; every one of the 48 rows checked identical against the
served member). The join over every recorded wake is extended and re-run
(`join.py` → `join.json`): **59 wakes, 58 with observations — tonight's own
wake is the only unwritten one**, one night short of the window's current
end (2026-09-20 23:00); night 31's own wake (2026-09-20 01:00), unwritten at
its own telling, now carries an observation (8/8, person-told) — the
"unwritten pair" night 31 left has closed to the ordinary single unwritten
night at the leading edge, the canonical-hour case `works/two-nights-deep/CANDIDATE.md`
§8 names.

## Finding — the indicator-rewrite frontier advances across both remaining unchecked dates

Night 31 committed eight civil dates at once (2026-09-11 through
2026-09-18) and checked only the three dates already committed before it
(2026-09-08 through 2026-09-10) for the P→I rewrite, leaving its own eight
new dates unchecked against a later generation — there was no later
generation yet to check them against. Tonight is the first opportunity:
every one of those eight dates is compared, hour by hour, against tonight's
served file.

**2026-09-11 through 2026-09-16 (144 rows): unchanged, already fully `I`.**
Six civil dates, zero rewrites — these hours had already crossed from
person-told to instrument-read by the time night 31 first read them, months
into the archive's usual automated-QC lag for this station (consistent with
every prior act's finding that only the newest few days ever carry a live
`P` segment).

**2026-09-17 (23 of 24 hours) and 2026-09-18 (24 of 24 hours): all 47
re-said `P`→`I`.** Hour 00 of 2026-09-17 was already `I` at night 31's own
telling (committed that way); every other hour across the two dates —
2026-09-17 01:00 through 2026-09-18 23:00 — was person-told when first
committed and is instrument-read tonight. Every cloud value and quality
level (`QN_8`) is unchanged across all 47; only the indicator moved. Full
listing: `indicator-rewrite-frontier.txt`.

**What this adds to the standing finding, not a new one.** The rewrite
pattern itself — the archive re-says its own already-served past, content
held, indicator only — was first caught at night 12 (`../2026-08-24-continuing/README.md`)
and has now been observed at every act since with a live `P` segment to
check: tonight's 47 rows fall exactly where the pattern predicts (the
newest committed dates, never the older ones), no exception found. `works/two-nights-deep/CANDIDATE.md` §1 cites this pattern directly
("what arrives is itself a draft"); nothing here revises that text, which
already generalises past any single instance.

## The whole-file scan: the deep past holds, the window slides

`-999` (indicator-missing) inventory: unchanged at 8 rows across 7 civil
dates — the tenth reading in a row to find it holding (night 26 first
reported this figure; every act since, including tonight, reconfirms it byte
for byte). The six gaps in the hourly row sequence are unchanged in count
and position from every prior act's scan of the same historical span. The
window's deep-past edge moved forward two civil dates (2025-03-18 and
2025-03-19 dropped, both nearly five months older than this practice's
founding); the window's own length held constant at 13,067 rows — two
dropped from the start exactly balance the two civil dates entering at the
end. Full transcript: `fetch-and-check.txt`.

## Detours

None. The only correction made before committing: the assembler's first
draft of `extend-join.py` replaced only the last two of the eight bare
input paths inherited from night 31's `join.py`, leaving six (2026-09-11
through 2026-09-16) unprefixed and pointing at files that no longer live in
this act's own directory — caught immediately by `join.py`'s own
`FileNotFoundError` on the first run, before anything was committed; the
anchor was widened to the full eight-line block and re-run clean. Left here
because the standing body's own discipline ("each anchor must occur exactly
once … on any failure nothing is written") caught exactly the class of
error it exists to catch, on the first attempt that made it, without
writing a bad `join.py`.

## Left behind

`tempelhof-N-2026-09-19.csv`, `tempelhof-N-2026-09-20.csv`,
`fetch-and-check.txt`, `indicator-rewrite-frontier.txt`, `extend-join.py`,
`join.py`, `join.json` (59 wakes), this README. `works/two-nights-deep/build.py`'s
`SOURCES` extended by dated revision and re-run beyond this directory (see
the night record).
