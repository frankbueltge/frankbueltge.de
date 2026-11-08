// The Bluesky account that announces the selected works (Frank's decision of 2026-11-08, wording
// private). New picks of the shelf (src/config/selected-works.ts) leave the house on their own:
// a scheduled workflow posts one per run, in the shelf's order, on an account labelled as
// automated (.github/workflows/bluesky-selected.yml, scripts/bluesky/post-selected.ts).
//
// ONE SWITCH. While `handle` is empty the poster only rehearses, printing in its log what it would
// post, and /dossier says nothing about Bluesky. Setting the handle turns both on in the same
// commit, so the site never posts somewhere it does not say it posts. The app password never
// lives here: it is the repository secret BLUESKY_APP_PASSWORD, and without it every run stays a
// rehearsal too.

export const BLUESKY = {
  /** the account's handle without the @, e.g. 'works.frankbueltge.de'; empty until it exists */
  handle: '',
  /** Addresses never to post, or never to post again: for a post taken down on purpose, which the
   *  poster would otherwise find missing and post anew. Paths on the site or absolute URLs. */
  skip: [] as string[],
}
