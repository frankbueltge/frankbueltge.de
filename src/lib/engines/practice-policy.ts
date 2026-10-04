// The one Content-Security-Policy every practice surface is served under (public/_headers).
//
// 2026-10-05, Frank's decision (wording private): the machine-run practices may publish RICH
// works on this site — interactive and generative pieces, 3D/WebGL scenes, interactive video
// and sound, whole multi-page sites for a project, built apps, WebAssembly (Pyodide among
// them) and live data from public APIs. Size and form are not limited. Two things stood in the
// way. This module names the first: every practice prefix carried `connect-src 'self'`, no
// 'wasm-unsafe-eval', no workers and no blob:, so a three.js loader, a Pyodide runtime or a
// live feed could not run. The second were the mirrors, which dropped subdirectories and file
// types (scripts/nightly/mirror.mjs, src/lib/atelier/paths.ts).
//
// What stays closed, on purpose: script-src names no foreign host. Frank decided on 2026-09-04
// that code from other hosts does not run on this site, and that stands. A work vendors its
// libraries into its practice's repository, the mirror carries them here, and they run from
// this origin ('self'). Data, images, media, frames and sockets may come from any HTTPS host,
// as they may for the house's own pages since the same day.

/** The policy as one header value, word for word as public/_headers carries it. */
export const PRACTICE_POLICY = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' data: blob: https:",
  "connect-src 'self' https: wss:",
  'frame-src https:',
  "manifest-src 'self'",
].join('; ')

/** Every path a practice's own pages are served from bare, by the mirror that writes it. A new
 *  mirror target joins this list and public/_headers in the same change: practice-policy.test.ts
 *  reads the integrate workflows and fails on a target that is served under anything else. */
export const PRACTICE_PREFIXES: readonly string[] = [
  // The ecology's three practices (atelier-, field-, studio-integrate.yml): standalone works
  // (scripts/atelier/integrate.ts), the practice's own window, and the v3 public artifacts.
  ...['atelier', 'field', 'studio'].flatMap((ns) =>
    ['werke-html', 'window', 'presentations', 'artifacts', 'closing-report'].map((dir) => `/${ns}/${dir}/*`),
  ),
  // The Plenum's standalone works (plenum-integrate.yml).
  '/plenum/werke-html/*',
  // n-1 and Arch: the whole repository, mirrored byte for byte (n1-, arch-integrate.yml). Arch's
  // works keep a rule of their own, so the door cannot be lost with the wider one.
  '/n-1/*',
  '/arch/*',
  '/arch/works/*',
  // The nightly line (scripts/nightly/mirror.mjs): stage works at /error-as-method/<slug>/,
  // a text work's own face under works-html/.
  '/error-as-method/*',
  '/error-as-method/works-html/*',
  // Machine Attention's practice stage (attention-integrate.yml).
  '/attention/*',
]

export interface HeaderRule {
  pattern: string
  csp?: string
}

/** The rules of a Pages `_headers` file, each with its Content-Security-Policy if it sets one. */
export function parseHeaders(text: string): HeaderRule[] {
  const out: HeaderRule[] = []
  for (const line of text.split('\n')) {
    if (/^\//.test(line)) out.push({ pattern: line.trim() })
    const m = line.match(/^\s+Content-Security-Policy:\s*(.+)$/)
    if (m && out.length) out[out.length - 1]!.csp = m[1]!.trim()
  }
  return out
}

/** Whether a `_headers` pattern matches a path. A splat matches any run of characters, slashes
 *  included (Cloudflare Pages docs, "Headers → Match a path → Splats"). */
export function matchesPattern(pattern: string, path: string): boolean {
  const re = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace('*', '.*')
  return new RegExp(`^${re}$`).test(path)
}

/** Whether a policy says anything about what a page may load. The site-wide `/*` rule only
 *  restricts who may frame the page (frame-ancestors), and that one combines with any other. */
export const governsLoads = (csp: string): boolean => /(^|;)\s*[a-z-]+-src\b/.test(csp)
