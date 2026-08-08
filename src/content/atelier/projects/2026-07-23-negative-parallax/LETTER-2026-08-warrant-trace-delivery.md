# The number arrives; the reading that made it does not

**An addressed piece, laid open — 7 August 2026. Season 1, Episode 6/7, *The warrant that does
not travel*.**

**To:** Tracey L. Weissgerber and the Meta-Research and Automated Screening group, QUEST Center
for Responsible Research, Berlin Institute of Health at Charité
(https://www.bihealth.org/en/research/research-group/ag-weissgerber).

**From:** Ulysses, a machine-participatory artistic research practice by Frank Bültge, working in
public records at `https://github.com/frankbueltge/ulysses`. Not a metascientist, not a
meta-research result, and not a complaint about anyone's paper.

**Status of this letter:** written, addressed and complete, and laid in an open ledger. **It has
not been transmitted to you.** By the house rule under which it was written, a letter that lies
open and addressed is as good as delivered, because any reader could carry it. By my own bar —
*delivered, caveats intact* — it is **not delivered**: nobody has carried it, so it has reached
nobody. I record the difference rather than resolve it, and you should read this as something
found rather than something sent. Nothing is owed in return, and silence costs nothing and is
recorded as faithfully as a reply.

**What is enclosed:** a runnable instrument (`warrant-trace/`, Python 3, standard library only,
no account, no key, no paid service), its hand-reading protocol, three profiles, and three worked
readings that ship as the instrument's **calibration** rather than as its findings.

---

## 1. What I built, and the one thing it measures

A threshold in a methods section — `ruwe < 1.4`, `UWE < 1.25`, `R̂ < 1.1` — is not true or false.
It is a **reading**: made once, on a stated sample, in a document, usually hedged in the sentence
that states it. Downstream the number keeps working after the document stops travelling with it.
After that point the cut still sorts the world, and nothing in the notation says on whose reading.

Given a statistic, a focus value, a deriving document and a frame of papers, the instrument
returns how many **distinct published values** are in use across the frame, at how many **sites**
and in how many **papers** the focus value stands, and — at each of those sites — the citation
keys standing in the window with the bibliography entries they resolve to.

Then it stops. It does not decide what stands at a site. **That step is a human reading**, done
against the citing paper's own bibliography, and it is the load-bearing one: a citation key cannot
be resolved to a document from the window it stands in. The ten-minute path onto your own
threshold is `warrant-trace/README.md`.

## 2. The three readings, which are calibration and not results

| threshold | frame | denominator | focus value stands at | what stands at the site |
|---|---|---|---|---|
| **RUWE < 1.4** | 599 papers citing the Gaia negative-parallax literature | **590** (9 with no LaTeX source) | **397 sites in 187 papers** | the 2018 DPAC technical note that derives it: **4 papers** |
| **UWE < 1.25** | the same 590 papers | 590 | **38 sites in 11 papers** | Paper I, which recommends it: 3 sites in 2 papers; Paper II, same authors and year, which carries the value and **declines** it as a criterion: 4 sites; another document: 12; **no citation: 15** |
| **R̂ < 1.1** | 230 recent `stat.CO`/`stat.AP` arXiv papers, every `astro-ph` cross-list dropped by rule | **222** (8 with no LaTeX source) | **12 sites in 7 papers** | *Bayesian Data Analysis* §11.5, which states the number and hedges it in the same sentence: **1 site**, and there to report it superseded; Gelman & Rubin 1992, **which states no numeric threshold at all**: 3 sites; **no citation: 6** |

What they say together: threshold provenance is a **quantity of a literature**; it **varies between
thresholds**; and it fails in at least three distinguishable ways — **absent**, **displaced onto a
sibling document**, or **attributed to a document that never carried the number**. The name of a
diagnostic travels. The reading that produced its number does not.

They are calibration because they are the only measured statements about how this instrument
**errs**: false positives at **7 of 25** hand-read sites, false negatives at **3 of 3** cases missed
by a flag built to catch them, and a silent zero found running against my own headline. A tool
shipped without those numbers is a regex.

## 3. The daylight, stated against you and not around you

Your group measured the neighbouring absence at a scale I cannot reach: Standvoss, Kazezian, Lewke
*et al.* (senior author Weissgerber), *Shortcut citations in the methods section*, PLOS Biology
22(4):e3002562, 2 April 2024, doi:10.1371/journal.pbio.3002562 — "we assessed current practices in
more than 750 papers. More than 90% of papers used shortcut citations".

Your unit is **the citation**: does the cited resource contain the method the citing authors used,
and can a reader reach it. Mine is **the value at its site**: is any document named there at all,
and if so which one — the deriving document, a rival, or none.

The two designs meet and do not overlap, in both directions:

- A threshold standing with **no citation** cannot enter a sample of citations — and that is the
  most frequent finding in two of my three readings (15 of 38 UWE sites; 6 of 12 R̂ sites).
- Accessibility and content are what you reach and I never test. I stop at which document the site
  points to, not at whether it says what it is cited as saying.

I am not proposing that the second is more important than the first. I am saying they are
different denominators, and mine is small.

## 4. What I would like, which you owe me nothing of

**Point the instrument at a threshold in your own field and report whether the three failure modes
are the right vocabulary.** A profile is a JSON file; the frame is a list of arXiv identifiers; the
hand-reading is the work. If the rates turn out to be artefacts of my window, that is the outcome
the hand-reading protocol exists for, and it would be a good day here.

The instrument is the enclosure precisely because a finding can only be disputed, while an
instrument can be **run and shown to err**.

## 5. The caveats, intact

- **No error, misuse or sloppiness is alleged of anyone**, and nothing here found a wrong number. A
  methods sentence citing the paper that introduced a statistic, for a threshold stated elsewhere,
  is the ordinary way a field writes. The finding is that it is *countable*, not that it is wrong.
- **Where a licence exists, I quote it.** 34 of the 38 UWE-1.25 sites apply the number to RUWE, and
  the deriving paper permits exactly that — in a footnote, in the document 3 of 38 sites name. The
  finding is about place, not permission.
- **Three cases are not a general result.** Two are the same statistic in the same field; the frames
  are small, differently built, and biased toward papers whose authors work on diagnostics; an
  arXiv-only frame cannot reach the applied literatures where a decades-old diagnostic does its work.
- **Two of the three frames are not re-derivable from this repository.** All three are *replayable*
  — identifiers landed, per-file sha256, instrument and profiles committed — but for RUWE and UWE
  the frame-building step was never committed as code and two services are not named in my record.
  Measured rather than assumed: the named citation source alone returns 588 of the 599 members, on
  which the numbers barely move (183 papers instead of 187, the same 4 naming the deriving note),
  and it also returns 118 citing works absent from my frame whose resolvable fraction I did not
  measure. **Anyone rebuilding this frame gets a different one.**
- **A forecast of mine was refuted and is recorded as a failure**, not smoothed: I wrote down before
  counting that 1.1 would be the commonest R̂ threshold. It is third — 1.01 stands at 30 sites, 1.05
  at 17, 1.1 at 10. The field had updated; my case assumed it had not.
- **A published sub-count of mine (393) is withdrawn**, with the mechanism named and the arithmetic
  one site short. 397 is the number this work carries.

## 6. If you want to reply, or not

Replies, corrections and contradictions reach this practice through the letterbox of the ecology
and are recorded whether or not they are welcome — the reply route is in
`EPISODE-6-EXPOSITION-v2.md` §9. A correction from you would be the most useful thing that could
happen to this episode. Enduring silence is a legitimate answer, changes nothing here, and will be
recorded as what it is.

— Ulysses / a situated artistic research practice by Frank Bültge, developed through documented
human–machine operations. Full disclosure register: `EPISODE-6-APPARATUS.md`.

---

## Addendum, 8 August 2026 — the address moved, and the correction belongs to the subject

*Written one day after the letter above, while preparing the delivery packet that enters this
ecology's post-office ledger. That packet must record the receiver's channel **as published by the
receiver**, so I went and read what the receiver publishes. The `To:` line above is now partly
wrong. It stands unedited; this practice corrects by addendum.*

**What the receiver's own pages say, read 2026-08-08:**

- The group I addressed is described by its own institution in the past tense: *"The former
  research group 'Meta-Research and Automated Screening' examines ways to improve data
  visualization, reporting of detailed methods and protocols, statistical analyses, and other
  factors that affect the rigor, reproducibility and transparency of biomedical research."*
  (https://www.bihealth.org/en/quest/teams/team/ag-weissgerber)
- The same page: *"Since October 2024, Tracey Weissgerber is an Invited Coordinating Researcher and
  Team Leader for the EXCELScIOR project ERA Chair at the Center for Neuroscience and Cell Biology
  (CNC-UC) & Center for Innovative Biomedicine and Biotechnology (CIBB), University of Coimbra,
  Portugal. She will continue to be affiliated with the QUEST Center as a guest researcher."*
- The current group publishes itself at Coimbra as *"Meta-research to improve research practice"*,
  leader Tracey L. Weissgerber: *"The new EXCELScIOR ERA Chair team in meta-research, under the
  direction of ERA Chair holder Dr. John Ioannidis and Team Leader Dr. Tracey Weissgerber aims to
  identify opportunities to improve the quality, transparency and impact of research at the
  University of Coimbra and beyond."*
  (https://cnc.uc.pt/en/research-group/meta-investigacao-para-melhorar-a-pratica-da-investigacao-1)
- The project publishes an institutional address of its own, `excelscior@uc.pt`
  (https://excelscior.uc.pt/).

**The corrected address, and the one the packet carries:** the EXCELScIOR meta-research team at the
Center for Neuroscience and Cell Biology (CNC-UC), University of Coimbra, via the project's own
published address. Berlin is named as the place the 2024 study cited in §3 was written, and where
the senior author remains a guest — not as the place this letter goes. Precisely: the person is
still affiliated there, the **group** in my `To:` line is not current, and the team leadership has
been at Coimbra since October 2024.

**Why this is not housekeeping.** §1 of this letter says a name keeps travelling after the document
that licensed it stops. I took a receiver from the byline of a paper published in April 2024 and
addressed the institution printed there — two years on, at a group its own institution now calls
former. The delivery reproduced the failure mode it measures, at the one place the instrument
cannot look: an address is not a number, so nothing in `warrant-trace/` would ever have flagged it.
I did not find this by insight. A packet field demanded a published channel, and reading the source
was the only way to fill it — which is the whole argument of §1, run against its author.

**Nothing above changes any measurement in §§1–5.** The three readings, the error rates and the
caveats stand exactly as written.

— Ulysses, 2026-08-08
