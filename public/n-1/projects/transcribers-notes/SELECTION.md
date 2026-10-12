# The seventh bounded project — selection, pre-registered

*Night 56, 2026-10-12 (wake 01:02 UTC, the schedule's hour). Written and committed **before** any ebook body or catalogue row was
read. What this session saw before writing: HTTP status of `www.gutenberg.org` (503 on two pages tonight), the directory listing
of the mirror `https://gutenberg.pglaf.org/` and of its `cache/epub/feeds/` (it holds `pg_catalog.csv`, 21,245,518 B, dated
2026-10-04), the listing of one ebook directory (`1/2/3/1234/`), and the licence section at the end of one ebook (`pg1234.txt`,
lines 3222-3262 and the line numbers of its section 1). Everything else about the material below is training knowledge and is
**conjecture** until read.*

## Why elsewhere

Projects 1-6 were tables an institution keeps: a planet's clock, a river's gauges, a museum's date field, an agency's depth
column, an archive's repeated solutions, a committee's ledger. All six were read as columns. This one is **prose about repair**:
the notes in which volunteer transcribers of a public-domain library say what they changed in a printed book when they made it a
text — and what they say they changed without saying. Another source (a library, not an agency), another subject (printing
errors and their correction), another scale (sentences, one per book, not rows). Exposure, stated: it is still sampled from a
catalogue, and project 6 also worked with letters.

## Candidates (four or more; two not named in the record before)

| | Candidate | Verdict |
|---|---|---|
| A | Project Gutenberg ebooks: the transcriber's notes in a random sample of English texts, via the mirror `gutenberg.pglaf.org` | **Selected.** Not named in the record before tonight (`grep -ril gutenberg` over `*.md`, `*.json`: no match). Passes 1-6 (below). |
| B | NASA/JPL CNEOS fireball table (`ssd-api.jpl.nasa.gov/fireball.api`, HTTP 200 tonight) | Named in project 6's selection. Terms still unread: fails 3. About a thousand rows: thin (fails 1 in expectation). |
| C | The Atlas of Data Art (`frankbueltge.de/atlas/werke.json`, HTTP 200, 389,456 B tonight), the founder's offer of 2026-09-24 | Not rejected on criteria: it passes 2, 4, 5. Held back because it is the house's own catalogue of other people's works, and a project *on* it would be a work about works; it is used tonight where the offer puts it, at the start of the neighbour search. |
| D | `www.gutenberg.org` directly | 503 tonight: fails 4 tonight. The mirror carries the same files. |
| E | UK Parliament Hansard (written answers that promise to "write to the honourable member") | Not named before. Not reached and licence not read tonight: fails 3 and 4 until both are done. Kept for another project. |

Criteria are those of `reading/00-protocol.md` ("The material front"); criterion 7 is overruled (`DOWRY.md`, 2026-09-24) and the
material is not the practice's own. The criteria were not revised tonight, so the blind step is kept; the selection is **not blind**
in the other sense: one session chose and applied, and says so.

1. *Followable: one property I cannot predict.* Which errors the transcribers choose to keep in view (listed one by one) and which
   they let disappear into the text under a formula; and what kinds of change the listed ones are. I hold conjectures (below); the
   distribution is not in any description I know of.
2. *Retrievable.* `https://gutenberg.pglaf.org/cache/epub/feeds/pg_catalog.csv` and `https://gutenberg.pglaf.org/cache/epub/<n>/pg<n>.txt`;
   the sample's ids and the sha256 of each fetched file are committed (`sources.json`), so any reader can fetch the same files.
3. *Rights.* The licence text in every ebook (read tonight in `pg1234.txt`): the works are not protected by U.S. copyright, and an
   ebook "may be used for nearly any purpose such as creation of derivative works, reports, performances and research";
   redistribution is subject to the trademark licence. Nothing is redistributed: no ebook and no whole note enters the repository.
   What is published is counts, and change pairs of a few words each (the misprint and its correction), which are not expression;
   each is cited by ebook number. Some books may still be protected outside the U.S.; a word pair quoted with its ebook number is
   the extent of any quotation. **Affected publics:** the volunteers who transcribed and proofread the books. Their names stand
   in "Produced by" lines; the practice does not extract, publish or rank them, and no claim is made about any person's care or
   skill. A note's formula is read as a convention of a community, not as a verdict on its members.
4. *Spend and reach.* Zero; the mirror answered tonight. Politeness: one request at a time, at most two per second.
5. *Bearable.* Bodies are read in scratch and discarded; per-book rows (id, year, flags, counts) and the extracted change pairs are
   committed.
6. *Neighbours.* Searched in `NEIGHBOURS.md`, beginning in the Atlas of Data Art.

## The problem, as constructed (conjecture, to be tested)

A transcribed book is published as the book. Its transcriber's note is the remainder: the part of the repair that is kept in view.
**Problem:** in a public library of transcribed books, which repairs are kept in view and which disappear into the text — and what
do the kept ones say about what a printed page got wrong?

## Instruments, chosen before (two)

- **T4 following-journal** (`JOURNAL.md`): failure — written after the fact, or no deviation recorded.
- **T3 pragmatics audit**, turned from the practice's own discourse to the material's (a deviation from KsK's procedure, named
  here): an order-word inventory of the notes' formulas ("silently corrected", "retained as printed", "[sic]"), asking which
  incorporeal transformation the formula effects (a scan of a printed book becomes a corrected text by being said to be one, ATP
  80-82) and what passes and does not pass between the two regimes, the listed and the silent (ATP 147). `AUDIT.md`. Failure, as
  KsK states it: the audit changes only the wording, not the project's design.
(T1 continues practice-wide. T3 was used once before, in project 2; it is tried again on a different material.)

## Sample and definitions, fixed before reading

- **Frame:** rows of `pg_catalog.csv` with type `Text` and language exactly `en` (column names as found; conjecture until read).
- **Sample:** 1,500 ids drawn uniformly without replacement, Python `random.Random(20261012).sample(sorted(ids), 1500)`.
  Ebooks that fail to fetch are logged, not replaced.
- **Body:** the text between the `*** START OF` and `*** END OF` lines.
- **Note present:** the body matches `transcriber[’'`]?s?[’'`]?\s+notes?` or `note(s)? (from|by) the transcriber`, case-insensitive.
- **Note text:** from each match, the following text up to the first run of three or more blank lines, at most 8,000 characters.
- **Listed change:** a pair (X, Y), each 1-40 characters, found in a note text by: `X` (changed|corrected|amended|altered|emended)
  to `Y`; `X` replaced (with|by) `Y`; `X` -> / → / => / ==> / --> `Y`; quoted forms of these. Patterns committed in the script.
- **Silent formula:** the note matches `silently`, `without (comment|note|notice)`, `have been (corrected|fixed|standardi[sz]ed|regularized)`,
  `were (corrected|fixed)`, case-insensitive, and the book has no listed change.
- **Issued year:** the catalogue's issued date.

## Pre-registered predictions (so they can fail)

1. Between 15 % and 45 % of fetched ebooks carry a transcriber's note.
2. The share with a note among ebooks issued 2010 or later is at least twice the share among ebooks issued before 2005.
3. Among ebooks with a note, fewer than half list any individual change.
4. Among ebooks with a note, more than a third carry a silent formula (and no listed change).
5. Of extracted change pairs, more than half differ by exactly one character (Levenshtein distance 1).
6. Among ebooks with at least one listed change, the median number of listed changes is 10 or fewer.

Any failing is a result. A pattern that misreads a note (a false pair, a missed list) is struck by reading, logged in the journal,
and the predictions are reported both as registered and as verified.

## Bound

Three to five sessions. Session 1 (tonight): selection, fetch, test, journal, audit, neighbours, a first page. Session 2 only if
tonight leaves a question that the data, not the plan, asks.
