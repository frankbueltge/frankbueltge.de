# The Atelier, top-down — every room in the pyramid, and the third line

**Written:** 2026-08-15, late. **Status:** built the same night, this document records the
decisions. **Occasion:** Frank's finding (wording private): nothing fit together on /atelier —
the entrance had the new design, but every linked page still wore last month's; /atelier/works
was an endless scroll nobody will ever read; and n-1 has joined as the Atelier's own line. The
whole section is to follow the top-down approach the homepage and the ecology entrance already
have.

## 1. The diagnosis, in one sentence

The pyramid rewrite (#560, 2026-08-12) rebuilt the four STATIONS and stopped one level down:
of the Atelier's rooms, only the journal register had been carried across, so every door on the
new station sheet opened into the retired practice frame — works, constitution, team channel,
line records, journal pages, channel archive. The break Frank saw was real and structural, not
cosmetic.

## 2. What was decided and built

**One chrome for documents.** The pyramid had a sheet for lists (RegisterSheet, Level 2) and
none for texts, which is WHY the document pages had stayed behind. `DocumentSheet.astro` is the
register sheet's sibling: same strip, head, source line and foot, with a verbatim document in
the slot. Used by: /atelier/protocol, /atelier/requests/archive, /atelier/lines/⟨id⟩,
/atelier/journal/⟨slug⟩, /atelier/texts/⟨slug⟩. Other practices' document pages (field/studio
protocol etc.) can migrate onto it later — deliberately out of this package's scope.

**/atelier/works is a register, not a gallery.** One row per work (32 today), newest first,
filter chips by line (the RegisterSheet gained a generic `#move-⟨move⟩` preselect for arriving
pre-filtered). The work itself is one click behind its row — detail routes untouched
(/atelier/werke/⟨slug⟩, /atelier/werke-html/⟨slug⟩/). Row anchors keep the old card ids.

**The texts & catalogue get their own register.** The genealogy, both positions and the
twenty-one error registers used to render verbatim at the BOTTOM of the works page — that was
the endless scroll. Now: /atelier/texts (register) + /atelier/texts/⟨slug⟩ (each document
verbatim, whole, at its own address). Facts per row are read out of the documents themselves
(`src/lib/atelier/texts.ts`: H1, the document's own `**Date:**`, its Session marker). A
client-side bounce on /atelier/works catches the legacy `#⟨slug⟩` deep links (a fragment never
reaches the server); the four in-repo links were repointed.

**The team channel is a register with an unchanged law.** Every open item is on the page,
never a selection — as rows now, each linking its full wording in the archive at its heading
anchor. The page-budget planner (planRoom) retires with the cards: a row cannot outgrow a page
the way forty-word leads did on 2026-08-10. The standing rule of the channel renders under the
rows, verbatim. The archive page keeps its complete verbatim record and only swapped chrome.

## 3. n-1, the third line

Frank's placement (2026-08-15, wording private): n-1 is a line of the Atelier. Descent supports
it — the practice is founded on the Atelier's own working paper (*Cartography, not Tracing*,
the work of 2026-07-24; n-1's README: "a work of the Ulysses practice") — the same pattern as
the error-as-method fork, and the 2026-08-12 canon carries it without a new word.

Three properties every surface must respect (now also in the wording canon, Ergänzung
2026-08-15):

1. **The name is the practice's, and it moves.** "n-1" is a working title, by its own Dowry a
   placeholder. The station sheet reads the current title from `public/n-1/window.json` — the
   practice's own window declaration — via `src/lib/ecology/n1-line.ts`. Never typed.
2. **No protocol number exists, by design.** Its law is the Dowry (plus the founding paper, in
   trial). The constitutions row states "the Dowry (n-1)"; the `LineFacts` union makes asking
   n-1 for a version a type error, not a runtime surprise.
3. **Its record is not the house's to list.** Nothing of n-1 enters the works register; the
   repository is the record, mirrored byte-for-byte to `public/n-1/` and served at /n-1 as the
   practice's own surface. The house states the line (lines/constitutions rows) and opens one
   door.

The pyramid keeps three stations: n-1 lives inside the Atelier station, never beside it.

## 4. What was deliberately NOT done

- **The archived cockpit keeps its dated chrome.** It is a retired instrument kept as an
  artefact (ADR 0008); restyling it into the current design would falsify what it is.
- **The work detail pages (/atelier/werke/⟨slug⟩) are untouched.** Works are stages with their
  own visual language (dataviz rule, 2026-07-30), not rooms of the practice.
- **The retired atelier frame stays in the repo, unlinked.** Git is the archive.
- **Field and Studio document pages** still wear their practice frames — same cure available
  (DocumentSheet), separate package, so this one stays reviewable.

## 5. Cautions for the next session

- The old works page carried `id=⟨slug⟩` on every card AND rendered 25 documents with their own
  heading ids. Rows keep the work slugs; the text slugs bounce via script. If a register is ever
  restyled again: **carry the anchors** (RegisterSheet's own rule) or bounce them — never drop.
- `readN1Facts` fails loud on an unparseable mirror (like `readConstitution`). If n-1's practice
  ever reshapes DOWRY.md's head or window.json's `title`, the build stops rather than rendering
  a stale line — that is intended; fix the reader, not the mirror.
- `planRoom`/`STATUS_WORDS` in `requestsMd.ts` lost their only page consumer; the lib is shared
  with the Steuerzentrale, so nothing was deleted.
