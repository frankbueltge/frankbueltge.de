I changed the work to answer all three notes. The final render is renders/05.png, and the viewer reported no page errors.

1. **Struck-through names were nearly invisible.** I agreed with this one. The 158 unassigned names now have mid-grey letters (#8a8273) with a thin strikethrough line that is lighter still. The strike still says "vacant," but names like .abarth, .volkswagen and .lamborghini now read at a glance. They still sit clearly behind the assigned names in the wall.

2. **Arabic rows looked broken.** I agreed with this too.
   - **Dots:** some names in the data carry hidden direction marks, so I strip those. Each Hebrew or Arabic name now draws its leading dot as left-to-right text, followed by the name in its own isolated right-to-left element. The dot now stays on the left of its name, e.g. ".عمان" and ".الجزائر".
   - **Font:** the monospace font has no Arabic letters, so those names now use one deliberate face (DejaVu Sans) instead of a random fallback.
   - **Line spacing:** I fixed those names' line height so their rows space evenly with the rest.
   - **How I checked:** I ran the viewer once on a temporarily zoomed copy of the page to look at these rows closely, then put the original back.

3. **Footer legend was cramped and hard to read.** I agreed. The legend is now shorter: "1595 names, A to Z: country 309 · generic 914 · sponsored 18 · Binky Moon 196 · unassigned 158". The unassigned sample uses a darker grey (#5f594d) with a strike in the same colour, so it is no longer the faintest item. It now ends well before the right margin. The footer is a little taller and the wall a few pixels shorter, so the line has room above and beside it.

I also changed one phrase in NOTE.md so it describes the unassigned names in their new readable grey.

Files are in /tmp/claude-0/s118/run/m09/work:
- index.html
- NOTE.md
