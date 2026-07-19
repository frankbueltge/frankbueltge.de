# Consequential trace record — 2026-07-19-falsche-anschluesse

This is not a complete activity log. Recorded: the acceptance, six verification
trails (tick 1), and the exclusions.

## Trace entries

### T-001 — Acceptance of the offer

- Date: 2026-07-19 (fourth dispatcher tick under Protocol v4)
- Type: encounter
- Originating actor or system: team offer (Frank, REQUESTS.md, commit `216de29`) →
  accepted by Ulysses
- Source or artefact reference: REQUESTS.md → "Team note — 2026-07-19 — Offer: six
  unsourced quotes from the founder's own 2006 thesis"
- What happened: The offer was read in the same orientation pass as the project and
  feedback records. Both prior projects were CLOSED; capacity 0 of 2. Accepted as a
  concrete source situation (verbatim material, named authors, a typed task) — an
  encounter begins with acceptance, and this one was accepted, not merely delivered.
- Why this trace is consequential: it is the project's initiating act and fixes the
  material (the offered transcriptions) and its limit (the print is not in hand).
- What interpretation remains uncertain: whether the offered transcriptions match the
  2006 print exactly (disclosed limit, SCORE §1).
- Related score assumption: §1 provenance.
- Resulting project change: project initiated.
- Public status: public

### T-002 — Quote 1 (Carnap): REAL BUT ALTERED

- Date: 2026-07-19
- Type: source
- Originating actor or system: research runtime (web search → direct fetch → local PDF
  text extraction)
- Source or artefact reference:
  - Critical edition full text: Carnap Project (CMU), Benson No. 1932-1, "Überwindung
    der Metaphysik durch logische Analyse der Sprache" (1932),
    https://www.phil.cmu.edu/projects/carnap/editorial/latex_pdf/1932-1.pdf — sentence
    extracted from the PDF text this run, §7 "Metaphysik als Ausdruck des
    Lebensgefühls":
    > "Und wenn der Metaphysiker sein dualistisch-heroisches Lebensgefühl in einem
    > dualistischen System ausspricht, tut er es nicht vielleicht nur deshalb, weil ihm
    > die Fähigkeit Beethovens fehlt, dieses Lebensgefühl im adäquaten Medium
    > auszudrücken? **Metaphysiker sind Musiker ohne musikalische Fähigkeit.**"
  - Independent full-text mirror, same sentence, same section:
    https://www.gleichsatz.de/b-u-t/trad/carn1a.html
- What happened: The sentence exists and is Carnap's. Original publication: *Erkenntnis*
  2 (1932), the essay's §7. The thesis version singularizes: "Ein Metaphysiker ist ein
  Musiker ohne musikalische Fähigkeit" — the original is plural and aphoristic,
  "Metaphysiker sind Musiker ohne musikalische Fähigkeit."
- **Verdict: real but altered** (attribution correct; wording modified —
  plural → singular). Exact journal page not verified this run (commonly cited as
  p. 240; CONJECTURE until checked against the journal pagination — the textless scan
  at fshh.rschr.de could not be text-extracted, see T-008).
- Why this trace is consequential: first verdict; establishes the pattern that even a
  "correct" attribution in the collage rewrites its sentence.
- Related score assumption: §2 initial question.
- Resulting project change: verdict 1 of 6 registered.
- Public status: public

### T-003 — Quote 2 ("Nietzsche"): MISATTRIBUTED — the sentence is Le Clézio's

- Date: 2026-07-19
- Type: source / correction
- Originating actor or system: research runtime (web search in German → hypothesis →
  web search in French → direct fetch)
- Source or artefact reference:
  - Academic call for papers quoting the sentence with attribution:
    https://www.fabula.org/actualites/17684/la-guerison.html — fetched this run; quotes:
    > "qu'un jour on saura peut-être 'qu'il n'y avait pas d'art, mais seulement de la
    > médecine'." — attributed to **Le Clézio, 1971**.
  - France Culture (public broadcaster), quoting the full sentence as Le Clézio's:
    https://www.facebook.com/franceculture/videos/458865402172005/ — "Un jour on saura
    peut-être qu'il n'y avait pas d'art mais seulement de la médecine". L'auteur
    J. M. G. Le Clézio…
  - Dictionnaire Le Clézio, entry on the 1971 essay *Haï*:
    http://www.editionspassages.fr/dictionnaire-jmg-le-clezio/oeuvres/essais/hai/ —
    direct fetch returned HTTP 403 this run; per search-level access the sentence
    belongs to *Haï* (1971). Work-level location therefore held at search level, marked
    accordingly.
- What happened: The German exact phrase („keine Kunst gab, sondern nur Medizin")
  returned zero results; no Nietzsche quote collection or corpus reference carries the
  sentence (searches T-008). The French original is documented and multiply attributed
  to J.M.G. Le Clézio, essay *Haï* (1971). The thesis's German wording is an
  (unidentified) translation of Le Clézio's sentence.
- **Verdict: misattributed** — with the disclosed limit that absence of a Nietzsche
  source in the searched corpus is not proof of non-existence; confidence rests on the
  positive documentation of Le Clézio's authorship plus the zero-trace in Nietzsche
  references. Which German intermediary delivered the sentence as "Nietzsche" remains
  open (SCORE §2, not yet determined).
- Why this trace is consequential: the offer's central suspicion confirmed on the first
  quote tested — a named-author connection in the thesis is false; Le Clézio is living,
  so the attribution correction is also owed to him.
- Related score assumption: §5 resistance ("each verification can defeat its expected
  verdict").
- Resulting project change: verdict 2 of 6 registered; German-intermediary question
  opened.
- Public status: public

### T-004 — Quote 3 (Gerz): NOT FINDABLE at web sources this run

- Date: 2026-07-19
- Type: failure (of the search apparatus, honestly recorded)
- Originating actor or system: research runtime (three distinct-fragment searches)
- Source or artefact reference: searches, all 2026-07-19:
  1. `Jochen Gerz "fragen Sie nicht die Kunst" Museum Scherben` — zero relevant hits
  2. `"Scherben auf den Glasberg" Gerz` — zero relevant hits (fairy-tale and ceramics
     noise only)
  3. `"dann fragen Sie nicht die Kunst"` (exact phrase, unrestricted) — zero hits
- What happened: The sentence fragment is not findable in the searched web corpus. One
  conjecture-level lead surfaced and is preserved: a KUNSTFORUM article on Gerz
  (https://www.kunstforum.de/artikel/kunst-ohne-werk-aber-mit-wirkung/ — direct fetch
  HTTP 403; search-level description only) describes his Kartause Ittingen instruction
  piece in which a bottle is thrown and shatters in a museum room — a thematic
  resonance (shattering glass / museum / do-not-ask-art) that suggests Gerz's printed
  texts and catalogue writings as the place to look. CONJECTURE only; no wording match.
- **Verdict: not findable (this run, web corpus)** — a statement about this search,
  not about Jochen Gerz (living artist). Next operation: print sources (Gerz's
  artist's books / catalogue texts); alternatively the shared-budget extraction of the
  KUNSTFORUM article only if evidence appears that it contains the sentence.
- Why this trace is consequential: negative evidence is load-bearing for this verdict
  type; the refusal to spend shared extraction budget on a non-load-bearing lead is a
  budget-discipline decision worth preserving.
- Related score assumption: §3 counterposition 1 (search absence ≠ non-existence).
- Resulting project change: verdict 3 of 6 registered as open/not-findable; next
  operation named.
- Public status: public

### T-005 — Quote 4 (Einstein): SECOND-HAND and REAL BUT ALTERED

- Date: 2026-07-19
- Type: source
- Originating actor or system: research runtime (web search → direct PDF fetch → local
  text extraction)
- Source or artefact reference:
  - Manfred Hörz, "Ein philosophisches Gespräch zwischen Einstein und Heisenberg",
    https://philmath.org/wordpress/wp-content/uploads/2019/04/EHGespr%C3%A4ch2.pdf —
    fetched and text-extracted this run; quotes Heisenberg's memoir *Der Teil und das
    Ganze* (ref. given there: München 1973), chapter "Die Quantenmechanik und ein
    Gespräch mit Einstein (1925–1926)". Einstein's remark as Heisenberg reports it:
    > "Aber vom prinzipiellen Standpunkt aus ist es ganz falsch, eine Theorie nur auf
    > beobachtbare Größen begründen zu wollen. Denn es ist ja in Wirklichkeit genau
    > umgekehrt. **Erst die Theorie entscheidet darüber, was man beobachten kann.**"
  - Corroborating quote reference (German wording + source listing):
    https://www.buboquote.com/en/quote/6462-einstein-it-is-the-theory-that-decides-what-can-be-observed
- What happened: The famous sentence exists — but (a) the thesis wording ("Es ist
  unmöglich nur beobachtbare Größen in eine Theorie aufzunehmen. Es ist vielmehr die
  Theorie, die entscheidet, was man beobachten kann.") is a condensing paraphrase of
  the reported passage, not its wording; and (b) the words are not retrievable as
  Einstein's own text at all: their only source is Heisenberg's memoir (published
  1969), reconstructing a Berlin conversation of 1926 four decades later. An "Einstein
  quote" that is textually Heisenberg's.
- **Verdict: real but altered AND second-hand** — the material's first demonstration
  that the offered five types combine (SCORE §3, counterposition 3).
- Why this trace is consequential: forces the typology refinement; also mirrors the
  collage's mechanism — authority (Einstein) detached from the actual textual carrier
  (Heisenberg).
- Related score assumption: §2 initial question; §3 counterposition 3.
- Resulting project change: verdict 4 of 6 registered; typology note opened.
- Public status: public

### T-006 — Quote 5 (Heisenberg): REAL AND CORRECTLY ATTRIBUTED (verbatim per cited secondaries; primary print not opened)

- Date: 2026-07-19
- Type: source
- Originating actor or system: research runtime (web search → direct PDF fetch → local
  text extraction)
- Source or artefact reference:
  - Academic lecture handout (W. J. Hoye, Münster), "Werner Heisenberg (1901–1976)",
    http://hoye.de/naturwissenschaft/lieferung3 — fetched and text-extracted this run;
    quotes with page citation (footnote resolving via "Ebd., 41." to Werner Heisenberg,
    *Physik und Philosophie*, Stuttgart: Hirzel, 4th ed. 1984, p. 41):
    > "und wir müssen uns daran erinnern, dass das, was wir beobachten, nicht die Natur
    > selbst ist, sondern Natur, die unserer Art der Fragestellung ausgesetzt ist."
  - Multiple independent quote references carry the same wording (e.g.
    https://skynetblog.de/werner-heisenberg-ueber-wahrnehmung-fragen-und-antworten/ ,
    citing the 1959 Berlin printing at p. 40 — pagination is edition-dependent).
- What happened: The thesis wording matches the documented sentence verbatim (modulo
  „daß"/„dass" orthography — the 2006 thesis keeps the older spelling, consistent with
  the 1959-era original; the handout modernizes). Attribution correct: *Physik und
  Philosophie* (German edition of the 1958 Gifford material, first German printing
  1959).
- **Verdict: real, correctly attributed, wording verbatim** — with the honest caveat
  that this run verified against two independent secondaries citing the primary with
  page numbers, not against an opened copy of the primary volume itself.
- Why this trace is consequential: the collage's one clean survivor so far — the
  register needs it to stay a register and not a prosecution.
- Related score assumption: §5 ("all six verify cleanly" was a live possibility per
  quote).
- Resulting project change: verdict 5 of 6 registered.
- Public status: public

### T-007 — Quote 6 (Feyerabend): NOT FINDABLE at web sources this run

- Date: 2026-07-19
- Type: failure (of the search apparatus, honestly recorded)
- Originating actor or system: research runtime (four searches)
- Source or artefact reference: searches, all 2026-07-19:
  1. `"antizipatorische Vermutungen" Forschung` — zero relevant hits (the term exists
     in psychology/governance contexts, never in this sentence)
  2. `"antizipatorische Vermutungen lenken die Forschung"` (exact) — zero hits
  3. `Feyerabend "konservative Vermutungen" OR "antizipatorische Vermutungen"` — zero
     relevant hits
  4. `Popper "antizipatorische Vermutungen"` — zero relevant hits
- What happened: The sentence Frank flagged as never verified is not findable: not as
  Feyerabend's, not as anyone's. CONJECTURE, marked as such: the vocabulary is
  Popperian rather than Feyerabendian — „Vermutungen" is the standard German rendering
  of Popper's *conjectures* (cf. *Vermutungen und Widerlegungen*), and "anticipation"
  belongs to the Bacon–Popper lineage; the sentence reads like a German secondary-
  literature paraphrase (possibly of Popper, possibly of Feyerabend's
  counterinduction) that hardened into a "quote". No source for this conjecture exists
  yet; it directs the next operation, nothing more.
- **Verdict: not findable (this run, web corpus)** — next operation: the German
  *Wider den Methodenzwang* and Popper's German editions at full-text depth; the
  name-test project's fixed AM3 (English 3rd ed.) can be checked for a corresponding
  passage without new access work.
- Why this trace is consequential: this is the quote that occasioned the offer; its
  continued unfindability after four searches is the offer's suspicion materially
  confirmed at first depth — and the Popper-vocabulary conjecture, if it holds, would
  make it a *misattributed paraphrase*, the collage's most complete false connection.
- Related score assumption: §2 (not yet determined); §3 counterposition 1.
- Resulting project change: verdict 6 of 6 registered as open/not-findable; two
  concrete next operations named.
- Public status: public

### T-008 — Apparatus conditions of tick 1 (403s, textless scan, budget refusals)

- Date: 2026-07-19
- Type: infrastructure condition / refusal
- Originating actor or system: research runtime
- Source or artefact reference: this run's tool results
- What happened, preserved because the negative evidence and refusals are part of the
  verdicts' honesty:
  - Direct fetch HTTP 403: editionspassages.fr (T-003), kunstforum.de (T-004),
    gleichsatz.de returned 403 on one part-page but served the other (T-002 used the
    served part).
  - Textless scan: https://fshh.rschr.de/pdf/Rudolf_Carnap_Ueberwindung_der_Metaphysik.pdf
    (4.3 MB image-only PDF; local text extraction empty) — reason the Erkenntnis page
    number for T-002 stays unverified; no OCR attempted (out of proportion for a page
    number).
  - German-side negative searches for T-003: `"keine Kunst gab, sondern nur Medizin"`
    (exact) — zero hits; `Nietzsche "es keine Kunst gab" Medizin Zitat` — zero relevant
    hits (Nietzsche quote collections surfaced, none carrying the sentence).
  - Shared web-research full-text extraction budget: **not used** — the only 403'd
    candidates (editionspassages, kunstforum) were not load-bearing for any verdict
    reached this run; both are named in their traces for a later tick to escalate if a
    verdict comes to depend on them.
- Why this trace is consequential: "not findable" verdicts are only as strong as the
  disclosed search record; budget refusals are decisions, not omissions.
- Related score assumption: §6 (hard limits), §7 (traces).
- Resulting project change: none beyond documentation.
- Public status: public

### T-009 — Quote 6 (Feyerabend), second pass: ABSENT FROM AM3 AT FULL-TEXT DEPTH

- Date: 2026-07-19 (fifth dispatcher tick; project tick 2)
- Type: source (negative evidence, materially strengthened)
- Originating actor or system: research runtime (full-text download → local search;
  as budgeted in T-007's named next operation)
- Source or artefact reference:
  - Feyerabend, *Against Method*, 3rd edn, Verso 1993 — the copy fixed by the
    name-test project: https://archive.org/details/FeyerabendPaulAgainstMethod ,
    file `Feyerabend_Paul_Against_Method_djvu.txt` (775 KB), downloaded and searched
    locally this run.
  - German edition lending scans located:
    https://archive.org/details/widerdenmethoden0000feye and
    https://archive.org/details/widerdenmethoden0000paul — search-inside endpoint
    answered "Item not available" without borrowing (T-011); full-text depth not
    reachable for this runtime.
- What happened: The entire English text of the attributed author's central work was
  searched. All occurrences of "anticipat*" (15) are incidental — Zeno/quantum
  anticipations, Bacon/Whorf, a footnote to Popper's *Objective Knowledge*, "vague and
  incoherent anticipations of a future unity" — none corresponds to the thesis
  sentence. "Conservative" occurs exactly once ("I regard these more conservative
  statements as…"), unrelated. No passage in AM3 corresponds to „Nicht konservative,
  sondern antizipatorische Vermutungen lenken die Forschung", neither in wording nor
  as a recognizable source passage for a paraphrase.
- **Verdict: remains not findable — strengthened:** the sentence is now also absent
  from the attributed author's central work at full-text depth (English 3rd edn). The
  Popper-paraphrase conjecture (T-007) stays CONJECTURE: no carrier text found; the
  planned German-side print probes were walled this run (T-011).
- Why this trace is consequential: this is the offer's originating quote; "not
  findable" now rests on the strongest available negative — the primary itself, not
  only search engines.
- Related score assumption: §2 (not yet determined); §3 counterposition 1.
- Resulting project change: verdict 6 stays open/not-findable with upgraded evidence;
  next operation named: exact-phrase probes via the Google Books API once the
  anonymous quota resets (the print corpus most likely to hold a German secondary
  carrier — for #6 and possibly the #2/#4 intermediary question).
- Public status: public

### T-010 — Quote 3 (Gerz), second pass: ABSENT FROM THE ARTIST'S OWN SITE AT INDEX LEVEL

- Date: 2026-07-19 (project tick 2)
- Type: failure (of the widened search, honestly recorded)
- Originating actor or system: research runtime (three new searches beyond T-004's)
- Source or artefact reference: searches, all 2026-07-19:
  1. `"des Museums zerschellt"` (exact) — zero relevant hits (WWII museum-destruction
     contexts only)
  2. `Gerz Zitat "zerschellt" Scherben Kunst Museum` — resurfaces only the Kartause
     Ittingen bottle-throw resonance (kunstforum.de at search level; unchanged from
     T-004, still no wording trace)
  3. `site:jochengerz.eu "fragen Sie nicht die Kunst" OR "Glasberg" OR "zerschellt"`
     — zero; the artist's official catalogue site (https://jochengerz.eu, per-work
     text pages) does not carry any of the three fragments at index level
- What happened: The web corpus for this quote is now exhausted at proportionate
  effort, including the artist's own site. The shared-budget extraction of the
  KUNSTFORUM article was declined a second time: exact-phrase searches return zero on
  the indexed kunstforum.de text, so there is still no evidence the article contains
  the sentence — extraction would be a speculative spend, not a load-bearing one.
- **Verdict: remains not findable (web corpus incl. official site, print corpora
  walled this run)** — a statement about this search, never about Jochen Gerz. If the
  sentence lives only in print catalogues or artist's books, it may be beyond this
  practice's reach; SCORE §5 names that as a permitted honest terminal state.
- Why this trace is consequential: the second declined budget spend is a decision;
  the official-site zero materially widens the disclosed negative corpus.
- Related score assumption: §3 counterposition 1; §6 hard limits.
- Resulting project change: verdict 3 stays open/not-findable; one search move
  remains (Google Books retry), after which the terminal-state decision is due.
- Public status: public

### T-011 — Apparatus conditions of tick 2 (walled corpora, quota, refusals)

- Date: 2026-07-19
- Type: infrastructure condition / refusal
- Originating actor or system: research runtime
- Source or artefact reference: this run's tool results
- What happened, preserved because the negative verdicts are only as strong as the
  disclosed walls:
  - archive.org search-inside on both German *Wider den Methodenzwang* lending scans:
    "Item not available" without borrowing — this runtime has no lending account.
  - Google Books API (anonymous pool): HTTP 429 "Quota exceeded … Queries per day"
    on every exact-phrase probe, confirmed by a control query — the day's shared
    anonymous quota was already exhausted; retry named for a later tick.
  - Google Books HTML search: consent/JS redirect stub, no server-side results.
  - HathiTrust full-text search: Cloudflare JS challenge (403 via both fetch paths).
  - philpapers.org (Popper *Conjectures and Refutations* record): 403;
    greiner1.at: TLS error — both would have served only corroborative Popper
    material, not load-bearing for any verdict, so not escalated.
  - Shared web-research full-text extraction budget: **not used in tick 2 either**
    (nothing walled was load-bearing; two declines now on record, T-004/T-010).
- Why this trace is consequential: tick 2's honest boundary is that the remaining
  path for both open verdicts runs through print corpora this runtime could not
  enter today; the verdicts' wording must carry that limit.
- Related score assumption: §6 (hard limits), §7 (traces).
- Resulting project change: none beyond documentation.
- Public status: public

### T-012 — Quote 3 (Gerz), third pass: VERIFIED, correctly attributed (revises T-004/T-010)

- Date: 2026-07-19 (sixth dispatcher tick; project tick 3)
- Type: source / correction (a prior "not findable" verdict overturned)
- Originating actor or system: research runtime (exact-phrase web search → direct PDF
  fetch → local zlib/content-stream extraction)
- Source or artefact reference:
  - KUNSTFORUM International, artist index page "Jochen Gerz":
    https://www.kunstforum.de/person/gerz-jochen — carries the sentence verbatim with
    attribution and bibliographic origin:
    > "…Museums zerschellt ist und die Scherben auf den Glasberg fallen, dann fragen Sie
    > nicht die Kunst, warum. (Jochen Gerz) Das Buch der Gesten, 1969, Basel"
  - Dissertation, G. Meincke, "Jochen Gerz: Platz des europäischen Versprechens"
    (Humboldt-Universität zu Berlin, 2009), footnote 38 — fetched and text-extracted
    this run; gives the full sentence and its context (Gerz's participatory invitation
    text "Was ist heute ich?"):
    > "Was ist heute ich? fragt der Einladungstext und endet mit den Worten: Wenn Sie
    > das getan haben, wenn die leere Flasche an der Wand des Museums zerschellt ist und
    > die Scherben auf den Glasberg fallen, dann fragen Sie nicht die Kunst, warum."
- What happened: The sentence is real and correctly attributed to Jochen Gerz. The
  thesis prints a faithful partial — a leading ellipsis at "…Museums zerschellt ist",
  then verbatim to the end. Bibliographic origin per KUNSTFORUM: *Das Buch der Gesten*
  (1969, Basel), an artist's book; per Meincke the wording is that of the invitation
  text for a participatory bottle-throwing piece. Two independent sources agree on
  wording and attribution.
- **Verdict: real, correctly attributed** (Jochen Gerz); the thesis wording is a
  faithful partial quotation (ellipsis marks the omitted opening clause; no alteration
  of the retained words). This **revises the tick-1 (T-004) and tick-2 (T-010) "not
  findable" verdicts**, which are preserved, not deleted (§5 correction route).
- Why the earlier passes missed it: T-004/T-010 used three-to-six *fragment* searches
  and hit two 403'd KUNSTFORUM *article* pages; this tick used a plain exact-phrase
  probe and the KUNSTFORUM */person/* index page (200, never surfaced before). The
  quote was never absent — the search strategy was.
- Related score assumption: §3 counterposition 1 (search absence ≠ non-existence) —
  here lived, not hedged.
- Resulting project change: verdict 3 reclassified to verified; one open verdict remains.
- Public status: public

### T-013 — Quote 6 (Feyerabend), third pass: SENTENCE FOUND in a German intermediary (Watzlawick 1981); original attribution unconfirmed (revises the "not findable" state)

- Date: 2026-07-19 (project tick 3)
- Type: source / correction (negative verdict overturned on existence; attribution left open)
- Originating actor or system: research runtime (exact-match web search → corpus
  confirmation; PDF-extraction attempts on two candidate full texts)
- Source or artefact reference:
  - Exact-phrase confirmation that the sentence appears in Paul Watzlawick (Hg.),
    *Die erfundene Wirklichkeit. Wie wissen wir, was wir zu wissen glauben? Beiträge
    zum Konstruktivismus* (Piper, München/Zürich, 1981) — in Watzlawick's own chapter
    "Selbsterfüllende Prophezeiungen" (pp. 91–110). The sentence stands there as a
    **footnoted quotation**, in context:
    > "…antizipatorische Vermutungen lenken die Forschung.«[Fn.] Einige der
    > gesichertsten und elegantesten Untersuchungen von selbsterfüllenden
    > Prophezeiungen…"
  - Book identity, chapter and pagination independently verified at legitimate sources:
    doc1.bibliothek.li (Liechtenstein National Library scan, TOC),
    https://de.wikipedia.org/wiki/Die_erfundene_Wirklichkeit ,
    beat.doebe.li Biblionetz ("Selbsterfüllende Prophezeiungen, Seite 91–110"), and a
    Springer citation ("Watzlawick P. Selbsterfüllende Prophezeiungen. In: Die
    Erfundene Wirklichkeit. 2nd ed. München: Piper, 1985: 91–110",
    https://link.springer.com/article/10.1007/BF00625760 ).
  - **Disclosed limit on the locator:** the only page found this run that reproduces the
    sentence *text* in situ is a pirate book mirror — NOT citable, NOT used as a source,
    and NOT extracted (the shared budget was not spent on it). It served only to locate
    the exact phrase; every verified fact above rests on the legitimate confirmations.
- What happened: The sentence Frank flagged as never verified is real German print — but
  not as Feyerabend's own text (T-009: absent from *Against Method* AM3 at full-text
  depth). It is carried by Watzlawick's constructivism anthology, a foundational text a
  2006 media-theory thesis would plausibly draw on — the likely transmission source.
  Whom Watzlawick attributes it to could not be resolved this run: the chapter's endnote
  text is not web-indexed; three targeted attribution probes (phrase + Feyerabend,
  phrase + Popper, phrase + Watzlawick + "Quelle/Fußnote") returned nothing.
- **Verdict reclassified: from "not findable / possible hardened paraphrase" to real
  German-print quotation with an identified transmission carrier (Watzlawick 1981) and
  an UNCONFIRMED original attribution.** Three live possibilities, none yet decidable:
  (a) Watzlawick credits Feyerabend → the thesis relayed a correct attribution;
  (b) Watzlawick credits another author → the thesis inherited a misattribution;
  (c) the formulation is Watzlawick's own → the thesis misattributed it to Feyerabend.
  The T-007 Popper-vocabulary conjecture stays conjecture and is now weakened: the SEP
  chapter's experimenter-effects / theory-ladenness context fits Popper or Feyerabend
  equally.
- Why this trace is consequential: this is the offer's originating quote; it is no
  longer "not findable", and the finding changes the whole register (see Corrections).
- Related score assumption: §2 (German-intermediary question); §3 counterposition 1.
- Resulting project change: verdict 6 moved from open/not-findable to real-but-attribution-pending;
  next operation named: a citable full text of the SEP chapter's notes, else a terminal
  typed state; then the compose decision and disposition (tick 4, the last).
- Public status: public

### T-014 — Apparatus conditions of tick 3 (Google Books still walled, PDF tooling broken, budget refusals)

- Date: 2026-07-19
- Type: infrastructure condition / refusal
- Originating actor or system: research runtime
- Source or artefact reference: this run's tool results
- What happened, preserved because the negative and revised verdicts are only as strong
  as the disclosed walls and methods:
  - **Google Books anonymous API: still HTTP 429** "Quota exceeded … Queries per day"
    for the shared consumer `project_number:624717413613`. A fresh container did NOT
    reset it — confirming the quota is exhausted at the shared-key level, not per-IP.
    The named "Google Books retry" (T-009) is effectively closed for this runtime; an
    ordinary **exact-phrase web search substituted for it and outperformed it** (it
    found both open quotes the walled specialist corpus was reserved for).
  - Google Books HTML front-end: still a JS/consent redirect shell ("enablejs";
    "Klicke hier, wenn du nach einigen Sekunden nicht automatisch weitergeleitet
    wirst") — no server-side results.
  - PDF tooling: `pdftotext` not installed; `pypdf` and `pdfminer.six` both fail at
    import because the system `cryptography` Rust binding panics (`_cffi_backend`
    missing). Worked around with a self-contained **zlib + content-stream extractor**
    (used to read the HU-Berlin dissertation, T-012, and to establish that two
    candidate "full-text" PDFs do NOT carry the #6 sentence: doc1.bibliothek.li serves
    only 3 pp. of front matter/TOC, and a jimcontent.com PDF is an 8-pp. condensed
    lecture-summary, not Watzlawick's verbatim text).
  - Shared web-research full-text extraction budget: **not used in tick 3 either** — the
    only page carrying the #6 sentence text was a pirate mirror, not a legitimate
    extraction target (a third recorded decline, T-004/T-010/here).
- Why this trace is consequential: the tick's method lesson — the cheapest tool
  (exact-phrase search) resolved what three ticks of specialist-corpus attempts could
  not — belongs in the record next to the walls it routed around.
- Related score assumption: §6 (hard limits), §7 (traces).
- Resulting project change: none beyond documentation.
- Public status: public

## Rejected or defeated premises

- **"The six quotes are the collage's problem"** — defeated in part: the cleanest
  survivor so far (#5 Heisenberg, main text per the offer's grouping) and the deepest
  false connection candidates (#2 collage, #6 main text) do not sort by
  collage/main-text; the substitution mechanism the preface admits for the collage is
  not confined to it. (Grouping of quotes per the offer; three collage, three main.)
- **Implicit expectation that the flagged quote (#6) would resolve fastest** —
  defeated: it is one of the two that resist entirely.
- **T-007's expectation that the German-side print probes were the natural next
  depth** — defeated on access, not content (tick 2): every print corpus this
  runtime tried (lending scan search-inside, Google Books, HathiTrust) was walled;
  the one primary that WAS reachable at full-text depth (AM3) returned a clean
  negative instead.
- **"The two unfindable quotes (#3, #6) are terminally unfindable"** — defeated in
  tick 3: both were located. The tick-1/tick-2 "not findable" verdicts were indexed to
  a *search strategy* (fragment queries, over-constrained phrases, 403'd article pages)
  that a plain exact-phrase probe outperformed. The quotes were never absent.
- **"Google Books is the natural corpus for the German carrier" (the named tick-4
  operation)** — partly defeated: Google Books stayed walled, yet ordinary exact-phrase
  web search — the cheapest tool available — found what the walled specialist corpus was
  being reserved for.

## Corrections and contestations

- **2026-07-19 (tick 3) — verdict #3 (Gerz) revised:** from "not findable (this run,
  web corpus)" (T-004, T-010) to **"real, correctly attributed"** (T-012). Reason: an
  exact-phrase probe plus the artist-indexed KUNSTFORUM /person/ page and a citing
  dissertation surfaced the sentence, its verbatim wording and its source (*Das Buch der
  Gesten*, 1969). The superseded verdicts are preserved in T-004/T-010, not deleted.
- **2026-07-19 (tick 3) — verdict-state #6 (Feyerabend) revised:** from "not findable
  (web corpus)", strengthened by the AM3 full-text negative (T-007, T-009), to **"real
  German-print quotation, transmission carrier identified (Watzlawick 1981), original
  attribution pending"** (T-013). The AM3 negative stands and is recontextualised: the
  sentence was never expected to be Feyerabend's *own text* — it is a footnoted
  quotation in an intermediary.
- **Contestation the tick raises against itself:** this pass vindicates SCORE §3
  counterposition 1 as a *lived* correction, not a hedge — two of the register's "not
  findable" verdicts (its weakest, most negative) fell to one better search move. That
  is itself a finding: "not findable" is the most fragile verdict type, and the register
  performed its own *false connection* — a false negative — in ticks 1–2 which tick 3
  corrects. The appendix's title („Falsche Anschlüsse") turns reflexive: the verification
  apparatus is not exempt from the phenomenon it examines. After tick 3 only #2 (Le
  Clézio, genuinely misattributed) stands as a clean false connection; the register is
  now mostly a record of real sentences altered, relayed or partially quoted — a
  different and truer shape than the tick-2 draft.

## Trace exclusions

Not logged or retained: full search-result listings (only queries, dates and the used
hits); PDF binaries and long excerpts (rights — brief quotation with citation
instead); the 2006 thesis itself (not in this practice's hands; its absence is a
disclosed limit, SCORE §1, not simulated by paraphrase).
