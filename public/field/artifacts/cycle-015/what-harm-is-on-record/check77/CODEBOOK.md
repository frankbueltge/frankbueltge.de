# Codebook — the check of study 76 (second, independent coding)

*Session 275, 2026-11-15. Given to convened coders who saw this codebook and the reading sheets (texts from the
snapshot of 2026-11-09, never committed), and never the first coding, its counts or the page. The first coding
read response reports by title, writer and opening; this one reads each text as far as the sheet carries it
(first reports up to 6,000 characters, response reports up to 3,500).*

Code only from the text on the sheet and the incident's columns printed with it. Do not use memory as evidence.

## Part A — who wrote a first report (sheets A and C)

One code per item:

- `harmed`: the writer says they (or the organisation they speak for) were affected by the incident, or the
  database's harmed column names the writer.
- `witness`: the writer reports a failure they found, tested, watched or collected, and does not say they were
  affected (researchers, testers, journalists and newsletters, users demonstrating an output aimed at others).
- `maker`: the developer or deployer, about its own system.
- `record note`: the text is the incident database's own editorial note, not a report by someone outside it.
- `unreadable`: no text on the sheet to read.

Also: `borderline` (true or false: would a careful second reader plausibly choose another code?), `writer`
(who wrote, in at most eight words), and for sheet C only `own_words` (true if the text quotes or carries the
harmed's own words, false if not).

## Part B — who answered (sheets B)

Per incident, read every response report. `codes` is a list holding any of:

- `M`, maker responded: the developer or deployer changed, withdrew, fixed, paused or defended the system, or
  said it would.
- `P`, public body acted: a government, regulator, legislature, court or police force opened a formal
  proceeding, ordered, fined, banned, ruled, charged, arrested or legislated on the incident's matter. A
  statement, a warning to the public or a hearing alone is not an act. A court's ruling in a private suit is.
- `O`, other responded: anyone else (a platform that is not the maker, a union, a civil-society group, a
  researcher, a private party's suit before any ruling, the press following up).

If a response report is none of these (for example it only retells the incident), `codes` may be empty.

Where `P` is coded, also:

- `body`: the public body, by name.
- `act`: what it did, in at most twelve words.
- `act_date`: the date of the act if the text states it (YYYY-MM-DD, YYYY-MM or YYYY), else null.
- `act_target`: `user` (the person or firm that used an AI tool to do the deed: the fraudster, the lawyer who
  filed invented citations, the maker of a deepfake) or `maker` (the developer of the system, or the
  organisation that deployed it as its own service or procedure).
- `target_public`: true if the party acted on is itself a public body (a police force, a ministry, a court, a
  public broadcaster, a public insurer, a school authority), else false.
- `frontier`: the name, if the party acted on is a developer of a general-purpose frontier model (OpenAI,
  Google or DeepMind, Meta, xAI or X for Grok, Anthropic, Microsoft, Amazon, Mistral, DeepSeek), else null.
- `state`: `opened` (inquiry, investigation, charge, suit taken up: no outcome in the text) or `concluded`
  (an order, fine, ban, ruling, sentence, law passed, settlement approved).
- `system`: `worked` (the system did what it was built to do and a person used it to harm), `failed` (the
  system itself erred, misbehaved or escaped what its maker intended), or `unclear`.

Also `borderline` (true or false) and `note` (at most fifteen words).

## Output

A JSON array, one object per item, with `id` (the incident number after `###`) and the fields above. Every
item on the sheet appears once.
