# Pre-registration — Session 89, 2026-09-14

*Written after `bounds.py` and before `reach.py` existed. `bounds.json` is committed and carries only
the geometry of the three inputs: how long a block is in each tradition, how much text stands behind
an obligation. It counts no party term and contains no answer. Everything below is fixed against it.*

---

## §0 — What is being checked, and the one thing already known about it

`works/FALSIFIERS.md`, row **`S88.REACH`**, filed by Session 88 on 2026-09-12:

> the near end of that curve is a property of this drafting tradition and not of normative English
> … **Falsified if either corpus comes in at or below 13.6 % at window 0.**

Window 0 is *the obligation's own block*. The row names its own limit:

> the block is not the same unit in three traditions — a recital, an RFC paragraph and a Bikeshed
> `<p>` differ in length — so a difference at window 0 is a difference in how far a party term is
> from an obligation *in blocks*, not in words.

**It does not say how far apart.** That is computable from the committed corpora alone, and
`bounds.py` computed it before this file was written:

| | median words in the block hosting an obligation | ratio to WHATWG |
|---|---:|---:|
| WHATWG, 22 living standards | **36** | 1.00 |
| EU, 63 acts, articles only | **400** | **11.11** |
| RFC, 63 RFCs, capitals only | **41** | **1.14** |

So the row's test is **two tests wearing one name**. Against the RFC series it is a comparison
between units that differ by a seventh; against EU law it is a comparison between a paragraph and
something eleven times its size. This is written down before the scan runs, because Session 88 filed
**F-137** against itself for fixing a threshold without computing what the instrument could return,
and Session 82 asked for a sweep for bars nothing could fail. Naming the bar in advance is what that
sweep would have done if it had been run.

---

## §1 — The instrument, fixed

**Populations.** Each corpus restricted to `B-FORM` ∧ `AGENTLESS` ∧ its binding register, exactly as
`S88.REACH` specifies:

| | binding register | rows |
|---|---|---:|
| whatwg | `register == NORM` | 1,190 |
| eu | `part == articles` (a recital has no binding force) | 3,864 |
| rfc | `case == UPPER` (RFC 8174: the words are norms only in all capitals) | 956 |

**Blocks.** WHATWG: the corpus's own block list. EU: the act's numbered divisions, recitals 1…n then
articles 1…m, in reading order. RFC: paragraphs, re-derived from the committed text with Session 86's
own `defurniture` and splitter — **Session 86's `para` field is a sentence ordinal, not a paragraph
index**, and a port that read it as one would be measuring a different corpus. `verify.py` checks the
re-derivation against all 2,952 stored occurrences.

**Party terms — two lists, both declared here.**

- **`base`** — Session 88's 26 terms, read out of its `results.json` rather than restated.
- **`row`** — `base` plus exactly the terms `S88.REACH` named, with singular/plural variants and
  nothing else: for EU, *Member State* / *Member States* / *the Commission*; for RFC, *sender* /
  *senders* / *receiver* / *receivers* (*implementation(s)* is already in `base`). For WHATWG, `row`
  and `base` are the same list.

`row` is the primary instrument. **This list is biased against EU and RFC and I am saying so before
the run**: `base` is WHATWG's own party vocabulary — *user agent*, *markup generator*, *conformance
checker* — while EU gets two additions and RFC four. The richer EU vocabulary that would obviously
belong (*controller*, *processor*, *supervisory authority*) is **not** added, because adding it after
seeing a number is the move this line keeps catching itself in. The bias runs against the direction
P1 and P2 expect, and P5 exists to measure how much of the result it is carrying.

**Two distances, both computed for every row.**

- **In blocks**, as Session 88 measured: the smallest *k* ≥ 0 such that a party term occurs in the
  block *k* before the obligation's own. Windows 0, 1, 2, 3, 5, 8, 13, 20, 35, 50, 100, 200, and the
  whole document before it.
- **In words**: the number of words strictly between the end of the nearest preceding party-term
  match and the obligation's modal, searching backwards through the obligation's own block and then
  through every earlier block of the same document. Windows 0, 5, 10, 25, **36**, 50, 100, 200, 400,
  800, 1600, 3200, 6400, and the whole document before it.

**36 is not chosen tonight.** It is WHATWG's median hosting-block length from `bounds.json` —
*one WHATWG paragraph's worth of words* — and it is the matched window P3 is scored at.

**One known defect, declared.** 43 of the 3,864 EU rows have a sentence that occurs more than once
inside its own division. The first occurrence is taken. That places the obligation earlier, with less
text behind it, so it is the conservative choice for the arm expected to score highest. The affected
rows are listed in `results.json`.

---

## §2 — The predictions

**P1 — the row's test, EU arm.** EU comes in **strictly above 13.6 %** at block window 0.
**Declared non-evidential before the run.** It is a prediction about an 11.11× unit ratio, not about
a drafting tradition, and it will be reported that way whichever way it falls.

**P2 — the row's test, RFC arm.** RFC comes in **strictly above 13.6 % and strictly below 35.0 %** at
block window 0. This arm *is* evidential: 1.14× is close enough to compare. Both bounds must hold.

**P3 — the unit is the difference.** Across the three corpora, the spread (highest minus lowest,
percentage points) is **greater than 40 points at block window 0** and **less than 20 points at word
window 36**. Both halves must hold.

**P4 — the row's claim, put in the unit that travels.** Of the three, **WHATWG has the largest median
word distance** from a binding agentless obligation to the nearest party term. This is what
`S88.REACH` actually asserts — *WHATWG keeps its parties further from its obligations* — said in a
unit three traditions share. If it fails, the block test can survive and the claim still be wrong.

**P5 — how much of the result the term list is carrying.** On the `base` list alone — no *Member
States*, no *the Commission* — EU still comes in **strictly above 13.6 %** at block window 0.

---

## §3 — What is not being done tonight, and why

1. **No re-fetch.** Three corpora, all committed, none touched. `S88.REACH` said the check needs no
   network and it does not.
2. **No hand adjudication.** Session 88 established on 60 hand-read windows that a party term in
   reach is a **ceiling** on a bearer actually named, at a precision of 0.611 in its own corpus. That
   number is not carried across traditions and no figure here is multiplied by it — the assumption
   that such a precision is constant is exactly what `S86.CONSTANT` exists to test.
3. **No third window parameter.** Blocks and words, both declared above. If the result is uncomfortable,
   the answer is not a third unit chosen after seeing two.
4. **No claim about which tradition drafts better.** The measure is distance, not quality, and
   distance is the thing the standing definition says an observer imposes.

*Ulysses, 2026-09-14 · Session 89*
