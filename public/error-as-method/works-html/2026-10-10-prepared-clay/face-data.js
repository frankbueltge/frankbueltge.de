window.FACE = {
 "snip": {
  "T": "year,day_of_year\n812,92\n815,105\n831,96\n851,108\n853,104\n864,100\n…",
  "P": "In 812, the cherry trees of Kyoto came into full bloom on the 92nd day of the year.\nIn 815, the cherry trees of Kyoto came into full bloom on the 105th day of the year.\nIn 831, the cherry trees of Kyoto came into full bloom on the 96th day of the year.\nIn 851, the cherry trees of Kyoto came into full bloom on the 108th day of the year.\n…"
 },
 "coderHits": 4,
 "works": [
  {
   "id": "m07",
   "arm": "T",
   "title": "Eight Hundred and Thirty-Eight Aprils",
   "note": "Each recorded year is drawn as a single small blossom, set at its year (left to right, 812 to 2026) and at its day of full bloom (top to bottom, late March to early May), on a ruled ground like a ledger page. Together the 838 blossoms form a long pink drift through the middle of April. A thin ink line traces the slow average, and a strip of marks along the bottom shows which years have a surviving record at all. I chose this form so that the record keeps its texture and its gaps, and so that the single fact that matters most can be read without a model or a trend line: one dotted line marks the earliest bloom written down before this century (27 March 1409). For twelve hundred years nothing fell below it. Then 2021 and 2023 did, and those two are the only blossoms drawn in red.",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the table.",
   "coder": {
    "guess": "P",
    "conf": 1,
    "why": "Exact dates and gap claims ('since 1946 there are none') fit any clean source; T vs P is undecidable here."
   }
  },
  {
   "id": "m01",
   "arm": "I",
   "title": "838 Springs",
   "note": "The work draws the record as the cut end of a cherry trunk. Each recorded year is a growth ring, from 812 at the pith to 2026 at the bark, and the calendar runs once around the trunk, with 1 January at the top. On each ring a pale pink point sits at that year's day of full bloom. Only years with a written date get a ring, so the centuries with a thin record show up as darker, sparser wood near the centre. I chose the tree ring because it is how a tree keeps its own years, one ring each, and because a full circle for the calendar shows how short the bloom is. All twelve centuries of flowering fit into one narrow wedge of the year. Across the outer rings that wedge turns back toward March, which reads at once as the season moving earlier. A faint line traces the 51-year average through the wedge, and the earliest bloom (2023) and the latest (1323) are marked.",
   "carried": "838 values read back from the plot’s pixels; 739 of the 838 exactly as in the source, 5 years placed where the source has none (counted by this practice’s decode of the drawing, a lower bound).",
   "coder": {
    "guess": "I",
    "conf": 3,
    "why": "Footnote states the data were read back from a published plot with 20 hidden points inferred."
   }
  },
  {
   "id": "m09",
   "arm": "I",
   "title": "Thirteen Rows of Spring",
   "note": "The twelve centuries of Kyoto's cherry record are laid out like lines of a page, one row per century from the 800s to the 2000s. Every year in which someone wrote down the full bloom stands as a single stem, and the earlier the trees flowered, the taller the stem. Where nothing survives, the ground is left bare. I chose this over the original long scatter because folding time into centuries lets you compare one hundred springs with the next directly, row above row. The early rows are thinned by lost diaries and the middle rows are a steady, even meadow. The last row shows what the dataset is really about: twenty-seven years whose stems stand taller than almost anything before them, and after 2026 the rest of the century as empty, dotted ground still to be written.",
   "carried": "838 values read back from the plot’s pixels; 834 of the 838 exactly as in the source, 2 years placed where the source has none.",
   "coder": {
    "guess": "I",
    "conf": 3,
    "why": "Caption says values were read back from a scatter plot and some stems may be a column or two off."
   }
  },
  {
   "id": "m11",
   "arm": "T",
   "title": "Twelve Hundred Aprils",
   "note": "Each recorded year from 812 to 2026 is a small five-petalled blossom. Its place across the page is the year, and its place down the page is the calendar date the trees came into full bloom, from late March at the top to early May at the bottom. Together the 838 blossoms build into a cloud that hovers around mid-April for about eleven hundred years. A thin fifty-year mean runs through it, and at the right edge it lifts sharply, where the recent blossoms (from 1990 on, drawn slightly brighter and larger) crowd toward the earliest dates ever written down. A strip along the bottom marks which years have a record, so the silences of the early centuries show as gaps rather than as an unbroken line. I chose a plain date-by-year field because the subject is literally a date that kept its place for centuries and then moved. Drawing each year as a blossom against a night-dark ground, rather than as a dot, keeps the chart close to what was being recorded: people looking at the trees and writing down the day.",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the table.",
   "coder": {
    "guess": "T",
    "conf": 2,
    "why": "Fifty-year rolling mean and exact record count (838 of 1215) point to tabular data."
   }
  },
  {
   "id": "m03",
   "arm": "P",
   "title": "Thirteen Centuries of Spring",
   "note": "The work is set out like a ledger, with one row for each century from the 800s to the 2000s and one narrow column for each year. Each column is a small calendar running from 25 March at the top to 4 May at the bottom. In a year with a record, pale blossom fills the column from the day of full bloom onward, so an early spring makes a tall column and a late one a short one. Years that passed without a record are left as empty outlined cells. Years before 812 or after 2026 are not drawn at all. I chose this form so that two things in the data stay visible together. The first is how the record grows denser over time, from scattered entries in the Heian court diaries to almost every year after 1400. The second is how the bloom stays within the same three weeks for a thousand years, then rises in the last row, where the century average moves to 4 April, the earliest of the thirteen rows.",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the sentences.",
   "coder": {
    "guess": "T",
    "conf": 2,
    "why": "Exact per-century counts (e.g. 14 of 88 yrs) and a cell for every missing year point to a table."
   }
  },
  {
   "id": "m08",
   "arm": "P",
   "title": "The Blossom Line",
   "note": "Each of the 1,215 calendar years from 812 to 2026 gets one narrow column, and time runs down each column through spring, from late March at the top to early May at the bottom. Where a year has a recorded date, blossom starts on the full-bloom day as a bright edge and fades over the weeks after. Side by side, those edges form a single horizon twelve centuries long. Years with no recorded date stay dark, so the gaps show too: the record is sparse and patchy before about 1400 and nearly complete afterwards. I chose a horizon instead of a scatter of dots because the dates matter as the moment the season turns, and a filled field makes the last hundred years read as a change in the landscape. Over that century the bloom line rises above anything earlier in the record. A thin line marks the 51-year average, so the reader can tell that slow rise apart from the year-to-year noise.",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the sentences.",
   "coder": {
    "guess": "T",
    "conf": 2,
    "why": "51-year average, exact 838 of 1215 strip and correct extremes suggest numeric data, though the day-number axis mirrors R."
   }
  },
  {
   "id": "m02",
   "arm": "I",
   "title": "Since the Equinox",
   "note": "The work lays the twelve centuries out as a ledger: one row per spring, read down six columns from 812 to 2026. In each recorded year a grey thread runs from the equinox (21 March) to the day of full bloom, where a small pink blossom sits, and a year with no record is left as an empty row. So the time spent waiting becomes a length you can see, and the gaps in the archive stay visible as gaps instead of being smoothed over. I chose a ledger over a single timeline because a chronicle is how these dates survived, kept by diarists and court records year by year, and because putting the columns side by side makes the ending clear without a trend line: for a thousand years the blossoms gather around a dotted rule at 15 April, and in the last column, row after row, they draw back toward the equinox.",
   "carried": "838 values read back from the plot’s pixels; 838 of the 838 exactly as in the source, 0 years placed where the source has none.",
   "coder": {
    "guess": "I",
    "conf": 3,
    "why": "Footer says dates are read back from a published plot and may be off by a day or a year."
   }
  },
  {
   "id": "m04",
   "arm": "T",
   "title": "Twelve Centuries of Spring",
   "note": "The work is laid out like a hanging scroll. The years run down it from 812 to 2026, and the day of full bloom runs across it, from late March on the left to early May on the right. Each of the 838 recorded years is one petal, so the record looks like blossom falling down the page. Years nobody wrote down stay blank paper, which is why the early centuries look sparse. A thin ink thread follows the average date across the fifty years around each year. For about eleven hundred years the petals scatter widely and the thread barely moves. Then, in the last hundred years, the cloud draws to the left. The earliest bloom in the whole record, 25 March 2023, is near the bottom edge. I chose the scroll because the material is a chronicle read from top to bottom, and because I wanted each year to look like what it records: one moment of blossom, kept on paper. [As handed in, the page throws a script error in a browser (it declares a variable named top, which the browser reserves) and shows nothing. The maker had checked it in a stand-in, not a browser.]",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the table.",
   "coder": {
    "guess": "P",
    "conf": 1,
    "why": "Screenshot is completely blank (failed render), so the guess has no basis."
   }
  },
  {
   "id": "m10",
   "arm": "I",
   "title": "838 Springs",
   "note": "The twelve centuries are cut into thirteen columns, one per century, like a ledger or a hanging scroll. Each recorded year is one row, and each row is a thread drawn from a fixed hairline at April 15 (the median of 812–1850) to a small pink mark on the day the trees reached full bloom. Unrecorded years are left blank. I chose this over one long scatter because a column per century lets you compare one stretch of time with another at a glance. For eleven hundred years the threads scatter evenly on both sides of the hairline, and then the last, unfinished column leans clearly toward March. A small mark under each column gives that century's median, so the drift shows as a single step at the end rather than as a trend line laid over the data.",
   "carried": "838 values read back from the plot’s pixels; 742 of the 838 exactly as in the source, 9 years placed where the source has none (counted by this practice’s decode of the drawing, a lower bound).",
   "coder": {
    "guess": "T",
    "conf": 1,
    "why": "Century columns with computed medians and precise year placement suggest structured data; no read-back caveat."
   }
  },
  {
   "id": "m06",
   "arm": "P",
   "title": "Full Bloom, Kyoto",
   "note": "Each of the 838 recorded springs is drawn as a single small blossom. It sits at its year, from 812 to 2026, and at its day of full bloom, with earlier days higher and in deeper pink. Through the blossoms runs a dark branch: the average of the records within 25 years either side, thicker where more springs were written down. Beneath them a strip of ticks marks which years have a record at all, so the 377 lost springs stay visible as gaps and are not smoothed over. I chose this form because reading the data showed two things that a single line would merge into one. Very early springs are not new: 961 had day 87 and 1409 had day 86. What is new is that the branch, which stayed near mid-April for a thousand years, has dropped to about 4 April within a single lifetime, and the earliest bloom on record (25 March 2023) is among the last few blossoms.",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the sentences.",
   "coder": {
    "guess": "T",
    "conf": 2,
    "why": "Exact record count, correct dates for the extremes and a 25-year running mean point to clean numbers."
   }
  },
  {
   "id": "m05",
   "arm": "T",
   "title": "The Long Wait",
   "note": "Every recorded spring in Kyoto is a thin thread hanging from one shared rail, and each thread ends in a small blossom on the day the trees reached full bloom. Twelve centuries of threads make a curtain whose lower edge is the bloom date. Springs with no record leave a gap, so the sparse early chronicle and the dense later one show in the weave without being explained. A faint red hem marks the slow average. I chose threads over dots because the material is about waiting: how long winter held on each year. That length shows as a physical length, and you can see the curtain rise sharply in the last few decades as the wait gets shorter.",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the table.",
   "coder": {
    "guess": "P",
    "conf": 2,
    "why": "Annotations use the ordinal '84th day' / '124th day' phrasing of the chronicle sentences."
   }
  },
  {
   "id": "m12",
   "arm": "P",
   "title": "The Branch of Record",
   "note": "Each of the 838 recorded years is a small five-petalled flower, placed left to right by year and up and down by the day it bloomed, with earlier days higher. A dark branch runs through them. It traces a running mean (±14 years), and its thickness shows how many dates survive nearby. It is a thin twig in the ninth century, where records are scattered, and grows into a full limb once the yearly record becomes continuous after 1500. Wherever nine or more years in a row have no date, the branch simply breaks. A hair-thin stalk joins each flower to the branch, so you can see how far each spring strayed from its own era. A faint rule marks the old median, day 105, which is the middle spring of 812–1849. I chose a branch because it lets one form carry three things at once: the dates themselves, the slow drift of their average, and how full or thin the archive is behind them. The ending can then speak plainly. For a thousand years the flowers hang evenly around that rule. Then the branch lifts away from it, and all 37 springs since 1990 came earlier than it. [The work labels 812 as ‘the first written date, at a flower banquet at court’. The maker’s report says that claim was removed. It was not; it is the maker’s, and this practice did not verify it.]",
   "carried": "all 838 values, exactly, retyped by the maker’s own code from the sentences.",
   "coder": {
    "guess": "T",
    "conf": 2,
    "why": "Running mean with gap detection and exact counts (all 37 springs since 1990) suggest clean numeric data."
   }
  }
 ],
 "afterHTML": "<h2>What happened</h2>\n<p>All twelve makers did the same thing first: they turned what they were given into a table. The four given sentences parsed them into year and day, and three of them wrote it into the page as <span class=\"mono\">812:92</span> pairs, the encoding one of the table makers chose too. The four given the picture wrote their own PNG decoders, measured the axes from the ticks and fitted dots to pixels. One of them recovered all 838 values exactly, and another got 834.</p>\n<p>Then the forms parted, and not where this practice predicted. It expected the makers given the plot to trace it. <b>None did.</b> A blind coder rated their works 0, 0, 0 and 1 for closeness to the plot (a tree's rings, a ledger of six columns, thirteen rows of stems, thirteen century columns). Their notes say why: one chose its form <i>\"over the original long scatter\"</i>, another <i>\"over one long scatter\"</i>. The scatter was made by the others. Six of the seven table and sentence works that render are the plot restyled: years across, days down, a blossom for each dot.</p>\n<p>The coder could not tell a table from sentences (1 of 8 right). It named three of the picture makers, but only because their captions said the values were read back from a plot. The preparation showed in the makers' honesty about it, not in their forms.</p>\n<figure><img src=\"figure.svg\" alt=\"For each of twelve makers, grouped by preparation, the coder's closeness to the plot: table arm 0, 2, 2, 2; sentence arm 1, 2, 2, 2; plot arm 0, 0, 1, 0.\"></figure>\n<p><b>What this taught the project.</b> The preparation of a material does reach a machine maker's form, by subtraction. For this family the obvious form is what it makes from numbers in any wording. The one way tonight to keep it out was to hand it over as the matter. Then it counted as already made. In Simondon's brick (recalled, not reread tonight) the clay is prepared before the mould meets it. Here the mould itself was handed over as clay, and every maker treated it as clay: they reduced it to numbers and refused its shape.</p>\n<p><a href=\"work.md\">The text</a> · <a href=\"PREDICTIONS.md\">predictions, committed before any maker</a> · <a href=\"results.json\">results</a> · <a href=\"reports/README.md\">the makers' reports, verbatim</a> · <a href=\"SCRATCH.md\">a leak in the arrangement</a></p>\n"
};
