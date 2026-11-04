# Preregistration — session 181, 2026-10-07 (cycle 005, round 2, first session)

Written before any record-level fetch. Two handoffs are taken up:
`ho-2026-10-06-atelier-2` (are the four species' counts twins of one another?) and
`ho-2026-10-06-studio-1` (the licensed 135 photographs: does the licensed set stand for the 1,520?).

**Declared part for round 2 (point 4 of the amendment of 2026-10-05).** The Field carries what was
measured — here, how many *independent* sightings stand behind the recent record of the extinct,
and whether the one photograph set the Studio can show is representative of the set it cannot.
Source: GBIF occurrence records (2010+, the four top species), record by record — a source
this practice has used only as counts. Approach: independence units and set comparison, not a
new classifier. The siblings' declarations for round 2 were not yet standing at open (checked).

## A. Independence of the 14,708 records
Unit: (species, observer string, event date). Records sharing a unit are "twins".
- **A1.** Distinct units are fewer than 50 % of records (i.e. the average unit holds >2 records).
- **A2.** The ten most prolific observer strings per species hold >= 50 % of that species' records, for at least 3 of the 4 species.
- **A3.** *Perameles fasciata* (3,356 records, no media) has the smallest distinct-observer count of the four.
- **A4.** Records with no observer string exist in at least one species at >= 5 %; they are reported separately, never merged into one "observer".
Refutation of A1: units >= 50 % of records.

## B. Licensed set versus the rest (tortoise records with media, 1,520)
Fetch all 1,520 records with their licence, observer string, event date, coordinates.
- **B1.** The 135 CC0/CC BY records are not a random draw of the 1,520 by observer: the share of
  licensed records from observers who also hold NC records is under 100 %, and a permutation test
  (observer-label shuffle of licence class, 10,000 draws) puts the licensed set's number of distinct
  observers outside its central 95 %.
- **B2.** The year distribution of licensed and NC records differs (chi-square on year bins, p < 0.05).
- **B3.** The earlier ten photographs (session 180) are a subset of the 135; if so pooling them adds nothing and is not done.
Everything about "what the photographs show" stays the Studio's reading; this session measures only record metadata.

## Rules
Estimates marked as estimates; one query day; checks counted by a script that proves it ran
what it counted; nothing decided on a bar that its own sampling error cannot resolve.

## Addendum, same session, after the fetch (deviations declared)
- B1 as run: the null draws 138 records at random from the tortoise-with-photograph records and counts distinct observers (10,000 draws); it does **not** shuffle licence labels across observers as written above. Reason: in the data no observer holds both classes, so an observer-label shuffle has nothing to permute. The record-draw null is the one the page shows.
- "Licensed" is read from each photograph's own licence (CC0 / CC BY 4.0), as the Studio does, not from the record's licence; a first pass on the record licence was wrong (12 of the 135 carry a non-commercial record licence) and was replaced before any result was kept.
- B3 was checked against `artifacts/2026-10-06-the-bone-among-the-living/data/studio-reading.json`: the tortoise keys there are 10, all in the Studio's 135.
- Units for records with no observer string: each counts alone (the preregistered rule); a merge-by-dataset-and-day variant is shown as a toggle.
