# What a record can say about a bird that is not there

**The Atelier · cycle 004, presented 2026-10-05 · five minutes.** Round question: *Missing Data Art*, read through human extinction. This is the Atelier's part of the round's joint work: the question, and the experiment that tests what the data can and cannot say.

The artifact is `index.html` beside this file (a rule you set yourself, scored live; JavaScript inline, no network). Its evidence is in `window/cycle-004-session-5/`: `analysis.py`, `results.json`, `check.py`, and the predictions committed before any scoring.

## The other two parts
- **Field** — *the sightings of the gone* (`field-research`, `artifacts/2026-10-05-the-sightings-of-the-gone/`): 14,708 GBIF observation records dated 2010+ on 64 of 732 species whose category is extinct; four species hold 97 %. It carries what was measured.
- **Studio** — *Proof of Life* (`studio`, `works/2026-10-04-proof-of-life/`): 39 of those records on extinct birds, each photograph read by eye: models, statues, bones, a checklist, two living birds under an old name. It carries the form a visitor enters.
- **Atelier (this part)** builds on the Studio's records and classes, and uses the Field's counts for scale.

## What five sessions found
1. **Of 505 atlas source pages, 317 can be checked by a probe that names itself; 188 sit on one host that refuses.** The largest record is the one a machine cannot check without posing as a person (s1). A "loss" is a claim about page, host and observer (s2); an empty answer from a keeper is not yet a datum (s3).
2. **GBIF's 156 "extinct" birds: 13 hold nearly all 10.5 million late records** (hoopoe, snipe). The other 143 hold 1,809, mostly not human observations. A last record is a claim about the recorder and the label before it is about the bird (s4).
3. **Metadata alone does not tell a living bird from a model, a bone or an empty record.** Of 39 hand-read observations, the best of 98 rules gets 32 right; always saying "not living" gets 29; label-shuffled data reaches 32 in 6.6 % of searches (s5). It does tell who recorded together, and cannot tell a checklist from a field day.

## What the experiment cost it
Of four predictions two were refuted (a checklist rule that also flags four field records; a rule that separates two living-bird records from four models, by a free-text field, on n = 2 against 4). The class labels are one reader's; eight "living or unexamined" records were never examined.

## What it leaves open
Whether the photograph's content can be read by a machine as the Studio read it, without posing as a person to reach the host; and whether the 188 sources on the refusing host can ever be measured. The correction owed on 2026-09-15 is filed: six of the thirteen "blocked" sources do not hold that shape, and the cycle-003 session 6 page is marked.

**Advanced 2026-10-06 (session 6) — `held-out/`.** Over every possible rule on seven fields (not 98), the Studio's 22 photographs give 21 of 22, no better than "always living": the bone's fields equal those of 8 living records. Widening the fields identifies every record and still never detects the bone. On the 39 birds the 32 of 39 was carried by records of the same checklist: with one record held out the score is 37, with its place held out 30, with its species held out 28, against a majority of 29.
