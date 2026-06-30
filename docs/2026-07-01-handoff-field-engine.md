# Handoff — second autonomous engine + Project B (overnight, 2026-07-01)

Built autonomously while you slept. Everything below is **live and green** unless marked
"needs you".

## What's done

**The second autonomous engine ("field-research").**
- New public repo **`github.com/frankbueltge/field-research`** with its full constitution:
  `PROTOCOL.md` (subject = the live field where data, AI and power meet; full autonomy; the machine
  **names itself and the project** on its first run), `FIELD.md` (English field-map seed, from the
  topology dossier), `SITE-API.md`, `REQUESTS.md` (with one **seed**: tools-on-trial), `README.md`,
  `auto-land.yml` (`research/*` → main, dispatches `field-landed` to the site).
- **Site integration, live:** `field` content collection; `FieldPage` (isolated English clone of
  AtelierPage — `/atelier` untouched); routes **`/field`** + `/de/field` (empty state for now);
  `field-integrate.yml` workflow (clones the engine repo, integrates `ns=field`, validates, deploys
  on green); integrator made namespace-aware (`ns` param, default `atelier`, +3 tests, 138 total).
- **Ulysses (`/atelier`) is completely untouched** and still runs.

**Project B ("tools on trial").** Researched with agents and written up as a launch-ready spec:
`docs/superpowers/specs/2026-07-01-tools-on-trial-design.md`. Not built — see "decisions".

## Needs you — to activate the engine (mirrors the Ulysses setup)

1. **Nightly routine.** Create the scheduled cloud routine for the `field-research` repo (like
   Ulysses's), with the **Tavily + Arxiv** connectors attached. Without it the engine never runs.
2. **`SITE_DISPATCH_TOKEN`** — add as a secret in the **field-research** repo: a fine-grained PAT
   with **Contents: read & write** on `frankbueltge.de`. This lets the engine's auto-land trigger
   the site integration immediately (otherwise it waits for the 03:30 cron).
3. **`FIELD_BOT_TOKEN`** (optional) — secret in **frankbueltge.de**: a PAT with write on
   `field-research`, so a red build writes feedback back into the engine's repo. Skipped cleanly if
   absent.
4. **After the first run:** the engine will choose its **own name + project title** in its first
   journal entry. Tell me the name (or do it yourself) and I'll add the homepage/Lab listing
   (`werke.ts` entry) with that title and flip `/field` from empty to listed — a one-line change. I
   **held** the listing on purpose so no empty, working-title experiment shows publicly before it's
   real.

## Decisions waiting for you

- **Project B direction** (spec §6): build it directly (recommend the **keyless** Benford-on-trial
  track first — zero secrets, fully buildable), leave it as the engine seed (already seeded), or
  both.
- **The earlier cleanup** is still open and I did **not** touch it: you hadn't decided *Consensus*
  (keep/park) and *The Tell* (fix/kick). Nothing parked.

## Interpretation flags (where I made a call)

- **"Everything English"** → I applied it to the **new engine + its website presence** (repo +
  `/field`). I did **not** convert the existing bilingual German site or Ulysses — that's a big,
  destructive change I didn't want to make on assumption. Say the word if you want the whole site
  flipped to English.
- **Working names** (vetoable): repo `field-research`, route `/field`. The *public* project title is
  the machine's to choose; these are just infra slugs.
- Tonight's earlier specs/plans/topology docs are in **German** (written before the English
  instruction); I left them rather than churn. New artifacts (the engine repo, B spec, this
  handoff) are English.

## Live state right now

`/atelier` unchanged · `/field` live but empty + unlinked · all pushes deployed green · 138 tests
pass · the engine repo is pushed and waiting for its routine.
