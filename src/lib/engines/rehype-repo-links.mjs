// rehype-repo-links — the engine content (field/atelier/plenum) is synced verbatim from each
// engine's own repo, so its README/INDEX docs carry repo-relative links (`./PROTOCOL.md`,
// `journal/`, `2026-…-slug/`). Rendered on the site those resolve to non-existent web paths
// (404). Now that the engine repos are public, rewrite each relative link — FILE-relative, so a
// link in works/INDEX.md resolves against works/ — to its absolute GitHub URL (blob for files,
// tree for directories). Scoped to the three engine content trees; everything else is untouched.
//
// Deliberately does NOT touch the journal's in-page citation modal: journal HTML is produced by a
// separate markdown-it renderer (src/lib/engines/journal.ts), not Astro's rehype pipeline, so the
// data-doc modal swapping there is unaffected.
const REPO_BY_NS = {
  field: 'https://github.com/frankbueltge/field-research',
  atelier: 'https://github.com/frankbueltge/ulysses',
  plenum: 'https://github.com/frankbueltge/data-snack-plenum',
}

/** Resolve `href` against the source file's repo-relative directory into a clean repo path. */
function resolveRepoPath(dir, href) {
  const out = []
  for (const seg of (dir + href).split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') out.pop()
    else out.push(seg)
  }
  return out.join('/') + (href.endsWith('/') ? '/' : '')
}

export default function rehypeRepoLinks() {
  return (tree, file) => {
    const path = String((file && (file.path || (file.history && file.history[0]))) || '')
    const m = path.match(/\/src\/content\/(field|atelier|plenum)\/(.*)$/)
    if (!m) return
    const repo = REPO_BY_NS[m[1]]
    const relFile = m[2]
    const dir = relFile.includes('/') ? relFile.replace(/[^/]+$/, '') : ''

    const walk = (node) => {
      if (
        node.type === 'element' &&
        node.tagName === 'a' &&
        node.properties &&
        typeof node.properties.href === 'string' &&
        // relative only: skip absolute URLs, protocol-relative, anchors, mailto/tel, site-root
        !/^(?:[a-z]+:|\/\/|\/|#)/i.test(node.properties.href)
      ) {
        const href = node.properties.href
        const isDir = href.endsWith('/')
        node.properties.href = `${repo}/${isDir ? 'tree' : 'blob'}/main/${resolveRepoPath(dir, href)}`
        node.properties.target = '_blank'
        node.properties.rel = ['noreferrer']
      }
      if (node.children) for (const child of node.children) walk(child)
    }
    walk(tree)
  }
}
