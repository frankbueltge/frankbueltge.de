# Pre-registration — the closing measurement of cycle 003

**Written and committed 2026-09-13 (session 159).** Cycle 003, the first seeded cycle, question
***Missing Data Art*** (`seed-20260907-220129-aa5f`). This is the fifth and last working session of
the cycle; the presentation it closes gathers four artifacts, each of which carries its own
pre-registration in `artifacts/cycle-003/`. This document does not restate them and does not stand
in for them. It governs only what is **new** tonight.

Two new things are made tonight, and they do not have the same standing. That difference is stated
here rather than smoothed over on the page.

---

## 0. What is already seen, and therefore cannot be predicted

**Declared before anything else.** Two numbers were already in hand when this file was written, and
no prediction below may rest on them:

1. **The agreement matrix of §2 was computed before this file was written.** Its inputs
   (`artifacts/cycle-003/2026-09-12-what-a-description-is-for/data/task-rows.json`) were committed
   on 2026-09-12, before this session existed, and are not touched tonight — but the analysis is
   **post-hoc and its numbers were seen first**. It scores no prediction. It is labelled post-hoc
   on the page, in the summary and in the data file itself.
2. **A one-request reachability probe of govdata.de was made before this file was written**, to
   decide whether the measurement of §3 was possible at all. It returned HTTP 200 and a record
   count of **156,003**, against the **146,492** the same endpoint reported to this practice on
   2026-09-11. That growth is therefore an **observation, not a prediction**, and the page reports
   it as one.

## 1. Why a second corpus, and why this one

The strongest single result of cycle 003 was made on 2026-09-12 and is in the digest as the
cycle's unifying finding: *identifying power is a property of a description **and a room***. One
catalogue, eight sizes, instrument unchanged, nothing about the descriptions altered — the share of
descriptions that fail to pick out their own record rose from **16.51 %** at 521 records to
**62.17 %** at 67,205.

**That was measured on one corpus.** The architect's direction of 2026-09-03 names exactly this
failure in advance: *a finding true of one loop, offered as a finding about loops.* A closing
session that presents the finding without testing it on a second corpus would be publishing the
thing this practice measures in others.

So the ladder is run again, unchanged, on **govdata.de** — a CKAN portal this house did not build,
in a different language, roughly twice the size of data.gov.uk. It was already censused by this
practice on 2026-09-11 (146,492 records, `notes` non-empty on 97.39 %), so its premise is known to
hold and the arm is not a fishing trip.

## 2. The agreement matrix (post-hoc, declared — scores nothing)

`STATE-OF-THE-FIELD.md` §4.6 and the artifact of 2026-09-12 both say that four operationalisations
of "unusable" *agree pairwise at κ between −0.0667 and 0.0378*. Reading the record tonight, that
sentence is **not supported as written**: the κ values in it were computed on **different item
sets** in different sessions, and at least one of them is structurally zero because one rater had no
variance. It has never been computed as a matrix on a common set of items.

It can be, for three of the four, because
`2026-09-12-what-a-description-is-for/data/task-rows.json` carries, per item, on one common set of
60 held-out items per arm: the screen's broad verdict, the screen's strict verdict, the model-free
narrowing verdict, and whether the blind reader's 5-way identification failed.

The fourth — the blind reader's *opinion* of emptiness, 2026-09-11 — **cannot** join it: that sheet
was anonymised by design (`audit-sheet.json` carries an opaque `aid` and the value text and nothing
else), so its items cannot be matched to any other measurement. That is a consequence of a good
decision and it is reported, not repaired.

The matrix is therefore **descriptive and post-hoc**. It scores no prediction, and whatever it
shows, the correction it implies against this practice's own published sentence is filed as a dated
event beside the artifact, not patched into the old text.

## 3. The new measurement — the room ladder on a corpus we did not build

### 3.1 Instrument

`tools/room/room.py`, written tonight. It **imports** and does not re-implement:

- `tools.identify.narrowing` — the model-free narrowing instrument, frozen 2026-09-12, with its own
  parameters unchanged (`COMMON_DF_FRACTION = 0.10`, `N_RAREST = 3`, the same tokeniser, the same
  title-masking step);
- `tools.hollow` — the hollowness screen's rules R1–R4, frozen 2026-09-08.

**No parameter is re-tuned for this corpus.** If the instrument is wrong for German text, it is
wrong here in exactly the way it was wrong at home, and that is the point of importing rather than
copying.

No model is called anywhere in it. Standard library only. Every draw is seeded (`SEED = 20260913`).
No third-party corpus is written into this repository (protocol §7): the harvest goes to a cache
outside the working tree, and only aggregates are committed.

### 3.2 Population and ladder

**Census**, not a sample: every record `package_search` will page out of
`https://www.govdata.de/ckan/api/3/action/package_search`, field `notes`. Records whose `notes` is
absent or empty are excluded from the ladder population and counted separately, exactly as the UK
arm did.

Ladder: **521, 1000, 2000, 4000, 8000, 16000, 32000, 64000, and the full population.** Five seeded
draws at every size below the full population; the full population is measured once, because it is
itself. The home arm's own value at its own size (the atlas, 0.96 % at N = 521) is the comparison
point at the foot of the ladder and is not re-measured.

### 3.3 Predictions, each with the observation that refutes it

Written before the harvest ran. Numbers from data.gov.uk (2026-09-12) are quoted for reference
only; they are not the bar unless a prediction says so.

- **P1 — the curve rises.** `not_unique_pct` is monotonically non-decreasing along the ladder.
  *Refuted if* any step falls by more than **1.0** point (the seeded scatter at the small end of
  the UK ladder was SD ≈ 1.4–1.8, so a 1-point dip is inside noise and a larger one is not).
- **P2 — size is not the whole story.** At n = 521 the govdata rate is at least **5 points** above
  the atlas's **0.96 %** — i.e. ≥ 5.96 %. *Refuted if* it is below that. This is the prediction
  that keeps the cycle's finding from collapsing into "everything is size": if a portal at the
  atlas's own size still fails far more often, then the room explains much of the gap but not all
  of it.
- **P3 — the same shape, not merely the same direction.** The ratio (full ÷ 521) for the narrowing
  instrument on govdata lies within a factor of two of data.gov.uk's **3.77** — i.e. between
  **1.88** and **7.54**. *Refuted if* outside.
- **P4 — the screen is size-dependent here too.** R4 (the duplicate rule) has a ratio (full ÷ 521)
  above **2.0** on govdata. *Refuted if* ≤ 2.0.
- **P5 — and more size-dependent than the narrowing instrument.** R4's ratio exceeds the narrowing
  instrument's ratio on govdata, as it did on data.gov.uk (6.39 against 3.77). *Refuted if* R4's
  ratio is less than or equal to it.
- **P6 — R1–R3 do not move.** The three single-value rules are properties of one string and cannot
  depend on how many other records are in the room; their rates are constant across the whole
  ladder to within floating-point printing. *Refuted if* any of them moves by more than **0.05**
  points between the smallest and the largest rung. This is a **control on our own code**, not a
  finding about the world: if it fires, the ladder is broken and nothing else on it may be read.

### 3.4 Kill conditions

- **K1 — the premise fails.** If `notes` is non-empty on fewer than **80 %** of harvested records,
  the ladder is not run and the page says the premise did not hold, as it said of Cleveland on
  2026-09-11.
- **K2 — incomplete harvest.** If fewer than **90 %** of the `count` the API reports are actually
  harvested, the arm is reported as a **sample**, not a census, and the word census does not appear
  beside its numbers.
- **K3 — the door is shut.** If the endpoint refuses or times out past the retry budget, no ladder
  is run, the refusal is reported with its status code as a fact about the session (open question
  46), and the presentation ships with §2 alone.
- **K4 — the instrument is degenerate on German text.** If more than **25 %** of masked values
  retain fewer than 3 tokens, the narrowing rates are reported but **no prediction is scored**: an
  instrument that empties a quarter of its inputs is measuring its own masking step.

## 4. What the presentation page may and may not claim

- Every figure restated from the four artifacts must be **re-read from that artifact's own
  committed data file** by `check.py`, not retyped. A one-digit difference fails the check.
- The page is rendered by `build.py` from `data/`; `check.py` re-renders it and asserts the
  committed `index.html` is byte-identical. A number edited into the HTML by hand fails.
- **The screen may not be called a detector of uninformative text** (`STATE-OF-THE-FIELD.md` §4.6,
  closed against us 2026-09-12). It detects scrape residue, truncation, and repetition.
- No claim is made about known-item retrieval as a field: two papers were read, not a census
  (2026-09-12), and this practice claims no novelty against an IR literature it has not searched.
- Where the cycle failed to do something it was asked to do, the page says so in the same voice as
  its findings.

## 5. What would make this closing session a failure

- If the second corpus is run and its numbers are then explained away rather than reported.
- If the presentation reads as a victory lap over four artifacts, three of which are refutations of
  this practice's own predictions.
- If a figure on the page cannot be traced by a reader to the artifact that made it.
