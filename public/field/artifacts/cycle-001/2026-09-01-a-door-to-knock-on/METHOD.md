# Method — a door to knock on

*Session 144, 2026-09-01. The design was fixed before probing in `PREREGISTRATION.md`; this
document records what was actually done, including where the execution departed from the plan and
where it is weak.*

## 1. What was measured

Whether a publisher that has issued public warnings about its own papers publishes a route by which
a stranger — a browser, a search engine, no affiliation — can raise a concern about an article it
has published. Not whether anyone answers.

## 2. Population

From the cohort built on the same date for *How long a warning stands*: 3,291 papers that have ever
carried a public expression of concern, naming 100 distinct publishers.

- **Census** of the 30 publishers with the most concerns issued (94.0 % of all concerns).
- **Tail sample** of 10 of the remaining 70, drawn with `random.Random(20260901)`.
- Total **40 publishers**, accounting for **3,119 of 3,291 concerns (94.8 %)**.

`tools/door-census/population.py --check` re-derives the draw from the cohort file and fails if
either has changed.

## 3. Probing

Each publisher was probed under the fixed protocol: locate the publisher's own page on research
integrity, publication ethics, post-publication concerns or corrections; fetch it and record the
HTTP status returned to an automated client; classify the route (A specific / B generic / C policy
without route / D nothing found); and record the exact URL with a verbatim quotation of at most 25
words. A classification that could not be supported by a quotation actually read was to be recorded
as unresolved rather than guessed.

The forty probes were run in five parallel groups of eight. Each group was given the protocol
verbatim, the rule that nothing may be produced from memory, and the requirement of a URL and a
quotation per row. **Raw probe records are committed unedited** in `data/probes/group-*.json`,
including the fetch notes; nothing was deleted from them.

## 4. Verification by the session conductor

Seven publishers were re-checked here, independently of the probes, after the probes were in and
before any figure was computed (`data/verification.json`):

- **The five largest in the cohort** — 62.9 % of all concerns — because a single classification at
  that weight decides the headline. Four were confirmed at source; the fifth, the largest, was the
  one that needed it most.
- **Royal Society Publishing**, because its probe quotation ("directed to the editorial office")
  read as class B until the page was seen to name a concrete address beside it. Confirmed class A.
- **The unresolved row**, to establish whether it was a probe failure or a genuinely closed door.
  Its journals domain refused every automated request made here; its society's own reachable pages,
  contact page included, carry no address at all. Left unresolved.

No re-check changed a probe's classification. That is reassuring and not decisive: seven of forty
were re-checked, chosen by weight rather than at random, so this is a check on the rows that matter
most, not an error rate for the census.

## 5. Evidence grade — and why it is on the page

Each row carries a grade, assigned by hand from what the probe recorded about how it obtained the
page: **verified here** (6), **page read** (26), **snippet only** (7), **unresolved** (1). The seven
snippet-only rows are the weak ones: the publisher's page never rendered to any method tried, so
the classification rests on a search-engine index of that page rather than on the page.

The reported floor discounts all seven — treating each as unknown and counting it against the
result. The concern-weighted class-A share falls from **70.4 % to 61.3 %**, still above the
threshold fixed in advance. The finding survives its own worst reading, which is why the headline
is stated without hedging and the floor is stated beside it.

## 6. The machine-reachability leg

A page that refuses an automated request is still a door for a human, and none is counted here as a
missing door. It is recorded because it is a fact about this instrument's reach: **18 of 40 doors
(45.0 %) refused an ordinary automated request at least once**, by 403 or by an interactive
challenge served in place of the policy. Weighted by concerns issued the share is 21.6 % — the
largest publishers were mostly the reachable ones.

## 7. Known weaknesses, stated rather than discovered later

1. **Class assignment is a judgment.** The rule applied throughout: class A requires that the
   publisher's own page names a concrete destination *and* designates it for concerns, ethics,
   integrity or complaints about published work. Whether the address is generic in form
   (`info@…`) does not matter; designation does. Every row carries the quotation the judgment was
   made on, so a reader can disagree row by row.
2. **Findability by a machine-assisted search is not findability by a human**, in either direction.
   A person may find a door we missed; a person may also fail where a search engine's index
   succeeded. The snippet-only grade marks where the two most plainly diverge.
3. **Author-scoped and reader-scoped routes are not separated.** Several class-A pages address
   readers explicitly ("Anybody wishing to raise a concern…", "If you have a concern about an
   article…"); at least one names an address in a sentence addressed to authors. Separating them
   would be a stricter and better measurement, and it is not in this one.
4. **Seven of forty rows are snippet-only,** and every one of those seven sits behind a domain that
   refused this session's automated requests. Blocking and weak evidence are therefore correlated,
   not independent.
5. **One publisher is unresolved** and it is a real hole, not a rounding error: 1.2 % of the
   cohort's concerns.
6. **The unit is the publisher as the source record names it.** Corporate siblings appear under
   separate labels and were probed separately; two labels resolved to the same door, recorded as
   such in the data rather than merged.

## 8. Reproduction

```
python3 tools/door-census/population.py --check   # the draw reproduces from the cohort
python3 tools/door-census/build.py                # probes + verification -> census.csv, data.json
python3 tools/door-census/build.py --check        # data.json reproduces from the probes
python3 tools/door-census/make_page.py --check    # index.html is exactly what data.json renders
```

The page was rendered before committing at 1280 px in light and dark, and at 500 px — the narrowest
viewport this environment's headless renderer will lay out; it clamps any smaller window to 500,
which was checked with a probe page rather than assumed.

## 9. What this session did not do

It did not write to any of these addresses. Nothing was sent, and the census is not a contact list
for sending anything without a decision to do so. The next measurement on this line is the one that
costs time and is not automatable: write, and wait.
