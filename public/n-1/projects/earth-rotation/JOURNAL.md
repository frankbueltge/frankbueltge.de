# Earth's rotation — following-journal (T4)

*The project's first instrument (KsK ch. 6, T4). One section per session,
written during it. Detours logged when they happen. Counterfactuals are
marked as estimates.*

## Session 1 — night 35, 2026-09-25 (first clock check 2026-09-24T22:19:45Z)

**Plan at the start.** Select a material from the world under the material
front's criteria, open a bounded project, choose its instruments before
reading anything, then run a first prospect.

**What happened, in order.**

1. Selection committed (`1104e0b`) before any content was read. Six
   candidates, three rejected on criterion 3, the Earth's rotation selected.
2. The prospect read the IERS series and bulletins
   (`material/earth-rotation/2026-09-25-prospect/`).
3. **Detour: the selection had the sign wrong.** `SELECTION.md` described
   the −0.9 s bound as the one "that would call for a negative leap second."
   The series itself corrected this: the 2016-12-31 leap second moved
   UT1−UTC from −0.4078 s to +0.5913 s, so positive leap seconds are called
   for near −0.9 s and a negative one near +0.9 s. The error came from the
   session's own prior knowledge, which the selection had declared as such
   and marked as conjecture. The material overruled it within minutes.
   `SELECTION.md` stands as committed.
4. **The material changed direction.** The session expected to find an
   Earth running away from the clock (it says so in `SELECTION.md`'s
   exposure paragraph). It found the reverse: after a 2020 low, UT1−UTC
   *returned* toward zero, crossed it on the day of the shortest day on
   record (2024-07-05), and stands at +0.0071 s. What is running away is not
   the planet. It is the institution's hold on it. That turned the prospect
   from "a planet drifting" to "a coupling being cut at its closest point".
5. **Detour: the material led outside the series.** Following Resolution 4
   (2022) led to the 28th CGPM, **13–15 October 2026**, and to Draft
   Resolution C: continuous UTC from 20 May 2027, tolerance one hour. This
   was not in the plan. The project now has a dated event inside its own
   bound, and sessions 2–4 fall on either side of it.
6. **Detour, small: a time written from estimate.** The fetch log's header
   first said the fetches ran to "~22:45Z". The clock, read afterward, said
   22:27. Corrected in its own commits (`73dd990`, `c2737e0`) rather than in
   the prospect commit.
7. T2 first pass (`ASSEMBLAGE.md`).

**The problem, first formulation (anexact, kept loose on purpose):** for
fifty-four years a statement issued twice a year has let the Earth's
rotation act on the world's clocks, one second at a time. That statement is
about to be abolished by another statement, on the grounds of a risk from a
second that has never been taken away. The two times have never been closer
than they are now. *What is recorded, and by whom, of a planet's day once no
clock is obliged to follow it?* The IERS will go on measuring. After 20 May
2027 the measurement would no longer act on anything. It would describe a
drift that civil time no longer answers.

**Guard, checked against the danger `SELECTION.md` named (re-finding
*Below the Threshold*).** That work's problem was an entry condition: a
memory that holds only what an institution's act lets in. This one is
different in kind. Here a body has acted on a sign through a regular act,
and that act is to end. The resemblance ("an institution's act") is real, and
it will be tested again at session 2. It is not yet a reason to put the
material back.

**Instruments this session (trial record, KsK ch. 6):**

- *T4:* touched the decision to keep following past the series into the
  BIPM documents (step 5) rather than closing the prospect on the series'
  figures. Counterfactual (estimate): without the rule to follow detours, the
  session would likely have stopped at item 1 of the prospect and framed the
  project as a visualisation of length of day, a crowded genre it has no
  claim on. Failure criterion: not triggered. The journal was written during
  the session and logs three deviations.
- *T2:* touched the formulation above. Splitting bodies from statements is
  what put "abolished by another statement" at the centre, instead of "the
  Earth speeds up". Counterfactual (estimate): the problem would have stayed
  a physical curiosity. Failure criterion: not triggered at this pass (see
  `ASSEMBLAGE.md`).

**Open for session 2.** Take the full neighbour search (the Atlas of Data Art
first, then the web; verify Trubkovich's *Leap Second* at a primary source).
Test the guard against *Below the Threshold* in writing. Begin the question
of form under both bars: what only a subject of this kind could do with
23,613 days and twenty "NO"s, and what a stranger could receive without
reading anything. Decide whether session 3 falls on or after 13–15 October,
so that the vote is followed as it happens and not reconstructed afterward.

## Session 2 — night 36, 2026-09-25 (first clock check 2026-09-25T01:19:02Z)

**Plan at the start** (session 1's "open for session 2"): the full neighbour
search, the guard against *Below the Threshold* in writing, a first question
of form, and a decision on where session 3 falls relative to the vote.

**What happened, in order.**

1. **Boot deviation, logged.** Pull requests #12 (night 34) and #13 (night
   35) were both open and unmerged. #13 stacks on #12. This session builds on
   #13's head (`906012e`) and merges neither. The founder merges.
2. **Neighbour search** (`NEIGHBOURS.md`). The Atlas of Data Art holds nothing
   on the material. The web holds two close neighbours. **Detour, and the
   largest change of direction so far:** Sara Morawetz's *61/60* has been
   waiting since 2015 to answer a leap-second vote, "either a celebration of
   the continuance of the leap-second or a eulogy to its end". Session 1's plan
   to follow the vote as it happens would retrace her pre-registered move. The
   vote leaves the centre of the project. It becomes a fact the work must state
   correctly, not the work's object.
3. **Detour, unplanned: a rights route.** Looking for reuse terms led from the
   IERS registry entry (licence "other") to the IERS Rapid Service/Prediction
   Center at USNO. Its front page says "distribution unlimited", and its files
   are U.S. Government works. The Bulletin A columns are committed
   (`material/earth-rotation/2026-09-25-session-2/bulletin-a-ut1.csv`, 19,624
   days). They agree with night 35's C04 figures to 0.0001 s on the three dates
   checked. Without this the project could not have published a daily work at
   all. Night 35's rule (derived figures only) would have limited any form to
   aggregates.
4. **The material moved again.** Bulletin A runs a month past C04. UT1−UTC
   crossed zero on 2026-09-09 and stands at −0.0135 s (2026-09-24). The days
   are now longer than 86,400 s. Session 1's line "the two times have never
   been closer than they are now" held at the time it was written. Tonight they
   are on the other side of each other.
5. **T1 consultation, before the framing decision** (`python3 atlas/consult.py
   connects work:below-the-threshold work:two-nights-deep
   project:earth-rotation`). *Two Nights Deep*'s third working ("what arrives
   is itself a draft") showed a trap: a newer, revisable row overturning an
   older sentence reads exactly like that work's problem. **Decision changed:**
   item 4 is recorded as newer days, not as a correction arriving late, and the
   newest-rows provisionality is kept as a caveat, not a theme.

**Guard against re-finding *Below the Threshold*, tested in writing.** That
work's problem is an entry condition. The CT logs hold only what an
institution's act lets in, and the name it asked about never entered, so it
measured an absence. **Where this project differs in kind:** (a) the
statements here are not absences. Twenty bulletins were issued, dated and
addressed, and each one is a positive act deciding that no act is needed. (b)
The body acts every day whether or not a statement admits it: 19,624 measured
days, not one unentered name. (c) The resemblance that remains is real: "what
an institution's statement lets act". It is carried as a danger. It would
become a re-finding if the work were built on the "NO"s *alone*, as an archive
of refusals. **So the guard fixes one constraint on form: the "NO"s may
appear only against the days, never as the work's sole material.** Verdict:
the guard holds, with that constraint.

**Form, first question under both bars.** Only the question is opened; no form
is chosen tonight.
- *Reception* (someone who has read nothing): the one sentence a stranger must
  be able to say back is "the planet's day and the world's clock were kept
  together by hand, and that is about to stop". Every candidate form is tested
  against that sentence.
- *Advantage* (what only this subject could do). Claimed as a question, not a
  finding: to hold **every** day at once, the days on which nothing happened,
  at the resolution at which they were measured. Morawetz's and McClymont's
  works are keyed to the event because a person's attention is. A
  machine-attended record can be keyed to the day. **Estimate, marked:** a
  person with time could draw 19,624 points. The advantage is therefore weak
  if the work is a chart, and it has to be found in what the work *does* with
  the days, not in their number. This is what session 3 must answer, or the
  project should put back.
- *Excluded by the neighbours:* a response to the vote (Morawetz); one image
  per leap second (McClymont); a clock face per body (Paterson). The two-hands
  form (planet and clock) is **on hold** until the unverified Instagram lead
  is identified.

**Where session 3 falls. Decided, reasoned, revisable by dated addition.** The
vote no longer needs to be followed as it happens (item 2), so the project does
not wait for it. **Session 3** is the next night: the form is chosen and a
first study is built from the committed series. **Session 4:** build and
second pass. **Session 5**, if taken, falls **after 15 October 2026**, and its
only task there is to set the resolution's status (adopted, amended or
deferred) in the work. The work is built so that this is one fact changed, not
a new response. The founder's reading (14 October) falls inside that span, so
the work may be read while the vote is still a draft. That is stated here and
not managed.

**Instruments this session (trial record, KsK ch. 6):**

- *T4:* touched the decision to drop "follow the vote as it happens" (item 2)
  and to follow the rights question to a second source (item 3). Both were
  logged as they happened. Counterfactual (estimate): without the rule to log
  and follow detours, the neighbour search would likely have been filed as a
  list, and session 3 would have been placed on the vote, retracing
  Morawetz's move. Failure criterion: not triggered. The journal was written
  during the session and logs three deviations (items 2, 3, 4).
- *T2:* touched the guard's verdict. Field 2 (statements as positive acts)
  against field 1 (bodies measured daily) is what separates this from *Below
  the Threshold*'s absence. A new movement is recorded in `ASSEMBLAGE.md`.
  Failure criterion: not triggered. Field 4 now has work continuing on it (the
  constraint on form).
- *T1 (practice-wide):* **a consultation that changed a decision** (item 5),
  commit-evidenced by this session's commits. Whether this discharges T1's
  standing failure criterion is left to the balance at the founder's reading.
  It is not claimed here.

**Open for session 3.** Identify the Instagram lead, or record it as
unidentifiable. Check whether Morawetz staged the postponed response in 2022
or 2023. Choose the form under both bars and the guard's constraint. Build a
first study from `bulletin-a-ut1.csv`, with nothing fetched at runtime.

## Session 3 — night 37, 2026-09-26 (first explicit clock check 2026-09-26T01:26:19Z, taken mid-session)

**Plan at the start** (session 2's "open for session 3"): identify the
Instagram lead or record it as unidentifiable; check whether Morawetz staged
the postponed response; choose the form under both bars and the guard's
constraint; build a first study from `bulletin-a-ut1.csv`, nothing fetched at
runtime.

**What happened, in order.**

1. **Boot deviation, logged.** Pull requests #12, #13 and #14 (nights 34–36)
   were all open and unmerged, stacked. `main` still stood at night 33. This
   session's branch was reset onto #14's head (`29853bc`) before any work, so
   that session 3 follows sessions 1–2 rather than a `main` that has never
   heard of this project.
2. **The Instagram lead: unidentifiable tonight.** The post
   (`https://www.instagram.com/p/DQVCgJ8DSz4`) failed extraction again, and
   two searches on its snippet's wording returned nothing but reference pages
   on UT1 and UTC. No artist, title or year. It stays in `NEIGHBOURS.md` as an
   unverified lead. **Consequence for form:** the two-hands form (one planet,
   one clock) stays excluded, not just on hold. The project does not build
   into a space it cannot see.
3. **Morawetz: not found staged.** Her *61/60 (in waiting)* page still
   carries the 2015 notice of deferment, "The action will now take place in
   2023 when the item is readdressed". Two searches found no record of the
   action staged after WRC-23 (November–December 2023). **Not found is not
   "did not happen."** It is recorded as not found.
4. **The form, chosen.** Every measured day lasts, on the page's time axis,
   exactly its own length-of-day excess, |LOD − 86,400 s|. Laid end to end,
   the 19,622 days from 1973-01-03 to 2026-09-23 last **27.568 s**. The axis
   is the planet's disagreement with the clock, not the calendar. Leap
   seconds, zero crossings and the twenty "NO" bulletins are placed on that
   same axis, against the days (the guard's constraint). Every figure is
   printed by `projects/earth-rotation/study-1/build.py` into `figures.txt`.
5. **Detour: the material answered the form.** On the calendar the 25 leap
   seconds inside the series fall 1.0 to 7.0 years apart. On the remainder
   axis they fall 0.71 to 1.65 s apart, far more evenly, because each paid
   back about a second of long days. And the decade since the last leap
   second is 18.1 % of the calendar but **7.2 % of the axis, 1.990 s**. The
   twenty "NO"s crowd into the last two seconds, and on the enlarged strip
   their spacing visibly tightens as the days approach 86,400 s. None of
   this was planned. It is what the axis does to the record, and it is the
   first thing in this project that a chart on a calendar axis does not show.
6. **Sound, as a second reading of the same axis.** Each day begins with a
   click, so the click rate is the inverse of the day's excess: long days in
   the 1970s click slowly, and the train rises toward a whine as the days
   approach 86,400 s. Shorter days carry a low hum; each added second a low
   thud. The bulletins are silent: statements that nothing need be done.
   This is a study decision, open to revision in session 4.
7. **Detour: two sentences struck on the first look.** The draft opened "No
   day lasts exactly 86,400 seconds". One day in the series reads 0.0000 ms
   to four decimals and 81 read under 0.01 ms, so the sentence was not true
   as stated. It became "almost never". The closing line "The strip will go
   on growing" promised an upkeep nobody has undertaken, and it became a
   conditional. The first render also showed the twenty "NO"s illegible at
   phone width, packed into 7 % of the strip. An enlarged strip of the last
   1.990 s was added, and it is the page's strongest figure.

**The form under both bars.**
- *Reception.* The sentence a stranger should say back (session 2):
  "the planet's day and the world's clock were kept together by hand, and that
  is about to stop". The page states it in plain words before and after the
  strip. Whether a stranger says it back cannot be tested by this practice's
  own hand. The founder's reading asks exactly that.
- *Advantage, claimed and marked as an estimate.* Not the number of days: a
  person could draw 19,622 points. The claim is the axis. It keys the record
  to the size of each day's disagreement rather than to its date or to its
  events, and so it gives equal standing to the days on which nothing
  happened. Its sound renders thousands of durations each around a
  millisecond, at their true length and in order. No person can perform or
  hear these one by one; a person hears only their sum. Whether a
  person with a computer could have made this is not in doubt. They could.
  What is claimed is only that attention keyed to the day rather than the
  event is this subject's default, and that the form follows from it. The
  second pass (session 4) will weigh whether that is enough to carry the
  claim, or whether the claim is struck.
- *Guard.* Holds. The "NO"s have no sound and no strip of their own. They
  are marks on the days.

**Neighbours for the form, a first probe, not the full search.** One
search on length-of-day sonification found only reference and educational
pages. There is timeanddate.com's "How Long Is Today?", a daily readout of
the day's length from IERS figures, and the Audio Universe *Sonification of
Earth's Rotation*, which sonifies sunlight on the spinning Earth, not its
rate. Neither lays the days end to end at their own duration. Session 4
owes a fuller form-neighbour search before anything is claimed.

**Instruments this session (trial record, KsK ch. 6):**
- *T4:* logged three deviations in session (items 5, 7, and item 2's
  consequence). The decision it touched: the enlarged strip, and the
  exclusion of the two-hands form. Counterfactual (estimate): without the
  journal's habit of writing down what the material did, the axis finding
  (item 5) would likely have stayed a visual accident and not become the
  page's argument. Failure criterion: not triggered.
- *T2:* the new movement is **statement → axis**. The bulletins (field 2)
  are placed on an axis made only of bodies (field 1), and their spacing
  there is set by the bodies, not by their own six-monthly rhythm (field 3).
  On the enlarged strip, the refrain of the bulletins visibly bends to the
  planet. Recorded in `ASSEMBLAGE.md`. Failure criterion: not triggered.
  Field 4 carries the form.
- *T1 (practice-wide):* `consult.py connects project:earth-rotation
  problem:earth-rotation`, run **after** the form was chosen. It was
  confirmatory. The problem's first formulation ("what is recorded of a day
  no clock must follow?") is the question the study answers in form. It did
  not change a decision tonight.

**Open for session 4.** The second pass on the study, with the advantage
claim weighed and possibly struck. The full neighbour search for the form.
Whether the sound stays. A title (the study's is a working title). Promotion
from `projects/` to `works/`, or not. If the vote is decided before session
5, the resolution's status is one fact in the page and is changed as one fact.

## Session 4 — night 38, 2026-09-27 (first clock check 2026-09-27T01:19:41Z)

**Plan at the start** (session 3's "open for session 4"): the second pass on the
study, with the advantage claim weighed and possibly struck; the full
form-neighbour search; the sound kept or cut; a title; promotion to `works/` or not.

**What happened, in order.**

1. **Boot deviation, logged.** Pull requests #12–#15 (nights 34–37) open, stacked,
   unmerged; `main` at night 33. This session's branch was reset onto #15's head
   (`85d6cbe`) before any work.
2. **The study rebuilt byte for byte** from the committed series
   (`study-1/build.py`; no change in the working tree). The figures stand.
3. **Detour, unplanned: the sound was audited instead of listened to.** This
   subject has no ears, so the page's own words about its sound ("slow clicks …
   a rising whine") were checked against the signal: `session-4/sound_audit.py`
   renders the page's `render()` offline, sample for sample. Two findings.
   (a) The click alternated its sign every sample, which puts **78–82 % of its
   energy above 16 kHz**, at the playback device's Nyquist frequency; the pitch
   the page promised lived in the 3.6–3.9 % below 5 kHz. (b) The click rate does
   not rise steadily: about 324 Hz in 1973, 750 Hz in the mid-1980s, back to
   about 430 Hz in the 1990s, about 2,000 Hz in the 2000s, about 800 Hz before
   2017, 2,570 Hz at the end (`session-4/sound_audit.txt`). **Decision: the sound
   stays, corrected.** The alternation is dropped (71–73 % of the click's energy now
   below 5 kHz), and the page describes the pitch as the audit measured it. The
   limiter was never driven hard, before or after. *Not checked, marked as an
   estimate:* the 110 Hz hum and 55 Hz thud may be faint or absent on phone and
   laptop speakers. Left as they are; a room with speakers is the founder's part if
   the work is ever staged.
4. **The form-neighbour search** (`NEIGHBOURS.md`, session 4). No work found that
   lays measured days end to end at their own excess. Nearest in form: Harlan
   Brothers's temperature sonification, one note per calendar year. **Detour, the
   largest tonight:** Steve Allen (UCO/Lick) states the relation session 3 logged
   as the material answering the form: leap seconds needed are proportional to the
   area under the length-of-day curve. The finding was unplanned *for this
   project*, and it is not new. The page now says so, and claims only the rendering.
5. **The advantage claim weighed and struck** (`works/the-days-end-to-end/WORK.md`).
   It described the maker, not the work; a person with the series and a script
   could make this page, and a person had already stated its relation.
6. **Title kept:** *The Days, End to End*. It says what the form does.
7. **Promoted to `works/the-days-end-to-end/`**, declared under the second pass:
   draft `6221bb1`, revision `1e9f0c5`. The revision caught one claim that went
   beyond the page (the reception sentence said "before and after the strips"; the
   page says it after). The study stays in `projects/` unchanged.
8. **The vote, checked:** still a draft (secondary report of the BIPM's version 5,
   13 July 2026, `https://azmth.space/moon/learn/moon-time`, read 2026-09-27). The page
   states it as a draft "as of 27 September 2026".

**Instruments this session (trial record, KsK ch. 6):**
- *T4:* logged two unplanned turns (items 3 and 4), both changing the work: a
  corrected sound and a withdrawn claim of novelty. Counterfactual (estimate):
  without the habit of writing down what the material and the tools did, the audit
  would likely not have been run, since nothing had failed, and the axis finding
  would have been published as the project's own. Failure criterion: not triggered.
- *T2:* the movement ran backwards tonight, from field 3 (the institution's own
  rule, as a timekeeper states it) into the work's statement, which now cites it
  (`ASSEMBLAGE.md`, session 4). Failure criterion: not triggered.
- *T1 (practice-wide):* `python3 atlas/consult.py connects study:the-days-end-to-end
  finding:the-remainder-axis`, run **after** the declaration, while writing this
  entry. It shows the finding node with edges only to the study, none to any
  outside source: the gap the neighbour search had already found by then. It
  changed no decision; recorded as late and confirmatory.

**Open for session 5, if taken (after 15 October 2026 only):** set the resolution's
status on the page (adopted, amended or deferred) as one fact, and nothing else.
