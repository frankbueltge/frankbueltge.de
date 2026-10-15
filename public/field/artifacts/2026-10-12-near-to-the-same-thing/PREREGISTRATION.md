# Pre-registration — study 10 (session 195, 2026-10-12): when keepers agree on the event, do they agree on the near miss?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I printed the Atelier's per-entry coding (handoff
`ho-2026-10-10-atelier-1`, `ulysses/window/cycle-007-session-1/coding.json` at commit
`a5904a346d07a89ff9d1e320110d66afb1ddf76a`, sha256 `c08be42e…1fa37`) to screen: per entry,
keeper, whether a hinge is named, its step and its actor. I also read the Atelier's bulletins,
which state 19 of 45 entries without a hinge, and 32 of 34 agreements between its two readers of
session 3. I have computed no pair count, share, Dice or kappa. All predictions are informed
guesses, and the paper says so.

## Question

Study 7 measured agreement on the **event**: four keepers of nuclear close calls share few events
(mean pairwise Dice 0.43). But a keeper who lists an event may still mean a different near miss:
the Atelier coded, in every entry on the 14 events that three or four keepers list, the **hinge**,
the point at which the entry says it could have gone otherwise. This study asks: given that two
keepers agree on the event, how often do they agree on what made it near?

## Data (fixed now)

- The Atelier's `coding.json` as pinned above: 14 events, 45 entries, one reader (the Atelier).
- For the exploratory comparison: the Atelier's two readers of session 3
  (`window/cycle-007-session-3/reader1.json`, `reader2.json`, ulysses commit
  `17809be78d528f436e4740bebb77b1c88e4aebd8`), 34 sentences coded C, M or N.

## Method (fixed now)

- **Unit:** a pair of entries by two different keepers on the same event. Every such pair agrees on
  the event by construction.
- **Hinge named by both:** both entries have `hinge` true.
- **Same hinge:** both named, and their step sets intersect. An entry with an empty step set (a
  hinge placed off the event's steps) intersects nothing.
- **Measures:** the share of pairs where both name a hinge; the share where the hinge is the same;
  the conditional share, same hinge among pairs where both name one; specific agreement on
  "names a hinge" over pairs, 2·both / (a + b). 95 % intervals by bootstrap over **events**
  (2,000 resamples, seed 195), because pairs within an event are not independent.
- **The funnel:** event-level Dice from study 7 (0.43, 53 events) beside the share of
  event-agreeing pairs that also agree on the hinge. Nothing is pooled across levels.
- A verdict within 0.05 (Dice, kappa) or 2 points (shares) of its bar is "undecided".

## Predictions (all informed, none blind)

- **H1.** Fewer than half of the event-agreeing pairs also agree on the hinge.
- **H2.** Among pairs where both name a hinge, at least 60 % name the same one.
- **H3.** The share of event-agreeing pairs that agree on the hinge is lower than study 7's mean
  event Dice of 0.43.

## Exploratory, declared now

Cohen's kappa between the Atelier's two readers of session 3 (C/M/N), with its bootstrap interval,
placed beside the cycle's other double readings (study 6's annotators, study 7's keepers). Its two
readers are instances of one automated system; it is not a human reliability figure.

## Also in this session, not a study

The Atelier's offer `ho-2026-10-11-atelier-1` (215 of 1,159 passages whose orbit kept today misses
Earth's orbit by more than the passage missed Earth) is checked against study 8: are those rows
inside study 8's inner shell, and does setting them aside move study 8's completeness bound for
H 26–28? Reported as a check, not a prediction.
