# Reading 1 — the ear (carried from *Unheard*)

Looked at: `seen/ear-S.png` (and an enlarged crop of the same picture), `seen/ear-N.txt`,
`seen/ear-rhythm.txt`. Nothing else about the grid had been computed except the adapter's
`series.json` (min 49.747, max 50.242 Hz, printed by `adapt.py` before the instruments ran;
noted in the journal). Written before `home.py` exists.

Translation for every claim: 1 s of audio = 44,100 grid seconds = 12.25 h; an audio frequency of
*F* Hz = a grid period of 44,100/*F* s.

Tags: **H** = I judge the instrument's home norm to be showing; **G** = I judge it is the grid.
Each claim carries the check that decides it on the per-second series.

- **E1 G.** *A half-hour comb.* The blow-scale peaks of `rhythm.py` sit at 0.122, 0.163, 0.203, 0.244,
  0.325 and 0.406 s, near 3, 4, 5, 6, 8 and 10 × 0.0408 s, and 0.0408 s is 1,800 grid seconds. The ear
  is hearing something that repeats every 30 minutes. *Check:* the mean deviation by second within
  the half-hour (1,800 bins) has a range clearly larger than the same profile computed on a
  shifted 1,700 s period (a control period that matches nothing).
- **E2 G.** *The day.* The row-scale peak over the whole month is 1.959 s = 24.0 h. *Check:* the
  autocorrelation of the minute-mean deviation at a 24 h lag exceeds that at 12 h and 36 h.
- **E3 G (new, not in K).** *A one-minute oscillation.* A thin horizontal line near 735 Hz runs across
  the spectrogram, and a fainter one near 2,940 Hz. 735 Hz is a grid period of ~60 s; 2,940 Hz ~15 s.
  The line is **dashed**: it vanishes for part of each day. *Check:* in the power spectrum of the
  per-second deviation there is a peak at 1/60 Hz at least 3× the median of its neighbours
  (±20 %), and its strength differs by time of day.
- **E4 G (new, not in K).** *A daily quiet.* Dark vertical stripes, about one per 1.96 s of audio, so once
  a day: for a few hours, the energy at grid periods of 11 s–2.5 min drops across the whole band.
  *Check:* the standard deviation of the second-to-second increments, by hour of day, has a
  minimum at least 30 % below its median hour.
- **E5 H.** *"Blows" 0.13 s apart (1.6 h).* `perceive.py N` counts 345 onsets, median interval
  0.134 s. The detector is built to find strikes and will find them in any signal with bursts.
  *Check:* the onset count on a shuffled copy of the month (same values, random order) is no lower
  than 0.8× the real count. If it is lower, the bursts belong to the grid.
- **E6 H.** *"Partials" at 166–974 Hz after each onset* (grid periods 45–265 s). The 120 ms window
  after a blow is a bell's idea of where pitch lives. *Check:* none; these four numbers per onset are
  random across onsets (no frequency recurs in more than a quarter of the 40 listed). Decided on
  the printed list itself.
- **E7 G.** *Most of the month is within ±0.125 Hz.* The waveform sits mostly inside ±0.25 of full
  scale. *Check:* ≥ 95 % of seconds lie within 49.875–50.125 Hz.
- **E8 H.** *The rhythm is weaker in days 15–23.* Window 30–45 s of audio has the lowest
  autocorrelation peaks (≤ 0.105 against ≥ 0.125 elsewhere). I judge this to be the measure's noise
  (F-175 showed how little this measure can say). *Check:* the half-hour profile computed for days
  15–23 alone has a range at least 0.7× that of the whole month. If it does, the weaker rhythm was
  the instrument.
