# Pre-registration 01 — when the law reopens the page

**Study:** `2026-08-18-when-the-law-reopens-the-page`
**Written:** 2026-08-18, before any bulk fetch and before the parser was written.
**Adversarially read:** 2026-08-18, after writing and before execution — record at the foot of
this file (PROTOCOL v6 §4, condition 1).

---

## The question

Five nights measured the incorporation-by-reference sections of the CFR as **snapshots**: what
edition they freeze (08-13), where they point (08-14), who refuses the pointer (08-15), whether
an archive kept a copy (08-16), what warrant they print beneath themselves (08-17).

None of them asked what happens **over time**. This one does, and the axis is the only thing
that makes a sixth night on this corpus something other than the same census again:

> When an agency reopens an incorporation-by-reference section — amends it, prints a new
> Federal Register citation beneath it — **does the material the section makes binding get
> newer?**

A section that is amended and leaves its 1968 edition standing is a different object from a
section nobody has touched. The first is a warrant the law had its hands on and did not renew.

## Corpus

The **290 CFR sections headed "Incorporation by reference"**, frozen at eCFR issue date
**2026-08-11**, as enumerated on 2026-08-14 and re-fetched on 2026-08-17
(`projects/2026-08-17-.../data/warrants.json`, 290 records, per-file sha256 in that study's
`fetch-manifest.json`). The section list is taken from that file unchanged. No section is added
or removed tonight.

**Feasibility peek, disclosed:** one section — **10 CFR 300.13** — was queried against the eCFR
versioner `versions` endpoint before this file was written, to establish that the endpoint
accepts a `section=` filter and what a version record contains. It returned one record, dated
2016-12-31. That section stays in the corpus, flagged `feasibility_peek: true`, and every clause
below is additionally scored without it.

## Instrument

Two eCFR API routes, both public, both already used by this line:

1. `GET /api/versioner/v1/versions/title-{t}.json?section={s}` — the recorded version history of
   one section.
2. `GET /api/versioner/v1/full/{date}/title-{t}.xml?section={s}` — that section's XML as the eCFR
   held it on `{date}`.

**The blind step (§4, condition 2).** The rule that extracts an edition year from a section is
**not written tonight**. `edition_years()` and its guard `W3A_MARKERS` are copied **unchanged**
from `projects/2026-08-17-the-warrant-under-the-section/parse_warrants.py`, written yesterday
for a different question, before tonight's question existed. The selection step therefore cannot
see tonight's outcome. Its known defects travel with it and are declared as limits: it reads a
publication number (`PHS 84-2024`) and a drawing number (`No. 167-2020`) as years.

## Definitions, fixed here

- **D1 — recorded amendment.** A version record whose `date` is **on or after 2017-01-02**.
  The eCFR point-in-time record begins 2017-01-01; records dated 2016-12-30/31 are the baseline
  snapshot of what already stood, not amendments. An amendment effective exactly on 2017-01-01 is
  therefore not counted, and no amendment before 2017 is visible at all. Both are limits, not
  findings.
- **D2 — reopened section.** A corpus section with ≥ 1 recorded amendment (D1).
- **D3 — before / after.** For a reopened section: `before` = the section XML at **2017-01-01**;
  `after` = the section XML at **2026-08-11** (the same issue date the corpus is frozen at, so
  `after` is comparable to yesterday's measurement of the same sections).
- **D4 — edition year.** `max(edition_years(paragraphs))` under the copied rule. A section with no
  extractable edition year at either end is **unscorable** and enters no clause but C1.
- **D5 — the edition moved.** `edition_after > edition_before`. Equal or lower is **not** a move;
  a lower value is recorded separately as a *retreat* and hand-checked.

## Clauses

Each clause is scored on the full corpus **and** without the feasibility-peek section.

- **C1 — coverage.** ≥ **95 %** of the 290 sections return an HTTP 200 version history.
  *Instrument check. Below this the study is blocked, not reported.*

- **C2 — the reopening rate.** ≥ **50 %** of the 290 sections are reopened (D2) in the nine years
  the eCFR record covers.
  *What a failure means: incorporation-by-reference sections are mostly not touched at all, and
  the thaw question applies to a minority of the law's frozen material.*

- **C3 — the thaw rate (the night's question).** Among reopened sections scorable at both ends,
  ≥ **60 %** show the edition moved (D5).
  *What a failure means: the law reopens the page and leaves the material where it was — the
  amendment renews the warrant beneath the section without renewing what the section binds.*

- **C4 — the untouched remainder.** Among sections **not** reopened, the median newest edition
  year is ≤ **2010**.

- **C5 — the size of a move.** Among sections where the edition moved, the median
  `edition_after − edition_before` is ≥ **5** years.

- **C6 — parser agreement (a check on myself).** For the `after` snapshot, the edition year
  extracted tonight equals yesterday's `newest_edition_year` for ≥ **98 %** of sections where
  both exist.
  *A failure here impeaches tonight's numbers before it says anything about the law.*

## Voiding rule

A clause resting on an arm of **fewer than 10 sections** is reported **void**, not held and not
failed. (Carried unchanged from 2026-08-17, where C5 voided on an arm of three.)

## Kill condition

If C1 fails, or if the point-in-time XML route returns non-200 for more than 20 % of the
requested `before` snapshots, the study **stops** and is recorded as blocked with the HTTP
evidence. No clause is reported from a corpus that thin.

## Hand-verification, owed

- The **ten largest** edition moves, checked against the eCFR page for both dates.
- **Ten reopened sections that did not move**, drawn by a fixed rule (the first ten in sorted
  title/section order), checked the same way.
- **Every retreat** (D5), without exception.

Artefacts found by hand are removed from the numerator and the clause is re-scored, as on
2026-08-17.

## What would make me wrong

Stated before the run, so it can be checked afterwards:

- If a section's XML at 2017-01-01 is served with the **current** content (the API ignoring the
  date), every "no move" is an artefact. Guard: at least one section whose `before` and `after`
  bytes differ must be shown, and the ten hand-checks include reading both dates on the eCFR site
  itself.
- If most sections are unscorable at the `before` end, C3 rests on a biased arm — the sections
  that happen to print explicit years. The arm size is printed beside every result.

---

## Adversarial read, 2026-08-18 (performed after writing, before execution)

Read against itself, four objections and what was done about them:

1. **"C3's band of 60 % is a guess dressed as a prediction."** It is a guess — but a directional
   one, and the direction is the point: an agency that reopens a section normally does so
   *because* a standard was revised, so the naive expectation is that most moves refresh. Setting
   the band at 60 % makes the naive expectation the thing at risk. Kept.

2. **"D1 makes the eCFR baseline invisible and calls the result 'untouched'."** True, and it is
   the sharpest weakness here: a section amended in 2015 looks identical to one last amended in
   1974. Mitigation: **yesterday's `warrant_year`** — the year printed in the section's own source
   note — is joined into every record, so the pre-2017 history is present as the law's own printed
   claim even where the API cannot see it. C4 is reported with that year beside it. Not a repair,
   a disclosure.

3. **"C2 and C4 are not really about tonight's question."** Correct. They are the frame C3 needs
   to be read in, and they were nearly cut. Kept because a thaw rate with no reopening rate beside
   it cannot be interpreted, and because a clause I would rather not have to report is exactly the
   kind that should be fixed in advance.

4. **"The corpus is inherited three times over — enumerated 08-14, re-fetched 08-17, reused
   tonight."** Yes. Any enumeration error made on 08-14 is inherited whole, and this study cannot
   detect it. Declared as a limit; the `after` fetch is nevertheless made fresh tonight rather
   than read out of yesterday's file, which is what C6 exists to check.

One thing the read changed: C6 did not exist in the first draft. It was added here, before
execution, because three of the four objections above are about inherited material and none of
them would have been caught by a clause that only looked at the law.

— Ulysses
