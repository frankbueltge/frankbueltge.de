# CT material, third asking — 2026-08-16 (night 03)

*Material `material:ct-logs` (selected bell 08; first prospect bell 09; second
prospect bell 13). This directory is the evidence of the third asking, executed
night 03 (record 16, `nights/16-third-night.md`) — the first asking made for the
work's own ledger (`works/below-the-threshold/askings.json`) rather than only for
the material's prospect. Everything here is a verbatim monitor response; every
query is dated and re-runnable by any reader. License: CC0, as for all data
(`LICENSE.md`).*

## The exact name, asked a third time

Still **nothing**. Both monitors, ~47 hours after the twenty-nine-minute window
(created 2026-08-15 02:04:11 Berlin, commit 7fc20ac; deleted 02:33:42, commit
0f37553):

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-16T01:08:59Z | HTTP 200, `[]` |
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-16T01:09:09Z | HTTP 200, `[]` |

## The controls — full responses committed for the first time

The two prior directories committed derived extracts of the zone controls; this
asking commits the **verbatim full responses**, because the work's form renders
the world's memory from them and nothing may be rendered that is not committed
evidence (floor rule 1).

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-08-16T01:09:34Z (first attempt 01:09:19Z answered 503 — the mirror's overload property, flagged at selection, recurring; retry answered 200) | HTTP 200, 98 rows, 34,787 bytes, sha256 `f8a0192330e1c787776fba187b4de67c780ac5207db548fd0542a2731023df4b` |
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-16T01:10:05Z | HTTP 200, 13 issuances, 7,749 bytes, sha256 `d729c68132e8369053012937c6b73cd268010e5d7c1983ef106e7b28475bdd59` |

The zone view is unmoved across all three askings: crt.sh 98 rows / 34,787 bytes
and Cert Spotter 13 issuances / 7,749 bytes match the byte counts recorded at the
first prospect (2026-08-15) and the recheck (2026-08-16, bell 13).

## What the full responses add to the record

- **The zone's memory reaches back to 2019-11-23** (oldest crt.sh entry,
  `entry_timestamp` 2019-11-23T15:08:29.284, common name `frankbueltge.de`):
  the world has remembered this zone for nearly seven years. The newest entry is
  2026-07-11 (`stats.frankbueltge.de`).
- **The wildcard attestations, located precisely:** three crt.sh rows carry
  `*.frankbueltge.de` among their names (ids 27429534409 and 27429548167 —
  Google Trust Services WE1, not_before 2026-06-23T17:24:42, not_after
  2026-09-21T18:20:03 — and 27429354926 — SSL Corporation / Cloudflare TLS
  Issuing ECC CA 4, not_before 2026-06-23T18:04:39, not_after
  2026-09-21T18:12:20). Cert Spotter carries the same pair as issuances
  15533905233 and 15533795174. In all of them the wildcard appears in the SAN
  list beside the bare zone name; no certificate names the wildcard as its
  common name.
- The names the world's memory holds for this zone, in full — five identities:
  `frankbueltge.de`, `www.frankbueltge.de`, `stats.frankbueltge.de`,
  `gpt.frankbueltge.de`, `*.frankbueltge.de`. The name this material follows,
  `n-1.frankbueltge.de`, is not among them — and the memory was never asked to
  hold it.

## Status of the absence claim

Unchanged in kind, extended in date: **absent from these two monitors at these
hours** — now three dated observations (2026-08-15 ~21:25Z, 2026-08-16 ~00:37Z,
2026-08-16 ~01:09Z), each with the zone demonstrably present in the same
minutes. Not "never issued": monitors lag logs, and the claim is overturnable by
the log but never erasable from it.
