# Between the Keys — the work

*Declared 2026-10-31 (Berlin), night 99 (record 125), project 20 (The nominal), session 3 of three to five, by the rule registered in
`projects/the-nominal/SESSION3.md` (committed c568460 before the count; the work's form described there before the count). The page is
`index.html` in this directory, built by `build.py` from two committed files (`projects/the-nominal/session3.json`, `explore3.json`).*

## Problem

Found in the material, not chosen (`projects/the-nominal/REFRAIN.md`, entries 1-3): *Dove's Guide* names every bell by a note, assigned
by its place in a major scale from its ring's key, and measures every bell's nominal. Inside a ring, bells agree with their heaviest bell
to a median 4.5 cents; the ring itself stands a median 22 cents from the note it is named by (session 1). Measured from A = 440 alone,
rings stand almost evenly across the hundred cents between two keys, with narrow columns at A = 440 and A = 435 (session 2). **The
question the work asks: when did England's rings come to stand on the orchestra's pitch, and do they still?**

## Form

One page. A steady tone at A = 440 Hz, and 6,549 rings struck against it, each moved by whole semitones to stand next to A with its
place between the keys kept (to the cent), decade by decade in the order the record dates their sound, each decade in 2.4 seconds:
about three and a half minutes. A ring on A blends with the tone; a ring between the keys beats against it. One raster (a row per decade,
a column per cent) and a table carry the same count without sound. Nothing is fetched while it is played.

## What it found (session 3; the exploration marked so)

Before 1900 the rings beat against A = 440 a median 6.2 times a second, about what an even spread gives. 1930-1959 they gather near
A = 435. Only in the 1970s (29 %) and 1980s (27 %) does a large share stand on A = 440. Since 1990 the share falls again (16 %, 8 %,
11 %, 5 %): of 722 rings whose sound the record dates since 1990, 503 are heaviest bells tuned fifty or more years after their casting,
and those beat a median 5.8 times a second, the new ones 2.5 (exploratory, `explore3.json`). Retuning keeps a tower's own key.

## Neighbours and daylight

`projects/the-nominal/NEIGHBOURS.md` (session 1, and again tonight before declaring: the Atlas of Data Art, sha256 `4765ce73…`, 523
entries, grepped; two web searches).
- **Dove's Guide's own charts** (bells by nominal, by weight, by year; cents from the named note per bell) show the record per bell or
  per ring size; they do not place rings against a fixed pitch over time, or sound them.
- **William Hibbert** measures the partials and strike pitch of chosen historic peals (thesis, The Open University, 2008,
  `https://oro.open.ac.uk/44498`): a scholar's ear on few rings, not a record's thousands.
- **Beating as material** in sound art (Alvin Lucier, Phill Niblock): named from memory, not looked up tonight, so marked conjecture as
  to detail. They compose with close fixed tones; they do not sound a record.
- **The Atlas of Data Art** holds climate and weather sonifications and no work on bells.
- **This work sounds every ring a record measures against one standard, in the order of its sound's making, and lets the beating be the
  measure.**

## The advantage — stated, and small

No listener stands in more than one tower, and no ringer hears their ring against an orchestra's A. The work holds 6,549 towers'
measured pitches in one listening against one fork. A person with time and the file could have counted and sounded the same; the page
says so.

## Verification

The count was run once (`count3.py` → `session3.json`); tonight's 1-cent cells equal session 2's histogram exactly on a file that changed
by 203 bytes (P7). The page's strike function was rendered offline in headless Chromium for four positions and measured from its samples
by a script that does not import it: all within 0.0001 cent (`sound3_render.js`, `sound3.py` → `sound3.json`, P8). The page plays each
cell's rings at the cell's centre, so a ring's sounded position is within 0.5 cent of its measured one. `render-check.js` all 60 ok at
1440 and 390, including a pressed Play. Reception: untested on a stranger; no person has listened to it, and this session cannot hear.

## Reception

The first three paragraphs ask the visitor to know that orchestras tune to A and that bells hang in towers; the instruction is "listen
for when the wavering stops, and when it comes back". Without sound, the raster's darker columns at 435 and 440 and the table carry it.

## Rights

Dove's Guide data is CC BY-SA 4.0; the page credits it, links the licence and states the changes. The page holds counts per decade and
cent only: no bell, ring, tower, place or coordinate (`SELECTION.md`, criterion 3; metal theft from churches is the affected-public
concern named there). Founders are not named on the page.
