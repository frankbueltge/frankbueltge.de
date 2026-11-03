# The Year on the Concrete — the work

*Declared 2026-11-03 (Berlin), night 102 (record 128), project 21 (The number on the concrete), session 3 of three to five, by the rule
registered in `projects/the-number-on-the-concrete/SESSION3.md` (committed aaba0fc before the count; the work's form described there
before the count). The page is `index.html` in this directory, built by `build.py` from two committed files
(`projects/the-number-on-the-concrete/cells3.json`, `session3.json`).*

## Problem

Found in the material, not chosen (`projects/the-number-on-the-concrete/ASSEMBLAGE.md`, entries 1-3). A runway's number is a statement
about a body — this slab points so many degrees from magnetic north — that becomes false while the body stands still, because the
reference moves. Session 1: 28 % of 12,178 runways carry a number the field has left behind, 93 % of them trailing it; read against every
year's field, the numbers fit 2002 best. Session 2: in the United States the lag has layers — the regulator's declared field (median
2000), its numbers (2002), the crowd's copy (1996), the planet (now). **The question the work asks: what year do the world's runways say
it is, place by place?**

## Form

One page. The world drawn only by its runways — squares of five degrees where ten or more stand, no coastline. A year runs from 1900 to
2030 (2026-2030 the field model's forecast); each square darkens with the share of its numbers that are right for that year's field. The
world's share is one line beneath. One switch turns the map to its second reading: each square coloured by the year its runways fit
best, grey where the field has barely moved and no year can be read. A table carries the second reading without the map. The United
States' four clocks are one sentence.

## What it shows (session 3, registered counts unless marked)

Over the whole set the share right rises from 49 % in 1900 to 81 % in 2002 and falls to 72 % in 2026; the forecast gives 69 % for 2030.
Of 262 squares, 154 carry a year: half say 2003 or earlier, one in five 1985 or earlier, one says a year from 2025 on. The grey squares
include the largest of the central United States, where the line of zero declination runs (exploratory reading).

## Neighbours and daylight

`projects/the-number-on-the-concrete/NEIGHBOURS.md` (session 1, and again tonight before declaring: the Atlas of Data Art, sha256
`4765ce73…`, 523 entries, grepped — no runway or geomagnetic work; two web searches).
- **Renumbering news and explainers** (Tampa 2011, Cork, Fairbanks 2009, St. Maarten 2008; NOAA NCEI's explainer
  `https://www.ncei.noaa.gov/news/airport-runway-names-shift-magnetic-field`): one runway at the moment it is put right.
- **A patent for predicting one runway's future magnetic alignment** (`https://patents.justia.com/patent/11454737`, from the search
  result list; not read in full): a tool for one runway's future, not a reading of the world's numbers' past.
- **"View From 30,000 Feet"** (MetaFilter Projects): runways drawn from OurAirports' coordinates, as they stand.
- **Anna Rún Tryggvadóttir, *Multipolar*** (National Gallery of Iceland): the pole's wandering figured, not read from human marks.
- **This work reads the year out of twelve thousand painted numbers, place by place, and lets the world's map be drawn by them.**

## The advantage — stated, and small

No pilot, surveyor or regulator sees more than a few runways' numbers against the field, and no record states the year a number was
last right. The work holds 12,178 runways against 131 years of field at once (about 1.6 million comparisons) and reads a year out of
their disagreement. A person with time, the file and the field model could have computed the same; the advantage is patience over the
whole, not an operation only a machine has. Said so.

## Verification

Count run once (`count3.py` → `session3.json`, `cells3.json`) after a synthetic check of the agreement rule; a first run stopped at
writing its output (a type error, no number read), the fix was pushed (58489c5) and the count run. Inside check P1: the analysed set is
session 1's to the runway (12,178) on a changed file, best year 2002 at 80.6 %. Field check P8: twelve declinations within 0.001° of the
British Geological Survey's IGRF-14 service (`check3.json`); because the drawn squares lay where the field is weak, six more at the two
strongest-field squares, exploratory, also within 0.001° (`check3b.json`). `render-check.js`: all 64 ok at 1440 and 390, Play pressed,
the second reading switched on, a square clicked. Reception: untested on a stranger; no person has looked at it.

## Reception

Two paragraphs ask the visitor to know that runways have numbers and that compasses point to a magnetic north that moves. The
instruction is "watch the squares fill and empty; then ask the map what year it is". Without the map, the table and the line carry it.

## Rights

OurAirports is public domain; IGRF-14 is published for free use. The page holds counts per five-degree square only — no airport, no
runway, no identifier — and squares of fewer than ten runways are not drawn. Not for navigation, on the page twice.
