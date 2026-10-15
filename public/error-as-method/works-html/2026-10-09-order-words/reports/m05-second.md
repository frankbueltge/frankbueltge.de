I changed the work for all three notes. The new render is `renders/06.png`: the names now clear the rule, the hollow names are easier to see, and the seven registry colours are easier to tell apart. `NOTE.md` is unchanged because its description still holds.

1. **Rule through the last line:** the reader was right. The text block's bottom edge sat about 4px below the footer rule, so the rule cut the last line. I shortened the block to 683px, which leaves a few pixels of space above the rule. Because the block shrinks the text until every name fits, the type size dropped very slightly and the names reflowed, so the last line is now ".zappos … .zw". At 676px the type shrank a whole step and left a gap of about 25px, so I settled on 683px.

2. **Hollow names too pale:** the reader was right that they were nearly invisible, but I kept them as outlines rather than solid text. Outlines are how the work shows these 158 names as ghosts of given-up domains. I made the outline thicker (0.35px to 0.55px) and much darker (#b3aa9b to #7d7466). ".afamilycompany", ".bentley" and ".bananarepublic" now read clearly while still looking empty. I matched the key's ".hollow" sample to the new style.

3. **Registry colours too close:** the reader was right that red, magenta and purple ran together at about 8px. The seven holders now use these colours:

| Holder | Colour |
|---|---|
| Binky Moon | red |
| Amazon | blue |
| Dog Beach | green |
| Charleston Road | amber |
| Registry Services | blue-violet |
| XYZ.COM | teal |
| Identity Digital | pink |

Red and pink are now clearly apart, and violet sits away from both. In the render ".archi" (violet) and ".casa" (red) are easy to tell apart. Pink and red are still the closest pair, and I'm not sure they will always separate at the smallest size.

Files are in /tmp/claude-0/s118/run/m05/work:
- index.html
- NOTE.md
