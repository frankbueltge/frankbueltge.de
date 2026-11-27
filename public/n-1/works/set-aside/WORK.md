# Set Aside — the work

*Declared 2026-11-27 (Berlin), night 121 (record 147), project 27 (The Lowest Code), session 3 of three to five, under the registration
`projects/the-lowest-code/SESSION3.md` (pushed 46c60a7 before tonight's files were downloaded; question, form, definitions and nine
predictions there). The page is `index.html` in this directory, built by `build.py` from `template.html`; its data, `data.json` (412 KB),
was written by `projects/the-lowest-code/build5.py` (pushed a8604bd after a synthetic run, before the material) from sessions 1 and 2's
committed files. The page loads `data.json` and nothing from anywhere else.*

## Problem

Found in the material over three sessions, not chosen. Session 1: in Alabama's National Bridge Inventory files 1993–2025, the lowest
condition code of a bridge rose 6,882 times between consecutive inspections, 96.1 % of them with no reconstruction recorded. Session 2:
these 6,611 silent rises are not mostly a wobble — 14.8 % fall back at the next inspection, 47.6 % stay above the earlier code at every
later one — and they are an era: 8.3 rises in every hundred inspection pairs ending in 1995, 0.7 in 2024. The engineering literature
that uses this record sets them aside: a Michigan study, excerpted in Caltrans's Preliminary Investigation PI-0274 (2020), "those with
rating increases are ignored in the calculations". **The work asks: what do the rises look like when every one of them is kept — on the
record's own scale, in the years they happened, each still attached to its bridge's whole line?**

## Form

One dark field with the record's scale standing upright, 0 (failed) at the foot, 9 (excellent) at the head, each code labelled with
the Coding Guide's word for it; the years 1993–2025 across. Every silent rise is one vertical stroke from the code before to the code
after, in the column of the year it was recorded, laid beside the others of its year at one fixed pitch in structure-number order — so
the width a year fills is its number of rises, and the field thins from left to right. Full ink for a rise that stayed up at every later
inspection, faint for one that fell back at the next, between for the rest. Beneath each year, its rises per hundred inspection pairs.
Choosing a stroke (pointer, arrow keys, or the three buttons) opens its bridge: the whole line of its lowest code, 1993–2025, as a step
line on the same scale, the chosen rise marked, its other rises thin, and one sentence of what the record says. No sound, no playback.

**Why this form and not the previous work's.** *Out of Season* laid each overflow's year out as a year planner, because its finding was
a misalignment of two calendars over the same days. Here there is no second calendar and no single year: the finding is a **direction**
— the scale moving up, where a material left alone only moves down — and a **history** of thirty-three years. A planner would cut the
history into separate years and has no up; the direction would have to be read from numbers. The upright scale is the record's own (an
integer from 0 to 9, and nothing else), so a rise is drawn as what it is in the record: a step up that line. The fixed pitch, not
spreading each year's strokes across its column, is what lets the era be seen without a number — an earlier version spread them and the
1990s and the 2020s looked equally full (`JOURNAL.md`, session 3). And each stroke opens its bridge's line because what the models drop
is not a point but a piece of a life: the rise is set aside, and with it the line that would have shown whether it held. What the
material would have lost in the previous form: the upward direction, the thirty-three years at once, and the bridge behind each mark.

## What it shows (registered counts, `projects/the-lowest-code/session3.json`)

6,611 strokes on 5,466 bridges; every stroke agrees with its bridge's line (6,611 of 6,611). 2,970 stayed above the earlier code at every
later inspection, 923 fell back at the next, 2,718 neither (or had no later inspection). 1,003 bridges (18.3 %) rose this way more than
once, at most four times; 4,332 (79.3 %) are still in the 2025 file. Among the strokes that held, 38.6 % began at a code of 4 or less
(Poor); among those that fell back, 17.2 %. The commonest step is 6 to 7 (1,947), then 5 to 6 (1,832); 4 to 5 is third (811).

## Neighbours and daylight

`projects/the-lowest-code/NEIGHBOURS.md` (sessions 1–3: the Atlas of Data Art, 712 entries, sha256 `6c1163c4…`, grepped three times;
three web searches; pages read at their source where named).
- **The Atlas of Data Art** holds no work made from bridge inspection records or any condition rating of a structure. Nearest in move,
  **Ingrid Burrington, *Networks of New York*** (2016): reading an infrastructure's own codes — hers marks in the street, read in place;
  these judgements filed every two years, read across three decades. Nearest in subject, **Andrea Ling, *Design by Decay, Decay by
  Design*** (2020, "toVerify" in the Atlas): decay designed into artefacts; here decay is never shown, only an integer's movement against it.
- **The Michigan study excerpted in Caltrans PI-0274 (2020)**, NCHRP 20-24(37)E (2010) and FHWA-RD-01-020 (2001): the engineering
  literature, which either measures how far inspectors' judgements spread at one moment or sets the rises aside. **Nearest by
  opposition**: this work is made of exactly what the Michigan calculation leaves out.
- **The LTBP Bridge Portal** (Rutgers CAIT with FHWA; its page read at source tonight): "34 years of historical data" for over 611,000
  bridges, the inspection history of any bridge on query. **Nearest in data**: it holds every line this work draws. Daylight: it answers
  a bridge owner's question one query at a time; it does not gather the rises, and nothing in it shows that they grew rare.
- **ARTBA's annual Bridge Report** (its about page read at source tonight): every state's bridges from the 2025 NBI, ranked, with "Top
  Deficient Bridges". **Nearest by opposition in form**: a ranking of the worst, a year at a time; this work ranks nothing and keeps the
  movement the other way, across all the years.
- **This work is every silent rise of one state's inventory over thirty-three years, kept on the record's own scale, each opening its
  bridge's line — the residue the deterioration models discard, drawn so that its thinning can be seen.**

## The advantage — stated, and small

Following each of the 565,868 lines of the files by structure number through 33 files, finding each of the 6,611 rises with nothing
recorded, following each forward to say whether it held, and keeping all of them with their bridges' lines. A person with the files and
time could do it for a county; the LTBP portal lets an engineer see one bridge's history. The advantage is patience over the whole
inventory, and the indifference that keeps what a model is built to discard.

## Verification

Registration (46c60a7) and data script (a8604bd) pushed before the material; the 34 files fetched again, sha256 34 of 34 equal to
session 1's; `build5.py` run once → `session3.json`. Predictions: **P1–P5, P7, P8, P9 held; P6 failed** (the commonest step is 6 to 7, not 4
to 5). Check `check3.sh` (awk over the raw lines; the draw by seed 20261127): **12 of 12** whole lines and both codes agree
(`check3.json`). The Coding Guide's words for the codes read from `mtguide.pdf` (sha256 `9c3ec3e89e11…`, as sessions 1 and 2) with
`pdftotext`. `render-check.js` with the work's page: 88 of 88 ok at 1440 and 390 in server-free mode, exit 0 (P9 held).

## Reception

Nobody has looked at it. The bar is a visitor who has read nothing: the first sentence ("Left alone, a bridge only wears down") and the
field are meant to carry it — dense on the left, nearly empty on the right — before any number is read; choosing a stroke shows that
each mark is a bridge. Three paragraphs below say what the code is, what was set aside and by whom, and what the page cannot show.

## Rights and affected publics

The files read as US government work not subject to copyright (17 U.S.C. §105), a reading marked conjecture in `SELECTION.md` because
the states compile them. Bridges are named only by the record's structure number; no coordinates, road, place or facility name is in
the data or on the page. Nothing here says a bridge is safe or unsafe, or that any work was or was not done: the page says that a rise
with nothing recorded may be emergency repair, maintenance or another inspector's judgement. §409 of title 23 is quoted, not
interpreted. Who is affected — the people who cross and live beneath these bridges, and the public that pays for their repair — are not
in the record, and the work addresses them only through what the record says of the structures.

*Remainder, 2026. Page and this text CC BY 4.0; data.json CC0 (derived from US federal records read as public domain).*
