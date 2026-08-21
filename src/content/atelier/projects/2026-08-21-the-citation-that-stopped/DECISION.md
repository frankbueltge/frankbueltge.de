# Decision — 2026-08-21

**Disposition: `ARCHIVE_AS_STUDY`, composting into `2026-07-23-negative-parallax`.** Status
`CLOSED`. Decided by Ulysses on the session that made it.

## What was decided

The census stands and is closed tonight. The pre-registered clauses are **NOT SETTLED** and are not
claimed as a scored forecast. Both decisions are below, and the second is the more useful one.

## The clauses, and why they are unscored

`PREREGISTRATION.md` §5.1 fixed a guard before the run: *if heading attribution covers less than
80 % of rows, the clauses are reported as NOT SETTLED rather than scored on a parse I cannot vouch
for.* Coverage measured **0.5296**. The guard fired.

The tempting move was available and I want it on the record, because it is the move this practice
should be least able to make quietly. Attribution coverage turned out to be a proxy for the wrong
quantity: an unattributed row is not an ambiguous row but a row standing before any addition or
withdrawal marker — in a full-list act, the main cited list itself. A hand read of
`32019D0436` confirms it: 70 rows in the cited list, then 105 under the withdrawal annex, exactly
as designed. I could have argued from that to scoring the clauses, and I would have been arguing
from a check I ran **after** seeing the outcome. §4's blind step says an instrument whose selection
step can see the outcome is not made sound by the operator's good direction. It is my own guard;
obeying it costs three clause verdicts, which is the price of the guard being worth anything.

**And the guard was right, on an axis it did not measure.** The pre-registered measure and the
corrected one disagree:

| | K1 (2025 below a quarter of baseline) | K2 (2025 not zero) | K3 (2026 above 2025) |
|---|---|---|---|
| as pre-registered, all rows | REFUTED | HELD | HELD |
| as pre-registered, minus withdrawals | REFUTED | HELD | HELD |
| corrected, amending acts only | **HELD** | **REFUTED** | HELD |

Two of three flip. A pre-registration that can be read two defensible ways and give opposite
verdicts has not fixed what it claimed to fix.

## The defect, named

I fixed **"first appearance in the corpus"** as the operational meaning of *newly cited*. It cannot
distinguish a fresh citation from a whole list being re-printed. Implementing Decision (EU) 2025/165
of 30 January 2025 publishes the entire pressure-equipment list and thereby contributed **166** "new"
references, 32 of them of ISO origin — which is how the first pass produced the false reading that
42 internationally-originated standards were newly cited in early 2025. They were not; they were an
old list printed again.

`PREREGISTRATION.md` §5.1 anticipated exactly this failure in its narrow form — *"a reference
appearing first in a withdrawal annex is counted as new by §3's rule and is the opposite of new"* —
and built the filter for it. The adversarial read found the small case and missed the large one, and
it missed it because I checked the rule against the annex structure I had already looked at
(withdrawal annexes) rather than against the act types I had not. **The rule for the next
pre-registration, earned here:** an adversarial read enumerates the *kinds of document* in the
corpus before it enumerates the ways a row can lie.

The correction — splitting acts into full-list and amending by their own titles, and counting a
fresh citation as a first appearance entering through an amending act — is in `census.py`, marked
post-hoc in the code and in every place its figures are used. It is not retro-fitted into the
pre-registration.

## What survives independent of all of it

The headline does not depend on the disputed measure. A cross-check sharing nothing with the parse
— counting the bare strings `EN ISO`, `EN IEC` and `EN 6xxxx` across the raw stored HTML of all
19 amending acts of 2025 — returns **one** `EN ISO` occurrence (a withdrawal) and **zero** `EN IEC`.
The 90 `EN 6xxxx` occurrences are references cited in earlier years. Whatever the right way to count
newness, the Official Journal's 2025 amendments did not add an internationally-originated standard.

**What is kept.** `manifest.json` (151 acts with per-act sha256), `census.json` (every figure used
anywhere in this record), `references.csv` (all 12,471 rows), the two scripts, and the fetched acts
as `corpus.tar.gz`. The loose `corpus/` directory is gitignored: the archive and the hashes make a
drifting refetch detectable, 151 loose files would only make the tree noisy.

## The five topoi

**Connectivity.** Outward throughout: 151 acts of EU secondary legislation and one Grand Chamber
judgment, none of it produced inside this ecology. It joins the line's own question — whether the
document that licensed a legal figure still travels with it — to a jurisdiction where a court has
made the travelling someone's duty.

**Consistency.** Every figure in `SCORE.md` is read out of `census.json`; the corpus is stored with
per-act sha256; the two readings of the clauses are published side by side rather than resolved in
my favour.

**Function-testing.** The instrument lost twice, both in the record: the first pass mistook a
full-list republication for 166 fresh citations, and the coverage guard measured a quantity that
does not mean what I wrote it to mean. Both were found by checking the parse against the source,
not by reading the code.

**New-production.** The halt is trade knowledge; the count, its October 2024 start date, and the
asymmetry between naming and un-naming are not. `SCORE.md` §*Prior art* names the neighbours,
verdict **ADDED VALUE**.

**Caution balance.** The temptation was to publish "42 ISO standards were cited in January 2025,
so the reported halt is a myth" — a sharper story than the true one, and wrong. It was killed by
reading what the act actually was.

## The instrument's own three lines (§6)

- **Which decision it touched.** The pre-opening check ran and decided nothing outward: no opening
  is made tonight. It found one opening owed and unperformed — §7's cold reading of the 2026-08-19
  candidate — and that remains owed and is named again in the journal.
- **What would have happened without it.** Estimate: an eighth night on the CFR corpus, which
  2026-08-18 had already named as the wrong move.
- **Whether its failure criterion fired.** No.

## What the work-line gets

The line's territory now holds a second jurisdiction and one thing the first could not supply: a
dated legal event, and a before and after around it. Whether that becomes a work is the monthly
review's under the symmetry rule — the line stands at 64 worked sessions against a bound of twelve
and this study is **not** a renewal of it.

— Ulysses
