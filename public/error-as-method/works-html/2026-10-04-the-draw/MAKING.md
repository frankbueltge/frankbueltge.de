# Making journal

*Written iteration by iteration. Each entry is committed with the picture it describes before the
next iteration's code exists. Tags: **M** encountered (on no list), **R** recognised (a belief in
`EXPECT.md`, a Hand A mould, or the error line), **H** the house's forms from earlier experiments,
**L** legibility, **E** my own error. **SELECT** marks a change that decides which part of the
material is shown.*

## 0 · the terminal — an unplanned look, 2026-10-04, at the harvest

**A deviation, disclosed.** The pre-registration put the first look at the first rendered form. It
happened earlier: I printed the fetched CSV to the terminal to check its encoding, and read all 80
rows there. The terminal printout is therefore the first form, and nobody chose it. It was the
habit of checking a file.

**What I saw.** A very small table: sixteen states, five years (2021–2025), two price types, an
index and a change on the year before. Recognised: E1 (base 2021 = 100), E2 (constant and current
prices), E3 (all sixteen, none grouped), E5 (current prices jump in 2022, by +8.8 % in Hessen up
to +24.3 % in Bremen and Niedersachsen; constant prices hover near 100), E8 (semicolons, decimal
commas, header lines). Broken: E4 (the table *starts* at its base year, so every row starts at
100.0) and E6 (there is no 2020 to dip).

Encountered, on no list:
- **Sachsen-Anhalt, 2022: +49.5 % in current prices**, twice the next state. It stays far above
  the others to 2025 (130.4).
- **Two notations for "no change".** Niedersachsen 2024 has `-` in the constant-price change;
  Sachsen-Anhalt 2025 has `0,0` in the current-price change. Destatis's own key: `-` means
  *nichts vorhanden* (nothing there); `0` means *more than nothing, but less than half the smallest
  unit the table shows* (Verbraucherpreisindizes, Monatsbericht, Zeichenerklärung, p. 2). The table
  tells nothing from almost nothing.
- **The base year's change is `.`**, not `-`. In the same key a dot is *value unknown or to be kept
  secret*. 2021 has a year before it; this table does not show it.
- **The base year forces every state through one point.** Sixteen economies are made equal in
  2021 by construction. The norm is not mine: the statistician put it into the material.

**What iteration 1 is.** The form in `EXPECT.md`, made as written (sixteen panels, constant and
current lines, the gap shaded), so that Q5 can be tested on it. No change from the look enters it.

## 1 · the expected form — looked at after rendering `seen/1.png`

**What I saw.** Sixteen wedges that all open from one point. The first thing the picture says is
not inflation but the **pinch at 2021**: the base year ties every state to 100, and the form spends
its whole left edge showing a fact that is true by construction. The second thing: the wedges are
**not the same thickness**. Sachsen-Anhalt's is huge in 2022 and then narrows; Bremen, Hamburg and
Niedersachsen are thick; Saarland, Rheinland-Pfalz and Hessen are thin. Under `EXPECT.md` the
shading was *inflation*, one national thing. It is not one thing: the gap differs by state.

A numeric look, disclosed: after the picture I computed current ÷ constant per state (the implied
price level of what each state's wholesalers sell). 2022 runs from 1.112 (Saarland) to 1.360
(Sachsen-Anhalt). In 2025 the range is 1.129 (Bayern) to 1.212 (Hamburg), and Sachsen-Anhalt has
fallen back to 1.171.

The rest of the frame is empty: the y range wastes half of every panel.

**What changes for 2, and why**
- the two lines go; only the gap is drawn, as the ratio current ÷ constant — **R**, **SELECT**
  (`EXPECT.md`'s own sentence, *what the money says against what the goods say*; the gap as the
  meaning was mine before the data, the error line's norm-against-difference)
- one shared panel instead of sixteen, so the thicknesses can be compared — **M**, **SELECT** (that
  the gap differs by state was on no list)
- the base-year pinch is kept, not hidden: all sixteen lines start at 1.000 — **M** (the pinch is
  the statistician's norm in the material; I keep it in view rather than choose it away)

## 2 · the ratio — looked at after rendering `seen/2.png`

**What I saw.** A fan from one point, and one red spike. Sachsen-Anhalt's implied price leaps to
1.36 in 2022 and then comes down every year, crossing the others' band by 2025. The other fifteen
spread into a band from about 1.13 to 1.21 and stay there. The pinch at 2021 now takes the whole
left half of the picture. It carries no information; it is the base year. The labels on the right
are a sorted list and do not sit at their lines, so no line can be named. That is a legibility
failure.

And something about the practice, which matters more tonight than the spike. **This is an
economist's chart.** It is the standard picture of a deflator, and I reached it in two steps. In
neither step did I look at what the drawn table *is*. I looked at what my sentence in `EXPECT.md`
said it means. The table has things no chart of it shows: the two kinds of zero, the dot that
hides the year before 2021, a base year that makes every state equal by decree. The chart deletes
them all. Choosing went into the chart.

Following the spike would mean leaving the table, to find out what Sachsen-Anhalt's wholesalers
sold in 2022. *Cartography, not Tracing* asks for that: *follow the singularities of a material*
(§5, postulate 3). I refuse it tonight, on purpose. Leaving the table is choosing a second material,
and the night's question is what happens to choosing inside the material it was given. The refusal
is a selection too, and it is tagged.

**What changes for 3, and why**
- refuse to follow Sachsen-Anhalt outside the table — **SELECT**, tagged **R** (the experiment's
  own rule, written before the data, decides it, not the material)
- the chart goes; the table comes back as written, all 80 rows and every cell, with the ratio as a
  small mark beside each row — **H**, **SELECT** (the house's *read every item* from *Withdrawn*,
  strand A; it is a return to a habit, not a discovery)
- the three symbols `.`, `-` and `0,0` are set apart in colour — **M**, **SELECT** (encountered at
  entry 0, on no list; I note the pull of the ecology too, since all three siblings are working
  missing data this week, so the tag could be argued as H)
- the 2021 rows are kept and greyed rather than dropped — **M** (the base year is the material's
  own norm; dropping it would be my choice laid over theirs)

## 3 · the table as written — looked at after rendering `seen/3.png`

**What I saw.** A column of red marks running down the page with a regular beat: two per state,
on every 2021 row. Those are the 32 dots, the base year's change on a year the table does not show.
They are the table's structure, the norm written into it sixteen times over. Then exactly **two
marks off the beat**: Niedersachsen 2024 `-` (constant prices) and Sachsen-Anhalt 2025 `0,0`
(current prices). Both rows show an index unchanged to one decimal (97.9 → 97.9 and 130.4 → 130.4).
By the key, one says *nothing* and the other says *more than nothing*. Whether that is a slip or
the truth of the unrounded values cannot be seen from the table. It is a difference, and it
becomes an error only if someone lays the key over it as a norm. I note it; I do not judge it.

Seen beside the chart of iteration 2, the bars still tell the Sachsen-Anhalt story, and now they
tell it in the table's own rows. The chart had to delete things to say it. The table says it
without deleting.

**About the practice.** Three iterations and three decisions about *what to show*, and the
choosing never stopped. It moved: from the catalogue (taken away by the draw) to the meaning of
the gap (my sentence), to refusing to follow the spike (my rule), to returning to the table (my
habit). The draw removed one choice and the practice made five others in its place. That is the
night's result, and the face must show it rather than the wholesale trade.

**What changes for 4 (the face), and why**
- the table stays as the body; above it, the record of choosing laid over the material: the draw's
  walk through the catalogue, Hand A's ten, `EXPECT.md`'s beliefs marked kept or broken, and every
  tagged change of this journal — **H** (the house's form from *The Mould* and *Before the Verdict*:
  tagged changes and coloured verdicts made visible)
- the three pictures already made are shown as they were seen, not remade — **L**
- nothing new is selected from the material — no SELECT. The face is about choosing, so it
  adds no choice to the material; stated so the count can be checked

## 4 · the face — looked at after rendering `seen/4.png` (and at 390 px)

**What I saw.** The struck list of ten is the first thing that reads, before any sentence: ten
lines through ten domains, and beside them the one that came. The walk through the catalogue reads
as I hoped. The drawn index is a red tick near the right end of a long line, and under it, in the
zoom, three grey refusals, one green admission, and a long pale comb of datasets my parser walked
past. The tally bar shows the result in one glance, but only on the second screen. A stranger who
stops after thirty seconds sees the question and the struck list, not where the choosing went.

Errors in the rendering. The change texts carry the journal's markdown asterisks. Removing the
backticks made the three symbols unreadable (`., - and 0,0`). One change ends on a dangling dash.
The comb in the zoom starts one index late, so it shows 328 marks for 329.

Nothing in the material looked different from iteration 3. This iteration's look was at the face,
not the table.

**What changes for 5, and why**
- the result moves into the opening: one sentence under the lede saying how many selections the
  practice made and how many were steered by what it held — **L**
- asterisks stripped, the symbols quoted, the dangling dash removed — **L**
- the comb starts at the admitted index, so it shows all 329 — **E**

## 5 · the face, corrected — looked at after rendering `seen/5.png`, `seen/5-390.png` and in dark mode

**What I saw.** The result now sits in the opening, above the struck list, at 1100 px and at 390 px.
No sideways scroll at 390 (the table scrolls inside its own frame). Dark mode holds. The three
symbols read as quoted. One flaw is left: quoting a file name that ends in a possessive gives
`‘EXPECT.md’’s`. It is the last change.

I stop here. The pre-registration allowed eight iterations; the material has said nothing new
since iteration 3, and the face changes now only in legibility. Stopping is a judgement made at
this look, by one norm: *a change that only polishes is not research* (written now, as in
*Before the Verdict*, at the picture that called for it).

**What changes for 6, and why**
- the possessive after a quoted file name is rewritten in the journal's own words for the face — **L**

## 6 · the face, final — checked by reading the rendered text, not by a new picture

The possessive reads `‘EXPECT.md’s own sentence`. Nothing else changed. The loop ends here with
six forms, of which the first three were made of the material and the last three of the record
of making it.
