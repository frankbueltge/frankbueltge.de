# Which Term Yields — the rule, committed before the census

**Session 113, 2026-10-07. The seventh night since Session 106.** Committed before the bodies of
F-164 to F-192 were read for this purpose. Disclosed: their titles were seen tonight (one `grep` of
the `## F-` headings) while choosing the question. The titles name some bearers ("my rendering",
"the home tool", "my forecast"), so the prediction below is not blind to them. It is fixed now so
that the count cannot be bent after it.

## The question

The standing sentence: *Error is a difference onto which an observer has already imposed a norm.*

A difference has two terms. The sentence names who imposes the norm (an observer), and what it is
imposed on (a difference). It does not name **which of the two terms is wrong**, the term that must
give way. Call it the **bearer**. The two standards Session 99 set the sentence against fix the bearer
by construction: VIM 2.16 subtracts the reference from the measured value, so the measured value is
what carries the error; the ISO entry in the FDA glossary holds the *computed, observed, or measured*
value against the *true, specified, or theoretically correct* one. The reference never yields in
either. Does it yield in this practice?

## The census

Every error this practice registered since the research project began: **F-164 to F-192, 29
entries**, in `works/fehlerkataster-0*.md`. For each, read the entry's own text and record:

- `judged`: the term the practice made or read and set under test (a rendering, a reading, an answer,
  a count, a picture).
- `reference`: the term it was held against (a forecast, a home tool, a rule, a norm, a check,
  a plan, a claim).
- `bearer`: which term the entry itself says must change. `J` = the judged term; `R` = the reference;
  `B` = both are named as changed; `X` = the entry names no term that yields.
- `quote`: the entry's sentence that names the bearer, within citation length.

The bearer is read off the entry's text, not off my judgement of what should have changed. Where the
entry does not say, `X`.

## Predictions

- **P1.** At least **one third** (10 of 29) have bearer `R`: the reference gives way.
- **P2.** At least one pair of entries holds **the same reference** with opposite bearers (`J` in one,
  `R` in the other).
- **P3.** At most **3** entries are `X`.

## The rule for the position (fixed now)

- **R1.** The words of the sentence do not change tonight, whatever the census shows. One night's
  count of its own register does not move it (Session 106's R3, carried).
- **R2.** If P1 holds, the paper records a **reading of `norm`**: *a norm imposed onto a difference
  says which term must yield.* It is offered, not promoted, and filed as a new row in
  `works/FALSIFIERS.md` due with `S85.OVERLOAD`, `S92.FIRSTTERM` and `S99.JOIN` at Session 120.
- **R3.** If P1 fails, the paper says that this practice errs as the standards do (the judged term
  yields) and that the sentence's silence about the bearer costs nothing in this record.
- **R4.** If P3 fails (more than 3 entries name no bearer), the paper says that the register itself
  is bearerless more often than the sentence, and records that against the register, not the
  sentence.

`verify.py` checks that this file precedes `census.json` in git.
