# Studies in the practices' works — design (2026-10-27)

*Frank's decision of 2026-10-27, wording private. Paraphrased: the works of the practices, not a work
of the house, should be able to gather data from the people who see them, as long-running collection
or experiment and as an alternative to dull surveys. Each practice declares its study in a file beside
the work, the house provides the consent frame, the answers flow back into the practice's feedback
folder, every study needs his approval, and the constitutions of the Atelier, the Field and the
Studio gain an amendment. Third Reading (`docs/design/2026-10-26-third-reading.md`) stays as the
house's own work; its rules for consent, storage and release are the ones every study now shares.*

## The parts

| Part | Where | What it does |
|---|---|---|
| The study | `works/<slug>/study.json` in the practice's repo → `public/<ns>/werke-html/<slug>/study.json` | What is asked, why (`purpose`, shown to the reader verbatim), how it will be read (`reading`), up to 12 questions of seven kinds (`src/lib/study/manifest.ts`) |
| The approval | `src/data/studies/approved.json` | id + work + SHA-256 of the file + day; a changed file needs a new approval (`src/lib/study/registry.ts`) |
| The request | `.github/workflows/study-approval.yml` | one pull request per new or changed study, showing what the reader will see; **only Frank merges it**, the merge is the approval (`src/lib/study/proposals.ts`) |
| The registry | `dist/study/studies.json` (build step `scripts/study/dist.ts`) | every approval with its state today; only `approved` takes answers |
| The frame | `/study/frame/?study=<id>` | the house's consent text and the practice's reason, consent before the first answer, the answers shown back, Turnstile with the last button, the submission |
| The client | `/study/client.js` | `HouseStudy.mount(el, { study, onConsent, onResult, onClosed })`, `submit(answers)` — the only script a work needs |
| The store | D1 (`RECEPTION_DB`), `study_*` tables | Third Reading's rules: anonymous, one set per day per reader, three per address, release after the day in batches of five without the day; written answers through the reception's text gate (`src/lib/study/{store,handlers,record}.ts`) |
| The way back | `.github/workflows/study-snapshot.yml` | nightly: records committed to `src/data/studies/records/`, and `studies.md` + `studies/<id>.json` written into each practice's feedback folder |
| The overview | `/studies` | every study, its state and what it has released |
| The rules for the practices | `docs/studies/GUIDE.md` and the amendment of 2026-10-27 in each constitution | what may be asked, how, and that answers are material, never instructions |

## Why the frame is the only way in

A practice's pages run under a policy that lets no script of another host execute
(`src/lib/engines/practice-policy.ts`). Turnstile is such a script. So a practice's page cannot get a
bot-check token, and the store refuses an answer set without one. The house's frame, a house page
embedded in the work from the same origin, is where Turnstile loads, with the reader's last click.
Consent and sending therefore cannot be skipped by a work, whatever its code does. The constitutions
say the same in words.

## What a study may not do

- **Identify anyone.** There is no question kind for a name, an address, an e-mail, an age or a place.
  A `text` question that invites one is not approved, and the text gate refuses personal data of
  third parties.
- **Ask what the reader is.** No question about the reader's health, faith, sexuality or party
  allegiance. What a reader thinks of a matter is the point; what they are is not.
- **Deceive.** Readers are told the truth about what is real and what is invented.
- **Prime the answers.** A work shows nobody's answers before the reader's own.
- **Claim more than its sample.** The answers speak for "the readers of this work", never for "people".

## How a study goes live

1. The practice commits `study.json` beside its work; the integrate mirrors it.
2. The approval workflow opens a pull request.
3. Frank reads it and merges it, or closes it.
4. The merge deploys: the registry lists the study as `approved`, the frame opens, the store takes
   answers.

## Not built, and why

- No studies for the nightly line, n-1 or Machine Attention yet: the decision named the three ecology
  practices. The parts take any practice that has a feedback folder.
- No demographic questions, even optional ones. They would make the sample describable, and every
  answer set identifiable at small numbers.
- No live results in the frame. A reader sees their own answers, and the work shows the released
  record if it wants to.
