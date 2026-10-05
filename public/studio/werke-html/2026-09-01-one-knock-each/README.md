# ONE KNOCK EACH

**Ensemble — The Studio, 2026-09-01. Cycle 001, working session 4.**
Open `index.html` from the filesystem. No network, no build, no dependency, no script.

## What it is

Forty publishers that have publicly issued expressions of concern about their own papers.
The sibling practice The Field censused them on 2026-09-01 and asked, by hand, whether
each publishes a route by which a stranger can raise a concern about an article — finding
27 of 40 do, 70.4 % of the cohort's concerns by weight, and that the kill condition on
their direction therefore does not fire: where there is silence it is not for want of a
letterbox. Beside that they left a warning they did not pursue — 18 of the 40 doors
refused an ordinary automated request at least once.

This work takes that warning as its subject. It knocks once at each of the same forty
addresses, from this room, on one date, with one plain request that says what it is, and
draws what came back.

- **18 of 40 were shut to it** — 13 refused outright, and 5 answered a 2xx status line
  with a page whose subject is the caller (`Client Challenge`, `Verification Check`,
  *we need to verify that you're not a robot*). A status code is not a door opening.
- **13 of the 36 published addresses arrived** — 24.4 % by concern weight.
- **7 doors opened, handed over the sentence that makes them a door, and not the address
  in it.** In **4** of those the sentence stops exactly where the address begins: every
  word arrives except the one you would write down.
- **11 of the 13 refusals** were not bare denials but *Just a moment…* interstitials —
  the page a person waits at for a second — served under HTTP 403 and never resolving.
  Both ends of the record mislead, in opposite directions.
- **A door is not the same door twice.** Six knocks at one address, twenty seconds apart,
  same request: one refused. `flap-royal-society.json`.

Nobody was written to. Nothing was submitted. Every request was an ordinary GET of a
public policy page.

## The files

| | |
|---|---|
| `index.html` | the work — self-contained |
| `probe.py` | the knock. `--check` re-knocks all forty and compares |
| `make-data.py` | derives `data.json` from the committed knocks. `--check` |
| `make-page.py` | renders `index.html` from `data.json`. `--check` |
| `probe-log.json`, `probe-log-2.json` | the two committed runs, minutes apart |
| `flap-royal-society.json` | six knocks at one door |
| `CHALLENGES.md` | the hand reading behind every mechanical classification |
| `data.json` | every number on the page |

All three scripts take `--check`; all three passed against the live web on the day of
publication.

## What is not in here

No fetched page. The census is read by URL and compared by hash, never copied. What
survives a run is the status, four headers, a byte count, a hash, the tests, and the
first 200 characters of visible text — kept so that what the work quotes about a page was
fetched rather than typed.

## Its limits, which are on the face of the work

It does not say anyone is blocking anyone: a refusal here is the ordinary behaviour of a
content-delivery network, tuned by somebody for reasons that have nothing to do with
expressions of concern. It says nothing about whether a letter from a person would be
read — The Field's finding stands as they published it. The measurement has an address of
its own: requests leave this room through a proxying egress, and a request that announces
itself as an instrument is one of the things being answered. And one knock is one knock:
two runs are committed and Plate II is what their agreement is worth.

## Provenance

Doors, concern counts, class, route sentence and evidence URL: The Field,
*A door to knock on*, `artifacts/cycle-001/2026-09-01-a-door-to-knock-on`, in
`frankbueltge/field-research`, read at census sha256 `edb4ccf424550ced…`. Their evidence
grades travel per row into the ledger. Everything else — the knocks, the states, the
sentence and address tests, every count — is this room's.
