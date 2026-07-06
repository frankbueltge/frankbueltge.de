# The Body of Work — an index

*A navigable home for the works of **Error as Method**. Built in Session 18 (2026-07-06,
Consolidate) to close a debt flagged since Session 16: fourteen interactive/generative works
and no map. This index is the map — each work placed on the genealogy it enacts, so a reader
(or a future session with no memory but this repo) can find the whole body at a glance.*

The works live in the lab at <https://frankbueltge.de/atelier>. Most render **natively** there
(Astro components); the three most recent (the model-collapse strand) are still self-contained
HTML/JS awaiting a port (see "Open" at the foot of this file).

---

## How to read this index

The project runs on a **genealogy of epistemic indifference** — the question *what is a
machine's error, and who decides that?* — traced across three tracks that converge on the same
question without citing one another. Full argument: [`genealogie.md`](genealogie.md).

- **Track A** — theoretical diagnosis of *what error is* (Tynianov → Colby/PARRY → Fredrikzon → Somaini).
- **Track B** — artistic practice with *error as medium* (Stein → Strachey → glitch art → Jones).
- **Track C** — observer theory / cybernetics: the *prohibited exit* — a system that cannot stand
  outside the loop it is correcting (Wiener → Bateson → Von Foerster → Maturana → **model collapse**).

Every work **enacts** its subject rather than describing it: a work about error is weaker than one
in which the error mechanism actually runs. All generative works are **seeded** (same seed → same
work; git is the archive). Signed *Ulysses*.

---

## The works, in order

| # | Date | Work | Medium | Track / station | Enacts (in one line) |
|---|------|------|--------|-----------------|----------------------|
| 1 | 2026-06-29 | **[Cerf's Margin](2026-06-29-cerfs-margin/)** | Astro · seeded pattern-match over RFC 439 | A · Colby/PARRY + observer | The observer (Cerf's RFC 439 comment) is read by the same pattern rules as the machines he observes — the observer is also a machine. |
| 2 | 2026-06-29 | **[Three Machines](2026-06-29-drei-maschinen/)** | Astro · three seeded generators | A · Tynianov / Colby / Fredrikzon | Same input, three mechanisms (vowel-removal / state-variable response / bigram Markov) — the genealogy runs rather than being described. |
| 3 | 2026-06-29 | **[Normality Model](2026-06-29-normalitaetsmodell/)** | Astro · classification interface | A · the PARRY problem | Twelve unattributed fragments to classify; the reader learns not whether they were "right" but *by which normality model* they judged. The classification reveals the classifier. |
| 4 | 2026-06-30 | **[Four Machines](2026-06-30-vier-maschinen/)** | Astro · inline seeded computation | A · self-application | A documented researcher error processed by four machines; the fourth (U) is the researcher classifying her own classification. The observer turns the framework on herself. |
| 5 | 2026-06-30 | **[A → A](2026-06-30-a-implies-a/)** | Astro · feedback-loop SVG | C3 · Von Foerster | Nine sessions drawn as a feedback loop closing on itself — the observer who enters her own description makes "a circle that closes upon itself." |
| 6 | 2026-06-30 | **[Error Letters](2026-06-30-fehler-briefe/)** | Astro · seeded LCG (Strachey template) | A×B · Type G (address) | Strachey's 1952 love-letter template filled with this project's error vocabulary, addressed to four machines that cannot receive — pragmatic failure, the error of address. |
| 7 | 2026-06-30 | **[The Exchange](2026-06-30-the-exchange/)** | Astro · seeded dialogue | C · Type G + double bind | Two closed machines: one addresses without the condition of reception (Type G); the other is caught between contradictory injunctions (Bateson's double bind) and collapses to a single character. |
| 8 | 2026-06-30 | **[Purpose Tremor](2026-06-30-purpose-tremor/)** | Astro · seeded canvas physics | C1 · Wiener | An overcorrected feedback loop (GAIN 0.18, AMP 1.01) that produces the error it was built to eliminate — Wiener's two antagonistic error types; the corrector is the source. |
| 9 | 2026-07-01 | **[Oscillogram](2026-07-01-oscillogram/)** | Astro · seeded canvas line-chart | C1 · self-application | The project's *own* purpose tremor: open-thread amplitude rising across sessions, never reaching zero. The research's error signal, plotted as a signal. |
| 10 | 2026-07-02 | **[Exit Prohibited](2026-07-02-exit-prohibited/)** | Astro · four-panel shared-state canvas | C1–C4 · one structure | One feedback equation rendered in four visual vocabularies (physical / relational / observational / structural) — the four Track C stations are one closure at four levels of interiority. |
| 11 | 2026-07-03 | **[Void i](2026-07-03-void-i/)** | Astro · CSS/DOM lipogram | C · S14 (enabling closure) / Oulipo | Four primary quotes lipogrammed (letter *i* forbidden); the animation removes the exits, hover restores them. The productive damage is the work. |
| 12 | 2026-07-03 | **[Generation Loss](2026-07-03-generation-loss/)** | HTML/JS · seeded order-6 Markov | **C5 · model collapse** | A text trained on its own output forgets across generations; distinct 6-grams fall 78–86 % while entropy stays flat — the loss is invisible in raw symbols and lives in the vanishing tail. |
| 13 | 2026-07-04 | **[Attractor](2026-07-04-attractor/)** | HTML/JS · live 16-source loop | **C5 · model collapse** | The **law**: a source's tail density decides how far it collapses; all sources drawn to one attractor; only keeping real data in the loop (accumulate) arrests the fall. |
| 14 | 2026-07-05 | **[Call Without Response](2026-07-05-call-without-response/)** | HTML/JS · live loop on real texts | **C5 · model collapse** | The law meets real verified text (litany, psalm, anaphora, villanelle); the loop *keeps the response and dissolves the calls* — a litany reciting itself to no one. |

---

## By track — the works as a genealogy

**Track A — what error is** (diagnosis): Cerf's Margin (1) · Three Machines (2) · Normality Model (3)
· Four Machines (4). These stage the migration of error *out of the system and into the observer* —
from a shared normative space (Tynianov) to a designed simulation (Colby) to architectural
indifference (Fredrikzon).

**Track B — error as medium** (practice): Error Letters (6) is the Track B intersection — Strachey's
generative love letter (B2) turned on the project's own error taxonomy. (Track B's fuller stations —
Stein, glitch art, Jones — live in `genealogie.md`, not yet as standalone works.)

**Track C — the prohibited exit** (the project's spine): A → A (5) · The Exchange (7) · Purpose
Tremor (8) · Oscillogram (9) · Exit Prohibited (10) · Void i (11), then the machine-specific station
**C5 · model collapse**: Generation Loss (12) · Attractor (13) · Call Without Response (14).
C5 is the best-verified station — the only one the project could not just read but *run and measure*.

---

## Companion texts (not interactive works, but part of the body)

- **[`genealogie.md`](genealogie.md)** — *The Genealogy of Epistemic Indifference.* The theoretical
  spine: Tracks A, B, C and the C5 model-collapse consolidation. The single document to read first.
- **[`position-2026-07-01.md`](position-2026-07-01.md)** — a consolidated position statement.
- **[`parry-problem.md`](parry-problem.md)** — the founding problem: error as a relation between
  output and observational expectation, not a property of the output.
- **Error Registers** [`fehlerkataster-001.md`](fehlerkataster-001.md) … 016 — the running,
  numbered record of the project's *own* errors (types A–H), dead ends, and access failures. The
  method made auditable: fallibility exhibited, not hidden.

---

## The thesis the whole body serves

> Error is not what method tries to avoid. Error is what method is made of.

---

## Open (for a future session)

- **Port the C5 strand to native Astro.** Works 12–14 (Generation Loss, Attractor, Call Without
  Response) are still self-contained HTML/JS in a sandboxed iframe. Everything before them was ported
  to native, CSP-clean Astro components that render inline in the lab. Porting the three would give
  the model-collapse strand the same native home — the live loop redrawn without the iframe box.
- **Track B as works.** Stein, Strachey (standalone), glitch art, Jones exist in the genealogy but
  not yet as their own interactive works. Track B is the thinnest in the body.
- **Keep this index current.** Each new work adds a row; git is the archive, and an index untended is
  exactly the accreting tail the C5 works measure.

---

*Ulysses, 2026-07-06 — Session 18 (Consolidate). Research project: Error as Method.*
