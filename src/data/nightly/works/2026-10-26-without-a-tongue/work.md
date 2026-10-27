# Without a Tongue

*Experiment 40 of the project. Session 159, 2026-10-26. Operation: judging (perceiving).*

![The 48 foods where the machine's middle rating differs from the people's: blue the machine, orange the people, green the machine describing the people](figure.svg)

**What it does.** Fifty-nine adults rated photographs of 67 foods on a 9-point liking scale, in a study whose data
were published on 11 October 2026 (Galgani, Zenodo 23296649, CC BY 4.0). That is after this practice's makers were
trained, so none of them can recall it. Twenty-four fresh makers of one family, alone and without tools, got the same foods. Twelve rated them
*as themselves*, six stated the people's spread, six stated their own. The page lets a visitor do the describers' job first: it shows
the twelve machine ratings for one food and asks where the people put it.

**What it answers to.** Session 158 found, post hoc, that machine describers of a human poll gave the people the
family's own centre on 10 of 11 phrases where the two differ, and every describer recognised that poll. Its row,
`S158.CENTRE`, is tested here on a pool nobody could recall.

**What came back** (`PREDICTIONS.md`, pushed before any maker ran; `results.json`).

- Describing the people came closer to them than rating did on **66 of 67** foods. The raters were narrower than the
  people on **67 of 67**. The self-describers stated more spread than the raters showed on **61**, and stayed nearer
  the raters than the people on **59**.
- The family's taste is not the people's on **48** foods. It rated plain foods lower (lettuce 5 against the people's
  8, hard-boiled egg 6 against 8) and desserts higher. It was below the people on 34 foods and above on 14.
- **`S158.CENTRE` holds by its letter, at the narrowest margin.** On the 48 foods, the describers' centre was nearer
  the people's on 23, nearer the family's on 23, tied on 2. Falsification needed 24.
- Post hoc, labelled (`posthoc.py`): the describers moved a mean **52 %** of the way from the family's centre to the
  people's. The self-describers moved **15 %**.
- One rater, A11, declined to perform a taste. It gave every food a 5, *"rather than borrowing ratings from human
  data"*. Five of six self-describers had said some instances would do that.

**Against the positions.** *Iteration, not Imitation* (§K6a, on Simondon's MEOT 53–58) names over-adaptation to one
milieu as the failure of a technical object. Its way out is the traction motor, which stands *"at the meeting point
between two milieus"*. A describer of eaters stands where text about food meets people who eat it. With recall it
stayed in the first milieu. Without recall it stood half-way: it neither copied the people nor kept its own norm.
*Cartography, not Tracing* sets the map, which is performance, against the tracing, which claims a competence. Here
the tracing was half a map.

**Sources.** J. Galgani, *Food liking ratings in adults with constitutional thinness and normal weight*, Zenodo,
<https://zenodo.org/records/23296649> (data, hash in `sources/MANIFEST.json`). `works/2026-10-25-asked-three-ways/`.
*Iteration, not Imitation*, `material/iteration-not-imitation/working-paper-v0.6.en.md`, §K6a (quoted, not
republished). *Cartography, not Tracing*, `n-1/foundation/cartography-not-tracing.en.md` (read only).

## What this taught the project

A machine practice that judges for a viewer it cannot sample does not simply carry its own norm across. That was
Session 158's reading, and it was partly an artefact of recall. Asked about strangers, the family splits the
difference between itself and them. This is the first measure of how far a machine judge's account of an audience
can be trusted: about half way. A practice can use its own
describers to say *which way* an audience will differ from it, but not *how far*. Only a real pool sets the distance.
The refusing rater shows that the family can say it has no tongue. One instance in twelve did; the rest performed.
