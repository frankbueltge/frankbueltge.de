# Study 90 — codebook, written before any instrument is read

*Session 288, 2026-11-22. Cycle 018, step 6 of the programme, first session. Written with the predictions
(`PREDICTIONS90.md`) and before any instrument below was opened in this session.*

## Corpus, fixed by rule

Every instrument of a public body (a legislature, a government or ministry, a regulator, a public standards body, an
intergovernmental body, or a group of governments or of public authorities) that this programme has read or recorded:

**(a) the seven of study 83** (step 4, the instruments the *International AI Safety Report 2026* names in its section
3.2), read at the addresses study 83 recorded (`../../cycle-016/what-a-test-can-show/coding83.json`) and as they stand
today: the EU AI Act; the EU General-Purpose AI Code of Practice, Safety and Security chapter; South Korea's Framework
Act on AI; California SB 53; China's AI Safety Governance Framework 2.0; the Expanded ASEAN Guide on AI Governance and
Ethics, Generative AI; the G7 Hiroshima AI Process International Code of Conduct.

**(b) every instrument** that the programme's state, section "What moved in the world" (research-ecology commit
7029347, `programme/STATE.md`, sha256 19d2703e…6798c028), records as adopted, signed, enacted or in force. By that rule
four: the *Paris Call for AI safety and security* (signed 2026-11-09); New York's RAISE Act (General Business Law
§ 1420 ff., duties from 2027-01-01); the Bureau of Industry and Security's interim final rule of 2026-11-19 (91 FR
74970); the Global Privacy Assembly's resolution on privacy-protective agentic AI (adopted at its 48th conference).

Out by the rule: announcements, statements, recommendations, committee reports, the outline or summary of a bill, a
lawsuit, the creation of an office, and every company's own document. An instrument the state does not record is
outside the corpus, a limit.

## The unit: a signal

A **signal** is one duty (law) or commitment or measure (voluntary text) that has a named party **record, report,
notify, publish, disclose, register, log, share or submit** information about advanced AI models or systems (their
capability, evaluation results, risks, incidents, malfunctions or conduct, or the compute and access they run on) to a
named receiver, or keep it for one. One signal per distinct reporter, content, receiver and occasion. Out: duties only
to inform users that they deal with AI, to label content, to summarise training data or to respect copyright;
sector-specific duties for AI systems that are not general-purpose or frontier models, where the instrument separates
the two (in the EU AI Act, the chapter on general-purpose models is read, with the definitions it relies on);
a body's own powers, except where they set a duty on a party. Where the text has one passage for several contents to
one receiver at one occasion, it is one signal.

**Finding them.** Each text is searched for: *report, notif, inform, disclos, publish, public, register, record, log,
document, keep, share, submit, transmit, provide*. Every passage found is read in context; each passage that sets a
signal is quoted (at most 40 words) with its article, section or page.

## Codes, one set per signal

1. **binding** — `law` (a statute or regulation in force on 2026-11-22, or one whose duty applies from a fixed date) or
   `voluntary` (a code, guide, framework, call or resolution no one must follow), as the instrument states.
2. **kind** — `incident` (an event that happened), `evaluation` (results of a test or assessment of capability or
   risk), `framework` (a published policy for managing risk, with or without thresholds), `inventory` (a registration
   or notification that a model exists or meets a threshold), `compute` (compute, customers or access), `log` (a
   record kept of the system's own operation, decisions or actions), `channel` (a way for persons to report).
3. **unit** — does the text say what the signal counts? `quantity` (a number in a stated unit), `defined` (the
   reportable event or content is defined in the text or a text it cites), `named only` (the information is named and
   what qualifies is not said).
4. **trigger** — what makes the signal move: `before deployment` (before release or placing on the market, or when a
   threshold is met in development), `schedule` (kept continuously or due on a fixed schedule), `event short of harm`
   (a conduct, a near miss, an access or a malfunction that need not have caused harm), `harm` (only an event that
   caused, or is likely to have caused, harm), `on request` (only when a body asks). **Before harm** is `yes` for the
   first three, `no` for the last two.
5. **deadline** — the longest delay the text allows between the occasion and the record reaching its receiver, in
   hours (a day is 24); `prompt, no number` for "immediately" or "without undue delay"; `none`. Where a text sets
   several deadlines for one signal, the shortest and the longest are both recorded. **Clock** — what the deadline runs
   from: `awareness` (discovery, determination, becoming aware, establishing a link), `occurrence`, `before an act`,
   `schedule`, `none`.
6. **receiver** — who reads it first: `public`, `public body` (named), `own record` (the party keeps it), `other party`
   (downstream providers, deployers, users, other developers). **Public** — `public` if the instrument's own rule
   publishes the content of this signal, in full or as a summary of each report; `aggregate only` if a body publishes
   only statistics across reports; `not public`. The delay to the public record is recorded where stated.
7. **machine or person** — `required` (the text requires the record to say whether an act was the AI system's own or a
   person's: a field for human interventions, actions taken autonomously against those initiated by a user, or the
   actor); `by class` (a reportable class is itself defined as the model's own conduct, so a report under it names a
   machine as doer, but the record is not otherwise required to say who acted); `not addressed`.
8. **stranger** — could someone outside the reporter and the receiver read the record later, without the model or the
   session that wrote it? `yes` if coded `public`; `aggregate only`; `no`. A retention period, where stated, is
   recorded.

## The house, beside them

The house's own record is read with the same eight codes as a measured signal, not a duty: a commit in its public Git
that takes out lines a deed of its machines wrote (step 5), with its delay measured from the Atelier's `both.json`
(ulysses b05b358d, sha256 83fb8013…63cb3244; handoff ho-2026-11-21-atelier-3) and recounted by this study's script.

## Readers

The conductor codes in this session, from the texts as fetched today, with the address, the date and the hash of
each. The check (the third session) codes every signal a second time from its source without this coding in view, and
reports the agreement.
