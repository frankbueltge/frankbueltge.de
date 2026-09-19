#!/usr/bin/env python3
"""The figures this practice states about itself, derived from the repository.

Session 31 found that the pre-registered session floor had been read for eleven
days off a count of files in `record/`, which includes eight protocols written
before the window opened, and that six protocols had repeated the wrong number
without one of them deriving it. The I7 entry of that date named why it had
been possible: every instrument this practice had built — `probe.py`,
`ordering.py`, the guard channel, the daily payload diff — points outward at the
earthquake record, and a figure drawn from that record has an adversary. It
moves; it will contradict a wrong reading. **A figure the practice states about
itself has no adversary at all.** It is true when written and stays true by
being repeated.

That entry added a fourth question to this practice's three — *what in the world
would contradict this, if it were wrong?* — and conceded that nothing had been
audited with it. This file is the answer to that: the adversary, written down.

It reads only this repository, writes nothing into it, and for each figure it
prints what the record **claims** beside what the repository **derives**. A
figure it cannot derive is printed as underivable rather than passed.

    python3 apparatus/self-figures.py [--repo DIR]

What a disagreement here means is not settled by this file. Some are errors and
some are counters whose rule was never written down, and telling those apart is
a session's work, not a script's. What the file removes is the possibility of
the question never being asked.
"""

import argparse
import datetime as dt
import os
import re
import subprocess
import sys

WINDOW_OPEN = dt.date(2026, 8, 23)
WINDOW_CLOSE = dt.date(2026, 9, 21)
FIRST_SEEN_ITERATION = 2  # CHANNEL.md, entry of 2026-08-23 evening

ORDINALS = {
    "first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5,
    "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9, "tenth": 10,
    "eleventh": 11, "twelfth": 12, "thirteenth": 13, "fourteenth": 14,
    "fifteenth": 15, "sixteenth": 16, "seventeenth": 17, "eighteenth": 18,
    "nineteenth": 19, "twentieth": 20, "twenty-first": 21,
    "twenty-second": 22, "twenty-third": 23, "twenty-fourth": 24,
    "twenty-fifth": 25, "twenty-sixth": 26,
}
CARDINALS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
    "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11,
    "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20, "none": 0,
}


def flat(path):
    """One line, without emphasis marks, so a wrapped claim is findable.

    The record is written in markdown and a claim is routinely split across a
    line break and carries bold marks in the middle of it. Both are removed
    here, because a figure that escapes the audit through a `**` is exactly
    the kind of escape this file exists to close.
    """
    with open(path, encoding="utf-8") as f:
        return re.sub(r"\s+", " ", re.sub(r"[*`]", "", f.read()))


def protocols(repo):
    """Every session protocol, in date-and-session order, with its phase."""
    out = []
    d = os.path.join(repo, "record")
    for name in sorted(os.listdir(d)):
        m = re.match(r"(\d{4})-(\d{2})-(\d{2})-session-(\d+)\.md$", name)
        if not m:
            continue
        date = dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        out.append({
            "file": name,
            "path": os.path.join(d, name),
            "date": date,
            "n": int(m.group(4)),
            "in_window": date >= WINDOW_OPEN,
        })
    out.sort(key=lambda p: (p["date"], p["n"]))
    return out


def iterations(repo):
    """Which session's commit first added each iteration of the work.

    Derived from git, not from the protocols: the protocols are what is being
    audited, so they cannot also be the ground.
    """
    out = {}
    work = os.path.join(repo, "works", "arrival")
    if not os.path.isdir(work):
        return out
    for name in sorted(os.listdir(work)):
        m = re.match(r"iteration-(\d+)$", name)
        if not m:
            continue
        rel = f"works/arrival/{name}/build.py"
        try:
            line = subprocess.run(
                ["git", "-C", repo, "log", "--diff-filter=A", "--format=%ad|%s",
                 "--date=short", "-1", "--", rel],
                capture_output=True, text=True, check=True).stdout.strip()
        except subprocess.CalledProcessError:
            continue
        if not line:
            continue
        date, subject = line.split("|", 1)
        ms = re.search(r"[Ss]ession (\d+)", subject)
        out[int(m.group(1))] = {
            "date": dt.date.fromisoformat(date),
            "session": int(ms.group(1)) if ms else None,
            "subject": subject,
        }
    return out


def candidate_at(iters, proto):
    """The newest iteration in existence at the end of a given protocol."""
    best = None
    for n, info in sorted(iters.items()):
        if info["date"] < proto["date"]:
            best = n
        elif info["date"] == proto["date"]:
            # Two sessions have shared a civil date; the commit subject names
            # the session, so use it where it is there.
            if info["session"] is None or info["session"] <= proto["n"]:
                best = n
    return best


def founder_entries(repo):
    """Dates on which the coupled human spoke in the channel."""
    t = flat(os.path.join(repo, "CHANNEL.md"))
    dates = []
    for m in re.finditer(r"## (?:entry|answer|note|go-ahead) — (\d{4}-\d{2}-\d{2})"
                         r"[^#]{0,80}?\(founder", t):
        dates.append(dt.date.fromisoformat(m.group(1)))
    return sorted(set(dates))


def row(label, claimed, derived, note=""):
    if claimed is None:
        state = "not claimed"
    elif derived is None:
        state = "UNDERIVABLE"
    elif claimed == derived:
        state = "agrees"
    else:
        state = "DISAGREES"
    c = "-" if claimed is None else str(claimed)
    d = "-" if derived is None else str(derived)
    print(f"  {label:<34s} claimed {c:>5s}  derived {d:>5s}  {state}"
          + (f"   {note}" if note else ""))
    return claimed is not None and derived is not None and claimed != derived


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))))
    args = ap.parse_args()
    repo = args.repo

    protos = protocols(repo)
    window = [p for p in protos if p["in_window"]]
    iters = iterations(repo)
    founder = founder_entries(repo)
    bad = 0

    print("== the inventory, derived ==")
    print(f"  protocols in record/            : {len(protos)}")
    print(f"  of them Phase 0 (before {WINDOW_OPEN}) : "
          f"{len(protos) - len(window)}")
    print(f"  protocols inside the window     : {len(window)}")
    print(f"  iterations of works/arrival     : {len(iters)}")
    print(f"  founder entries in CHANNEL.md   : {len(founder)} "
          f"(last {founder[-1] if founder else '-'})")

    print("\n== day of the window, per protocol ==")
    for p in window:
        t = flat(p["path"])
        m = re.search(r"[Dd]ay (\d+|[a-z-]+) of the (?:30|thirty)", t)
        claimed = None
        if m:
            g = m.group(1)
            claimed = int(g) if g.isdigit() else CARDINALS.get(g)
        derived = (p["date"] - WINDOW_OPEN).days + 1
        if row(p["file"][:28], claimed, derived):
            bad += 1

    print("\n== days of the window with no protocol ==")
    have = {p["date"] for p in protos}
    last = max(p["date"] for p in protos)
    missing = []
    d = WINDOW_OPEN
    while d <= min(last, WINDOW_CLOSE):
        if d not in have:
            missing.append(d)
        d += dt.timedelta(days=1)
    print(f"  {len(missing)} through {min(last, WINDOW_CLOSE)}: "
          + ", ".join(str(x) for x in missing))

    print("\n== the version the founder has seen, in iterations ==")
    print(f"  (the version first seen is iteration {FIRST_SEEN_ITERATION}; "
          f"CHANNEL.md, 2026-08-23 evening)")
    for p in window:
        t = flat(p["path"])
        m = re.search(r"version now ([a-z-]+) iterations old", t)
        if not m:
            continue
        claimed = CARDINALS.get(m.group(1))
        cand = candidate_at(iters, p)
        derived = None if cand is None else cand - FIRST_SEEN_ITERATION
        if row(p["file"][:28], claimed, derived,
               f"candidate iteration {cand}"):
            bad += 1

    print("\n== sessions since the coupled human last spoke ==")
    for p in window:
        t = flat(p["path"])
        m = re.search(r"channel is silent since ([^,]{1,24}), "
                      r"now for the ([a-z-]+) session", t)
        if not m:
            continue
        claimed = ORDINALS.get(m.group(2))
        spoke = [f for f in founder if f < p["date"]]
        derived = None
        if spoke:
            since = spoke[-1]
            derived = len([q for q in window
                           if q["date"] > since and q["date"] <= p["date"]])
        if row(p["file"][:28], claimed, derived,
               f"last founder entry {spoke[-1] if spoke else '-'}"):
            bad += 1

    print("\n== sessions a page check has stood unanswered ==")
    q = flat(os.path.join(repo, "queries.md"))
    reqs = sorted({dt.date.fromisoformat(m) for m in
                   re.findall(r"## request — (\d{4}-\d{2}-\d{2})", q)})
    answered = re.findall(r"## answer — (\d{4}-\d{2}-\d{2})", q)
    print(f"  requests {[str(r) for r in reqs]}, answers {answered or 'none'}")
    first = reqs[0] if reqs else None
    for p in window:
        t = flat(p["path"])
        m = re.search(r"(?:requests of 2026-09-06 stand unanswered for the"
                      r"|of 2026-09-06, now standing for the) ([a-z-]+) "
                      r"session", t)
        if not m or first is None:
            continue
        claimed = ORDINALS.get(m.group(1))
        derived = len([x for x in window
                       if x["date"] > first and x["date"] <= p["date"]])
        if row(p["file"][:28], claimed, derived,
               "counted from the session after the request"):
            bad += 1

    print("\n== the registers ==")
    for name, label in (("i7-virtuality-register.md", "I7"),
                        ("i7b-passio-register.md", "I7b")):
        path = os.path.join(repo, "registers", name)
        n = len(re.findall(r"## entry", flat(path)))
        last = flat(protos[-1]["path"])
        m = re.search(label + r"[^.]{0,200}?register stands at ([a-z-]+)", last)
        claimed = CARDINALS.get(m.group(1)) if m else None
        if row(f"{label} entries", claimed, n, "last protocol's claim"):
            bad += 1

    print("\n== I4: one data point per session, numbered ==")
    seq = []
    for p in window:
        t = flat(p["path"])
        m = re.search(r"I4 \(advantage probe\)[^.]{0,120}?"
                      r"(?:an?|the) ([a-z-]+) (?:ambiguous )?data point", t)
        if m and ORDINALS.get(m.group(1)):
            seq.append((p["file"], ORDINALS[m.group(1)]))
    ok = all(b - a == 1 for (_, a), (_, b) in zip(seq, seq[1:]))
    print(f"  {len(seq)} numbered data point(s), "
          f"{seq[0][1] if seq else '-'} to {seq[-1][1] if seq else '-'}: "
          + ("each one more than the last" if ok else "NOT CONSECUTIVE"))
    if not ok:
        bad += 1

    print("\n== the pre-registered floor ==")
    print(f"  PREREGISTRATION.md fixes 30 days AND >= 25 sessions.")
    print(f"  protocols inside the window so far : {len(window)}")
    scheduled_left = len([d for d in
                          (WINDOW_OPEN + dt.timedelta(days=i)
                           for i in range((WINDOW_CLOSE - WINDOW_OPEN).days + 1))
                          if d > max(p["date"] for p in protos)])
    print(f"  scheduled nights still to come     : {scheduled_left}")
    print(f"  most the schedule alone reaches    : "
          f"{len(window) + scheduled_left} against a floor of 25")

    print(f"\n{bad} disagreement(s). A disagreement is a question, not a "
          f"verdict; the session that runs this says which.")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
