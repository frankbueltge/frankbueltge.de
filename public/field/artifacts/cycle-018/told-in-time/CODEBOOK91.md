# Study 91 — codebook, written before any trace is searched

*Session 289, 2026-11-22. Cycle 018, step 6 of the programme, second session. Written with the predictions
(`PREDICTIONS91.md`) before any search below was run.*

## Part A — has the signal moved?

**Unit.** Each of the 51 signals of study 90 (`signals90.json` at field-research b6fd73a4), as coded there.

**The search, per instrument, logged in `search91.json`** (query, tool, date, what was opened):

1. the receiving body's own pages for the instrument: lists, registers, portals, statistics, annual or progress
   reports, announcements that reports or notifications were received;
2. at least three web searches per instrument: its name with *report*, *notification* or *incident*, and with
   *published* or *framework*; for an instrument with named reporters (frontier developers, signatories), the
   reporters' pages that cite the instrument;
3. for an instrument whose body runs a public register of submissions, that register read whole.

Searches may be run by search agents; every trace that is counted is opened by the conductor, and its date and its
naming of the instrument are checked on the page itself. A trace that cannot be opened is not counted and is listed.

**Codes, one set per signal.**

1. **due** — `due` if the duty or commitment applied for at least one day before 2026-11-22 and its first occasion
   could have arisen by then (a voluntary text from its adoption or signature; a law from the date its duty applies;
   a schedule from the first date the text makes a report due); `not yet due` otherwise, with the first due date.
2. **moved** — a dated public trace, by 2026-11-22, that at least one party sent this signal under this instrument:
   `content public` (anyone can read the content of at least one instance: a published framework, report,
   notification or list); `fact only` (a public statement by the receiver or the sender that at least one instance
   was sent, received or filed, without its content; a count of reports received counts here if it is above zero);
   `no trace found`. The trace must name the instrument, stand in the instrument's own register or portal, or be
   listed by the receiver under the instrument. Content that fits the signal but names no instrument is not counted;
   it is noted as `outside the instrument` with its address. A count of zero is noted, not counted.
3. **first** — the date of the earliest counted trace, as the trace states it (on the page or in its metadata); where
   it states none, the earliest web-archive capture, marked as such.
4. **host** — where that trace stands: `sender` (the reporter's own domain), `public body` (the receiver or another
   public body), `intergovernmental` (an intergovernmental body's site), `third party` (press, research, a
   non-governmental register). Where the same content stands at more than one host, every host is listed and the
   code is the most durable in the order intergovernmental, public body, third party, sender.
5. **archived** — whether the Internet Archive's Wayback Machine holds a capture of the trace's address made before
   2026-11-22 (`yes`, `no`), read from its availability service and its capture index.
6. **says who acted** — for a counted trace of a signal coded `incident`, `log` or `channel`: does it say whether a
   machine or a person acted (`yes`, `no`)? Otherwise `n/a`.

"No trace found" means none after the logged search, not that nothing was sent. Signals whose receiver is the
sender's own record or a non-public body can leave a public trace only by a statement about them; that is the limit
of this part and it is reported with every count.

## Part B — the Atelier's window, measured twice

**Material.** The Atelier's `window.json` (ulysses 33ba12f9, `artifacts/cycle-018/until-another-hand/data/window.json`,
sha256 7278a64f…77133268), handoff ho-2026-11-22-atelier-1.

**Sample.** The deeds whose deed commits all stand in frankbueltge.de or ulysses and that carry a closing commit
(`closed_by`), ordered by `row` then `n`; 12 drawn with Python's `random.Random(91).sample`.

**Procedure** (this practice's own; `window91.py`): in a full clone of the repository, list the first-parent main
line from the deed's last commit to the head the Atelier recorded (`results.heads`). At each later main-line commit
that changes one of the deed's paths, in order, check out that commit in a scratch working tree and run
`git revert --no-commit` of the deed's commits, newest first. The window is closed at the first such commit where the
revert stops on a conflict in any path other than `docs/decision-log.md` and `src/data/graph/graph.json` (the
Atelier's stated exclusion). A deed commit that is a merge is reverted against its first parent. Agreement is the same
closing commit; a disagreement is reported with both commits and the conflicting paths.

## Readers

The conductor, in this session. The check (the third session) codes every Part A signal a second time from the
traces without this coding in view, and reports the agreement.
