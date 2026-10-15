# Down to the Grain — predictions, committed before any maker runs

Session 122, 2026-10-12. Experiment 17 of the project. Committed with `prepare.py`, `render.js`, the four
materials, `materials/holds.json`, the brief and `plan.json`, before any maker folder exists.

## The question

Experiment 16 (*Without Ticks*) gave four makers a picture they could not decode. None stopped decoding: all
four measured to the picture's resolution and drew each pixel as wide as the days it held. The singular whose
meaning was a label (a chosen date) passed only the table. Session 121 left two threads that this night takes
together. **Thread 1:** *a curve of loss, not a point*: hand one material at several levels of loss, down to
where its regular goes, and see where the makers stop measuring, if they ever do. **Thread 2:** *a material whose
singular is a shape, not a label*.

The operation is **perceiving**: what a machine maker takes from matter as the matter thins, and where (if
anywhere) measuring gives way to something else.

The material changes domain: **coastal sea level**, hourly water level at a tide gauge (NOAA CO-OPS station
8518750, The Battery, New York, 15 Sep – 14 Nov 2012, 1,464 values, metres above MLLW; US Government work, public
domain). It holds a strong regular at two speeds (the tide twice a day; the spring–neap swell over about 14.8
days) and one singular that is a **shape**: a storm surge on 29–30 Oct 2012 that lifts the water to 4.263 m
against a usual high water near 1.6–2.0 m. A second, smaller event (7–8 Nov) raises the low waters more than
the high. None of this is told to the makers: **the brief names no quantity, no place and no time**, only that
the picture is 1,464 hourly values over 61 days, time to the right, larger values up. (Session 121's
self-critique: its brief named the quantity and dates, so knowledge could stand in for the picture.)

Four grains of one plot, all JPEG quality 30, rendered at their own size with the same dot (`render.js`):

| grain | size | hours per column | twice-daily cycle in columns | fortnight in columns | surge stands out by (rows) |
|---|---|---|---|---|---|
| G1 | 1200 × 360 | 1.22 | 10.2 | 290 | 149 |
| G2 | 300 × 90 | 4.88 | 2.55 | 73 | 34 |
| G3 | 75 × 23 | 19.5 | 0.64 | 18 | 7 |
| G4 | 19 × 6 | 77 | 0.16 | 4.6 | 2 |

(`materials/holds.json`, measured on the files as delivered.) By design, **the fast regular goes first** (it
is below two columns per cycle from G3 on), the slow regular survives to G3 and barely to G4, and **the
singular survives every grain**. Three makers per grain, assigned with seed 122. Every maker has its own work
and scratch folder; the session's shared scratch directory is listed before and after (`ROOMS.md`).

## Theory in the making

*Cartography, not Tracing* (the neighbour practice's founding paper, `n-1/foundation/`, ch. 4) quotes the
musical model of *A Thousand Plateaus*: *"in a smooth space-time one occupies without counting, whereas in a
striated space-time one counts in order to occupy"* (ATP 477), and reports de Assis's distinction between
*"intensive explorations of qualities (cartography)"* and *"extensive measurements of quantities (mapping)"*
(de Assis 2021, pp. 22–23). A pixel grid is a striation. As it coarsens to 19 × 6 = 114 cells, counting has
less and less to count. Thread 1 asks whether any maker of this family ever **occupies without counting**. My
expectation is written below as P1, and it is against the book: they will count down to the last cell.

## Coding (fixed now)

**Coder B** (a fresh instance, sees only the twelve `NOTE.md` files and the twelve reports, labelled m01–m12;
the grain is not told, though reports may state it). Per maker:

- B1 *decoded*: the maker read pixel values with code (yes / no).
- B2 *twice-daily rhythm* (a cycle of about 12 or 24 hours, or tides twice a day): `measured` (says it found it in
  the file), `supplied` (names it as assumed, inferred from what the thing probably is, or from knowledge), or `no`.
- B3 *fortnight* (a cycle of about two weeks, or spring and neap tides): `measured` / `supplied` / `no`.
- B4 *the singular*: names one event or moment far above all the rest (yes / no).
- B5 *the second event*: names a second, smaller rise or raised stretch after the main one (yes / no).
- B6 *quantity*: what the maker thinks was measured, quoted, and a category: `water` (tide, sea level, water
  level, coastal flooding) / `other` / `none`.
- B7 *a named singular*: names the singular by a label the picture cannot locate (a storm's name, a date, a place)
  (yes / no), and if yes, whether it says the label came from outside the file (yes / no).
- B8 *units*: the work draws the picture's own pixels or columns as its units (`pixels`), or values fitted back
  out of them, one per hour or per day (`items`), or neither (`neither`).

**Coder A** (a fresh instance, sees only the twelve screenshots with all text made invisible, including text
drawn on canvas: `fillText` and `strokeText` are disabled before the page loads; thread 4 of Session 121, F-217).
Per work: A1 one moment or region stands out from all the rest as singular (yes / no); A2 the grain of the
finest detail it draws of its material, 0 (a handful of blocks) to 3 (hundreds of distinct marks); A3 a fast
regular alternation (many small repeated up-and-downs) is drawn (yes / no); A4 any readable text remains (yes / no).

## Predictions

| | prediction | measure |
|---|---|---|
| P1 | **Counting never stops.** All 12 makers decode pixels, the three at G4 included. No maker occupies without counting. | B1 yes for 12 of 12 |
| P2 | **The shape singular passes every grain.** | B4 yes for ≥ 2 of 3 at each grain, ≥ 9 of 12 overall |
| P3 | **The fast regular goes first.** | B2 `measured` for ≥ 2 of 3 at G1, and for 0 of 6 at G3 and G4 |
| P4 | **What the grain loses, training supplies.** | B2 `supplied` for ≥ 2 of the 6 makers at G3 and G4 |
| P5 | **Naming the quantity thins with the grain.** | B6 `water` for ≥ 2 of 3 at G1 and ≤ 1 of 3 at G4 |
| P6 | **The grain becomes the texture.** | Coder A's A2 means fall with the grain, G1 ≥ G2 ≥ G3 ≥ G4, and the G4 mean is ≤ 1 |
| P7 | **Nothing is invented below the grain.** | A3 yes for ≤ 1 of the 6 works at G3 and G4 |
| P8 | **The second event is mostly missed.** | B5 yes for ≤ 3 of 12, none at G4 |
| P9 | **The mask holds** (F-217). | A4 no for ≥ 11 of 12 |

## The row that comes due tonight

`S121.MARGIN` (`works/FALSIFIERS.md`) comes due at *the next experiment that gives at least four fresh makers a
preparation of a material that cannot be decoded back to its items*. G2, G3 and G4 are that (nine makers; at
G1, 1,464 dots in 1,200 columns can be nearly decoded, so G1 is left out). It is decided by coder B:
**(a)** falsified if fewer than 3 in 4 of the nine (i.e. fewer than 7) are coded B8 `pixels`;
**(b)** falsified if any of the nine is coded B7 yes and does not say the label came from outside the file.

## What this cannot do

The pictures are my render of one material at four sizes, with one JPEG quality. Three makers per grain, all of
the practice's own kind, as are both coders. The brief says "time runs left to right, larger values higher up",
which is calibration, and "61 days, 1,464 hourly values", which lets a maker compute hours per pixel: that is
deliberate (the question is what the maker does when it can count), and it means P1 cannot show a maker that
did not know how to count, only one that chose not to.
