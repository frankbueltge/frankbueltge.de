// src/lib/society/agents.ts — the roster of The Society: twenty-seven agents, none of them
// intelligent, after Marvin Minsky, The Society of Mind (Simon & Schuster, 1986).
//
// Every agent carries:
//   · ref     — the essay it steps out of (chapter/section numbers checked against the 1986
//               edition's table of contents, not quoted from memory);
//   · role    — one line of what it does, used by the table floor and the card;
//   · code    — the rule, in full, as shown on the card. This is the piece's central gesture
//               ("every agent here is small enough to read whole"), so KEEP IT TRUE: the
//               engine implements exactly these rules (engine.ts names each block with the
//               agent id it executes). If a rule changes in one place it changes in both.
//   · elegy   — the line the B-brain's scribe speaks when a visitor silences the agent.
//
// Band → colour is the figure's identity system (PALETTE: society-bands in society.css):
// senses azure · body/builders amber · drives magenta · reflection violet · censors wear
// declared neutral — suppression has no colour of its own.

export type Band = 'senses' | 'body' | 'builders' | 'drives' | 'censors' | 'reflection'

export interface BookRef {
  /** chapter number, 1..30 */
  ch: number
  /** essay number like '7.8'; omitted where the whole chapter is the reference */
  sec?: string
  title: string
}

export interface AgentSpec {
  id: string
  name: string
  agency: string
  band: Band
  ref: BookRef
  role: string
  code: string
  elegy: string
}

export const AGENTS: readonly AgentSpec[] = [
  // ————————————————————————————————————————————————— senses ——————————————
  {
    id: 'see-block',
    name: 'SEE-BLOCK',
    agency: 'the eye',
    band: 'senses',
    ref: { ch: 1, sec: '1.4', title: 'The World of Blocks' },
    role: 'reports the nearest loose block to whoever asks',
    code: `when FIND asks:
  look at the table
  answer with the nearest
  loose block, or nothing`,
    elegy: 'SEE-BLOCK is silent. The table is full and FIND sees none of it.',
  },
  {
    id: 'see-tower',
    name: 'SEE-TOWER',
    agency: 'the eye',
    band: 'senses',
    ref: { ch: 12, sec: '12.10', title: 'How Towers Work' },
    role: 'counts how tall the tower is right now',
    code: `each moment:
  count the stacked blocks
  tell BUILDER the number
(it does not know
 what a tower is for)`,
    elegy: 'SEE-TOWER is silent. No tower will ever be tall enough now.',
  },
  {
    id: 'see-arch',
    name: 'SEE-ARCH',
    agency: 'the eye',
    band: 'senses',
    // stage 2 (the transfer): SEE-ARCH embodies the book's canonical uniframe — "a top
    // supported by two standing blocks that do not touch"
    ref: { ch: 12, sec: '12.3', title: 'Uniframes' },
    role: 'reports which of the arch’s three parts stand — never why they should',
    code: `when ARCHER asks:
  look at the two sites
  answer: left upright? right?
  a block lying across?
(three yeses are its whole
 idea of an arch)`,
    elegy: 'SEE-ARCH is silent. Three parts stand; nothing in here knows they are an arch.',
  },
  {
    id: 'see-motion',
    name: 'SEE-MOTION',
    agency: 'the eye',
    band: 'senses',
    ref: { ch: 24, sec: '24.9', title: 'Recognizers and Memorizers' },
    role: 'notices that something outside is moving — never what it is',
    code: `each moment:
  how fast does the shadow move?
  shout that number
  to CURIOSITY and ALARM
(it cannot say what moves)`,
    elegy: 'SEE-MOTION is silent. You are still here; nothing in here knows it.',
  },
  {
    id: 'novelty',
    name: 'NOVELTY',
    agency: 'the eye',
    band: 'senses',
    // Reading protocol 2026-08-05: §8.4 says nothing about novelty (misattribution caught by
    // the full read). The rule below IS §23.3's time blinking — hold what the eye said a
    // moment ago, the difference is the signal. The boredom half is the piece's own.
    ref: { ch: 23, sec: '23.3', title: 'Time Blinking' },
    role: 'compares now with a moment ago; sameness slowly bores it',
    code: `keep a fading copy of
  what SEE-MOTION said before
surprise = difference
sameness, repeated,
  wears the surprise away`,
    elegy: 'NOVELTY is silent. Nothing will ever be boring again.',
  },
  // —————————————————————————————————————————————————— body ———————————————
  {
    id: 'move',
    name: 'MOVE',
    agency: 'the hand',
    band: 'body',
    ref: { ch: 1, sec: '1.4', title: 'The World of Blocks' },
    role: 'carries the hand toward wherever it is told',
    code: `when given a place:
  step the hand toward it
  a little, every moment
(it has no idea why)`,
    elegy: 'MOVE is silent. Every wish arrives at a hand that stays.',
  },
  {
    id: 'grasp',
    name: 'GRASP',
    agency: 'the hand',
    band: 'body',
    ref: { ch: 1, sec: '1.4', title: 'The World of Blocks' },
    role: 'closes the fingers on whatever is in reach',
    code: `when GET says close:
  if a loose block is in reach,
    close on it
  else close on nothing`,
    elegy: 'GRASP is silent. The hand still reaches, and cannot close.',
  },
  {
    id: 'lift',
    name: 'LIFT',
    agency: 'the hand',
    band: 'body',
    // Reading protocol 2026-08-05: no LIFT exists in §1.4's diagrams (the piece invented the
    // agent); its honest home is §12.10, where height comes from vertical Lifting by name.
    ref: { ch: 12, sec: '12.10', title: 'How Towers Work' },
    role: 'raises a held block above the stack before placing',
    code: `while a block is held:
  keep it higher
  than the tower's top`,
    elegy: 'LIFT is silent. Blocks travel, and arrive at the floor.',
  },
  {
    id: 'release',
    name: 'RELEASE',
    agency: 'the hand',
    band: 'body',
    ref: { ch: 1, sec: '1.4', title: 'The World of Blocks' },
    role: 'opens the fingers when PUT decides it is time',
    code: `when PUT says open:
  open
(where the block lands
 is not its business)`,
    elegy: 'RELEASE is silent. The hand has one block now, forever.',
  },
  {
    id: 'track',
    name: 'TRACK',
    agency: 'the gaze',
    band: 'body',
    // Reading protocol 2026-08-05: TRACK is body machinery, not a proto-specialist — §16.3
    // was the roster's weakest ref. §16.7 is exact: a drive exploiting sense and body agents
    // it does not understand (Thirst→See/Find/Get is CURIOSITY→TRACK, pattern for pattern).
    ref: { ch: 16, sec: '16.7', title: 'Exploitation' },
    role: 'turns the eye toward what CURIOSITY points at',
    code: `while CURIOSITY rules:
  ease the gaze
  toward the moving shadow
  and hold it there`,
    elegy: 'TRACK is silent. Curiosity, with nowhere to look.',
  },
  // ———————————————————————————————————————————————— builders —————————————
  {
    id: 'play-with-blocks',
    name: 'PLAY-WITH-BLOCKS',
    agency: 'middle management',
    band: 'builders',
    ref: { ch: 10, sec: '10.4', title: "Papert's Principle" },
    role: 'routes the wish to play; when its children both shout, it decides who speaks',
    code: `while PLAY rules:
  wake BUILDER
  (WRECKER wakes itself;
   my censor holds it)
  when both shout, the louder
  child gets the hand
It cannot stack, and cannot smash.
It is management.`,
    elegy: 'PLAY-WITH-BLOCKS is silent. The wish remains; the way is lost.',
  },
  {
    id: 'builder',
    name: 'BUILDER',
    agency: 'the tower works',
    band: 'builders',
    ref: { ch: 7, sec: '7.8', title: 'Difference-Engines' },
    role: 'compares the tower with the tower it wants, and sets one difference right at a time',
    code: `goal: a tower of four
each moment:
  too short → wake FIND, GET, PUT
  tall enough → rest, and
    let someone else have the hand`,
    elegy: 'BUILDER is silent. What is left of play is WRECKER.',
  },
  {
    id: 'archer',
    name: 'ARCHER',
    agency: 'the tower works',
    band: 'builders',
    // stage 2 (the transfer, §8.6): the second difference-engine, wanting the book's own
    // arch. It wakes once two towers have taught the hands — and its first move follows
    // the tower K-lines to the old site: memory transfers the middle, not the plan.
    ref: { ch: 12, sec: '12.1', title: 'A Block-Arch Scenario' },
    role: 'compares the scene with the arch it wants — two uprights, one lying across',
    code: `goal: two standing blocks,
  not touching, and one
  lying across their tops
each moment:
  a part is missing → wake
    FIND, GET, PUT toward it
  the arch stands → rest
(it wakes once towers
 have grown boring)`,
    elegy: 'ARCHER is silent. This society will build towers until the end of its days.',
  },
  {
    id: 'find',
    name: 'FIND',
    agency: 'the tower works',
    band: 'builders',
    ref: { ch: 1, sec: '1.4', title: 'The World of Blocks' },
    role: 'asks the eye for a loose block and points GET at it',
    code: `when BUILDER needs a block:
  ask SEE-BLOCK
  point GET at the answer
  if no answer: wander`,
    elegy: 'FIND is silent. GET is willing, and pointed at nothing.',
  },
  {
    id: 'get',
    name: 'GET',
    agency: 'the tower works',
    band: 'builders',
    ref: { ch: 1, sec: '1.4', title: 'The World of Blocks' },
    role: 'fetches the found block: sends MOVE, then asks GRASP',
    code: `given a block:
  send MOVE to it
  arrived → ask GRASP to close
  holding → tell PUT`,
    elegy: 'GET is silent. Found blocks stay exactly where they are found.',
  },
  {
    id: 'put',
    name: 'PUT',
    agency: 'the tower works',
    band: 'builders',
    ref: { ch: 1, sec: '1.4', title: 'The World of Blocks' },
    role: 'carries the held block over the stack and asks RELEASE to open',
    code: `while holding:
  send MOVE over the tower
  ask LIFT to stay high
  arrived → ask BALANCE, then
    ask RELEASE to open`,
    elegy: 'PUT is silent. The society carries its block in circles.',
  },
  {
    id: 'balance',
    name: 'BALANCE',
    agency: 'the tower works',
    band: 'builders',
    ref: { ch: 12, sec: '12.10', title: 'How Towers Work' },
    role: 'squares the held block with the one beneath before it lands',
    code: `just before RELEASE:
  nudge the block until
  its edges agree
  with the block below`,
    elegy: 'BALANCE is silent. The tower grows, and grows a lean.',
  },
  {
    id: 'wrecker',
    name: 'WRECKER',
    agency: 'the tower works',
    band: 'builders',
    ref: { ch: 3, sec: '3.5', title: 'Destructiveness' },
    role: 'wants the crash; usually held back until the tower is finished',
    code: `while a tower stands:
  want the crash
  (it grows with PLAY, and
   now and then it surges)
when nothing holds me back:
  sweep the hand through it`,
    elegy: 'WRECKER is silent. The towers of this society stand forever now.',
  },
  // ————————————————————————————————————————————————— drives ——————————————
  {
    id: 'play',
    name: 'PLAY',
    agency: 'proto-specialists',
    band: 'drives',
    ref: { ch: 16, sec: '16.3', title: 'Mental Proto-Specialists' },
    role: 'the appetite for doing; grows in idleness, satisfied by finishing — or by ruin',
    code: `each moment: want a little more
a tower finished,
  or gloriously crashed:
  want much less, for a while`,
    elegy: 'PLAY is silent. The blocks are just blocks now.',
  },
  {
    id: 'rest',
    name: 'REST',
    agency: 'proto-specialists',
    band: 'drives',
    ref: { ch: 16, sec: '16.3', title: 'Mental Proto-Specialists' },
    role: 'the appetite for stillness; grows with every motion of the hand',
    code: `each moment the hand works:
  want stillness a little more
while I rule: the hand settles,
  the wanting drains away`,
    elegy: 'REST is silent. This society will never settle again.',
  },
  {
    id: 'curiosity',
    name: 'CURIOSITY',
    agency: 'proto-specialists',
    band: 'drives',
    ref: { ch: 16, sec: '16.3', title: 'Mental Proto-Specialists' },
    role: 'the appetite for the new; fed by SEE-MOTION, starved by NOVELTY’s boredom',
    code: `want = surprise × freshness
while I rule:
  the eye belongs to TRACK,
  the tower can wait`,
    elegy: 'CURIOSITY is silent. You have become weather.',
  },
  {
    id: 'alarm',
    name: 'ALARM',
    agency: 'proto-specialists',
    band: 'drives',
    ref: { ch: 16, sec: '16.4', title: 'Cross-Exclusion' },
    role: 'seizes everything when the outside moves too fast, too suddenly',
    code: `if the shadow leaps:
  seize the body
  freeze the hand — let go
    of whatever it holds
  then, quickly, fade`,
    elegy: 'ALARM is silent. Nothing will ever frighten this society again.',
  },
  // ————————————————————————————————————————————————— censors —————————————
  {
    id: 'censor-wreck',
    name: 'CENSOR-WRECK',
    agency: 'the censors',
    band: 'censors',
    ref: { ch: 27, sec: '27.3', title: 'Censors' },
    role: 'holds WRECKER down while the current work is still being built',
    code: `while the work is unfinished:
  press WRECKER down
when it is finished:
  look away
(tower or arch — it does not
 know the difference)`,
    elegy: 'CENSOR-WRECK is silent. Nothing here will ever be finished again.',
  },
  {
    id: 'suppressor-startle',
    name: 'SUPPRESSOR-STARTLE',
    agency: 'the censors',
    band: 'censors',
    ref: { ch: 27, sec: '27.2', title: 'Suppressors' },
    role: 'dampens the second fright; a mind cannot flinch all day',
    code: `after ALARM has fired:
  for a long moment,
  press ALARM down
(one fright per surprise)`,
    elegy: 'SUPPRESSOR-STARTLE is silent. Every shiver of yours is an earthquake.',
  },
  // ——————————————————————————————————————————————— reflection ————————————
  {
    id: 'watch-quarrel',
    name: 'WATCH-QUARREL',
    agency: 'the B-brain',
    band: 'reflection',
    ref: { ch: 3, sec: '3.2', title: 'Noncompromise' },
    role: 'sees two agencies deadlocked over one hand, and lets neither win',
    code: `watching only the A-brain:
  if BUILDER and WRECKER
  shout equally loud
  for the one hand,
  quiet them both
(a clear victory it lets stand)`,
    elegy: 'WATCH-QUARREL is silent. The quarrels will be settled by force now.',
  },
  {
    id: 'watch-circle',
    name: 'WATCH-CIRCLE',
    agency: 'the B-brain',
    band: 'reflection',
    ref: { ch: 6, sec: '6.4', title: 'B-Brains' },
    role: 'notices the A-brain repeating itself, and interrupts the circle',
    code: `watching only the A-brain:
  if it acts and acts
  and the world stays the same,
  tire the wish behind it
  so another wish may rule`,
    elegy: 'WATCH-CIRCLE is silent. This society can be trapped forever now.',
  },
  {
    id: 'scribe',
    name: 'SCRIBE',
    agency: 'the B-brain',
    band: 'reflection',
    ref: { ch: 6, sec: '6.4', title: 'B-Brains' },
    role: 'writes down what the A-brain does; it is the only voice this mind has',
    code: `watching only the A-brain:
  when something changes hands,
  write one plain line about it
(it sees no blocks, no visitor —
 only agents, rising, falling)`,
    elegy: 'SCRIBE is silent. Things will keep happening; no one will say so.',
  },
]

// ————————————————————————————————————————— the book as shelf ————————————
// All thirty chapters of the 1986 edition, verbatim titles. A chapter is "awake" when at
// least one agent of this roster steps out of it; the rest are the roadmap.

export interface Chapter {
  n: number
  title: string
}

export const CHAPTERS: readonly Chapter[] = [
  { n: 1, title: 'Prologue' },
  { n: 2, title: 'Wholes and Parts' },
  { n: 3, title: 'Conflict and Compromise' },
  { n: 4, title: 'The Self' },
  { n: 5, title: 'Individuality' },
  { n: 6, title: 'Insight and Introspection' },
  { n: 7, title: 'Problems and Goals' },
  { n: 8, title: 'A Theory of Memory' },
  { n: 9, title: 'Summaries' },
  { n: 10, title: "Papert's Principle" },
  { n: 11, title: 'The Shape of Space' },
  { n: 12, title: 'Learning Meaning' },
  { n: 13, title: 'Seeing and Believing' },
  { n: 14, title: 'Reformulation' },
  { n: 15, title: 'Consciousness and Memory' },
  { n: 16, title: 'Emotion' },
  { n: 17, title: 'Development' },
  { n: 18, title: 'Reasoning' },
  { n: 19, title: 'Words and Ideas' },
  { n: 20, title: 'Context and Ambiguity' },
  { n: 21, title: 'Trans-Frames' },
  { n: 22, title: 'Expression' },
  { n: 23, title: 'Comparisons' },
  { n: 24, title: 'Frames' },
  { n: 25, title: 'Frame-Arrays' },
  { n: 26, title: 'Language-Frames' },
  { n: 27, title: 'Censors and Jokes' },
  { n: 28, title: 'The Mind and the World' },
  { n: 29, title: 'The Realms of Thought' },
  { n: 30, title: 'Mental Models' },
]

/** Chapter numbers whose concepts live in the society: every chapter with a resident
 *  roster agent, plus chapter 8 — K-lines (§8.1) are runtime creatures, born whenever a
 *  tower stands, so their chapter is awake although no static agent cites it. */
export function awakeChapters(): Set<number> {
  const awake = new Set(AGENTS.map((a) => a.ref.ch))
  awake.add(8)
  return awake
}

export function agentById(id: string): AgentSpec {
  const a = AGENTS.find((x) => x.id === id)
  if (!a) throw new Error(`unknown agent: ${id}`)
  return a
}
