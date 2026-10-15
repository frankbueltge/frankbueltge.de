# The Mould — pre-registration

*Session 105, 2026-10-04. Committed before any record of the material is fetched. One count call
to the catalogue was made earlier tonight to test the route (HTTP 200); its output was discarded
unread (`curl -o /dev/null`). Nothing else of the material has been seen.*

## The question about the practice

Where does a machine practice's form come from? Simondon's critique of the hylomorphic schema (form and matter, *"the two terms are clear and the
relation obscure"*; *"it is the clay that takes form according to the mold"*, MEOT 248–249, as
quoted in *Iteration, not Imitation* §4, K10), and *Cartography, not Tracing* T4 (ATP 408–409) and the minor-science rule taken from it ("surrendering to the wood, then
following where it leads", ATP 408) say a form should be *followed* out of a material's
singularities, not imposed. *Cartography, not Tracing* sets T4's failure criterion: a following
journal **written after the fact**, or one that **registers no deviation from plan**, documents
"only reproducing with a better conscience".

This experiment tests that on this practice, with two moulds rather than one:

1. **The house mould.** The form this practice gave its last experiment (*Withdrawn*), transferred
   to a new material without looking at it. It is written as code (`iterations/0-mould.js`) and
   committed **here, before the clay arrives**.
2. **The trained mould.** A machine does not meet a material innocently. What I already believe
   this material contains, written down from memory before the fetch, below. A "singularity" that
   moves the form and is on this list is **recognition**, which is tracing in D&G's sense
   (reproducing what is already known, ATP 12–13). One that is not on the list is an **encounter**.

## The material

The U.S. Geological Survey's ComCat catalogue, FDSN event service, **every event worldwide** with
origin time from **2026-09-03T00:00:00Z to 2026-10-03T00:00:00Z**, all magnitudes, all event
types, GeoJSON. Public domain (U.S. Government work). Not used by this line before (`grep` over
`works/` and `journal/` finds it only inside two harvested text corpora). Not arXiv, not statute,
not a standards vocabulary.

## The house mould, as features

M1 one mark per record · M2 the mark is a square · M3 marks in a grid in reading order by time ·
M4 colour encodes a category derived from one field (here magnitude band) · M5 touch a mark to
read its record on a card · M6 a legend with a count per category · M7 serif text on paper, with
dark-mode tokens · M8 a one-sentence lede saying what one mark is.

## The trained mould: what I believe before looking (all **conjecture**, from memory)

- R1 Many events sit at a depth of exactly 10 km, a value assigned when depth cannot be resolved.
- R2 Other round default depths occur (5 km, 33 km or 35 km).
- R3 Magnitudes are of mixed types (ml, md, mb, mww and more), not one scale.
- R4 Most events are small and in the U.S. (California, Alaska, Hawaii, Puerto Rico): the map is
  of network density, not of where the earth moves most.
- R5 Some events are not earthquakes: quarry blasts, explosions, ice quakes, other types.
- R6 Events cluster in time after large shocks (aftershock sequences).
- R7 Some magnitudes are negative.
- R8 Some depths are negative (above the datum).
- R9 Detection or blasting follows the time of day somewhere.
- R10 Records carry a review status (automatic vs reviewed).
- R11 Magnitudes heap at round values.

## The procedure, fixed now

- One iteration = code for a form → rendered headless at 1100 px → **I look at the PNG** → a note
  in `FOLLOWING.md` (what I saw, what changes next, the cause of each change) → **one commit of
  the PNG and the note before the next iteration's code is written.** Git order is the proof that
  the journal is not written after the fact.
- Each change between iterations gets exactly one cause tag, at the time: **material** (seen in
  a rendering; then also *recognised* R-number or *encountered*), **legibility** (my judgement of
  what a stranger can read), **house** (a convention), **error** (a bug or a misreading of mine).
- At most **six** iterations after the mould. I stop earlier only by a judgement that the form
  works, and the criterion of that judgement is written in the note at the moment of stopping.
- Abandoned iterations stay in the face.

## Predictions about the practice

- **Q1.** At least four of the eight house-mould features (M1–M8) survive into the final form.
- **Q2.** Of the changes tagged *material*, more than half are *recognised* (an R on the list),
  not encountered.
- **Q3.** At least one iteration is abandoned (a detour back). If none is, T4's failure criterion
  fires on this night.
- **Q4.** Changes tagged *material* are fewer than half of all changes.
- **Q5.** I stop before the cap, by judgement.

A prediction scored against my own tags is a weak test: I tag my own changes. The tags are
committed per iteration, before the next one exists, so they cannot be retuned to the score; that
is the only protection, and it is named as the only one.
