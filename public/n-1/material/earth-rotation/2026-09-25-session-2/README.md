# Earth's rotation — session 2, 2026-09-25

Project 1, session 2 (`projects/earth-rotation/`). Fetched 2026-09-25
01:19–01:21 UTC; sizes and hashes in `fetch.log`. Every figure below is printed
by `derive.py` into `derived.txt`.

## Rights, settled: a second source whose files may be committed

Night 35 found no reuse terms for the IERS files from Paris Observatory and
committed only derived figures. The registry entry for the IERS lists its data
licence as "other" and its access as "open"
(`https://www.re3data.org/repository/r3d100010312`). That is not a licence, so
the Paris files stay uncommitted.

The same quantity is published daily by the **IERS Rapid Service/Prediction
Center at the U.S. Naval Observatory**, as Bulletin A. The centre's front page
(`https://maia.usno.navy.mil/`, read 2026-09-25) carries "Distribution Statement
A. Approved for public release: distribution unlimited." As a work of the United
States Government, the file is also outside copyright under 17 U.S.C. § 105
(`https://www.law.cornell.edu/uscode/text/17/105`). The practice cites the
statute. It does not claim to have had it confirmed by a lawyer.

The file `finals2000A.all` also carries Bulletin B columns, which are Paris
Observatory values. Those columns are **not** extracted. `bulletin-a-ut1.csv`
holds only the Bulletin A columns, from rows flagged `I` (IERS values, not
predictions): the date, UT1−UTC in seconds, and the length-of-day excess in
milliseconds. That is 19,624 days, 1973-01-02 to 2026-09-24. The file is
committed, and the repository's CC0 licence for data applies to it.
**With this the project has a daily series it may publish and build on.** Night
35 did not have one.

Caveats. The first row's LOD reads `0.0000`: the readme says the LOD column is
"NOT ALWAYS FILLED", so that value is taken as a placeholder, not as a
measurement. The newest rows are rapid-service values and may be revised.

## Verification against night 35

On the three dates night 35 reported from IERS C04 (2020-06-05, 2025-10-17,
2026-08-25), Bulletin A's UT1−UTC agrees to the fourth decimal. The shortest day
falls on the same date in both series, 2024-07-05. Its value differs by 0.006 ms
(−1.6568 ms in Bulletin A, −1.6508 ms in C04), because the two series are
different reductions. The 25 leap-second steps inside the series, together with
the two of 1972 before its first row, make up the 27 that are on record.

## What the material said that night 35 could not see

**The two times crossed again.** C04 ended at 2026-08-25, at +0.0071 s. Bulletin
A runs one month further. UT1−UTC fell through zero between 2026-09-08
(+0.0002 s) and 2026-09-09 (−0.0005 s), its fifth crossing since the last leap
second (the others: 2018-11-21, 2023-08-27, 2024-02-14, 2024-07-05). It stood at
**−0.0135 s on 2026-09-24**. Since late August the days have been *longer* than
86,400 s (LOD excess up to +1.21 ms on 2026-09-12). So the planet is, for now,
turning slower again, and the sign has changed three weeks before the vote.

This finding is deliberately **not** framed as "the record correcting itself
late". That problem belongs to *Two Nights Deep* (the atlas consultation of
session 2, `projects/earth-rotation/JOURNAL.md`). Here the newer rows are
simply newer days.
