// src/lib/atelier/sitepr.ts
// Die PR-Schleuse: Eine Engine (Ulysses/atelier, Meridian/field, Ensemble/studio)
// schlägt Änderungen an der Site SELBST vor — vollständige Dateien unter
// site-prs/<slug>/files/<repo-pfad> in ihrem Repo, plus PR.md (Titel + Begründung).
// Diese Bibliothek ist die Pfad-Grenze der Schleuse:
// sie entscheidet, welche Vorschläge überhaupt zu einem Branch werden dürfen.
// Sicherheitsmodell: nur src/** (nie Workflows, Pipelines, Configs — dort laufen
// Secrets bzw. wird deployt), nie das unantastbare Protokoll-Archiv. Den Rest
// sichert der Mensch: ein Vorschlag wird nie gemerged, nur ein reviewter PR.

export interface SitePrFile { from: string; to: string }
export interface SitePrProposal { ok: true; slug: string; title: string; body: string; files: SitePrFile[] }
export interface SitePrRejection { ok: false; slug: string; reasons: string[] }

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/
const ALLOWED_EXT = /\.(astro|ts|js|mjs|json|css|svg|html|md|txt)$/
const MAX_FILES = 50

// Pfad-Grenze: Ablehnungsgrund zurückgeben oder null (= erlaubt).
export function checkSitePrPath(p: string): string | null {
  if (p.includes('\\')) return 'Backslash im Pfad'
  if (p.startsWith('/')) return 'absoluter Pfad'
  const segs = p.split('/')
  if (segs.some((s) => s === '' || s === '.' || s === '..')) return 'Pfad-Traversal (leeres, "." oder ".."-Segment)'
  if (segs.some((s) => s.startsWith('.'))) return 'versteckte Datei / verstecktes Verzeichnis'
  if (!p.startsWith('src/')) return 'außerhalb von src/ (Workflows, Pipelines, Configs sind tabu)'
  if (p.startsWith('src/content/protokoll/')) return 'das Protokoll-Archiv ist unantastbar'
  if (!ALLOWED_EXT.test(p)) return 'Dateityp nicht erlaubt'
  return null
}

// PR.md: erste `# `-Überschrift = Titel, Rest = Begründung (PR-Body).
export function parsePrMd(src: string): { title: string | null; body: string } {
  const lines = src.split('\n')
  const i = lines.findIndex((l) => /^#\s+\S/.test(l))
  if (i === -1) return { title: null, body: src.trim() }
  const title = (lines[i] ?? '').replace(/^#\s+/, '').trim()
  return { title, body: lines.slice(i + 1).join('\n').trim() }
}

// All-or-nothing je Vorschlag: EIN unerlaubter Pfad lehnt den ganzen Slug ab —
// ein halb angewendeter Vorschlag wäre ein irreführender PR.
export function classifySitePr(
  slug: string,
  prMd: string | null,
  filePaths: string[],
): SitePrProposal | SitePrRejection {
  const reasons: string[] = []
  if (!SLUG_RE.test(slug)) reasons.push('ungültiger Slug (erlaubt: [a-z0-9-], beginnend mit [a-z0-9], max. 80)')
  if (prMd === null) reasons.push('PR.md fehlt (Titel + Begründung sind Pflicht)')
  if (filePaths.length === 0) reasons.push('keine Dateien unter files/')
  if (filePaths.length > MAX_FILES) reasons.push(`mehr als ${MAX_FILES} Dateien`)
  for (const p of filePaths) {
    const r = checkSitePrPath(p)
    if (r) reasons.push(`${p}: ${r}`)
  }
  if (reasons.length) return { ok: false, slug, reasons }
  const { title, body } = parsePrMd(prMd ?? '')
  return {
    ok: true,
    slug,
    title: title ?? slug,
    body,
    files: filePaths.map((p) => ({ from: `site-prs/${slug}/files/${p}`, to: p })),
  }
}
