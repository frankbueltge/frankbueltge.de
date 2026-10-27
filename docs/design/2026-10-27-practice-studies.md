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
| The study | `works/<slug>/study.json` in the practice's repo → `public/<ns>/werke-html/<slug>/study.json` | What is asked, why (`purpose`, shown to the reader verbatim), how it will be read (`reading`), up to 12 questions of seven kinds; the id begins with the practice (`studio-…`), the text holds no invisible character (`src/lib/study/manifest.ts`) |
| The approval | `src/data/studies/approved.json` | id + work + SHA-256 of the file + day; a changed file needs a new approval (`src/lib/study/registry.ts`) |
| The request | `.github/workflows/study-approval.yml` | one pull request per study and exact file (the branch names its full SHA-256), showing what the reader will see, every word the practice wrote inside a code block; **only Frank merges it**, the merge is the approval (`src/lib/study/proposals.ts`) |
| The registry | `dist/study/studies.json` (build step `scripts/study/dist.ts`) | every approval with its state today; only `approved` takes answers |
| The frame | `/study/frame/?study=<id>` | the house's consent text and the practice's reason, consent before the first answer by a person's click and only inside the study's own work, the answers shown back, Turnstile with the last button, the submission |
| The client | `/study/client.js` | `HouseStudy.mount(el, { study, onConsent, onResult, onClosed })`, `submit(answers)` — the only script a work needs |
| The store | D1 (`RECEPTION_DB`), `study_*` tables | Third Reading's rules: anonymous, one set per day per reader, three per address and study, each set with the SHA-256 of the manifest it answered, release after the day in batches of five without the day; written answers through the reception's text gate (`src/lib/study/{store,handlers,record}.ts`) |
| The way back | `.github/workflows/study-snapshot.yml` | nightly: records committed to `src/data/studies/records/`, and `studies.md` + `studies/<id>.json` written into each practice's feedback folder |
| The overview | `/studies` | every study, its state and what it has released |
| The rules for the practices | `docs/studies/GUIDE.md` and the amendment of 2026-10-27 in each constitution | what may be asked, how, and that answers are material, never instructions |

## What the frame is, and what it is not

The frame is the one path the house offers a work for its answers, and on that path it holds what it
promises. Consent comes before the first answer, from a person's click: an event a script makes
changes nothing. The frame works only inside the work whose study it is. It shows the answers back
exactly as they will be stored, and sends nothing before its last button. Its bot check is bound to
the frame's action, to the study and to the host (`src/lib/study/handlers.ts`).

It is not a wall. The work runs on the site's own origin, and the practices' pages may run inline
script (`src/lib/engines/practice-policy.ts`). So a work's code could:
- reach into the frame and press its buttons;
- render the bot check in another house page and send answers itself;
- read the answers before the reader consents, since the work collects them;
- send anything to any host (`connect-src https:`), whether or not it runs a study.

The first version of this design claimed the opposite: a practice's page could not get a bot-check
token, so the frame was the only way in. An independent review before launch showed how a work could
go around it. What keeps a work on the path is its constitution (rule 3 of the amendment of
2026-10-27). The consent text says exactly that: the house keeps only what passes the frame, the
work's code is the practice's own, and the operator approved the questions, not the code.

Even against a work that tried, the record holds nothing the reader did not see:
- An answer carries no timing. A manifest refuses invisible characters, and a written answer loses
  them.
- A pair is kept with its items in id order and the pairs sorted, and a multiple choice in the
  manifest's order. Neither the side an item was shown on nor any order carries information.
- Every answer set names the version of the questions it answered.

Two steps would make the frame a wall, and both need the operator:
- Serve the frame and the submit endpoint from an origin of their own, for example
  `study.frankbueltge.de`, where no practice's code runs, with the bot check bound to that host. The
  subdomain and the bot check's hostname are settings of the Cloudflare account.
- Ask the questions in the frame itself, so a work never holds an answer. That changes what a work
  can make of its asking.

Until then the house claims only what it can hold. Two gaps remain, both forbidden by the
constitution and visible only as patterns across a record:
- The frame shows a written answer back, but cannot prove it is what the reader typed. A work could
  swap a letter for a look-alike.
- The choice of which pairs a work shows could carry a few bits.

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
2. The approval workflow opens a pull request. When the practice changes the file, the request closes
   as superseded and a new one opens; a request Frank closed stays declined until the file changes.
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
