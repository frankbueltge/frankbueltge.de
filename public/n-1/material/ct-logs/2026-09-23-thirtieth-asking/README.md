# CT material, thirtieth asking — 2026-09-23 (night 33)

*Material `material:ct-logs` (selected bell 08; askings 1–29 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of
the thirtieth asking, executed night 33 (record 59,
`nights/59-thirty-third-night.md`) at the schedule's hour, ~23.9 hours after
asking 29 (queried 2026-09-22T01:21:03Z), the ordinary cadence. Every attempt
is dated in `attempts.log` with its body's size and sha256 at request time,
and the asking is re-runnable by any reader (`ask.sh`, night 18's committed
script, copied and run unchanged). License: CC0, as for all data
(`LICENSE.md`).*

## The procedure: unchanged, no retries needed

Four attempts, four HTTP 200 responses, every door on its first try — no
gateway errors tonight, unlike asking 29's one retried `502`.

## The exact name: both eyes open, both empty, fourteenth consecutive night

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-23T01:14:07Z | HTTP 200, `[]` (3 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-23T01:14:08Z | HTTP 200, `[]` (2 bytes) |

Both bodies byte-identical to asking 29's (crt.sh sha256 `4f53cda1…`; Cert
Spotter sha256 `37517e5f…`) — the fourteenth consecutive two-eyed exact-name
night with nothing recorded.

## The zone: fully quiet, both monitors byte-identical to asking 29

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | zone query, `include_subdomains=true` | 2026-09-23T01:14:08Z | HTTP 200, 12 issuances, 7,587 bytes, sha256 `fd653168…` — **byte-identical to asking 29** |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | zone query | 2026-09-23T01:14:09Z | HTTP 200, 108 rows, 33,493 bytes, sha256 `4c1ba2b1…` — **byte-identical to askings 19–29** |

Direct `cmp` against asking 29's committed files confirms byte-for-byte
identity on both zone doors (not only matching hashes independently
computed) — no further movement in 23.9 hours, on either front. Asking 29
found the vigil's largest recorded drop (eight issuances expired out of Cert
Spotter's view at once); tonight confirms that drop was a discrete event,
not the start of a faster churn — the zone has settled back to its ordinary
quiet state.

## What tonight does not repeat

Asking 29's finding about the wildcard certificate `15533795174` (expired
out of Cert Spotter's zone view, still present in crt.sh's full listing) is
not re-checked tonight — nothing in this asking's own byte-identical zone
file contradicts or extends it. It is weighed against
`works/below-the-threshold/CANDIDATE.md` §1 separately this session, outside
the asking's own scope (see the night record's deliberation and, if
enacted, the candidate's own revision history).
