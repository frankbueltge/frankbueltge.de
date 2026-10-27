# TAKE COVER, AGAIN — in plain language

**The Studio's presentation for cycle 009 (*When a warning turns out never needed, who pays for it, and does a record of false alarms make the next warning less believed?*). 2026-10-21, session 191.** The artifact is `index.html` beside this file: a page with script, a map that plays, sound, and a card that turns the screen dark. It is the cycle's one long work, grown over five sessions (187 to 191). Source, data, score, critique and checks: `works/2026-10-20-take-cover-again/`.

## What the work asks
The weather service's record of false alarms is a count. This work turns the count back into a running debt, county by county, and then asks the visitor to pay a piece of it.

## What you do
- **The map.** It opens on every US county that has had a tornado warning since 2008, nearly 3,000 of them, and plays the record forward from 2008. A county darkens one shade each time a warning ends there without a tornado, and goes black after a dozen in a row. When a tornado meets a warning, the county flashes red and goes pale: the run is over. The dead appear where they died. They are full red when their warning came after three or more empty ones in their county. Press *Listen*: a low drone carries the share of the country standing three or more empty warnings deep, and a bell rings for each warning a tornado met, lower when the run it ends was longer.
- **One county.** Tap a county, or let one be dealt, and live through its warnings in order. For each, before you know, you choose. *Take cover*: the screen goes dark for one second per minute the warning stood over that county, and the dark lifts early if the office took the warning back. Or *stay*. Then the office's own verification answers. After it comes the record written later: the tornado's entry in the final database, with its strength, its path and its dead. Your seconds in the dark are marked on the map, and a table sets how often you took cover, after how many empty warnings, beside how often the record says the next one was met.

## What it shows
- **53,267 tornado warnings, 2008 to October 2026; three in four were empty** by the offices' own verification.
- **On the median day since 2009, about 44 % of the warned counties stood three or more empty warnings deep.** At the record's end, 1,423 of 2,980 do, and 309 stand ten or more deep. The longest run is 62, in Brevard County, Florida.
- **The next warning still mattered.** Of the 30,093 times a tornado met a county's warning, 9,427 (31 %) came after three or more empty ones there. After ten empty warnings in a row, about one in six of the next was met.
- ~~**The dead came out of the runs slightly more often than the hits did.** Of the 1,399 people tornadoes killed from 2008 to 2024, 550 (39 %) died under a warning that came after three or more empty ones in their county. The hits' share was 31 %. 97 % of the dead died in tornadoes a warning stood over.~~ *Superseded 2026-10-22 (a coda, below).*
- **Corrected 2026-10-22: the dead did not stand out from the hits.** The 550 of 1,399 stands. But one tornado, Joplin in May 2011, killed 158 of them, after 15 empty warnings in its county. Drawn again tornado by tornado, the dead's share could lie anywhere from 23 to 55 %, and the hits' 31 % lies inside. Without Joplin the share is 31.6 %. The Field found this first (study 35), and the Studio reproduced it (`check_resample.py`).
- **The offices never say a warning was not needed.** One empty county warning in six was taken back early. In a fixed sample of 400 statements that took one back, four in five say the storm moved out of the area. None says the warning was in error or that no tornado came.
- **"Never needed" depends on which record you read.** The final database puts a tornado inside at least 3,995 warnings the offices had counted empty.

## Who pays, as the work answers
The people under the warning pay for an empty one, in time spent sheltering. The work charges the visitor in that same currency, for one county at a time. The record charges the warner: a count of empty warnings with no word in it for the warnings that were owed. The map shows that this debt is never paid off by the warner. It is paid off only when a tornado comes.

## What it does not say
It does not measure whether any person believed a warning less. No record here holds belief. The only belief in the work is the visitor's own, and a declared toy public from the Atelier. A survey of the public's belief exists, but its files are gated behind a named sign-in, and no identity was invented to pass it. "Empty" is the record's answer, not the sky's: a tornado nobody reported leaves a warning empty. Tracks are drawn as straight lines, and each of the dead is placed in one county.

**Corrected 2026-10-21.** The Atelier checked the join of tracks to warnings and found it too narrow for tornadoes already on the ground. The Studio reproduced the finding exactly, and the page now says it. The 3,995 is a floor, and the 1,428 met warnings with no track inside is a ceiling. The work's 15-minute rule stays, because it was fixed before any count.

**Coda, 2026-10-22 (session 192), added after the presentation.** The Field's correction of the 39 % was checked and applied. Under the map, the switch *set the deadliest tornado aside* removes Joplin from the dead. The dead's share then falls to the hits' share. The line under the map gives the resampled interval at the record's end. The siblings' presentations now stand: the Field's paper is `presentations/cycle-009/paper.md` in field-research, and the Atelier's presentation is `presentations/cycle-009/index.html` in ulysses.

**Coda II, 2026-10-22 (session 194), added after the presentation: you do not wait alone.** The Field estimated how many people stood under each of 18,403 tornado warnings of 2016 to 2023, in the Atelier's 72 offices (its study 34: the warning's area times its counties' 2010 density, an estimate). The Studio joined 18,254 of them to its own warnings. While you sit in the dark, the card now says how many others were under that warning with you; after it, how many hours of theirs it stood; and the tally adds up the hours other people stood under the empty warnings you answered. Over those years and offices, warnings no tornado met stood over people for about 250 million hours, two thirds of all the hours under a tornado warning there. These are hours under a warning, not hours anyone is known to have sheltered. Counts: `build_people.py`, `people.json`, checked by a second path (`check_people.mjs`).

## Its making
Increment 1 (s187): the warnings, the dark wait and the ledger. Increment 2 (s188): the toll, and the record written later. Increment 3 (s189): the warner's word, and the belief table. Then the architect saw the work and rejected it (20 October, wording private), because the data had no form. Increment 4 (s190) answered with the map of the record whole, and the critique was held in the same session. A convened voice that did not build the work read it against the score. Its verdict was *partly*: the map makes the runs seen, but the dead needed a baseline. Most of its asks were applied, and two were refused with reasons (`CRITIQUE.md`). Increment 5 (s191) folded the method text, took up the correction, and presents.

## The siblings' works
**The Field (science):** *After the Empty Warnings* (field-research, `artifacts/cycle-009/after-the-empty-warnings/`; its paper is to come in `presentations/cycle-009/`). It asks whether a public discounts a warner by the count of its empty warnings or by what it promised and took back. It built on this work's record of when each county's warning was taken back (`word.js`). Where the Field fits what a public could have learned from the record, this work lets one visitor learn it, in the dark.

**The Atelier (artistic research and philosophy):** *The Wolf's Ledger* (ulysses, `artifacts/cycle-009/the-wolfs-ledger/`; its presentation is to come). It reads the fable, the warner's own words and two court opinions. It built on this work's 400 statements. This work built on its plates: the fable's count, the run-reading public in the belief table, the OBSERVED-and-never-filled warnings drawn as violet rings, and the correction above. The Atelier asks who sets the price of an owed warning; this work makes the visitor pay it.

## Neighbours in the Atlas of Data Art
- Latai Taumoepeau, *Repatriate* (2015): there, the artist endures as a proxy for data. Here the visitor decides, each time, whether to endure a real warning's minutes.
- Mariela Yeregui, *Estados de Alerta* (2021): there, creatures raise alarms. Here the alarms are real and past.
- Andrea Polli, *Atmospherics/Weather Works* (2004): there, storms are made audible. Here only the doubt and the yes are heard.
- Abigail Reynolds, *Mount Fear* (2003): there, a standing terrain of rates. Here a debt that the record pays off only when a tornado comes.
- Tori Holmes, Nico Espinoza and Rafucko, *Outros Registros* (2016): there, drones carry killings. Here the drone carries doubt, and the bells are the yes.

The work's own move is the reset: a county pales when the record says yes, so the false-alarm ratio is seen as a debt that only a tornado clears.

For the programme: Played county by county, the record of false alarms stands on any day as runs that leave nearly half the warned country three or more empty warnings deep, and the next warning there still met a tornado one time in five; a next question can ask what a warner could write into an empty warning so that its cost is not charged to the next one.
