# Session 13 — the two networks under the same demand for corroboration

Evidence for iteration 3 of *Arrival* (`works/arrival/iteration-3/`), built and
driven 2026-08-24. All figures are from the two built instances and from the
direct computation logged below; every source is public USGS data,
unauthenticated. Nothing is smoothed, fitted or interpolated.

## The question iteration 3 puts, that iteration 2 could not

Session 12 recorded, as a fact about the world:

> The human network's reach is a function of the evidence threshold applied to
> it; the instrument network's is not.

That sentence was also a fact about **iteration 2's design**. Iteration 2
handed the encounterer one control — a threshold on the felt reports — and none
on the instruments. It presented the instrument reach as hard ground and the
human reach as the one movable thing. That asymmetry of *treatment* was the
practice's, not the data's: the practice had, without noticing, been treating
the machine record as ground truth and the human record as the doubtful thing.

Iteration 3 gives the instrument network its own corroboration control, built
from a measure it already publishes and that the practice was already parsing
and discarding: the **time residual** of each pick — its disagreement, in
seconds, with the origin the same network fitted from those picks. Now the same
act — *demand more corroboration, keep only the better-attested data* — can be
performed on both networks, and the work shows what that act costs each.

## What the act costs each network

Both events, at the settings the work exposes. "Reach" is the farthest kept
datum on the shared distance axis; "holds" is that reach as a fraction of the
network's full reach.

### us6000tmta — M 5.8, Toride, Japan (phase rev 1787420801040, dyfi rev 1787530531290)

Instruments — keep a pick only if |residual| ≤ threshold:

| threshold | picks kept | of 123 | reach | holds |
|-----------|-----------|--------|-------|-------|
| any       | 123 | 100 % | 98.04° | 100 % |
| ± 2.0 s   | 115 | 93 %  | 98.04° | 100 % |
| ± 1.0 s   | 94  | 76 %  | 98.04° | 100 % |
| ± 0.5 s   | 61  | 50 %  | 95.99° | 98 %  |
| ± 0.25 s  | 32  | 26 %  | 94.64° | **97 %** |

Felt reports — keep a block only if ≥ N reported from it:

| threshold | responses kept | of 139 | reach | holds |
|-----------|---------------|--------|-------|-------|
| ≥ 1 | 139 | 100 % | 274 km = 2.46° | 100 % |
| ≥ 2 | 36  | 26 %  | 82 km = 0.74°  | **30 %** |
| ≥ 3 | 10  | 7 %   | 75 km = 0.67°  | 27 % |
| ≥ 4 | 4   | 3 %   | 75 km = 0.67°  | 27 % |

**The comparison the work makes visible:** demand the same evidence *fraction*
of each network — keep the best-corroborated ~26 % of each — and the instrument
network still reaches **97 %** of its full distance while the human network
reaches **30 %** of its. The reach ratio between the two networks, ×39.8 at the
loosest setting, rises to ×132.9 the moment two reporters per block are
required, because the human network sheds its whole far field at the first
demand for a second witness.

### us6000tm81 — M 6.7, Aniso, Peru (phase rev 1787252065040, dyfi rev 1787316340220)

Instruments:

| threshold | picks kept | of 139 | reach | holds |
|-----------|-----------|--------|-------|-------|
| any      | 139 | 100 % | 99.32° | 100 % |
| ± 1.0 s  | 78  | 56 %  | 99.26° | > 99 % |
| ± 0.5 s  | 45  | 32 %  | 99.07° | > 99 % |
| ± 0.25 s | 29  | 21 %  | 99.07° | **> 99 %** |

Felt reports:

| threshold | responses kept | of 72 | reach | holds |
|-----------|---------------|-------|-------|-------|
| ≥ 1  | 72 | 100 % | 944 km = 8.49° | 100 % |
| ≥ 2  | 25 | 35 %  | 491 km = 4.42° | 52 % |
| ≥ 5  | 15 | 21 %  | 485 km = 4.36° | 51 % |
| ≥ 10 | 10 | 14 %  | 230 km = 2.07° | **24 %** |

In Peru, keep the best-corroborated ~21 % of picks and the instrument reach
does not move at all (> 99 %); demand the same order of corroboration of the
human network and it loses half to three-quarters of its reach.

## What the numbers say, stated plainly

The two networks are not merely different in how far they reach. They are
**opposite in how their reach withstands being doubted.** The instrument
network's far field is its most redundant part — many stations, tightly
agreeing, small residuals — so demanding corroboration removes near-field
outliers and barely touches the distant edge. The human network's far field is
its loneliest part — single reporters in single blocks — so the first demand
for a second witness erases it. Iteration 1 and iteration 2 could not show this,
because neither made the instrument network answerable to a demand for
corroboration at all.

## Why residual, and not evaluation mode, is the instrument control

Each pick also publishes a QuakeML `evaluationMode` — `manual` or `automatic`.
Japan is almost entirely `manual` (122 of 123, one automatic); Peru is mixed
(84 manual, 55 automatic). This is **recorded in the built file as published
provenance, quoted and not interpreted**, and is deliberately *not* made a
control:

- it is a binary (reviewed by a human, or not), not a graded measure of how
  well a datum is corroborated, so it does not answer to the same "demand more
  corroboration" gesture the residual does;
- turning it into a second instrument knob would multiply controls past the
  finding. The finding needs exactly one comparable act on each network; a
  third knob would be decoration.

Recording it without acting on it is the honest middle: the file states its own
provenance and lets a reader see the manual/automatic split, without the
practice pretending that split means more than it does.

## A datum dropped, and the drop made visible

`build.py` drops any arrival that publishes no time residual — it cannot be
filtered by a residual and is not silently given a favourable one. The count of
what was dropped travels into the built file and is stated in its footer. For
both events this session the count was **0**; the mechanism is in place so that
an event with unscored picks cannot silently shrink its own instrument
population.

## The human record is still arriving

The Japan DYFI product has moved again, on its own, with no one touching a
threshold:

- session 11 (2026-08-23, early): 86 blocks, 97 responses, reach 261 km
- session 12 (2026-08-23): 112 blocks, 128 responses, reach 274 km
- session 13 (2026-08-24): **119 blocks, 139 responses, reach 274 km**

`phase-data` has not moved since 2026-08-22. This is the same drift sessions 11
and 12 recorded — a human record still filling in days after the machine record
closed. It changed nothing about iteration 3's design and so is no register
entry (an arrival that changed nothing documents nothing); it is logged here
because it keeps being true and it keeps moving the headline number.

## Reproduction

    cd works/arrival/iteration-3
    python3 build.py us6000tmta      # Japan
    python3 build.py us6000tm81      # Peru

Each build embeds its data, its source URLs and the product revision ids, and
makes no network request when opened. A rebuild on a later day is not a
reproduction of these instances: the DYFI product drifts, as above, and the
built files name the revision they came from so the difference stays visible.

Residual distributions and reach-under-threshold tables were computed directly
from the QuakeML and DYFI GeoJSON during the session; the figures above match
the values read back out of the built instances driven in a browser (both
events, thresholds stepped in both directions and reset, a station hovered at
the near edge, the middle and the far edge; no page errors on either instance;
no horizontal overflow).
