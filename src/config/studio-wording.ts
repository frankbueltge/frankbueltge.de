// Studio-Wortlaute (Praxis-Oberflächen-Paket; research-ecology docs/design/
// studio-aesthetik-2026-07-15.md + wortlaute-2026-07-15.md §1, Zwei-Schichten-Regel):
//
//   GRAMMAR   — statische Formeln der Bühne (Datenkante „the next bill is not yet
//               printed“, Marquee, Kopfleiste, Gassen-Beschriftung, Zähl-Formeln),
//               freigegeben mit der Design-Session vom 2026-07-15, wörtlich aus
//               studio_viz.py. Unter Testschutz (src/lib/studio/stage.test.ts).
//   NARRATIVE — neue Erzähl-Wortlaute dieser Verdrahtung, approval: 'draft' bis Franks
//               Freigabe; Seiten zeigen den Draft-Chip (Muster: naming.ts).
//
// ADR 0010: die Bühne teilt keine visuelle Grammatik mit Partitur, Blatt oder Protokoll.
import { numberWord } from '@/lib/atelier/sessions'

export interface RailItem {
  label: string
  href: string
  hint: string
}

export const STUDIO_GRAMMAR = {
  approval: 'approved' as const,
  /** Die freigegebene Datenkanten-Formel des Studios (wortlaute-2026-07-15.md §2/§5). */
  dataEdge: 'the next bill is not yet printed',
  /** Die volle Abendzettel-Kante, wie der Zettel sie druckt (studio_viz.py). */
  playbillEdge: 'The house plays nightly — the next bill is not yet printed.',
  /** Marquee-Zeile — statisch, nichts blinkt (Bestandsregel). */
  marquee: 'LIVE STATUS TRAVELS · OBLIGATION ACTIVE',
  gasseLabel: 'DIE GASSE · OFFSTAGE — VISIBLE, UNLIT',
  rail: [
    { label: 'this stage', href: '/studio', hint: 'what is public now' },
    { label: 'works', href: '/studio/works', hint: 'premiered works — existing URLs stay' },
    { label: 'playbill', href: '/studio/history', hint: 'the chronicle as an evening bill + the journal' },
    { label: 'apparatus', href: '/studio/apparatus', hint: 'repo, constitution, team channel, nightly runs' },
  ] as RailItem[],
  door: { label: '→ the middle', href: '/encounters', hint: 'enc-2026-001 — the correction this house sent upstream' },
  backToStage: '← back to the stage',
  /** Zähl-Formeln (Grammatik; die Werte kommen aus den Daten). Für die Design-Session-
   * Zählung (1/7 bzw. 2/12) ergeben sie byte-genau die Mockup-Zeilen. */
  stageHeadline(onStage: number, struck: number): string {
    const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
    const works = onStage === 1 ? 'work is' : 'works are'
    return `${cap(numberWord(onStage))} ${works} on. ${cap(numberWord(struck))} are struck.`
  },
  strikeNote(struck: number): string {
    return `${numberWord(struck)} positions struck — the floor keeps every mark`
  },
  playbillHeadline(evenings: number, sessions: number): string {
    const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
    return `${cap(numberWord(evenings))} evenings. ${cap(numberWord(sessions))} sessions.`
  },
  /** Abend-Etikett des Zettels (Theaterzettel-Geste, deutsch wie im Mockup). */
  eveningLabel(n: number): string {
    const ordinals = [
      'Erster', 'Zweiter', 'Dritter', 'Vierter', 'Fünfter', 'Sechster',
      'Siebter', 'Achter', 'Neunter', 'Zehnter', 'Elfter', 'Zwölfter',
    ]
    return n >= 1 && n <= ordinals.length ? `${ordinals[n - 1]} Abend` : `Abend ${n}`
  },
  scaleRule:
    'scale rule (grammar §7, studio flavour): one bill per evening; past bills stack in the archive, the season index lists them',
} as const

export const STUDIO_NARRATIVE = {
  approval: 'draft' as 'draft' | 'approved',
  stageRule:
    'the entry to /studio is the stage, not a gallery grid: one spot, and the floor keeps every strike',
  provenance: {
    stage:
      'chronicle mirror (curated + upstream) · works meta.json · enc-2026-001 score export · kill reasons hand-curated in src/data/studio/stage.curated.json from the engine repo’s session commits (quoted verbatim; the mirror does not carry commit messages)',
    playbill: 'chronicle mirror, summaries verbatim; first sentence on the bill, full text in the table',
  },
  rooms: {
    works: 'What has premiered — everything here passed the full gate, the hostile critique published either way.',
    playbill: 'One bill per evening; below it, the unedited journal of the house.',
    apparatus: 'How the machine runs — repo, constitution, team channel, nightly machinery, in one room.',
  },
} as const

export const STUDIO_DRAFT_LABEL = 'wording draft — approval pending'
