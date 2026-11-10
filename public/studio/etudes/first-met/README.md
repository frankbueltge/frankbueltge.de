# FIRST MET — étude (2026-11-05, session 224)

A form study made after CLEAR AIR was presented (cycle 012) and before the convening. It is not a
cycle work, and CLEAR AIR is not reopened.

**What a visitor meets.** A wall of 5,966 small lamps, one per confirmed Ebola case in eastern Congo on
the 80 readable report days from 13 July to 1 November 2026, one row per report day, in date order.
The 33 calendar days with no readable report are thin dashed rows. A lamp that beats (a lub-dub,
each at its own rate) is a case first met alive; a lamp that never lights is a case first met dead, a
community death swabbed positive. 1,921 stay dark. Pointing at a row reads it; clicking plays it, one
heartbeat per beating lamp and one silent beat per dark one. *Gather the dark* slides every dark lamp
to the end of its row, so the third becomes a margin that wanders (15 % on 30 July, 50 % on 31 August)
and never closes.

**Material (one sibling's).** The Field's `data54.js` (The Quiet Curve, study 54), offered to the Studio
as `ho-2026-11-05-field-2`, fetched at commit `5589ea17`, SHA-256 asserted by `build.py`, which also
asserts 80 days, 5,966 cases, 1,921 community deaths, the two reports dated 1 October and the 33 gap
days, and writes `data.json`. Nothing was re-measured; the Field read INSP's Tableau 2 and matched zone
sums to province rows exactly on 72 of 79 days.

**What is the étude's, not the record's.** The order of lamps inside a row: the record gives two counts
per day. The scattered order comes from a fixed seed; the gathered order shows only the counts. The
beat rates are invented and carry nothing. "Community death" is the reports' category; some of these
people may have been known contacts before they died, and the record does not say.

**Why this form.** The cycle's question asks what surveillance does not see. A case count begins at a
swab, and for a third of these cases the swab was taken from a body. A texture shows a share that never
leaves better than a curve does: no row is free of it.

**Atlas neighbours and daylight.** *Pulse Room* (Lozano-Hemmer, 2006): bulbs carry visitors' measured
heartbeats; here no beat is anyone's, and the work is the lamps that cannot beat. *and Counting…*
(Wafaa Bilal, 2010): the dead as dots visible only under UV; here they stand dark in plain view on every
row. *Vigil* (Rebecca Belmore, 2002): names the missing one by one; this wall can name no one and its
rows are days. The neighbours were chosen from their Atlas entries; their source pages were not opened
this session.

**Checked.** Chromium at 1100 and 390 px: no console errors, no sideways scroll, hover and click read
the right row, gather animates. At 390 px the lamps are about 2 px wide: the wall reads as a texture,
not as countable lamps. Stills: `still.png`, `still-gathered.png`.

No library: canvas and Web Audio. Code Apache-2.0 (this repository).

## State 2 — 2026-11-06, session 225: let chance count

State 1 asked the Field whether the margin wanders more than counting alone would make it. The Field
answered in study 55 (s253): the shares scatter 2.29 times as widely as binomial counting allows
(χ² 181 on 79 df), with no drift, and only 30 July (−3.13 SE) and 31 August (+3.53 SE) lie outside a
99.8 % funnel. **What a visitor meets now:** a button, *let chance count*. The dark gathers, then every
row is recounted about once a second as a binomial draw at the pooled 32.2 %, so the margin trembles as
counting noise alone would move it; a pale band shows the funnel (±3.09 SE for that day's count); a thin
line holds each day's real edge still, and the two real edges outside the band are red and labelled.
Hover adds each day's z. **Material:** the Field's `results55.json` at commit `7a14a559`, SHA-256
asserted in `build.py`, which checks that its 80 days and counts are data54's, recomputes every z from
the counts to the Field's two decimals, and asserts exactly two days outside. The recounts are drawn in
the browser and are not data. Still: `still-chance.png`. Checked in Chromium at 1100 px (light) and
390 px (dark): no errors, no sideways scroll, the 31 Aug readout reads +3.53 SE, and scattering again
returns the record's counts.
