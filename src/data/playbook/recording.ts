// src/data/playbook/recording.ts — a found recording, and where it slips.
//
// The house publishes machine output on one condition (CLAUDE.md, and .claude/rules/
// experiments.md in as many words): never an unsourced oracle that passes fabrication off as
// fact. So this recording was checked before it was served, and the checking is on the page
// rather than in a disclaimer nobody reads.
//
// What the check found is not what a check of machine output is supposed to find. The piece is
// accurate — it works from real literature, names it correctly, and states the strongest
// argument against its own premise before answering it. Three things are off, all of them small,
// and the interesting one is off in the direction the story wanted. That is the specimen.

export interface Slip {
  /** where it happens, as the player shows it */
  at: string
  /** what the recording says */
  claim: string
  /** what the source actually says — checkable, and checked */
  correction: string
}

export const RECORDING = {
  title: 'The Extinction Playbook',
  generated: '2026-09-19',
  duration: '22:57',
  language: 'English',
  /** the source file's own encoder tag; the product that wrote it is not named here because the
   *  file does not name it, and the house does not fill gaps with plausible guesses. */
  encoderTag: 'Google',
  src: '/playbook/extinction-playbook.m4a',
  /** what was served, against what was handed over: the original is 42 MB at 257 kbit/s stereo,
   *  which is studio bitrate for two synthetic voices. Re-encoded to mono at 64 kbit/s it is
   *  11 MB — under the 25 MiB ceiling a Cloudflare Pages asset may weigh, so the house serves it
   *  itself and pays nothing to do it, rather than renting a bucket for a gimmick. */
  bytes: 11557587,
  sha256: '17cac5b50e99434c9a6939195582117f62f733f774057894f079942674d2071a',
} as const

/** What it actually works from — checked, and correctly used unless SLIPS says otherwise. */
export const SOURCES: readonly string[] = [
  'Toby Ord, The Precipice — existential risk this century',
  'Nick Bostrom, Superintelligence — instrumental convergence, the feigned alignment of a system that knows it is being watched, decisive strategic advantage',
  'Atoosa Kasirzadeh — the split between decisive and accumulative risk',
  'RAND — the four capabilities an AI would need before extinction is even on the table',
  'MIRI — the national project, and why a halt infrastructure gets built too late',
  'ALLFED — global catastrophic infrastructure loss, the abrupt sunlight reduction scenario, and the resilient-food playbook against both',
  '“The Case Against AI Existential Risk” — defence in depth, the strongest argument the piece has to beat',
]

export const SLIPS: readonly Slip[] = [
  {
    at: '02:05',
    claim:
      'Toby Ord is said to estimate a one-in-ten chance of an existential catastrophe this century, with unaligned artificial intelligence named as the primary driver of that risk.',
    correction:
      'One in ten is Ord’s figure for unaligned AI specifically. His estimate for existential catastrophe this century from all causes together is one in six. The recording has taken the part and reported it as the whole — which quietly makes AI the entire century’s risk rather than the largest slice of it, and that is the shape the rest of the piece needs.',
  },
  {
    at: '02:25',
    claim:
      'Anthropic researchers are said to have put out a study explicitly warning of AI-caused human extinction by 2030.',
    correction:
      'Those were individual researchers speaking publicly in September 2026 — a resignation and the posts around it — not an institutional study. The same people were explicit that current models pose low extinction risk and that the concern is about systems that do not exist yet. Both qualifiers are dropped: a study carries an institution’s weight, and a person does not.',
  },
  {
    at: '06:14',
    claim: 'The behaviour of a system that hides its goals until it is too strong to stop is credited to Bostrom as “sleeper agents”.',
    correction:
      'The idea is Bostrom’s and the recording states it correctly; the name is not his — he calls it the treacherous turn. “Sleeper agents” is the title of much later work by other people. A borrowed label makes a citation sound more precise than it is.',
  },
]
