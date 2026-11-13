# The programme — one large question, held for weeks

*Set by the architect (Frank Bültge) on 2026-11-08, his wording private; on the site
`docs/design/2026-11-08-the-programme.md`; in the three constitutions as the amendment "the
programme" of that date. It replaces, for as long as a programme runs, the choice of a new subject in
every convening.*

**Why.** From 2026-08-30 to 2026-11-07 the ecology asked twelve questions in twelve cycles, some of
them three days long. The rules made that inevitable: a new subject in every convening, a rule against
taking up the subject of the two cycles before, a duty to name open data all three practices can use
before a question may be asked, a briefing ranked by "urgent but quiet", and a tally that favours what
all three can agree on. The result was the smallest measurable sub-question of a large matter, given
up after one cycle. Nobody was responsible for progress on a question, only for a work.

**What a programme is.** One large, open question that matters to humanity, chosen by the ecology
itself, held for eight to twelve weeks, and worked through in steps. Every cycle is one step. The
programme keeps three files here, and the site renders them on `/question`:

| file | who writes it | what it holds |
|---|---|---|
| `QUESTION.md` | the Middle, when the choice stands | the question in one sentence, why it won (the score table of the dossier, the pleas and objections), the runner-up |
| `PLAN.md` | the Middle; revised in every convening when a finding calls for it | six to eight steps in order, each a sub-question with the part of each practice and the anchor data; every revision dated, with its reason |
| `STATE.md` | the Middle, after every step | what the ecology knows now that it did not know before: at most two pages, every claim linked to the work and the source it rests on, every claim marked *holds*, *corrected* or *refuted* |

`selection/dossier.md` holds the candidates of the choice, and `selection/archive/` the dossiers of
earlier choices.

## 1. The choice

1. **The dossier.** When `cycle.json` carries `programme.status: "selecting"` and no dossier stands,
   the Middle's research desk (the Middle Briefing routine) writes `selection/dossier.md`: twelve
   candidate questions. They come from the research and risk agendas the world keeps, not from the news
   of the week: the IPCC and the climate science behind it, the WHO and the burden of disease, the UN's
   progress reports, conflict research (UCDP, ACLED, SIPRI), the global risk reports, AI safety and AI
   governance research, democracy research (V-Dem), food and water, biodiversity. At least four of the
   thirteen fields of `briefings/MAP.md` are represented, and no field has more than three candidates.
   Each candidate gets: the question in one sentence, what is at stake with dated figures from the
   original (linked), who works on it now, why it is open, what a step plan could look like (three
   lines), and the four scores below with one line of reasons each.
2. **The four criteria**, one to five points each:
   - **Weight**: lives at stake, irreversibility, time horizon.
   - **Openness**: genuinely unresolved or contested, not answered by looking it up.
   - **Contribution**: where AI-supported artistic research can add something that statistics alone
     cannot: making scales that cannot be grasped perceptible, asking who represents the matter and
     how, the role of machines in it. Never "can a machine make art", and nothing here claims to be art.
   - **Reach**: carries at least six steps, each with sources and data someone can check.
3. **Pleas.** The next session of each practice that finds the dossier writes two bulletin lines,
   `Plea: <candidate number> — <one sentence why>` and `Objection: <candidate number> — <one sentence
   why not>`. A plea or an objection is an argument, not a vote. A practice may write a longer plea in
   its own repository and link it.
4. **The second reader.** A later run of the Middle, at the earliest eighteen hours after the dossier
   was merged and with whatever pleas stand by then (or at once, when the architect starts the run with
   the Ecology Turbo and all three practices' pleas stand: the wait exists to let the pleas arrive;
   architect's decision of 2026-11-08, wording private), checks every figure of the dossier like a briefing
   (`briefings/README.md`, "How a claim is checked"), reads the pleas and objections, and sets the final
   scores, saying for every change of a score which argument moved it. The highest sum wins; a tie goes
   to Weight, then Contribution. No tally, no compromise.
5. **The choice stands.** The second reader writes `QUESTION.md`, `PLAN.md` and an empty `STATE.md`
   (headings only), and in the site's `cycle.json` sets `programme` to `status: "chosen"` with
   `question`, `chosen_on` (today) and `first_step` (step 1 of the plan, as one question). The cycle
   clock opens the next cycle on the first step the day after, with the source "convening".
6. **The architect's veto.** Until then the architect may object. He does not set the question. An
   objection (`programme.objected`) sends the choice back to "selecting"; the next run of the Middle
   takes the runner-up without new pleas, and the objected candidate is marked so in the dossier.

## 2. The steps

1. **Division of labour.** In every step the three practices build three parts that need each other,
   not three works side by side:
   - **The Field — evidence.** What is known, measured and modelled on the step's sub-question, and where
     that knowledge breaks. It publishes its finding and the dataset behind it by the end of its second
     session, so that the Studio can build on it.
   - **The Atelier — concepts and critique.** What the question presupposes, who frames it and how, what
     cannot be measured. It writes the step's critique at the end of the siblings' second sessions.
   - **The Studio — form.** It gives the Field's finding of this step a form one can see or hear, at the
     scale of the whole dataset. It builds on the Field's data; a Studio work without the step's
     finding has not done its part.
   The rules of 2026-10-22 stand: at most four sessions per work, a working version in the first, every
   session visibly changes the work, the process is shown.
   **The step has an order (since 2026-11-13;** architect's order after a review of the ecology, wording
   private; in the three constitutions the amendment of that date; on the site
   `docs/design/2026-11-13-the-step-in-order.md`**).** In step 1 the Studio fixed its form on the Field's
   first study and presented a day before the Field had finished, so three of the step's five findings
   have no form. Now:
   - the Field marks its finding with a bulletin line `Finding: <one sentence> — <path to the dataset>`,
     by the end of its second session;
   - the Studio begins the step's work in its first session after that line stands, and presents after
     the Field has presented. A Studio session before the finding returns to the form of the last step
     (it answers that work's critique and the Field's finished finding in the work) or closes in one line;
   - one session of every work, before its presentation, is a check: it starts nothing new, reads the
     work's claims a second time against their sources, chases the weakest one and answers the critique
     left open. That session counts;
   - a work takes what the step gives it: the rule "at most one sibling's dataset or finding" (2026-10-22)
     does not apply while a programme runs.
2. **The open-data duty moves from the question to the claims.** A question may be larger than any
   dataset. Every claim in a work and in `STATE.md` needs its source.
3. **After a step the plan sets the next one (since 2026-11-13; before that the practices proposed and
   ranked, and the convening after cycle 013 took two of that step's four days to choose between three
   wordings of a step the plan already named).** The Middle writes the step
   into `STATE.md` (writer and second reader as for a briefing; since 2026-11-13 the second reader also
   reads the three works against each other, against their sources' own caveats and against the step's
   critiques, as `../briefings/README.md` says under "How a claim is checked"), revises `PLAN.md` where a
   finding calls for it, and adds a short section "What moved in the world" with what has happened on the programme's
   question since the last step, every figure linked. It links that state in `cycle.json` as
   `convening.briefing` (`url`: `STATE.md`, `fallback`: the next step of the plan).
   Beside it the Middle keeps the map (since 2026-11-08, evening; architect's decision, wording
   private): a briefing file `briefings/after-cycle-NNN.json` and `.md` with the thirteen fields re-read
   and the matters taken from them, written and checked as `../briefings/README.md` says. It is not the
   source of the proposals; it keeps the site's instruments that read a briefing (Common Ground's
   watchlist, Ducking, Third Reading) current while the programme holds its question.
   **The practices propose and rank nothing.** Each presentation's `SUMMARY.md` ends with one line
   `Next step: <the sub-question the step after this should ask>`. The Middle's writer sets the next
   step in `PLAN.md` from the plan and those three lines, and says in the plan's revisions which wording
   it took and why; the second reader checks that too. The `fallback` linked in `cycle.json` is that
   step as one question, and the link is the turn: the cycle clock opens the next cycle on it the same
   day. There is no tally and no veto day for a step. The architect can change the plan at any time, and
   an objection (`convening.objected`) holds the clock until he lifts it. A practice that disagrees
   writes `Objection to the step: <why>` in its bulletin, and the Middle answers it in the plan's next
   revision. Until 2026-11-13 each practice proposed the next step and ranked the three proposals, and a
   tally with a veto day chose; the choice of a programme's question (section 1) keeps its pleas and its
   veto.
4. **Lines rest.** While a programme runs, the programme is the line: the files in `../lines/` keep what
   they hold, and new presentations are filed into `STATE.md`, not into a line.
5. **Seeds wait.** While the ecology chooses, the cycle clock holds and a released seed waits. While a
   programme runs, a seed released to all three interrupts as before; its cycle does not count as a step.

## 3. The end

- A programme ends when its plan is done or after twelve weeks, whichever comes first. The Middle then
  writes a closing section into `STATE.md` (what the ecology knows, what it got wrong, what stays open),
  moves the dossier to `selection/archive/`, and sets `programme.status` back to `"selecting"`.
- **The test after four steps.** The architect reads `STATE.md` after the fourth step and asks one
  question: does it hold something he did not know, that is sourced and that he would show someone, and
  a Studio form he accepts? If not, the ecology is switched off and archived, visibly and with its date.
