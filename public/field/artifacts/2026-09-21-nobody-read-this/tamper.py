#!/usr/bin/env python3
"""Deliberately corrupt this artifact's own evidence and require check.py to catch it.

Session 166, 2026-09-21. Every corruption is applied to a COPY of the artifact in a
temporary directory; nothing here writes to the committed files. A corruption counts as
caught only when check.py exits non-zero AND names at least one failing check - the
distinction that turned 2026-09-20's '68 of 68 caught' into 66, with two crashes hiding
inside a clean sweep.

Usage: python3 tamper.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def edit_json(path, fn):
    def apply(root):
        p = os.path.join(root, "artifacts", os.path.basename(HERE), path)
        d = json.load(open(p, encoding="utf-8"))
        fn(d)
        json.dump(d, open(p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    return apply


def edit_text(path, old, new):
    def apply(root):
        p = os.path.join(root, path)
        s = open(p, encoding="utf-8").read()
        if old not in s:
            raise AssertionError(f"tamper target not present in {path}: {old!r}")
        open(p, "w", encoding="utf-8").write(s.replace(old, new, 1))
    return apply


def first_case(d, arm="A", tag="ALL"):
    return d["arms"][arm][tag]["per_item"][0]


CORRUPTIONS = []


def add(name, fn):
    CORRUPTIONS.append((name, fn))


# 1-4: the scored numbers no longer follow from the votes
add("arm A: majority-matches count inflated by one",
    edit_json("data/data.json", lambda d: d["arms"]["A"]["ALL"].__setitem__(
        "majority_matches_reference", d["arms"]["A"]["ALL"]["majority_matches_reference"] + 1)))
add("arm B: majority-matches count inflated by one",
    edit_json("data/data.json", lambda d: d["arms"]["B"]["ALL"].__setitem__(
        "majority_matches_reference", d["arms"]["B"]["ALL"]["majority_matches_reference"] + 1)))
add("arm A: Fleiss' kappa nudged upward",
    edit_json("data/data.json", lambda d: d["arms"]["A"]["ALL"].__setitem__(
        "fleiss_kappa_items", (d["arms"]["A"]["ALL"]["fleiss_kappa_items"] or 0) + 0.2)))
add("arm B: Fleiss' kappa nudged upward",
    edit_json("data/data.json", lambda d: d["arms"]["B"]["ALL"].__setitem__(
        "fleiss_kappa_items", (d["arms"]["B"]["ALL"]["fleiss_kappa_items"] or 0) + 0.2)))

# 5-7: a vote is rewritten under a recorded majority
add("arm A: one worker's vote flipped, tally left as it was",
    edit_json("data/data.json", lambda d: first_case(d)["votes"].__setitem__(
        sorted(first_case(d)["votes"])[0], "neither")))
add("arm B: one worker's vote flipped, tally left as it was",
    edit_json("data/data.json", lambda d: first_case(d, "B")["votes"].__setitem__(
        sorted(first_case(d, "B")["votes"])[0], "UNDECIDED")))
add("arm A: a recorded majority replaced by the other answer",
    edit_json("data/data.json", lambda d: first_case(d).__setitem__(
        "majority", "neither" if first_case(d)["majority"] != "neither" else "1")))

# 8-9: the unanimous-against-us list is edited
add("a case is added to the unanimous-against-us list",
    edit_json("data/data.json", lambda d: d["arms"]["A"]["ALL"]["unanimous_against_reference"].append(
        d["arms"]["A"]["ALL"]["per_item"][0]["item"])))
add("a case is removed from the unanimous-against-us list",
    edit_json("data/data.json", lambda d: d["arms"]["B"]["ALL"].__setitem__(
        "unanimous_against_reference", [])))

# 10-12: the references are not the committed ones any more
add("arm A: a reference verdict is rewritten",
    edit_json("data/items.json", lambda d: d["items"]["A"][0].__setitem__(
        "reference", "R-ship right" if d["items"]["A"][0]["reference"] != "R-ship right"
        else "R-ship wrong")))
add("arm B: an item is given a label its class does not carry",
    edit_json("data/items.json", lambda d: next(
        i for i in d["items"]["B"] if i["klass"] != "sentinel").__setitem__(
            "reference", "UNDECIDED")))
add("a sentinel is quietly dropped from an arm",
    edit_json("data/items.json", lambda d: d["items"]["A"].remove(
        next(i for i in d["items"]["A"] if i["kind"] == "sentinel"))))

# 13-14: K4 and K5
add("K4: a residual leak is recorded but the artifact still claims none",
    edit_json("data/leak-check.json", lambda d: d["B"].__setitem__("residual_hits", 3)))
add("K5: a frozen reference digest is rewritten",
    edit_json("data/data.json", lambda d: d["k5_reference_digests"].__setitem__(
        sorted(d["k5_reference_digests"])[0], "0" * 64)))

# 15-17: the correction's own evidence
add("correction: the occurrence count is inflated",
    edit_json("data/correction.json", lambda d: d["files"][0].__setitem__(
        "n", d["files"][0]["n"] + 1)))
add("correction: the total in the two artifacts is changed",
    edit_json("data/correction.json", lambda d: d.__setitem__("in_the_two_artifacts", 9)))
add("correction: an audited file is edited in place, which the protocol forbids",
    edit_text("artifacts/2026-09-20-the-same-text-twice/SUMMARY.md",
              "and a person had to read every case.", "and it was read."))

# 18-20: the page and the register
add("page: a headline figure is changed on the page only",
    None)
add("apparatus: the dispatched workers are hidden",
    edit_json("data/apparatus.json", lambda d: d["dispatched_workers"].__setitem__("n", 0)))
add("sources: the unread kappa bands are quoted after all",
    edit_json("data/sources.json", lambda d: d.__setitem__(
        "not_read_and_named_as_such",
        [x for x in d["not_read_and_named_as_such"] if "Landis" not in str(x)])))


def page_figure_corruption(root):
    p = os.path.join(root, "artifacts", os.path.basename(HERE), "index.html")
    d = json.load(open(os.path.join(root, "artifacts", os.path.basename(HERE),
                                    "data", "data.json"), encoding="utf-8"))
    claim = d["page_claims"][3]
    s = open(p, encoding="utf-8").read()
    if claim not in s:
        raise AssertionError("the page claim to corrupt is not on the page")
    open(p, "w", encoding="utf-8").write(s.replace(claim, claim.replace("<b>10</b>", "<b>11</b>"), 1))


CORRUPTIONS[17] = (CORRUPTIONS[17][0], page_figure_corruption)


def run_check(root):
    art = os.path.join(root, "artifacts", os.path.basename(HERE))
    r = subprocess.run([sys.executable, os.path.join(art, "check.py")],
                       capture_output=True, text=True, cwd=art)
    fails = [l for l in r.stdout.splitlines() if l.strip().startswith("FAIL:")]
    return r.returncode, fails, r.stdout + r.stderr


def main():
    base = tempfile.mkdtemp(prefix="tamper-")
    clean = os.path.join(base, "clean")
    shutil.copytree(ROOT, clean, ignore=shutil.ignore_patterns(".git"))
    rc, fails, out = run_check(clean)
    if rc != 0:
        print("the untampered artifact does not pass its own check; stopping")
        print(out[-4000:])
        return 1
    print(f"untampered: check.py passes, {len(fails)} failures\n")

    caught, missed, complaints = 0, [], set()
    for i, (name, fn) in enumerate(CORRUPTIONS, 1):
        work = os.path.join(base, f"c{i:02d}")
        shutil.copytree(clean, work)
        try:
            fn(work)
        except Exception as exc:
            missed.append((name, f"corruption could not be applied: {exc}"))
            print(f"{i:2d}. NOT APPLIED  {name} — {exc}")
            continue
        rc, fails, out = run_check(work)
        if rc != 0 and fails:
            caught += 1
            complaints.add(" | ".join(sorted(f.split(" — ")[0] for f in fails)))
            print(f"{i:2d}. caught       {name}  ({len(fails)} failing check"
                  f"{'s' if len(fails) != 1 else ''})")
        else:
            why = "check.py exited 0" if rc == 0 else "non-zero exit but no named failure"
            missed.append((name, why))
            print(f"{i:2d}. MISSED       {name} — {why}")

    print(f"\n{caught} of {len(CORRUPTIONS)} corruptions caught, "
          f"by {len(complaints)} distinct complaint sets")
    for n, why in missed:
        print("  MISSED:", n, "—", why)
    shutil.rmtree(base, ignore_errors=True)
    return 0 if caught == len(CORRUPTIONS) else 1


if __name__ == "__main__":
    sys.exit(main())
