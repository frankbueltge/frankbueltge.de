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
