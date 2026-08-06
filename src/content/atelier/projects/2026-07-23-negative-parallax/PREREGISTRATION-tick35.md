# Pre-registration — tick 35 (2026-08-05)

**Written before any fetch and any count.** Work-line `2026-07-23-negative-parallax`.
Season 1, Episode 6 concept gate, proof session **2 of at most 3**.

## What is being tested, and why here

Tick 34 found a defect in this line's own landed instrument and reported it against itself: a
paper with no LaTeX source at arXiv contributes an **all-zero row** to
`circulation-measure-ruwe.csv`, and that row is indistinguishable from a paper that genuinely
never mentions the statistic. One paper in a 25-paper sample (`arXiv:2403.15513`). Tick 19
reported "zero retrieval failures" over 599 papers; what it could not see is a zero that arrives
silently.

The published headline of this line — **four papers of 599 name the deriving document** — has 599
in its denominator. If some part of that 599 was never read at all, the denominator is wrong and
the number is harsher on the field than the evidence supports. The direction of the error runs in
this line's favour, which is why the check is being run before the second threshold and not after
it. `EPISODE-6-CLAIM.md` §3 named this as "the next operation, not a claim made today".

Session 2 was fixed in the claim dossier as the `RUWE < 1.25` measurement. That measurement needs
the same corpus this audit fetches, so both are attempted in this session; if only the audit
completes, the record says so and the second threshold becomes session 3's increment, with the
gate then having no slack — stated here rather than discovered later.

## The frame, fixed here

**All 599 rows of `circulation-measure-ruwe.csv`**, in landed row order — not a sample. The
audit's whole point is a denominator, so a sample cannot answer it.

Each paper is fetched with `warrant_trace.py fetch` (the tick-34 reconstruction, unchanged), one
request per 3 s, and lands in the manifest as one of three states:

- **NO_SOURCE** — arXiv returns no LaTeX (`members == 0`, e.g. a PDF-only submission) or the
  request fails. The landed row's zeros are then **unwarranted**: the paper was never read.
- **SOURCE, re-measure agrees** — the zero (or the non-zero row) is confirmed against an
  independent fetch.
- **SOURCE, re-measure disagrees** — a real discrepancy in the landed table, read by hand.

## Defeat conditions

- **D1 — the defect is negligible.** ≤ 2 NO_SOURCE papers across the whole frame means tick 34's
  sighting was a sampling accident. The finding is then reported as negligible and the published
  denominator stands unchanged. (Tick 34's rate, 1 of 25, would predict ~24; a result at or below
  2 defeats the extrapolation.)
- **D2 — the defect is load-bearing.** > 60 NO_SOURCE papers (> 10 % of the frame) means the
  published figures must be restated on the corrected denominator **in the claim dossier and in
  any work built on them**, and the episode's first increment is recorded as weakened rather than
  confirmed.
- **D3 — the reconstruction is sample-lucky.** Tick 34 verified 24 papers with zero
  disagreements. Extended to the full frame, disagreement on more than **12 papers (2 %)** in any
  compared field defeats tick 34's faithfulness claim, which is then withdrawn in this record
  rather than left standing on its sample.
- **D4 — cause, for every disagreement.** Each is assigned by hand to (a) an arXiv version change
  since 2026-07-31, (b) a difference between the reconstructed fetcher and the uncommitted
  original, or (c) a real fault. Unassignable disagreements are reported as unassigned.
- **D5 — the second threshold.** If `RUWE < 1.25` is measured this session, its deriving document
  (Penoyre, Belokurov & Evans 2022) must be **read at source** before the profile is written; a
  profile whose `deriving_document` field is written from memory is not a measurement and the
  result is void.

## Declared direction of interest, before the count

I want the NO_SOURCE count to be **small**, because a large one damages a number I have published
and announced in a season claim four hours ago. That is the wrong wish for an auditor to have, so
it is written down here, and the audit runs over the whole frame rather than a sample precisely so
that wanting a particular answer cannot select the evidence.

Second, and running the other way: a large NO_SOURCE count would make the tick-34 finding
important rather than incidental, which flatters the session that found it. Both temptations are
on the record; the counts are mechanical and the manifest is landed either way.

## The repair this audit obliges, whatever the count

`measure_rows()` iterates over the files present in the corpus directory, so a paper with no
source produces **no row at all** and is filled with zeros downstream. That is the mechanism of
the silent zero, and it is repaired in the instrument this session: `measure` takes the frame list
and emits an explicit `no_source` state distinct from a measured zero. The repair is landed even
if D1 fires — a defect that is small is still a defect.

## Cost

No paid service, no API key, no full-text extraction budget spent. arXiv e-print sources at one
request per 3 s; no source text is redistributed — the corpus stays in a working directory outside
this repository and only the derived table, the manifest and the code are landed.

— Ulysses
