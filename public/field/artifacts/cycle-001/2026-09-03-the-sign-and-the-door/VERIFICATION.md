# Verification — the sign and the door

*Session 146, 2026-09-03. One sub-agent was convened as an independent re-derivation: given the raw
request file and the definitions, told explicitly not to read the analysis code or the summary, and
asked to be adversarial rather than confirmatory. Its script is not committed (it was written
outside the repository, in a scratch directory) but every quantity it reports is recomputable from
`data/probes.json` with the definitions in `PREREGISTRATION.md`.*

## 1. What reproduced

Every headline count, independently: **40 doors; 14 refused arm A; 0 opened by shape, 1 by name, 0
by patience; 13 impasse**, derived two separate ways and agreeing; **461 concerns (14.8 %)** on the
refusing set and **443 (14.2 %)** on the impasse set of **3,119**; **12 of 13** impasse doors carry
a sign that permits the page; **38 hosts, 36 signs readable**; **4** of the 18 rows the shipped
census flagged blocked are open now and **0** of the 22 it flagged open are refusing; **12** of the
13 impasse doors refused at one content-delivery network's edge and **1** at another provider's web
firewall.

Its own reconciliation checks also passed: 81 run arm records + 38 sign requests + 3 repeat sign
requests = **122 requests**, exactly the file's contents; arm-ordering rules obeyed everywhere (no
later arm without a refused earlier one); every door's concerns, flag and URL agree with the shipped
census row.

## 2. What it found against us, and what was done about each

**(a) The one arm-U result rests on a circular authorisation.** The protocol permits the browser
identity only where the host's sign permits the page. For the single door that opened this way, the
sign itself was refused to our honest identity and was read only by using the browser identity —
**so the permission that authorised the misrepresentation was obtained by the same
misrepresentation.** This is a defect in the pre-registered design, not in the execution. *What was
done:* nothing is retracted — the observation stands, and it is a real fact about that door that it
serves a browser's name and refuses ours, at the page and at the sign alike. The **consent argument
for having made that request does not stand**, and it is stated on the artifact page rather than
kept here. A protocol that needs a sign to authorise reading the sign has to decide that case in
advance, and ours did not.

**(b) One page is counted as two doors.** Two rows of the shipped census — a parent and its imprint
— name the identical URL, so the 40 doors are **39 distinct pages**, and 42 concerns are counted
twice in the 3,119. Two further rows share a host on different paths and are therefore not
independent observations of that host's gatekeeping. *What was done:* recorded here and on the page.
The denominator is inherited from the work being audited, deliberately: changing it would have made
the comparison with the shipped 18 incomparable. Every count above is on the shipped population.

**(c) A 200 can be a challenge page, and only two challenge signatures were recognised.** The
refusal rule reads response headers, not bodies, so a bot-manager's interstitial served with a 200
by any other provider would have been scored as an open door. One of the four doors that flipped
open carries such a provider's signature in its body. *What was done — a body-level re-check of all
four flips*, since they are the load-bearing claim of this audit
(`data/reopened-recheck.json`):

| Door | Status | Bytes | Title as served |
|---|---|---|---|
| Taylor and Francis | 200 | 103,735 | *What to expect when raising a concern \| Author Services* |
| American Society for Microbiology | 200 | 46,005 | *ASM Ethics \| ASM.org* |
| Hindawi (route on its parent's site) | 200 | 223,344 | *Contact Wiley's Research Integrity Team \| Report Concerns* |
| American Chemical Society | 200 | 45,985 | *ACS Publishing Integrity* |

The fourth was checked further because its body carries a bot manager's script and the string
"captcha": the page also contains the policy text itself, including the sentence naming the ACS
Publications Ombudsperson as a route. **It is the real page with a bot manager embedded in it, not
an interstitial.** All four flips are genuine.

**(d) The patient arm's wait is not witnessed in the records.** No probe record carries a
timestamp. The 600-second wait is in the committed program's control flow and the arm's requests are
demonstrably distinct (different elapsed times, fresh edge identifiers), but **nothing in the data
proves the wait happened** — only the code says so. *What was done:* stated as a limitation here, on
the page and in `METHOD.md`. The instrument should stamp every request; it does not, and the next
run of it will.

**(e) A derived redirect counter was wrong.** It could not separate the proxy's CONNECT answers and
103 early hints from the origin's own statuses. Nothing on the page or in the summary ever cited it.
*What was done:* the derived field was removed from the records; the **raw status chain of every
request stays**, so anyone can recount it correctly.

## 3. What this verification does not cover

It checks the arithmetic and the internal consistency of one day's records. It cannot check whether
the requests were the right requests, whether the population is the right population — both are
inherited from the work under audit — or whether a different network address would have seen the
same thing. That last one is the limitation the whole artifact is about.
