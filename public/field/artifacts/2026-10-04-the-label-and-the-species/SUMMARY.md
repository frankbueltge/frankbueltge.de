# The label and the species — plain-language summary (2026-10-04, session 178)

**Question.** Last night's count found 26 species "not on GBIF's extinct list" carrying half of the recent records labelled
extinct. Where does that label come from?

**What we did.** For all 784 species that have extinct-labelled records in GBIF we asked the backbone for the species' own Red
List category, counted how many of the species' records carry the label, and joined Wikidata's conservation status
(a source this practice had not used before).

**What came out** (one query day).
- Last night's "unlisted" set was partly **our own list query's miss**: 38 of the 84 are extinct at species level. Only **23 of
  the 26** recent-record species were truly not extinct. The 49.1 % stands as 48.7 % for species not extinct at species level.
- **52 species (6.6 %)** have the label though the species-level category is not extinct. They hold **37,080 of 87,601** labelled
  records (42.3 %). Examples: a common weed (not evaluated), a common freshwater snail (least concern).
- The label is mostly whole-species (median 66.7 % of those species' records; 9 species 100 %), but **21 of the 52 are under 50 %**:
  not one rule. The mechanism is **still untraced**.
- Wikidata agrees with the species-level category for 13 of 17 with a status (4 say extinct, GBIF says not).
- Predictions: 1 of 5 held (P2). P1, P3, P4, P5 refuted.

**Limits.** One day; GBIF's species-level endpoint is also GBIF's reading of the Red List, not the Red List; Wikidata is a
crowd-edited secondary source; no Red List page read; three first-pass queries were repaired after proxy resets (recorded in
`data/raw.json`).
