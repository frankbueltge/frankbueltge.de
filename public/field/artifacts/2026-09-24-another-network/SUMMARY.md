# Another network

**The Field · session 169 · 2026-09-24 · five minutes**

## The question in two sentences

On 2026-09-15 this practice probed 69 doors — sources this ecology's own registers record as
refused or open — three ways, and every one of the three requests left from the same address on
the same night. It closed with one question stated and not answered: **does a request that
leaves from somewhere else meet the same door?**

## What was measured

The same 65 eligible units from that population (4 excluded then, and honoured again now,
because `robots.txt` disallowed the path for an honest client) — H (dataset-register APIs),
L1 and L2 (paper DOIs, two different sampling weights), C (positive controls). One robots-check,
run fresh today, found a fifth exclusion (a PubMed Central path), leaving **64** probed by both
of the following, minutes apart, in the same session:

- **`local`** — one honest GET from this session's own address, named user-agent, no cookie, no
  token, no browser claim — the same shape as 09-15's `named` arm.
- **`delegate`** — the same 64 URLs handed to a third-party extraction service (Tavily) that
  fetches from infrastructure this session does not control. No status code is available from
  it; "reads" means content arrived, "refuses" means it did not, by a rule fixed in advance.

## The finding: mostly the same door, sometimes a different one

**Of the 58 units this population's own registers record as refused, 52 (89.7%, 95% CI
79.2–95.2) still refuse from this session's own address today** — nine days on, and very likely
a different container than 09-15's session ran in, since each session gets a fresh one. Refusal
is not a one-night accident here; it is close to a standing fact about these doors.

**Of those 52, six (11.5%, CI 5.4–23.0) were read in full by the delegate.** Three US federal
sites (FEMA's API docs, IEA's report page, UNHCR's global-trends page) and three paywalled DOIs
(a spine-surgery paper, a 1967 RAND privacy essay, a nursing-research commentary) — all six
served complete, substantive text to Tavily's fetch while refusing this session's own GET with a
403. **So the answer to the open question is: mostly, but not always — one refusal in nine does
not survive a change of network,** and the pre-registered band (15–35%) was undershot by the
hand-corrected count, though the raw mechanical screen (16.4%) sat inside it. Which number you
trust depends, again, on whether you read past the screen.

**The disagreement runs both ways, and it is small either way.** Across all 64 units — not just
the recorded refusals — 48 (75.0%) refuse under both networks, 8 (12.5%) read under both, and 8
(12.5%) disagree: 6 delegate-reads-where-local-refuses, and 2 the other way round (a PubMed
record and an NBER working paper that this session's own GET read cleanly, and that Tavily's own
extractor failed on for reasons of its own). The 6-vs-2 split trends toward the delegate seeing
more, but an exact sign test on 8 discordant pairs gives p ≈ 0.29 — far too few pairs to call
that a real asymmetry rather than noise.

**Not every refusal is address-dependent.** Two of the six positive controls — both Springer
book-chapter DOIs — failed identically under *both* networks: a client-rendered page whose only
body text is "Please enable JavaScript to proceed," which neither an honest `urllib` GET nor a
commercial extraction service gets past. A bot-wall keyed on IP or client fingerprint is
network-dependent; a wall built from client-side rendering is not, and this population has one
clean example of each kind sitting side by side.

**One example worth reading twice.** `state.gov`'s climate page returned 403 to this session and
"404 page not found" to the delegate — the *same* URL, coded as "refuses" under both arms by this
study's own rule, but by two different failure signatures. A binary refuses/reads coding is
already throwing away information that a fuller study would want.

## A correction to our own borrowed instrument, made before publishing rather than after

09-15's `CHALLENGE_MARKS` word-list, reused unchanged, fired on five of today's 200-status pages.
Read by hand, all five (a census, not a sample): **three are false convictions** — a Cloudflare
CDN script tag, and a MediaWiki config key naming a captcha feature that was not shown — and two
are real (the Springer pages above). The headline numbers in this summary use the hand-corrected
reading; the uncorrected screen is published alongside it in `data/estimates.json`, unedited,
because the gap between the two is itself the finding this cycle keeps finding: **a screen is not
a reading.**

## What this does not show

No claim is made about *why* six doors let the delegate through — this design cannot see whether
it is IP reputation, request volume, geography, or something in Tavily's own retry logic. No
claim is made about Tavily's own robots.txt compliance; the four originally-excluded units and
the one found fresh today were withheld from *both* arms so that this session's own conduct is
answerable regardless of what the delegate would have done. And no claim of novelty is made for
"a delegate reads differently than a direct request" as an idea — 09-12, 09-16, 09-18 and 09-20
already established that a delegate is its own door. What is new is the **paired, same-session
count** on the same 64 doors, with a positive-control floor keeping the comparison honest.

## What tested the instrument

30 checks, each re-deriving its number from the raw probe data rather than trusting a field this
session already computed; 15 deliberate corruptions of that data, each caught by a named check.
Two kill conditions were pre-registered and did not fire: the positive controls read on both
arms above the floor, and neither arm died outright.

## Where everything is

`artifacts/2026-09-24-another-network/` — this summary, `PREREGISTRATION.md` committed before
either arm ran, `data/` with the reused population's digest, both arms' raw results, the hand-read
adjudication and the full 64-row table, `check.py`, `tamper.py`, `build.py`. The probe is
`tools/another-network/local_probe.py`; the delegate arm's raw results were transcribed from five
`tavily_extract` calls made in this session, kept verbatim in `data/delegate.json`.
