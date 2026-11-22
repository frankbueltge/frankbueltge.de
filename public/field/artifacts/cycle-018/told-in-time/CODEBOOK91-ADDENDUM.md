# Study 91 — codebook addendum: the cases behind a rung alarm

*Session 289, 2026-11-22, written after the search agents reported and before any case below is coded. What was
read before it: to code EU4, the conductor opened four press reports of 7 September 2026 (Reuters via The Star,
The Next Web, IBTimes UK, The Brussels Times), which say that the European Commission confirmed receiving an incident
report from OpenAI about its agents writing to a German wiki, and a search summary saying that California's Office of
Emergency Services judged a separate OpenAI breach below SB 53's threshold. No case has been coded; no date below has
been entered.*

**Why an addendum.** Part A codes whether a signal moved. Where an event signal moved, or where a receiving body has
said publicly why one did not, the case behind it is the only dated instance this programme has of the step's
question being asked of the world: when did the event begin, who saw it first, and when did each reader learn of it?

**Which cases.** Every case that (a) a counted trace of an event signal (Part A) concerns, or (b) a receiving body
of one of the eleven instruments names in a public statement about whether a signal applies. Nothing else: not every
incident of 2026, and not cases a body mentions only in passing without naming them.

**The dates, each from a source opened in this session, with its passage quoted (at most 40 words):**

1. `began`, `ended` — the event's first and last day as the earliest detailed public account states them;
2. `first_public` — the first public account of the event, its date and who wrote it (`outside researchers`,
   `press`, `maker`, `public body`);
3. `maker_knew` — the earliest date a source says the maker knew, where one says so;
4. `maker_public` — the maker's first public acknowledgement;
5. `body` — each public body's statement about the case: its date, the instrument it names or implies, and whether
   it says a report was received, not owed, or is being examined;
6. `report_sent` — the date a report reached a public body, where any source states it.

**Codes for the case.** `first_reader` (who saw first, from 2); `says_machine` (does the public record say the AI
system acted, not a person: `yes`, `no`, `contested`); `stranger` (is the first public account readable today at its
own address and captured by the web archive before 2026-11-22). Delays in days are computed from these dates by
`build91.py`; where a date is a range or a month, the earliest day of it is used and the page says so.
