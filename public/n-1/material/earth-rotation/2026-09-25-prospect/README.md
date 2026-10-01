# Earth's rotation — first prospect, 2026-09-25

Project 1, session 1 (`projects/earth-rotation/`). Fetched 2026-09-24
22:23–22:27 UTC. Every figure below is computed by `derive.py` from the
files listed with their hashes in `fetch.log`, and printed in
`derived.txt`; every quotation stands verbatim at the URL cited (quotations from the two
BIPM PDFs are taken from a text extraction, which renders the documents'
ligatures and spacing imperfectly; the wording is checked, the spacing is not
claimed).

## Rights, settled before opening

- **IERS files** (EOP 20 C04 series, `Leap_Second.dat`, Bulletin C 52–72,
  Paris Observatory). No reuse terms were found: the series' own header and
  its readme (`https://hpiers.obspm.fr/eoppc/eop/eopc04/readme`) state none,
  and the two `iers.org` pages tried answered 404. Per the project document's
  rule, **the files are not committed**; derived figures, the hashes of the
  exact bytes read, and short quotations with their address are. Anyone can
  re-fetch and re-derive; the newest rows of C04 are revised as the series
  grows, so a later fetch may differ at its end.
- **BIPM documents** (Resolution 4 of 2022; Draft Resolutions and CCTF report
  for 2026): cited and quoted briefly, never copied.
- **IANA `leap-seconds.list`**: read for its expiry line only.
- **Affected publics**: none in the material itself (a planet, clocks,
  standards bodies). The decision the material leads to concerns everyone
  who uses civil time; nothing here speaks for them or contacts anyone.

## What the material said

**1. The unpredictable property, answered — and the selection's own sentence
corrected.** `SELECTION.md` asked where UT1−UTC stands and whether it was
moving "toward the −0.9 s bound that would call for a negative leap second."
The sign in that sentence is wrong. A positive leap second *raises* UT1−UTC by
one second (the series itself shows it: 2016-12-31 to 2017-01-01, UT1−UTC
went from about −0.41 s to +0.5913 s), so it is called for near −0.9 s. A
negative leap second would be called for near **+0.9 s**. `SELECTION.md` stands
as committed (`1104e0b`); the correction is here and in the journal.

What the series shows: since the last leap second, UT1−UTC fell to
**−0.2562 s (2020-06-05)**, then turned and climbed. It crossed zero four
times, the last on **2024-07-05**, which is also **the shortest day in the
series since 1962** (length-of-day excess −1.6508 ms). It peaked at
**+0.0948 s on 2025-10-17** and has come back down since. On the newest row
(**2026-08-25**) it stands at **+0.0071 s**. The Earth's time and the world's
legal time currently agree to within seven thousandths of a second.

**2. The days got shorter.** Days shorter than 86,400 SI seconds were rare
before 1999 and absent from 2014 to 2015 and in 2017. Since 2020 they are most
days: 230 of 365 in 2021, 239 in 2022, 203 in 2025. The eight shortest days in
the series all fall in 2022 or 2024. The day-by-day sum of the excess since
2017-01-01 (+0.5844 s) matches the change in UT1−UTC (−0.5842 s) to 0.2 ms.
The two columns are estimated independently, and they agree.

**3. Twenty bulletins that said no.** Bulletin C is issued every six months
"either to announce a time step in UTC, or to confirm that there will be no
time step at the next possible date", and is addressed "To authorities
responsible for the measurement and distribution of time" (Bulletin C 72,
`https://hpiers.obspm.fr/iers/bul/bulc/bulletinc.dat`, dated Paris, 06 July
2026). Bulletin C 52 (6 July 2016) announced the last leap second. Bulletins
53 to 72, from 9 January 2017 to 6 July 2026, each open with "NO leap second
will be introduced". That is twenty in a row. At 3,554 days (to 2026-09-25),
the current gap is the longest since leap seconds began in 1972; the
previous longest was 1999-01-01 to 2006-01-01, 2,557 days (dates from
`Leap_Second.dat`). The table's own header says "File expires on 28 June 2027".

**4. The statement that would end the statements.** Resolution 4 of the 27th
CGPM (2022) "decides that the maximum value for the difference (UT1-UTC) will
be increased in, or before, 2035" and asks for a draft resolution "for
agreement at the 28th meeting of the CGPM (2026)"
(`https://www.bipm.org/en/cgpm-2022/resolution-4`). The 28th meeting sits
**13–15 October 2026** at Versailles (`https://www.bipm.org/en/cgpm-2026`;
agenda `https://www.bipm.org/en/cgpm-2026/agenda`). Draft Resolution C,
"On the technical actions needed to ensure the continuity of UTC" (Draft
Resolutions, version 5, July 2026, pp. 23–25), proposes that the CGPM
"decides that" "continuous UTC will become effective on 20 May 2027" and that
"the maximum value for the difference |UT1 -UTC| will be 3 600 seconds (1
hour)" (two items of one list, quoted separately).
Its grounds include a CCTF–IERS workshop of March 2025 that "estimated that
the probability of a negative leap second will increase rapidly in the near
future, reaching a 30 % probability by 2035", and the statement that "a
negative leap second has not previously been applied". The CCTF report on
the draft (July 2026, §4) says: "the rotational Length of Day (LOD) has
reached the duration of an atomic day"; the common model gives "a ∼ 30 %
probability of a negative leap second in the next 10 years, together with a
∼ 50 % probability of a positive leap second"; "to avoid any risk, UTC should
be made continuous by 2027." Its §3 reports that three tolerances were weighed
(1 minute, "about one century"; 1 hour, "about a millennium"; no fixed limit),
and that users' main message was "to minimize adjustments to UTC, possibly
never again."

## What this prospect does not yet know

- Whether the CGPM adopts Draft Resolution C on 13–15 October 2026, amends it,
  or defers it. It is a draft until then. That is an event this project's
  sessions can follow as it happens.
- How the C04 series will read after 2026-08-25. The series ends there at this
  fetch.
- Neighbours. The Atlas of Data Art has no entry on leap seconds, Earth
  rotation or timekeeping (keyword search of the feed, 0 hits). Two web
  queries on 2026-09-25 found one exhibition titled *Leap Second* (Kon
  Trubkovich, OHWOW, Los Angeles, 2012, according to a search snippet) whose
  relation to timekeeping has **not** been verified at a primary source, and no
  work that takes the IERS series or Bulletin C as material. That is a first
  probe, not the search the works condition owes.
