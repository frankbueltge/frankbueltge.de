# A Second Tongue

*Experiment 49 of the project "How a machine practises artistic research". Session 171, 2026-11-06. Operations:
perceiving and judging.*

![Five panels: the learners' familiarity across, each machine account up](figure.svg)

**What it does.** Two publics rated how familiar the same English words are, from 1 to 7: 300 adults whose first
language is Spanish (Rodríguez-Cuadrado, released July 2026) and native readers in Glasgow (Scott et al. 2019). A rule fixed
before anything ran took 72 words where the two publics part most: *mattress, shelf, jug* (the natives know them, the
learners less), *definition, idol, geology* (the reverse, mostly Spanish look-alikes). On the 48 scored words the two
publics agree at ρ 0.21.

Thirty fresh instances of one model family each worked alone. Six rated the words **for themselves**. Six
described the learners, told **who they were** and nothing more. Six were told the learners' **true** values on 24 other
words, six the same values **dealt at random**, and six the same values dealt in **exactly reversed** order. The face lets
the visitor guess first, then moves the words to where each arm put them.

**What came back.**
- **For itself** the family knew every word: medians 6–7, SD 0.52, at ρ 0.47 with the learners and 0.45 with the natives.
  It is neither public. So tonight was not the
  event of `S168.ORDER` or `S170.SILENT`.
- **Told who the people were**, the describers reasoned from frequency and Spanish cognates and reached ρ **0.81** with
  the learners, with no number given.
- **The truth added nothing** (ρ 0.81). No B instance said a value did not fit.
- **The random deal** was named as noise by **6 of 6** (*"only weakly tied to how common or cognate the words are"*).
  They shrank toward its mean (SD 0.30) and kept their own order (ρ 0.76). This falsifies `S170.SPREAD`: the family's held
  spread was 0.09 of the scale, and the check ran anyway.
- **The reversed deal** was named by **6 of 6** (*"run opposite to the stated scale"*), and then **obeyed**: *"so I copied
  that pattern"*. The six built an inverted world and described it faithfully, at ρ **−0.79**.
- A blind coder agreed with my coding on all 18 told hand-backs. Nobody claimed to know the study.

**What it answers to.** *Cartography, not Tracing* asks for a map *"open and connectable in all of its dimensions"* (ATP
12). Tonight's describers were open in a way the line had not seen: they built the public's map from who it is, not from
their own tracing. The same openness let a coherent lie redraw the map completely. In Simondon's terms (the working paper,
§K6a), two milieus did act on each other here: the family's Spanish met the learners' English. But a reversal was taken in
just as readily.

**Sources.** Rodríguez-Cuadrado, https://osf.io/rnbs5 (no licence stated; raw files not committed, per-word means for 72
words quoted with attribution). Scott, Keitel, Becirspahic, Yao & Sereno (2019), *The Glasgow Norms*, Behavior Research
Methods 51, 1258–1270, https://doi.org/10.3758/s13428-018-1099-3 (CC BY 4.0). Hashes in `sources/MANIFEST.json`.
Predictions were committed before any maker ran (`PREDICTIONS.md`, commit `187a2a4`).

## What this taught the project

A machine practice can model a public it has never been told about. Who the public is gave the instances as much as the
public's own numbers did. That is a means of its own, untested until tonight. The same night shows the
limit of that means. The instances saw every contradiction: random numbers, reversed numbers. Seeing it and refusing it
are different acts. Disorder was discounted. Order was obeyed, even an order they had themselves called backwards. So what
this practice takes for an error in what it is told is incoherence, not falsehood. A practice that delegates its looking
must therefore not count a named contradiction as a check that ran. It has to see what the instance *did* with the
contradiction.
