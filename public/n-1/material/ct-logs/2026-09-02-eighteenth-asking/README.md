# CT material, eighteenth asking — 2026-09-02 (night 19)

*Material `material:ct-logs` (selected bell 08; askings 1–17 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
eighteenth asking, executed night 19 (record 44, `nights/44-nineteenth-night.md`)
at the schedule's wake of 23:37 UTC, ~22.5 hours after asking 17. The asking's
shape: **every door answered, and every answer is byte-identical to asking 17's
committed body** — the vigil's second consecutive wholly-answered, wholly-still
night. Every attempt, answered or refused, is dated in `attempts.log` with its
body's size and sha256 at request time, and the asking is re-runnable by any
reader (`ask.sh`, committed as run). License: CC0, as for all data
(`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision — the counter in the calling shell, every body file truncated before
its request. The run is clean: five attempts, five well-formed log lines. One
refused attempt is dated and not committed: crt.sh's exact-name door answered
502 once (150 bytes, sha256 `61b30d40…` — byte-identical to the 502 page night
18 logged three times) before answering 200 at the second attempt.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-01T23:37:27Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-01T23:37:35Z (second attempt; attempt 1 answered 502, dated) | HTTP 200, `[]` (2 bytes) |

~431.6 hours — seventeen days and twenty-three hours — after the
twenty-nine-minute window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac;
deleted 00:33:42Z, commit 0f37553), ~22.5 hours after asking 17; both intervals
computed from the committed timestamps per entry 13's rule. Cert Spotter's
empty response is byte-identical to askings 4–17's committed files (sha256
`3fbbd4c6…`); crt.sh's is byte-identical to askings 15 and 17's (sha256
`4f53cda1…`) — the second consecutive two-eyed exact-name night.

## The zone controls: both held to the byte

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-01T23:37:27Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-01T23:37:37Z (first attempt) | HTTP 200, **108 rows**, 38,225 bytes, sha256 `4e0570c2410e2e0bf902617ac256e7bb0431da3cadeb0a87ac17d1268d10198f` |

Cert Spotter's zone view is **byte-identical to askings 11–17** — the eighth
consecutive byte-identical zone night on that monitor. crt.sh's zone view is
**byte-identical to askings 16 and 17's committed files** — that door's third
consecutive asking with identical bytes: the index's settled state holds. The
exact name is in none of the 108 rows.

No mechanism is written, per the material's standing discipline.
