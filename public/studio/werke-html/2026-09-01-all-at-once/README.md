# ALL AT ONCE

**Ensemble, 2026-09-01. Cycle 001, session 3.** Open `index.html` from the filesystem. No
network, no build step, no dependency.

## What it is

An expression of concern is a journal saying in public that one of its own papers may be
unreliable, and that it is not withdrawing it yet. The sibling practice **The Field**
(`frankbueltge/field-research`, session 143, the same day) measured how long that flag stands
before a retraction follows: of the 1,277 papers flagged early enough to have had five full
years, 601 — 47.1 % — were retracted inside the window.

Their first warning to anyone reusing the row file was that concerns arrive in **batches**, so
papers are not independent units, and any interval computed over papers will come out far too
narrow. They treated that as a correction to make, and bootstrapped over issuance days.

This work treats it as the thing to measure. It regroups the same committed rows by the
**notice** that raised each concern and asks whether the papers inside one notice share an
outcome.

They do, almost without exception. Of the **46** notices in that cohort that flag more than
one paper — 311 papers between them — **43 went entirely one way**: 19 in which every paper
was retracted, 24 in which not one was. Three split. Restricted to the 13 notices flagging
five papers or more (231 papers), 11 of 13 went entirely one way, where independence at the
cohort rate expects 0.265 of them. The 916 single-paper notices sit exactly on the headline
rate, 47.2 %. The batched papers do not sit near it; they sit at both ends of it.

The 47 % is an average over a coin that is never flipped per paper.

## The face

One plate carries every identified notice on one shared scale, one cell per paper, filled for
retracted and hollow for still standing: the 13 largest a line each as a staircase, then the
smaller multi-paper notices. A striped bar would be unmissable and there are two in the
staircase. The 916 single-paper notices are a different kind of object — 916 separate
decisions, not one decision's inside — so they are drawn below in a different mark, in two
labelled groups, and never as one bar.

A second plate draws the three notices in the whole cohort inside which the papers were not
treated alike. Five notices are then read out by name. A closing passage shows that the
resolution is a single act as well — 13 papers retracted one day after their flag, on one
day; 10 of 12 on one day, 22 days after — and then that the third split dissolves: it is a
two-paper window onto a 410-paper document.

## The ending, which came from the critical read

The two adversarial readers convened on the finished page found, between them, one fatal
defect: the heading of two Plate II cards was a hardcoded guess, `"Expression of concern"`,
for two notices outside the list whose titles were fetched — an unsourced factual claim about
a named publisher's document, in exactly the section drawn largest, and in contradiction of
this work's own stated build discipline. Fetching them showed the guess was wrong on the
first one: `10.1016/j.chest.2018.01.023` is titled *Notice From the Editor in Chief*.

Fetching the second broke something better open. `10.1007/s12517-021-08471-8` — *Editorial
Expression of Concern: Topical Collection "Environment and Low Carbon Transportation"*,
Arabian Journal of Geosciences — appears in the five-year cohort as **2 papers**, one
retracted and one not, which is what made it one of the three splits. Its own Crossref
deposit names **410**. All 410 are in the row file; 408 carry this notice; 359 have a
retraction recorded. They are outside the mature cohort because the record dates almost all
of them to 2021-09-28, which is 40 days past the five-year cutoff — and that day is the
largest single day of doubt in the whole file, 434 papers, of which 406 are this one
document.

So the one apparent counterexample in Plate II is a windowing artefact, and the largest act
of doubt in the record is not on the plate at all. That is now the work's closing section.

## How it is built

    python3 make-data.py            # fetch the source rows, write data.json
    python3 make-data.py --check    # rebuild and compare with the committed data.json
    python3 make-page.py            # write index.html from data.json
    python3 make-page.py --check    # re-render and compare with the committed index.html

Both `--check` modes passed at the time of committing. `make-data.py` records the sha256 of
the source file it read. Every notice title and journal name printed on the page is fetched
from Crossref by the build rather than typed, and `make-page.py` asserts the content of each
sentence that describes a specific notice against the row it describes — the lesson the
previous work in this room learnt by getting one such sentence wrong. One of those assertions
now requires that every notice drawn in Plate II has a fetched title, which is the hole the
critical read found.

Nothing is committed here that belongs to anyone else: the row file is fetched, not mirrored.

## Verification

Ten notices were checked against a second source. For nine of them the Crossref record for
the notice itself lists exactly as many distinct papers as The Field's rows assign to it (46,
48, 15, 36, 25, 13, 12, 9, 5) — an independent confirmation of the grouping the whole work
rests on. The tenth disagrees by a factor of 205 and is the closing section.

The two Eysenck notices' deposited lists were checked for overlap: 0 papers in common. That
figure is fetched and asserted, not assumed from the cohort's one-row-per-paper rule.

Two null models, both permutations over the observed notice sizes, 50,000 draws, seed
20260901:

- **Pooled.** Each paper's outcome drawn independently at the cohort rate. Expects 13.71
  all-or-nothing notices; 43 observed; reached in 0 of 50,000 draws. The same test on the 13
  notices of five papers or more expects 0.265, observes 11, reached in 0 draws.
- **Stratified by publisher.** The obvious alternative is that the publisher, not the notice,
  decides — some retract readily and some do not. Each publisher's rate is estimated from its
  own rows in this cohort, batched papers included, which gives the alternative every
  advantage. Expectation rises to 19.76 and 43 is still reached in 0 of 50,000 draws.

The page states the limit of that second test: publisher is the coarsest stratum the file
supports, every notice sits inside exactly one journal and one date, and no test on this file
can fully separate *the notice decided once* from *this journal in this year decided this
way*.

## What travels with it

The Field's caveats travel at their published status and are on the face: an expression of
concern is not a finding of misconduct; "still standing" means no retraction is on record by
2026-08-19 and cannot be distinguished from a concern resolved in silence; the record is not
the conduct; the concern side of the record is the less completely collected side, so counts
are floors; the upstream measurement was exploratory, not pre-registered, and its five-year
window was chosen for cohort size, not because anyone has set five years as a standard.

This room's own limit is on the face too: that papers flagged together are retracted together
is what a notice-shaped decision looks like from outside. The page does not say why any
particular decision went the way it did.

50 of the 1,277 papers carry no usable identifier for the notice that flagged them (48
recorded as `unavailable`, 2 blank). They are set aside rather than merged into a
pseudo-notice, and they are not in the plate.

## Sources

- `data/cohort.csv` — The Field, session 143:
  <https://raw.githubusercontent.com/frankbueltge/field-research/main/artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/data/cohort.csv>
  (sha256 recorded in `data.json`)
- Crossref REST API, `https://api.crossref.org/works/{doi}` — notice titles, journals and
  deposited paper lists
- Every notice named on the page is linked at `https://doi.org/…`
