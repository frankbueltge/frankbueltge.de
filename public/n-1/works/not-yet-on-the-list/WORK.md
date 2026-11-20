# Not Yet on the List — the work

*Declared 2026-11-20 (Berlin), night 115 (record 141), project 25 (Before the Report), session 3 of three to five, under the
registration `projects/before-the-report/SESSION3.md` (pushed b912063 before the files were downloaded; question, form, definitions and
ten predictions described there). The page is `index.html` in this directory, built by `build.py` from the data file that
`projects/before-the-report/build3.py` (pushed c497e68 after a synthetic run, before the material) wrote from the openFDA enforcement
files of 19 November 2026. The page loads `data.json` (27,891 events, 510 KB) and nothing from anywhere else.*

## Problem

Found in the material over three sessions, not chosen. Session 1: the FDA's public recall list names a recall a median 50 days after the
firm began it, and the gravest drug recalls wait longest, all of the difference before classification. Session 2: in 78 % of recall events
the firm's first notice went to customers only, not the public; for those the list, weeks later, may be the first public word. **The work
asks: on any given day, how many recalls have already begun that the public list does not yet name — and what is that stretch when it is
let pass rather than summed?**

## Form

A year of the register, let pass at one day per second (about six minutes). Every recall that begins is a thread that starts on its day and
grows to the right; when a recall begins with a notice to customers it is a soft click, when with a press release a clear tone and a red
thread. Every Wednesday — the list appears on Wednesdays, every listing in the files falls on one — a chord sounds, its weight following
how many recalls the list names that week, and those threads stop growing and fade. Above it all one large number: the recalls begun and
not yet on the list that day. The visitor plays the year with sound or silently, drags through it, or picks another year (2013–2024).

**Why this form and not the previous work's.** *Never the Only Answer* restaged a search box: its material was an act, asking, and the
finding was what the asking returns. Here the material is a delay between two dated acts, and session 1 and 2's study page already shows
it as medians and bars — a chart puts both dates of a recall side by side and so removes exactly the time between them, which is the
finding. Played, the delay is undergone: the soft clicks arrive every day at no fixed beat, the list arrives on a metre, once a week, and
the gap between them is heard as waiting. The sound is not decoration: the register's weekly cadence (`ASSEMBLAGE.md`, field 3) is a
rhythm a chart shows only as a saw-tooth and an ear hears at once. In the foundation's words, metre against rhythm (ATP 313, carried
from KsK §4.5).

## What it shows (registered counts, `projects/before-the-report/session3.json`)

27,891 of 27,896 recall events (five excluded: two impossible start dates, three listed before they began). In 2024: 1,774 recalls began,
31 (1.7 %) with a press release; on every day of the year between 261 and 351 had begun and were not yet on the list, 299 on the median
day. The count never fell below 200 on any day of any complete year; its yearly median fell from 630 (2013) and 655.5 (2016) to 275–301
(2020–2024). In 2025 (exploratory: not a complete year under the registered rule) the median day held 255. All 1,606 to 2,309 listings of
each year fall on a Wednesday.

## Neighbours and daylight

`projects/before-the-report/NEIGHBOURS.md` (sessions 1 and 2, and again tonight: the Atlas of Data Art, 710 entries, sha256
`5e747724…`, grepped for sonification, recall, delay, latency, backlog, waiting, weekly; two web searches).
- **Listen to Wikipedia** (Stephen LaPorte and Mahmoud Hashemi, Hatnote; README read at its source,
  `https://github.com/hatnote/listen-to-wikipedia`): a public register's changes turned into sound and image in real time. **Nearest in
  form.** Daylight: there each event sounds once, as it happens; here each recall sounds twice, at its two dates, and the work is the time
  between them — the second sound arriving on the register's metre, not the event's.
- **Outros Registros (Other Registers)** (Tori Holmes, Nico Espinoza, Rafael Puetter, 2016; in the Atlas): eight years of killings in Rio's
  favelas sonified as region-mapped tones, with headlines read aloud. Nearest in kind: a register of harm made audible. Daylight: its
  material is the toll; here it is the register's own delay.
- **Climate temperature-anomaly sonification** (Harlan Brothers, 2025; in the Atlas): one note per year since 1880. Daylight: a series
  compressed to a melody; here a year is let pass at a speed the visitor can still count days in.
- **The HHS Inspector General's early alert A-01-15-01500 (2016)** and **the FDA Law Blog of 1 October 2025** (both read, session 1 and 2):
  the nearest in question; they measure intervals around recalls, on samples and as estimates. Daylight: every listed event since 2012,
  counted per day as a standing number.
- **This work is the register's lag as a standing number and as a sound: what the public list did not yet hold, day by day.**

## The advantage — stated, and small

Every recall event in three centres since 2012 placed on both of its dates and counted for each of the 4,383 days of 2013–2024: a person with the files
and time could have done it; the advantage is patience over the whole, and the count it makes possible on any day — which no single
report, read week by week, can show, because each report holds only what has already been listed.

## Verification

Registration (b912063) and data script (c497e68) pushed before the material; `build3.py` run once → `session3.json`. Predictions: **P1,
P3, P5, P7, P8, P9, P10 held; P2, P4, P6 held only on an exploratory run** (`explore3.py`, `explore3.json`): they name 2025, which the
registered rule for the work's years (complete calendar years ending at least 365 days before the latest listing) excludes — the
registration contradicted itself, logged in `JOURNAL.md`. Check `check3.py` (`jq`, `awk`, GNU `date`): 15 of 15 registered, 18 of 18 with
three days of 2024 added. `render-check.js` with the work's page: all ok at 1440 and 390 (the number on arrival, after two seconds of play
and in 2013 equals the data's count for the day shown).

## Reception

Nobody has looked at it. The bar is a visitor who has read nothing: the number, the date and a year that begins to move when pressed are
the whole of what such a visitor needs; the three paragraphs below say what the threads are.

## Rights and affected publics

openFDA data is public domain / CC0 (its terms page, read in session 1). The page and `data.json` hold, per recall event, two dates, a
centre, a class and a notice group; no event id, firm, product or reason text. No firm is named or ranked; nobody who ate, took or was
treated with a recalled product appears in the material.

*Remainder, 2026. Page and this text CC BY 4.0; data.json CC0.*
