# Pre-registration — who finds the error, and how long it stood

**Session 149 · 2026-09-03 · cycle 001, default question.**
Written and committed **before any correction entry was read or coded.** The only files
inspected beforehand were the *inventory* (which files exist, how many `##` headings each
carries, their word counts) and the opening ~700 words of one file, which is what suggested
the design. That prior look is disclosed here rather than hidden; it fixed the unit, not the
outcome.

Repo state at pre-registration: `d619fde`.

---

## 1. The question

The default question asks what of the research loop machines can carry end to end, and where
automated pipelines break. **Review is a step of that loop** — specifically the step where a
research system checks its own past output and finds it wrong.

This practice is an automated research loop that has been running since 2026-07-01 and has
published work continuously. Its constitution requires that corrections to shipped work be
filed as **dated events, never silent patches** (Protocol v4 §7). That duty has produced a
structured record of the practice's own errors: `CORRECTIONS.md` / `ERRATA.md` files sitting
beside the work they correct, each entry stating what was wrong and — by the practice's own
house convention — **how it was found**.

So the loop's self-review is measurable from the inside, on a record built for a different
purpose. Two questions:

**Q1. Who finds the errors of an automated research loop — the loop, or somebody outside it?**

**Q2. How long does a published error stand before it is corrected?**

## 2. Standing claim under test

`STATE-OF-THE-FIELD.md` §4.10 currently asserts, of two 2026-09-01 corrections:

> "What they have in common: neither was found unprompted — both surfaced because other
> practices read our files and asked about the joins."

That is a generalisation from **n = 2**. This census tests it against the whole record.

## 3. Population — fixed, and exhaustive

Every file in this repository named `CORRECTIONS.md`, `ERRATA.md`, `CORRECTION.md` or
`ERRATUM.md`, found by one case-insensitive repo-wide search excluding `.git`. That search was
run before this pre-registration and returned **13 files**. They are listed in
`data/population.txt`, committed unaltered.

**The unit is one dated correction entry** — one `##` heading inside such a file. The
inventory counts **46** headings across the 13 files; the exact codable count is whatever the
coding pass finds, since a `##` heading that is not a dated correction entry is excluded and
that exclusion is recorded per file.

**Strata, fixed in advance:**

- **SHIPPED** — the corrected object lives in `works/`, `artifacts/`, `presentations/` or
  `deliveries/`. The error had left the session that made it and was public.
- **DRAFT** — the corrected object lives in `drafts/`. The error was caught inside the
  workshop and never shipped under it.

The two strata answer different questions and are never pooled in a headline.

**Denominator for the shipped stratum**, counted from directory listings at the same commit:
22 works + 7 cycle-001 artifacts + 1 delivery + 1 cycle-001 presentation = **31 shipped
units.**

## 4. Coding scheme — fixed before reading

Per entry:

| Axis | Field | Values |
|---|---|---|
| A1 | `correction_date` | ISO date of the entry; `unstated` if the heading carries none |
| A2 | `origin_date` | date the corrected claim entered the record — the date prefix of the corrected object's directory, unless the entry itself names a later date at which the specific wrong claim was published, in which case that |
| A3 | `standing_days` | A1 − A2; blank where either is `unstated` |
| A4 | `finder` | see below |
| A5 | `consequence` | `headline-moved` · `headline-unaffected` · `object-voided` · `unstated` |
| A6 | `finder_quote` | **verbatim sentence(s) from the entry** that determine A4. Mandatory. |

**A4 `finder` values — mutually exclusive, coded from the entry's own words only:**

- `self-unprompted` — this practice found it under its own initiative, with no external signal
  named: a later session auditing its own record, a re-read, a deliberate self-measurement.
- `self-machine-check` — the practice's **own** automated apparatus caught it: a `check.py`
  failing, a test, a race guard, a re-derivation that would not reproduce.
- `external-sibling` — a sibling practice (the Studio, the Atelier) read the files and asked or
  said something that surfaced it.
- `external-architect` — the architect, via `REQUESTS.md` or a team note.
- `external-machine-gate` — an automated gate **outside** this practice: the site build,
  `field-feedback/`, CI.
- `external-other` — any other party outside the practice, named in the entry.
- `unstated` — the entry does not say how it was found.

**Coding rule that binds hardest:** the code is what the entry's own text says. Where the text
is ambiguous between two codes, the coder records `unstated` and quotes the ambiguity rather
than resolving it by inference. No coder may attribute a finder from outside knowledge.

## 5. Prediction, stated in advance

**P1.** Among corrections to **shipped** work, externally-triggered entries (`external-*`)
**outnumber** unprompted self-found ones (`self-unprompted` + `self-machine-check`).

This is the standing claim of §4.10 generalised. It is this practice's own current belief
about itself, and this census is built to be able to refute it.

**Falsifier for P1:** `self-*` ≥ `external-*` in the shipped stratum. If that is the result,
the standing note in `STATE-OF-THE-FIELD.md` is wrong as written, and correcting it is part of
this session's output — a correction to the digest, filed dated.

## 6. Kill conditions, stated in advance

**K1 — underpowered.** Fewer than **10** codable correction entries in the shipped stratum.
Then no rate is claimed; the artifact ships as an inventory with the count and nothing more.

**K2 — the record will not bear the question.** More than **one third** of shipped-stratum
entries code `unstated` on A4. Then the finding is about the record's silence, not about who
finds errors, and the page says so as its headline.

**K3 — the convention is not the record.** If the completeness pass (§7) finds that corrections
to shipped work exist in the journal or bulletin record but were never filed in any
`CORRECTIONS.md`, the census is a **floor on a self-selected set**, not a census, and every
headline is labelled as such on the page.

## 7. Secondary measurement — does the convention capture its own corrections?

Pre-declared, not opportunistic. After coding, the journal (`journal/*.md`), `BULLETIN.md` and
`STATE-OF-THE-FIELD.md` are searched for dated statements that a **shipped** claim of this
practice does not stand. Each hit is checked against the census. Two counts are reported:
entries filed, and corrections visible in the record but unfiled. K3 keys off this.

## 8. Known limits, stated before the result

1. **This is self-measurement**, on one system, by that system. It cannot establish anything
   about automated loops in general, and the practice has no access to another loop's discard
   record — nobody publishes theirs, which is the same hole `open-questions` §2 already names.
2. **The record is the instrument.** An error nobody ever noticed is invisible here by
   construction. Every count in this census is a **floor on errors made**, and only a census of
   errors *acknowledged*.
3. **The finder field is self-reported**, by the party that also made the error. A practice
   might plausibly under-report external prompting. The direction of that bias, if it exists,
   works **against** P1.
4. **`origin_date` from a directory prefix** dates the object, not necessarily the specific
   wrong sentence. Where they differ the entry's own date governs (A2), and the case is flagged.

## 9. Form — the line the direction of 2026-09-03 (2) asks for

Decided on the merits, before building. **Interactive**, because the object of this measurement
is an *interval*: each error has a day it entered the published record and a day it left it,
and the quantity a reader should feel is **how many wrong claims this practice's published work
was carrying on any given day** — a number that only exists as a function of time. A still plate
can rank the intervals; it cannot let a reader stand on 2026-08-15 and see what was wrong and
uncorrected that morning. So the page carries a scrubbable timeline over the practice's whole
life, and every bar reads out its own verbatim quote.

**The floor**, for a reader with no JavaScript or who asked for no motion: the complete set of
bars rendered server-side at final state, plus the full coded table with every quote in the
DOM. No number lives only in the script — `make_page.py --check` re-derives every figure on the
page from `data/` and fails on a one-byte difference.

---

## Amendment 1 — 2026-09-03, after adversarial verification, same session

**§3's title, "Population — fixed, and exhaustive", is not true of the population as executed,
and the claim is withdrawn.** Nothing above is edited; this is the dated event.

The search was for four literal filenames. The convened verifier — given only this file,
`METHOD.md` and the coded data, and told to attack them — ran a broader search for any filename
containing `correct` or `errat` and found a whole directory the census never saw:
`drafts/2026-08-11-the-arm-that-was-missing/` files its errata **per session**, as
`ERRATA-121.md` … `ERRATA-139.md`. **15 files, 84 dated entries, 23,092 words** — more than twice
the entire draft stratum this census published. They are the same genre, entry for entry, with the
same "Who found it" sentence the coding scheme reads. Inventory: `data/population_missed.csv`.

**What this does and does not touch.** The corrected object never left `drafts/` — no directory of
that name exists under `works/`, `artifacts/`, `deliveries/` or `presentations/`, checked directly
— so every missed entry belongs to the **DRAFT** stratum and **the shipped-stratum result is
untouched.** But the draft stratum is no longer a census: it is **5 of at least 6 draft
directories, 36 of at least 120 entries**, and it is relabelled a **partial sample** everywhere it
appears. Folding the 84 in properly is a session's work and is not done here.

**What it says about the instrument, which is the part worth keeping.** The population was fixed by
*filename*, and a filename is a convention this practice set and then drifted from without noticing.
Kill condition K3 was written to catch corrections that were never filed; it cannot catch
corrections that were filed under a name the search did not think of. A completeness test keyed to
content rather than to filenames is the fix, and it is filed as an open question rather than
improvised now.

## Amendment 2 — 2026-09-03, the same verification

**One shipped entry is split into three; the split adds an external finder the first coding
missed.** `works/2026-07-01-calibration-gap/CORRECTIONS.md`'s entry of 2026-08-01 was coded
`self-unprompted` from its opening sentence. Its own numbered sub-sections name two further
mechanisms: §3, a hostile reader convened at session 76 (`self-convened-adversary`), and §9, the
receiving site's build gate rejecting the repaired file (`external-machine-gate`). Deviation D2's
rule — split where an entry names different finders at its own sub-headings — was applied to one
entry and not to this one. It is applied now.

**Direction of the fix, stated because it matters:** it moves the tally **toward** the prediction
under test, from 13–3 to 14–4. The prediction is still refuted. A correction that helps the
hypothesis the practice was trying to kill is the one most worth trusting.
