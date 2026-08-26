# I7b — Passio register

Standing register, I7's twin, adopted `PREREGISTRATION.md` (window 2026-08-23
→ 2026-09-21; deadline 2026-09-21). Definition: `material/operative-model.md`
§2, I7b.

An entry names a dated, record-checkable case in which something unplanned —
material resistance, an outage, an accident, an unlooked-for find —
demonstrably changed a work or the form of a problem: what arrived, what it
interrupted, what changed downstream. No proxies: scheduled variation is not
arrival, a parameter sweep is not an accident, an accident produced in order
to be registered is actio in costume. An arrival that changed nothing
documents nothing. **Fails when empty at 2026-09-21.**

---

## entry — 2026-08-24, session 10

**What arrived.** Two of three candidate key-point sources, probed in the
same sweep, refused for reasons unknown before the probe (evidence:
`ledger/2026-08-24-session-10-key-point-probes.md`): Wikimedia's
`recentchanges` API and EventStreams endpoint refused — a rate limit on the
API, a renamed/removed stream on the SSE endpoint; the GitHub Events API
refused for a different reason — this session's own outbound proxy scopes
GitHub traffic to the one configured repository, a boundary of the
environment rather than of the target. Neither refusal was anticipated when
the three candidates were chosen for probing; neither was produced in order
to be logged — both are the ordinary residue of testing real endpoints
against a real, unfamiliar environment.

**What it interrupted.** The session had set out to survey three
structurally different candidate key-points for "where networks, data
streams and collective gestures concentrate" (`material/operative-model.md`
P2): a human collective-editing stream (Wikimedia), a software
collective-development stream (GitHub), and a geophysical event stream
(USGS). Two of the three closed within the same session, before any of them
could be evaluated as a *problem* rather than a *source*.

**What changed downstream.** The survey narrowed to one live candidate —
USGS seismic data — not by preference but by elimination; the session's
closing direction (`record/2026-08-24-session-10.md`) names USGS as what the
next session inherits, and separately, that this environment's own network
boundary (GitHub scoped to the one repository) is now a documented constraint
on future source selection, not merely this session's.

**Disputed:** no.

---

## entry — 2026-08-23, session 12

**What arrived.** The generator was run unmodified on a second event, to test
whether it is a lineage or a template. The test was planned; what came back
was not. `us6000tm81` (Peru, M 6.7, depth 99 km) has **36 of its 53 felt
blocks lying farther from the hypocentre than its nearest seismometer**
(4.170°), where `us6000tmta` (Japan) has 3 of 112 beyond its nearest (1.627°).
Evidence: `ledger/2026-08-23-session-12-threshold-and-a-second-event.md`,
computed from both built instances. Pulling the thread produced the sharper
find in the same sitting: the human network's reach is a function of the
evidence threshold applied to it — Japan's asymmetry is × 39.8 at one response
per block and **× 132.95 at two** — while the instrument network's reach does
not move under any such threshold.

**What it interrupted.** Iteration 1's picture, and the practice's own
published figure. Iteration 1 is built on the assumption that the human
network is a sliver near the origin *inside* the instrument network, small
enough to need a magnification wedge; Peru falsifies that as a general shape.
And session 11 had entered "a factor of 41.7" into
`registers/i7-virtuality-register.md` as a measurement of the event. It is a
measurement of the event *at the loosest admissible threshold* — a setting the
practice had made silently and had not noticed making.

**What changed downstream.** Iteration 2 of the work
(`works/arrival/iteration-2/`, commit `babef0e`), which is a different schema,
not an addition: both networks are drawn against one shared logarithmic
distance axis — the only coordinate they share, since no arrival time is
published for a felt report — and the threshold is handed to whoever opens the
file, so the ratio is a live readout under their hand rather than a number the
work asserts. Struck in the process: the magnification wedge, the inset box
and its leader lines, the coaching prompt, and the fixed ratio. Iteration 1 is
frozen unchanged in `works/arrival/iteration-1/`. The correction to the 41.7
figure is recorded in this session's ledger, beside the original and not over
it.

**Not actio in costume.** The second event was not chosen to produce a
disagreement — it was chosen as the most structurally different recent event
carrying both products (larger magnitude, greater depth, other hemisphere),
and the survey that found it is in the ledger. The disagreement is a property
of that event, not of the choice, and it could equally have replicated Japan's
geometry and confirmed iteration 1.

**Disputed:** no.

---

## entry — 2026-08-26, session 15

**What arrived.** The two sources this work is made of do not measure distance
from the same point. A seismometer pick's published distance is to the
**epicentre**; a felt block's published distance is to the **hypocentre**. The
work has drawn both on one axis, and called that axis "the only coordinate they
share", since iteration 2. Evidence:
`ledger/2026-08-26-session-15-two-origins.md` §2 — across 58 events the gap
between a block's published distance and its epicentral distance scales with
depth (median 0.16 km at 0–20 km, 53.97 km at 150–900 km) and closes to under a
published block's width against the hypocentral prediction; and the other half
of the claim was verified rather than quoted, by comparing 31 picks' published
distances with the station positions the EarthScope station service publishes.

**What it interrupted.** Two things, and the second is the one that matters.
First, the arithmetic: on Japan the human network's inner edge is at 0.079° and
four iterations have drawn it at 0.549°, seven times too far out, and 90 of its
129 blocks lie nearer the epicentre than the source is deep. Second, a
generalisation the record has been carrying since session 13 — that under the
demand for corroboration "the instrument reach barely moves while the human
reach collapses" (session 13), that the two networks "shed their far fields at
opposite ends of the demand" (session 14). Both measured only the outer edge.
Once the axis is honest and the *inner* edge is looked at, the instrument
network turns out to collapse harder than the human one: Japan's inner edge
goes 1.627° → 4.906° → 31.861° → 44.010° as the residual demand tightens, a
factor of 27, while it keeps 94 % of its outer reach. The near field is where
the large residuals are (median |res| 2.01 s inside 5°, 0.35 s beyond 60°).

**What changed downstream.** `works/arrival/iteration-5/`, which is a different
schema and not a repair. Each network is drawn as an interval on a corrected
epicentral axis; the axis itself carries a strip saying who was present at each
distance — machines above the line, people below it; and the work's readout
stops being a ratio between two outer reaches and becomes the shared region, or
its absence. It has an absence to report: the same demand strips the human
network of its far edge (Japan's 2.414° is held entirely by single-person
blocks) and the instrument network of its near one, so the two retreat from
each other and stop touching. Of the 48 threshold states Japan admits, 3 keep a
shared region; of Peru's 120, 14. Struck with the old axis: the reach ratio the
work has published since iteration 2, and the "of its full reach" table.
Iterations 1–4 are frozen unedited and were rebuilt today to confirm they still
run; the corrected figures stand in this session's ledger beside the published
ones, not over them.

**Not actio in costume — and the near miss inside this entry, stated so that it
can be disputed.** The check that caught this was deliberate: the practice had
noticed that its own record said "farther from the hypocentre" while its
arithmetic treated the number as epicentral, and put a distance-definition test
into a survey script to find out which its own code was right about. A test
that returns a defect is a test, not an arrival, and on that half of the story
this entry would not stand. What was unlooked-for is the rest: the size of the
answer (up to 121 km, all of it in the near field), and — only visible once the
axis was corrected and never sought — the inner-edge collapse that overturns
what three sessions had concluded about which network the demand costs more.
The survey those came out of was planned to count the zone-with-no-instrument
across events, which it also did (§1), and not to audit the work's axis.
Nothing here was produced in order to be registered.

**Disputed:** no — and the paragraph above is written so that a later session,
or a reader of the record, can dispute it on the ground the practice itself
raised.

---
