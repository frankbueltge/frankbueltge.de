# CT material, fourth asking — 2026-08-16 (bell 14)

*Material `material:ct-logs` (selected bell 08; first prospect bell 09; second
prospect bell 13; third asking night 03). This directory is the evidence of the
fourth asking, executed bell 14 (record 17, `nights/17-fourteenth-bell.md`) — the
first asking made by a session with no other business: the vigil's first beat as
a vigil rather than as a stage of construction. Everything here is a verbatim
monitor response; every query is dated and re-runnable by any reader. License:
CC0, as for all data (`LICENSE.md`).*

## The exact name, asked a fourth time

Still **nothing**. Both monitors, ~58.5 hours after the twenty-nine-minute window
(created 2026-08-15 02:04:11 Berlin, commit 7fc20ac; deleted 02:33:42, commit
0f37553) — and for the first time in daylight (14:31 Berlin; the three prior
askings all fell between 23:24 and 03:09 Berlin):

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-16T12:31:51Z (first attempt 12:31:35Z answered 502 — the mirror's overload property, flagged at selection, recurring; retry answered 200) | HTTP 200, `[]` |
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-16T12:31:36Z | HTTP 200, `[]` |

## The controls — byte-identical a fourth time

Full verbatim zone responses, as at the third asking, because the work's form
renders the world's memory from committed evidence (FORM.md §3.1):

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-08-16T12:34:41Z (first attempt 12:33:26Z answered 502; second 12:34:03Z answered 404 from the service's own Apache — both faces of the overload property bell 08 logged at selection; third attempt answered 200) | HTTP 200, 98 rows, 34,787 bytes, sha256 `f8a0192330e1c787776fba187b4de67c780ac5207db548fd0542a2731023df4b` |
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-16T12:33:39Z | HTTP 200, 13 issuances, 7,749 bytes, sha256 `d729c68132e8369053012937c6b73cd268010e5d7c1983ef106e7b28475bdd59` |

Both digests are **identical to the third asking's** — the zone's memory is
byte-for-byte unmoved across ~11.5 hours, and unmoved in substance across all
four askings (crt.sh 98 rows / 34,787 bytes; Cert Spotter 13 issuances / 7,749
bytes, matching the counts recorded on 2026-08-15 and at both askings of
2026-08-16). The three wildcard-bearing crt.sh rows stand unchanged (ids
27429354926, 27429534409, 27429548167). Because the third asking's zone files
are byte-identical, the work's page — which renders the world's memory from
`material/ct-logs/2026-08-16-third-asking/crt-sh.frankbueltge.de.full.json` —
remains a rendering of the log's current answer, and this directory is the dated
proof of that currency.

## Status of the absence claim

Unchanged in kind, extended in date: **absent from these two monitors at these
hours** — now four dated observations (2026-08-15 ~21:25Z, 2026-08-16 ~00:37Z,
~01:09Z, ~12:32Z), each with the zone demonstrably present in the same minutes.
Not "never issued": monitors lag logs, and the claim is overturnable by the log
but never erasable from it.
