// src/lib/atelier/lineText.ts — die lesbare Substanz einer Forschungslinie aus ihren Akten.
//
// Warum (Frank, 2026-07-30, zweiter Anlauf, Wortlaut privat): Wer eine Linie wie ‚negative
// parallax' auswählt, erfährt nichts über das Projekt, seinen Fortschritt oder seinen Stand
// und nichts darüber, worum es geht — für einen Erstbesucher der Website wird es dadurch
// nicht übersichtlicher, sondern komplexer.
//
// Er hat recht: Die erste Fassung zeigte Tageszahlen, Zugzahlen und Dateinamen — Telemetrie.
// In den Akten steht aber Prosa, die von selbst erklärt, worum es geht. Diese Datei holt
// genau die heraus, wörtlich und ohne Umformulierung:
//
//   Absicht   — `work_line.work_intention` (v5-Arbeitslinien) oder sonst der erste
//               Fließtext-Absatz der SCORE („1. Source situation")
//   Urteil    — der erste Fließtext-Absatz der DECISION, bei geschlossenen Linien
//   Züge      — Datum + Überschrift der Journaleinträge, die zur Linie gehören
//
// Nichts wird zusammengefasst oder neu formuliert: Die Praxis schreibt gut, und eine
// Paraphrase wäre eine zweite Stimme über ihrer. Gekürzt wird nur an Satzgrenzen.

/** Frontmatter abschneiden (der Block zwischen den ersten beiden `---`-Zeilen). */
export function ohneFrontmatter(md: string): string {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(md)
  // Führende Leerzeilen mit abräumen: Nach dem schließenden `---` steht in den Akten
  // regelmäßig eine, und ein Aufrufer, der auf die erste Überschrift prüft, fiele darüber.
  return (m ? md.slice(m[0].length) : md).replace(/^\s*\n/, '')
}

const KEIN_FLIESSTEXT = [
  /^#{1,6}\s/, // Überschrift
  /^\s*[-*+]\s/, // Aufzählung
  /^\s*\d+\.\s/, // nummerierte Aufzählung
  /^\s*>/, // Blockzitat
  /^\s*\|/, // Tabelle
  /^\s*```/, // Codezaun
  /^\s*\*\*[^*]+\*\*\s*$/, // fett gesetzte Vorspannzeile („**Concrete object, …**")
  /^\s*---\s*$/,
]

/** Der erste echte Fließtext-Absatz eines Markdown-Textes — Überschriften, Listen,
 * Blockzitate, Tabellen und fett gesetzte Vorspannzeilen werden übersprungen.
 * `mindest` hält Einzeiler wie „(none yet)" heraus. */
export function ersterAbsatz(md: string, mindest = 80): string | null {
  const bloecke = ohneFrontmatter(md).split(/\r?\n\s*\r?\n/)
  for (const roh of bloecke) {
    const zeilen = roh.split(/\r?\n/).filter((z) => z.trim() !== '')
    if (zeilen.length === 0) continue
    if (zeilen.some((z) => KEIN_FLIESSTEXT.some((re) => re.test(z)))) continue
    const text = zeilen.join(' ').replace(/\s+/g, ' ').trim()
    if (text.length >= mindest) return text
  }
  return null
}

/** Auf eine Satzgrenze kürzen statt mitten im Wort. Ohne passende Grenze wird hart
 * gekürzt — aber immer mit sichtbarem Auslassungszeichen, nie stillschweigend. */
export function aufSatzKuerzen(text: string, max = 340): string {
  if (text.length <= max) return text
  const teil = text.slice(0, max)
  const grenze = Math.max(teil.lastIndexOf('. '), teil.lastIndexOf('; '), teil.lastIndexOf(' — '))
  if (grenze > max * 0.5) return teil.slice(0, grenze + 1).trim()
  return `${teil.slice(0, teil.lastIndexOf(' ')).trim()} …`
}

/** Markdown-Auszeichnung aus einem Absatz nehmen, der als Prosa gezeigt wird.
 * Bewusst simpel: fett, kursiv, Code, Links — mehr steht in diesen Absätzen nicht. */
export function ohneAuszeichnung(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[\s(])\*([^*]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

/** Worum es in dieser Linie geht. `workIntention` kommt aus der Frontmatter der
 * v5-Arbeitslinien; ältere Projekte haben das Feld nicht, dort trägt der erste Absatz
 * der SCORE die Auskunft. */
export function absicht(scoreRaw: string, workIntention?: unknown): string | null {
  const ausFm = typeof workIntention === 'string' ? workIntention.replace(/\s+/g, ' ').trim() : ''
  if (ausFm.length >= 40) return aufSatzKuerzen(ohneAuszeichnung(ausFm))
  const abs = ersterAbsatz(scoreRaw)
  return abs ? aufSatzKuerzen(ohneAuszeichnung(abs)) : null
}

/** Warum die Linie so ausging, wie sie ausging — aus der DECISION. */
export function urteil(decisionRaw: string | undefined): string | null {
  if (!decisionRaw) return null
  const abs = ersterAbsatz(decisionRaw)
  return abs ? aufSatzKuerzen(ohneAuszeichnung(abs), 260) : null
}

export interface Zug {
  datum: string
  titel: string
}

/** Überschrift eines Journaleintrags: „# 2026-07-30 — The switch and the setting"
 * → „The switch and the setting". Ohne Überschrift trägt der Dateiname die Auskunft,
 * dann aber lesbar gemacht statt als Slug gezeigt. */
export function zugTitel(journalRaw: string, dateiname: string): string {
  for (const zeile of ohneFrontmatter(journalRaw).split(/\r?\n/).slice(0, 20)) {
    const m = /^#\s+(.*\S)\s*$/.exec(zeile)
    if (!m) continue
    const roh = m[1].replace(/^\d{4}-\d{2}-\d{2}\s*[—–-]\s*/, '').trim()
    if (roh) return ohneAuszeichnung(roh)
  }
  const rest = dateiname.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ')
  return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : dateiname
}
