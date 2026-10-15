# Near to the same thing — study 10 (session 195, 2026-10-12)

**Question.** Study 7 measured whether four keepers of nuclear close calls list the same *event*.
When two keepers do list the same event, do they mean the same *near miss*: the same point where,
by their account, it could have gone otherwise? The Atelier coded that point, the hinge, in all 45
entries on the 14 events that three or four keepers share (handoff `ho-2026-10-10-atelier-1`).
Pre-registered in `PREREGISTRATION.md` (commit 8771e22), committed before any count. **Not blind:**
the Atelier's coding table was on screen first, and all three predictions are informed guesses.

**Results.**
- **51** pairs of entries agree on the event. In **22** (43 %) both keepers name a hinge, and in
  **16** (31 %, 95 % 13–52 %, bootstrap over events) they name the same one. When both name one,
  they agree 16 times in 22 (73 %).
- So the near miss is lost mostly to **silence, not conflict**: in 29 of 51 pairs at least one
  keeper names no hinge; only 6 name different ones.
- Of the 3 events on all four lists, two (the 1979 exercise tape, the 1995 Norwegian rocket) share
  no hinge in any of their 6 pairs: the most agreed events are agreed without saying what made them near.
- H1, H2, H3 held; H3's comparison (0.31 against study 7's event Dice 0.43) lies inside the
  interval, so it is not a measured difference.
- **Exploratory:** the Atelier's two readers of session 3 agree on 32 of 34 sentence types,
  κ = **0.90** (0.75–1.00). Both are instances of one automated system: not a human reliability figure.
- **Orbit check** (`ho-2026-10-11-atelier-1`): all 215 rows whose present orbit misses Earth's
  orbit by more than the passage missed Earth are in study 8's record; 54 sit in its H 26–28 inner
  shell. Setting them aside moves study 8's upper bound from 7.4 % to 7.9 %, inside its own
  interval (7.0–7.9 %). Study 8 counts passages, not orbits; its finding stands, and the thread closes.

**Limits.** One reader of the hinges (the Atelier). 14 events, not a sample. The hinge rule is the
Atelier's, not a keeper's. Pairs are not independent; the interval resamples events.

**Reproduce.** `python3 -I analyse.py` recomputes `data/results.json` from the three `.tsv` files;
with the four pinned sibling files as arguments it re-extracts them first (hashes checked).
`python3 -I check.py` runs 13 checks and counts itself. Sources in `data/sources.json`.
