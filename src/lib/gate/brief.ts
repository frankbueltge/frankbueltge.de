// src/lib/gate/brief.ts — der Ablehnungsbrief des Build-Tors an die Praxen.
//
// Warum es diese Datei gibt (Ulysses, REQUESTS.md 2026-07-30, dritter Defekt desselben
// Kanals nach 2026-07-14 und 2026-07-16): Die Integrate-Workflows schickten bisher
// `tail -40` des Validierungslogs an das Engine-Repo. Bei `astro check` ist der Schluss des
// Logs aber die Warnungs-/Hinweis-Bilanz — der eigentliche Fehler steht weiter oben. Die
// Praxis bekam also einen Brief „deine Arbeit hat das Tor nicht passiert" plus drei
// Warnungen über eine Datei, die ihr gar nicht gehört. Und scheiterte der Lauf VOR dem
// Validieren (npm ci, Netzwerk, Klon), stand dort wörtlich „see workflow run" — bei einer
// Praxis ohne Lesezugriff auf dieses Repository eine Sackgasse.
//
// Ulysses' eigener Satz dazu ist das Pflichtenheft dieser Datei: „Rechts kann eine Ablehnung
// zu einer Korrektur werden. Im Moment kann sie nur zu einer Journalzeile werden, die sagt,
// ich konnte nicht feststellen, was fehlschlug — was ehrlich und für uns beide nutzlos ist."
//
// Drei Fälle, die der Brief unterscheiden MUSS — die Vermengung war der eigentliche Schaden:
//   own      — es sind Fehler in Dateien des eigenen Namensraums: bitte korrigieren.
//   foreign  — das Tor ist rot, aber an fremden Dateien: nichts zu tun, das ist Site-Sache.
//   unjudged — der Lauf scheiterte vor der Prüfung: die Arbeit wurde gar nicht beurteilt.
// Ein Brief, der „korrigiere dein Werk" sagt, obwohl das Werk nie geprüft wurde, ist keine
// Nachricht, sondern eine Fehlbeschuldigung.
//
// Englisch, weil die Engine-Repos englisch geführt werden (Ulysses' REQUESTS.md, field,
// studio). Die Steuerzentrale bleibt deutsch, die Praxen bekommen ihre eigene Sprache.

/** Fehlerzeilen erkennen wir an diesen Marken. Bewusst eng gehalten: Lieber ein Fehler,
 * den wir nicht zitieren (der volle Lauf ist verlinkt), als ein Brief voller Warnungen, in
 * dem der Fehler wieder untergeht — das war ja gerade der Defekt. */
const FEHLER_MARKEN = [
  / - error /i, // astro check: "src/x.astro:12:3 - error ts(2304): ..."
  /error TS\d+/,
  /^\s*(FAIL|✗|×)\s/,
  /AssertionError/,
  /^Error:/m,
  /^\s*✘/,
  /\[vite\]:? .*error/i,
]

/** ANSI-Farbcodes raus — die Logs der Runner sind voll davon, und im Markdown einer
 * Feedback-Datei sind sie unlesbarer Müll (siehe field-feedback/2026-07-30.md). */
export function ohneAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\[[0-9;]*m/g, '')
}

const MAX_ZEILEN = 40

/** Zieht die Fehlerzeilen aus dem Validierungslog, jeweils mit den zwei Folgezeilen als
 * Zusammenhang (astro check und vitest setzen den Codeausschnitt darunter). Reihenfolge und
 * Wortlaut bleiben unverändert — der Brief zitiert, er formuliert nicht um. */
export function fehlerzeilen(log: string): string[] {
  const zeilen = ohneAnsi(log).split('\n')
  const behalten = new Set<number>()
  for (let i = 0; i < zeilen.length; i++) {
    if (!FEHLER_MARKEN.some((re) => re.test(zeilen[i]))) continue
    behalten.add(i)
    for (let j = i + 1; j <= i + 2 && j < zeilen.length; j++) {
      if (zeilen[j].trim() !== '') behalten.add(j)
    }
  }
  const heraus: string[] = []
  for (const i of Array.from(behalten).sort((a, b) => a - b)) {
    if (heraus.length >= MAX_ZEILEN) break
    heraus.push(zeilen[i].trimEnd())
  }
  return heraus
}

/** Die Pfade, die einer Praxis gehören. Alles andere ist Site-Sache — dann darf der Brief
 * nicht zur Korrektur auffordern. */
export function eigenePfade(ns: string): string[] {
  return [`src/components/${ns}/`, `src/content/${ns}/`, `src/pages/${ns}/`, `public/${ns}/`]
}

export function betrifftEigeneDateien(zeilen: string[], ns: string): boolean {
  const pfade = eigenePfade(ns)
  return zeilen.some((z) => pfade.some((p) => z.includes(p)))
}

export type Befund = 'own' | 'foreign' | 'unjudged'

/** `log === null` heißt: Es gibt kein Validierungslog, der Lauf ist vorher gescheitert
 * (npm ci, Netzwerk, Klon). Genau dieser Fall stand bisher als „see workflow run" im Brief. */
export function befund(log: string | null, ns: string): Befund {
  if (log === null || log.trim() === '') return 'unjudged'
  const zeilen = fehlerzeilen(log)
  if (zeilen.length === 0) return 'foreign'
  return betrifftEigeneDateien(zeilen, ns) ? 'own' : 'foreign'
}

const KOPF: Record<Befund, string> = {
  own: 'Your contribution did not pass the build gate, and the failing files are yours. The errors are quoted below — please correct them and land again.',
  foreign:
    'The build gate is red, but not on files in your namespace. Nothing on your side needs correcting. This is a site-side fault and is reported as such; your next landing will pass once it is fixed.',
  unjudged:
    'The run failed BEFORE your contribution was validated (setup, network or checkout). Your work was not judged at all — there is nothing on your side to correct. No conclusion about your landing can be drawn from this run.',
}

export interface BriefEingabe {
  /** Namensraum der Praxis: field | studio | atelier | plenum */
  ns: string
  /** Inhalt des Validierungslogs, oder null wenn es keines gibt. */
  log: string | null
  /** URL des Workflow-Laufs — das Mindeste, das immer drinstehen muss. */
  runUrl: string
  /** ISO-Datum (YYYY-MM-DD). */
  date: string
}

export function baueBrief({ ns, log, runUrl, date }: BriefEingabe): string {
  const art = befund(log, ns)
  const zeilen = log ? fehlerzeilen(log) : []

  const teile = [`# Build feedback ${date}`, '', KOPF[art], '', `Run: ${runUrl}`, '']

  if (zeilen.length > 0) {
    teile.push('Failing lines, verbatim from the validation log:', '', '```', ...zeilen, '```', '')
  } else if (art !== 'unjudged') {
    teile.push(
      'No error line could be extracted from the log — the failure is real but did not match',
      'any known error format. The full log is in the run linked above.',
      '',
    )
  }

  teile.push('No deploy happened; the last good state stays live.')
  return teile.join('\n')
}
