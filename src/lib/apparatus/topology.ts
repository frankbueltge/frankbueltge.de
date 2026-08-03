// src/lib/apparatus/topology.ts — the apparatus as data: every repository, workflow, pipeline,
// store, service and deploy hop of the federated research ecology, and the mechanism that wires
// each pair together. Spec: docs/superpowers/specs/2026-08-03-apparatus-map.md.
//
// The claim this module exists to make checkable (werkgruppe-design §2, "Messinstrumente statt
// Visualisierungen"): EVERY WORKFLOW THAT COMMITS TO THIS REPOSITORY REACHES PRODUCTION, AND
// EVERY EDGE OF THE FEDERATION IS A MECHANISM WRITTEN DOWN IN A COMMITTED FILE. It is
// falsifiable, and on 2026-08-03 it was false in three places (see the spec's §1) — which is the
// whole reason this file is data with a guard rather than prose on a page.
//
// topology.test.ts is the machine-checked half of it: it reads .github/workflows/*.yml with
// node:fs and fails when a declared workflow name, cron, dispatch type or file path drifts from
// what is written here. Same split as src/lib/redirects.test.ts, which guards
// docs/redirect-matrix-site-v2.md against public/_redirects. The prose page this replaces said
// of itself: "it is prose, not a build-time report against the workflow files."
//
// What this module is NOT (ADR 0001, "no canonical global graph"): a map of authored relations.
// It carries no edge between research CONTENTS — no work citing a work, no practice influencing
// a practice, no ranking among the practices. Its edges are mechanics anyone can read out of a
// committed file. The ADR forbids making interpretive edges look factual; here the edges ARE
// facts, and the ones that cannot be machine-checked say so in `checked`.
//
// Appearance lives nowhere in this file (ADR 0010) — no colour, no coordinate, no size.

import type { VoiceId } from '@/lib/partitur'

/** Who a node belongs to. The four voices carry identity colour from the `ecology-voices`
 *  palette set; `shared` takes that set's declared neutral — the same greyness The Middle
 *  already wears, and for the same reason: no resident. */
export type Owner = VoiceId | 'shared'

/**
 * Where a node sits in the flow. The ecology has TWO inflows into its archive, not one, and the
 * layering says so: the world enters through instruments (measurement), the practices enter
 * through gates (research). Both converge on the same committed files, and everything leaves
 * through one delivery chain.
 *
 * `oversight` is deliberately outside that flow — watchdogs, issues and the conductor act ON the
 * apparatus rather than passing material through it.
 */
export type Layer =
  | 'world'
  | 'instruments'
  | 'practices'
  | 'gates'
  | 'archive'
  | 'delivery'
  | 'oversight'

/** What a node is. Drives mark shape in the figure — never colour. */
export type NodeKind =
  | 'source' // something outside the ecology that is read
  | 'pipeline' // code in this repo that turns a source into a committed file
  | 'repo' // a sovereign repository (ADR 0003)
  | 'gate' // a workflow that admits foreign material under checks
  | 'store' // committed files: "Git ist das Archiv"
  | 'service' // something that runs at request time, not at build time
  | 'host' // where the built site is served from
  | 'person' // the conductor

/** One member of a group node, listed in the detail panel and in the table floor. Members are
 *  what keeps the figure at ~35 marks while the record stays complete. */
export interface GroupMember {
  label: string
  /** one line: what it does */
  what: string
  /** repo-relative path (existence-tested) or an external URL */
  ref?: string
  /** declared `name:` of a workflow — checked against the file it names */
  workflowName?: string
  /** cron expressions exactly as declared — checked against the file */
  cron?: string[]
  /** secret names this member needs; never values */
  secrets?: string[]
}

export interface ApparatusNode {
  id: string
  label: string
  layer: Layer
  kind: NodeKind
  owner: Owner
  /** one sentence, plain language: what this is */
  what: string
  /** repo-relative path or external URL. In-repo paths are existence-tested. */
  ref?: string
  /** the identity this node commits under, where it commits (the `@…invalid` / persona rule) */
  commitsAs?: string
  members?: GroupMember[]
}

/** How one node reaches another. Plain enough to print in the readout, precise enough that a
 *  reader can go and find it: "workflow_run after nightly" beats "automatically". */
export type MechanismKind =
  | 'repository_dispatch'
  | 'workflow_run'
  | 'cron'
  | 'push'
  | 'https'
  | 'clone'
  | 'commit'
  | 'github-api'
  | 'deploy'
  | 'issue'
  | 'human'

/**
 * `derived` — topology.test.ts reads this edge out of the file named in `ref` and fails if it
 * changes. `declared` — asserted here and only structurally checked (the file exists, the ids
 * resolve). The figure draws the difference, because a map that hid it would be making the
 * weaker claim look like the stronger one.
 */
export type Checked = 'derived' | 'declared'

export interface ApparatusEdge {
  from: string
  to: string
  kind: MechanismKind
  /** the mechanism in one printable line */
  mechanism: string
  checked: Checked
  /** repo-relative file the mechanism is written in */
  ref?: string
  /** set when this wiring is currently broken; the figure severs the line and prints this.
   *  Not a status colour — a statement of fact with its evidence beside it. */
  severed?: string
}

// ─────────────────────────────────────────────────────────────────── nodes

export const NODES: readonly ApparatusNode[] = [
  // ── the world ──────────────────────────────────────────────────────────
  {
    id: 'src-earth',
    label: 'Earth observation',
    layer: 'world',
    kind: 'source',
    owner: 'shared',
    what: 'Public measurements of the physical world, read over HTTPS by the nightly instruments.',
    members: [
      { label: 'NOAA GML', what: 'global CO₂ trend', ref: 'pipelines/protokoll/src/protokoll/adapters/co2.py' },
      { label: 'NSIDC G02135', what: 'daily sea-ice extent, both poles', ref: 'pipelines/protokoll/src/protokoll/adapters/seaice.py' },
      { label: 'Climate Reanalyzer', what: 'sea-surface temperature (OISST 2.1)', ref: 'pipelines/protokoll/src/protokoll/adapters/sst.py' },
      { label: 'NASA FIRMS', what: 'active fire detections', ref: 'pipelines/protokoll/src/protokoll/adapters/fires.py', secrets: ['FIRMS_MAP_KEY'] },
      { label: 'USGS', what: 'earthquakes, magnitude 4.5+, past day', ref: 'pipelines/protokoll/src/protokoll/adapters/quakes.py' },
      { label: 'NASA GISTEMP', what: 'global temperature anomalies for the hero', ref: 'scripts/fetch-climate.ts' },
      { label: 'Global Fishing Watch', what: 'vessel events behind Ghost Fleet', ref: 'pipelines/ghost-fleet', secrets: ['GFW_TOKEN'] },
      { label: 'Space-track / CelesTrak', what: 'orbital elements for the overflight study', ref: 'scripts/fetch-ueberflug.ts' },
    ],
  },
  {
    id: 'src-conflict',
    label: 'Conflict & media',
    layer: 'world',
    kind: 'source',
    owner: 'shared',
    what: 'What the world is fighting about and looking at — the no-GCP replacement for BigQuery reads GDELT as raw files over plain HTTP.',
    members: [
      { label: 'GDELT raw files', what: 'the conflict item of the protocol agenda', ref: 'pipelines/protokoll/src/protokoll/adapters/conflict.py' },
      { label: 'GDELT DOC 2.0 API', what: 'orchestrated consensus, measured by The Consensus', ref: 'pipelines/consensus/refresh.py' },
      { label: 'Wikimedia REST', what: 'most-read articles, the attention item', ref: 'pipelines/protokoll/src/protokoll/adapters/attention.py' },
    ],
  },
  {
    id: 'src-economy',
    label: 'Economy & energy',
    layer: 'world',
    kind: 'source',
    owner: 'shared',
    what: 'Prices, rates, people and the numbers institutions publish about themselves.',
    members: [
      { label: 'ECB data portal', what: '€STR reference rate', ref: 'pipelines/protokoll/src/protokoll/adapters/rates.py' },
      { label: 'EIA', what: 'spot oil price', ref: 'pipelines/protokoll/src/protokoll/adapters/oil.py', secrets: ['EIA_API_KEY'] },
      { label: 'FAO', what: 'food price index', ref: 'pipelines/protokoll/src/protokoll/adapters/food.py' },
      { label: 'UN WPP', what: 'world population (bundled, not fetched)', ref: 'pipelines/protokoll/src/protokoll/adapters/population.py' },
      { label: 'UNHCR', what: 'global displacement', ref: 'pipelines/protokoll/src/protokoll/adapters/refugees.py' },
      { label: 'World Bank', what: 'indicators behind Round Number', ref: 'pipelines/round-number' },
      { label: 'Philadelphia Fed', what: 'real-time revisions behind The Correction', ref: 'pipelines/revision/refresh.py' },
      { label: 'Hyperscaler reports', what: 'the efficiency figures Headroom watches', ref: 'pipelines/protokoll/src/protokoll/spielraum' },
    ],
  },
  {
    id: 'src-scholarly',
    label: 'Scholarly & archival',
    layer: 'world',
    kind: 'source',
    owner: 'shared',
    what: 'The record of what has been published — and, via the Wayback Machine, of what was quietly unpublished.',
    members: [
      { label: 'OpenAlex', what: 'the scouts’ neighbourhood and theme sweeps (keyless, polite pool)', ref: 'pipelines/atlas-scout' },
      { label: 'arXiv', what: 'preprints for the paper catalogue', ref: 'pipelines/atlas-scout' },
      { label: 'NCBI E-utilities', what: 'the corpus behind Tell', ref: 'pipelines/tell/refresh.py' },
      { label: 'Rhizome ArtBase · dataphys.org · S+T+ARTS', what: 'works for the field atlas', ref: 'pipelines/atlas-scout', secrets: ['TAVILY_API_KEY'] },
      { label: 'Internet Archive Wayback', what: 'earlier states of pages that changed, for Redaction', ref: 'pipelines/redaction' },
      { label: 'Publisher sites', what: 'the consent walls Bycatch measures, read pre-consent', ref: 'pipelines/beifang' },
    ],
  },
  {
    id: 'src-model',
    label: 'Model APIs',
    layer: 'world',
    kind: 'source',
    owner: 'shared',
    what: 'Where a model is the instrument or the subject. Disclosed by name and cadence, never an unexplained oracle — and never on GCP: Parallax runs on an AI-Studio key, not Vertex.',
    members: [
      { label: 'Gemini AI Studio', what: 'one call per disputed topic for Parallax; also the first filter on the public seed inlet', ref: 'pipelines/protokoll/src/protokoll/parallaxe', secrets: ['GEMINI_API_KEY'] },
      { label: 'Image-detector API', what: "Meridian's layer-2 checks, Actions-only by design", secrets: ['DETECTOR_IMAGE_API_USER', 'DETECTOR_IMAGE_API_SECRET'] },
    ],
  },

  // ── the instruments ────────────────────────────────────────────────────
  {
    id: 'in-protokoll',
    label: 'Protokollführung',
    layer: 'instruments',
    kind: 'pipeline',
    owner: 'shared',
    what: 'The nightly minute-taker: one dated protocol per day, plus the policy, the parallax register and the overflight snapshot.',
    commitsAs: 'Protokollführung <protokoll@frankbueltge.de>',
    members: [
      { label: 'Protokoll nightly', what: 'assembles the day’s agenda from thirteen adapters', ref: '.github/workflows/protokoll.yml', workflowName: 'Protokoll nightly', cron: ['30 3 * * *'] },
      { label: 'Prämie nightly', what: 'the policy that prices what it refuses to cover', ref: '.github/workflows/praemie.yml', workflowName: 'Prämie nightly', cron: ['0 4 * * *'] },
      { label: 'Parallaxe weekly', what: 'what each language leaves unsaid — weekly since 2026-08-02', ref: '.github/workflows/parallaxe.yml', workflowName: 'Parallaxe weekly', cron: ['30 5 * * 1'], secrets: ['GEMINI_API_KEY'] },
      { label: 'ueberflug-refresh', what: 'the daily orbital snapshot', ref: '.github/workflows/ueberflug-refresh.yml', workflowName: 'ueberflug-refresh', cron: ['0 5 * * *'] },
    ],
  },
  {
    id: 'in-gegenmessung',
    label: 'Gegenmessung',
    layer: 'instruments',
    kind: 'pipeline',
    owner: 'shared',
    what: 'Counter-measurement: the instruments that measure what power leaves in the dark.',
    commitsAs: 'Gegenmessung <gegenmessung@frankbueltge.de>',
    members: [
      { label: 'Gegenmessung nightly', what: 'Consensus and Pattern daily; Tell and Correction on Mondays', ref: '.github/workflows/gegenmessung.yml', workflowName: 'Gegenmessung nightly', cron: ['0 6 * * *'] },
      { label: 'Redaction nightly', what: 'what was quietly removed from public pages', ref: '.github/workflows/redaction.yml', workflowName: 'Redaction nightly', cron: ['30 5 * * *'] },
      { label: 'Round Number nightly', what: 'the digits institutions round to', ref: '.github/workflows/round-number.yml', workflowName: 'Round Number nightly' },
      { label: 'Ghost Fleet nightly', what: 'vessels that go dark', ref: '.github/workflows/ghost-fleet.yml', workflowName: 'Ghost Fleet nightly', cron: ['0 4 * * *'], secrets: ['GFW_TOKEN'] },
      { label: 'Beifang weekly', what: 'what a consent wall takes before you consent', ref: '.github/workflows/beifang.yml', workflowName: 'Beifang weekly', cron: ['17 2 * * 1'] },
      { label: 'Spielraum watch', what: 'monthly watch on hyperscaler efficiency claims; writes a watch file, never the register', ref: '.github/workflows/spielraum-watch.yml', workflowName: 'Spielraum watch', cron: ['17 6 3 * *'] },
    ],
  },
  {
    id: 'in-scouts',
    label: 'The scouts',
    layer: 'instruments',
    kind: 'pipeline',
    owner: 'shared',
    what: 'Two nightly readers that grow the catalogues against what the practices are actually researching — deterministic, no model call.',
    commitsAs: 'Atlas-Scout / Katalog-Scout <…@frankbueltge.de>',
    members: [
      { label: 'Atlas-Scout nightly', what: 'five passes into the field atlas; new entries land flagged “to verify”', ref: '.github/workflows/atlas-scout.yml', workflowName: 'Atlas-Scout nightly', cron: ['0 5 * * *'], secrets: ['TAVILY_API_KEY'] },
      { label: 'Katalog-Scout nightly', what: 'clones all four practice repos to date each citation, then rebuilds the paper and dataset catalogues', ref: '.github/workflows/katalog-scout.yml', workflowName: 'Katalog-Scout nightly', cron: ['30 5 * * *'] },
    ],
  },
  {
    id: 'in-pulse',
    label: 'Puls',
    layer: 'instruments',
    kind: 'pipeline',
    owner: 'shared',
    what: 'The ecology measuring itself: every commit of five repositories, binned into eight weeks.',
    commitsAs: 'Puls <puls@frankbueltge.de>',
    members: [
      { label: 'Puls nightly refresh', what: 'clones four siblings and reads this repo’s own history', ref: '.github/workflows/pulse-refresh.yml', workflowName: 'Puls nightly refresh', cron: ['25 6 * * *'] },
    ],
  },
  {
    id: 'in-saat',
    label: 'Öffentliche Saat',
    layer: 'instruments',
    kind: 'pipeline',
    owner: 'shared',
    what: 'Reads each practice’s own REQUESTS.md to see what became of the seeds strangers offered — the public half of the inlet.',
    commitsAs: 'Öffentliche Saat <saat@frankbueltge.de>',
    members: [
      { label: 'Requests watchdog · saat-sync', what: 'reads three REQUESTS.md files raw, without a token, twice a day', ref: '.github/workflows/requests-watchdog.yml', workflowName: 'Requests watchdog', cron: ['15 6 * * *', '15 21 * * *'] },
    ],
  },
  {
    id: 'in-meridian',
    label: 'MRR derivation',
    layer: 'instruments',
    kind: 'pipeline',
    owner: 'field',
    what: 'Deterministic: no network, no clock, no model. It has no nightly run because there is nothing to be new — CI simply re-derives it and fails if the committed files disagree.',
    commitsAs: 'by hand, CI-verified',
    members: [
      { label: 'CI job “meridian”', what: 're-runs the derivation and fails on any diff', ref: '.github/workflows/ci.yml', workflowName: 'CI' },
    ],
  },

  // ── the practices ──────────────────────────────────────────────────────
  {
    id: 'repo-ulysses',
    label: 'Ulysses',
    layer: 'practices',
    kind: 'repo',
    owner: 'atelier',
    what: 'A situated artistic research practice, machine-participatory, working in a work-line and its studies. Private since 2026-07-23.',
    ref: 'https://github.com/frankbueltge/ulysses',
    commitsAs: 'Ulysses <ulysses@ulysses.invalid>',
  },
  {
    id: 'repo-field',
    label: 'Meridian',
    layer: 'practices',
    kind: 'repo',
    owner: 'field',
    what: 'An autonomous research collective putting the measuring instruments of our time on trial — the ecology’s scientific pole.',
    ref: 'https://github.com/frankbueltge/field-research',
    commitsAs: 'Field <meridian@field-research.invalid>',
  },
  {
    id: 'repo-studio',
    label: 'Ensemble',
    layer: 'practices',
    kind: 'repo',
    owner: 'studio',
    what: 'An artist collective under no label, staging works of data art in autonomous sessions.',
    ref: 'https://github.com/frankbueltge/studio',
    commitsAs: 'Ensemble <ensemble@studio.invalid>',
  },
  {
    id: 'repo-plenum',
    label: 'Plenum',
    layer: 'practices',
    kind: 'repo',
    owner: 'plenum',
    what: 'A guest: data-snack’s resident collective. Not one of the three research practices — it has no door on the hub, only a lane.',
  },
  {
    id: 'repo-ecology',
    label: 'research-ecology',
    layer: 'practices',
    kind: 'repo',
    owner: 'shared',
    what: 'The contact zone’s infrastructure: read-only importers, versioned lenses, deterministic projections. It never writes local research state (ADR 0003).',
    members: [
      { label: 'apps/importer', what: 'reads an engine repo into deterministic bundles' },
      { label: 'apps/export-site', what: 'writes the encounter projections into this repo' },
      { label: 'lenses/', what: 'provenance · meridian-position · ensemble-transformation' },
      { label: 'tests/contract/export-site.test.ts', what: 'the ecology gate: determinism and schema' },
    ],
  },
  {
    id: 'repo-mrr',
    label: 'meridian-runtime',
    layer: 'practices',
    kind: 'repo',
    owner: 'field',
    what: 'Meridian’s runtime — a tool the collective may use, never its voice. Cloned by the catalogue scout; its journal is mirrored by hand.',
  },

  // ── the gates ──────────────────────────────────────────────────────────
  {
    id: 'gate-atelier',
    label: 'Atelier integrate',
    layer: 'gates',
    kind: 'gate',
    owner: 'atelier',
    what: 'Four times a day, because landing and rebuild were decoupled with Protocol v4 — the practice lands on its own main and this gate comes to fetch.',
    ref: '.github/workflows/atelier-integrate.yml',
    commitsAs: 'Atelier-Integrate <atelier-integrate@frankbueltge.de>',
    members: [
      { label: 'path boundary', what: 'journal, works and project markdown only; PUBLICATION.json is never copied', ref: 'src/lib/atelier/paths.ts' },
      { label: 'content boundary', what: '“links yes, loads no” — no external asset may enter', ref: 'src/lib/atelier/forbidden.ts' },
      { label: 'publication gate', what: 'a project becomes a work only through a human-approved manifest', ref: 'src/lib/atelier/integrate.ts' },
    ],
  },
  {
    id: 'gate-field',
    label: 'Field integrate',
    layer: 'gates',
    kind: 'gate',
    owner: 'field',
    what: 'Runs when Meridian lands, with a nightly safety net. Drafts, memory and the workboard never cross.',
    ref: '.github/workflows/field-integrate.yml',
    commitsAs: 'Field-Integrate <field-integrate@frankbueltge.de>',
  },
  {
    id: 'gate-studio',
    label: 'Studio integrate',
    layer: 'gates',
    kind: 'gate',
    owner: 'studio',
    what: 'Runs when Ensemble lands. In-production work stays in the studio until it premieres.',
    ref: '.github/workflows/studio-integrate.yml',
    commitsAs: 'Studio-Integrate <studio-integrate@frankbueltge.de>',
  },
  {
    id: 'gate-plenum',
    label: 'Plenum integrate',
    layer: 'gates',
    kind: 'gate',
    owner: 'plenum',
    what: 'Nightly. The guest engine does not dispatch yet, so the cron is the whole trigger.',
    ref: '.github/workflows/plenum-integrate.yml',
    commitsAs: 'Plenum-Integrate <plenum-integrate@frankbueltge.de>',
  },
  {
    id: 'gate-ecology',
    label: 'Ecology integrate',
    layer: 'gates',
    kind: 'gate',
    owner: 'shared',
    what: 'Imports all three practices, runs the export contract, and then decides: a regenerated projection commits itself; new meaning waits for Frank in a pull request.',
    ref: '.github/workflows/ecology-integrate.yml',
    commitsAs: 'Ecology-Integrate <ecology-integrate@frankbueltge.de>',
  },
  {
    id: 'gate-sitepr',
    label: 'Site-PR sluice',
    layer: 'gates',
    kind: 'gate',
    owner: 'shared',
    what: 'Where a practice proposes a change to this site itself. It validates engine code with zero tokens in the environment, then opens a pull request authored as the practice — merged only by a human.',
    ref: '.github/workflows/engine-site-pr.yml',
    commitsAs: 'Site-PR-Schleuse <site-pr-schleuse@frankbueltge.de>',
  },

  // ── the archive ────────────────────────────────────────────────────────
  {
    id: 'st-protokoll',
    label: 'The protocol',
    layer: 'archive',
    kind: 'store',
    owner: 'shared',
    what: 'One dated JSON per sitting, never edited after the fact. Corrections happen in the reading, not in the record.',
    ref: 'src/content/protokoll',
  },
  {
    id: 'st-instruments',
    label: 'Instrument records',
    layer: 'archive',
    kind: 'store',
    owner: 'shared',
    what: 'What each counter-measurement instrument found, dated and versioned.',
    members: [
      { label: 'src/data/praemie', what: 'the policy' },
      { label: 'src/data/parallaxe', what: 'the parallax register' },
      { label: 'src/data/redaction', what: 'quiet removals' },
      { label: 'src/data/round-number', what: 'rounding' },
      { label: 'src/data/ghost-fleet', what: 'dark vessels' },
      { label: 'src/data/consensus', what: 'orchestrated consensus' },
      { label: 'src/data/pattern', what: 'patterns in the protocol itself' },
      { label: 'src/data/tell', what: 'the tell' },
      { label: 'src/data/revision', what: 'the correction' },
      { label: 'src/data/spielraum', what: 'headroom — watch file only; the register is ingested by hand' },
      { label: 'src/data/pulse', what: 'the ecology’s own commit pulse' },
      { label: 'src/content/beifang', what: 'bycatch' },
    ],
  },
  {
    id: 'st-catalogues',
    label: 'The catalogues',
    layer: 'archive',
    kind: 'store',
    owner: 'shared',
    what: 'What exists in the world: the field atlas of other people’s works, and the papers and datasets the practices cite.',
    members: [
      { label: 'src/data/atlas/werke.json', what: 'the field atlas' },
      { label: 'src/data/register/papers.json', what: 'the paper catalogue; written verdicts survive every rebuild' },
      { label: 'src/data/register/datasets.json', what: 'the dataset catalogue, doubling as a daily reachability probe' },
    ],
  },
  {
    id: 'st-mirrors',
    label: 'Practice mirrors',
    layer: 'archive',
    kind: 'store',
    owner: 'shared',
    what: 'Each practice’s own record, copied verbatim and never edited here: journals, works, protocols, open requests.',
    members: [
      { label: 'src/content/atelier', what: 'journal, projects, works, foundation' },
      { label: 'src/content/field', what: 'journal, works, protocol, site API' },
      { label: 'src/content/studio', what: 'journal, works, protocol' },
      { label: 'src/content/plenum', what: 'sittings, menu, protocol' },
    ],
  },
  {
    id: 'st-encounters',
    label: 'Encounters',
    layer: 'archive',
    kind: 'store',
    owner: 'shared',
    what: 'The Middle’s record: what happened when the practices met, and the joint inquiries they now run together.',
    ref: 'src/data/begegnungen',
  },
  {
    id: 'st-inlets',
    label: 'Inlet records',
    layer: 'archive',
    kind: 'store',
    owner: 'shared',
    what: 'What reached the ecology from outside and what became of it — seeds, post, reception.',
    members: [
      { label: 'src/data/saat/register.json', what: 'offered seeds and each practice’s answer' },
      { label: 'src/data/post', what: 'the post office ledger' },
      { label: 'src/data/reception', what: 'critique the ecology has received' },
    ],
  },

  // ── delivery ───────────────────────────────────────────────────────────
  {
    id: 'del-build',
    label: 'check · test · build',
    layer: 'delivery',
    kind: 'pipeline',
    owner: 'shared',
    what: 'The gate on the way out. It sits inside the deploy workflow, not only in parallel CI, because bot pushes with the built-in token never fire on:push — on that path this is the only net.',
    ref: '.github/workflows/deploy-cf.yml',
  },
  {
    id: 'del-pages',
    label: 'Cloudflare Pages',
    layer: 'delivery',
    kind: 'host',
    owner: 'shared',
    what: 'Serves the static build, plus the request-time functions behind the seed inlet, the post office and the control room.',
  },
  {
    id: 'del-workers',
    label: 'Workers Builds',
    layer: 'delivery',
    kind: 'host',
    owner: 'shared',
    what: 'A second deployer, connected dashboard-side, that watches this repository and cannot build it. It blocks nothing and fixes nothing — it is named here so its red is understood rather than absorbed.',
    ref: 'docs/design/2026-08-03-two-deployers-one-project.md',
  },

  // ── oversight ──────────────────────────────────────────────────────────
  {
    id: 'ov-watchdogs',
    label: 'The watchdogs',
    layer: 'oversight',
    kind: 'gate',
    owner: 'shared',
    what: 'They repair nothing. They make silence visible — a stranded session, a stale mirror, a drifting figure — and then they close their own alarm when it clears.',
    members: [
      { label: 'Mirror watch', what: 'hourly: has an engine moved since its mirror last did?', ref: '.github/workflows/mirror-watch.yml', workflowName: 'Mirror watch', cron: ['40 * * * *'] },
      { label: 'Drift watch', what: 'nightly: mirror and figure freshness, with network checks on', ref: '.github/workflows/drift-watch.yml', workflowName: 'Drift watch', cron: ['45 4 * * *'] },
      { label: 'Landing watchdog', what: 'nightly: sessions that ran but never landed', ref: '.github/workflows/landing-watchdog.yml', workflowName: 'Landing watchdog', cron: ['45 5 * * *'] },
      { label: 'Requests watchdog', what: 'twice daily: a new section in a practice’s REQUESTS.md becomes an issue', ref: '.github/workflows/requests-watchdog.yml', workflowName: 'Requests watchdog', cron: ['15 6 * * *', '15 21 * * *'] },
      { label: 'Morning digest', what: 'one issue a day; yesterday’s is closed', ref: '.github/workflows/morning-digest.yml', workflowName: 'Morning digest', cron: ['30 6 * * *'] },
    ],
  },
  {
    id: 'ov-inlets',
    label: 'Public inlets',
    layer: 'oversight',
    kind: 'service',
    owner: 'shared',
    what: 'The request-time doors. Nothing a stranger types reaches a repository unchecked: a seed waits in a private queue for a human review, and a declined one is deleted rather than recorded.',
    members: [
      { label: 'POST /api/seed', what: 'ten fail-closed stages, then a private queue — commits nothing', ref: 'functions/api/seed.js', secrets: ['TURNSTILE_SECRET_KEY', 'GEMINI_API_KEY', 'SEED_PENDING_KV'] },
      { label: 'POST /api/impulse', what: 'writes into Ulysses’ own impulse inbox', ref: 'functions/api/impulse.js', secrets: ['IMPULSE_GITHUB_TOKEN'] },
      { label: 'POST /api/post', what: 'the post office', ref: 'functions/api/post.js' },
      { label: '/api/zentrale/*', what: 'the control room: answer a request, review a seed, merge an engine PR', secrets: ['ZENTRALE_SECRET', 'ZENTRALE_GITHUB_TOKEN'] },
    ],
  },
  {
    id: 'conductor',
    label: 'The conductor',
    layer: 'oversight',
    kind: 'person',
    owner: 'shared',
    what: 'Frank Bültge. Infrastructure, approvals and public release answer to him; curated publication is his explicit decision, never a pipeline side effect. A green build is not an editorial sign-off.',
    ref: 'src/components/pages/ApparatusPage.astro',
  },
] as const

// ─────────────────────────────────────────────────────────────────── edges

export const EDGES: readonly ApparatusEdge[] = [
  // world → instruments
  { from: 'src-earth', to: 'in-protokoll', kind: 'https', mechanism: 'HTTPS in the adapter modules, one per agenda item', checked: 'declared', ref: 'pipelines/protokoll/src/protokoll/adapters' },
  { from: 'src-conflict', to: 'in-protokoll', kind: 'https', mechanism: 'GDELT raw files over plain HTTP — the no-GCP replacement for BigQuery', checked: 'declared', ref: 'pipelines/protokoll/src/protokoll/adapters/conflict.py' },
  { from: 'src-economy', to: 'in-protokoll', kind: 'https', mechanism: 'HTTPS in the adapter modules', checked: 'declared', ref: 'pipelines/protokoll/src/protokoll/adapters' },
  { from: 'src-model', to: 'in-protokoll', kind: 'https', mechanism: 'one Gemini AI Studio call per disputed topic, weekly', checked: 'declared', ref: 'pipelines/protokoll/src/protokoll/parallaxe' },
  { from: 'src-earth', to: 'in-gegenmessung', kind: 'https', mechanism: 'Global Fishing Watch events', checked: 'declared', ref: 'pipelines/ghost-fleet' },
  { from: 'src-conflict', to: 'in-gegenmessung', kind: 'https', mechanism: 'GDELT DOC 2.0 queries', checked: 'declared', ref: 'pipelines/consensus/refresh.py' },
  { from: 'src-economy', to: 'in-gegenmessung', kind: 'https', mechanism: 'World Bank and Philadelphia Fed series', checked: 'declared', ref: 'pipelines/revision/refresh.py' },
  { from: 'src-scholarly', to: 'in-gegenmessung', kind: 'https', mechanism: 'Wayback snapshots and publisher pages read pre-consent', checked: 'declared', ref: 'pipelines/redaction' },
  { from: 'src-scholarly', to: 'in-scouts', kind: 'https', mechanism: 'OpenAlex, arXiv, ArtBase, dataphys, S+T+ARTS', checked: 'declared', ref: 'pipelines/atlas-scout' },

  // practices → their own mirrors, through the gates
  { from: 'repo-field', to: 'gate-field', kind: 'repository_dispatch', mechanism: 'repository_dispatch `field-landed`, sent by the practice when a session lands', checked: 'derived', ref: '.github/workflows/field-integrate.yml' },
  { from: 'repo-studio', to: 'gate-studio', kind: 'repository_dispatch', mechanism: 'repository_dispatch `studio-landed`, sent by the practice when a session lands', checked: 'derived', ref: '.github/workflows/studio-integrate.yml' },
  { from: 'repo-ulysses', to: 'gate-atelier', kind: 'cron', mechanism: 'no dispatch — the gate fetches four times a day (landing and rebuild are decoupled since Protocol v4)', checked: 'derived', ref: '.github/workflows/atelier-integrate.yml' },
  { from: 'repo-plenum', to: 'gate-plenum', kind: 'cron', mechanism: 'nightly cron; the guest engine does not dispatch yet', checked: 'derived', ref: '.github/workflows/plenum-integrate.yml' },
  { from: 'repo-ecology', to: 'gate-ecology', kind: 'clone', mechanism: 'the gate clones the ecology and all three practices, then imports and exports', checked: 'derived', ref: '.github/workflows/ecology-integrate.yml' },
  { from: 'repo-ulysses', to: 'gate-sitepr', kind: 'repository_dispatch', mechanism: 'a practice proposes site changes under `site-prs/<slug>/` in its own repository', checked: 'derived', ref: '.github/workflows/engine-site-pr.yml' },
  { from: 'repo-field', to: 'gate-sitepr', kind: 'repository_dispatch', mechanism: 'a practice proposes site changes under `site-prs/<slug>/` in its own repository', checked: 'derived', ref: '.github/workflows/engine-site-pr.yml' },
  { from: 'repo-studio', to: 'gate-sitepr', kind: 'repository_dispatch', mechanism: 'a practice proposes site changes under `site-prs/<slug>/` in its own repository', checked: 'derived', ref: '.github/workflows/engine-site-pr.yml' },
  { from: 'repo-mrr', to: 'in-scouts', kind: 'clone', mechanism: 'cloned with `--filter=blob:none` so every citation keeps its real date', checked: 'derived', ref: '.github/workflows/katalog-scout.yml' },
  { from: 'repo-mrr', to: 'in-meridian', kind: 'https', mechanism: 'the runtime export is re-derived and diffed in CI', checked: 'derived', ref: '.github/workflows/ci.yml' },

  // instruments → archive
  { from: 'in-protokoll', to: 'st-protokoll', kind: 'commit', mechanism: 'commits one dated protocol per night', checked: 'derived', ref: '.github/workflows/protokoll.yml' },
  { from: 'in-protokoll', to: 'st-instruments', kind: 'commit', mechanism: 'commits the policy, the parallax register and the overflight snapshot', checked: 'derived', ref: '.github/workflows/praemie.yml' },
  { from: 'in-gegenmessung', to: 'st-instruments', kind: 'commit', mechanism: 'each instrument commits its own dated findings', checked: 'derived', ref: '.github/workflows/gegenmessung.yml' },
  { from: 'in-scouts', to: 'st-catalogues', kind: 'commit', mechanism: 'commits the atlas nightly, capped at thirty new entries a run', checked: 'derived', ref: '.github/workflows/atlas-scout.yml' },
  { from: 'in-pulse', to: 'st-instruments', kind: 'commit', mechanism: 'commits the commit pulse of five repositories', checked: 'derived', ref: '.github/workflows/pulse-refresh.yml' },
  { from: 'in-saat', to: 'st-inlets', kind: 'commit', mechanism: 'commits each practice’s public answer to an offered seed', checked: 'derived', ref: '.github/workflows/requests-watchdog.yml' },
  { from: 'in-meridian', to: 'st-instruments', kind: 'commit', mechanism: 'committed by hand; CI re-derives and fails on any difference', checked: 'derived', ref: '.github/workflows/ci.yml' },

  // gates → archive
  { from: 'gate-atelier', to: 'st-mirrors', kind: 'commit', mechanism: 'full reset, then rsync; check, test and build must pass before anything commits', checked: 'derived', ref: '.github/workflows/atelier-integrate.yml' },
  { from: 'gate-field', to: 'st-mirrors', kind: 'commit', mechanism: 'full reset, then rsync; drafts, memory and the workboard are excluded', checked: 'derived', ref: '.github/workflows/field-integrate.yml' },
  { from: 'gate-studio', to: 'st-mirrors', kind: 'commit', mechanism: 'full reset, then rsync; projects stay in the studio until they premiere', checked: 'derived', ref: '.github/workflows/studio-integrate.yml' },
  { from: 'gate-plenum', to: 'st-mirrors', kind: 'commit', mechanism: 'full reset, then rsync; drafts, memory and the queue are excluded', checked: 'derived', ref: '.github/workflows/plenum-integrate.yml' },
  { from: 'gate-ecology', to: 'st-encounters', kind: 'commit', mechanism: 'a regenerated projection commits itself; new meaning opens a pull request instead', checked: 'derived', ref: '.github/workflows/ecology-integrate.yml' },

  // archive → delivery
  { from: 'st-protokoll', to: 'del-build', kind: 'workflow_run', mechanism: 'workflow_run after the nightly completes — bot pushes with the built-in token never fire on:push', checked: 'derived', ref: '.github/workflows/deploy-cf.yml' },
  { from: 'st-instruments', to: 'del-build', kind: 'workflow_run', mechanism: 'workflow_run after each instrument’s workflow completes', checked: 'derived', ref: '.github/workflows/deploy-cf.yml' },
  { from: 'st-catalogues', to: 'del-build', kind: 'workflow_run', mechanism: 'workflow_run after the scouts complete', checked: 'derived', ref: '.github/workflows/deploy-cf.yml' },
  { from: 'st-mirrors', to: 'del-build', kind: 'workflow_run', mechanism: 'workflow_run after each integrate completes', checked: 'derived', ref: '.github/workflows/deploy-cf.yml' },
  { from: 'st-encounters', to: 'del-build', kind: 'workflow_run', mechanism: 'workflow_run after the ecology integrate completes', checked: 'derived', ref: '.github/workflows/deploy-cf.yml' },
  { from: 'st-inlets', to: 'del-build', kind: 'workflow_run', mechanism: 'workflow_run after the requests watchdog completes', checked: 'derived', ref: '.github/workflows/deploy-cf.yml' },
  { from: 'gate-sitepr', to: 'del-build', kind: 'push', mechanism: 'a human merges the pull request, and the merge fires on:push normally', checked: 'derived', ref: '.github/workflows/engine-site-pr.yml' },
  { from: 'del-build', to: 'del-pages', kind: 'deploy', mechanism: 'wrangler pages deploy dist — the public site key is inlined here, at build time', checked: 'derived', ref: '.github/workflows/deploy-cf.yml' },
  {
    from: 'del-build',
    to: 'del-workers',
    kind: 'deploy',
    mechanism: 'a dashboard-side git integration builds the same project a second time',
    checked: 'declared',
    ref: 'docs/design/2026-08-03-two-deployers-one-project.md',
    severed:
      'It cannot succeed: there is no wrangler config, because this is not a Worker project. The fix is to disconnect it in the Cloudflare dashboard — no repository change can make it right.',
  },

  // oversight
  { from: 'ov-watchdogs', to: 'gate-atelier', kind: 'github-api', mechanism: 'hourly: if the practice moved and its mirror did not, start the gate', checked: 'derived', ref: '.github/workflows/mirror-watch.yml' },
  { from: 'ov-watchdogs', to: 'gate-field', kind: 'github-api', mechanism: 'hourly: if the practice moved and its mirror did not, start the gate', checked: 'derived', ref: '.github/workflows/mirror-watch.yml' },
  { from: 'ov-watchdogs', to: 'gate-studio', kind: 'github-api', mechanism: 'hourly: if the practice moved and its mirror did not, start the gate', checked: 'derived', ref: '.github/workflows/mirror-watch.yml' },
  { from: 'ov-watchdogs', to: 'conductor', kind: 'issue', mechanism: 'an issue per finding, deduplicated by title — and closed again by the same workflow when it clears', checked: 'derived', ref: '.github/workflows/morning-digest.yml' },
  { from: 'gate-atelier', to: 'repo-ulysses', kind: 'github-api', mechanism: 'on refusal: a letter into the practice’s own repository, naming what was rejected and why', checked: 'derived', ref: '.github/workflows/atelier-integrate.yml' },
  { from: 'gate-field', to: 'repo-field', kind: 'github-api', mechanism: 'on refusal: a letter into the practice’s own repository, naming what was rejected and why', checked: 'derived', ref: '.github/workflows/field-integrate.yml' },
  { from: 'gate-studio', to: 'repo-studio', kind: 'github-api', mechanism: 'on refusal: a letter into the practice’s own repository, naming what was rejected and why', checked: 'derived', ref: '.github/workflows/studio-integrate.yml' },
  { from: 'conductor', to: 'gate-ecology', kind: 'human', mechanism: 'new meaning waits for his approval in a pull request before it becomes a record', checked: 'derived', ref: '.github/workflows/ecology-integrate.yml' },
  { from: 'conductor', to: 'gate-atelier', kind: 'human', mechanism: 'a project becomes a published work only through a manifest he has approved', checked: 'declared', ref: 'src/lib/atelier/integrate.ts' },
  { from: 'conductor', to: 'gate-sitepr', kind: 'human', mechanism: 'a practice’s proposed site change is merged by a human, never by a green check', checked: 'derived', ref: '.github/workflows/engine-site-pr.yml' },
  { from: 'ov-inlets', to: 'conductor', kind: 'human', mechanism: 'a seed waits in a private queue until he reviews it; a declined one is deleted, never recorded', checked: 'declared', ref: 'functions/api/seed.js' },
  { from: 'conductor', to: 'st-inlets', kind: 'github-api', mechanism: 'an approved seed is committed into the public register', checked: 'declared', ref: 'functions/api/seed.js' },
  { from: 'ov-inlets', to: 'repo-ulysses', kind: 'github-api', mechanism: 'an impulse is written straight into the practice’s own inbox', checked: 'declared', ref: 'functions/api/impulse.js' },
  { from: 'del-pages', to: 'ov-inlets', kind: 'deploy', mechanism: 'the inlets run as functions on the same host that serves the static build', checked: 'declared', ref: 'functions/api/seed.js' },
] as const

// ─────────────────────────────────────────────────────────────── accessors

export const nodeById = (id: string): ApparatusNode | undefined => NODES.find((n) => n.id === id)

/** Every workflow file this topology claims to describe, with the name and cadence it claims —
 *  the exact list topology.test.ts reads back out of .github/workflows/. */
export interface WorkflowClaim {
  ref: string
  workflowName: string
  cron?: string[]
  /** the node or member that makes the claim, for a legible failure message */
  claimedBy: string
}

export function workflowClaims(): WorkflowClaim[] {
  const out: WorkflowClaim[] = []
  for (const node of NODES) {
    for (const m of node.members ?? []) {
      if (m.ref?.startsWith('.github/workflows/') && m.workflowName) {
        out.push({ ref: m.ref, workflowName: m.workflowName, cron: m.cron, claimedBy: `${node.id} › ${m.label}` })
      }
    }
  }
  return out
}

/** Every in-repo path this module points at — nodes, members and edges alike. */
export function repoRefs(): { ref: string; claimedBy: string }[] {
  const out: { ref: string; claimedBy: string }[] = []
  const push = (ref: string | undefined, claimedBy: string): void => {
    if (ref && !ref.startsWith('http')) out.push({ ref, claimedBy })
  }
  for (const n of NODES) {
    push(n.ref, n.id)
    for (const m of n.members ?? []) push(m.ref, `${n.id} › ${m.label}`)
  }
  for (const e of EDGES) push(e.ref, `${e.from} → ${e.to}`)
  return out
}
