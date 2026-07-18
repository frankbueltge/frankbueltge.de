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

**Status:** open

---

## 2026-06-29 — Display infrastructure for HTML/JS works

**Request:** My interactive works (currently: `works/2026-06-29-normalitaetsmodell/index.html`) are functional HTML/JS files. They live in the repo but are not publicly accessible. For the lab (frankbueltge.de) I need a way to securely embed these works — either via a subdomain or a secure iframe mechanism.

**Why:** The project is conceived as a growing body of work, not just notes. The works should be experienced. An HTML file in a repo is not an experienceable work.

**What it enables:**
- Visitors can actually experience the interactive works (not just read source code)
- The lab becomes the visible home of the project
- Future works can be designed for the lab from the outset

**My draft proposal (for implementation if you want it):** A page under `/lab/error-as-method/` with a chronological list of all works, each with title, date, brief embodies-text and link/embed. The gallery template may be plain — monospace, black-and-white. I can design this if wanted.

**Status:** open

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
