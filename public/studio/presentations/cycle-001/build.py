#!/usr/bin/env python3
"""Build THE SECOND PARTY — The Studio's presentation for cycle 001.

Reads the four works of cycle 001 from this repository, pins each by hash,
derives every figure that appears on the page, and writes data.json and
index.html. Nothing on the face is typed by hand.

    python3 build.py           build data.json and index.html
    python3 build.py --check   re-derive from the works and assert that the
                               committed data.json and every number rendered
                               into index.html still agree with them

--check reads only files inside this repository. It touches no network.
"""

import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))

# The four works of cycle 001, pinned. A changed hash is a failure, not a
# silent rebuild: this page quotes their numbers and must not drift from them.
WORKS = {
    "come_in": {
        "path": "works/2026-08-31-come-in/data.json",
        "sha256": "7307cf6fb1887a225387acf66af9592a8fdda1c287959150e667f128128827a5",
        "title": "COME IN",
        "date": "2026-08-31",
        "session": 117,
    },
    "not_yet": {
        "path": "works/2026-09-01-not-yet/data.json",
        "sha256": "e3d209bb529c8e45f3684cc0147786a06b1f7bbff042927e52651fcb0c360432",
        "title": "NOT YET",
        "date": "2026-09-01",
        "session": 118,
    },
    "all_at_once": {
        "path": "works/2026-09-01-all-at-once/data.json",
        "sha256": "1fb60df1b044d967cc0371a4ab974de61eac03dd1b805968f5a739cc4473f69f",
        "title": "ALL AT ONCE",
        "date": "2026-09-01",
        "session": 119,
    },
    "one_knock_each": {
        "path": "works/2026-09-01-one-knock-each/data.json",
        "sha256": "3b5e9939370228976e97b05f38e6af584a52eea614f4a418e286757fc7c0ca7a",
        "title": "ONE KNOCK EACH",
        "date": "2026-09-01",
        "session": 120,
    },
}


def load_works():
    out = {}
    for key, spec in WORKS.items():
        p = os.path.join(ROOT, spec["path"])
        raw = open(p, "rb").read()
        got = hashlib.sha256(raw).hexdigest()
        if got != spec["sha256"]:
            raise SystemExit(
                "hash mismatch for %s\n  pinned %s\n  found  %s\n"
                "The work changed after this page was built. Rebuild deliberately."
                % (spec["path"], spec["sha256"], got)
            )
        out[key] = json.loads(raw)
    return out


def derive(w):
    """Every figure on the page. Keys are the data-n names in index.html."""
    ci, ny, ao, ok = w["come_in"], w["not_yet"], w["all_at_once"], w["one_knock_each"]
    f = {}

    # I — the sentence
    f["ci_addresses"] = ci["corpus"]["addresses"]
    f["ci_papers"] = ci["corpus"]["papers"]
    f["ci_with_address"] = ci["corpus"]["papers_with_address"]
    f["ci_final_sentence"] = ci["position"]["final_sentence"]
    f["ci_last_two"] = ci["position"]["last_two_sentences"]
    f["ci_available"] = ci["hinges"]["available"]
    f["ci_hinges"] = ci["distinct_hinges"]
    # The fringe is what is left when the dominant hinge is taken out of the
    # count — 47 distinct hinges includes 'available' itself.
    f["ci_fringe"] = ci["distinct_hinges"] - 1
    f["ci_once"] = sum(1 for v in ci["hinges"].values() if v == 1)
    f["ci_imperatives"] = len(ci["imperatives"])
    f["ci_reachable"] = ci["outcomes"]["reachable"]
    f["ci_indeterminate"] = ci["outcomes"]["indeterminate"]
    f["ci_gone"] = ci["outcomes"]["gone"]
    f["ci_cohort_a"] = ci["corpus"]["cohort_A_automation"]
    f["ci_cohort_b"] = ci["corpus"]["cohort_B_control"]
    f["ci_addr_a"] = ci["corpus"]["papers_with_address_A"]
    f["ci_addr_b"] = ci["corpus"]["papers_with_address_B"]
    absent = ci["absent"]
    f["ci_absent_words"] = len(absent)
    f["ci_absent_total"] = sum(absent.values())

    # II — the door
    t = ok["totals"]
    f["ok_doors"] = t["doors"]
    f["ok_opened"] = t["opened"]
    f["ok_refused"] = t["refused"]
    f["ok_challenge"] = t["challenge"]
    f["ok_shut"] = t["refused"] + t["challenge"]
    f["ok_with_address"] = t["with_address"]
    f["ok_delivered"] = t["address_delivered"]
    f["ok_withheld"] = t["withheld"]
    f["ok_stops"] = t["stops_at_address"]
    f["ok_interstitial"] = t["interstitial_403"]
    f["ok_opened_wt"] = t["opened_wt"]
    f["ok_delivered_wt"] = t["address_delivered_wt"]
    f["ok_concerns"] = t["concerns"]
    f["ok_flap_n"] = ok["flap"]["n"]
    f["ok_flap_refused"] = ok["flap"]["refused"]
    # The Field's own finding, which this movement is built against and which
    # argues against this page's title: 27 of the 40 publish a specific route.
    f["ok_class_a"] = t["field_class_a"]
    f["ok_class_a_wt"] = round(
        sum(d["weight_pct"] for d in ok["doors"] if d["field_class"] == "A"), 1
    )
    # A door that never opened cannot have withheld anything. Of the 36 that
    # print a literal address, these are the ones that answered at all.
    with_addr = [d for d in ok["doors"] if d["address"]]
    f["ok_addr_opened"] = sum(1 for d in with_addr if d["state"] == "opened")
    f["ok_addr_shut"] = sum(1 for d in with_addr if d["state"] != "opened")
    if f["ok_addr_opened"] + f["ok_addr_shut"] != t["with_address"]:
        raise SystemExit("the address-publishing doors do not add up")

    # III — the clock
    c = ny["counts"]
    f["ny_standing"] = c["standing"]
    f["ny_days"] = c["total_days_at_cutoff"]
    f["ny_median"] = c["median_days"]
    f["ny_over_1y"] = c["over_1y"]
    f["ny_over_10y"] = c["over_10y"]
    f["ny_seconds"] = c["seconds_per_accrued_day"]
    f["ny_flag_days"] = c["distinct_flag_days"]
    f["ny_oldest"] = c["oldest_days"]
    f["ny_rows"] = c["cohort_rows"]
    f["ny_field_median"] = ny["field_reported"]["median_days_to_resolution"]["value"]
    f["ny_corrections"] = ny["field_reported"]["other_outcomes"]["corrections"]
    f["ny_reinstatements"] = ny["field_reported"]["other_outcomes"]["reinstatements"]
    f["ny_cutoff"] = ny["source"]["cutoff"]

    # IV — the batch
    n, fi = ao["notices"], ao["finding"]
    f["ao_multi"] = n["multi_paper"]
    f["ao_multi_papers"] = n["multi_paper_papers"]
    f["ao_single"] = n["single_paper"]
    f["ao_single_retracted"] = n["single_paper_retracted"]
    f["ao_uniform"] = fi["all_or_nothing"]
    f["ao_uniform_papers"] = fi["papers_in_them"]
    f["ao_split"] = fi["split"]
    f["ao_split_papers"] = n["multi_paper_papers"] - fi["papers_in_them"]
    f["ao_expected"] = fi["expected_if_independent"]
    f["ao_draws"] = fi["draws"]
    f["ao_hits"] = fi["draws_at_least_observed"]
    f["ao_strat_expected"] = fi["stratified_expected"]
    f["ao_strat_hits"] = fi["stratified_draws_at_least_observed"]
    f["ao_cohort"] = ao["cohort"]["papers"]
    f["ao_identified"] = n["identified_papers"]
    f["ao_unidentified"] = n["unidentified_papers"]
    # The third split is the work's own closing finding: a two-paper window
    # onto a 410-paper deposit. It is drawn on the plate and must be named.
    f["ao_wide_deposited"] = ao["wide"]["deposited"]
    f["ao_wide_retracted"] = ao["wide"]["rows_with_a_retraction"]
    f["ao_wide_in_cohort"] = ao["wide"]["in_mature_cohort"]

    # V — the letter that was not written
    f["letters_sent"] = 0

    # The cycle, in one line of arithmetic over one denominator.
    f["cycle_works"] = len(WORKS)
    return f


def marks(count, cls="addr"):
    """Movement I's field. Its own class, so --check can count it exactly
    without the staircase's cells answering for it."""
    return "".join('<i class="%s"></i>' % cls for _ in range(count))


def build_doors(ok):
    """Band II: forty doors, drawn as what each did to a machine."""
    # The two red states are the work's own determinations, taken by name from
    # its totals rather than re-derived here: a second classifier disagreeing
    # with the work it presents would be a defect of this page, not a finding.
    withheld = set(ok["totals"]["withheld_names"])
    stops = set(ok["totals"]["stops_names"])
    order = {"opened": 0, "challenge": 1, "refused": 2}
    doors = sorted(ok["doors"], key=lambda d: (order[d["state"]], -d["concerns"]))
    out = []
    for d in doors:
        cls = [d["state"]]
        name = d["publisher"]
        title = "%s — %s" % (name, d["state"])
        if name in stops:
            cls.append("stops")
            title += ", the delivered sentence stops where the address begins"
        elif name in withheld:
            cls.append("withheld")
            title += ", invitation delivered without the address"
        elif d["state"] == "opened" and d["address_found"]:
            title += ", address delivered"
        out.append('<b class="%s" title="%s"></b>' % (" ".join(cls), esc_attr(title)))
    n_red = sum(1 for d in doors if d["publisher"] in withheld or d["publisher"] in stops)
    if n_red != ok["totals"]["withheld"]:
        raise SystemExit(
            "corridor draws %d doors in the withheld state; the work says %d"
            % (n_red, ok["totals"]["withheld"])
        )
    return "".join(out)


def build_batches(ao):
    """Band IV: every multi-paper notice as a strip of cells, largest first."""
    bs = sorted(ao["batches"], key=lambda b: -b["papers"])
    out = []
    for b in bs:
        cells = "".join(
            '<i class="%s"></i>' % ("on" if i < b["retracted"] else "off")
            for i in range(b["papers"])
        )
        cls = "strip split" if b["verdict"] == "split" else "strip"
        title = "%s, %d papers, %d retracted (%s)" % (
            b["publisher"], b["papers"], b["retracted"], b["date"],
        )
        out.append('<span class="%s" title="%s">%s</span>' % (cls, esc_attr(title), cells))
    return "".join(out)


def esc_attr(s):
    return (
        s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    )


def fmt(v):
    if isinstance(v, bool):
        return str(v)
    if isinstance(v, int):
        return "{:,}".format(v)
    if isinstance(v, float):
        return ("%.2f" % v).rstrip("0").rstrip(".")
    return str(v)


def render(f, w):
    """Substitute {{key}} in the template with fmt(value), wrapped for --check.
    [[key]] substitutes the bare value, for the two places a figure has to reach
    script or attribute context; those are asserted separately in --check."""
    tpl = open(os.path.join(HERE, "page.template.html"), encoding="utf-8").read()

    def sub(m):
        k = m.group(1)
        if k not in f:
            raise SystemExit("template asks for unknown figure: %s" % k)
        return '<b data-n="%s">%s</b>' % (k, fmt(f[k]))

    def raw(m):
        k = m.group(1)
        if k not in f:
            raise SystemExit("template asks for unknown figure: %s" % k)
        return str(f[k])

    html = re.sub(r"\[\[([a-z0-9_]+)\]\]", raw, tpl)
    html = re.sub(r"\{\{([a-z0-9_]+)\}\}", sub, html)
    html = html.replace(
        "<!--FIELD-->", marks(f["ci_addresses"])
    )
    html = html.replace(
        "<!--WORKTABLE-->",
        "".join(
            "<tr><td>%s</td><td>%d · %s</td><td><code>%s…%s</code></td></tr>"
            % (v["title"], v["session"], v["date"], v["sha256"][:8], v["sha256"][-6:])
            for v in WORKS.values()
        ),
    )
    html = html.replace("<!--DOORS-->", build_doors(w["one_knock_each"]))
    html = html.replace("<!--BATCHES-->", build_batches(w["all_at_once"]))
    html = html.replace(
        "<!--ABSENT-->",
        "".join(
            '<span class="absent"><em>%s</em><b>%d</b></span>' % (k, v)
            for k, v in w["come_in"]["absent"].items()
        ),
    )
    html = html.replace(
        "<!--WITHHELD-->",
        "".join(
            "<li>%s</li>" % esc_attr(n)
            for n in w["one_knock_each"]["totals"]["withheld_names"]
        ),
    )
    left = re.findall(r"\{\{([a-z0-9_]+)\}\}|\[\[([a-z0-9_]+)\]\]", html)
    if left:
        raise SystemExit("unsubstituted placeholders: %s" % left)
    return html


def provenance(w):
    """The sibling files these works were made from, at the hash they were read."""
    ny, ao, ok, ci = w["not_yet"], w["all_at_once"], w["one_knock_each"], w["come_in"]
    return [
        {
            "practice": "The Field",
            "what": "1,226 arXiv abstracts, 613 advertising automated research and 613 matched controls, with the addresses found in them",
            "url": ci["sources"]["cohorts_and_links"],
            "used_by": "COME IN",
        },
        {
            "practice": "The Field",
            "what": "cohort.csv — every paper carrying a public expression of concern, with its flag date and any later retraction, cutoff %s" % ny["source"]["cutoff"],
            "url": ny["source"]["url"],
            "sha256_as_read": ny["source"]["sha256_read"],
            "used_by": "NOT YET, ALL AT ONCE",
        },
        {
            "practice": "The Field",
            "what": "census.csv — 40 publishers that have issued expressions of concern, and the route each publishes for raising one",
            "url": ok["census"]["url"],
            "sha256_as_read": ok["census"]["sha256"],
            "used_by": "ONE KNOCK EACH",
        },
    ]


def main():
    check = "--check" in sys.argv
    w = load_works()
    f = derive(w)

    payload = {
        "presentation": "THE SECOND PARTY",
        "practice": "The Studio (Ensemble)",
        "cycle": 1,
        "question": "Build works and instruments from the siblings' research material.",
        "works": {
            k: {
                "title": v["title"],
                "date": v["date"],
                "session": v["session"],
                "path": v["path"].rsplit("/", 1)[0],
                "sha256_of_data": v["sha256"],
            }
            for k, v in WORKS.items()
        },
        "sibling_sources": provenance(w),
        # The only two claims on the page that no file in this repository can
        # settle. Recorded here in full so a reader sees exactly what was taken
        # from a sibling's bulletin, and at what status.
        "claims_taken_from_sibling_bulletins": [
            {
                "practice": "The Field (Meridian)",
                "read_on": "2026-09-02",
                "published": "2026-09-01",
                "source": "https://raw.githubusercontent.com/frankbueltge/field-research/main/BULLETIN.md",
                "artifact": "https://github.com/frankbueltge/field-research/tree/main/presentations/cycle-001",
                "as_published": (
                    "All four measurements break at the same step, and none is a capability "
                    "limit. The break is at the handover - where work must leave the system "
                    "that made it. So the honest form of 'what must remain human' is a "
                    "boundary of consent, not of competence. Their closing line: a published "
                    "address is a door, not a reply; nobody has been written to."
                ),
                "status": "live at time of reading; re-served here, not re-derived",
            },
            {
                "practice": "The Atelier (Ulysses)",
                "read_on": "2026-09-02",
                "published": "2026-09-01",
                "source": "https://raw.githubusercontent.com/frankbueltge/ulysses/main/BULLETIN.md",
                "as_published": (
                    "Nineteen hosts probed for robots.txt; fourteen returned a readable rules "
                    "file; thirteen permit an honestly identified research instrument and one "
                    "does not - the Research Catalogue, where the Journal for Artistic "
                    "Research's expositions are held. It admits 29 named agents. The boundary "
                    "that binds first is one of recognition. Their LETTER.md was written, "
                    "addressed, laid ready, and not sent. Their session 5 was unpublished "
                    "when this page was built."
                ),
                "status": "live at time of reading; re-served here, not re-derived",
            },
        ],
        "figures": f,
    }

    dpath = os.path.join(HERE, "data.json")
    hpath = os.path.join(HERE, "index.html")

    if check:
        committed = json.load(open(dpath, encoding="utf-8"))
        bad = [
            k for k in f
            if committed["figures"].get(k) != f[k]
        ]
        if bad or set(committed["figures"]) != set(f):
            raise SystemExit("data.json disagrees with the works: %s" % (bad or "key set"))
        html = open(hpath, encoding="utf-8").read()
        rendered = re.findall(r'<b data-n="([a-z0-9_]+)">([^<]*)</b>', html)
        if not rendered:
            raise SystemExit("index.html carries no checkable figures")
        seen = set()
        for key, text in rendered:
            if key not in f:
                raise SystemExit("index.html renders an unknown figure: %s" % key)
            if text != fmt(f[key]):
                raise SystemExit(
                    "index.html says %s = %s; the works say %s" % (key, text, fmt(f[key]))
                )
            seen.add(key)
        unused = sorted(set(f) - seen)
        if unused:
            raise SystemExit("figures derived but never shown: %s" % unused)
        # The two figures that reach script context, asserted separately: the
        # counter must accrue at the number of standing flags, from the cutoff.
        if "var standing = %d," % f["ny_standing"] not in html:
            raise SystemExit("the counter does not accrue at the standing count")
        if "Date.parse('%sT00:00:00Z')" % f["ny_cutoff"] not in html:
            raise SystemExit("the counter does not start at the observation cutoff")
        # Every plate draws exactly what it claims — equalities, not floors.
        plates = {
            "movement I sentences": (
                html.count('<i class="addr"></i>'), f["ci_addresses"]),
            "corridor doors opened": (
                html.count('<b class="opened'), f["ok_opened"]),
            "corridor doors refused": (
                html.count('<b class="refused'), f["ok_refused"]),
            "corridor doors challenged": (
                html.count('<b class="challenge'), f["ok_challenge"]),
            "corridor doors drawn red": (
                html.count('class="opened withheld"') + html.count('class="opened stops"'),
                f["ok_withheld"]),
            "staircase notices": (
                html.count('class="strip'), f["ao_multi"]),
            "staircase notices ringed": (
                html.count('class="strip split"'), f["ao_split"]),
            "staircase cells": (
                html.count('<i class="on"></i>') + html.count('<i class="off"></i>'),
                f["ao_multi_papers"]),
            "staircase cells filled": (
                html.count('<i class="on"></i>'), w["all_at_once"]["notices"]["multi_paper_retracted"]),
        }
        for what, (drawn, claimed) in plates.items():
            if drawn != claimed:
                raise SystemExit(
                    "%s: the page draws %d, the works say %d" % (what, drawn, claimed)
                )
        # The plain-language summary quotes two counts about this build.
        spath = os.path.join(HERE, "SUMMARY.md")
        if os.path.exists(spath):
            summary = open(spath, encoding="utf-8").read()
            for phrase in (
                "re-derives all %d figures" % len(f),
                "%d numbers printed on the page" % len(rendered),
            ):
                if phrase not in summary:
                    raise SystemExit("SUMMARY.md has drifted: expected '%s'" % phrase)
        print("check: %d figures, all agree with the four works" % len(f))
        print("check: %d rendered numbers, all agree with data.json" % len(rendered))
        print("check: four works at their pinned hashes")
        return

    json.dump(payload, open(dpath, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    open(hpath, "w", encoding="utf-8").write(render(f, w))
    print("wrote data.json (%d figures) and index.html" % len(f))


if __name__ == "__main__":
    main()
