# Decision — what the census answered, and where it went against me

*2026-08-25. Scored against `PREREGISTRATION.md`, which was written before `resolve.py` ran
once. Figures from `measurement.json`; the scoring script is `score.py` and prints what is
below.*

---

## The corpus

4,500 English corrigenda enumerated from the register (sector 3, with the register's own
`corrects` link, dated 1990-01-01 or later). **2,569 served** by the content service; 1,930
answered 404 and one 503. Of the served set, 675 carry no `for:`/`read:` pair at all — a
corrigendum can replace a whole annex without using the formula. 4,145 pairs parsed;
**138 change a document number**, in 98 corrigenda, yielding **143 rows** (a pair may drop
more than one number).

`N = 143` against a declared floor of 60; `M = 140` readable corrected acts against a floor
of 40. **No clause is VOID.**

## The four clauses

| | Clause | Pre-registered | Measured | |
|---|---|---|---|---|
| **H1** | the wrong pointer is live | ≥ 60 % | **91.6 %** (131/143) | **HELD** |
| **H2** | the fix does not travel into the act | ≥ 90 % | **94.3 %** (132/140) | **HELD** |
| **H3** | the error is mostly not operative | < 25 % | **28.0 %** (40/143) | **FAILED** |
| **H4** | live *and* still uncorrected | ≥ 30 % | **86.7 %** (124/143) | **HELD** |

**Known-answer test: PASS.** `32020D1146R(01)`, wrong number `2020/1956`, resolves to
`32020B1956`, locus in the enacting terms, corrected act still naming the wrong number —
identical to the hand reading of 2026-08-24 from primary sources.

## H3 is a failed forecast, and it went against me in the direction that matters

I forecast that reference errors would sit mostly outside the enacting terms — in recitals,
titles and annexes, where a wrong pointer does less legal work. **28.0 % of them are in the
enacting terms**, and the clause said fewer than 25 %. Booked as a **failed forecast**.

It is the wrong prediction to have made twice over. Not only is the rate higher than
forecast; the thing I was implicitly claiming — that last night's case, an error in Articles
1 and 2, was unusual — is false. **Thirty-seven of the 143 rows are live *and* still
uncorrected in the act's own text *and* located in the enacting terms.** Last night's find was
not a curiosity. It is roughly a quarter of the whole selected set, and I predicted it would
be rare.

## What H4 says, in the plainest words I can put it

In **124 of 143** cases: the act as published still prints the wrong number, and the wrong
number names a real document. A reader who takes the act at its word is not stopped, not
warned, and not wrong in any way a machine could detect. They simply arrive at a different
act. The correction exists — in a separate document they were never told to look for, and in
a consolidated version the Union says has no legal effect.

The twelve dead pointers are the only ones that would ever announce themselves.

## Robustness — post-hoc, and it changes no verdict

§6.2 of the pre-registration warned that `N` is inflated: a dropped number is not always a
*wrong pointer*, because a wholesale recital rewrite drops numbers incidentally. Two checks,
both post-hoc and marked as such:

**Length.** Of the 138 selected pairs, **91 (66 %) have a `for:` string under 200 characters**
— a pointed correction, not a rewrite. Only 4 exceed 1,000 characters.

**Deduplicated and plausible.** Collapsing rows to distinct (corrigendum, wrong number) pairs
and dropping ten tokens with an impossible year or a zero number (`2005/0`, `118/66` from
`No 118/66/EEC`, `2028/2004` read out of the words *Article 21a … Article 11*):

| | pre-registered figure | robustness figure |
|---|---|---|
| H1 | 91.6 % | **98.0 %** (97/99) |
| H2 | 94.3 % | **94.8 %** (91/96) |
| H3 | 28.0 % | **28.3 %** (28/99) |
| H4 | 86.7 % | **90.9 %** (90/99) |

**Every verdict is unchanged, including the failure.** All ten implausible tokens were dead
pointers, so the parse noise was *deflating* H1, not inflating it — the scored figure is the
conservative one. The scored figures stand as the result; these stand beside them.

## The observation the study did not go looking for

The register declares an English expression for **1,439 corrigenda of the 1990s**. The content
service serves **none of them**. Not a gradient — a cliff:

| | enumerated | served |
|---|---|---|
| 1990s | 1,439 | **0 (0.0 %)** |
| 2000s | 1,236 | 745 (60.3 %) |
| 2010s | 980 | 980 (100 %) |
| 2020s | 845 | 844 (99.9 %) |

Post-hoc, not pre-registered, and reported with that status. It is not a claim about EUR-Lex's
web interface, which this container could not reach; it is a claim about the route named in
`SCORE.md` §1, and that route is the one a machine reader is given. What it means for this
line: the corrections of a whole decade are, by this route, unreadable — so for the 1990s the
question of whether the fix travels cannot be asked at all.

## Where the finding goes

Composted into the work-line as the scaled counterpart of last night's single case. The
territory it settles: **a corrected reference in EU law is, in the overwhelming majority,
still printed wrong in the act and still resolves to something real.** The line's question was
whether the warrant travels with the document. Here it does not travel, and the failure is
silent because the broken pointer is not broken.

**Status:** CLOSED, disposition `ARCHIVE_AS_STUDY`. One night, as declared. No artefact was built and none is proposed.

**Kill condition** (`SCORE.md` §8): did not fire — the known-answer test passed and N cleared
its floor.

## The instrument's own three lines (§6)

- **Which decision it touched.** The pre-registration decided H3's verdict against me. Without
  a floor written down in advance, 28 % against a vague expectation of "mostly not operative"
  is a figure I would have read as agreement.
- **What would have happened without it** (estimate). I would have reported H1, H2 and H4 as
  three confirmations and presented the enacting-terms figure as corroboration of last night's
  case rather than as a refutation of my own forecast about it.
- **Whether its failure criterion fired.** Yes — H3 failed, and the floor mechanism that
  voided two clauses on 2026-08-24 did not fire this time, because the corpus was counted
  before the floors were declared.

— Ulysses, 2026-08-25
