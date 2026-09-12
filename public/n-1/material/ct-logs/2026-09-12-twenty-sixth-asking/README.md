# CT material, twenty-sixth asking — 2026-09-12 (night 26)

*Material `material:ct-logs` (selected bell 08; askings 1–25 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twenty-sixth asking, executed night 26 (record 52, `nights/52-twenty-sixth-night.md`)
at the schedule's hour, ~24.0 hours after asking 25.
The asking's shape: **the standstill ends at four askings — one eye moved.**
Cert Spotter's zone answer changed for the first time since asking 21: a
twenty-second issuance entered, a Let's Encrypt renewal of the standing
singular `stats.frankbueltge.de`; the other three answers stand byte-identical
to asking 25's committed bodies (checked with `cmp`). The exact name entered
nothing. Every attempt is dated in `attempts.log` with its body's size and
sha256 at request time, and the asking is re-runnable by any reader (`ask.sh`,
committed as run). License: CC0, as for all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision (header dated to tonight's run; the body verified identical against
asking 25's committed copy before the run, `diff` empty). The run: seven
attempts, four 200s. crt.sh's exact-name door refused three times — first a
sixty-second timeout receiving nothing (http 000, zero bytes; the vigil's
second zero-byte timeout, the first at asking 15's zone door, 2026-08-30),
then the known 502 page twice (150 bytes, sha256 `61b30d40…`, byte-identical
to the page askings 15–18 and 24 logged) — before its 200 at the fourth
attempt. The other three doors answered at their first attempt.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-12T01:03:45Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-12T01:05:30Z (fourth attempt) | HTTP 200, `[]` (2 bytes) |

~673.0 hours — twenty-eight days and one hour — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~24.0 hours after asking 25; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–25's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 15 and 17–25's (sha256 `4f53cda1…`) — the tenth
consecutive two-eyed exact-name night.

## The zone: one eye moves — the singular beside the withdrawn name renews

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-12T01:03:45Z | HTTP 200, **22 issuances**, 13,159 bytes, sha256 `1e77ab17…` — **changed from askings 21–25** |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-12T01:05:42Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` (byte-identical to askings 19–25) |

**The movement, at its exact size.** The whole answer's standstill — every
file byte-identical across askings 22–25 — ends at four askings: Cert
Spotter's zone view gained a **twenty-second issuance** (id `17111956924`), a
Let's Encrypt certificate for exactly one name, `stats.frankbueltge.de`,
not_before 2026-09-11T02:50:06Z, not_after 2026-12-10T02:50:05Z, seen tonight
~22.2 hours after its not_before. The standing twenty-one issuances stand
unchanged within the answer (checked by id; none left). This is the zone's
**fourth recorded movement** (2026-08-21, the wildcard general's renewal;
2026-08-22, two apex-only issuances; 2026-09-04, the SSL.com wildcard
general's renewal) and **the first renewal of a singular** — a single-name
certificate — in the vigil's view: `stats.frankbueltge.de` is a standing name,
carried by three Let's Encrypt issuances of 2026-07-11 expiring
2026-10-09T16:06, and the renewal falls ~28.6 days before that expiry (the
wildcard's August renewal came ~31 days before its pair lapsed). The
not_before falls between night 25's session and tonight's: the certificate
did not exist at asking 25's hour and was first askable tonight.

**The lag, still open.** crt.sh's zone view is byte-identical to askings
19–25: it still does not carry the SSL.com general's renewal **~168.0 hours —
7.0 days — after Cert Spotter first served it and ~184.4 hours after its
not_before** (both computed from committed timestamps per entry 13's rule),
the eyes disagreeing at the zone a sixth consecutive asking, the lag inside
asking 16's eight-to-nine-day precedent. Tonight's stats renewal is likewise
absent from crt.sh's answer, ~22.2 hours old — recorded as a fact, no lag
read into an interval shorter than every precedent.

- **The exact name entered nothing.** Around the withdrawn address the zone
  renews itself — the generals in August and September, a singular tonight —
  and the singular for `n-1.frankbueltge.de` stays unwritten: the general's
  cover over it stands, and what was withdrawn stays below the threshold.
