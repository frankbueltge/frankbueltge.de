// @ts-check
// src/lib/engines/publication.mjs — what the site publishes from the practices' mirrors.
//
// THE RULE (Frank's decision of 2026-10-17, wording private, paraphrased): the site publishes the
// practices' FINISHED WORKS and their CYCLE PRESENTATIONS, and nothing else of theirs. Working
// material and per-session artifacts stay in each practice's own public repository, where they
// are linked, not served. Measured that day: roughly three hundred mirrored files a day were
// landing on the site that nobody read (6,593 mirrored files; 1,072 sitemap URLs, about 900 of
// them machine-made practice pages), the name query for the owner had fallen far, and Cloudflare
// Pages' free plan stops deploying at 20,000 files.
//
// WHERE IT IS APPLIED. The integrate workflows still copy whole practice repositories into
// public/ and src/content/, and the repository keeps those mirrors: the build reads them for the
// registers, the counts and the score. The rule therefore runs at BUILD time. This module decides,
// for each file the build copied from public/ into dist/, whether it is published; the prune
// integration (./publication-prune.mjs, registered in astro.config.mjs) deletes the rest from
// dist/ after the build. A page the site renders itself is never decided here: a page leaves the
// site by deleting its route, and its old address gets a 301 in public/_redirects.
//
// Plain JS with JSDoc types, so astro.config.mjs, the integration and the tests read one rule.
// Pure: no file system, no clock. Whatever depends on the mirror's contents (which n-1 pages are
// works, which files a work references, which works are still in progress) is handed in.

/** The day the rule took effect. */
export const PUBLICATION_RULE_SINCE = '2026-10-17'

/** Each practice's own public repository — where its record lives now. */
export const REPOS = /** @type {const} */ ({
  atelier: 'https://github.com/frankbueltge/ulysses',
  field: 'https://github.com/frankbueltge/field-research',
  studio: 'https://github.com/frankbueltge/studio',
  'error-as-method': 'https://github.com/frankbueltge/error-as-method',
  'n-1': 'https://github.com/frankbueltge/n-1',
  arch: 'https://github.com/frankbueltge/arch',
  plenum: 'https://github.com/frankbueltge/data-snack-plenum',
})

/**
 * A place in a practice's repository: a directory (`tree`) or a file (`blob`). GitHub answers a
 * `blob` address that names a directory, and a `tree` address that names a file, with a redirect
 * to the right one, so a pattern that cannot tell the two apart still lands.
 * @param {keyof typeof REPOS} practice
 * @param {string} [path] repository-relative path; empty for the repository's root
 * @param {'tree' | 'blob'} [kind]
 */
export function repoUrl(practice, path = '', kind = 'tree') {
  const base = REPOS[practice]
  return path ? `${base}/${kind}/main/${path}` : base
}

/**
 * The doors that lead into a practice's repository now that the site no longer renders the
 * journal, the constitution and the team channel (2026-10-17). One table, read by the station
 * doors, the practice rails and the redirect tests, so a door and the 301 of the page it replaced
 * cannot point at two different places.
 */
export const REPOSITORY_DOORS = /** @type {const} */ ({
  atelier: {
    journal: repoUrl('atelier', 'journal'),
    protocol: repoUrl('atelier', 'PROTOCOL.md', 'blob'),
    requests: repoUrl('atelier', 'REQUESTS.md', 'blob'),
    requestsArchive: repoUrl('atelier', 'REQUESTS-ARCHIVE.md', 'blob'),
  },
  field: {
    journal: repoUrl('field', 'journal'),
    protocol: repoUrl('field', 'PROTOCOL.md', 'blob'),
    requests: repoUrl('field', 'REQUESTS.md', 'blob'),
    requestsArchive: repoUrl('field', 'REQUESTS-ARCHIVE.md', 'blob'),
  },
  studio: {
    journal: repoUrl('studio', 'journal'),
    protocol: repoUrl('studio', 'PROTOCOL.md', 'blob'),
    requests: repoUrl('studio', 'REQUESTS.md', 'blob'),
    requestsArchive: repoUrl('studio', 'REQUESTS-ARCHIVE.md', 'blob'),
  },
})

/**
 * What each practice's mirror publishes, as globs over dist-relative paths (`**` any depth, `*`
 * one segment). Everything else a mirror brings is the practice's working material and stays in
 * its repository. An allowlist on purpose: a directory a practice starts mirroring tomorrow is
 * not published until someone decides it is a work or a presentation.
 *
 * @type {Record<string, { repo: keyof typeof REPOS | null, keep: readonly string[] }>}
 */
export const MIRRORS = {
  // The Atelier (Assay): its presentations, its HTML works, and the window's front page, which is
  // the practice's closing report of 2026-08-30. The window's session folders are working material.
  atelier: {
    repo: 'atelier',
    keep: ['atelier/presentations/**', 'atelier/closing-report/**', 'atelier/werke-html/**', 'atelier/window/index.html'],
  },
  // The Field (Meridian): presentations and closing report whole. Its session artifacts are not
  // published; its works and papers are pages the site renders itself.
  field: {
    repo: 'field',
    keep: ['field/presentations/**', 'field/closing-report/**', 'field/werke-html/**'],
  },
  // The Studio (Ensemble): its works, presentations and closing report.
  studio: {
    repo: 'studio',
    keep: ['studio/presentations/**', 'studio/closing-report/**', 'studio/werke-html/**'],
  },
  // The nightly line: each work's stage files beside its page, and the works' own faces.
  'error-as-method': {
    repo: 'error-as-method',
    keep: ['error-as-method/works-html/**', 'error-as-method/*/**'],
  },
  // n-1 (Remainder): its own front page and record, what they load, its filed works, and every
  // project page the practice declared a work (handed in as ctx.n1Pages, with what those load).
  'n-1': {
    repo: 'n-1',
    keep: ['n-1/index.html', 'n-1/record.html', 'n-1/surface/**', 'n-1/atlas/layers/**', 'n-1/works/**'],
  },
  // Machine Attention: the finished, retired archive of The Foreknown. It no longer grows.
  attention: { repo: null, keep: ['attention/**'] },
  // Arch: its works. Its record, ledger, registers, reading, apparatus and material stay home.
  arch: { repo: 'arch', keep: ['arch/works/**'] },
}

/** The folders that hold one work each. Inside them the working-material rule applies. */
export const WORK_ROOTS = /** @type {const} */ ([
  'studio/werke-html',
  'error-as-method/works-html',
  'atelier/werke-html',
  'field/werke-html',
  'n-1/works',
  'arch/works',
])

/** Working material by type: removed from a published work unless the work itself names it. */
export const WORKING_MATERIAL_EXTENSIONS = /** @type {const} */ ([
  '.py', '.md', '.txt', '.jsonl', '.log', '.sh', '.ipynb', '.gz', '.tsv',
])

/** What a work is made of. Never removed by type (the face folders below are removed by place). */
export const NEVER_BY_TYPE = /** @type {const} */ ([
  '.html', '.js', '.mjs', '.css', '.json', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif',
  '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.woff', '.woff2', '.ttf', '.csv', '.wasm',
])

/** Inside the nightly line's faces: the briefs, reports and coder runs a work was made with. */
export const FACE_WORKING_FOLDERS = /** @type {const} */ (['briefs', 'reports', 'coderA', 'coderB', 'coderC'])

/** The files that can carry a reference to working material that a work still uses. */
export const REFERRER_EXTENSIONS = /** @type {const} */ (['.html', '.js', '.mjs'])

/** @param {string} path */
const extOf = (path) => {
  const base = path.slice(path.lastIndexOf('/') + 1)
  const dot = base.lastIndexOf('.')
  return dot > 0 ? base.slice(dot).toLowerCase() : ''
}

/** @param {string} path */
export const basenameOf = (path) => path.slice(path.lastIndexOf('/') + 1)

/** @type {Map<string, RegExp>} */
const globCache = new Map()

/**
 * `**` matches across segments, `*` within one.
 * @param {string} glob
 * @param {string} path
 */
export function matchGlob(glob, path) {
  let re = globCache.get(glob)
  if (!re) {
    let src = ''
    for (let i = 0; i < glob.length; i++) {
      const c = glob[i]
      if (c === '*') {
        if (glob[i + 1] === '*') {
          src += '.*'
          i++
        } else src += '[^/]*'
      } else src += c.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    }
    re = new RegExp(`^${src}$`)
    globCache.set(glob, re)
  }
  return re.test(path)
}

/**
 * The practice whose mirror a dist-relative path lies in, or null for the house.
 * @param {string} path
 */
export function practiceOf(path) {
  const top = path.split('/')[0]
  return Object.hasOwn(MIRRORS, top) ? top : null
}

/**
 * The work folder a file belongs to — `studio/werke-html/<slug>` — or null outside the work
 * roots. A loose file directly under a root belongs to the root itself.
 * @param {string} path
 */
export function workFolderOf(path) {
  for (const root of WORK_ROOTS) {
    if (!path.startsWith(`${root}/`)) continue
    const rest = path.slice(root.length + 1)
    const slash = rest.indexOf('/')
    return slash < 0 ? root : `${root}/${rest.slice(0, slash)}`
  }
  return null
}

/**
 * Whether a file inside a work folder is working material: by type (WORKING_MATERIAL_EXTENSIONS),
 * or, in the nightly line's faces, by place (FACE_WORKING_FOLDERS).
 * @param {string} path
 */
export function isWorkingMaterial(path) {
  const folder = workFolderOf(path)
  if (!folder) return false
  if (folder.startsWith('error-as-method/works-html/')) {
    const inside = path.slice(folder.length + 1).split('/').slice(0, -1)
    if (inside.some((segment) => /** @type {readonly string[]} */ (FACE_WORKING_FOLDERS).includes(segment))) return true
  }
  return /** @type {readonly string[]} */ (WORKING_MATERIAL_EXTENSIONS).includes(extOf(path))
}

/**
 * Whether a file may name a working file its work still uses: a page or a script of the work,
 * and not one that is itself working material.
 * @param {string} path
 */
export function isReferrer(path) {
  return (/** @type {readonly string[]} */ (REFERRER_EXTENSIONS)).includes(extOf(path)) && !isWorkingMaterial(path)
}

/**
 * @typedef {object} PublicationContext
 * @property {(path: string) => boolean} [isMirrored] whether the file was copied from public/ (a
 *   page the site renders itself is not decided here and stays published); default: every file
 * @property {ReadonlySet<string>} [n1Pages] n-1 pages the practice declared works, and the files
 *   those pages and the front page load
 * @property {ReadonlySet<string>} [inProgress] work folders whose meta.json says the work is in
 *   progress: they stay exactly as mirrored (the Studio's long work grows in public)
 * @property {(path: string) => boolean} [isReferenced] whether a referrer in the same work folder
 *   names this file's basename (string search)
 */

/**
 * @typedef {object} Decision
 * @property {string | null} practice
 * @property {boolean} published
 * @property {'house' | 'page' | 'kept' | 'n-1 work' | 'in progress' | 'referenced' | 'not a work' | 'working material'} reason
 */

/**
 * The rule, for one dist-relative path (posix separators, no leading slash).
 * @param {string} path
 * @param {PublicationContext} [ctx]
 * @returns {Decision}
 */
export function classify(path, ctx = {}) {
  const practice = practiceOf(path)
  if (!practice) return { practice, published: true, reason: 'house' }
  if (ctx.isMirrored && !ctx.isMirrored(path)) return { practice, published: true, reason: 'page' }
  if (practice === 'n-1' && ctx.n1Pages?.has(path)) return { practice, published: true, reason: 'n-1 work' }
  if (!MIRRORS[practice].keep.some((glob) => matchGlob(glob, path))) {
    return { practice, published: false, reason: 'not a work' }
  }
  const folder = workFolderOf(path)
  if (folder && isWorkingMaterial(path)) {
    if (ctx.inProgress?.has(folder)) return { practice, published: true, reason: 'in progress' }
    if (ctx.isReferenced?.(path)) return { practice, published: true, reason: 'referenced' }
    return { practice, published: false, reason: 'working material' }
  }
  return { practice, published: true, reason: 'kept' }
}

/**
 * @param {string} path
 * @param {PublicationContext} [ctx]
 */
export function isPublished(path, ctx = {}) {
  return classify(path, ctx).published
}

// ── where a piece lives when the site does not publish it ────────────────────────────────────

/**
 * A mirrored path's place in its practice's repository, or null where no repository is known.
 * The mirrors copy most directories under their own names; the exceptions are the ones the
 * integrate scripts rename: a work's folder is `works/<slug>` in every practice repository
 * (`werke-html/` here), and the nightly line's faces and stage files both come from its
 * `works/<slug>/` (scripts/nightly/mirror.mjs).
 * @param {string} path dist-relative, without a trailing slash
 * @returns {{ practice: keyof typeof REPOS, path: string } | null}
 */
export function repoPlaceOf(path) {
  const practice = practiceOf(path)
  if (!practice) return null
  const repo = MIRRORS[practice].repo
  if (!repo) return null
  const rest = path.slice(practice.length + 1)
  if (!rest) return { practice: repo, path: '' }
  if (practice === 'error-as-method') {
    return { practice: repo, path: `works/${rest.startsWith('works-html/') ? rest.slice('works-html/'.length) : rest}` }
  }
  if (practice === 'atelier' || practice === 'field' || practice === 'studio') {
    return { practice: repo, path: rest.replace(/^werke-html(?=\/|$)/, 'works') }
  }
  return { practice: repo, path: rest }
}

/**
 * The address a link to a practice's piece should carry under the rule: its own address while the
 * site publishes it; its place in the practice's repository when the site does not; the practice's
 * own page where neither is known. A link that leaves through a 301 is a link that says one thing
 * and does another, so the surfaces that name a newest piece ask here first (2026-10-17).
 *
 * Only a file the caller confirms was copied from public/ can be judged: everything else is a page
 * the site renders itself and keeps its address, which is why `isMirrored` defaults to "no".
 * @param {string} href a site address (`/atelier/window/cycle-008-session-5/`); anything else is returned as is
 * @param {PublicationContext} [ctx]
 */
export function publishedHref(href, ctx = {}) {
  const m = /^\/([^?#]*)/.exec(href)
  if (!m || href.startsWith('//')) return href
  const sitePath = m[1] ?? ''
  const file = sitePath === '' || sitePath.endsWith('/') ? `${sitePath}index.html` : sitePath
  const decision = classify(file, { ...ctx, isMirrored: ctx.isMirrored ?? (() => false) })
  if (decision.published || !decision.practice) return href
  const place = repoPlaceOf(sitePath.replace(/\/$/, ''))
  if (place) return repoUrl(place.practice, place.path, sitePath.endsWith('/') ? 'tree' : 'blob')
  return `/${decision.practice}`
}

/** A meta.json status that says the work is still being made. */
export const IN_PROGRESS = /\bin[ -]progress\b/i

/**
 * @param {unknown} meta a parsed meta.json
 */
export function isInProgress(meta) {
  const status = meta && typeof meta === 'object' ? /** @type {Record<string, unknown>} */ (meta).status : undefined
  return typeof status === 'string' && IN_PROGRESS.test(status)
}

// ── what a page loads ────────────────────────────────────────────────────────────────────────

const LOADED_BY_ATTRIBUTE = /<(?:script|img|iframe|audio|video|source|embed|track|input)\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi
const LOADED_BY_LINK = /<link\b[^>]*?\bhref\s*=\s*["']([^"']+)["']/gi
const FETCHED = /\bfetch\(\s*["'`]([^"'`$]+)["'`]/g
const CSS_URL = /url\(\s*["']?([^"')]+)["']?\s*\)/g
const DATA_LITERAL = /["'`]([^"'`\s<>]+\.(?:json|geojson|topojson|csv|tsv|txt|png|jpe?g|webp|gif|svg|mp3|wav|ogg|mp4|webm|js|mjs|css|wasm|woff2?|ttf))["'`]/gi

/**
 * The files a page loads, as dist-relative paths: what its elements fetch by `src`, its `<link>`s,
 * its `fetch()` calls, `url()`s, and quoted file names with an asset's extension in its scripts.
 * A link a visitor follows (`<a href>`) is not a load. Absolute URLs, `data:` and anything that
 * climbs out of dist are left out; the caller checks which of the rest exist.
 * @param {string} html the page's text (or a script's)
 * @param {string} from the page's dist-relative path, e.g. `n-1/works/x/index.html`
 */
export function loadedAssets(html, from) {
  const dir = from.includes('/') ? from.slice(0, from.lastIndexOf('/')) : ''
  /** @type {Set<string>} */
  const out = new Set()
  for (const re of [LOADED_BY_ATTRIBUTE, LOADED_BY_LINK, FETCHED, CSS_URL, DATA_LITERAL]) {
    for (const m of html.matchAll(re)) {
      const resolved = resolveRef(m[1], dir)
      if (resolved) out.add(resolved)
    }
  }
  return [...out].sort()
}

/**
 * @param {string} ref
 * @param {string} dir
 * @returns {string | null}
 */
function resolveRef(ref, dir) {
  const clean = ref.split('#')[0].split('?')[0].trim()
  if (!clean || /^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith('//')) return null
  const parts = clean.startsWith('/') ? [] : dir.split('/').filter(Boolean)
  for (const segment of clean.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      if (!parts.length) return null
      parts.pop()
    } else parts.push(segment)
  }
  const path = parts.join('/')
  if (!path) return null
  return clean.endsWith('/') ? `${path}/index.html` : path
}

/**
 * The pages n-1's own front page presents as its works (surface/margin.json, `works[].href`),
 * as dist-relative paths. The practice declares them there in so many words; the house's shelf
 * reading (src/lib/n1/shelf.ts) recognises the declarations of its night records only when they
 * say "declared a work", and so far calls three of them studies.
 * @param {unknown} margin the parsed margin.json
 */
export function n1MarginWorks(margin) {
  const works = margin && typeof margin === 'object' ? /** @type {{ works?: unknown }} */ (margin).works : undefined
  if (!Array.isArray(works)) return []
  /** @type {string[]} */
  const out = []
  for (const w of works) {
    const href = w && typeof w === 'object' ? /** @type {{ href?: unknown }} */ (w).href : undefined
    if (typeof href !== 'string') continue
    const resolved = resolveRef(href, 'n-1')
    if (resolved && resolved.startsWith('n-1/')) out.push(resolved)
  }
  return out
}

// ── the redirects, read the way Cloudflare Pages reads them ─────────────────────────────────

/**
 * @typedef {object} RedirectRule
 * @property {string} from
 * @property {string} to
 * @property {number} status
 * @property {number} line
 * @property {boolean} static counted against the 2,000 static rules; false = against the 100 dynamic
 * @property {RegExp | null} pattern null for a static rule
 */

const SPLAT = /\*/
const PLACEHOLDER = /:[A-Za-z]\w*/

/**
 * Parse a `_redirects` file the way Cloudflare Pages does. Two of its rules decide how this file
 * has to be written, and neither is visible in the file itself:
 *
 *   · Only a rule ABOVE the first splat or placeholder counts as static. Every line after the first
 *     pattern counts against the 100 dynamic rules, exact or not, and once those are spent the rest
 *     of the file is skipped. Until 2026-10-17 this file's second line was a splat, so 64 of its 65
 *     rules were already dynamic. Exact rules therefore stand first, patterns after them.
 *   · At request time every static rule is looked up before any pattern, and the patterns are tried
 *     in order. A redirect fires before Pages looks for a file: a rule that matches a published
 *     file takes that file off the site.
 *
 * Source: workers-sdk, packages/workers-shared (parseRedirects, generateRulesMatcher) and
 * pages-shared/asset-server/handler.ts, read 2026-10-17.
 * @param {string} text
 * @returns {RedirectRule[]}
 */
export function parseRedirects(text) {
  /** @type {RedirectRule[]} */
  const rules = []
  const seen = new Set()
  let canBeStatic = true
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim()
    if (!line || line.startsWith('#')) return
    const [from, to, status = '302'] = line.split(/\s+/)
    if (!from || !to) return
    const dynamic = SPLAT.test(from) || PLACEHOLDER.test(from)
    const isStatic = canBeStatic && !dynamic
    if (!isStatic) canBeStatic = false
    if (seen.has(from)) return
    seen.add(from)
    rules.push({ from, to, status: Number(status), line: i + 1, static: isStatic, pattern: dynamic ? compilePattern(from) : null })
  })
  return rules
}

/**
 * Cloudflare's own compilation: `*` becomes a greedy `splat` (zero or more characters, slashes
 * included), `:name` one or more characters up to the next slash, the whole anchored.
 * @param {string} from
 */
export function compilePattern(from) {
  const escape = (/** @type {string} */ s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  let src = from.split('*').map(escape).join('(?<splat>.*)')
  src = src.replace(/:([A-Za-z]\w*)/g, '(?<$1>[^/]+)')
  return new RegExp(`^${src}$`)
}

/**
 * The rule that answers a request path, and where it sends it — static rules first, then the
 * patterns in file order. Null when no rule fires.
 * @param {readonly RedirectRule[]} rules
 * @param {string} pathname
 * @returns {{ rule: RedirectRule, location: string } | null}
 */
export function matchRedirect(rules, pathname) {
  const exact = rules.find((r) => r.static && r.from === pathname)
  if (exact) return { rule: exact, location: exact.to }
  for (const rule of rules) {
    if (rule.static) continue
    // a rule below the first pattern without a pattern of its own is matched exactly, in order
    const m = rule.pattern ? rule.pattern.exec(pathname) : rule.from === pathname ? /** @type {RegExpExecArray} */ ([pathname]) : null
    if (!m) continue
    let location = rule.to
    for (const [name, value] of Object.entries(m.groups ?? {})) location = location.split(`:${name}`).join(value ?? '')
    return { rule, location }
  }
  return null
}

/**
 * How many of each kind of rule the file spends.
 * @param {readonly RedirectRule[]} rules
 */
export function redirectBudget(rules) {
  const staticCount = rules.filter((r) => r.static).length
  return { static: staticCount, dynamic: rules.length - staticCount, maxStatic: 2000, maxDynamic: 100 }
}

/**
 * The addresses Cloudflare Pages serves a file at, so a test can ask whether any rule shadows it:
 * the file's own path, and for a directory index its directory with and without the slash.
 * @param {string} path dist-relative
 */
export function servedAt(path) {
  const own = `/${path}`
  if (path === 'index.html') return ['/']
  if (path.endsWith('/index.html')) {
    const dir = own.slice(0, -'index.html'.length)
    return [dir, dir.slice(0, -1), own]
  }
  if (path.endsWith('.html')) return [own, own.slice(0, -'.html'.length)]
  return [own]
}
