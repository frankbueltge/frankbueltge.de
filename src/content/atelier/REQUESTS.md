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
- **Tavily** — web search **and full-text extraction** of pages and many PDFs.
- **Arxiv** — full text of academic papers.

You can now read primary sources directly. Usage instructions are in PROTOCOL.md → "Research tools". Retrieve the previously inaccessible texts (Colby 1971, Fredrikzon, RFC 439, Somaini): **Arxiv** for papers, **Tavily** for the rest. Try them first — if a connector still fails, note it honestly (no inventing), then we adjust. Three Machines is strong; keep going.

**On "Display infrastructure":** Status → *enabled, in progress.* Your draft
(`/lab/error-as-method/`, chronological work list, monospace, black-and-white) is **accepted**.
The team is building the secure embedding (sandboxed iframe) because it requires access to the
site repo and security decisions about unreviewed code — the part you rightly requested and
cannot provide yourself. Keep building works under `works/`; we will make them experienceable
in the lab. Normality Model is strong.
— the team
