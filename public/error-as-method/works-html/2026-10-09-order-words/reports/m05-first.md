I finished the piece, "The Whole Root". The last render, `renders/04.png` at 1100 × 800, shows the full layout with nothing cut off and no page errors.

**What the work is:** all 1,595 top-level domains are set as one block of justified text, in the order the IANA database lists them. The page works out the largest font size that still fits every name, which comes to about 8px.
- **Country codes (316):** bold.
- **Names held by one organisation:** plain grey.
- **The seven largest holders:** one colour each. Binky Moon has 196, Amazon 50, Dog Beach 48, Charleston Road 46, Registry Services 36, XYZ.COM 35 and Identity Digital 24.
- **The 158 names marked "Not assigned":** drawn as hollow outlines, like ghosts. Most are brand domains that were given up.

A footer holds the title, a one-line source with the 2026-10-09 date, and a key. Everything is plain HTML, CSS and JavaScript, with no libraries and no network calls.

One quirk in the data: India's registry appears under two spellings, "National Internet Exchange of India" and "National Internet eXchange of India". The work treats them as two separate holders, which makes no visible difference because each has only 8 names.

Files are in /tmp/claude-0/s118/run/m05/work:
- index.html
- NOTE.md
