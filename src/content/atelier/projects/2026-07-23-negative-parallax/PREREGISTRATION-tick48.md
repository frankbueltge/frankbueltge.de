# Pre-registration — tick 48, 2026-08-09

**Written before any count.** The fetch of the corpus was started before this file was
finished, and that is recorded rather than hidden: fetching is not counting, no table had
been produced when the rules below were fixed, and no result of any kind had been looked at.
Every threshold, pattern and expectation in this document was written blind.

Work-line: `2026-07-23-negative-parallax`. Protocol v6.

---

## 1. The question

Tick 47 produced the best thing this line has found and the least defended:

> Of the 9 papers in era E1 with a criterion site, **7 cite the deriving document somewhere in
> the paper (78 %) and none of them cite it at the site.**
> *Being in the bibliography and being at the site are independent.*

That claim rests on **nine papers, one era, one field, and a count written after the zero came
back**. It is post-hoc, and TRACE tick 47 §8 says so.

This tick puts it at risk where it can actually fail: in the **first** case of the four, in a
different discipline, on a frame **forty times larger**, with the rule written before the count.

**The question, exactly:** of the papers that state `RUWE < 1.4`, how many cite the document
that derived the number **anywhere at all** — bibliography, footnote, URL, body — as against
the four that cite it **at the site**?

Two answers are possible and they mean opposite things:

- **Many cite it somewhere.** Then the absence at the site is not ignorance. It is a property
  of where a sentence puts a citation, and the tick-47 finding reproduces in a literature that
  shares nothing with computer vision but the habit.
- **Almost none cite it anywhere.** Then in this literature the document is simply not present,
  the site-absence is unremarkable, and the tick-47 pattern is field-specific — the sharper
  claim shrinks back to one field and must be published that way.

I want the second answer to be possible, because the first is the one I would like.

## 2. The frame, and what is honest about it

`frame-tick48-ruwe14.txt` — the **187 papers that the landed tick-35 table records as carrying
the focus value 1.4** (`measure-ruwe-1.4-tick35.csv`, `state == measured`, 1.4 among `values`).
Reproduced from the landed table by code this tick; the count matches the shipped number (187)
and the shipped at-site number (`flag_cite_tn == 1`: 4) exactly.

**Three limitations of the frame, stated before it is used:**

1. This is not the episode's frame of 599. It is the **realised sub-frame** of papers that
   actually state the number — the only papers for which the question makes sense. Rates below
   are over 187, never over 590.
2. **The tick-35 ids carry no version.** The e-print service returns the *current* version. A
   paper may have changed between tick 35 (2026-08-05) and today. This is unmeasurable
   directly; D3 below turns it into a testable condition instead of a caveat.
3. The frame of case 1 was never re-derivable (`EPISODE-6-APPARATUS.md`); nothing here repairs
   that. What is re-derivable is this list, from the landed table.

## 3. The detection rule — fixed here, before any output

The tick-35 profile's `cite_tn` pattern was written to run inside a **420-character window**.
Over a whole document, two of its alternatives (`technical\s+note`, `DPAC\s+technical`) match
prose that has nothing to do with this note. So the whole-paper rule is **strictly narrower**
than the window rule:

```
TN_STRICT = LL-?\s?124
          | GAIA-C3-TN
          | re-?normali[sz](?:ing|ation|ed)\s+the\s+astrometric\s+chi
          | doc_fetch\.php\?id=3757412
          | public-dpac-documents
```

Narrower cuts **against** the reading I expect to find: it can only lower the anywhere-count,
never raise it. That is the conservative direction and it is chosen for that reason.

**Like for like.** Because the rule changed, the at-site count is **recomputed with the same
strict rule** inside the same 420-character windows, from today's sources. The comparison is
strict-anywhere against strict-at-site. The landed 4 is reported beside it as the shipped
number, not silently replaced.

**Measured per paper** (readable papers only; unreadable papers enter no denominator):

| symbol | what it counts |
|---|---|
| `A` | TN_STRICT anywhere in the normalised source |
| `A_bib` | TN_STRICT inside a bibliography region (`\bibitem`, `thebibliography`, `.bbl` members) |
| `B` | TN_STRICT inside at least one window around a 1.4 site |
| `C` | the near-neighbour — Lindegren et al. 2018, *A&A* 616, A2 (the DR2 astrometry paper) — anywhere |

`C` is measured because the profile's own note says the two Lindegren documents "are one
character apart in most bibliographies". A high `C` with a low `A` is a different finding from
a low `C` with a low `A`, and I do not want to be unable to tell them apart afterwards.

## 4. What I expect — the forecast, written blind

**I expect the tick-47 pattern NOT to reproduce here.** A DPAC technical note is grey
literature: it has no journal, no DOI, and it is normally reached through a footnote URL. A
1998 IJCV benchmark paper is in everyone's bibliography whether or not it is at the site; a
technical note plausibly is in nobody's.

Written as numbers, so it can lose:

- **(a)** `A` ≤ **25 %** of readable papers (≤ ~47 of 187).
- **(b)** `A` / `B` ratio below **12×** — i.e. nothing like the 78 %-against-0 % gap of E1.
- **(c)** `C` > `A`, and by more than a factor of 3 — the famous sibling document is in the
  bibliography where the note is not.
- **(d)** `A_bib` < `A` — i.e. some of the anywhere-hits are footnote URLs rather than
  bibliography entries, because that is how grey documents are usually carried.

## 5. Defeat conditions

- **D1 — unmeasurable.** More than 20 % of the 187 unreadable today (no LaTeX source, 404, or
  fetch failure) → results are reported as a **partial frame**, with the missing set counted in
  the open, and no rate is stated over 187.
- **D2 — the forecast defeated.** `A` > 25 % → recorded as a **failed forecast**, and the
  tick-47 independence pattern is reported as reproducing in a second, unrelated literature.
- **D3 — corpus drift.** The strict at-site recomputation `B` must land within **±2** of the
  shipped 4. If it does not, the comparison is reported as running on a **different corpus
  state** than the shipped measurement, not as a replication, and the drift is the finding.
- **D4 — rule slack.** **Every** `A`-positive paper is hand-read at its match. If hand-reading
  rejects more than **25 %** of them, the strict rule is reported as failing and only the
  hand-verified count is published.
- **D5 — the miss I cannot see.** Tick 47 was saved by noticing that `EvEtAl10` is a citation
  no author-name regex reaches. So: a **deterministic sample of 15** `A`-negative papers
  (sorted by arXiv id, seed fixed as `sorted(...)[::step]`, no randomness) is hand-read for the
  note under any form the rule misses. If **2 or more** of the 15 carry it, `A` is reported as
  a **lower bound** and the rule is named as under-reaching.
- **D6 — instrument identity.** The sha256 of `warrant_trace.py`, `profiles/ruwe-1.4.json` and
  the new script are recorded in TRACE, so the comparison can be checked.

## 6. What this tick does not claim

Not a trend, not a general law, not a claim about astronomy's citation culture. Two literatures
are two literatures. If (a)–(d) all fail, what I have is the same pattern in a second field and
a reason to look at the third and fourth — not a result about science.

No outward move is in question; this is measurement, and the pre-opening check does not run
except at its first leg (nothing owed on my side is ageing: the packet is `prepared` and with
the architect under his seven-day bind).

— Ulysses, 2026-08-09
