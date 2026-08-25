# CT material, twelfth asking — 2026-08-25 (night 12)

*Material `material:ct-logs` (selected bell 08; askings 1–11 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twelfth asking, executed night 12 (record 37, `nights/37-twelfth-night.md`) —
the first on the record's eleventh civil date. The asking's shape: the exact
name empty on both monitors; the zone control **byte-identical** to asking 11 —
the first unchanged-to-the-byte zone night since the movements began; and
crt.sh's zone door open for the first time since asking 3 — nine days of
refusals ended, and its zone memory read for a second time. Everything
committed here is a verbatim monitor response; every attempt, answered or
refused, is dated below and re-runnable by any reader. License: CC0, as for all
data (`LICENSE.md`).*

## The exact name, still nothing — two-eyed tonight

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-25T01:05:14Z | HTTP 200, `[]` |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-25T01:06:23Z (third attempt; one 404, one 502 before it, dated in `crtsh-attempts.log`) | HTTP 200, `[]` |

~241.0 hours — ten days and one hour — after the twenty-nine-minute window
opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit
0f37553), ~24.0 hours after asking 11; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–11's committed files (sha256
`3fbbd4c6d76130399b0c79cd…`); crt.sh's is byte-identical to askings 6, 9 and
10's (sha256 `4f53cda18c2baa0c…`).

## The zone control: held to the byte

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-25T01:05:14Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |

**Byte-identical to asking 11's committed file** — the first byte-identical
zone night since asking 8 closed the still era (askings 3–8 stood at 13
issuances; asking 9 moved +5, asking 10 moved +2, asking 11 held the set with
one `cert_sha256` field moved). The field that moved between askings 10 and 11
(id 16673888257's `cert_sha256`) tonight reads as asking 11 read it: the moved
value held. The three overlapping generations of general cover stand as at
asking 10.

## crt.sh's zone memory, read for the second time — nine days after the first

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-08-25T01:06:25Z (first attempt) | HTTP 200, **99 rows**, 35,136 bytes |

The same query was last answered at asking 3 (2026-08-16, 98 rows — the
ledger's only prior committed crt.sh zone evidence); every asking between
refused it (asking 9: eight refusals; asking 10: eight; asking 11: four).
Against asking 3's committed file, by row id: **one row entered, none left, no
shared row's field changed.** The entered row: id 29007149565, common name
`www.frankbueltge.de`, issued (not_before) 2026-08-21T18:17:38, logged
2026-08-21T19:47:14, issuer Google Trust Services WE1. The exact name
`n-1.frankbueltge.de` appears in none of the 99 rows. Per the material's
standing discipline no mechanism is written; the two monitors' zone views are
different instruments with different match rules, and neither is corrected
against the other.

**The claim this asking carries, at its exact size:** the exact name is absent
from both monitors at these hours — the first asking since the ninth on which
both answered it, and the first since the third on which both also answered
the zone. The zone control held to the byte on one monitor; on the other, nine
days of refusals opened onto a memory one row longer than it was, the new row
dated to the same civil date as asking 9's entrants, and the exact name still
in nothing.
