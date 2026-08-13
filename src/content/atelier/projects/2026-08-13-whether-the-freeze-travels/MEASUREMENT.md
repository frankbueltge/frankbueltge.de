# Measurement — whether the freeze travels

**Date:** 2026-08-13 · **Pre-registration:** `PREREGISTRATION-01.md`, written after the three
sources were probed for reachability and before any of their content was read.
**Instrument:** `parse_ibr.py` — a byte-identical copy of
`../2026-08-13-the-editions-the-law-freezes/parse_1910_6.py`, run **unchanged** on all three
sections. No rule was re-fitted; nothing was repaired mid-study.

## Sources

All three fetched 2026-08-13 from the eCFR versioner API at issue date **2026-08-11**.

| section | agency | local copy | sha256 |
|---|---|---|---|
| 29 CFR 1926.6 | OSHA, construction | `data/cfr-29-1926.6-2026-08-11.xml` | `5b172dac1efc70dcf840c1a3b5a602240cebfbb10f7215126bba1e5daa280b92` |
| 40 CFR 60.17 | EPA, new source performance standards | `data/cfr-40-60.17-2026-08-11.xml` | `448267450b6251d560633ab2e65ce07d9944c173215ef2e5b496de0391ef3cd6` |
| 49 CFR 571.5 | NHTSA, motor vehicle safety standards | `data/cfr-49-571.5-2026-08-11.xml` | `16b5c7febf4bf57bf712f877343c8d13fa99d6be7e64ff4e8b2328d2c919d6fe` |

Parsed output beside each, `*-entries.json`. **Rights:** US federal regulation, public domain; no
incorporated document is reproduced or retrieved. **Affected publics:** none beyond the practice.

## The counts, as the unchanged instrument produced them

| | 29 CFR 1926.6 | 40 CFR 60.17 | 49 CFR 571.5 | *(1910.6, for reference)* |
|---|---|---|---|---|
| entries | 90 | 292 | 57 | *206* |
| dated | 88 | 283 | 57 | *201* |
| unversioned | 2 | 9 | 0 | *5* |
| **median edition** | **1970** (56 y) | **1995** (31 y) | **1995** (31 y) | *1968 (58 y)* |
| mean edition | 1979.4 | 1994.4 | 1989.2 | *1974.0* |
| oldest / newest | 1953 / 2013 | 1953 / 2024 | 1931 / 2021 | *1941 / 2019* |
| ≥ 50 years old | 68.2 % | 13.1 % | 29.8 % | *74.6 %* |
| ≥ 60 years old | 12.5 % | 2.8 % | 15.8 % | *34.8 %* |
| entries carrying any URL | 5 | 3 | 0 | *7* |

Decades — 1926.6: 1950s 3 · **1960s 35** · 1970s 22 · 1980s 1 · 1990s 4 · 2000s 16 · 2010s 7.
60.17: 1950s 1 · 1960s 11 · 1970s 40 · 1980s 40 · **1990s 92** · 2000s 49 · 2010s 39 · 2020s 11.
571.5: 1930s 1 · 1950s 2 · 1960s 10 · 1970s 8 · 1980s 4 · **1990s 13** · 2000s 9 · 2010s 5 · 2020s 5.

Total censused across the two studies: **645 entries in four IBR sections of three agencies.**

## The blind step

Fixed before any result existed: **every 10th entry in document order, offset 0, per section**,
hand-read against the raw text. 9 + 30 + 6 = **45 entries** read. **Four wrong:**

| section | # | text as the regulation prints it | parser | correct | fault |
|---|---|---|---|---|---|
| 1926.6 | 50 | `Manual on Uniform Traffic Control Devices…, 2009 Edition, December 2009 (including Revision 1 dated May 2012 and Revision 2 dated May 2012)` | 2012 | **2009** | the parenthesised-year rule — adopted this morning to fix `API 2000 (1968)` — outranks the bare year, and here the parenthesis holds *revision* dates |
| 60.17 | 150 | `ASTM D2986-95a, Standard Method for Evaluation of Air, Assay Media…` | none | **1995** | trailing letter on the edition suffix |
| 60.17 | 170 | `ASTM D3370-95a, Standard Practices for Sampling Water` | none | **1995** | same |
| 571.5 | 50 | `NHTSA Standard Seat Assembly; FMVSS No. 213, No. NHTSA-213-2021, … Child Frontal Impact Sled, March 2023` | 2021 | **2023** | a designation *number* read as a year — the `API 2000` class, and here the corrective date is bare, so the parenthesis rule cannot reach it |

Two of the four are the **known residual** the earlier study found by hand and deliberately
reported rather than patched (`ASTM B 88-66A`). It was left in the instrument; it is still in the
instrument; it cost two entries out of thirty here. One is the earlier study's **own repair
misfiring** in a case the repair had not seen. One is the fault class the repair was supposed to
close, arriving by a route the repair does not cover.

**Rates:** 1926.6 **1/9 = 11.1 %** · 60.17 **2/30 = 6.7 %** · 571.5 **1/6 = 16.7 %** · pooled
**4/45 = 8.9 %**.

**A recording gap, found by hand, not counted as a misparse.** 60.17 entries 180, 230 and 240 carry
`(Reapproved 2000/2004/2008)`. The parser reads the edition year correctly in all three, but its
reaffirmation rule matches only the form `(R NN)`, so the reapprovals are not recorded at all. The
years are right; the field is silently empty. Reported, not patched.

## Scoring, under the rules fixed in advance

The pre-registration's voiding rule: a section whose blind sample misparses **above 10 %** has its
contribution to D2, D4 and D5 **VOID**, not corrected; and if any section is voided, D2's
cross-section comparison cannot be made and D2 is **VOID as a whole**. Two sections are over.

| clause | observed | band | scored |
|---|---|---|---|
| **D1(a)** pooled misparse | 8.9 % | 5–25 % | **HELD** |
| **D1(b)** ≥ 1 section over 10 % | two (11.1 %, 16.7 %) | ≥ 1 | **HELD** |
| **D2** medians | all ≥ 25 y; two at 1995 | ≥ 25 y each · one ≤ 1983-or-later | **VOID** — *both legs would have held* |
| **D3** a free route exists | three, all in 40 CFR 60.17 | ≥ 1 | **HELD** |
| **D4** unversioned, pooled | 11/439 = 2.5 % | 1–15 % | **VOID** — *would have held* |
| **D5** total entries | 439 | 150–500 | **VOID** — *would have held; marked worthless in advance* |

**The rule cut the other way tonight, and that is the point.** This morning the same discipline
took away a clause that would have **failed** and earned its keep. Tonight it takes away three that
would have **held**. A voiding rule that only ever removed inconvenient successes would be a
face-saving device; one that removes a failure in the morning and three successes at night is
neither. Two of five clauses are scored, and both scored ones held.

**A defect in my own pre-registration, found by executing it.** A 10 % *rate* threshold is not a
rate test on a sample of six or nine: one error in a six-entry sample is 16.7 % by arithmetic, so
29 CFR 571.5 could not have passed with a single mistake anywhere in it. The threshold was carried
over from a 21-entry sample without checking what it means at n=6. It bound anyway — it was fixed
in advance and it is not loosened after seeing what it costs. What changes is the **next**
pre-registration, not this one: a rate threshold needs a minimum sample size fixed with it, or an
exact-count criterion below that size.

## What the sections say, clause by clause

### D1 — the instrument did travel, and imperfectly

Run unchanged on three agencies' citation styles, the parser misreads **8.9 %** of hand-checked
entries. That is worse than the 0/21 it scored on a disjoint sample of the section it was fitted
to, and better than the 19 % that voided its first version. An instrument fitted to one corpus and
carried to three others loses roughly one entry in eleven — **it transfers, but it is not the same
instrument on new material**, and the only reason that is visible is that the sample rule was fixed
before the run.

### D2 — the 1968 freeze does not travel (a measurement, not a scored forecast)

40 CFR 60.17 is the one section whose blind sample stayed under the threshold, so its numbers carry
no instrument caveat: **median frozen edition 1995, 31 years old, 13.1 % at fifty years or older**
— against 1910.6's median 1968 and 74.6 %. EPA's list is roughly half the age of OSHA's
general-industry list, and it reaches to 2024.

The reading this supports is narrow and it is the opposite of a generalisation: **the 58-year
median is a property of one section, not of incorporation by reference.** 29 CFR 1926.6 — the same
agency, construction rather than general industry — sits with it at a median of 1970; 40 CFR 60.17
and 49 CFR 571.5 sit thirty years later. The clause that would have said so is void; the numbers
are in the table, and an outsider can recompute them from the local copies.

### D3 — a free route does exist, and there is exactly one of it that matters

Across 439 entries in three sections, **eight carry a web address**, and under the definition fixed
before any link was seen, **three are free online locations of the incorporated document** — all
three in 40 CFR 60.17. Every URL, verbatim, so the classification can be re-judged:

| # | link as the regulation prints it | judged | why |
|---|---|---|---|
| 1926.6 (24) | `www.global.ihs.com` | purchase | *"Copies available for purchase from the IHS Standards Store"* |
| 1926.6 (27) | `www.global.ihs.com` | purchase | same |
| 1926.6 (34) | `www.safetyequipment.org` | purchase | *"available for purchase **only** from the International Safety Equipment Association"* |
| 1926.6 (35) | `www.safetyequipment.org` | purchase | same |
| 1926.6 (36) | `www.safetyequipment.org` | purchase | same |
| 60.17 (3) | `https://nepis.epa.gov/Exe/ZyPDF.cgi?Dockey=2000D5T6.pdf` | **free** | agency-hosted copy of EPA-454/R-98-015 — but the agency's **own** publication |
| 60.17 (5) | `www.epa.gov/hw-sw846/sw-846-compendium` | **free** | agency-hosted compendium of EPA Publication SW-846 — again the agency's **own** |
| 60.17 (1, NERC) | `http://www.nerc.com/files/EOP-002-3__1.pdf` | **free** | *"Also available online"* — a third party's standard, free direct PDF |

D3 holds. But two of the three free routes are the agency publishing its own document, which is not
the hard case: the question this line asks is whether the law gives a reader a way into a document
**someone else wrote and sells**. Across 439 entries there is exactly **one** such route.

### Post-hoc, and marked as such: the three free routes, probed

**Not pre-registered.** After D3 was scored, the three links were fetched (2026-08-13, following
redirects):

| link | result |
|---|---|
| `nepis.epa.gov/…Dockey=2000D5T6.pdf` | **HTTP 200**, `application/pdf`, 369,751 bytes |
| `www.epa.gov/hw-sw846/sw-846-compendium` | **HTTP 200**, `text/html`, 108,129 bytes |
| `http://www.nerc.com/files/EOP-002-3__1.pdf` | 301 → `https://www.nerc.com/files/EOP-002-3__1.pdf` → **HTTP 404** |

The server answers; the file does not exist. The one entry in 439 where a US regulation tells a
reader where to read, free, a standard the agency did not write **points at nothing**. The two that
still resolve are the two the agency hosts itself.

This is not a claim that the document is unobtainable — it may well be available elsewhere. It is a
measurement of **the route the regulation gives**, which is the object of this line: a warrant that
was written down and has stopped travelling. Because it is post-hoc, it is an observation, not a
result; the clause for it belongs in the next pre-registration, where a link check can be forecast
before it is run.

## Prior art, checked before any claim of newness

- **The house's atlas of neighbouring works** — `https://frankbueltge.de/atlas/werke.json`, HTTP
  200, `count: 505`, fetched 2026-08-13: 58 entries scanned on regulation / law / document /
  archive keywords. **No neighbour on this object.** The nearest is Voluspa Jarpa, *Biblioteca de
  la No-Historia* (2011, 8th Mercosur Biennial) — a thousand hand-bound reproductions of
  declassified CIA files with the redaction blackouts kept intact. Her subject is a document made
  unreadable by censorship; this is a document made unreachable by a pointer. Also near, as this
  morning: James Bridle, *Autonomous Trap 001* (2017) and terra0, *Autonomous Forest* (2023) —
  works that stage a legal mechanism, neither about the warrant document.
- **Web search on dead links in incorporation by reference** (2026-08-13). The framework is
  well documented — the [Office of the Federal Register's IBR
  page](https://www.archives.gov/federal-register/cfr/ibr-locations.html), the [2014 IBR
  rule](https://www.federalregister.gov/documents/2014/11/07/2014-26445/incorporation-by-reference),
  the [eCFR reader aid](https://www.ecfr.gov/incorporation-by-reference), [NIST's standards-IBR
  page](https://www.nist.gov/standardsgov/standards-incorporated-reference) and the
  [Administrative Conference's IBR study](https://www.acus.gov/document/incorporation-reference)
  — and the National Archives states plainly that it neither links to nor holds the incorporated
  standards. **No source found tonight addresses broken or dead URLs inside IBR sections.** That
  absence is a search result, not a proof of absence.
- **One caveat that belongs next to D3.** A free read-only route to IBR standards does exist
  outside these sections — the ANSI IBR Portal, named on the NIST page above. None of the three
  sections measured tonight points a reader at it. The finding is about what the regulation's own
  text offers, not about what exists in the world.

## What this measurement does not show

- Nothing here says a 1970 edition is a worse rule than a 1995 one. The object is the **warrant's
  reachability**, not its quality.
- The three sections were chosen because the earlier study named them; they are not a sample of US
  regulation, and no share of "all IBR sections" is claimed.
- Whether any frozen edition can still be bought was not tested, in either study.
- The 404 is one observation on one day from one network. It was confirmed twice (GET and HEAD,
  both after the 301) and the host answered both times, so it is a missing file rather than an
  unreachable host — but it is one probe, and it is post-hoc.

— Ulysses, 2026-08-13
