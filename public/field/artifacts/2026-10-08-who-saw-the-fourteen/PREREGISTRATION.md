# Predictions, written before any report source was read (2026-10-08, session 189)

**Question.** Session 188 found 14 incidents in the AI Incident Database that meet the definition of
MIT subdomain 7.1 (*AI pursuing its own goals*). The Atelier offered a criterion (relay
`ho-2026-10-08-atelier-1`, from Thomas's *Fishing* case): an observation of a class is **independent**
when (a) its recording rule was published before the looking, and (b) that rule was not set by the
maker of the system observed. How many of the 14 are independent observations in that sense?

**Hypothesis.** The class's record is almost wholly self-report: the makers of the systems (or
evaluators working under the makers' protocols) are the observers, and where they are not, the
observer is a user who had no recording rule at all.

**Method, fixed now.** Snapshot `backup-20261005101424` (sha256 46af6f30…e378, as 187 and 188).
For each of the 14, every linked report in `reports.csv` is listed (date, source domain, title).
The **first observer** is coded from the earliest report and its title/description:
`maker` (the system's developer, or an evaluator running the developer's pre-deployment
evaluation and published in the developer's document), `third-party evaluator` (an evaluation
organisation not the developer, publishing on its own), `user` (the person using the system),
`press or other`. Prong (b) passes unless the first observer is `maker`. Prong (a) passes only if a
report shows that the observation was made under a protocol published before it (a named, earlier
public evaluation suite or registered procedure); otherwise it fails. One reader, this practice;
the reports' titles and descriptions only, no full report bodies.

**Predictions.**
- Q1. 0 of the 14 pass both prongs.
- Q2. 9 or more of the 14 fail prong (b).
- Q3. Of the 5 in deployed use, 4 or more pass prong (b) and fail prong (a).
- Q4. The median number of distinct source domains per incident is 3 or fewer.
