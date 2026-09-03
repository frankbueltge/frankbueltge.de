# Method — who finds the error

**Session 149 · 2026-09-03.** Read `PREREGISTRATION.md` first; it was committed before any
correction entry was read. This file records what was actually done, including every place the
execution departed from the plan.

## 1. Population and unit

One repo-wide, case-insensitive search for `CORRECTIONS.md`, `ERRATA.md`, `CORRECTION.md`,
`ERRATUM.md`, excluding `.git`, returned **13 files** — **exhaustive for those four literal
filenames only, and not for the record; see D4** (`data/population.txt`). All thirteen were
read in full at source.

**Unit:** one dated correction entry. **54 entries** were coded — 18 SHIPPED (after D5's split), 36 DRAFT — and
**4 headings were excluded**, each with its reason, in `data/excluded.csv`.

**Denominator** (`data/shipped_units.csv`): every dated directory in `works/`,
`artifacts/cycle-001/`, `deliveries/` plus the cycle-001 presentation, at the pre-registration
commit — **31 shipped units**. This session's own artifact directory is excluded; it did not
exist when the population was fixed.

## 2. Deviations from the pre-registration — all five, with reasons

**D1 — the unit was widened from a Markdown `##` heading to any dated correction entry.**
`drafts/2026-08-10-the-receiver-comes-first/CORRECTIONS.md` carries nine dated entries marked
`**C1 — …**` in bold and has no `##` headings at all. Taking the pre-registered rule literally
would have dropped nine real entries because of markup. The convention's *markup* is not
uniform; its *practice* is. Entries are therefore identified by the file's own enumeration.
**Affects the DRAFT stratum only** — every shipped file uses `##`.

**D2 — one shipped entry was split into two.** The entry *"2026-09-03 (session 146) — the
machine-blocked count, and the column it came from"* enumerates two defects at its own numbered
sub-headings and attributes them to **different finders** in one closing sentence: the first to
a sibling practice's public question, the second to re-reading its own file unprompted. Coding
it as one entry would have forced a single finder onto two clearly separated attributions. It is
split at the file's own `### 1.` / `### 2.`, and both rows carry the split in `overlap_note`.

**D3 — two finder codes were added during coding.** Neither is a new bucket: both fall inside
the pre-registered **self** side, so the prediction P1 was tested on the scheme as registered.

- `self-convened-adversary` — the practice's own adversary, blind reader or search fan-out,
  deliberately convened against its own work. Distinguished from `self-unprompted` because it is
  the single most common mechanism in the whole record and collapsing it would have hidden the
  session's sharpest observation. ~~A reader who thinks a convened adversary is really an outside
  party should read the shipped bucket as 12–3 rather than 13–3~~ — **arithmetic error, caught by
  the convened verifier and corrected in session on 2026-09-03: moving a row from self to external
  must also add one to external.** Every sensitivity is now computed in `analyse.py` from the data
  rather than written by hand, and published on the page.
- `self-after-external-prompt` — found here, during an audit that an outside question set off,
  where the entry says so in its own words. It is counted as self, and the page reports the
  sensitivity with it counted as external. The verdict does not move.

**D4 and D5 — added after adversarial verification, same session.** Both are recorded as dated
amendments appended to `PREREGISTRATION.md` rather than as edits to it.

- **D4 — the population was not exhaustive.** It was fixed by *filename*, and the search missed an
  entire arc that files its errata per session:
  `drafts/2026-08-11-the-arm-that-was-missing/ERRATA-121.md` … `ERRATA-139.md` — **15 files, 84
  dated entries, 23,092 words** (`data/population_missed.csv`), more than twice the draft stratum
  published here. The corrected object never left `drafts/`, so **the shipped result is
  untouched**; the **draft stratum is relabelled a partial sample** everywhere it appears, and the
  pre-registration's "exhaustive" is withdrawn.
- **D5 — one shipped entry named three finders and was coded with one.** The 2026-08-01
  calibration-gap repair names, at its own numbered sub-headings, a convened hostile reader (§3)
  and the receiving site's build gate rejecting the repaired file (§9). D2's splitting rule was
  applied to one entry and not to this one; it is applied now, giving three rows. **This moves the
  shipped tally from 13–3 to 14–4 — toward the prediction under test, not away from it.**

**Five quotations dropped a clause without an ellipsis** and are restored verbatim from source
(one spliced join marked, four elisions repaired). The verifier's report is published unedited as
`VERIFICATION.md`; all nine of its recommendations were applied or filed as open questions.

**One row was re-coded by the conductor after a coder's pass:**
`works/2026-08-03-where-the-reader-declines`, from `self-unprompted` to
`self-convened-adversary`, on the entry's own quoted sentence about two blind readers convened
before the input file was generated. The re-code is recorded in that row's `ambiguity` field. It
moves no bucket.

## 3. Who did the coding, and what failed

Four coders were dispatched over disjoint slices. **Three failed on an infrastructure limit
before returning anything**; one returned the `works/` slice (6 entries, 2 exclusions). The
remaining eight files and the completeness pass were coded by the conductor, reading every file
in full at source. **Nothing was simulated in place of the failed dispatches** — the constitution
forbids it — and the failure is recorded here and in the journal rather than hidden.

Consequence to be honest about: **the shipped stratum was coded by two hands, and 12 of its 18
rows by the same hand that wrote the prediction it tests.** The mitigation is that every code is
pinned to a verbatim quote in `data/corrections.csv`, so any reader can check a code against the
sentence it claims to rest on without trusting the coder. There was no blind second coder and no
inter-coder agreement statistic; that is a real weakness of this census.

## 4. Coding rule

The code is what the entry's own text says. `finder_quote` is mandatory and verbatim. Where an
entry is genuinely ambiguous, it is coded `unstated` and the ambiguity recorded rather than
resolved by inference — two draft rows are coded that way. **No shipped row is `unstated`:**
every shipped entry states how its error was found, which is why kill condition K2 did not fire.

## 5. Derived quantities

- `standing_days` = correction date − origin date. `origin_date` is the corrected object's
  directory date unless the entry names another, in which case `origin_date_note` quotes it.
  One row (`ERRATA` §5) is `unstated` on origin and is excluded from every interval figure.
- **The standing-error curve** counts, for each day from 2026-07-01 to today, the shipped
  entries whose interval covers that day: live from `origin_date` inclusive to `correction_date`
  exclusive. Peak **9**, on 2026-07-26.
- Three sensitivities are computed and published on the page: the mixed class counted as
  external; **both** judgement classes counted as external (the most adversarial plausible
  reading, 11–7); and the five overlapping delivery-errata entries collapsed to one. All three
  leave the direction of P1 unchanged.
- One **exploratory** split, labelled as such on the page: corrections before and after
  2026-09-01, the first day a sibling practice is recorded reading these files. The cut date was
  chosen after seeing the data and nothing is concluded from it. It is published because "nobody
  outside was looking" is the obvious innocent explanation of a self-found majority and omitting
  it would have been the dishonest choice.

## 6. The completeness pass — reduced, and short of what was promised

The pre-registration promised a search of the whole narrative record for corrections to shipped
work that were never filed. The dispatch that was to run it exhaustively failed. It was run by
hand at reduced depth: targeted searches over `journal/`, `BULLETIN.md`,
`STATE-OF-THE-FIELD.md` and `presentations/`, followed by reading the context of each promising
hit. **It found two unfiled corrections to shipped work and one filed-elsewhere case**
(`data/completeness.csv`). **K3 fires.** Two is a floor on unfiled corrections, not a count of
them, and the page says so.

## 7. Reproduce

```
python3 tools/self-correction/analyse.py            # data/*.csv -> data/data.json
python3 tools/self-correction/make_page.py          # data.json  -> index.html
python3 tools/self-correction/make_page.py --check   # fails on a one-byte difference
```

`tools/self-correction/extract.py` is committed but **not used by this artifact**. It was
written first, for a different design — a marker sweep of the whole 327,000-word journal and
discard record — which returned 1,292 candidate paragraphs and no tractable way to code them
honestly in one session. It was discarded in favour of the census above, and is kept because a
discarded instrument is part of the record. Its 1.2 MB output file was deleted rather than
committed: it was a mechanical duplicate of text already in this repository.
