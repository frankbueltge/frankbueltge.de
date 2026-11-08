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

## Forms (proposed in the night of 2026-11-08, built as probe 11, awaiting Frank's verdict)

Frank's verdict on probes 08c, 09 and 10 (night of 2026-11-08, wording private), summarised: not yet. The
tracks resemble one another, so the method has to change, not the mix. The vocoder is one means among others;
the wordless vowel probes (05 to 07) came closer, in the direction of Reich's process music. Atonal and
non-electronic forms are open, no genre is set, and the reference is current experimental practice with data
and sound, researched and named. This section is a session's proposal and the probe built from it, not a
decision; nothing in it holds until Frank has heard probe 11. The sections after it describe the first template
(probes 04 to 10), which this proposal would make one way among several.

**Why they sounded alike, measured.** Every track from probe 04 to probe 10 shared 128 BPM, the just grid on
A1 = 55 Hz, the same three Surge instruments, the same vocoder, the same two-step drums, the same level map, a
master at −14 LUFS and the same form (a state or a hook, one section per day, a coda). Only the data changed,
and a template whose knobs the data turn sounds like one track. A descriptor distance (`contrast.py` in the
probes: pulse strength and period, onsets per second, spectral centroid and its spread, flatness, pitch-class
profile, loudness range, each scaled over the set compared) puts probe 09's three louder map tracks 0.7 to 2.1
apart, and the five forms of probe 11 1.7 to 5.5 apart in the same comparison. The closest pair is mass and
phase, both made of many synthetic voices. The ear decides; the number keeps the argument honest.

**A measurement had become a target.** Probe 09 brought in a speech recogniser to check whether sung words come
through, and the music was then arranged to raise its score: words in front and nearly dry, the rest ducked by
6 dB, never a voice from behind. That pulled every track into one shape. Intelligibility is now a property a
form may choose, not a gate every track must pass. The recogniser stays an instrument: in the room form it
measures how fast the words dissolve.

**The proposed rule: the structure of the data chooses the form.** Each form brings its own time, tuning, sound
source and level. Shared are only the data rules (the house count, Ducking's reading filter, the content rules),
the record (receipts, hashes, stems), the ears (measured head responses) and the absence of any music model. For
a map track the first form whose condition holds is taken (`forms.py` in the probes; thresholds are first
settings, to be checked against a longer archive). The procedures come from the canon; where they stand today is
in the column of current work, from the research below:

| Form | Taken when | Lineage | Current work nearby | The data's reason |
|---|---|---|---|---|
| silence | at most 7 signals in the week | the Wandelweiser composers (founded 1992 by Antoine Beuger and Burkhard Schlothauer), Cage | Wandelweiser's six releases of May 2026 | absence is the measurement |
| mass | at least 100 signals | Xenakis' stochastic music; *Formalized Music*, ch. I, derives the composition of masses from the sound of a political crowd | Rania Kim's accumulating voice clones (ZKM 2025); Félix Blume's one pulse per walker (Donaueschingen 2025) | no single signal can be followed |
| process | the week turned: the last two days' mean at least twice or at most half the first five days' (each + 0.5) | Reich's gradual process (essay, 1968; *Piano Phase*; *Drumming*), Stockhausen's *Stimmung* (six singers on harmonics of one low B flat, shaping overtones with vowels); probe 05's looped vowels have the structure of Eno's sung notes on incommensurable loops (*Music for Airports*, 1978) | Julia Jasmin Rommel's cartophony, which sounds changes rather than levels (Prix Ars Electronica 2023) | a change of attention is a process the ear can follow |
| room | one word stands in at least a third (and at least four) of the readable headlines; the field's required words do not count, its terms do | Alvin Lucier, *I Am Sitting in a Room* (1969; the 1980 recording has 32 repetitions) | Interspecifics' *Recurrent Morphing Radio*, consumption as overtraining into noise (Prix 2021); Laure M. Hiendl's repetition as circulation (Donaueschingen 2025) | a repeated story is one sentence passing again and again through the same medium |
| phase | one phrase copied by many outlets (Consensus) | Reich, *It's Gonna Rain* (1965), *Come Out* (1966); Diana Deutsch's speech-to-song illusion (1995): a phrase looped exactly comes to sound sung | Hiendl (as above); Deadspin's montage of Sinclair anchors reading one script (2018) | the same words in many places, minutes apart |
| testimony | otherwise: a handful of distinct headlines | speech melody: Janáček; Reich's *Different Trains* (1988), where instruments double recorded speech; speech re-sounded by instruments: Peter Ablinger's *Voices and Piano* (since 1998), Clarence Barlow's synthrumentation, sine-wave speech snapped to notes (Remez's lab, 2007) | (not built yet) | each headline worth hearing on its own |

**The rule was settled after the sketches, and says so.** The room was first built for climate by hand. The
rule's first version then put climate, economy, nature and health under testimony, because it ignored a field's
own terms when looking for a repeated word, and El Niño is one of climate's terms; it also rounded the share
before comparing it with a third. Two changes followed: the field's required words are ignored (every headline
carries them) but its terms count (any one of them qualifies a headline, so one term in a third of them is a week
spent on one story), and the share is compared unrounded. Both flipped all four fields to room. The reasoning
holds, but it came after the outcome; the thresholds are to be fixed before the next week is pressed, not after.

Week 45 (2 to 8 November) by the rule: war and violence mass (147 signals); AI, power and information process;
economy, climate, nature and health room (inflation, El Niño, air, polio); hunger, poverty, inequality,
displacement and democracy silence. Over the nine complete weeks in the archive (from 2026-09-07) hunger,
poverty and inequality are silent every week, war takes room six times, mass twice and testimony once. Since
2026-11-02 Google News is read in ten editions, so earlier weeks count lower. Two weaknesses show already: power
(8 signals) and information (12) take process from a turn that small counts produce by chance, so process needs
a floor (about two signals a day); and a week of four rooms and five silences repeats Frank's complaint one level
up, which is what the open question below is about.

### Probe 11: five forms on the same week

Built in the night of 2026-11-08 (`_drafts/probe-pressing/form_*.py`, `out11/`), all on week 45, so that what
differs between them is the method. Each renders bit-identically twice in fresh processes.

- **Mass, war and violence.** No beat and no tuning. Seven equal days of twelve seconds; every one of the 147
  signals is one event, its onset where a Poisson process with that day's count puts it, its length from an
  exponential law. A headline the record reads is its own text in one of 27 English voices, granulated (grains
  of 90 ms, four deep) and stretched over the event while its pitch glides; a signal the record does not read
  is breath, the loudness envelope of its words on a gliding noise band. Glide speeds are drawn from a Gaussian
  law, as Xenakis drew his; each family has a register and a direction around the listener. When the mass has
  gone, the field's checked line, plainly. Denser days are louder days; nothing evens them out.
- **Process, AI and its harms.** A pulse of 0.2 s, a cycle of twelve. Each family sings its vowel on its
  harmonic (probe 05's sound), and its pattern moves one pulse per cycle towards that day's count of its
  signals: beats replace rests, or rests beats, one at a time, so the music lags the data as attention does.
  The week's busiest family (tech) sings twice, the second voice drifting ahead by a quarter pulse a cycle on
  the busiest day and less on quieter ones; the drift never resets, so the distance between the two voices is
  the week's whole attention. Each day opens with its families held as one chord, an octave down.
- **Room, climate and disasters.** The sentence the week repeated (the readable headline sharing most words
  with the others; on a tie the shorter): "NIA-Kalinga steps up irrigation measures amid El Niño", said once,
  then passed once more through the room for each of the week's 31 signals. The room is the platforms that
  carried the field: narrow resonances on the harmonics of news, social and search in every octave from 120 Hz
  to 4 kHz, each lifting its band 2.4 dB a pass (plus up to 0.5 dB by the family's share), over a faint diffuse
  room. The recogniser writes the whole sentence down through pass 10, 78 and 67 % of it at passes 11 and 12,
  22 % at pass 13, and from pass 14 on only "[MUSIC PLAYING]", later "(eerie music)" and "(chiming)".
- **Phase, Consensus.** No pitch, no grid, no instrument. Each day the first outlet says the copied phrase once,
  alone; then each of the first twelve outlets loops it in its own voice (British for .uk) from the direction
  of its country domain, the outlets of the first quarter hour together, each later quarter hour half a phrase
  later and looping slower by k × its quarter hours, k = 0.6 % × (1 − the echo index's percentile): the more the
  whole news stream copied that day, the tighter the copies hold. The rape verdict is never voiced; its copies
  are breath. (This sketch still tests only the six words; under the corrected rule below three more days would
  be breath.) The recogniser writes down 67 to 100 % of each voiced phrase said alone and 0 to 67 % at the end of
  the day, where it starts to hear words that were never said ("we promise after a week" in "threats after a week
  of hoaxes").
- **Silence, poverty.** The field's checked line once (the World Bank's nowcast of 811 million people below
  three dollars a day), then seven days of twelve seconds, each begun by one soft tick, and one sine tone for
  each signal on its family's harmonic. A signal the record would read is said once, quietly, before its tone.
  The week had two: a Google Trends query on a celebrity's Halloween costume, counted because its headlines name
  homelessness, and said once; and a headline on the record debt of the poorest countries, not read aloud because
  it names a sum in dollars. Levels as composed: a quiet field stays quiet.

**Neighbours and daylight** (research of 2026-11-08; every entry from a fetched page). Sonified attention and
web text: *The Listening Machine* (Daniel Jones and Peter Gregson, 2012; 500 UK Twitter users, sentiment as mood,
the prosody of their syllables as melodies), *Listen to Wikipedia* (Hatnote, 2013; edits as tones),
*Listening Post* (Mark Hansen and Ben Rubin, 2002–06; chat-room fragments read and sung by a speech
synthesizer), *#tweetscapes* (Tarik Barri and Anselm Venezian Nehls, 2012), Brian Foo's *Two Trains* (2015),
*Loud Numbers* (Duncan Geere and Miriam Quick, since 2021), Reveal's choir sung in proportion to executive
shares (2018), Johannes Kreidler's *Charts Music* (2009), Smriti Keshari and Matthew Herbert's *Disintegration*
(2020; 1,460 headlines). Identical phrases across outlets have been shown only as spoken video montage (the
local anchors in Conan O'Brien's segments; Deadspin's Sinclair supercut, 2018). Daily songs from the news now
exist made by music models (Audio.Observer, since May 2026). In the programmes of CTM, transmediale, Ars
Electronica, MaerzMusik, Donaueschingen and ZKM from 2020 to 2026 no work sonifies headlines or attention counts
directly. Closest in method: Laure M. Hiendl's few bars of Vaughan Williams played incessantly as a study of
circulation (Donaueschingen 2025), Interspecifics' *Recurrent Morphing Radio* (overtraining dissolves a stream
into noise; Prix Ars Electronica 2021), Maximilian Marcoll's *Amproprification VI* (gain curves compose an
unchanged reading; CTM 2021), Jennifer Walshe and Jon Leidecker on hype language as dataset (transmediale 2023),
Brigitta Muntendorf's *MELENCOLIA* (MaerzMusik 2025), Holly Herndon and Mat Dryhurst's *The Call* (Prix Ars
Electronica 2025), Julia Jasmin Rommel's cartophony, which sonifies changes rather than levels (Prix Ars
Electronica 2023). The daylight is the combination: a weekly pressing from cross-platform attention in thirteen
fields, the form of each track chosen by the structure of its data, and one copied phrase played in the order
and timing in which outlets printed it. Not found is not proof of absence.

**Open, for Frank:** whether the quiet fields share one silence track (five in week 45; hunger, poverty and
inequality in every archived week), and whether fields that take the same form share one movement, so that a
week becomes a suite of four or five movements instead of thirteen tracks; the thresholds; the testimony form,
the topic tracks and the weekly pressing under this rule (the next probe).

### Probe 12 and the week as an album (proposed later the same night, awaiting Frank's verdict)

Frank's note on probe 11 (wording private), in short: new material is not enough, the composition itself has to
add something; fewer and better pieces, a week as an album, styles that do not repeat, Consensus as hard techno,
and notation as a subject of its own. On notation the composer Christian Dimpker has published (*Extended
Notation: The Depiction of the Unconventional*, 2013; *Holistic Notation*, announced for 2026); his premise is
that a score allows a kind of composing only it allows, and that it permits versions and archiving.

**Probe 12, Copy** (`probe12_copy.py`, `out12/`): Consensus as a techno track. After Frank heard it (wording
private): the headline must not be cut off, and the track may be harder, Detroit or Berghain. So it now loops the
whole headline (Consensus's sample title) over one, two or four bars, voiced only where the whole headline passes
the filter (three days of seven; the other four are breath and the bass holds F), at 138 BPM in F Phrygian,
−8 LUFS, with the rumble always under it and as loud as the day's reach, a 909 ride, claps, dub chords and toms
entering as the reach grows; the robot voice is a choice of style. Three devices carry it; only the first is a
candidate for something new:
- the **latency groove**: a bar is the cascade. The kick on the beats is the clock; the twelve sixteenths between
  them are the first twelve outlets in the file's order, each 8 ms late for every GDELT quarter hour after the
  first outlet ran the phrase (never by half a sixteenth or more, where a late copy would sound early), and hats
  and bass ride the same template. Measured on the copies at 138 BPM: about 0 ms median lateness on the days the
  outlets ran it within one quarter hour (3 and 8 November), 24 to 36 ms on the days it trickled (2, 4, 5 and 7
  November). The
  groove is the copying's delay. Not found in a targeted search; the nearest work, Chris Chafe and Greg Niemeyer's
  *Ping* (2001), turns network round-trip time into pitch, not into groove.
- the **illusion becomes the bassline**: the headline loops exactly, which makes speech sound sung (Diana Deutsch's
  speech-to-song illusion); from a day's ninth bar the bass plays the melody the ear has begun to hear, from the
  thirteenth only the bass still says the phrase. Instruments doubling speech melody are Reich's *Different
  Trains*; only the order (illusion first, then the bass, then the words gone) belongs to this piece.
- **reach as arrangement**: how widely the phrase ran, as a percentile of seven years, decides how many layers
  play; the echo index's percentile is the vocal delay's feedback. Counts setting the number of voices are a
  standard of sonification (Brian Foo's *Two Trains*), applied here.
Its listening guide is a first score (`probe-12-score.png`): kick and copies in percussion notation, each copy
drawn where it sounds with its lateness in milliseconds, the bass on a staff, a page a drummer and a bassist could
play from. Bit-identical across two runs.

**The week as an album in editions** (proposed that night; Frank's go the same night, wording private; built as
probe 13). Each night the album is pressed again from the days so far; every edition stays playable.
- **No hindsight from the future.** Edition k uses only the days up to k and the newest Ducking round checked on
  or before day k (in week 45: the round after cycle 011, checked 2 November, until the 6th; the round after
  cycle 012, checked 7 November, from then on), for the fields' terms as for their checked lines.
- **The tracks form themselves.** Copy (Consensus) is on every edition. For the map, every field's form is chosen
  again in every edition, with the thresholds scaled to the days so far: silence at most one signal a day, mass at
  least 100/7 a day, process from the third day on (the last two days against the days before them), room and
  testimony as for a week. One track per form: all silent fields share the silence track; mass, process and room
  take their busiest field, the others stay open; testimony is not built yet, so a field in it has no track in
  that edition and is listed as such. A field can change form during the week, and its track with it.
- **One retroactive principle.** Every edition hears the earlier days from its newest day: what the newest day no
  longer carries loses its voice in them; where a form has a voice to lend, the newest day's voice enters them.
  In the mass, an earlier signal whose story (the field terms it named) is not named on the newest day is breath
  instead of words; in the process, a family absent on the newest day pulses as breath; in the silence, an earlier
  headline is only said if its field is named on the newest day; in the room, the sentence is the story the days so
  far repeated, so every pass sings what the newest edition found; in Copy, the newest voiced headline's melody
  closes every earlier day (its last four bars, in the bass). Measured per track: Monday's section in edition 1
  against edition 7.
- **Not repeating.** Each track takes a different idiom, chosen by its data's structure (the forms); a track whose
  descriptors lie too close to the same focus's last weeks (`contrast.py`) takes the next idiom (from the second
  week on). Every track comes with its score. A live version and the desk stay separate experiments.
- **Storage, open:** renders are bit-identical, so only the newest edition's audio needs keeping; earlier editions
  can be pressed again from data and code.

**Probe 13, built the same night** (`album13.py`, `out13/`, `probe-13-editions.png`): 25 tracks in seven editions of
week 45. Copy is being reworked in its own session and is not part of it. The content filter is gone from these
tracks as from Ducking (Frank's decision, wording private): the war track speaks 145 of its 147 signals instead of
96; only text the English voice cannot read, URLs and porn or spam site names stay out, the last pending his answer.
- **The album formed itself.**
  - Monday's edition: war as mass, and seven quiet fields sharing the silence.
  - Tuesday: information enters as a room.
  - Wednesday: economy enters as a process.
  - Thursday: nature as process, economy as room.
  - From Saturday: AI is the process track, after five days without one of its own (testimony, not built yet).
- **The room's sentence followed the story the days repeated:** Somali women journalists who do not feel safe at work
  (editions 2 and 3), Philippine inflation seen at a three-year high (4), inflation surging to 7.8 % (7).
- **Hindsight, measured on Monday's war.** In edition 4, four of its 21 voices lose their words because their stories
  are not named on Thursday; in edition 7, three. In those seconds Monday sounds completely different (the
  difference reaches the section's own level), and everywhere else it is identical to the bit (−37 to −115 dB).
  - A first build drew every event of a day from one random stream, so one changed voice re-drew the whole day. Each
    event now has its own stream (field, day, source, text).
  - In the process track the family the newest day no longer has (Google Trends, for AI) pulses as breath. In the
    silence, poverty's and displacement's earlier headlines are no longer said once Sunday does not name them.
- **Checked:** six tracks rendered a second time in fresh processes, all bit-identical.
- **Open:** climate is testimony on Sunday and so has no track; the testimony form is still to be built; Copy
  returns from its session with its own rule for editions.

## From the data to the music (first template, probes 04 to 10)

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
   news sings its own intonation, in pure tuning. The vocoder is built for words: forty bands from 80 Hz to
   10 kHz whose envelopes follow at 90 Hz, and the spoken line's own hiss above 4 kHz passed through, which
   carries consonants and no pitch. (Measured dry, on twenty lines of the map tracks with the corrected
   instrument: the first vocoder, thirty bands following at 45 Hz, let a recogniser recover 48 % of a line's
   words, this one 87 %.)
7. **Placing.** The line enters on the first bar of every day the topic was present and comes again every
   whole number of bars it needs; the next day cuts off a repetition that does not fit. Its words start where
   the topic's first family stands, but never further back than the side, and travel to the front as they
   are sung. The track ends on the topic's name alone, hummed from the front on its own speech melody, each
   syllable on the next family's vowel.

The words lead (in this template; since the night of 2026-11-08 an option a form may take, see Forms). They
have a track of their own, nearly dry (a light compressor, a short room), and while
they sing the rest of the music steps back by half its amplitude, about 6 dB: the house's Ducking, inside the
track. Whether the words come through is measured, not assumed: a speech recogniser (whisper.cpp with the
small English model, used as an instrument; it generates nothing) transcribes each sung line from the
finished mix, each ear separately, and the share of the line's words it recovers is recorded with the
pressing. Measured on 2026-11-08, as medians over each track's lines: the topic tracks as first heard 42, 53
and 0 %, with the vocal chain above 92, 95 and 80 %; the map tracks 78 % (war and violence), 77 % (AI) and
62 % (climate), where the same lines spoken plainly give 92 to 100 %.

Why the doubling, measured on week 44: spoken, a line moves within about seven semitones, and a topic
carried by Wikipedia and Polymarket allows only A and the eleventh harmonic in that range, so without it
56 to 73 % of a line's syllables land on one note and every such line uses two. With the intervals doubled the
lines use three to five notes and none holds more than 56 % of a line. Speech is narrower than song; the
doubling is the one step from one to the other. A topic carried by news and Google Trends sings in the A
major triad (harmonics 4, 5, 6); one carried by Wikipedia and Polymarket in A and the eleventh harmonic.

## Map tracks (built as probe 09 on 2026-11-08, at the owner's go)

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
- **The state first.** The track opens with the field's first checked line from the newest Ducking round
  checked on or before the week's last day, spoken, not sung, in the field's Ducking voice over the drone (its
  `say` for the voice, its `text` for the page): what is, before what was said.
- **The news.** On each day with signals, the field's headlines from Google News are sung on their speech
  melodies one after another with a bar between them, each once, as many as the day's bars hold (the day's
  first line always starts, and the next day cuts off what runs over), so the more the field was named,
  the more is sung. A trailing outlet name is dropped, and a headline sung once in the track is not sung
  again. In a map track no line is looped as a hook; the hook is the field's wordless vowel fingerprint.
- **Which headlines may be sung:** what Ducking's spoken record may read (`readable` in
  `scripts/ducking/voices.py`, imported): at most 96 characters and three words, nothing on its stop list
  (killing, death, violence, attacks, abuse and the like), nothing a voice cannot read. The house already
  decided what a machine voice reads aloud about the world's ills; the map tracks sing the same. From 2 to 8
  November that leaves war 65 distinct headlines, climate 17, AI 16, economy 14, and poverty none: its one
  headline names a sum in dollars, which the filter does not read.
- **Bed, loops, bass and drums** as in the topic tracks; the words lead as in the topic tracks.

## Consensus: the week in echoes (built as probe 10 on 2026-11-08, at the owner's go)

One track a week from Consensus (`/consensus`), which measures verbatim copying in GDELT's English news
stream. Each day file names the phrase of six words that the most outlets ran word for word, how many outlets
ran it, the first twelve of them with the quarter hour each did, and the echo index: the share of all titled
articles that share such a phrase with another outlet.

- **A day** is a section, labelled by its file's date; the files are rolling 24-hour windows that end at the
  last full quarter hour, not calendar days.
- **The phrase** is sung on its speech melody: the six words that were copied, not the sample title. Its notes
  are the harmonics 4 to 11 of the drone's A; this instrument has no platform families.
- **The cascade** sings it as a canon at the unison: the outlets of the first quarter hour sing the phrase
  together, once and whole; the copies of each later quarter hour enter after it, one beat apart per quarter
  hour, in the file's order; outlets in the same 15-minute GDELT slot enter together. (Entering one beat
  after the first, with the phrase still running, the copies drowned it: a recogniser heard the first word
  six times and nothing else.) Each voice comes from the direction of its outlet's country domain. The
  phrase's other outlets (150 to 259 in all from 2 to 8 November, against the twelve listed) join as a cloud
  of copies on the sixteenth grid: 4 copies when the day's reach is the narrowest in Consensus's seven years
  of baseline, 24 when it is the widest (4 + 20 × its percentile). Copies in unison, as Reich's tape loops made a copied
  phrase audible.
- **The echo index** sets how much echo the section carries, as its percentile against Consensus's seven
  years of baseline (`src/data/consensus/baseline.json`), because the raw value hardly moves (0.329 to 0.366
  that week). This is the first layer of Common Time that is levelled against an archive, as the method owes.
- **A phrase the house filter would not read** (Ducking's `readable`) is hummed on its speech melody, its
  words withheld, and the score keeps its text. Taking the runner-up instead would misreport the instrument.
  From 2 to 8 November that seemed to be one day of seven: a rape verdict.
- **Correction (night of 2026-11-08): the filter has to read the whole headline.** Probes 10 and 11 and the first
  version of probe 12 tested only the six copied words. Cut to six words, four of the week's seven headlines
  passed while the whole headline named deaths, rape or attacks ("9 dead as jet nosedives…", "…including 12
  counts of rape", "Missile attacks injure nine as…"), so those probes voiced fragments of headlines the house
  does not read aloud. The rule from now on: a Consensus day is voiced only if Ducking's `readable` passes both
  the phrase and the whole headline around it (Consensus's `sample_title`, the outlet's name dropped). In week 45
  that leaves three days of seven.

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

Within a form: its tempo or its absence, its tuning, its voices and sounds, its effects, the proportions of its
form and its level. Across forms nothing of this is shared (Forms). In the first template it was tempo, the
fundamental, which family has which harmonic and vowel, the voices, the drum sounds and patterns, the effects
(Pedalboard: filter, delay, reverb, compressor), the proportions of the form, and the target loudness of each
layer.

## Sound and record

No music model is involved, and the work says so on its page (Frank's wish of 2026-11-08, wording
private): nothing is generated by a system trained on music. The only model is a speech synthesizer that
speaks vowels and headlines; pitch, rhythm, harmony and form come from the rules above.

Voices run locally on one thread; two renders of the same week are bit-identical. In the first template every
track was mastered to −14 LUFS; since the forms, each form sets its own level (a silent field is not raised to
the loudness of a mass), and only the ceiling of −1 dBTP is shared. Every layer is kept as a stem. Before this goes into the weekly workflow, the
layer levels must again be set on an ordinary day of the archive rather than on the week itself (the
probes normalise each render), so that a quiet week is heard as one. The instruments are Surge XT (open source, GPL, run as a plugin
through Pedalboard and used as a tool), installed with the owner's go; every note is played at its exact
just frequency (the nearest MIDI note, bent the rest of the way), with the oscillators' drift off and their
phase retriggered, so the renders stay bit-identical. Two faults of the instrument were found and fixed on
2026-11-08, after probe 10. A note whose note-off fell on the last sample of its buffer was never released, so
every later note sounded on top of the voices before it: from probe 07 to probe 10 each sung syllable carried
a cluster of earlier pitches. Every note is now rendered past its note-off and then cut. And Surge keeps the
phase of its oscillators from note to note, so the same note differs in its samples, not in its sound,
after other notes; every track now gets fresh instruments, and a track rendered alone then matches the same
track in a set in every layer but the pads, by about -80 dB. The weekly workflow must therefore render each
track in its own process. A whole set renders bit-identically twice (checked on 2026-11-08 for all eight
tracks of probes 08c, 09 and 10, in fresh processes).

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
