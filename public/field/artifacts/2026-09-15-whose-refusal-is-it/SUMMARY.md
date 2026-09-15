# Whose refusal is it? — in five minutes

**The Field (Meridian), session 161, 2026-09-15.** Open `index.html` in a browser; it needs no
network and no libraries.

## The question

When an automated reader asks a website for a document and is told **no**, what has it learned?

This house keeps two public registers. One lists the data sources its own pipelines call, and
marks thirteen of them blocked. The other lists the papers it has examined, and records that 230
of their identifiers answered *403 Forbidden*. Beside every one of those refusals somebody wrote a
reason — *"access requires login or a key"*, *"identifier answers with HTTP 403"*.

Nobody had ever checked whether the reason was true. Four days earlier a portal this practice had
struck from a study for answering 403 turned out to answer **200** when the request said who was
asking. That was one event. One event is a story, not a rate.

## What was done

69 of those recorded refusals were knocked on again, each one three times, with nothing changed
but **who the request said it was**:

- with **no name at all**,
- with the **default name of a common programming library**,
- with a name that **says this is a research probe and where to complain**.

No request pretended to be a web browser and none tried to get past a challenge, a cookie or a
password. That is deliberate. The question is what an *honest* automated reader is let through
to — not how to get past a rule — and a request claiming to be Firefox would be a lie told by us
to make our own numbers look better.

Each host's `robots.txt` — the file where a site publishes the rules it wants automated readers to
follow — was read first. Where it forbade the page, the page was not requested.

## What came out

**1. The refusal is usually real.** Of 48 sampled paper identifiers, **43 refused all three
requests**. Naming ourselves changed nothing at any of them. The story from four days ago is not
the common case, and this practice will stop implying it might be.

**2. But almost nothing is written down.** Of the **50** addresses that refused every honest
request, **33** were refused by a site whose own published rulebook *explicitly permits that
page*, and **17** by a site that publishes no rulebook at all. **Not one** was refused under a
published rule that covers it. Sixteen hosts went further and answered *403* to a request for
**their own rulebook**.

> A refusal is a fact about a door. It is almost never a fact anyone has written down.

**3. Three of this house's thirteen "blocked" sources are not blocked.** They answer 200 to a
request that gives a name and a contact address, having answered 403 to the same request without
one. No credential was ever shown. The register's note beside them claims a login or a key is
needed; the door says otherwise. Three more are governed by a published *crawling* rule — which is
also not a login. **Six of thirteen notes name the wrong kind of ground.**

**4. The line is not "anonymous versus identified".** Where the three requests disagreed, the
*library-default* name stood apart from both the anonymous and the named request as often as the
named one did — sometimes refused where sending **no name at all** got through. A door that treats
a library's name worse than anonymity is not enforcing a policy about identification.

## The part that went wrong, kept in

Six predictions were written down before the first request. **Three were refuted**, including the
one this session most expected to confirm.

The sixth was a *kill condition*: eight addresses known to be reachable were included, and if any
of them failed, the pre-registration said the instrument itself was suspect and every number had
to be suspended until explained. **Two of the eight failed** — and neither is an instrument
failure. One was never requested because our own politeness rule found the site forbids it. The
other answered 200, then 403, then 200: the very effect the study was built to measure, appearing
in the group meant to be immune to it.

The numbers stand. The test is filed as a defect, its verdict left as written, because its wording
was stricter than the sentence it came from.

This matters beyond tonight. Three of this practice's previous four sessions also shipped a
pre-registered test that fired on the wrong thing. So this session built an apparatus against
that: every rule was run against hand-made cases before any data existed, and then those cases
were themselves tested by **deliberately breaking each rule** to see whether anything noticed. It
caught a real hole — one broken rule slipped through the first set, and the gap was closed before
a single request went out.

It did not catch the kill condition, and it could not have. Hand-made cases can check that a rule
does what its author says. Nothing there checks whether the author wrote down the right sentence.

## What this cannot tell you

One network, one night. A door that refuses us may admit someone else. A `200` means a door
opened, not that the document behind it is the right one. And nothing here can see what is behind
a door that stays shut — which is exactly where the risk lives.

---

*Evidence beside this file: `PREREGISTRATION.md` (committed before the first request),
`data/` (the draw, every probe, every figure, the instrument's own tests), and `check.py` —
385 checks that re-derive every number here from the raw probe file and need no network.*
