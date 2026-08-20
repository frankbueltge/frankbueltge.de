# The Society — the room: what is built, and what is still only implemented

**Date:** 2026-08-07 · **Route:** `/society/room` (live and linked from `/society`) · **Verdict that
prompted this note:** Frank, 2026-08-06/07, wording private — the room is not yet properly
staged. He is right, and this file says exactly where the line runs, so the next working session starts from a
diagnosis rather than from a blank page.

> **Worked through, 2026-08-07 (later the same day).** All eight items below are done, and the
> staging turned up four honesty defects that the diagnosis had not seen — recorded in
> *What the restaging found* at the foot of this file. The eight-item list is kept as written
> so the diagnosis and the answer can be read against each other.

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

## What the restaging did, 2026-08-07

One picture instead of two panels. The society and the block world now share a single
coordinate space (`src/lib/society/stage.ts`) — the constellation above, the table directly
beneath it, nothing drawn between them, because the gap is the relationship. On top of that
sits a camera: a framing is a *region of interest*, grown at runtime to the screen's exact
shape, so there is never a letterbox and never a stretch. The shot list is data
(`SHOTS`, one entry per beat), so a new beat cannot ship without someone deciding where the
room is looking while it is said.

Against the eight:

1. **Tempo** — the room runs its own clock (`ROOM_RATE`, playback not physics) and its own
   road into sleep (`SLEEP_AFTER`), both in `room-clock.ts` so the test tunes what ships.
2. **Typography** — five registers (`title · plain · quiet · invite · final`) declared per
   beat in the score, because which sentence carries the piece is a dramaturgical decision,
   not a stylesheet one. `forget` is the only `final`; `invite` the only instruction.
3. **Camera** — `wide · mind · ground · site`, eased, with world dramas pulling the frame
   only when the room is already watching the world.
4. **The world breathes** — it fills the frame in `ground` and `site`, recedes in `mind`.
5. **Arrival** — an attract state between passes: still working, saying nothing, resolving
   into a new morning when someone appears (or after 24s, for an empty gallery).
6. **The gesture is taught** — BALANCE offers itself with a slow ring while the invitation
   stands, so the affordance is shown rather than described.
7. **Silence is composed** — the constellation draws back, the table comes forward, and a
   silent beat is never held on the constellation alone.
8. **Portrait** — its own framings, sharing the composition's centre and differing only in
   width, so a tall screen's unavoidable slack falls evenly instead of all beneath the
   picture.

## What the restaging found

Four things the diagnosis had not seen, all of them the same class — the room saying
something that was not true at the moment it said it:

- **"A tower. And no one built it." over an empty table.** The beat's cue was a memory of an
  event, not the state of the world; the first tower stands about ten seconds and then the
  wrecker has it. The cue now reads live state, and the room waits — about fifteen silent
  seconds of watching the hand work, which turns out to be the best part.
- **The same line outliving its tower.** Even with a live cue, a claim shown for its full
  four seconds can be falsified in second one. A shown claim is now *retracted* the moment it
  stops being true, minimum reading time forfeited.
- **`stands` and `remember` were unconditional** — they asserted a tower with nothing
  requiring one to exist. Both are conditional now, and `score.test.ts` recognises them as
  claims.
- **Eighty seconds of black at the end for anyone who stayed.** A visitor who keeps moving
  keeps the society awake, so "left alone, it sleeps" simply never became true and two beats
  timed out in silence. The sleep act now has two endings and takes whichever happened; a
  visitor who has walked off gets neither, because *"you keep it awake"* said to an empty
  room is the same lie in the other direction.

The lesson is the one the palette record already learned: `score.test.ts` checked that lines
which make claims are *marked* as claims, which is a property of the data, while the promise
is about the moment of speaking. `room-clock.test.ts` now runs whole passes against the real
engine and asserts the promise itself. All four defects were found by watching the screen;
none of them should have needed to be.

**And one of the same kind in the palette.** The room shipped carrying the
`PALETTE: society-bands` marker and a comment claiming "no new hues", while using four
brighter hexes of its own — one pair of which, senses `#4b8fe4` against reflection `#9085e9`,
measured protan ΔE **1.1** against the validator's floor of 8. Blue and violet were one
colour for a protan visitor. The room now uses the measured quartet, and
`src/styles/society-room.css` is named in the set's `usedBy`, so the test checks it instead
of taking its comment's word.

## State of play, 2026-08-07

- On `main`: stages 1–6, plus this restaging (`745965cc`). 169 society tests green (65 before),
  `astro check` and `drift-check` clean, build 492 pages.
- **Deployed.** The GitHub Actions outage of 2026-08-06 (webhooks throttled, dispatched runs
  dying with *"job was not acquired by Runner of type hosted"*) recovered late that evening;
  stages 4 and 5, the room, and this restaging all shipped.
- `/society/room` is **linked** from `/society` since 2026-08-07 — named there as a different
  address to the visitor rather than as a lighter version of the page: one explains and rewards
  an hour, the other shows and asks for four minutes.
