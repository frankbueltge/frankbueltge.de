// src/lib/experiments/unarchived.ts — the one duty a live work owes.
//
// Frank's decision of 2026-09-04 (wording private, paraphrased): live and real-time experiments
// must be startable in this repo, without a second site and without asking first; citability and
// archiving are not the point, the work is. So a work marked `unarchived` in src/data/werke.ts is
// exempt from the USP audit gate, the currency test and the method-sheet duty — the three that
// were built for works whose findings must survive their sources.
//
// What it still owes, and this module is that duty made mechanical: it says so on its own surface,
// in its own words. Not because a rule likes disclosure, but because a page that shows the world
// as it is right now and a page that shows a committed record look identical, and the reader has
// no other way to tell them apart. werke.test.ts fails if a work declares itself unarchived and
// its page never references this notice.
export const UNARCHIVED_NOTICE = {
  /** the short mark, for a card or a strip */
  badge: 'live · not archived',
  /** the sentence a live work's page carries somewhere a reader will meet it */
  line:
    'This reads its sources as it runs. Nothing here is committed to the archive, nothing here ' +
    'is citable, and it goes dark when its sources do.',
} as const
