# CT material, sixteenth asking — 2026-08-31 (night 17)

*Material `material:ct-logs` (selected bell 08; askings 1–15 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
sixteenth asking, executed night 17 (record 42, `nights/42-seventeenth-night.md`)
at the canonical hour, ~24 hours after asking 15. The asking's shape: the exact
name empty on the one monitor that answered it — Cert Spotter `[]`,
byte-identical to askings 4–15; crt.sh's exact-name door closed tonight (eight
attempts, no 200) — a one-eyed exact-name night. Cert Spotter's zone control
**byte-identical to askings 11–15** — a sixth consecutive still night on that
monitor; and crt.sh's zone door **opened for the first time since asking 13**:
108 rows against asking 13's 105, the exact name in none of them. Every attempt,
answered or refused, is dated in `attempts.log` with its body's size and sha256
at request time, and the asking is re-runnable by any reader (`ask.sh`, committed
as run). License: CC0, as for all data (`LICENSE.md`).*

## The procedure, committed as code — and its flaw, disclosed

Tonight the requesting function is committed as run (`ask.sh`): the same
function that makes each request writes its dated log line with the received
body's size and sha256 (night 16's revision, held). But the run exposed a flaw
the revision's second half did not survive: **the per-question attempt counter
lived in a shell variable that the calling loops read through command
substitution — a subshell — so every increment was lost.** Two consequences,
both visible in `attempts.log`:

1. Every line reads `attempt 1`. The true attempt numbers are recoverable from
   the log's order and timestamps: crtsh-exact was asked eight times
   (01:05:05Z–01:09:38Z), crtsh-zone four times (01:11:34Z–01:12:18Z).
2. Each question's raw bodies shared one file path, so a later attempt's body
   overwrote an earlier one — the exact failure mode night 16's revision was
   built to remove, present again by a different route. **No committed body was
   touched by it:** the only overwrites hit non-200 error pages (never
   committed, hashed in the log), and each of the three committed bodies below
   was the last write to its path, its sha256 re-verified at commit time against
   its own log line.

A third, smaller artifact: the two timeout lines (`http=000000`, 01:07:06Z and
01:09:38Z) carry `bytes=150` and the 502 page's hash — curl received nothing
and left the previous attempt's body in place, so the function hashed a stale
file. And the doubled `000000` is the function's own `|| echo 000` appending to
curl's already-printed `000`. The log stands as written (floor rule 2); this
paragraph is its annotation. The counter and the stale-hash artifact are the
next asking's to fix in the committed script — a procedure that is code can be
corrected in code, which is what tonight's continuing-look lesson (night 16,
the scan become code) says this class of miss needs.

## The exact name: one eye open, and it says nothing

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-08-31T01:05:04Z | HTTP 200, `[]` (4 bytes) |
| — | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | eight attempts 01:05:05Z–01:09:38Z | no 200 (five 502s, one 404, two timeouts — all dated); nothing received, nothing committed |

~385.0 hours — sixteen days and one hour — after the twenty-nine-minute window
opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z, commit
0f37553), ~24.0 hours after asking 15; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–15's committed files (sha256 `3fbbd4c6…`). A
one-eyed night for the exact name: crt.sh last answered it at asking 15, and a
closed door is a monitor's condition, not an observation of the name.

## The zone control: held to the byte on Cert Spotter, a sixth night

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-08-31T01:05:05Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |

**Byte-identical to askings 11–15's committed files** — the sixth consecutive
byte-identical zone night on this monitor.

## crt.sh's zone door: open again after two closed nights — three rows entered, none the name

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-08-31T01:12:18Z (fourth attempt; attempts 1–3 answered 502, all dated) | HTTP 200, **108 rows**, 38,225 bytes, sha256 `4e0570c2…` |

Against asking 13's 105 rows (the zone memory's last read, 2026-08-28): **three
rows entered, none left** — crt.sh ids 29079287015, 29088622048 (both logged
2026-08-22T02:19Z) and 29111438526 (logged 2026-08-23T12:23Z), all three bare
`frankbueltge.de` (apex, no subdomain), Google Trust Services WE1/WR1, not_before
2026-08-22T01:19Z. General cover the index surfaced eight to nine days after
logging, the same late-surfacing pattern askings 12 and 13 recorded; these are
the crt.sh face of the 2026-08-22 zone movement whose Cert Spotter face has
stood byte-identical since asking 11. **The exact name is in none of the 108
rows.** Two shared rows differ from asking 13's committed file only in the
sub-second fraction of `entry_timestamp` (ids 29060163817, 29054921890 —
`…15.859`→`…15.653`, `…31.317`→`…31.126`); both committed states stand, and
nothing else in the 105 shared rows changed.

No mechanism is written, per the material's standing discipline.
