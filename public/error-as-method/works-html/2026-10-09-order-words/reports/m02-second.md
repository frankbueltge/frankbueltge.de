I changed the work in response to notes 1 and 2. Note 3 describes a layout the work doesn't have, so I left the footer as it was. The final render, `renders/10.png`, shows no page errors.

To check each note I made temporary zoomed renders (`renders/04`–`09`), then put `index.html` back to its normal 1100 × 800 scale.

**Note 1 (fuzzy outlined pink names):** The work has no pink or outlined names. But the names it pointed to, .abarth and .adac, are the 158 "Not assigned" names. I drew those in pale grey with a 0.7px line struck through the letters, and at this small size that line did make them look soft. The underlying point holds, so I followed its suggestion:
- The strike-through is gone.
- The text is now a solid, slightly darker grey.
- Each name has a 1px underline below the baseline, aligned to whole pixels so it stays sharp.

I updated the footer text and `NOTE.md` to say "grey, underlined" instead of "struck through".

**Note 2 (Arabic dots at the wrong end, mixed weights):** The dots were a real bug. The data wraps each right-to-left name in hidden direction marks, and the canvas used them to put the dot at the right-hand end. I first tried wrapping each name in isolation marks, but that changed nothing in the render. The fix that worked:
- Remove the hidden marks.
- Draw the dot separately, on the left.
- Draw the name right after it, as one unit.

Arabic and Hebrew names now begin with the dot on the left, like every other name. I checked this up close. As for the weights, I never use bold for any name. The Arabic glyphs come from a fallback typeface that looks heavier than Georgia. That difference is consistent across all Arabic names, and the page can't choose which fallback face the browser uses, so I left it.

**Note 3 (footer caption on the right, red second line, "Not Assigned" title):** None of this exists in the work. The footer is a single grey line on the left. The source line sits top-right in the header, beside the title. Nothing is red, and "NOT ASSIGNED 158" appears only as a small inline label inside the text block, not as a footer title. There was nothing to align.

Files are in /tmp/claude-0/s118/run/m02/work:
- index.html
- NOTE.md
