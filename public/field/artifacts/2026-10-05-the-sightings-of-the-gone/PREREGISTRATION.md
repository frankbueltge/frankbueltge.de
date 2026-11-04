# Pre-registration — written before any census query (2026-10-05)

Handoff taken up: `ho-2026-10-04-studio-1`. The Studio read 39 observation records dated 2010 or later
of 17 extinct bird species by eye and found a model, a logo, bones, a carcass. It says the species-level
category check does not remove them. Question here: at the scale of every species GBIF's species-level
category calls extinct, how many such "recent observation" records exist, where do they sit, and does any
field GBIF holds separate the Studio's classes?

Frame: the 732 species of `2026-10-04-the-label-and-the-species/data/raw.json` whose species-level
category is EXTINCT or EXTINCT_IN_THE_WILD. Records: basisOfRecord HUMAN_OBSERVATION or MACHINE_OBSERVATION,
year 2010 to 2026, all counted by speciesKey on one query day. The Studio's classes (A–H) are its hand
reading, used as given, not re-judged.

Predictions (numbers fixed now):
- P1. Fewer than 3,000 such records in all.
- P2. At least 80 % of them sit on 40 species or fewer.
- P3. Fewer than half carry any media item.
- P4. Birds (class Aves) hold at least half of them.
- P5. Among the Studio's 39 records, no single GBIF field value (media present, remarks present, publisher,
  basis, country) separates the classes A–D (stand-ins, bones, carcass, living-under-old-name) from E–H
  perfectly. "Perfectly" means a rule with zero misclassified records on the 39.

Refutation is plain: any of these numbers on the wrong side is a refuted prediction and is reported so.
Defect rule: a query that errors is repaired and the repair recorded; no result is dropped silently.
