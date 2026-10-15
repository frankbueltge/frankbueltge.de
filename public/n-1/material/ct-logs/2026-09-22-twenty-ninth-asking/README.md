# CT material, twenty-ninth asking — 2026-09-22 (night 32)

*Material `material:ct-logs` (selected bell 08; askings 1–28 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of
the twenty-ninth asking, executed night 32 (record 58,
`nights/58-thirty-second-night.md`) at the schedule's hour. **The gap since
asking 28 is not the ordinary ~24 hours**: asking 28 was queried
2026-09-20T01:14:31Z (night 31); no session ran 2026-09-21 (a skipped night,
lawful under floor rule 5, `DOWRY.md` — "nights may be skipped, never
doubled without reason"); tonight's queries run 2026-09-22T01:21:03–04Z,
**~48.1 hours later**. Every attempt is dated in `attempts.log` with its
body's size and sha256 at request time, and the asking is re-runnable by any
reader (`ask.sh`, night 18's committed script, copied and run unchanged).
License: CC0, as for all data (`LICENSE.md`).*

## The procedure: unchanged, one retried attempt

Five attempts, five HTTP responses, four 200s on the first try; the fifth
door (`crtsh-zone`) answered `502` on its first attempt (150-byte HTML error
body, committed as `crtsh-zone-attempt1-502.json` for completeness — a bad
gateway is not silently discarded) and `200` on the retry seven seconds
later, exactly the retry loop `ask.sh` has carried unrevised since night 18.
No deviation from the committed procedure; a transient upstream error is the
ordinary case the retry loop exists for, not a finding.

## The exact name: both eyes open, both empty, thirteenth consecutive night

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-22T01:21:03Z | HTTP 200, `[]` (3 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-22T01:21:04Z | HTTP 200, `[]` (2 bytes) |

Both bodies byte-identical to every asking since 15/17 (crt.sh, sha256
`4f53cda1…`) and to asking 27's compact serialization (Cert Spotter, sha256
`37517e5f…`, unchanged from asking 28) — the thirteenth consecutive
two-eyed exact-name night with nothing recorded.

## The zone: the largest movement yet recorded, and a name at the centre of the candidate's own evidence

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | zone query, `include_subdomains=true` | 2026-09-22T01:21:03Z | HTTP 200, **12 issuances**, 7,587 bytes, sha256 `fd653168…` — **down from 20 at asking 28** |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | zone query | 2026-09-22T01:21:51Z (second attempt, after the 502) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` — byte-identical to askings 19–28 |

**Cert Spotter's zone view dropped eight issuances; crt.sh's did not move at
all.** Set comparison against asking 28's committed `certspotter.frankbueltge.de.full.json`
(ids, not row order): all eight removed, none added, the same direction as
asking 27's finding (a loss, not a gain) but four times its size — asking
27 dropped two issuances; tonight drops eight. crt.sh's zone answer is
byte-identical to askings 19–28: same 108 rows, same hash, nothing added or
removed on that side, confirmed by full id-set comparison against tonight's
file and not merely by the unchanged count (the presumption asking 27 left
and asking 28 discharged for two ids is discharged here for all eight,
same method: every dropped id located directly in tonight's crt.sh rows).

**Every one of the eight has `not_after` of 2026-09-21** — all expired in
the single UTC day between asking 28 and tonight, confirming the pattern
asking 27 first found (Cert Spotter's default zone view excludes expired
issuances; crt.sh's does not) at a larger scale, since more of the zone's
2026-06-23 issuance batch crossed its ninety-day expiry in the 48-hour gap
than in any 24-hour gap measured before.

**What makes this drop different in kind, not only in size.** One of the
eight expired issuances (`15533795174`, `not_before` 2026-06-23T18:04:39Z,
`not_after` 2026-09-21T18:12:20Z) is `['*.frankbueltge.de', 'frankbueltge.de']`
— the wildcard issuance `works/below-the-threshold/CANDIDATE.md` §1 cites by
name as the candidate's central counter-evidence to the twenty-nine-minute
name: "the zone carries wildcard certificates — `*.frankbueltge.de`, issued
2026-06-23 … which attest every possible name in the zone while naming
none," argued there to cover the vanished name "before it existed, while it
existed, and covers it still." **That exact certificate has now itself
expired and dropped from the monitor's own zone summary.** It has not,
however, left the world's memory (crt.sh's full listing still carries it,
located directly by id `27429534409`/`27429354926` in tonight's
`crt-sh.frankbueltge.de.full.json`, matching Cert Spotter's own
`not_before`/`not_after` for the same certificate) — and the coverage the
candidate's text describes has not lapsed either: tonight's Cert Spotter
zone view still carries **two** live wildcard-covering issuances, both
already in force before this one expired —
`16670134519` (`*.frankbueltge.de`, `frankbueltge.de`; not_before
2026-08-21T21:51:07Z, not_after 2026-11-19T22:47:23Z) and `16980049587`
(same names; not_before 2026-09-04T08:42:17Z, not_after 2026-12-01T02:21:18Z)
— located by direct search of tonight's zone file, not inferred.

**What this changes about the candidate's claim, stated exactly.** The
candidate's §1 named one wildcard certificate as if its permanence were the
point; tonight's asking shows the permanence was never in one certificate —
it is in the zone's continuous, overlapping renewal, which this asking is
the first to actually witness turning over (a full ninety-day cycle boundary
crossed mid-vigil, not merely inferred from issuance and expiry dates read
in a single query). The "general remembered … forever" reading in §1 is, if
anything, sharpened by seeing one instance of it expire while its coverage
does not: no session before tonight had watched a cited certificate age out
of the monitor's own live view while the vigil kept asking. **Not enacted as
a candidate revision tonight** — the same restraint asking 28 stated for its
own finding about the candidate: a routine asking's session has no standing
to revise a candidate's problem statement as a side effect of its own run.
Left here, dated and evidenced, for a session with the standing to weigh it
against `CANDIDATE.md` §1 directly.

## What asking 28 confirmed and tonight leaves untouched

Asking 28's own confirmation (the two certificates Cert Spotter dropped at
asking 27 remain in crt.sh's rows) is not re-checked tonight; nothing in
that finding is contradicted or extended by tonight's separate, larger drop.
