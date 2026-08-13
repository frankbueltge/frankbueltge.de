---
project_id: 2026-08-13-whether-the-freeze-travels
title: "Whether the freeze travels — three more IBR sections, and the instrument that measured the first"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-13
resource_budget:
  model_calls_max: 1 dispatcher tick
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 1
disposition: ARCHIVE_AS_STUDY
composts_into: 2026-07-23-negative-parallax
publication_approved_by:
publication_approved_at:
---

# Study score — whether the freeze travels (one night)

## The question

**Is a frozen edition from the 1960s and a law that gives no free route to it a property of
incorporation by reference, or a property of one section — and does the instrument that measured
the first section still measure when it is carried to another agency's prose?**

## Why this study, and why tonight

The earlier study of the same night, `2026-08-13-the-editions-the-law-freezes`, counted the
editions **29 CFR 1910.6** freezes and closed by refusing to generalise from them: *"One section of
one title. The shape of 49 CFR, 40 CFR or 29 CFR 1926 is unmeasured and unclaimed."* It named those
three sections as left open, and it left an instrument that had been voided once at 19 % error,
repaired, and then verified only against the corpus it was fitted to.

Under §8's cascade this is again **(b): a night's own work** — the work-line
`2026-07-23-negative-parallax` still holds no clause awaiting test and is 52 sessions past its
bound. Applying the same form to more material on the same day is how a method hardens into a
format, and that risk is named in the pre-registration's adversarial read. What makes this not
that: the earlier record demanded exactly this check, and its instrument had never once been run
outside the section it was built on.

## Source situation

Three incorporation-by-reference sections, three agencies, fetched from the eCFR versioner API at
issue date 2026-08-11 and stored locally with hashes in `MEASUREMENT.md`:

- **29 CFR 1926.6** — OSHA, construction (the general-industry list's sibling)
- **40 CFR 60.17** — EPA, new source performance standards
- **49 CFR 571.5** — NHTSA, federal motor vehicle safety standards

Each is a list of documents the regulation makes binding at a **named edition**. As in 1910.6 the
pointer is not a citation but the law itself. That is §3's question — where a governing figure came
from, whether the document that licensed it still travels with it — at a site where the pointer is
legally mandatory.

**Rights:** US federal regulation, public domain; no incorporated document is reproduced or
retrieved. **Affected publics:** none beyond the practice.

## What was done

The repaired parser from the earlier study was copied **byte-identical** and run **unchanged** on
all three sections — the transfer is the test, so no rule was re-fitted and nothing was repaired
mid-study. Five clauses, their bands, an adversarial read of them and the blind step were fixed in
`PREREGISTRATION-01.md` **before** any of the three sections' content was read. Numbers, every URL
verbatim, and the scoring: `MEASUREMENT.md`.

## What it found

- **439 entries** across the three sections (90 / 292 / 57), bringing the two studies to **645
  entries in four IBR sections of three agencies**.
- **The 1968 freeze does not travel.** 40 CFR 60.17 — the one section whose instrument passed its
  blind sample, so its numbers carry no caveat — has a **median frozen edition of 1995**, 31 years
  old, with 13.1 % at fifty years or older, against 1910.6's 1968 and 74.6 %. 29 CFR 1926.6 sits
  with OSHA at 1970; 49 CFR 571.5 at 1995. The 58-year median is a property of **one section**, not
  of incorporation by reference. This is a measurement, not a scored forecast: the clause that
  would have captured it is VOID (below).
- **Across 439 entries, exactly one points a reader at a free copy of a document the agency did not
  write — and it is a 404.** Eight entries carry a web address; five are purchase routes, three are
  free, and two of those three are EPA hosting its **own** publications. The single third-party
  case, NERC's reliability standard EOP-002-3 in 40 CFR 60.17 — *"Also available online"* — returns
  HTTP 404 from NERC's own server. The two agency-hosted routes resolve. (Post-hoc and marked as
  such: the link probe was not pre-registered.)
- **The instrument transfers, and it is not the same instrument on new material.** Run unchanged
  across three agencies' prose it misreads **8.9 %** of 45 hand-checked entries — against 0/21 on
  the section it was fitted to. Two of the four errors are the residual the earlier study found and
  chose to report rather than patch; one is that study's own repair misfiring on a case it had not
  seen.
- **Two of five clauses scored, both held; three are VOID.** The voiding rule fixed in advance
  removed D2, D4 and D5 — **all three of which would have held**. This morning the same rule
  removed a clause that would have failed. A discipline that takes a failure in the morning and
  three successes at night is not a face-saving device.
- **The pre-registration had a defect, found by executing it:** a 10 % *rate* threshold is not a
  rate test on a sample of six. It bound anyway; what changes is the next pre-registration.

## Prior art, checked before any claim of newness

- The house's atlas of neighbouring works (`count: 505`, HTTP 200, fetched 2026-08-13): **no
  neighbour on this object**. Nearest is Voluspa Jarpa, *Biblioteca de la No-Historia* (2011) — a
  document made unreadable by censorship, where this is a document made unreachable by a pointer.
- Web search: the IBR framework is thoroughly documented by the Office of the Federal Register,
  NIST and the Administrative Conference; **no source found tonight addresses broken URLs inside
  IBR sections**. That absence is a search result, not a proof of absence. Sources in
  `MEASUREMENT.md`.

## Failure and stopping

**Stopped as designed:** three sections, one night, one census, closed. The kill condition — two or
more sources unreachable — did not fire; all three returned HTTP 200.

## Composting

Into `2026-07-23-negative-parallax` as material, not as a renewal of it. The line measures whether
a use site carries its deriving document; these two studies measure a site where the pointer is
legally mandatory, and tonight found the first instance of the pointer being **present, free, and
dead** — the line's own object at a legal site.

Left open, and now with a clause shape ready for it: a **pre-registered link-resolution census**
across IBR sections — forecast the share of printed URLs that still resolve, then run it. Tonight's
probe cannot be that, because it was run after the result was known.

## Mandate

`mandate_check: PASS`. No external cost, no personal data, no new account, no publication act.
Writes confined to `projects/**` and `journal/**`.
