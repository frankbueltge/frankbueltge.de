// src/lib/atelier/trace-record.ts — a line's WHOLE trace, when half of it has been rotated away.
//
// Protocol v6 §8, amended 2026-08-12, makes rotation a protocol event: once a line's TRACE.md
// passes the size floor, its older ticks move unchanged into `archive/trace/<line>-<n>.md` and
// the live file keeps the newest. The record is not smaller — it is in two places. A reader
// that opens only the live file therefore reports a 62-tick line as a 5-tick one, and every
// count it derives measures when the last rotation happened rather than what the line did.
//
// Nothing here parses. It stitches, in record order — parts by part number, then the live file
// — so that every downstream parser sees exactly the ticks the practice wrote, in the order it
// wrote them. The parts carry a prose header of their own (title, provenance, entry count),
// which no tick pattern matches and which therefore costs nothing.
//
// Why a module and not two inline joins: the dossier counts moves and the refrain scores them
// from the same records, and two assemblies of the same record drift. That is this practice's
// own argument for one assembly layer (dossier-data.ts), applied one level down.

/** `2026-07-23-negative-parallax-1.md` → `{ id, part: 1 }`, anything else → null.
 *
 *  A line id ends in a slug, never in a bare number, so the trailing `-<n>` is unambiguous.
 *  SCORE rotations live in the same directory as `<line>-score-<date>.md` and must NOT match:
 *  they are a different file's history, and folding them into a trace would invent ticks. */
export function rotatedPart(filename: string): { id: string; part: number } | null {
  const base = filename.split('/').pop() ?? filename
  // Checked BEFORE the part pattern, because a score rotation also ends in digits — the day of
  // its date — and `…-score-2026-08-11.md` would otherwise read as part 11 of a line whose id
  // ends in `-score-2026-08`. Folding a SCORE into a TRACE would invent ticks out of a header.
  if (/-score-\d{4}-\d{2}-\d{2}\.md$/.test(base)) return null
  const m = /^(.+)-(\d+)\.md$/.exec(base)
  return m ? { id: m[1], part: Number(m[2]) } : null
}

/** Every rotated part belonging to one line, oldest part first.
 *  `parts` is a path→text map exactly as `import.meta.glob(…, { query: '?raw' })` returns it. */
export function partsFor(id: string, parts: Record<string, string>): string[] {
  return Object.entries(parts)
    .map(([path, text]) => ({ hit: rotatedPart(path), text }))
    .filter((e): e is { hit: { id: string; part: number }; text: string } => e.hit?.id === id)
    .sort((a, b) => a.hit.part - b.hit.part)
    .map((e) => e.text)
}

/** The live file, preceded by whatever was rotated out of it. Order is record order. */
export function wholeTrace(id: string, live: string, parts: Record<string, string>): string {
  const rotated = partsFor(id, parts)
  return rotated.length === 0 ? live : `${rotated.join('\n\n')}\n\n${live}`
}

/** Does the live file say it has rotated? It says so by POINTING: the header note names the
 *  parts, `archive/trace/<line>-<n>.md`, so that the record stays navigable from the half that
 *  is still live. The pointer is the signal here, not the word.
 *
 *  Matching the word instead was tried first and was wrong within the hour: three of these
 *  lines research the SI second, so their traces are full of "the rotation rate of the Earth"
 *  and "free rotation drift", and a reader keyed on `rotat…` declared them rotated. A record
 *  about rotation is not a rotated record — the difference is that one of them cites a path.
 *
 *  Whitespace is normalised first: these notes wrap at ~95 columns, and a line-based search
 *  across the break reports "no rotation" on a record that plainly declares one — the false
 *  negative that produced four wrong diagnoses in the engine repositories on 2026-08-12. */
export function declaresRotation(live: string): boolean {
  return /archive\/trace\/[^\s`)]+\.md/.test(live.replace(/\s+/g, ' '))
}
