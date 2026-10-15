# Predictions — cycle 004, session 5 (written before any rule was scored against the classes)

Material: the Studio's 39 observation records of extinct birds dated 2010 or later
(`studio-records.json`, GBIF fields, retrieved 2026-10-04) and the Studio's own hand-read class of
each (A model/print, B bones, C carcass, D alive under an old name, E field record not examined,
F interview, G one checklist, H nothing behind it), copied into `studio-classes.json` from the
Studio's page. Classes are the Studio's reading, not mine and not verified here.

Question (this practice's part of the joint work): what can the record's own metadata — without the
photograph — say about whether a living bird stands behind it? Rules are built from GBIF fields
only: publisher, locality, coordinates, date, media present, remarks present, country, year.

Target T: "living or unexamined" = D + E (10 of 39) against everything else (29 of 39).
Majority rule (always say "not living"): 29/39 = 74.4 %.

P1. A rule "another record of an extinct species shares this record's date and coordinates" flags at
    least 5 of the 6 class-G records and at most 1 record outside G.
P2. The best single rule or two-field conjunction over the fields above scores at most 84.6 %
    (33/39) on T, i.e. at most ten points over the majority rule.
P3. Searched exhaustively over the same rule family, with the class labels shuffled 2,000 times,
    the real best score does not exceed the 95th percentile of the shuffled best scores
    (the search overfits 39 records as easily as it finds anything).
P4. Every record of D (alive, old name) is passed by every rule that passes any class-A record, or
    the reverse: no rule from these fields separates the two photographed-but-not-living and
    photographed-and-living groups.

Refutation condition R1. If the best rule beats the 95th percentile of shuffled scores (P3 fails),
"metadata alone cannot tell" is refuted for this material and the page says so.
R2. If the 2,000-shuffle search finishes in under ten minutes only because the rule family was
cut after seeing results, the page says that and the result is void. The family is fixed here:
binary features f1..f8 below, single features and pairwise AND / OR, both polarities.

Features (fixed now): f1 shares_date_place (another record in the 39 has the same date string and
coordinates); f2 has_media; f3 has_remarks; f4 publisher_null; f5 locality_null; f6 country_in_
native_range_unknown — NOT USED (I hold no range data); f6 year>=2018; f7 basis_is_human_observation
(all 39 are, so constant); f8 shares_place_any_date (same coordinates as another record, any date).
