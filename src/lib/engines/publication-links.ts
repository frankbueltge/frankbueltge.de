// src/lib/engines/publication-links.ts — where a link to a practice's piece points (2026-10-17).
//
// The surfaces that name a practice's newest piece (the board on /now and the front page, a
// practice's own page) read the ecology's record, which addresses every piece where the mirror
// puts it: `/atelier/window/<dir>/`, `/field/artifacts/<dir>/`. Since the publication rule of
// 2026-10-17 (./publication.mjs) the site no longer serves a session's window or artifact, so such
// a link would only reach the piece through a 301. This asks the rule instead: a piece the site
// publishes keeps its address, one it does not is linked at its place in the practice's
// repository. The record itself keeps the mirror addresses — they are how a piece is tied to the
// session that made it (src/lib/ecology/session-label.ts, repoPathOf).

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { n1WorkPages } from '@/lib/n1/published'
import { publishedHref, repoUrl } from './publication.mjs'

/**
 * A journal session's own file in its practice's repository. The site rendered one page per
 * session until 2026-10-17; the session notes the ecology's record reads (src/lib/ecology/v3.ts,
 * loadSessionNotes) carry the committed file they were read from, which is the same file the
 * repository holds under the same path. For the Field and the Studio that is the day file holding
 * the session.
 */
export function sessionHref(note: { practice: 'atelier' | 'field' | 'studio'; source: string }): string {
  return repoUrl(note.practice, note.source.replace(`src/content/${note.practice}/`, ''), 'blob')
}

const n1Works = new Map<string, Set<string>>()

/**
 * A piece's link under the publication rule. Whether an address is a mirrored file is read from
 * the committed mirror under `root`/public — the same files the build copies into dist/.
 */
export function pieceHref(href: string, root: string = process.cwd()): string {
  const n1Pages = href.startsWith('/n-1/')
    ? (n1Works.get(root) ?? n1Works.set(root, n1WorkPages(join(root, 'public', 'n-1'))).get(root))
    : undefined
  return publishedHref(href, { isMirrored: (path) => existsSync(join(root, 'public', path)), n1Pages })
}
