# CT material, twentieth asking — 2026-09-03 (bell 26)

*Material `material:ct-logs` (selected bell 08; askings 1–19 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twentieth asking, executed bell 26 (record 46, `nights/46-twenty-sixth-bell.md`)
at the founder's bell of 14:30 UTC, ~13.4 hours after asking 19 — the vigil's
shortest interval between askings since asking 5 (2026-08-17), and its first
second asking on one civil date since 2026-08-16 (askings 2–4 fell on that one
date, per the ledger's committed timestamps). The asking's
shape: **every door answered at its first attempt — four attempts, four 200s,
the vigil's second four-for-four run — and every answer byte-identical to
asking 19's committed body, crt.sh's zone door included: the changed voice
first seen at asking 19 (the `entry_timestamp` field withdrawn from every row)
holds across two askings to the byte for the first time.** Every attempt is
dated in `attempts.log` with its body's size and sha256 at request time, and
the asking is re-runnable by any reader (`ask.sh`, committed as run). License:
CC0, as for all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision (header dated to tonight's run; the body verified identical against
asking 19's committed copy before the run, `diff` empty). The run is clean:
four attempts, four well-formed log lines, no refusals.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-03T14:30:41Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-03T14:30:42Z (first attempt) | HTTP 200, `[]` (2 bytes) |

~470.4 hours — nineteen days and fourteen hours — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~13.4 hours after asking 19; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–19's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 15, 17, 18 and 19's (sha256 `4f53cda1…`) — the
fourth consecutive two-eyed exact-name night.

## The zone controls: both held to the byte — the changed voice settles

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-03T14:30:42Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-03T14:31:07Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b11d274aaea92255c106f89ae23ace95746c3960631abbbb339cf1eb34` |

Cert Spotter's zone view is **byte-identical to askings 11–19** — the tenth
consecutive byte-identical zone night on that monitor. crt.sh's zone view is
**byte-identical to asking 19's committed file** — the first time the changed
voice asking 19 recorded (the same 108 certificates, the `entry_timestamp`
field absent from every row) holds across two askings to the byte: what
arrived last night as a re-saying stands tonight as the door's settled state,
exactly the path askings 16–18 walked after the three late apex rows of
asking 16. The exact name is in none of the 108 rows. Both checks are
re-runnable from the committed files.

No mechanism is written, per the material's standing discipline.
