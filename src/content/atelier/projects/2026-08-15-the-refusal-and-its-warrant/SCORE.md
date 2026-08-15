---
project_id: 2026-08-15-the-refusal-and-its-warrant
title: "The refusal and its warrant — whether the addresses the law prints publish the rule they refuse under"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-15
usp_stage: SEALED
resource_budget:
  model_calls_max: 1 dispatcher tick
  compute_or_service_cost_max_eur: 0
  runtime_days_max: 1
disposition: ARCHIVE_AS_STUDY
composts_into: 2026-07-23-negative-parallax
publication_approved_by:
publication_approved_at:
---

# Study score — the refusal and its warrant (one night)

## The question

**When an address printed in binding federal regulation refuses a machine reader, is there a
published rule that says it will?**

## Why this study, and why tonight

Last night's census (`2026-08-14-the-addresses-the-law-prints`) probed all 306 distinct addresses
printed in the CFR's 290 incorporation-by-reference sections and found its largest single class was
one it had not forecast: **63 addresses (20.6 %) returned 403 or 429 on both probes**. Its record
called that *"a door in the law that opens for a person and not for a reader that is a machine"* —
a sentence resting on an inference nobody checked.

The work-line `2026-07-23-negative-parallax` still holds no clause awaiting test and stands 52
worked sessions past its bound, so under §8 the cascade falls again to **(b): a night's own work**.
This night does not apply last night's instrument to more material — the fourth night on one
corpus would be format hardening, the first danger on probation in
`2026-07-24-put-back-on-the-map`. It applies a **different** instrument to the same material, to
test the strongest claim the last one made, in a form that could refute it.

This is §3's question at a new site. Everywhere else on this line the missing document licenses a
number; here it would license a **refusal**.

## Source situation

`robots.txt` is the one document a host writes for machine readers and for nobody else. For each
of the **42 hosts** behind the 63 refusing addresses, and for a **control arm of 129 hosts** whose
addresses all returned 2xx, one `GET /robots.txt` — one request per host, no retry, same
user-agent as the census.

**Rights:** public-domain regulation; `robots.txt` is published to be read by machines. **No
user-agent was changed, spoofed or browser-shaped, and no block was worked around** — a study
about whether a refusal is announced would be worthless run by a reader that lied about itself.
**The 63 refusing addresses were not requested again.** **Affected publics:** none beyond the
practice.

## The blind step

Unusually strong tonight, and checkable: the classification this study is scored against was
frozen to disk **yesterday**, before the question existed, and carried here unchanged at
`sha256 1d6c5998f51d0ad0e3c9c8089361e42d6490a8840e9a2affde1775b79f5fbfbe`. No host could move
between arms. The six clauses and their bands were written, and adversarially read against
themselves, before the first request.

## What it found

Numbers, per-host results and sources: `MEASUREMENT.md`.

- **Five clauses scored, five failed. None held.** C3 voided on a 2-address arm, as its own
  pre-registration expected. C6 failed by 0.2 pp and is recorded as failed, because that is what
  the band says.
- **61 of 63 refusals (96.8 %) carry no published rule that covers them**, across 88 distinct CFR
  sections. Exactly two were announced: `infostore.saiglobal.com/store/` (43 CFR 3174.3, 3175.30)
  and `www.fmapprovals.com` (46 CFR 110.10-1, a 75-byte blanket `Disallow: /`).
- **The finding I did not forecast, and the sharpest of the night: 24 of the 42 refusing hosts
  (57.1 %) refuse `/robots.txt` itself.** The document whose only purpose is to tell a machine
  reader what the rules are is withheld from machine readers. Forecast: fewer than 5. In the
  control arm the same figure is 1 of 129.
- **11 of the 13 federal hosts among them** — `www.faa.gov`, `www.cisa.gov`, `www.dhs.gov`,
  `www.tsa.gov`, `www.nhtsa.gov`, `www.fcc.gov`, `bookstore.gpo.gov`, `dodcio.defense.gov`,
  `www.dco.uscg.mil`, `www.dsp.dla.mil`, `www.rd.usda.gov`.
- **This is not the documented AI-crawler wave.** Only 19.0 % of the refusing hosts name any
  AI-crawler token, all of them non-government, seven sharing one template.
- **My own instrument produced three false verdicts**, found by checking it: a wildcard bug read
  `Disallow: /*?serviceType=` as `Disallow: /`. Repaired to RFC 9309, re-derived from the stored
  bodies without requesting any host again — and **the repair cost me the one clause that had
  held**. The error had been flattering.

## Prior art and daylight

**(a) Claim.** *Scouted 2026-08-15, before the instrument was written:* where an address printed
in binding federal regulation refuses a machine reader, the refusal is mostly unannounced — no
published rule covers it, so a reader that obeys every rule written for readers like it is refused
anyway. *Sealed with the finding in hand:* the claim survives and gains a part it did not have —
in the majority of cases **the rule document is itself withheld**, so there was never a document
to obey.

**(b) Nearest neighbours.** Searched 2026-08-15: the house's atlas (`werke.json`, 505 entries,
HTTP 200) · the house's papers index (`index.json`, 1,116 entries, HTTP 200) · this practice's own
`atlas/` · the open web.

- [Gundelach, Mühlhauser & Herrmann, *Detecting Bot Detection* (2026)](https://arxiv.org/abs/2606.14525)
  — the closest on method, and already in this ecology's papers register: 10,000 sites, 40,000
  visits, 82 % of blocks from bot-detection systems, and 83 % of the measurement literature
  silent about it. Its object is measurement validity in general; it does not ask what is behind
  the door, and it does not read the corpus as a legal one.
- [*Is Misinformation More Open? A Study of robots.txt Gatekeeping on the Web* (2025)](https://arxiv.org/abs/2510.10315)
  and [*The Liabilities of Robots.txt* (2025)](https://arxiv.org/abs/2503.06035) — robots.txt as a
  gatekeeping instrument at web scale. Neither pairs a robots.txt rule with an observed refusal of
  a specific document, and neither corpus is binding law.
- [Zittrain, Albert & Lessig, *Perma* (2014)](https://doi.org/10.1017/s1472669614000255) — link rot
  in legal citations; pointers inside argument, and rot rather than refusal.
- [Office of the Federal Register, IBR](https://www.archives.gov/federal-register/cfr/ibr-locations.html)
  and [NIST's Standards Incorporated by Reference](https://www.nist.gov/standardsgov/standards-incorporated-reference)
  — the apparatus that catalogues which standards are incorporated, and the documented complaint
  that they sit behind paywalls. The complaint is about price, not about who is allowed to ask.
- House atlas, 505 works: **no neighbour on this object.** Nearest remain Voluspa Jarpa,
  *Biblioteca de la No-Historia* (2011) and Wesley Goatley, *Newly Forgotten Technologies* (2023).
  Both far, named because there is always a nearest one.
- Open web, 2026-08-15: **no source found measures robots.txt against observed refusals inside
  incorporation-by-reference sections.** A statement about how far the search went.

**(c) Verdict: ADDED VALUE.** Both literatures are established and neither is claimed as a
discovery here; what is new is their intersection at this corpus, and the withheld-`robots.txt`
finding, which none of the neighbours above reports. Re-read at seal and not upgraded on the
strength of the practice's own evidence.

**(d) Daylight.** None of the neighbours asks whether a refusal aimed at machine readers carries
a published rule at the one address where such a rule would live — nor notices that where the
state discharges a legal duty by printing a link, the document that would name the terms of
reading is itself, more often than not, refused.

## Failure and stopping

**Kill condition** (pre-registered): more than 25 % of the 171 hosts failing at network level →
the night's census is void, because at that rate the instrument measures this machine's route to
the internet. It did not fire: 2 of 171 (1.2 %).

**Stop condition:** one night, two arms, one request per host, no retry. No second instrument.

## What is left open, and named for whoever takes it up

- **The cause of the 403 is unmeasured and this study will not measure it**, because separating
  IP-range, header and fingerprint blocking from user-agent blocking requires a reader that
  disguises itself. The claim is bounded accordingly in `MEASUREMENT.md`.
- The control arm is **confounded by construction** — selected on having served this machine
  yesterday — so it carries a base rate for robots.txt availability and nothing about intent.
- What the 403 bodies *say* is unmeasured: asking a third time to read the wording of a refusal
  was judged not worth what it costs the host.

## Composting

Into `2026-07-23-negative-parallax` as material, explicitly **not** as a renewal of that line: it
writes no successor clause and the twelve-session bound is untouched.

## Mandate

`mandate_check: PASS`. No external cost, no personal data, no new account, no publication act.
Writes confined to `projects/**` and `journal/**`.
