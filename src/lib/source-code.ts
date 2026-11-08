/**
 * Where the code behind a page lives: the line under a work's page and under its method sheet that
 * says its source code is open (src/components/AuthorByline.astro).
 *
 * Until 2026-11-02 the byline kept its own list of path prefixes, and every method sheet under
 * /werke fell through to lab-pipelines, a hand-made export of `pipelines/` last taken on
 * 2026-07-05. Works built since then (Ducking, Globe, Third Reading, Balance, Invoked Past,
 * Bycatch) are not in it at all, Headroom's figures are computed outside `pipelines/`, and The
 * Foreknown and the Observatory live in repositories of their own. The list also had to be
 * extended by hand, so no work added after July got the line on its own page.
 *
 * Now every work in the register names its code here, and source-code.test.ts holds the two
 * together: a work without an entry, an entry without a work, a method sheet that resolves to no
 * work, or a path that does not exist in this repository fails the build.
 */
import { WERKE, type Werk } from '@/data/werke'

/** This repository: the site, its pipelines and the works it renders itself. Public. */
export const SITE_REPO = 'https://github.com/frankbueltge/frankbueltge.de'

const repo = (name: string, dir?: string): string =>
  `https://github.com/frankbueltge/${name}${dir ? `/tree/main/${dir}` : ''}`

/** Each work's code, by register id: a directory of this repository, or a repository of its own.
 *  For a nightly instrument it is the pipeline that measures; for a work the site computes itself,
 *  the library its figures come from. */
export const CODE: Readonly<Record<string, string>> = {
  'common-time': 'scripts/common-time',
  ducking: 'src/lib/ducking',
  'third-reading': 'src/lib/reading',
  spread: 'src/lib/spread',
  sawtooth: 'src/lib/sawtooth',
  globe: 'src/lib/globe',
  trending: 'pipelines/trending',
  attention: repo('machine-attention', 'foreknown'),
  admissions: 'src/lib/admissions',
  observatory: repo('state-before-interface'),
  society: 'src/lib/society',
  'on-record': repo('meridian-runtime'),
  spielraum: 'src/lib/spielraum',
  beifang: 'pipelines/beifang',
  field: repo('field-research'),
  studio: repo('studio'),
  protokoll: 'pipelines/protokoll',
  tell: 'pipelines/tell',
  redaction: 'pipelines/redaction',
  'round-number': 'pipelines/round-number',
  pattern: 'pipelines/pattern',
  praemie: 'pipelines/protokoll/src/protokoll/praemie',
  parallaxe: 'pipelines/protokoll/src/protokoll/parallaxe',
  atelier: repo('ulysses'),
  ueberflug: 'src/lib/ueberflug',
  consensus: 'pipelines/consensus',
  'invoked-past': 'pipelines/invoked',
  balance: 'pipelines/balance',
  correction: 'pipelines/revision',
  'ghost-fleet': 'pipelines/ghost-fleet',
}

/** Pages that are not works but stand on one repository's code. */
export const SURFACES: ReadonlyArray<readonly [prefix: string, url: string]> = [
  ['/encounters', repo('research-ecology')],
  ['/apparatus', repo('research-ecology')],
  ['/experiments', SITE_REPO],
]

/** A CODE entry as a link: a directory here becomes its tree on GitHub, a repository stays itself. */
export function codeUrl(code: string): string {
  return code.startsWith('https://') ? code : `${SITE_REPO}/tree/main/${code}`
}

const bare = (pathname: string): string => pathname.replace(/\/+$/, '') || '/'
const under = (path: string, prefix: string): boolean => path === prefix || path.startsWith(prefix + '/')

/** The work a page belongs to: its method sheet at /werke/<slug>, or its own page and what lies
 *  under it (the longest matching address wins). A sheet's slug is the work's address or its id —
 *  /werke/bycatch belongs to Bycatch, whose id is `beifang`. */
export function werkAt(pathname: string, werke: readonly Werk[] = WERKE): Werk | null {
  const path = bare(pathname)
  const sheet = /^\/werke\/([^/]+)$/.exec(path)?.[1]
  if (sheet) return werke.find((w) => w.methodHref === path || w.href === `/${sheet}` || w.id === sheet) ?? null
  let found: Werk | null = null
  for (const w of werke) if (under(path, w.href) && (!found || w.href.length > found.href.length)) found = w
  return found
}

/** The link for a page's source line, or null where the page has no code of its own to show
 *  (the hub, About, the legal pages): no line is better than a wrong one. */
export function sourceFor(pathname: string): string | null {
  const werk = werkAt(pathname)
  if (werk) return werk.id in CODE ? codeUrl(CODE[werk.id]) : null
  const path = bare(pathname)
  return SURFACES.find(([prefix]) => under(path, prefix))?.[1] ?? null
}
