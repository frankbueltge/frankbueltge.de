# Concept Dossier
## Situated apparatus and responsibility

## 1. Core question

If Ulysses is not a sovereign machine artist, what is it?

The strongest answer is not “a tool” but a **situated apparatus**: a changing arrangement of people, model runtimes, protocols, code, sources, interfaces, institutions, energy, hardware, laws and publics through which objects and claims are produced.

The term is useful only if it does real work. It must show:

- where distinctions are made;
- which capacities are delegated;
- which relations are excluded;
- who has authority;
- who bears consequences;
- and how the apparatus could be reconfigured.

## 2. Haraway: partial perspective and answerability

Situated knowledge rejects both the “view from nowhere” and a relativism in which every position is equally valid. Its demand is stronger: knowledge claims must acknowledge the position and instruments through which they become possible, and the knower must become answerable for what that position enables them to see.

For Ulysses this means:

- no claim to survey “the field” from an abstract exterior;
- no model-generated synthesis presented as neutral overview;
- explicit location in a repository, provider stack, language, source corpus and human editorial project;
- awareness that the current corpus is heavily European and North American;
- disclosure of who can contest a claim and who cannot access the process;
- recognition that partiality is not a weakness to hide but a condition to expose.

A situated work does not need to include an autobiographical confession. It must make its epistemic and technical position inspectable where that position matters.

## 3. Barad: apparatus and agential cuts

A static instrument model assumes that subjects and objects already exist, then interact through a neutral device. The apparatus account is different: practices of measurement, classification and representation enact provisional boundaries through which “object,” “observer,” “data,” “model” and “output” become distinguishable.

For Ulysses, an agential cut occurs when the practice decides, for example:

- which files count as memory;
- which model response counts as a session;
- where the work ends and documentation begins;
- which source becomes evidence and which becomes background;
- whether Frank is described as editor, co-author, architect or external operator;
- whether a provider’s moderation layer is part of the work;
- which interactions become public traces.

These are not merely metadata decisions. They produce the object under inquiry.

Operational requirement:

> Every project must identify at least one load-bearing cut and state what it excludes or makes possible.

## 4. Suchman: situated action and configured autonomy

Plans do not fully determine action. Real action unfolds through local contingencies, repairs and interactions with material circumstances. Likewise, “autonomous systems” are not simply born autonomous; autonomy is configured through interfaces, delegated permissions, hidden support and selective descriptions.

Ulysses currently illustrates this clearly:

- a schedule initiates the run;
- a protocol defines role and permissible action;
- tools determine what can be researched;
- repository memory constrains continuity;
- workflow rules decide which branches land;
- a site gate determines public visibility;
- Frank can intervene, terminate and redefine conditions.

The public statement “Ulysses chooses” is therefore incomplete unless the choice architecture is named.

The protocol should distinguish:

```text
choice offered by the apparatus
choice made by a model runtime
choice ratified by the practice
choice authorised for publication
```

## 5. Responsibility is not equivalent to control

A human does not need perfect control over every output to remain responsible for deploying, framing or publishing the system. Conversely, a machine can causally influence a result without becoming responsible in a moral or legal sense.

Responsibility in Ulysses has several layers.

### Operational responsibility

Who configured the run, permissions, tools and stop conditions?

### Epistemic responsibility

Who verifies claims, marks uncertainty and corrects errors?

### Editorial responsibility

Who decides that an output becomes a work or public record?

### Legal responsibility

Who handles copyright, privacy, defamation, licensing and takedown?

### Relational responsibility

Who answers to people or communities represented, affected or used as material?

### Infrastructural responsibility

Who chooses providers, manages secrets, pays costs, preserves archives and handles failures?

In the present arrangement, Frank carries the final responsibility across these domains even when a model runtime has broad operational freedom.

## 6. Human accountability without human exceptionalism

Human accountability should not be confused with the claim that only humans matter or that nonhuman systems are passive. The Foundation adopts a non-exceptionalist but responsibility-preserving position:

- nonhuman systems can shape possibilities and produce consequences;
- materials and infrastructures can resist and redirect action;
- humans do not fully master the apparatus;
- nevertheless, institutions and operators cannot transfer accountability to a model that cannot answer claims, repair damage or participate in legal and ethical obligations.

This is the meaning of:

> agent-maintainable, human-accountable.

## 7. Affected publics

A public is not merely an audience after the work is complete. Some people may be affected because:

- their data or images enter a model or dataset;
- their community is represented or classified;
- a work makes claims about them;
- an interface changes access or visibility;
- a public interaction generates new research material.

The project must distinguish:

- viewers;
- participants;
- data subjects;
- source communities;
- represented communities;
- collaborators;
- people exposed to risk.

These roles imply different rights. A viewer’s presence does not imply consent to become training data. A publicly accessible source does not imply community approval. A citation does not grant authority to reinterpret cultural knowledge without limits.

## 8. Situated apparatus manifest

Every public work should include a concise, expandable manifest:

```yaml
apparatus_manifest:
  work_id:
  date_and_version:
  responsible_human:
  local_practice:

  machine_runtimes:
    provider:
    model:
    version_or_date:
    delegated_roles:
    known_limits:

  human_roles:
    concept:
    selection:
    editing:
    verification:
    publication:

  source_material:
    provenance:
    rights_or_licence:
    consent_or_authority:
    known_absences:

  infrastructure:
    repository:
    tools:
    external_services:
    publication_gate:
    material_dependencies:

  affected_publics:
    identified_groups:
    possible_effects:
    participation_or_refusal:

  agential_cuts:
  exclusions:
  unresolved_contestations:
  correction_route:
```

The public surface may show a readable summary rather than the complete YAML. The full record should remain available.

## 9. Failure modes

The situated-apparatus model fails if:

- “everything is connected” replaces specific responsibility;
- every minor library becomes an equal actor;
- a long disclosure note substitutes for artistic strength;
- affected communities are named but have no authority;
- partiality is used to excuse factual negligence;
- machine unpredictability becomes a reason to deny publisher responsibility;
- the apparatus is described after the fact but cannot be changed;
- the human operator is treated as external even though they control continuation and publication.

## 10. Consequence for the final Ulysses model

Ulysses must be defined as a practice whose conditions are constitutive and revisable, not as a hidden model personality.

The future protocol should require:

- explicit delegation boundaries;
- visible human publication authority;
- work-level apparatus manifests;
- affected-public analysis when relevant;
- contestation and correction routes;
- no claim of neutral or comprehensive view;
- and no use of “the machine decided” as an accountability escape.
