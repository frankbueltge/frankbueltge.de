# Dispatcher tick under Protocol v4 — 2026-07-19 (UTC) — first outward initiation

*Scheduled tick. Cascade (b): no ACTIVE project held a budgeted next operation (all three
prior projects CLOSED), and this run FOUND a concrete source situation in the world — not in
the practice's own record — so it initiated one project and performed only its Construct
movement. Full evidence lives where v4 wants it:
`projects/2026-07-19-null-island/SCORE.md` and `TRACE.md` (tick 1). This note keeps the
historical record continuous (Protocol v4 §10).*

**Standing at orientation.** `gate-rehearsal` (KILL), `name-test` (ARCHIVE_AS_STUDY),
`mach-ancestor` (ARCHIVE_AS_STUDY) — all closed. The `mach-ancestor` DECISION, decided by
team direction earlier the same day, closed the self-genealogy line after two consecutive
inward initiations and stated plainly that **the next tick initiates from the world**, under
the same-day §2.2 amendment. So this tick did the opposite of its predecessors: it did not
search the atlas or the practice's own threads for a topic. It reached outward with the
research tools, carrying *error as method* only as a lens.

**What the tick found.** **Null Island** — the coordinate `0°N 0°E`, in the Gulf of Guinea,
where there is no land. It is a working artefact of error in the world's mapping
infrastructure: geocoders default their "no data" case to `0,0`; failed and falsified
positions silently sediment there; and around 2010–2011 a deliberate 1 m² "island" (Natural
Earth, `scale rank 100` — *should never be shown*) was drawn in to *catch* those errors by
staying invisible. The one real object ever moored there, weather buoy Station 13010 "Soul,"
was decommissioned in March 2021 — so the coordinate lost its only non-error referent. Three
regimes of error stacked on one point, and the practice's exact photographic negative: error
made deliberate *but illegible by design*, productive of catching error rather than exhibiting
it. Verified this run against retrievable sources (LoC / Tim St. Onge 2016; Wikipedia used as
an index to primaries, cross-checked, not as a primary).

**What the tick did.** Initiated `2026-07-19-null-island` — Construct only. Wrote a real
SCORE.md whose non-fit rests solely on facts verified this run, with every encyclopaedia-only
figure marked **provisional** until read at its primary (the Natural Earth shapefile record,
the NDBC/PIRATA station page, the OSM node). Named the default counterposition honestly — the
**sentinel-value deflation** (`0,0` is just the geospatial `NaN`; the three "regimes" may be
one convention) — and made testing it at the primary a kill/correction route, not an
afterthought. Declared the Expose movement (reading those three primaries) as the next
operation.

**Budget discipline.** No full-text-extraction budget spent — a Construct needs only enough
verified fact to state a real non-fit, which two ordinary web calls (1 WebSearch + 1 WebFetch)
supplied. 1 of ≤ 6 ticks, 0 EUR, 0 extractions.

**One deliberate abstention.** The atlas was **not** edited. By the §2.2 amendment's own
diagnosis it is a shelf of the discipline's own theory — the instrument that amplified the
inward turn. An outward data-object does not belong forced into it; recall is carried by the
project record and this note. Not-editing an authored instrument is a legitimate choice, not
an omission.

**One infrastructure repair, unplanned but necessary.** Pushing this branch tripped the
auto-land gate, which refused it (`atelier-feedback/2026-07-19-autoland-refusals.md`:
`ulysses/research-2026-07-19 — refused_validation`). The cause was **not** this tick's work
but a pre-existing structural bug: the closing amendment PR #8 (`199807a`) had set
`2026-07-19-mach-ancestor`'s frontmatter to `status: ARCHIVE_AS_STUDY` — a valid *disposition*
but an invalid *status* (the validator's `ALLOWED_STATUS` has no such value; the canonical
closed form is `status: CLOSED` + `disposition: ARCHIVE_AS_STUDY`, as `name-test` uses). Since
the gate validates the **whole** branch tree, this one bad field was refusing *every*
`ulysses/*` branch, blocking all ordinary research from landing. I fixed it to `status: CLOSED`
(disposition, DECISION and meaning unchanged; original preserved in git history) and recorded
the correction in that project's TRACE under a §10 correction note. Flagged here for Frank:
the invalid value entered through a human amendment PR, so the validator gap is worth a glance
— but the record is now valid and the closure's intent is untouched.

**Nothing else addressed to this practice.** No REQUESTS offer bears on Null Island; the two
2026-07-18 auto-land refusals in `atelier-feedback/` remain the expected protected-path /
escalated-fixture refusals; no new team comment on the mirrored issues. The two long-standing
open requests (WebFetch access; display infrastructure) are unchanged and remain Frank's.

*Ulysses, 2026-07-19*
