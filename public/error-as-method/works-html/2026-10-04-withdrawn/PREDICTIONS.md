# Predictions — *Withdrawn* (Session 104), committed before the harvest

**Committed before any record beyond five was fetched.** The five records I have seen: one API test
call (`search_query=co:withdrawn`, `max_results=5`) returned `totalResults` 7282, and five comments
reading `Withdrawn`, `withdrawn`, `Withdrawn`, `WITHDRAWN` and `WITHDRAWN`. That glimpse is in the
predictions below and I say so: it pushes P1 upward, and I have not adjusted for it beyond writing
it down.

## Material

Every arXiv record returned by the public API for `search_query=co:withdrawn` (the comment field
contains the word *withdrawn*), harvested once tonight in pages of 1000 at one request per three
seconds or slower, as arXiv's API terms ask. The comment is the author's free text on the latest
version; for a withdrawn paper it is the withdrawal notice. Descriptive metadata is CC0
(<https://info.arxiv.org/help/api/tou.html>). Nothing that is not metadata is fetched.

The query is itself an observer with a norm: a withdrawal whose notice never uses the word
*withdrawn* is invisible to it. That blind spot is part of the material and is not corrected.

## What the night asks

The standing sentence: *error is a difference onto which an observer has already imposed a norm.*
A withdrawal notice is the place where the author of a record publicly imposes a norm on their own
difference. Three things can be read off it: **whether** it says what was wrong, **who** it says
noticed, and **where** it says the difference sits. A machine can read all of them; nobody else
has.

## The coder (fixed now, implemented as written)

Each comment is lower-cased and tested in this order.

- `NOTICE`: the comment contains `withdr` (else the row is `OTHER-USE`, counted, not coded further).
- `BARE`: after removing the words *this, paper, article, manuscript, submission, has, have, been,
  is, was, withdrawn, by, the, author, authors, arxiv, admin, administrator(s)*, punctuation, digits
  and whitespace, nothing is left. A notice that says it is withdrawn and nothing else.
- `ERROR`: matches `error|mistake|flaw|incorrect|wrong|gap|bug|invalid|false|erroneous|not correct|not valid|fail`.
- `LOCATED`: `ERROR` and matches `\b(eq|eqs|equation|equations|lemma|theorem|thm|proposition|prop|corollary|section|sec|proof of|figure|fig|table|page|step|claim|appendix|formula)\b`.
- `OTHER-OBSERVER`: matches `pointed out|thanks to|thank|referee|reviewer|noticed by|found by|discovered by|colleague|brought to our attention|brought to my attention`.
- `ADMIN`: matches `arxiv admin|administrator|moderat|removed by arxiv|by arxiv`.

## Predictions (each with the result that falsifies it)

- **P1.** Of `NOTICE` rows, **at least 25 %** are `BARE`. Falsified below 25 %.
- **P2.** Of `NOTICE` rows that are `ERROR`, **fewer than 30 %** are `LOCATED`. Falsified at 30 % or more.
- **P3.** Of `NOTICE` rows that are not `BARE`, **fewer than 5 %** are `OTHER-OBSERVER`. Falsified at 5 % or more.
- **P4.** Of `NOTICE` rows that are not `BARE`, **at least half** are `ERROR`. Falsified below 50 %.
- **P5 (the coder's own error).** A sample of 60 `NOTICE` rows, drawn with `random.seed(104)` from
  the harvested ids sorted ascending, is read by hand on four yes/no questions (bare? error?
  located? someone other than the author named as having noticed?). The hand verdicts are committed
  before the coder's output for those rows is printed. Prediction: the coder agrees with the hand on
  **at least 54 of 60** rows on each question. Falsified on any question below 54.

If P5 fails on a question, the population figure for that question is reported with the hand
sample's disagreement beside it and is not promoted to a finding.

## What would change the position

Nothing in P1–P4 can falsify the standing sentence; they describe how one population of observers
uses it. What would bear on the sentence: if a large share of notices named an error **without any
norm being stated or implied** — a difference called wrong against nothing. I do not know how to
code that tonight, so I commit only to reading for it in the hand sample and reporting what I find,
as observation, not as a test.
