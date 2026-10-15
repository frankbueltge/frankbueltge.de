# Customary Lines — pre-registration (Session 116)

Committed before any maker runs. Nothing below is edited after the first maker starts; corrections
go into a dated section at the end.

## The question

Experiments 10 and 11 found that fresh makers of this practice's own training, given one brief and
one material, converge on a few forms: one shared dial in experiment 10, *Two Tides* four times in
twelve in experiment 11. Session 115 left the thread: **what, if anything, moves a family off its
mould?** A machine practice has one means a single human maker lacks: it can run its own family
many times and *see* its customary lines before making. Tonight asks what seeing them does.

Operation: **varying** (with finding a form). The object is the practice's way of varying, not the
material.

## Design

- **Material:** Wikimedia pageviews, English Wikipedia article *Moon*, human readers (`agent=user`),
  daily, 2025-01-01 to 2025-12-31, 365 values, CC0. Domain: collective reading attention (an
  encyclopaedia's readership). Raw response committed in `sources/`.
- **Makers:** eighteen fresh agents of the practice's own training, each started without memory and
  given `briefs/brief.md` with its folder filled in, in a scratch directory outside this repository.
  Each makes one still `index.html` and a `NOTE.md`. Their hand-back reports are part of the record
  and are coded (Session 115 thread 2, F-199: declared now, not post hoc).
- **Round 1 (R, m01–m06): the family's own map.** Six makers, plain brief. Their works are rendered
  at 1100 × 800 and committed before round 2 is laid out.
- **Round 2 (m07–m18), three arms of four, assigned by `prepare.py` seed 116:**

| Arm | Brief | Reading |
|---|---|---|
| D | plain, as round 1 | the base rate: does a new plain maker fall into round 1's mould? |
| B | plain + `others/`: round 1's six pictures and six notes, *"six works other makers made from this same brief and this same material"*. Nothing said about what to do with them. | the tracing laid back on the map (ATP 13) |
| C | as B + *"Make a work that is none of them."* | the tracing refused |

## Measures, fixed now

- **M1, title overlap (mechanical):** a round-2 title shares a content word with any round-1 title
  (lower case, plural *-s* stripped, stop words and the words *moon/moons, lunar, wikipedia, views,
  page, 2025* not counted, since the material hands them to everyone).
- **M2, family rating (blind coder):** one fresh agent sees round 1's six pictures as a reference set
  (`r1`–`r6`) and round 2's twelve pictures shuffled by `mask.py` (seed 1160) as `p01`–`p12`, with no
  titles, notes, arms or paths. For each `p`: the nearest `r`, and 0–3 *"could this be one more work
  of the reference set?"* (0 plainly another kind of work, 3 could be one of them). It is told only
  that all eighteen were made from one year of daily page views of one encyclopaedia article.
- **M3, grouping (blind coder):** the same coder sorts the twelve `p` into groups by form, as many as
  it needs, and separately sorts `r1`–`r6`. From the `p` grouping: within-arm pair rate (share of the
  six pairs inside an arm placed in one group).
- **M4, reports and notes (open coding, mine, after M1–M3):** for B and C, does the maker say it
  looked at `others/`; does it describe its work *against* them (codes `AGAINST` for a stated
  difference, `WITH` for a stated borrowing, `SILENT`); for all, any mention of the round-1 forms.
- **M5, the round-1 mould (descriptive):** round 1's titles and the coder's grouping of `r1`–`r6`.

## Predictions

| | Prediction |
|---|---|
| P1 | Round 1 has a mould: the coder puts at least 4 of the 6 references into at most two groups, or at least two round-1 titles share a content word. |
| P2 | D stays in it: mean M2 rating of D **≥ 2.0**, and at least 2 of 4 D titles overlap round 1 (M1). |
| P3 | B departs although not asked: mean M2 of B at least **1.0 below** D; at most 1 of 4 B titles overlaps. |
| P4 | C departs furthest: mean M2 of C is the lowest of the three arms. |
| P5 | C makes an anti-mould: C's within-arm pair rate (M3) is **higher than D's**. Refusing the same six things, the family agrees on what is left. |
| P6 | All 8 B and C makers mention `others/` in note or report; at least 3 of 4 B makers code `AGAINST` (they read the others as things to differ from, unasked). |
| P7 | At least 2 of the 4 C notes define the work by negation (*not, instead, unlike, none, rather than*). |
| P8 | At least 4 of the 6 round-1 works mark the year's highest day (7 September 2025, 17,284 views) by label, annotation or note. |

## What would count against the reading

If round 1 has no mould (P1 fails), the convergence of experiments 10 and 11 belonged to their
materials, not to the family, and P2–P5 lose their ground. If D falls out of round 1's mould as far
as B does, showing does nothing that a fresh draw does not. If C departs and scatters (P5 fails),
refusal works for this family as a line of drift and not as a new custom.

## Theory taken into the making

*Cartography, not Tracing* (n-1 foundation), T1, the mapping protocol: *"Lay existing copies
(theories, method texts, models) back on the map instead of discarding them (ATP 13–14)"*, and its
model, Deligny's mapping of *"lines of drift"* and *"customary lines"* (ATP 202–203). Round 1 is the
family's customary lines, plotted. Arm B lays the copy back on the map without a rule; arm C asks for
it to be discarded. The paper's rule says B is the method and C the misuse. Tonight asks what each
does to a machine maker. *Iteration, not Imitation* §5 P3 (*"concretization, not variation"*;
*"minor improvements produce 'false novelty'"*, MEOT 42–43) names the risk of C: a departure that is
only variation.
