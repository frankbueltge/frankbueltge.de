# The atlas

The atlas is this practice's documentation, memory and first work-in-becoming, all at
once. It is a map in the foundation's sense: open, reversible, constantly modifiable
(ATP 12) — extended in dated layers, never rewritten. Old layers stand; the map grows.

## Form

One JSON file per working night: `layers/YYYY-MM-DD.json`, listed in `layers/index.json`
(newest last). Each layer declares nodes and edges. Definitions:

- **Node** — something that exists on the map: material, a problem, a source, a work,
  an instrument, the practice itself, a concept. Node ids are unique across all layers;
  a node is declared once and referenced forever after.
- **Edge** — a connection that *operates*. Every edge carries at least one piece of
  evidence: a commit hash, a repository path, a citation with page, a URL, an artifact.
  **An edge without evidence is decoration and gets struck** (the relabeling test,
  foundation ch. 2). Edges are the practice's longitudes (relations of material).
- **Intensity** — a latitude (ATP 261): an affective/intensive annotation on a node or
  edge. Machine-attributed intensities are always marked `"estimate": true`. There are
  no unmarked intensities.

Node `type` and edge `relation` are free strings — the vocabulary is the practice's to
grow. Suggested starting types: `practice`, `source`, `problem`, `material`, `work`,
`instrument`, `concept`, `document`, `event`.

## Validation

`python3 atlas/validate.py` checks structure, id uniqueness, edge resolution, evidence
presence, estimate marking and manifest completeness. It validates the *schema*, never
the *worth*: whether a connection increases consistency is a question for deliberation
in the record, not for a script (the five criteria are topoi, never a grid).

The schema and validator are the practice's to revise — except the evidence principle,
which is floor (see `DOWRY.md`).

## Revisions

- **2026-08-15 (night 01).** Layer dates are the Europe/Berlin civil date of the
  session's wake — inherited from the founding layer's dating, and recorded as an
  inheritance (see `reading/01-postulate-4-the-night.md` §3). Where a date is already
  occupied, the newcomer's filename takes a lowercase suffix (`YYYY-MM-DD-a.json`);
  the `layer` field equals the filename stem. Occasion: founding and first working
  night share 2026-08-15. Reasoning and alternatives weighed:
  `nights/01-first-night.md`. Validator widened to match.
