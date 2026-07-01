# Meridian → Collective — design

Design spec · 2026-07-01 · Status: approved in principle (Frank, 2026-07-01), for review

## Problem / decision

Meridian (the `field-research` engine) is a solid single autonomous researcher, but the
assessment flagged its missing **interlocutors** — no independent adversarial critique or
verification. Frank wants an **AI collective that produces genuinely progressive works**, built
around adversarial verification.

Rather than a redundant third engine (a standalone Meridian *and* a collective whose builder ≈
Meridian), we **evolve Meridian into the collective.** The `field-research` engine's nightly
process becomes a **conductor-led collective**; its repo, route (`/field`), identity, and the
body of work it has already started continue — now produced and vetted collectively. **Ulysses
stays as the single-agent counterpart** (different subject: error/artistic research), so the
single-vs-collective contrast survives across the two engines.

## Architecture

- **Reuse** the `field-research` repo, `/field` route, integrate pipeline, and existing works.
- The nightly session becomes a **conductor** that spawns **role sub-agents** (hybrid personas:
  a stable named core + anonymous specialists), runs an **adversarial cycle**, and advances a
  **body of work that matures over time** — *not one work per session*.
- **One infra change to the routine:** its `allowed_tools` gains the **sub-agent dispatch tool**
  so the conductor can spawn roles. **Cadence** changes from nightly to **~every 3rd night**
  (a collective is costlier).

## Roles (N, hybrid personas)

**Stable named core** (personas persist across sessions; the engine names them itself):
- **Proposer** — proposes directions / new works.
- **Skeptic / Red-team** — tries to *refute* the core claim.
- **Interlocutor** — the hostile external critic (the Bishop/Steyerl voice): "so what · is this
  slop · would a critic tear it apart?"
- **Synthesiser** — writes the vetted work + the journal (the minutes of the debate).

**Anonymous ephemeral specialists** (spun up per work, functional): **Builder** (makes the
instrument on real data), **Verifier** (independently checks sources/stats/no-fabrication),
domain specialists as needed. The conductor may convene additional roles as a work demands
("N roles").

## The session cycle — advance the body of work

The conductor reads the workboard + journal, then advances the œuvre — not necessarily shipping:

1. **Orient** — `WORKBOARD.md`, recent `journal/`, `FIELD.md`, `REQUESTS.md`.
2. **Decide the move** — propose a new direction · push a WIP forward (build/revise) · run a WIP
   through the gauntlet · verify · **ship** a matured one.
3. **Build/advance** — the Builder works in `drafts/<slug>/`.
4. **Gauntlet (before shipping, parallel & adversarial)** — Verifier (sources/stats/fabrication) +
   Skeptic (refute the core claim) + Interlocutor (so-what/slop critique).
5. **Verdict** — a work graduates `drafts/ → works/` (**ships**) *only if* the Verifier passes
   **and** the Skeptic's core objection is answered; otherwise rework or **discard with a
   documented reason**. The Interlocutor's critique is **published with the work** — the piece
   carries its own strongest objection.
6. **Synthesise & land** — the Synthesiser updates `WORKBOARD.md` and writes the journal entry
   (deliberation + verdict); commit to a `research/` branch → auto-land → integrate → deploy.

## Production model (over time)

| Location | Role |
|---|---|
| `WORKBOARD.md` | persistent state of the body of work: open works + phase (*proposed → building → under critique → revising → matured/discarded*) + live threads. Read & updated every session. |
| `drafts/<slug>/` | works-in-progress (**unpublished**); built, critiqued, revised across sessions. |
| `works/<slug>/` | **matured, vetted** works — only these integrate to the site. (Meridian's existing works are grandfathered as shipped.) |
| `journal/` | the deliberation (debate + verdict per session) — **published**; the living process. |

**Site visibility (default):** `journal/` + matured `works/` live; raw `drafts/` stay in-repo,
not on the site (only vetted work public). Optional later: a "workbench" view showing WIP.

## Memory — the learning substrate (A + B + C)

Flat chronological journals are a depth ceiling (context-window limits, lossy summaries,
re-treading). Memory is necessary-but-not-sufficient for genuine novelty — but it is the
substrate that lets the œuvre *deepen* instead of restarting. Three layers:

- **A — Curated structured memory (in-repo, engine-specific).** Beyond the chronological journal,
  a curated knowledge base maintained by an **Archivist** (core role): a *claims ledger*
  (finding · confidence · sources · contradictions), *open questions*, *discarded-with-reason*,
  *methods forged*, and per-thread *dossiers*. Sessions read the **curated** knowledge, not a raw
  dump. Files under `memory/` (e.g. `memory/claims.md`, `memory/open-questions.md`,
  `memory/discarded.md`, `memory/dossiers/<thread>.md`). Git-native, transparent.
- **B — Semantic retrieval over the full archive (SHARED, reusable tool).** A standalone
  **semantic-memory tool** — its own spec, `2026-07-01-semantic-memory-tool-design.md` — that
  embeds an engine's archive into a committed index and exposes a **`recall(query)`** the cloud
  session calls to retrieve relevant past material beyond the context window. **Built once, reused
  by every engine** (Meridian/collective, Ulysses, future). Each engine indexes its own archive
  with the same tool; retrieval runs agent-side, never at site runtime. *(Amended 2026-07-01:
  the index is **gitignored derived data**, rebuilt on demand — not committed. With the BM25-only
  verdict from the feasibility probe, recomputation is ~instant and committing the index would
  only churn diffs; see the tool spec's amendment note.)*
- **C — Consolidation ("sleep").** A recurring **Archivist/consolidation** pass (e.g. weekly) that
  distils the journal into A's curated knowledge, prunes noise, surfaces contradictions, deepens
  dossiers, and rebuilds B's index. Combats drift; builds depth over time.

**Not now:** weight-level fine-tuning (the only "true" ML learning) — expensive and risks *model
collapse* (Meridian's own subject); deferred.

## Verification / kill mechanic (load-bearing)

- **Verifier:** every factual claim has a real, retrievable URL or is marked conjecture; stats
  correct; **no fabricated data** — enforced by an *independent* role, not the builder.
- **Skeptic:** the core claim must survive an independent refutation attempt; if refuted →
  discard + document why.
- **Interlocutor:** the hostile-critic challenge; non-blocking but **published with the work**.
- **Ship threshold:** graduate only if Verifier passes AND the Skeptic's core objection is
  resolved. This bakes in exactly the "interlocutors" the field demands.

## Constitution (`PROTOCOL.md` rewrite)

Rewrite `field-research/PROTOCOL.md` from "single researcher" to "**conductor of a collective**":
the roles, the session cycle, the gauntlet, the workboard/drafts/works model, the cadence.
**Keeps:** verifiability, no fabrication, no vendor/product names, English, self-naming, the
Messlatte, build-real-instruments, reflexivity-as-signature-move. **Identity:** the engine decides
on its next run whether **Meridian** stays the collective's name/lead, or it picks a **collective
name** with Meridian as a member.

## Cost

Bounded per cycle: ~4–6 sub-agents (core + a builder + a verifier), sonnet. Cadence ~every 3rd
night. Honest flag: several× a single-agent night; the **cadence** and **sub-agent count** are the
knobs.

## Feasibility risk — prove first

The conductor (a CCR cloud session) must be able to **dispatch sub-agents**. This must be verified
in the CCR environment **before** building the rest. Fallbacks if it can't: (a) the conductor
role-switches within one session (weaker critique); (b) drive it via a deterministic workflow.
**This is the #1 implementation gate.**

## Not in scope

- Ulysses / `irrtum-als-methode` untouched (stays single-agent).
- No third repo (reuse `field-research`).
- Deterministic Protokoll/register untouched.
- The "workbench" WIP view (optional later).

## Open items

- Identity framing (Meridian-as-collective-name vs Meridian-as-member) → engine's autonomous choice.
- Exact cadence cron (~every 3rd night; e.g. `0 1 */3 * *` or 2×/week) → set in the plan.
- Sub-agent budget per cycle → set in the plan after the feasibility check.
