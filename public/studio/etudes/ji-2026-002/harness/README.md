# Sampled-frames harness (sessions 41–42, 2026-07-25)

Reproducible drives for the two probes. **The captures are timestamped still strips, not motion:**
no reader of these frames perceives continuous movement, and the record must not call them a motion
medium (Kritiker, session 41). Each drive opens its probe from disk in a headless browser, clears
the probe's residue key so the sitting starts at seat 47, performs the full interaction arc, and
captures timestamped frames beside a `manifest.json` recording only elapsed time and mouse-button
state per frame — the manifests deliberately carry no interpretive notes, so the frames can be
handed to a severed cold reader.

## `capture.js` (session 42) — the one to use

Supersedes `drive-a.js` / `drive-b.js`, which are kept as the session-41 record. Two things changed,
both forced by the session-41 stress-test:

- **Sampling is decoupled from the interaction.** An independent sampler loop fires at a fixed
  interval while the drive runs; the session-41 drives sampled *where the drive thought something
  interesting was happening*, which is how Probe B's quickening got aliased out of the evidence.
- **The pointer condition is a parameter** — `none` (what a headless screenshot naturally is),
  `arrow` (the system cursor a real desktop screen recording shows), or `marker` (the
  pointer-confound control: the same coordinates and timings, hand iconography replaced by a neutral
  square outline). The probe files are never touched in any condition.

Probe B's drive is now state-driven too: it waits for each relapse to complete by watching the
probe's own persisted state, so screenshot latency cannot shorten or stretch a press.

```
node capture.js --probe a --pointer none   --interval 3300 --out frames/A-lo   #  6 frames
node capture.js --probe a --pointer none   --interval 400  --out frames/A-hi   # 48 frames
node capture.js --probe a --pointer arrow  --interval 1000 --out frames/A-cv   # 19 frames
node capture.js --probe a --pointer marker --interval 1000 --out frames/A-mk   # 19 frames
node capture.js --probe b --pointer arrow  --interval 300  --out frames/B-hi   # 55 frames
```

(Requires a headless-capable browser driver for node; `NODE_PATH` may need to point at the global
module directory.)

## Determinism, and what is *not* deterministic

The probes are seeded (SEED 20260725) and every drive clears the residue first, so the **sitting** is
reproducible: all five session-42 runs ended with Probe A's residue `{seat:47, family:1,
clauses:[2,2]}` and Probe B's `{seat:47, stage:2, pressIndex:3, dead:true}` — identical to sessions
40 and 41 — with zero console errors in every run. The **frames** are not byte-reproducible: the
sampler fires on wall-clock, so a rerun lands its screenshots at slightly different moments. That is
why the session-42 strips are committed under `frames/`: they are the exact stimulus the 25 severed
readers saw, and a claim about what readers saw should be inspectable by whoever doubts it.

## The rubric and the reads

`RUBRIC.md` — the cell design, the six questions, the coding rules and the five predictions,
committed **before the first frame was captured**. `reads-session-42.md` — the 25 reads and the
counts, including the counts that falsified our own predictions.
