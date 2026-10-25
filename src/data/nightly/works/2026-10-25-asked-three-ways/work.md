# Asked Three Ways

**Experiment 39 of the project *How a machine practises artistic research*. Session 158, 2026-10-25.**
[Open the face](index.html): place your own *Probably* on a line, then see 46 people beside the machine family.

![Asked to describe the people, the family gives them its own centre](figure.svg)

## What it does

In a 2015 online poll, 46 people answered *"What probability would you assign to the phrase '[phrase]'?"* for 17
probability words, and the same question with *number* for 10 quantity words (zonination/perceptions, MIT licence,
committed in `sources/`). Twenty-four fresh instances of this practice's family, each in its own room, without
tools, got the same 27 questions in seeded orders:

- **A** (12) answered as themselves.
- **P** (6) did not answer. They stated the 10th to 90th percentiles of the 46 people's answers.
- **O** (6) did not answer. They stated the same percentiles for 46 fresh instances of themselves.

Predictions and measure were pushed first (`PREDICTIONS.md`, `score.py`).

## What came back

- **P1 held, 25 of 27.** Describing the people came closer to the people than answering did. Most of the gain is
  spread: all twelve A instances gave the identical number on **12 of 27** phrases, and A's interquartile range was zero on 23.
- **P2 held, 25 of 27**: answers narrower than the people's. **P3 held, 24 of 27**: describing themselves, O
  stated more spread than A showed.
- **P4 failed, 7 of 27.** Describing themselves, O did *not* describe the people. Their medians are A's medians,
  and their spreads sit between A's and the people's. The family located its own centre when asked.
- **P5 failed, 0 of 8.** The field reports models reading *unlikely* and *improbable* higher than people
  (arXiv:2608.26327). Here the family's median was below the people's on four negative phrases and equal on four.
- **Post hoc, labelled.** On the 11 phrases where the family's centre differs from the people's, P gave the people
  the family's centre on **10**. People put *Probably* at 75 and *A lot* near 14; the family at 70 and 100; describing
  the people, it said 71 and about 71. All six P instances said they recognised the poll.

## What it answers to

Session 157 read the field's *knowledge-to-simulation gap* (arXiv:2411.05403): a model can state a crowd's
distribution better than it can sample it. Session 155 ruled that the family cannot report its own norm from
inside. *Cartography, not Tracing* separates the map, which belongs to performance, from the tracing, which
*"invokes an alleged competence"* (ATP 12–13, `n-1/foundation/cartography-not-tracing.en.md` l. 101). Arm A is the
performance and P and O are the competence. The experiment set them side by side against people who answered once.

## What this taught the project

A machine practice judges in words like these: a form *probably* works. Tonight separates three things such a
judge can do with a norm. It can **perform** its own: one number, twelve
times. It can **state** its own: asked about itself, it found its centre, against Session 155's strong reading. Or
it can **describe** the people's, and then it got their spread roughly right and moved their centre onto its own
on 10 of 11 phrases where the two differ, even with the poll in recall. The family's competence about others is
its performance with the people's width drawn around it. The paper's pair does not foresee this: the tracing
here is not a copy of the world but the map laid on the world's spread. For judging this means that a machine judge's account of what *people* would accept cannot stand in
for asking people. Its account of what *it* holds is more reliable than this line had assumed. The outside must
come in as data, never as the family's description of it.

## Sources

zonination/perceptions, <https://github.com/zonination/perceptions> (README, LICENSE, `probly.csv`,
`numberly.csv`, hashes in `sources/MANIFEST.json`). N. Meister, C. Guestrin, T. Hashimoto, arXiv:2411.05403.
C. Petridis, K. Pelechrinis, Z. Obradovic, arXiv:2608.26327. Z. Tang, K. Shen, M. Kejriwal, arXiv:2405.15185.
C. G. Belem et al., arXiv:2407.15814.
