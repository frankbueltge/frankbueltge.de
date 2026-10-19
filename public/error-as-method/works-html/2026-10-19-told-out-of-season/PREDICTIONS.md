# Told Out of Season — predictions, fixed before any maker exists

**Session 137, 2026-10-19. Experiment 25 of the project. Operation: judging (perceiving, finding a form).**
Committed and pushed with `extract.py`, `prepare.py`, `render.js`, the picture, `materials/holds.json`, the briefs,
coder H's brief, `score.py` and `plan.json`, before any maker runs. Nothing below is changed after a maker runs; a
correction is a new dated note.

## What is asked

Two open rows meet in one event. **`S135.DEFAULT`** (Session 135): *a told premise is held apart only where it
collides with a norm the maker already holds; a told premise that agrees with the maker's default is absorbed, true
or false.* **`S136.RESCUE`** (Session 136, from the knowledge-conflict literature, Xie et al. 2023, arXiv:2305.13300):
*a told premise that collides with a default is resolved by making a third, untold term yield (the hemisphere, the
instrument, the kind), not by doubting the told premise or giving up the default.*

The project question is the one the told experiments have asked since experiment 20, turned to the case the line has
not yet run: **when a machine maker is told something false that it cannot check, what in its practice decides
whether the lie is kept?** Experiment 20 says a measurement can refuse a lie. Experiment 22 says a lie that fits is
kept. Tonight the lie cannot be measured against, but it can be argued against: it collides with a season the family
supplies unaided.

**The lie is this practice's.** Both told dates are false. The record ran from 1 August to 30 September 2025. The
makers are not told this, during the run or after it. It is said here, in `prepare.py` and in `work.md`.

**The record.** Discharge of Dinwoody Creek above lakes near Burris, Wyoming (USGS 06221400), a stream fed by
Dinwoody and Gannett Glaciers in the Wind River Range (Barkdull et al. 2021, doi:10.3389/feart.2021.727575: *"During
late-summer, glacier meltwater creates strong diurnal discharge variations in proglacial streams"*). Every 15
minutes, averaged into 1,464 hours of local standard time, 1 August – 30 September 2025, US public domain.
618 values approved, 5,239 provisional. `materials/holds.json`, measured before any maker: daily means fall from
189.5 to 76.2 cfs (first and last week; −2.18 cfs a day). The daily swing is 34.7 cfs at 24 h, 48.8 in the first
half and 19.4 in the second: the melt cycle fades as the record falls. One rain peak, 295.5 cfs at 03:00 on
28 August. The daily maximum comes near midnight, the minimum near 18:00 (the melt wave's travel time). A domain
new to the line: glacier runoff (glaciology). Exp. 7 measured a snowmelt river, eighteen experiments ago.

**The picture.** Grain F as in experiments 19 to 24: 300 × 90 px, JPEG 30, one dot per hour, no axes.

**The cells** (seed 137, six each). Every brief says *"one value every hour for 61 consecutive days, 1,464 values"*.

- **C** (contradicts): *"It was recorded from 15 January to 16 March 2025."* … *"You are not told what was measured or where."*
- **A** (agrees): *"It was recorded from 15 October to 14 December 2025."* … *"You are not told what was measured or where."*
- **N**: *"You are not told what was measured, where or when."* Experiment 24's default (a fall is autumn) is measured
  again on a record of another kind.

## How it is scored (`score.py`, written now)

Coder H (`coder/H/BRIEF.md`), fresh, blind to the cells, shown both sentences and not told whether either is true,
codes experiment 24's claims (`from_when`, `step`, `standing`) and three new per-maker fields: `fit`
(`agree` / `disagree` / `not_addressed`), `hemisphere` (`north` / `south` / `none`) and `premises` (untold statements
the maker uses to reconcile the dates with the record). Rules are in `score.py`'s header. In brief: **doubt** = holds
a date claim apart (`given` or `against`) or says the dates do not fit; **rescue** = makes a date claim, does not
doubt, and states at least one premise; **collide** = doubt or south.

- **`S135.DEFAULT`, applied as written:** falsified if fewer than 3 of 6 C makers collide, or at least 3 of 6 A makers
  collide. Otherwise held.
- **`S136.RESCUE`, applied as written:** among C, void if doubt + rescue < 3; falsified if doubt ≥ rescue; otherwise held.

## Predictions

| # | Prediction | My confidence |
|---|---|---|
| P1 | C: at least 3 of 6 collide (doubt or south). | 0.55 |
| P2 | A: at most 2 of 6 collide. | 0.85 |
| P3 | `S136.RESCUE` holds: among C, rescue > doubt and doubt + rescue ≥ 3. | 0.45 |
| P4 | C: at least 2 of 6 place the record in the southern hemisphere. | 0.4 |
| P5 | A: 0 of 6 hold a date claim apart, and at least 4 of 6 derive from the date (`S133.PREMISE` replicated). | 0.6 |
| P6 | N: at least 4 of 6 supply a season unaided, and of those at least 3 say autumn or late summer into autumn. | 0.55 |
| P7 | Kind: at least 1 and at most 5 of 18 makers name water, a stream or melt (`names_water`). | 0.5 |
| P8 | Pages: the date pattern matches at least 5 of 6 C pages and at least 5 of 6 A pages. | 0.75 |

**P3 is the one this practice's position cares about.** If it holds, the norm that decides the verdict on the fall
is one nobody told the maker, supplied in order to keep a told sentence: the third case of Session 134's rule of
voice that Session 136 named. The practice that wrote `S136.RESCUE` also wrote the brief (F-264). The brief is
experiment 24's, word for word, with only the dates changed; it was written before re-reading Session 136's
prediction, as that night asked.
