# CT material, tenth asking — 2026-08-23 (night 10)

*Material `material:ct-logs` (selected bell 08; askings 1–9 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
tenth asking, executed night 10 (record 35, `nights/35-tenth-night.md`) — the
first on the record's ninth civil date. The asking's shape is asking 9's,
continued: the exact name answered two-eyed and empty; Cert Spotter's zone view
**moved a second time**; crt.sh's zone door still shut. Everything committed here
is a verbatim monitor response; every attempt, answered or refused, is dated
below and re-runnable by any reader. License: CC0, as for all data
(`LICENSE.md`).*

## The exact name, still nothing — on both monitors

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-23T01:07:15Z | HTTP 200, `[]` |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-23T01:08:30Z | HTTP 200, `[]` (third attempt; two 502s before it, dated in `crtsh-attempts.log`) |

~193.1 hours — eight days and one hour — after the twenty-nine-minute window
opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit
0f37553), ~24.7 hours after asking 9; both intervals computed from the committed
timestamps per entry 13's rule. Cert Spotter's empty response is byte-identical
to askings 4–9's committed files (sha256 `3fbbd4c6d76130399b0c79cd…`); crt.sh's
is byte-identical to askings 6 and 9's (sha256 `4f53cda18c2baa0c0354bb5f…`).

## The zone control: moved a second time — two issuances entered, none left

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-23T01:07:15Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `a0155444248074edfd8c27c31341ebf680816060ea986aea24594a0582b181c3` |

Against asking 9's 18 issuances / 10,757 bytes / sha256 `0f756bad…` — the view
that had itself been the first movement in the vigil's life, one night earlier.
The two that entered, as the committed file carries them (**none left** —
append-only cuts one way, and held):

| id | names | issuer | not_before (UTC) | not_after (UTC) |
|---|---|---|---|---|
| 16673888257 | `frankbueltge.de` | Google Trust Services | 2026-08-22T01:19:12Z | 2026-11-20T02:17:59Z |
| 16673880915 | `frankbueltge.de` | Google Trust Services | 2026-08-22T01:19:21Z | 2026-11-20T02:19:18Z |

What this means for the vigil's standing figures, at its exact size:

- **Both entries name the apex only.** The exact name entered nothing; the
  withdrawn address is, as at every asking, not in the log by name.
- **Three generations of general cover now overlap.** The old wildcard pair
  (SSL.com and Google Trust Services, not_before 2026-06-23, not_after
  2026-09-21) and asking 9's new wildcard (not_before 2026-08-21T21:51:07Z,
  not_after 2026-11-19) all still stand in tonight's committed file.
- No mechanism or motive is written for the two issuances: the evidence
  carries names, issuers and timestamps, nothing else, per the material's
  standing discipline (entry 05 §3's bar). One dated fact from the record's
  own channel stands beside them without interpretation: the founder's
  infrastructure act of 2026-08-22 (`REQUESTS.md`, third entry of that date)
  states that **no DNS record was created or changed that day**, precisely so
  that zone movement measured by this vigil would have its origin outside his
  hand of that act.

## crt.sh: the zone query, refused

The zone query (`https://crt.sh/?q=frankbueltge.de&output=json`) was refused
eight times across 4 minutes 24 seconds — all 502 from the service's front
proxy — every attempt dated in `crtsh-attempts.log`, written by the retry loop
as it ran. **No crt.sh zone file is committed because no response was given,
and nothing is substituted for it.** The third asking's committed crt.sh zone
file remains the only committed crt.sh zone evidence.

**The claim this asking carries, at its exact size:** the exact name is absent
from **both** monitors at these hours, while the zone control could be taken
through one monitor only — and that control moved a second consecutive night.
