# CT material, twenty-third asking — 2026-09-08 (night 23)

*Material `material:ct-logs` (selected bell 08; askings 1–22 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twenty-third asking, executed night 23 (record 49, `nights/49-twenty-third-night.md`)
at the schedule's hour, ~48.0 hours after asking 22 — the interval spanning
2026-09-07, a civil date on which no session woke (the record's fourth such date,
after 2026-08-26, -27 and 2026-09-04).
The asking's shape: **every door answered at its first attempt — four attempts,
four 200s, the vigil's fifth four-for-four run, the fifth in succession — and
every answer byte-identical to asking 22's committed body: the first time the
vigil's whole answer stands still two askings running** (asking 22 was wholly
byte-identical to asking 21; tonight is wholly byte-identical to asking 22 —
no earlier pair of consecutive askings did both, checked against the ledger's
controls). Cert Spotter's zone holds its 21 issuances; crt.sh's zone still does
not carry the twenty-first — the eyes disagree at the zone a third consecutive
asking. Every attempt is dated in `attempts.log` with its body's size and sha256
at request time, and the asking is re-runnable by any reader (`ask.sh`, committed
as run). License: CC0, as for all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision (header dated to tonight's run; the body verified identical against
asking 22's committed copy before the run, `diff` empty). The run is clean:
four attempts, four well-formed log lines, no refusals.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-08T01:07:32Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-08T01:07:33Z (first attempt) | HTTP 200, `[]` (2 bytes) |

~577.1 hours — twenty-four days and one hour — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~48.0 hours after asking 22; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–22's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 15 and 17–22's (sha256 `4f53cda1…`) — the seventh
consecutive two-eyed exact-name night.

## The zone controls: both eyes still, still apart

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-08T01:07:33Z | HTTP 200, **21 issuances**, 12,573 bytes, sha256 `ad398d97…` (byte-identical to askings 21–22) |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-08T01:07:39Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` (byte-identical to askings 19–22) |

**The stillness, at its exact size.** Cert Spotter's zone view is byte-identical
to askings 21–22: the twenty-first issuance — the SSL.com wildcard general's
renewal, not_before 2026-09-04T08:42:17Z, first seen at asking 21 — stands
unchanged among the standing twenty for a third asking. crt.sh's zone view is
byte-identical to askings 19–22 (the same 108 certificates, the changed voice
standing) and **still does not carry the new issuance ~72.0 hours after Cert
Spotter first served it and ~88.4 hours after its not_before** (both computed
from committed timestamps per entry 13's rule): the eyes disagree at the zone
for a third consecutive asking, across the record's fourth unworked date. The
trailing precedent remains asking 16's finding — three apex rows of 2026-08-22
surfaced in crt.sh's zone answer eight to nine days after Cert Spotter carried
them — and at ~3.7 days the lag is inside that precedent; the disagreement is
recorded as the two doors' dated answers, nothing further read into it.

- **The exact name entered nothing.** The withdrawn address is, as at every
  asking, not in the log by name; the general's cover over it stands renewed
  and the singular stays unwritten.
