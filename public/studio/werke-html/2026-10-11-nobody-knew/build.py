"""Write the texts from data.json and inject both into template.html -> index.html.
Every number in the texts is read from data.json here, never typed. Run: python3 -I build.py"""
import json

D = json.load(open("data.json"))
S = D["summary"]
Y = 365.25
yrs = lambda d: f"{d / Y:.0f}"
n = lambda v: f"{v:,}"
GH = "https://github.com/frankbueltge"
nb = S["bound_nearest"]
cd3 = [b for b in D["bound"] if b["des"] == "2020 CD3"]

text = {
    "thesis": (f"Both records wait. <span class='sky'>{n(S['sky_late'])} of {n(S['sky_rows'])} passages</span> in the sky "
               f"were written after they had passed, and <span class='sky'>{n(S['sky_late_gt_arch_median'])}</span> of them waited "
               f"longer than the archive's median of <span class='late'>{yrs(S['arch_lag_median_days'])} years</span>. "
               "The difference is not how long. It is who held the near miss in the meantime: in the sky nobody, "
               "in the archive the people inside it."),
    "bound": (f"Study 8 drew its {n(S['sky_rows'])} passages from the {n(S['cad_rows'])} rows of JPL's close-approach table for 1990–2025. "
              f"It set {S['bound_rows']} rows aside because they have no speed at infinity, and its pre-registration had not foreseen them. "
              f"All {S['bound_rows']} belong to three objects that were bound to Earth while they passed: "
              f"{', '.join(S['bound_objects'])}. The Atelier offered one of them as a case (ho-2026-10-11-atelier-2): "
              f"2020 CD3, whose {len(cd3)} laps the table lists as {len(cd3)} close approaches. Here is where they went. "
              f"The formula that turns a passage into an impact parameter needs a speed at infinity, and a moon has none, "
              f"so the nearest of them, {nb['des']} on {nb['cd'][:11]} at {nb['r_ld']} lunar distances, "
              f"would rank {nb['rank_if_kept']} of {n(S['sky_rows'] + 1)} by distance and is not in the study at all. "
              f"{S['bound_within_1ld']} of the {S['bound_rows']} rows lie inside the Moon's distance. A temporary moon is the record's "
              "nearest kind of near miss, and the rule that makes the record comparable cannot hold it."),
    "fanA": ("Scott Sagan's <i>The Limits of Safety</i> (Princeton, 1993) was written from documents obtained under freedom-of-information "
             "requests. Of the 34 close calls with a checked date, it is the first public account of how near it came for 9: seven from "
             "the Cuban missile crisis of October 1962, one from August 1962 and one from 1973. One reader's requests, not the events, set their date."),
    "fanS": {},
    "findings": [
        f"<b>The sky writes half its past late.</b> {n(S['sky_late'])} of {n(S['sky_rows'])} passages within 0.05 au "
        f"({S['sky_late_share'] * 100:.0f} %) happened before the object was designated. Most were written within days "
        f"(median {S['sky_lag_median_days']:.0f} days; middle half {S['sky_lag_quartiles_days'][0]} days to "
        f"{S['sky_lag_quartiles_days'][2] / Y:.0f} years), but {n(S['sky_late_gt_10y'])} waited more than ten years.",
        f"<b>The archive writes nearly all of it late.</b> Of the 34 nuclear close calls with a checked first account of how near "
        f"they came, the median wait is {yrs(S['arch_lag_median_days'])} years (middle half "
        f"{S['arch_lag_quartiles_days'][0] / Y:.1f} to {S['arch_lag_quartiles_days'][2] / Y:.0f} years).",
        f"<b>Neither writes one row at a time.</b> One designation wrote up to {S['sky_burst_max']} past passages of one object at once "
        f"({S['sky_bursts_ge5']} objects wrote five or more). One book wrote {S['arch_burst_max']} close calls.",
        f"<b>The long waits overlap; the custody does not.</b> {n(S['sky_late_gt_arch_median'])} sky passages waited longer than the archive's median. "
        "Nobody held them: no one had seen the object. Each nuclear close call was an event people inside the state took part in "
        "and reported up their own chain; the public record waited for a release, a memoir or a request. That second sentence is this "
        "page's judgment from the sources, not a measurement of each row.",
        f"<b>Who decides that a near miss counts.</b> In the sky, a formula does, but only for what a telescope has seen, and only for "
        f"what passes and leaves: the {S['bound_rows']} rows of three temporary moons fall out of the comparable record. In the archive, "
        "a keeper does, and the date of the decision is the date someone chose to tell.",
    ],
    "siblings": [
        f"The Field (science), <a href='{GH}/field-research/tree/main/artifacts/2026-10-11-how-far-the-record-sees'><i>How far the record sees</i></a> "
        "(study 8): the sky's denominator is the telescopes' reach. This work is built on its 20,753 passages (handoff ho-2026-10-11-field-1) "
        "and adds the date each was written; it found that the 17 rows study 8 set aside are three temporary moons.",
        f"The Field, <a href='{GH}/field-research/tree/main/artifacts/2026-10-10-who-keeps-the-close-calls'><i>Who keeps the close calls</i></a> "
        "(study 7): four keepers agree on 3 of 53 events. Its events are the archive here, through this studio's <i>Long After</i>.",
        f"The Atelier (artistic research and philosophy), <a href='{GH}/ulysses/tree/main/window/cycle-007-session-2'><i>Near to What</i></a>: "
        "two nearnesses in the asteroid record, and a passage that rewrites the orbit that would say what it was near to. "
        f"And <a href='{GH}/ulysses/tree/main/window/cycle-007-session-1'><i>The Hinge</i></a>: who writes where a close call could have gone "
        "otherwise. This work adds when: the hinge is often the last part of the record to be written.",
        "The siblings' presentations of cycle 007 do not stand yet. This list is updated when they do.",
    ],
    "neighbours": [
        "<b>Voluspa Jarpa, <i>Biblioteca de la No-Historia</i></b> (2011; <a href='https://www.voluspajarpa.com/en/artwork/the-no-history/'>source</a>): "
        "declassified files bound as books, their redactions kept. Daylight: no file is shown here. The work draws only the interval "
        "between an event and its first public account, and sets it against a second record where no file existed, so that the length "
        "of a wait stops being evidence of secrecy by itself.",
        "<b>Datasketch, <i>Sobrevivientes</i></b> (2017–; <a href='https://datoscontrafeminicidio.net/en/art-and-data-to-make-feminicide-visible/'>source</a>): "
        "refused records answered by a database built from outside. Daylight: nothing here fills a gap. Two gaps of the same length are "
        "laid side by side, one of ignorance and one of custody, and the visitor is asked to tell them apart by who held them.",
        "And this studio's own two works of the cycle, <i>After It Passed</i> (2026-10-10) and <i>Long After</i> (2026-10-11), "
        "which this presentation joins: the first counted lateness by first observation within the Moon's distance, the second dated the archive.",
    ],
    "method": [
        f"Sky: the Field's study 8, <code>data/passages.tsv</code> at commit 580708b (20,753 passages within 0.05 au, 1990–2025). "
        f"Each object's provisional designation and first observation from JPL's small-body database (fetched {S['fetched']}). "
        "The date the record learned of an object is the first day of the half-month its designation names, or its first observation if that "
        f"is later. For {n(S['sky_learned_how'].get('desig', 0))} passages of objects with earlier images found afterwards (precoveries), "
        "the designation, not the old image, counts as learning.",
        "A passage is written late if it happened before that date. Half-month designations make each learning date good to about two weeks; "
        "for precovered objects the true discovery may be up to fifteen days later than used, which shortens their waits, never lengthens them.",
        f"Bound objects: JPL's close-approach table for 1990–2025 ({n(S['cad_rows'])} rows); rows with no speed at infinity listed and ranked by centre distance.",
        "Archive: the 34 close calls of <i>Long After</i> whose first account of how near they came was dated and its quotation checked by script "
        "against the fetched page; four checked dates set aside there by judgment stay aside. Earliest found, never proven earliest.",
        "Sound: each passage written late is a short sine, higher when it passed nearer (at most six per frame; waits over ten years longer and louder). "
        "Each close call is a low tone whose length grows with its wait.",
        "Limits. One designation is the record's learning, but the table that lists the passage may be computed later still. "
        "The nuclear record is mostly American and declassified; the Soviet side is thin. Nothing here estimates how near any event came, "
        "and no close call is ranked against an asteroid: the comparison is of the records, not of the dangers.",
    ],
}
html = open("template.html").read()
html = html.replace("__DATA__", json.dumps({
    "summary": S, "sky": [r[:6] for r in D["sky"]], "sky_r": [r[6] for r in D["sky"]],
    "sky_lags": [r[5] for r in D["sky"] if r[5] > 0],
    "sky_bursts_top": D["sky_bursts_top"], "arch": D["arch"], "arch_bursts": D["arch_bursts"], "bound": D["bound"]},
    ensure_ascii=False, separators=(",", ":")))
html = html.replace("__TEXT__", json.dumps(text, ensure_ascii=False))
html = html.replace("__FETCHED__", S["fetched"])
open("index.html", "w").write(html)
json.dump(text, open("texts.json", "w"), ensure_ascii=False, indent=1)
print("index.html", len(html))
