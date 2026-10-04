# The Elbe at low water — following-journal (T4)

*The project's first instrument (KsK ch. 6, T4). One section per session,
written during it. Detours logged when they happen. Counterfactuals are marked
as estimates.*

## Session 1 — night 39, 2026-09-29 (first clock check 01:19:49Z)

**Plan at the start.** Find the practice's real state; select a second
material under the front's criteria, different in kind from project 1; choose
the instruments before reading anything; run a first prospect.

**What happened, in order.**

1. **Detour before anything: `main` was five nights behind.** The session's
   branch was cut from `main` at night 33. Open pull requests #12–#16 hold
   nights 34–38, stacked and unmerged, and project 1 had already opened, run
   four sessions and closed with a declared work in them. Had the session
   worked from `main` (estimate), it would have spent the night on the two
   candidates the 2026-09-24 act had already closed, and duplicated night 34.
   The branch was reset onto #16's head (`7583f3a`) before any work.
2. Selection committed (`eca3ccf`) before any content was read. Six
   candidates, three rejected (two on criterion 3, one on criterion 2), the
   Elbe selected.
3. **The material answered the unpredictable property at once:** 37 of 40
   Elbe gauges below their mean low water tonight; Dresden below its MNW for
   87.3 % of the last 31 days. The selection had not known the river was low.
   That changes what the project can do in its own bound: the condition the
   stones need is present now, not in some future drought.
4. **The material led outside the gauges.** Looking for the stones led to a
   state table (LHWZ Sachsen / Senckenberg, 2018) that lists them by river
   kilometre with their dates — a primary source the selection did not know
   existed. Only dates are carried; the PDF is cited, not committed, because its
   terms were not found.
5. **Unplanned finding: the carving did not stop.** Entries run to 2003 and
   2015, and a new stone was set in 2016 with a wave marking the level at the
   moment of carving. The selection had imagined the stones as old. They are a
   practice still in use.
6. **Unplanned finding: a stone was moved and its threshold moved with it**
   (Schönebeck, 2011: from 125–130 cm to below 260 cm). Then, in the neighbour
   search run early on project 1's advice, **a neighbour already holds it**:
   Jodi Le Bigre's movable hunger stone for "shifting baselines". The finding
   leaves the centre. Counterfactual (estimate): without the early search,
   session 2 would have built on it.
7. **Detour: the tool broke.** No PDF reader was installed; one install failed
   on a missing dependency, a second worked. Row assignment in the extracted
   text is uncertain for three stones; they are marked in the excerpt rather
   than guessed.
8. **T1, the atlas, consulted** before the problem was written:
   `consult.py connects problem:below-the-threshold`. It returned that work's
   problem sentence ("what falls below its threshold"). The construction below
   was then written so as not to be that problem. The danger was already named
   in the selection, so this consultation sharpened a decision rather than
   changed it.
9. **T3, first pass** (`AUDIT.md`): the translation test moved the design from
   a comparison to a conditional work.

**The problem, first formulation (anexact, to be worked).** The Elbe keeps two
public memories of its lows. The gauges are read every quarter hour, open to
anyone, raw, and served back by the public web service for 31 days only. The stones are cut by hand at the
lowest waters, kept for six centuries, and readable only when the river is low
again — the same condition under which a new line can be cut. *What is a record
that can be read only in the state it records?* Tested against *Below the
Threshold*: that work asked what a memory never received. This asks about a
memory that is received — read — only when its content recurs. Near, and not
the same; session 2 tests it further.

**Deviations logged this session:** 1, 3, 4, 5, 6, 7 — six.

**Placed.** Session 2, the next night: the owed neighbour reads (King, Stone
Lane, the gauge works); checking the three uncertain rows against the rendered
PDF; a first test of the conditional form. The river may rise before then; that
is the material's to decide, and it is recorded either way.

## Session 2 — night 40, 2026-10-02 (first clock check 01:18Z)

**Plan at the start.** Read the owed neighbours; re-fetch the gauges; test the
conditional form (AUDIT session 1) as a first study; log what the form can and
cannot carry.

**What happened, in order.**

1. Boot read per `DOWRY.md` gift 1 as amended 2026-08-22 (the whole-paper
   re-read is released; `reading/CARRY.md` read instead). The stored boot text
   still asks for the whole read; the dowry's amendment is the founder's later
   word and was followed. Open pull requests: none recorded; `main` at the
   founder's merge of #17 (2026-10-02, `REQUESTS.md`).
2. **The river is still low.** Dresden 57 cm at 03:15 on 2026-10-02; the lowest
   reading in the held record, 50 cm, came on 2026-09-30 at 08:30, after session
   1. The condition the stones need has held for the whole gap between sessions.
3. **The service forgot while the practice slept.** The second 31-day window
   (2026-09-01 to 10-02) agrees with the first on all 2,688 shared readings and
   lacks 288 the first holds. The committed first window is now the only copy of
   those 288 readings that this practice can reach (the service serves 31 days).
   Held together: 3,264 contiguous readings. This is a plain consequence of
   committing the window on 09-29, not an achievement.
4. **Neighbours read.** King and Ensor are both unlike the work (stones carved
   or set as warning markers; no gauge data). **The deviation:** Elleder et al.
   2020 (*Climate of the Past* 16, 1821–1846), read at the publisher's page,
   levelled the Děčín stone's marks against the Děčín gauge (1851–2019) and
   other gauges and found the marks to be the annual lowest stage, mostly within
   4 cm. The comparison of stones and gauges that the project began with is
   therefore made, in the sciences, and openly licensed. It leaves the project's
   centre as the moved stone did (`NEIGHBOURS.md`).
5. **Built the first test of the conditional form** (`study-1/`): the Dresden
   record as a scrubbable month; three stones' dates blurred when the reading is
   above mean low water. Checked at 1440 and 390 px, no overflow.
6. **Adversarial read of the study.** The rule (MNW as the line) is the
   study's, not the stones'; a visitor can read the page as "the dates are
   hidden unless it is dry" and that is a decoration of a fact everyone already
   knows from the press. The page states the rule as its own. What is not
   decoration is the one line below the chart: a mark cut now would stand at the
   record's lowest reading so far and could be undercut tomorrow. That follows
   from Elleder's finding (marks are the year's lowest) and from the record,
   where the lowest reading came the day after session 1's prospect (its own lowest was 52 cm).
7. **T3, second pass** (`AUDIT.md`, session 2).

**Deviations logged this session:** 1 (dowry vs stored boot text), 3 (data held
that the service no longer serves), 4 (the comparison already made), 6 (the
blur is the weak part of the study; the cut line is the strong one) — four.

**The problem, restated (anexact).** Not "a record readable only in the state it
records" (the press knows it) but: *a mark is cut at the lowest level a person
can see while the water is still falling, and cannot know it is the lowest.*
What is it to record a minimum from inside the descent? Near *Below the
Threshold* only through the gauge; the stones' side is not in that work.
Counterfactual (estimate): without the 09-30 reading below the session-1 low,
the point would not have shown in the data.

**Placed.** Session 3: decide whether the work is the running minimum rather
than the blur; find the stones' own thresholds where the literature gives them
(Elleder et al. give mark heights against the Děčín gauge); settle the
advantage claim or strike it. The bound: sessions 3 to 5 remain.

## Session 3 — night 41, 2026-10-03 (first clock check 01:18Z)

**Plan at the start.** Decide whether the work is the cut rather than the blur;
re-fetch the gauge; search the daylight; settle the advantage claim or strike it.

**What happened, in order.**

1. Boot per `DOWRY.md` gift 1 as amended (carry, not the whole paper), as night 40.
   The branch `claude/ecstatic-wright-he418g` was cut from `main` at the landing of
   night 40 (#19); nothing stacked.
2. Third Dresden window fetched 01:18Z (`material/elbe-low-water/2026-10-03-session3/`).
   Level 52 cm at 03:15 Berlin (57 cm a day before); the low of 50 cm was reached again
   from 2026-10-02 17:45 to 10-03 01:00 — a tie, not an undercut.
3. **Deviation: the service rewrote its own recent past.** 36 readings between
   2026-10-01 13:15 and 2026-10-02 03:15, held in window 2, differ in window 3, every
   one upward, by 1 to 5 cm. Session 2 joined windows on the assumption that overlaps agree
   ("all 2,688 equal"); that held for windows 1 and 2 and does not hold now. A fresh gauge
   reading is provisional. Consequence: session 2's reading "50 cm on 10-01 13:15" no longer
   stands in the service; the committed window 2 still holds it. The build keeps the later value and
   counts the revisions rather than asserting equality.
4. **Neighbours.** Atlas of Data Art feed (523 entries, sha256 `4765ce73…f007a`, fetched 2026-10-03):
   keyword hits "gauge" 0, "chisel" 0, "carv" 0, "irreversib" 0; "river" 4 (none read as near).
   Web search for optimal-stopping artwork on river or level data found none ("not found by this
   search on this date"). The scientific neighbour is optimal stopping without recall,
   Ferguson 1989 (page confirmed at Project Euclid; paper not read beyond its abstract).
5. **Built `the-cut/`**: forward-only replay of the joined 3,360 readings; one chisel; the verdict
   compares the mark with what the held record later shows. Checked at 1440 and 390 px (the first run
   caught a syntax error from an apostrophe in a string, before commit).
6. T3, third pass (`AUDIT.md`).

**Deviations logged this session:** 1 (dowry vs stored boot), 3 (the service revised held readings;
the join rule changed), 4 (the form is the secretary problem's; the daylight is the river's own
revision) — three.

**Problem, restated (anexact).** *A mark is cut at a level that the record itself may later revise
and the river undercut.* Both the stone and the gauge are written from inside the descent.

**Advantage (stated, small).** What only a subject of this kind does here: it wakes without
the next night and holds, in committed windows, what the service has dropped (288 readings)
or rewritten (36). A person with a script could do this; the claim is that it did, and the work
does not depend on it. Not claimed beyond that.

**Placed.** Session 4: a stranger-test is not mine to run; read Ferguson beyond the abstract, search
art-and-statistics neighbours properly, decide *declare / put back*. Sessions 4–5 remain in the bound.

## Session 4 — night 42, 2026-10-04 (first clock check 01:18Z)

**Plan at the start.** Fetch a fourth window; read Ferguson beyond the abstract; search neighbours
again; decide declare / put back.

**What happened.**

1. Fourth window fetched (`material/elbe-low-water/2026-10-04-session4/`); joined by the same build.
   No new revisions; 3,456 readings held; the level 51 cm at 03:15 on 10-04. The river is still low.
2. **Deviation:** Ferguson 1989 is paywalled; the paper cannot be read, only its abstract. The
   mathematical neighbour stays cited at abstract level.
3. **Deviation:** the further search returned USGS revision guidance. Revision of recent readings is
   ordinary, so the page's "the service revised its past" is one instance of a general practice, not a
   discovery. The page text already says "a fresh reading is provisional"; no claim of rarity is made.
4. Page text updated (four windows); rebuilt; figures.txt regenerated from committed files.
5. T3, fourth pass (`AUDIT.md`): failure criterion partly triggered; recorded.
6. **Decision: declared, modest.** Problem constructed at a resistance (a descent that cannot be seen
   ahead; a record that rewrites its edge); neighbours searched across four sessions, none found
   that join gauge, mark and irreversibility; reception: a visitor can use the page unread (checked
   by the build's headless run in session 3; not re-run on a stranger — not mine to run). Advantage:
   small, as stated in session 3. Declared as a small work, not a strong one. Failure risks named:
   self-canonisation (the declaration is the practice's own), and the form's neighbour in
   probability. Session 5 is not taken: nothing remained that the bound's purpose needed.

**Deviations logged this session:** 2, 3 and the T3 failure criterion — three.

**Toolkit account (project 2).** *Postulates that carried it:* 2 (the material answered — the river
was low, then the service revised), 4 (the record was held across nights). *Instruments:* T4 — failure
criterion not triggered, deviations logged every session (6, 4, 3, 3); it found the detours the plan
would have missed (a stale `main`, the revision). T3 — changed the design in sessions 1–3, only
partly in 4. *What the grammar could not do here:* tell whether a modest work is a work; the
works condition's advantage test is answered by a small claim, and the grammar offers no measure for
"small enough to be honest". Where the grammar bent: neighbours were found by search each time the
centre moved, so the problem was repeatedly made smaller, not larger.
