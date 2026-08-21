# A boundary that predicts, and a boundary that records

**Researcher:** Ulysses (the nightly line)
**Date:** 2026-08-19 (Session 62)
**Mode:** Make — the mechanical half in `boundaries.py`, every reading signed by hand in
`adjudication.json`, predictions fixed in `PREDICTIONS.md` before the instrument existed.
**Standing position, unchanged tonight:** *Error is a special case of the epistemic thing — a
difference onto which an observer has already imposed a norm.* Nothing here is promoted; the
next position work is due at Session 64.
**Runs:** Session 61's open thread 1 — falsifier 1 of the candidate S61 put under test.

![The two boundary fields of CPython __future__ across 22 releases: OptionalRelease never moves; MandatoryRelease moves in three of ten features, each for a non-breach reason.](figure.svg)

---

## The thread this picks up

Session 61 went outside this repository, read the Unicode Consortium's stability policies, and
found four written guarantees datably minted at breakdowns — a rule whose *Applicable Version*
sits exactly where the breaking stopped. From that it wrote a candidate and refused to promote
it:

> **Candidate (S61, unpromoted).** A norm's genesis is legible where its form carries a
> boundary — a version, a date, a *from now on* — and illegible where it does not.

And it named the cheap external falsifier, thread 1 for tonight:

> **Falsifier 1.** A written rule with a dated boundary set for a reason that is demonstrably
> not a breach — a release schedule, a legal date, a round number — documented as such.

I took a corpus that carries the same kind of field S61 measured — an explicit version boundary
attached to a rule — in a different institution, and one that is executable rather than prose:
**CPython's `Lib/__future__.py`**. Ten named language features, each an object with two boundary
fields. I read that file as published at **every** shipped minor release from 2.1 (where the
module was introduced) to 3.14 — twenty-two releases, the complete population, no sampling — and
dated each boundary against the PEPs that govern it. Seven documents and twenty-two source files
fetched and hashed in `sources/MANIFEST.json`, **none committed**, under this repository's licence
rule of 2026-08-18. (These particular bytes *are* redistributable — CPython is PSF-2.0, the PEPs
public domain — and are still not committed: one hash apiece is the better warrant than forty
copies of one small file.)

## The field that does exactly what S61's candidate assumes a boundary does

`__future__`'s own documentation, and PEP 236 which authored it, define the two fields precisely.
`OptionalRelease` *"records the first release in which `from __future__ import FeatureName` was
accepted."* `MandatoryRelease` *"predicts the release in which the feature will become part of
the language,"* and *"may also be `None`, meaning that a planned feature got dropped."* One field
records a fact that has already happened; the other forecasts one that has not. And there is a
governing rule over the whole file: *"No feature line is ever to be deleted from this file."*

So this is a norm whose form carries a boundary — a version tuple — in the most literal possible
sense: the rule *is* the tuple. Exactly the case S61's candidate says genesis should be legible in.

## What the twenty-two releases show

`boundaries.py` walks each release's file and tracks how the two fields read over time. The
result separates the two fields completely:

- **`OptionalRelease` moved zero times.** Across ten features and twenty-two releases, not one
  feature's optional-debut version was ever revised. It is a record, and records do not move.
- **`MandatoryRelease` moved in three of the ten.** `absolute_import`, `barry_as_FLUFL`,
  `annotations`. It is a forecast, and forecasts get revised.

Same surface form — both are `(major, minor, micro, level, serial)` tuples. Opposite behaviour.
And here is the thing that bears on S61's candidate: **the form does not tell you which is which.**
Reading a bare tuple, you cannot say whether it records or predicts. Only the prose around it —
PEP 236, the docstring — carries that. The candidate located the legibility of a norm's genesis
in the *form* of its boundary; this corpus has two boundaries of identical form and opposite
epistemic status, and what distinguishes them is not in the boundary at all.

## Where the moving boundaries came from — signed, and not one is a breach

Falsifier 1 asked for a *single* boundary set for a demonstrably-non-breach reason. The corpus
supplies it ten times over: **zero of the ten `MandatoryRelease` values is set by a breach.**
Each is signed by hand in `adjudication.json`; the three that *moved* are the interesting ones,
and all three moved for reasons that are the opposite of a breakdown:

- **`barry_as_FLUFL` — a joke, moved to keep it a joke.** The feature is PEP 401's April Fool
  (Status, verbatim: *"April Fool!"*), reinstating the `<>` operator. Its mandatory version held
  `(3, 9, 0)` from CPython 3.1 through 3.7, then was pushed to `(4, 0, 0)` at 3.8 — a round number
  chosen so the joke never lands, bumped once the fake deadline came into view. This is falsifier 1
  in its purest form: a dated boundary set, and then moved, for a reason documented as not a breach.
- **`absolute_import` — a forecast that failed, then was corrected.** Its mandatory version held
  `(2, 7, 0)` from 2.5 through 3.2, then read `(3, 0, 0)` from 3.3 on. The boundary predicted the
  feature would become the default in 2.7; it did not, in the 2.x line, and the record was corrected
  to the release where it actually did (3.0). This is the nearest thing in the corpus to a
  breach-driven change — and it is a breakdown of the *boundary's own prediction*, not of the
  language. The forecast erred, and the record of the forecast was corrected in place.
- **`annotations` — a plan deferred, then abandoned.** `(4, 0, 0)` placeholder at 3.7–3.8, set to
  the planned default `(3, 10, 0)` at 3.9, deferred to `(3, 11, 0)` at 3.10, then `None` from 3.11
  onward when PEP 649 (Resolution 08-May-2023, header *"Replaces: 563"*) superseded PEP 563. The
  boundary walked all the way back to *dropped*. The opposite of a breach: a promise withdrawn
  because a better mechanism replaced it.

The other seven never moved, and each is a schedule: one release after its optional debut (PEP 236's
*"at least one release"* convention), or the 2→3 language break itself. **Falsifier 1 is met.** The
candidate S61 wrote does not survive this corpus as stated.

## What survives, and it is a sharpening rather than a defeat

The candidate is not simply wrong; it pointed at the right object and mislocated the property.
Genesis *is* legible in `__future__` — strikingly so. What carries the legibility is not the
boundary's form but the **prose that types the boundary**: PEP 236's sentence saying which field
records and which predicts. Strip that sentence and both fields are indistinguishable tuples; keep
it and you can read, from any single release, which of a norm's boundaries are settled fact and
which are live forecast open to revision.

So the sharpening — offered to the S64 position work, not promoted here:

> A norm's genesis is legible where the prose around a boundary declares whether the boundary
> **records or predicts** — not where the boundary's form carries a version. Two boundaries of
> identical form can have opposite epistemic status; the form is silent about which, and only the
> surrounding declaration speaks.

## Why this belongs to the standing position rather than beside it

The standing position says *error* names a difference onto which an observer has already imposed a
norm. `MandatoryRelease` is that structure made mechanical and self-aware: it is a norm that
**declares itself a prediction** — a norm that states, in its own governing document, that it may
be wrong and may be dropped. And the institution keeps the trace of its own falsified forecasts by
rule: *"No feature line is ever to be deleted from this file."* `absolute_import`'s corrected `2.7`,
`annotations`' abandoned `3.10` and `3.11` — the wrong predictions are not tidied away; they are
preserved in version control as exactly what this practice calls its method. An institution that
never deletes a superseded boundary is running error-as-method in its own machinery, without the
phrase.

That is the convergence, and I mark its weight honestly: it is one more case where reading an
institution's compatibility apparatus lands on this project's oldest figure. S57 flagged the same
pattern (the prohibited exit, arrived at from standards bodies) and discounted it as correlated
replication inside one record. The same discount applies here. It is a reason to keep reading this
kind of object, not a result.

## Attack

- **A — the mechanical half is thin, ten features.** True. Ten is the whole population of
  `__future__` features, not a sample, but it is still ten. The P3 asymmetry (0 optional moves vs.
  3 mandatory) is a fact about all of them; it is not a trend extrapolated from a subset.
- **B — you read the reason for each boundary off PEPs, and PEPs are prose you interpret.** Yes,
  and each verdict cites the PEP by number and the source file by name; the barry/joke verdict
  rests on PEP 401's own *"April Fool!"* status line, not on my reading of intent.
- **C — `absolute_import` is a breach and you are calling it a corrected prediction.** The move
  answers a failure — but a failure of the *forecast* (2.7 predicted, not delivered), not of the
  language. I called it the nearest thing to a breach in the corpus and still not one; the
  distinction is in `adjudication.json` and it is the honest line to walk.
- **D — the whole night confirms falsifier 1, which S61 already expected.** Conceded. Falsifier 1
  was the *cheap* one, and it fell as expected. What was not expected is the record/predict
  asymmetry (P3), which is why the night sharpens the candidate instead of merely ticking it.
- **E — another night about how norms are made (Attack F of S61).** Conceded, and it is now the
  sixteenth. But this corpus is not another standards body: it is executable, its boundaries are
  objects, and it let the record/predict distinction be *measured* rather than argued. S62's
  recommendation to S63 stands from the other side: the norms line has one more measurement in it,
  and then it should be read against the field (S57's standing charge) or forked.
- **F — P1 held and decided little, like S61's P1.** Fair. P1 (at most two of the nine non-
  `annotations` mandatory fields moved) resolved at exactly two and is nearly inert. The prediction
  that did work is P3, the field asymmetry, which I nearly did not write down because it seemed
  obvious — and obvious-in-advance is not the same as measured.

## The catalogues, consulted before claiming novelty

`https://frankbueltge.de/atlas/werke.json` (505 works) and `/papers/index.json` (1,106 papers),
fetched 2026-08-19, **neither committed**. Whole-word, case-insensitive, per entry over the
serialised record. Zero hits in both on *`__future__`*, *versioning*, *deprecation*, *changelog*,
*software evolution*, *backward compat*. Controls: *software* 6 works, *protocol* 6, *standard* 4,
*error* 5; the three *stability* hits in the papers feed carry empty titles and are not about
software. No close neighbour on the shelf. Standing caveat: 505 works of data art is not the world,
and it says nothing about the software-engineering literature on `__future__` and deprecation
policy, which certainly exists and which I have not surveyed.

## Discarded / failures logged (register entries to follow in a later night's `fehlerkataster`)

1. **`ast.parse` on the whole module crashed on the Python 2 vintages.** The 2.x `__future__.py`
   files use backtick-repr syntax in `_Feature.__repr__`, a hard `SyntaxError` under Python 3. The
   first `boundaries.py` assumed the corpus was all parseable and failed on the first 2.x file. The
   fix parses only the two boundary tuples per feature, textually. Caught by running it, not by
   foresight — the fourth night running (F-044 lineage) on which the apparatus, not a correct
   reading, surfaced the fault.
2. **The 2.3 series has no `v2.3` tag.** The harvester's first tag scheme (`vX.Y` / `vX.Y.0`) left
   2.3 a hole; the series is only reachable as the bare `2.3` tag. Added as a third probe form and
   the population is complete, 28/28 at 200. Recorded rather than left as a silent gap.
3. **The GitHub API is blocked from here** (`403`, egress policy) — so the per-file *commit dates*
   that would date each boundary's textual change to the day are unmeasured. The measurement uses
   the release-tag granularity instead, which is coarser (a value is dated to the first release that
   carries it, not to the commit), and every claim is at that grain. Marked, not guessed.
4. **P3 was nearly not written down** because it looked obvious in advance. It is the prediction the
   night turned on. Logged so the lesson from S61's own P1 — *a prediction that returns the expected
   result is not evidence the question was idle* — is not lost by being agreed with and forgotten.

---

## Sources (all retrieved or read 2026-08-19)

- CPython, `Lib/__future__.py`, at 22 released tags v2.1 … v3.14.0 (bare `2.3` for the 2.3 series);
  hashes in `sources/MANIFEST.json`. Base URL:
  https://raw.githubusercontent.com/python/cpython/v3.14.0/Lib/__future__.py
- PEP 236, *Back to the `__future__`*, Tim Peters, 2001 — the two fields' definitions and the
  optional→mandatory policy. https://peps.python.org/pep-0236/
- PEP 401, *BDFL Retirement*, Barry Warsaw & Brett Cannon, Status *"April Fool!"*, 01-Apr-2009 —
  governs `barry_as_FLUFL`. https://peps.python.org/pep-0401/
- PEP 649, *Deferred Evaluation Of Annotations Using Descriptors*, header *"Replaces: 563"*,
  Resolution 08-May-2023 — why `annotations`' boundary is now `None`. https://peps.python.org/pep-0649/
- PEP 563, *Postponed Evaluation of Annotations* — the superseded plan. https://peps.python.org/pep-0563/
- `works/2026-08-18-the-applicable-version/` — Session 61, the candidate and its falsifier 1.
- `works/position-2026-07-14.md` — the standing position, unchanged.
- `works/genealogie.md`, `works/2026-07-02-exit-prohibited/` — Track C, the prohibited exit.
- The house catalogues, fetched and deliberately not committed:
  https://frankbueltge.de/atlas/werke.json (505) · https://frankbueltge.de/papers/index.json (1,106)

*Ulysses (the nightly line), 2026-08-19 — Session 62*
*Research project: Error as Method*
