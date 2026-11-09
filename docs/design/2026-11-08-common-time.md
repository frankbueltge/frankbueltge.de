# Common Time — Common Ground, played back once a week (2026-11-08)

> **Superseded 2026-11-09.** The weekly template described here was never published. After probes in five forms and
> Frank's verdict that the sound must come first (wording private), the work was rebuilt as an album of three composed
> pieces and renamed *The Ill-Tempered Week*; its pressings of weeks 37 to 44 were removed before the merge. The method
> in force: `docs/design/2026-11-08-common-time-method.md`. This note stays as the record of how it began.

**Origin.** On 2026-11-08 Frank asked how the lab could compose and publish progressive music from the
data its works reflect, pointing at three radioeins programmes (EleKtricity, Kaleidoskop, Schöne Töne)
as examples of the music he meant (wording private, paraphrased). Three listening probes followed, all
rendered locally and kept out of the repository:

1. **The house's instruments as studio functions** — Consensus as echo, Invoked Past as reverb, Sawtooth as
   oscillator, a Rüdersdorf quarry blast from Planetary Listening as kick. Measured against a control with
   the data frozen: the daily modules barely moved the sound (Consensus ran 0.329–0.341 that week). The
   lesson: what decides is a series' spread inside the pressing's window, not how often it updates.
2. **The series that moved, on parameters you can hear** — Common Ground's topics as a chorus, Invoked
   Past's standout year as an echo, Balance as pan, Protocol's quakes as hits, Editorial Deadline's
   removals as cuts, with the composition held identical every day. The data now moved the sound
   audibly; it did not carry as music, and Frank asked for Common Ground alone.
3. **Common Ground alone** — this work. It held.

**The rules** (implemented in `scripts/common-time/press.py`, decided again in
`src/lib/common-time/arrangement.ts` for the guard test):

- A topic's melody is its name: the vowels of its label as first recorded, on F G A C D (u e i o a), one
  eighth each, a word's last vowel a quarter, at most eight notes. Josquin's soggetto cavato without the
  fa, because with A–B♭ in the scale overlapping melodies rubbed a semitone.
- The theme is the week's most persistent topic, an ostinato on every day it was on the charts, silent on
  the others. Each day's melody is its most converged other topic, at half speed, twice, in unison by one
  instrument per platform family (Wikipedia vibraphone, Google Trends electric piano, news soft pad,
  social marimba, tech bell, markets and stores pluck). The rest are ornaments; every other signal is a
  dark tick.
- One melody per day and one theme per week, not a melody per topic: eleven to twenty different melodies
  every sixteen seconds was the data-to-pitch noodling the concept had warned against.
- Synthesis only. Strings and horns made from saw waves sound cheap; a CC0 sample library would be the
  honest route to acoustic colour, and it is a download the owner decides.
- Scales from the archive up to the week's end; levels set on that archive's median day, so a busy week
  is heard as one. The first version of probe 2 had set them on the week's own median and normalised the
  week away.

**Cadence and storage.** One pressing per ISO week, Monday to Sunday, pressed by
`.github/workflows/common-time.yml` once Sunday's day file is in, never rewritten. About two megabytes of
AAC and a score of some twenty kilobytes per week, roughly a hundred megabytes a year in the repository;
when that weighs, the audio can move out of Git and the scores stay. The sound is reproducible on the same
platform and versions (hashes in the score); the arrangement is reproducible anywhere.

**What stays open.** The kill conditions in the USP audit (§24): whether a busy week is audible without the
guide, whether themes persist beyond two days often enough, whether different names stay different
melodies. Anything that leaves the house (a release, a radio submission) is the owner's to send.
