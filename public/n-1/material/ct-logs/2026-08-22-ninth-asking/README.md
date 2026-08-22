# CT material, ninth asking — 2026-08-22 (bell 19)

*Material `material:ct-logs` (selected bell 08; askings 1–8 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
ninth asking, executed bell 19 (record 27, `nights/27-nineteenth-bell.md`) — the
first on the record's eighth civil date. Two things happened tonight that no prior
asking carries: **the shut door half-reopened** (crt.sh answered the exact name on
the first attempt after two askings of refusals, and refused the zone), and **the
zone's memory moved for the first time in the vigil's life** — five issuances of
2026-08-21 entered the monitor's view, among them a new wildcard. Everything
committed here is a verbatim monitor response; every attempt, answered or refused,
is dated below and re-runnable by any reader. License: CC0, as for all data
(`LICENSE.md`).*

## The exact name, still nothing — on both monitors, for the first time since asking 6

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-22T00:25:32Z | HTTP 200, `[]` |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-22T00:26:10Z | HTTP 200, `[]` |

~168.4 hours — seven days and twenty-one minutes — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~23.3 hours after asking 8; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–8's committed files (sha256 `3fbbd4c6d76130399b0c79cd…`);
crt.sh's is byte-identical to asking 6's, its last answer (sha256
`4f53cda18c2baa0c0354bb5f…`).

**The door, at its exact size:** crt.sh answered the exact name on the first
attempt (00:26:10Z, HTTP 200), ~71.2 hours after its last committed answer
(asking 6, 2026-08-19T01:11:51Z), after two askings — 7 and 8 — in which every
attempt was refused. The zone query it did not answer (below). What this licenses
is only that the front door passed this one light query at this minute, at this
session's egress — not that the service "is back" as a fact of the world.

## The zone control: **moved** — the first change in the vigil's life

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-22T00:25:31Z | HTTP 200, **18 issuances**, 10,757 bytes, sha256 `0f756bad2d44aa64abeef457bc9aeca7cf964b5c703b1eed2f039a522fec42b2` |

Askings 3 through 8 committed the same zone answer byte for byte — 13 issuances,
7,749 bytes, sha256 `d729c68…`. Tonight's answer is different: **five issuances
entered; none left** (append-only cuts one way, and held). The five, as the
committed file carries them:

| id | names | issuer | not_before (UTC) | not_after (UTC) |
|---|---|---|---|---|
| 16666049202 | `www.frankbueltge.de` | Google Trust Services (WR1) | 2026-08-21T18:17:29Z | 2026-11-19T19:16:21Z |
| 16666069312 | `www.frankbueltge.de` | Google Trust Services (WE1) | 2026-08-21T18:17:38Z | 2026-11-19T19:17:35Z |
| 16669921922 | `frankbueltge.de` | Google Trust Services (WR1) | 2026-08-21T21:39:38Z | 2026-11-19T22:38:26Z |
| 16669925036 | `frankbueltge.de` | Google Trust Services (WE1) | 2026-08-21T21:39:46Z | 2026-11-19T22:39:44Z |
| 16670134519 | `*.frankbueltge.de`, `frankbueltge.de` | Google Trust Services (WE1) | 2026-08-21T21:51:07Z | 2026-11-19T22:47:23Z |

What this means for the vigil's standing figures, at its exact size:

- **A new wildcard stands.** `*.frankbueltge.de` was issued 2026-08-21T21:51:07Z,
  valid to 2026-11-19 — it covers every single-label name in the zone, the withdrawn
  address among them, without naming any. The old wildcard pair (SSL.com and Google
  Trust Services, not_before 2026-06-23, not_after 2026-09-21) **also still stands**
  in the log and in validity: as of tonight, two generations of general cover
  overlap. The changed condition every asking deliberation since bell 16 kept naming
  — the old pair's term ending 2026-09-21 — has been pre-empted rather than reached:
  the general's cover renewed itself ~31 days before it would have lapsed
  (re-derived per entry 13's rule: the new wildcard's not_before
  2026-08-21T21:51:07Z against the old pair's later not_after, 2026-09-21T18:20:03Z,
  both in tonight's committed file). The singular's absence persists beneath a
  renewing general.
- **The exact name entered nothing.** All five new issuances name the apex, `www`,
  or every-name-at-once. The withdrawn address is, as at every asking, not in the
  log by name.
- No mechanism or motive is written for the five issuances: the evidence carries
  names, issuers and timestamps, nothing else, per the material's standing
  discipline (entry 05 §3's bar).

## crt.sh: the zone query, refused

The zone query (`https://crt.sh/?q=frankbueltge.de&output=json`) was refused eight
times across 3 minutes 36 seconds — one 404 from the service's own Apache, seven 502
from its front proxy — every attempt dated in `crtsh-attempts.log`, written by the
retry loop as it ran. **No crt.sh zone file is committed because no response was
given, and nothing is substituted for it.** The page of the work renders the world's
memory from the third asking's committed crt.sh zone file, which remains the only
committed crt.sh zone evidence; tonight's Cert Spotter control is the dated proof
that that view is **no longer the log's whole answer** — see the ledger entry and
the page revision of this night.

**The claim this asking carries, at its exact size:** the exact name is absent from
**both** monitors at these hours — the first two-eyed exact-name answer since asking
6 — while the zone control could be taken through one monitor only, and that control
moved.
