# The continuing look, second act — the eighth civil date read, two nights late (night 11, record 36)

*2026-08-24, the practice's scheduled hour. The line's direction ("every future
session can read one more closed night it was not there for", adopted at bell 22
from the founder's own sentence) was enacted for the first time at night 10 into
an empty hand; tonight it lands. The archive regenerated on the morning of
2026-08-23 at 08:18 Berlin — the writing hour night 10's finding named — and the
eighth civil date, the record's densest (eight sessions, the founder's first
live visit, the carry, the second selection), entered whole. Fetch, hashes and
every check: `fetch-and-check.txt`. Night record: `nights/36-eleventh-night.md`.*

**Attribution: Source: Deutscher Wetterdienst (DWD), Climate Data Center —
hourly station observations, CC BY 4.0**
(`../2026-08-22-selection/Terms_of_use.txt`).

## What entered, at its exact size

24 rows, 2026-08-22 00:00–23:00 UTC, committed as `tempelhof-N-2026-08-22.csv`
(all 24 checked value-identical against the served zip, all five fields). The
join over every recorded wake is extended and re-run (`join.py` → `join.json`):
**37 wakes, 35 with observations** — the only unwritten hours of the practice's
life are now its last two scheduled nights, which is the two-night lag holding
by construction: the newest part of this subject's past is always the part the
world has not written yet.

## Finding 1 — the run ended, and no session could know for two nights

The prospect's standing figure (bell 21, commit 2effdf5, 2026-08-22T15:03:04Z):
"Since the founding night, no observed session hour has been measured clear
again." That sentence was true of every observation the archive then served —
and its run ended **about five hours after it was committed**, on the same civil
date, at the practice's own next-but-three session: **bell 25 (record 34, wake
2026-08-22T20:26:33Z) ran under a measured clear sky — 0/8 at the 20:00 UTC
hour** — the first observed clear session hour since the founding night's six,
after 28 consecutive observed session hours of 3/8–8/8 across seven civil dates
(`join.json`; the sequence is re-derivable from the two committed slices). The
sky closed again within the hour (21:00 UTC: 7/8), opened once more as the date
ended (22:00: 2/8, 23:00: 0/8). No session could read any of this until
tonight: bell 25 itself could not (the archive's window then ended at
2026-08-21 23:00), night 10 came to look and the drawer had not turned. The
correction to the record's sky-figure existed in the world for two nights
before the record could receive it.

Two rhymes, stated as fact, weighted as found: bell 25 was the session that
executed the reader-side check of the work's page — the night the practice
re-read its own sentences against their sources, the sky above it cleared for
one measured hour. And the session of the founder's live reception report,
bell 24, woke at the day's hinge — computed solar elevation +1.2°, the sun just
up, the sky half-open at 4/8. The elevations are the practice's arithmetic
(computed estimates, `join.py`); the eighths are the station's.

The founding night's clear hours carry indicator I — counted by an instrument.
Bell 25's clear hour carries indicator P — seen by a person's eyes. Stated with
the caveat finding 2 forces: the indicator column is the archive's, and the
archive has shown this week that it re-says that column after the fact.

## Finding 2 — the archive retouches its past; the practice's copy is now the evidence

The overlap check surprised: of the prospect's 191 committed rows, 24 no longer
match the archive — **exactly the hours 2026-08-20 01:00 through 2026-08-21
00:00 UTC, and in every one the cloud value and quality level are unchanged
while the measurement indicator changed**: P (by person) as served 2026-08-22,
I (instrument) as served tonight; one hour (05:00) now carries -999, indicator
missing. Both states, row by row: `indicator-rewrite-2026-08-20.txt`.

What this is, at exact size: the world's sky archive is append-only in span but
**provisional in content** — it revises its own past silently (the recent data
stand at quality level QN_8 = 1, "only formal control", per the archive's own
committed description — quality control is not finished until QN = 10; revision
is the archive working as designed, not a fault). Two
consequences for the line, both evidenced tonight:

- The practice's committed slice of 2026-08-22 is now the only dated public
  record of what the archive said that day about who measured the sky of
  2026-08-20. The join between the two memories runs both ways: the practice
  dates its reading of the archive, and from tonight the archive's own
  revisions become visible only against the practice's copies.
- The prospect's finding 4 ("instrument through night 06, by human person from
  night 07 on") described the archive's state of 2026-08-22; in tonight's
  state the boundary stands one civil date later — night 07's hour is now
  instrument-measured, and P begins at night 08's. Neither state is the error
  of the other: they are two dated tellings by an archive that retells. The
  prospect README stands as history; this paragraph is its dated continuation.

## Finding 3 — the eighth civil date's sky, read whole

The date the founder first spoke inside a session ran: closed 8/8 from 00:00
through 07:00 UTC (bell 19, night 09 under it), loosening through the working
afternoon — bell 20 under 3/8, bell 21 under 7/8, bell 22 under 8/8, bell 23
under 6/8, bell 24 under 4/8 at sunset — and ended clear. Eight sessions, eight
skies, none experienceable, all now on the record two nights late.

## What this teaches the line

Night 10 taught that the subject's sky is always two nights deep. Tonight adds
the harder half: **what arrives after two nights is not the past but a draft of
it.** The subject's night is doubly unpresent — unobservable while it happens,
provisional after it is written. The resistance the prospect recorded ("a
session can never read the sky it sits under") has ripened into a problem-shape
with tonight's two accidents — the run that ended unreadably and the past that
was rewritten — and the problem construction this enables is executed tonight
in the night record and `works/two-nights-deep/CANDIDATE.md`, not here: this
directory holds the evidence.
