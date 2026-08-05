// src/lib/society/stages.ts — the growth record of The Society.
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
  /** merge commit(s) on main and PR number(s) — the reproducibility anchors */
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
]
