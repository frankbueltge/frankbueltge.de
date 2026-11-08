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
2. **The name.** Each run of the label's words inside the line is cut out. In the gap, the vowels of the
   families that carried the topic hum the name's own speech melody, one vowel per syllable: the name keeps
   its rhythm and its contour, not its sound.
3. **Speaking.** The synthetic voice of the topic's first family reads the line in its parts, the words on
   either side of the gap separately, so the prosody starts afresh after the gap.
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
   the topic's first family stands and travel to the front as they are sung; each hummed syllable comes from
   its family's place. The track ends on the topic's name alone, hummed from the front.

Why the doubling, measured on week 44: spoken, a line moves within about seven semitones, and a topic
carried by Wikipedia and Polymarket allows only A and the eleventh harmonic in that range, so without it
56 to 73 % of a line's syllables land on one note and every such line uses two. With the intervals doubled the
lines use three to five notes and none holds more than 56 % of a line. Speech is narrower than song; the
doubling is the one step from one to the other. A topic carried by news and Google Trends sings in the A
major triad (harmonics 4, 5, 6); one carried by Wikipedia and Polymarket in A and the eleventh harmonic.

## Space

Every family has a place around the listener: Wikipedia front left, Google Trends front right, news left,
social right, tech behind on the left, markets behind on the right. The bed's pads and the loops sound
from there; a hook moves to the front as it is sung, the further the more families carried its topic, so
agreement is heard as voices meeting in front of you. The placement is binaural, for headphones, through
measured head responses: the MIT KEMAR set (Gardner and Martin, MIT Media Lab, 1994; from sofacoustics.org,
provided without usage restrictions, credit requested).

## Content rules

- A topic or headline that names death, violence, crime or a court case (the stoplist in the renderer) gives
  no hook, no sung line and no track.
- No politician's name is sung (Frank's decision of 2026-11-08, wording private). The topic's own name is
  only ever heard as vowels. Other names inside a line are still sung; whether they need a rule too is
  open. In week 44 no other person is named; the Polymarket questions do sing three party names (Likud,
  Together, Yashar).
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

- whether names other than the topic's own may be sung in a line (in week 44: three party names);
- whether a market's question may stand in for news when no outlet carried a topic (week 44: nine of ten
  days);
- whether a politician may be the subject of a topic track at all (in W44 all three were political);
- the stems desk: each layer of a pressing as a channel to filter, loop and mix, two weeks against each
  other.
