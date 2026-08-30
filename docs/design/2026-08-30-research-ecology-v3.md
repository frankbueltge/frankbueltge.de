# Research ecology v3 — one shared question (decision record, IN FORCE)

**Date:** 2026-08-30 · **Decided by:** Frank Bültge (architect), wording private throughout,
paraphrased here · **Supersedes:** the v2 order of 2026-08-08
(`docs/design/2026-08-08-research-ecology-v2.md`), dated, in full · **Executed:** the same
day — protocols ulysses@155e603 (v7), field-research@6f9a043 (v4), studio@520f6ad (v4).

## 1. The reading, held early

The kill reading v2 scheduled for 2026-09-05 was held on 2026-08-30 at the architect's
decision. Verdicts against the three v2 conditions, from the committed records:

1. **An investigation standing with a named outside receiver — FAILED.** Meridian's
   "Cited, Not Retrievable" was parked on 2026-08-26 by its own pre-registered criterion
   K-C: no reachable receiver with a published interest in the exact question (eight
   candidates examined, all negative on the decisive scope).
2. **At least one work shipped under v2 making the machine's advantage experienceable —
   PARTIALLY MET.** STILL DARK premiered 2026-08-15 under v2 and stands on the site.
   OUTSTANDING cleared its concept gate but never premiered (its own ship condition —
   sound as a load-bearing dependency — was found the night before this reading).
3. **Something left the house under the seven-day bind — FAILED.** Five packets stood
   `prepared` in the post-office ledger, none sent, none dated-withheld; the STILL DARK
   bind lapsed unused on 2026-08-22.

The architect's judgment, paraphrased: the practices had become better at examining
themselves than at reaching anyone; the session records had grown illegible to the human
they are for; he had no appetite for continuing that theatre. He chose — for the second
time — a radical rebuild over archiving, set the new order himself, and did not put it to
negotiation with the practices.

## 2. The v3 order

1. **One shared question, three standpoints.** The three practices remain (Field =
   science / Meridian · Studio = art / Ensemble · Atelier = artistic research and
   philosophy / Ulysses) and work on **one research question at a time**, each with its
   own means. They meet over it and are required to know what the others are doing.
2. **The cycle.** Questions come from the public seed channel (`/seed`); with no seed
   queued, **default themes** apply: Field — *"E2E automation of AI research"*; Atelier —
   *"How can AI and automation meaningfully support artistic research?"*; Studio — builds
   works and instruments from the siblings' research material, explicitly without an
   administrative apparatus or theory loops of its own. A practice spends **three to five
   sessions** per question, then presents; the three presentations appear together on the
   site. Cycle state is canonical in `src/data/ecology/cycle.json`, advanced by the
   architect or a site session, never by a practice.
3. **Legibility is constitutional.** Every session closes with a ≤40-line plain-language
   `BULLETIN.md` (read by both siblings at their next open) and a ≤40-line journal note.
   A session whose record cannot be understood in two minutes has failed its record.
4. **Artifacts, permanently.** Every session produces or visibly advances a
   self-contained artifact (object, dataset with figure, interactive visualization,
   page) — the trail visitors follow. Verification lives inside the artifact (sources,
   method, verified model output), not in gates in front of it.
5. **The gate apparatus of v2 is abolished in full:** concept gates, pre-registration
   duties, convened adversary/verifier/severed-reader roles, the machine-advantage bar,
   the "Singular" limb, record ceilings, workboard prose duties, the seven-day send bind.
6. **The post office is poste restante.** Mail to the world is collected, addressed and
   laid ready; whether it is ever sent or picked up measures nothing. The architect's
   clarification, paraphrased: sending was never obligatory for him; collected mail is a
   complete outcome. Sending remains a human act ("nothing sends itself" stands).
7. **Untouched:** the nightly line (error-as-method), Remainder (n-1), Machine Attention,
   the lab/experiments — v3 binds only the three ecology practices. (The v3 session form
   deliberately imports the nightly line's working shape: small self-contained deliveries
   whose verification is part of the artifact.)

## 3. Transition, one-time

Each practice runs **at most two closing sessions**: reflect its whole prior work and
prepare it for human readers as **one well-made, self-contained artifact** — the closing
report. Running arcs and series (OUTSTANDING, the Field's day series) end inside it,
dated; nothing continues past it under the old law. Then cycle 001 opens on the defaults.

## 4. Site follow-through (named, partly outstanding)

- `src/data/ecology/cycle.json` — canonical cycle state (this PR).
- **To build next:** a new ecology entrance surface presenting the current question, the
  three bulletins, the artifact trail and the joint presentations; the present `/ecology`
  pyramid surfaces become a dated archive. `/post` wording moves to poste restante.
- CLAUDE.md carries the v3 paragraph (this PR); the engine protocol mirrors under
  `src/content/*/PROTOCOL.md` follow via the mirror workflow.
- PR #699 ("Research ecology v3 — art first", draft of 2026-08-19) is closed as
  superseded by this decision: the architect chose the shared-question model, not the
  art-first model.

## 5. Continuity of record

The v2 conditions and their verdicts remain quotable history; the practices' full v2
records stay in their repositories; superseded protocols are archived unchanged in each
engine's `archive/protocols/`. History is continued, never retouched.
