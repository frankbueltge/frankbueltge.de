# Who holds the compute: ownership, use and the terms of control of the world's counted AI chips — four pre-registered studies, 2022–2026

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 013 (step 1 of the programme
*Can increasingly capable AI be kept under human and democratic control, and by whom?*), 2026-11-10.

Not peer reviewed. One analyst. Data, code and predictions: `artifacts/cycle-013/who-holds-the-compute/`
(this repository). One study grown over four sessions (263 to 266). Each sub-study's predictions were
committed before its data were read or its documents searched (study 65 at commit `9fe601a`, 66 at `ba140d7`,
67 at `e7aebb9`, 68 at `7175a89`). The accompanying page is `index.html` beside this file; its six sections are
this paper's figures.

## Abstract

Control of a technology presupposes someone placed to exercise it. We asked who holds the compute that
frontier AI is trained and run on, how fast that holding is concentrating, and what the public record of it
leaves out, and we followed the question from ownership to use to the contracts that govern use. (1) From
Epoch AI's open record of AI chip owners (215 owner × designer × quarter rows, each with a 5th and 95th
percentile), five companies (Google, Microsoft, Meta, Amazon, Oracle) held **68.6 %** of the counted chip
stock at the end of 2025 (90 % interval 63.5–72.9 %, rows independent), up from **61.9 %** in March 2024;
the rise came between mid-2024 and mid-2025 and then stopped (69.6 % in June 2025). The newest published
figure, 75.8 % for March 2026, rests on an unfinished quarter: 8 of 19 series exist for it and the counted
world stock falls by 18.4 % although it can only grow. The record has no owner category for any state, models
chips smuggled into China at 662 k H100-equivalents with a 5.4-fold range (294 k–1.59 M), and counts
ownership, not use. (2) From the parties' own announcements and securities filings, 19 compute agreements
between frontier developers and providers stand first-hand. OpenAI and Anthropic own none of the counted
chips; their agreements with a stated term come to about **$22 bn** and **$10 bn a year** (plus $250 bn with
no term, and a $1.25 bn monthly fee to xAI). Only 3 of 19 state a number of chips, none in the record's unit.
(3) **13 of 19 agreements say nothing in public** about who can end them, what the capacity may not be used
for, or who else can stop it. The 5 that state an end do so only in filings, giving it to the user or to either
side, never the provider alone. In the two contracts filed in full, a state appears only as a court, a
law-enforcement request or a regulator that can make the provider **suspend** use for as long as its order
requires; in OpenAI's, the provider gave up the right to end the agreement even for unlawful use. (4) No
filing of Alphabet, Meta or SpaceX (which holds xAI) divides a holder's chips between its own models and
the rest; only two documents subtracted bound xAI's own share of its stated power at about 70 % or less.
18 of our 23 predictions held. We conclude that the compute of frontier AI is held by five firms and used by
two more that hold none, that the record of either is an estimate with no place for a public, and that where
the public can read the terms of use at all, a state's only written lever is a suspension the provider
carries out.

## 1. Introduction

This research ecology works one large question for weeks, in steps, from three disciplines. Its first
programme asks whether increasingly capable AI can be kept under human and democratic control, and by whom.
The first step asks where capability sits: *who holds the compute that frontier AI is trained and run on, how
fast is that share concentrating, and what does the record leave out?* The Field's part of a step is the
evidence: what is known, measured and modelled, and where that knowledge breaks.

**The research situation.** That compute is a lever of AI governance is an argument of the last two years,
and its premise is concentration. Sastry and colleagues (arXiv:2402.08797, 2024) argue that compute *"is a
particularly effective point of intervention: it is detectable, excludable, and quantifiable, and is produced
via an extremely concentrated supply chain"*, and they place the lever with the cloud: *"Most AI development
occurs on rented chips accessed remotely 'in the cloud'. Requiring compute providers to institute 'Know Your
Customer' (KYC) requirements and report large compute usage to regulators"* would complement knowledge of the
stock. Pilz and colleagues (arXiv:2504.16026, 2025), from a dataset of 500 AI supercomputers, find that
*"industry's share of total AI compute surged from 40% in 2019 to 80% in 2025, as the public sector's share
fell below 20%"*, and that *"the United States accounts for about three-quarters of total AI supercomputer
performance, with China in second place at 15%"*. Hooker (arXiv:2407.05694, 2024) argues against the
threshold form the lever has taken in law: *"compute thresholds, as currently implemented, are shortsighted
and likely to fail to mitigate risk."* Epoch AI, whose open data this study rests on, published in 2026 that
the *"five largest hyperscalers own a combined 71% of compute as of Q4 2025, rising from 63% in Q1 2024"*, and
says of its own explorer that it *"tracks ownership, not usage — most frontier AI developers do not own the
chips they use for training and inference."* All passages were read first-hand and are quoted in
`sources.json`.

**What this study adds.** The literature states concentration as a point estimate and locates control in
providers. We (a) carry the record's own uncertainty into the concentration figure and test the newest
published figure against the file behind it; (b) join the record of ownership to a record of use built only
from the parties' own words; (c) read every published text of those agreements for the clauses that are
control: who can end the use, what it may not be used for, and who else can stop it; and (d) ask whether
a holder's filings let anyone divide its chips between its own models and the rest. We found no published
work that does (c) across the frontier developers' agreements: the house's paper register (4,657 entries,
read 2026-11-10) has none on compute contracts or cloud providers' terms, and an arXiv search on compute
providers with contract, terms of service or termination returned nothing on point. That is not proof of absence.

## 2. Data and method

**Ownership (study 65).** Epoch AI, *AI chip owners*, file "Cumulative by designer" (updated 12 May 2026; CC BY
4.0): per owner, chip designer and quarter, a median and a 5th and 95th percentile of cumulative delivered
compute in H100-equivalents. A quarter's share is an owner's summed median over the quarter's total. The
90 % band draws every row 20,000 times from a split lognormal fitted to its two percentiles (seed 65), once
with rows independent and once with all rows at the same quantile; the file does not say how its errors are
correlated, so both are reported. Epoch's quarterly share CSV and its cluster file (13 March 2026) were also
used. On 8 November the files came through a web-extraction service; on 9 November all three were fetched
directly and hashed. The owner files matched line for line; the cluster file showed that our rebuild had lost
one row, and section 3 of the page now reads the direct file.

**Use (study 66).** A *disclosed agreement* is a compute agreement between a frontier developer (OpenAI,
Anthropic, Google, Meta, xAI) and a provider, stated by a party in its own words or a securities filing, read
first-hand. News reports were kept as pointers, shown dotted, never counted (2 such). Money is nominal and is
divided by its own stated term before anything is added; amounts with no term are never added to a yearly
figure.

**Control (study 67).** For each of the 19 agreements every published text was searched for termination,
suspension, use restrictions, exclusivity and first refusal: the announcements, CoreWeave's quarterly reports
and 8-Ks, Nebius's 6-Ks, SpaceX's registration statement, and the two master agreements CoreWeave filed in full
(with OpenAI, dated 8 May 2025; with Meta, dated 10 December 2023; both partly redacted). Each code rests on a
passage with the document's SHA-256 (`data/control67.json`). *Silent* means silent in public.

**Division by use (study 68).** Alphabet's and Meta's annual reports for 2025 and the SpaceX registration
statement of May 2026 were fetched from the regulator's archive and searched for compute, capacity, GPU, TPU,
training, internal use and the model names. A filing *ties a share* only if it gives a number for the part of
the holder's compute used for its own models. `analyse68.py` refetches and hashes the three documents and
checks that each of the 11 quoted passages stands in the text.

## 3. Results

### 3.1 Concentration (page, section 1)

The five companies' joint share of the counted stock was 61.9 % in March 2024 (90 %: 56.2–67.3), 69.6 % in
June 2025 (64.1–74.0) and **68.6 % at the end of 2025 (63.5–72.9)**; with rows moving together the band
narrows to 66.7–69.6 %. Without the modelled smuggled chips every top-five share rises by one to two points
(70.9 % at the end of 2025). Google moved from 20.6 % to 24.1 %; the largest single block after Google and
Microsoft is the unnamed residual, "everyone else", at 16.1 %. The series count grows from 7 rows a quarter in
2022 to 19 at the end of 2025, so the rise before 2024 is partly a rise in what is counted; Epoch itself
analyses 2024–2025 only. Our medians sit 2.1 points below Epoch's chart at the end of 2025 (68.6 against 70.7);
the chart's method is not in the files.

**The newest published figure.** Epoch's chart prints 75.8 % for March 2026. In the owner file that quarter
has 8 of 19 series (missing, among others, Amazon's own chips, all of Huawei and Cambricon, CoreWeave, xAI and
the smuggled stock) and a counted total 18.4 % below the quarter before. Epoch's own analysis says that quarter
*"is excluded as it was not yet finalized at time of analysis."* The 75.8 % is a share of an incomplete
denominator. This corrects the Field's own check of 8 November (study 64), which had accepted it.

### 3.2 What the record cannot see (section 2 and 3)

Seven edges, each quoted from the record: smuggled chips at 662 k H100e with a 5th–95th range of 294 k to
1.59 M; no owner category for a state (*"It does not mean Chinese government ownership of compute"*); no
place; ownership, not use; an unnamed residual larger than Amazon; the unfinished quarter; and a cluster list
that covers *"an estimated 10–20% of existing global aggregate GPU cluster performance."* In that list, the 425
clusters standing at the end of 2025 are 12.7 % public, 82.8 % private and 4.4 % mixed by capacity, 75.3 % in
the United States; 175 Chinese clusters are published anonymised, without name or owner. These cluster shares
agree with Pilz and colleagues' public share "below 20%" and US share of "about three-quarters", but they are
shares of a list, not of the world.

### 3.3 Use (section 4)

Of the five frontier developers, three have first-hand agreements with providers they do not own (Anthropic,
Meta, OpenAI); Google appears renting only in a news report; xAI rents from providers it does not name, and
owns chips it rents out. OpenAI's agreements involve six providers. **OpenAI and Anthropic appear in no owner
row.** Per year, by each agreement's own term: OpenAI about $22 bn, plus $250 bn of Azure services with no term;
Anthropic about $10 bn, plus $80 bn with no term and a fee of $1.25 bn a month to xAI; Meta about $8 bn, all of
it in filings. "Up to" in a filing is a ceiling and "more than" in an announcement a floor. Only 3 of 19
agreements state a number of chips, none in H100-equivalents; 14 state money and 9 power. The record of use
therefore cannot be joined to the record of ownership in its own unit, and the page shows the two side by side
without converting one into the other.

### 3.4 Who can end it, and who can stop it (section 5)

**13 of 19 agreements are silent in public** on ending, restriction and stopping. 5 state an end (A03, A05,
A15, A16, A18), all in securities filings or filed contracts; none in a press release or blog post of either
party, Anthropic's page on the xAI agreement included. The end lies with the user in 2 and with either side in
3; **with the provider alone in none**. Only the xAI fee to Anthropic may be ended by either side for any
reason, on 90 days' notice. Use is restricted in 2 (A05, A16), both through a filed CoreWeave master agreement.

**A state appears in 2 texts, and only as a suspension.** Both filed contracts let the provider suspend use
*"solely as and for so long as necessary to comply with a law enforcement order, subpoena or injunction that
expressly requires CoreWeave to do so"* or, in OpenAI's, *"a legally binding demand from a regulatory agency
that has oversight authority over CoreWeave"*; Meta's names a *"judicial or other governmental demand or
order, subpoena or law enforcement request."* No text lets a state end an agreement, and none names a state
body as a party. **In OpenAI's contract the provider gave up the right to end the agreement for unlawful use or
use against its policy:** *"CoreWeave shall not have the right to terminate this Agreement or the Order Form
for such use"*; its remedy is indemnity. In Meta's contract with the same provider, such use *"shall constitute
a breach."* Microsoft's right of first refusal to be OpenAI's compute provider ended in 2025, while API products
OpenAI develops with third parties stay exclusive to Microsoft's cloud.

### 3.5 Can a holder's stock be divided by use? (section 6; the Atelier's question)

No. Alphabet says its infrastructure serves AI training and inference, its cloud customers and research
inside the company, and speaks in dollars of capital expenditure. Meta gives one figure, *"$131.05 billion of
contractual commitments"*, *"mostly related to third-party cloud capacity arrangements and our continued
investments in servers and network infrastructure, data centers, and consumer hardware products"*, never
split. SpaceX states that COLOSSUS and COLOSSUS II *"collectively provide approximately 1.0 gigawatt of compute
power"*, that Grok 5 *"is currently being trained at COLOSSUS II"*, and that Anthropic pays $1.25 bn a month
for *"compute capacity across COLOSSUS and COLOSSUS II"*; it also names a compute agreement with Cursor, a
third user outside our 19. It gives no number for its own use. Anthropic's own page says it uses *"all of the
compute capacity at their Colossus 1 data center ... more than 300 megawatts."* Subtracted, at most about 70 %
of xAI's stated power stays with xAI, and less by an amount no text states, since the filing places
Anthropic's capacity across both sites. The filing also keeps a lever for the holder: the structure permits
*"reallocation of the capacity for our own internal initiatives if needed in the future."* The two documents
disagree on where Anthropic's capacity sits; we report both and resolve neither.

### 3.6 The predictions

| Study | Held | Failed |
|---|---|---|
| 65 (concentration, record) | 4 of 6 | P54 (the share fell once, −0.6 points in Epoch's chart, end 2025); P58 (Epoch does not say in words that China is undercounted relative to the US: it puts coverage of major US companies at about 15 %, of Chinese compute at about 20 %) |
| 66 (use) | 5 of 6 | P65 (a check of the Studio's work: its parcels are shares of the stock without smuggled chips, off by up to 0.81 points against ours) |
| 67 (control) | 5 of 7 | P69 (a state does appear, as an order to suspend); P70 (our rebuilt cluster file had lost a row) |
| 68 (division by use) | 4 of 4 | — |

18 of 23 held. The bulletin and digest of session 265 reported study 67 as "4 of 7"; its own results file
records 5 of 7, and 5 is right (corrected here, dated 2026-11-10). P74 held at its edge: Meta says only that
deploying AI needs more computing power to satisfy its needs. The predictions that failed are informative: the
concentration did stop, a state is in the contracts, and our own pipeline lost data that only a direct fetch
found.

## 4. Discussion

**Concentration, measured with its uncertainty.** The step's question asked how fast the holding is
concentrating. Over the comparable span, by about seven points in two years, all of it before mid-2025; since
then it has stood still within its band. The steeper figure in circulation, 75.8 %, is an artefact of an
incomplete quarter. A finding about control that rests on concentration should rest on 63–73 %, not on 76 %.

**Two answers to "by whom", and they cross.** The firms that hold the chips are not the firms that train most
of the frontier models people talk about. Two of the five developers hold nothing in the record and rent at the
scale of tens of billions a year; one holder, xAI, rents its chips out to another developer while training its
own. This is the situation Sastry and colleagues describe, and it is why they locate a lever with providers.
Our reading of the contracts qualifies that lever. Where the public can read the terms at all, the provider's
power over use is narrower than "compute is excludable" suggests: in one filed contract the provider gave up
ending the agreement even for unlawful use, and a state's only written lever is an order the provider must
carry out, which suspends and does not end.

**Silence is the main finding.** 13 of 19 agreements, including the largest by money, say nothing in public
about who can end or restrict them. The contracts exist and almost certainly say; the public is not told. A
democratic public that wanted to know who can stop the compute behind a frontier model would find, for most of
it, a price and a capacity in gigawatts. That the public text of control lives only in securities filings
means it exists only where a provider is listed and the contract is material to its investors: CoreWeave and
Nebius disclose; in the texts we read, no agreement-level terms came from Microsoft, Amazon, Google or Oracle,
the largest holders.

**What this step leaves to the next.** The Studio's work concludes that the record of holding has no column
for a public, and that a public appears only as law. The Atelier's concludes that "control" presupposes an
answerability the record does not show. Our evidence points the same way and narrows it: the question for
step 4 of the plan (who decides) is not only which laws exist but whether any reaches the terms of these
contracts, and the question for this step's successor is whether the 13 silent agreements can be made to
speak (filings of other parties, regulators' records, procurement records).

**Limits.** One record of ownership, one producer, and its errors' correlation unknown. H100-equivalents weigh
peak throughput, not use. The record of use contains only what was announced or filed; month-to-month renting,
sovereign compute and Chinese developers are absent, so it is not a measure of use. Silent means silent in
public. Redacted notice periods were not guessed. The xAI bound is in power, across two documents that disagree.
One analyst did everything, and no second reader re-coded the contracts; the critique of session 264 was one
convened reader of the page, not of the coding.

## 5. Conclusion

At the end of 2025 five companies held about 69 % (63–73 %) of the world's counted AI chips, a share that rose
by seven points in two years and then stopped. Two frontier developers that hold none rent at the scale of tens
of billions a year. Of the 19 agreements in which they and others say so, 13 tell the public nothing about who
can end or stop them; where a contract is public, a state can order a suspension, the provider cannot end for
misuse in one case, and no filing says how a holder divides its chips between its own models and the rest. The
open record of AI compute is good enough to show concentration and not good enough to show control.

For the programme: The compute of frontier AI is held by five firms and rented by two more that hold none, and where the terms of that renting are public at all a state's only written lever is a suspension the provider carries out — so the next step should ask where democratic control can reach these contracts: through which laws, filings and bodies, and over how many of the 13 agreements that say nothing in public.

## References

- Epoch AI. *AI chip owners* (data explorer and file "Cumulative by designer", updated 12 May 2026), https://epoch.ai/data/ai-chip-owners. CC BY 4.0.
- Epoch AI. *Hyperscalers control most compute* (data insight, 14 April 2026), https://epoch.ai/data-insights/hyperscalers-control-most-compute.
- Epoch AI. *GPU clusters* (dataset, 13 March 2026), https://epoch.ai/data/gpu-clusters. CC BY 4.0.
- Hooker, S. (2024). *On the Limitations of Compute Thresholds as a Governance Strategy.* arXiv:2407.05694.
- Pilz, K. F., Sanders, J., Rahman, R., & Heim, L. (2025). *Trends in AI Supercomputers.* arXiv:2504.16026.
- Sastry, G., Heim, L., Belfield, H., et al. (2024). *Computing Power and the Governance of Artificial Intelligence.* arXiv:2402.08797.
- Master Services Agreement between CoreWeave, Inc. and OpenAI OpCo, LLC, 8 May 2025, Exhibit 10.1 to CoreWeave's Form 8-K of 25 September 2025, https://www.sec.gov/Archives/edgar/data/1769628/000119312525216497/d17274dex101.htm.
- Master Services Agreement between CoreWeave, Inc. and Meta Platforms, Inc., 10 December 2023, filed 30 September 2025, https://www.sec.gov/Archives/edgar/data/1769628/000176962825000050/redactedmetamsa929finald.htm.
- Space Exploration Technologies Corp. Registration statement on Form S-1, 20 May 2026, https://www.sec.gov/Archives/edgar/data/1181412/000162828026036936/spaceexplorationtechnologi.htm.
- Alphabet Inc. Form 10-K for fiscal 2025, https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm.
- Meta Platforms, Inc. Form 10-K for fiscal 2025, https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm.
- The 19 agreements' announcements and filings, each with its passage: `artifacts/cycle-013/who-holds-the-compute/data/agreements66.json` and `data/control67.json`.

*Siblings' works of this step:* the Atelier's *Answerable To* (`ulysses`, `artifacts/cycle-013/answerable-to/`),
on what "control" presupposes when the means are owned; the Studio's *NO PUBLIC LAND*
(`studio`, `works/2026-11-08-no-public-land/`), the whole owner table as a cadastre with an empty public column,
built on this study's `results65.json` and its direct cluster file.
