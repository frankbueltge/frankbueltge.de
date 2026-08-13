# The Invoked Past: which yesterday the world cites today (design proposal, 2026-08-14)

**Status.** Proposal, not commissioned. From the 2026-08-13 brainstorm ("Verwandlungen"
set) and its dedicated prior-art pass. Working title; wording gate applies.

**Candidate landing.** Lab experiment. Of all candidates this is the cheapest to build
(zero new data sources) and the one with the widest verified daylight — recommended first
build in the overview document.

## 1. The claim

> Every day the world's press summons a particular past. The Invoked Past reads every date
> mentioned in ~116k articles and publishes the day's histogram of invoked years — which
> yesterdays are made present, how fast events decay from memory, and which old date
> suddenly returns, in whose press.

Daily outputs: (1) the **invoked-years histogram** (today the world cites: 1945, 1989,
2001, 2022 …); (2) **decay curves** for major events — attention to a date as a function
of time since, tested against a published law (below); (3) **anomalies** — dates whose
invocation jumps against their own decay baseline, with the source-country breakdown of
who is doing the invoking.

## 2. Prior art and daylight (USP duty)

Verified 2026-08-13 (dedicated pass):

- **GDELT's own field**: `V2.1ENHANCEDDATES` was added to GKG 2.1 in 2015 explicitly for
  "anniversary violence" analysis — and has no tooling: a GDELT blog search for the field
  returns zero posts; the legacy Analysis Service's anniversary visualizer is retired.
  GDELT built the sensor and never the instrument.
- **Candia et al. 2019** (Nature Human Behaviour, "The universal decay of collective
  memory and attention"): biexponential decay of collective attention across cultural
  domains — a *static paper*, and simultaneously the instrument's test hypothesis.
- **Michel et al. 2011** (culturomics): fame decay from Google Books — historical corpora,
  not news, not living.
- **Wikipedia "On This Day"**: editorial curation, not measurement.

**Daylight verdict: wide.** No living instrument of the press's invoked past exists; the
nearest neighbours are a 2019 paper and a retired visualizer. The house's "under proof"
line gets a rare gift here: a published quantitative law (Candia's biexponential) that the
instrument's decay curves can be tested against, openly — agreement or deviation is a
finding either way.

**Machine bar.** Parsing every date mention in the daily world press: machine-only.

## 3. Method v1

- **Data**: the same 96 nightly GKG files The Consensus fetches — `V2.1ENHANCEDDATES`
  (date mentions with day/month/year resolution flags and offsets), `V2SOURCECOMMONNAME`
  for the who-invokes breakdown (via the committed sourcesbycountry snapshot from The
  Balance spec — shared lookup, one snapshot). **No new downloads, no new services.**
- **Cleaning rules (versioned, the core of the method):** the field is noisy — numbers
  parsed as years, sports scores, bylines. v1 rules: (a) year-resolution mentions only
  from a plausible window (1800–current year); (b) drop dates equal to the article's own
  publication date ± 2 days (self-reference, "yesterday" journalism); (c) per-article
  dedup of identical dates; (d) a committed stoplist built from the spike's false-positive
  review. Every rule is in the method sheet with its measured effect on one reference day.
- **Aggregation**: mentions per invoked year per day, normalized per 1,000 articles;
  source-country split. For tracked event dates (a small versioned register of dated
  events — e.g. 1945-05-08, 2001-09-11, 2022-02-24), the daily invocation count extends
  that event's decay curve.
- **The law test**: fit Candia's biexponential to each tracked event's curve; publish fit
  parameters and residuals. Deviations (an event that refuses to decay, or decays too
  fast) are the interesting findings and are shown as such, not smoothed.
- **Archive**: `src/data/invoked/<date>.json` + `latest.json`, immutable, nightly, method
  version stamped.

## 4. Honesty and limits

- The parser's date extraction is GDELT's, not ours — its error modes (locale formats,
  OCR-ish noise) are inherited and named. The cleaning rules are measured, not assumed:
  the method sheet shows precision on a hand-checked sample (spike, §8).
- English-monitored stream first; the who-invokes breakdown is only as global as the pool.
  Same disclosure discipline as The Balance; same upgrade path (translation stream).
- An invoked *year* is not an invoked *event* (1989 carries Tiananmen and the Wall). v1
  stays at year level for the histogram and uses exact dates only for the tracked-events
  register — the ambiguity is stated, not resolved by guesswork.
- Memory politics framing: the instrument shows who invokes, never why; motive claims are
  outside the measurement.

## 5. Gate check (Werkgruppe §2)

Provenance (same raw-file manifests as The Consensus) ✓; a question ("which past is made
present today, and does news memory obey the decay law?") ✓; infrastructure disclosed
(parse rules, thresholds, stoplist versioned) ✓; leave-behind (open pipeline, CC0 archive,
the tracked-events register as a reusable dataset) ✓; proportionality (an additional parse
pass over files already fetched) ✓.

## 6. Cost

Zero. Same downloads, local parsing, optional BigQuery only if historical decay baselines
are backfilled for the tracked-events register — under the standard GCP conditions
(trace, citation, pennies with partition filters).

## 7. Open questions

1. Tracked-events register v1: which ~20 dated events, chosen by what published rule
   (recommendation: top invoked exact dates of the spike day + the obvious canon; the
   rule, not taste, decides).
2. Histogram surface: years only, or decades for the deep past (recommendation: years
   since 1900, decades before).
3. Whether anomaly detection ships in v1 or after 30 days of archive exist
   (recommendation: after — an anomaly needs a baseline, and pretending otherwise would
   be theatre).

## 8. First spike

One afternoon: parse `V2.1ENHANCEDDATES` for one committed day; hand-check 100 random
extracted year-mentions for the false-positive rate; build the day's histogram; measure
the effect of each cleaning rule. The precision number decides the cleaning-rule set and
whether the instrument is commissioned.

## Addendum (2026-08-14, same night): spike executed — precision good, one hard wall

The §8 spike ran on the full UTC day 2026-08-12 (119,263 articles, 96/96 slots, 0 gaps;
runtime 235 s + analysis). Findings:

1. **Volume and precision hold.** 38 % of articles carry the dates field. Cleaning
   ladder: 109,642 raw mentions → 52,214 after the year window (rule a) → 44,890 after
   per-article dedup (rule c). All eight inspected random samples were genuine historical
   references (e.g. a 1969 band founding, a dated 2012 scandal retrospective, an 1842
   literary-history piece). 1,840 pre-1900 mentions on the day — the deep past is
   measurably present daily.
2. **Rule (b) (self-reference drop) is inert**: it removed 0 mentions. Explanation:
   same-day references are almost always year-less ("August 12") and fall to rule (a)'s
   y=0 exclusion first. The rule stays (cheap, correct) but is not load-bearing.
3. **The hard wall: GDELT's extractor emits no year ≥ 2015.** Maximum year in 109,642
   mentions: 2014, with a clean cliff (2014: 1,736 → 2015+: zero across the whole day).
   This looks like a "current era" exclusion frozen at build time (the field spec dates
   to Feb 2015). Consequence: **the instrument's scope is the press's historical memory,
   1800–2014.** Recent-decade invocation (COVID, 2022) is not available from this field;
   if wanted, it comes from our own title-level year extraction as a *separately
   disclosed population* (title mentions ≠ full-text mentions — never blended).
   Candia-law decay testing is unaffected for pre-2015 events, which is where decay
   curves live anyway.
4. Resolution codes measured: month/day-without-year 57,428; year-only 46,387; full date
   2,946; month+year 2,881.

**Gate consequence**: buildable, with §1 reframed to the historical scope. The 2015 wall
goes on the method sheet as an inherited instrument property, prominently.
