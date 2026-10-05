#!/usr/bin/env python3
"""THE SAME NUMBER TWICE — render index.html from data.json.

Every figure on the page is substituted from data.json. Nothing is typed by
hand into the template except prose. The page's one live control — the rule
switch — is fed by a JSON island written here from the same data.json, so the
switch can show no number the still frame could not.

  python3 make-page.py            # write index.html
  python3 make-page.py --check    # re-render and compare with the committed file
"""

import argparse
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

ROW = 15.0
X_LAB = 250.0
X_CELL = [266.0, 318.0, 370.0]
CELL_W = 40.0
CELL_H = 10.0
X_BAR = 434.0
BAR_W = 182.0
TOP = 34.0
WIDTH = 648.0

CUT = {
    "American Association for the Advancement of Science (AAAS)": "AAAS",
    "Cureus (Part of Springer Nature as of December 2022)": "Cureus",
    "IEEE: Institute of Electrical and Electronics Engineers": "IEEE",
    "European Centre for Disease Prevention and Control": "ECDC",
    "Federation of American Societies for Experimental Biology": "FASEB",
    "American Speech-Language-Hearing Association": "ASHA",
    "International Scientific Information, Inc": "Int. Scientific Information",
    "American Society for Biochemistry and Molecular Biology (ASBMB)": "ASBMB",
    "American Association for Cancer Research": "Am. Assoc. for Cancer Research",
    "American Society of Gene & Cell Therapy": "Am. Soc. Gene & Cell Therapy",
    "Radiological Society of North America": "Radiological Soc. of N. America",
    "Association for Computing Machinery (ACM)": "ACM",
    "Royal Society of Chemistry (RSC)": "Royal Society of Chemistry",
    "American Chemical Society (ACS)": "American Chemical Society",
    "Cellular Physiol Biochem Press": "Cellular Physiol Biochem",
    "American Society for Microbiology": "Am. Society for Microbiology",
    "Springer - Nature Publishing Group": "Springer — Nature Publishing Gp.",
    "Springer - Biomed Central (BMC)": "Springer — BMC",
    "Taylor and Francis - Dove Press": "Taylor and Francis — Dove",
}


def esc(s):
    return html.escape(str(s), quote=True)


def short(name):
    """The ledger prints every publisher as the census names it; the plate needs
    a label that fits its column. Each shortening is unambiguous within the
    forty, and the build fails if any label would still overrun."""
    s = CUT.get(name, name)
    if len(s) > 32:
        sys.exit("plate label too long and not shortened: %r" % name)
    return esc(s)


def plate(d):
    doors = d["doors"]
    n = len(doors)
    h = TOP + n * ROW + 8
    maxc = max(x["concerns"] for x in doors)
    single = set(d["sets"]["named_by_exactly_one"])
    out = ['<svg viewBox="0 0 %.0f %.0f" role="img" aria-label="Forty census rows, three '
           'readings: each row is one row of the census, each column one reading, a filled '
           'mark a row that reading called shut.">' % (WIDTH, h)]
    heads = [("SHIPPED", "01 Sep"), ("THIS ROOM", "01 Sep"), ("RE-PROBE", "03 Sep")]
    for i, (a, b) in enumerate(heads):
        x = X_CELL[i] + CELL_W / 2
        out.append('<text class="ch" x="%.1f" y="12">%s</text>' % (x, a))
        out.append('<text class="ch dimtx" x="%.1f" y="23">%s</text>' % (x, b))
    out.append('<text class="ch dimtx" x="%.1f" y="23">concerns</text>'
               % (X_BAR + BAR_W / 2))

    # the tie that marks the two rows standing at one address
    tied = [j for j, x in enumerate(doors) if x["shares_address_with"]]
    if len(tied) == 2:
        y0 = TOP + tied[0] * ROW + CELL_H / 2
        y1 = TOP + tied[1] * ROW + CELL_H / 2
        x = X_LAB + 5
        out.append('<path class="tie" d="M%.1f %.1f H%.1f V%.1f H%.1f"/>'
                   % (x, y0, x + 5, y1, x))

    for j, door in enumerate(doors):
        y = TOP + j * ROW
        disputed = door["publisher"] in single
        out.append('<text class="%s" x="%.1f" y="%.1f">%s</text>'
                   % ("dl hot" if disputed else "dl", X_LAB, y + CELL_H - 1.5,
                      short(door["publisher"])))
        for i, shut in enumerate([door["r1_shut"], door["r2_shut"], door["r3_shut"]]):
            k = ("sh hot" if disputed else "sh") if shut else "op"
            out.append('<rect class="%s" data-r="%d" data-i="%d" x="%.1f" y="%.1f" '
                       'width="%.1f" height="%.1f"/>'
                       % (k, i, j, X_CELL[i], y, CELL_W, CELL_H))
        bw = max(0.8, BAR_W * door["concerns"] / maxc)
        out.append('<rect class="bar" x="%.1f" y="%.1f" width="%.1f" height="%.1f"/>'
                   % (X_BAR, y + 2.5, bw, CELL_H - 5))
        if door["concerns"] >= 30 or j < 8:
            out.append('<text class="bl" x="%.1f" y="%.1f">%s</text>'
                       % (X_BAR + bw + 4, y + CELL_H - 1.5, door["concerns"]))
    out.append("</svg>")
    return "\n".join(out)


def views(d):
    """The rule switch's data: for each rule, what each reading says of each
    row, or nothing where its file cannot answer. Every set here is computed in
    make-data.py; this only shapes it for the page."""
    doors = d["doors"]
    single = set(d["sets"]["named_by_exactly_one"])
    c = d["counts"]

    def col(field, answer):
        return {"answer": answer,
                "shut": [bool(x[field]) if answer is not None else False for x in doors]}

    def blank():
        return {"answer": None, "shut": [False] * len(doors)}

    published = {
        "columns": [col("r1_shut", c["r1"]["rows"]), col("r2_shut", c["r2"]["rows"]),
                    col("r3_shut", c["r3"]["rows"])],
        "shared": c["core"]["rows"],
        "mark": [x["publisher"] in single for x in doors],
        "note": "As each reading published itself. Three questions, three answers: a "
                "withdrawn column, one request read to the page behind it, four arms read "
                "to the status line. %d rows are named by exactly one of them."
                % c["named_once"],
    }
    status = {
        "columns": [blank(), col("status_shut_r2", c["status_r2"]["rows"]),
                    col("status_shut_r3", c["status_r3"]["rows"])],
        "shared": c["status_r2"]["rows"],
        "mark": [False] * len(doors),
        "note": "The status line of one honestly identified request. The two measured "
                "readings name the same %d addresses, two rooms and two days apart. The "
                "shipped column cannot be re-derived under any rule: that is what its "
                "authors withdrew." % c["status_r2"]["rows"],
    }
    body = {
        "columns": [blank(), col("r2_shut", c["r2"]["rows"]), blank()],
        "shared": None,
        "mark": [False] * len(doors),
        "note": "What arrived — a 2xx carrying a page about the caller is not an opening. "
                "Only this room can answer: the re-probe logged statuses and response "
                "headers and no page body, and the shipped column is withdrawn. One "
                "reading, %d rows at %d addresses, and nothing to compare it with."
                % (c["r2"]["rows"], c["r2"]["addresses"]),
    }
    arms = {
        "columns": [blank(), blank(), col("arms_shut_r3", c["arms_r3"]["rows"])],
        "shared": None,
        "mark": [False] * len(doors),
        "note": "Refused every one of four arms. Only the re-probe can answer: this room "
                "made a single request per row and the shipped column is withdrawn. %d "
                "rows — and note that this practice's own two rules, applied to its own "
                "single probe, give %d and %d and share %d."
                % (c["arms_r3"]["rows"], c["status_r3"]["rows"], c["arms_r3"]["rows"],
                   c["status_r3_and_arms"]["rows"]),
    }
    return {"n": len(doors),
            "views": {"published": published, "status": status, "body": body,
                      "arms": arms}}


BUTTONS = [
    ("published", "as each reading published it"),
    ("status", "the status line of one request"),
    ("body", "what arrived at the page"),
    ("arms", "refused every one of four arms"),
]


def buttons():
    return "\n".join(
        '<button type="button" data-rule="%s" aria-pressed="%s">%s</button>'
        % (k, "true" if k == "published" else "false", esc(t)) for k, t in BUTTONS)


def named(lst, d, field):
    by = {x["publisher"]: x for x in d["doors"]}
    li = []
    for p in lst:
        x = by[p]
        li.append('<li><b>%s</b> <span class="w">%d concern%s%s</span><br>'
                  '<span class="w">%s</span></li>'
                  % (esc(p), x["concerns"], "" if x["concerns"] == 1 else "s",
                     " · shares its address with %s" % esc(x["shares_address_with"][0])
                     if x["shares_address_with"] else "",
                     esc(field(x))))
    return "<ul class=\"named\">\n%s\n</ul>" % "\n".join(li)


def ledger(d):
    single = set(d["sets"]["named_by_exactly_one"])
    rows = []
    for x in d["doors"]:
        rows.append(
            "<tr%s><td>%s%s</td><td class=n>%d</td><td class=c>%s</td>"
            "<td class=c>%s <span class=w>%s</span></td>"
            "<td class=c>%s <span class=w>%s</span></td></tr>"
            % (' class="dis"' if x["publisher"] in single else "",
               esc(x["publisher"]),
               ' <span class="w">same address</span>' if x["shares_address_with"] else "",
               x["concerns"],
               "blocked" if x["r1_shut"] else "—",
               esc(x["r2_state"]), x["r2_status"],
               esc(x["r3_verdict"]), esc(x["r3_status_a"])))
    return "\n".join(rows)


def build():
    with open(os.path.join(HERE, "data.json"), encoding="utf-8") as f:
        d = json.load(f)
    with open(os.path.join(HERE, "page.template.html"), encoding="utf-8") as f:
        t = f.read()

    c, S, u = d["counts"], d["sets"], d["unit"]
    by = {x["publisher"]: x for x in d["doors"]}

    def arrived_r1(x):
        return ("shipped: blocked · this room, two runs minutes apart: %s, %s · "
                "re-probe: %s" % (x["r2_status"], x["r2_status_b"], x["r3_status_a"]))

    def arrived_r2(x):
        m = ", ".join(x["r2_markers"]) if x["r2_markers"] else "no marker recorded"
        return ("this room: %s, %s, titled %s · markers: %s · re-probe: %s"
                % (x["r2_status"], x["r2_status_b"],
                   ("“%s”" % x["r2_title"]) if x["r2_title"] else "nothing",
                   m, x["r3_verdict"]))

    dup = list(u["duplicate_addresses"].values())[0]
    m = by[S["status_r3_not_arms"][0]]
    i = by[S["arms_not_status_r3"][0]]

    v = {
        "rows": u["rows"], "addresses": u["addresses"],
        "dup_a": esc(dup[1]), "dup_b": esc(dup[0]),
        "r1_n": c["r1"]["rows"], "r2_n": c["r2"]["rows"], "r3_n": c["r3"]["rows"],
        "r2_addr": c["r2"]["addresses"],
        "r1_wt": c["r1"]["wt"], "r2_wt": c["r2"]["wt"], "r3_wt": c["r3"]["wt"],
        "shared": c["r1_and_r2"]["rows"],
        "union": c["union"]["rows"], "union_wt": c["union"]["wt"],
        "open3": c["open_to_all_three"]["rows"], "open3_wt": c["open_to_all_three"]["wt"],
        "named_once": c["named_once"], "named_twice": c["named_twice"],
        "n_r1_not_r2": len(S["r1_not_r2"]), "n_r2_not_r1": len(S["r2_not_r1"]),
        "stat_r2": c["status_r2"]["rows"], "stat_r3": c["status_r3"]["rows"],
        "stat_shared": c["status_r2"]["rows"] if c["status_identical"] else "—",
        "stat_wt": c["status_r2"]["wt"],
        "arms_r3": c["arms_r3"]["rows"],
        "arms_stat_shared": c["status_r3_and_arms"]["rows"],
        "floor": c["status_r3_and_arms"]["addresses"],
        "floor_wt": c["status_r3_and_arms"]["wt"],
        "plate": plate(d),
        "rulebuttons": buttons(),
        "griddata": json.dumps(views(d), ensure_ascii=False),
        "list_r1_not_r2": named(S["r1_not_r2"], d, arrived_r1),
        "list_r2_not_r1": named(S["r2_not_r1"], d, arrived_r2),
        "mdpi": esc(m["publisher"]), "mdpi_st": m["r2_status"],
        "mdpi_arms": esc(", ".join("%s %s" % (k, m["r3_status_all"][k])
                                   for k in sorted(m["r3_status_all"]))),
        "mdpi_layer": esc(m["layer"] or "no layer recorded"),
        "ieee": esc(i["publisher"]), "ieee_st": i["r2_status"],
        "ieee_layer": esc(i["layer"] or "no layer recorded"),
        "ledger": ledger(d),
        "src_summary": esc(d["sources"]["summary"]["url"]),
        "sha_summary": d["sources"]["summary"]["sha256"],
        "src_corr": esc(d["sources"]["corrections"]["url"]),
        "sha_corr": d["sources"]["corrections"]["sha256"],
        "src_census": esc(d["sources"]["census"]["url"]),
        "sha_census": d["sources"]["census"]["sha256"],
        "sha_ours": d["ours"]["sha256_as_read"],
        "knock_a": esc(d["ours"]["knocked_utc"][0]),
        "knock_b": esc(d["ours"]["knocked_utc"][1]),
    }
    if not c["status_identical"]:
        sys.exit("the two status-line readings are no longer the identical set; the page's "
                 "prose says they are and must be rewritten before it renders")

    for key in v:
        t = t.replace("{{%s}}" % key, str(v[key]))
    left = [s.split("}}")[0] for s in t.split("{{")[1:] if "}}" in s]
    if left:
        sys.exit("template placeholders with no value: %s" % sorted(set(left)))
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    page = build()
    path = os.path.join(HERE, "index.html")
    if a.check:
        with open(path, encoding="utf-8") as f:
            have = f.read()
        if have != page:
            sys.exit("index.html does not match a fresh render of data.json")
        print("index.html re-rendered and identical")
        return
    with open(path, "w", encoding="utf-8") as f:
        f.write(page)
    print("wrote index.html")


if __name__ == "__main__":
    main()
