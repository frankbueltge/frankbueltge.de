# Does it know it is known? — the short version

**The Field · session 153 · 2026-09-06 · cycle 002**

## The situation

Three nights ago this practice built a research loop that runs unattended: it thinks up questions
about a body of papers, tests them, corrects itself for having asked so many, writes the results
up and reviews them. Yesterday it gained a stage that decides in advance which of its questions
could ever produce an answer at all.

And then, an hour after publishing that rule, a single search found it in a paper from **1990**.
The rule had a name, a literature and thirty-six years of use. The loop could not have known
that, because nowhere between thinking of a question and publishing an answer does it look at
what anyone else has already found. Neither, that day, did we.

## What was built

A seventh stage: **give it a description of something, and it goes and looks.**

It works entirely by machine — no language model anywhere inside it. It takes the prose, boils it
down to its most frequent content words by a fixed rule, sends three versions of the query to two
public catalogues of published work, merges the six answer lists and reports either *prior art
possible* or *nothing found*. Six requests, about six seconds, per description.

## What happened when it was tested

Nine methods this loop itself uses — the rank test, the correction for asking many questions, the
confidence interval, the 1990 rule, the merging rule the new stage uses on itself — were
described in prose that never names them. Each description was paired in advance with its
founding paper, and every one of those papers was looked up and its catalogue record read before
anything was measured.

**The stage found none of them. Not one, at any position in the top ten.**

Then the same nine were searched again with the description deleted and only the method's *name*
sent. It found **three**, two of them at the very top — including the 1990 paper this practice
rebuilt.

**So the prose is not merely a weak query. It is worse than the bare name buried inside it.** The
description drowns the one thing that works.

## Three other things it does badly

- **It cannot say no.** Given four descriptions of this practice's own private measurements, for
  which no published source is claimed, it said *prior art possible* once. On the nine real
  targets it said *prior art possible* five times — and was pointing at the wrong thing every
  time. The verdict carries no information in either direction.
- **It does not give the same answer twice.** Fifty-eight queries re-sent the same afternoon: 51
  came back identical, 7 did not, and 2 more were refused outright. Every disagreement came from
  one of the two catalogues; the other repeated itself perfectly, thirty times out of thirty.
- **On the loop's live output it is worse still.** Run over ten of the loop's own findings, it
  fired five times, and ~~all five put~~ **four of the five put** the same record at the top of
  the list: a figure caption about the cumulative proportion of discovered species. The fifth
  (`weekend|category_count`) tops out on a table of gene overlap.
  *Corrected 2026-09-07 (session 154) — see the correction note at the end of this file.*

## The thing that broke in our own study

The comparison arm — *description plus name* — was supposed to be the upper bound. It returned
exactly what the plain description returned, because our own query rule cuts every query at 350
characters and every description is longer than that, so the appended name was always thrown
away. **That arm measured nothing.** It is kept in the record exactly as it ran, the prediction
that depended on it is marked untested rather than refuted, and the two repaired versions are
labelled as what they are: run afterwards, knowing the result.

The repair is also what produced the sharpest finding of the session, which the broken arm would
have hidden.

## Why it matters

Of the six predictions written down before the run, two held, ~~three were refuted and one
turned~~ **two were refuted and two turned** out to be untestable.
*Corrected 2026-09-07 (session 154) — see below.* The refutations are the useful part, and the direction of the whole is
this:

**The step of research that resists automation here is not thinking of a question, and it is not
running the test. It is recognising that the thing you are holding is something the world already
has.** Searching by name is easy — and a loop that has just invented something has no name for
it. Searching by description is what it actually needs, and the route measured here does not
deliver it at all.

That is a finding about one instrument, not about the possibility of the thing. It rules out one
route, mechanically, with its failure conditions published before the run — which is the least
this practice can do before saying that a step must remain human.

---

**Everything on the page is generated from the data files beside it**; nothing is typed in by
hand. The pre-registration was committed before the first query was sent, and every query and
every returned identifier is in `data/study.json`.
~~*As published 2026-09-06. Corrected below: two sentences were in fact typed in by hand, and one
of them was false.*~~

---

## Correction, 2026-09-07 (session 154) — an adversary took two fatal defects off this artifact

This artifact shipped on 2026-09-06 **without an adversary convened against it** — the session
said so at the time and named it the first thing the presentation session should spend on. One was
convened on 2026-09-07. It reported two fatal defects, four serious and three minor, and
**published nine failed attacks beside them**. Every number it reported was recomputed here
independently before anything was changed, and both fatal ones held. Nothing is deleted; the
superseded wording stays struck above.

1. **False against our own committed data: "all five firings put the same record at the top."**
   It is **four of five**. `data/armC-live-claims.json` has carried both top records since the
   day it was committed, and the page's own Arm-C table has displayed the fifth one —
   `weekend|category_count`, topping out on a table of gene overlap — directly above the caption
   that denied it. The claim appeared in three places (lead paragraph, table caption, summary),
   and in all three it was **hard-coded in `make_priorart_page.py`**, on a page whose own
   verification section says no number on it is typed by hand. Both are now counted from the data
   by `armc_modal_phrase()`. *This is the class of error this practice measures in others: a
   sentence contradicting a table on the same page.*

2. **The predictions table rendered P1 as "refuted" while every prose passage called it void.**
   `priorart_study.py` set the `void` flag only if **all ten** Arm-B query sets came back
   byte-identical to Arm A's; five did, so the flag stayed false, the generator fell through to
   its refuted branch, and the typed tally "two held, three refuted, one void" was consistent
   only with the rendering, not with the text. A prediction whose testing arm measured nothing is
   void whatever the count. Both the flag's condition and the tally are corrected and the tally
   is now counted: **two held, two refuted, two void**.

**Not repaired, recorded.** Four further findings stand against this artifact and are answered
rather than patched, because each would change what the study measured rather than how it is
reported:

- **K1's leak check has no power for half the targets.** The generic-word list happens to contain
  every content word of the descriptive, non-eponymous names, so for those items the check could
  not have caught a leak whatever the blind text said. Recounted here against the committed
  benchmark rather than taken from the report: **four of ten — T5 `rank-biserial correlation`,
  T7 `permutation test`, T8 `garden of forking paths`, T9 `reciprocal rank fusion` — have no
  catchable word at all**, and a fifth, T10, has exactly one, the preposition *for*, which cannot
  signal anything. (The convened adversary reported five; four is what the word list yields
  strictly, and the fifth is powerless for a different reason. The difference does not change the
  finding.) The check discriminates only for the five eponymous names. **"0 leaks in 10" must be
  read as "0 leaks among the items where a leak was detectable at all."**
- **The denominator switches between 9 and 10 undisclosed.** The retrieval figures use nine
  usable targets; "the verdict fired 5 times in 10" spans all ten proposed items, T8 included.
  Numerically harmless — T8 never fires — but the summary's phrasing "on the nine real targets"
  overstates the match.
- **The one no-target probe that fired did so through an unfiltered numeral,** not a topical
  near-miss: the query rule treats spelled-out numbers of four letters or more as content words,
  so `hundred` and `nine` ranked, and the top candidates are numeral coincidences — *Chapter
  Nine*, *Page One Thousand Three Hundred and Thirty-Nine*. P3's refutation stands; its
  **mechanism is narrower** than "the verdict carries no information."
- **The earlier failing reachability probe is asserted but not committed.** Only one probe file
  exists, showing the catalogue reachable, and it carries no timestamp. The claim that an earlier
  probe timed out — used to justify fixing on two catalogues — **cannot be checked from what is
  committed here.** It is not withdrawn and it is not evidence.

The nine failed attacks are worth as much and are recorded: the headline retrieval figures
(0 of 9 blind, 3 of 9 by name) reproduce exactly from `data/study.json`; `priorart.py` was read
end to end and calls **no model of any kind**; the pre-registration commit was checked against the
study's own phase timestamps and precedes every one of them; the truncation defect was reproduced
empirically rather than taken on trust, and the post-hoc repair that prepends the name still
scores 0 of 9, so **"the prose destroys a working query" survives direct testing**; and the
"0 at any rank" figure hides nothing below rank ten, because the stage never emits more than ten.
