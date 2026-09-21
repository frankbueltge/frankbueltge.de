# CT material, twenty-eighth asking — 2026-09-20 (night 31)

*Material `material:ct-logs` (selected bell 08; askings 1–27 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of
the twenty-eighth asking, executed night 31 (record 57,
`nights/57-thirty-first-night.md`) at the schedule's hour, ~24.0 hours after
asking 27. **This asking is a confirmation, not a new movement.** Asking 27
(night 30, `material/ct-logs/2026-09-19-twenty-seventh-asking/`) found the
zone's fifth recorded movement and its first by loss — Cert Spotter's zone
view dropped its two oldest issuances, both expired a few hours before that
query — and left one thing unconfirmed, disclosed as such in its own
README: that crt.sh's unchanged row count *presumably* still carries the two
certificates Cert Spotter dropped, without directly locating them. Tonight
closes that gap. Every attempt is dated in `attempts.log` with its body's
size and sha256 at request time, and the asking is re-runnable by any reader
(`ask.sh`, committed as run). License: CC0, as for all data (`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

Tonight's `ask.sh` is night 18's committed procedure carried forward without
revision beyond its own header's dated comment. The run: four attempts, four
200s, every door at its first attempt.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-20T01:14:30Z | HTTP 200, `[]` (3 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-20T01:14:31Z (first attempt) | HTTP 200, `[]` (2 bytes) |

crt.sh's empty response is byte-identical to askings 15 and 17–27's
committed bodies (sha256 `4f53cda1…`) — the twelfth consecutive two-eyed
exact-name night. Cert Spotter's `[]` is the same empty array asking 27
already found reformatted compact rather than pretty-printed by the
monitor's own API (3 bytes tonight and at asking 27, against 4 bytes at
askings 4–26) — a serialization fact asking 27 established, not a new
finding tonight.

## The zone: unchanged in 24.0 hours, and the presumption confirmed

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-20T01:14:31Z | HTTP 200, **20 issuances**, 12,691 bytes, sha256 `e9e8d6d1…` — byte-identical to asking 27 |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-20T01:14:33Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` (byte-identical to askings 19–27) |

**No further movement.** Cert Spotter's zone view is unchanged from asking
27 (`cmp` clean); the loss asking 27 found has not been followed by any
further gain or loss in 24.0 hours.

**What asking 27 left as a presumption, checked directly tonight.** Asking
27 compared crt.sh's zone answer to asking 26's by row count and hash alone
(108 rows, unchanged), and inferred from that unchanged count that the two
certificates missing from Cert Spotter's view were "presumably" still among
crt.sh's rows — its own word, and its own disclosed limit: "nothing in this
asking re-derives crt.sh's individual rows to confirm that presumption
directly." Tonight does exactly that. Both certificates are located in
tonight's `crt-sh.frankbueltge.de.full.json` by their shared `not_before`
timestamps (matching Cert Spotter's own field for the same two
certificates, per asking 27):

| certificate | not_before | crt.sh row ids | crt.sh `not_after` |
|---|---|---|---|
| `www.frankbueltge.de` (Cert Spotter id `15491368679`) | 2026-06-20T22:09:17 | `27355426031`, `27355423729` | 2026-09-18T22:09:16Z |
| `frankbueltge.de` (Cert Spotter id `15491380698`) | 2026-06-20T22:10:48 | `27355447381`, `27355449472` | 2026-09-18T22:10:47Z |

Each certificate appears twice in crt.sh's rows, as every entry in this
zone's history has (paired precertificate and certificate, per the pattern
recorded since selection). The `not_after` values match asking 27's figures
exactly, to the second. **This is now a textual finding rather than an
inference**: the underlying CT logs, as crt.sh indexes them directly, still
hold both certificates unchanged; only Cert Spotter's own summarized
issuances view has stopped listing them. The distinction asking 27's own
README drew between "the CT logs themselves" and "a monitor's own summary
of them" is confirmed by direct lookup, not left resting on an unchanged
row count.

## What this asking does and does not claim

No name resembling `n-1.frankbueltge.de` or a withdrawn variant of it has
ever been issued a public certificate, as far as either monitor's index
reaches, across all twenty-eight askings — unchanged tonight. The zone
finding above is entirely about the two monitors' differing retention of
already-issued, already-expired certificates; it says nothing about the
exact name, which stays below the threshold at both eyes.
