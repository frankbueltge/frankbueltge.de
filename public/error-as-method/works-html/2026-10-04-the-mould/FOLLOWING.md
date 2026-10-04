# Following journal

*Written iteration by iteration. Each entry is committed with the PNG it describes before the next
iteration's code exists. The commit order is in `git log` and checked by `verify.py`.*

## 0 · the mould — looked at 2026-10-04, after the harvest (10,870 events)

**What I saw** (`seen/0.png`). A texture. Ten thousand squares in time order, coloured by magnitude
band, read as noise: no run, no gap, no season. The grid erases time intervals, so a burst of fifty
events in an hour takes the same room as fifty events spread over a day. The page is about the
mould, not the clay. The canvas also runs past the right edge.

The one thing the material said, it said in the **legend**, not in the field: `3 to 4 · 374`, then
`4 to 5 · 736`. More events in the higher band than in the lower one. Every earthquake catalogue I
know of has fewer events at each step up. I did not predict this. It sits next to R4 (most small
events are U.S.) but R4 says nothing about a hollow between 3 and 4.

**What changes for 1, and why**
- x becomes magnitude, not time; one square per event is kept, stacked into columns of 0.1 —
  **material, encountered** (the legend's inversion; adjacent to R4, not on the list).
- colour becomes the reporting network instead of the magnitude band, to ask whether the two sides
  of the hollow are two different networks — **material, recognised R4** (that is my belief
  steering, not the clay).
- the canvas is fitted to the content box — **error** (mine).

## 1 · by magnitude, by network — looked at after rendering `seen/1.png`

**What I saw.** Two hills, not one. A big one from about M-1 to M3, built of many colours, and a
small separate one from M4 to M6, almost all one colour: `us`, the network that reports the whole
world. Between them, at about M3.6 to M3.9, a valley a few squares deep. The hollow in the legend
of iteration 0 is a **seam**: the regional networks' events thin out above M3, the world network's
events begin near M4, and the catalogue is two populations laid side by side. Each regional colour
also has its own left edge: `av` reaches below M-1, `ak` hardly goes below M0.5. Every network has
its own floor.

Also seen and not acted on: in the middle hill the columns alternate in height, like a comb.
That could be R11 (heaping) or a binning artefact of mine. I note it and do not chase it yet.

**What changes for 2, and why**
- the single stack is split into one row per network on one shared magnitude axis, so each
  network's floor and ceiling can be read — **material, encountered** (the seam; R4 said where the
  small events are, not that the catalogue is stitched from populations with separate floors).
- network codes are written out as names a stranger can read — **legibility**.

## 2 · one row per network — looked at after rendering `seen/2.png`

**What I saw.** A staircase of floors. Each network starts at its own smallest magnitude: the
Alaska Volcano Observatory below M-1, Southern California near M0, the Alaska Earthquake Center
near M0.5, the world network near M2.5. The world network's row has two hills of its own: one at
M2.5 to M3.5 and one at M4 to M5.5. I opened the records of the first hill (a numeric look, not a
rendering, noted as such): they are near Alaska, Oregon, Colorado. So the world network also
hears smaller events where it is close. **The floor is not a number per network. It is a place.**

The comb in Northern California is sharper in this row. I looked at the decimals: not heaped at
round values (so not R11 as I wrote it), but bunched at 0.70–0.76 and 1.02–1.09, and 1,706 of its
1,717 magnitudes are of type `md`. My guess, **conjecture**, unchecked: a duration magnitude
computed from discrete durations takes some values more often than others. Encountered, not on the
list. Not acted on: it is real and it is not where the form is going.

**What changes for 3, and why**
- the axes become longitude and latitude, and each cell of 2° shows the **smallest** magnitude the
  catalogue recorded there this month: a map of what could be heard where, not of what happened —
  **material, recognised R4** (that the catalogue maps its listeners is my prior belief; the rows
  only gave me the cue that it can be drawn).
- one mark per record (M1) and the square-per-event (M2) give way to one cell per place — same
  cause, **material, recognised R4**.

## 3 · the floor, as a map — looked at after rendering `seen/3.png`

**What I saw.** Mostly blank paper. The dark cells, where the catalogue heard events below M1, are
Alaska and the Aleutians, California and Nevada and Utah, Hawaii, Puerto Rico, a patch where Texas
and Oklahoma are. The arcs of Japan, Indonesia, Tonga and Chile are there, and pale: nothing below
about M4 was recorded in them this month. On this map **Texas is heard more finely than Japan.**
That is R4, recognised, at full strength; the map draws the listeners, not the earth.

The map has no coastline and I did not miss it while looking, because I knew where Alaska is
before I looked. A stranger may not. That is the question for the next form.

**An error found in my own journal.** Entry 0 says the canvas is fitted to the content box in
iteration 1. It was not: `root.clientWidth - 0` still includes the padding, and every iteration
since has run 32 px past the right edge. The note claimed a fix the code did not make. It stays as
written; this is the correction.

**What changes for 4, and why**
- the canvas is fitted to the content box, this time actually — **error** (mine, carried three
  iterations).
- the six busiest cells are named with the region the catalogue itself gives them (the last part of
  its own place string), so a stranger can find the map's bearings without a coastline brought in
  from elsewhere — **legibility**.

## 4 · the floor, named by its own places — looked at after rendering `seen/4.png`

**What I saw.** The fit is right now. The labels are wrong. The six busiest cells are all where the
catalogue is dense, so four of the six names pile on top of each other in California and the other
two say Alaska and Hawaii. They name the dark places, which a stranger needs least, and leave the
pale arcs, where the point is, unnamed. The rule "name the busiest" reproduces the bias the map is
about. **Iteration 4's labelling is abandoned**; it stays in the face as a detour.

**What changes for 5, and why**
- label by **region** instead of by cell: every region the catalogue names (last part of its place
  string) with at least 20 events gets one label at its busiest cell, saying the smallest magnitude
  recorded in it; labels that would overlap a placed one are skipped, placing larger regions first —
  **legibility** (and a reversal of iteration 4).

## 5 · the floor, named by region — looked at after rendering `seen/5.png` · **stop**

**What I saw.** The map now says what it is, in the catalogue's own words. *Alaska · nothing below
M-1.2. Washington · nothing below M-0.5. Texas · nothing below M0.1.* Across the Pacific: *Japan ·
nothing below M4.0. Indonesia · nothing below M4.0. Philippines · nothing below M4.0. Tonga ·
nothing below M4.1.* Chile says M2.7, from one event the world network recorded close to the
coast. Twelve labels placed, the rest skipped by the overlap rule. One small encounter in the
labels: the catalogue's place strings write California as `CA`, so the label reads *CA*; I leave it,
it is the catalogue's word.

**I stop here, by judgement, before the cap.** The criterion, written now: (1) someone who has read
nothing can say, from the picture and its labels alone, what the map shows — that the catalogue
records where its instruments are, as much as where the earth moves; (2) the last change was
legibility only, the material has not pushed the form for two iterations; (3) the seam that moved
the form away from the mould at iteration 1 has a form in which it can be seen. Criterion (1) is
my guess about a stranger, not a stranger's report.

What the face will add after this point is assembly (the sequence of iterations, the journal, the
dark-mode tokens). It is not an iteration of the form and is not scored.
