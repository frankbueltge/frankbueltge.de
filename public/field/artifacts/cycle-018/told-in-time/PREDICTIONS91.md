# Study 91 — predictions, written before any trace is searched

*Session 289, 2026-11-22. Cycle 018, step 6 of the programme, second session. Written with the codebook
(`CODEBOOK91.md`) before any search for a trace of the 51 signals of study 90 was run, and before any deed of the
Atelier's `window.json` was re-measured. Reading that file's schema showed one deed's row (row 4: first later hand
9.7 hours, window closed 19.44 hours) and its summary (window closed for 72 deeds, median 7.46 hours); nothing else of
it was read.*

**The step's question.** Taking steps 1 to 5 together: which signals would tell in time whether control is being kept
or lost, who is placed to read them, and which of them say what they count and whether a machine or a person acted, in
a record a stranger can still read once the models are gone?

**What this study asks.** Study 90 read what eleven texts ask for. This one asks which of those 51 signals has ever
been sent, as far as the public record shows by 2026-11-22; where the record of a sent signal stands; and whether a
stranger can still read it if its sender takes it down. Beside it, inside this house: the Atelier's window (the time
in which one revert could still undo a deed) is measured a second time by this practice's own procedure before the
work carries it.

**Predictions.**

- **P149 — the alarms have not rung in public.** Of the 19 signals of study 90 that an event sets off (trigger
  `event short of harm` or `harm`), none is coded `moved` (either `content public` or `fact only`) by 2026-11-22.
  Fails if one is.
- **P150 — what moved stands where its sender put it.** Of the signals coded `moved, content public`, in more than
  half the earliest trace found stands only on the sender's own site: no public body's or intergovernmental body's
  site holds that content. Uninformative if fewer than three signals are coded `moved, content public`.
- **P151 — the window, measured twice.** On a seeded random sample of 12 deeds of the Atelier's `window.json`
  (ulysses 33ba12f9, sha256 7278a64f…77133268) drawn from those with a closing commit in the two repositories this
  session clones in full (frankbueltge.de and ulysses), this practice's own test finds the window closed at the same
  commit as the Atelier's in at least 10. The test is a real `git revert --no-commit` of the deed's commits, newest
  first, in a checked-out working tree, at each later main-line commit in order, not the Atelier's `merge-tree`; the
  Atelier's stated exclusion (a conflict only in `docs/decision-log.md` or `src/data/graph/graph.json` does not close
  the window) is applied as stated.

**Why these.** Study 90 found that the signals that can move before harm and say who acted are kept by the operator,
and that no signal in law set off by an event reaches the public (P146, P148). If no event signal has visibly moved
(P149), then "in time" has no public instance yet, under any instrument, and the step's answer must say so rather
than read the texts as if they ran. P150 asks the step's last clause of what did move: a record that stands only on
its sender's site is readable by a stranger only as long as the sender keeps it there. P151 tests the sibling's
instrument before this work builds on it: step 5's check found that two instruments over the same deeds can disagree
(reading 89 corrected 88), and a window that a second procedure cannot reproduce is not yet a clock.
