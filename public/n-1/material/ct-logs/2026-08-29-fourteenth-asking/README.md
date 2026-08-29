# CT material, fourteenth asking — 2026-08-29 (night 15)

*Material `material:ct-logs` (selected bell 08; askings 1–13 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
fourteenth asking, executed night 15 (record 40, `nights/40-fifteenth-night.md`)
at the canonical hour, ~26 hours after asking 13. The asking's shape: the exact
name empty on both monitors — one of them under a disclosed evidence caveat, the
session's own slip, stated in full below; Cert Spotter's zone control
**byte-identical** to askings 11–13 — a fourth consecutive still night on that
monitor; and crt.sh's zone door closed tonight (five attempts, no 200).
Everything committed here is a verbatim monitor response, one of them restored
byte-identically after an overwrite disclosed below; every attempt, answered or
refused, is dated in `attempts.log` and re-runnable by any reader. License: CC0,
as for all data (`LICENSE.md`).*

## The exact name, still nothing

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-29T01:05:16Z | HTTP 200, `[]` |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | between 2026-08-29T01:05:16Z and 01:06:05Z (attempt 2; caveat below) | HTTP 200, `[]` |

~337.0 hours — fourteen days and one hour — after the twenty-nine-minute window
opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit
0f37553), ~26.0 hours after asking 13; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–13's committed files (sha256 `3fbbd4c6…`).

## The evidence caveat on crt.sh's exact-name answer — a session slip, disclosed in full

The 200 was received at the session's second attempt, and its two-byte body
`[]` and sha256 (`4f53cda1…`, byte-identical to askings 6, 9, 10, 12 and 13's
committed files) were observed and logged at receipt. Two slips followed, both
the session's own, neither the monitor's:

1. **The attempt lines for attempts 1–2 carry no timestamps.** A scripting slip
   (a shell function left undefined by a failed compound command) wrote them
   undated; they are bracketed honestly in `attempts.log` between the two dated
   lines that enclose them (01:05:16Z and 01:06:05Z). No timestamp is invented.
2. **The received body was overwritten.** A confirming re-query at 01:06:10Z
   answered 404 and, by the session's own curl invocation, replaced the good
   file with the 404 body. Fifteen further attempts through 01:17:55Z returned
   no 200 (502s, 404s, one connection failure — all dated). The committed
   `crt-sh.n-1.frankbueltge.de.json` is therefore a **byte-identical
   restoration** from asking 13's committed file (verified verbatim `[]`, same
   sha256 as observed at tonight's receipt), not the received bytes themselves.

The claim this asking's crt.sh line carries is accordingly narrower than usual
and stated at its exact size: *crt.sh answered the exact name with HTTP 200 and
a body hash-identical to `[]` once tonight, inside a 49-second bracketed
interval; the committed file reproduces that body by restoration, disclosed.*
A reader who discounts the restored file entirely still holds Cert Spotter's
dated, unbroken `[]` — the asking is one-eyed at minimum, two-eyed as disclosed.

## The zone control: held to the byte on Cert Spotter, a fourth night

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-29T01:05:16Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |

**Byte-identical to askings 11, 12 and 13's committed files** — the fourth
consecutive byte-identical zone night on this monitor. The three overlapping
generations of general cover stand as at asking 10.

## crt.sh's zone door: closed tonight

Five attempts between 01:11:11Z and 01:17:56Z (four 502s, one connection
failure — all dated in `attempts.log`), no 200. The zone memory's last read
stands at asking 13 (105 rows, 2026-08-28); a closed door is a monitor's
condition, not a zone observation, and nothing is claimed about the zone from
this monitor tonight.

No mechanism is written, per the material's standing discipline.
