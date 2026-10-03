# Pre-registration — written before any query of this session (2026-10-03, session 177)

Question: session 176 found 700 of 2,502 backbone-extinct species (EX) with at least one GBIF
occurrence. Records are undated there. When are they dated, and by whom? Does the record of the
extinct keep being written after the extinction label?

Instrument: GBIF occurrence search, `iucnRedListCategory=EX`, facets `year`, `basisOfRecord`,
and per-species `speciesKey` x `year` facets. One query day. Counts, not interpretation.

Predictions (each can fail):
- P1: at least 25 % of EX occurrence records are dated 2000 or later.
- P2: at least 100 EX species have a HUMAN_OBSERVATION dated 2000 or later.
- P3: the share of EX species with any record dated 2000+ is higher among animals than plants.
- P4: more than 20 % of EX species with records have no year on any record.
- P5: the modal basis of record is PRESERVED_SPECIMEN (over 50 %).

Limits stated now: label = GBIF backbone IUCN flag, not the Red List itself; a recent date on an
extinct species may be a misidentification, a rediscovery, a taxonomic split, or a data-entry year;
this session cannot tell which and will not claim to. Dates are event dates as supplied.
