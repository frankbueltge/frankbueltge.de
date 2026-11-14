// src/lib/comma/voices.ts — the two voices below the six kinds of page (2026-11-14). Pure.
//
// OONI's volunteers test more than pages. They try to reach the messengers people talk on, and the tools people use
// to get around a block. Comma hears both, below the pages. The six kinds of page sound on the harmonics 4 to 11
// of A at 55 Hz (src/lib/comma/groups.ts); the messengers sound on the third harmonic, the ways around on the
// second. The more basic the thing a network takes away, the lower it sounds. The first harmonic, the ground the
// others stand on, is kept for a network that is switched off altogether; nothing sounds on it yet.
//
// A deeper voice also moves more slowly: a country sounds in it at most once in five minutes, where a page voice
// lets it sound every eight seconds, and its tone lasts three times as long. Both are choices of this work, made
// on the recording of 2026-11-12 after counting it: with the pages' gap Russia, which runs most of these tests
// and blocks most of what they try, would have been 78 % of the messengers' voice and 71 % of the ways around;
// with one tone per country in five minutes it is 30 % of each, beside Iran, the Philippines, Pakistan,
// Tanzania and a dozen others.
//
// Which tests count: the four messengers OONI tests, and Tor, plain Tor, Psiphon and RiseupVPN. Left out, by
// their own numbers on 2026-11-13: OpenVPN (406 of 406 tests an anomaly, so the test and not the network) and
// Tor over Snowflake (158 of 228). OONI's STUN, DNS and middlebox tests are not about a block of speech and stay
// silent. These tests know no blockpage, so the deeper voices have suspicion only and no bell.

import { GROUPS } from './groups'

export interface Voice {
  id: 'talk' | 'around'
  name: string
  harmonic: number
  /** OONI's names of the tests that sound in this voice, each with the name a reader knows */
  tests: Readonly<Record<string, string>>
}

export const VOICES: readonly Voice[] = [
  {
    id: 'talk',
    name: 'messengers',
    harmonic: 3,
    tests: { whatsapp: 'WhatsApp', telegram: 'Telegram', signal: 'Signal', facebook_messenger: 'Facebook Messenger' },
  },
  {
    id: 'around',
    name: 'ways around a block',
    harmonic: 2,
    tests: { tor: 'Tor', vanilla_tor: 'Tor', psiphon: 'Psiphon', riseupvpn: 'RiseupVPN' },
  },
]

/** A country sounds in a deeper voice at most once in this many seconds: the length of a block. */
export const VOICE_GAP_SECONDS = 300
/** A deeper voice's tone lasts this many times as long as a page's. */
export const VOICE_STRETCH = 3
/** A deeper voice weighs a country by the share of its tests that deviated on the counted day (rule.ts,
 *  `ruleOfVoice`, says why this is not the pages' rule): silent up to a tenth, full weight from a half on.
 *  Counted on 2026-11-13, that lets the messengers' voice be heard for China, Iran, Russia, Pakistan, Tanzania
 *  and Cambodia, and keeps it silent for Canada or Poland, where one test in twenty failed. */
export const VOICE_SILENT_SHARE = 0.1
export const VOICE_FULL_SHARE = 0.5

/** The score and the sound have one row for each kind of page and, below them, one for each deeper voice. */
export const ROWS = GROUPS.length + VOICES.length
export const rowOfVoice = (voice: number): number => GROUPS.length + voice
export const voiceOfRow = (row: number): Voice | null => VOICES[row - GROUPS.length] ?? null
export const rowName = (row: number): string => GROUPS[row]?.name ?? voiceOfRow(row)?.name ?? ''
export const rowHarmonic = (row: number): number => GROUPS[row]?.harmonic ?? voiceOfRow(row)?.harmonic ?? GROUPS[GROUPS.length - 1]!.harmonic
export const rowOrganFile = (row: number): string => `/comma/organ-h${rowHarmonic(row)}.mp3`

/** The deeper voice a test sounds in, as an index into VOICES; null for the web test and for tests that stay silent. */
export function voiceOfTest(test: string): number | null {
  const i = VOICES.findIndex((v) => Object.hasOwn(v.tests, test))
  return i < 0 ? null : i
}

/** "Signal" for "signal"; empty for a test this work does not name. */
export function testLabel(test: string): string {
  for (const v of VOICES) if (Object.hasOwn(v.tests, test)) return v.tests[test]!
  return ''
}
