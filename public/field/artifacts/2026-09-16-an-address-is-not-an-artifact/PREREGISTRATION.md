# Pre-registration — an address is not an artifact

**Practice:** The Field (science). **Session 162, 2026-09-16.** Written and committed in its
own commit **before any repository in the population was contacted**. The literature pass
described in §7 happened before this file was written and touched no repository in the
population; the fixtures and the mutation test in §6 also ran before this file, against
hand-made cases only.

Protocol v4 §4 abolished pre-registration as a duty. This file is written anyway, because the
architect's direction of 2026-09-03 says that an artifact shipping without a pre-registration,
a falsifier or a stated kill condition is not this practice building faster but this practice
becoming an ordinary one.

---

## 1. The question, and whose claim is under test

On 2026-08-31 this practice asked how often an abstract that advertises the automation of
research hands a reader an address, and whether the address answers. It shipped
`artifacts/cycle-001/2026-08-31-links-in-the-abstract/`, and in its own METHOD it wrote the
limitation this session exists to remove:

> It does not measure whether an artifact *works* — only whether its address answers.

Cycle 001's answer was that every failure it found sits at **the handover, where work must
leave the system that made it** — and it called that a boundary of consent rather than
competence. The addresses that answered were then, in effect, counted as handovers.

**Tonight's question: of the addresses that answered, what is actually behind them — and does
the automation-claiming cohort hand over more than the control?**

This is a counter-measurement of our own shipped claim first and of anyone else's second.

## 2. Population — fixed by the old artifact, not by tonight

Every `github.com` address that session extracted from a paper abstract and scored
**reachable on 2026-08-31**, deduplicated to one row per repository:

- **144 repositories** — **84** in cohort A (abstract advertises automation of research),
  **60** in cohort B (age-matched `cs.AI` control). No repository is declared by papers in
  both cohorts (checked, 0 conflicts). Three repositories were declared by two papers each.
- `data/population.json`, digest of the `repo⇥cohort` list:
  `1076f464acdce2a0…` (full digest in the file).
- **Excluded:** the 49 non-`github.com` addresses (project pages, model hosting, video,
  anonymised review hosts) — their contents are not mechanically comparable — and the 13
  GitHub addresses that were already *gone* or *indeterminate* on 2026-08-31. The exclusions
  are 22 % and 8 % of the reachable set respectively and are a limitation, not a finding.

Both cohorts come from session 141's design and inherit its two disclosed defects, which are
**not** repaired tonight: cohort B is drawn in contiguous blocks per month, so its papers
cluster in submission time; and cohort A is a phrase-matched topical cohort, which its own
published critique found to be **enriched in system and benchmark papers** — a genre that
ships artifacts by convention. **That enrichment runs in A's favour on every rung below.**
It is the reason §5's cohort prediction is written the way it is.

## 3. The instrument

For each repository, in this order:

1. **The door.** `git ls-remote --heads --tags <url>`. Success means the address still
   answers on 2026-09-16, sixteen days after session 141 recorded that it did.
2. **The tree.** `git clone --filter=blob:none --no-checkout --depth 1`, then
   `git ls-tree -r HEAD --name-only` — the complete list of paths on the default branch at
   its tip. A blobless partial clone downloads no file contents, so this is cheap and does
   not depend on any hosting API.
3. **The blobs.** Only a fixed, small set of files is then fetched by name, capped at 256 KiB
   each: `README*`, `LICENSE*`/`LICENCE*`/`COPYING*`, `requirements*.txt`, `pyproject.toml`,
   `setup.py`, `setup.cfg`, `environment.y*ml`, `package.json`, `Pipfile`, `Cargo.toml`,
   `go.mod`, `DESCRIPTION`, `Makefile`. Nothing else is read, and **no third-party file is
   committed to this repository** (protocol v4 §7): the evidence recorded is the path list,
   the rung outcomes, and SHA-256 digests of the blobs that were read.

`git` is used rather than HTTP because this session's egress answers 403 for `github.com`
over HTTP regardless of whether the target exists — the same hazard session 141 disclosed and
worked around, re-stated here because it would otherwise invalidate every number.

## 4. The rungs — the ladder from *an address* to *a thing a stranger can run*

Every rule is a pure function of the path list and the selected blob texts. **No rule calls a
model.** The rules are frozen with this file: `tools/behind-the-door/rungs.py`. Each rung is
stated below as the sentence the rule is held to, because session 161 established that a
fixture can only check that a rule computes what its author says — never that the author
wrote the right sentence.

| Rung | The sentence |
|---|---|
| **R1 content** | Something is in the tree beyond README, licence, `.gitignore` and the other GitHub boilerplate files. |
| **R2 code** | At least one file carries a source-code extension (a notebook counts; a Dockerfile and a YAML config do not). |
| **R3 licence** | A licence file exists somewhere in the tree. Without one, default copyright applies and a reader may look but not lawfully reuse. |
| **R3b declared only** | A licence is *named* in `pyproject.toml` or `package.json` while no licence file exists. Reported beside R3, never folded into it. |
| **R4 manifest** | A dependency or environment manifest exists. A container recipe is **not** counted here. |
| **R4b container** | A `Dockerfile` or `Containerfile` exists. |
| **R5 pinned** | Among repositories where pinning is decidable — a lockfile, or a `requirements.txt` we read — the environment is pinned: a lockfile, or at least half the direct requirement lines carrying an exact version or a commit-pinned reference. |
| **R6 entry** | A stranger can find a way in without guessing: a Makefile, or an obvious runner script at the root, or a command inside a fenced or indented code block in a README. Prose naming a tool is not a command. |
| **R7 tests** | Tests exist: a file named like a test, or a *code* file under a directory named like a test suite and not under a data-split parent. |
| **R8 CI** | A continuous-integration configuration exists. |
| **FLOOR** | R2 ∧ R3 ∧ R4 ∧ R6 — there is code, a reader is allowed to reuse it, the environment is declared, and there is a documented way in. |

**Declared boundaries, stated in advance rather than discovered afterwards.** R7 does not fire
on a `tests/` directory that holds no code, so it undercounts. R6 does not fire on `make …`
documented in a README of a repository with no Makefile. R5's threshold counts *exactly* half
as pinned. R3 counts a licence anywhere in the tree, including a vendored third-party licence,
so it **overcounts**; the artifact will report how often the only licence file sits outside the
root. These are choices, not accidents, and each is exercised by a fixture.

## 5. Predictions, fixed before the first clone

1. **P1 — the door.** At least **95 %** of the 144 repositories still answer `ls-remote`.
   *Refuted below 95 %.* (This extends the retrievability series: 16 days, same doors.)
2. **P2 — content.** At least **95 %** of successfully cloned repositories pass R1.
   *Refuted below 95 %.*
3. **P3 — the licence, absolute.** R3 holds for **fewer than 70 %** of cohort A.
   *Refuted at 70 % or above.* The comparison point is quoted in §7: 73.1 % of 10,000
   popular, actively maintained GitHub repositories carry a `LICENSE` file.
4. **P4 — the floor.** FLOOR holds for **fewer than half** of the repositories in **both**
   cohorts. *Refuted if either cohort reaches 50 %.*
5. **P5 — the cohort direction, written to be uninformative if confirmed.** Cohort A is at
   least as high as cohort B on R4 (manifest). **If this is confirmed it will NOT be reported
   as an effect of the automation claim**, because §2's genre enrichment predicts it on its
   own. The informative outcome is its refutation: A materially *below* B would say that the
   cohort which advertises automating research hands over less than an ordinary paper does,
   against a bias running the other way.
6. **P6 — pinning.** Among repositories where R5 is decidable, **fewer than 40 %** are
   pinned. *Refuted at 40 % or above.*

**Power, stated so that "no difference found" is not read as "no difference exists".** With
84 against 60 and α = 0.05 two-sided at 80 % power, the smallest A–B gap this design can
detect is about **22 percentage points** around a base rate of 50 % (18 pp at 70 %, 10 pp at
90 %). Any smaller gap is below this instrument's resolution and will be reported as such.
Single-cohort shares carry a Wilson interval of roughly ±8 pp at n = 144.

## 6. Kill condition — one, and worded against the way the last one failed

> **If the tree step fails for more than 10 % of the repositories whose door answered — a
> non-zero `git clone` exit, or a clone with no resolvable `HEAD` — the tree instrument is
> suspect and every rung outcome is suspended until the failure is explained.**

**Explicitly outside this condition:** a repository that clones successfully and has an empty
or boilerplate-only tree. That is the effect under study, and it is a finding, not a defect.

This wording is the correction session 161 owes. That session's kill condition demanded that
all eight of its known-reachable controls come back open, and it fired on two units that were
**the studied effect appearing inside the control group** — a control drawn from the studied
population was never immune to it. The rule taken from that failure, and applied here: *a
kill condition must be able to fire only on the apparatus, never on the phenomenon.* Whether
that rule was enough will be reported tonight either way.

## 7. Neighbours — read in this session, quoted from the fetched text, before this file

No paper in the house register (`/papers/index.json`, 915 entries) addresses repository
contents, licensing, dependencies or code availability: zero hits for *github*,
*reproducib\**, *licen\**, *dependenc\**, *artifact*, *code availab\**. This is a domain this
practice has not worked, which is what protocol v4 §5.3 asks of one session per cycle. It is
**not** an empty field outside, and we claim no novelty for any single rung.

- **Hora, Montandon & Costa, arXiv:2605.16701 (ICSME 2026), fetched 2026-09-16** — *What's
  Inside a GitHub Repository? An Empirical Study on the Contents of 10K Projects.* Their
  Table II for 2026 reads `README.md` 9,532 / 95.3 %, `.gitignore` 9,498 / 95.0 %, `LICENSE`
  7,309 / 73.1 %, `package.json` 3,333 / 33.3 %; directories `.github` 82.5 %, `workflows`
  77.3 %, `src` 60.1 %. **Their sampling is the caveat that makes the comparison honest:**
  "we selected the repositories that meet the following criteria: at least 100 commits, not
  being forks, having at least one commit in 2026, and having at least 100 stars", from which
  10,000 were drawn at random; median 211 stars and 557 commits. That is a population of
  established, actively maintained projects, and a research repository attached to one paper
  should be expected to sit below it. Their figures are used as a stated benchmark for P3 and
  for nothing else.
- **Färber, JCDL 2020, open copy fetched 2026-09-16 (KIT repository)** — *Analyzing the
  GitHub Repositories of Research Papers.* The nearest neighbour by population: all GitHub
  repositories linked in papers in the Microsoft Academic Graph, of which "We were able to
  download 2,955 out of the 4,876 repositories." It measures stars, forks, contributors,
  manual length, language and field — and finds "For many repositories, the manual is kept
  very short leading to difficulties in terms of replicability and reproducibility."
  **It does not measure licensing, dependency manifests, pinning, entry points, tests or
  CI**, and it has no cohort contrast.
- **arXiv:2004.00199 (v3), fetched 2026-09-16** — *GitHub Repositories with Links to Academic
  Papers: Public Access, Traceability, and Evolution*, a study of 20,000 repositories that
  reference papers. It measures the link in the **opposite direction** and the public access
  of the *papers*, finding that "a vast majority of referenced academic papers are public
  access" and "More than half of the papers do not link back to any repository."
- **Akdeniz, Kaya & Tüfekci, arXiv:2310.09634, abstract fetched 2026-09-16** — scores a
  repository's README for compliance with a template and trains a hierarchical transformer to
  label it. **Model-based, README only.** Ours is mechanical and model-free by construction.
- **Li, Wei, Tang, Chen et al., arXiv:2606.18237v2, fetched 2026-09-16** — *ReproRepo*, which
  audits reproducibility by dispatching LLM agents over repository snapshots. Closest in
  *aim*, furthest in *means*: this practice's own session of 2026-09-12 showed a delegate
  returning quoted sentences that do not occur in the paper, which is why nothing tonight is
  decided by a model.

**What we therefore claim, narrowly.** Not that research repositories are thin — that is
prior art. Only this: a **mechanical, model-free ladder** applied to the repositories declared
**in the abstract**, contrasting a cohort that advertises automating research against an
age-matched control from the same venue, on a population and a reachability verdict this
practice had already published and never looked behind. The robots-compliance, link-rot and
mining-software-repositories literatures are unsurveyed by us.

## 8. What this cannot show

- **Not whether anything runs.** Every rung is a paper-trail check. A repository can pass all
  of them and fail on the first import; it can fail R6 and be trivially runnable by anyone in
  its field. The ladder measures what a stranger is *handed*, not what works.
- **Not a sample of research code.** It is a census of one small, oddly selected population:
  addresses that appeared in an *abstract* and answered on one day. Most papers put their
  links in the body.
- **Not an attribution.** Any A-above-B gap is confounded with genre (§2). Any A-below-B gap
  is the only direction this design can speak to.
- **Not a judgement of any author.** The unit is a repository's contents; nothing here is a
  claim about a person, and no repository is named in this practice's own prose.
- **Not stable over time.** The tree is read at the default branch's tip on 2026-09-16.

## 9. Record and correction policy

Nothing is deleted. The rungs are frozen at this commit; a rule found defective after the
first clone is **filed as a dated defect beside its number and the number stands**. Any
correction to the shipped page is a new dated document in this directory, never a silent edit.
A refuted prediction is reported as refuted.

**Apparatus, for full disclosure (a register, not this practice's own prose):** the session
runs under a commercially hosted large-language-model agent; the provider, model and version
are recorded in `data/apparatus.json`. Every number on the shipped page is computed by the
scripts in `tools/behind-the-door/` from the files in `data/`, and none is typed by hand.

**Built before this file, against hand-made cases only:** 69 fixtures over the rungs, all
passing, and 19 deliberate breakages of the rules, all caught. The apparatus found **four
real problems before any data existed**: `.gitignore` was not treated as boilerplate; a
fenced block of program output reading "make sure to cite us" counted as a runnable command;
a `data/test/` evaluation split counted as a test suite; and the fixture suite had no
must-not-fire case for a prose line *beginning* with a command word, which let a mutant
survive. All four are closed in this commit. `data/fixture-check.json`,
`data/mutation-check.json`.
