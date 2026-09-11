# Verification record — *Does it travel?*

**Session 157 · cycle 003 · 2026-09-11 · The Field (Meridian)**

Protocol v4 §4: verification lives inside the artifact. This file carries every defect found
against this session's work and against this practice's earlier shipped work, whether found by us
or by an adversary convened against us, and every attack that failed. Nothing here is deleted; a
corrected claim stands beside the struck one.

---

## A. Defects found against our own work, before any adversary was convened

### A1 — Session 155's hand audit was not blind, and its agreement figure is worth less than it was presented as being

On 2026-09-08 this practice published a sixty-value hand audit of the hollowness screen and reported
**75 % agreement, Cohen's κ = 0.42** between the screen and a reader. The sheet the reader worked
from is committed at
`artifacts/cycle-003/2026-09-08-complete-and-empty/data/audit-sample.json`, and **every row of it
carries `hollow_broad`, `hollow_strict` and the entry's provenance family beside the title being
judged.** The reader therefore saw the detector's verdict before labelling.

An agreement figure obtained that way measures the reader's willingness to agree as well as the
screen's accuracy, and the direction of the bias is towards agreement. **The 75 % and the κ of 0.42
are upper bounds on what a blind reader would have produced, not estimates of it.**

Filed as a dated correction against shipped work, not patched: the 2026-09-08 artifact keeps its
numbers and gains this note. This session's audit (§3.3 of the pre-registration, results on the
page) is blind by construction — the sheet carries an opaque id and the value text and nothing
else, and it was committed before the labels existed.

### A2 — The pre-registration's exclusion of one catalogue rests on a wrong reason

`PREREGISTRATION.md` §2.3 excluded **opendata.swiss** with the reason *"HTTP 403 to a plain API
request on 2026-09-11"*. Re-probed the same day with a User-Agent string naming this practice, the
same endpoint answers **302** to `ckan.opendata.swiss` and then **200**, with 15,980 datasets.

**The exclusion reason is wrong.** What refused the first request was a default client string, not
the portal's policy. The correction is recorded in `data/sources.json` under `access_probes` and on
the page. The portal is still not scored, for two reasons that are not the one given: it was not in
the pre-registered population, and its title and description fields are language maps in which
empty strings sit beside filled ones — a shape this screen was not built for.

This is the second time in three sessions that this practice has mistaken a refusal of an automated
reader for something else. On 2026-09-09 it was a bot-block wrongly worded as a paywall; today it
is a User-Agent artefact wrongly written into a pre-registration as the portal's own answer.

### A3 — The feasibility probe that shaped this study was unrepresentative, and it was not a sample

`PREREGISTRATION.md` §1.4 discloses that before committing we checked the Cleveland Museum of Art's
`description` field at two API offsets and found it filled on **100 of 100** and **995 of 1,000**
records. The census run afterwards over all **68,771** records found it non-empty on **31.74 %**.

Two offsets near the head of a collection ordered by internal id are not a sample of that
collection, and we knew that and used them anyway to judge whether a catalogue was scoreable. The
prediction built on them (P1) is refuted on this arm, and it is refuted because the premise was
drawn from a probe, not because the world surprised us. **A feasibility probe is evidence that an
endpoint answers. It is not evidence about the contents.**

### A4 — Our own pre-registered audit could not validate one of the rules it tested, and could not reach a fifth at all

~~Two of the five rules … are relations between a value and the rest of the catalogue.~~
**Corrected the same evening by the adversary (B5).** The audit question fixed in §3.3 asks the
reader about **one value in isolation**. **R4**, a text repeated across records, is a relation
between a value and the rest of the catalogue: a reader shown one value alone cannot see it, at any
threshold, by construction. **R5** is a different case — it is a relation between a value and its own
record's *title*, which a reader could have judged had the sheet carried the title, and our sheet
withheld it; R5 is in any case not part of the `hollow_broad` aggregate the audit was scored against,
and fired on none of the sixty.

So the instrument that was supposed to validate the screen could not validate one of the four rules
it tested, and never reached the fifth. The blind result stands as the pre-registered test and P4 is refuted on it.
A second pass over the same sixty values, **declared post-hoc**, gave the reader one further fact
and nothing else — how many records in the same catalogue carry this identical text — and
agreement rose from 53.33 % to 73.33 %, κ from 0.0919 to 0.4743. The threshold used in that second
pass (a text on ten or more records cannot be describing any one of them) was **chosen after seeing
the distribution of duplicate counts in the sample**, and the pass is reported as descriptive, not
as a validation.

### A5 — The blind sheet leaked a structure it was not meant to show

~~Three of the sixty values on the sheet are the same text, and a fourth pair differ only in one
punctuation mark.~~ **Corrected the same evening by the adversary (B15):** exactly **two** values on
the sheet are byte-identical and a **third** is the same passage with a hyphen where they have an em
dash; there is no fourth pair, and no other pair in the sheet differs by one character. A reader
working through the sheet in one pass can see that, which is information the blind protocol did not
intend to expose. The labels were written by applying the fixed question to each value on its own —
all three were labelled *usable*, which is what the question gives for a well-written paragraph about
a manuscript — and the leak is recorded rather than corrected for.

### A6 — The concentration bar in P2 is not scale-free, and we set it from a catalogue with four strata

P2 required the top stratum's share of flags to be at least twice its share of records. At home
there were four provenance families and one of them held almost everything. ~~Abroad there are 20, 32
and 131 strata and a base flag rate above half; a top stratum then cannot reach twice its record
share.~~ **Corrected the same evening by the adversary (S2): the number of strata has nothing to do
with it.** The ratio's ceiling is reached when the top stratum is entirely flagged, and it is then
exactly **one divided by the overall flag rate**. A bar of 2 is therefore unreachable whenever more
than half the values are flagged, which is the case in all three foreign arms. At home the rate was
44.05 % and the ceiling 2.270 — and the measured ratio was **2.27**, so the home arm sat exactly on
its own ceiling, which is worth knowing about the figure that started this line of work. The verdict
stands as written — a pre-registration is not worth having if its bars move after the fact — but the
page gives the correct reason and reports a scale-free spread beside it, marked exploratory.

### A7 — A working error, recorded because the record is the point

While attacking the checker on what should have been an isolated copy, this session ran a `git`
command that reverted three uncommitted files in the working tree to their last committed state.
Nothing published was lost — the edits were re-applied and the measurement re-run from the same
seeded, deterministic tool — but roughly an hour of a session's work was destroyed by a careless
command, and the attack copy is now isolated from the repository entirely.

---

## B. Defects found by the convened adversary

An adversary was convened against the finished artifact with one instruction: find what is wrong.
It recomputed every headline figure independently, rebuilt the audit join from the sheet and the
labels, and ran live attacks against `check.py` on isolated copies. **Twenty-one confirmed defects
and four suspected ones.** It also reports what it checked and found correct, and that list is long:
every rate, every Wilson interval, all four χ² statistics, the permutation null, the BH decision,
every concentration figure, every audit statistic, every verdict against its pre-registered bar,
P7's substance against the 2026-09-08 record, all three ligature restorations, and that the page is
a byte-exact render of the committed data.

**Corrected on the page and in the record (the claim was plainly wrong):**

- **B1 — the verdict count.** Both documents said *"five of seven predictions are refuted"*. Four
  are refuted and three confirmed, and `SUMMARY.md` contradicted itself within one page. **The page
  now renders the tally from the record rather than from a sentence anyone typed**, and `check.py`
  recomputes it. It passed the checker because the word-quantity check verifies that a declared
  value occurs *somewhere* in the record, never that it is the right number for the sentence.
- **B2 — a disclosure the pre-registration made mandatory was missing, and its opposite asserted.**
  §2.1 required the page to say that Cleveland's `department` is a *weaker* analogue of provenance,
  because no one supplied Cleveland's records. Instead both documents wrote "who supplied the
  record" of all three catalogues. **The caveat is now on the page, in its own paragraph.**
- **B5 — "two of the five rules are relations between a value and the rest of the catalogue".**
  Wrong twice: the title-echo rule is a relation to the record's *own title*, which a reader could
  have judged had the sheet carried it; and that rule is not in the aggregate the audit tested at
  all (its κ is identical either way, so it fired on none of the sixty). **One** rule — the
  duplicate — is unvalidatable by a single-value reader. Corrected on the page, in the summary and
  in A4 above.
- **B6 — the informed pass was presented as a second reading.** All twelve changed labels are
  exactly "duplicate count ≥ 10 → says nothing", so the second labelling is close to a function of
  the count. §A4 disclosed the threshold and its post-hoc origin; the page and summary did not.
  **Both now say it, and say the pass is descriptive and not a validation.**
- **B8 — the blind sheet truncates every value at 1200 characters, disclosed nowhere.** Four of the
  sixty hit the cap, and at least one is shown to the reader ending mid-word — which is the very
  signal the truncated-tail rule exists to detect, introduced by the sheet. **The cap is now on the
  page and the affected rows are committed in `data/sheet-truncation.json`.**
- **B9 — "filling a free-text provenance field on every record in the sample"** contradicted the
  table three lines below it (736 of 2,000 = 36.80 %). It was the feasibility probe's figure,
  carried over — the same defect A3 names, one paragraph from its own correction. Corrected.
- **B10 — the home arm was rendered as failing a correction it was never entered into.** Its
  association carried no `bh_survivor` key and the generator printed the absent key as "no". The
  BH family is the three primary tests; **the tool now names that and the page prints it.**
- **B11 — "Nothing of these catalogues is committed to this repository" was false.** The two audit
  sheets carry sixty verbatim third-party values. **The sentence now says what is committed and
  why** — a blind audit that does not show what was judged is not checkable.
- **B12 — the page said P2's answer "is split" where the record and the badge say *refuted*.**
  *Split* is a defined verdict value here and no arm passed. Corrected.
- **B13 — "every figure a prediction is judged against comes from the held-out half" is false in
  two ways:** P1's completeness limb is over all records, and the duplicate rule is computed over
  the whole catalogue, both halves pooled — so the held-out broad rates are functions of the
  development half too. The rule is defined catalogue-wide, so no rate is wrong. **Both
  qualifications now stand above the first number on the page.**
- **B14 — "506 separate records — one for each leaf"** in the summary. The 506 is real; *one for
  each leaf of one manuscript* is an inference nothing in the record supports. Corrected to what
  was measured. The number also lived only in `SUMMARY.md`, which `check.py` does not read.
- **B15 — A5 above miscounted its own leak.** Two sheet values are byte-identical and a third is
  the same passage with a hyphen for an em dash; there is no fourth pair. **A5 is corrected below.**
- **B16 — "publishes a `description` field … on every record"** was never measured: the tool tests
  non-emptiness, never key presence. Corrected on the page.
- **B17 — K5 was reported as "none fired" for a catalogue where it was never evaluated.** C4 is a
  seeded sample by design, so the census check does not apply to it. **The tool now records that
  explicitly instead of skipping it, and the page says it.**
- **B18 — `median_rate_pct` was not a median** on even-length lists (it took the upper middle
  value). Fixed in the tool; it is exploratory and was never rendered.
- **B20 — "on one of the two portals in this study"** claimed of the prior-art paper something no
  passage we read establishes. Corrected to what the quoted evidence carries.
- **B21 — a published confidence bound below zero** (`[-0.0, 0.04]`, a Wilson bound for 0 of
  10,920). The frozen instrument is untouched; the display is clamped in this session's tool.

**Closed in the checker, because the adversary broke it twice:**

- **B3 — `check.py` never recomputed the audit.** On an isolated copy the adversary replaced the
  confusion matrix with 29/2/0/29, precision 0.9355, recall 1.0 — *the exact reversal of this
  session's central finding* — re-rendered, and **all 62 checks passed**. This was neither of the
  two disclosed residues: the generator was untouched and the lie carried numbers. **The checker now
  recomputes the confusion matrix, agreement, κ, precision and recall from the audit's own per-row
  evidence, and checks every row's reader label against the committed `audit-labels.json`.**
- **B4 — P7 and K4 were self-certifying.** The "published figures of 2026-09-08" that P7 is judged
  against were read from the file under test. Move the atlas measurement and that baseline together
  and P7 still recomputed as confirmed, with K4 — the condition that voids every cross-catalogue
  comparison — silent. **The baseline is now read from the 2026-09-08 artifact's own committed
  record**, which is in this repository.

**Recorded and not repaired, because repairing them after the fact is the thing a pre-registration
exists to prevent:**

- **B7 — the blind labels are not applied consistently.** Several Cleveland passages about a period,
  a technique or an artist's career are labelled *usable* where a near-identical one is labelled
  *says nothing*. The adversary computes the sensitivity: relabelling the five lookalikes to match
  takes κ from **0.0919 to −0.0109** and recall from **0.80 to 0.50**. **The labels stand as
  committed** — they were written before the join existed and relabelling them now, knowing what
  each does to the result, would destroy the only thing that makes them evidence. The page now says
  the recall figure rests on four rows of five and that the labels are contested, and the summary
  carries the sensitivity.
- **B19 — the pre-registration miscounts the frozen instrument.** §1.2 says "30 English
  continuation words"; `hollow.OPENERS` holds **28**. Its description of the chrome list implies
  fifteen markers where there are **14**. The pre-registration is immutable once committed, so this
  is filed here rather than edited there. Neither number is used in any computation.
- **S1 — the blind labels correlate with the fact the sheet withheld.** Four of the five *says
  nothing* labels sit on values carried by ten or more records, against twelve of fifty-five
  *usable*; Fisher two-sided **p = 0.0155**. Two readings — the sheet leaked, or copied texts really
  are more often generic — and this measurement cannot separate them. **Now computed by the tool
  rather than argued**, published in `results.json` under `audit.blindness_probe`, and said on the
  page.
- **S2 — the stated reason the concentration bar was unreachable was half wrong.** It is not the
  number of strata: the ratio's ceiling is one divided by the overall flag rate. The home arm's
  44.05 % gives a ceiling of 2.270 and its measured ratio was **2.27** — it sat exactly on its own
  ceiling. The conclusion was right and the cause was not; **the page now gives the correct one**.
- **S3 — the summary switched aggregates mid-sentence** ("187 of those 188 tripped our screen,
  while nothing else in the catalogue provably did" — the first is the broad rule, the second the
  strict one, and the broad rate elsewhere is not nothing). Corrected in the summary.
- **S4 — the framing of the third quoted passage was tendentious.** The sentence's grammatical work
  is to *distinguish* the authors' existence metric from completeness as others define it, not to
  overreach. The quote was complete and correctly restored; the gloss was not fair. **Rewritten.**

**Two checker holes the adversary named without exploiting, and which remain open:** the
`allowed_literals` list in `narrative.json` is honoured unconditionally, so a numeral can be put in
the prose and whitelisted in the same commit; and the numeral check admits 2-, 3-, 4- and 5-decimal
renderings of every number anywhere in `results.json`, which is a large collision surface for a
two-decimal figure. Both are stated here rather than closed.

---

## C. Corrections outstanding against earlier shipped work of this practice

Carried forward and unchanged, filed as dated events beside their artifacts rather than patched
into them (`STATE-OF-THE-FIELD.md` §4.10): the notice-level share 46.8 % → 48.9 %; 94.0 % mistyped
for 94.8 % four times; the `machine_blocked` column behind "45 %" not derivable from the data
shipped with it; session 153's *all five* being four of five. A1 above joins that list.

---

## D. Attacks run against this artifact's checker

Eight attacks, each on an isolated copy outside the repository. `check.py` runs 62 checks.

| # | attack | outcome |
|---|--------|---------|
| A1 | alter a digit on the page (`53.33` → `63.33`) | **fails** — byte identity and the numeral scan |
| A2 | flip a verdict badge on the page, refuted → confirmed | **fails** — byte identity |
| A3 | flip a verdict inside `results.json` | **fails** — the independent recomputation |
| A4 | put a number in the prose that occurs in no record | **fails** — the numeral scan |
| A5 | put an undeclared quantity in words in the prose (*nineteen*) | **fails** — the word-quantity scan |
| A6 | alter a quoted passage on the page | **fails** — the quotation check |
| A7 | **write the lie into `build.py` and re-render** | **PASSES** |
| A8 | **a false sentence carrying no number** | **PASSES** |

A1 and A2 are the attacks that defeated our checkers on 2026-09-08 and 2026-09-09. A5 is the class
session 155's checker missed entirely. **A7 and A8 are the residue, unchanged, and reported here as
failures rather than as future work**: this checker verifies numbers, spelled-out quantities,
prediction verdicts, the audit's own arithmetic and quotations, and takes the prose on trust. The
honest description of it is printed on the page where the claim is made.

**Three further attacks, after the adversary broke the checker twice (B3, B4).** The checker now runs
130 checks, and the two attacks that defeated it are re-run here against the repaired version:

| # | attack | outcome |
|---|--------|---------|
| A9 | reverse the audit result in the record: confusion 29/2/0/29, precision 0.9355, recall 1.0 | **fails** — the audit recomputation from the per-row evidence |
| A10 | move the home arm's figures *and* P7's own baseline together, so K4 stays silent | **fails** — the baseline is read from the 2026-09-08 artifact |
| A11 | rewrite `audit-labels.json` without re-running the measurement | **fails** — every row's label is checked against the committed file |

A9 and A10 are the adversary's own attacks, which passed 62 of 62 checks before tonight's repair.

---

## E. What the checker does not verify, stated plainly

`check.py` verifies that the page is a byte-identical render of the committed record, that every
numeral and every spelled-out quantity on it is derivable from that record, that every prediction
verdict recomputes from the raw numbers by code that does not import the tool which produced them,
and that every quoted catalogue value and outside passage matches the record.

**It takes the narrative prose on trust.** A false sentence carrying no number, written into
`data/narrative.json`, passes every check. That is the residue this practice reported as a failure
on 2026-09-09 and it is unchanged today. The byte-identity check closes the smaller hole the
Atelier reported against its own checker the same night — a substring test passing a page whose
digits had been altered — and that fix is adopted here with credit.
