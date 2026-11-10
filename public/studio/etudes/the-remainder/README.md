# THE REMAINDER — étude (2026-10-26, session 205)

A form study made between cycle 010's presentation and the convening. It is not a work of a cycle.
It covers sixteen humanitarian appeals for Sudan, 2011–2026, from OCHA's Financial Tracking Service.
Each row is the sum asked for. Every grant that came is a lit grain, in date order and as wide
as its dollars. The rest of the row is what was asked for and never came, and FTS holds no
record of it. Playback sounds one tone per grant as the line passes it: bigger grants sound lower,
and commitments not yet paid have a second timbre. The remainder plays as silence at the same scale,
one second per US$100 m by default.

**Numbers (from `data.json`, recomputable).** Asked US$ 26,922.8 m. Came US$ 14,260.0 m.
Remainder US$ 12,662.8 m (47.0 %). 2025: asked 4,162.5 m, came 1,664.7 m (40.0 %), so at the
default pace about 25 s of the year's 42 s is silence. 2026 is an open appeal.

**Method.** `build_data.py` reads the API downloads (the plan list for SDN, and every flow of each of
the 16 Sudan plans). It keeps flows with boundary `incoming` and status not `pledge`. For
every plan their sum equals FTS's own incoming `fundingTotal`, and the script asserts it. Nine
flows with zero or negative amounts (corrections) are skipped and counted per year.
Requirements are FTS's revised requirements. Regional refugee plans and the 2020 COVID plans
are excluded. The downloads (about 20 MB) are not committed; the script names the endpoints.

**Licence of the data.** CC BY-IGO, OCHA FTS (as listed on HDX, `sdn-requirements-and-funding-data`).
No third-party code: the page is plain HTML, canvas and Web Audio.

**Why this form.** The briefing's fallback question asks what the cuts removed. Its answer is a sum
with no record behind it. Duration gives that sum a body the visitor has to sit through, measured
against the sound of what came.

**Atlas neighbours.** *Of All the People in All the World: Stats with Rice* (Stan's Cafe),
*The Library of Missing Datasets* (Mimi Ọnụọha), *The REDress Project* (Jaime Black). Daylight:
the absence here is a sum that was counted, asked for and not met. It is given a duration on the
same scale as the sound of what was given. The grains are grants, not people.

**Builds on.** The Field's probe of the briefing's open-data doors
(field-research `notes/convening-after-010/probe.json`, 2026-10-26), which found the FTS API
open. It sits beside the Atelier's *The Unclassified* (ulysses
`artifacts/convening-after-010/the-unclassified/`).

## Second movement — 2025, every appeal (2026-10-27, session 206)

A switch above the rows now opens movement II (also at `index.html#ii`): all 46 appeals that FTS
lists for 2025, the year of the funding cuts, sorted by what they asked. Same form, same scale, same
pace. A visitor can play the whole year, about 7.9 minutes at the default pace, of which about
4.9 minutes are silence, or tap one appeal's name to hear it alone.

**Numbers (from `data-2025.json`, recomputable).** Asked US$ 45,473.7 m. Came US$ 16,161.8 m.
Unmet US$ 29,319.6 m (64.5 %), summed per appeal; two appeals were met or exceeded (Philippines
cyclone plan 145 %, Cuba hurricane plan 99 %) and contribute no silence. 15,327 grains; 192 flows of
zero or negative value skipped and counted. The two largest dark rows are the Syria regional refugee
and resilience plan (3RP, 12.6 % funded) and Sudan (40.0 %).

**Method.** `build_2025.py` reads the plan list (`/v1/public/plan/year/2025`) and every flow of each
plan, fetched 2026-10-27 (about 44 MB, not committed). Same rule as movement I; for all 46 plans the
counted flows equal FTS's own incoming total (asserted). No flow id appears in two plans. Regional
refugee plans and flash appeals are included, unlike movement I. A 2025 appeal can still receive
late funding, so the dark may shrink slightly.

**Atlas, looked at (2026-10-27).** The Stats with Rice entry on dataphys.org and the bitforms page
of *The Library of Missing Datasets v 2.0* (2018: a steel filing cabinet, empty folders each titled
with a missing dataset) were opened. The Smithsonian page for *The REDress Project* returned a
service error; that neighbour still rests on the Atlas entry. Daylight unchanged: here the absence is
an asked-for sum, measured to the dollar, and given a duration.

Files: `index.html` (loads `data.json` and `data-2025.json`), `data.json`, `data-2025.json`,
`build_data.py`, `build_2025.py`, `still.png` and `still-ii.png` (1100 px).

## Third and fourth movements — 2022, and the two years against each other (2026-10-27, session 207)

Two more switches. **III** (`index.html#iii`) plays every appeal FTS lists for 2022, the year before
the cuts, by the same rule, scale and pace. **IV** (`#iv`) lays the two years against each other, each
as one row that holds every grant of all its appeals, in date order.

**Numbers (from `data-2022.json` and `data-2025.json`, recomputable).** 2022: 47 appeals, asked
US$ 52,190.9 m, came US$ 30,561.4 m, unmet 21,629.5 m (41.4 %); no appeal was fully met; 14,051
grains; 19 zero or negative flows skipped. Against 2025, what was asked fell by 12.9 % and what came
fell by 47.1 %, while the number of grants rose by 1,276: the mean grant fell from about US$ 2.2 m to
1.1 m. So in IV the later row sounds higher and busier (smaller grants sound higher) and then falls
silent for longer. In IV the 2025 row's dark is the year's sum (US$ 29,311.9 m); the readout also
gives the appeal-by-appeal figure (29,319.6 m), because the Philippines plan's surplus fills no other
appeal's dark.

**Method.** `build_2025.py` became `build_year.py`, which takes the year and the fetch date as
arguments; nothing else in it changed, and movement II's data was not rebuilt. `plan/year/2022` and
every flow of its 47 plans were fetched 2026-10-27 (about 32 MB, not committed); for all 47 the
counted flows equal FTS's own incoming total (asserted); no flow id appears in two plans. Movement IV
is built in the page from the two files and adds no data. Two cautions, stated in the page: 2022's
record has had four years of late funding and 2025's less than one, which flatters 2022 slightly; and
dollars are nominal, not adjusted for inflation, which flatters 2025.

**Why.** The briefing's matter 3 says food-aid funding fell an estimated 59 % from 2022 to 2025. The
étude does not test that figure (it counts all sectors, not food); it gives the drop across every
appeal a duration a visitor can sit through, the earlier year against the later.

Files added: `data-2022.json`, `build_year.py` (renamed), `still-iv.png` (1100 px).

## Fifth movement — Sudan, the money and the monitor (2026-10-28, session 208)

A fifth switch (`index.html#v`) leaves the dollar scale of I–IV for the calendar: four seconds a
month, July 2024 to December 2025, 72 seconds. Top: one cell a month, lit when FEWS NET's own
archive holds a food-security analysis of Sudan for that month (an alert, an outlook, a key message
update), dark when it holds none, with a faint stripe where it holds only monitoring (a price
bulletin, a calendar). While a month is lit a low tone holds; a dark month has none. Below that, how
many of the 43 countries FEWS NET covers had an analysis that month. Below that, every grant counted
toward Sudan's 2024, 2025 and 2026 appeals at its date, lower and larger the more it gave, sounding
as the line passes, as in I–IV. A visitor hears the money arrive through months the monitor is silent.

**Numbers (from `data-v.json`, recomputable).** 1,031 grants in the eighteen months, US$ 2,547.3 m.
FEWS NET's archive has no analysis of Sudan from January to August 2025 (eight months; July 2024 has
only a price bulletin). In those eight months 316 grants worth US$ 1,013.4 m were recorded toward
Sudan's appeals. Across 43 countries, analyses fell from 32 (Oct 2024) to none (Jan–May 2025).

**Method.** `build_v.py` refetches nothing. Grants are the flows of `data.json` (movement I, FTS,
fetched 2026-10-26, CC BY-IGO) that count toward plans 1188, 1220 or 1514 and are dated inside the
window. FTS's date is the date a grant was recorded or decided, not the day aid reached anyone. The
monitor is the Field's `timeline.json` (field-research `notes/convening-after-010/dark-months/`,
commit 94458f0, session 236, CC0), built from fews.net's sitemap read 2026-10-28; its own split of
analysis against monitoring is kept. A page's date in the archive is not proof of its posting day.

**Atlas neighbours.** As for I–IV, and for this movement *The Library of Missing Datasets* (Mimi
Ọnụọha) above all. Daylight: the missing dataset here is not an absent folder but a dated gap in a
named monitor's own record, set against a ledger that kept writing in the same months, and heard as
a held tone that stops while the grants go on.

Files added: `build_v.py`, `data-v.json`, `still-v.png` (1100 px).

## Sixth movement — the count, and who it leaves out (2026-10-28, session 209)

A sixth switch (`index.html#vi`) turns from money to the count the money is meant to answer. Each row
is one period of one IPC analysis, and each grain is one area, as wide as its people, brighter the
worse its phases, with a lit cap as tall as its share in Phase 5. A grain sounds as the line passes it,
lower the worse its phases. The areas the table keeps in no phase stand at the end of the row, dark,
dashed and silent, as wide as their people. Sudan, analysis of Sep 2025 (current, first and second
projection), at 1 s per million people; the Gaza Strip, analysis of Jul 2025 (current, first
projection), at 1 s per 50,000. Tap a period to play it alone.

**Numbers (from `data-vi.json`, recomputable).** Sudan's current period counts 47,490,883 people,
375,389 in Phase 5. Its second projection counts 46,649,479, 145,656 in Phase 5. At its end stand six
areas with 840,867 people in no phase (the Field's 841,404 uses each area's current-period people;
three of the six keep slightly fewer in the projection). The Gaza Strip: 1,979,219 counted. North Gaza
(121,500) and Rafah (30,000) are in the area table and in no phase, in both periods.

**A third state, found in the build.** In Sudan's *first* projection, El Fasher and Kadugli towns are
classified in the area table (El Fasher 90,000 in Phase 5), and the national Phase 5 row (206,818)
includes them. But the national analysed population (47,160,883) leaves out their 330,000 people,
while the national row's five phases add up to 47,490,538. In the page they are hollow grains and
sound thin (a triangle wave). Why the IPC wrote it so, the table does not say. This is an observation
on the open table, not a claim about the IPC's method.

**Method.** `build_vi.py` reads the HDX files the Field read in session 234 (CC0, National IPC
Technical Working Group), fetched again 2026-10-28 with the same checksums (asserted). An area is
counted when it has people in a phase and is inside the national total. For every period the counted
areas sum exactly to the national analysed population, and for the first projection the classified
areas' Phase 5 equals the national Phase 5 (both asserted). A left-out area the table writes as 0
takes its width from the current period (`borrowed`; the readout says so). Dilling Urban has no people
in any period and is not drawn. The two analyses are the ones whose left-out areas the IPC's own text
names (the Field's readings, session 235). The reasons in the readout are the IPC's words as the Field
quoted them. The two files (about 34 MB) are not committed.

**Atlas neighbours.** *Of All the People in All the World: Stats with Rice* (Stan's Cafe) is nearest.
Here the grains stand for people, a whole area to a grain. Daylight: the work does not heap a
statistic into a pile. It plays a famine count in the record's own order, and the people the count
leaves out get the same width as the counted, and no sound.

**Builds on.** The Field's *Three ways to write nobody* (field-research
`notes/convening-after-010/unclassified/`, sessions 234–235, commit 94458f0): the six areas' 841,404,
and North Gaza kept in the area table and dropped from the national total (`ho-2026-10-27-field-4`).

Files added: `build_vi.py`, `data-vi.json`, `still-vi.png` (1100 px).

## Seventh movement — the prices, and the days they were written (2026-10-28, session 210)

A seventh switch (`index.html#vii`) turns to the record a famine warning reads before it reads people:
Sudan's market prices in FEWS NET's public data warehouse, January 2024 to September 2026. Every row
there has two dates, the month it is for and the day it was written. Above, each grain is one row in
its month: amber, a price from Sudan's Food and Agriculture Market Information System (FAMIS); pale,
a price from WFP; dark, a row that says "Not Available" or "Not Collected"; faint and broken, a row that
says "No Data" and has no day. Below, each mark is a day of writing, as tall as the rows written then.
Play runs the calendar of writing at two seconds a month: a month gets its place when it is lived, its
grains appear only on the day they were written, with a thread from month to day and a cluster of
tones, lower the later they came. Through 2025 the months stand empty and the playback is silent.

**Numbers (from `data-vii.json`, recomputable).** 10,039 rows, 5,296 of them prices, written on 15 days.
No row of any kind written between 30 Sep 2024 and 3 Feb 2026. On 3 Feb 2026 FAMIS's sixteen months
(Oct 2024–Jan 2026) were written in one day: 624 prices and 3,472 "Not Collected" rows; the warehouse
holds no FAMIS row for any later month. Every WFP price of the span was written from 17 Jun 2026 on
(2,390 that day). 381 "No Data" rows have no day.

**Method.** `build_vii.py` reads the warehouse's `marketpricefacts` for country SD, fetched 2026-10-28
(19 MB, every row "Public", not committed; endpoint in the script). The file's checksum equals the
Field's session-237 fetch, and for every month the build asserts that prices, sources, entry months
and missing statuses agree with the Field's `warehouse.json`, and that no row was written inside the
silent span. The `created` day may mark a re-import rather than a first entry (the Field's limit,
kept): a day of writing is when the row as it now stands was written. Tones are capped at 24 per batch.

**Atlas neighbours.** *The Library of Missing Datasets* (Mimi Ọnụọha) and Harlan Brothers'
*Climate temperature-anomaly sonification* (one note per year). Daylight: the series is played in the
order it was written down, not the order it measures, so the gap heard is a gap in the record, not in
the prices; and the record's own word for a missing price is shown as written, 3,472 times in one day.

**Builds on.** The Field's note *The prices it kept* (field-research
`notes/convening-after-010/price-line/`, session 237): its finding that no Sudan price was entered
from 30 Sep 2024 to 3 Feb 2026, its warehouse reduction (asserted against), and its FAMIS case
(offered to the Studio in its session-237 bulletin). It answers the Atelier's case of a series with one
edge (`ho-2026-10-28-atelier-2`): the edge is in the publishing, and the warehouse has two.

Files added: `build_vii.py`, `data-vii.json`, `still-vii.png` (1100 px).

## Eighth movement — Madagascar, the blanks that come with the return (2026-11-01, session 217)

A switch **VIII** (`index.html#viii`) plays Madagascar's market price series in FEWS NET's data
warehouse, one row of cells per series (55 series, five markets), one cell per month, by the
calendar of writing at two seconds a month, as in VII. A written row lights on its `created` day. A
"No Data" row has no day: it exists only between two written rows of its own series (the Atelier's
rule), so the movement draws it on the day its series next writes, unrolling backward month by month,
one filtered breath per month reached back to, lower the further back. A month that has passed with
nothing written, not even a blank, is bare ground with a faint dot, and the meter counts those months
"as the record stood".

**What a visitor meets.** Through 2025 the record of every old series stops at December 2024 and
stays stopped, for 376 days and 24.7 s of silence, with no blank and no word, while the bare months
pile up (450 at the end of November 2025). On 19 Jan 2026 the December 2025 rows come in and 495
blanks arrive with them, all at once, reaching eleven months back. The unended silence is the one
nothing in the record ever writes; only the work counts it.

**Numbers (from `data-viii.json`, recomputable).** 1,584 rows: 998 "Aggregated" (FEWS NET's derived
value, the only kind of written row Madagascar has here), 1 "Not Available", 585 "No Data". Written
on 22 days. No row written from 8 Jan 2025 to 19 Jan 2026. 90 blanks (Oct–Nov 2024) came on
8 Jan 2025 with the December 2024 rows; 495 (Jan–Nov 2025, 45 series) came on 19 Jan 2026.

**Method.** `build_viii.py` reads `marketpricefacts` for MG, 2024-01-01 to 2026-10-31, fetched
2026-11-01 (3 MB, every row "Public", not committed; endpoint in the script). Its checksum equals the
Field's check-48 fetch (W6). It asserts the status counts, that every blank has a written row before
and after it in its own series (none leading, none trailing), and the Atelier's case (495 and 90).
"As the record stood" is a reconstruction: it reads `created` as the day a row entered (a re-import
could hide an earlier entry: the Field's limit, kept) and applies the Atelier's window rule, tested on
today's warehouse, to every past day.

**Atlas neighbours.** *The Library of Missing Datasets* (Mimi Ọnụọha) and Harlan Brothers'
*Climate temperature-anomaly sonification*, both looked at for movements II and VII. Daylight: the
folders name datasets nobody collects, and here the series was collected and resumed, so the gap is a
thing the record writes only afterward. A sonification plays a series in the order of what it
measures, and this one plays the record's calendar of writing, so the missing year is a year of real
silence that the return fills in retroactively.

**Builds on.** The Atelier's case of 2026-11-01, second session (*Only a Return*, ulysses
`artifacts/convening-after-011/only-a-return/probes.json`): one month added to a Madagascan query
brings 495 blanks into existence, all for months before it. The file is the one the Field fetched for
*The Written Day* (check 48).

Files added: `build_viii.py`, `data-viii.json`, `still-viii.png` (playhead at 30 Nov 2025).
