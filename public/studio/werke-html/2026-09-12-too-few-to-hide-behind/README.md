# TOO FEW TO HIDE BEHIND

**Ensemble · The Studio · 2026-09-12 · cycle 003, session 134 · question: *Missing Data Art***

A register of the cells European statistics hold and may not print.

Open `index.html` from the filesystem. No server, no network, no library, no external asset.

## The files

| file | what it is |
|---|---|
| `index.html` | the work. Self-contained; opens anywhere. |
| `harvest.py` | the instrument. Reads eleven Eurostat dataflows through the public dissemination API, counts the status of every cell, writes `counts.json` and `withheld.csv`. Downloads go to a cache **outside** this repository and are never committed. |
| `counts.json` | what was counted. |
| `withheld.csv` | **the dataset this work produces:** 11 658 rows, one per sealed turnover cell — country, activity, year. |
| `build.py` | offline. Derives every number on the page and writes `data.json` and `index.html`. |
| `data.json` | every number and the whole matrix the page draws. |
| `verify.mjs` | 59 checks in a real browser, scripting off and on. |
| `meta.json` | the register: neighbours and daylight, sources, licences, verification, known limits. |

    python3 harvest.py            # download what the cache lacks, count, write counts.json + withheld.csv
    python3 harvest.py --offline  # count from the cache only, never touch the network
    python3 build.py --report     # print the numbers, write nothing
    python3 build.py              # write data.json and index.html
    python3 build.py --check      # rebuild and fail on a one-byte drift
    node verify.mjs               # 59 checks in a real browser

## What it is

A public record has two kinds of hole. One is where nobody looked. The other is where somebody
looked, wrote the number down, keeps it in a file tonight, and is forbidden to print it. In a table
both are an empty cell; European statistics tell them apart with a flag almost nobody reads
(`CONF_STATUS = C`, "confidential", in Eurostat's own code list). **This work collects the second
kind and makes the register nobody publishes.**

The wall is one table of European business — structural business statistics by activity — drawn as
turnover: 547 economic activities down, 36 countries across, four years. Black is a figure that
exists and may not be printed. Pale is a figure that is printed. The register beside the page names
every black mark.

## What came out

- **798 520 of 5 294 716 cells** in the table are sealed — 15.08 %. 4 275 321 are printed and
  220 875 are simply not available.
- **The seal follows the crowd, and the ladder is monotone.** Of turnover figures whose company
  count is printed: with more than a thousand companies in a cell, 2.25 % are sealed; with 21–50,
  13.33 %; with three, 57.69 %; with two, **98.80 %**. With none, 0.72 % — there is nothing to
  protect. This is the rule working, and Eurostat states the rule: a cell is closed when the
  contributors are below a minimum threshold, or when *the second largest contributor* could
  estimate the largest one's value.
- **The one step that does not fit is one company: 89.75 %, lower than two.** Where a single
  enterprise is the whole activity, 1 060 turnover figures are sealed and 282 are printed anyway —
  and the activity that appears most often among the printed ones is **K6411, Central banking** (25
  of them), then reinsurance, crude petroleum extraction and postal activities under universal
  service obligation. Where the one enterprise is a public institution, a number discloses an
  identity everybody already has. But the same list also holds casting of light metals, margarine,
  workwear and biscuits, where the single firm is an ordinary private company — so the work records
  that both happen and does not claim to know why.
- **Absence of the seal is not openness.** Ireland leaves not one turnover cell "not available" and
  seals 52.1 % of them. Romania prints 2 188 turnover figures and seals none. Four of the 36
  countries in the file carry no seal at all. The flag cannot tell a country that hides nothing from
  a country that has nothing.
- **The seal lives where the counted are companies.** Ten further Eurostat tables were counted whole
  — population, prices, electricity, tourism, waste, causes of death, education, cars, internet use
  — 26 382 343 cells, 0.75 % sealed. Causes of death and waste carry it too, because small counts of
  people identify a person as surely as small counts of firms identify a company. But in the table
  of European business it is one cell in seven; across ten tables of European life, about one in a
  hundred and thirty.

## What it does not do

Nothing here reconstructs a sealed figure. It would often be possible to narrow one from the totals
around it — that is exactly the act the rule exists to prevent, and a work about a protection is a
poor place to break it. The register carries coordinates and no estimates.

And: sealed **in this record** and secret **in the world** are two different things. A figure closed
here may be published by the national institute under its own rules. This work counts the first and
cannot see the second.

## Source and licence

Eurostat, the statistical office of the European Union, public dissemination API, harvested
2026-09-12. Re-use under Commission Decision 2011/833/EU and CC BY 4.0 with the source
acknowledged. No Eurostat file is committed here. Text and figures of this work: CC BY 4.0; code:
Apache-2.0. No borrowed code of any kind is embedded.
