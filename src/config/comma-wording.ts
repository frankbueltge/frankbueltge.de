// src/config/comma-wording.ts — every visitor-facing string of Comma (/comma, 2026-11-13). The page and the island own
// no words of their own: they receive these.
//
// Digit-free wherever a digit would age (the currency doctrine of docs/wording-kanon.md, kept even though an
// unarchived work is exempt from the test that enforces it): the lag, the gap per country and the scale of the
// suspicion rule are constants in src/lib/comma/, and the sentences that name them are built from those constants.
import { LAG_MINUTES } from '@/lib/comma/relay'
import { GAP_SECONDS, OCTAVES } from '@/lib/comma/rule'

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const say = (n: number): string => NUMBER_WORDS[n] ?? String(n)

export const COMMA = {
  meta: {
    title: 'Comma | Frank Bültge',
    description:
      'Internet censorship heard as it happens: the world’s OONI tests, one minute at a time, on six organ tones, with a bell for every blockpage and a comma’s beat for every suspicion.',
  },
  sheet: {
    kicker: 'Counter-measurement · live',
    title: 'Comma',
    sub: 'Internet censorship heard as it happens: the small distance between the internet as the world sees it and as a country’s own network shows it',
    badges: ['live data', 'OONI', 'sound'],
  },
  intro:
    'Press listen and the world’s censorship tests of the last minute OONI holds begin to sound, one minute after another, for as long as this page is open. Use headphones or good speakers: the beats are slow.',
  island: {
    listen: 'Listen',
    stop: 'Stop',
    freeze: 'Freeze the score',
    unfreeze: 'Let it run',
    freezeHint: 'The score holds still and its marks link to their entries; the sound plays on.',
    status: {
      idle: 'Not listening. The sound starts with your click.',
      loading: 'Loading the organ, the bells and yesterday’s counts…',
      waiting: 'Waiting for the next minute of tests…',
      playing: 'Playing the tests of {minute} UTC.',
      standby: 'OONI is not answering just now. The piece asks again in {seconds} seconds.',
      refused: 'OONI limits how often it may be asked and is turning this site away for the moment. The piece asks again in {seconds} seconds.',
      failed: 'The sounds could not be loaded in this browser.',
      noRule: 'Yesterday’s counts could not be read, so suspicion stays silent; blockpages still ring.',
    },
    figureLabel:
      'A live score with six rows, one for each kind of page, the newest moment on the right. A grey band is how many tests of that kind just ran; a diamond is a blockpage, with its country; a bar beneath a row is a suspicion, darker the heavier its country’s weight. Freeze the score to follow a mark to its entry in OONI Explorer.',
    legend: {
      heading: 'How to read it',
      blockpage: 'a blockpage, a state’s own notice: proof (a bell)',
      suspicion: 'a suspicion, a local answer that differed: a comma lower (darker = the country’s network deviated more often the day before; longer = more covert)',
      asking: 'how many tests of that kind ran in the last moments (the organ tone’s loudness)',
      colours: 'Colour says what kind of page was asked for:',
      grey: 'Three kinds wear a colour and three stay grey: the house draws no figure with more than four colours, and these three are where a block cuts speech. Shape, not colour, tells proof from suspicion.',
    },
    feedHeading: 'Heard just now',
    feedEmpty: 'Nothing yet in this listening.',
    feedBlockpage: 'blockpage',
    feedSuspicion: 'suspicion',
    feedEntry: 'OONI entry',
    counters: {
      tests: 'tests in this minute',
      countries: 'countries',
      blockpages: 'blockpages',
      anomalies: 'anomalies',
      heard: 'heard, by country',
    },
  },
  honesty: {
    heading: 'What you hear, and what it cannot hear',
    method:
      'OONI Probe runs on volunteers’ phones and computers. Its web test asks the volunteer’s own network for a page and compares the answer with the one a control on an open network gets. Every test is a pair, the world’s answer and the local one, and Comma hears the pair. Six kinds of page are six organ tones, harmonics of the same low A: politics, news and rights; identity, body and belief; the tools people speak with; culture and play; porn and gambling, kept apart so that a block of them is never heard as a block of political speech; commerce and the rest. While tests of a kind run, its tone sounds, louder the more of them ran in the last moments.',
    proof:
      'A blockpage is a state’s own notice that a page is blocked: proof. It rings a tubular bell on its row’s tone and cuts the tone for a moment. An anomaly is a local answer that differed from the control’s, by a false address, a cut connection or changed content: suspicion. It sounds as a second tone a syntonic comma lower, and the two beat. That small distance between two answers that should be the same is the work’s name.',
    rule: `A single anomaly is often a false alarm, so how loud a country’s anomalies are depends on how often its network deviated the day before, against that day’s median: ${say(2 ** OCTAVES)} times the median is full weight, the median itself is silence. And every country gets the same chances: each sounds at most once every ${say(GAP_SECONDS)} seconds, blockpages first, because some countries have many more volunteers than others. How censored a network is decides how loud it is, not how many people measure it. Both rules are choices of this work, and the gap was set after listening to one recorded window.`,
    reading: `The site reads OONI’s newest nearly complete minute once a minute, about ${say(LAG_MINUTES)} minutes behind the world, and gives the same minute to everyone listening: each Cloudflare location keeps OONI’s answer for ten minutes, so OONI is asked once, and keeps a refusal not at all, so the next question goes to OONI again. Your browser loads Citizen Lab’s test lists to tell what kind of page each test asked for, and names a blocked page only when it is a news outlet. Nothing about you or your listening is kept.`,
    limits:
      'It can only hear where people can measure. In the days before it opened, North Korea and Turkmenistan had no tests at all, and China was tested in bursts, mostly from one network. Untested is not open. A state that censors without showing a blockpage is heard as suspicion, never as proof.',
  },
  credits:
    'Measurements: OONI, the Open Observatory of Network Interference (CC BY-NC-SA 4.0). Categories: Citizen Lab and others, URL testing lists (CC BY-NC-SA 4.0). Sounds: VSCO 2 Community Edition (CC0), an organ and tubular bells.',
  noscript: 'Comma listens with JavaScript and plays with Web Audio; without them only this page remains.',
} as const
