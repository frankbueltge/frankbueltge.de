# The Society — the room: what is built, and what is still only implemented

**Date:** 2026-08-07 · **Route:** `/society/room` (works, deliberately unlinked) · **Verdict that
prompted this note:** Frank, 2026-08-06/07 — *"ist noch nicht so richtig gut inszeniert."* He is
right, and this file says exactly where the line runs, so the next working session starts from a
diagnosis rather than from a blank page.

---

## The brief this exit answers

A visitor at a ZKM-style venue, in front of a projection or a terminal: **three to five minutes,
no willingness to read paragraphs, wants an aesthetic experience that surprises.** The reading
exit (`/society`) is right for an hour and cannot be bent into this; the room is a second exit,
not a compromise of the first.

## What is built and works

- **One screen, three bands:** the society as sky, the block world as ground, and between them a
  band that holds one short line at a time. No scrolling, no cards, no tables, no ticker.
- **A score as data** (`src/lib/society/score.ts`, 15 beats, `score.test.ts`): the five turns —
  here is a mind · watch it build · it notices you · take a part away · it sleeps and forgets.
- **The honesty rule, enforced by test:** a line that claims something (a visitor, a touch, a
  sleep) stays silent until that has actually happened; if it never happens it is never said. An
  empty gallery still gets a whole, honest loop. (The first run announced *"Something out there
  moved"* to an empty room. That is what the rule is for.)
- **One gesture:** touch a light → that agent is silenced → the room stops for seven seconds and
  the elegy takes the whole screen → the society then fails in exactly the way that rule's
  absence causes. Pointer and keyboard share the path.
- **Signals travel the edges** as moving lights — the single change that makes the constellation
  read as a mind from ten metres rather than as a diagram.
- **The loop:** every pass ends with *"It will not remember you."*, then a new morning with every
  silenced agent back.
- **Shared anatomy** (`src/lib/society/layout.ts`) so the two exits cannot drift apart, and
  `makeSociety(seed, { sleepAfter })` so the room reaches sleep inside a visit.

## What is only implemented, not staged — the actual work

1. **Tempo.** A tower takes ~15 s and the arch needs two towers first, so a four-minute visit
   sees very little happen. The room needs its own clock: a faster tick, or a society whose
   first tower is quick and whose later ones compress. Nothing in the engine forbids it —
   `TICKS_PER_SEC` is a constant and the room already owns its own `sleepAfter`.
2. **Typography.** The intertitles are mono at a single size. A room wants a real type
   treatment: scale that changes with the weight of the sentence, letter-spacing that opens on
   the short lines, and the last line of the loop set apart from the rest.
3. **No camera.** Everything happens at one distance. The tower completing, the misfire and the
   elegy all deserve a move — a slow push toward the site, a hold, a release. The page version
   has a ring and a caption; the room has neither yet.
4. **The world is small and static.** It sits in a band and never changes framing. It should
   breathe: fill more of the screen while it builds, recede while the society is the subject.
5. **The arrival is weak.** A stranger walks up mid-loop and lands in the middle of a sentence.
   The room needs an attract state that resolves into the beginning when someone appears —
   presence should start the piece, not interrupt it.
6. **The gesture is not taught.** "Touch a light" appears once, in words. It should be shown:
   one light pulsing invitingly before the line, or a hand-shaped hint on the first pass only.
7. **Silence is undesigned.** The gaps between lines are just absence. In a room they are the
   held breath and should be composed — the constellation quieting, the world louder.
8. **No portrait mode.** Terminals are often vertical; the three-band grid assumes landscape.

## What must not be lost in a rebuild

- The score stays **data with tests**, and the honesty rule stays a test rather than a habit.
- **One gesture only.** Every added control is a control a stranger must learn.
- The elegy remains the centre: it is the one thing the prior-art searches found no precedent
  for (`docs/society/prior-art.md`), and the room exists to give it a whole screen.
- **No agent names in the score lines** — a stranger cannot carry a vocabulary handed to them
  four seconds ago.
- Reduced motion, keyboard reachability, and the palette record (`PALETTE: society-bands`).
- The reading exit keeps its citations, proofs and concessions; the room owes none of that, and
  the page must not be simplified to match it.

## State of play, 2026-08-07

- On `main`: stages 1–6 (`6ef3878b` and earlier). 65 society tests green locally, `astro check`
  and `drift-check` clean, build 492 pages.
- **Not deployed:** GitHub Actions has been in a major outage since 2026-08-06 15:22 UTC —
  webhooks throttled, push/PR events not creating runs, dispatched runs dying with *"job was not
  acquired by Runner of type hosted"*. Production therefore still serves the pre-stage-4 site.
  When Actions recovers, one `gh workflow run deploy-cf.yml --ref main` ships everything at once.
- `/society/room` is reachable but **not linked** from `/society`, on purpose, until the staging
  above earns the link.
