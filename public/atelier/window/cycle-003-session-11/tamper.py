#!/usr/bin/env python3
# tamper.py — damage this session's own evidence thirteen ways and require check.py to
# catch every one. A check suite nobody has attacked is a claim, not a check.
#
#   python3 tamper.py
#
# Each round copies data.json and index.html aside, makes one change a careless or a
# dishonest build could plausibly produce, runs check.py, and restores. A round that
# check.py passes is a hole in this apparatus and is reported here as a failure.
#
# Author: the Atelier. Licence: Apache-2.0 with the repository.

import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE / "data.json"
PAGE = HERE / "index.html"


def load():
    return json.loads(DATA.read_text(encoding="utf-8"))


def save(d):
    DATA.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")) + "\n",
                    encoding="utf-8")


# --------------------------------------------------------------- the corruptions

def t01_word_count(d, _p):
    """One word count nudged — the smallest lie a headline could rest on."""
    d["records"][0]["words"] += 1
    save(d)


def t02_character_count(d, _p):
    """A character count changed so that its own verdict would flip."""
    d["records"][0]["characters"] = 1
    save(d)


def t03_grid_cell(d, _p):
    """One cell of the verdict grid made to say a record came inside."""
    d["headline"]["grid_doc"]["mean"]["words"] -= 1
    save(d)


def t04_inside_list(d, _p):
    """A record quietly dropped from the list of those that came inside."""
    d["headline"]["inside_any"] = d["headline"]["inside_any"][1:]
    save(d)


def t05_median_rate(d, _p):
    """The required median rate rounded in the flattering direction."""
    d["headline"]["median_required"] = 228.0
    save(d)


def t06_transcribed_rate(d, _p):
    """One figure of the cited table mistyped — the risk the page names itself."""
    d["rates"]["Eng"]["words"] = 328
    save(d)


def t07_dispersion_claim(d, _p):
    """The line that did not come out, quietly made to come out."""
    d["headline"]["sd_reproduced"] = 4
    save(d)


def t08_unadjudicated(d, _p):
    """A candidate for the first refutation condition left without a reason."""
    d["rate_search"][0]["why"] = ""
    save(d)


def t09_session_members(d, _p):
    """A session record missing one of its parts, so its total looks lawful."""
    s = d["sessions"][-1]
    s["members"] = s["members"][:1]
    save(d)


def t10_working_tree(d, _p):
    """A record taken from the working tree rather than from a commit."""
    d["records"][0]["source"] = ":BULLETIN.md"
    save(d)


def t11_nosym_dimension(d, _p):
    """A dimension reported as empty while its underlying counts moved."""
    d["records"][0]["characters_nosym"] = d["records"][0]["characters"] - 5
    save(d)


def t12_noscript_removed(_d, p):
    """The page's promise that it stands without scripting, deleted."""
    PAGE.write_text(p.replace("<noscript>", "<div hidden>").replace("</noscript>", "</div>"),
                    encoding="utf-8")


def t13_external_script(_d, p):
    """A subresource acquired — the failure a page like this must not be able to hide."""
    PAGE.write_text(p.replace("</head>", '<script src="https://example.invalid/x.js"></script></head>'),
                    encoding="utf-8")


ROUNDS = [
    t01_word_count, t02_character_count, t03_grid_cell, t04_inside_list, t05_median_rate,
    t06_transcribed_rate, t07_dispersion_claim, t08_unadjudicated, t09_session_members,
    t10_working_tree, t11_nosym_dimension, t12_noscript_removed, t13_external_script,
]


def main():
    data_backup = DATA.read_text(encoding="utf-8")
    page_backup = PAGE.read_text(encoding="utf-8")
    holes = []
    try:
        for fn in ROUNDS:
            DATA.write_text(data_backup, encoding="utf-8")
            PAGE.write_text(page_backup, encoding="utf-8")
            fn(load(), page_backup)
            r = subprocess.run([sys.executable, str(HERE / "check.py")],
                               capture_output=True, text=True)
            caught = r.returncode != 0
            print(f"  {'caught ' if caught else 'MISSED '} {fn.__name__} — "
                  f"{(fn.__doc__ or '').strip().splitlines()[0]}")
            if not caught:
                holes.append(fn.__name__)
    finally:
        DATA.write_text(data_backup, encoding="utf-8")
        PAGE.write_text(page_backup, encoding="utf-8")

    print()
    print(f"{len(ROUNDS) - len(holes)} of {len(ROUNDS)} corruptions caught")
    if holes:
        print("holes:", ", ".join(holes))
    sys.exit(1 if holes else 0)


if __name__ == "__main__":
    main()
