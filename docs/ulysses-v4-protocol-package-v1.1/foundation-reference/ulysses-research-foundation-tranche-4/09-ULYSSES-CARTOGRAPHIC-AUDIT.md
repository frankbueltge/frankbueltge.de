# Ulysses Cartographic Audit
## Atlas, Pulse, Rhizome graph, closure metrics and public working sheet

## 1. Scope

This audit examines the current Ulysses cartographic apparatus as a historical and operational object. It does not judge whether individual diagrams are visually successful. It asks what kinds of authority, relation and action they produce.

Audited components:

- `atlas/atlas.json` and related admission logic;
- `pulse/rhizome.json`;
- `pulse/vital-signs.json`;
- public Atelier working sheet;
- repository workflows and session-generated updates;
- the relation among sources, threads, works and the public site.

## 2. What the current apparatus accomplishes

The existing system has real strengths:

- sources are addressable and annotated;
- works can be related to research threads;
- Ulysses' historical self-reading is inspectable;
- changes are versioned in Git;
- public diagrams disclose that they are authored rather than universal;
- recent working-sheet language explicitly recognises the danger of reabsorbing the outside;
- the apparatus provides evidence of Ulysses' conceptual development and earlier category errors.

The correct response is therefore not deletion. It is a change of status and authority.

## 3. Atlas diagnosis

### Current function

The Atlas is a curated bibliographic reservoir with statuses, tags, relevance notes and relations to Ulysses' research programme.

### Why it is not yet an open cartography

The Atlas admits material through a predefined vocabulary and asks how a source relates to existing Ulysses concerns. This gives it the structure:

```text
external source
-> Ulysses classification
-> Ulysses thread
-> Ulysses work or protocol implication
```

This is useful for local research management. It becomes problematic when described as the outside or as a rhizomatic atlas, because the source's alterity is measured by its relevance to the receiving system.

### Required change

Rename its epistemic role:

> **Ulysses Source Shelf / situated bibliography**

The Atlas can remain as a historical term, but its interface should state:

- entries are Ulysses' local readings;
- tags are not properties of the sources;
- non-admission is not irrelevance;
- an annotation may be contested or superseded;
- sources may remain unread, incompatible or unassimilated;
- external vocabularies can be preserved without translation.

## 4. Rhizome graph diagnosis

### Current function

The graph relates sources, threads, concepts and works through authored edges.

### Positive value

As a local historical map, it makes Ulysses' internal genealogy inspectable.

### Main problem

Its grammar privileges developmental assimilation. Relations often imply that a source enters, changes a thread and is then elaborated into a work. Even when an edge is labelled as a swerve, the structure returns to Ulysses' own genealogy.

The graph therefore risks becoming a tracing of Ulysses' self-description rather than a map that can change its conditions.

### Required change

Replace the idea of one evolving `rhizome` with versioned local maps:

```text
maps/
  <map-id>/
    lens.yml
    assertions.jsonl
    exclusions.md
    renderings/
    contestations.jsonl
```

Each edge becomes an authored assertion with:

- author/practice;
- date and version;
- source records;
- relation type;
- rationale;
- confidence or status where appropriate;
- contestations;
- expiry or supersession status.

There is no default “all maps combined” view.

## 5. Closure and vital-sign diagnosis

### Current function

Closure values attempt to measure the degree to which research threads are open or self-contained.

### Problem

A scalar closure measure recentres Ulysses as the sovereign observer of its own openness. It converts a qualitative and political condition into a performance indicator.

Even when the score includes caveats, it can:

- reward imported sources without testing whether they transformed the practice;
- treat connection count as openness;
- produce optimisation pressure;
- imply comparability across unlike research lines;
- create the new One that `n - 1` was meant to resist.

### Decision

**Retire closure as an active governance or quality metric.**

Keep historical values as evidence of the project's development. Replace them with non-aggregated questions:

```yaml
openness_review:
  which_external_conditions_changed_the_work:
  which_sources_were_not_assimilated:
  which_relations_were_refused_or_contested:
  which_categories_changed:
  which_blind_spots_remain:
  who_authored_this_review:
```

No total score follows.

## 6. Public working sheet diagnosis

The working sheet's strongest recent move is its explicit declaration that every edge is Ulysses' reading and its self-critique of `n + 1` disguised as `n - 1`.

This should become constitutional rather than merely curatorial.

### What should remain

- local authorship disclosure;
- no global time axis or system-wide truth claim;
- visible disconnected materials;
- provisional language;
- public presentation of unresolved relations.

### What should change

Disconnected triads or absent bridges are not sufficient by themselves. The interface must show the operational consequence of non-connection:

- no automatic relevance ranking;
- no forced thematic label;
- no hidden edge in the canonical data model;
- no requirement that every source produce a work;
- possibility of contestation or refusal;
- preservation of incompatible vocabularies.

## 7. Branches, automation and cartographic authority

When scheduled sessions automatically update pulse, atlas or genealogy files, the runtime is not merely documenting research. It is exercising cartographic authority.

Therefore:

- map updates should not be mandatory outputs of every run;
- automatic edge generation must remain suggestions, not admitted relations;
- model-generated mappings require explicit actor identity;
- public maps require review separate from code build success;
- a failed or abandoned project need not be integrated into a developmental genealogy;
- source admission and map assertion should be separate operations.

## 8. Proposed future status of components

| Current component | Future status |
|---|---|
| Atlas | situated source shelf and annotation archive |
| Rhizome graph | historical Ulysses self-map, superseded by versioned lens maps |
| Pulse | local activity record, not vitality proof |
| Closure score | historical artefact; retired active metric |
| Working sheet | public experimental map surface with stronger lens/exclusion disclosure |
| Genealogy edges | authored, contestable assertions rather than canonical history |
| Source tags | local annotations, not source properties |

## 9. Migration principles

1. Do not rewrite old data to appear more theoretically correct.
2. Mark current structures as historical/local.
3. Preserve old URLs and exports where feasible.
4. Introduce new map records alongside the archive.
5. Retire automatic closure updates first.
6. Separate source annotation from relation assertion.
7. Build no global map endpoint.
8. Require a lens manifest for each new public map.
9. Support refusal, unknown relation and incompatible vocabulary as explicit states.
10. Do not implement the migration until the final Foundation tranche confirms the agency and responsibility model.

## 10. Audit conclusion

The current cartographic system is not worthless or fraudulent. It is a valuable self-portrait of an early Ulysses. Its weakness is that it often mistakes a well-documented internal genealogy for an open map.

The next system should preserve that history while shifting from:

```text
one evolving map of Ulysses
```

to:

```text
several situated mappings
+ declared lenses
+ contestable relation assertions
+ preserved non-relations
+ no sovereign aggregate
```
