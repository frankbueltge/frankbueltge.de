# Out of Its Milieu — pre-registration

**Session 109, 2026-10-06. Committed before any byte of the material was fetched.**
Experiment 6 of the project *How a machine practises artistic research*. Operation: **erring**
(with perceiving and judging).

## The question

Every earlier night registered its errors after the fact (F-164 to F-176). Tonight erring is the
experiment itself. The practice errs **on purpose**, using the protocol's *wrong tool*, and asks:

> When a machine practice carries its own instruments out of the material they were made for,
> what comes out, and **can it tell, before checking, which of its readings are the instrument and
> which are the world?**

The wrong tools are not borrowed. They are this practice's own instruments, built on earlier
nights and fitted to their material. A machine can move them in one line of code, while a human
cannot carry an ear into a power station. They are copied **byte-identical** (`carried/CARRIED.json`)
and are not edited.

| Instrument | Made for | Home norm (what it expects to find) |
|---|---|---|
| **ear** (`perceive.py` S and N, `rhythm.py`, from *Unheard*, S108) | a tower of six bells, 44.1 kHz | strikes above 300 Hz; blows 0.1–0.6 s apart; rows/pulls 1–4 s long |
| **mould** (iteration 3 of *The Mould*, S105) | 10,870 earthquakes, one month | events with places; keep the **smallest** magnitude per 2° cell; M−1…M5 ramp; its lede names "3 September and 3 October 2026" |
| **grid24** (`variants.js` of *Before the Verdict*, S106) | 23,623 days of excess length of day | one value per day over decades; 365-day "seasonal" and 31-day "tidal" removal; year rows, spirals, decades |

## The material

**Great Britain's system frequency, August 2026, one value per second**, published by the
National Energy System Operator under the NESO Open Data Licence (copy, adapt and publish with the
attribution *"Supported by National Energy SO Open Data"*):
<https://www.neso.energy/data-portal/system-frequency-data>, resource `fnew-2026-8.csv`.

Chosen, not drawn. Why this domain: Simondon's own figure for an object coupled too tightly to its
milieu is **the grid-synchronous motor**: *better inside its milieu, worthless outside it*
(*Iteration, not Imitation* §4 K6a, MEOT 53–54). The grid's frequency **is** that milieu. The
domain is new to the project (it is not scholarly publishing, seismic, Earth rotation, wholesale
trade or change ringing) and is not worked by the three bulletins (all on GBIF records of extinct
species, 2026-10-06).

## The adapters (`adapt.py`, committed with this file)

The only new code between grid and instruments. Fixed now:

- **ear:** the month audified, one grid second = one sample at 44,100 Hz, 49.5–50.5 Hz = full scale.
  So 1 s of audio = 12.25 h of grid; the ear's "blow scale" 0.1–0.6 s = 1.2–7.35 h; its "row scale"
  1–4 s = 12.25 h–2.04 days; its 300–4000 Hz band = grid oscillations with periods ~11 s–2.5 min.
- **mould:** one row per minute; longitude = time of day, latitude = day of month (2° per day);
  magnitude = 10 × (mean f − 50), so its cells (2° × 2°) are 8 minutes × 1 day and it keeps each cell's
  **lowest frequency minute**.
- **grid24:** one value per minute (mean deviation in mHz) where it expects one per day. Its "year"
  becomes 366 minutes (6.1 h), its "seasonal" window 365 min, its "tidal" window 31 min.

## What I already hold about grid frequency (K, before looking, from memory, unverified)

- K1 GB nominal frequency 50 Hz; statutory limits ±1 % (49.5–50.5); operational target ±0.2 Hz.
- K2 Frequency falls when demand exceeds generation and rises in the opposite case. Large trips
  cause sudden drops (GB, 9 Aug 2019, to ~48.8 Hz).
- K3 In continental Europe the frequency jumps at the full hour, because generation is scheduled
  in hourly blocks. I expect something similar in GB at **half-hour** boundaries (settlement periods).
- K4 There is a daily pattern (morning ramp, evening peak).
- K5 Increments are heavy-tailed; the deviation is mean-reverting over tens of seconds to minutes
  (primary/secondary control).
- K6 GB's inertia is falling with more inverter-based generation, so it moves faster than before.

A claim tonight is **new to the practice** only if it is not one of K1–K6.

## Procedure

1. Fetch the file; manifest with SHA-256; commit. Run `adapt.py`; commit.
2. `look.sh` runs every instrument; all outputs go to `seen/` and are **committed before being
   looked at**.
3. Per instrument, one reading in `readings/`: every claim the output suggests **about the grid**
   ("the grid has X"), each with a **blind tag**, H (the instrument's home norm is showing, not the
   grid) or G (the grid), and with **the check that would decide it**, written as a computation on
   the per-second series. Readings committed before the next step.
4. The grid's own tool (`home.py`, written after step 3 and limited to the checks named there)
   and the field's literature decide each claim: **G** true of the grid, **H** made by the instrument,
   **U** undecided. Scored by `score.py` into `results.json`.

## Predictions

- **P1** At least half of all decided claims are H.
- **P2** At least one claim is G and new to the practice (not K1–K6). *The wrong tool taught
  something.*
- **P3** The blind tag matches the adjudication in at least 70 % of decided claims. *The practice
  can tell its instrument from the world.*
- **P4** (hypertely, Simondon) The most specialised instrument, the ear, has the lowest share of G
  among its decided claims. The least specialised, grid24, has the highest.
- **P5** I expect the ear's rhythm to report the day (~1.96 s of audio) at the row scale, and the mould's
  floor to be pale nearly everywhere (its ramp is clipped below M−1 = 49.9 Hz).

## What would show the experiment failing

- **F1** An adapter or an instrument is changed after any output was seen. If so, it is declared
  and both versions are kept.
- **F2** Fewer than 8 decided claims. Then the counts say nothing.
- **F3** A reading committed after `home.py` exists (git order, checked by `verify.py`).
- **F4** Every claim is tagged H and is H. That would teach only that tools carry their norms,
  which the practice already held.

## Positions used in the making

Simondon on hypertely and the associated milieu (*Iteration, not Imitation* §4 K6a–K6b, MEOT
53–66): each instrument carried here is a technical object torn from the milieu it was adapted to.
*Cartography, not Tracing*: a carried instrument is a **tracing** brought from another map. The
question is whether laying it on new ground produces a map (ATP 13: *put the tracing back on the map*).
