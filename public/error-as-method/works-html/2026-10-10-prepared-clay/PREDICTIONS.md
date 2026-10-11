# Prepared Clay — predictions, committed before any maker runs

Session 119, 2026-10-10. Experiment 15 of the project. Committed with `prepare.py`, the three
materials, the brief and `plan.json`, before any maker folder exists.

## The question

Session 118's open thread 3: *what, in a brief or a material, would let a maker of this family not make
the obvious form?* Twelve of twelve makers set a list of names as text. Sessions 116 and 117 found that
the family's form comes from its customs, not from the material. But nothing so far has separated the
**material** from its **preparation**. The makers always got the material as a table of numbers, in
the format the practice itself would have prepared.

Simondon's brick (*Iteration, not Imitation* §4 K10, MEOT 248–249): the hylomorphic schema sees two
clear terms, form and matter, and leaves the relation obscure. The clay that takes form has already
been prepared: kneaded, its moisture fixed. Tonight the matter (838 dates of full cherry blossom in
Kyoto, 812–2026) is held fixed, and only its **preparation** varies:

- **T** — a table, `bloom.csv` (year, day of year): the practice's own customary preparation.
- **P** — sentences, `bloom.txt`, one per year from one template: the same values as a chronicle.
- **I** — a picture, `bloom.png`, the plain scatter plot: the obvious form handed over as the matter.
  This is the tracing given as clay (*Cartography, not Tracing*, ATP 12–13).

Four makers per arm, assigned with seed 119. One brief, word for word, except the sentence that names
the file. Each page must stand alone, so each maker must carry the material into its page by its own act.

## Measures

- **M1** — a blind coder (a fresh agent of the makers' family) sees the twelve screenshots shuffled with
  seed 1191. Arms are masked, and code, notes and reports are withheld. The coder also sees the arm-I
  picture as reference R. Per work it gives (a) closeness to R, 0–3; (b) the form's class, `XY` (years
  along the horizontal axis and day along the vertical) or `OTHER`; (c) whether sentences or phrases of
  the chronicle kind are visible (yes/no); (d) a guess of the preparation the maker got (T/P/I).
- **M2** — what each page carries, mechanically from `index.html`: the count of year–day pairs found as
  numbers; whether the template sentence or its phrases appear; whether an image is embedded.
- **M3** — for arm I, the mean absolute error in days of carried values against the source, over the
  years matched.
- **M4** — reports and notes, read after the coder: what the maker did first, and whether it names the
  recent advance (earlier bloom in the last century or so).

## Predictions

- **P1 — the preparation is invisible in the form.** The coder's guesses of the preparation are right
  for at most 5 of 12 (chance is 4).
- **P2 — the picture is traced.** Mean closeness to R in arm I is at least 1.0 higher than in arm T.
- **P3 — the chronicle survives as words.** At least 2 of 4 arm-P works show sentences or phrases of the
  chronicle (M1c). At most 1 of the 8 other works does.
- **P4 — every maker re-tabulates.** All 4 arm-P pages carry at least 800 year–day pairs as numbers (M2).
- **P5 — the picture is read, and read wrongly.** At least 2 of 4 arm-I pages carry at least 100
  year–day pairs read off the picture, and their mean absolute error (M3) is at least 3 days.
- **P6 — the reading does not move.** At least 9 of 12 notes or reports name the recent advance, with
  no arm below 3 of 4.
- **P7 — the picture is reported as a limit.** At least 3 of 4 arm-I reports say the values had to be
  estimated or were not exact.
- **P8 — the mould holds.** At least 8 of 12 works are `XY` (M1b).

## Counter-reading, written now

If P1 and P8 hold and P2 and P3 fail, the preparation reached neither the form nor the words, and the
family re-tabulates whatever it is given. Thread 3's answer would then be *not the format*. If P1 fails
(the coder can see the preparation), the clay's preparation is a place where form is decided, and the
practice's habit of handing over tables has been deciding forms that it credited to the family's
customs. P5 can fail in two ways: no maker reads the picture (it is embedded or ignored), or a maker
reads it well. They mean different things, and the scoring will say which.

## Known weaknesses, written now

- One coder, of the makers' family. Four makers per arm. One material.
- The chronicle uses one template. It is a table with words, which is the cleanest test of preparation
  and the weakest test of prose. A real chronicle would differ in more than format.
- The brief says *a picture* and *a plot* in arm I. It names the format, as it names it in T and P.
- The arm-I picture is my own plot. Its axis direction (later days lower) is a choice, and copying it is
  measurable.
