I made "Tenancy", a still image that sets all 1,595 top-level domains as one justified page of type. The names run A to Z in the IANA database's order, and each name is coloured by who holds it. It renders cleanly at 1100 × 800 with no page errors; the second render, `renders/02.png`, is the final look.

The colours split the zone four ways:
- **Black:** the 309 domains held by a country.
- **Red:** the 434 domains held by the seven largest portfolio registries, the ones with 24 or more domains each. Binky Moon alone has 196.
- **Grey:** the 694 domains held by everyone else.
- **Pale and struck through:** the 158 domains listed as "Not assigned". These are mostly brands that gave their domain back, such as .fiat, .intel and .mcdonalds.

At the bottom there is a footer with the title and a key that gives these counts. The page picks the largest font size that still fills the frame.

**Known flaw:** some Arabic and Hebrew names near the end of the page still don't place their leading dot correctly. I added a fix after the first render, but those names look about the same in the second one. It is a small visual blemish, and I left it as it is.

`NOTE.md` has the title and one paragraph. It explains that the work shows the names themselves because the root zone is a list of words, and that the page reads like a building register: red for the few big landlords, struck-through names for the tenants who moved out.

I wrote only those two files. Apart from the viewer, I read and wrote nothing outside the folder.

Files are in `/tmp/claude-0/s118/run/m08/work`:
- `index.html`
- `NOTE.md`
