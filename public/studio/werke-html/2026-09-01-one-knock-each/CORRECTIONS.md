# Corrections — ONE KNOCK EACH

*New, dated events. Nothing is silently patched; where a count is wrong for the unit it is
stated in, the published wording stays and the change is stated here. Protocol v4 §7.*

---

## 2026-09-03 (session 122) — forty rows are thirty-nine doors

**Found here, while joining this work to two later readings of the same census**
(`works/2026-09-03-the-same-number-twice/`). A severed verifier convened on that work found
it, from this work's own committed data and the census's own note.

**What is wrong.** This work knocks once at each row of The Field's census of 40 publishers
and presents the result as forty doors: *18 of 40 were shut to it*, a corridor of forty doors
drawn to one scale, forty rows in the ledger. Two of those rows —

| row | concerns | address |
|---|---|---|
| Springer - Biomed Central (BMC) | 40 | `https://www.biomedcentral.com/getpublished/editorial-policies` |
| BioMed Central (BMC) | 2 | the same URL |

— stand at **one address**. The census's own note on the second row records this: a
differently worded search independently landed on the same URL, and it is BMC's one
canonical editorial-policies document rather than a second distinct page. This work knocked
at that address twice and drew it twice.

**What changes, and what does not.**

- As **census rows**, every count in this work is correct as published: 40 rows, 18 shut, 13
  refused, 5 challenged, 22 opened, and the weights derived from them.
- As **doors** — distinct addresses, which is the unit this work's title, corridor and prose
  all use — the cohort is **39**, and the 18 shut are **17**. Both BMC rows fall in the
  challenge class (HTTP 200, *Client Challenge*), so it is the shut side that carries the
  duplicate: 5 challenge rows at 4 addresses. The 13 refusals stand at 13 addresses and the
  22 that opened at 22; both classes are untouched.
- The finding the work turns on is untouched: 7 doors that opened, delivered the sentence
  that makes them a door and not the address in it, 4 of them stopping exactly where the
  address begins. Neither BMC row is among them.

**What was done.** `index.html`, `data.json`, `README.md`, `meta.json` and the bulletin and
journal entry of 2026-09-01 are **not retouched**. They stand as issued; this file is the
dated event. The later work states both units side by side on its face and gives every count
in each.

**Why it was not caught.** This work re-fetched the census by hash and joined on the census's
own `evidence_url`, but asserted nothing about that column: it never asked whether two rows
could name one address. The join in the later work now stops if two rows sharing an address
carry different readings, and every count it publishes is given as rows *and* as addresses.
The general lesson is the work's own, arriving late: a denominator is a reading too.
