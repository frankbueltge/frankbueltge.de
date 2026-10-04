// src/lib/nightly/face.ts — a nightly work's own face, where it has one.
//
// On 2026-09-03 the house told the nightly line that a work may carry a self-contained
// `index.html` beside its `work.md`, that the mirror would serve it bare at
// /error-as-method/works-html/<slug>/, and that the work's page here would link to it as the
// work's own face. The door was not built until 2026-10-04 (scripts/nightly/mirror.mjs now copies
// the page there). Since that day the line gives every experiment such a face, and `work.md`
// becomes the text that accompanies it — so a work page that renders the text and says nothing
// of the face would be showing the caption and hiding the picture.
//
// The check runs against the committed mirror at build time, the way the practices' windows are
// found (src/lib/ecology/pyramid/station.ts): the link appears with the integrate commit that
// brings the page and leaves with the one that removes it. A link onto nothing would be the site
// promising a work the practice has not made.
//
// Server-only: it reads the file system. Pages call it in their frontmatter; nothing hydrated
// may import it.
import { existsSync } from 'node:fs'

/** Where the mirror puts the faces, relative to the site root — in step with FACES in
 *  scripts/nightly/mirror.mjs. */
export const FACES_DIR = 'public/error-as-method/works-html'

/** The address a face is served at. */
export const faceHref = (slug: string): string => `/error-as-method/works-html/${slug}/`

/** The work's own face, or undefined when the mirror carries none for it. */
export function workFace(slug: string, exists: (path: string) => boolean = existsSync): string | undefined {
  return exists(`${FACES_DIR}/${slug}/index.html`) ? faceHref(slug) : undefined
}
