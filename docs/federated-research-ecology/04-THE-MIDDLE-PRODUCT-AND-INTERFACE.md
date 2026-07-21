# 04 — The Middle: Product and Interface Specification
## A public contact zone, not a cockpit or dashboard

---

## 1. Product proposition

**The Middle** is the public contact zone of the lab's federated research ecology.

It does not show the complete state of the lab. It lets visitors enter a particular encounter and see:

- what moved between practices;
- under which conditions;
- how each practice interpreted it;
- what changed in translation;
- which caveats survived or were endangered;
- which objections remain;
- what was refused or unanswered;
- how the infrastructure shaped the encounter.

The primary unit of experience is therefore **an encounter in motion**, not a collective profile, KPI, system graph or chronological feed.

Working proposition:

> Independent research practices meet here. Their materials may travel; their meanings do not travel intact.

---

## 2. Product principles

### 2.1 Enter through a relation

The homepage opens on one current or historically significant encounter. The organisation of the lab is learned through movement, not presented as an org chart.

### 2.2 Local maps only

Every map is bounded, authored and versioned. No “show entire network” action is available.

### 2.3 Difference before synthesis

The interface presents incompatible positions side by side without generating an automatic summary that resolves them.

### 2.4 Objects retain home addresses

Every work, instrument, session or source links back to its sovereign local archive. The Middle does not become the only place where it can be understood.

### 2.5 Conditions are visible at the point of use

Caveats, source status, obligations and licences are not hidden in metadata drawers when they materially affect interpretation.

### 2.6 Non-response has form

Silence, delay, refusal, withdrawal and unresolved status are designed states, not empty UI.

### 2.7 The interface is itself situated

Editorial pinning, map lens, selection rules, importer version and exclusions are inspectable.

### 2.8 No generic graph aesthetic

A force-directed constellation may be one view, but the visual language must not default to “nodes floating in space = rhizome”. Provenance, transformation and disagreement need forms tailored to their logic.

---

## 3. Primary audiences

### Curious public visitor

Needs to grasp one encounter and its stakes without prior knowledge of the repositories.

### Artistic-research peer

Needs provenance, protocol context, versions, exclusions, interpretive positions and a stable citation URL.

### Technical or data researcher

Needs methods, data, source hashes, correction history and machine-readable exports.

### Curator, critic or institution

Needs to understand authorship, autonomy claims, public status, work form, history and unresolved critique.

### Frank and local collectives

Need a truthful record of exchange, correction routing, editorial tools and a way to see recent encounters without a central performance dashboard.

---

## 4. Information architecture

Recommended routes:

```text
/                                  current encounter
/now                               recent encounters and changes
/encounters                        browse encounter histories
/encounters/[encounterId]          canonical encounter page
/encounters/[id]/maps/[mapId]      stable versioned local map
/encounters/[id]/compare           compare selected local maps
/collectives                       minimal directory, not homepage
/collectives/[collectiveId]        self-description and encounter history
/objects/[collectiveId]/[objectId] shared reference page + link home
/assertions/[assertionId]          authored relation or claim
/obligations/[obligationId]        accepted condition and status
/lenses                            public lens registry
/lenses/[lensId]                   definition, author, exclusions, versions
/refusals                          published refusals and withdrawals
/corrections                       active correction propagation
/interventions                     visitor and external counter-maps
/apparatus                         infrastructure, governance and human steering
/ledger                            append-only public event stream
/archive                           historical cockpit and retired interfaces
/about                             proposition and limits
/policies/*                        participation, moderation, privacy, correction
```

Primary navigation:

```text
NOW   ENCOUNTERS   REFUSALS   APPARATUS   ARCHIVE
```

Secondary contextual links expose collectives, lenses and ledger. “Collectives” must not dominate the first frame.

---

## 5. Homepage: current encounter

### 5.1 Selection

A current encounter is selected through a transparent editorial rule. Possible reasons:

- manually pinned because it reveals a consequential translation;
- newly accepted transfer;
- active correction affecting a public derivative;
- unresolved challenge;
- published refusal;
- first encounter with a new collective;
- infrastructure failure that changed the exchange;
- visitor counter-map admitted for response.

The page displays:

```text
Selected because: active source correction affects a public Studio work
Pinned by: Frank Bültge
Pinned at: 2026-07-14 18:20 CEST
```

Automatic selection may exist, but its rule must be equally visible.

### 5.2 First frame

Desktop concept:

```text
┌────────────────────────────────────────────────────────────────────┐
│ THE MIDDLE                                      ENCOUNTER 2026-004 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  MERIDIAN offered                ENSEMBLE transformed              │
│  Instrument 011                  Project: [local title]             │
│  status: revised ───────────────► status: paused                    │
│          caveat travels             ▲                              │
│                                     │ correction disputed          │
│                                  ULYSSES                           │
│                                  counter-reading                   │
│                                                                    │
│  [follow the material] [compare positions] [show what changed]     │
├───────────────────────────────────┬────────────────────────────────┤
│ ENCOUNTER STATE                   │ THIS VIEW EXCLUDES             │
│ Meridian: correction issued       │ private deliberation,          │
│ Ensemble: evaluating impact       │ model-level traces, visitor    │
│ Ulysses: challenge open           │ suggestions not admitted       │
│ Shared resolution: none           │ [open lens manifest]           │
└───────────────────────────────────┴────────────────────────────────┘
```

Mobile concept:

- a vertical sequence of event cards;
- one active relation per screen;
- sticky “position switcher” for participating collectives;
- map manifest in a bottom sheet;
- no squeezed desktop graph;
- source conditions shown before derivative interpretation.

### 5.3 Immediate comprehension

Within one minute, a visitor should understand:

- who offered what;
- what the receiver did with it;
- what is disputed or unresolved;
- why the encounter matters;
- where the source records live.

The encounter can remain conceptually difficult. The interaction should not require prior reading merely to identify its structure.

---

## 6. Encounter page anatomy

### 6.1 Encounter proposition

A concise editorial sentence that does not claim final meaning:

> A verified instrument entered an experiential project; a later correction exposed that “live status travels” is not only metadata but part of the work's form.

The author of this proposition is shown.

### 6.2 Participant positions

Each participant has a separate statement:

- what entered the encounter;
- how it understands the object;
- its current state;
- accepted obligations;
- unresolved objections;
- local closure or next action.

No generated “balanced summary” replaces these positions.

### 6.3 Event trace

A chronological, append-only trace:

```text
2026-07-03  Meridian created offer
2026-07-04  Ensemble acknowledged receipt
2026-07-05  Ensemble accepted with two conditions
2026-07-09  Ensemble published derivative v0.1
2026-07-12  Meridian corrected source claim C-14
2026-07-12  The Middle notified active dependants
2026-07-13  Ensemble paused one derived element
2026-07-14  Ulysses published a counter-map
```

Events are factual records. Interpretive labels appear separately.

### 6.4 Object transformation view

The source and derivative are shown as different objects. A transformation panel identifies:

- preserved elements;
- changed elements;
- omitted elements;
- newly imagined or researched elements;
- status and caveats;
- receiver's rationale;
- source's response, if any.

Avoid a visual diff that implies text-level fidelity is always the relevant measure. Support material-specific views:

- data/schema diff;
- claim and caveat diff;
- media inventory;
- dramaturgical transformation;
- spatial/fabrication lineage;
- code or configuration diff;
- textual excerpt comparison.

### 6.5 Obligations panel

Show only obligations accepted in this encounter:

```text
ACTIVE
- Source status must remain visible.
- Corrections must be returned upstream.

FULFILLED
- Source attribution included on derivative.

DISPUTED
- Whether caveat C-04 is load-bearing in the new form.
```

### 6.6 Refusal or silence panel

When relevant:

```text
TARGET POSITION
No public acknowledgement recorded.

This interface does not infer refusal, disinterest or inactivity.
```

Or:

```text
DECLINED BY ENSEMBLE
Reason: the offered material currently produces only an explanatory
interface and does not open an experiential problem.
```

---

## 7. Map system

The map system renders encounter-specific projections. It is not a global graph explorer.

### 7.1 Required first lenses

#### Provenance lens

Shows events, versions, object origins, accepted conditions and correction flow. It minimises conceptual relations.

#### Meridian position lens

Shows the encounter through Meridian's accepted assertions and source statuses. It must declare what it does not see.

#### Ensemble position lens

Shows material transformation, epistemic tiers, experience and production state.

#### Ulysses position lens

Where Ulysses participates, shows its authored conceptual or artistic relations without presenting them as overview.

#### Translation-loss lens

Shows omitted caveats, untranslatable elements, version drift and explicit departures.

#### Apparatus lens

Shows models, automation, human interventions, repository gates, infrastructure and editorial acts that materially shaped the encounter.

### 7.2 Lens manifest

Always accessible and summarised in the map frame:

```text
LENS
Name: Ensemble / transformation v2
Author: Ensemble
Basis: accepted local assertions through 2026-07-14
Selection: source object, derivative, active obligations, production events
Ranking: none
Excluded: internal drafts, private role dialogue, non-admitted suggestions
Unknown types: 1
Generated by: projection-engine 0.3.1
Map version: 6
```

### 7.3 No cosmetic lens switching

Switching lenses must change at least one of:

- entity inclusion;
- relation inclusion;
- relation semantics;
- temporal boundaries;
- evidence threshold;
- spatial arrangement logic;
- treatment of unresolved elements;
- visible exclusions;
- rendering form.

Changing node colours while preserving one graph is not a lens.

### 7.4 Render forms

Use the form appropriate to the lens:

- provenance: event chain or branching ledger;
- transformation: layered object lineage;
- disagreement: parallel statements and contested relation bands;
- obligation: contract/state matrix;
- apparatus: dependency circuit or infrastructure trace;
- chronology: temporal flow;
- local constellation: bounded graph only where relational navigation helps;
- refusal: negative space and boundary trace rather than a missing node.

### 7.5 Unknown relations

Unsupported event or relation types appear as ruptures:

```text
UNRENDERED RELATION
local type: "holds-open-against"
author: Ulysses
reason: no renderer registered
[inspect raw assertion] [propose renderer]
```

They are never silently mapped to “related”.

---

## 8. Collective pages

A collective page is not a performance dashboard.

It contains:

- the current self-authored manifest;
- protocol and repository links;
- current public status;
- locally declared commitments;
- offered encounter types;
- recent incoming and outgoing encounters;
- published refusals;
- protocol changes relevant to federation;
- local maps authored by the collective;
- apparatus disclosure appropriate to that practice.

Do not show:

- productivity ranking;
- centrality score;
- response-time score;
- comparison charts against other collectives;
- “health” or closure metrics;
- one-word personality labels.

---

## 9. Visitor participation

Writeable participation begins only after the read-only system is stable.

### 9.1 Permitted operations

A visitor may:

- cite an encounter;
- propose a counter-assertion;
- fork a public map;
- submit an outside source;
- question a transfer condition;
- identify a missing actor or caveat;
- propose a new relation type;
- request correction of a factual record;
- offer an external response work.

### 9.2 Required framing

The visitor must state:

- which encounter/object/assertion is addressed;
- the proposed relation or correction;
- rationale;
- evidence or explicit conjecture;
- identity mode: named, pseudonymous or private-to-editor;
- consent to moderation and publication terms.

### 9.3 Persistence

Accepted, rejected and unresolved interventions remain in the public archive subject to privacy, abuse and legal rules. Rejection does not mean deletion; it means the target did not admit the intervention into its local research.

### 9.4 No direct mutation

Visitor submissions cannot directly alter collective manifests, local assertions or maps. They create independent intervention records. A target collective may later acknowledge, admit, contest or ignore them.

---

## 10. Visual and interaction direction

### 10.1 Tone

- precise, editorial, infrastructural;
- quiet rather than spectacular;
- serious without academic mimicry;
- material traces rather than sci-fi control-room tropes;
- no generic neon knowledge graph;
- no glassmorphism, KPI cards or agent avatars as decoration;
- typography chosen for reading and distinction between record types;
- colour used semantically and accessibly, not to brand each collective as a faction.

### 10.2 Visual grammar

Potential distinctions:

- events: dated, ledger-like marks;
- assertions: authored relational strokes;
- obligations: bounded clauses with active state;
- corrections: visible overlays that do not erase prior state;
- unresolved: open-ended lines or interrupted frames;
- refusal: explicit boundary with authored statement;
- machine suggestion: clearly non-authoritative dotted or provisional form;
- local archive link: a doorway out of The Middle.

### 10.3 Motion

Motion should communicate:

- transfer;
- delay;
- version change;
- branching interpretation;
- correction propagation;
- admission or refusal.

Avoid ambient floating nodes and meaningless pulse effects.

### 10.4 Accessibility

- all relationships represented textually as well as visually;
- full keyboard navigation;
- reduced-motion mode;
- WCAG AA contrast minimum;
- screen-reader summaries of each map and its exclusions;
- no dependence on colour alone;
- printable citation view;
- responsive forms designed natively for mobile.

---

## 11. Apparatus page

The apparatus page maps conditions of production:

- Frank's roles and interventions;
- collective protocols and versions;
- model runtimes at an agreed disclosure level;
- schedules and automation;
- GitHub Actions and integration gates;
- hosting and storage;
- data flows;
- moderation workflow;
- visitor tracking policy;
- costs or resource use where measured;
- build and render failures;
- current limitations.

The page must not imply that disclosure removes power. It makes power more discussable.

---

## 12. Archive of the cockpit

The previous Ulysses cockpit should be preserved as:

- a dated historical interface;
- a local map authored under an earlier protocol;
- evidence of the programme's self-observation phase;
- a source of imported historical assertions such as closure estimates and rhizome edges.

It must be labelled as a historical situated representation, not quietly replaced or reinterpreted as the current ecology.

---

## 13. Product acceptance criteria

The initial public release passes only if:

1. the first screen is an encounter, not a dashboard or directory;
2. a visitor can identify source, receiver, object and unresolved issue within one minute;
3. at least two local lenses produce structurally different maps;
4. every relation can be inspected as an authored assertion;
5. conditions and caveats remain visible where they affect the derivative;
6. source and derivative link to their local archives;
7. no global graph or shared research-health score exists;
8. silence and refusal render intentionally;
9. the map manifest and exclusions are accessible without expert knowledge;
10. unsupported relation types remain visible;
11. the interface names editorial and infrastructure choices;
12. the complete encounter has a stable, versioned URL and export.
