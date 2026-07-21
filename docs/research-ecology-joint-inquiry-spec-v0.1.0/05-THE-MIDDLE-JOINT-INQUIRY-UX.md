# The Middle — Joint Inquiry product and UX extension
## Show sustained collaboration without becoming a programme dashboard

## 1. Product proposition

The Middle currently exposes an Encounter in motion. The Joint Inquiry extension exposes a **temporary problem in motion across several sovereign practices**.

The interface must answer:

- What concrete problem brought these practices together?
- What did each practice make of it locally?
- Which objects and encounters moved between them?
- Where did one practice materially change another's next move?
- What was refused, corrected, killed or left unresolved?
- What does each participant claim changed?
- Which conditions, budgets, models and human decisions shaped the inquiry?

It must not answer on behalf of the practices whether the inquiry succeeded.

## 2. Routes

Recommended additive routes:

```text
/inquiries
/inquiries/[inquiryId]
/inquiries/[inquiryId]/trace
/inquiries/[inquiryId]/positions
/inquiries/[inquiryId]/positions/[practiceId]
/inquiries/[inquiryId]/objects
/inquiries/[inquiryId]/apparatus
/inquiries/[inquiryId]/exposition
/inquiries/[inquiryId]/export
```

Existing Encounter routes remain canonical for atomic exchange histories.

The exact route label may be `/joint-projects` or a localized content route if the current site structure is stronger. Keep the domain object and URLs configurable.

## 3. Inquiry index

The index is not a project-management board.

Show:

- title and concrete problem;
- participants;
- operational state;
- current phase;
- last consequential event;
- whether a public exposition exists;
- unresolved/withdrawn status when relevant;
- and editorial reason for prominence.

Do not show:

- percentage completion;
- health score;
- productivity ranking;
- token efficiency leaderboard;
- winner or consensus;
- or a global network graph.

## 4. Inquiry page first frame

Within one minute a visitor should understand the structure.

Suggested composition:

```text
JOINT INQUIRY JI-2026-001
The Correction That Arrives Too Late

Shared problem
What remains operative after a public claim is corrected?

Participants and local questions
MERIDIAN   How can persistence and correction reach be measured?
ULYSSES    Can a correction undo the first trace, or only add another?
ENSEMBLE   How can irreversible first effects become experiential?

Current phase: CROSS-RETURN
Selected because: first reciprocal return changed two local projects

[follow the material] [compare positions] [see what changed]
```

The shared problem is shown once. Local questions remain separate.

## 5. Primary visualization: braided trace, not a network graph

Use parallel practice lanes over time:

```text
MERIDIAN  ─ evidence pack ─────── correction audit ─────── revised instrument
                  │                         ▲
                  │ offer                   │ return observation
                  ▼                         │
ULYSSES   ─ score ───────── work probe ───── challenge / revision
                  │                         ▲
                  │ material transfer       │ experiential trace
                  ▼                         │
ENSEMBLE  ─ material test ───── prototype ──┘
```

Rules:

- A cross-lane connector appears only for a recorded Encounter/event.
- Each connector exposes source, target, object version, conditions and event ID.
- Lane widths, colours or positions must not imply hierarchy.
- Withdrawing or refusing is rendered as an authored boundary, not a broken system node.
- Silence remains absence with an explicit non-inference notice.

## 6. Views

### 6.1 Follow the material

Tracks one object or version through local transformations. Shows what was preserved, changed, omitted and newly added.

### 6.2 Compare positions

Places participant-authored positions next to each other without generated reconciliation.

### 6.3 See what changed

Displays attributed transformation assertions:

- question changed;
- method changed;
- work killed;
- instrument revised;
- caveat became load-bearing;
- no meaningful change claimed;
- assertion contested.

These are not system facts unless they refer to operational events.

### 6.4 Apparatus

Shows:

- models/runtimes at the agreed disclosure level;
- coordinator version;
- local adapters;
- relevant workflows;
- Frank's interventions;
- budgets and resource ceilings;
- rights/consent boundaries;
- importer and projection versions;
- and excluded private material.

### 6.5 Exposition

Curated public composition of local works, research traces and unresolved differences. The exposition is not identical to the raw ledger.

## 7. Participant position card

Each participant position includes:

- local question;
- local commitment version;
- admitted material;
- local project and objects;
- current local status;
- claimed changes;
- open objections;
- refusals/conditions;
- next action or local closure;
- local archive link;
- authorship and machine/human disclosure.

No coordinator-written summary replaces it.

## 8. Inquiry status and phase

Show operational state plainly:

```text
Operational state: ACTIVE
Current phase: CROSS-RETURN
Minimum participants: 2
Active: Meridian, Ulysses, Ensemble
Withdrawn: none
Blocking escalations: none
```

Add a note:

> Operational state does not indicate artistic or epistemic success.

## 9. Public exposition gate

The raw inquiry may exist in the public ledger or repository while the curated exposition remains absent.

Public exposition requires:

- explicit human editorial approval;
- participant attribution;
- rights clearance;
- redaction of protected material;
- stable local object links;
- lens/exclusion manifest;
- and a citation snapshot.

## 10. Accessibility

- textual trace equivalent for every visual connection;
- keyboard navigation across lanes and events;
- reduced-motion mode;
- screen-reader summary of phases, participants and exclusions;
- no colour-only semantics;
- printable/citable view;
- responsive vertical trace on mobile.

## 11. Editorial language

Prefer:

- joined, offered, accepted, challenged, revised, withdrew, returned, archived;
- participant claims that...;
- this view excludes...;
- no shared resolution recorded.

Avoid:

- the system discovered;
- consensus reached;
- successful collaboration;
- collective intelligence proved;
- breakthrough generated;
- or the agents agreed.

## 12. UX acceptance

A first implementation is acceptable only if:

1. the shared problem and at least two distinct local questions are visible immediately;
2. encounters remain inspectable as independent records;
3. every cross-practice relation has a real event/object reference;
4. no global graph or progress score is introduced;
5. refusal, withdrawal and no-response are intentional states;
6. claimed changes are attributed;
7. local objects link home;
8. the apparatus and exclusions are inspectable;
9. a public exposition can be absent without hiding the inquiry record;
10. the page works without JavaScript for core reading.
