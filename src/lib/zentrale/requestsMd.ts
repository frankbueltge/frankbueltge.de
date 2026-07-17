// src/lib/zentrale/requestsMd.ts — Lesen und Schreiben der REQUESTS.md-Dateien der drei
// Engines (field/studio/atelier) und des Plenums. Pure Textoperationen auf dem Markdown —
// kein Parser-Framework, nur Regex auf Zeilenebene, weil das Format selbst schon einfach ist
// (H2 = Section, Blockquote-Konvention für verschachtelte Antworten). Wird sowohl von Astro
// (Lesen fürs Dashboard) als auch von einer Pages Function (Schreiben bei "beantworten") genutzt
// — daher nur Web-APIs, kein fs.

export type RequestSection = { heading: string; body: string; status: string | null }

/** Eine "**Status:** …"-Zeile, optional eingerückt/in einem Blockquote ("> "). */
const STATUS_LINE_RE = /^(\s*>?\s*)\*\*Status:\*\*.*$/m
/** Dieselbe Zeile, aber mit dem Wert als Capture-Group (für parseSections' Lesezugriff). */
const STATUS_VALUE_RE = /^(?:\s*>?\s*)\*\*Status:\*\*\s*(.*)$/m

/** Positionen der H2-Sections im Rohtext — die gemeinsame Grundlage für lesende und
 * schreibende Funktionen, damit beide exakt dieselbe Vorstellung von "eine Section" haben. */
function locateSections(md: string): Array<{ heading: string; start: number; bodyStart: number; end: number }> {
  const heading_re = /^## (.*)$/gm
  const starts: Array<{ heading: string; start: number; bodyStart: number }> = []
  let m: RegExpExecArray | null
  while ((m = heading_re.exec(md)) !== null) {
    starts.push({ heading: m[1].trim(), start: m.index, bodyStart: heading_re.lastIndex })
  }
  return starts.map((s, i) => ({
    heading: s.heading,
    start: s.start,
    bodyStart: s.bodyStart,
    end: i + 1 < starts.length ? starts[i + 1].start : md.length,
  }))
}

/** Zerlegt das Dokument in H2-Sections. Text vor der ersten H2 (Präambel/Standing Rule)
 * ist bewusst keine Section — er gehört niemandem, den man "beantworten" könnte. */
export function parseSections(md: string): RequestSection[] {
  return locateSections(md).map(({ heading, bodyStart, end }) => {
    const raw = md.slice(bodyStart, end)
    const body = raw.replace(/^\n/, '').replace(/\s+$/, '')
    const statusMatch = STATUS_VALUE_RE.exec(raw)
    return { heading, body, status: statusMatch ? statusMatch[1].trim() : null }
  })
}

export function findSection(md: string, heading: string): RequestSection | null {
  const target = heading.trim()
  return parseSections(md).find((s) => s.heading === target) ?? null
}

export function answerRequest(
  md: string,
  heading: string,
  opts: { decision: 'enabled' | 'declined' | 'note'; message: string; date: string },
): { ok: true; md: string } | { ok: false; reason: 'not-found' } {
  const target = heading.trim()
  const sections = locateSections(md)
  const section = sections.find((s) => s.heading === target)
  if (!section) return { ok: false, reason: 'not-found' }

  const statusWord = opts.decision === 'enabled' ? 'enabled' : opts.decision === 'declined' ? 'declined' : 'answered'
  const statusValue = `${statusWord} (${opts.date})`

  let body = md.slice(section.bodyStart, section.end)
  if (STATUS_LINE_RE.test(body)) {
    // Erstes Vorkommen ersetzen, Einrückung/Blockquote-Marker (Group 1) bleibt erhalten.
    body = body.replace(STATUS_LINE_RE, (_match, prefix: string) => `${prefix}**Status:** ${statusValue}`)
  } else {
    // Keine Status-Zeile vorhanden — eine anhängen, statt stillschweigend nichts zu tun.
    body = `${body.replace(/\s+$/, '')}\n\n**Status:** ${statusValue}\n`
  }

  const trimmed = body.replace(/\s+$/, '')
  const responseLine = `> **Response (team, ${opts.date}):** ${opts.message}`
  const newBody = `${trimmed}\n\n${responseLine}\n`

  return { ok: true, md: md.slice(0, section.bodyStart) + newBody + md.slice(section.end) }
}

/** Baut den verschachtelten Blockquote-Block, den field/studio für Seeds benutzen —
 * jede Zeile bekommt "> ", Leerzeilen bleiben ein bloßes ">" (die im Repo etablierte Konvention). */
function seedBlock(opts: { title: string; body: string; date: string }): string {
  const bodyLines = opts.body
    .split('\n')
    .map((line) => (line.length > 0 ? `> ${line}` : '>'))
    .join('\n')
  return `> ### ${opts.date} — Seed: ${opts.title}\n>\n${bodyLines}\n>\n> **Status:** seed (open)`
}

export function appendSeed(md: string, opts: { title: string; body: string; date: string }): string {
  const block = seedBlock(opts)
  const sections = locateSections(md)
  const seedsIdx = sections.findIndex((s) => /^Seeds/i.test(s.heading))

  if (seedsIdx === -1) {
    // Atelier hat keine Seeds-Section (bewusst, Ulysses hat kein "Frank darf säen"-Kapitel) —
    // eine neue H2-Section am Dateiende anlegen statt den Aufruf abzulehnen.
    const trimmed = md.replace(/\s+$/, '')
    return `${trimmed}\n\n## Seeds from the team\n\n${block}\n`
  }

  const section = sections[seedsIdx]
  const raw = md.slice(section.bodyStart, section.end)
  const trimmedRaw = raw.replace(/\s+$/, '')
  const newRaw = `${trimmedRaw}\n\n${block}\n`
  return md.slice(0, section.bodyStart) + newRaw + md.slice(section.end)
}

/** Der Titel, unter dem eine offene Request als GitHub-Issue in der Inbox landet
 * ("Request aus {repo}: {heading}") — repo ist das Engine-Repo (keine Leerzeichen),
 * heading der volle Section-Titel, auch wenn er selbst Doppelpunkte/Gedankenstriche trägt. */
export function parseInboxIssueTitle(title: string): { repo: string; heading: string } | null {
  const m = /^Request aus (\S+):\s(.*)$/s.exec(title)
  if (!m) return null
  return { repo: m[1], heading: m[2] }
}
