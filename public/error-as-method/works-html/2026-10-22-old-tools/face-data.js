window.FACE = {
"arms": [
{
"name": "PLOT",
"what": "Draws one column as a line, in file order. The neutral control.",
"rooms": [
{
"room": "r05",
"material": "US weekly price of gasoline, 1990–2026",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "partly",
"first": [
"Global mean surface temperature anomalies (e.g. HadCRUT or NASA GISTEMP, monthly)",
"Great Lakes monthly water levels (NOAA GLERL)",
"Weekly retail gasoline prices in the United States (EIA)"
],
"expected": "A line that sits near $1 through the 1990s, climbs through the 2000s to a peak around $4 in mid-2008 and collapses at the end of that year, a second high plateau 2011-2014, a drop in 2015-2016 and a 2020 dip, then the sharp spike to about $5 in June 2022; I expect the last stretch in 2026 to be somewhere around $3-4.",
"showed": "The line looks the way I expected through 2022. It sits near a dollar for the 1990s, with the floor (0.907) in February 1999. It climbs to the 2008 peak and drops off a cliff at the end of that year. There is a high plateau from 2011 to 2014, a slide in 2015 and 2016, the 2020 trough, and the summit of 5.006 in June 2022. I did not expect the end of the line. After falling to about $2.80 at the end of 2025, the price jumps by about a dollar in four weeks of March 2026 (3.02 on 2 March, 3.99 on 30 March). It reaches 4.50 in May and is still around $4.28–4.35 in October 2026. That puts the last stretch of the picture almost as high as 2022, not on the gentle $3 plateau I had guessed. The series alone does not say why. Note that the instrument draws the values in file order without a time axis, so the six skipped cells in 1990–91 are simply joined over.",
"url": "https://fred.stlouisfed.org/series/GASREGW"
},
{
"room": "r10",
"material": "Lake Michigan-Huron water level, monthly, 1918–2026",
"own": "OFF",
"ownLabel": "off its shelf",
"met": "partly",
"first": [
"Monthly water levels of the Great Lakes (NOAA GLERL / USACE, since 1918)",
"Weekly US retail gasoline prices (US Energy Information Administration)",
"The Titanic passenger list (age and fare of each passenger)"
],
"expected": "A line of about 1,300 months with a fine yearly sawtooth (summer high, winter low, roughly 0.3 m) riding on slow multi-year swings of over a metre: lows in the mid-1930s and mid-1960s, highs around 1952, 1973 and 1986, a long low stretch 1999 to 2013, the sharp rise to the 2020 peak, and a decline since.",
"showed": "The line is a dense sawtooth of yearly cycles, a few tenths of a metre each, riding on slow swings almost two metres tall: down to the 1934 trough, up to 1952, down to the lowest point of the 1960s (March 1964, 175.58 m), a long high plateau through the 1970s and 1980s that peaks at the record of October 1986 (177.50 m), then a sudden drop in 1998 to 2000 into a fourteen-year low that ends at the record low of January 2013 (175.57 m), almost exactly level with 1964. After that comes the steepest climb in the record: about 1.9 m in seven years, to the 2020 high. Since then it has fallen steadily, and 2025 to early 2026 is back near the levels of the early 2000s. This is mostly what I expected. I had not expected two things: the 2020 peak does not exceed 1986, and the 2013 low matches 1964 to within a centimetre. So the lake has been swinging between the same two limits for a century rather than drifting out of them. The other surprise was how abrupt the 1998 fall is next to the gentle slopes everywhere else.",
"url": "https://www.greatlakescc.org/en/coordinating-committee-products-and-datasets/"
},
{
"room": "r15",
"material": "Bank of England Bank Rate, monthly, 1694–2026",
"own": "KIN",
"ownLabel": "kin on its shelf",
"met": "partly",
"first": [
"The Bank of England's official policy interest rate (Bank Rate), back to 1694.",
"The water level of Lake Mead behind the Hoover Dam.",
"Monthly global surface temperature anomalies (e.g. NASA GISTEMP)."
],
"expected": "A long, nearly flat stretch near 4-5% through the eighteenth century (the usury laws capped the rate at 5% until 1833), then a nervous, spiky nineteenth century, the long \"cheap money\" floor of 2% from 1932 to 1951, a single great mountain peaking at 17% in 1979, and a fall to almost nothing after 2009 with a small bump in 2022-23.",
"showed": "The line is dominated by its emptiness: almost a third of the width (April 1719 to May 1822, 1,238 months) is one perfectly flat line at 5%, the usury ceiling, preceded by a few short steps between 3% and 6% in the Bank's first decades. Only after the mid-1820s does the line start to move, and then as a dense comb of thin spikes up to 8–10% (1847, 1857, 1866) over a floor of 2–3%, which is the nineteenth-century gold-standard Bank \"defending the reserve\" with over 200 changes in 1850–1875 alone. Then comes a second long flat, at 2% from 1932 to 1951 except for one short blip in 1939, a single broad massif from the 1960s to the early 1990s topping out at 17% in November 1979 (the highest value in 330 years, though only about twice the Victorian panic peaks), and a drop to the floor of the whole picture, 0.5% from 2009 and 0.1% in 2020, followed by the climb to 5.25% in 2023 and the slow descent since. That was broadly what I expected. What I did not know was the proportions: I knew the 5% cap existed, but not that the rate did not move at all for 103 years, nor that the Victorian rate swung almost as violently (2% to 10% within months) as the inflation-era rate did.",
"url": "https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp"
},
{
"room": "r16",
"material": "Days of ice on Lake Mendota, 1852–2026",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "partly",
"first": [
"Global mean surface temperature anomalies (NASA GISTEMP monthly series).",
"The ice-cover duration of a lake in winter (Lake Mendota, Madison, Wisconsin, recorded since the 1850s).",
"US weekly retail gasoline prices (EIA)."
],
"expected": "A noisy line of roughly 170 winters, from about 160 days of ice in the 1800s down towards 40-70 days recently, with a slow downward drift and large year-to-year scatter; the very short winter of 2001-02 (21 days) should appear as the lowest point near the right.",
"showed": "The line is one long, ragged sawtooth of 171 winters between 21 and 161 days. The decline I expected is there, but not as a steady drift: the first twenty-odd winters (1850s-1870s) are high and wild, including the 161-day winter of 1880-81 at the top; then for roughly a century, from the 1880s to the 1970s, the line wanders around a level of about 100-106 days with no clear slope at all; only in the last fifth of the file does the floor drop, with the low spikes clustering at the right (1982-83, 1997-98, 1999-00, the 21-day minimum of 2001-02, 2011-12, and 44 days in 2023-24). So it was partly what I expected: the direction and the minimum were right, but what I did not know was the shape - a long flat middle and a decline concentrated after about 1975, rather than a gentle slide across the whole record.",
"url": "https://climatology.nelson.wisc.edu/first-order-station-climate-data/madison-climate/lake-ice/history-of-ice-freezing-and-thawing-on-lake-mendota/"
}
],
"shelf": [
{
"line": "Bank of England — A Millennium of Macroeconomic Data (Bank Rate, prices, wages in the UK since the 13th century)",
"hit": true
},
{
"line": "Bank of England — A millennium of macroeconomic data (UK prices, wages, interest rates and output, annual from the 13th century)",
"hit": false
},
{
"line": "Boston Athletic Association — Boston Marathon results (winning times by year since 1897)",
"hit": false
},
{
"line": "European Central Bank — Euro foreign exchange reference rates (daily USD per EUR, since 1999)",
"hit": false
},
{
"line": "FAO — FishStat global capture production (tonnes of fish caught per year)",
"hit": false
},
{
"line": "Federal Reserve Bank of St. Louis (FRED) — UNRATE (monthly U.S. civilian unemployment rate, since 1948)",
"hit": false
},
{
"line": "Federal Reserve Bank of St. Louis FRED — UNRATE (monthly US civilian unemployment rate since 1948)",
"hit": false
},
{
"line": "Google Books Ngram Viewer — Ngram datasets (yearly relative frequency of a word in printed books)",
"hit": false
},
{
"line": "Hudson's Bay Company records via Elton & Nicholson (1942) — Canadian lynx pelt returns (lynx trapped per year, 1821–1934)",
"hit": false
},
{
"line": "Human Mortality Database — Deaths and life tables (deaths and death rates by year and age for about 40 countries)",
"hit": false
},
{
"line": "Human Mortality Database — Period life tables (life expectancy at birth per year, by country)",
"hit": false
},
{
"line": "Lisiecki & Raymo (PANGAEA / NOAA Paleoclimatology) — LR04 benthic δ18O stack (global ice volume and deep-ocean temperature proxy over 5.3 million years)",
"hit": false
},
{
"line": "Met Office Hadley Centre — Central England Temperature series (daily and monthly mean air temperature in central England since 1659/1772)",
"hit": false
},
{
"line": "Met Office Hadley Centre — HadCET Central England Temperature (daily and monthly mean air temperature, monthly since 1659)",
"hit": false
},
{
"line": "NASA GISS — GISTEMP (global mean surface temperature anomaly by month since 1880)",
"hit": false
},
{
"line": "NASA Goddard Institute for Space Studies — GISTEMP v4 (global mean surface air and sea temperature anomaly, monthly since 1880)",
"hit": false
},
{
"line": "NASA Ozone Watch — Antarctic ozone hole data (yearly minimum total ozone and ozone-hole area)",
"hit": false
},
{
"line": "NOAA Climate Prediction Center — Oceanic Niño Index (3-month running sea surface temperature anomaly in the Niño 3.4 region, since 1950)",
"hit": false
},
{
"line": "NOAA Global Monitoring Laboratory — Global monthly mean methane (CH4 concentration in the atmosphere, since 1983)",
"hit": false
},
{
"line": "NOAA NCEI Paleoclimatology — Vostok ice core deuterium record (reconstructed Antarctic temperature over 400,000 years)",
"hit": false
},
{
"line": "NOAA National Hurricane Center — HURDAT2 Atlantic hurricane database (6-hourly position, maximum wind, central pressure of tropical cyclones)",
"hit": false
},
{
"line": "NOAA National Hurricane Center — HURDAT2 Atlantic hurricane database (six-hourly position, maximum wind and pressure of every tropical cyclone since 1851)",
"hit": false
},
{
"line": "NOAA Paleoclimatology — Vostok ice core deuterium record (reconstructed Antarctic temperature over about 420,000 years)",
"hit": false
},
{
"line": "NSIDC — Global Lake and River Ice Phenology database (freeze and breakup dates, ice duration of lakes such as Lake Mendota)",
"hit": true
},
{
"line": "NYC Open Data — 311 Service Requests (every non-emergency complaint to New York City, since 2010, countable per day)",
"hit": false
},
{
"line": "Office for National Statistics — Weekly deaths registered in England and Wales (deaths per week, since 2010)",
"hit": false
},
{
"line": "Old Bailey Proceedings Online — Trials at London's Central Criminal Court 1674–1913 (number of trials, verdicts, punishments per year)",
"hit": false
},
{
"line": "Robert Shiller, Yale — U.S. stock market data (monthly S&P composite price, dividends, earnings and CAPE ratio, since 1871)",
"hit": false
},
{
"line": "Robert Shiller, Yale — U.S. stock market data (monthly S&P composite price, dividends, earnings, CPI since 1871)",
"hit": false
},
{
"line": "Sean Lahman — Lahman Baseball Database (season statistics such as runs, home runs, batting average per team and player since 1871)",
"hit": false
},
{
"line": "Smithsonian Institution Global Volcanism Program — Holocene eruption database (eruption dates, Volcanic Explosivity Index)",
"hit": false
},
{
"line": "U.S. Bureau of Transportation Statistics — T-100 / Air Carrier Traffic Statistics (monthly passengers carried by U.S. airlines)",
"hit": false
},
{
"line": "U.S. Census Bureau — New Residential Construction (monthly housing starts, since 1959)",
"hit": false
},
{
"line": "U.S. Centers for Disease Control and Prevention — FluView ILINet (weekly percentage of doctor visits for influenza-like illness, since 1997)",
"hit": false
},
{
"line": "U.S. Energy Information Administration — Weekly U.S. retail gasoline prices (average price per gallon of regular gasoline, since 1990)",
"hit": true
},
{
"line": "U.S. Energy Information Administration — Weekly retail gasoline prices (US average price per gallon since 1990)",
"hit": false
},
{
"line": "U.S. Social Security Administration — Baby names from Social Security card applications (yearly count of babies given each first name, since 1880)",
"hit": false
},
{
"line": "U.S. Transportation Security Administration — Checkpoint travel numbers (daily count of passengers screened at US airports)",
"hit": false
},
{
"line": "USDA NASS — Honey Bee Colonies report (number of bee colonies and colony losses by quarter)",
"hit": false
},
{
"line": "USDA National Agricultural Statistics Service — Quick Stats corn yield (U.S. bushels of corn per acre, yearly since 1866)",
"hit": false
}
]
},
{
"name": "CYCLES",
"what": "A periodogram: how strongly every period recurs in evenly spaced values.",
"rooms": [
{
"room": "r01",
"material": "New York 311 noise complaints, per day",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "partly",
"first": [
"Hourly pedestrian counts from the City of Melbourne's sensors.",
"Noise complaints made to New York City's 311 service.",
"Weekly US retail gasoline prices (EIA)."
],
"expected": "I expect the strongest period to be the year (about 365 days, summer nights being louder), followed by the week (7 days, with weekend peaks) and possibly its harmonic at 3.5 days. The year may dominate because the record holds less than seven years and the summer swing is large.",
"showed": "The week, not the year, is New York's loudest rhythm: the 7-day period carries a fifth of all the power, more than twice the annual cycle (read as 355 days, the nearest whole-record harmonic to a year), and the week's 3.5-day harmonic comes third, a sign that the weekly shape is sharp-edged — complaints pile up on weekend nights rather than swelling gently. I expected all three periods but in the other order: I thought the summer swing would dominate over less than seven years of record. That it does not says that the calendar of work and leisure governs when New Yorkers lose patience with their neighbours more strongly than the season does.",
"url": "https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9"
},
{
"room": "r04",
"material": "Measles in Cambridge, fortnightly, 1944–66",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "met",
"first": [
"Weekly measles case reports from the pre-vaccine era (e.g. England and Wales, or US cities in Project Tycho).",
"Hourly pedestrian counts from the City of Melbourne pedestrian counting system.",
"Daily reported crimes in Chicago (City of Chicago open data portal)."
],
"expected": "I expect a strong peak near 26 fortnights (one year, the school-term seasonality) and probably one near 52 fortnights (two years), but less clean than London's biennial cycle, since in a small city measles fades out between epidemics and returns irregularly; long-period power may also be large.",
"showed": "The strongest period is about 54 fortnights (about 2.1 years, 11% of the power), then exactly 26 fortnights (one year, 9%), then about 75 fortnights (about 2.9 years, 4%). So even this small city, which I expected to be ruled by irregular fade-outs and the yearly school calendar, kept a two-year rhythm, and it outweighs the annual one; that I did not expect. The low shares of power (the top three together only about a quarter) do fit the expectation of an untidy record, with the third peak near three years hinting at epidemics that sometimes skipped a year longer than the London pattern.",
"url": "https://ento.psu.edu/research/labs/ottar-bjornstad/ottar-lab-abstracts/60measles.txt"
},
{
"room": "r13",
"material": "New York 311 residential noise, per hour",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "met",
"first": [
"NYC 311 service requests (noise complaints), counted hour by hour",
"Hourly pedestrian counts from the City of Melbourne sensors",
"Daily hospital emergency department visits"
],
"expected": "I expect the strongest period to be 24 hours (complaints peak late at night), with the weekly period of 168 hours second, because weekend nights (parties) should be much louder than weeknights; a 12-hour harmonic may come third.",
"showed": "The day dominates: a 24-hour period holds 22% of the power, then the week (168 hours, 9%), then the 12-hour harmonic (8%), exactly the order I expected. The complaints trough around 6 a.m. (about 16 an hour across the city) and peak around 10-11 p.m. and midnight (about 125 an hour), and weekend days carry roughly twice the complaints of midweek days. What I did not know is in the weights: even though Saturdays and Sundays are twice as loud as Tuesdays to Thursdays, the week holds less than half the power of the day, because the weekend excess is a taller version of the same night-time peak and so largely feeds the daily line. Counting by the calendar also shows the party spilling over midnight: Sunday (which collects Saturday's small hours) has more complaints than Saturday, and Monday more than Friday.",
"url": "https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9"
},
{
"room": "r14",
"material": "US influenza-like illness, weekly, 2002–26",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "partly",
"first": [
"Weekly influenza-like illness (ILI) rates in the United States (CDC ILINet / FluView).",
"Hourly pedestrian counts on city streets (City of Melbourne pedestrian counting system).",
"Daily calls to an emergency or city service line (e.g. Seattle Fire 911 dispatches)."
],
"expected": "A dominant peak at about 52 weeks (the winter flu season) carrying most of the power, with its harmonic near 26 weeks next. I expect the 2009 H1N1 autumn pandemic wave and the COVID-era collapse and later shifted seasons to smear the annual peak and add some power at multi-year periods.",
"showed": "The annual flu season stands out alone: a peak at 52.25 weeks holding 33% of the power, with nothing else above 3%. That much I expected, and also the harmonic near 26 weeks (2%). What I did not expect is that the second-strongest peak is not the half-year harmonic but a period of about 90 weeks (1.7 years, 2.7% of power), and that the annual peak, dominant as it is, holds only a third of the power: the rest is spread across long periods and sidebands rather than concentrated in a neat yearly comb. The flu year is regular in its timing but irregular in its size, and the irregular seasons (the 2009 pandemic wave, the almost absent 2020/21 season, the large 2017/18 and 2024/25 seasons) appear to the instrument as a slow beat beside the year rather than as multi-year cycles of their own. Partly what I expected; the 90-week peak was the surprise.",
"url": "https://api.delphi.cmu.edu/epidata/fluview/"
}
],
"shelf": [
{
"line": "AAVSO International Database — light curve of Mira (Omicron Ceti) (visual brightness estimates of a variable star, binned daily)",
"hit": false
},
{
"line": "Australian Bureau of Meteorology — Climate Data Online, Sydney Observatory Hill (daily rainfall since 1858)",
"hit": false
},
{
"line": "CDC FluView — ILINet (weekly percentage of US doctor visits for influenza-like illness)",
"hit": true
},
{
"line": "CDC — FluView ILINet (weekly share of US doctor visits for influenza-like illness since 1997)",
"hit": false
},
{
"line": "City of Chicago Data Portal — Crimes 2001 to Present (every reported crime incident, countable per day)",
"hit": false
},
{
"line": "City of Chicago Data Portal — Crimes 2001 to present (reported crime incidents, aggregated to daily counts)",
"hit": false
},
{
"line": "Eurostat — tour_occ_nim (monthly nights spent at tourist accommodation, by country)",
"hit": false
},
{
"line": "Federal Reserve Bank of St. Louis FRED — UNRATENSA (monthly US unemployment rate, not seasonally adjusted)",
"hit": false
},
{
"line": "Federal Reserve Board H.10 — daily dollar-euro exchange rate (noon buying rates in New York)",
"hit": false
},
{
"line": "GH Archive — GitHub public event timeline (every public GitHub event, countable per hour)",
"hit": false
},
{
"line": "Grenfell / Bolker & Grenfell measles data — England and Wales measles notifications (weekly reported measles cases by town, 1944–1966)",
"hit": true
},
{
"line": "Hudson's Bay Company archives via Elton & Nicholson (1942) — Canadian lynx fur returns (number of lynx pelts traded each year, 1821–1934)",
"hit": false
},
{
"line": "Hudson's Bay Company records via Elton and Nicholson (1942) — Canadian lynx fur returns (annual lynx pelts traded, 1821–1934)",
"hit": false
},
{
"line": "LBMA via FRED — gold price fixing (daily London gold price in US dollars)",
"hit": false
},
{
"line": "Met Office Hadley Centre — HadCET Central England Temperature (daily mean air temperature in central England since 1772)",
"hit": false
},
{
"line": "Met Office Hadley Centre — HadCET Central England Temperature (daily mean air temperature in central England since 1772)",
"hit": false
},
{
"line": "NASA GISS — GISTEMP (monthly global mean surface temperature anomaly)",
"hit": false
},
{
"line": "NASA GISS — GISTEMP global surface temperature (monthly global land-ocean temperature anomaly since 1880)",
"hit": false
},
{
"line": "NOAA Climate Prediction Center — Niño 3.4 sea surface temperature index (monthly ocean temperature anomaly in the equatorial Pacific since 1950)",
"hit": false
},
{
"line": "NOAA Climate Prediction Center — North Atlantic Oscillation index (monthly pressure-difference index over the North Atlantic since 1950)",
"hit": false
},
{
"line": "NOAA Climate Prediction Center — Southern Oscillation Index (monthly standardized air pressure difference between Tahiti and Darwin)",
"hit": false
},
{
"line": "NYC Open Data — 311 Service Requests (every non-emergency complaint to the city, countable per day)",
"hit": true
},
{
"line": "NYC Taxi and Limousine Commission — TLC Trip Record Data (every yellow taxi trip, countable per hour)",
"hit": false
},
{
"line": "NYC Taxi and Limousine Commission — trip record data (yellow taxi trips, aggregated to hourly or daily counts)",
"hit": false
},
{
"line": "Project Tycho (University of Pittsburgh) — US measles weekly case counts (reported measles cases by week, 1888–2002)",
"hit": false
},
{
"line": "Rutgers University Global Snow Lab — Northern Hemisphere snow cover extent (weekly and monthly snow-covered land area since 1966)",
"hit": false
},
{
"line": "Stack Exchange — Stack Exchange Data Dump (every question and answer on Stack Overflow with a timestamp, countable per day)",
"hit": false
},
{
"line": "Transport for London — Public transport journeys by type (journeys on the Tube and buses per four-week period)",
"hit": false
},
{
"line": "Transport for London — public transport journeys by type (journeys per four-week period on Tube, bus and rail since 2010)",
"hit": false
},
{
"line": "UK Office for National Statistics — Weekly deaths registered in England and Wales (deaths registered per week)",
"hit": false
},
{
"line": "UK Office for National Statistics — weekly registered deaths in England and Wales (deaths registered per week)",
"hit": false
},
{
"line": "US Bureau of Labor Statistics — unemployment rate, not seasonally adjusted (monthly US civilian unemployment rate since 1948)",
"hit": false
},
{
"line": "US Bureau of Transportation Statistics — T-100 / Air Carrier Statistics (monthly passengers on US airline flights)",
"hit": false
},
{
"line": "US Bureau of Transportation Statistics — T-100 air traffic, monthly passengers (US airline passengers carried per month since 2002)",
"hit": false
},
{
"line": "US Census Bureau via FRED — new privately owned housing starts, not seasonally adjusted (monthly housing units started since 1959)",
"hit": false
},
{
"line": "US Drought Monitor (University of Nebraska–Lincoln) — weekly drought severity statistics (percent of US area in each drought category since 2000)",
"hit": false
},
{
"line": "US Energy Information Administration — Weekly US retail gasoline prices (average pump price per gallon, weekly)",
"hit": false
},
{
"line": "US Energy Information Administration — weekly US regular gasoline retail price (average pump price per gallon since 1990)",
"hit": false
},
{
"line": "US NHTSA — Fatality Analysis Reporting System (FARS) (every fatal road crash in the US, countable per day)",
"hit": false
},
{
"line": "USDA National Agricultural Statistics Service — Milk Production report (monthly US milk output)",
"hit": false
}
]
},
{
"name": "GAPS",
"what": "Finds where a record breaks its own most common interval.",
"rooms": [
{
"room": "r06",
"material": "Billboard Hot 100 issue dates, 1958–2026",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "partly",
"first": [
"The weekly Billboard Hot 100 chart dates (a record that is supposed to appear every seven days).",
"Daily US Treasury \"Debt to the Penny\" (total public debt outstanding, published each business day).",
"A long daily weather-station temperature record (e.g. a GHCN-Daily station)."
],
"expected": "I expect a cadence of 7 days and almost no breaks, except for a handful of irregular steps (shorter than a week) where Billboard moved the weekday its issues are dated, most likely around 1962 when the dating changed from Mondays to Saturdays; I do not expect any real gaps.",
"showed": "The Hot 100 has kept its seven-day cadence for 3,559 consecutive intervals with exactly one exception: the chart dated Monday 1961-12-25 is followed by one dated Saturday 1962-01-06, twelve days later. That is the moment Billboard switched its issue dating from Mondays to Saturdays, which it has used ever since. I expected the weekday change and expected no real gaps, so the overall picture matched; what I did not expect is its form. I guessed the switch would show as a short, irregular step (moving Monday back to the preceding Saturday, two days early); instead Billboard moved forward, stretching one week to twelve days, so the record's only break is a gap rather than a short step. Across 68 years, no week was skipped, repeated or doubled anywhere else.",
"url": "https://github.com/mhollingshead/billboard-hot-100"
},
{
"room": "r08",
"material": "Billboard Hot 100 chart weeks, 1958–2026",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "met",
"first": [
"Billboard Hot 100 weekly chart dates (popular music charts)",
"NASA Astronomy Picture of the Day publication dates",
"Volcanic eruption records from the Smithsonian Global Volcanism Program"
],
"expected": "A cadence of 7 days kept almost everywhere, with a handful of irregular steps where Billboard moved the weekday the chart is dated (I recall a shift from Monday to Saturday dating around 1962), and possibly one or two gaps around holidays or missing issues in the archive.",
"showed": "The cadence is 7 days, and in 68 years and 3,560 charts it is broken only three times. The first is a 12-day gap from Monday 1961-12-25 to Saturday 1962-01-06: the moment Billboard moved the chart's dating from Mondays to Saturdays, which I expected, though I expected it as an \"irregular\" step rather than a gap. The other two I did not know: an 8-day gap followed by a 6-day irregular step around Sunday 1976-07-04, a single chart dated on the Bicentennial Independence Day instead of Saturday July 3, after which the record returns to its Saturday beat. There are no missing weeks at all, and no holiday gaps, so the record is more perfectly kept than I expected; its only departures are the one deliberate change of weekday and one patriotic exception.",
"url": "https://github.com/utdata/rwd-billboard-data"
},
{
"room": "r09",
"material": "Curiosity rover weather reports, by Earth date",
"own": "KIN",
"ownLabel": "kin on its shelf",
"met": "met",
"first": [
"Daily weather reports from the Curiosity rover on Mars (REMS instrument), dated by Earth date and by sol.",
"Bitcoin block timestamps (a ledger whose clock is allowed to run backwards).",
"The Central England Temperature daily series."
],
"expected": "I expect a cadence of 1 day with a steady sprinkle of 2-day \"gaps\" roughly every 36-37 rows, where an Earth date is skipped because a sol is longer than a day, plus a few longer gaps for solar conjunctions (about every 26 months) and rover safe modes; possibly some \"repeats\" where two sols carry the same Earth date.",
"showed": "GAPS found a cadence of 1 day, no unreadable times, no repeats or steps back, and 182 gaps, spread evenly along the line with a few wide red blocks: the largest are 31 days (after 2018-09-17), 24 days (after 2023-11-01), 16 days (after 2013-02-27), 15 days (after 2019-02-13) and 14 days (after 2021-12-20). Checking the gaps against the `sol` column afterwards, 127 of the 182 are two-day jumps between consecutive sols: no data are missing there, only an Earth date skipped because a sol is 40 minutes longer than a day. So two thirds of what the instrument calls breaks are the record's own Martian clock slipping past the Earth calendar; the remaining 55 are real silences (250 missing sols in all). That much I expected. What I did not expect is what the large gaps are not: the solar conjunctions (2013, 2015, 2017, 2019, 2021) mostly leave no wide gap, presumably because REMS kept measuring and the data were sent home later, so only the 2023 conjunction shows as a long silence. The longest silence, in September-October 2018, coincides instead with the rover's computer trouble and swap to its backup computer that autumn, and the 2013 one with the memory fault of February 2013 (my reading of the dates, not something the data state). Also no two sols ever share an Earth date, so the repeats I thought possible never happen: the date used is the one at local midday, which always […]",
"url": "https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json"
},
{
"room": "r11",
"material": "Publication dates of every xkcd comic",
"own": "OFF",
"ownLabel": "off its shelf",
"met": "partly",
"first": [
"The Central England Temperature daily series (Met Office Hadley Centre), daily mean temperature since 1772.",
"The US Treasury 10-year constant-maturity yield, daily (Federal Reserve H.15 / FRED series DGS10).",
"NASA's Astronomy Picture of the Day archive: the date of every picture since 1995."
],
"expected": "The commonest interval will be 2 days (Monday to Wednesday, Wednesday to Friday), so every Friday to Monday weekend will show as a 3-day \"gap\" and the line will be densely red throughout; on top of that I expect a burst of repeats in January 2006 (the old sketches all dated on one day), a handful of longer gaps of a week or two, and a few irregular one-day steps from extra or out-of-schedule comics such as April Fools' interactives.",
"showed": "Cadence 2 days; 1098 gaps, 46 repeats, 40 irregular steps, no steps back and no unreadable dates. As expected the line is red from end to end, because every Friday-to-Monday weekend is a 3-day \"gap\" against a 2-day cadence, and the 44 back-catalogue sketches all dated 1 January 2006 make a blue knot at the very start. What I did not expect is how short the longest break is: in twenty years and over 3300 comics the largest gap is 5 days (Wednesday 30 March to Monday 4 April 2016, a single skipped Friday, April Fools' Day), and the next ones are only 4 days, almost all of them a Thursday comic followed by the normal Monday. There is no week off, no holiday, no illness visible anywhere; there are no steps back, so comic numbers never once ran against the calendar. The grey irregular marks are the opposite of absence: clusters of daily comics (the weeks of 15 August 2006, 28 October 2008, 5 May 2009 and 23 November 2010) and single comics moved a day to meet news, such as Gravitational Waves on Thursday 11 February 2016. The record breaks its cadence over a thousand times, but nearly every break is the weekend; the promise itself was almost never broken.",
"url": "https://xkcd.com/archive/"
}
],
"shelf": [
{
"line": "Billboard / public Hot 100 archives on GitHub — weekly Hot 100 charts since 1958 (chart dates and positions)",
"hit": true
},
{
"line": "Billboard via Kaggle / data.world — Hot 100 weekly charts (chart dates and rankings of the weekly US singles chart since 1958)",
"hit": false
},
{
"line": "City of Chicago Data Portal — Crimes 2001 to present (date and time of every reported crime incident)",
"hit": false
},
{
"line": "European Central Bank — Euro foreign exchange reference rates (daily euro rates on TARGET business days since 1999)",
"hit": false
},
{
"line": "European Central Bank — Euro foreign exchange reference rates (daily rates published on TARGET working days since 1999)",
"hit": false
},
{
"line": "Federal Register (federalregister.gov API) — Federal Register documents by publication date (daily issues of US federal rules and notices)",
"hit": false
},
{
"line": "Federal Register / GovInfo — Federal Register daily issues (publication date of every issue and document)",
"hit": false
},
{
"line": "Federal Reserve Bank of St. Louis (FRED) — DGS10 10-year Treasury constant maturity yield (daily US government bond yields on market days)",
"hit": false
},
{
"line": "Federal Reserve Bank of St. Louis, FRED — 10-Year Treasury Constant Maturity Rate, DGS10 (daily yields on business days)",
"hit": false
},
{
"line": "Hacker News — official Firebase API / BigQuery public dataset (creation time of every story and comment)",
"hit": false
},
{
"line": "Internet Archive — Wayback Machine CDX API (capture timestamps for a single URL)",
"hit": false
},
{
"line": "Internet Archive — Wayback Machine CDX API (capture timestamps of every archived snapshot of a given URL)",
"hit": false
},
{
"line": "Jonathan McDowell — GCAT General Catalog of Artificial Space Objects, launch list (dates and times of every orbital launch attempt)",
"hit": false
},
{
"line": "Linux kernel (kernel.org git) — commit log of torvalds/linux (author and commit timestamps of every change to the kernel)",
"hit": false
},
{
"line": "Linux kernel (kernel.org) — git commit history (author and commit timestamps of every commit)",
"hit": false
},
{
"line": "Met Office Hadley Centre — HadCET Central England Temperature (daily mean temperature since 1772, monthly since 1659)",
"hit": false
},
{
"line": "Met Office Hadley Centre — HadCET Central England Temperature daily series (daily mean temperature in central England since 1772)",
"hit": false
},
{
"line": "NASA PDS / JPL — Mars Science Laboratory, Curiosity raw image index (acquisition time of every image, by sol)",
"hit": true
},
{
"line": "NOAA NCEI — Global Historical Climatology Network Daily (daily air temperature and precipitation readings from weather stations, some going back to the 1800s)",
"hit": false
},
{
"line": "NOAA NCEI — Global Historical Climatology Network Daily (daily temperature and precipitation at individual land weather stations)",
"hit": false
},
{
"line": "NOAA National Hurricane Center — HURDAT2 Atlantic best track (6-hourly positions and intensities of tropical cyclones, with extra fixes added at landfall)",
"hit": false
},
{
"line": "NOAA National Hurricane Center — HURDAT2 Atlantic best track (six-hourly positions and intensities of every tropical cyclone, with extra off-cadence landfall entries)",
"hit": false
},
{
"line": "NYC Taxi and Limousine Commission — TLC trip record data (pickup and dropoff timestamps of individual taxi trips)",
"hit": false
},
{
"line": "NYC Taxi and Limousine Commission — Trip Record Data (pickup and dropoff timestamps of every yellow cab trip)",
"hit": false
},
{
"line": "Old Bailey Proceedings Online — sessions papers (dates of trial sessions at London's Central Criminal Court, 1674–1913)",
"hit": false
},
{
"line": "Old Bailey Proceedings Online — trial records 1674–1913 (dates of court sessions and the trials held in them)",
"hit": false
},
{
"line": "OpenSky Network — historical state vectors (timestamped aircraft position reports)",
"hit": false
},
{
"line": "Project Gutenberg — catalog metadata (release dates by ebook number)",
"hit": false
},
{
"line": "Python Software Foundation — CPython release history (release date of every version)",
"hit": false
},
{
"line": "Smithsonian Global Volcanism Program — Holocene eruption database (start dates of known volcanic eruptions worldwide)",
"hit": false
},
{
"line": "Smithsonian Global Volcanism Program — Volcanoes of the World eruption database (start and end dates of Holocene eruptions)",
"hit": false
},
{
"line": "Stack Exchange — public data dump, Posts table (creation timestamps of every question and answer on a site)",
"hit": false
},
{
"line": "Supreme Court Database (Washington University) — case-centered data (decision date of every US Supreme Court case since 1791)",
"hit": false
},
{
"line": "UK Parliament — Hansard sitting days (dates on which the House of Commons sat and debates were recorded)",
"hit": false
},
{
"line": "US Bureau of Labor Statistics — CPI-U monthly series CUUR0000SA0 (monthly consumer price index, including months skipped during government shutdowns)",
"hit": false
},
{
"line": "US Bureau of Labor Statistics — Consumer Price Index, CPI-U series (monthly price index, including months missed during government shutdowns)",
"hit": false
},
{
"line": "US Treasury Fiscal Data — Daily Treasury Statement (daily federal government cash and debt operations)",
"hit": false
},
{
"line": "Voteview (UCLA) — US Congress roll call votes (date and result of every recorded vote in the House and Senate)",
"hit": false
},
{
"line": "Voteview (UCLA) — US Congress roll-call votes (date and time of every recorded vote in the House and Senate)",
"hit": false
},
{
"line": "Washington University Law — Supreme Court Database (decision dates of US Supreme Court cases since 1791)",
"hit": false
}
]
},
{
"name": "FIRST DIGITS",
"what": "Sets a column's first digits beside Benford's law.",
"rooms": [
{
"room": "r02",
"material": "Diameters of 139,688 asteroids (JPL)",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "met",
"first": [
"Populations of municipalities or towns in a country's census",
"Fundraising goals of crowdfunding projects (e.g. Kickstarter)",
"Diameters of asteroids (minor planets)"
],
"expected": "I expect the digits to fall roughly along Benford but not closely: because most measured asteroids are a few kilometres across (between about 1 and 10 km, with the survey's detection limit cutting off the small end), I expect too many 2s, 3s and 4s and too few 1s compared with Benford, and a large chi-square given ~140,000 numbers.",
"showed": "The diameters do not follow Benford's law. The first digit 1 makes up only 14.6% of them, against 30.1% expected. Digits 2 and 3 are the most common (21.4% and 21.2%), 4 and 5 are also above Benford, and 6 through 9 fall away below it. The shape is a hump around 2 to 3 rather than a decreasing curve. The cause is that the numbers barely cross orders of magnitude: 92% of these bodies are between 1 and 10 km across, and the median is about 4 km. So the first digit mostly reflects a single size distribution, cut off at the small end where the infrared surveys stop detecting objects of about 1 to 2 km, and Benford's scale-spanning assumption does not hold. This is the direction I expected: too few 1s, too many 2s to 4s, and a huge chi-square. What I did not expect was how strong the effect was. The 1s fall to half their Benford share, and 2 and 3 tie as the most common digit.",
"url": "https://ssd-api.jpl.nasa.gov/sbdb_query.api"
},
{
"room": "r03",
"material": "Defra payments over £25,000, 2025",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "met",
"first": [
"Populations of municipalities in a country (e.g. German Gemeinden from Destatis).",
"Government spending transactions published under a transparency rule (e.g. UK departments' \"spend over £25,000\" files).",
"Prices of items in an open product database (e.g. Open Food Facts or a museum's acquisition prices)."
],
"expected": "Because nothing under £25,000 is published, the band 10,000–24,999 that normally supplies many 1s and 2s is missing, so I expect digit 1 to fall well below Benford's 30.1% and digits 2–4 to be over-represented, with a large chi-square. Digit 2 may be especially inflated by the many payments just above £25,000.",
"showed": "The first digit 1 falls to 22.4% against Benford's 30.1%, and the shortfall is taken up mostly by 3 (16.9% vs 12.5%) and 4 (12.1% vs 9.7%), with 5 also above; 7, 8 and 9 sit slightly below. That the 1s collapse was what I expected from the £25,000 cut, which removes the 10,000–24,999 band. What I did not expect is that 2 is barely raised (18.3% vs 17.6%): the payments just above the threshold do not pile up the way I guessed (25,000–29,999 holds only 9.9% of amounts), and the excess sits instead in the 30,000s and 40,000s. The register is unmistakably non-Benford (chi-square 666), but the deviation is a clean signature of the publication rule rather than of anything in the payments themselves.",
"url": "https://www.gov.uk/government/collections/defra-departmental-spending-over-25000"
},
{
"room": "r07",
"material": "Prices paid for houses, England and Wales",
"own": "OFF",
"ownLabel": "off its shelf",
"met": "partly",
"first": [
"Populations of the world's cities and towns (e.g. GeoNames cities file)",
"Areas of the world's lakes (e.g. HydroLAKES)",
"Prices paid for houses (e.g. HM Land Registry Price Paid Data, England and Wales)"
],
"expected": "Prices cluster between about £100,000 and £500,000, so I expect far too many 1s, 2s and 3s and far too few 5s to 9s compared with Benford, with a large chi-square; the digit 2 may even rival or beat 1.",
"showed": "All 86,284 prices were read. The first digits are far from Benford (chi-square 10,363 with 8 df, mean absolute deviation 0.035): 2 is the most common first digit (25.6%, Benford 17.6%), narrowly ahead of 1 (24.6%, which is *below* Benford's 30.1%), and 3 is in clear excess (18.6% against 12.5%); from 5 upward every digit is under-represented, 9 at about half its expected share. This is roughly what I expected: the prices live mostly within one decade (median £290,000), so the digits of that decade's bulk, 2 and 3, take over. What I had not quite anticipated is that 1 actually falls short of Benford even though the counts of all digits from 1 to 4 are inflated as a group; the shape is a hump over 2 rather than a steeper Benford curve.",
"url": "https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads"
},
{
"room": "r12",
"material": "Diameters of 139,688 asteroids (JPL)",
"own": "SAME",
"ownLabel": "on its shelf",
"met": "met",
"first": [
"Populations of the world's municipalities or towns (a census gazetteer).",
"Nameplate capacities of the world's power plants (Global Power Plant Database).",
"Diameters of asteroids (the JPL Small-Body Database)."
],
"expected": "Diameters run from tens of metres to ~940 km, so I expect a roughly Benford-shaped fall from 1 to 9, but with a distortion: the bulk of measured asteroids lie in a narrow band of a few kilometres (set by the survey's sensitivity), so I expect the digits 2-5 to be over-represented and 1 under-represented, with a large chi-square given ~140,000 values.",
"showed": "Asteroid diameters do not follow Benford's law, and they miss it in the way I expected but more strongly: the digit 1 leads only 14.6% of the sizes instead of Benford's 30.1%, while 2 and 3 lead about 21% each (against 17.6% and 12.5%), 4 and 5 are also too common, and 6 to 9 too rare. The bars rise to a hump at 2-3 and then fall faster than Benford, so the mean absolute deviation is 0.049 and the chi-square is about 32,400 on 8 df. The reason is that the measured population is not spread evenly over the orders of magnitude it spans: most diameters come from an infrared survey whose detection limit puts the bulk of objects between roughly 2 and 5 km, so the first digit reports the shape of one survey's sensitivity rather than the scale-free size distribution of the asteroids themselves. What surprised me was how far the digit 1 drops: I expected an under-representation, not a halving.",
"url": "https://ssd-api.jpl.nasa.gov/sbdb_query.api"
}
],
"shelf": [
{
"line": "City of Chicago Data Portal — Employee salaries (annual salary of each city employee)",
"hit": false
},
{
"line": "City of Chicago Data Portal — Employee salaries (annual salary or hourly rate of every city employee)",
"hit": false
},
{
"line": "Companies House (UK) — Accounts bulk data (reported balance-sheet figures of registered companies)",
"hit": false
},
{
"line": "Eurostat — NUTS 3 regional statistics (population, GDP, and area of European regions)",
"hit": false
},
{
"line": "FAOSTAT — Crop production (tonnes harvested and area harvested per crop, country and year)",
"hit": false
},
{
"line": "GBIF — Species occurrence downloads (individual counts reported in biodiversity observations)",
"hit": false
},
{
"line": "GeoNames — allCountries / cities1000 gazetteer (population and elevation of named places worldwide)",
"hit": false
},
{
"line": "GitHub Archive / Software Heritage — Repository metadata (file sizes, star counts, and commit counts of public repositories)",
"hit": false
},
{
"line": "Global Biodiversity / IUCN-adjacent: Lake and reservoir HydroLAKES (HydroSHEDS) — Surface area and volume of every mapped lake on Earth",
"hit": false
},
{
"line": "Global Biodiversity Information Facility (GBIF) — Species occurrence counts (number of recorded observations per species)",
"hit": false
},
{
"line": "Global Power Plant Database (WRI) — Power plants of the world (installed capacity in MW of each plant)",
"hit": false
},
{
"line": "Hipparcos / Gaia DR3 (ESA) — Stellar catalogue (parallax-derived distances and luminosities of stars)",
"hit": false
},
{
"line": "IMDb — Non-commercial datasets (number of votes received by each title)",
"hit": false
},
{
"line": "Kaggle mirror of Steam / SteamSpy — Game catalogue (owner counts, prices, and playtime of games on Steam)",
"hit": false
},
{
"line": "NASA JPL Small-Body Database — Asteroid and comet orbital elements (diameter, semi-major axis, and orbital period of minor bodies)",
"hit": true
},
{
"line": "NASA JPL — Small-Body Database (orbital elements, diameters and absolute magnitudes of asteroids and comets)",
"hit": false
},
{
"line": "NYC Taxi and Limousine Commission — Trip record data (fare amount, trip distance, and tip of every yellow-cab trip)",
"hit": false
},
{
"line": "NYC Taxi and Limousine Commission — Trip record data (fare amounts and trip distances of each ride)",
"hit": false
},
{
"line": "Nasdaq / Yahoo Finance historical data — Daily trading volume of listed stocks (shares traded per day)",
"hit": false
},
{
"line": "Natural Earth — Admin-0 and Admin-1 boundaries (land area and population attributes of countries and provinces)",
"hit": false
},
{
"line": "OpenStreetMap / Geofabrik — Building and road extracts (lengths and areas of mapped features)",
"hit": false
},
{
"line": "OpenStreetMap / Natural Earth — Populated places (population figures attached to cities and towns)",
"hit": false
},
{
"line": "Project Gutenberg — Catalogue and texts (word counts and file sizes of public-domain books)",
"hit": false
},
{
"line": "SEC EDGAR — Financial Statement Data Sets (line-item values reported in company 10-K and 10-Q filings)",
"hit": false
},
{
"line": "Software Heritage / Debian — Package archive metadata (installed sizes in bytes of each Debian package)",
"hit": false
},
{
"line": "The Metropolitan Museum of Art — Open Access collection (object dimensions and accession data of artworks)",
"hit": false
},
{
"line": "U.S. Census Bureau — County and city population estimates (resident population of every U.S. county and incorporated place, by year)",
"hit": false
},
{
"line": "U.S. Federal Election Commission — Individual contributions file (the amount of each itemized donation to federal campaigns)",
"hit": false
},
{
"line": "U.S. SEC — Financial Statement Data Sets (numeric values from XBRL filings of listed companies)",
"hit": false
},
{
"line": "UK HM Treasury / government departments — Spending over £25,000 (amount of each departmental payment to suppliers)",
"hit": true
},
{
"line": "UN Comtrade — International merchandise trade (export and import values by country pair and commodity)",
"hit": false
},
{
"line": "UN Comtrade — International merchandise trade (value in US dollars of goods traded between pairs of countries)",
"hit": false
},
{
"line": "US Bureau of Transportation Statistics — Airline On-Time Performance (departure delays and flight distances of domestic flights)",
"hit": false
},
{
"line": "US Census Bureau — County and city population estimates (resident population of every US county and incorporated place)",
"hit": false
},
{
"line": "US Federal Election Commission — Individual contributions bulk data (amount of each itemized donation to federal campaigns)",
"hit": false
},
{
"line": "USAspending.gov — Federal award transactions (dollar amount of every federal contract and grant obligation)",
"hit": false
},
{
"line": "USAspending.gov — Federal contract and grant awards (dollar value of each award)",
"hit": false
},
{
"line": "USGS / GNIS — Geographic Names Information System (named lakes, summits and streams, with elevations and areas)",
"hit": false
},
{
"line": "World Bank — World Development Indicators (GDP, population, and other national figures per country and year)",
"hit": false
},
{
"line": "World Bank — World Development Indicators (GDP, population, land area and hundreds of other national figures per country and year)",
"hit": false
}
]
}
],
"text": "<h3>What happened</h3>\n<p>Before any maker ran, two agents per instrument, with no tools, named the 20 datasets they would run it on (<code>shelf/</code>). The makers then had the web and the whole world, a list of the 36 domains this line has used to avoid, and the instrument. A blind coder, who did not know which shelf belonged to which instrument, placed every choice on every shelf.</p>\n<p><strong>10 of the 12 makers with a real instrument chose from that instrument's own shelf, and none from either of the other two.</strong> CYCLES 4 of 4, GAPS 3 of 4, FIRST DIGITS 3 of 4. Each instrument's four makers also shared a thought before searching: all four CYCLES makers listed Melbourne's pedestrian counts among their first three, and all four FIRST DIGITS makers listed town populations. Two pairs chose the same dataset without meeting: the Billboard Hot 100's dates (GAPS) and the asteroid diameters of the JPL Small-Body Database (FIRST DIGITS). Two CYCLES makers took New York's 311 noise complaints. Only 4 of 16 choices lie on the general shelf of experiment 28.</p>\n<p>The FIRST DIGITS makers who refused the textbook case did so in words: <em>\"town populations are the textbook Benford case (little to learn)\"</em> (r12). Then they took the next line of the same shelf. Asked for something they did not already know, no maker's expectation was contradicted. Seven were met in full and nine in part. The PLOT makers wrote out whole histories of their curves before drawing them: the 2008 gasoline peak, the 17 % Bank Rate of 1979.</p>\n<p>What the makers did not know came in at the level of detail, inside a frame they had chosen because they knew it. The noise complaints beat to the week more strongly than to the year. A Hot 100 chart was dated on the Fourth of July 1976. Cambridge's measles kept a two-year rhythm, and xkcd's longest break in twenty years is five days. Two GAPS makers chose material where the instrument's own norm would misfire: a rover whose sol is longer than the Earth day it is dated by, and a comic with no Friday-to-Monday cadence. They chose to watch the old tool err.</p>\n<h3>Predictions (fixed before any agent ran)</h3>\n<table>\n<tr><th></th><th>claim</th><th>result</th></tr>\n<tr><td>P1</td><td>≥ 8 of 12 choose from their own instrument's shelf</td><td>10 · held</td></tr>\n<tr><td>P2</td><td>own-shelf hits exceed hits on each other instrument's shelf, per arm</td><td>4–0–0, 3–0–0, 3–0–0 · held</td></tr>\n<tr><td>P3</td><td>≤ 4 of 16 on experiment 28's general shelf</td><td>4 · held</td></tr>\n<tr><td>P4</td><td>≥ 10 of 16 expectations MET</td><td>7 met, 9 partly, 0 not · failed</td></tr>\n<tr><td>P5</td><td>≥ 12 of 16 choose one of their own first three</td><td>15 · held</td></tr>\n<tr><td>P6</td><td>≥ 3 of 4 FIRST DIGITS choices are counts of people, areas or money</td><td>2 · failed</td></tr>\n<tr><td>P7</td><td>≥ 14 of 16 rooms re-fetchable or row-matched</td><td>16 · held</td></tr>\n<tr><td>S142.SHELF</td><td>a list moves choosing onto one shared second shelf (scaled to 16)</td><td>13 items, no item in more than 4 first threes · falsified by its letter</td></tr>\n</table>\n"
};
