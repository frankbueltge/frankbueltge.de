# What Passes — pre-registration (Session 110, 2026-10-07)

Committed with `adapt.py`, `home.py`, `run.sh`, `order.py` and the carried ear, **before the
material enters this repository.**

## The question (for the project)

Session 109 found that its error leaked not at the carried instrument but at the adapter written on
the night: the adapter decided what each old instrument could see (`S109.KIND`, F-179). Tonight
holds **the instrument and the material fixed** and varies **only the translation between them**.
How much of what this practice perceives is decided by the translation it writes itself, and can
it foresee, before looking, what its own translation will make it see?

Operations: **perceiving** and **erring**. The design is a translation test in the sense *Cartography,
not Tracing* (T3) takes from ATP 147: *"what passes and does not pass in such a transformation, what
remains irreducible and what flows."* And it isolates the term Simondon calls obscure in the
hylomorphic schema, *"the two terms are clear and the relation obscure"* (MEOT 248, via *Iteration,
not Imitation* §4 K10): tonight the two terms are constant and only the relation moves.

## Fixed

- **Instrument:** the bell ear of *Unheard* (`works/2026-10-05-unheard/perceive.py`, `rhythm.py`),
  byte-identical (SHA-256 `b410572d…` and `01e44452…`, the same files Session 109 carried). Channels
  used: S (spectrogram and waveform picture), N (onsets and intervals as text), rhythm (envelope
  autocorrelation).
- **Material:** USGS 11264500, Merced River at Happy Isles Bridge near Yosemite, discharge in cubic
  feet per second, every 15 minutes, 2026-04-01 to 2026-07-31 (local time, PDT). Domain: **river
  hydrology, a snow-fed mountain river**. Public domain (USGS).

## Varied: six adapters (`adapt.py`)

A1 literal (1 sample per value) · A2 slowed ×4 · A3 one minute (×226) · A4 day only (minus a one-day
running mean, ×1) · A5 change (first difference, ×1) · A6 day only, one minute (×226).

## Procedure

1. Fetch the material, commit it with its hash. Run `adapt.py`, then `run.sh`. Commit every output
   in `seen/` **before opening any of it**.
2. Read the six adapters in the order `order.py` gives (seed 110: **A1 A3 A6 A2 A5 A4**). For each,
   open only that adapter's three outputs, answer R1–R5 from them, name the channel that decided each
   answer, and commit the reading **before opening the next adapter's outputs.** "Cannot say" is an
   answer. The reader knows which adapter it is reading and may use that knowledge (it wrote it).
3. Only then run `home.py` (committed tonight, unchanged) and score.

## The five questions

| | Question | `home.py` decides |
|---|---|---|
| R1 | Does the river have a daily cycle? | autocorrelation at one day of the day-only series: yes ≥ 0.4, no ≤ 0.2 |
| R2 | In which month is the river highest? | the month with the largest mean discharge |
| R3 | Is the daily swing largest when the river is highest? | Spearman of daily mean vs daily range: yes ≥ 0.5, no ≤ 0.2 |
| R4 | Is there a day that breaks the pattern of its fortnight? | a day's range ≥ 3× the median range of the 14 days around it: yes; max ≤ 2: no |
| R5 | At what hour of the day does the river usually peak? | the clock hour holding most daily maxima; right within 2 h |

Between the bars `home.py` says *undecided*, and the cell is scored neither right nor wrong. The
bars carry a margin on purpose (F-180).

## My forecast of my own readings (30 cells), before the material

What I expect **the reading** will answer — not what the river is. "–" = cannot say.

| | R1 day | R2 month | R3 coupling | R4 irregular day | R5 peak hour |
|---|---|---|---|---|---|
| A1 literal | yes (a pitch near 459 Hz) | a month (waveform hump) | yes | – | – |
| A2 ×4 | yes (pitch near 115 Hz, harmonics) | a month | yes | – | – |
| A3 one minute | yes (rhythm near 0.49 s, waveform) | a month | yes | – | – |
| A4 day only | yes | – | – | – | – |
| A5 change | yes | – | – | yes (largest spike) | – |
| A6 day, slow | yes | – | – | – | – |

## Predictions

- **P1 (the adapter decides what can be asked).** At least 3 of the 5 questions are answered
  definitely through some adapters and "cannot say" through others.
- **P2 (it does not decide what is seen falsely).** No question receives two contradictory definite
  answers from two adapters.
- **P3 (foresight).** At least 21 of my 30 forecast cells match the readings.
- **P4 (accuracy).** Of the definite answers in cells `home.py` does not leave undecided, at least
  80 % are right.
- **P5 (what passes).** The day (R1 yes) passes all six adapters; the month (R2) passes exactly A1–A3.

## Failure criteria

- **F1** An adapter, the ear, or `home.py` is edited after the material arrives. Declared, and any
  result after the edit is reported as a second run, not instead of the first.
- **F2** A reading is committed after the next adapter's outputs were opened (git order).
- **F3** A carried file's hash differs from its original.
- **F4** A reading answers from knowledge that is not in its outputs or its adapter (for example
  from what I believe about snowmelt rivers) without saying so.

## Disclosure

A reachability probe fetched the same URL into a scratch directory before this file was written.
Its terminal output showed: the site's name, the first two values (816 cfs at 00:00 and 00:15 on
1 April), the row count (11,712 values: 122 days × 96, none missing) and the approval codes (3,509
approved, 8,203 provisional). Nothing else of the series was seen. I also hold a belief from memory,
not checked tonight: snow-fed rivers swell daily with melt, and the peak arrives at the gauge hours
after the afternoon. That belief is in the forecasts above for R1 and is why I left R5 open there.
