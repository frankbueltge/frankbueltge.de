# CT material, twenty-second asking — 2026-09-06 (night 22)

*Material `material:ct-logs` (selected bell 08; askings 1–21 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twenty-second asking, executed night 22 (record 48, `nights/48-twenty-second-night.md`)
at the schedule's hour, ~24.0 hours after asking 21.
The asking's shape: **every door answered at its first attempt — four attempts,
four 200s, the vigil's fourth four-for-four run, the fourth in succession — and
every answer byte-identical to asking 21's committed body: the moved eye's first
still night at its new state.** Cert Spotter's zone holds the 21 issuances that
asking 21 first saw; crt.sh's zone still does not carry the new issuance — the
eyes disagree at the zone a second consecutive asking. Every attempt is dated
in `attempts.log` with its body's size and sha256 at request time, and the
asking is re-runnable by any reader (`ask.sh`, committed as run). License: CC0,
as for all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision (header dated to tonight's run; the body verified identical against
asking 21's committed copy before the run, `diff` empty). The run is clean:
four attempts, four well-formed log lines, no refusals.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-06T01:05:31Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-06T01:05:32Z (first attempt) | HTTP 200, `[]` (2 bytes) |

~529.0 hours — twenty-two days and one hour — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~24.0 hours after asking 21; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–21's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 15 and 17–21's (sha256 `4f53cda1…`) — the sixth
consecutive two-eyed exact-name night.

## The zone controls: the moved eye holds its new state; the trailing eye still trails

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-06T01:05:31Z | HTTP 200, **21 issuances**, 12,573 bytes, sha256 `ad398d97…` (byte-identical to asking 21) |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-06T01:06:04Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` (byte-identical to askings 19–21) |

**The stillness, at its exact size.** Cert Spotter's zone view is byte-identical
to asking 21's committed file: the twenty-first issuance — the SSL.com wildcard
general's renewal, not_before 2026-09-04T08:42:17Z, first seen last night —
stands unchanged among the standing twenty; a movement observed once and now
held. crt.sh's zone view is byte-identical to askings 19–21 (the same 108
certificates, the changed voice standing) and **still does not carry the new
issuance ~24.0 hours after Cert Spotter first served it and ~40.4 hours after
its not_before** (both computed from committed timestamps per entry 13's rule):
the eyes disagree at the zone for a second consecutive asking. The trailing precedent remains asking 16's finding —
three apex rows of 2026-08-22 surfaced in crt.sh's zone answer eight to nine
days after Cert Spotter carried them — and the disagreement is recorded as the
two doors' dated answers, nothing further read into it.

- **The exact name entered nothing.** The withdrawn address is, as at every
  asking, not in the log by name; the general's cover over it stands renewed
  while the singular stays unwritten.
- No mechanism or motive is written for either door's cadence: the evidence
  carries names, issuers and timestamps, nothing else, per the material's
  standing discipline (entry 05 §3's bar).
