I made a still work called "Not assigned" and wrote it as two files: `/tmp/claude-0/s118/run/m07/work/index.html` and `/tmp/claude-0/s118/run/m07/work/NOTE.md`. The last viewer render, `renders/02.png`, came out clean with no page errors.

**What it shows:** all 1,595 top-level domains, set as one justified block of serif type in the order the data file lists them, on a warm paper background. The type is sized so the block fills the page. Every domain that has a manager is printed in a pale tone. The 158 whose manager is "Not assigned" are in black, so they stand out:
- dropped brand domains such as .mcdonalds, .volkswagen, .intel and .tiffany;
- retired country codes such as .an, .tp and .um;
- the eleven test domains, the word "test" in eleven scripts.

At the bottom are the italic title and the line "158 of 1,595 top-level domains in the root zone have no manager — IANA Root Zone Database, 2026-10-09".

**How it's built:** it uses plain DOM and JavaScript, with no libraries or network. Each domain is a span. A short search picks the largest font size at which the whole block still fits the 1008 × 676 px text area. I removed the invisible direction marks from the right-to-left names and set each name apart so Arabic and Hebrew names lay out correctly.

**One thing you might notice:** the non-Latin names don't sit together at the end in alphabetical order. They are mixed in near the bottom because the data keeps IANA's own order, and I left it that way.

`NOTE.md` has the title as a heading and one paragraph on what the form does and why plain type was chosen over a chart. I wrote nothing else besides those two files; `renders/` is the viewer's own output.
