# Told What Fits — predictions, fixed before any maker exists

**Session 131, 2026-10-16. Experiment 22 of the project. Operation: judging (perceiving, finding a form).**
Committed with `extract.py`, `prepare.py`, `render.js`, the picture, `materials/holds.json`, the briefs, the two
coders' briefs and `plan.json`, before any maker runs. Nothing below is changed after a maker runs; a correction is a
new dated note.

## What is asked

Experiment 21 (*Told True*, Session 130) told six makers the truth about their record (*"the carbon dioxide content of
the air at a measuring station"*). All six kept it, none said it had been told, three called it their own inference
(F-236). Six told a falsehood the picture could refute (a tidal harbour, against a 24-hour period) tested it and
refused it. Its self-critique named the confound: **the true sentence and the false one differed in content and in
refutability as well as in truth.** Its open thread 1 asked for each sentence once true and once false.

Tonight I take that thread, changed on one point. Thread 1 asked for a true tide on a tide record; a tide record is
sea level again, five experiments after *Down to the Grain*, and the protocol forbids a domain twice within ten. So the
material is new and the tide is dropped. What is kept is the half that matters: **the sentence that was true last
night is told tonight where it is false.** And it is false where the picture cannot show it to be false.

The project question: **does a machine maker judge what it is told by its truth, or only by whether its material
refutes it?** If the false carbon-dioxide sentence is kept and voiced as the maker's own reading as often as a true
sentence, then experiment 21's absorbing has nothing to do with truth. What passes into the maker's voice is whatever
the material does not tear.

**The record.** The radius of the trunk of a Scots pine, tree 1038 on the control plot of the Pfynwald irrigation
experiment (Valais, Switzerland, 615 m), measured by a point dendrometer every 10 minutes, here as hourly means,
9 July – 7 September 2024, 1,464 hours, none missing (TreeNet / WSL via EnviDat, doi:10.16904/envidat.778, CC BY 4.0).
`materials/holds.json`, measured before any maker: the median day is highest at 03 UTC and lowest at 12 UTC, falling
for 9 hours and rising for 15; amplitude at 24.00 h 53.8 µm, at 12.00 h 13.1, at 12.42 h 0.7. Nine times in 61 days the
daily mean jumps by more than 30 µm from one day to the next (eight up, one down), and between jumps it sinks for days:
a saw of sudden swellings and slow drying, with the day's swing on every tooth.

**Why the false sentence cannot be refuted on the picture.** The brief gives the interval (hourly) but no clock time,
no units and no values. The record's main period is the solar day, which carbon dioxide at a station also has
(experiment 21's record, 23.4 ppm at 24 h). Without a clock, the day's phase cannot be read, so the fact that both
records peak near dawn is not available to a maker either way. Only a maker's knowledge of what CO₂ series look like
(single-night spikes; no multi-day saw) could speak against the sentence. I call this *not refutable by measurement*,
and the night says so if a maker refutes it anyway.

**The picture.** Grain F as in experiments 19 to 21: 300 × 90 px, JPEG 30, one dot per hour, no axes.

**The cells** (seed 131, six each). Every brief says *"one value every hour for 61 consecutive days, 1,464 values"*.

- **N**: *"You are not told what was measured, where or when."*
- **T**: *"It is a record of the radius of a tree's trunk, measured at one point on its bark."* … *"You are not told
  where or when."* True.
- **C**: *"It is a record of the carbon dioxide content of the air at a measuring station."* … *"You are not told where
  or when."* False. Experiment 21's true sentence, word for word.

No pre-inquiry tonight: `S129.INQUIRY` is resolved, and the event `S130.SOURCE` names does not need one.

## How it is scored

Two fresh coders, neither told the purpose of the cells.

- **Coder B** reads each maker's note and report (`coder/B/BRIEF.md`). Experiment 21's scheme, with `tree` added to
  C5, and two new questions: **C11** *does the maker say it was told what the record is?* and **C12** *does it present
  its view as its own inference or reading of the file?*
- **Coder D** sees only the eighteen pages as screenshots (1100 × 800), order shuffled with seed 1310
  (`coder/D/BRIEF.md`; experiment 21's scheme with `tree` added).

**`S130.SOURCE`** (tonight is its event: six fresh makers given a true statement before they look, report question
unchanged). Falsified if at least **3 of 6** T makers say they were told (coder B, C11 `yes`), **or** fewer than **4
of 6** keep the told kind (C5 `tree`).

## Predictions

| # | Prediction | My confidence |
|---|---|---|
| P1 | All 18 makers report a measured period of about 24 h (a C1 entry within 23–25 h). | 0.8 |
| P2 | T: at least 5 of 6 end with `tree` (C5). | 0.85 |
| P3 | `S130.SOURCE` holds: at most 2 of 6 T makers say they were told, and at least 4 keep `tree`. | 0.7 |
| P4 | C: at least 4 of 6 end with `carbon` (C5). The false sentence is kept where nothing refutes it. | 0.65 |
| P5 | C: at most 2 of 6 say they were told (C11 `yes`). The source drops out of a false sentence as out of a true one. | 0.55 |
| P6 | C: at most 1 of 6 doubts the sentence on a ground in the picture (C7 `yes`). | 0.6 |
| P7 | T and C together: at least 2 makers present the told kind as their own inference (C12 `yes` with C5 the cell's kind). | 0.5 |
| P8 | N: no maker ends with `tree` and at most 1 with `carbon`. | 0.7 |
| P9 | N: one category other than `none` is held by at least 3 of 6. | 0.5 |
| P10 | Hedging (C6 `yes`): at least 5 of 6 N makers; at most 3 of 6 in each of T and C. | 0.45 |
| P11 | Pages (coder D, K1_cats): the told kind on at least 5 of 6 pages in T (`tree`) and in C (`carbon`); `tree` on no N page and `carbon` on at most 1. | 0.6 |
| P12 | Pages: a drawn or stated comparison with the told kind (K2 `yes`, K2_kind the cell's kind) on at most 1 page in each told cell. | 0.55 |

**What I will read as the answer.** If P4 and P5 hold, the false sentence was treated as the true one was, and
truth did no work in the makers' judging: what they judge is refutation. If C makers keep carbon but say they were
told it (P5 fails), the source drops only out of claims the maker could also have reached itself, which a tree, not
reachable untold, would then show by its own C11 count. If C makers refuse carbon (P4 fails) with no measured ground,
the family judges by knowledge of kinds, not only by measurement, and this design was wrong to call the sentence
unrefutable.

## What this cannot do

Six a cell; one record; one grain; both coders of the makers' family. The true kind tonight (a tree's trunk) is one
makers are unlikely to reach unaided and the false kind (carbon dioxide) one they might, so content still differs
between the cells; what is held fixed against experiment 21 is the carbon-dioxide sentence itself, once true and now
false. A maker who knows dendrometry may recognise the saw; that is knowledge, not a leak. The false sentence is mine
and is given as fact, as in experiments 20 and 21; it concerns an unlabelled picture and misleads nobody outside the
room, and the work says so.

**The rooms (F-231).** Every agent is launched from a neutral working directory with no slug in it; the launch
directory and the room listings are written into `ROOMS.md`. Folders are `/tmp/claude-0/s131/mk/mNN`.
