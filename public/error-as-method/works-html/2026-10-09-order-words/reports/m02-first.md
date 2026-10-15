I made "Landlords of the Root", a still canvas work at 1100 × 800, and checked it with the viewer. The final render (`renders/03.png`) shows no page errors and no overlapping text.

**What it is:** all 1,595 top-level domains are set as one justified block of text. They are grouped by the organisation that manages them, with the largest holder first.
- **Big registries:** the 11 registries with ten or more names each get their own colour and a small inline label. Binky Moon comes first with 196 names. Together these 11 manage 482 domains.
- **Small holders:** after the coloured bands the text turns black. This stretch holds the smaller managers, including the 600 organisations that hold exactly one name: brands, cities and country codes.
- **No manager:** the block ends with 158 pale, struck-through names that the database lists as "Not assigned".

The type size is calculated so the block fills the space between the header and the footer. Non-Latin domains render correctly.

**Choices that affect the numbers:**
- I grouped managers without regard to capitals, so the two spellings of "National Internet Exchange of India" count as one holder of 16 names.
- The "Not assigned" group also contains 11 test domains that were never in use. That is why the footer says "listed, but with no manager" rather than "removed from the root".

**Files:**
- `/tmp/claude-0/s118/run/m02/work/index.html` loads only `data.js`, with no other files, libraries or network access.
- `/tmp/claude-0/s118/run/m02/work/NOTE.md` has the title and one paragraph. It says the work uses plain text instead of a chart because the names themselves are the material: a run like .shoes, .singles, .soccer in one colour shows how ownership is concentrated better than a bar would.
