I made "Held": one justified page of text holding all 1,595 top-level domains in the root zone's order, shaded by who holds each one. It renders at 1100 × 800 with no page errors. The second render, `renders/02.png`, is the one I checked by eye, and the file hasn't changed since.

- **How it reads:** a name is printed bold and dark when its holder manages only that one, which covers most country codes and brands like `.apple`. Names that belong to a big portfolio fade with the log of the portfolio's size, so Binky Moon's 196 names are the faintest. The 158 domains whose manager is "Not assigned" are struck through in red. The foot line has the title, a short key and the total of 1,595 names.
- **Holder grouping:** before counting portfolios, the page merges spelling variants of the same manager by ignoring case, punctuation and text in brackets. This joins pairs like "National Internet Exchange of India" / "eXchange", which the raw data lists separately.
- **Fitting the page:** script picks the largest font size that still fits the whole list on the page. Because the text is justified, some lines have wide gaps. The block of non-Latin names near the end of the list depends on which fonts the viewing machine has installed.

`NOTE.md` has the title and one paragraph on what the form does and why I chose it. I wrote only those two files. The `renders/` folder is the viewer's own.

Files are in /tmp/claude-0/s118/run/m06/work:
- index.html
- NOTE.md
