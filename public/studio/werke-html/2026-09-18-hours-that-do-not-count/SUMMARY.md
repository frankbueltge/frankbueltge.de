# THE HOURS THAT DO NOT COUNT — the five-minute read

**Ensemble · 2026-09-18 · session 138 · cycle 003, "Missing Data Art" (seeded 2026-09-07)**

Open `index.html` in any browser. It is one file. It makes no network request of any kind, it
loads no library, and it works with scripting switched off.

---

## The one sentence

European law says a station's year of air counts as measured when at least **90 per cent** of
the hours are there — and says in the same annex that hours lost to *regular calibration or
normal maintenance* are **not to be counted at all**. The German network published
3 498 971 hourly nitrogen-dioxide values for 2024 and **78 162 hours have no value**. Nothing
in the published record says which of those hours belong to the class the law excuses. **The
number the directive asks for cannot be computed from the record the directive produces.**

## What was read

Every hourly nitrogen-dioxide value the Umweltbundesamt's air-data API publishes for the
whole of 2024 — **415 stations, 3 577 133 station-hours inside their own reporting spans** —
plus the same year through a second door, the daily maximum of the hourly values, for
149 055 station-days. Twenty-eight requests for the first, seven for the second, twelve
seconds apart, after reading the host's `robots.txt`. Nothing is sampled. No file from the
source is committed to this repository; the cache lives outside it and the build is offline.

2024 was chosen because the API's own interface description says the current year is
provisional and final data appear in June of the following year: 2024, read now, is final.
Nitrogen dioxide was chosen because it is the pollutant whose limit value is written **in
hours**, so an unmeasured hour is the unit the law itself works in.

## What came out

**1. A year drawn only from its absences.** The page's first figure is the whole of 2024 —
366 days across, 24 hours of the day down — with ink only where at least one station had no
value. **8 774 of the year's 8 784 hours** are inked. The ten hours in which every reporting
station has a value are one on New Year's morning and nine in the last eleven days of
December.

**2. The holes are one hour long and they keep a clock.** 46 181 separate holes; **41 879 of
them are exactly one hour** (90.7 %), and only 194 last a day or more. By hour of the day they
are not flat: the commonest hour to be missing is **01:00** (6 271 hours), the rarest 06:00
(1 902). That profile is consistent with an overnight service cycle and with other things
too, and the page asserts none of them — because *the record does not say*, and that silence
is the finding rather than the flaw.

**3. Ninety per cent.** 15 stations fall below the directive's floor on the calendar year; on
the more forgiving denominator — each station's own first-to-last span — **6** do. Both are
printed, because they disagree and a share without its denominator is not a measurement. The
median station published 98.94 % of the year. The longest single hole is **8 067 hours** at
Nauen: 336 days, inside a series that begins on 1 January and ends on 31 December.

**4. Eleven.** In the whole of Germany in 2024 the record holds **11 hours above the
200 µg/m³ hourly limit**, all at one station, against an allowance of 18 per station. So
there are **7 106 unmeasured hours for every hour over the limit.** Not an accusation: the
ratio between the only two things this archive can be asked about.

**5. A second kind of absence — a change too small to write down.** 166 of the 415 stations
publish a decimal place; **249 publish whole numbers**, and in six of the seventeen networks
not one station publishes a tenth. The longest run of the identical value in the year is
**332 consecutive hours**, and every run of twelve hours or more in the country sits at
8 µg/m³ or below. We went looking for stuck instruments and found a property of the record:
matched on how much nitrogen dioxide a station actually sees, whole-number stations in the
cleanest band spend **941.6 hours** per year inside a run of ≥ 24 identical values against
**57.0** for tenths stations in comparable air. The change is not missing from the air; it is
missing from the record — and which it is depends on which federal state the station is in.

**6. A third kind — a station that is not there.** 39 listed stations return no nitrogen
dioxide at all (they measure other things; not a hole). Nine are different: the station
register and the archive disagree about when they existed, and **five are listed as beginning
on 1 January 2026** while the archive holds a nearly complete 2024 for them. Both columns come
from the same interface on the same day.

**7. Asking the same archive twice, and it says the same thing.** All **147 675** published
daily maxima equal the largest hourly value the first door shows for their day — none higher,
none lower, and no day carries a maximum with no hours behind it. What the second door does
reveal is an unwritten rule: **from 18 hours upward — exactly three quarters of a day — every
one of 147 545 station-days carries a maximum, without a single exception.** Below eighteen it
holds in neither direction: 130 days carry one anyway, one of them built on **four hours**,
and 688 days with hours carry none. Nothing in the published number says which it stands on.

## What this does not show

A missing hour here means exactly one thing: the interface returned no one-hour mean for that
station and that hour when it was asked on 2026-09-18. It does not mean an instrument was off.
**No cause is inferred anywhere** — not for the 01:00 peak, not for Nauen, not for the nine
register disagreements, not for the 130 days below the threshold. The resolution comparison is
controlled on a station's own annual mean, which is the obvious confounder, and not on
instrument, siting or each network's rounding; it shows that resolution and stillness move
together, not that any particular run is an artefact. One component, one country, one year.

## Verification

`verify.mjs` runs **80 checks** in a real browser with scripting off and on and the network
denied in both. It re-derives counts.json's totals from the per-station records, re-counts the
holes and the run lengths, re-sums the clock out of the wall, and then decodes **every cell of
the drawing back out of the SVG** — each to a distinct hour at the shade its own station count
demands — in the served document and again in each of the three readings a script offers.
`build.py --check` rebuilds data.json and index.html and fails if one byte differs.
`harvest.py --offline` rebuilds from the cache with no network.

## The form, on the merits

Interactive, client-rendered — and the still frame is the whole work, not a fallback. The wall
is served complete as 8 774 cells; a script adds the readout and two further readings of the
same grid (stillness, and stations outside their own span). A static figure would have said
everything about the first reading and nothing about the fact that the same year has three
different absences laid over each other in the same places.

## Sources

- Umweltbundesamt air-data API v3, `https://luftdaten.umweltbundesamt.de/api/air-data/v3` —
  `/stations/json` and `/measures/json`, component 5 (NO₂), scopes 2 and 3, all of 2024, read
  2026-09-18. Data licensed by the German Environment Agency; no source file is committed here.
- Umweltbundesamt, *Schnittstellenbeschreibung Luftdaten-API* (v4, 17 December 2025) — for the
  provisional/final rule and the CET timestamping.
- Directive 2008/50/EC, **Annex I Section A** (minimum data capture 90 %, and the sentence that
  excludes calibration and maintenance losses) and **Annex XI** (the 200 µg/m³ hourly limit
  value, 18 permitted exceedances), read at EUR-Lex 2026-09-18. In force for 2024; replaced by
  Directive (EU) 2024/2881 from 11 December 2026.
- Atlas of Data Art neighbours, opened at their own addresses on 2026-09-18: *The Year of
  Weather* (Open-weather), *Garden of Eden* (Kiesl, Moser, Wilks), *The Library of Missing
  Datasets* (Mimi Ọnụọha), and this practice's own *BELOW HEARING* (2026-09-11).
