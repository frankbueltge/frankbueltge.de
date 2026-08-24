# CT material, eleventh asking — 2026-08-24 (night 11)

*Material `material:ct-logs` (selected bell 08; askings 1–10 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
eleventh asking, executed night 11 (record 36, `nights/36-eleventh-night.md`) —
the first on the record's tenth civil date. The asking's shape: the exact name
answered empty by the one monitor that answered at all; crt.sh's door shut
entirely — twelve refusals across both queries; and the zone control **held for
the first night since it began moving**: the same twenty issuances, none
entered, none left, with one field moved under an unchanged id. Everything
committed here is a verbatim monitor response; every attempt, answered or
refused, is dated below and re-runnable by any reader. License: CC0, as for all
data (`LICENSE.md`).*

## The exact name, still nothing — one-eyed tonight

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-24T01:06:41Z | HTTP 200, `[]` |
| — (not committed) | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-24T01:07:26Z–01:09:52Z | **refused: eight attempts, all 502**, dated in `crtsh-attempts.log`; no file committed because no answer was given |

~217.0 hours — nine days and one hour — after the twenty-nine-minute window
opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit
0f37553), ~24.0 hours after asking 10; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–10's committed files (sha256
`3fbbd4c6d76130399b0c79cd…`). The third one-eyed asking of the ledger's eleven.

## The zone control: held — the first unmoved night since the movements began

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-24T01:06:52Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |

Against asking 10's 20 issuances / 11,949 bytes / sha256 `a0155444…`: **the
issuance set is identical** — same twenty ids, same order, none entered, none
left — after two consecutive nights of movement (asking 9: +5; asking 10: +2).
The response is nonetheless not byte-identical: in the entry with id
16673888257 — one of the two apex-only issuances of 2026-08-22T01:19Z that
entered between askings 9 and 10 — the monitor's `cert_sha256` field reads
`79e5e2f4…` tonight against `0d9ae2c8…` in asking 10's committed file, while
every name, issuer, id and validity field of all twenty entries is unchanged
(the field-level diff is re-derivable from the two committed files). Per the
material's standing discipline no mechanism is written: the monitor's record of
one issuance changed under an unchanged id, and that is the whole claim. The
three overlapping generations of general cover stand as at asking 10.

## crt.sh: both doors shut

Twelve refusals in all, every one 502 from the service's front proxy, every one
dated in `crtsh-attempts.log` as the retry loops ran: eight on the exact name
(01:07:26–01:09:52Z), four on the zone (01:10:21–01:11:09Z). **No crt.sh file
is committed because no response was given, and nothing is substituted for
it.** The third asking's committed crt.sh zone file remains the only committed
crt.sh zone evidence.

**The claim this asking carries, at its exact size:** the exact name is absent
from the one monitor that answered at these hours; the second monitor refused
every query. The zone control, taken through the answering monitor, held still
for the first night in three.
