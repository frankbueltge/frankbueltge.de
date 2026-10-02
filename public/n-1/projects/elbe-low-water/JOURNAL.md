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
