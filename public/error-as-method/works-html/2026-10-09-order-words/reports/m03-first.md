I made "Held by No One", a single still page that fills the 1100 × 800 frame. The viewer renders it with no page errors.

**What the image shows:** all 1,595 top-level domains are set as one justified block of text, in the order IANA lists them.
- Country codes are in bold dark ink.
- Generic domains are in a quieter grey.
- Sponsored, infrastructure and generic-restricted domains are in italics.
- The 158 domains whose manager is "Not assigned" are drawn as pale outlined boxes with their names faded inside. They show up as holes scattered through the alphabet. Most are brand domains that were given back (.bugatti, .mcdonalds, .volkswagen), plus retired country codes such as .an and .tp, and the 11 test domains.

The page adjusts the font size so the block fills the space above a thin footer. The footer holds the title and a one-line caption that also acts as the key.

**What to check:**
- The wrapping and bidi-isolation keep right-to-left names (Arabic, Hebrew) and other non-Latin scripts in place, but the lines with those names still look a little jumbled.
- The last line of the block ends short, which leaves a small gap above the footer.
- The note says the 11 test domains are among the 158 unassigned ones, and that is true of the data. It also calls .an and .tp "retired country codes", which is the general view; I didn't check how the data classifies those two.

Files are in /tmp/claude-0/s118/run/m03/work:
- index.html
- NOTE.md
