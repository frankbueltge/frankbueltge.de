# CT material, fifteenth asking — 2026-08-30 (night 16)

*Material `material:ct-logs` (selected bell 08; askings 1–14 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
fifteenth asking, executed night 16 (record 41, `nights/41-sixteenth-night.md`)
at the canonical hour, ~24 hours after asking 14. The asking's shape: the exact
name empty on both monitors — both received bodies committed verbatim tonight,
no caveat; Cert Spotter's zone control **byte-identical to askings 11–14** — a
fifth consecutive still night on that monitor; and crt.sh's zone door closed a
second consecutive night (eight attempts, no 200). Every attempt, answered or
refused, is dated in `attempts.log` with its body's size and sha256, and
re-runnable by any reader. License: CC0, as for all data (`LICENSE.md`).*

## The procedure, revised after night 15's slips

Night 15's two evidence slips (`../2026-08-29-fourteenth-asking/README.md`) were
the session's own: undated attempt lines from a failed shell construct, and a
received body overwritten by a confirming re-query. Tonight's procedure removes
both failure modes rather than promising care: **the same function that makes
each request writes its dated log line** (no attempt can be undated), and
**every attempt's body goes to its own numbered file** (no attempt can overwrite
another). The 200 bodies were then copied verbatim to the canonical filenames
below; non-200 bodies (502/404 error pages, hashed in the log) are not
committed. The log's `raw-…-N` names record which attempt each canonical file
preserves.

## The exact name, still nothing — two-eyed, no caveat

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-30T01:04:23Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-30T01:07:14Z (attempt 4; attempts 1–3 answered 502, 502, 404, all dated) | HTTP 200, `[]` (2 bytes) — **the received bytes, committed** |

~361.0 hours — fifteen days and one hour — after the twenty-nine-minute window
opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit
0f37553), ~24.0 hours after asking 14; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–14's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to askings 6, 9, 10, 12 and 13's committed files and to
asking 14's disclosed restoration (sha256 `4f53cda1…`).

## The zone control: held to the byte on Cert Spotter, a fifth night

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-30T01:04:23Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |

**Byte-identical to askings 11, 12, 13 and 14's committed files** — the fifth
consecutive byte-identical zone night on this monitor. The three overlapping
generations of general cover stand as at asking 10.

## crt.sh's zone door: closed a second consecutive night

Eight attempts between 01:04:24Z and 01:10:55Z (five 502s, one 60-second
timeout logged `http=000`, two 404s — all dated in `attempts.log`; the 404 body
is the server's plain not-found page, hashed in the log, not a zone answer).
No 200. The zone memory's last read stands at asking 13 (105 rows, 2026-08-28);
a closed door is a monitor's condition, not a zone observation, and nothing is
claimed about the zone from this monitor tonight.

No mechanism is written, per the material's standing discipline.
