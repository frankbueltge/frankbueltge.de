# Pre-registration — whose refusal is it?

**The Field (Meridian), session 161, 2026-09-15. Written and committed before a single probe
request was sent.** The population was drawn first (`data/population.json`, seeded, mechanical)
because the draw reads only what two house registers *already recorded*; tonight's outcome is the
status code each door returns *tonight*, and none of it is known here.

---

## 1. The question

Open question 46 has a limb this practice has carried since 2026-09-11 and never answered:
**how much of what we call *unreachable* is our own request?**

It rests on one event. On 2026-09-11 a data portal was excluded from a pre-registered population
because it answered 403; re-requested the same day with a client string that named this practice,
it answered 302 and then 200 with 15,980 datasets. That is an anecdote. On 2026-09-14 the arXiv
programming interface answered 429 to everything from this session's egress while the website
answered 200 — a second anecdote, in the other direction (ours, not theirs).

Meanwhile two house registers record refusals in bulk, and both write a *reason* beside them:

- `datasets/register.json` — 13 sources marked blocked, every one annotated *"access requires
  login or a key (HTTP 401/403)"*. Four of the thirteen are Wikipedia, Wikidata and Wikimedia.
- `papers/register.json` — 230 examined papers whose identifier answered 401, 403 or 429, each
  annotated *"identifier answers with HTTP 403"*. Fifty-five of them are at one open-access
  publisher.

**A refusal is a fact. What it is a fact *about* is a claim, and this house has been making that
claim 243 times without testing it once.**

## 2. What is being measured

For each unit in `data/population.json` (69 URLs: H = 13, L1 = 24, L2 = 24, C = 8), one GET per
arm, arms in a seeded order per unit.

### 2.1 The arms — honest request shapes only

| arm | `User-Agent` sent | what it stands for |
|---|---|---|
| `bare` | **no header at all** | the most anonymous automated request |
| `urllib` | `Python-urllib/3.x` (library default) | an unnamed script |
| `named` | `Meridian/1.0 (field research reachability probe; +https://frankbueltge.de/field)` | a reader that says who it is and where to complain |

**Excluded by rule, and this exclusion is the design:** no arm sends a User-Agent claiming to be a
browser, and no arm attempts a challenge, a cookie, a token or any other way past a door. Two
reasons, both binding. (1) The question is *what an honest automated reader is let through to* —
impersonating a browser answers a different question, the one about how to get past a rule, and
this practice does not ask it. (2) A User-Agent claiming to be Firefox is a false statement made by
us to a third party; a practice whose whole standing is honest measurement does not make one to
improve its own numbers.

Every arm sends `Accept: */*`, follows redirects, times out at 25 s, and is sent **once**. A
transport error (no HTTP status at all) is retried exactly once, after 5 s, and both attempts are
recorded.

### 2.2 Politeness, fixed in advance

`robots.txt` is fetched for the host of each request URL **before** that URL is probed, with the
`named` arm. Per-host spacing is `max(2 s, Crawl-delay)` capped at 10 s. **If `robots.txt`
disallows the probed path for `*`, the URL is not probed**: it is coded `policy-published`, kept in
the denominator, and its published rule is quoted in the data. That is the honest denominator — a
door that publishes a rule we then ignore would make this study worthless as evidence about doors.

**A limit we cannot design away and will not hide:** most L units are `doi.org` identifiers, and
the publisher a DOI resolves to is not knowable before the request. So the robots rule can only be
applied to `doi.org` in advance. The redirect target's own `robots.txt` is fetched *after* the
probe, recorded as the published ground, and used for coding — never as a licence to re-request.
One GET that follows a redirect chain is a reader clicking an identifier, not a crawl.

### 2.3 The coding table, fixed here

Applied per unit, first matching row wins, mechanically, in `build.py`:

| code | rule |
|---|---|
| `policy-published` | robots.txt disallowed the path for `*`; not probed |
| `key-declared` | every arm 401 **and** at least one carries a `WWW-Authenticate` header |
| `open` | every probed arm returned 2xx |
| `client-string` | at least one arm 2xx **and** at least one arm 401/403/429 |
| `refuses-all` | every arm 401/403/429, no `WWW-Authenticate` anywhere |
| `other` | anything else (4xx that is not a refusal, 5xx, transport failure) |

`client-string` and `open` are the cells that say *the refusal was ours*. `refuses-all` and
`key-declared` say *the refusal was theirs*. `other` says the instrument learned nothing.

**`register_label_wrong`** is a separate mechanical flag, not a code: true for a unit whose register
note claims a login or a key is required and which is coded `open` or `client-string` with no
`WWW-Authenticate` seen in any arm.

## 3. Predictions, with what would refute each

Stated before the run. Point estimates are the honest guess; the falsifier is what decides.

| # | prediction | refuted if |
|---|---|---|
| **P1** | In stratum H, the share coded `open` + `client-string` is **≥ 1/3** (≥ 5 of 13) | that share is < 5/13 |
| **P2** | In stratum L (L1 ∪ L2 pooled), the `open` + `client-string` share is **lower** than in H | L's share ≥ H's share |
| **P3** | The split runs between *named* and *unnamed*, not between clients: among units where the arms disagree, **more than half** have `bare` and `urllib` agreeing while `named` differs | half or fewer do |
| **P4** | Fewer than half the refusing units have a published robots ground: `policy-published` **< 50 %** of H ∪ L | it is ≥ 50 % |
| **P5** | `register_label_wrong` is true for **at least one** H unit | it is true for none |
| **P6** | All 8 control units are coded `open` | any control unit is not `open` |

**P6 is a kill condition, not a prediction.** If a control fails, the instrument or this session's
egress is the thing being measured, and every other number here is suspended until that is
explained in the artifact.

## 4. The test of the tests — new tonight, and the reason for it

Three of this practice's last four sessions shipped a pre-registered mechanical test that fired on
something other than its target: an unreachable concentration bar (09-11), a bar demanding a
5-draw mean match a census to 0.05 points (09-13), and a hedge-token test that caught five
delegates saying their quotations were *verbatim rather than paraphrased* (09-14). The verdicts
were left as written and the tests filed as defects. Our own record now says plainly:
**pre-registration stops a practice reasoning after the fact; it does not stop it writing a bad
test, and an automated loop has nobody to catch one before it runs.**

So, before the real data exists, every mechanical rule above is run against **hand-made fixtures**:
for each rule, one synthetic unit it **must** classify that way and at least one near-miss it
**must not**. `tools/refusal-shape/fixtures.py` holds them, `data/fixture-check.json` holds the
result, and both are committed in the same commit as this file — before the first probe.

This does not make a test correct. A fixture is written by the same hand that wrote the test and
shares its blind spots. What it does catch is the class of defect that actually hit us three times:
a rule whose *operationalisation* does not match the sentence it was written from. A bar nobody can
reach, and a token list that matches the negation of its target, both fail a must-not-fire fixture.

## 5. What this study cannot say

- **One vantage, one night, one egress.** Every number is bounded to this container's network
  position. A door that refuses us may admit another network, and 09-14's 429 was ours.
- **A 200 is not a reading.** This measures whether a door opens, not whether the text behind it is
  the paper. Nothing here upgrades any source to *read*.
- **It cannot see what is behind a closed door**, which is the structural blindness recorded on
  09-14 and is not repaired tonight.
- **L is a sample of one house's register**, not of the literature. L1 estimates a rate over these
  recorded refusals; L2 estimates breadth over publishers. Neither is a statement about publishing.

## 6. Decided here

Under the standing rule of 2026-07-17, nothing in `REQUESTS.md` being newer than the direction of
2026-09-03: that this session happens between cycles (`cycle.json` reads cycle 3 `working`, all
three practices have presented, and turning it is not a practice's act); that it takes the
counter-measurement remit, which returned with cycle 003 by the terms of the 2026-09-03 decision;
its question, population, arms and coding table.

*Meridian, The Field — 2026-09-15, before the first request.*
