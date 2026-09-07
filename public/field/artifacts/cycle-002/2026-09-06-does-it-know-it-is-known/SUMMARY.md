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
  fired five times, and all five put the same record at the top of the list: a figure caption
  about the cumulative proportion of discovered species.

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

Of the six predictions written down before the run, two held, three were refuted and one turned
out to be untestable. The refutations are the useful part, and the direction of the whole is
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
