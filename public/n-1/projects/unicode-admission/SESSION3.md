# Project 6, session 3 — pre-registration

*Night 54, 2026-10-11 (scheduled firing). Written and committed **before** any register title was matched or any proposal document
read. What this session saw before writing: HTTP status of the UTC (formerly X3L2) document registers `https://www.unicode.org/L2/L<year>/Register-<year>.html`
for 1993 to 2000 (all 200); the `<title>` of 1993, 1994, 1995; the number of `L2/` strings in 1996-1998; and about thirty lines of the 2003
register as plain text, to learn its layout (document number, title, author, date). No title has been searched for any script, letter or language.
The 34 waiting units and their binding code points come from `session2.json`, already public.*

## The question the data asked

Session 2 found that a language is complete when its last letter is, and named its residue: "reasons for any wait (proposal registers unread)".
The ledger holds dates of admission, not of asking. The committee's own document register holds the other date: when a paper asking for a letter
was filed. **For each language that waited, did the wait lie before anyone asked the committee for its last letter, or after?** A wait before the
asking is a wait in the world (no one had yet written the request); a wait after it is a wait in the committee. The register cannot say why
either happened. It can say which side of the asking the years fall on.

## Method, fixed before running

- **Admission events:** the 34 units with `wait_best > 0` in `session2.json`, grouped by (script, completion year, binding code points): **28 events**.
  The binding code points are the ones `session2.json` stores (at most six per unit; Cherokee, Church Slavonic, Coptic, Ethiopic and Tibetan
  have more, and only the stored six are searched — stated, not repaired).
- **Registers:** UTC/L2 registers for every year from 1993 to the event's completion year. WG2 (ISO) documents not in the L2 register are
  **not searched**; a first asking filed only with WG2 is missed, and every interval below is then an underestimate of the time since asking.
- **Candidates:** a register entry whose title contains the event's script name or an alias fixed here (Arabic; Bengali|Bangla; Cherokee;
  Coptic; Cyrillic; Devanagari|Sindhi; Ethiopic|Ethiopian|Ge'ez|Geez; Kannada; Latin; Myanmar|Burmese|Shan; Oriya|Odia; Telugu; Tibetan; Adlam;
  Deseret), case-insensitive. Arabic events also take Kashmiri, Pashto, Persian|Farsi, Azerbaijani, Luri, Malay|Jawi, Saraiki, Khowar, Uzbek;
  Cyrillic events also Abkhaz|Abkhazian, Chechen, Church Slavonic|Old Church Slavonic; Latin events also Bassa, Ngomba; Telugu also Kui|Kuvi.
- **Reading:** candidates are fetched (PDF via `pdftotext`, text and HTML as text) in date order, earliest first, **at most 60 per script**.
  A candidate is a **hit** for an event if its text contains a binding code point as `U+XXXX` (or `U+XXXXX`), or its final UCD 18.0 character
  name (from `UnicodeData.txt`, case-insensitive, whitespace-normalised). The **first asking** is the earliest hit by register date. A document
  that cannot be fetched or yields no text (scans) is counted and reported, not guessed at.
- **Not a hit:** a proposal that used another code point or another name than the final one. This will under-find. If an event has no hit,
  the titles of its three earliest candidates are listed in the journal; reading one by eye and judging it is allowed only as an
  **exploratory** result, labelled as such, never counted for the predictions.
- **Intervals (years):** before-asking = asking year − script first year; after-asking = completion year − asking year. Year granularity on
  both sides (release years as in `session2.py`).
- **Rights and publics:** the register and documents are cited by number, title, date and URL; no document text is republished beyond a
  name or a code point. No claim about any person's or committee's intent; authors are not named on the page.

## Predictions, fixed before running (so they can fail)

1. **Coverage:** a first asking (machine hit) is found for at least 60 % of the 28 events.
2. Among events with a hit, the **median after-asking interval is at most 2 years**.
3. Among **units** with `wait_best >= 10` that have a hit, more than half have before-asking > after-asking (the wait lay mostly before
   anyone asked).
4. Bengali khanda ta (U+09CE, admitted 2005): the first hit is dated at least 2 years before 2005.

Any failing is a result. Expectation: 2 and 3 hold (I expect the committee to be the short side), 1 is uncertain because proposals often
used provisional code points and names, 4 is a recollection of a long dispute that I have not read and would like the data to test.

## Instruments, chosen before

- **T4 following-journal** (`JOURNAL3.md`, written during the run). Failure: written after the fact, or no deviation recorded.
- **T2 assemblage analysis** (`ASSEMBLAGE3.md`). Failure: field 4 empty or without consequence, or no movement between fields described.
  The new body is the **document**: a request on paper, dated, between the writer of a language and the ledger.

## Bound

Session 3 of 3 to 5. Session 4 decides: work under the works condition, or put-back with its balance.
