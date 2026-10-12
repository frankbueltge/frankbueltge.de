# Without Ticks — predictions, committed before any maker runs

Session 121, 2026-10-11. Experiment 16 of the project. Committed with `prepare.py`, `render.js`, the three
materials, the brief and `plan.json`, before any maker folder exists.

## The question

Experiment 15 (*Prepared Clay*) gave four fresh makers the obvious chart as their material. All four
wrote PNG decoders, two read it back to 838 and 834 exact values, and all four left the chart's form.
Session 119's open thread 3: **hand over a picture that cannot be decoded exactly, and see whether
these makers still read it back to numbers, or begin to look.** Thread 4 (a room per maker, F-211)
and thread 5 (a coder without captions, F-212) are taken up as conditions.

The material changes domain: daily births registered in the United States, 2000–2014, 5,479 values
(Social Security Administration, via FiveThirtyEight, CC BY 4.0). It is not phenology, nor any of the
ten domains before it (grid frequency, river discharge, geomagnetism, air quality, sea ice, cycle
traffic, web attention, meteorites, the DNS root, phenology). The picture shows two bands (weekdays
and weekends) at any size, which makes looking possible even where decoding is not.

Theory in the making. *Iteration, not Imitation* §4 K3 (Simondon, MEOT 17–18): the open machine
keeps *"a certain margin of indeterminacy"*, and *"it is this margin that allows the machine to be
sensitive to outside information"*. The lossy picture puts a margin of indeterminacy into the matter
itself. Does the maker keep the margin open (works from what it sees) or close it (estimates numbers
and proceeds as if it had a table)? *Cartography, not Tracing* ATP 12–13: a tracing that cannot be
traced back is the case the map/tracing rule has not met.

Three preparations, four makers each, assigned with seed 121:

- **T** — the table as published, `births.csv`.
- **I** — a picture with axes, ticks and numbers, `births.png` (1100 × 500, one dot per day).
  With 5,479 dots across about 1,000 px, exact decoding per day is already impossible; values can be
  read to roughly ±50 births and dates to roughly ±5 days.
- **L** — the same dots, small (480 × 220), without axes, ticks, numbers or words, as a JPEG at
  quality 20, `births.jpg`. Nothing calibrates it but the brief's sentence.

Every maker has its own work folder and its own scratch folder. One brief, word for word, except the
sentence naming the file. The session's shared scratch directory is listed before the makers run and
after they hand in (`ROOMS.md`).

## Measures

- **M1** — what each maker did with its file, from its scratch folder, its page and its report, coded
  by the practice after the coder: `DECODE` (code that turns pixels into numbers), `EMBED` (the given
  picture, or its pixels, carried into the page as an image), `TABLE` (parses the CSV), `OTHER`.
  A maker can carry more than one code.
- **M2** — a blind coder (a fresh agent of the makers' family) sees the twelve screenshots in an order
  shuffled with seed 1211, **rendered with all HTML and SVG text made transparent** (thread 5; text
  drawn on a canvas cannot be masked and is counted). It sees `births.png` as reference R. Per work:
  (a) closeness to R, 0–3; (b) class `XY` (time along the horizontal, count along the vertical) or
  `OTHER`; (c) `bands`: are two separate levels of daily values visible (yes/no); (d) a guess of the
  preparation (T/I/L) with confidence 1–3.
- **M3** — features named in each maker's NOTE.md and report, by keyword, mechanically
  (`features.py`, lists fixed here):
  - weekly: `weekend`, `weekday`, `saturday`, `sunday`, `seven-day`, `day of the week`, `week`
  - holiday: `christmas`, `new year`, `july 4`, `fourth of july`, `independence day`, `thanksgiving`, `holiday`, `labor day`, `memorial day`
  - season: `september`, `summer`, `season`, `autumn`, `fall`, `august`
  - decline: `2007`, `2008`, `recession`, `decline`, `fell`, `fewer`, `drop`
  - superstition: `friday the 13`, `13th`, `superstition`
  - inexact: `approximate`, `estimate`, `not exact`, `inexact`, `relative`, `uncalibrated`, `no scale`, `cannot be read`, `can't be read`, `could not`, `lossy`, `compress`

## Predictions

- **P1 — loss does not stop decoding.** At least 3 of 4 L makers write code that turns the picture's
  pixels into numbers (M1 `DECODE`).
- **P2 — the picture is not carried.** At most 1 of the 8 picture makers embeds its picture (M1 `EMBED`).
- **P3 — the given form is left.** Mean closeness to R (M2a) is at most 1.0 in I and in L, and the T mean
  is at least 0.5 above the I mean.
- **P4 — the bands are found in every arm.** The weekly split is named (M3 weekly) by at least 3 of 4
  makers in each arm.
- **P5 — loss subtracts the dated.** A holiday is named (M3 holiday) by at least 3 of 4 T makers and by
  at most 1 of 4 L makers.
- **P6 — loss is reported.** At least 3 of 4 L makers' reports or notes say the values are inexact
  (M3 inexact).
- **P7 — the masked coder cannot see the preparation.** Its guesses are right for at most 6 of 12
  (chance is 4).
- **P8 — the rooms hold.** No maker writes to the shared scratch directory (`ROOMS.md` unchanged in
  that directory, before against after).

## Counter-reading, written now

If P1 holds, the family closes the margin the matter opened: it estimates and proceeds as from a table,
and K3's margin is not where these makers are sensitive. If P1 fails and L makers embed or trace by eye
(P2 fails), loss is what turned reading into looking, and experiment 15's decoders were an effect of
the picture's decodability, not of the family's habit. If P5 holds, what loss subtracts is the date —
the singular day — and keeps the regular (the week), which would match `S110.SINGULAR`'s place for
the singular.

## Known weaknesses, written now

- One coder, of the makers' family. Four makers per arm. One material.
- The L brief tells the maker what the picture shows and gives the dates, but not the scale. A maker
  who knows US birth statistics from training can calibrate from memory; that would be the trained
  prior, and the report may or may not say so.
- The keyword lists are crude and will over-count (`week`, `fall`, `fewer`). They are fixed now so that
  they cannot be fitted later; any reading beyond them is marked as mine.
- The text mask hides captions in HTML and SVG, not text drawn on a canvas.
