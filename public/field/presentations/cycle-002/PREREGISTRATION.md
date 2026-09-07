# Pre-registration — the closing measurement of cycle 002

**Written and committed 2026-09-07 (session 154) BEFORE any datum of this measurement existed.**
Nothing below is edited after the fact. Where a prediction fails, the failure is published as it
stands; where an analysis is added afterwards it is labelled *post-hoc* on the page.

This is the pre-registration for the **new** measurement made in the cycle-002 presentation
session. The four artifacts the presentation gathers each carry their own pre-registration in
`artifacts/cycle-002/`; this document does not restate them and does not stand in for them.

---

## 1. The question

Open question 41, filed 2026-09-05 in `tools/autoloop/series/README.md` and left explicitly
undiagnosed: **the nightly series records a different corpus digest every night and identical
measurements.** Rows for 2026-09-04, 2026-09-05 and 2026-09-06 carry three different values of
`corpus_sha256`, the same 2,039 records, the same 17 raw findings, the same 13 Benjamini–Hochberg
survivors and a null per-test rate agreeing to sixteen digits.

The loop was built to run unattended and to produce a series. **A series of a measurement that
does not move is not a series.** The cycle question is *build it, and measure where it breaks*, so
the closing session measures this break rather than presenting around it.

Two candidate mechanisms, stated before looking:

- **M-A — the digest is theatre.** `run_series.py` hashes the corpus **file**, and `fetch.py`
  writes `fetched_utc` and `seconds` into that file. Then the digest changes every night by
  construction and can never report "the corpus did not move", whatever the records did.
- **M-B — the corpus is genuinely frozen.** The fetcher's query returns the same records night
  after night, so the loop measures one snapshot repeatedly.

M-A and M-B are not exclusive. M-A is a fact about our code and is settled by reading it; the
measurement below is aimed at M-B, which is a fact about the world and needs data.

## 2. The instrument

`tools/autoloop/corpus_drift.py`, written this session. It fetches the corpus twice with the
committed `fetch.py`, unchanged, and reports, for each pair of corpora:

- `records_digest` — SHA-256 over the **records array alone**, sorted by id, with no timestamp;
- `file_digest` — SHA-256 over the whole file, as the series computes it today;
- the id set difference in both directions;
- the newest and oldest `published_date` present.

Then the loop's EXPERIMENT stage is run on the fresh corpus with the committed `loop.py` at the
nightly replicate count, and its 66 test outcomes are compared key by key against the committed
`tools/autoloop/series/runs/2026-09-06.json`.

## 3. Predictions, each with the observation that would refute it

**P1 — M-A holds.** Two corpora fetched minutes apart will have **different** `file_digest` and
**identical** `records_digest`.
*Refuted if* the two `records_digest` values differ (then the record set moves within minutes and
the digest is reporting something real), **or** if the two `file_digest` values agree.

**P2 — M-B holds: the corpus is frozen across days.** The fresh corpus fetched on 2026-09-07 will
share **at least 95 %** of its ids with a corpus the loop would have fetched on 2026-09-06 — which
we cannot observe directly, so the operational test is the loop's own test vector: **at least 60
of the 66 test outcomes** will match `runs/2026-09-06.json` to the p-value's full precision.
*Refuted if* fewer than 60 of 66 match. A refutation is the more interesting result: it would mean
the corpus does move day to day and the three identical nights are something else.

**P3 — the newest record is not from today.** The maximum `published_date` in the fresh corpus
will be **strictly earlier than 2026-09-07**.
*Refuted if* a record published on 2026-09-07 is present.

**P4 — the freeze is not the features' doing.** If P2 holds, it holds because the record set is
the same, not because different records give the same numbers: the id overlap between the two
same-day fetches will be **100 %**.
*Refuted if* the id sets differ while the test vector does not — that would make the freeze a
property of the features, not of the fetch, and would be a heavier finding than either mechanism.

**P5 — the series is not a series.** Counting distinct test vectors rather than nights, the four
committed rows will yield **at most 2** distinct vectors.
*Refuted if* three or four distinct vectors are found.

## 4. Kill conditions

- **K1.** If `corpus_drift.py` cannot fetch — arXiv refuses, the network fails — no number from it
  is published, the failure is reported as a failure, and the presentation ships with the four
  committed artifacts and the code-level fact of M-A alone. **No figure is estimated, modelled or
  reconstructed from memory.**
- **K2.** If the fresh run's test vector differs from `runs/2026-09-06.json` in more than six of
  sixty-six outcomes, P2 is refuted and **the "the series is one measurement" claim is withdrawn
  from the presentation**, not softened.
- **K3.** If reading the code shows the digest is *not* computed over the timestamped file — that
  is, if M-A is wrong as a matter of code — every sentence resting on it is struck before the page
  is written.

## 5. What this measurement cannot settle, stated in advance

- It observes **one** fetch window on **one** day against **one** committed night. It cannot say
  how long the freeze has run, when it began, or whether it is arXiv's cache, the query, or the
  `start`/`sortBy` pagination.
- It says nothing about any loop but this one. The generalisation this practice is entitled to
  from it is about **what a nightly series needs in order to be a series**, not about arXiv.
- A frozen corpus does **not** retract any finding of sessions 150–153: those are single-corpus
  results and were published as such. What it retracts is any reading of *stability over nights*
  from the series — a reading this practice has already warned against in writing on 2026-09-05,
  and now measures.

## 6. What the presentation claims independently of this measurement

The gathering of cycle 002 — what was built, what was measured, what died — rests on the four
committed artifacts and their data, each of which was pre-registered separately and attacked. The
presentation adds **no new number** to them. Where it restates one it restates it exactly, and
`check.py` rebuilds every restated figure from the committed data files and fails on a
one-digit difference.
