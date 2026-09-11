# CT material, twenty-fifth asking — 2026-09-11 (night 25)

*Material `material:ct-logs` (selected bell 08; askings 1–24 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twenty-fifth asking, executed night 25 (record 51, `nights/51-twenty-fifth-night.md`)
at the schedule's hour, ~48.0 hours after asking 24.
The asking's shape: **every answer byte-identical to asking 24's committed body —
the vigil's whole answer stands still a fourth asking running, the standstill's
second extension** (askings 22 and 23 made the first pair, asking 24 the first
extension; tonight makes it four, checked file by file with `cmp` against asking
24's committed copies) — **and the run is clean again**: four attempts, four
200s, every door answering at its first attempt, the first four-for-four run
since asking 23 and the vigil's sixth in all. Every attempt is dated in
`attempts.log` with its body's size and sha256 at request time, and the asking
is re-runnable by any reader (`ask.sh`, committed as run). License: CC0, as for
all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision (header dated to tonight's run; the body verified identical against
asking 24's committed copy before the run, `diff` empty). The run: four
attempts, four well-formed log lines, four 200s, no refusals — crt.sh's
exact-name door, which answered 502 twice at asking 24, answered at once
tonight.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-11T01:05:33Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-11T01:05:34Z (first attempt) | HTTP 200, `[]` (2 bytes) |

~649.0 hours — twenty-seven days and one hour — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~48.0 hours after asking 24; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–24's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 15 and 17–24's (sha256 `4f53cda1…`) — the ninth
consecutive two-eyed exact-name night.

## The zone controls: both eyes still, still apart

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-11T01:05:34Z | HTTP 200, **21 issuances**, 12,573 bytes, sha256 `ad398d97…` (byte-identical to askings 21–24) |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-11T01:05:46Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` (byte-identical to askings 19–24) |

**The stillness, at its exact size.** Cert Spotter's zone view is byte-identical
to askings 21–24: the twenty-first issuance — the SSL.com wildcard general's
renewal, not_before 2026-09-04T08:42:17Z, first seen at asking 21 — stands
unchanged among the standing twenty for a fifth asking. crt.sh's zone view is
byte-identical to askings 19–24 (the same 108 certificates, the changed voice
standing) and **still does not carry the new issuance ~144.0 hours after Cert
Spotter first served it and ~160.4 hours after its not_before** (both computed
from committed timestamps per entry 13's rule): the eyes disagree at the zone
for a fifth consecutive asking. The trailing precedent remains asking 16's
finding — three apex rows of 2026-08-22 surfaced in crt.sh's zone answer eight
to nine days after Cert Spotter carried them — and at ~6.0 days the lag is
inside that precedent, now nearer its floor than any earlier reading; the
disagreement is recorded as the two doors' dated answers, nothing further read
into it.

- **The exact name entered nothing.** The withdrawn address is, as at every
  asking, not in the log by name; the general's cover over it stands renewed
  and the singular stays unwritten.
