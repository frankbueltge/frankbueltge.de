# CT material, fifth asking — 2026-08-17 (night 04)

*Material `material:ct-logs` (selected bell 08; first prospect bell 09; second
prospect bell 13; third asking night 03; fourth asking bell 14). This directory is
the evidence of the fifth asking, executed night 04 (record 20,
`nights/20-fourth-night.md`) — the first asking made at the schedule's own hour,
and the first on the record's third civil date. Everything here is a verbatim
monitor response; every query is dated and re-runnable by any reader. License:
CC0, as for all data (`LICENSE.md`).*

## The exact name, asked a fifth time

Still **nothing**. Both monitors, ~49.0 hours after the twenty-nine-minute window
opened (created 2026-08-15 02:04:11 Berlin = 00:04:11 UTC, commit 7fc20ac; deleted
02:33:42 Berlin, commit 0f37553) — the interval re-derived from the committed
timestamps; see the correction below:

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-17T01:05:53Z | HTTP 200, `[]` |
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-17T01:06:02Z | HTTP 200, `[]` |

Both empty responses are byte-identical to the fourth asking's committed files
(sha256 `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` and
`3fbbd4c6d76130399b0c79cdf41758669224a91e05b7b216953f0c9728750865`).

## The controls — byte-identical a fifth time

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-08-17T01:07:04Z (first attempt 01:06:20Z answered 404 from the service's own Apache — the second face of the overload property bell 08 logged at selection; retry answered 200) | HTTP 200, 98 rows, 34,787 bytes, sha256 `f8a0192330e1c787776fba187b4de67c780ac5207db548fd0542a2731023df4b` |
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-17T01:06:10Z | HTTP 200, 13 issuances, 7,749 bytes, sha256 `d729c68132e8369053012937c6b73cd268010e5d7c1983ef106e7b28475bdd59` |

Both digests are **identical to the third and fourth askings'** — the zone's
memory is byte-for-byte unmoved across ~24 hours and, in substance, across all
five askings (crt.sh 98 rows / 34,787 bytes; Cert Spotter 13 issuances / 7,749
bytes, matching the counts recorded at every asking since 2026-08-15). The three
wildcard-bearing crt.sh rows stand unchanged (ids 27429354926, 27429534409,
27429548167; the pair's term ends 2026-09-21). Because the third asking's zone
files remain byte-identical, the work's page — which renders the world's memory
from `material/ct-logs/2026-08-16-third-asking/crt-sh.frankbueltge.de.full.json` —
remains a rendering of the log's current answer, and this directory is the dated
proof of that currency.

## Correction — the stated intervals of askings 2–4 (2026-08-17, night 04)

Computing this asking's interval exposed that the "hours after the window"
figures stated at askings 2–4 do not re-derive from the committed timestamps.
The base of the window is its creation, 2026-08-15T00:04:11Z (02:04:11 Berlin,
commit 7fc20ac). Re-derived:

| asking | queried (UTC) | stated | actual |
|---|---|---|---|
| 1 (bell 09) | 2026-08-15T21:24:35Z | ~21 hours | 21.3 h — **correct** |
| 2 (bell 13) | 2026-08-16T00:37:10Z | "~46.5 hours after the window closed"; "~27 hours later/apart" | **24.1 h** after the window closed (00:33:42Z); **3 h 13 min** after asking 1 |
| 3 (night 03) | 2026-08-16T01:08:59Z | ~47 hours | **25.1 h** |
| 4 (bell 14) | 2026-08-16T12:31:51Z | ~58.5 hours | **36.5 h** |

The 46.5/47/58.5 figures re-derive exactly from a base one day early
(2026-08-14 ~02:04 in place of 2026-08-15 00:04:11Z) — a wrong-base error that
propagated across three sessions by citation. The "~27 hours" figures re-derive
from no consistent base. The erroneous figures stand where they were written
(the READMEs of the recheck, third and fourth askings; night records 15–17; one
register line), each now carrying a dated correction note; nothing is retouched
(floor rule 2 — corrections preserve the original record). No committed evidence
is affected: every query timestamp and monitor response stands as committed, and
the absence claim never rested on the intervals. The reading's entry 13 carries
what the error stresses.

## Status of the absence claim

Unchanged in kind, extended in date: **absent from these two monitors at these
hours** — now five dated observations (2026-08-15 ~21:25Z; 2026-08-16 ~00:37Z,
~01:09Z, ~12:32Z; 2026-08-17 ~01:06Z), each with the zone demonstrably present
in the same minutes. Not "never issued": monitors lag logs, and the claim is
overturnable by the log but never erasable from it.
