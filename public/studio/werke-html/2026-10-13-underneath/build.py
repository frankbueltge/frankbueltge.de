"""Write index.html from template.html, data.json and the texts below. Run after build_data.py: python3 -I build.py"""
import json
D = json.load(open("data.json")); S = D["summary"]; R = {r["des"]: r for r in D["rows"]}
def k(n): return f"{round(n / 1000) * 1000:,}"
def hm(h): m = round(h * 60); return f"{m // 60} h {m % 60:02d} min"
T = {
 "lede": (f"Since 2008 the record has known, {S['impacts']} times, the minute and the place a small asteroid would strike: "
          f"from {hm(S['held_h_min'])} to {hm(S['held_h_max'])} ahead. Each was under ten metres across and burst high in the air; none hurt anyone. "
          f"The record of each names the object, the survey that found it, the hour and the point. It does not count who was beneath. "
          f"This work does, as an estimate: {S['on_land_or_coast']} of the {S['impacts']} came down within 50 km of people, "
          f"about {k(S['residents_total'])} of them, and every one of those {S['dark_and_inhabited']} came in the dark. "
          f"Press play and sit through the hours the warning was held, while the people it was held over appear."),
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
  "<b>Sound:</b> a low drone while the warning is held (a little higher the more people are beneath), a tick for each held hour, a soft thump at the strike. One held hour is 0.6 seconds.",
  "<b>Reproduce:</b> <code>python3 -I fetch.py && python3 -I build_data.py && python3 -I build.py && node verify_browser.mjs</code>. Every fetched file's SHA-256 is in <code>raw-manifest.json</code>.",
 ],
 "neigh": [
  "<b>Stan's Cafe, <i>Of All the People in All the World</i></b> (Atlas). There a grain of rice stands for each person in a statistic someone already took. Here the people were never counted: the dots are this work's estimate, standing in for a number the record of a predicted impact does not hold, and they appear only for as long as the warning was held.",
  "<b>Mimi Onuoha, <i>Missing Datasets</i></b> (Atlas). There the uncollected datasets are listed. Here one missing count is not listed but estimated and made to arrive in time, beside the record that could have taken it: the minute was known, the people were not asked about.",
  "<b>The Field, study 11, <i>Seen coming</i></b>: built on. Its warning clock is the second figure, taken unchanged; this work adds the thirteen warnings that came true and asks the one thing its clock cannot: who was under them.",
  "<b>The Atelier, <i>Nobody's Minute</i></b> (convening pilot): there the credit for a prevented catastrophe goes to whoever tells it afterwards. Here nothing was prevented and nothing needed to be; the question is who the record was kept for, while it was being kept.",
 ],
}
html = open("template.html").read().replace("/*DATA*/null", json.dumps(D, ensure_ascii=False)).replace("/*TEXTS*/null", json.dumps(T, ensure_ascii=False))
open("index.html", "w").write(html); print("index.html", len(html))
