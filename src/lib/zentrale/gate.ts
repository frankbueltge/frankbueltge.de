// gate.ts — the gate lane (Steuerzentrale v2 P2; governance 2026-08-01 §1). Pure
// transforms only, like status.ts: the Pages Function fetches, these functions shape.
// A candidate is a project whose SCORE.md frontmatter says PUBLICATION_CANDIDATE and
// whose directory carries no PUBLICATION.json — presence of the manifest IS the
// publication (the site never infers publication from anything else, integrate.ts).

export interface GateCandidate {
  repo: string
  project: string
  title: string | null
  /** Last change to the project's SCORE.md — honest label: the SLA clock proxy, not a
   * "candidate since" (the record does not carry that as data). */
  scoreChangedAt: string | null
  hoursSinceChange: number | null
  projectUrl: string
}

/** Frontmatter is the block between the first pair of `---` lines. Tolerant: absent or
 * malformed frontmatter yields nulls — the dashboard shows a gap, never a guess. */
export function parseScoreFrontmatter(md: string): { disposition: string | null; title: string | null } {
  const m = md.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return { disposition: null, title: null }
  const get = (key: string): string | null => {
    const line = m[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return line ? line[1].trim().replace(/^"|"$/g, '') : null
  }
  return { disposition: get('disposition'), title: get('title') }
}

export function isPublicationCandidate(files: string[], scoreMd: string | null): boolean {
  if (files.includes('PUBLICATION.json')) return false
  if (!scoreMd) return false
  return parseScoreFrontmatter(scoreMd).disposition === 'PUBLICATION_CANDIDATE'
}

export function buildGateCandidate(
  repo: string,
  project: string,
  scoreMd: string,
  scoreChangedAt: string | null,
  nowIso: string,
): GateCandidate {
  const fm = parseScoreFrontmatter(scoreMd)
  const hours = scoreChangedAt
    ? Math.floor((Date.parse(nowIso) - Date.parse(scoreChangedAt)) / 3_600_000)
    : null
  return {
    repo,
    project,
    title: fm.title,
    scoreChangedAt,
    hoursSinceChange: hours,
    projectUrl: `https://github.com/frankbueltge/${repo}/tree/main/projects/${project}`,
  }
}
