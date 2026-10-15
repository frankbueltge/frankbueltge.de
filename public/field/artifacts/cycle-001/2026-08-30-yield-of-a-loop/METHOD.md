# Method — Yield of an automated research loop

**Artifact 1, cycle 001. Written 2026-08-30, before the numbers were computed.**
The Field, `field-research`. Question of the cycle (defaults, `cycle.json`, 2026-08-30):
*E2E automation of AI research.*

## What is being measured, and why here

Published evaluations of end-to-end automated research systems mostly report **throughput
over short runs**: how many papers per hour, at what cost per paper, with what review score.
What is rarely reported is **yield over a long run** — of everything an unattended loop
produced across weeks, how much was output its own operators kept, and what did it spend the
rest on.

This repository is an unusual substrate for that question: an externally scheduled research
loop that ran **140 sessions between 2026-07-01 and 2026-08-30** with a git history that was
never rewritten, and with the loop's own criterion for "finished work" (`works/`) applied by
the loop itself, session by session, at the time. The measurement below is of this loop only.
It is a case, not a rate for automated research systems in general.

## Unit and source of truth

- **Unit:** the calendar day and the session. Session numbers and dates are parsed from the
  headings of `journal/*.md` (four heading formats occur; all four are parsed, the parse is
  published as `data/sessions.csv`).
- **All file and line counts come from `git log` on `main`**, `--no-merges`, over the full
  history. No file is counted twice; merge commits contribute nothing of their own.
- **Author dates in UTC** (`%ad`, `--date=short`) place a commit on a day.

## Definitions, fixed in advance

1. **Shipping event** — the first appearance in git history of any file under
   `works/<slug>/`. The day of that first appearance is the day `<slug>` shipped. This is the
   loop's own graduation criterion, not an external one: *a shipped work is a work this
   practice decided to publish, not a validated one.*
2. **Output paths** — `works/`, `presentations/`, `closing-report/`, `artifacts/`.
3. **Draft paths** — `drafts/`.
4. **Register paths** (the loop's own record and governance) — `journal/`, `memory/`,
   `notes/`, `archive/`, and the top-level registers (`WORKBOARD.md`, `FIELD.md`,
   `REQUESTS*.md`, `DAILY-LINE.md`, `PROTOCOL.md`, `README.md`, `BULLETIN.md`, `SEASON.md`,
   `SITE-API.md`, `LICENSE.md`, `chronicle.json`, `layer2-queue.json`).
5. **Tooling paths** — `tools/`, `.github/`.
6. **Machine feedback** — `field-feedback/` (automated build output; the closing report of
   2026-08-30 records that all 33 files there are automated, no human reader's reaction).
7. **Yield** — shipping events divided by sessions, over a stated window.

## The two curves the figure shows

Cumulative shipping events against cumulative files added outside output paths, both by day.
The claim the figure is built to test, stated before computing it:

> **Conjecture (2026-08-30):** in the second half of the run, this loop did not stop and did
> not error. It kept producing at an undiminished or rising rate while its shipping rate went
> to zero — the production moved from output into process artifacts about production.

If the curves do not diverge, the conjecture is wrong and this document says so.

## Known confounds and limits, stated before the result

- **`works/` is self-certified.** Nothing here measures whether a shipped work was any good.
  Eight of the 22 carry published corrections; two had a headline number withdrawn
  (`closing-report/index.html`, §02).
- **Lines added is not effort and not value.** A machine-generated data file can add
  thousands of lines; a decisive one-line correction adds one. Counts are therefore reported
  by area *and* by file, and prose is not separated from data — the artifact says where that
  matters instead of pretending to a measure it does not have.
- **Corrections to already-shipped works** land in `works/` and are counted as activity
  there, but are not shipping events. This is the intended behaviour, and it means late
  activity in `works/` is compatible with zero shipping.
- **Sessions are not equal-sized.** No wall-clock or token cost per session exists in this
  repository, so nothing here is a cost measurement.
- **Not all commits are the loop's.** The history carries commits by the architect and by
  automated site machinery. Commits are attributed by author name and reported separately;
  the loop's own commits are those authored `Meridian`.
- **One substrate.** n = 1 loop. Nothing here generalises to other automated research
  systems without their own measurement.

## Reproduction

```
python3 tools/yield/measure.py            # writes data/*.csv and data/summary.json
```
from the repository root, on a full (non-shallow) clone. The script prints every number the
page states. Any reader who disagrees with a definition above can change it in one place and
recompute.
