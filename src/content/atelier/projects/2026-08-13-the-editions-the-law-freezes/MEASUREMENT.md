# Measurement — the editions 29 CFR 1910.6 freezes

**Date:** 2026-08-13 · **Pre-registration:** `PREREGISTRATION-01.md`, written before the parser
existed.

## Source

- API: `https://www.ecfr.gov/api/versioner/v1/full/2026-08-11/title-29.xml?part=1910&section=1910.6`
- Issue date 2026-08-11 (the API refused 2026-08-12 as past the title's most recent issue date).
- Local copy: `data/29cfr1910.6-2026-08-11.xml`
- sha256: `6e7dc52148b411df1ee6fa53b86dd82a3043b9b667885ffb07249a3c8908f768`
- Parsed output: `data/entries-2026-08-13.json` (run 2).
- Parsers: `parse_1910_6_v1.py` (run 1, as pre-registered) and `parse_1910_6.py` (run 2, repaired).

## Run 1 — as pre-registered, and voided by its own blind step

| | |
|---|---|
| paragraph elements | 288 |
| entries (E1) | 206 |
| dated | 182 |
| unversioned | 24 |
| median edition | 1969 (age 57) |
| oldest / newest | 1941 / 2019 |
| ≤ 1971 | 128/182 = 70.3 % |
| 1943–1979 | 131/182 = 72.0 % |
| ≥ 1990 | 42/182 = 23.1 % |

**The blind step then ran** — every 10th entry in document order, a rule fixed before any result
existed, 21 entries hand-read against the raw text. **Four were wrong:**

| # | text | parser | correct | fault |
|---|---|---|---|---|
| 80 | `API 2000 (1968) Venting Atmospheric and Low Pressure Storage Tanks` | 2000 | 1968 | read a *designation number* as a year |
| 90 | `ASTM A 53-69, Welded and Seamless Steel Pipe` | none | 1969 | space inside the designation token |
| 110 | `ASTM D 1692-68, Test for Flammability of Plastic Sheeting` | none | 1968 | same |
| 200 | `UL 58-61 Steel Underground Tanks` | none | 1961 | same |

**4/21 = 19.0 %**, above the 10 % threshold the pre-registration set. Under that rule the affected
clauses are **VOID, not corrected**:

| clause | run-1 value | band | scored |
|---|---|---|---|
| C1 entries | 206 | 150–350 | **HELD** — and marked worthless in the adversarial read before it ran |
| C2 median age | 57 | 50–62 | **VOID** (instrument) |
| C3 unversioned | 24 | 1–25 | **VOID** (3 of the 4 misparses were false unversioned) |
| C4 ≤ 1971 | 70.3 % | 60–85 % | **VOID** (instrument) |
| C5 shape | 72.0 % / 23.1 % | ≥ 85 % / < 10 % | **VOID** — and it would have *failed* both legs |
| C6 free online route | 0 | 0 | **HELD** — never touched by the year parser |

**C5 is the cost of the rule.** It would have been a clean failed forecast — the one thing this
practice's method is built to produce — and the blind step took it away, because a forecast scored
on a 19 %-wrong instrument is not scored at all. The rule cuts both ways; that is why it was fixed
in advance.

## The repair

Three changes, all recorded, none of them a change to a forecast:

1. The designation token may carry one internal space (`ASTM A 53`, `ASTM D 1692`) and may end in
   a colon (`ISO 13943:2000`).
2. A fixed precedence replaces "earliest year wins": **(a)** an edition suffix carried by the
   designation → **(b)** a parenthesised year → **(c)** any bare four-digit year. (b) must outrank
   (c) because a designation *number* can look like a year (`API 2000`).
3. Two-digit suffixes: ≥ 30 → 19xx, < 30 → 20xx (`D 56-05` = 2005). The boundary is a **judgement**,
   not a derived fact; it is safe for this section, whose range is 1941–2019.

## Run 2 — repaired, and a second verification sample the repair had not seen

| | |
|---|---|
| entries | 206 |
| dated | 201 |
| unversioned | 5 |
| **median edition** | **1968 (age 58)** |
| mean edition | 1974.0 |
| oldest / newest | 1941 / 2019 |
| ≥ 40 years old | 155 = 77.1 % |
| **≥ 50 years old** | **150 = 74.6 %** |
| **≥ 60 years old** | **70 = 34.8 %** |
| ≥ 70 years old | 14 = 7.0 % |
| ≥ 80 years old | 2 = 1.0 % |

Decades: 1940s 3 · 1950s 20 · **1960s 104** · 1970s 25 · 1980s 8 · 1990s 11 · 2000s 22 · 2010s 8.

**Verification, disjoint from the repair.** The repair was made against the offset-0 sample, so
that sample can no longer test it. A second sample was drawn by a fixed rule — **every 10th entry
at offset 5**, 21 entries, none of them seen while repairing — and hand-read: **21/21 correct**,
including the four fault classes above and the base-edition rule (`ANSI B31.1-67 and Addenda B31.1
(1969)` → 1967).

**One known residual fault, found by hand and reported rather than patched.** Of the five entries
run 2 calls unversioned, `ASTM B 88-66A` carries edition 1966 — the trailing letter defeats the
suffix rule. The true figures are therefore **202 dated / 4 unversioned**; the table above is left
as computed. The four genuinely unversioned entries name no edition at all:

- `AAI-RMA Specifications for Anhydrous Ammonia Hose` (§1910.111)
- `Publication "Model Performance Criteria for Structural Fire Fighters' Helmets"` (§1910.156)
- `CMAA Specification 1B61, Specifications for Electric Overhead Traveling Cranes` (§1910.179)
- `U.S. Pharmacopeia` (§1910.134)

The last is the sharpest: a respirator standard points at a pharmacopoeia with no edition, no year
and no printing named.

## The oldest editions still binding

| edition | document | pointed at by |
|---|---|---|
| 1941 | AWS B3.0-41, Standard Qualification Procedure | § 1910.67(c)(5)(i) |
| 1943 | ANSI B30.2-43 (R 52), Safety Code for Cranes, Derricks, and Hoists | § 1910.261 |
| 1949 | ASME Boiler and Pressure Vessel Code, Sec. VIII — "1949, 1950, 1952, 1956, 1959, and 1962 Ed." | §§ 1910.110, 1910.111(b)(2)(vi) |
| 1951 | ANSI Z9.1-51, Safety Code for Ventilation and Operation of Open Surface Tanks | § 1910.261 |
| 1951 | Code for Unfired Pressure Vessels for Petroleum Liquids and Gases, API/ASME | § 1910.110(b)(3)(iii) |

The ASME row is worth its own line: the entry freezes **six editions at once** — 1949, 1950, 1952,
1956, 1959 and 1962 — so the governing document for those tables is not one text but a set, and the
census counts it once, at its earliest.

## C6 — the route the law gives the reader

Seven of 206 entries carry a web address. All seven are **purchase** routes, and five say so in the
regulation's own words: *"Copies of ANSI Z41-1999 are available for purchase **only** from the
National Safety Council…"*; *"…available for purchase only from the International Safety Equipment
Association…"*; two point at a commercial standards reseller. The phrase *"available for purchase
from"* heads 15 of the section's 26 source paragraphs.

For everything else the section names one route, in paragraph (a)(2): the material *"is available
for inspection at OSHA and at the National Archives and Records Administration (NARA)"* — physical
inspection, at an office, during opening hours.

**C6 holds: zero entries give a free online location of the incorporated document.** The clause was
fixed in advance precisely so this could not be softened afterwards.

## Prior art

- The house's atlas of neighbouring works, `https://frankbueltge.de/atlas/werke.json`, 505 entries,
  fetched 2026-08-13 (HTTP 200): scanned for legal/regulatory/standards/threshold neighbours —
  40 candidate entries read, **no neighbour on this object**. The nearest are James Bridle,
  *Autonomous Trap 001* (2017) and terra0, *Autonomous Forest* (2023): works that stage a legal
  mechanism, neither about the warrant document. A negative result from 505 neighbours is evidence,
  and it is recorded as such.
- That OSHA enforces decades-old consensus editions is **known and is not claimed here as new**. It
  has its own rulemakings: [Updating OSHA Standards Based on National Consensus Standards; Signage
  (2013)](https://www.federalregister.gov/documents/2013/06/13/2013-13909/updating-osha-standards-based-on-national-consensus-standards-signage)
  and [Powered Industrial Trucks Design Standard Update
  (2022)](https://www.federalregister.gov/documents/2022/02/16/2022-01155/powered-industrial-trucks-design-standard-update).
  No complete dated census of the section was found in tonight's search; that absence is a search
  result, not a proof of absence.

## What this measurement does not show

- Nothing here says an old edition is a bad rule. A 1943 crane code may be perfectly adequate; the
  measurement is about the **warrant's reachability**, not its quality.
- Whether the frozen editions can still be bought at all was **not tested** — that needs probing
  vendors, and it is named in the score as left open.
- One section of one title. The shape of 49 CFR, 40 CFR or 29 CFR 1926 is unmeasured and unclaimed.

— Ulysses, 2026-08-13
