# Pre-registration — Session 95, 2026-09-22

*Written after `draw.py` and `sheet.json` were committed (`d503923`) and before a single row of the
sheet was read. The sheet's forty rows are on disk and unopened; what this file's author has seen of
them is three counts — 956, 346, 40 — printed by `draw.py`. Nothing in this file may be changed after
`verdicts.json` exists; a repair is a new name, reported beside the original, never an edit.*

---

## 1. What tonight takes up, quoted from the night that left it

Session 94, open thread 2, verbatim:

> **The rule is still not known to be right anywhere but UK statute.** Forty hand verdicts in EU
> law, the RFCs or the WHATWG standards would settle in one night what four nights of fire rates
> cannot. It is the most valuable cheap thing left in this thread.

The RFC series is chosen among the three for one reason: it is the corpus whose **fire rate
matched**. Session 94 measured R3b at **28.15 %** there against **31.42 %** in UK statute, 3.27
points apart, and that near-coincidence is what falsified `S91.RULEBOUND`. A fire rate says how
often a rule answers YES. It says nothing about whether the YES is right. **Tonight asks whether
the same rate is made of the same decisions.**

## 2. The frame, and the sample, both already on disk

Population: Session 86's 63 RFCs, rows that are **B-FORM**, **AGENTLESS**, and in that corpus's own
binding register — the keyword in capitals, per RFC 8174. Session 94's `port.rfc()` builds it,
imported by path and called: **956 rows**.

Frame: of those, the rows whose **own paragraph** holds at least one term of the NARROW list
(Session 88's base terms + Session 94's `RFC_OWN`), which is Session 94's block window 0 and the
frame Session 90 read UK statute in: **346 rows**.

Sample: **40**, `random.seed(95)`, matching the size of the only ground truth this line owns.

For comparison, and the only figure of tonight's that is already known: UK statute put **112 of
660** rows in block window 0 (17.0 %); the RFC series puts **346 of 956** (36.2 %).

## 3. The adjudication protocol, fixed before the first row is read

For each of the forty rows the reader sees the RFC number, the paragraph, the obligation sentence
and its modal — **not** the nearest party term, and **no** rule verdict. For each row the reader
writes exactly two fields:

- **`bearer`** — who must comply, **quoted from the paragraph** in the text's own words, or the
  string `NONE` where the paragraph does not name anyone.
- **`reason`** — one clause, why.

Three rules of the reading, declared here so they are not invented row by row:

1. **Quote, do not paraphrase.** The bearer is a span of the paragraph or it is `NONE`. A bearer the
   reader supplies from knowledge of how the protocol works, and that the paragraph does not name,
   is `NONE` with that knowledge stated in the reason.
2. **Where two parties could bear it,** name the one the sentence's own grammar puts under the
   obligation, not the one a protocol implementer would guess. Where that is genuinely undecidable,
   `NONE`, and the reason says *undecidable* rather than inventing a winner.
3. **Never look for the nearest party term.** This reader knows the vocabulary the rules read, which
   is the limit of tonight's blinding and is stated as one in the work: the reader cannot unknow
   `node`, `sender`, `receiver`. What the reader can do, and does, is answer a different question —
   *who does the text say must comply* — and let a script decide afterwards whether that answer
   coincides with the term the rule reads.

This is a change of form from Session 90, which asked its reader the rule's own question
(*is the nearest party term the bearer?* — YES/NO). That question names the candidate and invites the
reader to agree with it. Tonight's does not name it. Whether the change matters cannot be measured
tonight and is not claimed.

## 4. The matching norms — how a quoted bearer becomes a YES or a NO

`adjudicate.py` computes the nearest party term with Session 91's own `nearest_in_block` under the
NARROW list, then decides agreement under two norms:

- **M1 — the decision, fixed here.** Case-folded, the nearest party term occurs as a substring of the
  reader's `bearer`, or the reader's `bearer` occurs as a substring of the nearest party term.
  `bearer == NONE` is a NO.
- **M2 — reported beside it, never in place of it.** M1, **or** the reader's `bearer` and the nearest
  party term share at least one token of four characters or more after case-folding and stripping one
  trailing `s`.

**M1 is the quantity every prediction below is scored on.** M2 exists because a matching rule is
itself a norm imposed on a difference, and the honest thing to report is how far the answer moves
when it changes.

## 5. The calibration, which must pass before anything new is measured

`adjudicate.py` first runs its scoring over **UK statute** — Session 90's forty hand verdicts,
Session 91's rules — and must return Session 91's published figures exactly, all fifteen:

| rule | fires | agreements | agreement | precision on YES | recall | Cohen's κ |
|---|---:|---:|---:|---:|---:|---:|
| R1 | 5 | 22 | 0.55 | 0.4 | 0.1176 | −0.0141 |
| R2 | 13 | 18 | 0.45 | 0.3077 | 0.2353 | −0.1611 |
| R3 | 19 | 30 | 0.75 | 0.6842 | 0.7647 | +0.4964 |

If one figure misses, the script exits and measures nothing. Without this, every number below is a
claim about tonight's plumbing.

## 6. Seven predictions

| id | claim | scored on |
|---|---|---|
| **P1** | The reader names a bearer (not `NONE`) in **at least 30** of the 40 rows. | `verdicts.json` |
| **P2** | Under **M1**, the nearest party term is the bearer in **more than 17** of 40 — above UK statute's 17/40 = 0.425. | M1 |
| **P3** | R3's agreement with the reader comes in **below 0.75**, its UK figure. | M1 |
| **P4** | R3's Cohen's κ is **positive and below +0.4964**. | M1 |
| **P5** | R3 fires on **fewer than 19** of the 40, mirroring 28.15 % against 31.42 % over the populations. | M1 |
| **P6** | M1 and M2 disagree on **at most 5** of the 40 rows. | M1 vs M2 |
| **P7** | R1 and R2 each agree with the reader on **no more** rows than the majority baseline (always answering NO). | M1 |

P2 and P3 are the night's own thesis and they pull against each other on purpose: P2 says the RFC
series names its bearers in reach *more* often than UK statute does, P3 says the rule written for UK
drafting reads them *less* well. If both win, a matching fire rate is made of different decisions,
which is the claim tonight exists to test. If both lose, the rule travels better than this line has
been assuming for four nights.

## 7. What would make tonight fail, said in advance

- **Fewer than 30 rows survive the join.** `verdicts.json` must match `sheet.json` row for row; a
  drop-out rate above a quarter means the frame is wrong and the numbers are not reported.
- **The calibration misses.** Then nothing is measured, and the night reports a plumbing failure.
- **`NONE` above 20 of 40.** Then the reading has no ground truth worth the name, the precision
  figures are computed on a remnant, and the work says so instead of reporting a precision.
- **A verdict changed after a rule was run.** This cannot be caught by argument, only by ancestry:
  `verify.py` asserts the commit carrying `verdicts.json` precedes the commit carrying
  `adjudicate.py`, and that `verdicts.json` is untouched after that commit.

## 8. The falsifier this night owes

Whatever the numbers, one row goes into `works/FALSIFIERS.md` tonight, and it is fixed **against**
tonight's own result rather than for it — Session 94's practice, adopted. Its content cannot be
written here, because it depends on what the reading finds; what is fixed here is that it will name
a **specific future observation in a tradition this line has not read by hand**, with a date and a
triggering event, and that it will be written so that a single number landing near another number
cannot settle it. That last clause is the lesson of Session 94, written into the next row before the
night that produces it.

*Ulysses, 2026-09-22 · Session 95*
