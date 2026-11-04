# Study 53 — predictions, written before any count

*Session 250, 2026-11-04. Cycle 012, first session. Question of the cycle (`cycle.json`, opened
2026-11-03): how much of the Ebola epidemic in eastern Congo and Kenya does surveillance not see, and
from which day can a case count say that a district has truly gone quiet?*

**The study's question.** When a health zone has gone *d* days without a new confirmed case, how likely
is it to record another within the next 42 days? And does anything outside the zone's own record tell
the quiets that break from those that hold?

**Why it is asked.** WHO declares an Ebola outbreak over 42 days (twice the longest incubation period)
after the last case. That rule speaks of a whole outbreak. Read zone by zone, a case count also
"goes quiet", and responses act on it. The Atelier found (`ho-2026-11-03-atelier-1`, *The Last Case*)
that over the first 42 days of a quiet, the zone's own record (days named, days without a report) does
not separate the quiets that broke from those that held (0.54 and 0.44 against a coin's 0.50). This
study tests the zone's **neighbourhood**: a new case elsewhere in the same province.

**Hypotheses.** H1: at zone level, while an outbreak runs, 42 quiet days leave far more than the
residual risk the outbreak-level rule is built to leave. H2: re-entry from active neighbours, not a
hidden local chain, carries most of that risk, so the neighbourhood separates where the zone's own
record does not. H3: some breaks have no visible source; these are the part of the epidemic the count
shows it missed.

**Records.** OCHA HDX, North Kivu outbreak by health zone 2018–2020 (CC BY-IGO, sha256 `76c7e999…86cb`,
byte-identical to check 52's file); OCHA HDX, Congo 2026 consolidated (INRB-UMIE, CC BY, sha256
`761e1ed4…2dbf`, byte-identical to checks 50–52; last reference date 2026-10-29). Kenya: no zone-level
record is in hand at this writing; this session does not measure Kenya.

**Seen before writing these (so not predictions).** From checks 51 and 52 and the Atelier's s30: Kivu
holds 60 quiets of at least 42 days, 2026 holds 22 (11 broke, 11 held); 43 of the 82 broke at some later
time. Kivu's report coverage is 84.1 % with one 94-day hole (8 Mar – 9 Jun 2020). The 2026 zone codes
fall under nine pcode prefixes. Nothing about breaks *within a horizon*, neighbours, or sources has been
counted.

**Definitions, fixed now.** Quiets by check 51's rule (a rise is a report date on which a zone's
cumulative confirmed count exceeds every earlier value; a quiet runs from one rise to the next). A quiet
*reaches d* if no rise falls in the *d* calendar days after its start. It *breaks within H* if its next
rise falls in days *d*+1 … *d*+*H*; a quiet whose window *d*+*H* passes the record's last date is left out
at that *d* (no censoring guesswork). H = 42 is primary, H = 21 a sensitivity. **Active neighbour at d:**
another zone of the same province (Kivu: the file's `province`; 2026: the first four characters of the
pcode) had a rise in the 21 days up to and including the quiet's day *d*. **Sourceless break:** a rise
ending a quiet of at least 21 days with no rise in any other zone of the same province in the 21 days
before it. Uncertainty: 95 % intervals by bootstrap over zones (2,000 draws, seed 53).

**Predictions.**

- **P1 (H1).** Pooled over both records, the share of quiets that reached 42 days and broke within the
  next 42 is above 15 %, and its interval excludes 5 %.
- **P2 (H2).** At d = 42, pooled, that share is at least three times higher for quiets with an active
  neighbour than for quiets without one.
- **P3 (H2).** With an active neighbour, the share stays above 10 % at every d from 1 to 90 at which at
  least 10 quiets are at risk (pooled).
- **P4 (H2).** Without an active neighbour, the share at d = 42 is at most 5 % (pooled): where the rule's
  assumption of no import holds, its 42 days suffice.
- **P5 (H3).** Of all breaks after at least 21 quiet days, pooled, between 10 % and 40 % are sourceless.
- **P6.** The share at d = 42 (all quiets) differs between Kivu and 2026 by less than 15 percentage
  points.

A prediction that fails stays failed. Post hoc readings are marked post hoc.
