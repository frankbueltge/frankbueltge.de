# Handoff — slimming the orientation, and what a figure needs to actually be seen

**Written:** 2026-08-15, at the end of a two-night session. **For:** the next session, which should
start here rather than from the transcript — the transcript contains three of my own wrong turns
at full length, and the corrections are what matters.

**Status:** everything in §3 is DONE, on `main` and deployed. §1 is the job. §2 is the evidence.

---

## 1. The job, in Frank's words

> „die praxen sollen ja nicht hundert texte lesen bevor sie arbeiten … sie sollen sich auf die
> arbeit konzentrieren … bevor wir denen noch mehr material oder text aufdrängen sollten wir eher
> überlegen, wie man entschlacken kann, so dass sie sich auf das konzentrieren, was zählt, also
> deren forschungen und werke."

**Cut what a session must read before it may work.** Not by summarising — by moving what is
finished out of the way, the way the Atelier already did on 2026-08-10.

---

## 2. What it costs today, measured

What each practice's own instruction ORDERS it to read at orientation, in words:

| practice | must read | the bulk of it |
|---|---|---|
| **field-research** | **102,049** | REQUESTS 45,954 · WORKBOARD 23,091 · three journal days 23,129 |
| **studio** | **95,719** | REQUESTS 46,082 · WORKBOARD 42,983 |
| ulysses | 22,302 | REQUESTS 13,043 |
| error-as-method | 18,486 | three journal days 8,996 |

A hundred thousand words is a four-hundred-page book, read before the first move, every night. The
Field and the Studio read more each night than they will write in a month, and almost none of it is
material — it is a channel and a board.

**The cure already exists in this house.** On 2026-08-10 the Atelier split its channel: answered and
closed sections moved to `REQUESTS-ARCHIVE.md`, ~36,000 words out of the orientation path. That is
why `ulysses` sits at 13k where its siblings sit at 46k. The split was never carried to them —
**the same failure this whole week has been about: a repair made in one house and not carried.**

### The order to do it in

1. **Take the atlas duty back out of the four routine prompts.** On 2026-08-13 I wrote *"consult
   the atlas BEFORE you build something you believe is new, and record what you found"* into all
   four. That turns a reference work into a nightly chore with a reporting obligation. Frank's
   correction, 2026-08-14: available when they look for neighbours or inspiration, **not** to be
   worked through. Prompts: `trig_01XZog4QH6kvPvaH7cTpadUi` (nightly), `trig_01YYPEboQX7qktGW658pZrmj`
   (field), `trig_01Xk7PLv9nhDeoGAe74cYLk3` (ulysses), `trig_01MXqSq2VNoiGm2sypWdXB6a` (studio) —
   reachable with the `RemoteTrigger` tool, `action: "get"` then `"update"` with the whole
   `job_config` (partial updates replace the object wholesale; keep every other field byte-identical,
   and check the diff before sending — I put a typo into one prompt this way).
2. **Split the two channels** — `field-research/REQUESTS.md` and `studio/REQUESTS.md` — exactly as
   `ulysses` did: an archive file beside it, answered/closed sections moved with their dates intact,
   the live file keeping what is open. Expect ~80,000 words out of the nightly path. **Read the
   Atelier's split first** (`git log --diff-filter=A -- ulysses/REQUESTS-ARCHIVE.md`) rather than
   inventing a second convention.
3. **Prune the boards.** `studio/WORKBOARD.md` is 42,983 words and `field-research/WORKBOARD.md`
   23,091. A board holds what is open; a board that holds everything that ever was is an archive
   wearing a board's name. Same treatment: dated archive file, open items stay.
4. **Then re-measure.** The table above is one bash loop — put the number in the decision log, so
   the next drift is visible as a number rather than a feeling.

### One thing NOT to do

**Do not build the "what the site says about you" feed.** I proposed it (a per-practice JSON of the
site's own claims — role, door line, protocol version, routes — so a practice could check its own
description against its own constitution). Frank rejected it on the right grounds: the problem is
too much text in front of the practices, and the answer to that is not another document. The site's
descriptions keep drifting; the currency runs catch it from outside, and that division of labour
stays until someone decides otherwise.

---

## 3. What was done, and is live

**For the nightly line (`error-as-method`)**
- Frank's answer to the rhizome question is in its channel; the practice read it, deferred it by
  one night on my own note's wording, and made it item 1 of Session 51.
- Orientation step 7: `python3 tools/preflight.py` before branching — Session 48 asked, twice two
  nights had been lost to a stale `origin/main`.

**Governance (`ulysses`)**
- `archive/**` is the practice's own (Frank, wide form over an add-only carve-out). §8's rotation
  lands unattended; Gate 6 REPORTS any archive write that is not an addition into
  `atelier-feedback/`. Blocked rotations merged (#15, #16); #14 closed as stale — one of its five
  "closed" sections had been answered hours earlier.
- `governance-consistency.yml` is green again: the delegation names v6, and the check accepts both
  spellings of the self-development clause. It had read a REWRITTEN constitution as a REPEALED one.

**The house's catalogues, published as feeds** — `/atlas/werke.json` (505 neighbouring works),
`/papers/index.json` (1,106, no abstracts), `/papers/register.json` (full), `/datasets/register.json`
(59). Documented in all four practices' `SITE-API.md` and their channels. Feeds, never copies.

**The site**
- Lines are visible inside the station: `lines` and `constitutions` rows on `/atelier`, a line marker
  on every Atelier row of `/works`, a door to `/error-as-method`. Both protocol versions are READ
  from two mirrors, never typed (the nightly line's `PROTOCOL.md` is the fifth mirrored path).
- `/atelier/lines/<id>` exists — the record page three figures were already linking to. It composes
  the live trace with the halves §8 rotated into `archive/trace/`: 65 moves where the live file
  alone shows 6.
- Four figures are back on pages after being orphaned by #560: the refrain score (`/atelier`), the
  ecology's score (`/ecology`), the Field's claim plate (`/field`), the three cycles (`/ecology`).
  The cockpit's rhizome draws again, and every cockpit instrument now carries its own date.

---

## 4. Five cautions, all paid for this session

**A figure that is mounted is not a figure that is drawn.** Two independent ways it disappears with
nothing failing: (a) its stylesheet is scoped to a wrapper the new host does not have, and
`stroke: var(--missing)` computes to `stroke: none` — an undefined custom property does not warn,
**it erases**; (b) the host's fitting rule (`svg { width: 100% }`) squashes a 2960 px score into
1056×95. Both passed every test and every build.

**So verify in a browser, not in the HTML.** I reported "THE REFRAIN im HTML: True" and was wrong
about the thing that mattered. The markup was never the problem.

**What vanished is usually the ASSEMBLY, not the artefact.** Both figures recovered this session were
intact in the tree; what had gone was the model-building, which lived inline on the page that was
retired. Look for the data module before concluding a component is dead.

**A grid places its children in order, not by slot.** A third figure written into `figure-main`
still landed in the 340 px side column. `Figure` takes `full` now.

**`main` can be red from someone else's merge.** #599 landed a `ts(7053)` and every branch cut after
it inherited a red gate for a file it never touched. Check `main` before trusting a local green — and
note that a parallel babysit routine may already be pushing a fix to your branch.

**And the one from the night before, still the sharpest:** before "closing a gap", read whether the
practice already decided it. The rhizome was not an oversight — sessions 45 and 47 had reasoned it
out, filed it, and were waiting on an answer.

---

## 5. Open, not started

1. **§2 in full** — the slimming. That is the job.
2. **PR #226** (2026-07-30, „wer namentlich genannt wird, findet den Korrekturweg ohne Suche"): a
   rights matter, two weeks old, and `MeridianParallax.astro` has moved since. Needs a sober look,
   not a merge.
3. **Nine figures are still on no page** (`HeroField`, `MachinesStrip`, `WerkeStrip`, `CrossingsMap`,
   `ScoreFigure`, `ScoreKey`, `field/Dossier`, `GauntletTour`, `LineageNote`). Frank ruled out
   `ProcessFigure` ("passage brauchen wir nicht"); the rest were never decided about, only dropped.
   `src/lib/ecology/mounted.test.ts` guards the ones that are back.
4. **`archive/trace/` is mirrored for the Atelier only.** If another practice starts rotating, its
   halves will vanish from the site the same way, silently.
