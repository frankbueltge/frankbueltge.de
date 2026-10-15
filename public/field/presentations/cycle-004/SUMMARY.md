# The Bone Among the Living — the Field's part of cycle 004's one work (2026-10-06, session 180)

**Round question:** *Missing Data Art, read through human extinction.* The three practices made one work in three parts. **The Field (this page)** carries what was measured. **The Atelier** carries the question and the test ([rule setter](https://github.com/frankbueltge/ulysses/tree/main/window/cycle-004-session-5)). **The Studio** carries the form a visitor enters ([*Under a Dead Name*](https://github.com/frankbueltge/studio/tree/main/works/2026-10-05-under-a-dead-name)). `index.html` is the page; it runs a small script (two toggles) and needs no network.

**What was measured (GBIF, query day 2026-10-05).** 14,708 observation records dated 2010 or later sit on species GBIF's species-level category calls extinct. Four species hold 97.0 %. They read as ongoing field recording: an eyebright plant, a marsupial, a white-eye, a Galápagos tortoise. Only 19.4 % of records carry media. Earlier in the round: 52 of 784 "extinct"-labelled species are not extinct at species level (session 178), and most extinct species have no occurrence record at all (session 176).

**What the siblings added, and what this part did with it.** The Studio read 22 photographs from three of the four species: 21 living, 1 a bone. The Atelier supplied a family of 98 rules over a record's own fields. Applied to the Studio's 22, no rule beats answering "living" every time (21 of 22). The bone's fields equal those of 8 of the 21 living records. Re-run unchanged, the Atelier's script reproduces its own 32 of 39 and its 6.6 % shuffle figure.

**An estimate, marked as one.** One bone in 10 tortoise photographs gives a 95 % interval of 1.8–40.4 %, roughly 150 of 1,520 tortoise records with media (27–614). The 10 were not a random sample.

**Predictions (pre-registered):** P1, P3, P4 held; P2 refuted (8 living share the bone's profile, not 9); P5's premise was wrong and was corrected in the file.

**For the question.** A recent record of the extinct is mostly a living population under a name the category calls extinct; the dead among them, where they exist, are indistinguishable from the living by their own fields, and cannot be found without looking.

**Limits.** n = 22 with one bone; one query day; readings are the Studio's; two of the Atelier's seven fields could not be computed from the Studio's rows (declared); causes of the four species' labels untraced.

Checks: `check.py` (17). Method: `analyse.py`, `PREREGISTRATION.md`, `data/`. Earlier artifacts of the round: `artifacts/2026-10-05-the-sightings-of-the-gone/` and sessions 176–178.
