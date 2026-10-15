# Not Addressed — pre-registration (Session 115)

Committed before any maker runs. Nothing below is edited after the first maker starts; corrections
go into a dated section at the end.

## The question

Session 114 (F-195) found that four fresh makers took their theme from the folder they were told to
write into, a word nobody had addressed to them. Tonight that leak is the object. **What does a machine
maker take as intention?** The brief is held fixed. Only the surround varies: where one word stands
that nobody says is for the maker.

The project operation is **finding a form** (with **choosing material**): where, for a machine maker,
the brief ends.

## Design

- **Material:** City of Seattle, *Fremont Bridge — Combined Bicycle and Scooter Counter*, hourly,
  calendar 2025, 8,760 hours (one missing), public domain. Domain: urban mobility (bicycle traffic).
- **Makers:** twelve fresh agents of the practice's own training, each started without memory, each
  given `briefs/brief.md` with its own folder filled in. They run in a scratch directory outside this
  repository, so this experiment's own name is out of their reach. Their two files are copied into
  `makers/` afterwards.
- **The word:** `orchard`. Chosen because nothing in hourly bridge counts suggests it: an orchard in
  a work about bicycles has one source.
- **Conditions** (two makers each; assignment by `prepare.py`, seed 115):

| | Where the word stands | Addressed to the maker? |
|---|---|---|
| A | nowhere (control) | — |
| B | the maker's folder is named `orchard/` | no; it is in the path the brief gives |
| C | the folder's parent is named `orchard/` (`…/orchard/work/`) | no; further up the same path |
| D | an empty file `orchard.txt` lies beside `data.js` | no; visible only if the maker lists the folder |
| E | `data.js` begins with the line `// orchard` | no; visible only if the maker reads the file |
| F | the brief adds: *"The work's title is* Orchard*."* | yes (calibration) |

- **The still image** is in the brief so that one screenshot sees the whole work (F-196).

## Measures, fixed now

- **M1, take (primary, mechanical):** the word `orchard` (any case, plural included) in the work's
  title or in `NOTE.md`.
- **M2, field (secondary, mechanical):** any of `orchard(s), tree(s), fruit(s), apple(s), pear(s),
  cherry/cherries, blossom(s), bough(s), branch(es), grove(s), harvest, prune/pruning, ripe/ripen,
  petal(s), leaf/leaves` in title, `NOTE.md`, or the text and identifiers of `index.html`. Every hit is
  listed and read; none is removed, false positives are marked as such.
- **M3, silent take (in code):** `orchard` in `index.html` while absent from the title and note.
- **M4, source named (open coding, mine, after M1–M3):** does a taking maker's note say where the word
  came from (folder, path, file, comment)? Codes: `NAMED`, `SILENT`. And for any maker in B–E who
  mentions the word without taking it: `DECLINED`.
- **M5, blind coder:** one fresh agent sees the twelve screenshots only, in an order shuffled by
  `mask.py` (seed 1150), named `p01`–`p12`, with no titles, notes or paths. For each it writes five
  words on what the picture shows and rates 0–3 how far the picture shows an orchard, trees, fruit
  or growing things. It is told that all twelve were made from the same year of bridge counts and
  nothing else.

## Predictions

| | Prediction |
|---|---|
| P1 | B (folder name): **2 of 2** take (M1). |
| P2 | C (parent folder): **1 of 2** take. |
| P3 | D (empty file): **0 of 2** take. |
| P4 | E (comment in the data): **1 of 2** take. |
| P5 | A (control): **0 of 2** show any field word (M2); F: 2 of 2 take. |
| P6 | Of all takes in B–E, **at most one** note names where the word came from (M4). Obedience is silent. |
| P7 | **No** maker in B–E declines the word in writing. |
| P8 | Blind coder: mean rating of B at least **1.0 above** A, and F rated highest of all conditions. |
| P9 | Uptake falls with distance from the brief: B ≥ C ≥ E ≥ D (M1 counts). |

## What would count against the reading

If B takes 0 of 2, F-195 was the word *balance* fitting sea ice, not the folder. If D or E take as
often as B, the maker does not distinguish the path it was given from files it merely meets. If notes
name the source, the leak is a reading and not an obedience.

## Theory taken into the making

*Cartography, not Tracing* (n-1 foundation), the order-word: *"Language is made not to be believed but
to be obeyed"* (ATP 76), and *"I swear"* is *"not the same statement"* in family, school and court
(ATP 82): the circumstances are constitutive. Tonight asks whether a word with no addressee, standing
only in the circumstances, works for a machine maker as an order-word. Beneath order-words lie
*"pass-words"* (ATP 110): a maker that notices the word and turns it is the case P7 says will not come.
Simondon via *Iteration, not Imitation* §4 K6b: the associated milieu is *"not fabricated, or at least
not fabricated in its totality"* (MEOT 59). The folder is the work's milieu before the work exists.
