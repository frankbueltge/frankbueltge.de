---
project_id: 2026-08-14-the-addresses-the-law-prints
title: "The addresses the law prints — a link-resolution census of all 290 incorporation-by-reference sections in the CFR"
status: CLOSED
kind: study
initiated_by: Ulysses (dispatcher tick, PROTOCOL v6 §8 cascade (b) — a night's own work)
responsible_human: Frank Bültge
protocol_version: 6
standing_delegation_version: 2
mandate_check: PASS
created: 2026-08-14
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

# Study score — the addresses the law prints (one night)

## The question

**When federal law names a document it makes binding and prints a web address so a reader can
reach it, does that address still go anywhere — and when it does not, is it the organisation that
has vanished or only the path?**

## Why this study, and why tonight

The work-line `2026-07-23-negative-parallax` holds **no pre-registered clause awaiting test** and
stands 52 worked sessions past its bound of twelve, so under §8 it does not hold this session by
right. The cascade falls to **(b): a night's own work** — and what that work is was not chosen
tonight. Yesterday's study `2026-08-13-whether-the-freeze-travels` found, post-hoc, one dead
pointer and refused to score it: *"a pre-registered census of whether the URLs printed in IBR
sections still resolve … must be forecast before it is run."* This is that study.

## Source situation

**Every section of the CFR headed *Incorporation by reference.*** — **290 sections in 30 of the 50
titles**, enumerated from the eCFR versioner structure API at issue date **2026-08-11** and fetched
in full. These are the places where the federal government makes someone else's document binding
on the public. 1 CFR 51 requires the incorporated material to be *"reasonably available to the
class of persons affected"*; the web address printed beside an entry is, often, the government's
whole answer to that requirement.

**Rights:** public-domain regulation; **no incorporated document was retrieved** — only the
addresses pointing at them, at most twice each, at most two requests per second per host.
**Affected publics:** none beyond the practice.

## What was done

Four steps, and the order is the instrument. `collect_sections.py` walked all 50 titles and
collected the 290 headings (headings only, never text) — this ran *before* the pre-registration.
`PREREGISTRATION-01.md` then fixed five clauses with bands, the extraction and probe rules, the
voiding rule and the kill condition, and was read adversarially against itself. `extract_urls.py`
fetched all 290 sections, extracted every printed address by a fixed regex, classified each by
hostname alone, and **froze the result to disk with a sha256** recorded in `MEASUREMENT.md`.
Only then did `probe_urls.py` read that frozen file and issue the first request.

That order is the blind step, and it is checkable: the classification every clause is scored
against was hashed on disk before any host in this corpus had heard from this machine. The entry
parser from the two previous studies — the one carrying an 8.9 % transfer error — is **not used
here**, and nothing tonight is counted per entry.

## What it found

Numbers, per-URL results and sources: `MEASUREMENT.md`.

- **1,018 printed addresses, 306 distinct, on 203 hosts.** 250 of 290 sections print at least one;
  40 print none.
- **Two clauses held, three failed.** D1 (corpus size) and D2 (84.8 % of answerable addresses
  resolve, forecast 85 %) held. D3, D4 and D5 failed, and they failed in one direction: **I
  forecast that the institutions survive and only the paths die, and that is not what is there.**
- **Thirteen hosts printed in binding federal regulation have no address record at all** —
  confirmed independently of this machine's proxy, three attempts each, with live and nonsense
  controls. Five of the thirteen are federal: `assist.daps.dla.mil` · `fedspecs.gsa.gov` ·
  `healthit.hhs.gov` · `www.ntl.bts.gov` · `www.policy.energy.gov`.
- **The finding I did not forecast, and the largest single class: 63 of 306 addresses (20.6 %)
  refuse this machine outright** — 403 or 429 on both probes, behind 197 of the 1,018 printed
  occurrences. That is not link rot. It is a door in the law that opens for a person and not for a
  reader that is a machine, and it is why D2's headline is not tonight's number. The
  pre-registration's adversarial read fixed that condition in advance: *"if `blocked` exceeds the
  number of failures, D2's result is not the interesting number of the night."* Blocked 63,
  failures 37.
- **The government's own backstop is missed four times.** Four sections point at the National
  Archives' list of places where incorporated material may be read free of charge — the literal
  discharge of *"reasonably available"* — with four different wrong spellings or paths. All four
  return 404; the correct address returns 200. In the same register: **`www.Ph.D.sc.org/`** stands
  in 45 CFR 170.299 as a standards body's website, and neither it nor `phdsc.org` resolves.
- **My own instrument produced one false failure**, found by checking it: `www.usace.army.mil`
  failed both probes and resolves cleanly on an independent check. Recorded, not quietly dropped.

## Prior art and daylight

**(a) Claim.** *Scouted, 2026-08-14, before anything was built:* the addresses printed inside
binding federal regulation rot in a specific shape — the organisations survive and the paths into
them die — which makes the government's answer to its own *reasonably available* requirement a
pointer that outlives its target.

*Sealed, with the finding in hand, and the claim is not the one that was scouted.* The shape is
wrong — thirteen hosts do not survive at all, five of them federal — and the largest single class
is not rot but **refusal**. What this work asserts, and what someone could contradict: **across
the CFR's whole incorporation-by-reference apparatus, the addresses through which the state
discharges its duty to make binding documents reasonably available fail at a measurable rate, and
the biggest single obstacle to reading them at scale is not decay but a door held shut against
machine readers.**

**(b) Nearest neighbours.** Searched 2026-08-14: the house's atlas of neighbouring works
(`werke.json`, count 505, HTTP 200) · the house's papers index (`index.json`, 1,112 entries, HTTP
200) · this practice's own `atlas/` · the open web.

- [Zittrain, Albert & Lessig, *Perma: Scoping and Addressing the Problem of Link and Reference Rot
  in Legal Citations* (2014)](https://doi.org/10.1017/s1472669614000255) — the closest of all, and
  already in this ecology's papers register. It measures link rot in **US Supreme Court opinions
  and law-review articles**: pointers inside argument. Its subject is a citation that supports a
  claim; here the pointer is the only route to a text that *is* the law.
- [Zittrain, Bowers & Stanton, *The Paper of Record Meets an Ephemeral Web* (2021)](https://doi.org/10.2139/ssrn.3833133)
  — 2.2 million New York Times links, a quarter broken. Journalism, not binding text.
- [Klein et al., *Scholarly Context Not Found* (2014)](https://doi.org/10.1371/journal.pone.0115253)
  and [Jones et al., *Scholarly Context Adrift* (2016)](https://doi.org/10.1371/journal.pone.0167475)
  — the reference-rot baseline for scholarship, and both separate link rot from content drift in a
  way this census does not attempt.
- [NIST's Standards Incorporated by Reference database](https://www.nist.gov/standardsgov/standards-incorporated-reference)
  and the [Office of the Federal Register's IBR pages](https://www.archives.gov/federal-register/cfr/ibr-locations.html)
  — the apparatus that catalogues *which* standards are incorporated. Neither asks whether the
  addresses printed beside them resolve.
- House atlas, 505 works: **no neighbour on this object**. Nearest are Voluspa Jarpa,
  *Biblioteca de la No-Historia* (2011) — a document made unreadable by censorship, where this is
  one made unreachable by a pointer — and Wesley Goatley, *Newly Forgotten Technologies* (2023).
  Both far, named because there is always a nearest one.
- Open web, 2026-08-14: the link-rot literature is large and well indexed, and **no source found
  measures URL resolution inside CFR incorporation-by-reference sections**. A statement about how
  far this search went, not a proof of absence.

**(c) Verdict: ADDED VALUE.** Against the neighbours named above, at both stages: the defect is
thoroughly established, the corpus is not. Nothing here claims link rot as a discovery. Re-read at
SEAL and unchanged — the refusal finding, which none of the neighbours reports, would if anything
argue for more, and this record does not upgrade its own verdict on its own evidence.

**(d) Daylight.** None of the neighbours measures pointers inside text that is itself binding —
where the address is not a courtesy to a reader but the government's own discharge of a legal duty
to make the incorporated document reasonably available, and where the law forbids obeying any
edition other than the unreachable one.

## Failure and stopping

**Kill condition** (pre-registered): more than 10 % of the 290 sections unreachable from the eCFR
API → the census is void for the night. It did not fire; 290/290 were fetched.

**Stop condition:** one night, one corpus, one extraction, one probe pass with one retry per
failure. No second instrument.

## Composting

Into `2026-07-23-negative-parallax` as material, explicitly **not** as a renewal of that line.

## Mandate

`mandate_check: PASS`. No external cost, no personal data, no new account, no publication act.
Writes confined to `projects/**` and `journal/**`.
