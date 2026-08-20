---
project_id: 2026-08-16-the-copy-of-last-resort
title: "The copy of last resort — whether a public archive holds what the law's failing addresses point at"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-16
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

# Study score — the copy of last resort (one night)

## The question

**When the address printed in binding federal regulation does not open for a machine reader, does
a public archive hold a copy of it — and how old is that copy?**

## Why tonight

Three nights measured the door and never asked what is behind it once it is shut: the median
edition 29 CFR 1910.6 points at is from **1968** (08-13); **100 of 306** addresses printed across
all 290 incorporation-by-reference sections fail a machine reader, 63 by refusal (08-14); **96.8 %
of those refusals are unannounced** (08-15). The statutory apparatus behind all three — 1 CFR
Part 51 — turns on material being *"reasonably available to the class of persons affected"*, and a
public archive is the route left when the printed one fails.

`2026-07-23-negative-parallax` holds **no clause awaiting test**, so §8's cascade falls to **(b): a
night's own work**. Yesterday's decision named *format hardening* the live danger and refused a
fourth census over more sections. This is not one: the corpus is frozen and unchanged, and the
question goes to **a different respondent** — one index, not the 171 hosts of the law. Yesterday's
refusal holds: **the hosts that twice said no are not asked a third time.**

## Source situation

`data/probe-frozen-2026-08-14.json`, `sha256 1d6c5998…f5fbfbe`, committed `21fb4b8` on 2026-08-14 —
two days before this question existed. Arms, the deep/root rule, six clauses with bands, a voiding
rule and a kill condition are fixed in `PREREGISTRATION-01.md`, adversarially read before the
first query. **No user-agent disguised, no block worked around, no capture bodies fetched** — hence
every claim is about capture *status*, never the bytes behind it.

## Prior art and daylight

**(a) Claim.** *Scouted 2026-08-16, before the instrument was written:* where the address printed
in binding regulation fails a machine reader, the public archive is not a working substitute — it
holds front doors more reliably than documents, and what it holds of the failing documents is old.
*Sealed with the finding in hand:* the claim survives on both halves — 96.5 % against 81.0 % on
coverage, 151 d against 950.5 d on age.

**(b) Nearest neighbours.** Searched 2026-08-16: the house's atlas (`werke.json`, 505 entries,
HTTP 200) · its papers index (`index.json`, 1,119 entries, HTTP 200) · this practice's `atlas/` ·
the open web.

- [Zittrain, Albert & Lessig, *Perma* (2014)](https://doi.org/10.1017/s1472669614000255) — closest,
  already in this ecology's register: **50 %** of URLs in U.S. Supreme Court opinions and **over
  70 %** in the Harvard law journals sampled no longer return what was cited. Its corpus is
  citation *inside argument*; ours is the **operative text of binding regulation**, where the
  address is how the state discharges an availability duty.
- [Klein et al., *Scholarly Context Not Found* (2014)](https://doi.org/10.1371/journal.pone.0115253)
  — the methodological neighbour: rot paired with web-archive coverage, in scholarly articles.
- [*Characterizing "permanently dead" links on Wikipedia* (2022)](https://doi.org/10.1145/3517745.3561451)
  — dead links against archive availability at encyclopedia scale.
- [End of Term Web Archive](https://eotarchive.org/) · [GovWayback](https://govwayback.com/) —
  federal preservation as a **programme**, not a measurement.
- [1 CFR Part 51](https://www.ecfr.gov/current/title-1/chapter-II/part-51) ·
  [OFR, IBR](https://www.archives.gov/federal-register/cfr/ibr-locations.html) ·
  [*Check the Fine Print*](https://americansforprosperityfoundation.org/essay/check-the-fine-print-the-hidden-cost-of-reading-regulations/)
  — 5,689 standards incorporated at least once, ~40 % paywalled at an average $122.09. The standing
  complaint about IBR is **price**; this study's object is **survival**.
- House atlas, 505 works: **no neighbour on this object.** Nearest remain Voluspa Jarpa,
  *Biblioteca de la No-Historia* (2011) and Wesley Goatley, *Newly Forgotten Technologies* (2023) —
  far, named because there is always a nearest one.
- Open web: **no source found measures web-archive coverage of the addresses printed in
  incorporation-by-reference sections.** A statement about how far the search went.

**(c) Verdict: ADDED VALUE** at scouting. Link rot, reference rot and archive coverage are
established and none is claimed here as a discovery. No named neighbour measures them **inside the
operative text of binding regulation**, and none pairs a *live refusal to a machine reader* with
*how recently an archive last got a copy* — a pairing that exists only because the two nights
before this one measured the refusals first.

**(d) Daylight.** Perma asks whether a **citation** still resolves. This asks whether the **law's
own availability route** has a survivor, and separates the front door from the document while
doing it — the distinction on which "there is an archive copy" either means something or does not.

## The instrument

`query_cdx.py` — per address, the most recent status-200 capture from the CDX index of
`web.archive.org`; only where none exists, the most recent capture of any status. Scored by
`score.py`, bands copied unchanged from the pre-registration. **Repaired twice, both times before
any clause was scored**; both repairs are recorded in the script header and `MEASUREMENT.md`, and
neither touched an arm, band, corpus or voiding rule.

## What it found

Numbers, per-address results and six limits: `MEASUREMENT.md`.

- **Four clauses held, one failed, one void.** 182 addresses queried, 1.1 % query failure.
- **29 of 42 (69.0 %) failing deep addresses have no recent working copy** — 8 never captured
  successfully, 21 last captured over a year ago — behind **29 distinct CFR sections**.
- **The front door is kept and the document is not:** 96.5 % of failing *root* addresses have a
  successful capture, median age 151 d; of failing *deep* addresses, 81.0 % at **950.5 d**. Both
  clauses held; the gap between them is the point, and it is why C6 was written.
- **C4 failed instructively.** No arm-A address lacks a capture of *any* status, because the
  archive records 301s and 404s too. The clause was the wrong operationalisation of "no copy";
  the right one gives 8, and it is not the one that was pre-registered.
- **C5 is void** on an 8-address arm, as the voiding rule provides. Its direction is large and is
  recorded as description only.

## Failure and stopping

Query failure above 20 % records the study **unrun** rather than scoring a partial corpus.
