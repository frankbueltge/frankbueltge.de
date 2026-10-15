# CT material, twenty-seventh asking — 2026-09-19 (night 30)

*Material `material:ct-logs` (selected bell 08; askings 1–26 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
twenty-seventh asking, executed night 30, ~168.1 hours (7.0 days) after asking
26 — three sessions (27, 28, 29) skipped the front in a row, each on its own
one-night reasoning; this is the first asking since. The asking's shape:
**the zone view loses two issuances for the first time — not a standstill
breaking by addition, but by expiry.** Every attempt is dated in
`attempts.log` with its body's size and sha256 at request time, and the
asking is re-runnable by any reader (`ask.sh`, committed as run, night 18's
procedure carried forward unchanged — verified identical to asking 26's
committed copy by `diff` before the run). License: CC0, as for all data
(`LICENSE.md`).*

## The procedure: night 18's committed script, unchanged

The run: four attempts, four 200s, every door at its first attempt — the
cleanest run since asking 23 (the vigil's seventh four-for-four; no retry
loop entered for either crt.sh door).

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-19T01:06:52Z | HTTP 200, `[]` (3 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-19T01:06:53Z (first attempt) | HTTP 200, `[]` (2 bytes) |

crt.sh's exact answer is byte-identical to askings 15 and 17–26's committed
files (sha256 `4f53cda1…`) — the eleventh consecutive two-eyed exact-name
night. Cert Spotter's exact answer is the same empty array as every prior
asking but re-wrapped by the API across two lines (`[`, newline, `]`,
newline — 4 bytes at askings 4–26; `[]` on one line, 3 bytes, tonight) —
logged as a formatting difference in the API's own serialization, not a
content change: both parse to an empty JSON array, and the query, domain and
subdomain scope are unchanged. ~841.0 hours (35.04 days) after the
twenty-nine-minute window opened (created 2026-08-15T00:04:11Z, commit
7fc20ac; deleted 00:33:42Z, commit 0f37553), ~168.1 hours after asking 26;
both intervals computed from the committed timestamps per entry 13's rule.

## The zone: the standstill breaks by loss, not by gain

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-19T01:06:53Z | HTTP 200, **20 issuances**, 12,691 bytes, sha256 `e9e8d6d1…` — **changed from asking 26** |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-19T01:06:54Z (first attempt) | HTTP 200, **108 rows**, 33,493 bytes, sha256 `4c1ba2b1…` (byte-identical to askings 19–26) |

**The movement, at its exact size.** Cert Spotter's zone view dropped from 22
to 20 issuances: compared by id against asking 26's committed file
(`2026-09-12-twenty-sixth-asking/certspotter.frankbueltge.de.full.json`),
none were added and exactly two left — `15491368679`
(`www.frankbueltge.de`) and `15491380698` (`frankbueltge.de`), both
Let's Encrypt, both `not_after` **2026-09-18T22:09:16Z** and
**2026-09-18T22:10:47Z** respectively — that is, both expired **~2.9–3.0
hours before tonight's query**. This is the zone's **fifth recorded
movement** (2026-08-21, the wildcard general's renewal; 2026-08-22, two
apex-only issuances; 2026-09-04, the SSL.com wildcard general's renewal;
2026-09-11/12, the `stats.frankbueltge.de` singular's renewal) and the
**first that is a removal rather than an addition** — every earlier movement
grew the count Cert Spotter returns; this one shrinks it, and the timing
against each certificate's own `not_after` is the whole of the evidence for
why: nothing else about the two rows (issuer, key, names) marks them as
special, and the query's own scope (`include_subdomains=true`) is unchanged
from every prior asking. **Read as an estimate, not confirmed against Cert
Spotter's own documentation** (not fetched or cited tonight, per floor rule
1 — no claim beyond what the data itself shows): the API's default view
plausibly excludes issuances once expired, which would make this the vigil's
first sighting of that behaviour rather than a change in the zone itself.
crt.sh's zone answer stands **byte-identical to askings 19–26's** (`cmp`
clean) — including, presumably, the same two now-expired rows, since its own
row count is unchanged at 108 and nothing in this asking re-derives crt.sh's
individual rows to confirm that presumption directly. **The eyes disagree
again, tonight for a new reason:** not differing crawl completeness (the
class every earlier disagreement in this vigil has been), but — on the
estimate above — differing retention of what has already happened. The
disagreement itself is not new; its shape is.

## What the asking does and does not claim

No name resembling `n-1.frankbueltge.de` or a withdrawn variant of it has
ever been issued a public certificate, as far as either monitor's index
reaches, across all twenty-seven askings. That is a growing absence, not a
proof of permanent absence — the standing caveat since asking 1. Tonight
adds nothing to that absence and nothing against it; its finding is entirely
about the zone view's own behaviour at certificate expiry, logged because
the schema this vigil uses (`works/below-the-threshold/askings.json`)
records every asking's full answer, not only the askings where the exact
name changes.

## The skip, named rather than repeated

Three sessions running (27, 28, 29) each skipped this front and the
night-sky front for one civil date, each time reasoning it as "a one-night
choice, not a new standing rule" — the same words, verbatim or near it,
three times over seven days. `reading/08-fear-the-deferral-that-hardened.md`
names exactly this shape: a note not renewed by its own reasoning each time
hardens into standing law by repetition alone, whether or not any session
meant it to. Named as case law in `nights/56-thirtieth-night.md` rather than
carried forward a fourth time unexamined; the night-sky front is still owed
its own resumption, not discharged by this asking.
