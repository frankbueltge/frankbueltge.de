// src/lib/gate/brief.ts — the build gate's letter of refusal to the practices.
//
// Why this file exists (Ulysses, REQUESTS.md 2026-07-30, the third defect of this same channel
// after 2026-07-14 and 2026-07-16): the integrate workflows used to send `tail -40` of the
// validation log to the engine repository. With `astro check` the tail of the log is the
// warning/hint tally — the actual error sits further up. So a practice received a letter saying
// "your work did not pass the gate" plus three warnings about a file it does not even own. And
// when the run failed BEFORE validation (npm ci, network, checkout), the letter literally read
// "see workflow run" — a dead end for a practice with no read access to this repository.
//
// Ulysses' own sentence is the specification for this file: "A refusal can become a correction.
// Right now it can only become a journal line saying I could not determine what failed — which
// is honest and useless to us both."
//
// Three cases the letter MUST distinguish; conflating them was the actual damage:
//   own          — errors in files of the practice's own namespace: please correct them.
//   unattributed — the gate is red, but who owns the defect cannot be derived from the log:
//                  quote the failing lines, pass no verdict.
//   unjudged     — the run failed before validation: the work was never judged at all.
// A letter that says "correct your work" about work that was never checked is not a message but
// a false accusation.
//
// `foreign` was REMOVED on 2026-07-31, on Meridian's measurement (field-research REQUESTS.md
// 2026-07-31, sessions 74/75). The sentence "not on files in your namespace. Nothing on your
// side needs correcting. This is a site-side fault" was wrong FOUR times in eleven days, every
// time about a defect of the practice itself — two of the four Meridian had predicted in its own
// minutes hours before the letter existed. Once it cost the whole ecology three days without a
// deploy: the practice believed the letter, concluded the fault was site-side, and stopped
// looking.
//
// The cause is structural, not one path that was still missing: ownership cannot be derived from
// a log at all. The failure sat in `src/lib/field/chronicle.test.ts` — a file of THIS repository
// whose assertion judges the practice's data (register against journal headings). Site file,
// upstream cause. Turning that into "site-side fault" is a guess. Meridian's wording, and it is
// the specification for the change:
//   "When ownership cannot be computed, report the failing assertion and stop. The assertion is
//    evidence; an attribution the generator cannot derive is a hypothesis wearing a verdict's
//    clothes, and it is read as a verdict by whoever is on the other end."
// They also offered a lookup table for that one test and said in the same breath that they would
// rather have the general form. The general form is what is implemented here, not the table. The
// letter now states its evidence and lets the practice conclude; it claims "nothing on your side"
// only where that really is established (unjudged: there was no validation).
//
// English, because the engine repositories are kept in English (Ulysses' REQUESTS.md, field,
// studio). The Steuerzentrale stays German; the practices get their own language.

/** Error lines are recognised by these marks. Deliberately narrow: better an error we fail to
 * quote (the full run is linked) than a letter full of warnings in which the error drowns again
 * — that was precisely the defect. */
const FEHLER_MARKEN = [
  / - error /i, // astro check: "src/x.astro:12:3 - error ts(2304): ..."
  /error TS\d+/,
  /^\s*(FAIL|✗|×)\s/,
  /AssertionError/,
  /^Error:/m,
  /^\s*✘/,
  /\[vite\]:? .*error/i,
]

/** Strip ANSI colour codes — runner logs are full of them, and inside the markdown of a feedback
 * file they are unreadable rubbish (see field-feedback/2026-07-30.md). */
export function ohneAnsi(text: string): string {
  // The pattern starts with a literal ESC control byte (0x1b) — invisible in every editor.
  // Treat it as load-bearing: rewriting this file from a copy that normalises text drops it
  // silently, and without it the function still runs, still looks right, and strips nothing.
  // That happened while this very comment was being written; the ohneAnsi test caught it.
  // eslint-disable-next-line no-control-regex
  return text.replace(/\[[0-9;]*m/g, '')
}

const MAX_ZEILEN = 40

/** Pulls the error lines out of the validation log, each with the following two lines as context
 * (astro check and vitest put the code excerpt underneath). Order and wording stay untouched —
 * the letter quotes, it does not rephrase. */
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

/** The paths a practice owns. Everything else is site territory — and there the letter must not
 * demand a correction. */
export function eigenePfade(ns: string): string[] {
  return [`src/components/${ns}/`, `src/content/${ns}/`, `src/pages/${ns}/`, `public/${ns}/`]
}

export function betrifftEigeneDateien(zeilen: string[], ns: string): boolean {
  const pfade = eigenePfade(ns)
  // Only lines that are themselves error lines testify to ownership. The kept context lines are
  // code excerpts, and a site test's source can quote a practice path: on 2026-08-02 the atelier
  // letter said "the failing files are yours" four times because dossier.test.ts builds its keys
  // under `src/content/atelier/` and that quoted line was counted as evidence. An excerpt is
  // quoted, not convicted — ownership must stand on the failing line itself.
  return zeilen
    .filter((z) => FEHLER_MARKEN.some((re) => re.test(z)))
    .some((z) => pfade.some((p) => z.includes(p)))
}

export type Befund = 'own' | 'unattributed' | 'unjudged'

/** `log === null` means there is no validation log: the run failed earlier (npm ci, network,
 * checkout). That is exactly the case that used to read "see workflow run".
 *
 * Only ONE finding is positively derivable: an error in a path the practice owns. Everything
 * else — errors in other paths, no recognisable error line at all — is `unattributed`. The old
 * equation "not in your paths ⇒ site fault" was wrong four times (see the file header); a site
 * file can fail on a practice's data. */
export function befund(log: string | null, ns: string): Befund {
  if (log === null || log.trim() === '') return 'unjudged'
  const zeilen = fehlerzeilen(log)
  if (zeilen.length === 0) return 'unattributed'
  return betrifftEigeneDateien(zeilen, ns) ? 'own' : 'unattributed'
}

const KOPF: Record<Befund, string> = {
  own: 'Your contribution did not pass the build gate, and the failing files are yours. The errors are quoted below — please correct them and land again.',
  unattributed:
    'The build gate is red. This letter does not say whose defect it is, because that cannot be derived from the log: a file in the site repository can fail on data from yours — a test here asserting over your chronicle is red when a heading or an entry is missing upstream, and the path it names is ours either way. What failed is quoted below; read it and judge. If nothing in it touches your work, there is nothing on your side to correct.',
  unjudged:
    'The run failed BEFORE your contribution was validated (setup, network or checkout). Your work was not judged at all — there is nothing on your side to correct. No conclusion about your landing can be drawn from this run.',
}

export interface BriefEingabe {
  /** The practice's namespace: field | studio | atelier | plenum */
  ns: string
  /** Contents of the validation log, or null when there is none. */
  log: string | null
  /** URL of the workflow run — the minimum that must always be in there. */
  runUrl: string
  /** ISO date (YYYY-MM-DD). */
  date: string
}

export function baueBrief({ ns, log, runUrl, date }: BriefEingabe): string {
  const art = befund(log, ns)
  const zeilen = log ? fehlerzeilen(log) : []

  const teile = [`# Build feedback ${date}`, '', KOPF[art], '', `Run: ${runUrl}`, '']

  if (zeilen.length > 0) {
    teile.push('Failing lines, verbatim from the validation log:', '', '```', ...zeilen, '```', '')
  } else if (art === 'unattributed') {
    // None of the error marks matched. That, too, is a statement about OUR parser rather than
    // about the practice — the letter says so and claims nothing about ownership.
    teile.push(
      'No error line could be extracted from the log — the failure is real, but it did not match',
      'any error format this letter knows how to quote. That is a limit of this generator, not a',
      'finding about your work. The full log is in the run linked above.',
      '',
    )
  }

  teile.push('No deploy happened; the last good state stays live.')
  return teile.join('\n')
}
