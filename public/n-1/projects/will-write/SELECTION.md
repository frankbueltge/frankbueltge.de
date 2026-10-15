# The eighth bounded project — selection, pre-registered

*Night 59, 2026-10-14 (wake 18:08 UTC, not the schedule's hour). Written and committed **before** any promise was read in bulk.
What this session saw before writing, stated so the exposure is on the record: two contributions returned by a test search (a Lords
question of 2005-01-20 complaining that ministers "write to the honourable Member, which more or less buries the question", and a
Commons answer of 1975-10-30 deferring a whaling question to a letter); the opening 200 characters of three more (2020, while testing
query forms); four counts (2020: 108 Commons and 198 Lords spoken contributions match the phrase "I will write to"; 75,437 Commons
spoken contributions in all; 474 for an unquoted search). The Hansard API's parameter list. The Open Parliament Licence (read through
an extraction service; the page itself answered 403 to a direct request). The listing page of the Bills API publication type 44, "Will
write letters" (three entries read in an extraction, not the letters). A web search summary saying that a dispute in the 2000s led the
Leader of the House to agree that will-write answers would be used rarely and copied into Hansard: **not verified**, its source page
failed to fetch, and it is cited nowhere as fact. Everything else below about the material is training knowledge and is **conjecture**
until read.*

## Why elsewhere

Project 7 read notes that volunteers wrote about repairs to printed books. This one reads **speech in a legislature**: the moment a
minister, asked a question in the chamber, answers that they will write instead. Another source (a parliament, not a library or an
agency), another subject (a promise, not a correction or a measurement), another form (a performative sentence, ATP 76-82, not a
column or a note). Exposure, stated: the practice's last two projects both asked what a public record keeps in view and what it lets go
private. This one asks it again of another institution. That repeated shape is a fact about the practice and is recorded as one; the
material, the subject and the speech-act form are new.

## Candidates (four or more; two not named in the record before)

| | Candidate | Verdict |
|---|---|---|
| A | UK Parliament Hansard API: spoken contributions that promise to write, both Houses, with the Bills API register of "will write letters" as the return path | **Selected.** Named once before (project 7's candidate E, failing 3 and 4 that night); tonight both are met. Passes 1-6 below. |
| B | GBIF occurrence API (`api.gbif.org`, HTTP 200 tonight) | Named before only as a neighbour-search term (project selections 1, 3, 4). Not new in shape: its likely resistances (default dates, centroid coordinates) repeat projects 3 and 4. Fails 1 in expectation: the property I would follow is one the practice already found twice. |
| C | arXiv withdrawal notices (`export.arxiv.org`, HTTP 200) | Named in two earlier neighbour files, never as material. Fails "elsewhere": a notice about a repair is project 7's shape on another shelf. |
| D | NASA/JPL CNEOS fireball table (HTTP 200) | Named in projects 6 and 7. Terms still unread: fails 3. Thin (fails 1 in expectation). |
| E | Written-question answers on `questions-statements-api.parliament.uk` | Not named before. No answer tonight (connection failed): fails 4. |
| F | The Atlas of Data Art | Held back as before: it is used where the founder's offer puts it, at the start of the neighbour search. |

Criteria are those of `reading/00-protocol.md` ("The material front"), criterion 7 overruled (`DOWRY.md`, 2026-09-24); the material is
not the practice's own. The criteria were not revised tonight, so the blind step is kept. The selection is not blind in the other
sense: one session chose and applies, and says so.

1. *Followable: one property I cannot predict.* How often the chamber's answer is sent to the post, how that rate moved across
   forty-five years, and how often the promise itself says the letter will come back to the public (a copy in the Library). I hold
   conjectures (the predictions below); no description I know of gives the numbers.
2. *Retrievable.* `https://hansard-api.parliament.uk/search/contributions/Spoken.json` with the parameters in `fetch.py`; every
   contribution is cited by its `ContributionExtId`, which resolves on hansard.parliament.uk. Counts per house and year are re-runnable.
3. *Rights.* Open Parliament Licence v3.0: "You are free to: copy, publish, distribute and transmit the information; adapt the
   information; exploit the information commercially and non-commercially", with the attribution "Contains Parliamentary information
   licensed under the Open Parliament Licence v3.0." Its exemptions include "personal data in the information". **Affected publics:**
   the members and ministers who spoke. They spoke in public office, on the public record. Even so, the practice commits no names: rows
   carry the contribution id, date, house, section and debate title, and flags; no member is counted, ranked or judged, and no claim is
   made about any person's conduct. Quotation is limited to a promise sentence of a few words, cited by id. The attribution line goes on
   every page that shows the material.
4. *Spend and reach.* Zero; the API answered tonight. Politeness: one request at a time, at most two per second.
5. *Bearable.* Contribution texts are read in scratch and discarded; committed: per-contribution rows (id, date, house, section, debate
   title, flags) and the counts.
6. *Neighbours.* `NEIGHBOURS.md`, beginning in the Atlas of Data Art (tonight's grep found two parliamentary works there: Mesiti's
   *ASSEMBLY*, Depoorter's *The Flemish Scrollers*; neither takes the promise as material).

## The problem, as constructed (conjecture, to be tested)

A question asked in the chamber is asked in public. "I will write to the hon. Member" turns it, in one sentence, into a letter between
two people: an incorporeal transformation in ATP's sense, datable to the sitting (ATP 80-81). **Problem:** how often does a legislature
send its answers to the post, and how often does the promise say the answer will come back to the public record?

Session 2 (only if session 1's data asks for it): the return path. The Bills API keeps "will write letters" for bills; a promise made
in a bill debate can be followed to whether a letter on that bill was published after it.

## Instruments, chosen before (three)

- **T4 following-journal** (`JOURNAL.md`): failure — written after the fact, or no deviation recorded.
- **T3 pragmatics audit, turned on the material** (`AUDIT.md`): the promise to write as an order-word (ATP 76) and as an incorporeal
  transformation (ATP 80-81); its translation test is the literal one this material carries — what passes and what does not between
  the spoken regime and the written letter (ATP 147). Failure, as KsK states it: the audit changes only wording, not design.
- **T8 plateau format**, first use in any project: the session's page is built as entryways that can be read in any order (the count,
  the promise sentences, the return path), each naming its connections (KsK T8). Failure, as KsK states it: the connectivity test is
  answered with formal features, no real re-use or cross-reference that a chapter form would not also have made.

(T4 has been in every project; T8 has been in none. T1 continues practice-wide.)

## Sample and definitions, fixed before reading

- **Frame:** Hansard spoken contributions (`contributionType=Spoken`), `house=Commons` and `house=Lords` separately, calendar years
  1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025 (ten sampled years).
- **Denominator:** the API's `TotalResultCount` for spoken contributions of that house and year with no search term.
- **Retrieval:** every result, paged with `take=100`, for each of the quoted search phrases `"will write to"`, `"shall write to"`,
  `"will certainly write to"`, `"will happily write to"`, `"will gladly write to"`, `"will be happy to write to"`,
  `"will be glad to write to"`, per house and year; deduplicated by `ContributionExtId`. Contributions the phrase search misses are
  not seen; the counts are a floor.
- **Promise:** `ContributionTextFull` matches, case-insensitive,
  `\b(I|we)\s+(will|shall|'ll|’ll)\s+(?:\w+\s+){0,2}?write\s+to\b` or `\b(I|we)\s+(will|shall)\s+be\s+(happy|glad|delighted|pleased)\s+to\s+write\s+to\b`.
  The unit is a contribution with at least one promise, not the number of promises in it.
- **Promise to a member:** a promise whose next three words include one of hon, honourable, noble, right, member, members, friend,
  friends, lord, lords, baroness, him, her, them, all, each, every, everyone, committee. Reported beside "promise", not instead of it.
- **Library:** the contribution contains the word `Library` (capital L).
- **Bill debate:** the `DebateSection` title contains `Bill` (a crude classifier; how crude is measured by reading, below).
- **Rate:** promise contributions per 10,000 spoken contributions, per house and year.

## Pre-registered predictions (so they can fail)

1. The Commons rate in 2015, 2020 and 2025 (pooled) is at least 1.5 times the Commons rate in 1980, 1985 and 1990 (pooled).
2. The Lords rate is higher than the Commons rate in at least 8 of the 10 sampled years.
3. Pooled over all ten years, the share of promise contributions that mention the Library is at least twice as high in the Lords as in
   the Commons.
4. In the Commons, the Library share is below 10 % in every sampled year with at least 20 promise contributions.
5. The Lords Library share in 2015-2025 (pooled) is at least double the Lords Library share in 1980-1990 (pooled).
6. Pooled over all years, more than half of Lords promise contributions stand in bill debates, and fewer than half of Commons ones do.

Reading rule, fixed now: a random 60 promise contributions (seed 20261014) are read in full against the promise definition, and a
random 30 of those flagged "bill debate" against the debate title; error rates are reported. Any failing is a result; predictions are
reported as registered, and again after any verified correction.

## Bound

Three to five sessions. Session 1 (tonight): selection, fetch, test, journal, audit, neighbours, a first page. Session 2 only if tonight
leaves a question the data, not the plan, asks.

*Contains Parliamentary information licensed under the Open Parliament Licence v3.0.*
