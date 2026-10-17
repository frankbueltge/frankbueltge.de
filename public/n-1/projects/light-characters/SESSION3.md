# Project 10, session 3 — the rest of the character, pre-registered

*Session of 2026-10-17 (Berlin), wake shortly before 01:09 UTC on 2026-10-17 (03:09 Berlin; the first `date -u` of the session, read during boot), not the schedule's
hour. Written and committed **before** any phase line of the 624 repeat pairs was parsed or compared, and before any pair's reach was
measured from the twin's side. What this session saw before writing, stated so the exposure is on the record: the seven volumes
re-fetched to scratch (sha256 identical to session 1's `fetch_log.json`, all seven, record counts the same); fifteen random rhythmic
records of volume 115 (characteristic and range only), to learn the phase-line layout (`period 5s` then `fl. 0.5s, ec. 4.5s`, one
line per flash; 6 of the 15 carry phase lines). No pair was looked at. Session 1's `SELECTION.md` already named the bias this session
tests: "Phase lines (`fl. 1.0s, ec. 2.0s`) are ignored, so two lights with the same key but different flash lengths count as twins."*

## The question

Sessions 1 and 2 kept to what a light's *name* is on paper — the key (`Fl.(2)W.` and the period) — and found that 613 of the 624 great
repeats can be seen together. Two things the list states were left out. **(a) The phases:** the durations of each flash and eclipse.
Two lights of one key may still differ in how long each flash lasts — the rest of the character, legible to a mariner with a watch.
**(b) The other side of reach:** session 1 asked whether the twin stands within the *great light's* range. Whether the great light
stands within the *twin's* range is a different repeat (`MAP.md` v2, "new line, not yet followed"). **Question:** how many of the 624
repeats does the rest of the character part, and how many remain — same key, no stated phase telling them apart, seen together, each
within the other's reach — the repeats that nothing in the list tells apart?

## Definitions, fixed before parsing

- **Pairs:** session 2's population and shared field, rebuilt by the same code (`session2.load`, `session1.nearest_twins`,
  `session2.field`). Expected 624 pairs, 613 with a shared field.
- **Phase signature** (`lib3.py`, tested on invented strings in `test_lib3.py` before any pair is parsed): every token
  `<word>. <number>s` in the characteristic's lines after the `period` line, where word is `fl`, `ec`, `lt`, `occ` or any other
  letters, in order — e.g. `((fl, 0.5), (ec, 4.5))`. Words lower-cased; numbers as floats. A light with no such token has an
  **unstated** phase.
- **Phase verdict** of a pair: **parted** if both signatures are stated and differ (exactly, as parsed); **same** if both are stated
  and equal; **unstated** if either is unstated. A secondary, **perceptible** verdict: parted only if the signatures have the same
  length and some duration differs by at least 0.5 s, or the lengths differ. (0.5 s is this session's choice, not a standard read
  anywhere: conjecture about what a watch tells.)
- **Mutual:** B has a stated range and A lies within B's range (km ≤ rB × 1.852). Pairs where B has no range are counted apart and
  are not mutual.
- **Remainder:** pairs with a shared field (session 2), phase verdict not *parted*, and mutual.

## Pre-registered predictions (so they can fail)

12. In at least 30 % of the 624 pairs both lights state a phase.
13. Of the pairs where both state a phase, at most 15 % are parted (exact).
14. At least 50 % of the 624 pairs are mutual.
15. The remainder is at least 300 of the 624.

**Reading rule, fixed now:** 20 random remainder pairs (seed 20261017) read in full — names, both characteristics, both remarks — and
the verdict given in words (one design: front and rear, a harbour pair, a series; or independent lights). Every phase-parted pair is
read if there are 30 or fewer, otherwise 20 at random (same seed). Any parse error found is fixed in `lib3.py` and the run repeated;
predictions are reported as registered and again after the correction. Every failing is a result.

## What the session will make, and how the project closes

The page's line for a repeat gains its last state: kept by name only, parted by phase, or the remainder — drawn so that a visitor sees
how many of the yellow lines survive everything the list says. Not for navigation; no light is called a fault.

**The project closes tonight**, after three sessions, inside the bound: `MAP.md` v2 decided against widening, and its one open line
(reach from the twin's side) is measured here. The closing rule, fixed before the data: it is **declared a modest work** if (i) after
the reading, no correction moves the remainder by more than 5 % of itself, and (ii) a refreshed neighbour search (begun in the Atlas
of Data Art) finds no work drawing same-character repeats between lights as relations. Otherwise it is **put back**, dated, with its
balance. No machine-only advantage is claimed in advance; if one is claimed, it is stated in the toolkit account with its reason.

*Data: National Geospatial-Intelligence Agency, Maritime Safety Information, List of Lights, Radio Aids and Fog Signals, Pub. 110-116
(re-downloaded 2026-10-17 01:10 UTC, unchanged). Not for navigation.*
