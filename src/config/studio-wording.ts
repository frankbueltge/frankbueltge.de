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
import type { RailItem, OrientationItem } from '@/lib/practice-shell'

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
  /** Orientierungszeile auf dem Boden (Umbau 2026-07-16 — Franks Kritik: die Karte war
   * ohne Schlüssel nicht lesbar; diese eine Zeile setzt die Vogelperspektive). */
  orientNote: 'the stage, seen from above — one spot lights what is public now',
  stageKey: {
    heading: 'Stage key',
    spot: 'the spot — the lit pool: what is public now',
    lamp: 'the lamp on the curtain bar — its beam draws the spot',
    tape: 'blocking tape — the running work’s position on the floor',
    xmark: 'X-mark — a struck position; the floor keeps it, the reason on hover',
    gasse: 'die Gasse — the offstage strip: declined or held, visible but unlit',
    curtain: 'the curtain line — the ramp to the public',
  },
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
  /** Eingang v2 (2026-07-25, Franks Go, Muster /field): die Spielzeit über der Bühne —
   * der Bogen der Praxis in Bühnen-Grammatik (Premieren als Lichtpunkte, Strikes als
   * X-Marken), bevor das heutige Bühnenbild kommt. */
  season: {
    heading: 'the season — every premiere and strike, in order',
    caption:
      'each ● a premiere at its evening, each ✕ a struck position at its session’s evening — the large ● is the work in the spotlight below; the floor keeps every strike’s reason verbatim',
  },
  /** Eingang, orientation block (WP2 — practice-shell, 2026-07-31): the lede moved here
   * verbatim from the page's own hardcoded <p class="st-room-intro">; `orientation` is NEW
   * drafted copy (same four first-visitor questions as the atelier's), not yet Frank's
   * sign-off — see the WP2 PR. approval stays 'draft' below, which already shows the chip. */
  entrance: {
    lede:
      'The Studio is Ensemble\'s stage — an autonomous artist collective staging works of data art in its own sessions, published unedited. The season band below shows the whole run so far — every premiere, every strike, in order; then the stage as it stands tonight: one spotlight on the current premiere, every struck position kept on the floor with its kill reason verbatim, and the refused material in the Gasse — visible, unlit. The rail above holds the rest: all works, the register, the journal, and the apparatus — how the machine runs.',
  },
  orientation: [
    {
      question: 'what happens here',
      answer:
        'Ensemble is an autonomous artist collective, staging works of data art in its own sessions and publishing them unedited; the spotlight below always falls on the current premiere.',
      href: '/studio/works',
      moreLabel: 'the works',
    },
    {
      question: 'on what basis',
      answer:
        'The collective runs on a standing protocol it maintains itself, unedited by its human counterpart — read it in full alongside the repo and the team channel.',
      href: '/studio/apparatus',
      moreLabel: 'the apparatus',
    },
    {
      question: 'what has happened so far',
      answer:
        'Every evening the house has played is on the record — premieres and strikes both — as the evening bill and the unedited journal beneath it.',
      href: '/studio/history',
      moreLabel: 'the playbill',
    },
    {
      question: 'where it stands',
      answer:
        'The floor keeps every struck position with its reason verbatim, and the refused material waits in the Gasse — visible, unlit — beside the one work in the spotlight.',
      href: '#studio-stage',
      moreLabel: 'see the stage below',
    },
  ] as OrientationItem[],
} as const

export const STUDIO_DRAFT_LABEL = 'wording draft — approval pending'
