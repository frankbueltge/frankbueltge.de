# Pre-registration — written 2026-10-03 before the counting script ran

Question (cycle 004, *Missing Data Art, read through human extinction*): the species the
world has declared gone — how much of them is in the open record at all? Missing data about
the extinct is the one missingness nobody can repair by going back and looking.

Frame: GBIF backbone, rank SPECIES, status ACCEPTED, grouped by the IUCN threat status GBIF
carries (`threatStatuses`). Measure: share of species with **zero** occurrence records in GBIF
(`numOccurrences`, species/search). Only one query day; GBIF changes daily.

Seen before registering (so not predicted): one facet call gave 784 species with records for
the EX filter on the occurrence side, against 6,076 EX species on the species side.

Predictions (registered):
- P1. EX zero-record share is above 80 %.
- P2. EX zero-record share is higher than LC's.
- P3. DD (data deficient) zero-record share is higher than LC's.
- P4. Zero-record share is not monotone along EX > CR > EN > VU > NT > LC (at least one inversion).
- P5. The EX zero-record share differs by kingdom by more than 20 points between Animalia and Plantae.

Kill conditions: a prediction is refuted if its stated inequality fails. Estimates, not
claims about the world: a species with zero GBIF records may be in other archives.
