# The Waiting at Old Faithful

**Material.** GeyserTimes (geysertimes.org, a volunteer eruption-logging project for Yellowstone's
geysers), Old Faithful eruption archive `Old_Faithful_eruptions.tsv.gz`, from
https://geysertimes.org/archive/ (file: https://geysertimes.org/archive/geysers/Old_Faithful_eruptions.tsv.gz).
Licence as stated on the archive page: "publicly available under the Open Source Database License"
(i.e. ODbL), with attribution to GeyserTimes requested for published research. Fetched 2026-10-20.
The raw file is kept in `data/`; `data/intervals.js` is derived from it (logged times merged when
within 20 minutes of each other, then the gap to the next eruption kept when between 35 and 130
minutes).

The picture is a stack of 682 thin rows, one per month from January 1970 at the bottom to October
2026 at the top, and each row is the spread of that month's waits between eruptions, from 35 to 130
minutes, glowing brighter where more eruptions fell. Read upward, the steam shifts to the right: in
the 1970s the geyser's waits spread from about 45 to 90 minutes; in the 1990s the waits are wide and
uneven; and from 2001 on they pull into one bright column around 90 minutes, where the
rangers' predictions now sit. The dark band of the 1980s is left empty and marked as such: the
archive holds too few logged eruptions from those years to draw.
