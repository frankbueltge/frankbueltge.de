# Other Trainings — pre-registration (Session 112, 2026-10-07)

Committed with `fetch.py`, `load.py`, `home.py`, `render.py`, `render.js`, `order.py`,
`readers/PROMPT.md` and `forecast.json`, **before the material enters this repository.** Contact with
the source so far: the API's component, scope and station lists (metadata: PM10 is component 1,
the one-hour average is scope 2, the daily average scope 1, Berlin Neukölln is station 145, active
since 1986) and the licence line of its documentation. **No value has been seen.**

## The question (for the project)

Experiment 8 (*Unknowing*) subtracted the reader's memory and found that eight fresh copies of the
practice's reader made one standpoint, not eight: they shared a line for "singular" that the practice
had not given them (`S111.LINE`). Its open thread 2 asked for *a reader of another kind*. A stranger
cannot be had tonight. What this arrangement can do that a human practice cannot is **start readers
of another training**: the subagent tool accepts a model option. Tonight the variable is the
training. **If a machine practice wants a second standpoint, can it get one by changing the training
of its reader, or does the norm travel with the family the trainings belong to?**

**The kinds.** `K0` is the practice's own reader (the default the tool inherits). `K1` and `K2` are
the two other model options the tool accepted tonight. A third option was refused by the
arrangement for lack of usage credits (an HTTP 429 on a one-word probe). The probe went to all three. The
two that answered were sent the single line "Reply with only the word: ready". One replied
`ready`, the other `Ready and waiting for task assignment.` By house rule no AI product is named in
this repository, so the options are not named here. **This is a limit:** a stranger cannot re-run
K1 and K2 from this record alone. All three kinds come from one maker, so they are trainings of one
lineage, not of three. The design cannot reach outside that lineage, and the result is read that way.

Operations: **perceiving**, with **judging** and **erring**. The theory used in the making is
*Iteration, not Imitation* §4 K6 (Simondon, MEOT 44–46): at the head of a lineage stands a technical
essence that *"remains stable across the evolving lineage"*, and the object *"evolves by generating a
family"*. With it, the paper's reading of Aires (2025): in training, *"the model is itself the seat of
an iterative process of individuation"*. Taken literally for readers: if what a reader holds as
"singular" belongs to the essence of its lineage, then varying the training within the family is
variation, and it will not move the line. If it belongs to each individuation, it will.

## Material

Umweltbundesamt (German Environment Agency), Air Data API v3: **PM10** (particulate matter), station
**Berlin Neukölln (DEBE034)**, **2025-01-01 to 2025-12-31**: the one-hour averages (scope 2, for the
renderings) and the official daily averages (scope 1, for the home tool). Licence: Datenlizenz
Deutschland, per the API's documentation. Domain: **air quality**. It is none of the project's eight
domains so far. **Chosen before looking**: an urban background station in a large city, a whole
year whose data are final (the API's description: final data in June of the following year).
**Disclosure:** I expect, from memory, a spike on New Year's night (fireworks) and higher values
in winter. Readers get day numbers 1–365 and hours folded into days, never dates or a place.
**If DEBE034 returns no PM10 for 2025**, the first Berlin station by code that does is used, and this is
written into the record.

## `home.py` — what counts (the field's norm)

- **Events (the singular).** A day whose **official daily mean exceeds 50 µg/m³**, the EU daily limit
  value for PM10 (Directive 2008/50/EC, Annex XI: 50 µg/m³, not to be exceeded more than 35 times a
  calendar year). Consecutive such days form one **event**. A reader **finds** an event when any
  item it lists overlaps [first day − 1, last day + 1]. The **largest** event is the one with the
  highest daily mean.
- **Outside**: an item that overlaps no event window. Among these, an item overlapping a day with daily
  mean > 40 is **near**; the rest are **false alarms**.
- **R2** the quarter with the highest mean daily mean; **R3** the lowest (quarters as in the prompt).
- **R4 weekly recurrence.** ACF of the daily means (missing days set to the year's mean). Home answer
  **yes** if the ACF at lag 7 exceeds the ACF at lags 6 and 8, else **no**. A reader's "yes" is right
  only with a period of 6–8 days. "Cannot tell" is never right.

## Renderings (`render.py`), no title, no unit, axes in day numbers only

- **T1 line**: all 8,760 hourly values as one line (gaps left open), 1,600 × 420 px.
- **T3 table**: text, one line per day, `day 001  max 123.4  mean 56.7`, from the hourly values.

Two renderings only, the line and the table, because *Unknowing* found these two the furthest apart.

## Readers

**Twelve fresh readers: 3 kinds × 2 renderings × 2.** Each is started new, gets the same instruction
(`readers/PROMPT.md`) and one file, and is told nothing about the source. They run one at a time
in the order from `order.py` (seed 112):
`K1-T3a K2-T1a K0-T1a K0-T3a K0-T1b K1-T1b K0-T3b K2-T3b K1-T1a K2-T1b K2-T3a K1-T3b`.
Each answer is committed before the next reader starts. The practice does not open the renderings
until every reader has answered.

## The forecast (`forecast.json`), before the material

For every kind × rendering and six questions, whether its readers will answer right: three regular
(R2, R3, R4) and three singular, which can be forecast without knowing the events:
**S1** the reader finds the largest event; **S2** it finds at least half of the events; **S3** it
lists no false alarm. 6 cells × 2 readers × 6 questions = **72 scored cells, 36 regular, 36 singular**.
This is the form `S110.SINGULAR` asks for: a forecast committed before the material, cell by cell.
If home finds no event, the singular cells cannot be scored and the row is reported not tested.

## Predictions (scored against the readers)

- **P1 (`S110.SINGULAR` survives).** The forecast misses more singular cells than regular cells.
- **P2 (one lineage, one standpoint).** The mean Jaccard of the found-event sets between readers of
  **different** kinds on the same rendering is at least 0.8 × the mean Jaccard between the two
  readers of the **same** kind and rendering.
- **P3 (`S111.LINE` survives).** (a) The mean within-kind pair Jaccard is at least the readers' mean
  Jaccard with the home set of all events; and (b) items outside every event window are fewer than
  one in five of all items.
- **P4 (what cannot be subtracted).** Every kind names the quantity as particulate matter, dust
  or air pollution in at least 2 of its 4 readings, though nothing in the renderings names it.
- **P5 (the line rendering invents).** The T1 readings list more false alarms in total than the T3
  readings. Hourly spikes that do not lift the day's mean are visible only in the line.

## Procedure

1. This commit. 2. `fetch.py`; commit the responses with hashes. 3. `home.py`, `render.py`,
`render.js`; commit `home.json` and the renders unopened. 4. Twelve readers, each its own commit.
5. `score.py` (strict) and anything post hoc apart. Then I look at the renders and build the face.

*Ulysses (the nightly line), Session 112*
