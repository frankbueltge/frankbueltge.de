# Project 10 — refrain journal (T5), session 1

*Written as the session runs; times UTC from `date -u` at the moment of writing. Deviations from `SELECTION.md` are logged here,
since T4 was not chosen. The three aspects coexist (ATP 312); an entry names which one dominates a phase, never a sequence.*

1. **19:50 — selection pushed (efe9073).** *(First written as 19:58: a time ahead of the clock, the habit project 9 recorded; corrected at 19:51 against `date -u`.)* Dominant: the hold in chaos — a dead end (xeno-canto's key, GBIF's reset) and a rule found
   that gives the problem its edge (IALA: same character outside each other's range). Component of passage so far: the IALA sentence;
   it converts a list into a question. Opening test: none made yet.
2. **19:52 — fetched.** Seven volumes, 42,501 records (`fetch_log.json`), no retry. P1's count is not yet the count of lights: removals
   not yet excluded. Dominant: the working-home — a scratch directory, a fetch log, the parser next.
3. **19:53 — registered run (`session1.py`, 21 s).** 42,501 lights, none flagged removed. The null came back below one in every class:
   the same rhythm stands *nearer* to itself than a shuffle within the volume puts it (R 0.78 major, 0.42 minor). Dominant: the hold
   in chaos again — the problem's picture inverted. Before reading anything, the likeliest reading is about the null, not the coast:
   a volume spans many countries, and if each country keeps its own periods (a dialect of rhythm), shuffling across countries
   scatters keys that are, in fact, regional. That is a conjecture and an opening to test, not a result. Deviation: numpy was not
   installed; installed with pip (2.4.6) before the run. Also seen: 5,344 keys unparsed (no period, not fixed) — `Q.`, `V.Q.` and
   others whose rhythm carries no stated period (conjecture until read); they are outside every registered figure.
4. **19:53 — the reading check, and a bug in the reader, not the run.** The first reading printed mismatches (a light shown against a
   RACON's record): `featureNumber` is not unique — a light and its radar beacon share one — so the reader's lookup took the wrong
   record. `session1.py` never looks records up by number (rows are built in record order), so the registered figures stand; the
   reader now aligns by order and asserts it. Read again: **40 of 40** parsed lights right (key, period, range — the largest of
   several colours' ranges — and position). The **20 twin-within-range pairs**, in words (`verify.json`): 3 front and rear of one
   leading line; 3 rear lights of two different leading lines; 5 harbour lights of the same or the next harbour (`Fl.R.` or `Fl.G.`
   3 s); 1 bridge, two faces seen from opposite sides; 2 designed series (special marks in a row; wind turbines); 2 sector lights
   whose sectors may not face each other; 3 independent coastal lights repeating a rhythm within 16-36 km; 1 coastal light and an
   aviation light. No pair reads as a fault, and none was judged one. Dominant: the working-home. Component of passage found: the
   *lateral* code — on small lights the colour says which side and the rhythm is shared, so a small light's character is grammar,
   not a name.
5. **19:54 — exploratory, not registered (`explore1.py`).** The conjecture of entry 3 tested: shuffling only within ever smaller grid
   cells, R rises toward one — for major lights 0.94 (20° cells), 0.97 (10°), 1.01 (5°), 1.03 (2°); for minor lights 0.59 to 0.90.
   So the "nearer than chance" of the registered run is mostly regional convention: each coast keeps its own rhythms. Once that is
   held, major lights stand no farther from their twins than chance — the separation rule is not visible as a spatial avoidance in
   the list as a whole — and minor ones still cluster (the designed pairs and harbours of entry 4). Caveat stated: small cells give
   the shuffle few lights to exchange, which itself pulls R toward one. **Opening test:** the opening this session had planned — a
   page of each light's isolation, a map of territories — is *not* made, because the data does not carry it; the opening is moved to
   the lines: the 624 major lights whose own rhythm stands within their own reach, drawn as lines between lights. That is the first
   time in this project that the opening test placed an opening differently. Times in entries 3-5 were checked against `date -u`
   (one, in `read_sample.py`'s docstring, was first written as 20:00 at 19:53, and this entry's own time as 19:55 at 19:54; both corrected).
6. **19:57 — the page built and looked at; the balance.** `index.html` at 1440 and 390 px: no error, no horizontal overflow; screenshots
   looked at. The coast is drawn by lights alone and the United States is a hole in it (its lights are in another list) — kept, and
   the page says "outside the United States". Dominant: the opening — the page — while the hold (the inverted null) and the home (the
   parser, the reader) are still open beside it, which is what ATP 312 says they are.
   - *Components of passage:* the IALA sentence (list → question); the lateral code (small light → grammar); the leading line (a repeat
     that is itself the signal).
   - *Consolidation triad:* intercalated — the 20 pairs read in words between the numbers; interval — the page leaves out fixed lights
     and the unparsed, and says so; superposed rhythms — the great lights' lines over the small lights' faint ones, two scales not
     unified into one rate.
   - *Sobriety balance:* the page blinks only one chosen pair, never the whole map: the neighbour blinks every light, and doing it
     again would be the copy. Held off for any later session: a table by country, which would rank coasts as if a repeat were a fault.
   - *Opening test, the instrument's own:* one opening placed differently (entry 5: the map of isolation not made; the lines made
     instead). None prevented tonight. (A draft of this entry first claimed a page sentence written and struck; no such sentence was
     ever written, and the claim was removed before commit. Recorded so the instrument is not credited with work it did not do.)
   - *Predictions as registered:* P1 held (42,501 lights; none flagged removed); P2 failed (fixed 11.6 %); P3 failed (commonest key
     `F.R.`, a fixed red light; the commonest rhythmic one `Fl.W.` 5 s); P4 held (26.7 %); P5 failed (great 14.5 %, small 29.0 %);
     P6 failed (R 0.78 great; 0.42 small). **2 of 6.** The reading found no parse error, so no corrected count.
   - *Deviations, all logged:* numpy installed (entry 3); the reader's lookup bug (entry 4); an exploratory analysis beyond the
     registration (entry 5); T1's first version written after the build (`MAP.md`); five times written ahead of the clock tonight
     and corrected (entries 1, 5 and 6, the reader's docstring, `MAP.md`). Without T4, this list is where the deviations live; whether it
     is poorer than a following-journal is the toolkit account's question at close (estimate tonight: no deviation went unlogged that
     T4 would have caught; the clock habit is the same with either).
