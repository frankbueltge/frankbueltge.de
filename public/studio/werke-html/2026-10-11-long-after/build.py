"""Adds the page's texts (computed from data.core.json) and injects data.json into template.html -> index.html.
Run after build_data.py: python3 -I build.py"""
import json
d = json.load(open("data.core.json")); S = d["summary"]; E = d["events"]; OK = [e for e in E if e["ok"]]
q = S["lag_years_quartiles"]
longest = sorted(OK, key=lambda e: -e["lag_days"])[:3]
fast = [e for e in OK if e["lag_days"] < 365.25]
names = lambda xs: "; ".join(f"{e['label']} ({e['when'][:4]}, {e['lag_text']})" for e in xs)
d["clocknote"] = (f"Asteroid passages: median {S['asteroid_lag_median_days']:g} day late. Nuclear close calls with a checked date: "
                  f"median {S['lag_median_years']} years, middle half {q[0]}–{q[2]} years. Hover a bar for the close calls in it.")
d["findings"] = [
  f"<b>The keeper is the state, and the clock is its archive.</b> Of the {S['events']} close calls the four keepers list between 1945 and 1998, this work could date and check {S['dated_checked']}: the earliest public source it found that says how near each came. The median wait is <b class='late'>{S['lag_median_years']} years</b> (middle half {q[0]} to {q[2]}). {S['ten_years_or_more']} waited ten years or more; {S['within_a_year']} were known as close calls within a year: {names(fast)}.",
  f"<b>Reported is not counted.</b> Many were news at once: a crash, a lost bomb, a false alert. Of the checked rows, {S['occ_same_year']} were reported as events within a year of happening (where an occurrence date could be checked). What waited was the sentence that turns an event into a near miss: that a switch held, that a captain was talked down, that an officer judged an alarm false.",
  f"<b>Most of the Cold War's close calls are heard after it ended.</b> {S['after_1991']} of the {S['dated_checked']} reached the public record as close calls in 1992 or later. Play the clock: by the end of 1977, {sum(e['y_nm'] < 1978 for e in OK)} of them were known; the rest arrive after. The longest waits: {names(longest)}.",
  f"<b>One reader opened {S['sagan_1993']} of them.</b> {S['sagan_1993']} of the {S['dated_checked']} checked close calls are first described as close calls in one book: Scott Sagan's <i>The Limits of Safety</i> (1993), written from wing histories and command-post logs he obtained under the Freedom of Information Act. They are the cluster of red points in 1993. A political scientist's requests, not the events, set their date.",
  "<b>Who decides that it counts.</b> In the asteroid record a formula decides and a telescope sets the delay. Here three hands act in turn: whoever keeps the file decides when it is opened; whoever first writes it up (a senator's report, a memoir, a declassified memo, a journalist) decides that it was near; and the keepers, starting with Phillips in 1998, decide which of these make the list. A close call that is still closed is not late. It is not yet anything.",
]
d["method"] = [
  "Events: the Field's study 7 (<i>Who keeps the close calls</i>, 2026-10-10), 53 events coded from four keepers' lists (Phillips 1998, Chatham House 2014, Future of Life Institute 2016, Wikipedia as served 2026-10-10), read at a pinned commit by <code>build_data.py</code>. The date an event happened is the earliest date any keeper gives for it.",
  "Two dates per event, found by web research: <i>reported as an event</i>, the earliest dated public source that the occurrence happened at all; <i>known as a close call</i>, the earliest dated public source that says how near it came, in the sense the keepers' description gives. Each date carries its source, a link, and a quotation of at most 25 words.",
  "Every quotation was checked by <code>verify_sources.py</code>: the linked page was fetched and the quotation looked for in its text. Only a close-call date whose quotation was found counts; the others stay in the table in grey with the reason (no source found, page refused, quotation not on the page). An occurrence date that could not be checked is replaced by the close-call date, so the middle rail is a floor.",
  "A date given only as a year or a month is placed at the start of that period: a line is never drawn longer than its evidence. A found quotation proves that the page says it, not that no earlier source exists. Earlier sources would shorten lines; none would lengthen them.",
  "Some sources are secondary: an encyclopedia or an archive's summary that states when the first account appeared. The table names the source as found.",
  "Nothing here estimates how near any event came; that is the keepers' judgment and the sources'. Asteroid delays are from <a href='../2026-10-10-after-it-passed/'>AFTER IT PASSED</a> (JPL close-approach and small-body data): passage to first observation, for the passages first seen afterwards.",
  "Evidence beside the page: <code>research.json</code> (the dated sources), <code>verification.json</code>, <code>raw-manifest.json</code> (SHA-256 of each fetched page; pages not committed), <code>data.json</code>, <code>verify_browser.mjs</code>.",
]
d["siblings"] = [
  "The Field, <a href='https://github.com/frankbueltge/field-research/tree/main/artifacts/2026-10-10-who-keeps-the-close-calls'><i>Who keeps the close calls</i></a> (study 7): four keepers agree on 3 of 53 events. This work takes the Field's 53 events as its material and asks the question the Field did not: not which keeper lists an event, but when any public record could first have listed it. Every keeper wrote after the clock had already run.",
  "The Field, <a href='https://github.com/frankbueltge/field-research/tree/main/artifacts/2026-10-11-how-far-the-record-sees'><i>How far the record sees</i></a> (study 8): the asteroid record's reach sets its denominator. The nuclear record's denominator is set by what is still closed, and no plot of the open part can show its edge.",
  "The Atelier, <a href='https://github.com/frankbueltge/ulysses/tree/main/window/cycle-007-session-1'><i>The Hinge</i></a> and <a href='https://github.com/frankbueltge/ulysses/tree/main/window/cycle-007-session-2'><i>Near to What</i></a>: the keeper who writes the hinge decides how near; in the asteroid record the passage rewrites what it was near to. Here the hinge itself arrives late: the sentence that something could have gone otherwise is often the last part of the record to be written.",
]
d["keepers"] = [{"id": "PH", "short": "Phillips", "year": 1998}, {"id": "CH", "short": "Chatham House", "year": 2014},
                {"id": "FLI", "short": "FLI", "year": 2016}, {"id": "WP", "short": "Wikipedia", "year": 2026}]
json.dump(d, open("data.json", "w"), ensure_ascii=False, indent=0)
open("index.html", "w").write(open("template.html").read().replace("/*DATA*/null", json.dumps(d, separators=(",", ":"), ensure_ascii=False)))
print("index.html", len(open("index.html").read()))
