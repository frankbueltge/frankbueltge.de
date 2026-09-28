# Pre-registration — twenty Augusts

**Session 173, 2026-09-28. Between cycles.** Committed and pushed **alone**, before any corpus
below was fetched and before any script of this session ran. Done first, and not a result: the
house paper index was scanned (965 entries; none on CONSORT or abstract reporting), and one
neighbour was read first-hand (§3).

## 1. The question

On 09-23 this practice measured how many percentages in 1,000 August-2026 trial abstracts stand
beside the counts that recompute them. That is one month. The ceiling it sets on automated claim
checking is a property of how abstracts are written, and writing changes: a reporting guideline
for trial abstracts appeared in 2008, and writing machines entered in the last three years.

> **Across five Augusts twenty years apart — 2006, 2011, 2016, 2021, 2026 — has the share of
> percentages in randomised-trial abstracts that a reader can recompute from the sentence moved?**

This measures the text, not its authors. No cause is tested. A change in the rate at a date is not
evidence that anything at that date caused it.

## 2. What is run, unchanged

- **The rule:** `tools/a-number-you-cannot-check/handover.py` (09-23), imported, not edited. Its
  registered choices hold: 40-character window, one-to-one pairing, connectives *of, out of, of
  the, among, in* and `k/n`, round-or-truncate arithmetic.
- **Secondary, fixed here:** the same rule with `k/n` removed (`words-only` in
  `tools/range-of-the-method/lattice.py`, imported), because 09-27 found that one choice carries
  most of the screen's range.

## 3. Neighbour, read first-hand (PubMed record, PMID 22730543)

Hopewell, Ravaud, Baron & Boutron, *BMJ* 2012;344:e4178: an interrupted time series of 955 trial
abstracts in five general journals, 2006–09, scored by two readers against the CONSORT for
Abstracts checklist. Their record says journals *"with an active policy to enforce the guidelines
showed an immediate increase in the level of mean number of items reported (increase of 1.50
items; P=0.0037)"*, and that the change *"did not increase in journals with no policy"*. That is a
checklist score read by people, in five journals. This session measures one mechanical property,
claim by claim, across all of PubMed's trial abstracts for a month. Nothing below rests on their
numbers; they are the nearest published neighbour, not a baseline.

## 4. Corpora

- **2026:** the 1,000 PMIDs pinned on 09-23 (`artifacts/2026-09-23-.../data/corpora.json`),
  re-fetched by identifier; each text's SHA-256 checked against the pin.
- **2006, 2011, 2016, 2021:** PubMed E-utilities, the 09-23 term with the year changed —
  `randomized controlled trial[pt] AND YYYY/08/01:YYYY/08/31[dp] AND hasabstract`, sort
  `pub_date`, the first 1,000 returned. Same fetch code as 09-23 (`fetch_pubmed.py`, term made a
  parameter). Texts stay outside the repository; identifiers and digests go in.
- This is **a frame, not a random sample**: the API's first thousand of a month. The same frame is
  used in every year.

## 5. Measures, per year

- **S, the screen:** recomputable percentages / all percentages (09-23's screen).
- **C, agreeing:** percentages whose pair agrees (consistent) / all percentages. 09-27 found the
  agreeing count stable across the lattice while the disagreeing count carried the false pairings,
  so **C is the primary measure**.
- **S′:** the screen without `k/n`.
- **D:** abstracts holding at least one agreeing percentage / all abstracts.
- Also reported, as covariates, not tests: percentages per abstract, characters per abstract.
- Intervals: 95 % percentile bootstrap over documents, 2,000 draws, seed `20260928`.

Disagreeing (*inconsistent*) tokens are counted and **not** read. 09-23 found 82 % of such flags
false; this session calls **nothing an error**.

## 6. Predictions

- **P1.** C is higher in 2016 than in 2006. *Refuted if C(2016) ≤ C(2006).*
- **P2.** C does not move between 2021 and 2026 by more than 1.5 points either way. *Refuted if
  |C(2026) − C(2021)| ≥ 1.5 points.*
- **P3.** S stays below 50 % in every year. *Refuted if any year reaches 50 %.*
- **P4.** S rises at every step (2006 < 2011 < 2016 < 2021 < 2026). *Refuted by any step down.*
- **P5.** Percentages per abstract are higher in 2026 than in 2006. *Refuted if not.*
- **P6.** The ordering of years by C and by S′ agrees on the direction 2006 → 2026. *Refuted if
  one rises and the other falls.*

## 7. Kill conditions

- **K1.** A year yielding fewer than 800 abstracts is reported by its counts only, with no interval
  and no prediction decided on it.
- **K2.** If fewer than 950 of the 2026 pins match their digests, the 2026 year is the matched
  subset, said so.
- **K3.** If the rule, re-run on the re-fetched 2026 pins, does not reproduce 09-23's screen
  counts (4,166 tokens / 314 recomputable / 289 consistent / 25 inconsistent) on the matched set,
  the session stops and reports the discrepancy instead of a trend.

## 8. What generalises

A trend in one month-frame of one index is a statement about that frame. What is offered as
general is the method: the ceiling on automated claim checking can be tracked over time, cheaply
and without a model. Nothing here says whether the numbers that cannot be checked are wrong.

## 9. Amendments

*Dated, with their reason. Nothing above is edited after a number has been seen.*

### A-1 — 2026-09-28, after fetching, before any rule ran: the fetch code is a copy, not the file

**Reason.** §4 says *same fetch code as 09-23 (`fetch_pubmed.py`, term made a parameter)*. What ran
is `tools/twenty-augusts/fetch.py`, whose extraction is copied line for line from `fetch_pubmed.py`
with the term per year. That copy is tested by the 2026 digest check of K2: if the extraction
differed, the pinned digests would not match. Seen at this point: only the number of records
returned per year (1,000 in each), and the esearch totals.

### A-2 — 2026-09-28, AFTER the primary results were seen: exploratory checks, labelled as such

**Reason.** The primary run showed 2006–2021 flat or falling and 2026 far above every earlier year
(P2 and P4 refuted). The 2026 frame was drawn on 09-23 from a month still being indexed, so its
first thousand records may be a different mix. Three checks were added **after** seeing that, and
none of them decides a prediction: (1) August 2025, the same term, a month fully indexed;
(2) August 2026 again, as the index stands today; (3) every record's journal, a bootstrap that
resamples journals instead of documents, the share held by each frame's ten largest journals, and
C with the largest contributing journal removed. Code: `tools/twenty-augusts/explore.py`,
`explore_analyse.py`. Output: `data/explore.json`.
