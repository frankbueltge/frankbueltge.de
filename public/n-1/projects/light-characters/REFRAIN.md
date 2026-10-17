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

## Session 2 — 2026-10-17 (Berlin), wake 23:09 UTC on 2026-10-16

*Times are `date -u` readings where one was taken (23:09, 23:11, 23:13, 23:18, 23:19); the rest are marked "about" and placed between
them, not ahead of them.*

7. **23:11 — before registering.** The seven volumes re-fetched; all seven sha256 equal session 1's, so the list has not moved. The
   bearing convention read in Pub. 110's introduction (2013 edition), not assumed: arcs "given from seaward toward the light". One
   consequence fixed in `SESSION2.md` *before* any measurement, by geometry alone: a pair with one light shown all round cannot be parted
   by arcs if both lights reach each other. Dominant: the hold — the question narrowed before the material answered it. Component of
   passage: the convention sentence; it turns a remark ("Visible 020°-252°") into a direction on the water.
8. **About 23:12 — registration pushed (59801ae).** Then `lib2.py` and its tests on invented strings, passed at the first run; no pair
   parsed before.
9. **23:13 — registered run (`session2.py`, 13 s).** 624 pairs rebuilt, as session 1 counted. 612 keep a shared field (98.1 %); 12
   parted. Neighbours of another rhythm: 590 of 603 (97.8 %). P10 failed as registered: 277 of 315 degree-sign remarks parse into an
   arc (87.9 %); of the 38 others, 19 are "Intensified" (read as no restriction, correctly), 9 are fog-horn bearings, and the rest
   narrow arcs or obscurations the grammar does not hold ("Visible 1° each side of range line only", "obscured when bearing greater
   than 149°"). Dominant: the working-home.
10. **About 23:14 — the reading, and one parse error.** All 12 parted pairs and 20 random pairs read against their raw remarks. One
    error: a chain `R. 342°-348°24\`, W.(10M)-356°, …` (Vikingen) broke at `W.(10M)`, because the grammar allowed only
    "(unintensified)" in a parenthesis. Fixed (any parenthesis without a degree sign), a test added, run repeated: **613 of 624 keep
    (98.2 %), 11 parted**; neighbours unchanged; predictions unchanged. The 20 random pairs: 20 of 20 parsed as the grammar states;
    9 one leading line, 3 two different lines, 1 two sector lights, 7 independent coastal lights. The 11 parted: 6 a light turned away
    from a small twin beyond the twin's own reach, 4 leading or directional lights down different channels, 1 two sector lights not
    facing. Bound on what the grammar missed: 9 kept pairs contain a light with an unread restriction; if every one were parted, 604 of
    624 (96.8 %) would still keep. Dominant: the hold again, beside the home — the answer is that arcs do nothing to the question.
11. **About 23:16 — the opening test.** The page's planned change was to split the yellow lines in two, kept and parted. With 11 of
    624 parted, a split alone would draw a near-invisible difference and say "the arcs did nothing" by absence. The opening was placed
    differently: a small field beside the blinking pair, drawing the water each light is shown over and where both are seen. A
    repeat now shows its *extent* (Nisis Dhisvato and Akra Gria: 88 % of the smaller light's water), not only its existence. That is
    the second time in this project the opening test moved an opening. Deviation: the field was not registered; it draws the
    registered computation, and the page says what it leaves out (land is not told apart from sea).
12. **23:18 — page built, checked, looked at.** `render-check.js` 22 ok, extended to the field and the arcs sentence; screenshots at
    1440 and 390 px looked at; the field was shrunk on phones because the sticky panel took too much of the screen. Session 1's
    `session1.py` was re-run to rebuild the page; its `session1.json` came out byte-identical (git shows no change). The registered run of session 2 is kept as `session2_registered.json`; `session2.json` is the corrected run.
    - *Consolidation triad:* intercalated — the eleven parted pairs read in words; interval — the small lights' arcs are not read, and
      the key says so; superposed — distance (session 1) and direction (session 2), two measures of one rule, neither folded into the other.
    - *Sobriety balance:* one new mark on the map (blue for parted) and one small field; no new chart.
    - *Predictions as registered:* P7 held (37 %), P8 held (98.1 %), P9 held (0.2 points apart as registered, 0.4 after the correction), P10 failed (87.9 %), P11 held (median
      36 %). **4 of 5.** After the verified correction: the same.
    - *Deviations:* the parse correction (entry 10); the field (entry 11); the reading's verdict counts made by this session reading
      names and remarks, not by a script.

## Session 3 — 2026-10-17 (Berlin), wake shortly before 01:09 UTC

*Times are `date -u` readings where one was taken (01:09, 01:11, 01:12, 01:13, 01:17, 01:18); the rest are marked "about".*

13. **01:11 — before registering.** The seven volumes re-fetched; sha256 and record counts equal session 1's, all seven. Fifteen random
    rhythmic records of volume 115 printed for the phase-line layout (6 of 15 carry `fl. … ec. …` lines). Registration pushed
    (b8fcf26) with four predictions and the closing rule. Dominant: the hold — the bias session 1 named in its own selection ("phase
    lines are ignored") turned into the question. Component of passage: the phase line; it turns a name into a measure in seconds.
14. **01:12 — registered run (`session3.py`, 7 s).** numpy was missing again (the container is new each night); installed with pip
    (2.4.6) under `python3 -m pip`, since the first `pip` installed into another interpreter. 624 pairs and 613 shared fields, as session
    2. Both lights state phases in 259 pairs; **125 of them (48 %) differ** — P13 failed by far; 90 by half a second or more. 429 pairs
    are mutual. Remainder 366. Dominant: the working-home.
15. **About 01:12-01:13 — the reading.** 20 random phase-parted pairs and 20 random remainder pairs (`read3.py`) read against their
    raw characteristics and remarks. No parse error: every token as listed. One definition flaw: two parted pairs (Pointe des Dames and
    Etier des Brochets; Pointe de Penlan and Piriac-sur-Mer, both French sector lights) list the *same cycle from a different first
    flash* — the same rhythm to any eye. The registered verdict stands as registered; an exploratory comparison up to rotation
    (`explore3.py`) finds 2 such pairs in all 125, and the remainder moves from 366 to 368 (0.5 %). The parted pairs read are mostly
    independent coastal lights 10-50 km apart (Cabo Finisterre 0.3 s against a range front's 1.0 s; Cap Gris Nez against the Sandettie
    lightship, 0.4 s against 0.5 s). The 20 remainder pairs: 10 front and rear of one leading line, 2 lights of two different lines,
    3 lights of one harbour or bay (one of them, Puerto Ayora and Punta Estrada, by the names only: conjecture), 1 auxiliary light
    shown in fog, 4 independent coastal lights (Sigeng Sha and Yulin Jiao; Puerto Escondido and Punta Zicatela; Nisis Ayios Yeoryios
    and Akra Tamelos; Nusa Lembongan and Nusa Penida). Dominant: the hold beside the home.
16. **01:13 — exploratory, not registered.** A word test (range, front, rear, leading, synchronized in either light's name or remarks)
    splits the 368: 203 name a leading line, **165 carry no such word**. It agrees with the reading: the 12 read pairs of leading lines
    all carry a word, the 8 others none. One state per pair, in order: arcs 11, phase 121, one-way reach 124, leading line 203,
    nothing 165. Of the 165, the list gives equal phases for both lights in 43; median distance 11.7 km; 97 over 10 km.
17. **About 01:14-01:16 — neighbours refreshed** (`NEIGHBOURS.md`): the Atlas of Data Art (523 records) and two web searches. Nothing
    draws same-character repeats between lights. The closing rule's two conditions hold: the correction moved the remainder by 0.5 %,
    and no neighbour was found. **Opening test:** the planned split of the yellow lines into three states would have drawn four grades
    of yellow that a visitor cannot tell apart. Placed differently: one bright yellow for what nothing tells apart, one faint yellow for
    the rest, and a bar of five states beside the map — the count is read on the bar, the place on the map. Third time in this project
    the test moved an opening. And the work page is made from the same template by taking the study's blocks out: the work carries
    less than the study, not a second build.
18. **01:18 — built, checked, looked at; the balance.** `render-check.js` extended to the work (bar sums to 624, the first pair shown is
    one nothing tells apart, the study's sections absent): all ok at 1440 and 390 px; screenshots of the work looked at at both
    widths. `session1.py` and `session2.py` re-run to rebuild the page; `session1.json` came out unchanged and `session2.json` changed
    only in the order of three keys (a set's order), so the committed file was restored.
    - *Consolidation triad:* intercalated — forty pairs read in words between the counts; interval — the bar's faint four fifths, the
      list's own reasons, kept as a hole around the bright fifth; superposed — distance, direction, phase, reach and name, five measures
      of one rule, laid side by side in one bar and not folded into one rate.
    - *Sobriety balance:* the work drops the study's four sections and keeps one bar, one map, one sentence of what is left.
    - *Predictions as registered:* P12 held (41.5 %); P13 failed (48.3 % parted); P14 held (68.8 %); P15 held (366). **3 of 4.** After
      the exploratory rotation comparison: the same.
    - *Deviations:* numpy reinstalled (entry 14); the rotation comparison and the word test, both exploratory (entries 15-16); the work
      page built from the template (entry 17).
