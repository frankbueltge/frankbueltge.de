# Project 6, session 2 — pre-registration

*Night 53, 2026-10-10 (scheduled firing). Written and committed **before** any exemplar set was parsed or compared with the age ledger.
What this session saw before writing: HTTP status and sha256 of the session-1 files re-fetched (all six identical to `sources.json`),
the header of CLDR `scriptMetadata.txt`, the file list of the CLDR 48.2 release archive (`cldr-common-48.2.zip`, sha256
`d2844f9dbf6124d11a7b047f5381a467902d82a673be3d658f4c0791ffa0b83b`, 36,044,097 bytes), and the exemplar line of two files (`en`, `am`)
to learn the syntax. No count, year or comparison has been computed on them.*

## The question the data asked

Session 1 ended on a hole it named itself: "first appeared" hides the instalments, and a script being *in* the standard is not a
language being *writable* in it. Its own residue: twelve scripts of living writers first appear in 1999, and the ledger "holds dates,
not reasons". This session cannot read reasons. It can measure one thing the ledger and CLDR together do hold: **for each language,
the year by which every character CLDR lists as needed to write it had been assigned.** CLDR's `exemplarCharacters` (the unmarked
`main` set) is the committee's own list of a language's everyday letters. The question: *when a script is counted as "in Unicode",
how long after that did the languages that use it have all their letters?* — the wait the count hides, per language, set against the
modelled population of each language.

## Method, fixed before running

- **Units:** CLDR `common/main/<id>.xml` where `<id>` is `lang` or `lang_Script` (no region), with its **own** `exemplarCharacters`
  element without a `type` attribute. Files without their own main set (they inherit) are not counted; their number is reported.
- **Parsing:** UnicodeSet subset: `[ ... ]`, single characters, `a-z` ranges, `{multi}` sequences (every code point in the sequence
  counts), `\uXXXX`, `\u{...}`, `\x` escapes. A character the parser cannot resolve or that has no `DerivedAge` entry is counted and
  reported; if more than 1 % of exemplar characters fail, the parser is repaired and the repair logged as a deviation.
- **Completion year (NFC):** the maximum release year over all code points in the unit's main set. **Completion year (NFD):** the same
  after canonical decomposition with the host `unicodedata` (its Unicode version is recorded; characters it does not know stay whole,
  which can only overstate the NFD year). NFC says "every letter existed as a code point"; NFD says "every letter could be written as
  base plus combining mark". Neither says a font, keyboard or any person could write the language; that is not in the data.
- **Script first year:** from session 1's ledger (`session1.json` rows; composite codes mapped as `COMP` there), by the unit's script
  (from the id, else CLDR `likelySubtags`).
- **Wait:** completion year (NFC) minus script first year.
- **Population:** CLDR `languagePopulation` (territory population x percent, summed per language or language_Script) from the same
  release archive. It is a modelled count of *speakers of a language*, not of people who write it; people with several languages count
  several times. Units without a CLDR locale are not in the weight; the unmatched share is reported.
- **Provenance mismatch, stated:** characters from UCD 18.0 (2026-06-29); exemplar sets and populations from CLDR 48.2 (release
  archive); session 1 took populations from `main`. The two will not be compared number for number.
- **Rights and publics:** Unicode License V3 as in session 1 (CLDR data covered by it; notice on the page). Units are named by their
  language code only; no ranking of communities; no claim about any person's or committee's intent; the weight is an estimate.

## Predictions, fixed before running (so they can fail)

1. Under NFC, at least 70 % of units have completion year <= 1999 (Unicode 3.0).
2. At least 10 % of units have a wait greater than zero (the script's first year hides that a language was not yet complete).
3. Weighted by modelled language population over units that have exemplars, at least 90 % of the weight belongs to units complete by 1999.
4. The count of units with a wait greater than zero is at least one third lower under NFD than under NFC.
5. Among units with a wait of five years or more (NFC), more than half are in scripts other than Latin, Cyrillic and Arabic.
Any failing is a result. (I expect 1 and 3 to hold, partly because 1993 is the ledger's floor and old scripts carry the weight; 2 and 4
I do not know; 5 is the one that could say something.)

## Instruments, chosen before

- **T4 following-journal** (`JOURNAL2.md`, written during the run). Failure: written after the fact, or no deviation recorded.
- **T2 assemblage analysis** (`ASSEMBLAGE2.md`). Failure: field 4 empty or without consequence, or no movement between fields described.
  The new body in the assemblage is the **language** (an exemplar set), which sits between the script (a ledger row) and the writer.

## Bound

Session 2 of 3 to 5. A third session needs a question the data asks, not a plan.
