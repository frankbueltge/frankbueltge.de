# Common Time — the method (2026-11-08)

Written down at Frank's request before the next build (wording private). It replaces the rules of
`2026-11-08-common-time.md` once the renderer follows it; until then that note describes what the weekly
pressings on this branch were made with. The probes behind this method (04 to 06) live in `_drafts/` and
are not part of the repository.

## What holds

Data are the basis of every track: what sounds, when, how often, in which chord and for how long comes
from Common Ground's committed day files and nothing else. The method that turns them into music is
fixed, written here and the same every week; which of its devices a track uses may vary from track to
track. Composition decides the frame and the sound. Every audible event can be traced to a day file.

The devices come from a line of music that made a process audible rather than hiding it: just intonation
(La Monte Young, Kali Malone), phasing (Steve Reich), speech melody (Leoš Janáček's notations of spoken
Czech, Reich's *Different Trains*), and the vocoder (Kraftwerk, Holly Herndon).

## From the data to the music

| Common Ground | Becomes |
|---|---|
| the topics that converged on a day | what sounds that day |
| their number against the archive median | how dense and how open the drums are |
| the platform families that carried a topic (Wikipedia, Google Trends, news, social, tech, markets) | the voices and the partials: one vowel and one harmonic per family |
| the order in which the platforms listed it | the order of the notes in its hook |
| how many distinct platforms carried it that day | the hook's rotation; in a topic track, how long that day lasts |
| how many links each family gave | the length of that family's loop, so the loops phase |
| the vowels of the topic's name, unspoken | the hook's onsets per bar |
| the topic on most days of the week | the weekly pressing's bass figure |
| platform-days over the week | which three topics get a track of their own |
| a line that ran with the topic: an outlet's headline, else a platform's own line | the words of a sung hookline (topic tracks) |
| that line's intonation when spoken | the hookline's melody |
| the families that carried the topic that day | the notes the hookline may sing |
| the topic's first family | where the hookline starts around the listener |

## Tuning and voices

One fundamental, A1 = 55 Hz, held as a drone in every track: the ear's reference. Each family has a
harmonic of it and a vowel: Wikipedia 4 "ah", Google Trends 5 "ee", news 6 "oh", social 7 "oo", tech 9
"eh", markets 11 "ay". A topic's chord is the set of families that carried it, so agreement between
different kinds of platform is heard as a different just chord, never as a louder one. The voice is a
synthetic voice (Kokoro-82M, local), vocoded onto a Surge XT saw stack with noise for consonants.

## The weekly pressing

Monday to Sunday, six bars a day at 128 BPM, two bars in and out, about ninety seconds. At most five
layers sound at once:

1. **bed** — the drone and the harmonic of every family that carried a converging topic that day.
2. **hook** — a new one every day: the day's most converged topic, its families' vowels in the order the
   platforms listed it, as many onsets a bar as vowels in its name, rotated by its platforms.
3. **texture** — the two or three busiest families each loop a short vowel blip, as many sixteenths long as
   topics they carried, so the loops drift against each other.
4. **bass** — the week's most persistent topic as a figure, built like a hook, on the days it was on the
   charts; the root of the day's hook on the others.
5. **drums** — composed two-step patterns; hat density and the filter follow the day's convergence.

## The topic tracks

Three per week, for the topics with the most platform-days (distinct platforms per day, summed over the
week; ties to more days, then the id). A track tells its topic's week: a day it was present lasts
2 × (1 + platforms) bars, at most twelve, with the bed, its hook, its families' loops, bass and drums as
open as that day's platforms against its busiest day; a day it was absent is one bar of drone. The hook
of a topic track is its sung line (next section); the vowel fingerprint is the fallback.

## Sung news: the speech melody as hookline

1. **The line.** Among the topic's links of the day, news outlets first, then the platforms' own lines (a
   Polymarket question, say): the first title that still has at least three words once the topic's name is
   taken out, a line not yet sung in the track before one that was. It must pass the content rules below. A
   Wikipedia title is the name itself and never qualifies. In week 44 nine of the ten days sing a
   Polymarket question, because no outlet carried those topics on those days; only Lagarde's resignation
   (CNN) is a news headline. There the market sings, not the news.
2. **The name.** Sung with the rest of the line, since the evening of 2026-11-08 (content rules). Until then
   each run of the label's words was cut out of the line and the families' vowels hummed the name's speech
   melody in the gap; the renderer keeps that as a switch.
3. **Speaking.** The synthetic voice of the topic's first family reads the line once.
4. **Measuring.** The pitch is tracked (YIN). The voice's own phonemes (espeak-ng, as Kokoro uses them) give
   the number of syllables in each part; the most prominent voiced loudness peaks are their nuclei, and the
   line is cut in the dips between them.
5. **Quantizing.** Each syllable keeps its pitch interval to the line's median, doubled, and moves to the
   nearest harmonic of the families that carried the topic that day or to the drone's A, in any octave from
   90 to 520 Hz. Each syllable's onset moves to the nearest sixteenth (onsets, not lengths, so the line does
   not drift), and the syllable is stretched to fill its slot.
6. **Singing.** The vocoder's carrier holds each syllable's note while the spoken syllable modulates it: the
   news sings its own intonation, in pure tuning.
7. **Placing.** The line enters on the first bar of every day the topic was present and comes again every
   whole number of bars it needs; the next day cuts off a repetition that does not fit. Its words start where
   the topic's first family stands and travel to the front as they are sung. The track ends on the topic's
   name alone, hummed from the front on its own speech melody, each syllable on the next family's vowel.

Why the doubling, measured on week 44: spoken, a line moves within about seven semitones, and a topic
carried by Wikipedia and Polymarket allows only A and the eleventh harmonic in that range, so without it
56 to 73 % of a line's syllables land on one note and every such line uses two. With the intervals doubled the
lines use three to five notes and none holds more than 56 % of a line. Speech is narrower than song; the
doubling is the one step from one to the other. A topic carried by news and Google Trends sings in the A
major triad (harmonics 4, 5, 6); one carried by Wikipedia and Polymarket in A and the eleventh harmonic.

## Map tracks (proposed, not built)

The thirteen fields of the map (`src/lib/briefing/map.ts`), the fields Ducking has as faders, each get a track
a week: the field's week in Common Ground, opened by the state the briefing checked for it.

- **Which fields.** All thirteen, every week. A quiet field is short and sparse, and that is the
  measurement: from 2 to 8 November war and violence was named by 147 signals, AI and its harms by 56,
  climate and disasters by 31, poverty by 2.
- **The count.** The house's one count (`src/lib/reading/attention.ts`, mirrored in
  `scripts/ducking/voices.py`, which the renderer imports): a signal names a field when its label or one of
  its links' titles carries one of the field's terms as a whole word, its required words where it has any,
  and none of its exclusions. Since 2026-11-02 Google News is read in ten editions, so one headline can count
  more than once, and weeks before and after that date do not compare.
- **A day's length** is logarithmic, like Ducking's fader: 1 + 2 × ⌈log₂(1 + signals)⌉ bars, at most
  eleven (1 signal 3 bars, 2 to 3 five, 4 to 7 seven, 8 to 15 nine, 16 and more eleven). A day without a
  signal is one bar of drone.
- **The chord** is the families of the platforms whose signals named the field that day.
- **The state first.** The track opens with the field's checked line from the newest Ducking round checked
  on or before the week's last day, spoken, not sung, in the field's Ducking voice over the drone (its
  `say` for the voice, its `text` for the page): what is, before what was said.
- **The news.** On each day with signals, the field's headlines from Google News are sung on their speech
  melodies one after another, each once, as many as the day's bars hold, so the more the field was named,
  the more is sung. A trailing outlet name is dropped, and a headline sung once in the track is not sung
  again. In a map track no line is looped as a hook; the hook is the field's wordless vowel fingerprint.
- **Which headlines may be sung:** what Ducking's spoken record may read (`readable` in
  `scripts/ducking/voices.py`, imported): at most 96 characters and three words, nothing on its stop list
  (killing, death, violence, attacks, abuse and the like), nothing a voice cannot read. The house already
  decided what a machine voice reads aloud about the world's ills; the map tracks sing the same. From 2 to 8
  November that leaves war 65 distinct headlines, climate 17, AI 16, economy 14, and poverty none: its one
  headline names a sum in dollars, which the filter does not read.
- **Bed, loops, bass and drums** as in the topic tracks.

## Consensus: the week in echoes (proposed, not built)

One track a week from Consensus (`/consensus`), which measures verbatim copying in GDELT's English news
stream. Each day file names the phrase of six words that the most outlets ran word for word, how many outlets
ran it, the first twelve of them with the quarter hour each did, and the echo index: the share of all titled
articles that share such a phrase with another outlet.

- **A day** is a section, labelled by its file's date; the files are rolling 24-hour windows that end at the
  last full quarter hour, not calendar days.
- **The phrase** is sung on its speech melody: the six words that were copied, not the sample title. Its notes
  are the harmonics 4 to 11 of the drone's A; this instrument has no platform families.
- **The cascade** sings it as a canon at the unison: the twelve listed outlets enter in the file's order and
  at their recorded times, compressed into the section; outlets in the same 15-minute GDELT slot enter
  together, in the file's order. Each voice comes from the direction of its outlet's country domain. The
  phrase's other outlets (150 to 259 in all from 2 to 8 November, against the twelve listed) join as a dense
  choir whose size is their count on a log scale. Copies in unison, as Reich's tape loops made a copied
  phrase audible.
- **The echo index** sets how much echo the section carries, as its percentile against Consensus's seven
  years of baseline (`src/data/consensus/baseline.json`), because the raw value hardly moves (0.329 to 0.366
  that week). This is the first layer of Common Time that is levelled against an archive, as the method owes.
- **A phrase the house filter would not read** (Ducking's `readable`) is hummed on its speech melody, its
  words withheld, and the score keeps its text. Taking the runner-up instead would misreport the instrument.
  From 2 to 8 November that is one day of seven: a rape verdict.

## Space

Every family has a place around the listener: Wikipedia front left, Google Trends front right, news left,
social right, tech behind on the left, markets behind on the right. The bed's pads and the loops sound
from there; a hook moves to the front as it is sung, the further the more families carried its topic, so
agreement is heard as voices meeting in front of you. The placement is binaural, for headphones, through
measured head responses: the MIT KEMAR set (Gardner and Martin, MIT Media Lab, 1994; from sofacoustics.org,
provided without usage restrictions, credit requested).

## Content rules

- Topic tracks: a topic or line that names death, violence, crime or a court case (the stoplist in the
  renderer) gives no hook, no sung line and no track. Their lines loop as hooks, so this list is stricter
  than the house filter the proposed map and Consensus tracks would use, where a line is sung once.
- Names are sung in the lines, the topic's own and any other (Frank's decision of the evening of 2026-11-08,
  wording private). It replaces his decision of the same afternoon, under which no politician's name was sung
  and the topic's own name was only hummed. A title that is nothing but the name still never becomes a line
  (step 1), and the coda still hums the name.
- A name that cannot be read in Latin script is not voiced.

## Composed, the same every week

Tempo, the fundamental, which family has which harmonic and vowel, the voices, the drum sounds and
patterns, the effects (Pedalboard: filter, delay, reverb, compressor), the proportions of the form, and the
target loudness of each layer.

## Sound and record

No music model is involved, and the work says so on its page (Frank's wish of 2026-11-08, wording
private): nothing is generated by a system trained on music. The only model is a speech synthesizer that
speaks vowels and headlines; pitch, rhythm, harmony and form come from the rules above.

Voices run locally on one thread; two renders of the same week are bit-identical. Every track is mastered
to −14 LUFS and −1 dBTP, and every layer is kept as a stem. Before this goes into the weekly workflow, the
layer levels must again be set on an ordinary day of the archive rather than on the week itself (the
probes normalise each render), so that a quiet week is heard as one. The instruments are Surge XT (open source, GPL, run as a plugin
through Pedalboard and used as a tool), installed with the owner's go; every note is played at its exact
just frequency (the nearest MIDI note, bent the rest of the way), with the oscillators' drift off and their
phase retriggered, so the renders stay bit-identical.

## Open

- whether a market's question may stand in for news when no outlet carried a topic (week 44: nine of ten
  days);
- the map tracks: all thirteen fields every week; their headlines filtered as Ducking's record is;
- the Consensus track: a phrase the filter catches hummed rather than skipped;
- storage: the weekly pressing, three topic tracks, thirteen map tracks and the Consensus track come to
  about 30 MB of git history a week at the probes' bitrate; the bitrate, Zenodo or a retention window has to
  be chosen before the workflow presses them;
- whether a politician may be the subject of a topic track at all (in W44 all three were political);
- the stems desk: each layer of a pressing as a channel to filter, loop and mix, two weeks against each
  other.
