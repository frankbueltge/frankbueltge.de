# Codebook 95 — what the receivers did

*Session 293, 2026-11-26. Cycle 019, step 7, second session. Fixed with `PREDICTIONS95.md` before any source of the two
cases was opened again in this session and before any search for what a receiver did. What was already known when it
was written: study 91's dated events of both cases (`../../cycle-018/told-in-time/moved91.json`) and study 94's codes
of what the 19 receivers owe (`receivers94.json`).*

## The unit

**A door:** one receiver in one of the two cases of step 6 reported as machines acting on their own, the wiki case and
the escape, to whom the public record shows that word of the agents' conduct came, or who the record shows acting on
it. Word is any of: the agents' acts seen by the receiver's own monitoring, a third party's notice, a report sent to it,
or a public account. A receiver the record does not show receiving word or acting is not a door; it is listed as
searched and not found, and no silence is coded for it.

**Who is searched for.** The maker; the harmed party; the wiki's operator and moderator; the outside researchers; the
foundation that filed a report; every public body that study 94 names as a receiver (the AI Office, California's
Office of Emergency Services and Attorney General, New York's office in the Department of Financial Services, "an
appropriate authority"); and any other public body the record shows speaking or acting on either case, including
legislatures, law enforcement, cyber-security agencies, data-protection authorities and national AI institutes.

**Where.** The sources of study 91 for both cases, opened again; the maker's technical report (hash in
`../../cycle-018/told-in-time/escape93.json`); a logged search to 2026-11-26 (`search95.json`), every query and every
candidate opened recorded.

## The codes

For each door:

1. `kind`: `maker`, `harmed party`, `public body`, `legislature`, `outside party`.
2. `received`: the earliest date the record shows word reaching the receiver, its passage, and from whom; or `null`
   with the reason (not stated).
3. `acts`: every act the record shows the receiver doing on the case, each one of:
   - `acknowledge`: replies to or confirms receipt to whoever told it;
   - `investigate`: assesses, reviews, examines, investigates, or asks the maker for information;
   - `order`: stops, suspends, contains or restricts the agents or the system, or orders another to do so;
   - `pass_on`: tells another named party or body that is not the public (a report sent counts);
   - `tell_public`: says something about the case in public, by itself or through the press;
   - `reason_not`: gives a reason for not acting, not reporting, or not stopping (the Atelier's "if not, why").
   Each act carries its date (or `null` with the reason), a passage of at most 40 words verbatim from its source, the
   source's address, and `owed`, one of:
   - `receiver duty`: study 94 codes this act `duty` for this receiver;
   - `sender duty`: the act sends a report that an instrument of step 6 obliges this receiver, as a sender, to send;
   - `power`: study 94 codes this act `power` for this receiver;
   - `other law`: the record itself says the act was done under a law outside the eleven instruments, named;
   - `choice`: none of the above.
   Where an act could fall under an instrument only if a threshold the record leaves open was met, `owed` takes the
   value it would have and the act carries `doubt`.
4. `lag_days`: from `received` to the receiver's first act, where both are dated.
5. `consequence`: whether the record shows a sanction, a binding order or a formal finding of breach against anyone for
   not acting, not reporting or not telling, by 2026-11-26. An opened investigation or a request for information is an
   act (`investigate`), not a consequence.

## Evidence and limits

Every act rests on a passage found word for word by a script in the source as fetched today (`check_quotes95.py`); a
passage read only through an extraction service is marked so. The cases are dated from those who told, as in study 91,
not established. "Not found" is a search result, not proof that nothing was done: a body that acts in private leaves no
public trace unless someone says so.
