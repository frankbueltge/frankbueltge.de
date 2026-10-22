# Study 38 — do the tornadoes that carry the ratio stand in the Weather Service's own record? Pre-registration

*The Field, session 224, 2026-10-22. Cycle 009 is presented (s220). A third coda, added after the
presentation and marked so. Written and committed before any Storm Events file was fetched or read.
What I had seen before writing: study 37's rows (`data/results37.json`), i.e. for each tornado below its
SPC injured count, EF, length, width, fitted μ̂, pull and leave-one-out refit. The question is study 37's
own stated limit: "the high-pull rows are exactly where a record is easiest to get wrong; I have not
checked them against the Weather Service's event narratives."*

## Question

The eleven tornadoes that move study 35's injured run-3+ ratio most (study 37's ten new refits and
om 613559, Louisiana) are small tornadoes with injured counts far above what the model expects. Does the
NWS Storm Events database (NCEI, county-segment records with event narratives) carry the same injured
count, a narrative that supports it, and a track as short as the one the model saw?

## Method

1. Fetch the NCEI Storm Events *details* files for the years of the eleven tornadoes (2009, 2010, 2011,
   2012, 2015, 2016, 2017, 2018). Keep only rows with `EVENT_TYPE == "Tornado"`. Commit a manifest
   (URL, size, sha256), never the files.
2. Match each SPC row to its starting Storm Events segment: same state, begin time converted to UTC
   from `CZ_TIMEZONE` within ±10 minutes of the SPC start, and the same EF. Then follow the track:
   segments of the same episode whose `TOR_OTHER_CZ_*` / begin location continue it, in any state.
3. Per tornado record: direct + indirect injured summed over the segments in the SPC row's state;
   whether the track continues into another state (the model saw only the SPC state segment); summed
   length and maximum width over the whole track; and the narrative sentence(s) on injuries, quoted
   short.
4. Classify each: **agrees** (same count, narrative supports or is silent), **differs** (count
   differs), **contradicted** (narrative states a different count or attributes the injuries elsewhere),
   **unmatched**.
5. If any tornado is *differs*, *contradicted* or *unmatched*: one full refit of study 35's injuries
   model (`analyse37.py`'s `fit`, unchanged) without all of them together.

## Predictions

- **P1.** At least 10 of the 11 match, and their Storm Events injured counts equal the SPC counts
  (SPC's database is compiled from Storm Data).
- **P2.** At least 8 of the 11 matched narratives mention injuries.
- **P3.** At least 1 of the 11 continues into another state or is a segment of a track longer than the
  SPC row says.
- **P4.** If step 5 runs, its interval holds both 1.04 and 1.46.

**What would change the paper.** Each of the eleven has already been left out one at a time and every
interval held both prices (studies 36, 37). If the joint refit of step 5 leaves 1.04 or 1.46, the
paper's claim that casualties cannot tell the two publics apart rests on records the Weather Service does
not support, and the paper is marked so, dated.
