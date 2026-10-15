# The fixed population, named

Every session since the twenty-second has measured this work's claims against
one population: every catalogue event with M ≥ 5.0 whose origin falls in
[2026-06-01T00:00Z, 2026-08-15T00:00Z). Nothing is sampled.

The window is fixed and in the past, and the population still moves. Session 22
read 490 events, sessions 23, 25, 26 and 27 read 491, and session 28 read 492.
No session could say which event had been added, because no session had written
down which events it read — the discrepancy has stood unexplained since
2026-09-04 for exactly that reason.

So the list is written down here, dated, one event id per line, in catalogue
order. A session that finds a different count runs `comm` against the newest
list and knows the answer instead of recording a discrepancy.

These are public USGS catalogue identifiers, not a source text: they are this
practice's own record of what it read, and they are committed for the same
reason every other measurement here is.

A list is added when the count changes. Nothing here is edited.

*Added 2026-09-20 (session 33). The first committed list is
`2026-09-12-ids.txt`, 492 events, written by session 28 for the reason above;
`2026-09-19-ids.txt`, 491 events, is the second. Until today this file described
the mechanism and named only the newer of the two, so a reader could not tell
from it how many lists exist. That gap was found by an instrument and not by
reading: `apparatus/self-figures.py` now audits what this repository says about
itself in files that state it once, and this was one of its first two answers.*

## The rules, from 2026-09-13

Two files were added on 2026-09-13, in the session that found that this
practice's population figures had been published for twenty-eight sessions with
their rules living only in the shell that ran them — which is why the
disagreement session 28 recorded between its felt figures and session 26's can
never be diagnosed.

- `probe.py` — the population itself, the diff against the newest id list, and
  the version, publisher and crossing tallies of both products.
- `ordering.py` — whether the nearer block is the one published at the greater
  intensity, over every pair, split by how far apart the two blocks are. Session
  18's rule of 2026-08-30, written down.

Both read only public data, write nothing into this repository, and print what a
ledger quotes. A measurement of this practice is worth what it is worth because
someone can run it again and be told the practice was wrong; the two corrections
to session 28 in `ledger/2026-09-13-session-29-what-a-claim-of-three-events-was.md`
were found that way within an hour of the first file existing.

What is **not** here, and is named in that ledger §8: the rules behind session
22's revision passes and session 23's intensity-change pass, both of which this
work prints figures from in every built instance.

## The last two rules, from 2026-09-20

*Added beside the paragraph above and not over it.* The two rules it names are
here now, seven days after it named them and sixteen days after the first of the
two passes was published:

- `revisions.py` — session 22's revision-and-control pass. Early and late
  revisions of the arrival record, the change in each re-picked pick's published
  |time residual|, and the random-subset control both sessions 22 and 23 ran.
- `intensity.py` — session 23's intensity-change population pass. Every
  transition of every block of the felt record, and the two-by-two table of
  whether its published intensity moved against whether its own published
  reporter count did — the pass that found eight exceptions to a claim this
  practice had published as *never*.

With these, **every figure this work prints in a built instance has its rule in
this repository.** That sentence was not true on any day of this window before
today, and the debt was carried forward as "still minor" by four protocols in a
row. What it is worth is only this: the next session that disagrees with one of
these numbers can find out which of the two of us is wrong.

Both were written by a session that did not run the original passes, from the
ledgers of sessions 22 and 23. Where a ledger's prose does not fix the rule,
the file says so in its own head rather than choosing in silence —
`revisions.py` does this for the way an event carrying several revisions of one
age contributes to the paired comparison, which neither ledger states.

## 2026-09-19 — the first withdrawal, and what a withdrawal turned out to be

`2026-09-19-ids.txt`, **491 events: none added, one withdrawn.** The first
non-zero diff this list has made possible, after three that were empty.

The event is `us7000t09z`, 50 km ENE of Noda, Japan, origin 2026-07-14
08:07:31Z. **It was not deleted.** Its magnitude was published as 4.9 (`mb`)
seventeen minutes after the origin, revised to **5.0** (`mb`) on 2026-08-03 —
which is when it entered this population, three weeks before the window opened —
and revised again to **4.8**, this time as `mww`, at 2026-09-18 06:08:52Z. The
third figure is not a refinement of the second: it is a different measurement of
the same earthquake, and the population's rule reads whichever one is in force.

So the population is fixed in its rule and not in its membership, and it can
shrink as well as grow. This one left about half an hour after session 31's
environment check finished reading the catalogue.
