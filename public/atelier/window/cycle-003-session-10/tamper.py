#!/usr/bin/env python3
# tamper.py — corrupt this session's own evidence eleven ways and require that check.py
# catches every one. A check suite nobody has attacked is a claim, not a check.
#
#   python3 tamper.py
#
# Each round copies data.json and index.html aside, damages one of them in a way a
# careless or dishonest build could plausibly produce, runs check.py, and restores. A
# round that check.py passes is a hole in the apparatus and is reported as a failure here.
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


def doc(d, unit, i=0):
    return [x for x in d["docs"] if x["unit"] == unit][i]


# ----------------------------------------------------------------- the corruptions

def t01_word_count_off_by_one(d, _p):
    """A word count nudged by one — the smallest lie the headline could carry."""
    doc(d, "words")["words"]["W2"] += 1
    return d, None


def t02_locale_reading_swapped(d, _p):
    """W1 and W2 exchanged, so the em-dash finding points the wrong way."""
    w = doc(d, "words")["words"]
    w["W1"], w["W2"] = w["W2"], w["W1"]
    return d, None


def t03_icu_count_invented(d, _p):
    """A UAX#29 count typed rather than segmented — exactly what a page that could not
    run node might be tempted to do."""
    doc(d, "words")["words"]["W3"] = 2499
    return d, None


def t04_stored_lines_trimmed(d, _p):
    """A session note made to fit the 40-line cap by editing the count, not the note."""
    x = doc(d, "lines")
    x["lines"]["L1"] = 40
    return d, None


def t05_wrap_not_monotonic(d, _p):
    """A wrapped count that grows as the page gets wider — impossible, and the kind of
    thing an off-by-one in the wrapper produces."""
    doc(d, "lines")["wrap"]["P1"][10] = 9999
    return d, None


def t06_tailoring_longer_than_base(d, _p):
    """More break opportunities producing more lines: also impossible."""
    x = doc(d, "lines")
    x["wrap"]["P2"][20] = x["wrap"]["P1"][20] + 3
    return d, None


def t07_breach_list_pruned(d, _p):
    """One record quietly dropped from the list of those over the word cap."""
    d["compliance"]["W3"] = d["compliance"]["W3"][:-1]
    return d, None


def t08_cap_relaxed(d, _p):
    """The cap raised in the data until the record complies — the oldest move there is."""
    d["caps"]["digest_words"] = 3000
    for x in d["docs"]:
        if x["unit"] == "words":
            x["cap"] = 3000
    return d, None


def t09_source_points_elsewhere(d, _p):
    """A document's stated provenance changed to a different committed blob."""
    xs = [x for x in d["docs"] if x["group"] == "bulletin"]
    xs[0]["source"] = xs[1]["source"]
    return d, None


def t10_served_number_edited(d, p):
    """The page's served table edited away from the data behind it, so a reader with no
    script is shown a different record from a reader with one."""
    x = doc(d, "words")
    old = f'<td class="n">{x["words"]["W1"]}</td>'
    return d, p.replace(old, '<td class="n">1999</td>', 1)


def t11_page_reaches_outside(d, p):
    """The page quietly acquiring a dependency on the network."""
    return d, p.replace("<main>", '<main><script src="https://example.invalid/x.js"></script>', 1)


ROUNDS = [t01_word_count_off_by_one, t02_locale_reading_swapped, t03_icu_count_invented,
          t04_stored_lines_trimmed, t05_wrap_not_monotonic, t06_tailoring_longer_than_base,
          t07_breach_list_pruned, t08_cap_relaxed, t09_source_points_elsewhere,
          t10_served_number_edited, t11_page_reaches_outside]


def main():
    keep_data = DATA.read_bytes()
    keep_page = PAGE.read_bytes()

    base = subprocess.run([sys.executable, str(HERE / "check.py")],
                          capture_output=True, text=True)
    if base.returncode != 0:
        print("the undamaged evidence does not pass its own checks; stopping")
        print(base.stdout[-800:])
        sys.exit(1)
    print("undamaged evidence passes\n")

    escaped = []
    for fn in ROUNDS:
        d, page = fn(load(), PAGE.read_text(encoding="utf-8"))
        save(d)
        if page is not None:
            PAGE.write_text(page, encoding="utf-8")
        res = subprocess.run([sys.executable, str(HERE / "check.py")],
                             capture_output=True, text=True)
        caught = res.returncode != 0
        first = next((l.strip() for l in res.stdout.splitlines()
                      if l.strip().startswith("FAIL")), "")
        print(f"  {'caught ' if caught else 'ESCAPED'}  {fn.__name__}")
        if caught and first:
            print(f"            by: {first[5:][:100]}")
        if not caught:
            escaped.append(fn.__name__)
        DATA.write_bytes(keep_data)
        PAGE.write_bytes(keep_page)

    print(f"\n{len(ROUNDS) - len(escaped)} of {len(ROUNDS)} corruptions caught")
    if escaped:
        print("holes in the apparatus:", ", ".join(escaped))
        sys.exit(1)


if __name__ == "__main__":
    main()
