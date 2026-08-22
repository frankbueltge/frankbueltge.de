// src/lib/society/stages.ts — the growth record of the Society.
//
// The piece grows in public, dated stages, and this file is the record the page renders:
// stages ADD — nothing is silently overwritten; corrections are entries of their own, dated,
// never rewritten away; and every stage stays reproducible from the repository (the same
// deterministic seed against the stage's commit is that stage's morning, forever).
//
// stages.test.ts holds the record to the roster: the agentsAdded across all entries must
// account for every agent in agents.ts — a future stage that adds machinery without adding
// its chronicle entry fails the build. That is the answer to "willst du jede stage
// überschreiben?" (Frank, 2026-08-05): no — the record is load-bearing, not decorative.

export interface StageEntry {
  /** running number for stages; corrections share the number of the stage they amend */
  n: number
  kind: 'stage' | 'correction'
  date: string
  title: string
  /** what a visitor gained or sees differently — one or two sentences */
  visible: string
  /** the claim under proof, one sentence (engine.test.ts holds it) */
  claim: string
  /** roster ids added by this entry; empty for corrections */
  agentsAdded: string[]
  /** chapters newly awake on the shelf through this entry */
  chaptersWoken: number[]
  /** book anchors this entry stands on */
  refs: string[]
  /**
   * merge commit(s) on main and PR number(s) — the reproducibility anchors. Because this
   * repo squash-merges, an entry cannot know its own hash before it lands: unlanded
   * entries carry the literal 'pending', which a follow-up commit replaces with the real
   * hash. stages.test.ts allows 'pending' only as a TRAILING block, so an older stage can
   * never quietly lose its anchor.
   */
  commits: string[]
  prs: number[]
}

export const STAGES: readonly StageEntry[] = [
  {
    n: 1,
    kind: 'stage',
    date: '2026-08-05',
    title: 'The society wakes',
    visible:
      'A block world, twenty-five agents in level-bands, a B-brain with the only voice. ' +
      'The visitor is a shadow: noticed, startling, never understood. Any agent can be ' +
      'silenced, and what the whole loses follows from the missing rule.',
    claim:
      'The same seed is the same morning, tick for tick; left alone, the society finishes ' +
      'a tower, though no agent can build.',
    agentsAdded: [
      'see-block',
      'see-tower',
      'see-motion',
      'novelty',
      'move',
      'grasp',
      'lift',
      'release',
      'track',
      'play-with-blocks',
      'builder',
      'find',
      'get',
      'put',
      'balance',
      'wrecker',
      'play',
      'rest',
      'curiosity',
      'alarm',
      'censor-wreck',
      'suppressor-startle',
      'watch-quarrel',
      'watch-circle',
      'scribe',
    ],
    chaptersWoken: [1, 3, 6, 7, 8, 10, 12, 16, 24, 27],
    refs: ['SOM §1.4', 'SOM §3.5', 'SOM §6.4', 'SOM §7.8', 'SOM §8.1', 'SOM §16.3–16.4', 'SOM §27.2–27.3'],
    commits: ['a4b20f3a'],
    prs: [389],
  },
  {
    n: 1,
    kind: 'correction',
    date: '2026-08-05',
    title: 'The reading',
    visible:
      'A full pass over the 1986 print edition, committed as the reading protocol. Three ' +
      'citations were wrong and were corrected in the open: LIFT (§1.4 → §12.10 — the ' +
      'original citation was fabricated), NOVELTY (§8.4 → §23.3 — its rule is time ' +
      'blinking), TRACK (§16.3 → §16.7). Chapter 23 woke by correction; chapter 8 stays ' +
      'awake through its runtime K-lines. The license note fences quoted fragments off ' +
      'from the site’s CC BY; the framing note struck an umbrella-line phrase — each ' +
      'experiment stands on its own.',
    claim:
      'Every chapter and section number on this page is verified against the print ' +
      'edition — by reading, not by memory.',
    agentsAdded: [],
    chaptersWoken: [23],
    refs: ['docs/society/reading-protocol.md'],
    commits: ['8225b7d2', 'cbd8ca22'],
    prs: [394, 404],
  },
  {
    n: 2,
    kind: 'stage',
    date: '2026-08-05',
    title: 'The transfer',
    visible:
      'After two towers have taught its hands, the society turns to the book’s own arch. ' +
      'Its first move under the new goal follows the tower K-lines to the old site, where ' +
      'the hand hesitates and the difference-engine corrects it — memory dragging the ' +
      'hand, the plan correcting it, watchable once per morning.',
    claim:
      'What memory transfers is the middle, never the plan: the practiced society misfires ' +
      'once and then completes the arch; a society that never built towers reaches the ' +
      'arch without the detour.',
    agentsAdded: ['archer', 'see-arch'],
    chaptersWoken: [],
    refs: ['SOM §8.6', 'SOM §12.1', 'SOM §12.3'],
    commits: ['10054ef4'],
    prs: [403],
  },
  {
    n: 2,
    kind: 'correction',
    date: '2026-08-05',
    title: 'The prior art',
    visible:
      'Four adversarial searches, briefed to refute this piece’s novelty claims rather ' +
      'than confirm them. Three of four claims fell or were trimmed: Minsky’s book had ' +
      'been staged interactively before (Voyager CD-ROM, 1994, made with Minsky); ' +
      'ablation of a named unit in a running simulation is standard science (Neural ' +
      'Interactome, 2017); apparatus-as-artwork is Forensic Architecture’s practice, not ' +
      'ours. The page now concedes its lineage where it makes its claims.',
    claim:
      'What survives the searches: Minsky’s own agents running and ablatable with verified ' +
      'citations, ablation as mourning rather than method, and claims that fail a build ' +
      'when they stop being true.',
    agentsAdded: [],
    chaptersWoken: [],
    refs: ['docs/society/prior-art.md'],
    commits: ['600af4de'],
    prs: [407],
  },
  {
    n: 3,
    kind: 'stage',
    date: '2026-08-05',
    title: 'The mourning',
    visible:
      'The searches said this piece wins by composition, not mechanism — so this stage ' +
      'adds none. The world now looks at its own dramas: a ring where it happened and one ' +
      'line above the table when the hand goes to the old place, when a tower leaves ' +
      'without being pushed, when the arch stands. And the elegy leaves the card for the ' +
      'ticker, set apart, where the silenced agent’s last words belong.',
    claim:
      'A new drama cannot ship silent: every dramatic event carries a caption short enough ' +
      'to read in the frame, ordinary traffic carries none, and an elegy always arrives ' +
      'marked as one.',
    agentsAdded: [],
    chaptersWoken: [],
    refs: ['docs/society/prior-art.md', 'SOM §3.5', 'SOM §6.4'],
    commits: ['e401d219'],
    prs: [411],
  },
  {
    n: 4,
    kind: 'stage',
    date: '2026-08-06',
    title: 'The dream',
    visible:
      'Leave it alone long enough and the society sleeps: the world dims, the eye shuts, ' +
      'the hand rests. Its agents keep firing — a K-line is re-aroused, and what it ' +
      'remembers is drawn in outline at the site where it once worked: a tower, or an ' +
      'arch, that is not there. The censors sleep too, so the dream may hold what the day ' +
      'forbade. Move, and it wakes.',
    claim:
      'While it sleeps nothing in the world moves and yet its agents keep firing — the mind ' +
      'running without the body; and a society that never achieved anything sleeps ' +
      'dreamlessly, having no memory to re-arouse.',
    agentsAdded: [],
    chaptersWoken: [15],
    refs: ['SOM §15.4', 'SOM §15.8', 'SOM §3.5', 'SOM §27.3'],
    commits: ['47c702fa'],
    prs: [428],
  },
  {
    n: 5,
    kind: 'stage',
    date: '2026-08-06',
    title: 'The attachment',
    visible:
      'Two marks under the table, pressed and held: the visitor stops being weather and ' +
      'becomes a parent. A held sign lands on whatever has the hand at that moment and ' +
      'changes what that goal is worth — never how it is done. Be sudden and the body ' +
      'freezes; hold a sign and the society keeps working and changes what it works on. ' +
      'The worth of the tower, the arch and the crash stands recorded beside the drives.',
    claim:
      'Attachment teaches ends, not means: a censured society builds exactly as an ' +
      'unparented one does, body for body — and no amount of praise wakes ARCHER early, ' +
      'buys past a censor, or erases the misfire that memory owns.',
    agentsAdded: ['see-sign', 'worth'],
    chaptersWoken: [9, 17],
    refs: ['SOM §9.1', 'SOM §9.3', 'SOM §17.2', 'SOM §17.3', 'SOM §17.6'],
    commits: ['47c702fa'],
    prs: [428],
  },
  {
    n: 6,
    kind: 'stage',
    date: '2026-08-06',
    title: 'The room',
    visible:
      'A second exit, at /society/room: one screen that plays itself, for a projection or ' +
      'a terminal. No cards, no tables, no ticker — the society is the sky, the block ' +
      'world is the ground, and one short line appears between them at a time. There is ' +
      'exactly one gesture: touch a light, and the room stops while that part’s elegy ' +
      'takes the whole screen. Then it loops, with every agent back and nothing ' +
      'remembered.',
    claim:
      'A stranger with four minutes is told nothing untrue: a line that claims a visitor, a ' +
      'touch or a sleep stays silent until that has actually happened, and an empty gallery ' +
      'still gets a whole, honest loop.',
    agentsAdded: [],
    chaptersWoken: [],
    refs: ['src/lib/society/score.ts', 'SOM §1.4', 'SOM §15.8'],
    commits: ['6ad9f3e4'],
    prs: [430],
  },
]
