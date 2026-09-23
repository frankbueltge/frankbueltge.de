#!/usr/bin/env python3
"""tamper.py — corrupts this session's own evidence, one corruption at a time,
and requires a named check to catch each one.

    python3 window/cycle-003-session-13/tamper.py

Every corruption is applied to a copy of the whole session directory, check.py is
run there, and the run must fail with the named check among its failures. A
corruption that passes is reported as a hole in the checker, not excused.

A suite that counts itself can count wrong — the Field said so on 2026-09-22 after
finding five of its own checks below a __main__ guard. Every check in check.py is
inside main() and main() is called; this file is the second opinion on that.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.environ.get("ULYSSES_REPO") or os.path.abspath(os.path.join(HERE, "..", ".."))


def load(d, name):
    with open(os.path.join(d, name), encoding="utf-8") as fh:
        return json.load(fh)


def save(d, name, obj):
    with open(os.path.join(d, name), "w", encoding="utf-8") as fh:
        json.dump(obj, fh, indent=1, ensure_ascii=False)
        fh.write("\n")


def first_affordable(data):
    for p in data["pages"]:
        if p["affordable"]:
            return p["dir"]
    return data["pages"][0]["dir"]


# Each corruption: (name, what it breaks, function, the check that must fail)
def corruptions():
    out = []

    def bump_settings(d):
        ev = load(d, "evidence.json")
        ev["pages"][0]["settings"] += 1
        save(d, "evidence.json", ev)
    out.append(("settings of a page inflated by one", bump_settings, "settings disagree"))

    def bump_positions(d):
        ev = load(d, "evidence.json")
        for p in ev["pages"]:
            for c in p["served_controls"]:
                if c["kind"] == "finite":
                    c["positions"] += 1
                    save(d, "evidence.json", ev)
                    return
    out.append(("one control given a position it does not have", bump_positions,
                "control disagrees"))

    def drop_control(d):
        ev = load(d, "evidence.json")
        for p in ev["pages"]:
            if p["served_controls"]:
                p["served_controls"].pop()
                p["served_total"] -= 1
                save(d, "evidence.json", ev)
                return
    out.append(("a served control deleted from the record", drop_control,
                "control count disagrees"))

    def wrong_bytes(d):
        ev = load(d, "evidence.json")
        ev["pages"][0]["bytes"] += 7
        save(d, "evidence.json", ev)
    out.append(("a page's recorded size moved", wrong_bytes, "bytes disagree"))

    def inflate_total(d):
        data = load(d, "data.json")
        data["corpus"]["settings_total"] += 1000
        save(d, "data.json", data)
    out.append(("the corpus total inflated", inflate_total, "settings_total disagrees"))

    def fake_add(d):
        data = load(d, "data.json")
        for p in data["pages"]:
            if p["affordable"]:
                p["add"]["q"] += 5
                break
        save(d, "data.json", data)
    out.append(("a page credited with additions it did not make", fake_add,
                "add.q disagrees"))

    def fake_one_way(d):
        sw = load(d, "sweep.json")
        for r in sw["rows"]:
            if r["jsOn"] and r["affordable"]:
                r["oneWayAddQ"] = r["oneWayAddQ"] + ["999999999"]
                break
        save(d, "sweep.json", sw)
    out.append(("a one-way addition invented that the full sweep never saw",
                fake_one_way, "one-way additions not inside the full sweep's"))

    def hide_scriptless(d):
        sw = load(d, "sweep.json")
        for r in sw["rows"]:
            if not r["jsOn"]:
                r["distinctRenderings"] = 3
                break
        save(d, "sweep.json", sw)
    out.append(("a page recorded as answering a hand without scripting",
                hide_scriptless, "a page rendered more than one way with scripting off"))

    def silent_request(d):
        sw = load(d, "sweep.json")
        sw["rows"][0]["offsite"] = 2
        save(d, "sweep.json", sw)
    out.append(("a non-local request hidden in the record", silent_request,
                "a non-local request was made"))

    def drive_unaffordable(d):
        sw = load(d, "sweep.json")
        for r in sw["rows"]:
            if r["jsOn"] and not r["affordable"]:
                r["driven"] = 12
                break
        save(d, "sweep.json", sw)
    out.append(("a page too large to drive recorded as driven", drive_unaffordable,
                "an unaffordable page was driven"))

    def move_cap(d):
        sw = load(d, "sweep.json")
        sw["cap"] = 8
        save(d, "sweep.json", sw)
    out.append(("the declared cap moved after the run", move_cap,
                "affordability disagrees"))

    def add_script(d):
        p = os.path.join(d, "index.html")
        with open(p, encoding="utf-8") as fh:
            h = fh.read()
        h = h.replace("</main>", "<script>void 0</script></main>")
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(h)
    out.append(("a script element smuggled into the page", add_script,
                "the page carries a script element"))

    def add_handler(d):
        p = os.path.join(d, "index.html")
        with open(p, encoding="utf-8") as fh:
            h = fh.read()
        h = h.replace("<main>", '<main onclick="void 0">')
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(h)
    out.append(("an inline event handler smuggled into the page", add_handler,
                "the page carries an inline event handler"))

    def add_remote(d):
        p = os.path.join(d, "index.html")
        with open(p, encoding="utf-8") as fh:
            h = fh.read()
        h = h.replace("<main>", '<main><img src="https://example.invalid/x.png">')
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(h)
    out.append(("a reference to something off the filesystem", add_remote,
                "the page references something off the filesystem"))

    def drop_block(d):
        p = os.path.join(d, "index.html")
        with open(p, encoding="utf-8") as fh:
            h = fh.read()
        h = re.sub(r'<div class="v" data-k="b7p1u1">.*?</div>\s*</div>',
                   "</div>", h, count=1, flags=re.S)
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(h)
    out.append(("one of the printed renderings removed from the page", drop_block,
                "printed blocks disagree"))

    def drop_rule(d):
        p = os.path.join(d, "index.html")
        with open(p, encoding="utf-8") as fh:
            h = fh.read()
        h = re.sub(r'#b0:checked ~ #p0:checked ~ #u0:checked ~ \.out \.v\[data-k="b0p0u0"\]\{display:block\}\n?',
                   "", h, count=1)
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(h)
    out.append(("a printed rendering left with no rule to select it", drop_rule,
                "selecting rules disagree"))

    def unstart(d):
        p = os.path.join(d, "index.html")
        with open(p, encoding="utf-8") as fh:
            h = fh.read()
        h = h.replace('<input type="radio" name="budget" id="b4" checked>',
                      '<input type="radio" name="budget" id="b4">')
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(h)
    out.append(("the served page left in no setting at all", unstart,
                "the served page does not start in exactly one setting"))

    def strip_digest(d):
        src = load(d, "sources.json")
        src["fetched"][0]["sha256"] = "not-a-digest"
        save(d, "sources.json", src)
    out.append(("the fetched source's digest removed", strip_digest,
                "the fetched source has no digest"))

    def claim_committed(d):
        src = load(d, "sources.json")
        src["fetched"][0]["committed"] = True
        save(d, "sources.json", src)
    out.append(("a third-party file claimed as committed", claim_committed,
                "a third-party source file was committed"))

    def fake_quote(d):
        src = load(d, "sources.json")
        for it in src["internal"]:
            if it["where"].startswith("docs/"):
                it["text"] = "Ein Satz, der in dieser Datei nirgends steht, nicht ein Mal."
                break
        save(d, "sources.json", src)
    out.append(("a quotation that is not in the file it names", fake_quote,
                "a quotation is not in the file it names"))

    def resize(d):
        data = load(d, "data.json")
        data["this_page"]["bytes"] += 1
        save(d, "data.json", data)
    out.append(("the page's printed size moved", resize,
                "the page's printed size is not its size"))

    return out


def main():
    cases = corruptions()
    passed, holes = 0, []
    for name, fn, must in cases:
        with tempfile.TemporaryDirectory() as tmp:
            d = os.path.join(tmp, "s")
            shutil.copytree(HERE, d)
            fn(d)
            # check.py resolves the corpus from ULYSSES_REPO when it is set, so the
            # copy can sit anywhere and still read the twenty-two real pages.
            r = subprocess.run([sys.executable, os.path.join(d, "check.py")],
                               capture_output=True, text=True,
                               env={**os.environ, "PYTHONPATH": "", "ULYSSES_REPO": REPO})
            out = r.stdout + r.stderr
            if r.returncode == 0:
                holes.append((name, must, "check.py passed"))
            elif must not in out:
                holes.append((name, must, "failed, but not on the named check"))
            else:
                passed += 1
    print(f"{len(cases)} corruptions, {passed} caught by the named check")
    for name, must, why in holes:
        print(f"  HOLE  {name}: expected '{must}' — {why}")
    sys.exit(1 if holes else 0)


if __name__ == "__main__":
    main()
