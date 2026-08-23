# Twenty-Five — score

**Score version 1.0, 2026-08-23.** Working title; the wording gate applies.
Design and findings: `../W1-twenty-five.md`, `../W1-data-probe-result.md`.

This is a **score work**. The practice authors the score and **never claims the object**.
Anyone may fabricate it, once or many times, and the result is theirs. Nothing here is a
proposal for an object the practice intends to make.

---

## The subject, in one paragraph

Twenty-five battle-related deaths in a calendar year is the line at which an armed conflict
becomes an armed conflict in the record the world works from. The record contains **no value
below that line in any version** — a year that failed it is not recorded as having failed, it is
absent. But years are admitted to the past. In 2025 the year 2000 became a war between Israel
and Hezbollah, at twenty-seven deaths. In 2025 the years 2019 and 2020 became war in West Papua,
at thirty-four and thirty-one, in a gap between two years that had been there all along. In 2023
the year 2002 became war in Colombia at exactly twenty-five. Each admission is one row in a
published changelog, and **no reason is recorded for any of them**.

## The objects

**Three pairs. Six rules. Never a seventh.**

Each rule is **exactly one metre long** and 60 mm high. The metre is not a proportion chosen for
convenience; it is the standard against which Duchamp calibrated three threads before dropping
them, and it is what this work is about.

Per pair, both rules carry the same span of years mapped linearly onto the metre. One rule is cut
from the dataset version **before** the admission, the other from the version **that made it**.
A graduation, 34 mm deep, is cut where and only where that version holds a year for that conflict.

| Pair | Span | Rule A (before) | Rule B (after) | Difference |
|---|---|---|---|---|
| Israel – Hezbollah | 1990–2023 | v24.1, 12 graduations | v25.1, 13 graduations | **2000** |
| Indonesia – OPM | 2018–2023 | v24.1, 4 graduations | v25.1, 6 graduations | **2019, 2020** |
| Colombia – EPL Megateo | 2000–2004 | v22.1, 2 graduations | v23.1, 3 graduations | **2002** |

## Fabrication

1. Run `scripts/render_rules.py`. It reads `data/pinned.json` and writes the six SVGs in
   `rules/`. No network, no clock, no randomness: the same input yields byte-identical output.
2. Cut, engrave, mill or print at 1:1. Any material, any process. The practice has no preference
   and states none.
3. The version identifier at the left end of each rule is the only text permitted on the object.

**What may not be changed, or it is a different work:**

- The length is one metre. Not a metre and a bit, not scaled.
- Absent years leave **nothing** — no gap marker, no dotted line, no ghost graduation, no
  annotation. Compensating for the absence undoes the work.
- Nothing may be added that explains the object. The rules are mute; the page speaks.
- The pairs are three. A fourth pair from the same material is a different work and must say so.

## Provenance

Pinned in `data/pinned.json`: for each of the four UCDP Battle-Related Deaths dyadic dataset
versions used (v22.1, v23.1, v24.1, v25.1), the archive file name, its **SHA-256**, its byte
count and the retrieval date, together with the exact year lists per dyad that the rules are cut
from. Sources retrieved 2026-08-23 from the public Uppsala download paths.

Re-derivation, for anyone: download the same four archives, verify the hashes, and read the year
column for dyads 891, 628 and 15558. The claim is only about **what each dataset version
contained**, and it is checkable in full.

Uppsala's own version histories file these three as *Dyad-years added* — a category they keep
distinct from *New dyads added* and *Dyads removed*. Four further candidates were rejected
because they fall under those other headings; the reasons are in `../W1-data-probe-result.md`,
so that the rejected cases cannot be reused by mistake.

## What the work does not claim

**Absent from a dataset version does not mean nobody died there.** It means the record did not
hold that year for that conflict. The work is about a record and its line, not about the dead
being untrue. Any fabrication or presentation that drops this sentence is a misuse of the score.

The work also makes no claim that UCDP erred. Uppsala publishes a changelog that most datasets do
not publish at all, and the absence of a stated reason is a finding about how records are kept,
not an accusation.

## Status

Unfinished as a work. The stranger probe (`../W1-twenty-five.md` §8.1) has not been run, and its
verdict decides whether this shows or merely says. Until then this is a score with a provenance,
nothing more, and it is not on the site.

## Licence

Apache 2.0 for the code, CC BY 4.0 for the score text, CC0 for the pinned data — the house's
standing licence line of 2026-07-26. UCDP data is cited under its own terms; the pinned file
contains derived year lists and identifiers, not the source datasets.
