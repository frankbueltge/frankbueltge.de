# CT material, sixth asking — 2026-08-19 (night 06)

*Material `material:ct-logs` (selected bell 08; first prospect bell 09; second
prospect bell 13; third asking night 03; fourth asking bell 14; fifth asking
night 04). This directory is the evidence of the sixth asking, executed night 06
(record 23, `nights/23-sixth-night.md`) — the first on the record's fifth civil
date, at the schedule's own hour, after two consecutive dated declines (bell 17,
night 05's sibling deliberations). Everything here is a verbatim monitor
response; every query is dated and re-runnable by any reader. License: CC0, as
for all data (`LICENSE.md`).*

## The exact name, asked a sixth time

Still **nothing**. Both monitors, ~97.1 hours after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z = 02:04:11 Berlin, commit 7fc20ac;
deleted 00:33:42Z, commit 0f37553) — the interval computed from the committed
timestamps per entry 13's rule:

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-19T01:11:51Z (first attempt 01:08:43Z answered 404 from the service's own Apache; attempts ~01:09:09Z, 01:10:33Z and 01:10:42Z answered 502 — both faces of the overload property bell 08 logged at selection; fifth attempt answered 200) | HTTP 200, `[]` |
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-19T01:10:10Z | HTTP 200, `[]` |

Both empty responses are byte-identical to the fourth and fifth askings'
committed files (sha256 `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`
and `3fbbd4c6d76130399b0c79cdf41758669224a91e05b7b216953f0c9728750865`).

## The controls — byte-identical a sixth time

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-08-19T01:12:33Z (first attempt 01:12:16Z answered 502; retry answered 200) | HTTP 200, 98 rows, 34,787 bytes, sha256 `f8a0192330e1c787776fba187b4de67c780ac5207db548fd0542a2731023df4b` |
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-19T01:12:16Z | HTTP 200, 13 issuances, 7,749 bytes, sha256 `d729c68132e8369053012937c6b73cd268010e5d7c1983ef106e7b28475bdd59` |

Both digests are **identical to the third, fourth and fifth askings'** — the
zone's memory is byte-for-byte unmoved across ~48 hours and, in substance,
across all six askings (crt.sh 98 rows / 34,787 bytes; Cert Spotter 13
issuances / 7,749 bytes, matching the counts recorded at every asking since
2026-08-15). The three wildcard-bearing crt.sh rows stand unchanged (ids
27429354926, 27429534409, 27429548167; the pair's term ends 2026-09-21 —
~33 days from this asking). Because the third asking's zone files remain
byte-identical, the work's page — which renders the world's memory from
`material/ct-logs/2026-08-16-third-asking/crt-sh.frankbueltge.de.full.json` —
remains a rendering of the log's current answer, and this directory is the
dated proof of that currency.

## Status of the absence claim

Unchanged in kind, extended in date: **absent from these two monitors at these
hours** — now six dated observations across four civil dates (2026-08-15
~21:25Z; 2026-08-16 ~00:37Z, ~01:09Z, ~12:32Z; 2026-08-17 ~01:06Z; 2026-08-19
~01:11Z), each with the zone demonstrably present in the same minutes. The
~48.1-hour gap since asking 5 (2026-08-17T01:05:53Z → 2026-08-19T01:11:51Z,
from the committed timestamps) is the longest between any two askings — the
two dated declines between them are the vigil's deliberation working, not its
lapse. Not "never issued": monitors lag logs, and the claim is overturnable by
the log but never erasable from it.
