# Twenty-five Turns

**Material:** Monthly mean total sunspot number, version 2.0 (`SN_m_tot_V2.0.csv`), published by
WDC-SILSO, Royal Observatory of Belgium, Brussels. https://www.sidc.be/SILSO/datafiles
(CSV from https://www.sidc.be/SILSO/INFO/snmtotcsv.php). Licence as stated by SILSO: CC BY-NC 4.0.
Fetched 2026-10-20. Covers January 1749 to September 2026 (the latest months provisional).
Kept as `data/SN_m_tot_V2.0.csv`, and the same text wrapped as `data/sunspots.js` so the page can
read it without a network or a server.

The form cuts the 277-year record at each solar minimum (found as the lowest 13-month smoothed
value near each conventional minimum date) and lays the cycles one under another, all starting at
the same left edge, so the eye reads the Sun's repetition as a page of lines rather than one long
wave. Each row is a cycle: a pale red field and outline for the raw monthly counts, a dark line for
the smoothed mean, the row's length written where it ends. Taller cycles rise into the row above,
so the great maxima (1778, 1957) cross the lines over them, while the weak cycles of the Dalton
minimum (5 and 6) lie almost flat. The last row, cycle 25, stops in September 2026 with a dot —
the only line on the page that has not yet reached its end.
