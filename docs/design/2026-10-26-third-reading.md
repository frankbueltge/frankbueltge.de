# Third Reading — design (2026-10-26, PROTOTYPE)

*Frank's commission of 2026-10-26, wording private. Paraphrased: he asked whether works could gather
data from the people who see them, as long-running collection or experiment and as an alternative to
dull multiple-choice surveys, seriously enough to count as online research, and then asked for this
idea to be worked out as a design document and a prototype. Status: built on the branch
`feat/third-reading`, **not live**. It opens on Frank's go, because it is the first work of the house
that asks its readers something and keeps their answers.*

## Why

Since 2026-10-25 every matter of the Middle's briefing has two readings: why it presses, after the
expert sources (the briefing), and how loud the web was about it (Common Ground). The people who read
the site are not read at all. Third Reading asks them, in a form that is not a questionnaire: pairs of
matters, one question, a few estimates, and the reader's own result straight afterwards. It runs for
years, round after round, and each round's record can feed the next briefing.

## What a reader does

1. **Consents**, in the work's own card: what is kept, what is not, where it goes, why it cannot be
   taken back, who is responsible, 16 or older (`src/lib/reading/consent.ts`, versioned).
2. **Chooses** in pairs drawn at random in the browser (15 per reading in the first round), always
   with the same question — *which of these two should the world act on first, in the coming year?* —
   and four answers: left, right, *equally urgent*, *can't say*.
3. **Estimates** three magnitudes drawn from the round's five (e.g. how many people face acute food
   insecurity in the 13 hunger hotspots), each answer judged against its sourced figure at once.
4. **Sends**, or keeps it to themselves. Nothing leaves the browser before this step, not even the
   bot check, which loads with the send button.
5. **Sees where they stand**: how often they gave a choice to the louder matter, how they treated the
   briefing's "urgent but quiet" matters, their estimates against the figures. Only then does the page
   offer the other two readings.

The web's counts and the "urgent but quiet" list sit in a closed fold below the reader's card. A
reader who opens it first is not stopped; a reading sent after opening it during the same visit
records it (`primed`), and the open data carries it. A reading that saw the counts first would measure
the page, not the reader. (A reader who saw them, kept that reading and came back later is not
marked; the method sheet says so.)

## The three readings

| Reading | Made by | What it holds | Source |
|---|---|---|---|
| Expert | the Middle's briefing | why each matter presses; "urgent but quiet", best first | `research-ecology/briefings/<round>.md`, pinned to its commit |
| Web | Common Ground | signals naming the matter, converged days, every receipt, 30 days to the briefing | `src/data/trending/<date>.json` via `src/lib/reading/attention.ts` |
| Readers | this page | a pairwise ranking with intervals; estimates against figures | `src/data/reading/<round>.json` via `src/lib/reading/aggregate.ts` |

The briefing ranks nothing but its quiet list, so the page never invents an expert ranking. The
readers' ranking is the only full urgency order of the three.

## Method

- **Pairs.** Uniform over all pairs of the round's matters, sides by coin toss (`draw.ts`).
- **Ranking.** Bradley–Terry, fitted by MM; each matter also meets a reference of strength 1 once in
  each direction, so a few readings cannot push a matter to an extreme. A tie is half a win each;
  "can't say" stays outside the model and is counted. The score is the chance of being chosen over a
  random other matter (the wiki survey's score); the interval is the 5th–95th percentile over
  resampled *readings*, seeded, so the same record always gives the same page (`rank.ts`).
- **Estimates.** Close within a factor of 1.25 for a count, five points for a percentage, a tenth of a
  degree for a temperature (`estimate.ts`). Gists never state an asked figure (tested).
- **Attention.** A signal counts when its label or a linked headline names one of the matter's terms
  as a whole word, case and accents folded, and none of its exclusions ("hunger stones" are not
  hunger). The terms are a disclosed choice; the receipts show what they let in. A matter counts as
  louder than another only with at least twice its signals and at least one more, so that small
  differences, which are more the terms' doing than the web's, decide nothing. This is deliberately not the briefing's count, which counted raw occurrences and named
  no terms; the two differ. The briefing gave "Sudan 25, hunger 8" mentions; here the hunger matter
  counted 9 signals while "Sudan" was one of its terms, one of them a football match between South
  Sudan and Egypt, so "Sudan" was dropped and the matter now counts 3.
- **The floor.** Below 30 readings the page shows counts and intervals and words no comparison.
- **What may be claimed.** Only "this audience". The intervals are model uncertainty for this
  audience, not a margin of sampling error (AAPOR's distinction). Nothing about readers is asked or
  kept, so the audience's make-up is unknown and is said to be.

## Data, and the six duties (`.claude/rules/runtime-and-works.md`)

- **Store.** The reception's D1 (`RECEPTION_DB`), in five tables of its own that create themselves on
  first use: `reading_entries` (random id, round, day, consent version, primed, votes, estimates),
  `reading_salts`, `reading_marks`, `reading_addr` (readings per address and day, capped at three),
  `reading_counts`. No address, no time of day, no identifier. Entries, marks and address counts are
  `WITHOUT ROWID` tables, so the order of writing cannot pair a reading with its reader's mark.
- **Release.** The public record holds only readings of finished UTC days, in whole batches of five,
  each without its day (a batch number instead). Polling it shows nothing arrive, and each night's
  addition to the record and to git history holds five readings or none.
- **1, declared state.** The consent card and the "What this page keeps" section, plus a section in the
  privacy policy (DE and EN).
- **2, nightly snapshot.** `reading-snapshot.yml` reads `GET /api/reading/record` for every round
  (public, no token, cached an hour under one key) and commits `src/data/reading/<round>.json` when it
  changed, one reading per line; a record may only grow, so an answer that has lost committed readings
  writes nothing and fails the run. `deploy-cf.yml` waits on it.
- **3, counting, not identifying.** Day hashes (HMAC of address and browser, and of the address alone,
  under a salt that lives one UTC day) allow one reading per round per day and three per address; the
  record call of each night deletes the finished day's salt, marks and counts. D1's point-in-time
  recovery keeps earlier states for up to 30 days, for the operator only; the consent text says so.
- **4, mortality.** The page ends when its store ends; the committed records stay.
- **5, cost limit.** 300 readings a day, then standby until midnight UTC.
- **6, fail-closed.** No store or no bot check → declared standby; the chain in `handlers.ts` repeats
  the reception's guards rather than sharing them, so neither can loosen the other.

## Where it hangs

`src/data/reading/rounds/after-cycle-010.json` (the round) · `src/lib/reading/*` (all logic, tested,
with `fixtures.ts` for the tests) · `functions/api/reading/{submit,status,record}.js` (one line each) ·
`scripts/reading/snapshot.ts` + `.github/workflows/reading-snapshot.yml` ·
`src/components/reading/{ThirdReadingPage.astro,ReadingIsland.tsx}` + `src/styles/third-reading.css` ·
`/third-reading` and `/werke/third-reading` · `src/data/werke.ts` (counter-measurement line,
`in-arbeit`) · USP audit §22 · `src/data/legal.ts`.

## Neighbours (audit §22: ADDED VALUE, not unique)

Every part has a strong precedent: expert against public (AXA–Ipsos Future Risks, every year, far
better samples), expert against media (CARE, NRC, ECHO, Our World in Data), public against media
(Comparative Agendas Project), all three once (UN75, 2020), pairwise ranking (All Our Ideas), estimate
then reveal (Gapminder), polling the audience as art (Haacke, 1970). The daylight is the alignment: the
same current, named matters read three ways on one page, every reading open data on a fixed cadence,
each reader shown where they stand. Three findings of that search changed the build before the page
existed: *equally urgent* instead of a forced choice (the Moral Machine critique), the web's counts
behind a fold until after the reading (ask before revealing), and one fixed question across rounds.
Kill conditions are named in the audit.

## Going live (needs Frank's go)

1. Merge. The tables create themselves; Turnstile and the store already run for the reception.
2. Check in the Cloudflare dashboard whether the reception's database was created with the `eu`
   jurisdiction. It cannot be added later. If not, either accept it (the stored readings are
   anonymous) or create an EU database and bind it before the first reading; the consent text names
   Cloudflare, not a region, so it is true either way. A database bound after readings exist must
   receive them first: the snapshot refuses a record that has lost readings, so the archive cannot be
   emptied by a fresh database.
3. Set the work's status to `live` and add a line to the decision log.
4. Have the new privacy section read once by someone who reads such texts for a living.

## What the independent review changed (2026-10-26, before anything went live)

A second session read the prototype against its own claims, and its probes against the fake D1 found
what the first build got wrong. All of it is fixed above:
- The record showed a reading within a minute of its arrival, and the cache could be skipped. It now
  releases only finished days, in batches, under one cache key per round.
- Rowid order paired each reading with its reader's mark, which held the second it was written. The
  tables are now `WITHOUT ROWID`, and marks keep the day.
- Salts and marks were cleared only when someone sent a reading. The record call now clears them every
  night.
- A script could vary its user agent to pass the once-a-day limit. A per-address ceiling now holds.
- The consent card left out `primed`, and the bot check ran before the last button. Both are fixed,
  and so is the text.
- The snapshot read only the current round, and could have emptied the archive. It now reads every
  round and only ever adds.
- Broad terms ("Ukraine", "midterms", "inflation") made the web's counts measure the terms. They are
  narrowed, and the gist of "Wars that returned" now names the wars that did. "Louder" needs a real
  margin.
- A double click could answer the next pair. The browser now ignores a second click for 400 ms.

## Open, for Frank

- **Anchor matters.** A series needs matters that are read more than once. Should a small core (e.g.
  hunger, climate, AI and work) be carried into every round under the same id, even when a briefing
  does not list it?
- **The loop.** Should the briefing routine read the last round's record and say what it took? That is
  a change to `research-ecology/briefings/README.md`, not made here.
- **One count.** The briefing could count attention with `attention.ts`, so both pages give the same
  number for the same matter.
- **The open edge.** A reader naming a matter the briefing missed, entering the pairs after the seed's
  text gate: worth its moderation cost, or not before the third round?
