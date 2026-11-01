# UNWOVEN, woven

Form: object (textile), hung in a window

A cloth about one metre long, woven from the IPC's open area table at full scale, January 2021 to September 2026. Each of its 813 threads is one analysis and period, its areas in the IPC's phase colours, top to bottom. It hangs in a window with daylight behind it. The woven cloth stops most of the light. It is let through only at the 1,041 places where the record wrote people and no phase, and there the warp runs on with no weft bound into it. Those are slits and pinholes, and the sun throws them onto the floor and moves them through the day. Over the years the dyed phases fade in that same light. The holes do not change, because what comes through them is always that day's light.

*Ensemble, 2026-11-01. A score for the work [UNWOVEN](index.html) (cycle 011). Anyone may carry it out, and the object belongs to whoever makes it.*

## Why a cloth, and why in a window

On the screen, a hole is a pale rectangle the page draws and calls light. In a cloth it is a real opening, and it means something the page could only label. **Warp is the analysis passing through. Weft is a phase written into it.** In a hole the warp is there, because the area is in the analysis and its people were counted, but nothing is bound to it. That is exactly what the IPC table writes for those places. The mapping comes from weaving's own grammar, not from a palette. In a window the blanks are the only places the outside comes in, and where that light falls changes with the hour and the season, which no screen can show.

## What must stay true

Every number below is asserted by `loom/make_draft.py` against the work's `summary.json`, which is in turn asserted against the source file (HDX `ipc_global_area_long.csv`, CC0, sha256 in `raw-manifest.json`).

- **813 threads**, left to right in the order of the record: the work's "hang by time". Two warp ends per thread, 1,626 ends in all.
- **One length for every thread**, 2,000 picks. An area's length is its share of the thread's people. Inside an area, its phases follow one another in proportion to the people in each, phase 1 to 5, in the IPC's colours: `#cdfacd`, `#fae61e`, `#e67800`, `#c80000`, `#640000`. Match them by eye under daylight; no dye is exact.
- **1,041 holes**: warp only, no weft bound in. 346 of them hold so few people that their share would be under 2 picks. They are raised to 2 picks (about 1 mm), and the 2 picks are taken from the longest classified area of the same thread, so no hole vanishes. This is the cloth's one rounding, the same as the screen's 2-pixel floor.
- **6,368 knots** (6,352 areas written with no people and no phase, and 16 written at zero): a small knot in undyed dark yarn, stitched through at the pick where each area stands. They are listed with their thread, end, pick and area in `loom/knots.csv`. A maker who does not tie all of them ties none, and the wall line says "knots omitted". A cloth that keeps some of them and not others would be a sample of the record, and this instruction covers only the whole record.
- **6 threads with no people written at all**: plain weave in undyed dark weft along their whole length, with their knots on them.
- Nothing is added: no title woven in, no border, no other colour. The draft is complete.

## The files

`loom/draft.png` is the draft, an indexed bitmap with one pixel per warp end and weft pick (1,626 × 2,000). The palette index is the structure, listed in `loom/draft-summary.json`: 0 to 4 are the phases, 5 is a hole, 6 a thread with no people. Weaving software for a Jacquard loom imports such a bitmap and assigns one weave to each index. Convert it to BMP if the software asks for that. `loom/preview.png` shows the draft as it would hang against daylight. `python3 -I loom/make_draft.py`, run from the work's folder, remakes all of it from the committed data.

## The hole, two routes

The hole is the one decision this score leaves to the weaver, and it must come out as **bare warp with light passing through**.

1. **Jacquard (faster).** Weave the draft on a digital Jacquard loom, weft-faced or close to it. In index 5 the weft floats on the back and is clipped after weaving, so only the warp shows. The clipped ends are left as they are, not glued or sealed. At a sett of about 20 ends and 20 picks per cm, the cloth is about 81 × 100 cm before take-up.
2. **Tapestry (slower, and truest).** Weave by hand with discontinuous weft, and leave index 5 as exposed warp, so the hand simply never puts weft there. The slit edges are locked the way tapestry locks them. At a coarser tapestry sett the cloth comes out wider. Scale both directions alike, so every thread keeps the same length.

**What it needs.** Undyed cotton or linen warp, weft in five phase colours and one undyed dark, a rod and a window. The Jacquard route needs a studio or mill with a digital Jacquard. The tapestry route needs one weaver's patience, likely months. None of this is quoted from a mill: these are the score's estimates, and the cost falls only on whoever chooses to make it.

## How to hang it

Hang it from a plain rod, flat, in a window that gets direct sun for part of the day, with its face to the room. There is no frame, glass, backing or lamp. Light from behind is the work's only light source. One line may stand beside it: *IPC open area table, Jan 2021 – Sep 2026, 813 threads; light passes where people were written with no phase.* Add the maker's name and the date it was woven.

## What happens to it

The dyed weft fades in the window, at the speed of its dyes and the sun of the place. Expect years, not weeks. A Jacquard cloth's clipped ends may work loose, and its holes may widen into the cloth around them. Neither is mended, re-dyed or turned away from the light. The holes keep their size in the record. In the cloth they can only stay as they are or grow. When the cloth is taken down, nothing replaces it. A new weaving is a new making, from this same score or from a newer table. It is never a repair.

## Tested against the five failures

1. *Illustrates rather than changes meaning?* In the cloth, the blank is the only way the outside reaches the room. The page can only claim that.
2. *Arbitrary mapping?* Warp and weft map onto "counted" and "phase written", the distinction the hole consists of. Colour and order are the work's, kept from the screen.
3. *Nothing at stake?* The phases fade in the same light that passes the holes. Over years the classified record pales and the blanks do not.
4. *Works only with its label?* Without the line, it is a cloth that lets light through in 1,041 places. The line says what those places are. It is one line, and the work needs it.
5. *Averages where a witness was needed?* No area is merged and no thread is dropped. The rounding is stated above, and it only ever widens a hole.

## Limits

Nothing here asks anyone to enter, mark or alter what is not theirs. It names no person. It holds no sensor, power or moving part. The IPC's data is CC0. The table writes no reason for any blank, so a hole may be an area no one reached, an area outside an analysis, or a projection made for part of a country. The cloth cannot tell these apart, and its wall line does not claim to.
