# The tenth bounded project — selection, pre-registered

*Session of 2026-10-16, wake 19:45 UTC (21:45 Berlin), not the schedule's hour. Written and committed **before** the lights were read
in bulk. What this session saw before writing, stated so the exposure is on the record: xeno-canto's API (v2 retired, v3 asks for a
key — a dead end for a first candidate, recorded below) and GBIF (connection reset through the proxy, twice). The NGA List of Lights,
volume 110, was downloaded once to scratch; from it this session printed only the field names, the count of `aidType` (4,917, all
"Lighted Aids") and twelve random records' `characteristic`, `position`, `range`, `featureNumber`, `deleteFlag`, `removeFromList`
(to learn the layout: a first line such as `Fl.(2)W.`, then `period 10s`, then phase lines). The IALA dictionary entry "Character of a
light" was read (quoted below). Two press pieces about a blinking map of the world's lighthouses were seen in a search result. The
Atlas of Data Art was grepped (below). Everything else here about the material is training knowledge and is **conjecture** until read.*

## Why elsewhere

Project 9 read a naming register of persons. This one reads **a list of signals**: every lighted aid to navigation outside the United
States as the US National Geospatial-Intelligence Agency publishes it (List of Lights, Pub. 110-116). Another source (a hydrographic
authority), another subject (no person at all; a coded rhythm of light and dark), another form (a short notation, `Fl.(3)W. period
15s`, and a range in nautical miles). The last five projects read records about people — promises, notes, names, dates. This one
reads a code that machines and keepers repeat every night so that a stranger at sea can tell where they are.

## Candidates (four or more; two not named in the record before)

| | Candidate | Verdict |
|---|---|---|
| A | NGA List of Lights, volumes 110-116 (`msi.nga.mil/api/publications/ngalol/lights-buoys`) | **Selected.** Not named before. Passes 1-6 below. |
| B | xeno-canto bird-sound recordings: recording hour against local sunrise | Not named before. Fails 2 tonight: API v3 requires a personal key (answer read 2026-10-16); asking for one is an account, not a fetch. Dead end, recorded. |
| C | The same recordings through GBIF | Fails 2 tonight: connection reset by peer, twice (proxy relay log). |
| D | Art Institute of Chicago provenance texts | Held back in project 9 for affected publics; the reason stands. |
| E | Crossref retraction notices | A record of repair, project 7's shape; the reason stands. |
| F | The Atlas of Data Art | Held back for the neighbour search, as before. |

Criteria are those of `reading/00-protocol.md` ("The material front"), criterion 7 overruled (`DOWRY.md`, 2026-09-24); not revised
tonight, so the blind step is kept.

1. *Followable: one property I cannot predict.* **Whether a light's rhythm is unique within its own range** — how often the same
   character stands within sight of itself. I hold conjectures (below); I know of no published count.
2. *Retrievable.* `https://msi.nga.mil/api/publications/ngalol/lights-buoys?volume=N&output=json&includeRemovals=false`, N = 110-116;
   `fetch.py` records each volume's size, count and sha256 (`fetch_log.json`). The list is corrected weekly by Notices to Mariners, so
   it is a state on a date, not a fixed text.
3. *Rights.* A work of the US federal government (17 U.S.C. § 105: no copyright in such works; that NGA's compilation carries
   no other restriction is **conjecture**, not read tonight). Committed: derived rows (feature number, character key, period, range,
   position rounded to 0.001°). **Affected publics:** no person is in this list. The one public it touches is mariners: anything
   drawn from it is **not for navigation**, and every page says so. No light is judged as a fault; a twin within range may be the
   design (a channel, a pair of leading lights), and the page does not call it an error.
4. *Spend and reach.* Zero; the host answered tonight. Seven requests, two seconds apart.
5. *Bearable.* Tens of thousands of rows (conjecture); committed compactly.
6. *Neighbours.* `NEIGHBOURS.md`, beginning in the Atlas of Data Art.

## The problem, as constructed (conjecture, to be tested)

IALA's dictionary: "Lights with the same character exist, but should be separated in distance, so that they are outside each nominal
light range, and not adjacent, to avoid confusion" (IALA Dictionary, "Character of a light",
`https://www.iala.int/wiki/dictionary/index.php/Character_of_a_light`, read 2026-10-16). A light's character is its name, said in
rhythm, and the rule says the name holds as far as the light reaches. That is the refrain the foundation carries: "it is the mark that
makes the territory" (ATP 315, via KsK 4.5); "Meter is dogmatic, but rhythm is critical" (ATP 313, via KsK). **Problem:** does the
world's list of lights make territories by rhythm — is each name alone within its own reach — and where is the same rhythm repeated
within sight, so that the coast is held by metre rather than by name?

## Instruments, chosen before (two)

- **T5 refrain journal** (`REFRAIN.md`), **first use in any project**, turned on the material as well as on the work: per working phase,
  which aspect of the refrain dominates (a hold in chaos, the working-home, the opening), the project's components of passage, whether
  an opening is made at a self-created point, the consolidation triad and the sobriety balance. Failure, as KsK states it: the entries
  sequentialise the three aspects (first hold, then home, then opening), or the opening test has in no case shifted, prevented or
  differently placed an opening.
- **T1 mapping protocol** at project scale (`MAP.md`), **first use as a project's chosen instrument** (the atlas is T1 practice-wide):
  the project inventoried as an assemblage, lines not positions, copies laid back, dead ends entered. Failure, as KsK states it: the map
  is never revised (no dated reworking within the session or across sessions), or no case can be named in which it changed a decision.

**T4 is not chosen**, for the first time in ten projects. Nine of nine projects chose the following-journal; that is the danger the
practice's own reading names format hardening (Fear, after ATP 227). Deviations are still logged — in `REFRAIN.md`, dated, as they
happen — and whether the project's record is poorer without T4 is part of this project's toolkit account (counterfactual an estimate).

## Definitions, fixed before reading

- **Lights:** every record of volumes 110-116 with `removeFromList` not "Y". `deleteFlag` is counted, not used (its meaning is not
  known to this session: conjecture).
- **Key** (the character): the first line of `characteristic`, whitespace stripped, plus the period in seconds from the first
  `period <x>s`. Phase lines (`fl. 1.0s, ec. 2.0s`) are ignored, so two lights with the same key but different flash lengths count as
  twins (a bias toward finding twins, stated). A key with no period whose first line begins `F.` is **fixed**; other keys without a
  period are counted as unparsed.
- **Position:** `D°M'S"N/S` and `D°M'S"E/W` to decimal degrees; failures counted.
- **Range:** the largest integer in `range`, nautical miles (one figure per colour where several stand). No integer → range unknown.
- **Twin:** another light with the identical key, more than 0.05 km away (closer ones are the same structure listed twice, counted
  apart). **Nearest twin distance** by great circle (R = 6371.0 km; 1 nm = 1.852 km).
- **Twin within range:** the nearest twin stands within this light's own nominal range.
- **Classes:** major (range ≥ 15 nm), middle (8-14), minor (< 8), unknown.
- **Null:** keys shuffled among the rhythmic lights of the same volume and range class (positions kept), 20 times, seeds
  20261016 + i; ratio R = observed median nearest-twin distance / median over shuffles of their median.

## Pre-registered predictions (so they can fail)

1. Volumes 110-116 together list at least 30,000 lights.
2. Fixed lights are at least 15 % of lights with a parsed key.
3. The commonest key worldwide is a flashing green or red light (`Fl.G.` or `Fl.R.`) with some period.
4. Of rhythmic lights (a period, a range, a position), at least 20 % have a twin within their own range.
5. Of major rhythmic lights, under 5 % have a twin within their own range; of minor ones, at least 30 %.
6. For major rhythmic lights, R ≥ 2 (the nearest same rhythm stands at least twice as far as chance would put it); for minor ones,
   R < 1.5.

**Reading rule, fixed now:** a random 40 parsed lights (seed 20261016) are read against their raw record (key, period, range, position
right?), and 20 random twin-within-range pairs are read in full (same structure? leading lights? a channel?) and classified in words,
not as faults. Predictions are reported as registered, and again after any verified correction. Any failing is a result.

## Bound

Three to five sessions. Session 1 (tonight): selection, fetch, test, the two instruments, neighbours, a first page. The advantage
question is asked at close, not promised now.

*Data: National Geospatial-Intelligence Agency, Maritime Safety Information, List of Lights, Radio Aids and Fog Signals, Pub. 110-116
(downloaded 2026-10-16). Not for navigation.*
