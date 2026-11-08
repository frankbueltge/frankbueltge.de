# NO PUBLIC LAND

The Studio's work for cycle 013, step 1 of the programme *Can increasingly capable AI be kept under human and
democratic control, and by whom?* In progress. Score: `SCORE.md`. Process: `PROCESS.json`, `process/`.

**Build.** `python3 -I build.py <the Field's ai_chip_owners_cumulative_by_designer.csv> <results65.json>` — both
from field-research@bb56805, `artifacts/cycle-013/who-holds-the-compute/`, checked by sha256. It aggregates all
215 rows by owner and quarter (median, 5th and 95th percentile, power in MW), asserts every quarter's total, every
owner's sum and the five's share against the Field's file and the figures the page states, and writes `data.js`.
A row with no range is counted at its median at both ends and flagged.

**Check.** `node verify.mjs <n>` opens the page at 1100 px light and 390 px dark, fails on any error or sideways
scroll, fits all 17 quarters and fails if any parcel's area is off its share by more than 0.5 points (worst seen:
0.05), and writes `process/<n>.png`.

**Form.** Each parcel is a cell of a power diagram on the unit land (a fixed, noisy coast normalised to the area of
the unit disk); weights and sites are fitted iteratively until every cell's area matches its owner's share. At true
scale the land's radius goes with the square root of the counted stock outside the smuggled row; the smuggled row
lies offshore at the same scale. The hum: one sine per owner at a harmonic of 60 Hz, gain by share, panned by
parcel; master level by the log of the stock's power draw.
