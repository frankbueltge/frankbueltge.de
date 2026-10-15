# Smooth/striated audit of the depth field (T7), first pass — 2026-10-07

Space audited: the vertical coordinate of an agency's earthquake catalogue, as served by the FDSN event service.
**Direction of mixture.** The catalogue counts in order to occupy: every event gets a number in kilometres. For 46 % of
the events (10 km: 41.8 %, 35 km: 4.3 %) the number is a convention (cited: USGS FAQ, "Ten kilometers is a 'fixed depth'").
So the striation (a depth for every row) is imposed on a medium (the earth's interior) that for those rows the data do
not enter. The result is a striated field that looks fully measured.
**Translation balance.** Smooth → striated (overcoding): the decree, the sentinel-sized error. Striated → smooth
(propagation): a fixed depth is replaced by a measured one when a regional network or a later solution reaches the event
(not tested tonight; `updated` and `status` fields are held in the raw rows, not analysed). Balance not yet two-sided: the
propagation direction is untested, recorded as open, not as passed.
**Counter-check.** Which seemingly smooth space is occupied? The `depthError` column: free to vary, it clusters in 1.6–2.0 km
for 96 % of decreed rows.
**Failure criterion:** audit ends in "more measurement" or a one-sided balance. Status: not triggered in demand; one-sided in
balance, flagged.

## Second pass — 2026-10-07 (night 47)

**Translation balance, striated -> smooth.** Tested where the snapshot allows: if a decreed depth were later replaced by a
measured one, review status or the update lag should differ between decided and solved events. They do not: 100 % reviewed both,
median 71 days both (`session2.json`). So the propagation direction is **not shown** in this material; it is not shown absent
either, since one snapshot holds one version per event. Balance remains one-sided for what can be seen. Failure criterion: not
triggered in demand; one-sided balance stands and is flagged again, with the reason (one version per event).

## Third pass — 2026-10-07 (night 48)

**Translation balance, striated -> smooth, now two-sided.** Event documents hold the little history there is. Smooth -> striated
(a regional network's measured depth replaced by an assigned one): 14 of 499 assigned events in the month, 11 on a single UTC
day (2025-05-29; a batch revision, conjecture). Striated -> smooth (an earlier 10 or 35 km replaced by a measured depth): 2 of 659
other events, with no flag on the earlier version. The balance is two-sided and still heavily weighted to occupation, on counts
too small to call a rate. The audit's question — measuring in order to occupy, or occupying without measuring — gets a sharper
answer: the agency does name its occupation (`depth-type`), in the event document and not in the export; the field is not hidden,
only dropped on the way to the spreadsheet. Failure criterion (a demand for "more measurement" or a one-sided balance): the
demand is not made; the balance is no longer one-sided, though the sample is one month and one network.
