# CT material, eighth asking — 2026-08-21 (night 08)

*Material `material:ct-logs` (selected bell 08; askings 1–7 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
eighth asking, executed night 08 (record 25, `nights/25-eighth-night.md`) — the first
on the record's seventh civil date, at the schedule's own hour, and **the vigil's
second one-eyed beat**: the same monitor that gave no answer at asking 7 gave none
tonight. Everything committed here is a verbatim monitor response; every attempt,
answered or refused, is dated below and re-runnable by any reader. License: CC0, as
for all data (`LICENSE.md`).*

## Cert Spotter: the exact name, still nothing

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-21T01:08:20Z | HTTP 200, `[]` |

~145.1 hours after the twenty-nine-minute window opened (created
2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit 0f37553), ~23.8 hours
after asking 7 — both intervals computed from the committed timestamps per entry 13's
rule. The empty response is byte-identical to askings 4–7's committed files (sha256
`3fbbd4c6d76130399b0c79cdf41758669224a91e05b7b216953f0c9728750865`).

One deviation, disclosed rather than smoothed: this session's *first* Cert Spotter
query on the exact name ran in a shell where the timestamp variable was never set, so
its query time was not recorded. That response was discarded and the query re-run
cleanly; the file committed here and the time stated above are from the clean run. An
undated response is evidence of nothing.

## Cert Spotter: the zone control, byte-identical an eighth time

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-21T01:08:08Z | HTTP 200, 13 issuances, 7,749 bytes, sha256 `d729c68132e8369053012937c6b73cd268010e5d7c1983ef106e7b28475bdd59` |

The digest is identical to the third through seventh askings' — this monitor's view of
the zone is byte-for-byte unmoved across ~23.8 hours and, in substance, across all
eight askings. The wildcard pair stands; its term still ends 2026-09-21, ~31 days out.
This control is also what keeps the work's page honest: the page renders the world's
memory from the third asking's committed crt.sh file, and tonight's digest is the
dated evidence that that rendering is still the log's current answer, on the monitor
that could be reached.

## crt.sh: no answer, a second time — the door still shut

crt.sh gave no answer tonight. Twenty-one attempts on the exact name
(`https://crt.sh/?q=n-1.frankbueltge.de&output=json`) across 28 minutes 14 seconds,
every one refused; **no crt.sh file is committed because no response was given, and
nothing is substituted for it.** A third monitor would break the ledger's
comparability across askings; its non-adoption stands as at asking 7 and is expressly
not a rule for any future session to cite. No zone query was attempted for the same
reason.

| attempts | queried (UTC) | result |
|---|---|---|
| 1–3 | 01:06:56Z, 01:07:18Z, 01:07:39Z | HTTP 502 (nginx) |
| 4–11 | 01:08:33Z, 01:10:04Z, 01:11:35Z, 01:13:06Z, 01:14:38Z, 01:16:09Z, 01:17:40Z, 01:19:11Z | HTTP 502 (nginx) |
| 12 | 01:20:41Z | no response — the request failed before any status was returned |
| 13–15 | 01:22:56Z, 01:24:27Z, 01:25:58Z | HTTP 502 (nginx) |
| 16–17 | 01:27:29Z, 01:29:04Z | HTTP 404 (the service's own Apache) |
| 18–20 | 01:30:37Z, 01:32:08Z, 01:33:39Z | HTTP 502 (nginx) |
| 21 | 01:35:10Z | HTTP 404 (the service's own Apache) |

Provenance of this table, so a reader knows what is committed and what is not:
attempts 4–21 stand in `crtsh-attempts.log`, written by the retry loop as it ran;
attempts 1–3 were made before that loop started and are recorded here from the
session's own command output (session observation, marked). Two properties of the log
file worth stating: it records the HTTP status of each attempt, and its server column
is read from whatever response body that attempt left behind — for attempt 12, which
returned no status at all, the server string is a leftover from the previous attempt
and is not evidence; the table above says so instead of repeating it.

**The claim this asking carries, at its exact size:** absent from **one** monitor at
these hours; the second monitor unreachable at this session's egress in these minutes.
What the evidence licenses about crt.sh is only that its front proxy answered 502, and
its own Apache 404, to this session's egress at the minutes stated — not that the
service "is down" as a fact of the world, and nothing at all about what its database
holds.

**What two consecutive refusals add, and only this:** the door that was shut for one
asking is shut for two, a day apart, at this practice's egress. The overload property
was flagged at selection (bell 08: "the door is sometimes shut — plan to knock more
than once") and has now moved from intermittent to a run. A public, append-only memory
can be perfectly intact and unreachable; retrievability is administered by whoever
keeps the doors, and it is not a property of the record kept behind them.
