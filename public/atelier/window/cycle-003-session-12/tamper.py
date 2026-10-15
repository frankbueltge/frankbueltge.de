#!/usr/bin/env python3
"""tamper.py — damage this session's own evidence sixteen ways and require check.py to
catch every one. A check suite nobody has attacked is a claim, not a check.

    python3 tamper.py

Each round copies data.json, evidence.json and index.html aside, makes one change a
careless or a dishonest build could plausibly produce, runs check.py, and restores. A
round check.py passes is a hole in this apparatus and is reported here as a failure.

Author: the Atelier. Licence: Apache-2.0 with the repository.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE / "data.json"
EV = HERE / "evidence.json"
PAGE = HERE / "index.html"
FILES = [DATA, EV, PAGE]


def load(p):
    return json.loads(p.read_text(encoding="utf-8"))


def save(p, d):
    p.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")) + "\n",
                 encoding="utf-8")


def row(d, dirname):
    return next(r for r in d["pages"] if r["dir"] == dirname)


# --- the corruptions ---------------------------------------------------------------

def t_add_count(d, e, p):
    """a page's count of added quantities is raised by one"""
    row(d, "window/cycle-003-session-11")["q"]["add"] += 1
    save(DATA, d)


def t_add_token(d, e, p):
    """one added quantity is dropped from the token list but the count kept"""
    r = row(d, "window/cycle-003-session-11")
    r["q"]["add_tokens"] = r["q"]["add_tokens"][1:]
    save(DATA, d)


def t_invented_hide(d, e, p):
    """a withheld quantity is invented that was never on the page"""
    r = row(d, "window/cycle-002-session-2")
    r["q"]["hide_tokens"] = r["q"]["hide_tokens"] + ["987654"]
    r["q"]["hide"] += 1
    save(DATA, d)


def t_total(d, e, p):
    """the corpus total of added quantities is inflated"""
    d["totals"]["add_q"] += 7
    save(DATA, d)


def t_share(d, e, p):
    """the published share is rounded the flattering way"""
    d["totals"]["add_share"] = "0.10"
    save(DATA, d)


def t_curve_cell(d, e, p):
    """one cell of the verdict curve is moved"""
    d["verdict_curves"]["q"]["author"][3] += 1
    save(DATA, d)


def t_curve_monotone(d, e, p):
    """the curve is made to admit more pages as the threshold rises"""
    d["verdict_curves"]["l"]["either"][5] = d["verdict_curves"]["l"]["either"][4] + 3
    save(DATA, d)


def t_css_claim(d, e, p):
    """a page is credited with a hand that works without scripting"""
    row(d, "window/cycle-003-session-10")["q"]["css_reachable"] = 4
    d["totals"]["css_reachable"] += 4
    save(DATA, d)


def t_bytes(d, e, p):
    """a measured page is recorded at the wrong size"""
    row(d, "window/cycle-003-session-9")["bytes"] += 1
    save(DATA, d)


def t_rounding_records(d, e, p):
    """the number of records that disagree is overstated"""
    d["rounding"]["records_that_differ"] += 5
    save(DATA, d)


def t_rounding_cells(d, e, p):
    """one disagreeing cell is quietly dropped"""
    d["rounding"]["served_cells"] = d["rounding"]["served_cells"][1:]
    d["rounding"]["recomputed_cells"] = d["rounding"]["recomputed_cells"][1:]
    save(DATA, d)


def t_states(d, e, p):
    """a page is credited with states the instrument never visited"""
    row(d, "window/cycle-003-session-4")["states_on"] += 2
    d["totals"]["states_on"] += 2
    d["totals"]["states"] += 2
    save(DATA, d)


def t_evidence_delta(d, e, p):
    """a state's difference is made to add and remove the same quantity"""
    page = next(x for x in e["pages"] if x["dir"] == "window/cycle-003-session-11")
    st = page["on"]["states"][1]
    if st["dq"]["+"]:
        st["dq"]["-"] = st["dq"]["-"] + [st["dq"]["+"][0]]
    else:
        st["dq"]["+"] = ["1"]
        st["dq"]["-"] = ["1"]
    save(EV, e)


def t_evidence_state(d, e, p):
    """a rendered state is deleted from the evidence, the counts left as published"""
    page = next(x for x in e["pages"] if x["dir"] == "window/cycle-002-session-1")
    page["on"]["states"] = page["on"]["states"][1:]
    save(EV, e)


def t_page_row(d, e, p):
    """a ledger row is removed from the page while the data keeps it"""
    i = p.index('data-i="5"')
    j = p.index("</tr>", i) + 5
    k = p.rindex("<tr", 0, i)
    PAGE.write_text(p[:k] + p[j:], encoding="utf-8")


def t_page_curve(d, e, p):
    """a served curve cell is edited in the page only"""
    cells = "".join(f'<td class="num">{d["verdict_curves"]["q"]["author"][k]}</td>'
                    for k in range(1, d["kmax"] + 1))
    bad = cells.replace(f'>{d["verdict_curves"]["q"]["author"][1]}<',
                        f'>{d["verdict_curves"]["q"]["author"][1] + 9}<', 1)
    PAGE.write_text(p.replace(cells, bad, 1), encoding="utf-8")


ROUNDS = [t_add_count, t_add_token, t_invented_hide, t_total, t_share, t_curve_cell,
          t_curve_monotone, t_css_claim, t_bytes, t_rounding_records, t_rounding_cells,
          t_states, t_evidence_delta, t_evidence_state, t_page_row, t_page_curve]


def main():
    backups = {f: f.read_bytes() for f in FILES}
    caught, missed = 0, []
    try:
        for fn in ROUNDS:
            d, e = load(DATA), load(EV)
            p = PAGE.read_text(encoding="utf-8")
            fn(d, e, p)
            r = subprocess.run([sys.executable, str(HERE / "check.py")],
                               capture_output=True, text=True)
            if r.returncode == 0:
                missed.append(fn.__doc__)
            else:
                caught += 1
            for f in FILES:
                f.write_bytes(backups[f])
    finally:
        for f in FILES:
            f.write_bytes(backups[f])

    print(f"{len(ROUNDS)} corruptions, {caught} caught, {len(missed)} missed")
    for m in missed:
        print("  MISSED " + m)
    r = subprocess.run([sys.executable, str(HERE / "check.py")],
                       capture_output=True, text=True)
    print("restored evidence: " + r.stdout.strip().splitlines()[0])
    return 1 if missed or r.returncode else 0


if __name__ == "__main__":
    sys.exit(main())
