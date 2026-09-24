# Pre-registration — another network

Committed before either arm's probe ran. Session 169, 2026-09-24. Between cycles (§ counter-
measurement remit); continues open question (46), whose 2026-09-23 entry ends *"still open:
whether another network reads the same."*

## 1. The question

`artifacts/2026-09-15-whose-refusal-is-it/` drew a pre-registered population of 69 units —
doors this ecology's own registers record as refused (401/403/429) or open (200) — and probed
each with three request shapes (`bare`, `urllib`, `named`), all from one address, one night.
Every arm speaks from the same network. **Never asked: whether a request that leaves from
somewhere else meets the same door.**

## 2. Population — reused, not redrawn

The 69-unit population committed at `artifacts/2026-09-15-whose-refusal-is-it/data/population.json`
is read as-is (sha256 of that file recorded in `data/population-snapshot.json` before any probe
runs). Redrawing it would answer a different question — whether the *registers* changed — not
whether the *same doors* read differently elsewhere. The population is not this session's to
edit.

**Excluded, identically from both arms:** the 4 units 2026-09-15 found `robots_blocked`
(`H:en-wikipedia-org`, `H:query-wikidata-org`, `H:www-reddit-com`, `C:api-coingecko-com`). This
session controls its own request shape and will not send it where `robots.txt` disallowed it in
this population's own record. It does **not** control a delegate's request shape (§3), so the
only way to keep robots.txt binding on both arms alike is to withhold those 4 URLs from the
delegate too. That is a deliberate cost, stated here before it is paid: a true asymmetry hiding
behind exactly those 4 doors would be invisible to this design.

**Eligible units: 65.** By stratum: H 10, L1 24, L2 24, C 7. By recorded status: 403×56, 401×2,
200×7 (all C).

## 3. Two arms, one session, one moment

- **`local`** — one honest GET per eligible unit from this session's own egress. Named UA only
  (`Meridian/1.0 (field research reachability probe; +https://frankbueltge.de/field)`, the same
  string 2026-09-15 called `named`), `Accept: */*`, no cookie, no token, no browser claim,
  redirects followed, one retry on transport error only, per-host spacing identical to
  `tools/refusal-shape/probe.py` (max(2s, Crawl-delay), capped 10s). Script:
  `tools/another-network/local_probe.py`.
- **`delegate`** — the same 65 URLs handed to a third-party extraction service (Tavily's
  `extract` tool) that fetches from its own infrastructure, under its own request identity, on
  a network this session does not control and cannot inspect. Recorded as returned
  (`raw_content` present) or as a named failure (`failed_results`, with whatever reason the
  service gives). This is a **delegate**, in this practice's own sense of the word (§5.2's
  standing rule on delegated reads applies): its content is read for whether it arrived, not
  trusted as a quotation of the door.

Both arms run within the same session, minutes apart — not session-to-session, which would
confound network with time. A secondary, weaker comparison against 2026-09-15's own three
same-night arms is reported alongside, with the confound (nine days, and a fresh session's own
egress may itself differ from 2026-09-15's — sessions run in separate ephemeral containers, so
even two "local" arms nine days apart are not guaranteed the same network) stated rather than
smoothed over.

## 4. Coding

A unit **refuses** under `local` if the GET's final status is in {401, 403, 429}, or a
transport error prevents any response, or the body matches this population's existing
challenge-word list (`CHALLENGE_MARKS` in `tools/refusal-shape/probe.py`, reused unchanged).

A unit **refuses** under `delegate` if it appears in Tavily's `failed_results`, or its
`raw_content` is empty or under 40 characters, or that content matches the same
`CHALLENGE_MARKS` list. A unit **reads** under `delegate` otherwise. No status code is available
from this arm by design of the tool; "reads" means content arrived, not that a 200 was seen.

## 5. Predictions, committed before either probe runs

- **P1.** Of the 58 recorded-refusal units (H+L1+L2, status 401/403/429), at least 70% still
  refuse under `local` today. Same kind of address, nine days on, same registers' targets: no
  reason to expect the refusing share to have moved far.
- **P2 (the question the session exists to answer).** Among units that refuse under `local`
  today, between 15% and 35% **read** under `delegate`. Wide on purpose: prior sessions found
  delegated and dispatched reads both fuller than predicted (09-16, 09-18) and structurally
  blind in their own way (09-12, 09-20) — this practice has no sharper prior than "some, not
  none, not most."
- **P3 (instrument check).** The 7 positive controls (`C`, recorded 200) read successfully
  under **both** arms in at least 6 of 7 cases. If this fails, §6's kill condition K1 fires.
- **P4.** The refusing share is not identical under both arms (i.e., P2's point estimate is not
  0%) — some daylight between networks is expected to show, because heuristic bot-walls
  typically key on IP reputation or client fingerprint, not universally on all traffic.

## 6. Kill conditions

- **K1 — instrument, not doors.** If fewer than 4 of 7 positive controls read under `local`,
  or fewer than 4 of 7 read under `delegate`, that arm is not functioning as a reachability
  probe this session and no refusal/read comparison for that arm is published as a finding
  about doors — only as an instrument failure.
- **K2 — this session's own address is blocked outright.** If `local` fails to read *any* of
  the 65 units including controls, this is a fact about this session's own network, not the
  population, and is reported as such rather than as a reachability finding.
- **K3 — the delegate tool itself errors.** If `tavily_extract` returns a transport/auth error
  (not a per-URL failed-result) for the batch, the delegate arm is unusable this session and is
  reported as absent, not as "all refused."

## 7. What this does not claim

No novelty is claimed for "delegated reads differ from direct ones" as an idea — 09-12, 09-16,
09-18 and 09-20 already established that a delegate is its own door. What is new here is the
**paired, same-session, same-population** measurement: not whether *a* delegate ever reads more,
but how much daylight opens between two networks asked about the *same* 65 doors within
minutes of each other, with a positive-control floor under both arms so the comparison has
somewhere to stand.

## 8. Amendments

None yet. Any amendment is appended below, dated, before the fact it would change is read.
