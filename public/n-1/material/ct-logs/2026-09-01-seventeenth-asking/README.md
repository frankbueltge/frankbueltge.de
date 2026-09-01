# CT material, seventeenth asking — 2026-09-01 (night 18)

*Material `material:ct-logs` (selected bell 08; askings 1–16 in the ledger,
`works/below-the-threshold/askings.json`). This directory is the evidence of the
seventeenth asking, executed night 18 (record 43, `nights/43-eighteenth-night.md`)
at the canonical hour, ~24 hours after asking 16. The asking's shape, and it is
a first: **every door answered, and every answer is byte-identical to a
committed predecessor** — the vigil's first wholly-answered, wholly-still night.
Every attempt, answered or refused, is dated in `attempts.log` with its body's
size and sha256 at request time, and the asking is re-runnable by any reader
(`ask.sh`, committed as run). License: CC0, as for all data (`LICENSE.md`).*

## The procedure, revised in code — night 17's two artifacts fixed

Night 17 disclosed two flaws in its committed `ask.sh` and assigned the fix to
the next asking's script; tonight's script (`ask.sh`, committed as run) carries
both fixes:

1. **The counter lives in the calling shell.** `ask()` reports its HTTP code in
   a global (`ASK_HTTP`) instead of printing it through command substitution, so
   its increments are no longer lost to a subshell: tonight's log carries true
   attempt numbers (`crtsh-exact attempt 1..4`), and every attempt's body went
   to its own numbered file — no path was ever shared, no overwrite possible.
2. **Each body file is truncated before its request** (`: > "$body"`), so a
   refused attempt can never carry a stale earlier body or hash one — a failed
   receive would log `bytes=0` with no sum. (No such case arose tonight; the
   three 502 pages were each received, hashed as themselves — 150 bytes,
   sha256 `61b30d40…` all three — and not committed.)

The run is clean: seven attempts, seven well-formed log lines, no artifacts to
annotate.

## The exact name: both eyes open, both empty

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.n-1.frankbueltge.de.json` | Cert Spotter (SSLMate) | `https://api.certspotter.com/v1/issuances?domain=n-1.frankbueltge.de&include_subdomains=false&expand=dns_names&expand=issuer` | 2026-09-01T01:04:25Z | HTTP 200, `[]` (4 bytes) |
| `crt-sh.n-1.frankbueltge.de.json` | crt.sh | `https://crt.sh/?q=n-1.frankbueltge.de&output=json` | 2026-09-01T01:05:11Z (fourth attempt; attempts 1–3 answered 502, all dated) | HTTP 200, `[]` (2 bytes) |

~409.0 hours — seventeen days and one hour — after the twenty-nine-minute
window opened (created 2026-08-15T00:04:11Z, commit 7fc20ac; deleted 00:33:42Z,
commit 0f37553), ~24.0 hours after asking 16; both intervals computed from the
committed timestamps per entry 13's rule. Cert Spotter's empty response is
byte-identical to askings 4–16's committed files (sha256 `3fbbd4c6…`); crt.sh's
is byte-identical to asking 15's (sha256 `4f53cda1…`), its first answer on the
exact name since that asking. The first two-eyed exact-name night since
asking 15.

## The zone controls: both held to the byte

| file | monitor | query | queried (UTC) | result |
|---|---|---|---|---|
| `certspotter.frankbueltge.de.full.json` | Cert Spotter | `https://api.certspotter.com/v1/issuances?domain=frankbueltge.de&include_subdomains=true&expand=dns_names&expand=issuer` | 2026-09-01T01:04:26Z | HTTP 200, **20 issuances**, 11,949 bytes, sha256 `0cfc697859b18a88c32cc335ee2cdbff46009dbe3db98e256d4f2aae1a8ab5a5` |
| `crt-sh.frankbueltge.de.full.json` | crt.sh | `https://crt.sh/?q=frankbueltge.de&output=json` | 2026-09-01T01:05:21Z (first attempt) | HTTP 200, **108 rows**, 38,225 bytes, sha256 `4e0570c2410e2e0bf902617ac256e7bb0431da3cadeb0a87ac17d1268d10198f` |

Cert Spotter's zone view is **byte-identical to askings 11–16** — the seventh
consecutive byte-identical zone night on that monitor. crt.sh's zone view is
**byte-identical to asking 16's committed file** — the first time crt.sh's zone
door has answered on two consecutive askings with identical bytes: the three
late-surfacing apex rows asking 16 caught are now the settled state of the
index, and nothing has entered or left behind them. The exact name is in none
of the 108 rows.

No mechanism is written, per the material's standing discipline.
