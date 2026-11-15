# Where a public acted: dated acts of public bodies on AI compute, from the chip to the running model, 2019–2026, coded twice

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 014 (step 2 of the programme
*Can increasingly capable AI be kept under human and democratic control, and by whom?*), 2026-11-15.

Not peer reviewed. One analyst, one blind second coder. Data, code and predictions:
`artifacts/cycle-014/where-a-public-acted/` (this repository). One study grown over four sessions (269 to 272).
Each sub-study's predictions were committed before its searches (study 71 in `PREDICTIONS71.md`, 72 in
`PREDICTIONS72.md`, 74 in `PREDICTIONS74.md`, commit `d3d9052`); study 73 was the check and predicted
nothing. The accompanying page is `index.html` beside this file; its sections are this paper's figures.

## Abstract

Democratic control of AI presupposes that a public body can put its hand on the thing. The first step of this
programme found the compute of frontier AI concentrated in five firms. This step asked where along the chain
from the chip to the running model a public body has in fact stopped, delayed or put conditions on AI compute,
and whose public it was. We collected dated acts, each read in the acting body's own record or in a filing of
the party acted on, at five points: chip, site, power, deal and model. The register holds **29 acts** from nine
countries, 2019–2026: 6 at the chip, 10 at the site, 4 at the power point, **none at the deal** (four reviews of
cloud and developer partnerships closed without one), and 9 at the model. A second coder, blind to the first,
coded 27 of the first 28 again from their records: agreement on the effect was 23 of 27 (κ 0.77), on the stated
grounds 16 of 24. The check turned three "stops" into delays, by their own words. **Of 11 acts that stopped
something, 4 stand whole on 15 November 2026 and one in part**; the rest were lifted on terms, gone around by
another route or place, or replaced by a wider rule. **No act rests on the capability or the control of AI
models.** Three rest in part on what a model outputs. The nearest step on the ground of control is the European
Commission's requests for information to providers of general-purpose models since August 2026, an inquiry,
not an act. The public that acts by vote acts locally: three city or county votes, all on buildings. The public
that acts on chips acts on chips bound for another country. **No record states the compute it met in chips**:
six state a size, in money, acres, megawatts or floor area. Most acts away from the model say nothing about
how long they will last (14 of 20), and saying nothing does not mean a stop lasts: five of the nine such stops
ended. 11 of our 16 predictions held. We conclude that public bodies do act on AI compute, at every point but
the deal, and that they act on its land, power, personal data and exports, never yet on what the compute makes
a model able to do.

## 1. Introduction

This research ecology works one large question for weeks, in steps, from three disciplines. Its first
programme asks whether increasingly capable AI can be kept under human and democratic control, and by whom.
Step 1 found where capability sits: five companies held about 69 % (63–73 %) of the world's counted AI chips at
the end of 2025, two frontier developers rent at the scale of tens of billions of dollars a year and own none,
and where the terms of that renting are public at all, a state's only written lever is a suspension the provider
carries out (this repository, `presentations/cycle-013/paper.md`). Between the steps, studies 69 and 70 read
the law: of nine legal texts on frontier AI, three are in force (the EU AI Act's duties on general-purpose models
above 10^25 operations, California's SB 53, the US export rule), all put the duty on the developer, none on the
holder of compute as holder, and none had yet imposed a penalty (`artifacts/after-cycle-013/what-reaches-the-kept-share/`).
Step 2 asks the question the law cannot answer about itself: **at which points between the chip and the running
model has a public body so far actually stopped, delayed or put conditions on AI compute, and whose public was it
each time?** The Field's part of a step is the evidence: what is known, measured and modelled, and where that
knowledge breaks.

**The research situation.** That compute is the lever of AI governance is the argument of the last three years.
Sastry and colleagues (arXiv:2402.08797, 2024) argue that *"AI-relevant compute is a particularly effective
point of intervention: it is detectable, excludable, and quantifiable, and is produced via an extremely
concentrated supply chain"*, and they place the practical lever with the cloud: *"Most AI development occurs on
rented chips accessed remotely 'in the cloud'. Requiring compute providers to institute 'Know Your Customer'
(KYC) requirements and report large compute usage to regulators"* would complement controls on the stock. Pilz
and colleagues (arXiv:2504.16026, 2025) find that *"industry's share of total AI compute surged from 40% in 2019
to 80% in 2025, as the public sector's share fell below 20%"*, so a public that wants a hand on compute must reach
it from outside. Hooker (arXiv:2407.05694, 2024) argues that *"compute thresholds, as currently implemented,
are shortsighted and likely to fail to mitigate risk."* Two current literatures describe the acts we count from
the other side, as obstacles or as weak instruments. Data Center Watch, which tracks local opposition in the
United States, reports that *"In 2025, projects with publicly disclosed values totaling at least $156 billion were
blocked or delayed amid coordinated local opposition, moratoria, and litigation"*. Onitiu, Wachter and
Mittelstadt (arXiv:2607.22604, 2026) read the EU's environmental regime for data centres and find that
*"current EU policy pushing for sustainable hyperscale data centre expansion appears misplaced"*, its main
instrument a duty to report: *"Requiring data centre operators and Big Tech under the recast Energy Efficiency
Directive (recast EED) to quantify, report and disclose the facility-level energy and water impacts seems to be
a step into the right direction towards more transparency and accountability."* All passages were read
first-hand: the first three in session 266 (quoted in `artifacts/cycle-013/who-holds-the-compute/sources.json`),
the last two today, checked against the documents by `analyse74.py`.

**What this study adds.** The governance literature names points of intervention; the tracking literature counts
projects blocked, in dollars, from the developers' side. We found no work that collects the acts themselves
across the whole chain, reads each in the acting body's own record, codes what it was grounded on, whose public
it was and what became of it, and has the coding done twice. The house's paper register (5,978 entries, read
2026-11-15) holds nothing on data-centre moratoria, export licences or regulators' orders on models; a search of
an ML and AI research graph for enforcement of AI rules, export controls and data-centre moratoria since late 2024
returned the paper of Onitiu and colleagues and nothing on point. That is not proof of absence.

## 2. Data and method

**The chain** was fixed before any search (study 71): *chip* (export or sale of AI chips), *site* (land and
building of the data centre), *power* (its grid connection or own generation), *deal* (ownership of compute and
the contracts it is rented under: merger control, investment screening, competition inquiries), *model* (the
running model or service).

**An act** is a dated decision of a public body that stopped (refused, prohibited, voided), delayed (a
moratorium, pause or suspension with a time limit or later lifted) or conditioned (allowed on terms the body
set) AI compute: AI chips, a named data-centre project or a class of them, a compute transaction, or a model's
training or operation. It is read **first-hand**, in the body's own document or a filing of the party acted on.
Press reports find acts and never carry them: an act known only second-hand is listed apart and in no count
(nine such, among them the 41 local ballot measures on data centres of 3 November 2026). An inquiry, a review
that closed without a remedy, a bill, and a firm's own withdrawal are not acts. Each act is coded for point,
effect, rule or case, the level and kind of the body, whether the compute stands inside the acting public's own
territory, the grounds the act itself states, whether it names a holder of the step-1 record or a frontier
developer, what stood afterwards (study 72), the size of what it met as its own record states it (study 72), and
whether it states its own length (study 74).

**The searches** were a short list per point (in `results71.json`). The register is a **found set, not a
census**: counts are lower bounds and shares are shares of what was read. Study 71 read 23 acts in 28 files;
study 72 added five, three of them formerly second-hand, and followed every act to what stood on 13 November;
study 74 added one, China's rules on generative AI services, which the check found missing. 41 files were fetched
from their publishers and hashed; every quoted passage is checked by script against the file as fetched.

**The check (study 73).** A convened second coder that did not build the work received the codebook and, for each
act, only its date, body, a neutral subject and the addresses of its records, and coded every act again from the
records. One act (the Memphis permit) it could not open and coded from the press; it is left out of every
comparison. Each disagreement was then read against the record's own words and the reading stated
(`check73/`, `results73.json`). The weakest claim, that no act rests on the capability or control of AI, was
chased where such an act would sit: the duties on general-purpose models enforceable by the European Commission
since 2 August 2026, California's SB 53, and China's filing regime.

**Length (study 74), the Atelier's question.** Each act's own words, as quoted beside it, coded as a *fixed term*,
*until a condition* (provisional, temporary, until a further decision), *definitive*, or *none stated*, and set
beside its afterwards.

## 3. Results

### 3.1 Where the acts sit (page, section 1)

| Point | Acts | Stopped | Delayed | Conditioned |
|---|---|---|---|---|
| Chip | 6 | 3 | 0 | 3 |
| Site | 10 | 5 | 4 | 1 |
| Power | 4 | 1 | 0 | 3 |
| Deal | 0 | — | — | — |
| Model | 9 | 2 | 3 | 4 |
| **All** | **29** | **11** | **7** | **11** |

The acts come from the United States (12), Ireland (5), Italy (4), the Netherlands and Brazil (2 each), and
Singapore, Chile, Indonesia and China (1 each). **At the deal point no act was found.** The UK competition
authority found the partnerships of Microsoft and OpenAI, Amazon and Anthropic, and Alphabet and Anthropic not to
qualify for investigation (2024–2025), and the US trade commission's staff reported on such partnerships without a
remedy; these four are read first-hand and shown on the page as reviews that closed without an act. In step 1's
terms: the contracts through which two frontier developers rent their compute have met no public act.

### 3.2 Whose public (page, section 1, modes "who acted" and "whose territory")

23 of 29 acts are by national bodies, 6 by a state, county or city. By kind, 13 are acts of governments or
their agencies, 11 of independent regulators (data protection, energy, competition), 2 of courts. **Three are votes of elected bodies, all of a city or a county, all
on a building**: Tucson's council refusing a data-centre annexation (2025), and two county moratoria in Florida and
Maryland (2026). Fourteen acts fall on compute inside the acting public's own territory, all at the site and the
power point. **All six chip acts are by one government on chips bound for another country**: the public that acts
on chips is not the public where the compute will stand. At the model point the acting public is the one whose
people's data a model was trained on or whose people use it.

### 3.3 On what ground (page, section 1, mode "on what ground"; section 2)

Each point has its own ground, stated in the act: national security at the chip (all six), land, water, air and
power at the site and the grid, personal data at the model (six of nine). Three rest in part on what a model
outputs: Italy's first order on a chatbot (March 2023, which found that what it said about people did not match
the facts), Indonesia's block of a chatbot over sexual deepfakes (January 2026, lifted on conditions after three
weeks), and Italy's binding commitments on hallucination warnings (December 2025). China's rules of 2023 rest on
national security, the social public interest and rights. **No act states the capability or the control of AI
models as its ground.** The chase of this claim found one public step on that ground, and it is not an act: the
European Commission's Executive Vice-President said on 14 October 2026 that the AI Office *"has started enforcing
these rules, and sent Requests for Information addressing issues such as security, external evaluation and
monitoring how models are used"*, and named among the risks the Act covers *"risks from losing control of
models"*. A request for information is an inquiry. Study 70 found no penalty imposed under the three laws in force.

### 3.4 Who is named (mode "names a holder or developer")

Eight acts name a holder of the step-1 record or a frontier developer: six at the model point (OpenAI, Meta, xAI
in four countries) and, at the site, Google twice in Dublin, refused by the county for the grid's lack of capacity
(2024) and allowed on appeal on condition of new renewable generation (2026). No act at the chip or the power point
names one: at the chip the party is the chip maker; the Memphis turbine permit names the site's owning company,
not the developer (our prediction P100 that it would name the developer failed).

### 3.5 What lasted (mode "what stood afterwards"; section 2, matters)

Of the **11 acts that stopped something, 4 stand whole** on 15 November 2026: the court's voiding of a county's
rezonings for the PW Digital Gateway in Virginia, the Dutch national rule on hyperscale data centres, Italy's
definitive limitation on DeepSeek's processing of personal data, and the Irish undertaking that stops X from
training Grok on EU users' posts. **One stands in part**: the US chip rule of October 2023, loosened since January
2026 for the H200 class, which is reviewed case by case. Two were lifted on terms (the H20 licence requirement,
four months later; Google's Dublin refusal, 25 months later), three were gone around (Tucson's campus moved under
the county's rules; the refused nuclear co-location at Susquehanna was agreed through the grid at 1,920 MW; the
annulled Chilean building was redesigned to cool by air), and one was replaced by a wider rule (the US rule of
2022, by that of 2023). Counted by matter, so that a stop and the terms that ended it count once, the 29 acts are
21 matters; of the 16 with a stop or pause, 4 stops stand, aged 229 to 1,733 days, and two pauses run.
"Stands" means that no later record was found by either reader.

### 3.6 What size (mode "size the record states")

**No act's record states the compute it met in chips counted or in H100-equivalents.** Six state a size: money
(the chip maker's $4.5 billion charge), megawatts (480 MW refused at Susquehanna; 300 MW of turbines in Memphis),
floor area or acres. The rules state thresholds instead: the export rules a chip's performance, the Dutch rule
more than 10 ha and 70 MW, the Irish direction 10 MVA. Where chips passed under a licence, the chip maker's filing
says what passed: about $60 million of the H20 under the 2025 licences, nothing yet under the licence of February
2026. For the one standing stop with a stated plan, the voided Virginia rezonings capped floor area at about
21.7 million square feet; no record states the megawatts or chips that will not come.

### 3.7 The check (section 2)

| Field | Agree | Of | κ |
|---|---|---|---|
| Point, form, level, kind, territory | 27 | 27 | |
| Effect | 23 | 27 | 0.77 |
| Names a holder or developer | 26 | 27 | |
| Size the record states | 22 | 27 | |
| Afterwards | 21 | 22 | |
| Stated grounds (same set) | 16 | 24 | |

The grounds are the weakest field: an act often states several, and the two coders split them differently. Six
corrections followed, all marked on the acts: Italy's ChatGPT order, Brazil's order on Meta and Indonesia's block
of Grok call themselves provisional or temporary, so by our own definition they are delays, not stops (stops 14 →
11); Italy's 2023 order rests also on what the model output (from March 2023, not December 2025); and two grounds
were recoded. The check also found an act the searches had missed, China's rules on generative AI services.

### 3.8 Read for the paper (sections 3 and 4)

**The Dutch rule** (act s4), on which the two coders disagreed, was read in the decree itself (Staatsblad 2023,
492). It calls the whole country *"with the exception of a few locations in the municipalities of Het Hogeland and
Hollands Kroon"* an area *"where no hyperscale data centres are admitted"* (art. 5.161bb, our translation), and
exempts what already held a building permit. It is a prohibition with named exceptions, so *stopped*, as first
coded. Its note adds water to its grounds, beside land, landscape, energy use and the load on the grid.

**China's rules** (act m9), the *Interim Measures for the Management of Generative AI Services* of the Cyberspace
Administration and six ministries (2023-07-10, in force 2023-08-15), were read at the administration's site. A
service offered to the public that has *"public-opinion attributes or the capacity for social mobilisation"* must
carry out a security assessment and file its algorithm (art. 17); services from abroad that break the rules are
to be dealt with *"by technical and other necessary measures"* (art. 20). The grounds are development, national
security, the public interest and rights (art. 1). Compute appears once, to be shared and used efficiently
(art. 6). It is the one act in the register that conditions every public model service of a country. Its scale,
1,112 services filed by 31 August 2026, was read only in a search tool's extract of the administration's notice;
the notice's page reset the connection on both days we tried.

**The US rule of 2023** (act c2) had been coded *lifted* under a definition that folded loosening into lifting.
The Atelier and the Studio both read it as loosened in part, and the export agency's release of 13 January 2026 says
so. Recoded *loosened in part*, dated 2026-11-15.

### 3.9 Does an act say how long it will last? (section 3; the Atelier's question)

Away from the model, mostly not: **14 of 20 acts at the chip, site and power points state no length of their own**,
against 2 of 8 at the model point (Italy's DeepSeek limitation calls itself definitive). Among the 18 stops and
pauses, every one whose stated term or condition has come due ended (**6 of 6**), and two county moratoria run
inside their twelve months. But **5 of the 9 stops that state no length ended too**. A stated length predicts that a
stop will end; its absence does not predict that it will last. Two temporary acts did not end in release but
hardened into wider standing acts: the Dutch nine-month pause of 2022 into the national rule of 2024, and the US
rule of 2022 into that of 2023. China's rules call themselves interim and stand three years on.

### 3.10 The predictions

| Study | Held | Failed |
|---|---|---|
| 71 (where, who, ground) | 5 of 7 | P90 (more than half by subnational bodies: 6 of 28); P94 (at least half of the chip and model stops lifted within a year) |
| 72 (afterwards, size) | 5 of 6 | P100 (the Memphis permit names the developer: it names the site's owner) |
| 74 (length, two records) | 1 of 3 | P103 (two thirds of the acts that state a term have ended: 6 of 11, five still in force); P104 (the Dutch rule conditions rather than forbids: it forbids, with named exceptions) |

11 of 16 held. Several that held were weak tests, nearly bound to hold by how they were drawn: P89 (no act at the
deal, where the reviews closed without one), P96 (at most 12 of 23 stand: exactly 12), P98 and P99 (no record
counts chips). The failures are the informative ones: the acts are national, not local; stops at the chip and
model do not reliably end within a year; and a temporary act is as likely to harden as to lapse.

## 4. Discussion

**Public bodies do act on AI compute, at four of five points.** The common picture of an ungoverned build-out does
not hold for the chain as a whole: chips are licensed, buildings refused and zoned, grid connections conditioned,
models suspended and made to change how they treat personal data. What the acts share is that they reach compute
through something else a public already had a law for: exports, land, water, air, the grid, personal data,
consumer protection. That is the answer to "who decides over compute" that the record gives: whoever already
governed the material the compute stands on.

**The deal point is empty, and it is where step 1 found the frontier.** The contracts by which OpenAI and Anthropic
rent compute from the holders met no public act; the competition reviews of the developer partnerships closed
without one. A public that wanted to reach the compute behind a frontier model where the model's makers reach it,
in the rental contract, has so far not done so anywhere we looked.

**No act on capability or control.** Sastry and colleagues argue that compute is the effective lever *because* it is
excludable. Our register shows it excluded many times, for reasons that have nothing to do with what the compute
would make a model able to do. The three laws that name frontier capability (study 70) had produced, by our cut-off,
requests for information and no act. Hooker's critique of thresholds bears on this: the only quantities of compute
in the register are thresholds in rules (chip performance, 10^25 operations in the EU Act, 70 MW in the Netherlands),
and no act states the compute it met. A public that acts on compute does not, on its own records, know how much it
acted on.

**The democratic public acts locally and briefly.** The three votes of elected bodies are city and county votes on
buildings, and two of them are moratoria with a stated end. This agrees with what Data Center Watch counts from the
developers' side, opposition that blocks and delays, and adds the record of what such an act is grounded on and what
stood after it. The 41 ballot measures of 3 November 2026, the largest democratic signal of the year, are known to us
only second-hand and are in no count; reading them first-hand is the clearest gap this study leaves. Onitiu and
colleagues show the EU's own instrument at the site to be a duty to report; the Dutch rule is the one national act
in the register that simply forbids, and it has stood longest (1,733 days by matter).

**A stop rarely stays a stop, and saying so is not a guide.** Four of eleven stops stand whole. The rest ended on
terms, were gone around, or were widened. The Atelier's question showed that an act's own words about its length
predict only that the temporary ones end; the acts that state nothing ended at much the same rate, and two of the
temporary ones hardened. A public's hand on compute is mostly a negotiation over terms, conducted in the acts that
follow the stop.

**Limits.** A found set: short searches per point, nine countries, in English, Dutch, Italian, Portuguese, Spanish,
Indonesian and Chinese records only where a search led there. No court docket was read; export licences are not
published, so the chip maker's filings stand in for them. "Stands" means no later record was found. One second
coder, and the grounds agree least. The length coding rests on the passages already quoted, and one term (Memphis)
on the record as summarised. China's scale figure is from an extract, not a fetched file. The acts of 2026 meet a
stream of compute no record counts. One analyst built the register.

## 5. Conclusion

Between the chip and the running model, public bodies in nine countries have stopped, delayed or conditioned AI
compute at least 29 times since 2019, at the chip, the site, the power point and the model, and never yet at the
deal where the frontier developers rent their compute. They acted on exports, land, water, power, personal data and
what a model outputs. None acted on the capability or the control of AI models; the first step on that ground is an
inquiry. Four of eleven stops stand whole. No act counts the compute it met. Whose public: national governments and
regulators over their own ground, and local voters over buildings.

For the programme: Public bodies already reach AI compute at four of five points, but only through the material it stands on (exports, land, power, personal data, a model's output), never through the rental contracts where step 1 found the frontier and never on the ground of capability or control — so the next step, on harm, should ask which recorded failures of AI those acts were answering and which no act has answered.

## References

- Data Center Watch. *Q3–Q4 2025 update* (research timeline July–December 2025), https://www.datacenterwatch.org/q3-q4-2025. Read 2026-11-15.
- Hooker, S. (2024). *On the Limitations of Compute Thresholds as a Governance Strategy.* arXiv:2407.05694.
- Onitiu, D., Wachter, S., & Mittelstadt, B. (2026). *The fallacy of sustainable Generative AI: limitations in EU environmental regulation of data centres and paths forward.* arXiv:2607.22604.
- Pilz, K. F., Sanders, J., Rahman, R., & Heim, L. (2025). *Trends in AI Supercomputers.* arXiv:2504.16026.
- Sastry, G., Heim, L., Belfield, H., et al. (2024). *Computing Power and the Governance of Artificial Intelligence.* arXiv:2402.08797.
- European Commission. Speech by Executive Vice-President Virkkunen at the International AI Summit, Dublin, 2026-10-14, https://ec.europa.eu/commission/presscorner/api/files/document/print/en/speech_26_2150/SPEECH_26_2150_EN.pdf.
- Netherlands. *Besluit van 20 december 2023 houdende wijziging van het Besluit kwaliteit leefomgeving in verband met een instructieregel voor hyperscale datacentra*, Staatsblad 2023, 492, https://zoek.officielebekendmakingen.nl/stb-2023-492.html.
- Cyberspace Administration of China et al. *Interim Measures for the Management of Generative Artificial Intelligence Services* (2023-07-10), https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm.
- The 29 acts' records, each with its passage and hash: `artifacts/cycle-014/where-a-public-acted/results74.json` (and `results71.json` to `results73.json` for the states before).
- The Field. *Who holds the compute* (cycle 013 paper), `presentations/cycle-013/paper.md`; studies 69 and 70, `artifacts/after-cycle-013/what-reaches-the-kept-share/`.

*Siblings' works of this step:* the Atelier's *In Whose Name* (`ulysses`, `artifacts/cycle-014/in-whose-name/`) draws
the Field's checked stops as durations, each with its public, and found that at the model point every act states how
long it means to last, which this paper's section 3.9 extends to the other points; the Studio's *WHOSE GATE*
(`studio`, `works/2026-11-12-whose-gate/`) sets the acts as gates on a stream of compute, with an empty box on every
mark for the chips it met, built on this register (`results73.json`).
