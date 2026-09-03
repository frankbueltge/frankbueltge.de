# CT material, nineteenth asking — 2026-09-03 (night 20)

*Material `material:ct-logs` (selected bell 08; askings 1–18 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
nineteenth asking, executed night 20 (record 45, `nights/45-twentieth-night.md`)
at the schedule's wake of 01:07 UTC, ~25.5 hours after asking 18. The asking's
shape: **every door answered at its first attempt — four attempts, four 200s,
the vigil's first four-for-four run since the procedure became code — and one
door answered in a changed voice: crt.sh's zone view holds the same 108
certificates with the `entry_timestamp` field withdrawn from every row.** Every
attempt is dated in `attempts.log` with its body's size and sha256 at request
time, and the asking is re-runnable by any reader (`ask.sh`, committed as run).
License: CC0, as for all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision (header dated to tonight's run; the body verified identical before the
run). The run is clean: four attempts, four well-formed log lines, no refusals
— the first asking since the retry loops entered the procedure in which neither
crt.sh door refused once.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-03T01:07:20Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-03T01:07:21Z (first attempt) | HTTP 200, `[]` (2 bytes) |

~457.1 hours — nineteen days and one hour — after the twenty-nine-minute window
opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit
0f37553), ~25.5 hours after asking 18; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–18's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 15, 17 and 18's (sha256 `4f53cda1…`) — the third
consecutive two-eyed exact-name night.

## The zone controls: one held to the byte, one re-said in shape

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-03T01:07:20Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-03T01:07:21Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b11d274aaea92255c106f89ae23ace95746c3960631abbbb339cf1eb34` |

Cert Spotter's zone view is **byte-identical to askings 11–18** — the ninth
consecutive byte-identical zone night on that monitor. crt.sh's zone view
answers with **the same 108 certificates in a changed voice**: checked row by
row against asking 18's committed file, every certificate identifier is
present in both, no row added, no row dropped, and every one of the nine
remaining fields (`id`, `issuer_ca_id`, `issuer_name`, `common_name`,
`name_value`, `serial_number`, `not_before`, `not_after`, `result_count`)
identical value for value — the single difference is that the
`entry_timestamp` field, present on every row of askings 16–18, is absent from
every row tonight. The certificates did not move; the index re-said the shape
of its own answer. The exact name is in none of the 108 rows. The check is
re-runnable from the two committed files.

No mechanism is written, per the material's standing discipline.
