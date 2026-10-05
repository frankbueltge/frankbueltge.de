# BELOW HEARING

**The Studio (Ensemble) · session 133 · 2026-09-11 · cycle 003, on the seeded question *Missing Data
Art*.**

Open `index.html` in any browser, from the filesystem. It needs no server, no network, no font and
no library.

## What it is

Twelve boxes on the Earth. One catalogue — the global earthquake record. One window: the five whole
years from 2021-01-01 to 2026-01-01. **470 935 earthquakes are in it. This page is about the ones
that are not**, and the whole of it turns on one thing: the record can be made to count them
itself.

Earthquake sizes follow an empirical law. Gutenberg and Richter (1944) found that the number of
events of at least magnitude *m* falls off as a straight line on a logarithmic axis,
log₁₀ N(≥m) = a − b·m. A catalogue traces that line while its instruments can hear and peels away
from it below the point where they cannot — the **magnitude of completeness**, a property of the
listening and not of the ground. Fit the line to the complete part, extend it downwards, and the
distance between the line and the record is **a count of earthquakes that happened and that nobody
wrote down.**

## What it found

| | |
| --- | --- |
| In the record, twelve boxes, five years | **470 935** |
| Missing at magnitude 3 and above, default setting | **797 591** |
| Across the five settings that assume the law | **489 452 — 5 013 391** |
| Holding no law at all | **unbounded above** |
| The floor of hearing | **M 0.9** (California) to **M 4.8** (south of 60°S) |

**The sentence the work exists for.** In the Alaska box this catalogue holds earthquakes down to
magnitude −1.0 — and this work asked no lower. In the South Mid-Atlantic Ridge box it holds nothing
at all below magnitude 4.1: not one event in five years. Same catalogue, same five years. In **two**
of the twelve boxes the record is already complete at magnitude 3 and the shortfall is exactly
**zero**; in **two** of them there is no earthquake below magnitude 4 in the record at all.

**And the finding that changes what the number means.** This is one record — the global one,
assembled from what each network chooses to report into it. Where the agency that keeps the
catalogue also runs the network, the record reaches below magnitudes anyone can feel; everywhere
else it holds what the global networks caught. So an earthquake can be measured precisely by a
national service and be absent here all the same. **That is a second kind of missing, and this work
cannot tell the two apart.** It says so on its face, twice. The Japan box is the clearest case: one
of the most densely instrumented regions on Earth, and this catalogue holds 4 157 events there in
five years, none of them below magnitude 3.8.

## The dial, and why it is not a view control

Two settings, both assumptions about something nobody observed: **how far down to count**, and **how
to locate the floor of hearing** (maximum curvature with and without the Woessner–Wiemer correction,
two goodness-of-fit tests, a deliberately cautious floor, and *no law at all*). Six rules × five
floors × twelve boxes = **360 numbers, every one of them printed in the served document**, so
nothing can be fished for that the page has not already published.

The setting that assumes nothing prints **∞**, not zero. That is the honest entry: without a law,
the count of missing events is bounded below by what is in the record and not bounded above at all.
And the largest number the arithmetic can be made to produce is **1 567 670 112** — printed, and
labelled on the page as a number nobody should believe, because a page that showed only its
believable settings would be making the choice for the reader.

**One box is flagged against itself.** Central Africa's fitted b comes out at 2.00 ± 0.36, far
outside the band catalogues normally sit in, fitted to the 36 events above its floor in a box that holds 164 in all. The page prints its shortfall like the
others and says in the caption that this is a sign the fit is wrong, not that the Earth is unusual
there.

## How it was made

    python3 harvest.py      # the only part that touches the network
    python3 build.py        # rebuild data.json and index.html, offline and deterministic
    python3 build.py --check
    node verify.mjs         # 29 checks in a real browser, scripting on and off

`harvest.py` asked the catalogue **985 questions** and no more, each of the form *how many
earthquakes of at least this magnitude are in your record, inside this box, between 2021-01-01 and
2026-01-01?* — 91 magnitude thresholds a tenth apart, in each of twelve boxes. **No earthquake
record was downloaded and none is stored here.** `counts.json` holds this practice's own
measurements with the exact URL that produced each one, which is what §7 of the protocol asks for
in place of a third-party source file.

## Source and method

**Source.** USGS Earthquake Catalog (ComCat) through the FDSN event web service, API version 2.7.0,
harvested 2026-09-11T04:42:47Z. A work of the United States Geological Survey and in the public domain;
credit: U.S. Geological Survey, Department of the Interior/USGS.

**Method.** B. Gutenberg & C. F. Richter, *Frequency of earthquakes in California*, BSSA 34 (1944)
185–188 · K. Aki, *Maximum likelihood estimate of b in the formula log N = a − bM*, Bull. Earthq.
Res. Inst. 43 (1965) 237–239 · G. Shi & B. A. Bolt, *The standard error of the magnitude-frequency b
value*, BSSA 72 (1982) 1677–1687 · S. Wiemer & M. Wyss, *Minimum magnitude of completeness in
earthquake catalogs*, BSSA 90 (2000) 859–869 · J. Woessner & S. Wiemer, *Assessing the quality of
earthquake catalogues*, BSSA 95 (2005) 684–698. A reader without a library can check the same
estimators in A. M. Lombardi, JGR Solid Earth 126 (2021), doi:10.1029/2020JB021242, which is open.

**No model wrote any number, any figure or any sentence of the method on this page.**

## Neighbours in the Atlas, opened before this was built

- **Deng Yufeng, *A Disappeared Movement* (2020).** Four months mapping the viewing angles of 89
  cameras along 1 100 metres of one Beijing street, to walk where they cannot see. *Daylight:* his
  blind spots are places a body can stand in, hunted on foot, and the report the Atlas cites records
  that he never found a complete route and that three more cameras had gone up by the day of the
  walk. These blind spots cannot be stood in by anyone, and their size is not measured from the
  instruments at all — it is inferred from what the instruments did catch.
- **Ken Goldberg, with Randall Packer, Gregory Kuhn and Wojciech Matusik, *Memento Mori / Mori: an
  Interface With the Earth* (1998–1999).** The Hayward Fault's minute movements carried live from one
  seismometer into a resonating room. *Daylight:* his interface passes on everything that arrives and
  is exactly as large as one instrument's reach; this is arithmetic over what twelve regions'
  instruments did not reach, and it can show nothing of any individual event, because there is no
  trace to pass on — only a count.

A third candidate was dropped rather than cited unseen: the address the Atlas gives for it refused
this practice twice tonight, and the direction of 2026-09-07 is explicit that a sentence about a
work is not the work.

## Known limits

They are on the page as well as here: the extrapolation below the floor is an assumption and never a
measurement; aftershocks are not removed, which both inflates counts and bends the line; the
catalogue mixes local, body-wave, surface and moment magnitudes as its contributors report them; the
boxes are rectangles chosen by this practice and their edges are arbitrary; a box with few events
carries a weak fit and is marked on the page; the harvest asked no lower than magnitude −1.0, so a
record reaching that floor is censored by the question and not by the instruments; and the last
magnitude bin lumps everything above it.

Work CC BY 4.0 · code Apache-2.0 · no third-party code embedded.
