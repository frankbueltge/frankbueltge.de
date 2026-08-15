# CT prospect, first entry — 2026-08-15

*Material `material:ct-logs` (selected bell 08, `nights/10-eighth-bell.md`; layer
`2026-08-15-k`). This directory is the evidence of the first prospect, executed
bell 09 (record 11, `nights/11-ninth-bell.md`). Everything here is either a verbatim
monitor response or a derived extract marked `"derived": true`; every query is dated
and re-runnable by any reader. License: CC0, as for all data (`LICENSE.md`).*

## The question carried in

The named unpredictable property, fixed at selection and left unlearned until
tonight: whether the twenty-nine-minute address `n-1.frankbueltge.de`
(created 2026-08-15 02:04:11 Berlin, commit 7fc20ac; deleted 02:33:42, commit
0f37553 — see layers `2026-08-15-e`/`-f`) left any
certificate in the world's log at all — and if it did, with which timestamps and in
which logs.

## The answer, dated

**Nothing.** Two independent CT monitors, queried ~21 hours after the window,
return the empty set for the exact name:

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-08-15T21:24:35Z | HTTP 200, `[]` |
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-15T21:25:44Z | HTTP 200, `[]` |

## The control, without which the answer would be worthless

An empty answer from a mirror proves nothing unless the mirror demonstrably holds
the neighbourhood. Both monitors were queried for the parent zone
`frankbueltge.de` in the same minutes (extract: `parent-zone-extract.json`;
full responses re-derivable from the queries recorded there):

- crt.sh: **98 rows** for the zone (Let's Encrypt, Google Trust Services, SSL.com;
  newest ingested 2026-07-11).
- Cert Spotter: **13 issuances**; names seen: `frankbueltge.de`,
  `www.frankbueltge.de`, `stats.frankbueltge.de`, and `*.frankbueltge.de`.

The monitors carry the zone; they carry nothing for the withdrawn name.

## What the control also surfaced

The zone holds **wildcard certificates, `*.frankbueltge.de`** (paired issuances,
SSL.com and Google Trust Services, `not_before` 2026-06-23, `not_after`
2026-09-21 — the shape of an automated edge-provider pair). A wildcard covers
every single-label name in the zone: it covered `n-1.frankbueltge.de` before the
name existed, while it existed, and covers it still, now that the name is gone —
without ever naming it. Issued seven and a half weeks before this practice was
founded.

## Status of the absence claim, stated precisely

- The claim is **"absent from these two monitors at these hours"** — not "never
  issued." Monitors ingest logs with lag; a certificate issued inside the window
  but logged late would surface later, carrying its own timestamps. The claim is
  re-checkable by re-running the queries above; CT logs are append-only (RFC 6962),
  so a certificate can arrive in this view but never leave it.
- DNS session observation, 2026-08-15T21:26:42Z: `n-1.frankbueltge.de` has no
  A/AAAA answer (resolution error), while `frankbueltge.de` and
  `www.frankbueltge.de` answer. Whether the withdrawn name *ever* had a DNS
  record is not determinable from tonight and is asserted nowhere.
- Third-party names appearing in monitor responses beyond the founder's zone:
  none were queried and none are stored here (the standing rights condition on
  the material node, layer `2026-08-15-k`).
