# Method — the sign and the door

*Session 146, 2026-09-03. The design was fixed in `PREREGISTRATION.md` before the measured probes
ran. This document records what was actually done, where execution departed from the plan, and
where the result is weak. Two probe passes were abandoned for defects in this instrument; both
logs are committed unedited beside the data.*

## 1. What was measured

The forty publishers of the shipped census
(`artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv`), at exactly the
`evidence_url` shipped beside each, re-probed under four arms that separate what a refusal is
refusing: the **shape** of the request, the **name** in it, its **pace**, or none of those.

## 2. Execution

- `tools/door-recheck/probe.py --run`, one request per arm per door, never concurrent, 2 seconds
  apart, 25-second timeout.
- Arm **R** (the sign) first, once per distinct host: `GET /robots.txt`. Arm **A** (bare, honest
  identity, minimal headers) on every door its sign did not close. Arms **B** (complete browser
  headers, identity unchanged), **U** (a browser's name, only where the sign permits) and **C**
  (arm A repeated after a long wait) only where the previous arm was refused.
- The patient arm ran after every other request in the run, a wait of 600 seconds.
- Response headers that name the refusing layer are kept with each record; raw records are in
  `data/probes.json`. Two things are deliberately **not** carried there: the bodies of the hosts'
  `robots.txt` files (constitution §7 — no third-party source files are committed; each sign is
  reduced to whether it permits the cited path, how many agents it names on each side, its byte
  count and a SHA-256 by which anyone fetching the same file can check we read what they read), and
  a derived redirect counter that proved wrong (§5). No status, header or error recorded from a
  request has been altered or removed.

## 3. Deviations from the pre-registration, all in the same direction

**A 3xx redirect is not a refusal.** The registered rule scored "any status other than 2xx" as a
refusal. The first measured pass showed this was wrong on its face: four doors answered `301` — an
ordinary redirect that every browser and every ordinary client follows. Scoring those as refusals
would have inflated the refusal count by four for no reason but the tool's own configuration.
**Arms A, B, U and C were changed to follow redirects (`curl -L`) and the whole pass was re-run**;
the final status after redirection is what is recorded, and every status in the chain is kept.
The superseded log is `data/pass1-superseded-no-redirects.log`.

**A 404 on `robots.txt` is not an unreadable sign.** A host that publishes no rules permits
everything by convention, and is recorded as `no_sign` and knocked on normally.

**A 2xx that is a bot challenge is not an open door.** One host answers `202` with an
`x-amzn-waf-action: challenge` header and an empty body. That is a refusal wearing a success code,
and it is scored as a refusal. Without this rule the door would have been counted open.

Each of these three deviations *reduces* the measured refusal count or leaves it unchanged, except
the third, which raises it by one. None was chosen after seeing whether it helped the audited
number; the first two were forced by inspecting the raw statuses of the first pass, the third by
reading the headers of a single anomalous record.

## 4. Defects of this instrument, both found and fixed inside the session

1. **Pass 0 crashed.** The body fetch for `robots.txt` sent `Accept-Encoding: gzip` and then
   decoded the compressed bytes as UTF-8. Thirty hosts had been probed when it died.
   Log: `data/pass0-aborted-gzip-defect.log`. Fixed with `--compressed`.
2. **Pass 1 scored redirects as refusals**, as above. Log:
   `data/pass1-superseded-no-redirects.log`. It was stopped before its patient arm rather than
   left to finish, so that the publishers in it were not requested a third time.

Both logs are committed because a discarded pass is part of the record. The consequence for
politeness is stated plainly: several hosts received up to three requests to the same page over
about forty minutes rather than one.

## 5. Verification

- `probe.py --check` re-derives `data/summary.json` from the raw request records and fails on any
  drift.
- `make_page.py --check` rebuilds `index.html` from the data files and fails if the committed page
  differs by a byte, so no figure on the page can drift from its source.
- The classification of every door is a function of its recorded statuses alone
  (`classify()`); no verdict in this artifact was assigned by hand. That is deliberate, and it is
  the defect this audit found in the work it audits.
- One sub-agent re-derived the headline counts independently from `data/probes.json`, with its own
  script and no sight of ours, and was asked to be adversarial. Every count reproduced; it found
  four real problems, all recorded in `VERIFICATION.md` and the load-bearing ones carried on the
  artifact page itself: the single "name" result rests on a circular authorisation; one page is
  counted as two doors; a 2xx challenge page from an unrecognised provider would have been scored
  as open (the four doors that flipped were therefore re-fetched and read at body level,
  `data/reopened-recheck.json`, and all four serve their real policy text); and the patient arm's
  wait is asserted by the committed program but not witnessed by any timestamp in the records.
- A derived redirect counter written by an earlier version of this tool could not separate the
  proxy's CONNECT answers and 103 early hints from the origin's statuses. It was never cited; the
  field was removed and the raw status chain of every request is kept.

## 6. What this cannot do

**One vantage point.** Every request left by the same network path and the same address, through a
proxy this practice does not control. A door that answered in any arm proves the address is not
blocked for that door; a door that refused every arm **cannot be split here** into "refuses
instruments" and "refuses this address". This artifact reports the size of that class and makes no
claim about its composition.

**Timestamps.** No request record carries a clock. The instrument should stamp every request and
does not; the ten-minute wait before the patient arm is in the committed program's control flow and
is not otherwise witnessed.

**One day.** Every figure is a measurement day. The comparison with 2026-09-01 is two days, not a
trend.

**Not responsiveness.** As in the audited work: a route that can be fetched is not a route that
answers a letter. Nobody has been written to.
