// src/config/ecology-figure-wording.ts — the words around the four practices' figures.
//
// Separate from ecology-pyramid-wording.ts because these strings belong to the PRACTICES, not to
// the frame: each one is written in that practice's own vocabulary (a line "ends", a concept is
// "struck", a claim "graduates"), and holding them apart is what stops the four rooms drifting
// into one house style — the thing ADR 0010 forbids.
//
// Every caption ends with what the figure was drawn from. That is not decoration: a figure on this
// site is a claim about the record, and a claim needs its source next to it. Counts arrive as
// arguments, never typed.

export const FIGURES = {
  approval: 'draft' as const,

  field: {
    /** The practice's signature figure, back on its sheet 2026-08-14: it was left without a page
     *  when the pyramid replaced the Field's entrance, and its ASSEMBLY went with that page. */
    claim: {
      title: 'THE CLAIM UNDER REVIEW',
      sub: 'ONE CLAIM, THE CEILING ITS RULING HOLDS IT TO, AND WHAT THE TWO VERIFICATIONS FOUND',
      caption:
        'Read from Meridian’s own export: the claim, the ceiling the runtime’s ruling sets above it, the two verifications closing in from opposite sides, and every finding they filed beneath it. Nothing here is a summary — the words are the record’s. Where a verification found nothing, the figure shows nothing rather than a reassuring gap.',
    },
    gate: {
      title: 'THE GATE, SESSION BY SESSION',
      sub: 'EVERY SESSION AT THE HEIGHT ITS OWN VERDICT EARNED',
      link: (n: number) => `all ${n} →`,
      /** Says plainly what the figure does NOT show, and why — the verdict spectrum the design
       *  asked for has no committed source, and pretending otherwise on the practice that puts
       *  measurements on trial would be the worst place on the site to invent a number. */
      caption: (sessions: number, stated: number) =>
        `A RING = THE SESSION SHIPPED · HOVER A MARK FOR THE RECORD’S OWN WORDS<br>` +
        `${sessions} sessions from src/data/field/chronicle.upstream.json; ${stated} of them state their verdict as a sentence rather than a word and sit on the lowest band, unclassified. ` +
        `A spectrum of what each instrument FOUND — claim confirmed against claim taken apart — is not drawn here: the instruments’ metadata carries no such position, and this practice is the last place to guess one.`,
    },
    gauntlet: {
      title: 'THE GAUNTLET',
      sub: 'WHAT THE GATE LETS THROUGH',
      rows: ['SESSIONS WORKED', 'INSTRUMENTS SHIPPED', 'STANDING TODAY'],
      caption:
        'ADVERSARIAL REVIEW — REJECTIONS KEEP THEIR REASONS<br>Sessions from the chronicle, instruments from the works register, standing = not withdrawn. “Proposed but never recorded” is absent because the archive has no trace of it.',
    },
    lede: {
      kicker: (date: string) => `IN SERVICE SINCE ${date}`,
      noteLabel: 'the practice’s running work: ',
      open: 'open the instrument →',
      record: 'the whole register →',
    },
  },

  atelier: {
    lineMap: {
      title: 'THE LINE MAP',
      sub: 'WORK-LINES ON ONE TIME AXIS, AND HOW EACH ONE ENDED',
      link: (n: number) => `all ${n} →`,
      caption: (lines: number, works: number) =>
        `▮ WORK-LINE WORK · ▯ NIGHTLY-LINE WORK · SLAB HEIGHT = WORKS THAT DAY<br>` +
        `✕ STOPPED · ▢ ARCHIVED AS STUDY · ● PUBLISHED · ⤳ RUNNING — the strands hanging below the axis are the work-line’s records<br>` +
        `${works} works from the register — both strands: the nightly line’s first era, the work-line, and everything the nightly line has made since its 2026-08-10 revival. ` +
        `${lines} work-lines from their own SCORE/TRACE records in src/content/atelier/projects/. ` +
        `A stopped line wears the practice’s own ink, not a warning colour: under this constitution closing costs what continuing costs. ` +
        `Hover or tab to a line for its span; open it for its whole record — score, decision, every move of its trace. n-1 keeps its record on its own surface.`,
    },
    lede: {
      kicker: (date: string) => `NEWEST ON THE RECORD · ${date}`,
      noteLabel: 'the running line: ',
      open: 'open the work →',
      record: 'the whole register →',
    },
    // The refrain's station strings left with the figure on 2026-08-16 (Frank's decision): the
    // score of ONE line lives with that line's record at /atelier/lines/<id> now, framed by the
    // wording it always carried in ATELIER_NARRATIVE.refrain. The station keeps the line map.
  },

  studio: {
    floor: {
      title: 'THE STAGE FLOOR',
      sub: 'ONE WORK IN THE LIGHT, EVERY MARK STILL ON THE FLOOR',
      link: (n: number) => `all ${n} →`,
      caption: (pools: number, strikes: number) =>
        `POOL = PREMIERED · ✕ STRUCK, REASON KEPT · GASSE = HELD AT THE GATE, UNLIT · HOVER FOR THE REASON<br>` +
        `${pools} premieres from the works register; ${strikes} strikes from src/data/studio/stage.curated.json, each reason a verbatim quotation from the session commit that made it.`,
    },
    lede: {
      kicker: (date: string) => `ON STAGE SINCE ${date}`,
      noteLabel: 'what stands in the light: ',
      open: 'open the work →',
      record: 'the whole register →',
    },
  },

  middle: {
    score: {
      title: 'THE CROSSING SCORE',
      sub: 'FOUR VOICES, ONE COLUMN PER RECORDED CROSSING',
      link: (n: number) => `all ${n} →`,
      caption: (crossings: number) =>
        `A CONNECTOR = A CROSSING · A BRACKET = THE JOINT INQUIRY STILL IN MOTION · HOVER FOR THE RECORD<br>` +
        `${crossings} crossings from src/data/begegnungen/register.json, in the order they were recorded — not on a time axis, because part of the register carries no date and placing those on one would put them where nobody observed them. The conductor has no lane: keeping the record is not a voice.`,
    },
    lede: {
      kicker: (status: string) => `JOINT INQUIRY · ${status}`,
      noteLabel: 'where it stands: ',
      open: 'open the inquiry →',
      record: 'every crossing →',
    },
  },
} as const
