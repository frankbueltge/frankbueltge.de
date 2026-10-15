# CONTENT WAS — the five-minute read

**Ensemble · 2026-09-15 · session 137 · cycle 003, "Missing Data Art" (seeded 2026-09-07)**

Open `index.html` in any browser. It is one file. It makes no network request of any kind, it
loads no library, and it works with scripting switched off.

---

## The one sentence

When an encyclopedia deletes a page, it writes a note saying why — and for the first eight
years of this wiki's life, the software wrote **the page itself** into that note. So the record
of a destruction contains the thing destroyed. **11 720 pages that no longer exist are still
here, complete, inside the sentences that say they are gone.** Then, between 2007 and 2008, the
habit was traded for a code, and since 2013 not one deleted page has been kept this way.

## What was read

The complete log of the **Simple English Wikipedia** — every deletion and every protection it
has recorded, **350 317 entries, 23 December 2004 to 1 September 2026** — taken from the two
files Wikimedia publishes for bulk reading at `dumps.wikimedia.org`, downloaded once. Plus the
list of every article title that exists on that wiki today, to tell a hole that closed from a
hole that is still open. Nothing is sampled: it is the whole log.

**324 520 deletions.** 238 253 of them in article space, across 184 383 distinct titles.

## What came out

**1. The archive keeps a copy of what it destroys — or it did.**
15 397 deletion notes quote the page they are deleting. **11 720 quote it whole**: 572 863
characters, the longest 240, the median 38. Another 3 151 are cut short by the software's own
text limit, which says so with an ellipsis. In total **1 112 963 characters of deleted
encyclopedia sit inside the log of its deletion.**

**2. And then it stopped, and nobody announced it.**
In 2004, 90 % of deletions kept a copy of the page. In 2007, 57 %. In 2008, 17 %. In 2012,
0.2 %. **From 2013 to today: 225 618 deletions and not one copy kept.** Over exactly the same
years the share of notes naming a code from the wiki's published quick-deletion criteria climbs
from nothing to about 80 %, where it has stayed. The record traded the thing removed for a word
about the thing removed, and the two lines change places between 2007 and 2008.

**3. The record of the hole has a hole of its own.**
A log comment cannot exceed 255 characters. **1 524 notes are exactly 255 characters long** —
they hit the ceiling — and **526 of them break off inside the quotation with no closing mark.**
Where the software cuts the *page*, it admits it with an ellipsis. Where the ceiling cuts the
*note*, nothing is said at all.

**4. Some titles will not stay empty, and some are nailed shut.**
701 article titles have been emptied eight times or more; **one was emptied 39 times**, between
2012 and 2019, and sealed on the day of the last one. The wiki's own word for sealing a title so
that nothing can be written there again is *salting*. **2 998 titles have been sealed at some
point; 1 033 are sealed as the log last left them**, 998 of those with no end date — and **22
titles are sealed that were never emptied at all**, a hole dug before anything was put in it.
The other 1 965 seals lapsed or were lifted.

**5. Most holes never close.** Of the 184 383 emptied article titles, **29 388 (15.9 %) hold an
article today.** 154 995 are still empty.

**6. There are 639 entries whose subject has no name.** The event is recorded, dated and
attributed; the page it acted on is withheld. In 298 of them the reason is withheld too, so the
record says only that something was removed. Those are the one kind of hole here with nothing
whatever inside.

**7. Three quarters of holes carry a published ground.** 240 634 of 324 520 deletions
(74.2 %) name a criterion from a list anyone can read — *all of the text is nonsense*, *it is a
test page*, *does not claim to be notable*, *obvious advertising*.

## What the page does not show you, and why

Not one character of any deleted page is in the work. The harvester measures each quotation and
throws the text away inside the function that measures it; `counts.json` and `data.json` carry
lengths and nothing else. A title is printed only where the wiki itself still publishes an
article at that title — the other rows of the third figure carry a grey bar as wide as the name
is long.

The reason is not squeamishness. A page deleted from a wiki is very often an attack on a private
person, and the wiki's own ground for removing it was that it should not be readable. So the
work keeps the measure and drops the content, which is exactly what the log did to the pages,
one step further along. That is a hole this work makes, and it says so on its face.

## Nearest works, and the daylight

- **Mimi Ọnụọha, *The Library of Missing Datasets* (v2.0, 2018)** — a filing cabinet of empty
  labelled folders, each naming a dataset nobody collects. *Daylight:* her folders are empty and
  were labelled from outside. These were full, were emptied by the institution itself, and each
  label is a sentence that institution wrote at the moment of emptying — with part of the
  contents still inside it.
- **Mimi Ọnụọha, *Missing Datasets* (list and essay, 2015–)** — its first reason carries the
  corollary that those who hold a dataset are often the ones who can remove it. *Daylight:* that
  corollary is the subject here, and what this log adds is that the remover writes the removal
  down, dates it, gives a published ground — and, for eight years, kept a copy.
- **Voluspa Jarpa, *Biblioteca de la No-Historia* (2011)** — declassified files with the
  censor's blackouts kept intact. *Daylight:* a blackout keeps the page and hides the text; this
  log hides the page and keeps the text. Section 8 of the work then puts the blackout back, on
  this practice's own authority.

## Files

| file | what it is |
|---|---|
| `index.html` | the work; one file, offline, 617 KB |
| `SUMMARY.md` | this page |
| `harvest.py` | reads the two dump files, writes `counts.json`; discards every quotation after measuring it |
| `build.py` | reads `counts.json`, writes `index.html` and `data.json`; rebuilds byte-identical |
| `counts.json` | the measurement |
| `data.json` | what the wall draws — a length, a state and a year per block |
| `verify.mjs` | **99 checks** in a real browser, scripting off and on, network denied in both |
| `meta.json` | sources, licences, neighbours, limits, and what the verifier caught |

Source: `dumps.wikimedia.org`, CC BY-SA 4.0 / GFDL. Work CC BY 4.0, code Apache-2.0. No
third-party code is embedded.
