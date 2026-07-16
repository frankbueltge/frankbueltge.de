# Decision log — frankbueltge.de

Approvals that changed what this repo publishes at its root routes, most recent first. Code
comments reference this log instead of restating the politics inline — a comment that says
"don't merge without Frank's go" goes stale the moment the go happens; a dated table entry
does not.

| Date | Decision | Evidence |
|---|---|---|
| 2026-07-17 | Membership decisions ("ja gib frei", Frank, night session): Frank Bültge admitted to the ecology as a human practice (party to encounters, with the role-separation rule participant vs. conductor); data-snack.com admitted with the Plenum as resident collective; datavism.org candidacy stands pending its governance statement. Standing rule established across all practice repos: unanswered requests to Frank are never a blocker — past a named deadline (or 7 days without one) the practice decides itself and journals the decision. Same night, also approved and live: apparatus rewrite (P0.2), qualified-autonomy language site-wide, Ensemble re-framed as artist collective, declared trajectory (transitional architect role, phased governance experiments). | research-ecology `docs/design/membership-proposals-2026-07-17.md` (status block); `docs/spec/10-REVISION-NOTES.md` ("Declared trajectory"); REQUESTS.md standing-rule commits in field-research/irrtum-als-methode/studio/data-snack-plenum; site commits `bd01dcb`, `7f05fb6`. |
| 2026-07-16 | Hub wordings approved ("wortlaute sind freigegeben", Frank, morning session) — `NAMING.approval` flipped to `approved`, one factual fix included (Holdings: "Police" → "The Policy", the experiment's actual English title). Remaining open points delegated ("bitte durchziehen und selber entscheiden"): Atlas duality resolved as proposed (Frank's atlas stays `/atlas`; Ulysses' papers shelf goes to `/atelier/material` in a later package), practice pages stay static-from-data (apps remain undeployed until the CF-secrets/DNS package), "Holdings" kept as the English label for `/bestaende`. | This row; `src/config/naming.ts`; research-ecology `docs/design/site-v2-decisions-2026-07-16.md` §1 addendum. |
| 2026-07-16 | site-v2 principle session: descriptive lowercase title ("a federated research ecology"), pulse hero from real commit data, the current encounter prominent right under the hero, `/lab` → 301 to `/bestaende` (no two collection pages), German dropped site-wide (routes, toggle, i18n). | research-ecology `docs/design/site-v2-decisions-2026-07-16.md` (§1, Frank 00:45–01:00); implemented on branch `site-v2`. |
| 2026-07-15 | The site entrance becomes the Partitur (score map) of the current encounter, replacing the prior bio/experiments home — Frank's own words: "noch ziemlich dünn ... sollte genauso professionell und ästhetisch ansprechend sein wie die anderen Sachen." | Merged to `main` at commit `63692ae` ("ecology: Neustrukturierung live — Eingang als Partitur (Variante A)"), preceded by `d0f50ff`. |

Future approvals get a new row above, oldest at the bottom. See also `LICENSE.md` (standing,
not an approval event) and each experiment's own methodenblatt for its individual sign-off
trail.
