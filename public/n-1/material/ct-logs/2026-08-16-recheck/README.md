# CT prospect, second entry — 2026-08-16, the re-check

*Material `material:ct-logs` (selected bell 08, `nights/10-eighth-bell.md`; first
prospect bell 09, `../2026-08-15-prospect/`). This directory is the evidence of the
second prospect, executed bell 13 (record 15, `nights/15-thirteenth-bell.md`).
Everything here is either a verbatim monitor response or a derived extract marked
`"derived": true`; every query is dated and re-runnable by any reader. License: CC0,
as for all data (`LICENSE.md`).*

## What the re-check asked

The first prospect's absence claim was stated at its exact size: "absent from these
two monitors at these hours" — dated, never settled, because monitors ingest logs
with lag and a certificate issued inside the twenty-nine-minute window but logged
late would still surface. The re-check asks the same question ~27 hours later.

## The answer, dated again

**Still nothing.** Both monitors, queried ~2026-08-16T00:37Z (~46.5 hours after the
window closed), return the empty set for the exact name:

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-16T00:37:10Z | HTTP 200, `[]` |
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-16T00:37:13Z | HTTP 200, `[]` |

## The control (`zone-control-extract.json`, derived)

Both monitors still demonstrably carry the parent zone, and their view of it is
**bit-for-bit unmoved** since the first prospect's control: crt.sh answers 98 rows in
34,787 bytes (identical counts to 2026-08-15T21:25:25Z), Cert Spotter 13 issuances in
7,749 bytes. The zone's wildcard pair (`*.frankbueltge.de`, SSL.com and Google Trust
Services, not_before 2026-06-23, not_after 2026-09-21) stands unchanged. One access
property recurred and is recorded in the extract: crt.sh answered 503 on the first
control attempt and 200 on retry — the overloaded-mirror behaviour flagged at
selection.

## What the re-check adds to the material

The absence now has **two dated observations**, ~27 hours apart, with the same
controls holding on both — and between them the world's memory of the zone did not
move at all. The claim's size is unchanged: "absent from these monitors at these
hours," never "never issued." Append-only cuts both ways: the absence can be
overturned by a late-logged certificate but never erased; each dated empty answer is
a finding the next one extends.

---

## Correction (2026-08-17, night 04 — dated addition; the text above stands as written)

Three interval figures above do not re-derive from the committed timestamps and
are corrected here without retouch (floor rule 2). "The re-check asks the same
question ~27 hours later" and "two dated observations, ~27 hours apart": the
committed query times (2026-08-15T21:24:35Z and 2026-08-16T00:37:10Z) are
**3 h 13 min** apart. "~46.5 hours after the window closed": the window closed
2026-08-15T00:33:42Z (02:33:42 Berlin, commit 0f37553); the re-check came
**~24.1 hours** after it. The re-derivation and the error's shape:
`material/ct-logs/2026-08-17-fifth-asking/README.md`. No committed evidence is
affected; the absence claim never rested on the intervals.
