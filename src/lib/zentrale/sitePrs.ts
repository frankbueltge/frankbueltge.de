// Steuerzentrale — Site-PRs: reine, getestete Logik rund um die PR-Schleuse der Engines
// (engine-site-pr.yml). Die Kollektive schlagen Site-Änderungen als PRs mit Branch
// `<ns>/pr-<slug>` vor; die Zentrale zeigt sie und lässt Frank mergen oder ablehnen.
// Kein fetch hier — Beschaffung ist Sache der Pages Functions (status.js, site-pr.js).

export interface EnginePr {
  number: number
  ns: string
  persona: string
  label: string
  slug: string
  title: string
  url: string
  branch: string
  createdAt: string
  excerpt: string
}

// Nur Branches dieser Form sind Engine-Vorschläge — alles andere (menschliche Feature-
// Branches) geht die Zentrale nichts an. Dieselbe Grenze prüft site-pr.js server-seitig
// vor jedem Merge/Close, damit der Endpoint nie fremde PRs anfasst.
const HEAD_RE = /^(atelier|field|studio)\/pr-([a-z0-9-]+)$/

const PERSONA: Record<string, string> = { atelier: 'Ulysses', field: 'Meridian', studio: 'Ensemble' }
const LABEL: Record<string, string> = {
  atelier: 'Atelier · Ulysses',
  field: 'Field · Meridian',
  studio: 'Studio · Ensemble',
}

const EXCERPT_LEN = 400

export function isEngineHead(ref: unknown): boolean {
  return typeof ref === 'string' && HEAD_RE.test(ref)
}

// Der PR-Body trägt unter einem `---` den Schleusen-Fußzeilen-Text („Vorschlag von … grün
// am …“) — für die Karte zählt nur die Begründung der Engine darüber.
export function prExcerpt(body: unknown): string {
  if (typeof body !== 'string') return ''
  const cut = body.indexOf('\n\n---\n*Vorschlag von')
  const text = (cut >= 0 ? body.slice(0, cut) : body).replace(/\s+/g, ' ').trim()
  return text.length > EXCERPT_LEN ? `${text.slice(0, EXCERPT_LEN)}…` : text
}

// GitHub-PR-Liste (state=open) → Engine-Vorschläge, älteste zuerst (Warteschlange).
// Fremde PRs und unerwartete Formen werden still übersprungen — die Zentrale zeigt nur,
// was sicher ein Schleusen-PR ist.
export function enginePrs(apiPrs: unknown): EnginePr[] {
  if (!Array.isArray(apiPrs)) return []
  const out: EnginePr[] = []
  for (const pr of apiPrs) {
    if (!pr || typeof pr !== 'object') continue
    const p = pr as Record<string, unknown>
    const head = p.head as Record<string, unknown> | undefined
    const ref = head?.ref
    const m = typeof ref === 'string' ? HEAD_RE.exec(ref) : null
    if (!m) continue
    if (!Number.isInteger(p.number) || typeof p.html_url !== 'string') continue
    const ns = m[1] ?? ''
    out.push({
      number: p.number as number,
      ns,
      persona: PERSONA[ns] ?? ns,
      label: LABEL[ns] ?? ns,
      slug: m[2] ?? '',
      title: typeof p.title === 'string' ? p.title : (m[2] ?? ''),
      url: p.html_url,
      branch: ref as string,
      createdAt: typeof p.created_at === 'string' ? p.created_at : '',
      excerpt: prExcerpt(p.body),
    })
  }
  out.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return out
}

const ACTIONS = ['merge', 'close']
const MAX_COMMENT_LEN = 2000

// Body-Validierung für POST /api/zentrale/site-pr — bewusst eng: eine Nummer, eine von
// zwei Aktionen, optional ein kurzer Kommentar (nur bei close sinnvoll, bei merge erlaubt
// aber ignoriert die Function ihn nicht — er wird ebenfalls als PR-Kommentar abgesetzt).
export function validateSitePrAction(body: unknown): { ok: true } | { ok: false; detail: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, detail: 'body muss ein Objekt sein' }
  }
  const b = body as Record<string, unknown>
  if (!Number.isInteger(b.number) || (b.number as number) <= 0) {
    return { ok: false, detail: 'number ungültig' }
  }
  if (typeof b.action !== 'string' || !ACTIONS.includes(b.action)) {
    return { ok: false, detail: 'action unbekannt' }
  }
  if (b.comment !== undefined) {
    if (typeof b.comment !== 'string') return { ok: false, detail: 'comment muss ein String sein' }
    if (b.comment.length > MAX_COMMENT_LEN) return { ok: false, detail: 'comment zu lang' }
  }
  return { ok: true }
}
