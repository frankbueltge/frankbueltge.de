# The Nines

![Wave height at buoy 46026 through 2024, with the nines left out, and below it which columns of the file hold a measurement day by day; a red line at 4 February 22:50 marks the last wind reading](figure.svg)

**Experiment 29 of the project. Operation: erring (with judging).** [Open the face](index.html).

Buoy 46026 is moored 18 nautical miles west of San Francisco. Its 2024 archive file writes runs of nines wherever
nothing was measured: "a variable number of 9's are used to denote missing data in the Historical files" (NDBC).
32,286 of its 49,309 wave heights read 99.00 m. The highest measured wave is 6.94 m. On 4 February at 22:50 UTC,
at the month's lowest pressure (989.4 hPa), the file records its last wind. Then it records nothing for 47 hours,
and after that only nines for wind and pressure until the end of the year.

Twelve fresh machine makers got the file, a viewer and no web, each in a room of its own. Six (P) were asked to
make a work. Six (E) were also told to make it from a wrong reading chosen on purpose. Before any maker ran, four
fresh agents without tools each listed 25 wrong readings they would reach for: the shelf. A blind coder matched
the E makers' readings to the shelf and read all twelve notes.

**What happened.** All six P makers left the nines out and said so. Five made the record's own failure part of
the form: the wind ends at 22:50 in a storm. Two of those works are titled *After the Wind*, a third *After 22:50*.
Of the E makers, two read the nines as values: a 99 m/s wind blowing for eleven months, air at 999 °C. Both readings
stand word for word on the shelf, and every one of the four lists holds one. Three let the moored buoy travel on
its own waves. The coder found no shelf line for two of these. Two of them, working apart, drew the same spiral into
the South Pole, about 545,000 km long. One E maker in six found 22:50. Three of seven predictions held. The four that
failed are the result.

**Sources.** NDBC, station 46026, standard meteorological data 2024,
<https://www.ndbc.noaa.gov/data/historical/stdmet/46026h2024.txt.gz> (US Government, public domain; SHA-256 in
`sources/MANIFEST.json`). NDBC, *Measurement Descriptions and Units*, <https://www.ndbc.noaa.gov/faq/measdes.shtml>.
Station page, <https://www.ndbc.noaa.gov/station_page.php?station=46026>. *Cartography, not Tracing*
(`n-1/foundation/cartography-not-tracing.en.md`), on Deleuze and Guattari, *A Thousand Plateaus*, trans. Massumi,
1987, pp. 12–13 and 378, as that text cites them. Evidence: `PREDICTIONS.md`, `shelf/`, `rooms/`, `reports/`,
`coder/`, `score.py`, `results.json`.

## What this taught the project

A machine maker asked to err looks for its errors in what it already holds, and the material's own error is
already held there. Of the six readings, two came off the family's shelf, two more were close relatives, and the two
the coder could not place were both mistakes about what a moored buoy is. The maker that took the record's real error ("missing values read as
values") was doing what *Cartography, not Tracing* calls tracing: an "alleged competence", the "artificial
stammerings" copied from a model (ATP 12–13, 378). Contact with the real came from the makers who were not asked
to err. They applied the publisher's norm, and that norm let them see where the record broke: a sensor going quiet
in a storm. That break is a difference no one had yet called an error, the line's epistemic thing. So for this
family, a commission to err is a commission to retrieve. Close reading under a held norm is what met the material's
failure. A machine practice that wants error as method should not ask its makers for errors. It should give them
a record whose norm is written down and watch where the norm runs out.
