// src/lib/nightly/opening.ts — the nightly line's own opening for its room, when it writes one.
//
// The room at /error-as-method speaks in the house's voice about a practice that has its own. On
// 2026-10-18 the house offered the line a slot (its REQUESTS.md, team note of that day): a short
// text of at most 150 words in SITE-OPENING.md at the root of its repository, which the mirror copies
// to src/data/nightly/ and the room then shows in place of the house's opening. Until the file
// exists, nothing changes. When it exists and keeps to the limit, it stands at the top of the room
// as the line wrote it: paragraphs and inline emphasis, nothing else, and links shown as their text
// (the line's contract asks it for no links into the site's routes). A longer text is not cut, and
// not shown: the house's opening stands, and the build says why.

/** The file's name, in the line's repository and in the mirror alike. */
export const OPENING_FILE = 'SITE-OPENING.md'
/** The limit the offer named. */
export const OPENING_MAX_WORDS = 150

/** Words as a reader counts them: runs of non-space that carry a letter or a digit. */
export function wordsIn(text: string): number {
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}

/** The text's paragraphs, as written: blank-line separated, without comments, heading marks or the
 *  hard wraps inside a paragraph. */
export function paragraphsOf(text: string): string[] {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/\r?\n[ \t]*\r?\n/)
    .map((block) =>
      block
        .split(/\r?\n/)
        .map((line) => line.replace(/^\s{0,3}#{1,6}\s+/, '').trim())
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
}

export type OpeningReading =
  | { state: 'none' }
  | { state: 'shown'; paragraphs: string[]; words: number }
  | { state: 'over'; words: number }

/** What the room does with the file's text: nothing without one, show it within the limit. */
export function readOpening(text: string | undefined): OpeningReading {
  if (text === undefined) return { state: 'none' }
  const paragraphs = paragraphsOf(text)
  const words = wordsIn(paragraphs.join(' '))
  if (!words) return { state: 'none' }
  return words > OPENING_MAX_WORDS ? { state: 'over', words } : { state: 'shown', paragraphs, words }
}

/** The line's opening as the mirror carries it. */
export function lineOpening(): OpeningReading {
  const files = import.meta.glob('/src/data/nightly/SITE-OPENING.md', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>
  const reading = readOpening(files[`/src/data/nightly/${OPENING_FILE}`])
  if (reading.state === 'over') {
    console.warn(
      `[nightly] ${OPENING_FILE} has ${reading.words} words, over the ${OPENING_MAX_WORDS} the house offered: the house's opening stands`,
    )
  }
  return reading
}
