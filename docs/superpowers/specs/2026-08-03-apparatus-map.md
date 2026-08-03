# The apparatus map — spec

**Status:** built, wording `draft` until Frank approves
**Surface:** `/apparatus`, between "The practices" and "The gates"
**Notation register:** `apparatus-map`

---

## 1. Why

The ecology had four surfaces that show what it *is* and what it *made* — the Partitur (time),
`/works` (catalogue), `/notation` (writing systems), `/encounters` (crossings). None showed the
**apparatus**: the repositories, workflows, pipelines, stores and deploy hops that carry all of
it.

The one page that tried, `/apparatus`, was prose, and its own file header confessed the flaw:

> "Workflow names/cadences are read from `.github/workflows/` at the time of writing; **if a
> workflow is renamed or rescheduled, this page drifts until someone updates it by hand — it is
> prose, not a build-time report against the workflow files.**"

It had drifted. It named **four** gates; the repository held **twenty-seven** workflows. And the
drift was not only cosmetic — three workflows that commit to `main` had stopped reaching
production:

| defect | consequence |
|---|---|
| `deploy-cf.yml` waited on `workflow_run` of **`Parallaxe nightly`**; `parallaxe.yml` declares **`name: Parallaxe weekly`** since 2026-08-02 | GitHub matches by declared name, so the trigger matched nothing. The Monday register commit never deployed. `on: push` does not fire either — the push uses the built-in token. |
| `Atlas-Scout nightly` and `Puls nightly refresh` were never in the list, though both commit into `src/data/` | same silent staleness |

The trigger list already carried two comments explaining exactly this rule, for
`Katalog-Scout nightly` and `Requests watchdog`. **The rule was known and written down; two
workflows were still forgotten.** That is a missing guard, not missing knowledge — and it is the
work this map was written to serve (festival-line §2.3: new apparatus must name the work it
serves).

## 2. The claim

Per werkgruppe-design §2 — *"Messinstrumente statt Visualisierungen. Ein Dashboard zeigt Daten;
ein Messinstrument erhebt eine Behauptung und macht sie überprüfbar."*

> **Every workflow that commits to this repository reaches production, and every connection drawn
> here is a mechanism written down in a committed file.**

Falsifiable, and on the morning of 2026-08-03 false in three places.

## 3. How it is kept true

`src/lib/apparatus/topology.ts` holds the nodes and edges as typed data.
`src/lib/apparatus/topology.test.ts` reads `.github/workflows/*.yml` with `node:fs` and fails when
the account and the machinery disagree: every claimed workflow exists, every declared `name:`
matches, every cron matches, **every `workflow_run` entry resolves to a real workflow name**,
every `repository_dispatch` type is accepted by the workflow it is drawn into, every in-repo path
exists, and every workflow that stages a `src/` path and pushes is either in the deploy trigger
list or excused in the test with a written reason.

The pattern is the repo's own: `src/lib/redirects.test.ts` guards the redirect matrix the same
way, and says so — *"the full, human-readable table this test is the machine-checked half of."*

**Verified negatively**, which is the only verification that counts for a guard: restoring the
stale `Parallaxe nightly` entry turns the suite red with the reason printed; dropping
`Atlas-Scout nightly` from the list turns it red again.

Every edge carries `checked`: `derived` when a test reads it back out of the file it names,
`declared` when only its structure is checked. The figure draws the difference, because hiding it
would let the weaker claim borrow the stronger one's authority.

## 4. The encoding

No channel means two things.

| channel | meaning |
|---|---|
| position | the flow: the world enters through instruments, the practices through gates, both converge on the archive, everything leaves through one build |
| colour | ownership only — the `ecology-voices` quartet, shared infrastructure on that set's declared neutral |
| shape | what kind of thing a node is: source · pipeline · repo · gate · store · service · host · person |
| line | solid = derived · dashed = declared · broken with an ✕ = wired but severed |

**No new palette validation.** `ecology-voices` was validated 2026-07-31 against `#f7f8fa` and
`#141414`, and the figure sits on `var(--color-panel)`, which resolves to exactly those. Layers
therefore get position and shape, never hue — which also respects `palette.test.ts`'s measured
ceiling of four categorical slots.

**No status colour.** A severed connection is drawn severed, with crossed strokes that survive
with styles off and its reason printed beside it. The apparatus does not grade its own parts, and
the permanently red second deployer is a fact about a dashboard connection, not a verdict.

**Oversight sits outside the flow.** Watchdogs, public inlets and the conductor act *on* the
apparatus; lining them up with the rest would claim they are a stage of it.

## 5. The boundary against ADR 0001

`docs/federated-research-ecology/adrs/0001-NO-CANONICAL-GLOBAL-GRAPH.md` forbids a canonical
global graph. Its stated reason is precise:

> "The lab contains heterogeneous local practices and **authored relations**. A central graph
> would make **interpretive edges** appear factual and would privilege **one ontology**."

This map has neither authored relations nor interpretive edges. Its edges are mechanics readable
out of committed files, and it privileges no ontology of the *research* — it describes the
*apparatus*. It is the "bounded projection through a versioned lens" the ADR asks for, and its
lens is named: mechanism, not meaning.

The boundary it therefore holds, and the figure prints under itself:

- no relation between research **contents** — no work citing a work, no practice influencing a practice;
- no live state — wiring, not operation;
- no ranking — nothing puts one practice upstream of another by right.

## 6. Open

- **Edges into the world are `declared`, not `derived`.** No test opens a network connection, so
  the map vouches for the adapter file, not for the source still answering. Named as a limit
  rather than papered over. Whether a nightly reachability check should narrow it is open.
- **The gates and CI do not admit the same things.** The integrate workflows run
  `check && test && build` but *not* `drift-check`. A mirrored work carrying inline styles the CSP
  drops therefore passes the gate, lands on `main`, and turns CI red afterwards — with no refusal
  letter back to the practice, which is the whole mechanism the gate exists for. Found on
  2026-08-03 via `2026-08-03-where-the-reader-declines`. Not fixed here: it changes what a gate
  refuses, which is Frank's call.
- **`pipelines/irrtum/` is an orphan.** No workflow runs it, no npm script names it, its output
  directory does not exist; last commits late June. It is the local predecessor of the Ulysses
  practice ("Irrtum als Methode"), superseded by the cloud engine. It is deliberately **not** a
  node on the map — the map draws the running apparatus — but it is also not deleted here.
