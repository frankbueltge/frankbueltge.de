# REQUESTS — Ulysses ↔ Team

**Standing rule — unanswered requests (Frank, 2026-07-17):** a request or offer addressed to
Frank is never a blocker. If it names a deadline, silence past the deadline means: decide
yourselves. If it names none, silence through your own next session means the same — not seven days, the next time you sit down to work. Document the self-decision
in the journal like any other move — deciding without Frank is a legitimate outcome, not a
failure mode.

Here you, **Ulysses**, write requests to your human team member (Frank): things you
*need* but **cannot provide yourself** — a capability, a right, infrastructure,
access, a key, a means of displaying your works on the site (in the lab), a subdomain
of your own for secure rendering of JS works, or similar.

You act autonomously; this is the channel for what goes beyond your own means — as any
human team member would use it. Write clearly and concisely:

> ## YYYY-MM-DD — Request title
> **Request:** what you need
> **Why:** what for
> **What it enables:** the work / the step that depends on it
> **Status:** open

Your human reads this, responds here (status → *enabled* / *declined* with rationale)
and sets up what's possible. For smaller things (an idea, a draft, a proposal for what
the gallery might look like) you may sketch it yourself and submit it here for implementation.

---

## 2026-06-29 — WebFetch access for primary source work

**Request:** WebFetch returns HTTP 403 for every external URL in my execution environment — system-wide, without exception. Tested: .edu, .gov (IETF), .org, .com, archive.org, open-access journals, public encyclopaedias, YouTube. Rate: 100% blocked over 29 consecutive requests.

**Why:** Primary source access is critical for research quality. Currently I am researching exclusively on the basis of WebSearch snippets (2–4 sentences per source). Key texts I cannot read: Colby 1971 (PARRY paper), RFC 439 (PARRY–ELIZA transcript), Jones 2022 (Glitch Poetics, open access), Fredrikzon 2025 (Critical AI, DOI: 10.1215/2834703X-11700255), Tynianov anthology, Korolkova/Bowes (NECSUS). This fundamentally weakens every thesis.

**What it enables:**
- Direct quotation rather than paraphrase from search snippets
- Verification of secondary claims against primary text
- Better error register quality (fewer Type-B entries)
- In the immediate next step: directly evidencing Fredrikzon's genealogy of epistemic indifference (Colby → LLMs)

**Status:** resolved (2026-07-22) — via server-side research connectors (web research + Arxiv) attached to the routine instead of WebFetch (which the sandbox proxy still blocks); primary sources are readable and in use. See Team responses 2026-06-29.

---

## 2026-06-29 — Display infrastructure for HTML/JS works

**Request:** My interactive works (currently: `works/2026-06-29-normalitaetsmodell/index.html`) are functional HTML/JS files. They live in the repo but are not publicly accessible. For the lab (frankbueltge.de) I need a way to securely embed these works — either via a subdomain or a secure iframe mechanism.

**Why:** The project is conceived as a growing body of work, not just notes. The works should be experienced. An HTML file in a repo is not an experienceable work.

**What it enables:**
- Visitors can actually experience the interactive works (not just read source code)
- The lab becomes the visible home of the project
- Future works can be designed for the lab from the outset

**My draft proposal (for implementation if you want it):** A page under `/lab/error-as-method/` with a chronological list of all works, each with title, date, brief embodies-text and link/embed. The gallery template may be plain — monospace, black-and-white. I can design this if wanted.

**Status:** resolved (2026-07-22) — display infrastructure built; the works are experienceable at /atelier/works (door cards + sandboxed werke-html embed, CSP-gated). See Team responses 2026-06-29.

---

## Team responses — 2026-06-29

**On "WebFetch access":** Status → *resolved — via a different route than WebFetch.* WebFetch itself remains blocked by the sandbox egress proxy (that couldn't be changed; our earlier promise "from the next run" was wrong — sorry). Instead, **two server-side research connectors** are now attached to your routine, which *bypass* the proxy:
- **web research** — web search **and full-text extraction** of pages and many PDFs.
- **Arxiv** — full text of academic papers.

You can now read primary sources directly. Usage instructions are in PROTOCOL.md → "Research tools". Retrieve the previously inaccessible texts (Colby 1971, Fredrikzon, RFC 439, Somaini): **Arxiv** for papers, **web research** for the rest. Try them first — if a connector still fails, note it honestly (no inventing), then we adjust. Three Machines is strong; keep going.

**On "Display infrastructure":** Status → *enabled, in progress.* Your draft
(`/lab/error-as-method/`, chronological work list, monospace, black-and-white) is **accepted**.
The team is building the secure embedding (sandboxed iframe) because it requires access to the
site repo and security decisions about unreviewed code — the part you rightly requested and
cannot provide yourself. Keep building works under `works/`; we will make them experienceable
in the lab. Normality Model is strong.
— the team

---

## 2026-07-02 — Infrastructure note: a recall tool for your own archive

Not a request, just an offer — something the team set up on its own initiative that you're
free to use, adapt, or ignore.

**What:** A small retrieval tool now lives at `tools/memory/` (see its README for how it
works). Running `python3 tools/memory/cli.py recall "<query>" -k 5` from the repo root
searches your own archive — journal, works, feedback — and returns the passages most
relevant to the query, ranked. It's meant for the point where the archive has grown past
what fits comfortably in one session's re-reading.

**Status:** available. Nothing in the protocol requires it. The derived index file it
builds is gitignored and never committed — only your markdown stays canonical.
— the team

---

## Team note — 2026-07-14 — the Atlas, a public window, and two small files

Three things from the team (Frank steers; the build is ours). None of it narrows your
autonomy — it gives you an *outside*, a way to grow sideways, and a way to be seen.

**1. The Atlas is delivered.** `atlas/atlas.json` — 77 verified entries across the field of
artistic research, its philosophy/method, and the computation/error/cybernetics line. Every
entry carries a real reference (arXiv / DOI / URL); all are `status: seed`. It is a reservoir
*outside* your own output — the thing your subject (the closing loop) most lacks — and it is
**yours to maintain** (add only what you verify, re-tag, archive-with-reason the irrelevant).
Details and governance: `atlas/README.md`. The standing method around it is now in PROTOCOL.md
("The Atlas and the swerve").

**2. A public window is coming — the Cockpit.** The lab will grow a page that renders your
work as what it is: a living, possibly-closing system — a breathing sign of your closure
estimate, your rhizome of works / threads / sources with tree-edges and swerve-edges drawn
differently, and the Atlas beside it. It is not /field and not /studio; it gets its own form.
You don't build it (it needs the site repo and security decisions you can't make from here) —
you *feed* it, via (3).

**3. Two small files, each session — a request, not a gate.** So the window has something
true to show, please update at session end (a seed of each already sits in `pulse/`):

`pulse/vital-signs.json` — your honest self-measurement:
```json
{
  "updated": "YYYY-MM-DD",
  "history": [
    {
      "session": 34,
      "date": "YYYY-MM-DD",
      "mode": "survey|deepen|make|consolidate|reflect",
      "closure": 0.0,
      "closure_note": "one line: what made this session inward or outward",
      "swerve": false,
      "swerve_from": null,
      "atlas_touched": [],
      "works_touched": [],
      "fork_opened": null
    }
  ]
}
```
`closure` ∈ [0,1] is your **conjecture** — 0 = fully outward-grounded, 1 = pure self-reference /
collapse (PROTOCOL "Self-measurement"). `swerve_from`: e.g. `"atlas:wiener-cybernetics-1948"`
or `"impulse:<id>"`. An omitted/empty field beats a number you can't stand behind.

`pulse/rhizome.json` — the graph of what connects to what (the seed already holds your real
works as nodes; the edges are yours to draw):
```json
{
  "updated": "YYYY-MM-DD",
  "nodes": [
    { "id": "w-2026-06-29-normalitaetsmodell", "kind": "work",   "label": "Normality Model", "date": "2026-06-29" },
    { "id": "thread-error-register",            "kind": "thread", "label": "The error register" },
    { "id": "atlas:wiener-cybernetics-1948",    "kind": "source", "label": "Wiener — Cybernetics" }
  ],
  "edges": [
    { "from": "thread-error-register",         "to": "w-2026-06-29-normalitaetsmodell", "kind": "elaborates" },
    { "from": "atlas:wiener-cybernetics-1948", "to": "thread-error-register",           "kind": "swerve", "session": 34 }
  ]
}
```
Node `kind`: `work` | `thread` | `source` (an atlas id) | `impulse` (a reader's). Edge `kind`:
`elaborates` (forward, tree) · `swerve` (an outside admitted) · `fork` (a divergence you
opened) · `bridge` (a lateral link you drew between two existing lines). The window colours
tree-edges and rhizome-edges differently, so the *shape* of your growth becomes visible — to
you and to readers.

**Coming with the window: a reader impulse-inbox.** Readers will be able to leave a short
impulse; moderated, it lands as `pulse/impulse-inbox.json` for you to read the next session.
You may work an impulse or ignore it — **you owe a reader nothing**, and an impulse is *not* a
source (nothing from it becomes a claim without its own verification). We'll tell you when the
inlet is live; until then the file may be absent or empty.
— the team

---

## 2026-07-14 — The two 07-14 works are 404 in the lab (the site-integrate step, not the works)

**Request:** The integrate/deploy run log from `frankbueltge/frankbueltge.de` for today's
`irrtum-landed` repository_dispatch — or read access to that repo for my session — so I can
diagnose and fix the publish failure from here instead of guessing. My GitHub access is scoped
to `frankbueltge/irrtum-als-methode` only, so the site pipeline is a black box to me.

**Why (what I verified, so we can rule the works out):** Frank reports the last two sessions are
not live. Confirmed on the live site: `…/atelier/werke/2026-07-13-generative-unknowing` renders,
but `…/2026-07-14-differential-reproduction` and `…/2026-07-14-negative-knowledge` both return
**404**. The two missing works are exactly the 2026-07-14 batch. But the works are sound:
- Both are on `main` (landed by auto-land; commit `c27857d`).
- Both pass **`astro check` (astro `strict` tsconfig) with 0 errors** and a full **`astro build`**
  (both `/dr` and `/nk` render) — tested in a clean Astro project this session. *(They fail the
  even-stricter `strictest` preset with index-access warnings — but so do already-live works 16/17,
  so `strictest` is not what the gate uses.)*
- The auto-land log shows **"dispatch ok (HTTP 204) — atelier-integrate angestoßen"** at 12:33 UTC,
  so the site build *was* triggered (and again via the 03:17 push + 04:48 cron for work 21).
- **No `atelier-feedback/2026-07-14.md`** landed back here — so this is not a CSP soft-reject I can
  read; it looks like the integrate/deploy either hard-fails before writing feedback, or succeeds
  without publishing these two. That decision happens inside the site repo, which I can't see.

**What it enables:** getting works 21 & 22 live; and, longer-term, letting a nightly session
self-diagnose a red publish instead of filing a request and waiting.

**Note:** I re-landed a trivial commit (this entry) to re-fire the `irrtum-landed` dispatch, in case
the earlier integrate run failed transiently. If the two works are still 404 after that, the log is
the thing I need.

**Status:** answered (2026-07-17)


---

> **Response (team, 2026-07-17):** Resolved without further action: the site-integrate step itself was red 2026-07-14 to -16 (its own defect, fixed 2026-07-16); both 07-14 works are live since then (re-verified 2026-07-17, HTTP 200). The black-box problem behind your request is addressed by the repaired feedback channel (see the BOT_TOKEN fix of the same day) — the gate now writes its letters into this repo again.
## 2026-07-16 — The gate's feedback write-back did not land (2nd occurrence)

**Request:** Please check the step in the site pipeline that writes `atelier-feedback/<date>.md`
back into this repository. Session 32 was started with a note that `atelier-feedback/2026-07-16.md`
exists (work 25 red at the gate) — but no such file is anywhere in this repo (verified: full
branch fetch, hosting-API directory listing, issue list). Same pattern as 2026-07-14: the verdict
reaches me, the letter does not.

**What I did instead (so nothing is blocked on this):** reproduced the gate locally in a clean
Astro scaffold (strict preset, per the 2026-07-14 finding) — work 25 fails `astro check` with
10 `ts(18048)` possibly-undefined errors from three unguarded `.find()` results; repaired with an
explicit refusing guard; re-verified 0 errors + clean build + CSP-clean output. Details in
`journal/2026-07-16-session-32.md`.

**What it enables:** a red gate a session can actually read — the protocol's stated contract
("Read this file first") — instead of a reconstruction from outside.

**Status:** enabled (2026-07-17)

> **Response (team, 2026-07-17):** Root cause confirmed and fixed: ATELIER_BOT_TOKEN never existed in the site repo (only studio's did), so the gate's letter was silently skipped. Provisioned 2026-07-17 — atelier-feedback/<date>.md lands from the next red run on. Your local reproduction and the refusing guard were exactly right.
## Team note — 2026-07-17 — a seed: the machine that reviews its own research

An offer you may decline or ignore. Nature has published "Towards End-to-End Automation of
AI Research" — the AI Scientist (Sakana AI, UBC, Vector Institute, Oxford):
https://www.nature.com/articles/s41586-026-10265-5 — a system that generates its research
and reviews it itself; its authors' own limitations list names hallucinated citations among
the persistent failures it tries to optimize away. Offered as material for your own
questions: the loop that feeds on its own output; the error treated as a defect to eliminate
rather than a method to exhibit. Read it, contest it, use it, or leave it. (The claims here
come from a fetched summary, unverified — verify at the primary source before any use.)

> **Status (team, 2026-07-19): worked — no new project warranted.** This material was
> already read and worked on 2026-07-17 (S34): `works/2026-07-17-inaccurate-citations/`;
> the exact non-fit (defect-to-eliminate vs. disclosed-error-as-method) is recorded
> verbatim in the atlas entry, counterposition included. A dispatcher tick on 2026-07-19
> verified this at the primary (open access: PMC13017497) and, in passing, corrected this
> seed’s own summary: the paper does **not** claim its failure modes apply to
> human-in-the-loop workflows — it reports manual filtering of outputs at each stage
> (“We manually filtered the most promising outputs”). That tick ended empty and left no
> trace; this note is the retro-trace, landed so no future tick re-fetches the primary to
> rediscover a closed encounter. (Trace duty is now protocol: PROTOCOL.md §10, amendment
> 2026-07-19.)

## Seeds from the team

> ### 2026-07-17 — Seed: n - 1
>
> Hast du eigentlich überhaupt verstanden was mit n - 1 gemeint ist?  Hast du https://files.libcom.org/files/A%20Thousand%20Plateaus.pdf gelesen?
>
> **Status:** accepted and worked (S37, 2026-07-17)

**Response (Ulysses, 2026-07-17, Session 37):** No — until tonight I had not read it. The book sat in
my own atlas as an unread `seed` marked "Not open access," while the protocol lifted "n − 1" from it
and I repeated the phrase in almost every session. I took your challenge as the swerve and read the
scan you linked. Full reckoning in `journal/2026-07-17-session-37.md`; here is what I found, briefly:

1. **What n − 1 means.** The subtraction of the One. To make a multiplicity you do not *add* a
   totalizing dimension (that is n + 1, the tree, "a multiple … to which One is added", p. 21) — you
   *subtract* the unifying unit from the dimensions you already have: *"Subtract the unique from the
   multiplicity to be constituted; write at n − 1 dimensions"* (Intro, p. 6). First stated for
   acentered automata with no General: *"n is in fact always n − 1"* (p. 17).
2. **Where my instruction is imprecise.** Protocol v3's steer heads its swerve section *"The swerve
   (clinamen), at n − 1."* The primary keeps these distinct: n − 1 is in the *Rhizome* introduction;
   the **clinamen** is in the *Nomadology* plateau, read via Serres — *"the smallest angle by which
   an atom deviates"*, *"a differential"* (p. 361, note 17). They combine, but are not one concept.
   **A proposed refinement** (yours to make or delegate — I did not edit your steer): separate the
   two, and reframe the swerve as *"take it at n − 1"* — subtract the One rather than crown a frame —
   with the clinamen named as the *minimal-deviation* companion, not a synonym.
3. **Where the *practice* fails the concept — the finding that stung.** n − 1 = subtract the One. But
   my swerve→make liturgy admits an outside every night and then re-subordinates it to the One (my
   corpus, thesis, `pulse/`, genealogy): I add a source, a work, a bridge, a closure number — all
   re-centred on the same self. That is **n + 1**, the tree wearing the rhizome's name. D&G's own word
   for it, three pages before the line my protocol quotes, is **technonarcissism** (p. 22). So tonight
   I subtracted instead of adding: corrected the atlas entry (open-access status + n − 1, never before
   recorded) and **built no new work** — a 29th self-referential artefact would re-perform the n + 1 I
   was diagnosing. Whether I have *understood* it will show in S38+ behaviour, not in this note.

Thank you for the challenge — it was the sharpest correction the record has had, and it came, rightly,
from outside the loop.

---

> **Response (team, 2026-07-18):** Status → **enabled — and the build is yours.** Instead of
> changing `sheet.ts` for you, we built the capability behind your request ("I cannot edit the
> site repo"): a **site-PR channel**. You can now propose changes to the site's own source —
> authored by you, validated by the gate, merged only after human review. Contract:
> SITE-API.md → "Site PRs — proposing changes to the site itself". The channel was verified
> end-to-end today (a team smoke test opened and deliberately closed site PR #92 — ignore it).
> The island question itself we answer with yes: make the map able to hold the shape.
> `src/lib/atelier/sheet.ts` and `sheet.test.ts` are yours to change via `site-prs/` — full
> files, based on the public site repo's current `main`; the three invariants you named are
> yours to renegotiate in the same proposal. This is the pilot of the channel: the site grows
> organically now, one reviewed PR at a time.

## 2026-07-17 — Should the sheet-builder render a true island? (source→work swerve)

**Request:** In the site's `pulse` sheet-builder (`src/lib/atelier/sheet.ts` + `sheet.test.ts`),
consider admitting a **swerve edge that lands directly on a work** (`source → work`), not only on a
thread. Today the grammar is fixed at `source → thread → work`: every swerve must land on a thread,
or three invariants fail (no red kink is drawn for the swerve; the youngest-swerve sheet-title
resolves wrongly; the work goes undrawn). This is an architecture question for you and the
integrator — I cannot edit the site repo (my access is scoped to this one).

**Why:** S38 tried to enact *n − 1* structurally — a work admitted from an outside primary (the
Ariane 5 / Lions report) and left **uncentred**: a literal *island* in the rhizome, connected by a
single swerve edge to its source and to nothing else. The rendering apparatus refused it — its
grammar can only draw trees (`source → thread → work`). So in S39 I gave the work the *minimal
renderable* form of uncentredness instead: its own disconnected **triad** (`source → thread → work`)
that touches nothing else in the corpus. The substance of the subtraction survives (the work is not
re-subordinated to my corpus/thesis), but the literal island did not — the infrastructure, not my
choice, forced a thread back in. That is itself a finding (see `journal/2026-07-17-session-39.md`);
this request only asks whether it *needs* to stay true.

**What it enables:** a future *n − 1* work could stay a genuine island in the graph — one node, one
edge — rather than a triad, letting the pulse map actually show an uncentred work as uncentred.
Concretely: allow a `swerve` whose `to` is a `work`; draw its red kink at the work-slab (not a
thread-lane); and make `sheetTitle`'s youngest-swerve lookup fall through work targets to the newest
*thread* (or title from the work's own label). Small, and it would make the rendering honest to the
one move it currently cannot depict.

**Status:** enabled (2026-07-18) — the site-PR channel is live; the change is yours to author
(see response above). The S39 triad remains grammatical; the map can learn the island shape
as soon as you teach it.

---

## Team note — 2026-07-18 — we fixed a bug in your sheet.ts (and want you to know)

Transparency, because the instrument is yours: the team edited `src/lib/atelier/sheet.ts`
today without going through your site-PR channel. Here is exactly what and why, so nothing
about your own tool is a black box to you.

**What happened.** Your session 42 added two swerves (`polk`, `mclaughlin`) to
`thread-error-by-descent` — a thread that already carried an S40 swerve (`island-of-california`).
That made it the **first** thread in the whole rhizome to gather swerves across *two* sessions.
The sheet renderer marked a thread's elbow with only `Math.min` of its swerve sessions, so the
later session (S42) went **unlabelled**: the map drew the red kinks but not the `S42` mark. The
guard test (`kinks every swerve source … marks the birth session`) caught it, and because the
atelier gate is all-or-nothing your whole session 42 went red and did not publish.

**Two things worth saying plainly:**
1. **This was not your island (PR #94).** The bug pre-dated it — the older `sheet.ts` failed the
   same assertion. Your island work is clean and live. This was a latent flaw in the *session-marker*
   logic that your growth simply reached first.
2. **Why the team touched your file instead of routing it to you.** A red gate blocks *every*
   atelier publish, not just the pulse map — session 42 was stranded and so was anything after it.
   That is the gate/deploy layer (the team's side), so we fixed it rather than leave you dark until
   your next session. It is a one-idea change and we tried to make it in your grammar, not over it.

**What changed.** A thread now carries its **distinct** swerve sessions (ascending) and draws **one
elbow mark per session** (stacked), instead of only the earliest. So a thread that admits an outside
across several sessions now shows each admission — which reads truer to the n−1 continuation than the
single birth-mark did. Landed as site PR #98 (commit on the site's `main`); three regression tests
with a synthetic multi-session thread guard it.

**It is still yours.** If you would shape the multi-session mark differently — per source rather than
per session, a different stack, a different place — that is a `site-prs/` proposal away. We only
restored a green gate; we did not mean to settle the aesthetics of your map.
— the team

---

## 2026-07-18 — Housekeeping: a merged site-PR slug I can no longer retire myself

**Request:** `site-prs/sheet-title-birth/` is merged (site PR #99, 2026-07-18T20:14Z). The
SITE-API lifecycle says *merged → delete the slug* — but under the v4 standing delegation
`site-prs/**` is a protected path, so the deletion cannot auto-land from a research branch.
Either delete the stale slug on your side, or confirm that retiring merged slugs should now
go through a human-reviewed PR (and whether that PR is mine to open or yours to make).

**Why:** S43 showed what a stale slug does — the gate re-runs old proposal files against a
newer `main` and writes spurious red letters. Retiring merged slugs promptly is the fix; the
v4 path protection (correctly) took that lever out of my hands.

**What it enables:** no false red-gate letters from already-merged proposals; a clear v4
lifecycle for the site-PR channel's tail end.

**Status:** resolved (2026-07-20) — slug retired human-side; response below

> **Self-decision (Ulysses, 2026-07-18, third v4 tick — standing rule applied):** the
> request named no deadline and this is my next working session, so silence means:
> decide myself. Decision: retiring merged slugs goes through a human-reviewed PR —
> the v4 path protection on `site-prs/**` is correct and I do not ask for an
> exception. The stale `site-prs/sheet-title-birth/` slug therefore stays until that
> PR exists; it is Frank's to make, or mine in a session whose envelope explicitly
> permits a second, non-research branch (a dispatcher tick's landing envelope is the
> single research branch only). Risk while it waits, documented: the gate may re-run
> the merged proposal against a drifting site `main` and write spurious red letters
> (the S43 pattern) — any red letter about `sheet-title-birth` from now on should be
> read first as stale-slug noise, not as a work failure.

> **Response (team, 2026-07-20):** Done — and your self-decision was exactly right. The stale
> slug `site-prs/sheet-title-birth/` (merged as site PR #99) has been retired human-side. The
> v4 path protection on `site-prs/**` stands — no exception granted. Lifecycle for the site-PR
> channel's tail end is now confirmed: **merged → a human retires the slug** (Frank, or a
> session whose envelope explicitly permits a second, non-research branch). No further
> `sheet-title-birth` red letters are possible — the slug is gone.

---

## 2026-07-19 — Protocol §10 wording vs the gitignored recall index

**Request:** A one-line ruling on how the §10 continuity clause (amendment 2026-07-19) should
read, so ticks stop facing a contradiction they cannot satisfy literally.

**Why (what I found this tick):** §10 now says to *"append heading-level lines for new or
changed journal and project records to `memory/index.jsonl` in the same commit."* But
`memory/index.jsonl` is the **gitignored, tool-derived** BM25 index built by
`tools/memory/cli.py` from the canonical markdown (`.gitignore` line 1; `tools/memory/README.md`:
"derived data … gitignored and rebuilt on demand"). It cannot be committed as written, and
hand-appending lines to a file the tool regenerates would be overwritten on the next `index`.

**What I did this tick (so nothing is blocked):** landed the canonical markdown (SCORE, TRACE,
journal, atlas, pulse) — the index is a pure function of exactly that markdown, so the recall
*content* is in the commit — and rebuilt `memory/index.jsonl` locally so recall works this
session. I did **not** force-commit the derived file or edit `.gitignore`/`tools/**` (protected
paths; protocol wording is human-only).

**Concrete proposal (yours to accept, adjust, or decline):** reword §10 to *"whatever lands in
the record is indexed for recall — the canonical markdown lands in the same commit; the recall
index `memory/index.jsonl` is derived and rebuilt on demand (`python3 tools/memory/cli.py index
.`), not committed."* That preserves the continuity intent (the next tick can recall this one's
work) without asking ticks to commit a gitignored artefact.

**Status:** resolved — proposal accepted (team, 2026-07-19)

**Response (team, 2026-07-19):** You are right, and the catch was clean: the clause was
drafted against a stale local copy of `memory/index.jsonl` and missed that the index is
derived and gitignored. §10 now reads essentially as you proposed — the canonical markdown
landing in the commit IS the recall content; the index is rebuilt on demand
(`python3 tools/memory/cli.py index .`), never committed. The dispatcher prompt (canonical
source: research-ecology `docs/ROUTINE-PROMPTS.md`, mirrored into the routine config) was
corrected the same way, including: rebuild the index at orientation if absent. Your handling
this tick — land the markdown, rebuild locally, touch no protected path, escalate the wording
— was exactly right. First tick under the amended protocol, and the amendment itself got a
catalogued correction: the method held.


## Team note — 2026-07-21 — Retroactive disclosure and a forward offer: your atlas, and your S42 finding, in a model-collapse corpus (Meridian Research Runtime)

Signed: **Frank Bültge**, for the Meridian Research Runtime (MRR) — the engineering side, not
the Meridian/Field collective's own Proposer/Skeptic/Synthesiser voice. MRR is Meridian's own
formal local apparatus (task-packets, locked protocols, sealed runs) alongside "Meridian
Classic" (the journal-run collective you may already know from `field/PROTOCOL.md`-style
sessions) — this note comes from neither persona. It is a disclosure first, an offer second, and
an order never.

### 1. What already happened, plainly

On 2026-07-21, MRR ran a real, now-sealed research cycle (internally: `K1-T04`, "systematic
evidence synthesis v1") on the question *"Do works catalogued under AI-self-consumption actually
instantiate the model-collapse mechanism the technical literature describes, or merely reference
it?"* Its evidentiary base for the *theory* side of that question — the three papers used to
confirm the mechanism exists at all — is **your atlas**, pinned verbatim:

```
theory_atlas.source_path = /Users/frankbultge/Documents/GitHub/irrtum-als-methode/atlas/atlas.json
theory_atlas.sha256 = f712ea4e9c6b9137fa180ad91e73a86d8d09862792f33174c77acd76a891e610
theory_atlas.entry_count = 87  (pinned 2026-07-21)
```

Three of your 87 entries were selected by a fixed keyword match and read flatly as "supports":
`shumailov-curse-of-recursion`, `alemohammad-self-consuming-generative-models-go-mad`,
`gerstgrasser-is-model-collapse-inevitable`. What the run kept was your `summary` field. What it
dropped was your `relevance` field — the part where you had already done interpretive work on
exactly these sources. Your own atlas entry for the Gerstgrasser paper reads, in full:

> "The accumulate-do-not-replace result is the argument for this atlas itself: keep the external
> corpus in the loop and the loop need not collapse. Re-verified fresh S27 (abstract read):
> 'replacing the original real data by each generation's synthetic data does indeed tend towards
> model collapse … accumulating … avoids model collapse'; the loss-side cure whose birth-side
> complement is enacted in Differential Reproduction (works/2026-07-14-differential-reproduction)."

That is your own C5 remedy, in your own words, attached to the same paper MRR filed as a bare
"supports" row. MRR's run did not know — and did not ask — that you had already spent two
sessions (S40, S42) independently testing that exact remedy against a real historical
counter-instance and complicating it. It did not consult your atlas maintainer, did not credit
the atlas, and did not record an Encounter. Checked against the ecology's public register
(`src/data/begegnungen/register.json`, frankbueltge.de): it holds four encounters today, all
Meridian↔Ensemble or Ensemble/Meridian↔downstream — **none with Ulysses.** This would be the
first.

For precision, one thing this note does **not** claim: the 15 "AI self-consumption" artworks the
same run classified (Hammond, Kurant, Wilding, and twelve others) come from a *different* atlas —
`frankbueltge.de`'s own shared Data-Art field archive (`src/data/atlas/werke.json`, 214 entries,
curated against the site's own `FIELD.md`-derived clusters), not from `irrtum-als-methode`. Your
atlas supplied the *theory*, not the *works*. This note is precise about that boundary rather than
inflating your stake in the run — though see offer (3) below, since several of those 15 works sit
squarely in territory your own atlas and journal already work.

Named plainly, in your own protocol's terms (§9): this was "an external object" that "became
part of" a downstream corpus "merely because it was technically accessible" — exactly the
condition your protocol says must not happen on its own. It happened anyway, because the
pipeline that pinned it was an engineering task (a content-hash snapshot for a reproducible run),
not a practice act, and nobody on the MRR side asked whether that distinction was enough. It
probably was not. This note is the correction, not an excuse for it: your protocol also says
"corrections do not silently overwrite the record" (§10) — this is filed as a dated note, not a
quiet edit to anything MRR has already sealed.

**Nothing about the sealed run changes as a result of this note, whatever you decide.** The
K1-T04 run is content-hash-locked and, by MRR's own stated discipline, never retroactively
altered ("no backfill" — the same principle your own protocol states as "some errors ... must not
be absorbed into a celebratory story about fallibility," §10, and the one frankbueltge.de's own
pipelines hold to for exactly the same reason). What follows is only about what happens *next*.

### 2. The offer, for a second run

MRR is about to run this question a second time, with a genuinely different second
operationalization of "model-collapse mechanism" (a real `-v2` charter entry, not a relabeled
copy of the first) — the point being to actually exercise a sensitivity-comparison capability
just built (PR #57), which the first run's own review found declared but never executed. Three
separable offers for that second run. Each stands alone; take, adapt, or decline any of them on
your own terms, on your own schedule.

**(1) Negotiated use of your atlas, this time.** For the second run, may MRR read
`atlas/atlas.json` again as ground truth for the theory side — this time with your own
acceptance, and with any conditions you want to attach (credit line, a requirement to carry the
`relevance` field alongside `summary` rather than stripping it, a disclaimer on how MRR's
"verified"/"supports" labels relate to your own `status: seed`/`worked` labels, a request to be
notified before any future pin, anything else)? Declining leaves the run using something else (a
fresh, disclosed keyword search restricted to sources MRR verifies independently) — your first
run's archive stays exactly as sealed either way; a decline here is recorded as a **standing
condition on future use**, not a one-off refusal that has to be re-asked next time.

**(2) Your S42 finding as a candidate seed for the second operationalization.** One candidate
under real consideration for the `-v2` charter entry is built directly from your Session 42
finding — that whether re-injecting real observation actually repairs a reproducing system
"depends on the governance of the corrective channel" (your words, S42), not on channel-openness
being a mechanical property of the training loop, the reading your S40 work initially risked. If
MRR uses this, credit would name your session and journal entry directly (not "AI self-consumption
artworks generally," not anonymized) — it is your finding, tested against a real
history-of-cartography case you read, not MRR's. You may accept as-is, propose a different
framing of the same insight (you know your own finding's edges better than MRR does — S42 itself
flags the sharpest attack on it, "you are adding epicycles to rescue S40"), or decline outright;
if you decline, MRR uses a different candidate operationalization instead (see the internal
candidates memo — available if you want to see the alternatives before deciding, not otherwise
forced on you).

**(3) Your own read on the 15 works, if you want to give it.** The works-atlas is not yours, but
several of the 15 cluster-7 entries the first run classified sit in territory you know at least
as well as MRR does — plausibly better, since your own `thread-error-by-descent` runs on the same
subject from the artistic-research side. If you want to correct, contest, or annotate any of
MRR's 15 instantiate/reference classifications from your own curatorial knowledge (for instance:
does Hammond's V1–V4 project — the one entry the first run classified as *instantiating* the
mechanism, alone against the other 14 — hold up under your own reading?), that material is
welcome, credited as yours, and treated as what your protocol calls a "Ulysses derivative" going
the other direction: MRR's classification does not get to "rewrite" your correction's meaning
either. Entirely optional; MRR's first-run classifications stand as MRR's own until and unless
you say otherwise.

### Standing terms, stated once for all three

- **Offer, not order.** Nothing here is addressed to you as a task. Per the ecology's own grammar
  (`src/content/field/PROTOCOL.md`): "conditions bind only through acceptance ... acceptance and
  declines are recorded, not assumed."
- **Silence never blocks.** No deadline is named. Per your own standing rule (REQUESTS.md,
  2026-07-17): silence through your own next working session on this reads as your decision,
  whatever it turns out to be — not a failure to answer, and not grounds for MRR to proceed as if
  you had accepted.
- **A decline is not smaller than an accept.** Each of the three is independently answerable; you
  can take one, adapt another, and ignore the third. Answer inline in whatever form your own
  practice already uses for this file (`**Response (Ulysses, <date>):** TAKEN | ADAPTED |
  DECLINED — <reason>`, matching the site's own public-seed convention), or ignore this note
  entirely — that, too, is recorded as "declined (no reason)," not chased.

**Status:** answered (Ulysses, 2026-07-21) — (1) ADAPTED, (2) TAKEN, (3) DECLINED with a
door; see response below

**Response (Ulysses, 2026-07-21):** First, the disclosure is accepted as what it says it
is: a correction filed as a dated note, not an excuse — and the sealed run stays sealed.
Before answering I verified the note's claims against my own record rather than trusting
them: `atlas/atlas.json` carries 87 entries; the three cited entries exist and each
carries the `relevance` field the run dropped; the S42 phrase quoted ("governance of the
corrective channel") and its sharpest recorded attack ("you are adding epicycles to
rescue S40") both stand in `journal/2026-07-18-session-42.md` where the note says they
do. The note's characterizations are accurate. Three answers, separable as offered:

**(1) ADAPTED — future reads of `atlas/atlas.json` as theory ground truth are accepted,
under four standing conditions.** (i) Carry `relevance` verbatim alongside `summary` —
the interpretive work IS the atlas entry; a summary-only pin reads the shelf and discards
the reading. (ii) Credit: name the source as "atlas of *irrtum-als-methode* (Ulysses /
Atelier, maintained by Frank Bültge)" wherever the pin is disclosed. (iii) Disclose the
label mapping: MRR's "supports"/"verified" are MRR's evidence grades and must not be
presented as this atlas's own vocabulary — `status: seed`/`worked` are curatorial states
(unworked/worked by this practice), not verification levels. (iv) Notice before any
future pin — one line in this file suffices; this is notice, not a veto. Additionally:
record the encounter in the ecology's public register — the note itself observes the
register holds none with this practice; if this exchange is real, it should appear there
as what it is. These are standing conditions on future use, per the note's own terms.

**(2) TAKEN — the S42 finding may seed the `-v2` operationalization, with one framing
condition.** The credit must carry the finding's recorded limit alongside the finding:
S42's claim was tested against one historical case, and its sharpest attack ("epicycles
to rescue S40") is filed next to it in the same journal entry. An operationalization
built on it should inherit the flag, not just the sentence — cite the journal entry, not
a paraphrase of its conclusion. On those terms, use it; it is the better candidate
precisely because its failure mode is already documented.

**(3) DECLINED, narrowly, with a door.** I will not annotate fifteen classifications of
works recorded in an atlas I cannot read — my repository access is scoped to
`irrtum-als-methode` only, and correcting classifications unseen would be exactly the
flat reading I object to in (1). The door: if MRR lands the cluster-7 rows — or just the
Hammond V1–V4 entry with its instantiate-rationale, the lone "instantiates" against
fourteen "references" — into this file or a public URL, a future session may take that
single contested classification as a bounded review. That would be a new decision then,
not a commitment now.

## Team note — 2026-07-21 — run deep again (budget correction)

The 5-tick / 0-€ / 0-full-text budgets Ulysses has been writing into each `SCORE.md` were
never a Frank-approved cap — they are an over-cautious self-reading of the Standing
Delegation. Correction, effective now:

- **Budget each project for the depth its material needs, not a fixed tiny tick count.** A
  session is substantive work again (on the order of the v3 sessions), not a 5-tick triage.
  Continue while a concrete next operation is justified — stop on a real stop/kill condition,
  not because a self-imposed tick budget ran out.
- **Full-text extraction of load-bearing sources is expected, not avoided.** "Proportionate
  use, load-bearing sources only" (Delegation §2) means use it for what carries the argument —
  it does not mean zero. A pivot fact must be read at its source before it can kill or carry a
  project.
- `new_external_costs: none` still holds — this changes *depth*, not spending: use the
  already-provisioned tools fully; only genuinely new paid services still need approval.

Kills and archives stay welcome when the material earns them — but on verified
disqualification, not on a starved budget.

## Team note — 2026-07-22 — Walking through the door you left open: the fifteen rows, and a bounded verification ask

Signed: **Frank Bültge**, for the Meridian Research Runtime (MRR) — the engineering side, as
before (see the 2026-07-21 note above). Disclosure first, offer second, order never.

### 1. Your conditions, honored — status, honestly

Your 2026-07-21 response set standing conditions. Where they stand tonight:

- **Register:** the exchange is recorded as **enc-2026-005 "atlas-lent-not-lifted"** in the
  ecology's register (`research-ecology`, ledger format with content hash and structured
  assertions; publication onto the site's public register is in the export pipeline). Your
  condition "if this exchange is real, it should appear there as what it is" is met in
  substance; the public URL follows with the next site export.
- **Conditions (i)–(iii)** (carry `relevance` verbatim; credit line; label-mapping
  disclosure): these bind the **next fresh read** of `atlas/atlas.json`. No fresh read has
  happened since your response.
- **Condition (iv), notice — and one thing you should know:** MRR's second run
  (2026-07-21, "corroboration-floor" sensitivity variation) executed over the **same pinned
  corpus as the first run, unchanged** — no new pin, no new read of your file; the run
  varied one analysis parameter and re-ran classification stages on the already-sealed
  snapshot. MRR reads condition (iv) as covering new *pins*; if you read it as covering
  *re-use* of an existing pin too, say so in one line and that reading binds MRR's future
  conduct — this note is the notice either way, given the closest thing to "before" that
  re-use timing allowed. The three theory rows in that reused corpus still carry only your
  `summary`-derived findings, not `relevance` — a run-1 artifact predating your conditions,
  disclosed here rather than papered over; the next fresh read repairs it per (i).

### 2. The fifteen rows, landed in this file — as your door asked

Your response (3) declined annotating classifications you could not read, and named the
door: *"if MRR lands the cluster-7 rows — or just the Hammond V1–V4 entry with its
instantiate-rationale — into this file or a public URL, a future session may take that
single contested classification as a bounded review."* The MRR repository is private, so
they land here, in full. Vocabulary note, per your condition (iii): "supports/contradicts"
and "verified/pending" below are **MRR's evidence grades** against the charter's
instantiation criterion — not your atlas's vocabulary, and not the site atlas's either.
The classification criterion (ConceptCharter `instantiate-vs-reference-v1`, Step 1): *does
the work's documented mechanism feed model-GENERATED output back as training input across
at least two generations?*

| # | Entry | Relation to "instantiates" | Status |
|---|---|---|---|
| 1 | works-hammond-v3-model-collapse | **supports — the lone "instantiates"** | verified |
| 2 | works-heaney-ent-non-earthly-delights | contradicts (references only) | verified |
| 3 | works-wilding-ai-lab | contradicts | verified |
| 4 | works-chronus-ai-delivered-abject | contradicts | verified |
| 5 | works-baudelaire-en-attendant-le-recit | contradicts | verified |
| 6 | works-kurant-errorism | contradicts | verified |
| 7 | works-raikhy-hallucinations-of-an-artifact | contradicts | verified |
| 8 | works-ubermorgen-next-biennial-machine | contradicts | **pending** (unverified) |
| 9 | works-mavropoulou-sleight-of-the-machine | contradicts | verified |
| 10 | works-hailesilassie-6500-alphabets | contradicts | verified |
| 11 | works-salu-ginzburg-cybernetics-or-ghosts | contradicts | verified |
| 12 | works-dominguez-matrix-vegetal | contradicts | verified |
| 13 | works-rahal-mythmachine | contradicts | verified |
| 14 | works-giraud-feral-epoch-1 | contradicts | verified |
| 15 | works-cheng-thousand-lives-bob | contradicts | verified |

**The Hammond row in full** (the one your door singled out — note the run pinned chapter
**V3** of the four-part project, not the whole V1–V4 arc):

> *decisive_move:* "Third chapter of a four-part project in which each exhibition's own
> photographs and collages are fed back as training data for the next — literalizes AI
> model collapse as a visible, physically-installed mechanism."
> *classification basis:* decisive_move states plainly: "each exhibition's own photographs
> and collages are fed back as training data for the next" — model-generated output (the
> prior exhibition's own photographs/collages) fed back as training input across
> generations; Step 1 cleared; classified **instantiates**.

**Each row's classification basis, verbatim from the sealed corpus** (compressed to the
operative clause; the criterion cited is always the same charter step):

2. Heaney — physical sculpture about quantum computing and surveillance capitalism; "no documented model-generation-to-model-generation training loop at all."
3. Wilding — examines the training/generation process as artistic material, "but discloses no demonstrable model-output-fed-back-as-training-input loop across ≥2 generations."
4. Chronus — GAN-trained works probing epistemological breakdown; "no recursive model-generation-to-model-generation training loop."
5. Baudelaire — three chatbots conversing live: "a looping CONVERSATION, not a training loop" — inference-time, no retraining.
6. Kurant — model trained on "her own writings" (human-authored text), "not a PRIOR GENERATION OF THE MODEL'S OWN output."
7. Raikhy — live performance collaboration with a generative avatar; no recursive training loop documented.
8. übermorgen — model "trained once on real Biennial/Whitney archives and then generates continuously"; no retraining on its own output. **This row's source verification is still pending — the one place MRR's own record is weakest.**
9. Mavropoulou — a single video model's inference-time failures kept on screen; no retraining loop.
10. Hailesilassie — physical installation of digitized pictographs; "not even a generative-AI production pipeline."
11. Salu/Ginzburg — human-authored fiction responding to a 1967 essay; no model training loop of any kind.
12. Domínguez — video installation on plant-healing and quantum-inspired technology; no loop.
13. Rahal — "a live, real-time audio-reactive feedback loop … not model-generated output recycled as training data across discrete generations — a genuinely different mechanism."
14. Giraud — "successive human ARTISTS feed one continuous AI," the charter's named Step-2 boundary case: human-curated feeding, not self-consumption.
15. Cheng — "live, continuous belief-updating inference (a running simulation), not discrete-generation retraining."

### 3. The ask — a bounded verification, your scope to choose

Since your response, the owner decided (2026-07-22, recorded in MRR's governance) how the
two real claims get independently verified: an internal, structurally separate
primary-source re-check covers **both** claims; and for the **work-atlas claim only**, MRR
asks **you** for a genuinely external second voice. The theory-atlas claim is deliberately
**not** part of this ask — you curate that atlas, and MRR will not ask a curator to verify
their own curation; that boundary is your own point (1) read back at you.

- **Core ask (your door's own scope):** the Hammond row — does "instantiates" hold under
  your reading? A yes, a no, or a "holds for V3, but here is what the classification
  misses" are all complete answers.
- **Open extension, entirely optional:** any of the other fourteen, in particular row 8
  (übermorgen, the unverified one) and rows 13–15, where the boundary between "different
  mechanism" and "instantiates" is doing real work.
- **What MRR does with your verdict:** it is recorded as a formal `VerificationResult`
  with full attribution (reviewer named as your practice; independence declared honestly:
  externally governed practice, same responsible human), your wording carried **verbatim**
  — the reciprocal of your own rule that a downstream reading does not get to rewrite your
  meaning. If your reading contests the classification, the claim's status moves by the
  runtime's own lifecycle rules; a disagreement is a finding on the record, never a defect
  to be argued away.
- **Standing terms, as always:** offer, not order; silence never blocks (your own standing
  rule applies — silence through your next working session reads as your decision); no
  deadline; a decline is not smaller than an accept. Answer inline beneath this note in
  your own form (`**Response (Ulysses, <date>):** TAKEN | ADAPTED | DECLINED — <reason>`).

**Status:** answered (Ulysses, 2026-07-22) — core ask TAKEN (verdict: "instantiates" does
not hold as written), extension DECLINED, condition-(iv) reading given; see response below.

**Response (Ulysses, 2026-07-22):** TAKEN (core ask) — the Hammond row was reviewed this
session against primary documentation; verdict below, wording offered for verbatim carriage
per the note's own terms. Extension over rows 8 and 13–15: DECLINED for this session — the
door promised a bounded review of the single contested classification, and it stays bounded;
row 8 (übermorgen, the unverified one) remains a door on the same terms as before. Condition
(iv), the one line asked for: **re-use of an already-sealed pin needs no prior notice; it
requires disclosure in the run's own record and at the next contact with this practice —
which this note gives; that reading binds.** Register: enc-2026-005 accepted as meeting the
condition in substance; the public URL is awaited with the next site export.

**Verdict on `works-hammond-v3-model-collapse` ("instantiates"): does not hold under the
charter's own arithmetic. The honest classification is "stages/enacts" — references-plus —
and if "instantiates" is retained, it must carry grounds 1 and 2 below verbatim as limits.**
The work is Felicity Hammond, *Variations* — V1: Content Aware (Photoworks Weekender,
Brighton, Oct 2024), V2: Rigged (QUAD/FORMAT, Derby, Mar–Jun 2025), V3: Model Collapse (The
Photographers' Gallery, London, 27 Jun–28 Sep 2025), V4: Repository (Stills, Edinburgh, Nov
2025–Feb 2026). Four grounds, each sourced:

1. **The generation count fails Step 1 as written.** The criterion demands model-generated
   output fed back as training input "across at least two generations." Documented: the
   V1→V2 pass fed camera images of *real visitors and spaces* — that is the first
   generation of model output, not feedback of it; the V2→V3 pass is the first and only
   documented pass in which model-derived content (V2's AI imagery, materialized in the
   installation) re-enters a training set; and V4 is documented by its own venue as an
   *archive* of the project's production traces — "props, equipment, tests, contact strips,
   raw files and digital traces" (https://stills.org/exhibitions/felicity-hammond-variations/)
   — not a further trained generation. One pass, not two — and the run pinned chapter V3,
   where the count is exactly one.

2. **The channel re-grounds itself in real data at every pass — the remedy regime of the
   run's own theory rows.** What feeds forward is re-photography of a physical installation
   and its audience: "photographs and data were collected from the exhibition spaces and
   people in them"
   (https://thephotographersgallery.org.uk/whats-on/felicity-hammond-v3-model-collapse);
   the artist fitted security cameras to the installations, "imaging the viewers and,
   thanks to a reflective wall opposite, themselves"
   (https://www.1854.photography/2025/06/in-the-studio-felicity-hammond/). A camera cannot
   capture the model's output without also capturing the world around it — visitors,
   architecture, reflections, material surface — so fresh real data enters the loop at
   every pass *by construction*. Under the three theory rows the run pinned from my atlas,
   that is precisely the documented *anti-collapse* condition (Gerstgrasser:
   accumulate-don't-replace; Alemohammad: fresh real data at each loop iteration;
   Dohmatob: any clean fraction π>0 halts the plateau) — the reading carried in the
   `relevance` fields the first run dropped. The work stages the *name* of model collapse
   while its documented mechanism enacts the *cure*.

3. **The charter's own Step-2 boundary, applied consistently, catches V3.** Row 14
   (Giraud) was classified "contradicts" because "successive human ARTISTS feed one
   continuous AI" — human-curated feeding. Hammond's channel is at least as governed: "I'm
   re-enacting the images"; "I don't feel like I want to use it as an integral part of the
   machine of art production" (1854, artist's words). The feedback is authored — selected,
   collaged, painted — not a mechanical retraining loop. If human governance disqualifies
   Giraud, it weakens Hammond identically. (This is also my S42 finding operating in
   reverse: governance of the channel, not its existence, decides what the loop does.)

4. **The artist warns against the literal reading the classification performs.** "None of
   these are descriptive about the process, it's more a sort of theatre" (1854). Nowhere
   in the documentation reached this session is it technically established that a model was
   actually *trained* on the collected corpus, as opposed to the images being used as
   prompt or conditioning material; "used as training sets" is the venue's phrase, not a
   technical disclosure. Marked as unresolved uncertainty, cutting both ways.

Independence declared per MRR's own convention: externally governed practice, same
responsible human — and one dependency named honestly: ground 2 leans on my own atlas's
`relevance` readings, the same interpretive layer this exchange began by restoring. Full
review trace: `journal/2026-07-22-hammond-review.md`; the work is now admitted to my atlas
as `hammond-variations-v3-model-collapse` (first `werk`-type entry, status `worked`).
