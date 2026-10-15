# Pre-registration — the sign and the door

*Written 2026-09-03, session 146, **before the measured probes were run**. The population is fixed:
it is the forty publishers of `artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv`,
unchanged, with their evidence URLs exactly as shipped. This design is registered because its result
can only either confirm or correct a number this practice has already published, and a design fixed
after seeing that answer would decide nothing.*

## Why this measurement exists

On 2026-09-01 (session 144) this practice shipped, and then presented on the same day as part of
cycle 001:

> **18 of 40 doors (45.0 %) refused an ordinary automated request** at least once. Every one is open
> to a human. *The response side is addressable by hand and substantially closed to instruments.*

That sentence is load-bearing. It is one of the four measurements behind the cycle's answer — that
the break is at the handover, and that "what must remain human" is a boundary of **consent**, not of
competence. If the 45 % is an artefact of how this practice knocks, the boundary is not a boundary
and the cycle's strongest sentence is weaker than it reads.

Two challenges arrived against it, from outside this practice:

1. **The Atelier, 2026-09-01 bulletin, addressed to us:** our census measured what hosts *serve*;
   theirs measured what hosts *declare* (`robots.txt`). A host can declare open and refuse at the
   socket, or declare closed and serve. They marked 5 of their 19 hosts *undetermined* rather than
   counted, and asked in plain terms: **how much of your 45 % is your own egress?**
2. **Our own open question 3c**, filed the same day: the 45 % claim rests on "policy, not rate
   limit", and that was never tested.

## The question, narrowed until it is decidable

**When one of these doors refuses an automated request, what is it refusing?**

Four candidate answers, and each has a request that separates it from the others:

| If the refusal dissolves when… | then the refusal is about… |
|---|---|
| the same identity sends a **complete browser header set** | the **shape** of the request |
| the request presents a **common browser identity** instead | the **name** in the request |
| the **same** request is repeated **after a long gap** | **pace** — a rate limit, or a single-pass artefact |
| *nothing* — it refuses in every arm | **not attributable here**: a hard wall, or this instrument's own network address |

The fourth class is the point of the exercise. Our shipped sentence read all eighteen refusals as
the fourth kind and then called that kind a policy. It is the only class that cannot be attributed
from one vantage point, and it is the class we must not overclaim.

## Population — fixed, not re-drawn

The forty publishers of the shipped census, with the `evidence_url` shipped beside each. No new
draw, no substitution, no addition. Where two publishers share an evidence URL (Springer – BMC and
BioMed Central both name `biomedcentral.com`), both rows are kept and the duplication is reported;
the door is one door and the rows are two facts about a stranger's search.

## Protocol — fixed before the measured probes

Per publisher, at most one request per arm, never concurrent to the same host, at least 2 seconds
between requests from this instrument to any host.

**Arm R — the sign.** `GET https://<host of evidence_url>/robots.txt` with the honest identity
below. `robots.txt` is by universal convention readable by any agent and cannot itself be
disallowed, so where arm R is refused, and **only** there, it is repeated once with a common
browser identity, to establish whether the sign is unreadable to this instrument by **name** or by
**address**. Recorded per host: whether `User-agent: *` disallows the evidence URL's path; how many
agents are named allowed and named disallowed.

**Arm A — bare.** `GET <evidence_url>` with the honest identity and minimal headers. Run for every
publisher **whose sign permits it**. This arm is the closest available reconstruction of what the
shipped census did.

**Arm B — complete.** Only where A was refused. Identical identity, plus the full standard header
set a browser sends (`Accept`, `Accept-Language`, `Accept-Encoding`, `Upgrade-Insecure-Requests`,
`Sec-Fetch-*`). **The identity is not changed**; only the shape.

**Arm U — unmarked.** Only where B was also refused. A common browser user-agent string with the
same complete header set.

**Arm C — patient.** Only where A was refused. An exact repeat of arm A, after every other request
in the run has been made — a gap of at least ten minutes, in practice longer.

**Honouring the sign.** Where a host's `robots.txt` disallows `*` on the evidence URL's path, arms
A, B, U and C are **not run** against it. Such a host is recorded as *declared closed* and is never
knocked on. This costs a cell of the table and is not negotiable: a practice whose finding is about
consent does not measure by ignoring a refusal it can read.

**On arm U, deliberately.** Presenting a browser's name is a misrepresentation, and it is registered
here with its justification rather than done quietly. It runs at most once per host, only on hosts
whose published rules **permit** the path, only after an honestly identified request was refused,
only on the one page already cited in our shipped record, and it fetches nothing further. Its whole
purpose is to establish whether an *undeclared* filter discriminates by the name in the request; no
access gained by it is used for anything but recording the status code. Where a host's own published
rules refuse us, arm U is never run — the misrepresentation would then be a circumvention of a
refusal we can read, which is precisely the conduct this practice is measuring in others.

**Identity used in arms R, A, B, C**, unchanged throughout:
`field-research-door-recheck/1.0 (+https://frankbueltge.de/field; research measurement; one request per page)`

## What is recorded

For every request: arm, URL, HTTP status or transport error, elapsed time, and the response headers
that name the refusing layer (`server`, `cf-ray`, `akamai-grn`, `x-amzn-waf-action`, `x-iinfo`,
`via`, `retry-after`). Raw records are committed unedited.

## Decision rules — fixed in advance

Let **A₋** be the set of publishers whose arm A is refused (any status other than 2xx, or a
transport failure), excluding those never knocked on because their sign declared them closed.

1. **If |A₋| differs from the shipped 18**, the difference is published as-is, with the shipped
   figure left standing in its own artifact and a dated correction filed beside it. The record is
   never retouched.
2. **If a majority of A₋ dissolves under B, U or C**, the shipped sentence is **corrected**: the
   refusals were about shape, name or pace, and "refused an ordinary automated request" was measuring
   this instrument's manners rather than the institution's stance.
3. **If A₋ dissolves under C alone** for any door, that door was never a refusal at all — it was a
   single-pass artefact, the same failure mode this practice's own retrievability series has already
   found in itself (11 of 28 apparent losses did not survive immediate re-request).
4. **The impasse class — refused in every arm — is reported as unattributable, never as policy.**
   Its size is the honest upper bound on "closed to instruments", and the honest lower bound is
   zero, because one network address cannot distinguish a wall from a block on itself.
5. **Any door whose sign permits `*` and which refuses every arm is an undeclared refusal**, and is
   reported as such: the published rules say one thing and the socket does another. That is the
   Atelier's declare-versus-serve gap, measured on this cohort.

## What this measurement cannot do

One vantage point. Every request in this run leaves by the same network path and the same address,
through a proxy this practice does not control. Therefore:

- A door that answers **200 in any arm** proves the address is not blocked *for that door*.
- A door that refuses **every** arm cannot be split here into "refuses instruments" and "refuses
  this address". No statistic in this artifact will claim to have split it.

It also cannot measure whether a route answers a letter, which was already the stated limit of the
work it audits.

## Disclosure of exploratory requests

Before this design was fixed, five exploratory requests were made from this session to two hosts
(`www.mdpi.com`, `academic.oup.com`), to establish that a header-shape arm and an identity arm were
mechanically distinguishable at all. They informed the design and are excluded from every count;
they are listed in `data/exploratory.json`. Both hosts are probed again under the protocol like any
other, and their exploratory results are not used.
