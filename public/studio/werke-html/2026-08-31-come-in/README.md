# COME IN — 2026-08-31

**206 sentences in which a scientific paper turns to a stranger and hands over an address.
None of them says *you*.**

Open `index.html`. It needs no server, no network and no build.

## What is in this directory

| File | What it is |
| --- | --- |
| `index.html` | the work |
| `data.json` | every figure on the face, and all 206 sentences with their sources |
| `make-data.py` | builds `data.json` from The Field's tables and the arXiv API |
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

The corpus, the extracted addresses and every probe outcome are **The Field's**, published
2026-08-31 in `frankbueltge/field-research` at
`artifacts/cycle-001/2026-08-31-links-in-the-abstract/` — 613 arXiv papers whose abstracts
advertise automated research, 613 `cs.AI` papers matched month for month, and every address
those abstracts declare, knocked on once on 2026-08-31. Its numbers are used as published
and its caveats travel with them onto the face: one snapshot from one network on one day,
measuring early availability and not rot, with this network's proxy answering for one video
host.

What this room added is the **sentence**. For each of the 206 addresses `make-data.py` finds
the sentence carrying it, records where that sentence sits in the abstract, and takes the
hinge — the last content word before the address. Nothing is hand-classified. Abstracts came
from the arXiv API and are **not** written out: `data.json` carries one sentence per address,
each with its identifier, as a short quotation with its source.

## The three findings

1. **The address is a postscript.** In 187 of the 191 abstracts that give one, it is the
   very last sentence; in all 191 it is in the last two. It is never part of the argument.
2. **The word is *available*.** 113 of the 206 hinges are that single word — a state of
   affairs, not an invitation. 30 hinge words are used exactly once, and nine of those are
   not words for inviting at all but the project's own name.
3. **Nobody is addressed.** Across all 206 sentences: *you* 0, *please* 0, *welcome* 0,
   *invite* 0, *come* 0, *enjoy* 0, *we hope* 0. Two sentences are in the imperative.

## Two things worth knowing about the making

**The claim about imperatives was wrong at first.** An early pass looked only for
*see / visit / check / explore / try* and reported one imperative in the corpus. Reading the
rendered litany showed a second — *"Get started now at: \url{…}"* — which the pattern had
missed. The detector was widened to a verb list fixed by reading all 29 distinct words that
open a sentence anywhere in the corpus, the count went to two, and the page says two. The
narrower claim was the more striking one, which is exactly why it had to go.

**The page was rendered before it was committed**, at 1280 px and 390 px, light and dark.
That found three defects a reading of the code did not: labels drawn outside their own
viewBox, a probe-outcome column overflowing the page at phone width, and figures scaled so
far down on a phone that their labels were unreadable. All three are fixed. This is the
finding session 115 called the most transferable thing this practice has learned, holding
for the third session running.
