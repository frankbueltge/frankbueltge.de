#!/usr/bin/env python3
"""ANSWERED BY SILENCE — the builder.

Reads this repository and nothing else. No network, no model, no third-party module.

    python3 build.py            rebuild data.json and index.html
    python3 build.py --check    rebuild into memory and fail if either file differs

WHAT IS MEASURED. `REQUESTS.md` and `REQUESTS-ARCHIVE.md` are the one channel between this
practice and the architect. Every `## ` heading in them opens one block. For each block the
builder records who is speaking, whose hand first wrote it (the commit that introduced the
heading, found with git's pickaxe over both files, so a block that was later moved into the
archive is still credited to the commit that wrote it), how many words it holds, and when.

A LETTER is a block spoken by this practice. A BARLINE is a day on which the other side
spoke at all. A SITTING is one entry in `journal/` — the record of a night this room worked.
The WAIT of a letter runs from the day it was written to the next barline, or to today if
there is none, and the sittings inside that wait are the nights this practice sat down
without having heard back.

THE CLONE MUST BE COMPLETE. A shallow clone answers every blame and pickaxe question with
the import commit, which would make this work say that one hand wrote the whole record. The
build refuses to run unless the root commit of the history is the founding commit.
"""

import hashlib
import json
import os
import re
import subprocess
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
FILES = ["REQUESTS.md", "REQUESTS-ARCHIVE.md"]
TODAY = "2026-09-09"
FOUNDING_DATE = "2026-07-12"


def git(*args):
    out = subprocess.run(["git", "-C", ROOT] + list(args), capture_output=True, text=True)
    if out.returncode != 0:
        die("git " + " ".join(args) + " failed: " + out.stderr.strip())
    return out.stdout


def die(msg):
    sys.stderr.write("BUILD FAILED: " + msg + "\n")
    sys.exit(1)


# ---------------------------------------------------------------- the clone must be whole
def assert_history_complete():
    if git("rev-parse", "--is-shallow-repository").strip() != "false":
        die("the clone is shallow — every line would be attributed to the import commit. "
            "Run `git fetch --unshallow` before building.")
    roots = git("rev-list", "--max-parents=0", "HEAD").split()
    dates = [git("log", "-1", "--format=%ad", "--date=short", r).strip() for r in roots]
    if FOUNDING_DATE not in dates:
        die("history does not reach the founding commit of %s (found roots at %s)"
            % (FOUNDING_DATE, ", ".join(dates)))
    return {"root_commits": len(roots), "history_reaches": min(dates),
            "commits": int(git("rev-list", "--count", "HEAD").split()[0])}


# ------------------------------------------------------------------------ the channel
def first_commit(heading_line):
    """The commit that introduced this heading, across both channel files."""
    out = git("log", "-S", heading_line[:80], "--reverse", "--format=%H|%ad|%an",
              "--date=short", "--", *FILES).strip()
    if not out:
        die("no commit introduces the heading: " + heading_line[:80])
    sha, date, author = out.split("\n")[0].split("|")
    return sha[:9], date, author


def speaker_of(heading, hand):
    """Who is speaking, read off the heading as the channel writes them."""
    if heading.startswith("Seeds from the public"):
        return "public"
    if (heading.startswith("Seeds from the team") or heading.startswith("Team note")
            or heading.startswith("Direction —") or heading.startswith("Seed —")
            or "(Frank" in heading):
        return "other"
    if (heading.startswith("Ensemble —") or heading.startswith("Answer —")
            or heading.startswith("Report —")):
        return "practice"
    # A bare dated heading is a letter unless the hand that wrote it was not ours.
    return "other" if hand != "Ensemble" else "practice"


def read_channel():
    """Every block of the channel EXCEPT any written today. This session writes its own
    letter to this channel, as every session does, and a work that counted the letter its
    own session posted would be measuring its author's handwriting. Tonight's letter has no
    wait yet either: it was written after the last night this room sat down, which is this
    one. It is drawn nowhere and counted nowhere, and it will be letter 69 tomorrow."""
    blocks, skipped = [], []
    for fname in FILES:
        path = os.path.join(ROOT, fname)
        if not os.path.exists(path):
            die("missing channel file: " + fname)
        lines = open(path, encoding="utf-8").read().split("\n")
        heads = [i for i, l in enumerate(lines) if l.startswith("## ")]
        for n, i in enumerate(heads):
            end = heads[n + 1] if n + 1 < len(heads) else len(lines)
            body = "\n".join(lines[i:end])
            heading = lines[i][3:].strip()
            if TODAY in heading:
                skipped.append(heading)
                continue
            sha, cdate, hand = first_commit(lines[i])
            blocks.append({
                "file": fname, "line": i + 1, "heading": heading,
                "words": len(body.split()), "sha": sha, "date": cdate, "hand": hand,
                "speaker": speaker_of(heading, hand),
                "private": bool(re.search(r"wording private|paraphrased and dated", body, re.I)),
                "request_head": bool(re.search(r"\*\*Request:\*\*", body)),
            })
    blocks.sort(key=lambda b: (b["date"], b["file"], b["line"]))
    return blocks, skipped


# ------------------------------------------------------------------------- the sittings
def read_sittings():
    """One entry in journal/ is one night this room sat down. Two shapes, both counted:
    the dated day-files of the first weeks and the numbered session files after them."""
    out = []
    jdir = os.path.join(ROOT, "journal")
    for fn in sorted(os.listdir(jdir)):
        m = re.match(r"(\d{4}-\d{2}-\d{2})-session-(\d+)\.md$", fn)
        if m:
            out.append({"date": m.group(1), "session": int(m.group(2)), "file": "journal/" + fn})
            continue
        m = re.match(r"(\d{4}-\d{2}-\d{2})\.md$", fn)
        if m:
            out.append({"date": m.group(1), "session": None, "file": "journal/" + fn})
    out.sort(key=lambda s: (s["date"], s["session"] if s["session"] else 0))
    return out


def read_works():
    """The works this practice has finished. The work being built tonight is not among
    them: it is not finished until it lands, and a piece that counts itself is cheating."""
    out = []
    wdir = os.path.join(ROOT, "works")
    for fn in sorted(os.listdir(wdir)):
        m = re.match(r"(\d{4}-\d{2}-\d{2})-(.+)$", fn)
        if m and os.path.isdir(os.path.join(wdir, fn)) and m.group(1) < TODAY:
            out.append({"date": m.group(1), "name": m.group(2).replace("-", " ").upper(),
                        "path": "works/" + fn})
    return out


def days_between(a, b):
    from datetime import date
    ya, ma, da = (int(x) for x in a.split("-"))
    yb, mb, db = (int(x) for x in b.split("-"))
    return (date(yb, mb, db) - date(ya, ma, da)).days


# ----------------------------------------------------------------------------- assembly
def assemble():
    history = assert_history_complete()
    blocks, skipped_today = read_channel()
    sittings = read_sittings()
    works = read_works()

    letters = [b for b in blocks if b["speaker"] == "practice"]
    others = [b for b in blocks if b["speaker"] == "other"]
    public = [b for b in blocks if b["speaker"] == "public"]
    if not letters or not others:
        die("the channel parsed to one voice — the classifier is wrong")

    barline_dates = sorted({b["date"] for b in others})
    barlines = [{"date": d,
                 "blocks": sum(1 for b in others if b["date"] == d),
                 "words": sum(b["words"] for b in others if b["date"] == d),
                 "private": sum(1 for b in others if b["date"] == d and b["private"])}
                for d in barline_dates]

    for n, L in enumerate(letters, 1):
        nxt = next((d for d in barline_dates if d > L["date"]), None)
        end = nxt or TODAY
        inside = [s for s in sittings if L["date"] < s["date"] < end]
        # a sitting on the day the other side spoke has already heard it; a sitting on the
        # day the letter was written wrote it. Both are outside the wait, by construction.
        L["n"] = n
        L["next_other"] = nxt
        L["open"] = nxt is None
        L["wait_days"] = days_between(L["date"], end)
        L["sittings_in_wait"] = len(inside)
        L["sessions_in_wait"] = [s["session"] for s in inside if s["session"]]
        L["works_in_wait"] = [w["name"] for w in works if L["date"] < w["date"] < end]
        L["same_day"] = bool(nxt) and days_between(L["date"], nxt) == 0
        # the three mechanical readings of "answered"
        L["ever"] = nxt is not None
        L["before_next_sitting"] = nxt is not None and len(inside) == 0

    n_letters = len(letters)
    counts = {
        "ever": sum(1 for L in letters if L["ever"]),
        "before_next_sitting": sum(1 for L in letters if L["before_next_sitting"]),
        "same_day": sum(1 for L in letters if L["same_day"]),
    }
    silent = {k: n_letters - v for k, v in counts.items()}

    totals = {
        "blocks": len(blocks),
        "letters": n_letters,
        "letter_words": sum(L["words"] for L in letters),
        "other_blocks": len(others),
        "other_words": sum(b["words"] for b in others),
        "other_days": len(barline_dates),
        "other_private": sum(1 for b in others if b["private"]),
        "other_by_our_hand": sum(1 for b in others if b["hand"] == "Ensemble"),
        "public_blocks": len(public),
        "public_words": sum(b["words"] for b in public),
        "channel_words": sum(b["words"] for b in blocks),
        "sittings": len(sittings),
        # letter-nights: one letter waiting through one night. Waits overlap, so this is
        # larger than the number of nights.
        "letter_nights": sum(L["sittings_in_wait"] for L in letters),
        "nights_with_open_letter": len({s["date"] for s in sittings for L in letters
                                        if not L["before_next_sitting"]
                                        and L["date"] < s["date"] < (L["next_other"] or TODAY)}),
        "works": len(works),
        "works_in_silent_waits": len({w for L in letters if not L["before_next_sitting"]
                                      for w in L["works_in_wait"]}),
        "letters_with_request_head": sum(1 for L in letters if L["request_head"]),
        "request_heads_silent": sum(1 for L in letters
                                    if L["request_head"] and not L["before_next_sitting"]),
        "longest_wait": max(L["wait_days"] for L in letters),
        "most_sittings": max(L["sittings_in_wait"] for L in letters),
        "span_days": days_between(min(b["date"] for b in blocks), TODAY),
        "hands": dict(Counter(b["hand"] for b in blocks)),
        "written_today_and_not_counted": len(skipped_today),
    }

    return {
        "title": "ANSWERED BY SILENCE",
        "date": TODAY,
        "practice": "The Studio — Ensemble",
        "session": 132,
        "cycle": 3,
        "question": "Missing Data Art (seed-20260907-220129-aa5f)",
        "history": history,
        "totals": totals,
        "counts_answered": counts,
        "counts_silent": silent,
        "barlines": barlines,
        "letters": [{k: L[k] for k in ("n", "date", "heading", "words", "file", "line", "sha",
                                       "wait_days", "sittings_in_wait", "sessions_in_wait",
                                       "works_in_wait", "next_other", "open", "ever",
                                       "before_next_sitting", "same_day", "request_head")}
                    for L in letters],
        "sittings": [s["date"] for s in sittings],
        "works": works,
    }


# ------------------------------------------------------------------------------ the page
def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def sp(n):
    return f"{n:,}".replace(",", " ")


def render(d):
    T, C, S = d["totals"], d["counts_answered"], d["counts_silent"]
    letters, barlines = d["letters"], d["barlines"]
    first = min([b["date"] for b in barlines] + [L["date"] for L in letters])
    span = days_between(first, TODAY)

    # ---- the score ------------------------------------------------------------------
    PAD_L, PAD_R, PAD_T, ROW = 54, 30, 34, 12.4
    W = 1000
    H = PAD_T + ROW * len(letters) + 46
    plot = W - PAD_L - PAD_R
    x = lambda date: PAD_L + plot * days_between(first, date) / span
    y = lambda i: PAD_T + ROW * i + ROW / 2

    g = []
    # months
    for label, date in (("July", "2026-07-15"), ("August", "2026-08-01"),
                        ("September", "2026-09-01")):
        g.append(f'<text class="mon" x="{x(date):.1f}" y="16">{label}</text>')
    # barlines: the days the other side spoke
    for b in barlines:
        bx = x(b["date"])
        g.append(f'<line class="bar" x1="{bx:.1f}" y1="24" x2="{bx:.1f}" y2="{H-34:.1f}"/>')
        g.append(f'<rect class="barcap" x="{bx-2.4:.1f}" y="{H-34:.1f}" width="4.8" '
                 f'height="{2.2 + min(9.0, b["words"]/260):.1f}"><title>The other side spoke on '
                 f'{b["date"]}: {b["blocks"]} block(s), {sp(b["words"])} words. Not quoted here.'
                 f'</title></rect>')
    # letters
    for i, L in enumerate(letters):
        yy = y(i)
        x0, x1 = x(L["date"]), x(L["next_other"] or TODAY)
        cls = "wait" + (" silent" if not L["before_next_sitting"] else " heard")
        cls += " open" if L["open"] else ""
        g.append(f'<g class="row" data-n="{L["n"]}" data-ever="{int(L["ever"])}" '
                 f'data-next="{int(L["before_next_sitting"])}" data-same="{int(L["same_day"])}">')
        g.append(f'<rect class="hit" x="0" y="{yy-ROW/2:.1f}" width="{W}" height="{ROW:.1f}"/>')
        g.append(f'<line class="{cls}" x1="{x0:.1f}" y1="{yy:.1f}" x2="{x1:.1f}" y2="{yy:.1f}"/>')
        r = 1.5 + (L["words"] ** 0.5) / 12.0
        g.append(f'<circle class="post" cx="{x0:.1f}" cy="{yy:.1f}" r="{r:.2f}"/>')
        for s in d["sittings"]:
            if L["date"] < s < (L["next_other"] or TODAY):
                sx = x(s)
                g.append(f'<line class="sit" x1="{sx:.1f}" y1="{yy-3.1:.1f}" x2="{sx:.1f}" '
                         f'y2="{yy+3.1:.1f}"/>')
        g.append(f'<text class="num" x="{PAD_L-9:.1f}" y="{yy+3.1:.1f}">{L["n"]}</text>')
        g.append("</g>")
    score = "\n".join(g)

    # ---- the catalogue --------------------------------------------------------------
    rows = []
    for L in letters:
        w = L["works_in_wait"]
        rows.append(
            '<tr class="{cls}" id="L{n}">'
            '<td class="n">{n}</td><td class="d">{date}</td>'
            '<td class="h">{h}<span class="src">{file}:{line} · {sha} · {words} words</span></td>'
            '<td class="num">{wd}</td><td class="num sitn">{st}</td>'
            '<td class="wk">{wk}</td></tr>'.format(
                cls=("heard" if L["before_next_sitting"] else "silent") + (" open" if L["open"] else ""),
                n=L["n"], date=L["date"], h=esc(L["heading"]), file=L["file"], line=L["line"],
                sha=L["sha"], words=sp(L["words"]), wd=L["wait_days"],
                st=L["sittings_in_wait"] or "—",
                wk=("<br>".join(esc(x) for x in w) if w else "—")))
    catalogue = "\n".join(rows)

    others = "\n".join(
        '<li><span class="od">{d}</span><span class="ow">{b} block{s} · {w} words</span>'
        '<span class="op">{p}</span></li>'.format(
            d=b["date"], b=b["blocks"], s="" if b["blocks"] == 1 else "s", w=sp(b["words"]),
            p="wording declared private" if b["private"] else "")
        for b in barlines)

    longest = max(letters, key=lambda L: L["wait_days"])
    most = max(letters, key=lambda L: L["sittings_in_wait"])

    fields = {
        "SCORE": score, "CATALOGUE": catalogue, "OTHERS": others,
        "W": W, "H": int(H), "SPAN": span, "TODAY": TODAY, "SESSION": d["session"],
        "N_LETTERS": T["letters"], "LETTER_WORDS": sp(T["letter_words"]),
        "OTHER_BLOCKS": T["other_blocks"], "OTHER_WORDS": sp(T["other_words"]),
        "OTHER_DAYS": T["other_days"], "OTHER_PRIVATE": T["other_private"],
        "SITTINGS": T["sittings"], "LETTER_NIGHTS": sp(T["letter_nights"]),
        "NIGHTS_OPEN": T["nights_with_open_letter"],
        "WORKS_IN_WAITS": T["works_in_silent_waits"], "WORKS": T["works"],
        "SILENT_NEXT": S["before_next_sitting"], "HEARD_NEXT": C["before_next_sitting"],
        "SILENT_EVER": S["ever"], "SILENT_SAME": S["same_day"],
        "CHANNEL_WORDS": sp(T["channel_words"]),
        "LONGEST_DAYS": longest["wait_days"], "LONGEST_N": longest["n"],
        "LONGEST_DATE": longest["date"], "MOST_SIT": most["sittings_in_wait"],
        "MOST_N": most["n"], "MOST_DATE": most["date"],
        "REQUEST_HEADS": T["letters_with_request_head"],
        "REQUEST_SILENT": T["request_heads_silent"], "COMMITS": d["history"]["commits"],
        "NEXT_LETTER": T["letters"] + 1,
        "PCT_SILENT": ("%.1f" % (100.0 * S["before_next_sitting"] / T["letters"])),
        "DATA_JSON": json.dumps({"letters": [{"n": L["n"], "ever": L["ever"],
                                              "next": L["before_next_sitting"],
                                              "same": L["same_day"]} for L in letters]},
                                separators=(",", ":")),
    }
    tpl_path = os.path.join(HERE, "page.template.html")
    if not os.path.exists(tpl_path):
        die("page.template.html is missing")
    html = open(tpl_path, encoding="utf-8").read()
    for key, val in fields.items():
        html = html.replace("[[" + key + "]]", str(val))
    left = re.findall(r"\[\[[A-Z_]+\]\]", html)
    if left:
        die("unfilled placeholders in the page: " + ", ".join(sorted(set(left))))
    return html


def main():
    check = "--check" in sys.argv
    d = assemble()
    data_txt = json.dumps(d, indent=1, ensure_ascii=False) + "\n"
    html = render(d)
    dp = os.path.join(HERE, "data.json")
    hp = os.path.join(HERE, "index.html")
    if check:
        bad = []
        for path, txt in ((dp, data_txt), (hp, html)):
            have = open(path, encoding="utf-8").read() if os.path.exists(path) else None
            if have != txt:
                bad.append(os.path.basename(path))
        if bad:
            die("rebuild differs from what is committed: " + ", ".join(bad))
        print("--check: data.json and index.html are byte-identical to a fresh build.")
        return
    open(dp, "w", encoding="utf-8").write(data_txt)
    open(hp, "w", encoding="utf-8").write(html)
    T = d["totals"]
    print("letters %d (%s words) · other side %d blocks on %d days (%s words)"
          % (T["letters"], sp(T["letter_words"]), T["other_blocks"], T["other_days"],
             sp(T["other_words"])))
    print("answered before our next sitting: %d · answered by silence: %d"
          % (d["counts_answered"]["before_next_sitting"], d["counts_silent"]["before_next_sitting"]))
    print("nights with a letter open: %d (%d letter-nights) · works made inside a silent wait: %d of %d"
          % (T["nights_with_open_letter"], T["letter_nights"], T["works_in_silent_waits"],
             T["works"]))
    print("index.html %d bytes · sha256 %s"
          % (len(html.encode()), hashlib.sha256(html.encode()).hexdigest()[:16]))


if __name__ == "__main__":
    main()
