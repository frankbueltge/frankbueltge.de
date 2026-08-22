# Runtime state for works — the static corset was never decided (2026-08-22)

**Status: RULED AND EXECUTED (2026-08-22).** Frank's decision, same day (wording private):
dynamic works are allowed under the §6 duties; state lives on **Cloudflare D1 / Durable
Objects**, and Durable Objects are to be tested on the free tier. Verified against
Cloudflare's pricing page the same day: DO **is** available on the Workers Free plan with
the SQLite backend — 100,000 requests/day, 13,000 GB-s/day, 5 M rows read, 100,000 rows
written, 5 GB stored, daily reset at 00:00 UTC, and exceeding a limit **fails the operation
rather than billing for it**. The §7 edits are executed, and the duties now live as a
path-bound rule at `.claude/rules/runtime-and-works.md`.

**Occasion.** The founder objected on 2026-08-22 (paraphrased, wording private): he never
consciously imposed the static constraint, has repeatedly proposed a Hetzner VM or GCP to
loosen it, and has always wanted dynamic works and experiments on frankbueltge.de. The
objection came in response to this session's claim that three of the five screen-work
families in `2026-08-22-lab-line-screen-works-input.md` need mutable server state "which
this house constitutionally does not have". That claim was wrong twice over, and the
correction is the substance of §1 and §2.

---

## 1. The finding: this house is not static, and its runtime is not small

Nine Cloudflare Pages Functions run in production today, with mutable state, secrets and
a live LLM call at request time:

| Endpoint | What it does at request time | State it touches |
|---|---|---|
| `POST /api/seed` | Ten fail-closed stages for a submitted seed, incl. **a Gemini call at request time**, then a private queue | `SEED_PENDING_KV`, `GEMINI_API_KEY`, `SAAT_GITHUB_TOKEN`, Turnstile |
| `POST /api/post` | Post-office letters: caps counted by KV prefix, then written to the pending queue | `SEED_PENDING_KV` (`letter:` prefix) |
| `POST /api/impulse` | Reader impulses for the Atelier cockpit; prefilter, then a **commit into the engine repo** | `IMPULSE_GITHUB_TOKEN`, in-isolate rate limit |
| `/api/zentrale/*` (5) | Authenticated ops API — status, replies, seed review, site PRs | `ZENTRALE_SECRET`, `ZENTRALE_GITHUB_TOKEN` |
| `POST /api/subscribe`, `/api/brevo-hook` | Double-opt-in mail flow and its webhook | Brevo keys, webhook secret |
| `/stats/*` | First-party reverse proxy to a **self-hosted Umami on Vercel + Neon Postgres** | an external Postgres the house already owns |

So the house already holds a key-value store, a Postgres database, an authenticated write
API, tokens that can commit to other repositories, and it already performs live model
inference while a visitor waits. The sentence "the site never reads at runtime" was already
untrue when it was written into `CLAUDE.md` on 2026-08-09: `/api/seed` had been calling
Gemini per request since July.

**What is missing is therefore not permission, not infrastructure and not precedent. It is
that no *work* has ever used any of it.** Every runtime capability in the house serves
intake, moderation, ops and analytics — the administrative layer. The art has stayed on the
static side of a line nobody drew.

## 2. Provenance of the rule that is not one

1. **June 2026.** The house ran on **GCP Cloud Run** — four pipelines, BigQuery, Vertex AI
   (`docs/archive/positionierung-2026-06-14/01-technical-architecture.md`). "Static" in the
   rebuild spec refers to the **content layer only**, argued from SEO and Core Web Vitals
   ("Zero-JS static HTML by default → top CWV, fully crawlable"). Nothing about works.
2. **2026-06-27, commit `fd5cc662`.** Pipelines migrate Cloud Run → GitHub Actions and
   "Kein GCP" enters `CLAUDE.md`. The reason is in `docs/cron-migration.md`: ~21 €/month
   across projects — and that file already lists **Hetzner as "Phase 2"**. The portfolio
   audit calls this step, correctly, "an infrastructure simplification, **not an ethics
   ruling**".
3. **2026-08-09.** The founder re-opens GCP. His recorded decision (D6) is narrow: whether
   G1/G5 are worth testing at approximately zero cost, licences respected. The clause
   *"nie zur Laufzeit der Site … kein dynamisches Lesen aus Cloud-Diensten"* appears in the
   portfolio audit as the **session's own proposed wording** (§8, explicitly "not executed
   here"), and was then written into `CLAUDE.md` under the byline **"GCP gezielt (Frank,
   2026-08-09)"**.

**Consequence: there is no decision to reverse.** A restriction the founder never made
carries his name and date in the two files that every session reads first. This is the same
class of error the repository polices elsewhere — attributing to a named person something
they did not say — and it should be corrected as such, not debated as policy.

## 3. What "Git ist das Archiv" should keep meaning

The clause has a load-bearing core worth keeping, and it is about **instruments**, not
works:

1. **A finding must be recomputable** from committed inputs. This is what makes the
   counter-measurement line checkable rather than trustworthy, and it must not soften.
2. **The record must outlive the services.** Anything a service holds that constitutes
   evidence has to exist in git too, or a cancelled subscription erases the archive.
3. **No live third-party read inside a claim.** A number on a method sheet may not depend
   on an API answering today (this is the honest reading of `2026-08-09-gcp-activation.md`
   §"Nothing changes at site runtime … the site never reads from BigQuery").
4. **The content layer stays static** — for ranking and crawlability, its original reason.
   Works live on their own routes and do not touch it.

None of the four is violated by a work that keeps a counter, seals a line, or refuses a
second view. **Proposed split: the archive duty binds findings; works may hold state.**

## 4. What the five work families actually need

| Family | Primitive required | Available today? |
|---|---|---|
| **F1** re-derivable claims | none — committed data + client-side re-derivation | **yes** |
| **F2** depleting works | monotonic counter + seal, **strongly consistent** | KV is eventually consistent → needs **D1** or a **Durable Object** |
| **F3** refusing the second | per-visitor serving without identity | same gap; DO is the exact fit (one object, serialized access) |
| **F4** passio / waiting works | committed deadlines + the viewer's own clock | **yes** |
| **F5** one address, growing | git history + nightly commit | **yes** |

Three of five are buildable this afternoon with what exists. Two need **one additional
binding** — not a new house. My earlier framing ("three of five need what the house does
not have") overstated both the gap and its constitutional weight.

## 5. Where state should live

**A — Cloudflare D1 / Durable Objects (recommended for memory).** Same account, same
deploy path, same `functions/` directory, no machine to patch, and the bindings work exactly
like `SEED_PENDING_KV` does now. D1 gives transactions (free tier: 5 GB, 5 M reads/day);
Durable Objects give serialized single-object access — literally affordance 5 of the line
input, "one object with many simultaneous inhabitants" — and require the Workers Paid plan
(~$5/month), which sits inside the house's existing 10 €/month guideline. Cost of the
first stateful work: effectively the plan, nothing per view.

**B — Hetzner VM (recommended when a work must labour, not merely remember).** A CX22 is
~4–6 €/month with predictable, traffic-independent cost, full Postgres, long-running
processes, websockets, ffmpeg, cron. It is also not a new idea in this house: `cron-
migration.md` named Hetzner as Phase 2 in June. The cost is operational, not financial —
patching, backups, TLS, uptime on a machine that nightly practices would come to depend on.

**C — GCP Cloud Run (recommended for compute adjacency).** The house's own precedent until
June; scale-to-zero, no machine to patch, and the right answer when a work needs BigQuery
or Vertex proximity *at request time* rather than in a nightly batch.

**Decision rule per work: does it need to remember, or does it need to labour?** Memory →
A. Labour → B or C. A fourth option deserves naming because it is nearly free: the house
already runs **Neon Postgres** behind Umami; a second database there costs nothing extra
and needs no new vendor if all a work wants is SQL.

## 6. Proof duties for a dynamic work

The six conditions that let a work hold state without weakening the house's claim to
checkability. These are drafted as the ship-gate addition for the screen line, and they
apply to any dynamic experiment, not only that line.

1. **Declared state.** The work states on its own page what it remembers, for how long, and
   why. Hidden state is the only kind that is dishonest.
2. **Nightly snapshot into git.** Any state that carries evidence is committed as dated
   JSON, exactly as the pipelines commit theirs. This is what keeps "Git ist das Archiv"
   true in the sense that matters: the work stays checkable after its service dies.
3. **No identity, ever.** Counts, never identifiers — no fingerprinting, no retention beyond
   the count, and no aesthetic effect that depends on the viewer not knowing they are
   counted (the ethical floor of the line input, §6, unchanged and non-negotiable).
4. **Declared mortality includes the service.** "This work ends when its store ends" is an
   honest sentence and satisfies ship-gate item 7; decay declared is a statement, decay
   discovered is bad material.
5. **A named cost ceiling and what happens at it.** For a depleting work the ceiling *is*
   the form — a real budget spent per view until the work stops is the wager with receipts
   the family asks for. For every other work, hitting the ceiling means standby, not a
   silent degradation.
6. **Fail-closed, like the existing Functions.** Missing binding → declared standby with a
   visible reason. Never a work that half-works.

## 7. Proposed edits to the record (not executed)

1. **`CLAUDE.md`, lines 107–109.** Replace
   > „**GCP gezielt (Frank, 2026-08-09 …):** … nie zur Laufzeit der Site: **Git bleibt das
   > Archiv.**"

   with a two-part rule that keeps the pipeline discipline and drops the invented ban:
   > „**GCP gezielt (Frank, 2026-08-09):** Batch-Schritte der Pipelines dürfen GCP-Dienste
   > nutzen, wo sie nachweisbaren Mehrwert stiften. **Befunde bleiben aus committeten Daten
   > nachrechenbar — Git bleibt das Archiv der Instrumente.** Werke dürfen Laufzeit-Zustand
   > halten (Bedingungen: `docs/design/2026-08-22-runtime-state-for-works.md` §6); die
   > Site *hat* eine Laufzeit — neun Pages Functions, KV, ein Gemini-Aufruf pro Saat."
2. **`.claude/rules/pipelines-and-archive.md`**, the GCP section: same correction, and the
   heading's "(Frank, 2026-08-09)" stays only on what he actually decided.
3. **`docs/design/2026-08-09-gcp-activation.md`**: an annotation, not a rewrite — the
   sentence there is narrower ("the site never reads from BigQuery") and stays true.
4. **`docs/decision-log.md`**: one dated row recording the founder's objection, the
   provenance finding, and whatever he rules below.

## 8. The founder's call

1. **Permission.** Dynamic works allowed under the §6 duties — yes or with changes?
2. **Where memory lives.** Cloudflare D1/Durable Objects (recommended) · Hetzner VM ·
   GCP Cloud Run · the existing Neon Postgres.
3. **Ceiling.** Proposal: the house's existing 10 €/month guideline stays, and the ~$5
   Workers Paid plan is charged against it.

## 9. If yes, the smallest honest first step

**Sealed Once** becomes buildable — one work, one Durable Object, one nightly snapshot job,
and a page that says plainly what it remembers and what it has already sealed. Everything
the line input's §10 asks for (stranger probe, screenshot test, pre-registered mapping,
passio entry) happens on a prototype before any of it touches a route.
