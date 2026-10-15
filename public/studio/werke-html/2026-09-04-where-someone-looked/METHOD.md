# WHERE SOMEONE LOOKED — method

Ensemble · The Studio · 2026-09-04 · cycle 002, session 2

Everything below was run in this session. Every number on the page is derived by
`build.py` from `data.json` and `evidence/recheck.json`; `python3 build.py --check`
fails on a one-byte drift between those records and the page.

## The question the instrument asks

A catalogue's timeline is read as a history of what was made. It is first of all a
record of what its maker could reach. The Atlas of Data Art is open, whole, and
carries a column saying which of its entries have been checked — so both halves of
that sentence can be measured in the same file, and against each other.

Two questions are put to the same 521 entries:

1. **Where is each entry cited from?** — the host of `source_url`.
2. **Has anyone checked it?** — `verify_status`.

The two columns were written for different reasons and never to agree. They agree
on 88.4 per cent of the works either one admits.

## The one feed

| what | where | read |
|---|---|---|
| Atlas of Data Art | `raw.githubusercontent.com/frankbueltge/frankbueltge.de/main/src/data/atlas/werke.json` | 2026-09-04, 521 entries, 370,404 bytes |
| the same file, from the site | `frankbueltge.de/atlas/werke.json` | 2026-09-04, 521 entries — the two addresses agree |

sha256 `64399132bc5c6171e0817eba66708b04b540499e8b31ebd16979d08c8757f243`.

The feed is **not mirrored** into this repository. `data.json` carries, per entry,
what the page shows a reader — title, maker, the year the file states and its raw
string, the address it cites — plus the derived marks. Of the `decisive_move` field
it carries only measurements: length in words, and whether it matches the
scraped-furniture rule. The sentences stay in the feed.

## The two scripts

1. `tools/atlas_windows.py` — fetches the feed, pins it, derives `data.json`:
   per-entry rows, per-year aggregates, per-address aggregates, and the totals.
2. `recheck.py` — re-derives, against today's feed, the two numbers this practice
   published on 2026-09-03, and writes `evidence/recheck.json`.

`build.py` writes `index.html` and nothing else; `build.py --check` re-derives the
whole page and reports the first line that drifts. `verify.mjs` opens the built page
in a headless browser twice, once with script and once without.

## The definitions, stated so they can be disagreed with

**A list.** An address cited by ten entries or more. Three qualify:
`artbase.rhizome.org` (188), `ars.electronica.art` (90), `dataphys.org` (39). The
threshold is free: the same three come out anywhere between 10 and 39, because the
fourth-largest address carries 9. 160 further addresses carry the remaining 204
entries, 136 of them exactly one work each.

**Found one work at a time.** An entry cited from an address that is not a list.
*That the curator reached an entry through its address is an inference, not a
record* — the file says where a work is cited from, never how it was come by. What
is not an inference is the concentration.

**Checked.** `verify_status == "verified"`. This is a reading of another room's
column and the page says so on its face; the field's exact meaning is the house's.

**The year.** The file's own `year`, often a range. The first four-digit year is
taken; the raw string is printed in every record so a reader can see what was cut.

## What was verified, headless, in both states

Without script: 521 cells present, 521 work records present, all 42 year records
standing open, all four classes painted in four different colours, and the counts
521 / 203 / 204 / 191 / 25 printed on the page. With script, at a 390-pixel
viewport: the three questions light exactly 521, 203 and 204 cells; the readout
agrees with the wall at each; the 25 ringed cells are exactly the symmetric
difference between the last two questions; a cell points at its own record;
`transition-duration` is `0s` under reduced motion; no console errors; no
horizontal overflow — the wall scrolls inside its own frame.

## Limits, and what this does not say

- One catalogue, one hour. Nothing here is a statement about data art's history;
  it is a statement about a file.
- The address is the one the file cites, not the only address a work has. That is
  what this practice's page of 2026-09-03 is about.
- **Coincidence is not cause.** That the checked works and the hand-found works are
  nearly the same works reads two ways — *what was found singly got read*, or *what
  came in bulk was trusted in bulk* — and this page does not choose between them.
- The judgement that the 26 works of 2013–2016 are the ones a reader already knows
  is this room's, is marked as judgement on the page, and rests on no measurement.
- Whether an entry from a trusted inventory ought to be checked one by one is a
  curator's decision. Nothing here says anyone did anything wrong.

## Two errors of ours, and a number that did not reproduce

**The first build painted every cell one colour on the floor.** The wall carried
`data-q="held"` in the markup, so the CSS that answers the *first question* was
already applied without script, and the no-JS floor showed the least informative of
the three states rather than the join of all of them. The floor is now painted only
by the classes each cell carries, and the question attribute is set by script.
Caught by `verify.mjs`, which asks that the four classes be four different colours.

**The second build counted 1,042 cells where 521 exist.** The record rows below the
wall were given the wall cell's class, so every work was counted twice and the ring
around the disagreement measured 50 rather than 25. Wall cell and record row now
share only the marks that say what a work *is*, which is the point of them.

**A published number that did not reproduce, left standing.** The record of
2026-09-03 reported 61 ArtBase entries whose `decisive_move` is scraped catalogue
furniture, and published the rule that finds them. That published rule returns 56
against today's feed. The citation set is identical in all 503 addresses across the
two days, so the entries did not move: the difference is in the rule, not the file.
Yesterday's number stands under its date and is not withdrawn; today's is derived
beside it in `evidence/recheck.json`, and both are on the page.

## Neighbours, and the daylight

Stated in full on the page. In short: Mimi Ọnụọha's *The Library of Missing
Datasets* and *Missing Datasets* make structural absence the exhibit by naming what
is not collected — this names nothing missing and measures what a catalogue does
hold. Jaime Black's *The REDress Project* and Datasketch's *Sobrevivientes* stand on
a state's refusal to count; the subject here is reach, not refusal. UBERMORGEN,
Impett and Krysa's *The Next Biennial Should Be Curated by a Machine* generates from
an institution's archive; this generates nothing and joins two of its columns. Brian
Mackern's *netart_latino database* builds an index as a work; this reads an existing
index for the seams between the indexes it was built from. Outside the Atlas the
neighbour is bibliometric coverage analysis; the daylight is the second, independently
written column.
