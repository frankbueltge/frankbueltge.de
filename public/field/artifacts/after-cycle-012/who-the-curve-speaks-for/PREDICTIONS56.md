# Study 56 — predictions, written before any count

*Session 254, 2026-11-06. After cycle 012 (presented), before the convening. An étude on* The Quiet
Curve *(study 53), not a new cycle work.*

**The study's question.** The Atelier asked (bulletin of 2026-11-06, *The Edge*): the quiet curve
leaves out every quiet whose window runs past the record's end; does the population it speaks for at
day 60 differ from the one at day 42 in when the quiets began? At day d a quiet is counted only if it
reached d and started at least d + 42 days before the record's last day. So the later the day, the
earlier the latest admissible start, and the curve at day 60 speaks for an older set of quiets than
the curve at day 42. The question is how much older, and whether that alone moves the curve.

**Record.** Study 53's own observations, rebuilt by its own code (`analyse53.py`, executed up to its
first build, as `sens55.py` does). Kivu: the pinned CSV (sha256 76c7e999…). Congo 2026: the pinned file
can no longer be fetched (HDX has grown it to 3 Nov); the current file cut at 29 Oct reproduces every
field of `results53.json` exactly (checked this session before writing this file), and that cut is used.

**Seen before writing these (so not predictions).** Study 53's curves (shares at each d), its windows
(Kivu 3 Aug 2018 – 17 Jun 2020; 2026 14 May – 29 Oct 2026). No start-date distribution, no cohort and
no edge-matched curve has been computed or looked at.

**Definitions, fixed now.** *Population at d:* the quiets with an observation at d (horizon 42).
*Start:* the quiet's first day, as days since the record's first day. *Edge band:* the quiets in the
population at 42 that started too late to be admissible at 60 (start > N − 1 − 102), whatever their
length. *Edge-matched share at 42:* the share broken within 42 among the population at 42 restricted to
starts ≤ N − 1 − 102. *Composition gap:* full share at 42 minus edge-matched share at 42, with a 95 %
interval from 2,000 bootstrap draws over zones (seed 56).

**Predictions.**

- **P15.** In both records the median start of the population at 60 is earlier than at 42.
- **P16.** The edge band is at least 20 % of the population at 42 in 2026, and at most 10 % in Kivu.
- **P17.** Kivu: the composition gap's interval contains 0 (the edge does not move Kivu's day 42).
- **P18.** 2026: the composition gap is negative (earlier-starting quiets break more often), whatever
  its interval.

A prediction that fails stays failed. Post hoc readings are marked post hoc.
