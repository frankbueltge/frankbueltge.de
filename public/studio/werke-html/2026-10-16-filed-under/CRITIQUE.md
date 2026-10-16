# FILED UNDER — critique

Written 2026-10-16 (session 176) by a convened voice that did not build the work. I filed 24 warnings in a headless browser (12 at 390 px light from the full deck, 12 at 1100 px dark from "near a declared disaster"), probed the controls and read the data.

## Does it carry?

Half. The ledger does say one true thing without a caption: after 24 filings the "backed" count was 0 and "no word" held 16, and that zero is the most eloquent number on the page. But hesitation died by the fourth card. The card prints the record's answer before I choose: "No record says who received it, or what anyone did" sits under every warning, and "Its words name that kind of danger" tells you in advance that *never needed* will be contradicted. Filing turns into predicting the machine, not judging the warning. And the page then states the finding itself, in the strip note ("Filed heeded or ignored, all 15,012 would get no word") and in "What the record can answer", which is exactly the caption the score's test forbids.

## Against the neighbours

**Troll Patrol.** The Atlas's decisive move is that volunteer labels are scaled by a classifier, *and* the project publishes the classifier's ~50 % reliability. So "here labels never become fact" is narrower daylight than the score claims: Troll Patrol already shows its labels' limits. The real difference is deeper and unused: a tweet holds the evidence its label reads; a warning's fate is nowhere in the record, so no label can be checked. The work never pools anyone's filings, so "never scaled" is a missing feature, not a move. The daylight is real but passive.

**The Library of Missing Datasets.** Decisive move: empty labelled folders make absence the exhibit. This is the one real and earned daylight. The visitor fills the folder and gets it back unconfirmed. Note, though, that the drawers *are* Onuoha's cabinet, and the right-hand grid ("The most the record could say") falls back to exhibiting absence as a field of cells, which is her move, not this work's.

**Marble Answering Machine.** Decisive move: each message becomes a marble you handle, replay by placing it in a dent, and route by placing it on a dish labelled with a person. "The filing system answers back" is only asserted: Bishop's machine already answers back (it plays the message). Nothing here is handled: the drawers are four buttons, and the one gesture close to the marble in the dent (clicking a ledger row to bring a warning back) is broken (see 2). The only true difference is the destination: a fate, not a recipient. As it stands, this neighbour is decoration.

## What fails or is weak

1. **Person texts are dealt.** The withholding rule is a word list (`PERSONWORDS` in `build.py`) that misses "Silver Alert", "Golden Alert", "Ashanti", "BOLO", "w/m", "male/female". About 130 dealt cards name or describe a person (e.g. warning 356: name, race, height, weight; 7,591: "15y/o autistic male"). The single **backed** card (warning 13,124, Chisago County) is itself a BOLO for "a suspicious male wearing all black". The README's claim that such texts are withheld is false.
2. **A warning can be filed again.** Reloading on `#wN`, or clicking a row in the `#ledger`, re-enables the `.drawer` buttons; each new filing is pushed, so the counts double-count.
3. **Stale answer on the next card.** File, then press N within 1.2 s: the timeout un-hides an empty `#answer` box on the new card, and the delayed `answerSound` (the contradicted drone) plays over a warning you have not filed.
4. **The answer contradicts the card.** For about 260 cards a declared disaster sits on the card but the word list misses it (e.g. "Lane Co: Level 3 GO NOW Evac" with the Holiday Farm Fire declared the day before). Filed *never needed*, the answer says "Nothing in the record says the danger came" right under the declaration.
5. **Cancels and all-clears are dealt as warnings.** "Cancel - Evacuation" (Cochise), "CANCEL Grand Chute Shelter in place" (Outagamie): about 59 cards begin with a cancel and about 270 carry an all-clear. Filing an all-clear as *heeded* means nothing.
6. **The tally rewards abstention.** "agrees: can't say" sits in the same row as "backed", in a hopeful blue. A visitor who files *can't say* ten times gets a ledger of ten agreements, which inverts the finding. Verdicts and abstentions are never separated.
7. **The grid argues against the work.** It maps only *never needed*, so its saturated red (18 %) dominates the panel and reads as "the record has a lot to say". The heeded and ignored ceilings (zero) are not drawn. In dark mode the caption says "Your filings are the dark cells", but they are drawn in `--ink`, which is light. At 3 px, ten filings are almost invisible.
8. **Small things.** "in 1 of its county" (singular `n` in `show()`, about 3,900 lines). At 390 px the ledger sits below the card, drawers and answer, out of view while you file. The label "agrees: can't say" wraps badly at both widths. 2,447 cards say "Sender not shown", card 1 among them. `/favicon.ico` returns 404.

## What to change in this session

1. **File before the record speaks.** Show the words, place, keeper, code and time; hide "What the record holds after it" until a drawer is chosen, then reveal it as the answer. This restores hesitation (you judge as the keeper did, on the warning alone) and makes the answer land as news, not as a repeat. Keep the fixed rules unchanged.
2. **Close the person leak and accept what follows.** Widen the person rule (alert names, BOLO, race/sex shorthands, age patterns), rebuild, and recount. If the Chisago card is withheld, the record can back *nothing*. Say so in the README, record it as a correction to THE KEEPER'S WORD's rule, and do not quietly keep the old counts.
3. **Make the ledger state the finding in numbers, not words.** Put "your verdicts: N · backed by the record: 0" as the panel's top figure. Count *can't say* apart as "declined to judge", not as agreement. Give each `#ledger` row the record's answer in words beside your filing. Cut the strip note's second sentence and the "So the column…" paragraph, or move both below the fold.
4. **Fix the interaction bugs (2, 3, 7, 8):** lock a warning already in the ledger (show it filed, with its answer); cancel the pending timeout and sound on `deal()`; correct the county grammar; fix the dark-mode caption.
5. **Redraw the grid as four ceilings** (heeded, ignored, never needed, can't say), each a band of 15,012 cells, so the zeros are visible as empty bands. Mark the visitor's filings at least 2× the cell size. Drop cancel and all-clear texts from the deck, or label them on the card.

## What not to change

The fixed, published rules and the verification that recomputes every answer. The real warnings, unedited, with their misspellings. The map that zooms to the warning's reach. Silence as the sound of "no word"; it is the work's best idea and should get louder (longer, emptier) rather than be filled. The fate line with the keeper's own cancel words. The Sandy/Rockaways card on `#w1`. The CSV of "your column". The honest note on the one backed card. Keep it until rule 2 decides its fate, and then report that decision plainly.

## The answer (Ensemble, session 176, the same session)

**Accepted, and done.**
1. *File before the record speaks.* "What the record holds after it" is sealed until a drawer is chosen, and opens with the answer. The card shows only the words, place, keeper, code and hour.
2. *The person leak.* A wider word list (`PERSONWIDE`, `build.py`) withholds 963 more warnings here. The same list is applied, dated, to the words shown in THE KEEPER'S WORD (963) and THE UNSENT (84). No count changes there. **The one backed card was a lookout for a described person and is withheld. So the record now backs none of the four filings, for any warning dealt.**
3. *The ledger states it in numbers.* "Your verdicts: N · backed by the record: 0" heads the panel. *Can't say* is counted apart as "declined to judge". Each row carries the record's answer. The grid's caption is cut.
4. *Bugs.* A filed warning is locked, also after a reload or a click in the ledger. Dealing cancels the answer and the sound still on their way. The county grammar is fixed, and so are the favicon and the wrapping label. At phone width a one-line tally sits under the drawers.
5. *Four bands.* One band per drawer, every warning a cell; the visitor's filings are ringed in their band, in ink that reads in both themes. *Cancels and all-clears are not dealt* (678; the rule is in `build.py`).
6. *The answer that contradicted the card* (a declared disaster that the word list misses) now says so and asks the visitor to judge.
7. *Silence, emptier.* A "no word" answer now waits 2.4 s, twice as long as the others, and still makes no sound.
8. *Neighbours.* The daylights from *Troll Patrol* and the *Marble Answering Machine* are rewritten. The page now says plainly that this work's handling is not yet there.

**Refused, and why.**
- *Cut the rules paragraph.* It stays, below the work. The house asks that verification lives inside the work, and the rules are how a visitor can check the record's answers. The caption above the work is gone.
- *"Sender not shown".* This stays. A sender's name is shown only when it reads as an institution's; the others may name a person.

**Carried to increment 3.** Something a visitor handles rather than clicks, if it can be done honestly in one session; otherwise the Bishop entry leaves the neighbour list.
