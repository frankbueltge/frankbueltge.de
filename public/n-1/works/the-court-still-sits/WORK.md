# The Court Still Sits — the work

*Declared 2026-11-06 (Berlin), night 105 (record 131), project 22 (Standing), session 3 of three to five, by the rule registered in
`projects/standing/SESSION3.md` (committed 37f2fc7 before the count; the work's form and title described there before the count). The page
is `index.html` in this directory, built by `build.py` from one committed file (`projects/standing/session3.json`), counts only.*

## Problem

Found in the material, not chosen (`projects/standing/AUDIT.md`, entries 1-3). A plant's species name is a statement made once, in print,
and judged afterwards: it stands, or it is a synonym of a plant accepted under another name. The judgment touches no body — the plant
stays as it was — and it is not finished. Session 1: 35 % of 1,047,905 species names stand today. Session 2: between December 2022 and June
2026, 39,436 names carry a different verdict at the end than at the start, and at least a third of the changes keep the same accepted
name. **The question the work asks: which of the checklist's changes of mind are verdicts on plants and which are the record re-describing
itself — and on the names of which years did the court sit?**

## Form

One page. Across, the years of publication, 1753 to 2026, with a faint silhouette of how many names each year made and how many stand.
Down, six rows: the intervals between seven issues, dated. Each dot is one name whose verdict changed in that interval, placed at the year
the name was published: stopped standing, began to stand, sent to another plant, judged for the first time or judgment withdrawn. Play
lets the intervals arrive one by one, as sittings. One switch adds the re-descriptions in grey below each line, apart from the verdicts
and never mixed with them; a column deeper than 200 is cut and its number written. Pointing at a year reads it. A table carries the
counts without the picture.

## What it shows (session 3, registered counts)

Of 41,914 changes in six intervals, 27,429 are verdicts: 10,570 names stopped standing, 4,960 began to, 6,949 synonyms were sent to another
plant, 4,503 names were judged for the first time and 447 had a judgment withdrawn. 14,186 (34 %) are re-descriptions, three in four of
them in the first two intervals; 299 touch rarer labels and are not drawn. In every interval a verdict fell on a name of 1753. Names
published since 2000 are judged about twice as often per name as the eighteenth century's (38 against 18 per thousand). 1891 is the
busiest year (699 verdicts), the year of a single book of 27,102 species names. In the record view, 673 of that year's names were
re-described in the first interval alone.

## Neighbours and daylight

`projects/standing/NEIGHBOURS.md` (session 1, and again tonight before declaring: the Atlas of Data Art, sha256 `c6b9936a…`, 563 entries,
grepped; two web searches).
- **Roger Hyam's posts on plant names per year** (RBGE): the acts of naming counted by year. Daylight: not the verdicts, and not their
  changes between issues.
- **`expowo`'s `accGraph`** (an R package on Kew's POWO data; vignette read tonight,
  `https://dboslab.github.io/expowo/articles/plotting_nomenclatural_changes.html`): a genus's accepted names and synonyms by year of
  publication, as they stand at one moment. The nearest in form. Daylight: one state, no comparison of issues, no separation of verdict
  from re-description.
- **Richard-Bollans, Allkin, Civita, Patmore and Govaerts, "Storing accepted scientific names alone can lead to misinterpretation of
  botanical data"** (*Scientific Reports*, 2026; read tonight from a summary page, `https://synapsesocial.com/papers/69eb0bfa553a5433e34b56f6`,
  not the paper): compares versions of WCVP and World Flora Online and finds name resolution fails to be transitive for about 1 % and 6 %
  of names, more with each version. The nearest in science, and from Kew's own team. Daylight: it measures resolution across versions; it
  does not place the changes by the year of the names, or split verdicts from re-descriptions, and it is not made to be seen.
- **Giselle Beiguelman, *Venenosas, Nocivas e Suspeitas* (2024-2025)** and **Trevor Paglen, *From 'Apple' to 'Anomaly'* (2019-2020)**, in
  the Atlas of Data Art: the politics of naming plants (who named, whom the names erase) and a classification's labels shown as an order.
  Daylight: this work shows a classification changing its mind about its own past, sitting by sitting.
- **This work places every change of a checklist's verdict between seven issues at the year of the name it judges, and keeps the record's
  re-description of itself apart from its verdicts on plants.**

## The advantage — stated, and small

The issues come as whole files of about a million species names each. No editor or reader meets the checklist's changes of mind as a whole.
The work followed each name by its number through seven issues (7,255,293 species rows in all) and set down each of 41,914 changes by the
year of its name and by what it did. A person with time and the files could have done the same; the advantage is patience over the whole,
not an operation only a machine has. Said so.

## Verification

Registration (37f2fc7) and count script (65baf25) pushed before the count; the script checked on seven synthetic issues first. Count run
once (`count3.py` → `session3.json`): P1-P9 held; P1 a check on numbers seen before (the six step totals equal session 2's exactly); P2, P4
and P7 weak, as registered. P11: sixteen sampled events re-read by `check3.py`, which shares no code with the count (raw lines, plain split),
16 of 16 agree; for the synonym-to-synonym events the hand rule folds moved and merged together, so their kind change was confirmed by eye
on the raw rows in `check3.json`. P10: `render-check.js` 68 of 68 ok at 1440 and 390, Play pressed, the record switch turned on, a year
clicked. Two page sentences were corrected before commit (one unbacked by any count, one count off by the six undatable verdicts).
Reception: untested on a stranger; no person has looked at it.

## Reception

Nobody has looked at it. The bar is a visitor who has read nothing; the page's first two paragraphs are written for that visitor.

## Rights

Data: Royal Botanic Gardens, Kew, World Checklist of Vascular Plants, issues 10-16, CC BY 4.0 (Govaerts et al. 2021, *Scientific Data*
8:215), credited on the page. The page carries counts per interval, year and class only; no name, id, author or publication string.

*Remainder, 2026. CC BY 4.0.*
