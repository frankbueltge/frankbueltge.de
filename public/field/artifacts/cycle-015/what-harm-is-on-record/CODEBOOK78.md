# Codebook — study 78 (the first reports on a public body's and on the maker's own address)

*Session 276, 2026-11-15. Written before any of the 60 texts was opened. Used by the conductor (first coding,
each text up to 2,500 characters) and by one convened reader who saw this codebook and the sheets only (second
coding, each text up to 6,000 characters), never the first coding or the page. Part A's rule for a public act is
the check's (`check77/CODEBOOK.md`, Part B), unchanged.*

Code only from the text on the sheet and the incident's columns printed with it. Do not use memory as evidence.

## Part A — a first report on a public body's address (sheet A, 37 items)

- `act`: true if the text states that a government, regulator, legislature, court, prosecutor or police force
  opened a formal proceeding, ordered, fined, banned, ruled, charged, arrested, sued, settled with an order, or
  legislated on the incident's matter. A statement, a warning to the public, a report, a hearing, guidance or a
  study alone is not an act. A private party's filing in a court (a complaint, a brief) is not an act of the
  court; a court's ruling, order or sentence is.
- `kind`: what the text is, one of `announcement of own act` (the body announces what it did), `court document`
  (a ruling, order, docket or filing held on a court's or a docket site's address), `report or study` (an audit,
  an inquiry's report, research by a public body), `warning or notice` (an alert to the public, guidance),
  `other`.
- If `act` is true: `body` (by name), `what` (at most twelve words), `act_date` (YYYY-MM-DD, YYYY-MM or YYYY if
  the text states it, else null), `act_target` (`user`: the person or firm that used an AI tool to do the deed;
  `maker`: the developer of the system, or the organisation that deployed it as its own service or procedure),
  `target_public` (true if the party acted on is itself a public body), `frontier` (the name, if the party acted
  on is a developer of a general-purpose frontier model, else null), `state` (`opened` or `concluded`),
  `system` (`worked`: it did what it was built to do and a person used it to harm; `failed`: the system itself
  erred or escaped what its maker intended; `unclear`).
- `borderline` (true or false) and `note` (at most fifteen words).

## Part B — a first report on the maker's own address (sheet B, 23 items)

- `about`, one of:
  - `own failure`: the maker writes that its own system erred, misbehaved, caused harm, was withdrawn, paused,
    corrected or fixed, or defends it against such a charge;
  - `misuse by others`: the maker writes about people or groups using, abusing or attacking its system or
    service to do harm (a threat report, accounts taken down, a fraud or an influence operation run through
    it), or about its action against them;
  - `other`: anything else (an announcement, a product page, a text about another party's system), with a note.
- `is_maker`: true if the writer is in fact the developer or deployer of the system the incident concerns
  (the address rule matched a name; it can be wrong), else false.
- `borderline` (true or false) and `note` (at most fifteen words).

## Output

A JSON object `{"A": [...], "B": [...]}`, one object per item with `id` (the incident number after `###`) and
the fields above. Every item on a sheet appears once.
