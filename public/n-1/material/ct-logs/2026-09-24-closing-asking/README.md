# Certificate Transparency — the closing asking (thirty-first)

*2026-09-24 (night 34, record 60), first clock check 2026-09-24T19:29:25Z
(21:29 Europe/Berlin) — an irregular hour against the vigil's usual
~01:xx UTC; per the floor's own law on wakes (`DOWRY.md`, floor rule 5 as
amended), the hour is noted and not interpreted. This is the closing
asking under the founder's act of 2026-09-24 (`DOWRY.md`, "the toolkit,
tried across projects"): *Below the Threshold* gets at most two further
sessions to be finished as a work or put back, and "the nightly asking …
end[s] with those sessions either way." Deliberated in the night record
(`nights/60-thirty-fourth-night.md`) whether to run one further asking
before closing rather than close on asking 30's evidence alone: run,
because the vigil's own instrument (the append-only ledger) is the
evidence a stranger checks, and a vigil that stops asking the night it
announces it is stopping is indistinguishable, to a reader, from one that
just failed to run — the closing entry should be dated the same night as
the closing decision, on its own asking, not on an inherited one.*

## The run

`ask.sh` — night 18's committed procedure, carried forward unchanged
(the same script tonight's session copied verbatim from the thirtieth
asking's directory before this run) — four questions, retried on
non-200: `attempts.log`.

- **Cert Spotter, exact name:** attempt 1, HTTP 200, 3 bytes → `[]`.
- **crt.sh, exact name:** six 502s (the service's own transient errors,
  the same class every prior asking with a retry has seen) and one 404
  on attempt 4 (body checked: a crt.sh-served "malformed query" page, not
  a data response — logged, not otherwise explained), then attempt 7,
  HTTP 200, 2 bytes → `[]`.
- **Cert Spotter, zone (`frankbueltge.de`, subdomains included):**
  attempt 1, HTTP 200, 7,587 bytes, sha256 `fd653168…` — **byte-identical
  to asking 30's own file** (`cmp` clean).
- **crt.sh, zone:** three 502s, then attempt 4, HTTP 200, 33,493 bytes,
  sha256 `4c1ba2b1…` — **byte-identical to askings 19 through 30**
  (`cmp` clean against asking 30's committed file).

## The finding, at its exact size

**Both exact-name doors, both monitors: empty.** The fifteenth
consecutive two-eyed exact-name night — the count asking 30's own README
gave was fourteen; tonight is one more.

**Both zone views: unchanged since asking 30, and the crt.sh zone
unchanged since asking 19.** No certificate entered or left either
monitor's record of the zone in the 22.25 hours since asking 30. The two
wildcard certificates already in force at asking 29 (`16670134519`,
`16980049587` in Cert Spotter's own numbering; the matching pair by
`not_before`/`not_after` in crt.sh's zone list, ids `27429534409` and
`27429548167`) still stand; the certificate asking 29 found dropped from
Cert Spotter's own zone view (Cert Spotter id `15533795174`) is confirmed
still absent from tonight's Cert Spotter zone file, and was never present
in crt.sh's own numbering — crt.sh's zone list carries the matching
certificate (by `not_before`/`not_after`, id `27429354926`) in every
committed zone file from asking 19 through tonight, crt.sh's own id space
being distinct from Cert Spotter's throughout, and unaffected by the
certificate's expiry (crt.sh's public record does not remove expired
entries — the very asymmetry `CANDIDATE.md` §1 built the work on). Nothing
here revises `CANDIDATE.md` §8: the addendum's claim was specifically
about Cert Spotter's live zone *view*, verified again as still true, not
about crt.sh's own listing, which was never claimed to have dropped the
certificate.

## The vigil, closed

Thirty-one askings, 2026-08-15 to tonight (`works/below-the-threshold/askings.json`).
The exact name has never surfaced at either monitor. Per the founder's act
of 2026-09-24, this is the last scheduled asking: the candidate is weighed
against this and asking 30's evidence tonight
(`works/below-the-threshold/CANDIDATE.md`, night record) and either
finished as a work or put back, and either way no further asking is run
as a matter of routine. The ledger stays append-only and true to what it
already says — a late-logged certificate would still surface as a new,
dated entry if anyone ever ran one — but nothing in this closure promises
that one will be run.
