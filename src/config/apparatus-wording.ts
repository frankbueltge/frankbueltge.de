// src/config/apparatus-wording.ts — every word the apparatus map shows. Copy lives here and not
// in the component, so the wording gate (docs/wording-kanon.md) has one place to look and the
// figure has none of its own opinions about language.
//
// Numbers never appear in these strings. They age nightly and are rendered from the data
// (wording-kanon: "Zahlen … stehen nie in den Beschreibungstexten"). The provenance line takes
// its counts as arguments for the same reason.

export const APPARATUS_MAP = {
  approval: 'draft' as const,

  heading: 'The wiring',
  standfirst:
    'Every repository, workflow, pipeline, store and deploy hop this site runs, and the mechanism that connects each pair. Two undertakings share one repository: the research ecology enters through gates, the lab’s instruments enter from the world, and both land in the same committed files before everything leaves through one build. The figure says which is which — it does not draw them as one thing.',

  /** the claim printed above the figure — the thing this map can be wrong about */
  claimLabel: 'What this figure claims',
  claim:
    'Every workflow that commits to this repository reaches production, and every connection drawn here is a mechanism written down in a committed file. A test reads the workflow files back and fails when the drawing and the machinery disagree.',

  /** One repository carries two undertakings. The figure draws both and says which is which,
   *  rather than standing them side by side as though they were one thing. */
  domainLabel: 'One repository, two undertakings. Show only:',
  domains: {
    ecology: {
      label: 'the research ecology',
      hint: 'exists only because a practice exists: the four voices, their gates, their mirrors, the contact zone',
    },
    lab: {
      label: 'the lab’s experiments',
      hint: 'the counter-measurement instruments and the protocol — this site’s own earlier work, collected under Experiments',
    },
    shared: {
      label: 'shared',
      hint: 'carries both and would still be needed if either stopped: sources, catalogues, the delivery chain, the watchdogs, the conductor',
    },
  },

  legendLabel: 'Colour is ownership. Filter by whose it is:',
  legend: {
    atelier: { label: 'Ulysses', hint: 'the atelier’s own repository, gate and mirror' },
    field: { label: 'Meridian', hint: 'the field’s own repository, gate and mirror' },
    studio: { label: 'Ensemble', hint: 'the studio’s own repository, gate and mirror' },
    plenum: { label: 'Plenum', hint: 'the guest voice from data-snack' },
    shared: { label: 'shared', hint: 'infrastructure with no resident — kept by the conductor' },
  },

  kindLabel: 'Shape is what a thing is',
  kinds: {
    source: 'a source outside the ecology',
    pipeline: 'code here that turns a source into a committed file',
    repo: 'a sovereign repository',
    gate: 'a check foreign material must pass',
    store: 'committed files — the archive',
    service: 'something that runs when someone asks, not when the site builds',
    host: 'where the built site is served',
    person: 'the conductor',
  },

  lineLabel: 'The line says how far the map can vouch for it',
  lines: {
    derived: 'read back out of the file it names — this drawing cannot drift from it',
    declared: 'declared here and structurally checked; the file exists, the mechanism is not machine-read',
    severed: 'wired but broken — the reason is printed on the connection',
  },

  hint: 'Hover or focus a box for its mechanism; select one to trace what reaches it and what it reaches.',
  traceOn: 'tracing from',
  traceOff: 'show everything again',

  panel: {
    emptyHead: 'Select a box',
    emptyBody: 'Every box carries what it is, what starts it, what it writes and which secret it needs.',
    members: 'what is inside',
    mechanismsIn: 'reached by',
    mechanismsOut: 'reaches',
    record: 'written in',
    commitsAs: 'commits as',
  },

  tableSummary: 'the wiring as a table',
  tableCaption:
    'Every connection in the figure, with its mechanism, how far the map can vouch for it, and the file it is written in.',

  provenancePrefix: 'Derived at build time from:',
  provenance: ['.github/workflows/*.yml', 'src/lib/apparatus/topology.ts', 'functions/api/*'],
  /** takes its numbers, never writes them */
  provenanceLine: (nodes: number, edges: number, derived: number, workflows: number) =>
    `${nodes} parts and ${edges} connections, ${derived} of them read back out of the ${workflows} workflow files by src/lib/apparatus/topology.test.ts. Where a connection is only declared, the figure draws it lighter and says so in the table.`,

  /** what the map deliberately does not draw, printed under it rather than left to be guessed */
  omissionsLabel: 'What this figure does not draw',
  omissions: [
    'No relation between research contents — no work citing a work, no practice influencing a practice. That map would make interpretive edges look like facts (ADR 0001), and these are mechanics instead.',
    'No live state. It shows how the apparatus is wired, not what it is doing right now; a figure that changed with every build would claim a different truth each time.',
    'No ranking. Nothing here puts one practice upstream of another by right.',
  ],
} as const
