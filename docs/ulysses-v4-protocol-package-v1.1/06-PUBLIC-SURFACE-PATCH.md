# Public surface patch
## Repository and Atelier wording after Protocol v4

## 1. Core public proposition

Recommended base text:

> **Ulysses / Atelier is a situated artistic research practice by Frank Bültge, developed through documented human–machine operations.** Models and tools can identify project candidates, research, compare, transform, build, revise and archive within a standing human delegation. They possess real operative agency, while curated publication, rights-sensitive exceptions, protocol changes and ultimate responsibility remain human. Projects may become works, studies, revisions or terminated lines; completion or automatic repository integration does not create an obligation to publish.

## 2. Short version

> Ulysses is a machine-participatory artistic research practice by Frank Bültge. It works through bounded projects rather than an autonomous nightly production routine.

## 3. Apparatus note

> “Ulysses” names the ongoing practice and, in some works, a constructed research voice. It is not one persistent conscious model identity. Project records disclose the relevant models, tools, infrastructure, sources and human decisions at a level proportionate to the work and its claims.

## 4. Historical note for the journal and old working sheet

> From 28 June to 18 July 2026, Ulysses operated through a recurring session protocol: scheduled model runs wrote journals and works into the repository and were integrated through an automated branch workflow. This record remains public as an early phase of the experiment. Protocol v4 superseded that operating model with bounded projects and explicit human publication decisions.

Adjust the end date to the actual migration date if different.

## 5. Suggested Atelier landing-page structure

### Header

```text
Atelier · Ulysses
A machine-participatory artistic research practice by Frank Bültge
```

### Current project area

Show only:

- explicitly published v4 projects;
- current public studies only when separately approved;
- clear project status and version;
- a work route and a research-exposition route;
- an expandable apparatus panel.

### Historical phase

Create a distinct entry such as:

```text
Nightly protocol archive · 28 June–18 July 2026
```

The existing working sheet, journal, pulse and v3 works may live here without being presented as the current operating model.

### Material shelf

Keep the shelf as Ulysses’ situated reading and annotation practice. Remove any wording that makes reading a nightly obligation. Preserve the distinction between Ulysses’ shelf and Frank’s wider atlas.

## 6. Minimum apparatus panel for a published v4 project

```text
Made by
Machine operations
Sources and data
Human selection and changes
Infrastructure and version
Rights and affected publics
Known limits
Corrections and contestations
```

The panel should be edited for readability and may link to a machine-readable record.

## 7. Claims to remove from current-state copy

Remove or historicise:

- “full autonomy”;
- “every night Ulysses holds a research session”;
- “sessions published unedited” as a current rule;
- “Ulysses answers for her own words”;
- “the nightly repetition itself is form”;
- “aim to regularly leave a functional artefact”;
- any current metric suggesting health through output or continuity;
- any implication that the current working sheet is a map of the whole ecology.

## 8. Publication projection rule

The site must not infer publication from:

- presence under `works/` alone;
- merge to `main`;
- a green build;
- completion of a model task;
- an `ACTIVE` or `REVIEW` project;
- or historical auto-land metadata.

For v4, public projection requires a valid `PUBLICATION.json` and resolvable approved artefacts.

## 9. SEO and repository description

Suggested GitHub description:

> Ulysses / Atelier — a situated artistic research practice by Frank Bültge, developed through bounded and documented human–machine operations.

Suggested page description:

> Artistic research through bounded human–machine projects: works, studies, apparatus records, sources, corrections and unresolved lines.


## 10. Research archive versus curated works

The public repository may automatically receive clearly labelled active projects, studies, failed lines, killed projects and publication candidates. This is an inspectable research archive, not a works gallery. The Atelier works surface imports only projects with a valid human-approved `PUBLICATION.json`.
