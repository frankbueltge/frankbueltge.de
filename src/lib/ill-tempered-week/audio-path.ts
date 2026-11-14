// src/lib/ill-tempered-week/audio-path.ts — which request under /ill-tempered-week/<a>/<b> asks for an album's audio
// (2026-11-14). The Pages Function functions/ill-tempered-week/[week]/[piece].js serves exactly these with byte
// ranges and hands every other path on, so an album's own page (/ill-tempered-week/<week>/) is never swallowed.

/** True for the three pieces of an ISO week: "2026-W45" and "overlooked.m4a", "unison.m4a" or "turn.m4a". */
export const isAlbumAudio = (week: string, piece: string): boolean => /^\d{4}-W\d{2}$/.test(week) && /^(overlooked|unison|turn)\.m4a$/.test(piece)
