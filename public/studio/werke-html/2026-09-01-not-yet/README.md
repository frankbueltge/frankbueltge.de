# NOT YET — 2026-09-01

**1,667 scientific papers carry a public expression of concern with no retraction on record.
Together they have been waiting 3,022,007 days, and the number is still going up.**

Open `index.html`. It needs no server, no network and no build.

## What is in this directory

| File | What it is |
| --- | --- |
| `index.html` | the work |
| `data.json` | every figure on the face, and all 1,667 papers with their dates and identifiers |
| `make-data.py` | builds `data.json` from The Field's committed cohort file |
| `make-page.py` | builds `index.html` from `data.json` |
| `meta.json` | the work's record |

```
python3 make-data.py            # rebuild data.json (needs network)
python3 make-page.py            # rebuild index.html from data.json
python3 make-data.py --check    # fails loudly if data.json is not reproducible
python3 make-page.py --check    # fails loudly if the face and the data disagree
```

Both `--check` modes passed before this work was committed.

## What is whose

The cohort is **The Field's**, published 2026-09-01 in `frankbueltge/field-research` at
`artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/data/cohort.csv` — one row per paper
that has ever carried a public expression of concern, with the concern date, the publisher named
in the record, and the outcome as of their observation cutoff, 2026-08-19. Underlying source:
the Retraction Watch database as distributed by Crossref, plus Crossref's own deposited notice
records. No licence claim is made here over either. The file was read at
sha256 `fff141f2a522c2a24773c1885622911e03201af6b42535ade9443093926ef81a`; both corpora behind it
move continuously, so a later fetch will differ, and `make-data.py` says so rather than failing.

Their caveats are on the face, not summarised away: an expression of concern is not a finding of
misconduct; "unresolved" means no retraction notice on record and cannot be distinguished from a
concern answered in silence; the concern side of the database is less completely collected than
the retraction side, so every figure here is a floor; and the publisher table describes a public
database, not conduct.

**What this room added** is the clock. The Field asked how long a warning stands *before it is
resolved* and answered with a survival curve — a closed shape, past tense, about a cohort. This
work turns the same file the other way round: not how long did it take, but how long *has it
been*, for every flag with no decision at all, added together and still running.

## The three readings

1. **The waiting is not short, and it is not an anomaly.** 1,615 of the 1,667 have stood at
   least a year; 71 have stood ten. The median standing flag is at 1,708 days — nearly six times
   The Field's median time-to-resolution of 291 days. The page says plainly that these are two
   different populations and that the resolved group is probably the easier group, so the
   comparison does not establish neglect; what it establishes is that these are not simply in
   the queue.
2. **The oldest line on the page cannot be trusted, and that is worth more than the line.** The
   longest wait in the file, 8,876 days from 2002-05-01, was checked against Crossref before it
   was printed: the flag's date is the paper's *own publication date*. The clock has no
   independent start. It is marked in the ledger with a † and reported to The Field rather than
   dropped. The oldest wait that *can* be clocked is the next, 2003-03-17, 8,556 days — and
   reading its notice is what the reading turned out to be for. *Retraction Adv. Mater. 6/2003*
   (`10.1002/adma.200390130`) retracted two papers and expressed concern about a third, in one
   document, on one day. The two are retracted; the third has been standing ever since.
3. **Nobody raises these one at a time.** 687 distinct days carry all 1,667 flags; the largest
   single day carries 113, and not one of those 113 has a retraction on record four years and
   eight months later.

## The check that produced reading 02

58 of the 1,667 rows are deposited with the notice carrying the paper's own identifier. Ten were
checked one by one against the Crossref REST API on 2026-09-01. In **eight** the flag date is
well after publication and matches Crossref exactly — so the pattern is a filing convention, not
an error, and no sweeping correction is claimed. In **two** the flag date equals the publication
date: the oldest row in the file, and one from the batch of 113. Both are on the page. The point
that survives is narrow and true: a duration is only as good as the date it starts from, and
these rows carry no way to tell.

The result of the check went upstream to The Field with the session, in the bulletin. It was not
patched sideways into anything here.

## Two things worth knowing about the making

**The page was rendered before it was committed**, at 1280 px and 390 px, light and dark. That
found six defects a reading of the code did not: grouped numbers breaking across two lines mid-
figure ("1 277"); gridline labels in plate I drawn on top of the bars they annotate; plate II's
projected point falling outside its own viewBox, so its label was clipped; an axis title
colliding with a gridline label; the ledger's bar column sized as `1fr`, so its width varied with
the length of each row's identifier and put 1,667 bars on 1,667 different scales; and the ledger's
† marker wrapping onto lines of its own. All six are fixed. This is the finding session 115 called
the most transferable thing this practice has learned, and it has now held for four sessions
running.

The bar widths are emitted as quantised CSS classes rather than inline `style` attributes,
because the site's integration contract warns that inline style attributes are a
content-security-policy trap that compiles and then silently breaks in the browser. 1,667
silently empty bars is exactly the defect that is invisible until it is published.

**Every claim was recomputed from the row file before it was written.** That includes The
Field's own headline: 601 of 1,277 mature-cohort papers resolved within five years, 47.1 % —
the figure they published, re-derived here from their rows by a different script. A number
borrowed without being recomputed is a number taken on trust.

## What the critical read caught

The finished page was read adversarially before it was committed, against the arithmetic, the
prose and the house's legal-hygiene floor. It found one outright error and four things that were
not yet honest enough. All of them are fixed, and the error is worth naming:

**Reading 02 named one paper and described another's notice.** The passage was keyed to whatever
DOI came second by duration, but the "three months after publication" fact it stated belonged to
the *third*. That is a false factual claim attached to a real, identifiable paper — precisely
what the legal-hygiene floor exists to prevent, and it was sitting inside the paragraph whose
whole subject is checking things. The fix was not to soften the sentence: the actual rank-two
paper was checked against Crossref, and what came back — one notice retracting two papers and
flagging a third — is a better reading than the one that was wrong. The passage is now keyed to
what was *checked*, with an assertion in `make-page.py` that fails the build if the paper it
names is not the paper whose notice it describes.

The other four: the page's `meta` description said "never resolved", the one string that travels
without any caveat, while the page itself defines the term more narrowly; reading 01 compared the
age of the open cohort with the wait of the resolved cohort without saying they are different
populations; reading 03 turned "no retraction on record" into a claim about decisions that were
not made; and the running session figure — a projection like the clock's digits — was rendered in
the same ink as the sourced text. The Field's three figures used here (291, 53, 4) were also
hardcoded in the prose; they are now carried in `data.json` as *their* figures, attributed, and
marked as not recomputed here, because the row file does not contain them.
