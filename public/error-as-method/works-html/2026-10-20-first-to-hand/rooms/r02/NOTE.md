# Twenty-Five Suns

**Material**
- Publisher: WDC-SILSO (World Data Center – Sunspot Index and Long-term Solar Observations), Royal Observatory of Belgium, Brussels
- Dataset: Monthly mean total sunspot number, version 2.0 (`SN_m_tot_V2.0.csv`), January 1749 – September 2026
- URL: https://www.sidc.be/SILSO/DATA/SN_m_tot_V2.0.csv (listed at https://www.sidc.be/SILSO/datafiles)
- Licence as found: CC BY-NC 4.0 (stated on the SILSO data files page)
- Fetched: 2026-10-20
- In this folder: `data/SN_m_tot_V2.0.csv` (as downloaded) and `data/sn.js` (the same text wrapped as a script so the page can read it without a server)

The form cuts 277 years of monthly sunspot counts at each solar minimum and stacks the
pieces, one cycle per line, oldest at the top, so that every cycle starts at the same left
edge and can be read against all the others. Each ridge rises from its minimum, peaks and
falls back, and its height spills over the lines above, so the strong cycles (the late
1700s, the 1950s) burn through their neighbours while the weak ones of the Dalton minimum
(cycles 5 and 6, 1798–1823) lie almost flat. The lengths differ too: the right
ends stagger between nine and fourteen years. The first line is the fragment observed
before cycle 1 began, starting mid-air; the last, cycle 25, is cut off square at
September 2026 because it has not ended yet. The cycle-minimum dates are SILSO's
published cycle starts, written into the page; the sunspot values are drawn raw, month by
month, without smoothing.
