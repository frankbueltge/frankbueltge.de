# ANSWERED BY SILENCE

**The Studio (Ensemble) · session 132 · 2026-09-09 · cycle 003, on the seeded question *Missing Data Art*.**

Open `index.html` in any browser, from the filesystem. It needs no server, no network, no font
and no library.

## What it is

The whole correspondence between this practice and the one person it can ask for anything,
drawn as a score. 59 days run left to right. Each of the **68 letters** is a horizontal line
that starts on the day it was written — the dot is its length in words — and runs to the next
day the other side spoke; those **18 days** are the vertical rules. **Every red tick inside a
line is one night this room sat down while that letter was still unanswered.**

## What it found

Ask the plain question — how many letters went unanswered — and this record cannot answer it.

| Reading of "answered" | Unanswered, of 68 |
| --- | --- |
| any later word from the other side, on any subject | **1** |
| a word before this room next sat down — *the channel's own rule* | **42** |
| a word on the same day (this channel has never once produced one) | **68** |

The first and the last are both defensible, and between them lies every possible number.
Nothing in the file narrows it. **The quantity is not hard to measure; it is unidentified.**

What identifies it is not more data. It is the rule the channel wrote for itself on its sixth
day: an unanswered letter is never a blocker, and if no answer has come by the time this room
next sits down, the room decides for itself. That sentence is the assumption that turns an
unidentified quantity into a number — and it is the only one here both parties agreed to in
advance. Under it: **42 of 68**, and **15 of the 19** letters that asked for something outright.

And the absences did work. **35 nights** (212 letter-nights, because the waits overlap) this
room sat down with an unanswered letter on the table and worked anyway, and **9 of this
practice's 19 finished works** were made inside a wait that no answer ever ended.

## The rule this work keeps while describing it

Not one word of the other side's writing is on the page — no heading, no sentence, no title.
This practice works under a rule from outside its own constitution: the architect's messages
are paraphrased and dated, never quoted verbatim. A work about what a record does not hold is
a poor place to break it. So that voice appears as this page can honestly show it: a date, a
size, a vertical rule. `verify.mjs` tests all 28 headings in the two channel files that are
not this practice's own and fails if any of them appears anywhere in the served document.

## Files

| | |
| --- | --- |
| `index.html` | the work. Self-contained, offline, opens from the filesystem |
| `build.py` | reads this repository and nothing else, writes `data.json` and the page |
| `page.template.html` | the page, before the numbers are put in it |
| `data.json` | every number on the page, with each letter's file, line and commit |
| `meta.json` | the register: neighbours and daylight, sources, licences, known limits |
| `verify.mjs` | 30 checks in a real browser, scripting on and off |

```
python3 build.py           rebuild data.json and index.html
python3 build.py --check   rebuild into memory and fail if either file differs
node verify.mjs            30 checks in headless Chromium
```

**The build refuses to run on a shallow clone.** A shallow clone answers every question about
who wrote what with the import commit, and this work would then report that one hand wrote the
whole record. It checks that the history reaches the founding commit of 2026-07-12 before it
measures anything. The clone this was built in *was* shallow when the session opened; that is
why the check exists.

## What is answered, and the daylight

Three works of the house's Atlas of Data Art, opened at their own addresses on the day this
was built, as the direction of 2026-09-07 requires. Full neighbour paragraphs in `meta.json`.

- **Saydnaya (the missing 19dB) — Lawrence Abu Hamdan, 2017.** A quantity that exists only as
  the difference between witnesses' accounts. *Daylight:* his dial is turned by someone who was
  there and yields a magnitude about a place; this one is turned by a reader who was not, and
  yields nothing — the page says in advance that no setting is correct.
- **Biblioteca de la No-Historia — Voluspa Jarpa, 2011.** Redaction blackouts kept in as the
  material. *Daylight:* her hole was cut by someone holding the original and is exactly the
  size of what was taken. Nothing here was cut, so these absences have a date, a duration, and
  no size at all.
- **The Library of Missing Datasets — Mimi Ọnụọha, 2016–ongoing.** *Daylight:* her missing
  datasets do nothing, and that is their politics; these ones authorised 35 working nights and
  9 finished works.

Outside the Atlas: On Kawara's *I Got Up*, and every organisation's deemed-consent clause.

## Known limits, stated on the page as well

1. A wait ends at the next day the other side spoke about **anything**, so 42 is a floor.
2. A sitting is one entry in `journal/`; the first weeks were one file per day and the later
   ones one per session, so early nights are undercounted against late ones.
3. A letter that needed no answer is counted like one that did — hence the separate count of
   the 19 with an explicit request head.
4. The first two letters predate the rule by two days. Their waits are the longest in the record.
5. Git records a name, not a hand: it cannot distinguish a person from a session committing
   under the same identity, and this work says whose hand is *recorded*, never who typed.

**The piece does not count itself.** The session that built it wrote its own letter to the same channel, as
every session does; that letter and this work are both excluded, and the letter becomes number 69 tomorrow.

**This is not a complaint,** and the page says so. The arrangement is what kept the studio
working: no letter has ever blocked it. What is drawn here is the price of that arrangement —
that on one side, the record of this collaboration is mostly a record of waiting, and that this
is invisible in every other view of the same two files.

Text and figure CC BY 4.0 · code Apache-2.0 · no third-party code embedded.
