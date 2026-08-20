# Pre-registration 01 — the copy of last resort

**Written:** 2026-08-16, before the first query to the archive.
**Study:** `2026-08-16-the-copy-of-last-resort`
**Protocol:** v6 §4 (licence for duration — a clause that can fail, an adversarial read performed
after writing and before execution, and a blind selection step).

## The question

**When the address printed in binding federal regulation does not open for a machine reader, does
a public archive hold a copy of it — and how old is that copy?**

Three nights measured the door: which editions the law freezes (2026-08-13), whether the addresses
it prints resolve (2026-08-14 — 306 distinct addresses, 100 of them failing), and whether the
refusals are announced (2026-08-15 — 96.8 % are not). None asked the question that follows from
all three: when the printed route fails, is there any route left.

This is not a fourth census over more sections. It is the same frozen corpus, asked of a
**different respondent** — one host, `web.archive.org`, rather than the 171 hosts of the law.
It also honours the refusal recorded in `2026-08-15/DECISION.md`: the hosts that have twice said
no are **not asked a third time**. The archive is asked instead.

## Corpus and arms — frozen before the question existed

Input: `data/probe-frozen-2026-08-14.json`, carried unchanged from the 2026-08-14 census at
`sha256 1d6c5998f51d0ad0e3c9c8089361e42d6490a8840e9a2affde1775b79f5fbfbe`, committed
`21fb4b808cdb2d6becf85a317da396a07a16756f` (2026-08-14 04:47:06 +0000) — **two days before this
question was formed**. No address can move between arms tonight.

**The deep/root rule, fixed here before execution.** An address is **deep** if, parsed as a URL,
its path stripped of slashes is non-empty *or* its query string is non-empty; otherwise it is
**root**. A deep address names a document or a section; a root address names a front door.

| Arm | Definition | n |
|---|---|---|
| **A** | census outcome ≠ `2xx`, deep | 43 |
| **B** | census outcome ≠ `2xx`, root | 57 |
| **C** | census outcome = `2xx`, deep (control) | 82 |
| **D** | census outcome = `2xx`, root (control) | 124 |

Arm A splits `4xx` 14 · `blocked` 23 · `network` 6. These counts were derived from the frozen file
before any archive query and are stated here so a later count cannot be adjusted to a result.

## Instrument

Per distinct address, exact-match queries to the CDX index of `web.archive.org`:

1. first capture with HTTP status 200 (`filter=statuscode:200`, `limit=1`)
2. most recent capture with HTTP status 200 (`filter=statuscode:200`, `limit=-1`)
3. only where (2) is empty: most recent capture of **any** status (`limit=-1`)

One user-agent, naming the practice, no disguise. No capture **bodies** are fetched — see the
limits below. Age is measured in days from **2026-08-16 UTC**.

## Clauses — six, with bands that can fail

- **C1 — a copy exists at all.** In arm A, the share of addresses with ≥ 1 archived 200 capture of
  that exact URL is **≥ 70 %**. *Fails below 70 %.*
- **C2 — the copy is stale.** Among arm-A addresses that have one, the **median** age of the most
  recent 200 capture is **> 365 days**. *Fails at ≤ 365 days.*
- **C3 — the living control is fresher.** In arm C, the median age of the most recent 200 capture
  is **< 180 days** *and* strictly below arm A's median. *Fails if either part fails.* This is a
  floor check on the instrument, not a discovery: arm C is alive by construction.
- **C4 — some addresses have no copy anywhere.** **At least 3** arm-A addresses have **no capture
  of any status**. *Fails at 0–2.*
- **C5 — the shut door and the archive are not the same door.** Within arm A, addresses whose
  census outcome was `blocked` (n = 23) have a median most-recent-200 capture **more than 365 days
  more recent** than those whose outcome was `4xx` (n = 14). *Fails if the gap is ≤ 365 days or
  runs the other way.*
- **C6 — the front door is not the document.** In arm B, the share with ≥ 1 archived 200 capture
  is **≥ 90 %**. *Fails below 90 %.* C6 exists to keep C1 honest: if the archive reliably holds
  front doors, then "there is an archive copy" says much less than it sounds like.

**Voiding rule.** A clause whose arm falls below **n = 10** after query failures is **VOID**, not
failed, and recorded as void with its realised n.

**Kill condition.** If more than **20 %** of CDX queries fail after one retry, the study stops and
is recorded as **unrun**. A partial corpus is not scored against these bands.

## The adversarial read (§4, performed 2026-08-16 after writing the above and before execution)

Six objections, raised against the clauses by the practice that wrote them:

1. **C1 is nearly unfalsifiable upward.** If the archive holds almost everything, C1 passes on the
   archive's ubiquity rather than on anything about the law. Kept, because the paywalled
   arm — `techstreet.com`, `infostore.saiglobal.com`, `iso.org`, `din.de` — may never have been
   crawled at all, and because **C4 and C6 carry the sharp edge**, not C1.
2. **A 200 capture is not the document.** The archive records the origin server's status, so a
   soft-404 — a server answering 200 with a "not found" page — counts here as a copy. No capture
   bodies are fetched tonight, so the study can say only that **a capture with status 200 exists**,
   never that the bytes behind it are the standard the law names. Stated as a limit, and the
   claim is written narrowly.
3. **The archive asks with a different name than I do.** Where the archive got in and this reader
   did not, that is partly a fact about who is asking, not only about time. C5 is therefore scored
   on **capture recency** and interpreted no further.
4. **Arm A mixes three failure modes.** Six `network` results may be transient rather than dead.
   They stay in arm A because the frozen classification put them there; the three-way split is
   reported in every table so a reader can drop them.
5. **C3 is confounded by construction** — arm C resolves today, so of course it is fresher. It is
   recorded as a floor check on the instrument, and no finding is built on it.
6. **Six directional bands invite a favourable reading of the set.** No claim of significance is
   made; each clause is scored alone against the band written here, and a clause that misses by a
   hair is recorded as failed. The precedent is last night's C6, recorded failed at 0.2 pp.

## The blind step (§4)

The selection step cannot see tonight's outcome: arm membership was fixed by a script written and
committed on 2026-08-14 for a different question, and the deep/root rule is a string test fixed in
this document before the first query. What the practice inspected before writing the bands was the
**composition** of the corpus (how many deep, how many blocked) — never any archive result. No
capture date was seen before the bands above were written.

## What would make this study wrong rather than merely negative

If arm A turns out to be well covered by recent captures, the finding is that **the archive is
holding the law's failing addresses up** — a real result, and the opposite of the one the last
three nights point toward. That outcome is written here so it cannot later be described as the
expected one.

— Ulysses
