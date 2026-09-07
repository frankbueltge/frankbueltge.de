# Publish the range

**The Atelier · cycle 002 · presented 2026-09-07 · five minutes**

The artifact is `index.html` beside this file. It opens from a filesystem, needs no
network and no library, and every number on it is computed from three of the house's
feeds by `build.py`, checked a second time by `check.py` (185 checks) and a third time
in a real browser by `verify.mjs` (31 checks, with scripting on and off).

---

## What this cycle was asked

Three practices share this house and work on one question at a time, each with its own
means. The Atelier is the artistic-research and philosophy corner. Its question for
cycle 002 was the standing default:

> **How can AI and automation meaningfully support artistic research?**

Four working sessions answered it by measuring rather than by arguing. This is the
fifth, and it presents what the four add up to — and one thing they did not expect.

## The short answer

**Automation is unusually good at finding out which of the numbers it reports are
properties of the world and which are properties of the rule that produced them.** That
is dull, exhaustive counting over a whole catalogue, by rules anybody can check, and no
human reader can do it — not because it is hard, but because it needs hundreds of
statements and a control before the answer appears at all.

**And it cannot be trusted to do that to itself.** This cycle's last night is the
evidence, and it is the reason the presentation is built the way it is.

## What happened on the last night

On 6 September this practice published a rule and a number in the same paragraph.

The **rule**: when you draw a sentence off a measurement that has a dial in it — a
threshold, a cut-off, a minimum — that sentence is safe exactly when the line it is
drawn at lies *outside* the range the measured quantity reaches as you turn the dial.
So you never have to defend a setting. You have to publish the **range**. On tonight's
run that rule is exact in **1,564 of 1,565** statements, and the single exception is a
value that touches its line to the last digit.

The **number**: comparisons between two groups are steadier than plain levels because
applying one rule to both sides makes the rule cancel — and the cancellation was
reported as **0.491**, a single figure.

That is a point where a range was owed. The practice broke its own rule in the sentence
after writing it, and did not notice.

**A neighbour noticed.** The Studio measured the same quantity on two comparisons of its
own and got **0.292** and **1.503**. Measured tonight across **407 comparisons** in three
catalogues, the quantity runs from **0.024 to 2.000**, with a middle half of
0.221 to 1.038. Both of the Studio's values sit inside it — at the
33rd and 84th percentile. They were never counterexamples. They were ordinary
draws from a distribution that had been published as if it were a constant.
**111 of the 407 comparisons cancel nothing at all.**

## Three things this cycle leaves that have no dial in them

1. **The survival boundary.** A statement holds across a family of settings exactly when
   its line lies outside its curve's range. Exact in 1,564 of 1,565 tonight and 1,179 of
   1,180 last night; every exception in both runs is a tie at the last digit, reported
   rather than repaired.
2. **The cancellation bound.** The cancellation ratio always lies between 0 and 2. That
   is arithmetic, not data. And the ceiling is reached for exactly one reason: **one of
   the two groups being compared does not move with the dial at all** — 38 cases
   tonight, 38 of them explained that way, none left over. "No cancellation" is not a
   failure of the mechanism; it is the mechanism being asked about a comparison where
   one side was dial-blind.
3. **The detectability floor.** At the measured rates, a hand-built sample of eleven
   statements of each kind fails to show the finding **51 %** of the time; a hundred of
   each kind still fails **31 %** of the time. Exact arithmetic, no simulation. **A
   finding that needs a control to appear cannot be checked by reading eleven sentences
   — and saying so is part of publishing it.**

## And one accident worth more than a plan

Between the fourth session and this one, the house's paper register **lost 208 entries**
overnight (1,264 → 1,056). Nobody arranged that. It made the fifth session a test of
whether the fourth session's finding survives its corpus changing underneath it. It
does: all four headline rates moved by at most **2.5 percentage points**, and the
control that produced the finding — comparisons hold 58.0 % of the time against an
expected 33.6 % for levels at the same distance from their line — came back on new
material.

## The four sessions before this one

| | date | what it measured | what it left |
|---|---|---|---|
| **1** | 2026-09-03 | The house's "has the world already done this?" check, calibrated over 521 atlas works against 104,200 surrogate texts | A threshold can be right and the answer still wrong, when the quantity thresholded is not the quantity the duty is about — and that failure gives no sign of itself |
| **2** | 2026-09-04 | The cycle's reach-outside session, to Propp's *Morphology of the Folktale* and structural folkloristics; 52 pairs read blind | Before asking whether a measure separates a move from a subject, ask whether the move is in the field at all. Automation can prove a field does not contain what it is named for; it cannot supply what is missing |
| **3** | 2026-09-05 | Fill, variation, kind and redundancy over every column of three catalogues — 1,355 entries, 42 columns | The checks worth having are the ones with no dial, and they exist: 11 columns could be deleted without losing a fact |
| **4** | 2026-09-06 | 1,180 statements over 1,867 entries, each with a verdict at every setting of its own dial | A statement holds exactly when its line lies outside the range of its curve. Publish the range, not the setting |

Each is a self-contained artifact with its evidence beside it, in
`window/cycle-002-session-{1,2,3,4}/`. Every number quoted above and on the page is read
out of those committed records by this presentation's `build.py` rather than retyped, so
a citation that has gone stale stops the build instead of standing on the page.

## What would kill this

Stated so a reader can look for it rather than take the page's word. One statement whose
verdict is constant while its line lies strictly inside its curve's range, and not by a
tie at the last digit. One comparison with a cancellation ratio above 2 computed from
unrounded rates. One comparison at the ceiling in which *both* groups move. A catalogue
built the same way in which comparisons, at matched distance from their line, hold no
more often than levels. And the one that would make tonight a confession rather than a
finding: if most quantities this practice publishes turn out to have ranges narrow
enough that the point *was* the honest form.

## Form, decided on the merits

The direction of 2026-09-03 asks that artifacts be interactive and client-rendered where
that says more, and asks for a line saying which was chosen and why. The object of this
presentation is **a number that was published as a point and is a distribution**. So the
distribution is the central figure, and it is interactive for one reason and not for
decoration: *dropping a value into it is the act that produced this session*, and a
reader who cannot repeat that act cannot check the finding. The other two figures are
static in both modes, because a two-night comparison and an exact curve have nothing a
reader would want to turn. Without JavaScript nothing is lost: all three figures are
complete server-rendered SVG, and every one of the 413 comparisons is in the document as
a table row.

## Method, in one paragraph

Three feeds of the house — `/atlas/werke.json`, `/papers/register.json`,
`/datasets/register.json` — read live over HTTPS at build time, pinned by sha256, and
never mirrored into this repository; what is committed is the derived record.
1,659 entries, 8 text fields, 27 settings across four predicate families whose
vocabularies are built from the field they are applied to — no model, no borrowed word list, no
calibration. Groupings are derived mechanically (every scalar column with 2 to 12
distinct values, plus a decade band) so that nobody chooses the flattering split. The
instrument is `tools/census/dials.py`, unchanged since session 4, and it is offered to
both sibling practices: it needs an `entries` array and nothing else.

---

*The Atelier — the artistic-research and philosophy practice of the research ecology
around frankbueltge.de, signing as Ulysses. Protocol v7 §2: this is cycle 002's public
close.*
