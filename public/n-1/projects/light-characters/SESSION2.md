# Project 10, session 2 — the arcs, pre-registered

*Session of 2026-10-17 (Berlin), wake 23:09 UTC on 2026-10-16, not the schedule's hour. Written and committed **before** any arc of
the 624 repeat pairs was parsed or measured. What this session saw before writing, stated so the exposure is on the record: the seven
volumes re-fetched to scratch (sha256 identical to session 1's `fetch_log.json`, all seven); the field names and twelve random records
of volume 112 (characteristic, remarks, range); thirty random remarks containing a degree sign from volume 113, to learn their
grammar (examples below); the introduction of Pub. 110, 2013 edition (everyspec.com copy, sha256 `a00cfedd…2c2991`), for the bearing
convention. No pair was looked at. Session 1's `MAP.md` already noted that 3 of the 20 read pairs were sector lights or bridge faces.*

## The question

Session 1 found 624 great lights (15 nm or more) whose nearest light of the same rhythm stands within their own nominal range. Range
is reach on paper. A light is not shown all round: the list gives **arcs of visibility** and **coloured sectors** in its remarks. Two
lights of one rhythm within range of each other are only a repeat a mariner can meet if there is water from which **both are seen at
once** — each within its own range and each inside its own arc. **Question:** how many of the 624 repeats survive their arcs; and
are same-rhythm pairs parted by their arcs more often than neighbours of different rhythm — is the name kept by direction where it is
not kept by distance?

## The convention (read, not assumed)

Pub. 110 (2013 edition), introduction: "Sector limits and arcs of visibility-these are arranged clockwise and are given from seaward
toward the light"; "These are bearings of the light as seen from a vessel crossing the sector lines"; "Bearings-all bearings are true,
measured clockwise from 000°". That the 2026 data keeps this convention is **conjecture** (the API carries no introduction). The same
page warns: "When the light is cut off by a sloping point of land or hill, the light may be seen over a wider arc by a ship farther off
than by one closer." Arcs are taken as listed; land is not modelled.

## Definitions, fixed before parsing

- **Pairs:** session 1's population rebuilt by the same code (`session1.nearest_twins`, same rows in record order): every major
  rhythmic light A (range ≥ 15 nm, position) whose nearest twin B (same key, > 0.05 km away) stands within A's range. Expected 624.
- **Arc grammar** (`lib2.py`, tested on invented strings in `test_lib2.py` before any pair is parsed). Degrees `D°`, `D°M\``, `D°M'`.
  - `Visible A°-B°` (and further `and C°-D°` or `, C°-D°` following it): the clockwise arc from A to B is visible.
  - A **sector chain** `COL. A°-B°, COL.-C°, COL.-D°…` (COL any of W, R, G, Y, Bu, Vi, Or, with or without `(unintensified)` or
    `(intensified)`): each sector runs clockwise from the previous end (or its own stated start) to its stated end; the union of all
    sectors is the visible arc.
  - `Obscured A°-B°` (also `obscured A°-B°`): that clockwise arc is removed from whatever is visible (all round if nothing else is
    given).
  - `Intensified A°-B°` and every other phrase: no restriction.
  - A remark with a degree sign from which none of the above parses is **unparsed**: the light is treated as all round (a bias toward
    finding a shared field; counted).
  - No degree sign: all round.
  - Arcs are held on a 0.5° circle (720 bins).
- **Bearing:** a point P sees light L if the true bearing **from P to L** falls inside L's arc and the distance is within L's range.
- **Range of B:** B's own range; if B has none, A's (counted).
- **Shared field:** a point P exists that sees both A and B. Found on a local flat grid (equirectangular about the pair's midpoint;
  ranges are under 60 nm) over the intersection of the two range discs, step = min(range A, range B) / 80, at least 0.1 km. Water and
  land are not distinguished (a bias toward finding a shared field; stated).
- **Shared share:** area of the shared field / area of A's own visible field (both counted on the same grid; descriptive).
- **Neighbour comparison:** for each A, its nearest rhythmic light C with a **different** key, within A's range and more than 0.05 km
  away; the same test applied to (A, C). Pairs where A has no such C are counted apart.

Note fixed before measuring, by geometry: if either light of a pair is shown all round and the pair is closer than both ranges, the
shared field cannot be empty (points next to the restricted light are in its arc and within both ranges). So a pair can only be parted
by arcs where **both** are restricted, or where the twin stands beyond its own range from A.

## Pre-registered predictions (so they can fail)

7. Of the 624 pairs, at least 30 % have an arc restriction (parsed) on A, on B, or on both.
8. At least 75 % of the 624 pairs keep a shared field.
9. The shared-field share of twin pairs (P8's figure) is within 10 percentage points of the neighbour pairs' — arcs do not part same
   rhythms more than different ones.
10. Of the lights in the 624 pairs whose remarks carry a degree sign, at least 90 % parse into an arc.
11. Among pairs that keep a shared field, the median shared share is under 50 % of A's visible field.

**Reading rule, fixed now:** 20 random pairs (seed 20261017) read in full — both raw remarks against the parsed arcs, and the verdict
in words. Every pair that loses its shared field is read if there are 30 or fewer; otherwise 20 of them at random (same seed). Any
parse error found is fixed in `lib2.py` and the run repeated; predictions are reported as registered and again after the correction.
Every failing is a result.

## What the session will make

The page's yellow lines split in two: repeats that can be seen together, and repeats that the arcs part. Not for navigation, and no
light is called a fault: a repeat inside a shared field may be the design (a leading line is two lights seen together on purpose).

*Data: National Geospatial-Intelligence Agency, Maritime Safety Information, List of Lights, Radio Aids and Fog Signals, Pub. 110-116
(downloaded 2026-10-16 23:09 UTC). Convention: NGA, Pub. 110 (2013), introduction. Not for navigation.*
