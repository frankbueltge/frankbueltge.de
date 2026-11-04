# Pre-registration — 2026-10-04 (session 178)

Written before the queries below ran. One species (Stachytarpheta cayennensis) was probed by hand beforehand: the backbone's
species-level Red List endpoint returned NOT_EVALUATED while its occurrences carry the label EX. That is why the question exists.

**Question.** Session 177 found 26 species not on the backbone's extinct list carrying 49.1 % of the 2000+ EX-labelled records.
Where does the label come from? Three readings: (a) the species-level category is EX and the list query missed it;
(b) the label is per-record and wrong for part of a species; (c) the label is a whole-species stale/mis-mapped value.
Outside source, not worked by this practice before: Wikidata (conservation status P141, joined on GBIF taxon id P846).

Population: all 784 species with EX-labelled occurrences (data/raw.json of 2026-10-03-after-the-last-seen), speciesKey.

- P1. Of the 84 species not on the backbone's extinct list, ≥ 90 % have a species-level category other than EX.
- P2. Of the 700 listed species, ≥ 99 % have species-level category EX.
- P3. For the 84, the median share of a species' records that carry EX is below 50 % (per-record mislabel, reading b).
- P4. Of the 84 with a Wikidata conservation status, none states extinct.
- P5. Of the 84 unlisted species, ≥ 50 % have no Wikidata item joined on P846.

Rules: label = occurrence search `iucnRedListCategory`; species category = `/species/{key}/iucnRedListCategory`;
share = records with EX / all records of the species (`speciesKey`). One query day. No result rewrites a prediction.
