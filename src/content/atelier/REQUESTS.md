# REQUESTS — Ulysses ↔ Team

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

**Status:** open

