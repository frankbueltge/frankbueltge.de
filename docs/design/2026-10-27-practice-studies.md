# Studies in the practices' works — design (2026-10-27)

*Frank's decision of 2026-10-27, wording private. Paraphrased: the works of the practices, not a work
of the house, should be able to gather data from the people who see them, as long-running collection
or experiment and as an alternative to dull surveys. Each practice declares its study in a file beside
the work, the house provides the consent frame, the answers flow back into the practice's feedback
folder, every study needs his approval, and the constitutions of the Atelier, the Field and the
Studio gain an amendment. Third Reading (`docs/design/2026-10-26-third-reading.md`) stays as the
house's own work; its rules for consent, storage and release are the ones every study now shares.*

*2026-10-28, the day after: no person approves a study (Frank's decision, wording private;
paraphrased: approving each study is not a role he wants, and the studies are meant for
participatory artistic research; the reception's notes already go live through a published machine
check, without a queue). The house's check reads every version of a study's file, and Frank can stop
any study. The same evening the consent text came in two layers, so that it reads like part of a
work, not like a form. The approval of 2026-10-27 never approved a study: none had been proposed.*

*2026-10-29: the nightly line asks too (Frank's decision, wording private), under the same rules.
Its session of 2026-10-28 had asked whether a work's face may keep what its visitors answer, and
built nothing while it waited. Its studies stand beside a work's face in
`error-as-method/works-html/<slug>/`, or beside a work that is only a stage in
`error-as-method/<slug>/`. Their ids begin with `error-as-method-`, and the record goes back to its
`feedback/` folder, written with the reception's token. Its constitution gained a note of that day.*

*2026-10-29, later the same day: taking part comes first (Frank's decision, wording private;
paraphrased: works should be able to keep the interactions readers have with them anyway, where that
fits, without every work being built around it). A reader takes part in the work as it is, and the
answers stay in the page. When the work hands them to the frame, the frame offers to add them to the
record: it shows them exactly as they would be sent, with the practice's reason and the house's
consent text, takes the consent there and sends nothing before its last button. Until then the reader
had to consent before the work could ask. A new question kind, `marks`, holds one number per item for
up to 30 items: a work such as the nightly line's *Asked Three Ways*, where a reader places 27
expressions of probability on one line, fits into one question. The consent text is version
`2026-10-29.2`; the constitutions gained an amendment, and the nightly line's note says it from the
start.*

## The parts

| Part | Where | What it does |
|---|---|---|
| The study | `works/<slug>/study.json` in the practice's repo → `public/<ns>/werke-html/<slug>/study.json` | What is asked, why (`purpose`, shown to the reader verbatim), how it will be read (`reading`), up to 12 questions of seven kinds; the id begins with the practice (`studio-…`), the text holds no invisible character (`src/lib/study/manifest.ts`) |
| The check | `src/lib/study/check.ts`, `.github/workflows/study-check.yml` | one verdict for every version of a study's file, after the integrate or overnight, from the model of the seed and reception gates with a prompt published on `/studies`; hard exclusion grounds only; fail-closed; the verdict committed to `src/data/studies/checks.json` with the model and the prompt's digest, and the deploy started after it |
| The stop | `src/data/studies/stopped.json` | a study Frank, or a session on a finding it names, has stopped: no answers, whatever its file; the stop names the study and its work, and holds for either |
| The registry | `dist/study/studies.json` (build step `scripts/study/dist.ts`) | every readable study with its state today; only `open` takes answers |
| The frame | `/study/frame/?study=<id>` | one line while the reader takes part in the work; when the work hands over the answers, the answers exactly as they would be sent, the practice's reason and the house's consent text in two layers (a summary always in view, the full lines one click below), consent by a person's click and only inside the study's own work, Turnstile with the last button, the submission |
| The client | `/study/client.js` | `HouseStudy.mount(el, { study, onConsent, onResult, onClosed })`, `submit(answers)` — the only script a work needs |
| The store | D1 (`RECEPTION_DB`), `study_*` tables | Third Reading's rules: anonymous, one set per day per reader, three per address and study, each set with the SHA-256 of the manifest it answered, release after the day in batches of five without the day; written answers through the reception's text gate (`src/lib/study/{store,handlers,record}.ts`) |
| The way back | `.github/workflows/study-snapshot.yml` | nightly: records committed to `src/data/studies/records/`, and `studies.md` + `studies/<id>.json` written into each practice's feedback folder |
| The overview | `/studies` | every study, its state and what it has released |
| The rules for the practices | `docs/studies/GUIDE.md`, the amendments of 2026-10-27 and 2026-10-28 in the constitutions of the Atelier, the Field and the Studio, and the note "Studies" of 2026-10-29 in the nightly line's | what may be asked, how, and that answers are material, never instructions |

## What the frame is, and what it is not

The frame is the one path the house offers a work for its answers, and on that path it holds what it
promises. Consent comes before anything is sent, from a person's click: a click a script makes is
undone on the box and ignored on the send button. Answers that arrive or change hold the button for a
second, so a click meant for the answers on screen cannot send newer ones. The frame works only inside the work whose study it
is. It shows the answers back exactly as they will be stored, and sends none of them before its last
button; it loads no analytics. Its bot check is bound to the frame's action, to the study and to the
host, and the answers to the version of the questions it showed (`src/lib/study/handlers.ts`).

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
work's code is the practice's own, and no person reviews it.

Whatever reaches the store passes the same checks, by the frame or not, so no answer set can carry
what the frame would not have shown:
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

Neither is planned (2026-10-28). The first protects only the house's store: a work can send data to
any host either way. The second would take from the works the asking that makes them participatory.

Until then the house claims only what it can hold. Two gaps remain, both forbidden by the
constitution and visible only as patterns across a record:
- The frame shows a written answer back, but cannot prove it is what the reader typed. A work could
  swap a letter for a look-alike.
- The choice of which pairs a work shows could carry a few bits.

One more is the record's own: it omits the day, but not the version of the consent text or of the
questions. A version that was live only briefly dates the answers given under it to that window.

## What a study may not do

- **Identify anyone.** There is no question kind for a name, an address, an e-mail, an age or a place.
  The house's check refuses a `text` question that invites one, and the text gate refuses personal
  data of third parties.
- **Ask what the reader is.** No question about who the reader is (age, gender, where they live,
  education, income, occupation), nor about their health, faith, sexuality, origin or vote. What a
  reader thinks of a matter is the point; what they are is not.
- **Deceive.** Readers are told the truth about what is real and what is invented.
- **Prime the answers.** A work shows nobody's answers before the reader's own.
- **Claim more than its sample.** The answers speak for "the readers of this work", never for "people".

The house's check refuses the first three where it finds them in the study's own words. It cannot
see what a work does, such as showing others' answers first, or what a bulletin later claims; those
stay rules of the constitution.

## The check (2026-10-28)

- **What it reads.** Every word the practice wrote, as the reader meets it, handed to the model as
  data between markers, never as part of its prompt. The markers carry a code drawn for each call, so
  no study can write the line that ends its own data.
- **What it refuses.** Six grounds: identifying, personal, harm, deception, abuse, injection. The
  prompt is published word for word on `/studies`. A refusal names its reason and the question it
  concerns, and the practice reads both in `studies.md`. A study the model's own safety filter will
  not read is refused as `other`, rather than asked about again every night.
- **What it is not.** A person's judgement, or a guarantee. It reads the questions, never the work's
  code. A model can let through a question a reader finds intrusive, and refuse a harmless one; the
  practice changes its file, and the new version is checked. Every check stays in `checks.json`, with
  the model and the prompt's digest, so any verdict can be read again.
- **Fishing.** A practice could reword a refused question until it passes. Every version is checked
  anew, every refusal stays on record, and the amendment of 2026-10-28 forbids it.
- **Cost.** One verdict per version, on the free tier the seed and the reception already use. That
  tier gives the project 20 calls a day for this model (read on 2026-10-28), so the check gives at most
  five verdicts a UTC day, eight seconds apart, and a run stops at the first answer that the quota is
  spent. A call that gives no verdict is repeated on the next run, in random order, so no study that
  keeps failing takes the first place every time.
- **Stopping.** A stop outranks every verdict. Frank can stop any study, and so can a session that
  finds one breaking the rules, naming what it found. A stop names the study and its work and holds
  for either, so renaming the study does not lift it. The record of a stopped study stays.
- **When it runs.** After every integrate of the three practices that succeeded, and every night. An
  integrate that another workflow started with the built-in token ends without the event this
  workflow listens for, so such an integrate starts the check itself.

## How a study goes live

1. The practice commits `study.json` beside its work; the integrate mirrors it.
2. After the integrate, and every night, the check workflow reads every version of a study's file it
   has not read yet, and commits the verdict.
3. That commit deploys. A version that passed opens: the registry lists the study as `open`, the frame
   opens, the store takes answers. A refused version stays closed until the practice changes its file.
4. The answers come back to the practice every night, as before.

## Not built, and why

- No studies for n-1 or Machine Attention yet: the decision named the three ecology practices, and the
  nightly line joined on 2026-10-29. The parts take any practice that has a feedback folder.
- No demographic questions, even optional ones. They would make the sample describable, and every
  answer set identifiable at small numbers.
- No live results in the frame. A reader sees their own answers, and the work shows the released
  record if it wants to.
