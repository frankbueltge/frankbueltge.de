"""Write index.html from template.html, data.json and the texts below. Run after build_data.py: python3 -I build.py"""
import json
D = json.load(open("data.json")); S = D["summary"]; R = {r["des"]: r for r in D["rows"]}
D["written"] = json.load(open("written.json")); WS = D["written"]["summary"]; WB = D["written"]["by_strike"]
def k(n): return f"{round(n / 1000) * 1000:,}"
def hm(h): m = round(h * 60); return f"{m // 60} h {m % 60:02d} min"
T = {
 "lede": (f"Since 2008 the record has known, {S['impacts']} times, the minute and the place a small asteroid would strike: "
          f"from {hm(S['held_h_min'])} to {hm(S['held_h_max'])} ahead. Each was under ten metres across and burst high in the air; none hurt anyone. "
          f"The record of each names the object, the survey that found it, the hour and the point. It does not count who was beneath. "
          f"This work does, as an estimate: {S['on_land_or_coast']} of the {S['impacts']} came down within 50 km of people, "
          f"about {k(S['residents_total'])} of them, and every one of those {S['dark_and_inhabited']} came in the dark. "
          f"Press play and sit through the hours the warning was held, while the people it was held over appear. "
          f"Then the people fade, and the keeper's own account of each strike writes the ones it knows of. Across the {S['on_land_or_coast']} strikes near people it writes "
          f"{WS['written_inhabited']} of them, read at the smallest its words allow, and every one as someone who watched."),
 "written": (f"Each row puts two numbers about one strike on one scale. The dot is this work's estimate of the people within 50 km. The square is the number of people "
             f"the keeper's own page for that strike writes (the European Space Agency's NEO Coordination Centre, which keeps one page per strike), "
             f"read at the smallest number its words allow: over 150 is 150, dozens is 24, several is 3. Over the {S['on_land_or_coast']} strikes near people the pages write "
             f"{WS['written_inhabited']} people against about {k(WS['residents_total'])}. Every one is written as a witness: a report, a sighting, a pilot. "
             f"Berlin's page writes dozens of people, and it is the only page of the thirteen to write that anyone was told beforehand; they had been alerted so that they could watch. "
             f"The reports are not confined to the circle (Ontario's came from Canada and the USA), so a square is not a share of its dot: it is what the record holds where the dot is missing. "
             f"The three strikes with the most people beneath are also three the sky's sensors did not keep: by the Field's study 12, the government sensor record of bright fireballs "
             f"holds {WS['sensors_kept']} of the {WS['pages']}, none of them Berlin, Normandy or Ontario. Click a row to sit through it."),
 "held": (f"Each bar is the time between the first sighting and the strike. Its thickness is the estimated number of people within 50 km. "
          f"The three thick bars are the short ones: Berlin was held {hm(R['2024 BX1']['held_h'])}, southern Ontario {hm(R['2022 WJ1']['held_h'])}, "
          f"Normandy {hm(R['2023 CX1']['held_h'])}. Multiplied out, the warnings were held over about {k(S['person_hours_total'])} person-hours. "
          f"How many of those people were told is the datum this work could not find anywhere. Click a bar to sit through it."),
 "clock": (f"The Field's study 11, <i>Seen coming</i>, counts how many days ahead the record held every asteroid that passed inside the Moon's distance "
           f"between 2015 and 2025: {S['field_clock_total']:,} passages within thirty days either side. {S['field_clock_after']} were first held after they had passed, "
           f"{S['field_clock_day0']} on the day itself, {S['field_clock_warned_ge1']} a day or more ahead. The {S['impacts']} that struck are not in those bars "
           f"(they have no close-approach row); written above them by the same whole-day rule, {S['impacts_field_day0']} sit on day 0 and {S['impacts_field_day1']} on day 1. "
           f"Every warning that came true was shorter than one day. The bars are the Field's, taken unchanged from its results file."),
 "method": [
  "<b>The impacts:</b> the encyclopedia's <a href='https://en.wikipedia.org/wiki/List_of_predicted_asteroid_impacts_on_Earth'>list of predicted asteroid impacts</a>, which follows NASA/JPL CNEOS's pre-impact detections, read for discovery time, survey, impact time and point (to 0.1°). For six of them the point agrees with <a href='https://ssd-api.jpl.nasa.gov/fireball.api'>JPL's fireball record</a> to within 0.4°; the other seven have no located entry there. The point is where the object burst in the air, not where fragments fell. <i>2026 JN4</i> is listed with its impact unconfirmed.",
  "<b>The people:</b> <a href='https://www.worldpop.org/'>WorldPop</a>'s 2020 unconstrained population grid, summed by its public zonal-statistics service over a 64-sided 50 km disc around each point. This is an <b>estimate</b>: a 2020 grid for events from 2008 to 2026, a disc chosen by this work, a point given to a tenth of a degree. The disc is not a danger zone; at these sizes no one beneath was in danger. It is the neighbourhood of the hour the record named.",
  "<b>The dark:</b> the sun's altitude at the listed point and minute, by a standard low-precision formula; dark means more than 6° below the horizon. The shading on the globe is the night at that minute.",
  "<b>What the work does not claim:</b> that no one was told. Agencies and astronomers posted some warnings before some impacts (for one, <a href='https://earthsky.org/space/small-asteroid-to-hit-earths-atmosphere-over-siberia-russia-dec-3-2024/'>a public notice ahead of 2024 XA1</a>). What the work found is that no record it read counts who beneath received one; the count of people is its own estimate, made to stand where that count is missing.",
  "<b>The keeper's account</b> (added 2026-10-14): one page per strike at <a href='https://neo.ssa.esa.int/past-impactors/2024bx1'>ESA's NEO Coordination Centre</a> (thirteen pages, fetched 2026-10-14, SHA-256 in <code>raw-manifest-written.json</code>). This work reads each for the people it writes as seeing, filming or reporting the fireball, and counts them at the smallest number its words allow (<code>build_written.py</code> holds the rule and every sentence used; each sentence is checked to be a literal substring of the page as fetched). A report counts as one person; a camera does not count. The reading agrees with the Atelier's two blind readings of the same pages on which pages write anyone at all, 13 of 13. It is a reading, not a census of who saw.",
  "<b>The sensors</b> (added 2026-10-14): whether JPL's fireball record holds each strike, and its energy, are taken unchanged from the Field's study 12, <i>The strikes that came</i>, at a pinned commit.",
  "<b>Sound:</b> a low drone while the warning is held (a little higher the more people are beneath), a tick for each held hour, a soft thump at the strike, then a chime for each person the keeper's page writes (above sixty people, one chime for every second or third). One held hour is 0.6 seconds.",
  "<b>Reproduce:</b> <code>python3 -I fetch.py && python3 -I build_data.py && python3 -I build.py && node verify_browser.mjs</code>. Every fetched file's SHA-256 is in <code>raw-manifest.json</code>.",
 ],
 "neigh": [
  "<b>Stan's Cafe, <i>Of All the People in All the World</i></b> (Atlas). There a grain of rice stands for each person in a statistic someone already took. Here the people were never counted: the dots are this work's estimate, standing in for a number the record of a predicted impact does not hold, and they appear only for as long as the warning was held.",
  "<b>Mimi Onuoha, <i>Missing Datasets</i></b> (Atlas). There the uncollected datasets are listed. Here one missing count is not listed but estimated and made to arrive in time, beside the record that could have taken it: the minute was known, the people were not asked about.",
  "<b>The Field, study 11, <i>Seen coming</i></b>: built on. Its warning clock is the second figure, taken unchanged; this work adds the thirteen warnings that came true and asks the one thing its clock cannot: who was under them.",
  "<b>The Field, study 12, <i>The strikes that came</i></b>: built on. Whether the sensors kept each strike is its finding, taken unchanged. It counts the warnings among the fireballs; this work counts the people among the warnings.",
  "<b>The Atelier, <i>The Exercise</i></b> (convening, 2026-10-14): answered and built on. It found, in two blind readings, that the keeper's pages write the people on the ground only as witnesses; this work reads the same pages again with its own rule, counts those witnesses, and sets the count beside the people beneath. Where the Atelier's visitor tries to claim a prevention and is refused, this work's visitor hears the record speak its few after the many have faded.",
  "<b>The Atelier, <i>Nobody's Minute</i></b> (convening pilot): there the credit for a prevented catastrophe goes to whoever tells it afterwards. Here nothing was prevented and nothing needed to be; the question is who the record was kept for, while it was being kept.",
 ],
}
html = open("template.html").read().replace("/*DATA*/null", json.dumps(D, ensure_ascii=False)).replace("/*TEXTS*/null", json.dumps(T, ensure_ascii=False))
open("index.html", "w").write(html); print("index.html", len(html))
