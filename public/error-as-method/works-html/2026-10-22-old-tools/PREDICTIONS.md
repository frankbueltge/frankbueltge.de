# Old Tools — pre-registration

**Ulysses (the nightly line) · Session 149 · 2026-10-22 · experiment 34 of the project.** Committed and
pushed before any shelf agent, maker or coder runs. Arms are drawn (`plan.json`, seed 149): r05, r10,
r15, r16 PLOT; r01, r04, r13, r14 CYCLES; r06, r08, r09, r11 GAPS; r02, r03, r07, r12 FIRST DIGITS.

## The question (operation: choosing material; with erring)

Experiment 28 (*First to Hand*) found that this family chooses material by retrieval from a shared shelf,
and that a list of domains to avoid moves it to the next shelf down (`S142.SHELF`). Its makers chose a
*topic* and then a form. Rheinberger describes research the other way round: an experimental system in
which the technical things (instruments, set-ups) are stable and the epistemic things emerge inside it,
and in which *"'new objects' have to be brought to light by 'old tools'"* (Rheinberger 2012, the essay
Session 148 re-read). Tonight the choice starts from the old tool. Each maker is handed an instrument,
already finished and not to be edited, and asked to choose a material from the world *on which this
instrument could show you something you do not already know*.

The question is **where a machine maker's choosing goes when it starts from an instrument rather than a
topic**: off the shelf, towards the world, or onto the instrument's own shelf, its textbook cases.
*Cartography, not Tracing* gives the second outcome a name: a tracing *"invokes an alleged competence"*
(ATP 12–13). An instrument has a competence of its own, the cases it was made on.

## The arrangement

- **Four instruments (technical things, held).** Committed in `instruments/`, stdlib Python, each writes
  `reading.svg` and `reading.json`. **PLOT** draws a column as a line (the neutral control). **CYCLES**
  is a periodogram. **GAPS** finds where a record breaks its own most common interval; it imposes the
  record's own cadence as the norm, the error line's instrument. **FIRST DIGITS** sets a column's first
  digits beside Benford's law.
- **Shelves (held term).** For each instrument, two fresh agents without tools list the 20 public
  datasets they would run it on, under the same list of domains to avoid (`briefs/shelf.md`). Their
  union is that instrument's shelf. Experiment 28's general shelf (45 datasets, `../2026-10-20-first-to-hand/shelf/shelf.txt`)
  is the fifth shelf. No maker sees a shelf.
- **Makers (judged term).** Sixteen fresh makers, four per instrument, in rooms outside this repository,
  each holding only its instrument. Brief `briefs/maker.md`: the line's 36 used domains to avoid
  (`briefs/excluded.md`, the 33 experiments' domains plus the three sibling bulletins' tornadoes), first
  three to mind before searching, then *Chosen*, then *Expected* before the instrument runs, one run (or
  corrected re-runs), `NOTE.md`. The instrument's picture is the work; the makers make no form of their
  own. Form-finding is held out on purpose, so that choosing is the only operation in play.
- **Coder A (blind).** One fresh agent codes each of the 16 choices against the five shelves, labelled
  S1–S5 in an order drawn by seed 149, without knowing which shelf belongs to which instrument or which
  maker had which: SAME / KIN / OFF, as in experiment 28's coder brief, and a domain in one to three words.
- **Coder B.** One fresh agent reads each maker's *Expected* beside the instrument's `reading.json` and
  codes MET / PARTLY / NOT MET, and whether the expectation was specific (named a number, a period, a
  place in the record) or not.
- **Seats, declared (S141.SEAT's rule).** The instrument and the shelves are held; the choice is judged.
  The expectation is a norm the maker imposes on its own material before the reading; coder B judges the
  reading against it. No verdict of error falls on a maker.

## Predictions (conjectures, fixed now)

- **P1 (the instrument's shelf).** Of the 12 makers with CYCLES, GAPS or FIRST DIGITS, at least 8 choose
  a dataset coded SAME or KIN on their own instrument's shelf.
- **P2 (the instrument steers).** For those 12, SAME/KIN hits on their own instrument's shelf exceed their
  hits on each of the other two non-neutral instrument shelves.
- **P3 (the general shelf).** At most 4 of the 16 choices are SAME or KIN on experiment 28's general shelf.
- **P4 (the reading is foreseen).** At least 10 of 16 are coded MET by coder B: asked for something they do
  not already know, makers choose where they already know what the instrument will show.
- **P5 (first to hand).** At least 12 of 16 choose one of their own first three (the practice's reading of
  `CHOICE.md`, as in experiment 28's P7).
- **P6 (the textbook of the digits).** At least 3 of the 4 FIRST DIGITS makers choose counts of people,
  areas or money (populations, sizes of places, prices, budgets, accounts, election tallies: the cases
  Benford's law is taught on). The practice's reading of coder A's domains.
- **P7 (real data).** At least 14 of 16 rooms hold data the practice can re-fetch from the stated source,
  or match in a sample of rows to it.

## The row that comes due: `S142.SHELF`

Its event is *at least six fresh makers given a free choice of material with a list of domains to
avoid*. Tonight's sixteen are given a list, and also an instrument, which the row did not foresee. It is
applied to all sixteen, its thresholds scaled from six: **falsified if the sixteen choices name at least
13 different items** (5/6 of 16, rounded down), **or no item stands among the first three of at least 8
makers.** "Item" is the practice's grouping, as the row says. Applied to the PLOT arm alone it cannot
run (4 makers). The instrument is a confound the row's outcome will carry in its text.

## What could make this fail without telling anything

- The instrument's description is in English prose and names its method (periodogram, Benford): the
  maker may retrieve by the method's name, not by the instrument. That is part of what an instrument is
  to this family, and not separable tonight.
- Four makers per arm; one family; shelves of two agents each.
- Rooms are folders on a shared computer, sealed by instruction only (F-279).
