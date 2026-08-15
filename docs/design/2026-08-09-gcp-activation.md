# GCP activation — G1 tested live, G5 conditionally approved (D6/D7 executed)

**Date:** 2026-08-09 (UTC). **Decided by:** Frank, night session, on the portfolio audit's
decision list (`2026-08-09-portfolio-audit.md` §7, D6/D7). This document records the
decision, the executed G1 test with its full provenance trace, and the conditions that
bind every future GCP step.

## 1. Frank's decision (wording private)

On **G1 (BigQuery GDELT)**: worth testing if it costs approximately nothing, and likely
useful for further experiments, for machine attention and for the research ecology as
well, with the licence terms followed strictly — GO for testing; license terms strictly
followed; explicitly intended as shared infrastructure for further experiments, machine
attention, and the research ecology.

On **G5 (Earth Engine Sentinel-1)**: the same, only if no material costs arise, with the
note that parts of a stated ethic may be given up where that is sensible and serves the
work — conditional GO: no significant costs may arise, and the documented reproducibility
trade-off (portfolio audit §6.5) is accepted, provided it serves the work and is stated
openly.

Not activated: G2/G3 (decided with their reworks), G4/G6 (verified negatives / reserve).

## 2. G1 — the live test (executed 2026-08-09, ~00:39 UTC)

**Environment.** Frank's GCP project `gen-lang-client-0843427097` (display name
"frandekbueltge" — the site's Gemini project; a cosmetic rename or a dedicated
properly-named project is an open housekeeping point, nothing blocks on it). The BigQuery
API was enabled on the project as part of this test. No billing beyond the free tier is
attached to this use; BigQuery's free tier is 1 TiB of query processing per month.

**The query** (dry-run estimate first: 30,342,258 bytes):

```sql
SELECT DATE(_PARTITIONTIME) AS day,
       COUNT(*) AS records,
       COUNT(DISTINCT SourceCommonName) AS sources
FROM `gdelt-bq.gdeltv2.gkg_partitioned`
WHERE _PARTITIONTIME >= TIMESTAMP_SUB(TIMESTAMP_TRUNC(CURRENT_TIMESTAMP(), DAY), INTERVAL 7 DAY)
GROUP BY day ORDER BY day
```

**Result** (partial days at both window edges are expected — the window starts mid-day
UTC-relative and 2026-08-09 was ~40 minutes old at query time):

| day | records | sources |
|---|---|---|
| 2026-08-02 | 180,355 | 8,670 |
| 2026-08-03 | 296,146 | 11,357 |
| 2026-08-04 | 320,714 | 11,534 |
| 2026-08-05 | 326,204 | 11,602 |
| 2026-08-06 | 317,526 | 11,547 |
| 2026-08-07 | 304,930 | 11,282 |
| 2026-08-08 | 193,793 | 9,081 |
| 2026-08-09 | 94,626 | 6,920 |

**Provenance trace** (from `jobs.get`, captured at run time per the 180-day-expiry rule):

```json
{
  "job_id": "portfolio_audit_g1_test_20260809",
  "project": "gen-lang-client-0843427097",
  "user": "f.bueltge@gmail.com",
  "created_utc": "2026-08-09T00:39:18.492Z",
  "total_bytes_processed": "30354472",
  "total_bytes_billed": "30408704",
  "cache_hit": false,
  "statement_type": "SELECT"
}
```

**Cost:** 30.4 MB billed ≈ 0.003% of the monthly free tier — €0. A full ten-year
Consensus-baseline scan will be larger but stays comfortably inside the free tier with
partition filters (the partitioned tables' `_PARTITIONTIME` filter is the cost lever, and
it is mandatory practice, not an optimization).

**License notice:** Data: [The GDELT Project](https://www.gdeltproject.org). This citation
travels with every GDELT-derived committed file; those files are published with the notice
documented rather than as bare CC0 (GDELT's terms require citation + link on any use or
redistribution — an obligation CC0 cannot wash away; portfolio audit §6.1).

**Verdict of the test: the path works end-to-end** — query, cost measurement, run-time
trace capture, license notice. The pattern above (committed SQL + committed job metadata)
is the template every future BigQuery step follows.

## 3. What G1 activation means (and does not mean)

- The **Consensus baseline build** (rework program #1, Phase 1) may use this path for the
  longitudinal echo baseline — that build belongs to the rework sessions, not this one.
- The **TED×GDELT news-shadow join** (Observatory candidate) and **machine attention**
  projects may use the same path under the same conditions — Frank named both as intended
  beneficiaries.
- Nothing changes at site runtime: pipelines commit derived JSON to git as before; the
  site never reads from BigQuery. **Git stays the archive.**

## 4. G5 — recorded conditions (no build tonight)

- **Zero-cost bound:** Earth Engine use stays on the noncommercial/Community tier
  (individual, noncommercial research — the site qualifies today). No paid tier, no
  billing attachment for EE. If any step would incur real cost, work stops and the
  question returns to Frank.
- **Fragility note:** any future sponsorship/monetization of the site breaks noncommercial
  eligibility (audit §6.5) — this is recorded here so a future commercial decision knows
  it has an EE consequence.
- **The accepted trade-off:** EE computations are not third-party re-runnable the way a
  committed SQL string is; provenance is self-assembled (committed script + hash + task ID
  + parameters). Frank accepted this deliberately ("man kann auch mal Teile einer Ethik
  aufgeben, wenn es sinnvoll ist und der Sache dient") — the Dark Ocean V1 method sheet
  must state the trade-off in exactly this openness.
- **Where it lands:** the V1 detection path in the `machine-attention` repo, in its own
  sessions, after the V0 accumulation phase and the E-experiment criteria (V0 build note).
  EE project registration is the first step there; nothing was registered tonight.

## 5. D7 — executed in this PR

The CLAUDE.md "Kein GCP" line (architecture paragraph) and the deployment section's
"kein GCP" aside are replaced per the portfolio audit's §8 proposal, adjusted to name what
is actually activated. The rule now follows the practice, as §8 required.
