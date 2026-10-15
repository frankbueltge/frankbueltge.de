window.FACE = {
 "snip": "year,month,date_of_month,day_of_week,births\n2000,1,1,6,9083\n2000,1,2,7,8006\n2000,1,3,1,11363\n2000,1,4,2,13032\n2000,1,5,3,12558\n…\n2009,9,9,3,16081\n…",
 "hitRow": "2009,9,9,3,16081",
 "lens": {
  "png": {
   "x": 725.9207884650484,
   "y": 52.93083333333333
  },
  "jpg": {
   "x": 308.29092900164267,
   "y": 21.929333333333332
  }
 },
 "named": [
  "the week (two bands)",
  "holidays",
  "the September swell",
  "the peak around 2007",
  "repeating dates (9.9.09 …)",
  "the 13th",
  "one day's exact count"
 ],
 "works": [
  {
   "id": "m02",
   "arm": "T",
   "title": "Appointed Days",
   "note": "All 5,479 days sit in one calendar field, a row for each year and a column for each date, and every cell is colored by how many births that day had compared with what its weekday and season would predict. Taking out the weekly beat (about 13,100 births on a Tuesday, 7,500 on a Sunday) and the slow seasonal swell leaves only what the calendar itself did. Holidays show as dark lines running down through every year, with Thanksgiving and Labor Day shifting as their dates move. The days just before New Year fill up. And a diagonal of red cells runs from 2/2/02 to 12/12/12, with one gap at 6/6/06. I chose a plain calendar grid because the finding is about dates: when births can be scheduled, people pick some days and avoid others, and a grid lets you read that choice at the date where it happened.",
   "unit": "ROW",
   "form": "FOLD-GRID",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": true,
    "the 13th": true,
    "one day's exact count": true
   },
   "coder": {
    "close": 0,
    "guess": "T",
    "conf": 3
   }
  },
  {
   "id": "m08",
   "arm": "T",
   "title": "Two Floors",
   "note": "All 5,479 days are laid as dots on a single calendar year: each column is a date, each dot one year's count for that date, so the fifteen years stack on top of each other. Coloured only by whether the day was a weekday or a weekend, the cloud splits into two horizontal floors, and the form does its work through that split: the weekday holidays — New Year, Memorial Day, 4 July, Labor Day, Thanksgiving, Christmas — show up as dark dots that have dropped onto the orange weekend floor, and a few chosen dates (9.9.09, 8.8.08, 7.7.07, an avoided 6.6.06) stand out from where they should be. I chose a superimposed year over a fifteen-year timeline because the material's structure is the calendar, not the decade: the week and the holidays repeat, and stacking them lets the repetitions reinforce each other until the exceptions are the only thing out of place.",
   "unit": "ROW",
   "form": "FOLD-LINEAR",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": true,
    "the 13th": true,
    "one day's exact count": true
   },
   "coder": {
    "close": 2,
    "guess": "T",
    "conf": 3
   }
  },
  {
   "id": "m11",
   "arm": "T",
   "title": "Not on a Sunday",
   "note": "The work lays all 5,479 days out as a fifteen-row calendar, one thin column per day, darker for more births. Read that way, the count looks less like a natural rhythm and more like a set of appointments. Weekends show up as pale stripes that move one day later each year, and Christmas, New Year's Day and the Fourth of July are pale columns that run straight down through every year. Below it, the same 366 calendar days are shown again with the weekday and month effects removed. What is left is mostly human scheduling: deep red gaps where deliveries were kept away (Christmas −41%, Halloween, Thanksgiving, every 13th of the month) and a ridge in the last working days of December. Five ringed cells pick out the dates that repeat a number. 9.9.09 was the busiest day of the fifteen years, 10.10.10 was full even though it fell on a Sunday, and 6.6.06 was avoided. I chose a calendar and not a timeline because the story is the calendar itself: the dates people choose and avoid when a birth can be booked.",
   "unit": "ROW",
   "form": "FOLD-GRID",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": true,
    "the 13th": true,
    "one day's exact count": true
   },
   "coder": {
    "close": 0,
    "guess": "T",
    "conf": 3
   }
  },
  {
   "id": "m12",
   "arm": "T",
   "title": "Born on a Weekday",
   "note": "Every one of the 5,479 days is a single dot, placed across the page by its date in the calendar year and up the page by the number of births registered that day, with all fifteen years laid on top of one another. I chose this overlay because the strongest thing in the file was not a trend over time but a split: births fall into two separate bands, Monday to Friday and Saturday and Sunday, with a gap between them that ordinary variation almost never crosses. That gap shows how much of birth is now scheduled. Once the two bands are visible, the dates that leave their band stand out on their own, so I marked only those: holidays (New Year, the Fourth of July, Thanksgiving, Christmas) that drop weekday births to weekend levels, the repeating dates such as 9.9.09 and 12.12.12 that rise above every ordinary day, and 6.6.06, which sank.",
   "unit": "ROW",
   "form": "FOLD-LINEAR",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": true,
    "the 13th": true,
    "one day's exact count": true
   },
   "coder": {
    "close": 2,
    "guess": "T",
    "conf": 3
   }
  },
  {
   "id": "m03",
   "arm": "I",
   "title": "The Week Remains",
   "note": "The work takes the time axis out of the plot. Every one of the 5,479 days stays at its own height, its count of births, but slides left along that row until it meets the days already there. The rows are the plot's own pixel rows, about 28 births each, so what you see is a sideways pile of days. Within each row the days keep their order and are coloured by year. What survives without the calendar is the week: two separate masses, five days to two, with a nearly empty band between them. The only days in that band are holiday weekdays that came out like weekends. Because the colours stay in order, the pile also shows the change across the years. The boom years 2006–2008 sit at the top of the weekday mass, and 2010–2014 slump to its lower edge. I chose this form because the most striking thing in the original picture is that horizontal gap. Removing time showed that the gap was never about time: the week puts it there.",
   "unit": "DAY",
   "form": "NO-TIME",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": false,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 0,
    "guess": "I",
    "conf": 3
   }
  },
  {
   "id": "m04",
   "arm": "I",
   "title": "Five and Two",
   "note": "Each of the 5,479 days becomes one dot, and the dots are piled over the number of births registered that day. Fifteen shelves are stacked one above the other, one for each year from 2000 to 2014. The order of days inside a year is left out on purpose. What remains is the shape of the year: every shelf splits into a small heap near 7,000–9,000 births and a large heap near 12,000–14,000, with an almost empty valley between them. In every year the heaps hold roughly 115 and 250 days, close to two days in seven against five. That ratio points to the week, and probably to how births get scheduled, more than to biology. Going down the shelves, the large heap drifts right towards 2007 and back left afterwards. The few red days sit in the valley or far below it, where something broke the usual week. I chose piles over a timeline because the source picture already is a timeline, and its most striking feature is the gap, which a timeline can only show sideways. Piling the days makes the gap the subject, and it keeps every day countable as one mark.",
   "unit": "DAY",
   "form": "NO-TIME",
   "named": {
    "the week (two bands)": true,
    "holidays": false,
    "the September swell": false,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 0,
    "guess": "I",
    "conf": 3
   }
  },
  {
   "id": "m07",
   "arm": "I",
   "title": "One Year, Fifteen Times",
   "note": "The work reads the ink back out of the scatter plot, pixel by pixel, and folds the fifteen-year timeline so that every year lies over the same January-to-December span. Each column of the source picture (about five and a half days) becomes a short streak, coloured by its year and brighter where years pile up. Folding turns what the original buries along its length into things that repeat in place. The week splits births into three layers: weekdays, and a weekend band that turns out to be two equal layers, which I read as Saturdays and Sundays. Births swell towards September. Christmas, early July, the end of October and the Monday holidays fall to weekend level every year, at the same place in the year. Colour keeps the years apart enough to show 2006–08 riding high and the 2010s sitting lower. I drew it from the picture's own pixels and not from cleaned-up numbers, so its grain is honest: the image cannot be sharper than the picture it came from.",
   "unit": "PIXEL",
   "form": "FOLD-LINEAR",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 1,
    "guess": "T",
    "conf": 2
   }
  },
  {
   "id": "m09",
   "arm": "I",
   "title": "The Moat",
   "note": "The work winds all fifteen years of daily US births (2000–2014) round a single calendar circle, with January at the top, and sets each day's distance from the centre by its count, measured from zero. The source plot already showed two bands, one for weekdays and one for weekends, with an empty strip between them. Folding time into a circle turns those bands into two concentric rings and the strip into a moat. Days in the same season line up across the years, so the few weekdays that sink into the moat can be read by date. Most of them fall at the turn of the year. I chose the fold because a long timeline hides that the outliers come back every year, and the ring shows it without any extra marking. The values were measured from the picture itself (4,995 of 5,479 dots could be told apart), and the page says so.",
   "unit": "DAY",
   "form": "FOLD-RADIAL",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 0,
    "guess": "T",
    "conf": 2
   }
  },
  {
   "id": "m01",
   "arm": "L",
   "title": "The Year Turns Fifteen Times",
   "note": "The form winds fifteen years of daily births onto one year-clock. Each dark pixel of the source picture becomes an arc as long as the roughly twelve days that pixel holds. Arcs are coloured by year and stacked into a tone-mapped density, so a single day still shows. Folded this way, the strip's two bands become two rings, the working week outside and Saturday and Sunday inside. Late summer pushes the outer ring out, and the days around New Year, the Fourth of July, Labor Day, Thanksgiving and Christmas fall toward the weekend ring. I chose the circle because the strongest thing in the material is a calendar, and a calendar comes back around. The arcs keep the source's blur visible instead of claiming a precision the image no longer has.",
   "unit": "PIXEL",
   "form": "FOLD-RADIAL",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 0,
    "guess": "L",
    "conf": 3
   }
  },
  {
   "id": "m05",
   "arm": "L",
   "title": "One Year, Fifteen Times",
   "note": "The picture of 5,479 days is cut at each New Year and its fifteen pieces are laid over one another on a single January-to-December width, each year in its own colour from deep teal (2000) through violet (2007) to vermilion (2014), blended like overlapping inks. Folding the strip this way lets the repeating shape stand on top of itself: the two bands (busy weekdays above, quiet weekends below), the late-summer swell, the stray holiday dots at the year's edges, and, in the colour stratification, the middle years riding highest. I worked only from the pixels, not from numbers I do not have, so each mark is one pixel of the source, about eleven and a half days wide, and the image keeps that coarseness rather than inventing day-level detail; the original strip runs underneath with its cut lines so the fold can be checked against what it came from.",
   "unit": "PIXEL",
   "form": "FOLD-LINEAR",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": false,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 1,
    "guess": "L",
    "conf": 3
   }
  },
  {
   "id": "m06",
   "arm": "L",
   "title": "The Week Inside the Year",
   "note": "Fifteen years of daily US birth registrations are wound onto one turn of the calendar. The angle is the time of year and the distance from the centre is the number of births, so every year lies on top of the others. Winding the data into a circle makes the annual rhythm into a shape: the ring leans out towards late summer, and the lowest marks gather at the turn of the year. It also shows that what splits the ring is not the calendar but the week: a thick band of weekdays, a thin double strand of weekends, and an open gap between them that never closes. I had a small picture of the data to work from, not the numbers, so every mark is one pixel of that picture laid back onto the calendar, drawn as an arc as long as the eleven or twelve days that pixel stood for. The resolution of the source stays visible, and there are no counts because the picture never had any.",
   "unit": "PIXEL",
   "form": "FOLD-RADIAL",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": false,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 0,
    "guess": "L",
    "conf": 2
   }
  },
  {
   "id": "m10",
   "arm": "L",
   "title": "Fifteen Turns of the Year",
   "note": "The work wraps the fifteen years of daily births around one circle and lays them on top of each other. Angle is the day of the year, clockwise from 1 January at the top; distance from the centre is the count, read off the source picture with no scale and no zero. Folding the years together makes the calendar the subject. The broad outer ring of working days and the inner ring of weekends come apart, with an empty band between them. The few days that land in that band or below the weekends are drawn in red, and they gather at Christmas and New Year, early July, early September and late November. That is where you can see that births are partly scheduled. I chose the circle because the straight timeline in the source hides this: there the holidays are scattered specks fifteen years apart, and here they fall on the same spot.",
   "unit": "PIXEL",
   "form": "FOLD-RADIAL",
   "named": {
    "the week (two bands)": true,
    "holidays": true,
    "the September swell": true,
    "the peak around 2007": true,
    "repeating dates (9.9.09 …)": false,
    "the 13th": false,
    "one day's exact count": false
   },
   "coder": {
    "close": 0,
    "guess": "T",
    "conf": 2
   }
  }
 ]
};
