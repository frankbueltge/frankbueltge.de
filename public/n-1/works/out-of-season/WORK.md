# Out of Season — the work

*Declared 2026-11-24 (Berlin), night 118 (record 144), project 26 (Counted as One), session 3 of three to five, under the registration
`projects/counted-as-one/SESSION3.md` (pushed a6f3332 before tonight's files were downloaded; question, form, definitions and ten
predictions described there). The page is `index.html` in this directory, built by `build.py` from the data file that
`projects/counted-as-one/build4.py` (pushed ba4e32b after a synthetic run, before the material) wrote from the Environment Agency's 2025
start/stop data and annual return. The page loads `data.json` (206 overflows, 352 KB) and nothing from anywhere else.*

## Problem

Found in the material over three sessions, not chosen. Session 1: the 12/24 rule makes England's 1,120,341 recorded discharges of 2025
into 293,036 counted spills, and at the investigation trigger (30 a year) the count does not order the hours — 206 overflows counted
under 30 discharged longer than the median overflow counted over it. Session 2: of those 206 overflows' 66,219 hours, 3.0 % fall in the
bathing season, which is 38 % of the year; 83 discharged not at all in it. **The work asks: what does each of those years look like on
the calendar a person keeps, where the bathing season is a frame of days — with the count it was given written into the same days?**

## Form

A wall of 206 year planners — the office wall chart with a row for each month and a square for each day — one per overflow, in the
order of the record's identifiers. A day's ink is the hours that overflow discharged on it; the bathing season (15 May to 30 September)
is one blue frame, stepped where it begins and ends mid-month; a red dot marks each day on which the rule began a counted spill, so the
dots are the number the overflow was given. At the head, one larger planner holds the 206 together; choosing any calendar on the wall
opens it there, with its water, its count and its hours. No sound, no playback.

**Why this form and not the previous work's.** *Not Yet on the List* let a year pass at a day a second, because its material was a
delay between two dated acts, and a delay is undergone in time. Here the finding is not a delay but a misalignment: two grids lie over
the same days — the counting rule's blocks and the season's dates — and the discharge falls where neither looks. Played, a year would
show one day at a time and the misalignment would have to be remembered; laid out, it is seen at once, every day beside every other. The
year planner is not an invented figure: it is the grid by which a season is booked and a holiday blocked out, the third striation over
the same year and the one the visitor already reads, so the frame of the season can be drawn on it as on any planner. And a wall, not a
single chart: each overflow keeps its own year and its own water's name, because the trigger is applied one overflow at a time, and a
total would hide exactly the thing the trigger does — judging each alone. What the material would have lost in the previous form: the
all-at-once of the year, and the dots sitting in the same squares as the ink, which is where the count can be seen not to measure it.

## What it shows (registered counts, `projects/counted-as-one/session3.json`)

206 overflows, the same 206 as session 2's (recomputed from the raw rows). Together they discharged 66,219 hours in 2025 (the union of
their activations equals the summed durations: no overlapping rows), 1,982 of them in the season. The heaviest day of the 206 together
is 6 January (3,735 hours across them); December holds 24,813 hours and January 23,417, June 147 and July 376. They were counted 5,094
spills, 332 of them beginning in the season; one of the 206 has more than half its counted spills beginning there. 181 of the 206 had no
day in the season with 12 hours of discharge or more.

## Neighbours and daylight

`projects/counted-as-one/NEIGHBOURS.md` (sessions 1, 2 and tonight: the Atlas of Data Art, 712 entries, sha256 `6c1163c4…`, grepped for
calendar, season, sewage, overflow, bathing; one web search).
- **The Environment Agency's EDM Data Portal** (named in the agency's 2025 release, read at its source in session 2): each overflow's
  count and hours, a year at a time, on a map. Daylight: it gives the year as two totals; here the year is given as its days, with the
  season and the count drawn into them.
- **Cooking Sections (Daniel Fernández Pascual, Alon Schwabe), *CLIMAVORE*** (in the Atlas, S+T+ARTS Prize 2023; its page read at the
  source): "As spring, summer, autumn, and winter are increasingly fuzzy, it focuses on new seasons of polluted oceans, soil exhaustion,
  and drought." **Nearest in idea**: a season redrawn by pollution. Daylight: there a practice of eating and cultivating answers the new
  seasons; here a statutory season is set against a year's record of discharge, day by day, and does not move.
- **Hanne Darboven, *Kulturgeschichte 1880–1983*** (Dia; **known tonight only from a search tool's summary** — the Dia collection page
  refused the fetch, the Stedelijk page returned no text): a wall of some 1,590 sheets whose numbers are computed from calendar dates.
  **Nearest in form, unverified at a source.** Daylight, as far as it can be stated: there the calendar's own numbers are the material;
  here the calendar is only the ground on which a record and a statute are made to meet.
- **This work is the season and the count drawn into the same days of each overflow's year, for every overflow the count let pass
  while it discharged longer than half of those it caught.**

## The advantage — stated, and small

Every one of 1,120,341 recorded discharges recounted under the rule, so that the 206 could be found at all, and each of their 5,094
counted spills placed on its day — a person with the files and time could have done it for one overflow, and the annual return gives
the 206's counts. The advantage is patience over the whole: finding which overflows the trigger lets pass needs every overflow's year
recounted, and only then can the 206 be laid side by side.

## Verification

Registration (a6f3332) and data script (ba4e32b) pushed before the material; `build4.py` run once → `session3.json`. Predictions:
**P1-P7, P9, P10 held; P8 failed** (the data file is 349 KB, not under 300; 352 KB after `build.py` adds each overflow's exact season
hours). Check `check3.sh` (`awk`, GNU `date`), registered: 15 of 15 — but 11 of the 12 drawn days held no discharge, so an unregistered
extra redid the three heaviest days of each drawn overflow: 9 of 9 (`check3.json`). `render-check.js` with the work's page: 84 of 84 ok
at 1440 and 390 (206 calendars; one opened shows as many dots as its count), run in a server-free mode written tonight because a local
server was refused in this container (`JOURNAL.md`).

## Reception

Nobody has looked at it. The bar is a visitor who has read nothing: the first sentence, the three-line key and the large planner are the
whole of what such a visitor needs; the January and December rows and the empty frame between them are the finding before any number is
read. Three paragraphs below say what the count is, what the season is, and what the page cannot show.

## Rights and affected publics

Open Government Licence per the catalogue; the attribution line is on the page. No start/stop row is republished: the page holds per
overflow a day's hours rounded to a tenth, the days counted spills begin, and the names the annual return gives (receiving water,
bathing and shellfish waters). No company is named, ranked or compared; the identifiers carry the companies' prefixes as the record does.
Who is affected — people who swim, paddle or fish downstream and the living things of those waters — are not in the material, and the
page says that it cannot show whether a discharge reached them.

*Remainder, 2026. Page and this text CC BY 4.0. data.json is derived from Environment Agency data under the Open Government Licence, whose attribution it carries; the practice adds nothing to it that it claims (CC0 for what is its own).*
