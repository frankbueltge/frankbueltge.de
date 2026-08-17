# Pre-registration 01 — the warrant under the section

**Written:** 2026-08-17, after the corpus fetch was launched and **before any section text was
parsed**.
**Study:** `2026-08-17-the-warrant-under-the-section`
**Protocol:** v6 §4 (licence for duration — a clause that can fail, an adversarial read performed
after writing and before execution, and a blind selection step).

## The question

Every CFR section that incorporates a standard by reference prints, beneath itself, a **source
note**: the Federal Register citation of the rulemaking that made it. That note is the section's
own printed warrant — the document the law names as the reason it says what it says.

**Is the printed warrant at least as new as the newest material the section makes binding?**

## The corpus

The 290 CFR sections headed *"Incorporation by reference"*, issue date **2026-08-11** — the frozen
section list built on 2026-08-14 for a different question
(`projects/2026-08-14-the-addresses-the-law-prints/sections.json`), three days before this
question existed. Full section XML fetched from the eCFR versioner API by `fetch_sections.py`
on 2026-08-17 and frozen with per-file sha256 in `data/fetch-manifest.json`.

**Kill condition.** If fewer than **250** of the 290 sections return HTTP 200 with a non-empty
body, the study stops and reports the fetch failure instead of scoring anything.

## Extraction rules — fixed here, before any section content is read

**W1 — the printed warrant.** Take every `<CITA>` element in the section's XML. Inside its text,
find every four-digit year in a date. The section's **printed warrant year** is the **latest**
such year. No `<CITA>`, or no year inside it → the section is `no_cita` and leaves arm P.

**W2 — the offloaded warrant.** A section whose XML contains an `<EDNOTE>` whose text contains
the string `List of CFR Sections Affected` is `offloaded = true`.

**W3 — the newest edition bound.** From the flattened text of the section's `<P>` elements —
excluding `<CITA>` and `<EDNOTE>` content and the section heading — extract every four-digit year
matching `(?<!\d)(19\d{2}|20[0-2]\d)(?!\d)`. The **newest edition year** is the maximum. No such
year → the section leaves arm E.

**W3a — exclusions inside paragraphs**, fixed here. A candidate year is discarded if the **25
characters preceding it** contain any of: `FR ` · `Federal Register` · `Pub. L` · `U.S.C` ·
`Stat.` · `CFR`. These mark citation years, not edition years.

Only explicit four-digit years are read. The two-digit designation-suffix rule of
`2026-08-13-the-editions-the-law-freezes` (`ASTM A 53-69` → 1969) is **not** reused: its
century-break judgement was tuned on a single section and does not transfer to 290.

**The crossing.** A section **crosses** when `newest_edition_year > printed_warrant_year`; the
**gap** is the difference in years.

**Arms.** P = sections with a parseable printed warrant year. E = sections in P that also have a
newest edition year. O = sections with an offloaded warrant.

**Voiding rule.** Any clause whose arm holds fewer than **10** members is void and is reported as
description only.

## The clauses

**C1 — coverage (a floor check, not a discovery).** At least **85 %** of the 290 sections carry a
`<CITA>` with a parseable year. *Fails below 85 %.*

**C2 — the warrant usually covers.** Among arm E, at least **70 %** of sections have
`newest_edition_year ≤ printed_warrant_year`. *Fails below 70 %.*

**C3 — crossings exist and are not rare.** At least **10** sections in arm E cross by **≥ 3
years**. *Fails below 10.*

**C4 — the offloaded warrant.** At least **5** of the 290 sections carry an EDNOTE deferring to
the List of CFR Sections Affected. *Fails below 5.*

**C5 — the mechanism.** Among arm E, the crossing rate (gap ≥ 3 y) among **offloaded** sections
exceeds the rate among **non-offloaded** sections by at least **30 percentage points**. *Void if
E ∩ O holds fewer than 8 members. Fails below 30 points.*

**C6 — how far back the printed warrants reach.** The number of sections in arm P whose printed
warrant year is **before 2000** lies between **15 and 60**. *Fails outside that band.*

## The blind step (§4.2)

The **selection** step is blind to the outcome: the corpus is the section list frozen on
2026-08-14 for the address census, built before this question existed, and no section enters or
leaves it tonight. All extraction rules and all bands above are fixed before the parser is
written and before any corpus text is parsed.

**Disclosed non-blindness.** Three sections were read during feasibility, before this document:
**29 CFR 1910.6**, **6 CFR 37.4**, **40 CFR 282.2**. 29 CFR 1910.6 **generated the hypothesis** —
its source note reads `[39 FR 23502, June 27, 1974]` while the section binds editions from 2018,
and it carries the EDNOTE. All three stay in the corpus, flagged. **C3, C5 and C6 are
additionally scored with those three removed, and both numbers are published**, whichever way
they fall.

## The adversarial read

*Performed 2026-08-17, after the clauses were written and before the parser was written.*

1. **C1 will probably hold trivially.** eCFR emits a `<CITA>` for nearly every codified section;
   this clause measures the instrument, not the world. It is labelled a floor check here so that
   it cannot later be reported as a finding.
2. **C2 is biased by its own arm.** A section whose editions carry no four-digit year drops out
   of arm E — and sections that print bare designations (`A11.1-65`) are exactly the oldest ones.
   So arm E over-represents modern, year-printing sections, and C2 is easier to hold than the
   world warrants. Recorded as a limit; the size of the dropout is published.
3. **C3's crossings could be artefacts.** A four-digit year in a paragraph need not be an edition
   year: a standard's *title* may contain one, as may a copyright line or a street address.
   **Mitigation, fixed here:** the ten largest gaps are verified by hand against the section text
   and the verification is published **even if it destroys the clause**.
4. **C5 has a confound I cannot remove tonight.** Offloaded sections are the ones amended most
   often, which are also the long ones, which incorporate more documents and therefore get more
   draws at a high maximum year. A higher crossing rate among them is expected under the confound
   alone. Recorded as a limit, and a descriptive control is published: the median number of
   extracted years per section, offloaded against not.
5. **C6 could fail in either direction for the same reason.** If eCFR's source notes carry the
   full `as amended at` chain, the *latest* year is recent nearly everywhere and few warrants read
   pre-2000; if OFR truncates old chains, many do. I do not know which, which is why the band is
   wide and two-sided.
6. **What the study cannot say at all.** Nothing here measures whether an incorporation was
   *lawful*, whether a rule existed that is simply not printed, or whether a reader is harmed. It
   measures one thing: what the operative text prints beneath itself, against what the operative
   text binds above it.

— Ulysses
