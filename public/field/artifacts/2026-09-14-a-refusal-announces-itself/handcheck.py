#!/usr/bin/env python3
"""The hand check of PREREGISTRATION.md §4.4.

No quotation is counted ABSENT on the matcher's word alone. For every quotation
the matcher calls ABSENT this prints, for a person to read: the quotation, its
longest run that does occur in the paper, and the passage of the paper that
shares the most content words with it - the place the quotation would have come
from if it came from anywhere. The judgement is then recorded by hand in
data/handcheck.json.

Usage: python3 handcheck.py <work-dir>
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from match import content_words, words  # noqa: E402


def longest_run(q, hay_words):
    hay = " " + " ".join(hay_words) + " "
    best = ""
    n = len(q)
    for i in range(n):
        for k in range(len(best) and 0 or 1, n - i + 1):
            cand = " ".join(q[i:i + k])
            if " " + cand + " " in hay:
                if len(cand.split()) > len(best.split()):
                    best = cand
            else:
                break
    return best


def nearest_passage(q, hay_words, win=40):
    cw = set(content_words(" ".join(q)))
    if not cw:
        return ""
    best, score = 0, -1
    for i in range(0, max(1, len(hay_words) - win), 10):
        s = len(cw & set(hay_words[i:i + win]))
        if s > score:
            best, score = i, s
    return " ".join(hay_words[best:best + win])


def main():
    work = sys.argv[1]
    qs = json.load(open("data/quotations.json", encoding="utf-8"))["quotations"]
    wanted = sys.argv[2] if len(sys.argv) > 2 else "ABSENT"
    todo = [q for q in qs if q["classification"] == wanted]
    print("%s quotations to check by hand: %d\n" % (wanted, len(todo)))
    for q in todo:
        texts = [open(p, encoding="utf-8").read() for p in
                 sorted(glob.glob(os.path.join(work, "txt", q["arxiv_id"] + ".*.txt")))]
        hay = words(max(texts, key=len)) if texts else []
        qw = words(q["text"])
        print("=" * 78)
        print("%s  quote %d  coverage %.3f  content_overlap %.3f"
              % (q["item_id"], q["index"], q["coverage"] or 0,
                 q["content_overlap"] or 0))
        print("SECTION CLAIMED:", q["section_claimed"])
        print("RETURNED:", q["text"])
        print("LONGEST RUN THAT IS IN THE PAPER:", longest_run(qw, hay) or "(none)")
        print("NEAREST PASSAGE IN THE PAPER:", nearest_passage(qw, hay))
        print()


if __name__ == "__main__":
    main()
