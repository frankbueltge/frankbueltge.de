# Reading 2 — the mould (carried from *The Mould*, iteration 3)

Looked at: `seen/mould.png` and two enlarged crops of it. Written before `home.py` exists.

Translation: one cell = 8 minutes (column, time of day, 180 per day) × 1 day (row, 31 rows, 1 August
at the top). Colour = the lowest one-minute mean frequency in the cell; one magnitude unit = 0.1 Hz;
M0 = 50.000 Hz, M−1 = 49.9 Hz, darkest = at or below 49.9 Hz (the ramp clips there).

**First, what the instrument says of itself.** The lede still reads *"the smallest event the catalogue
recorded there between 3 September and 3 October 2026 … Dark: it heard very small ones."* It is
the mould's home sentence, untouched, laid on a month of electricity. It is not a claim about the grid and
is not counted.

**And a prediction failed at sight.** P5 expected the floor to be **pale** nearly everywhere. It is **dark**
nearly everywhere. I had the ramp the wrong way round: low magnitude is dark, and a floor *below* 50 Hz
gives a negative magnitude. It is my error about my own instrument, filed as F-178.

- **M1 G.** *The grid dips below 50 Hz in almost every 8 minutes.* Hardly a cell is lighter than the M0/M1
  swatches. *Check:* ≥ 70 % of 8-minute cells contain a minute whose mean is below 50.000 Hz.
- **M2 G.** *A floor at or below 49.9 Hz is common.* Roughly a third of the cells look as dark as the
  darkest swatch. *Check:* ≥ 25 % of cells contain a minute whose mean is ≤ 49.9 Hz.
- **M3 G.** *The floor persists over half an hour.* Light and dark come in horizontal blobs 3–6 cells long
  (24–48 min), not as single cells. *Check:* the lag-1 autocorrelation of the cell floors along the time
  axis is above 0.4, and at lag 4 (32 min) still above 0.15.
- **M4 H.** *The floor does not depend on the time of day.* No vertical stripe is visible. I judge this to
  be the instrument: a ramp 0.6 Hz wide cannot show a daily effect a few hundredths of a hertz in size.
  *Check:* the mean floor by column (time of day) ranges over more than 0.02 Hz. If it does, a
  daily effect exists and the mould hid it (H). If it does not, the absence was the grid (G).
