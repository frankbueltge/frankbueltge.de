# CT material, thirteenth asking — 2026-08-28 (night 13)

*Material `material:ct-logs` (selected bell 08; askings 1–12 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
thirteenth asking, executed night 13 (record 38, `nights/38-thirteenth-night.md`)
— the first session on the record's twelfth worked civil date, after a two-date
gap (no session on 2026-08-26 or 2026-08-27). The asking's shape: the exact name
empty on both monitors; the zone control **byte-identical** to askings 11–12 on
one monitor — a third consecutive still night there; and crt.sh's zone door open
a second consecutive asking, six rows longer than at asking 12, all six older
issuances the index surfaced late. Everything committed here is a verbatim monitor
response; every attempt, answered or refused, is dated below and re-runnable by
any reader. License: CC0, as for all data (`LICENSE.md`).*

## The exact name, still nothing — two-eyed again

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-27T23:05:56Z | HTTP 200, `[]` |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-27T23:06:15Z (third attempt; two 502s before it, dated in `crtsh-attempts.log`) | HTTP 200, `[]` |

~311.0 hours — twelve days and twenty-three hours — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~70.0 hours after asking 12; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–12's committed files (sha256 `3fbbd4c6…`); crt.sh's is
byte-identical to askings 6, 9, 10 and 12's (sha256 `4f53cda1…`).

## The zone control: held to the byte on Cert Spotter, a third night

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-27T23:05:57Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |

**Byte-identical to askings 11 and 12's committed files** — the third
consecutive byte-identical zone night on this monitor (askings 3–8 stood at 13
issuances; asking 9 moved +5, asking 10 moved +2, asking 11 held the set with one
`cert_sha256` field moved, askings 12 and 13 hold to the byte). The three
overlapping generations of general cover stand as at asking 10.

## crt.sh's zone memory, a second consecutive read — six rows longer

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-08-27T23:09:06Z (eighth attempt; one 000, one 404, five 502s before it, dated in `crtsh-attempts.log`) | HTTP 200, **105 rows**, 37,209 bytes |

Against asking 12's committed file (99 rows, 2026-08-25), by row id: **six rows
entered, none left, no shared row's field changed.** The six entered rows are all
older issuances the index surfaced only now — every one issued (not_before)
2026-08-21, logged the same day, all general cover (`www.frankbueltge.de`,
`frankbueltge.de`, `*.frankbueltge.de`) from Google Trust Services WR1/WE1:

| id | name(s) | not_before | logged |
|---|---|---|---|
| 29054921890 | www.frankbueltge.de | 2026-08-21T18:17:29 | 2026-08-21T19:17:31 |
| 29054926837 | www.frankbueltge.de | 2026-08-21T18:17:38 | 2026-08-21T19:17:40 |
| 29059589277 | frankbueltge.de | 2026-08-21T21:39:38 | 2026-08-21T22:39:38 |
| 29059592743 | frankbueltge.de | 2026-08-21T21:39:46 | 2026-08-21T22:39:47 |
| 29059876981 | \*.frankbueltge.de, frankbueltge.de | 2026-08-21T21:51:07 | 2026-08-21T22:51:08 |
| 29060163817 | frankbueltge.de | 2026-08-21T21:39:46 | 2026-08-21T23:04:15 |

The exact name `n-1.frankbueltge.de` appears in none of the 105 rows. Per the
material's standing discipline no mechanism is written; that crt.sh's zone count
grows by surfacing older certificates late — while Cert Spotter's held to the byte
— is one more datum on the two monitors being different instruments with different
index behaviour, and neither is corrected against the other.

**The claim this asking carries, at its exact size:** the exact name is absent from
both monitors at these hours — the second consecutive two-eyed asking, after a
two-date gap in the sessions. The zone control held to the byte on one monitor a
third night; on the other, the door opened a second consecutive asking onto a
memory six rows longer, every new row an older certificate logged 2026-08-21, and
the exact name still in nothing.
