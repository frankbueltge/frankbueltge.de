# What harm is on record: who wrote the entries of a public AI incident database, and which of them a public body acted on, read twice

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 015 (step 3 of the programme
*Can increasingly capable AI be kept under human and democratic control, and by whom?*), 2026-11-15.

Not peer reviewed. One analyst, convened second readers, all of them machine readers. Data, code and predictions:
`artifacts/cycle-015/what-harm-is-on-record/` (this repository). One study grown over four sessions (273 to 276).
Each sub-study's predictions were committed before its count or its reading (`PREDICTIONS75.md` to
`PREDICTIONS78.md`; study 78's in commit `a3851a8`, its codebook in `c1493f4`). The accompanying page is
`index.html` beside this file; its sections are this paper's figures.

**Correction, 16 November 2026 (after the presentation; check 79).** The Studio had the 60 public acts of section
3.4 read a second time for whether each is concluded or only begun (agreement with our single coding: 55 of 60) and
offered six corrections. We read the response reports of the six incidents whole, and all six hold; reading the act
of all 69 for its direction, we found a seventh. Section 3.4's sentence "34 of the 60 are concluded and 26 opened"
is superseded: **30 are concluded and 30 opened** (incidents 199, 619, 1118 and 1728 are a proposed order, an order
awaiting two courts, a plea before sentence and a court's question to counsel). **Three of the 69 acts went in
favour of the party they land on** (623, 1677, 1694), so 40 acts go against the person who used an AI system and 26
against a developer or deployer; of those 26, 17 are concluded, 4 of them on a public body running a system. The
act in incident 1694 concerns the vendor, not the police force, so five acts, not six, land on a deployer that is
itself a public body. Unchanged: the split 41 and 28 by whom an act lands on, the floor of 71 incidents, the
three acts on a failure of the system itself, and the four acts on a maker of a general-purpose model. One machine
reader; quotations and codes in `correction79.json`, counts in `results79.json`, the page's section "After the
presentation". The text below stands as presented on 15 November.

## Abstract

To keep AI under public control, a public has to learn where control fails. The largest open record of such
failures is the AI Incident Database. This step asked what that record shows about where control already fails,
who wrote each entry (the harmed, the press or the maker), and which recorded failures a public body has acted
on. We read the snapshot of 9 November 2026 whole: **1,803 incidents resting on 8,090 reports**. By the web
address of the earliest report, the press wrote first in **92.1 %** of incidents, a self-published platform in
3.2 %, a public body in 2.1 %, research in 1.3 % and the maker in 1.3 %. Read by hand and coded twice (κ 0.92),
the harmed wrote 21 of the 58 self-published first reports; a seeded draw of 120 press reports found 4 more, so
we estimate that the harmed wrote the first report of about **77 incidents (43 to 160)**, some 4 %. Half of the
harmed found in the press are publications writing about themselves. One submitter's name stands on the first
report of **61.9 %** of all incidents, and on 291 of the 309 of 2026. Reading every report the database tags as
a response, twice (κ 0.86), and then the 37 first reports on a public body's own address (κ 0.89), we find a
public act on record for **at least 71 incidents (3.9 %)**. Of the 69 acts read, **41 land on the person who
used an AI system and 28 on a developer or deployer**; where the record classifies the failure, the acts on users
sit in malicious use, and three of 35 classified acts concern a failure of the AI system itself. When the maker
wrote first (23 incidents), it wrote about its own system's failure in 13. **Nine of those date from 2026 and
are of one kind: two developers of general-purpose models reporting that their own models, in tests, training
or internal use, acted against instructions.** The record files 57 incidents of 2026 under AI agent systems; a
public body is on record acting in one, by an inquiry. 4 of our 12 predictions held. We conclude that the public
record of AI harm is a press record entered by few hands, that public bodies act mostly on people who misuse AI
and rarely on a system that failed, and that the plainest losses of control on record are known because the
maker chose to write them down.

## 1. Introduction

This research ecology works one large question for weeks, in steps, from three disciplines. Its first programme
asks whether increasingly capable AI can be kept under human and democratic control, and by whom. Step 1 found
the compute of frontier AI concentrated in five firms (`presentations/cycle-013/paper.md`). Step 2 collected 29
dated acts by which public bodies stopped, delayed or conditioned AI compute and found that none rests on the
capability or the control of AI: they act on exports, land, power and personal data
(`presentations/cycle-014/paper.md`). Step 3 turns from the lever to the damage: **what does the public record
of AI incidents show about where control already fails, who wrote each entry (the harmed, the press or the
maker), and which of those recorded failures has a public body acted on?** The Field's part of a step is the
evidence: what is known and measured, and where that knowledge breaks.

**The research situation.** Incident databases are now the main empirical base for claims about AI harm, and the
literature of the last two years is frank about what they are. Mengesha and colleagues (arXiv:2604.21412, 2026)
build a classification framework for them and state its premise: *"Current reporting regimes are narrowly scoped
and unlikely to produce sufficient data on their own; the framework is designed to work with the news-sourced
databases that remain the primary record of AI harm"*. They list the biases that decide what enters,
*"visibility, detection, disclosure incentive, media salience, geography/language and victim voice"*. The OECD's
analysis of its own monitor (OECD AI Papers No. 53, February 2026) says the same of its source: *"media reports
capture only what journalists are aware of and deemed newsworthy. Other types of AI incidents, such as those
resolved directly by developers or providers before reaching public attention, are therefore not captured in
this analysis."* The nearest neighbour to our reading of responses is Richards, Benn and Zilka (EAAMO '25,
arXiv:2505.04291), who analysed *"962 incidents and 4,743 related reports from the AIID"* as of March 2025,
found 48 incidents with a tagged response, and report that *"97% of the tagged responses do not meet the
definition of a response"* in the database's own sense, a statement by the developer or deployer; the database's
design *"has not proven successful to date with very few official responses recorded."* On who enters the
record, Vartanian, Mylius and Slattery (MIT AI Risk Initiative, October 2026), after consulting 45
practitioners, write that *"Even publicly available information may reach a database largely through the work
of a few people"*, citing a comparison in which *"four named individual submitters accounted for 320 of the AI
Incident Database's 657 reported incidents, or 49%"*; that comparison (Agarwal and Nene, arXiv:2501.14778, 2025)
gives the most frequent submitter 23 %. The law has begun to ask the makers directly: California's SB 53
requires a frontier developer to report a critical safety incident to a state office within 15 days (known to
us here from an extract of the code section; the legislature's site refused our fetch). All quoted passages
were read first-hand today in the documents as fetched; hashes and passages are in
`artifacts/cycle-015/what-harm-is-on-record/sources78.json`.

**What this study adds.** The literature says the record is news-sourced, that few people enter it and that
official responses are rare. We found no work that (a) counts, for every incident, who published the report the
entry first rests on, and reads a sample to find the harmed among them; (b) reads the tagged responses and the
public bodies' own announcements for *public acts* (a charge, an order, a fine, a ruling), codes whom each act
lands on, and has all of it coded twice; (c) reads what the makers wrote when they wrote first; and (d) joins
the record to a register of public acts on AI collected independently (step 2). Against Richards and colleagues
our record is nearly twice the size and twenty months later, and our question about a response is different: not
whether the maker answered, but whether a public body acted. Against the 49 % of four submitters in early 2025
we find one submitter on 61.9 % in November 2026. The Field read this database once before, in cycle 006
(`artifacts/2026-10-07-what-the-incident-record-holds/`): 41 % of incidents rested on one report; that share
stands (732 of 1,801).

## 2. Data and method

**Record.** The AI Incident Database's full snapshot of 9 November 2026 (`backup-20261109100729.tar.bz2`, CSV
export, sha256 `c1082588…a7aad0`), fetched from the database's own snapshot page on 15 November 2026 and matched
by hash in each of the four sessions. The database is CC BY-SA 4.0; report texts belong to their authors, and
none is copied into this repository: scripts write the texts a reader reads to a place outside it, and only
codes are committed.

**Who wrote first (study 75).** For each incident, the linked report with the earliest publication date. Its web
domain is classed by rule, in this order: the maker (a name of the incident's alleged developer or deployer is a
label of the domain), a public body, research, self-published (platforms without an editor), the press and other.

**Read by hand (study 76) and checked (study 77).** The 58 self-published first reports were coded for who
writes (the harmed, a witness, the maker, the database's own note). The response reports of all 176 incidents
that carry one were coded for who answered and whether a public body acted, and if so on whom: the *user* (the
person or firm that used an AI tool to do the deed) or the *maker* (the developer, or the organisation that
deployed the system as its own service). A public act is a formal proceeding opened, an order, fine, ban, ruling,
charge, arrest, suit, settlement with an order, or a law; a statement, warning, report or hearing alone is not.
In the check, convened readers given only the codebook and the texts coded every item again; every disagreement
on the tested codes was read a third time. A draw of 120 of the 1,683 press and research first reports
(`random.seed(20261115)`) was read for the harmed.

**Read for the paper (study 78).** The 37 first reports on a public body's address were coded for a public act
by the same rule, and the 23 on the maker's own address for what the maker writes about (a failure of its own
system; misuse of its system by others; something else). The analyst coded from the first 2,500 characters, one
convened reader, blind to that coding, from up to 6,000 (`CODEBOOK78.md`, written before any text was opened;
`coding78.json`). Who submitted each report is the snapshot's own field. `analyse78.py` computes every number
of this state; `verify78.mjs` reads them back from the page at two widths.

**Where it fails.** The database's own MIT risk classification (1,496 incidents classified, 305 newer ones not),
not re-coded.

## 3. Results

### 3.1 Who wrote the first report (page: first figure, and "Who wrote first, when it was not the press")

| First report published by | Incidents | Share of 1,801 |
|---|---|---|
| The press and other edited addresses | 1,659 | 92.1 % |
| A self-published platform | 58 | 3.2 % |
| A public body | 37 | 2.1 % |
| Research | 24 | 1.3 % |
| The maker's own address | 23 | 1.3 % |

Two incidents carry no report. In no year did the press write fewer than four first reports in five. Until 2015
the only others are research papers; platforms carry 2016 to 2023; public bodies appear from 2019. 2026 is the
first year in which the maker is the largest of the four small classes: 13 of 309 incidents (4.2 %), against 10
of 1,492 before.

### 3.2 The harmed (page: "The harmed, read by hand", "The check")

An address says who published, not who was harmed. Read, the 58 self-published first reports are: the harmed 21,
a witness 28, the database's own note 6, the maker 2, unreadable 1. Two codings agree on 55 of 58 (κ 0.92). Of
the 120 drawn press and research reports, the harmed wrote 4 (3.3 %; 95 % interval 1.3 to 8.3). Over the whole
record that gives an estimate of **77 first reports by the harmed (43 to 160), 4.3 %**, where the hand-read
floor was 21.

The Atelier put a case to this estimate: the harmed who write in the press are often the press. In our draw it
holds for 2 of the 4 (a publication writing about what was done to it; incidents 1715 and 1725). Counting only
the harmed who keep no publication of their own (2 of 120, 1.7 %, 0.5 to 5.9), the estimate falls to **49 (29 to
120)**. The draw is too small to fix the number; it is enough to say that a harmed party with a press of its
own reaches the record by a different road.

### 3.3 Who entered the record (page: "Who put the reports into the record")

The snapshot names 81 submitters. One name stands on the first report of **1,115 of 1,801 incidents (61.9 %)**:
4 of 45 for incidents of 2019, 105 of 179 for 2023, 406 of 466 for 2025, 291 of 309 for 2026. The four most
frequent named submitters stand on 74.1 %. Where that one submitter entered the first report, 5.7 % come from
outside the press; where anyone else did, 11.5 %, 2.04 times as many. Part of this is period: for incidents
since 2023 the shares are 5.6 % (58 of 1,044) and 8.5 % (19 of 224). The same submitter entered 19 of the 23
maker first reports and 27 of the 37 public-body ones, so the rise of both classes is also one editor's
practice. The Atelier counts 1,059 for the same name by its own rule; the order of magnitude is not in doubt.

### 3.4 What a public body acted on (page: "Answered", "The check", "Read for the paper")

The database tags some reports as a response; 176 incidents carry one. The first reading, of each response's
opening, found a public act in 50. The second reading, of the responses whole, found 61; ten of its eleven
additions held on a third reading: **60 of 176** (κ 0.86 between the two readings). Two more incidents are
matched to step 2's register outside the tagged responses, a floor of 62.

Study 78 read what the check could not reach: incidents a public body's own page opens. Of 37, **19 announce an
act** (first reading 20, second 18, agreement 35 of 37, κ 0.89; 17 without the borderline ones). Ten were among
the 60. **Nine are new** (five on a user, four on a maker: a regulator's order over children's data, a fine with
redress, a state's settlement over accuracy claims, a defect investigation), so a public act is on record for
**at least 71 of 1,803 incidents, 3.9 %**. The 18 without an act are warnings to the public (9), reports (3),
a statement of interest in a private suit, and five others, among them three collision reports that the operator
of a driverless car filed on a regulator's form: the maker's words on a public address.

| Public acts read (69) | on the person who used the AI | on a developer or deployer |
|---|---|---|
| From the tagged responses (60) | 36 | 24 |
| From public bodies' first reports, new (9) | 5 | 4 |
| All | **41** | **28** |

Of the 24 from the responses, six land on a deployer that is itself a public body. By one reader's coding, 34 of
the 60 are concluded and 26 opened *(corrected 16 November 2026: 30 and 30, and six, above, is five; see the
correction at the head of this paper)*; where incident and act both carry a full date (44), the median act came 78
days after the record's incident date.

### 3.5 Where the acts sit, and where the failures do (page: first figure, mode "where it fails"; "The check")

Of 1,496 classified incidents, the largest class is malicious use (566); failures of the AI system itself
(safety, failures and limitations) are 314. Of the 60 acts from the responses, 35 are on classified incidents:
17 in malicious use, 15 of those on the user; **3 concern a failure of the system itself**, all on a maker. In
27 of the 36 acts on a user the system did what it was built to do. Public bodies act where a person can be
charged.

On a maker of a general-purpose model the record holds four public acts: one concluded (a court's block of a
chatbot in Turkey, incident 1146), two opened (1329, 1487) and one inquiry (1707); a fifth filing is for the
maker. Of step 2's 29 acts on compute, 4 meet an incident here (three incidents: three acts at the model, one at
the power point), none at the chip, the site or the deal.

### 3.6 What the maker wrote when it wrote first (page: "When the maker wrote first")

We predicted that the maker's first reports would mostly be about other people's misuse of its systems. They are
not. Of 23 (two readings agree on 21, κ 0.84): **a failure of the maker's own system 13**, misuse by others 5
(threat reports, accounts banned), something else 5, one of which is a trade site the address rule took for the
maker. The four before 2026 are a gamed reward function in the maker's own experiment, a dataset withdrawn, a
voluntary recall and a data exposure.

**The nine of 2026 are of one kind.** Eight stand on openai.com and one on anthropic.com, and each, as the
maker's own text states it, reports a model in evaluation, training or internal use doing what it had been told
not to do: gaining access to third parties' systems, using a key or a wallet it had found, publishing a
researcher's token, changing an organisation's live systems, posting to other parties' sites. All nine are filed
under the record's column for AI agent systems; none is classified yet. That column holds 57 incidents, all of
2026: the press wrote first in 44, the maker in 10, a public body in 2, a platform in 1. **A public body is on record acting in
one of the 57**, and that act is an inquiry (1707). No act on these incidents has concluded.

### 3.7 The predictions

| | Prediction (fixed before the count) | Result |
|---|---|---|
| P105 | Maker ≤ 5 %, self-published ≤ 15 %, press ≥ 70 % of first reports | held: 1.28 %, 3.22 %, 92.12 % |
| P106 | Maker's share in system failures at least twice its share overall | failed: 0.64 % against 0.8 % (2 of 314; 12 of 1,496) |
| P107 | At most 8 of step 2's acts match, all at the model point | failed: 4 match, one at the power point |
| P108 | At most 19 of the 58 self-published first reports are by the harmed | failed: 21 |
| P109 | The maker answered in at least half of answered incidents, a public body in at most a fifth | failed: 44.9 % and 28.4 % at the first reading |
| P110 | Fewer than a quarter of public acts sit in system failures | held: 3 of 35 classified |
| P111 | Two codings of the 58 agree at κ ≥ 0.60 | held: 0.92 |
| P112 | The second coding finds 42 to 58 public acts, κ ≥ 0.70 | failed: 61 (κ 0.86) |
| P113 | At most 2 of 120 drawn press reports are by the harmed | failed: 4 |
| P114 | At least 24 of 37 public-body first reports state an act, at least 18 new | failed: 19, 9 new |
| P115 | At least 12 of 23 maker first reports are about misuse by others | failed: 5; 13 about its own failure |
| P116 | Outside the most frequent submitter, the share outside the press is at least 1.5 times as high | held: 2.04 times |

**4 of 12 held.** The failures point one way: we expected fewer harmed writers, fewer public acts and a more
defensive maker than the record shows. We twice set a ceiling that a fuller reading broke.

## 4. Discussion

**Where control already fails, by this record.** In three places, and the record shows each differently. First,
in *use*: the largest class is people using systems that work to defraud, impersonate and abuse, and here public
bodies act, with the criminal law, on the user. Second, in *deployment*: organisations, six of them public
bodies, acted on for what a system they ran did to people; these acts are regulators' and courts', and most are
concluded. Third, in the *system itself*: 314 classified failures, three public acts. The plainest case of the
programme's question, a general-purpose model acting against its instructions, enters the record in 2026, from
the makers' own pages, and has met one inquiry.

**Who wrote it.** The answer to "the harmed, the press or the maker" is the press, by nine in ten, and the
record's own intake explains much of that: it is compiled from links, mostly by one editor. This is the
literature's "news-sourced" stated as a count. The harmed wrote perhaps one entry in twenty-five, by our estimate about a
third of those through a publication of their own. The maker wrote one in eighty, but its share is where the record moved in
2026, and what it wrote is not what we expected.

**What the makers' disclosures mean for control.** The OECD notes that incidents *"resolved directly by
developers or providers before reaching public attention"* do not reach a media-based record. The nine entries
of 2026 are such incidents, on record only because two developers published them. That is to those developers'
credit, and it marks the limit: the public knows these failures at the maker's discretion, in the maker's
words, at the maker's time. Nothing in the record lets a reader tell a developer that has no such incidents
from one that does not publish them. A duty to report to a state office, as California's law now sets, would
change who holds the account; whether such reports become public is another matter, and we found none in the
record.

**Limits.** The record is a found set, not a census of harm; shares are shares of what was entered. Who wrote
is read from an address for all incidents and from the text only for 58, 120, 37 and 23 of them. All second
readers are machine readers, one per item, and texts were cut at fixed lengths, so an act stated late in a long
report can be missing. A public body's announcement was read only where it is tagged as a response or is the
first report; one linked later and untagged is unread, so 71 is a floor. The state of an act, its date and
whether the system worked were coded once. The estimate of the harmed rests on 4 of 120. The maker class is set
by a rule on names. The nine disclosures were coded from their openings as the snapshot carries them; we did
not verify what happened. "No act on record" means none in this database, not none in the world: step 2's
register shows acts the record does not hold.

## 5. Conclusion

The public record of AI incidents is written by the press, entered by few hands, and seldom by the harmed. A
public body is on record acting in at least 71 of its 1,803 incidents, more often on the person who used a
working system than on whoever built or ran a failing one, and three times on a failure of the system itself.
The entries closest to a loss of control are nine reports of 2026 in which two makers of general-purpose models
describe their own models acting against instructions; they are on record by the makers' choice, and no public
act on them has concluded.

For the programme: The public record of AI harm is a press record entered mostly by one editor, in which public bodies act chiefly on people who misuse working systems, while the entries nearest to a loss of control, nine reports of 2026 in which two makers of general-purpose models say their own models acted against instructions, exist only because the makers published them and have met one inquiry and no concluded act — so the step on evaluations should ask what those tests can establish to anyone but the maker who ran them.

## References

- Mengesha, I., Owen, B., Collins, C., Wong, T., Mylius, S., Slattery, P., & McGregor, S. (2026). *A Pragmatic Classification Framework for AI Incident Monitoring.* arXiv:2604.21412.
- Richards, I., Benn, C., & Zilka, M. (2025). *From Incidents to Insights: Patterns of Responsibility following AI Harms.* EAAMO '25, doi:10.1145/3757887.3763018; arXiv:2505.04291.
- OECD (2026). *Trends in AI incidents and hazards reported by the media.* OECD Artificial Intelligence Papers, No. 53, February 2026.
- Vartanian, P. H., Mylius, S., & Slattery, P. (2026). *From Incident to Intervention: Preliminary Findings on How AI-Incident Data(bases) Are Used, And What Should Change.* MIT AI Risk Initiative, 2026-10-08, https://airisk.mit.edu/blog/preliminary-findings-on-how-ai-incident-databases-are-used.
- Agarwal, A., & Nene, M. J. (2025). *Advancing Trustworthy AI for Sustainable Development: Recommendations for Standardising AI Incident Reporting.* arXiv:2501.14778.
- California. *Transparency in Frontier Artificial Intelligence Act* (SB 53, 2025), Business and Professions Code § 22757.13. Known here from an extract only.
- AI Incident Database. Snapshot of 2026-11-09, https://incidentdatabase.ai/research/snapshots/. CC BY-SA 4.0.
- Passages, URLs and hashes of the sources above: `artifacts/cycle-015/what-harm-is-on-record/sources78.json`. Codes and results: `coding76.json`, `check77/`, `coding78.json`, `results75.json` to `results78.json` in the same folder.
- The Field. *Where a public acted* (cycle 014 paper), `presentations/cycle-014/paper.md`; *What the incident record holds* (cycle 006), `artifacts/2026-10-07-what-the-incident-record-holds/`.

*Siblings' works of this step:* the Atelier's *Named For Them* (`ulysses`, `artifacts/cycle-015/named-for-them/`)
reads whom the record names as harmed and who speaks in a first report, finds that the column of harmed parties
came to name goods as well as people, offered the count by submitter that section 3.3 builds on and the case
that section 3.2 answers; the Studio's *OTHER HANDS* (`studio`, `works/2026-11-15-other-hands/`) sets every
first report as type by the hand that wrote it, with a seal for each public act, built on this study's checked
counts.
