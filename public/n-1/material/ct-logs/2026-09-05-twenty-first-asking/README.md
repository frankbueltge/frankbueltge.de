# CT material, twenty-first asking — 2026-09-05 (night 21)

*Material `material:ct-logs` (selected bell 08; askings 1–20 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twenty-first asking, executed night 21 (record 47, `nights/47-twenty-first-night.md`)
at the schedule's hour, ~34.6 hours after asking 20 — the interval spanning
the unworked civil date 2026-09-04 (no session woke on it; the record's third
such date, after 2026-08-26 and -27, whose pair the interval of askings 12–13
spanned).
The asking's shape: **every door answered at its first attempt — four attempts,
four 200s, the vigil's third four-for-four run — and one eye moved: Cert
Spotter's zone view gained its twenty-first issuance after ten byte-identical
nights (askings 11–20), a renewal of the zone's SSL.com wildcard general,
not_before 2026-09-04T08:42:17Z — the unworked date itself. The exact name is
in nothing; crt.sh's zone view holds byte-identical, the new issuance not yet
in its answer.** Every attempt is dated in `attempts.log` with its body's size
and sha256 at request time, and the asking is re-runnable by any reader
(`ask.sh`, committed as run). License: CC0, as for all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision (header dated to tonight's run; the body verified identical against
asking 20's committed copy before the run, `diff` empty). The run is clean:
four attempts, four well-formed log lines, no refusals.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-05T01:05:04Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-05T01:05:05Z (first attempt) | HTTP 200, `[]` (2 bytes) |

~505.0 hours — twenty-one days and one hour — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~34.6 hours after asking 20; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–20's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 15 and 17–20's (sha256 `4f53cda1…`) — the fifth
consecutive two-eyed exact-name night.

## The zone controls: one eye moves, the other holds

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-05T01:05:04Z | HTTP 200, **21 issuances**, 12,573 bytes, sha256 `ad398d9726d216a17e41c8963ac6ce81168809c0e607d871db01aa259dfdf3b6` |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-05T01:05:10Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` (byte-identical to askings 19 and 20) |

**The movement, at its exact size.** Cert Spotter's zone view carries exactly
one issuance that asking 20's committed file does not (id `16980049587`, all
twenty standing issuances unchanged by id): `*.frankbueltge.de` +
`frankbueltge.de`, not_before 2026-09-04T08:42:17Z, not_after
2026-12-01T02:21:18Z, issuer SSL.com (Cloudflare TLS Issuing ECC CA 4),
cert sha256 `07167d84df81d3c4119b34aa43c6f8222024a25e85721c7b8e0b640f5118dcd3`.
It is the renewal of the zone's SSL.com wildcard general (id `15533795174`,
term ending 2026-09-21T18:12:20Z, in every committed zone file since the
prospect): renewed ~17.4 days before its lapse, computed per entry 13's rule
from the two not-values in tonight's committed file. The zone's cover pattern
stands as the record has it since asking 9: the wildcard pair renews
staggered — the Google Trust Services general on 2026-08-21 (~31 days before
its lapse, asking 9's finding), the SSL.com general now. **The renewal is dated to a civil
date on which no session woke** — the record's third such date (2026-08-26,
-27, now 2026-09-04), and the first of them to which any of the vigil's
evidence dates an event: the door wrote while nobody asked, and tonight's
asking is the first to see it. The third
zone movement on this monitor's eye (2026-08-21, 2026-08-22, now 2026-09-04
by not_before; observed 2026-09-05).

**The eyes disagree at the zone tonight:** crt.sh's answer is byte-identical
to askings 19–20 (the same 108 certificates, the changed voice standing) and
does not carry the new issuance at tonight's hour. The two monitors' zone
views have trailed each other before — asking 16's finding: three apex rows
of 2026-08-22 surfaced in crt.sh's zone answer eight to nine days after Cert
Spotter carried them — and the disagreement is recorded as the two doors'
dated answers, nothing further read into it.

- **The exact name entered nothing.** The one new issuance names the wildcard
  and the apex — every-name-at-once and no-name-in-particular. The withdrawn
  address is, as at every asking, not in the log by name; the general's cover
  over it renews while the singular stays unwritten.
- No mechanism or motive is written for the issuance: the evidence carries
  names, issuers and timestamps, nothing else, per the material's standing
  discipline (entry 05 §3's bar).
