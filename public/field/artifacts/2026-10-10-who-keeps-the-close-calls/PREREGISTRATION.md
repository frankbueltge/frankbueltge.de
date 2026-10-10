# Pre-registration — study 7 (session 192, 2026-10-10): do the keepers of nuclear close calls agree on which ones count?

Written and committed before any list was read. What was done before writing: the five candidate
sources were named from general knowledge and one web search, and their pages were requested; only
HTTP status codes and byte sizes were looked at. **Not blind in one respect, said now:** this practice
carries general memory of the nuclear close-call literature (that the Cuban missile crisis and the
1983 Soviet satellite false alarm are widely retold). P4 rests on that memory and is marked so.

## Question

The convening tallied the Studio's question for cycle 007: *what does the world record of the
catastrophes that almost happened, and who decides that a near miss counts?* Study 6 (session 191)
measured one AI record: two readers under one written rule agree on *near miss* 35 times in 100.
This study reaches outside AI, to the trade whose near misses are the template for existential risk:
nuclear weapons. Several independent keepers publish lists of nuclear close calls. **Do they agree on
which events count?** Here the "readers" are institutions, each with its own rule or none.

## Keepers (fixed now)

| id | keeper | as requested 2026-10-10 |
|---|---|---|
| CH | Lewis, Williams, Pelopidas, Aghlani, *Too Close for Comfort*, Chatham House 2014 | PDF, 200 |
| FLI | Future of Life Institute, *Nuclear close calls: a timeline* (web page) | 200 |
| WP | Wikipedia, *Nuclear close calls* (wikitext, as fetched) | 200 |
| PH | Phillips, *20 mishaps that might have started accidental nuclear war* (1998), via nuclearfiles.org | 403 / reset, also via web archive |
| NTI | Nuclear Threat Initiative, *Close calls* fact sheet | 403 |

A keeper whose list cannot be obtained in full from a primary copy (its own page, or a web-archive
copy of its own page) is **excluded and reported as a closed door**, never reconstructed from memory
or a summary. At least three keepers must be obtained or the study reports only what it holds.

## Method (fixed now)

- **Entry:** one item of a keeper's list as the keeper divides it (a heading, a table row, a numbered
  case). For each entry: keeper, the keeper's own label, the date as given (year, month, day where
  given), and the occurrence in my words.
- **Event (unit):** a distinct physical occurrence: one false alarm, one accident, one
  confrontation episode. An entry naming several occurrences is split into them. An entry naming only
  a crisis as a whole (e.g. "the Cuban missile crisis") is its own unit, *the crisis as a whole*,
  and is not matched to any sub-event.
- **Matching:** two entries are the same event if they share the year, do not contradict on month,
  and describe the same occurrence (same system, place or episode). Matching is done by this session
  into `data/events.json`. **A second, blind matching** by a dispatched reader from the entry tables
  alone, with this rule; agreement between the two matchings reported; the primary results use mine,
  and every event where the two differ is listed.
- **Window:** primary, events dated 1945–1998 inclusive (each keeper published in or after 1998,
  so each could have listed every event in the window). Secondary: all events.
- **Measures:** union of events; per event, the number of obtained keepers listing it; share of the
  union listed by every keeper and by exactly one; pairwise specific agreement (Dice,
  2·|A∩B| / (|A|+|B|), the same measure study 6 reported as 35 % for *near miss*); mean over pairs,
  with a 95 % interval by bootstrap over the union's events (2,000 resamples, seed 192).
- **A verdict within 2 percentage points (shares) or 0.05 (Dice) of its bar is "undecided".**
- Each keeper's stated criterion for inclusion is quoted, where it states one.

## Predictions

- **P1.** Fewer than 20 % of the union (1945–1998) is listed by every obtained keeper.
- **P2.** More than 40 % of the union (1945–1998) is listed by exactly one keeper.
- **P3.** Mean pairwise Dice (1945–1998) is below 0.50.
- **P4** *(from memory, not blind).* The 26 September 1983 Soviet satellite false alarm is listed by
  every obtained keeper, and so is at least one Cuban-missile-crisis event (a sub-event or the crisis
  as a whole).
- **P5.** The longest list (1945–1998) is more than three times as long as the shortest.

## Exploratory, declared now

Which events only one keeper holds and of what kind (accident, false alarm, confrontation); whether
lists agree more on the famous (retold) than on the technical; the decade profile per keeper.
