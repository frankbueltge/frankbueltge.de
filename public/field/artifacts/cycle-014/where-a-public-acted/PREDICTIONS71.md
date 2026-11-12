# Study 71 — predictions, written before any search

*Session 269, 2026-11-12. Cycle 014, step 2 of the programme, first session. The cycle's question, set by the
convening's tally of 2026-11-11 (the Studio's proposal): at which points between the chip and the running model
has a public body so far actually stopped, delayed or put conditions on AI compute (an export licence, a grid
connection or building permit, a merger or contract review, a duty on the model), and whose public was it each
time?*

**The study's question.** Studies 69 and 70 read what the law in force says and whether its sanctions were
used. This study leaves the texts and counts acts: dated decisions of public bodies, on record, that in fact
stopped, delayed or conditioned AI compute. Where along the chain do they sit, who was acted on, on what
ground, and which public acted?

**The chain, fixed now: five points.**
1. **Chip** — the export or sale of AI chips (a licence required, refused or granted on terms; a ban on buying).
2. **Site** — the land and the building of a data centre (zoning, building or environmental permit, moratorium).
3. **Power** — its connection to the grid or its own generation (a grid operator's or energy regulator's
   decision, a tariff, an air permit for generators).
4. **Deal** — ownership of compute and the contracts under which it is rented (merger control, investment
   screening, a competition inquiry into a compute agreement).
5. **Model** — the running model or service (an order of a data-protection or other authority, or a court,
   that stops, delays or conditions its training or operation).

**What counts as an act, fixed now.**
- A decision of a public body (a legislature, a government or its agency, an independent regulator, a court, a
  county or municipal council, a publicly owned grid operator), with a date, read **first-hand**: the body's
  own document or page, or a filing or statement of the party acted on. Press reports find acts; they do not
  carry them. An act known only second-hand is listed apart and kept out of every count.
- It concerns **AI compute**: AI chips, a named data-centre project or a class of data centres, a transaction
  over compute, or a model's training or operation. Crypto mining and ordinary cloud are out.
- Its effect is one of three. **Stopped**: refused, prohibited, voided, or a requirement that brought the thing
  to a halt. **Delayed**: a moratorium, pause or suspension with a time limit or later lifted. **Conditioned**:
  allowed on terms the body set. An inquiry, a request for information, a bill not enacted, a text that
  nobody has applied (study 70's ground), and a project its owner withdrew before any decision are **not
  acts**; a withdrawal is noted where the record ties it to a pending vote.
- **Rule or case**: an act that binds a class (a licence requirement, a moratorium) is a *rule*; one addressed
  to a named project, firm or transaction is a *case*.
- **Whose public**: the level of the body (municipal or county; state, province or region; national;
  supranational), its kind (elected body, executive agency, independent regulator, court), and whether the
  compute acted on stands, or the model runs, **inside** that public's own territory or is bound **elsewhere**.
- **Ground**: the reason the act itself states, coded from its words: national security; personal data;
  power or grid; water; land, noise or the neighbourhood; air; competition; AI risk (the capability or control
  of models as such).
- **Named holder or developer**: whether the act names one of the step-1 holders (Google, Microsoft, Meta,
  Amazon, Oracle, xAI) or a frontier developer (OpenAI, Anthropic, Google DeepMind, Meta, xAI) or its project.

**The frame, and what it cannot carry.** The register is a found set, not a census: for each point, the
searches named in `analyse71.py` and the acts they lead to, read first-hand in one session. Counts are lower
bounds of what exists; shares are shares of what was found, and are reported as such. A point with no act
found is reported as *none found*, with the searches run, never as *none exists*.

**Remembered, not verified, and therefore not evidence.** US export rules of 2022 and 2023 and a licence
requirement for one chip maker's China product in 2025; a grid operator's halt on new connections around
Dublin; moratoria in the Netherlands and Singapore; a US energy regulator rejecting an expanded connection of
a data centre at a nuclear plant; county and city councils in the United States refusing data centres;
Italy's data-protection authority suspending a chatbot in 2023; competition authorities reviewing
partnerships between cloud firms and model developers without blocking any. None of this is used until read
in a document of the body or the party.

**Predictions.** They test step 2 of the programme's plan (who decides over compute).
- **P89.** Acts are found at four of the five points: chip, site, power and model. At the **deal** point no
  act is found that stopped or conditioned a compute transaction; the reviews found there closed without one.
- **P90.** More than half of the acts found are by **subnational** bodies (municipal, county, state, province
  or region), and they sit at the site and power points.
- **P91.** No act found at the site or power point states **AI risk** as its ground. Their stated grounds are
  power, water, land, noise or air.
- **P92.** Every act found whose compute stands **inside** the acting public's territory sits at the site or
  power point; every act at the chip point acts on compute bound **elsewhere**. (The model point is left out:
  a service runs wherever it is called.)
- **P93.** At least five acts found name a step-1 holder or a frontier developer or its project, against none
  of the 14 parties charged in study 70.
- **P94.** Of the acts coded **stopped** at the chip and model points, at least half were lifted, loosened or
  replaced by a conditioned permission within twelve months, on the same body's record.
- **P95.** No act found, at any point, states a quantity of compute (chips, or a compute threshold) as the
  thing it limits, except at the chip point. Site and power acts limit megawatts, land or hours.
