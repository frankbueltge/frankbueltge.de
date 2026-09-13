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
