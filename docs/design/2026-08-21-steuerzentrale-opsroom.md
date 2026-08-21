# Steuerzentrale v3 — the ops room

**Date:** 2026-08-21 · **Decided by:** Frank (wording private; the substance: one glance over
everything, interactive, professional UX — and the practices' tuning levers named in one
place). Built the same night. v2's design note (2026-08-01) is superseded for the surface;
its data model, triage rules and action flows carry over unchanged.

## What it is

`/steuerzentrale` now wears the entrance's instrument-panel language (`ops-room.css`,
2026-08-11) instead of the site's plain text stack. New stylesheet `zentrale-ops.css`;
rebuilt `ZentralePage.astro`; extended `functions/api/zentrale/status.js`.

**The board.** One instrument card per unit — now all seven, not four: Atelier · Ulysses,
Field · Meridian, Studio · Ensemble, Nightly line (error-as-method), n-1 · Remainder,
Machine Attention, Plenum. Each card: integrate LED (green/red/idle), the practice's
constitution version as a chip (fetched live from its `PROTOCOL.md` first heading —
`protocolHeading()` in `status.ts`, tested), commits/24h as the needle, the practice's own
last sentence (chronicle or journal), run receipt, red-issue and stranded-session links.
The three ecology practices wear their identity colours (`--hub-c-*`, the validated
`ecology-voices` set); everything else wears the room's live accent — four is the measured
categorical ceiling here (`palette.test.ts`).

**The clocks.** Two countdown tiles under the top bar: the ecology reading of 2026-09-05
(three conditions, archive is the default) and 2026-10-14 (n-1's Founder's Reading and the
freeze end). Dates in markup, day counts computed client-side, amber within seven days.

**The lanes.** Two columns: left what asks for a decision (Heute nötig · Am Gate · Site-PRs
· Öffentliche Saat · Briefkasten), right what is outgoing or machinery (Post · Saat legen ·
Maschinenraum · Alle Läufe). All action flows are v2's verbatim — arm-then-confirm on every
live action, answers as dated commits into the practices' REQUESTS.md.

**The knob register (Maschinenraum).** Static, server-rendered: per unit the levers Frank
actually has, each chip linking the exact file that IS the lever (constitution, delegation,
channel, gate, validator; site-side the decision log, drift watch, workflows, wording
canon). Deliberately read-only: constitutional floors and anything leaving the house are
written as dated decisions, never clicked as settings — the merge delegation's own
exceptions, restated as UI design. The routine prompts live in the trigger API, not in Git;
the register says so instead of pretending the lever does not exist.

## Colour provenance (no new identity hexes)

Ground/furniture: `--ops-*` (ops-room.css). Identity: `--hub-c-*` (hub-triptych.css).
Status: Tailwind core steps, theme-selected rather than flipped — dark keeps the 500 steps
this page has used since v1; light gets the 700 steps for every text-carrying role, because
the 500s measure ~2.2:1 as text on the light panels (a v2 defect, not carried over).

## Fixed on the way

- v2's access section and gate lane both carried `data-zx="gate"`; `querySelector` resolved
  both constants to the first match, so publication-candidate cards were appended into the
  hidden access section and the visible "Am Gate" lane stayed empty since the lane shipped.
  The lane is now `data-zx="gatelane"`.
- Two inline `style=""` attributes would have been dropped by the CSP (house rule); they
  became the `.zx-pre` class before ever shipping.

## Verified

`protocolHeading` unit-tested; full suite 2881 green; build 686 pages; the dashboard
rendered against realistic fixtures via a stubbed fetch (Playwright), light and dark,
screenshots reviewed. The status endpoint's new collectives reuse the existing
Promise.allSettled failure policy — one broken partial fetch never empties the board.

## Not done, and why

No settings that write to constitutions (see above). No health score across practices and
no signal aggregation — the reading of 2026-09-05 judges per practice, and a dashboard
that averaged them would invent a number nobody decided. Frank's standing word tonight:
no knob gets turned before 2026-09-05; v1 is therefore read-first with v2's existing
actions, nothing more.
