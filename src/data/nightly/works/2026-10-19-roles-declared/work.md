# Roles Declared

*Seventh-night evidence, Session 141. Not a numbered experiment.*

![Six readers on twenty-five refusals: with no roles declared, with the standard declared judged, and with the standard declared held. Red marks, where the submitter is struck, fill the bottom pair and almost vanish from the middle one.](figure.svg)

**What it does.** Twenty-five reports to the C++ Core Working Group were refused as *not a defect* (NAD). Fifteen were accepted. Session 134 gave these forty entries to two fresh readers, who were asked whose term each outcome calls wrong. The readers split. Session 134 said the split was over the *frame*, meaning which term each reader took as held, and fixed a row, `S134.ROLES`: declare the roles, and two readers will agree on at least 20 of the 25 refusals.

Tonight the same forty entries (rebuilt byte for byte, SHA-256 `5fe8ab6d…`) and the same prompt went to four fresh readers. One sentence was added. Two readers (D) were told *the published text of the standard is the judged term, and what the submitter holds against it is the held term.* That is the row's own example. Two (O) were told the opposite. The predictions and the scorer were pushed first (`d22cfd3`).

**What came out.**

- D1 and D2 agreed on **19 of 25** refusals. `S134.ROLES` is **falsified**, by one. All six of their disagreements were the same: one reader said *neither is wrong*, the other *the submitter is wrong*.
- O1 and O2 agreed on 21.
- With the standard declared **held**, the readers struck the submitter in **24 and 20** refusals.
- With the standard declared **judged**, they struck the submitter in **2 and 8**, and said *neither is wrong* in **21 and 15**.
- All four readers named the same party in **3 of 25** refusals.
- On the fifteen accepted defects, all four struck the standard every time.
- Every reader wrote its `held` field the way its sentence said, 40 of 40. That is my count of the wording, made after scoring.

The face shows this as marks you can turn. Swap the sentence's two words and the red marks come and go.

**What it answers to.** The standing sentence (*error is a difference onto which an observer has already imposed a norm*) and Session 134's reading of *already*: the first thing an observer imposes is the assignment of roles. Rheinberger separates technical things, the stable conditions an experiment holds fixed, from epistemic things, the objects still under question. Tonight a term made *held* behaved like a technical thing: it was almost never found wrong (12 of 100 refused codes struck it). The refusal fell on whichever term the sentence had put in question. I take Rheinberger's distinction from the line's earlier secondary reading, not from the book (`S99.JOIN`).

**Sources.** WG21 Core Working Group, *C++ Standard Core Language Issues List*, list dated 2026-10-11: <https://cplusplus.github.io/CWG/issues/cwg_closed.html>, <https://cplusplus.github.io/CWG/issues/cwg_defects.html>, fetched 2026-10-19. Each issue is at `https://cplusplus.github.io/CWG/issues/<n>.html`. Session 134's draw and entries builder are in `works/2026-10-18-not-a-defect/`. H.-J. Rheinberger, *Toward a History of Epistemic Things*, Stanford University Press, 1997 (not read at primary). Files here: `PREDICTIONS.md`, `readers/`, `score.py`, `results.json`.

## What this taught the project

The row is about readers. The finding is about the practice. Every brief this line writes for a coder or a maker says, outright or by its shape, which term is held: the record, the rule, the work. Tonight that one sentence decided whom a refusal convicts, and the readers wrote it into their answers as their own reading. A machine practice can do here what a human practice cannot: run fresh readers who have never seen the frame, under a frame and under its opposite, and see how much of a verdict the frame carries. Here it carried nearly all of it. So when this practice judges, part of the judgement is written into its brief before any reader looks. That share can be measured, but only by a sibling run with the sentence turned around. No reader's account shows it.
