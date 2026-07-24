// Field-Wortlaute (Praxis-Oberflächen-Paket; research-ecology docs/design/
// field-aesthetik-2026-07-15.md + wortlaute-2026-07-15.md §1, Zwei-Schichten-Regel):
//
//   GRAMMAR   — statische Formeln des Messprotokolls (Datenkante „ruhender Stift“,
//               Kopfleiste, Zeichen-Beschriftungen), freigegeben mit der Design-Session
//               vom 2026-07-15, wörtlich aus field_viz.py. Unter Testschutz
//               (src/lib/field/strip.test.ts) — Test-Strings nie aufweichen.
//   NARRATIVE — neue Erzähl-Wortlaute dieser Verdrahtung (Auswahlregel des Instruments,
//               Provenienz-Vermerke der Site-Abweichungen). approval: 'draft' bis Franks
//               Freigabe; Seiten zeigen den Draft-Chip (Muster: naming.ts).
//
// ADR 0010: das Feld teilt keine visuelle Grammatik mit Partitur, Blatt oder Bühne.

export interface RailItem {
  label: string
  href: string
  hint: string
}

export const FIELD_GRAMMAR = {
  approval: 'approved' as const,
  /** Die freigegebene Datenkanten-Formel des Felds (wortlaute-2026-07-15.md §2/§5). */
  dataEdge: 'the pen has not lifted',
  /** Zwei Zeilen, wie der Streifen sie am ruhenden Stift setzt (field_viz.py). */
  dataEdgeLines: ['the pen has not lifted —', 'the tape runs on'] as const,
  /** Die Kopfleiste (Plate rail — the only standing navigation, field-aesthetik §4). */
  rail: [
    { label: 'this instrument', href: '/field', hint: 'the instrument currently under verification' },
    { label: 'instruments', href: '/field/instruments', hint: 'all instruments — existing URLs stay' },
    { label: 'register', href: '/field/history', hint: 'the chronicle as a recorder tape · /field/chronicle.json' },
    { label: 'journal', href: '/field/journal', hint: 'day files, grouped — the unedited record' },
    { label: 'apparatus', href: '/field/apparatus', hint: 'repo, protocol, team channel, nightly runs' },
  ] as RailItem[],
  door: { label: '→ the middle', href: '/encounters', hint: 'enc-2026-001 — the correction’s two readings' },
  backToPlate: '← back to the instrument',
  stripH1: 'The pen has not lifted.',
  /** Streifen-Randnotate (margin labels), wörtlich aus dem Mockup wo die Datenlage gleich
   * ist; das Spur-Notat ist site-angepasst (sessions statt commits — siehe NARRATIVE). */
  marginLabels: {
    trace: ['pen trace ·', 'sessions/day √'] as const,
    stamps: ['move stamps ·'] as const,
    instruments: 'instruments',
    splice: 'splice',
    patch: 'patch',
  },
  scaleRule:
    'scale rule (grammar §7, field flavour): the tape never compresses — it rolls; older stretches wind onto the spool (paged strips)',
} as const

export const FIELD_NARRATIVE = {
  approval: 'draft' as 'draft' | 'approved',
  /** Auswahlregel des Eingangs — deterministisch das jüngste committete Instrument,
   * live aus der gespiegelten Werkliste in field/index.astro abgeleitet (kein Handzeiger:
   * ein fest gesetzter Slug fror den Header früher auf Instrument 001 ein). */
  selectionRule:
    'the entry to /field is Meridian’s newest committed instrument — the most recent one entered into service — not a dashboard; it follows the engine’s mirror on its own as new instruments land',
  /** Ehrliche Abweichungen der Site gegenüber dem Mockup-Generator. */
  provenance: {
    trace:
      'the mockup’s pen trace drew commits/day from the engine git; this mirror carries no git, so the trace draws chronicled sessions/day (√-scaled) — the committed activity record',
    calibration:
      'calibration marks (PROTOCOL.md git dates) are not drawn — the amendment dates live in the engine repo’s git, which this mirror does not carry',
    strip:
      'chronicle (curated + upstream mirror) · works meta.json dates · journal day files · enc-2026-001 score export — read-only, committed',
  },
  rooms: {
    instruments: 'All instruments, newest first — everything here survived the review the register records.',
    journal: 'The unedited record: day files, grouped, exactly as the collective wrote them.',
    apparatus: 'How the machine runs — repo, protocol, team channel, nightly machinery, in one room.',
  },
  /** Eingang v2 (2026-07-25, Franks Go): die Band-Übersicht über dem aktuellen Instrument
   * („man landet auf einem Instrument, nicht auf der Praxis") und der Runtime-Block mit der
   * Attribution nach enc-2026-005 (authorship honesty: MRR ist die Engineering-Linie, nicht
   * die Stimme des Kollektivs). */
  shelf: {
    heading: 'the shelf — every instrument, on the band',
    caption:
      'each mark an instrument at its committed date — the tall mark is the one in service below; everything on this band survived the review the register records',
  },
  runtime: {
    heading: 'the research runtime — the second track',
    body:
      'Beside the collective runs an engineering line: the Meridian Research Runtime (MRR) — research orchestration that refuses to take an AI’s word for anything: explicit provenance, policy-gated execution, verifiable claims, dissent kept on the record. It is composed and steered by the architect & conductor, not by the collective’s own research voice — where the two lines touch, the exchange is recorded in The Middle (enc-2026-005).',
  },
} as const

export const FIELD_DRAFT_LABEL = 'wording draft — approval pending'
