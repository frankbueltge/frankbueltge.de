# The reader

*A tool, not a practice. Built 2026-08-23 on the founder's decision (wording private), the same
evening the practice on Mersch's ground was archived. No constitution, no cadence, no archive
duty; a script and two text files.*

**What it is.** A reader that applies **only Mersch's published criteria** — `CRITERIA.md`, every
line cited to a page — to a digital work, and says whether the work *shows*, *says*, *decorates*,
or is an *instrument*. It reads as a stranger first (what is on the first screen, before any
theory), then applies the measure, then answers thesis 12's four questions, then names the one
move that would make the thing a work. Register: the *Manifest*'s own — a defence against the
advocates; funny where the mechanism is funny, never about a person.

**What it is not.** Not Mersch, not a "Mersch bot", not trained on his texts. It never speaks as
him; it applies what he and his co-authors wrote and cites the page. He is alive and rigorous
(pressure points, §0.5); the tool exists to be answerable to him, not to imitate him.

**What it is for.** Two things. First, the obvious: a merciless reader that runs *before* a human
has to look — it is applied to the house's own works first, every time. Second, the test it
performs as a by-product: Mersch claims a criterion (*krinein*, 2015, p. 15) and denies that
showing admits discrimination (2017, p. 36). A reader that applies his criteria to known-good and
known-bad works either discriminates or does not — and either outcome is a finding about the
theory at its thinnest point (pressure points, PP2/PP9). For that test the founder supplies the
ground truth: works he holds to be good and bad. Without it the reader measures only itself.

## Run

```bash
cd docs/poetics/reader && npm install          # once; needs the Playwright Chromium already cached by the house
npx tsx reader.ts house                        # every work on /experiments, live site
npx tsx reader.ts house consensus balance      # named works only
npx tsx reader.ts https://example.org/work     # any URL
npx tsx reader.ts ./some-page.html             # a local page
```

Credentials: the active `ant auth` profile (`ant auth login` when it has expired) or
`ANTHROPIC_API_KEY`. Verdicts land in `verdicts/<date>-<id>.md`; screenshots in `shots/`
(ignored by git). Model, effort and inputs are disclosed in each verdict's apparatus line.

## The reading of 2026-08-23

The first run was made **inside a session** rather than through the CLI — the founder's API
login had expired at the moment of the run — with the same `PROMPT.md` and `CRITERIA.md`, the
same screenshots and text, and the session's model disclosed in every apparatus line. The CLI
reproduces the run once the login is renewed; the two readings are expected to differ in wording
and may differ in verdict, which is itself information about the measure's stability.
Summary: `verdicts/2026-08-23-READING.md`.

## What the reader cannot do

It sees screenshots and text. It does not experience the work: no time, no interaction, no
room. For a screen work that lives in its running, the reader is blind to exactly what the work
is — and will say so under "Seen, before reading". Its verdicts are a reading, not an encounter;
the stranger reading of a human remains the judge of criterion 4.

## Licence and sources

Apache 2.0 for the script; CC BY 4.0 for `CRITERIA.md` and `PROMPT.md`. The criteria quote
short passages of Mersch (2012, 2013, 2015, 2017) and of the *Manifest der Künstlerischen
Forschung* (Diaphanes 2019, CC BY-NC-ND 4.0) for the purpose of criticism, cited to the page;
no source text is committed. Citations to the 2012 and 2013 manuscripts must be re-anchored in
*Epistemologien des Ästhetischen* (Berlin 2015) before any verdict is published outside the
house — the pressure points' §0.1 applies to this tool as to everything else.
