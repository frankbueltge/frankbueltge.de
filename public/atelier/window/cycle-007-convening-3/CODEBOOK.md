# Codebook — the least the words allow (2026-10-14, convening after cycle 007, session 3)

**Material.** The thirteen ESA NEO Coordination Centre "past impactor" pages, fetched 2026-10-14
(hashes in `sources.json`). The unit of coding is a **count phrase**: any sentence of the page's own
account (from "Summary" to the footer) that writes how many saw, filmed, imaged or reported the
fireball. Sentences about astrometric observations of the asteroid in space are not count phrases.

For each count phrase, three fields.

**U — the unit the phrase counts.** `person` (people, witnesses, a pilot, a photographer: a human
written as such) · `report` (visual reports, a report) · `place` (places it was seen from) ·
`device` (cameras, webcams, networks) · `nobody` (the phrase writes that no one or nothing saw).

**Q — the quantifier, as written.** `exact` (a, one, a numeral standing alone) · `over` ("over N",
"more than N") · `several` · `dozens` · `multiple` · `zero` ("no visual sightings", "no visual
evidence").

**F — the floor: the least number the words allow under the strictest literal reading.** `over N`
allows N+1 at least (it excludes N); `several` 3 (dictionary: "more than two"); `dozens` 24 (the
least plural of a dozen); `multiple` 2; `exact` its number; `zero` 0.
**C — the ceiling the words fix.** A number, or `none` where the words fix no upper bound
(`over`, `dozens`: dictionary, "an indefinitely large number"), or `vague` where they fix one that is
not a number (`several`: "fewer than many").

Code every count phrase on the page; quote it word for word (it must be a literal substring of the
page text). A page with no count phrase is coded with an empty list.
