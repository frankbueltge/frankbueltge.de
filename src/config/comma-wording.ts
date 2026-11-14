// src/config/comma-wording.ts — every visitor-facing string of Comma (/comma, 2026-11-13). The page and the island own
// no words of their own: they receive these.
//
// Digit-free wherever a digit would age (the currency doctrine of docs/wording-kanon.md, kept even though an
// unarchived work is exempt from the test that enforces it): the delay, the block, the gap per country and the
// scale of the suspicion rule are constants in src/lib/comma/, and the sentences that name them are built from
// those constants. The day the counts are from is data, so the island fills it in from the committed file.
import { BLOCK_MS, DELAY_MS, MINUTE_MS } from '@/lib/comma/clock'
import { KEEP_SECONDS } from '@/lib/comma/relay'
import { GAP_SECONDS, OCTAVES } from '@/lib/comma/rule'
import { VOICE_GAP_SECONDS, VOICE_STRETCH } from '@/lib/comma/voices'

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const say = (n: number): string => NUMBER_WORDS[n] ?? String(n)
const DELAY = say(DELAY_MS / MINUTE_MS)
const BLOCK = say(BLOCK_MS / MINUTE_MS)
const KEEP = KEEP_SECONDS === 1800 ? 'half an hour' : `${KEEP_SECONDS / 60} minutes`

export const COMMA = {
  meta: {
    title: 'Comma | Frank Bültge',
    description: `Internet censorship heard as it is measured: the world’s OONI tests, ${DELAY} minutes behind the world, on six organ tones, with a bell for every blockpage and a comma’s beat for every suspicion.`,
  },
  sheet: {
    kicker: 'Counter-measurement · live',
    title: 'Comma',
    sub: 'Internet censorship heard as it happens: the small distance between the internet as the world sees it and as a country’s own network shows it',
    badges: ['live data', 'OONI', 'sound'],
  },
  intro: `Press listen and you join a broadcast that does not end: the world’s censorship tests, ${DELAY} minutes behind the world, the same moment for everyone listening. Use headphones or good speakers: the beats are slow.`,
  island: {
    listen: 'Listen',
    stop: 'Stop',
    freeze: 'Freeze the score',
    unfreeze: 'Let it run',
    freezeHint: 'The score holds still and its marks link to their entries; the sound plays on.',
    status: {
      idle: 'Not listening. The sound starts with your click.',
      loading: 'Loading the organ and the bells…',
      waiting: 'Waiting for the first block of tests…',
      live: `Live: the tests of {from} to {to} UTC, ${DELAY} minutes ago.`,
      refused: 'OONI limits how much it may be asked and is turning this site away at the moment.',
      unanswered: 'OONI is not answering this site at the moment.',
      tape: 'So this is the house’s recording, a day in two hours: {day}, {from} to {to} UTC. The piece asks OONI again within {seconds} seconds.',
      failed: 'The sounds could not be loaded in this browser.',
      noRule: 'The day’s counts could not be read, so suspicion stays silent; blockpages still ring.',
    },
    figureLabel:
      'A live score with eight rows, the newest moment on the right: one row for each of six kinds of page and, below them, one for messengers and one for the ways around a block. A grey band is how many tests of that kind ran in this hour of the counted day; a diamond is a blockpage, with its country; a bar beneath a row is a suspicion, darker the heavier its country’s weight. A dashed line along the top marks a stretch played from the house’s recording. Freeze the score to follow a mark to its entry in OONI Explorer.',
    legend: {
      heading: 'How to read it',
      blockpage: 'a blockpage, a state’s own notice: proof (a bell)',
      suspicion: 'a suspicion, a local answer that differed: a comma lower (darker = the country’s network deviated more often on the counted day; longer = more covert)',
      asking: 'how many tests of that kind ran in this hour of the counted day (the organ tone’s loudness)',
      tape: 'a stretch played from the house’s recording, because OONI would not answer the site',
      tapeLabel: 'recording',
      deep: 'The two rows below are deeper, slower voices from the same tests: a messenger that could not be reached, and a way around a block that was itself blocked. A country sounds in them at most once in five minutes, with a longer tone, and there is no bell, because these tests know no blockpage.',
      day: 'The counts in use are those of {day} (UTC).',
      colours: 'Colour says what kind of page was asked for:',
      grey: 'Three kinds wear a colour and three stay grey: the house draws no figure with more than four colours, and these three are where a block cuts speech. Shape, not colour, tells proof from suspicion.',
    },
    feedHeading: 'Heard just now',
    feedEmpty: 'Nothing yet in this listening.',
    feedBlockpage: 'blockpage',
    feedSuspicion: 'suspicion',
    feedEntry: 'OONI entry',
    counters: {
      tests: 'deviations in these minutes',
      countries: 'countries',
      blockpages: 'blockpages',
      anomalies: 'anomalies',
      heard: 'heard, by country',
    },
  },
  honesty: {
    heading: 'What you hear, and what it cannot hear',
    method:
      'OONI Probe runs on volunteers’ phones and computers. Its web test asks the volunteer’s own network for a page and compares the answer with the one a control on an open network gets. Every test is a pair, the world’s answer and the local one, and Comma hears the pair. Six kinds of page are six organ tones, harmonics of the same low A: politics, news and rights; identity, body and belief; the tools people speak with; culture and play; porn and gambling, kept apart so that a block of them is never heard as a block of political speech; commerce and the rest. Each tone is as loud as the world asked: how many tests of that kind ran in this hour of the last whole day the house counted.',
    deep: `Volunteers test more than pages. They try to reach the messengers people talk on, WhatsApp, Telegram, Signal and Facebook Messenger, and the tools people use to get around a block, Tor, Psiphon and RiseupVPN. Comma hears both below the pages: the six kinds of page sound on higher harmonics of the low A, the messengers on its third, the ways around on its second. The more basic the thing a network takes away, the lower it sounds, and the slower: in these two voices a country sounds at most once in ${say(VOICE_GAP_SECONDS / 60)} minutes, with a tone ${say(VOICE_STRETCH)} times as long. A country is heard there by the share of its own tests that failed on the counted day: silent up to a tenth, full from a half on. The ground tone itself, the first harmonic, is kept for a network that is switched off altogether; nothing sounds on it yet.`,
    proof:
      'A blockpage is a state’s own notice that a page is blocked: proof. It rings a tubular bell on its row’s tone and cuts the tone for a moment. An anomaly is a local answer that differed from the control’s, by a false address, a cut connection or changed content: suspicion. It sounds as a second tone a syntonic comma lower, and the two beat. That small distance between two answers that should be the same is the work’s name.',
    rule: `A single anomaly is often a false alarm, so how loud a country’s anomalies are depends on how often its network deviated on the last whole day the house counted, against that day’s median: ${say(2 ** OCTAVES)} times the median is full weight, the median itself is silence. And every country gets the same chances: each sounds at most once every ${say(GAP_SECONDS)} seconds, blockpages first, because some countries have many more volunteers than others. How censored a network is decides how loud it is, not how many people measure it. Both rules are choices of this work, and the gap was set after listening to one recorded window.`,
    reading: `The piece is a broadcast on the wall clock, ${DELAY} minutes behind the world: the tests of any ${BLOCK} minutes play ${DELAY} minutes later, the same moment for everyone listening. The site reads OONI in blocks of ${BLOCK} minutes, and only the tests that deviated: OONI limits how much any address may ask of it, and a public piece should take little. Each Cloudflare location keeps a block for ${KEEP}, so OONI is asked once per block there, and keeps a refusal not at all. When OONI will not answer, the piece does not fall silent: it plays the house’s own recording of an earlier day, five minutes from each hour in turn, says so, and keeps asking. The day’s counts, which set how loud a country’s suspicion and each tone are, are committed to this site’s repository and can be recomputed. Your browser loads Citizen Lab’s test lists to tell what kind of page each test asked for, and names a blocked page only when it is a news outlet. Nothing about you or your listening is kept.`,
    kept: 'What plays live is read as it runs and not kept, and nothing here is citable. The house keeps two things as a stand-in: the counts of one whole day, and a recording of two hours of it, which plays, labelled, when OONI will not answer.',
    limits:
      'It can only hear where people can measure. In the days before it opened, North Korea and Turkmenistan had no tests at all, and China was tested in bursts, mostly from one network. Untested is not open. A state that censors without showing a blockpage is heard as suspicion, never as proof.',
  },
  credits:
    'Measurements: OONI, the Open Observatory of Network Interference (CC BY-NC-SA 4.0). Categories: Citizen Lab and others, URL testing lists (CC BY-NC-SA 4.0). Sounds: VSCO 2 Community Edition (CC0), an organ and tubular bells.',
  noscript: 'Comma listens with JavaScript and plays with Web Audio; without them only this page remains.',
} as const
