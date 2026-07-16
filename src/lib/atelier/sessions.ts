// Session register of the Atelier (Praxis-Oberflächen-Paket; atelier-aesthetik §5/§6):
// „die Praxis zählt in Sessions, nicht in Tagen“. The engine's journal files carry the
// count in their committed FILENAMES — a day file is the day's first session, additional
// sessions of the same night name their number explicitly (`…-sitzung-N.md`, later
// `…-session-N.md`). This module derives the register purely from those ids: no git, no
// clock, no network — deterministic at build time.
//
// Honesty rule: where a filename names its number explicitly, the derived sequence must
// agree (`matchesExplicit`). The register test asserts this on the real committed data —
// if the engine's numbering ever drifts, the build surfaces it instead of renumbering
// silently (the same ethic as engines/journal.ts's collision-safe anchors).

export interface SessionPage {
  /** register number — S1…SN, sequential over (date, explicit-number) order */
  n: number
  date: string
  /** collection id, e.g. `journal/2026-07-14-session-27.md` */
  id: string
  /** the number the filename itself claims, if any */
  explicit: number | null
  matchesExplicit: boolean
}

const ID_RE = /journal\/(\d{4}-\d{2}-\d{2})(?:-(?:sitzung|session)-(\d+))?(?:\.md)?$/

/** Derives the session register S1…SN from journal collection ids (filenames verbatim). */
export function sessionRegister(ids: readonly string[]): SessionPage[] {
  const parsed = ids
    .map((id) => {
      const m = id.match(ID_RE)
      if (!m) return null
      return { id, date: m[1], explicit: m[2] ? Number(m[2]) : null }
    })
    .filter((p): p is { id: string; date: string; explicit: number | null } => p !== null)

  // Within a day the base file (no explicit number) is the day's first session; explicitly
  // numbered files follow in their own order.
  parsed.sort((a, b) =>
    a.date === b.date ? (a.explicit ?? 0) - (b.explicit ?? 0) : a.date.localeCompare(b.date),
  )

  return parsed.map((p, i) => ({
    n: i + 1,
    date: p.date,
    id: p.id,
    explicit: p.explicit,
    matchesExplicit: p.explicit === null || p.explicit === i + 1,
  }))
}

/** Small deterministic number-to-words (1–99) for the spine's headline formula
 * („Twenty-eight nights; the next page is not written.“ — atelier_history_viz.py). */
export function numberWord(n: number): string {
  const ones = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
  ]
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  if (n < 0 || n > 99 || !Number.isInteger(n)) return String(n)
  if (n < 20) return ones[n]
  const t = Math.floor(n / 10)
  const o = n % 10
  return o === 0 ? tens[t] : `${tens[t]}-${ones[o]}`
}

/** The spine's headline: „<N> nights; the next page is not written.“ (capitalized). */
export function spineHeadline(pageCount: number): string {
  const word = numberWord(pageCount)
  return `${word.charAt(0).toUpperCase()}${word.slice(1)} nights; the next page is not written.`
}
