// src/lib/pulse/without.ts — the pulse snapshot with named repositories taken out.
//
// The snapshot (src/data/pulse/pulse.json) counts every checkout scripts/fetch-pulse.ts walks,
// and since 2026-08-11 it also carries each week split by repository. A surface that no longer
// lists a system must not go on drawing its commits in the aggregate: on 2026-10-11 Arch left
// the entrance (its trial has ended), and a pulse headed "nine repositories" over ten
// repositories' bins would be a caption contradicting its own figure.
//
// So the subtraction is a derivation, not an edit of the archive: the snapshot stays as it was
// written, and a surface asks for the view it actually shows. The fetch script stopped walking
// Arch the same day, so from the next nightly snapshot this is a no-op for it — and stays here
// for the committed snapshots that still carry the split, and for the next system that leaves.
//
// PURE: same snapshot, same names ⇒ the same view. Nothing here reads a clock or a file.

import type { PulseSnapshot, PulseWeek } from '@/lib/pulse/render'

/**
 * The repositories a current-state surface no longer counts.
 *
 * `arch` — since 2026-10-11. The practice's pre-registered window closed on 2026-09-21 and its
 * balance is published; it left the top bar, the board and the entrance with the redesign of
 * that day, and its room at /arch stays as the archive of what it committed.
 */
export const RETIRED_REPOS: readonly string[] = ['arch']

/**
 * The snapshot as if `repos` had never been counted: their bins subtracted from every week's
 * aggregate, their entries removed from the split and from the repository list, the total
 * lowered by what was removed.
 *
 * A week WITHOUT a split (a snapshot older than 2026-08-11) cannot be told apart by repository,
 * so it is passed through unchanged — its aggregate is all there is, and inventing a share to
 * subtract would be drawing a number the archive does not hold. A name the snapshot does not
 * list is ignored.
 */
export function withoutRepos(snapshot: PulseSnapshot, repos: readonly string[]): PulseSnapshot {
  const drop = new Set(repos.filter((r) => snapshot.repos.includes(r)))
  if (drop.size === 0) return snapshot

  let removed = 0
  const weeks = snapshot.weeks.map((week): PulseWeek => {
    if (!week.by_repo) return week
    const bins = [...week.bins]
    const byRepo: NonNullable<PulseWeek['by_repo']> = {}
    for (const [repo, own] of Object.entries(week.by_repo)) {
      if (!drop.has(repo)) {
        byRepo[repo] = own
        continue
      }
      own?.forEach((count, i) => {
        // never below zero: an aggregate smaller than one of its parts would be a broken
        // snapshot, and a negative commit count is not a way to report that
        const take = Math.min(count, bins[i] ?? 0)
        bins[i] = (bins[i] ?? 0) - take
        removed += take
      })
    }
    return { ...week, bins, by_repo: byRepo }
  })

  return {
    ...snapshot,
    repos: snapshot.repos.filter((r) => !drop.has(r)),
    total_commits: snapshot.total_commits - removed,
    weeks,
  }
}
