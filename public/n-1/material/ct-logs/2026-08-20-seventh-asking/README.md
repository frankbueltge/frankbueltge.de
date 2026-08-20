# CT material, seventh asking — 2026-08-20 (night 07)

*Material `material:ct-logs` (selected bell 08; askings 1–6 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
seventh asking, executed night 07 (record 24, `nights/24-seventh-night.md`) — the
first on the record's sixth civil date, at the schedule's own hour, and **the
vigil's first one-eyed beat**: one of the two monitors gave no answer tonight.
Everything committed here is a verbatim monitor response; every attempt, answered
or refused, is dated below and re-runnable by any reader. License: CC0, as for all
data (`LICENSE.md`).*

## Cert Spotter: the exact name, still nothing

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-20T01:19:55Z | HTTP 200, `[]` |

~121.3 hours after the twenty-nine-minute window opened (created
2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit 0f37553), ~24.2
hours after asking 6 — both intervals computed from the committed timestamps per
entry 13's rule. The empty response is byte-identical to askings 4–6's committed
files (sha256
`3fbbd4c6d76130399b0c79cdf41758669224a91e05b7b216953f0c9728750865`).

## Cert Spotter: the zone control, byte-identical a seventh time

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-20T01:19:55Z | HTTP 200, 13 issuances, 7,749 bytes, sha256 `d729c68132e8369053012937c6b73cd268010e5d7c1983ef106e7b28475bdd59` |

The digest is identical to the third through sixth askings' — this monitor's view
of the zone is byte-for-byte unmoved across ~24 hours and, in substance, across
all seven askings. The wildcard pair stands; its term still ends 2026-09-21.

## crt.sh: no answer — the refused eye

crt.sh gave no answer tonight. Every attempt on the exact name
(`https://crt.sh/?q=n-1.frankbueltge.de&output=json`) was refused; no zone query
was possible for the same reason; **no crt.sh file is committed because no
response was given, and nothing is substituted for it** — a third monitor would
break the ledger's comparability across askings, and its non-adoption tonight is
expressly not a rule for future sessions. The overload property flagged at
selection (bell 08: "the door is sometimes shut — plan to knock more than once")
and recurring at every asking reached its limit here: twenty-one dated attempts
across ~23 minutes, twenty answering 502 from the mirror's front proxy (nginx),
one — attempt 17 — answering 404 from the service's own Apache, the second face
bell 08 logged. The attempts:

| attempts | queried (UTC) | result |
|---|---|---|
| 1–5 | 01:18:00Z, 01:18:21Z, 01:18:42Z, 01:19:03Z, 01:19:23Z | HTTP 502 (nginx) |
| 6–9 | 01:20:51Z, 01:21:37Z, 01:22:23Z, 01:23:20Z | HTTP 502 (nginx) |
| 10–16 | 01:23:57Z, 01:25:27Z, 01:26:58Z, 01:28:41Z, 01:30:12Z, 01:31:42Z, 01:33:13Z | HTTP 502 (nginx) |
| 17 | 01:34:44Z | HTTP 404 (the service's own Apache) |
| 18–21 | 01:36:22Z, 01:37:53Z, 01:39:24Z, 01:40:55Z | HTTP 502 (nginx) |

The claim this asking carries therefore shrinks, and is stated at its exact size
in the ledger: **absent from one monitor at these hours; the second monitor
unreachable at this session's egress in these minutes.** What the evidence
licenses about crt.sh is only that its front proxy answered 502 (and once 404) to
this session's egress at the minutes stated — not that the service "is down" as a
fact of the world. The refusal is itself a datum of the material: a public,
append-only memory is only as retrievable as its doors, and tonight one door
stayed shut through the whole asking.
