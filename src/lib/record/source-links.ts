// The guard against linking to unlicensed copies (Frank, 2026-08-19, after the sweep).
//
// On 2026-08-18 the record was enumerated rather than guessed for the first time: 1,670 links
// to PDFs, 370 distinct URLs, 161 hosts. Almost all of it was sound — agencies, standards
// bodies, institutional repositories, open access, organisations publishing their own
// documents. Twenty-seven URLs were not, and they arrived in three shapes:
//
//   1. informal archives (Monoskop, libcom, a WordPress blog, an archive.org file server);
//   2. course and teaching pages mirroring other people's articles;
//   3. personal and organisational sites holding a text by someone else — the shape that
//      slipped through the sweep's own first triage, and that carried its two largest counts.
//
// Under GS Media (CJEU C-160/15) a link to a source published without the rightsholder's
// consent can itself be a communication to the public where the linker knew or ought to have
// known. A record that names the host in its own manifest cannot claim it did not know, and
// this record is public and published under a real person's name.
//
// The guard is deliberately mechanical, like the privacy guard beside it. It cannot read a
// licence and does not try. It knows two things: hosts already found holding other people's
// texts, and paths that say "teaching copy" whatever the host. Everything else is cleared or
// missed, and the second is why the rule below matters more than the list.
//
// THE RULE THIS ENCODES, for the case the guard cannot see: a source's bytes may be linked
// where the host is the rightsholder, the author, or a repository holding it by deposit —
// and otherwise the work is cited and not linked. A citation costs a reader one search. A
// link to an unlicensed copy costs the practice its footing.
//
// THE LIST LIVES BESIDE THIS FILE, NOT IN IT (2026-08-19, the morning after). The guard
// only ever read the record; the nightly katalog-scout WRITES it, from the practices'
// citations, and knew nothing of the list — so it put three refused links back the same
// night the sweep removed them, and the site stopped deploying. Both readers now take
// their hosts and paths from `src/data/source-link-denylist.json`, so a host added here
// is a host the builder keeps out tomorrow.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import allowlist from '@/data/source-link-allowlist.json'
import denylist from '@/data/source-link-denylist.json'

/** Where the published record lives in this repository, mirrors included. */
export const SCANNED_ROOTS = ['src/content', 'src/data', 'src/components', 'public', 'docs']

const SKIPPED = new Set(['node_modules', 'dist', '.astro', '__pycache__', 'archive'])
const EXTENSIONS = ['.md', '.json', '.astro', '.ts', '.txt', '.html', '.css']

/**
 * Hosts found holding a text whose author they are not. Not "shadow libraries" — three of
 * these are the personal sites of respected researchers, which is the point: the question is
 * never what kind of site it is, only whether it holds someone else's work.
 */
export const DENIED_HOSTS: string[] = denylist.hosts

/**
 * Paths that mark a teaching copy whatever the host carries. This catches what a host list
 * never can: on 2026-08-19 it found a reading on a lecturer's own course domain that the
 * sweep's three stages had all walked past, because the domain was neither a university nor
 * an archive.
 */
export const TEACHING_PATHS = new RegExp(
  `/(${denylist.teachingPathSegments.join('|')})/`,
  'i',
)

const CLEARED = new Set((allowlist as { cleared: { url: string }[] }).cleared.map((c) => c.url))

const LINK = /https?:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+\.pdf/g

export interface DeniedLink {
  file: string
  line: number
  url: string
  reason: 'host' | 'teaching-path'
}

export function scanFile(file: string, text: string): DeniedLink[] {
  const out: DeniedLink[] = []
  for (const m of text.matchAll(LINK)) {
    const url = m[0]
    if (CLEARED.has(url)) continue
    const host = url.replace(/^https?:\/\//, '').split('/')[0]
    const reason = DENIED_HOSTS.includes(host)
      ? 'host'
      : TEACHING_PATHS.test(url)
        ? 'teaching-path'
        : null
    if (!reason) continue
    out.push({ file, line: text.slice(0, m.index).split('\n').length, url, reason })
  }
  return out
}

function filesUnder(dir: string): string[] {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (SKIPPED.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) out.push(...filesUnder(path))
    else if (EXTENSIONS.some((e) => name.endsWith(e))) out.push(path)
  }
  return out
}

/** Every link in the published record that points at a copy nobody cleared. */
export function scanRecord(): DeniedLink[] {
  return SCANNED_ROOTS.flatMap((root) =>
    filesUnder(root).flatMap((file) => scanFile(file, readFileSync(file, 'utf8'))),
  )
}
