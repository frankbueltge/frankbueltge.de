#!/usr/bin/env python3
"""Rebuild this artifact's page from its data and check what it says.

Runs offline. Exits non-zero on the first disagreement.

  1. NUMBERS  every <span class="n" data-k="..."> is recomputed from data/ and
              compared against the digits rendered.
  2. CLAIMS   every prediction verdict word on the page is compared against the
              verdict the registered rule produces from the data. Session 155's
              adversary flipped "refuted" to "confirmed" on a scratch copy and
              that page's checker still passed, because it verified numerals and
              not claims. This one fails.
  3. QUOTES   every quoted passage on the page is compared against the coding
              record, character for character.
  4. RENDER   the whole page is re-rendered from the data and compared byte for
              byte, so no sentence can be edited into the HTML by hand.

What it still cannot do is stated at the end of its own output, and in
VERIFICATION.md: it cannot check prose, and it cannot re-verify the four sources
that were reached only through a research tool and never written to disk.
"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from results import compute, OFFLINE_VERIFIABLE  # noqa: E402
import build  # noqa: E402

fails = []


def bad(msg):
    fails.append(msg)
    print("FAIL  " + msg)


def main():
    R = compute()
    SRC = json.load(open(os.path.join(HERE, "data", "sources.json")))
    page = open(os.path.join(HERE, "index.html"), encoding="utf-8").read()

    # 1. numbers
    # The key charset must admit uppercase: the codes S, P and N and keys like
    # groups_with_S are number keys too, and a lowercase-only pattern skipped
    # ten of the forty spans in silence — a checker that quietly checks less
    # than it claims is the defect this file exists to close.
    nums = re.findall(r'<span class="n" data-k="([A-Za-z0-9_]+)">([^<]*)</span>', page)
    declared = page.count('<span class="n" data-k="')
    if len(nums) != declared:
        bad("page carries %d number spans but only %d parsed" % (declared, len(nums)))
    if not nums:
        bad("no numbers found on the page at all")
    for key, shown in nums:
        if key not in R:
            bad("number %r on the page has no counterpart in the data" % key); continue
        v = R[key]
        if key in build.PCT and v <= 1:
            v = v * 100
        want = build.FMT[key].format(v)
        if shown != want:
            bad("number %s: page says %r, data gives %r" % (key, shown, want))
    print("checked %d rendered numbers" % len(nums))

    # 2. claims — the verdict words
    vs = re.findall(r'<span class="v ([a-z]+)" data-p="(P\d)">([^<]*)</span>', page)
    if len(vs) != len(R["predictions"]):
        bad("page shows %d prediction verdicts, %d were registered"
            % (len(vs), len(R["predictions"])))
    for cls, pid, word in vs:
        want = R["predictions"][pid]["verdict"]
        if word != want:
            bad("verdict %s: page says %r, the registered rule gives %r" % (pid, word, want))
        if cls != want:
            bad("verdict %s: styled as %r but the rule gives %r" % (pid, cls, want))
    print("checked %d prediction verdicts against the registered rules" % len(vs))

    # 3. quotes
    qs = re.findall(r'<blockquote class="q" data-src="([^"]+)" data-i="(\d+)">(.*?)</blockquote>',
                    page, re.S)
    if not qs:
        bad("no quoted passages found on the page")
    for sid, i, shown in qs:
        src = next((s for s in SRC["sources"] if s["id"] == sid), None)
        if src is None:
            bad("quote attributed to %r, which is not in the coding record" % sid); continue
        try:
            want = src["quotes"][int(i)]
        except IndexError:
            bad("quote %s[%s] does not exist in the coding record" % (sid, i)); continue
        if html.unescape(shown) != want:
            bad("quote %s[%s] on the page does not match the coding record" % (sid, i))
    print("checked %d quoted passages against the coding record" % len(qs))

    # 4. the whole render
    if build.render() != page:
        bad("index.html is not what the data renders — some of it was written by hand")
    else:
        print("page is byte-identical to the render from data")

    # what this checker does not cover, said out loud rather than left implied
    tool_only = [s["id"] for s in SRC["sources"] if s["quotes"] and s["id"] not in OFFLINE_VERIFIABLE]
    print("\nNOT COVERED BY THIS CHECKER:")
    print("  - prose. Every sentence outside a checked span is unverified by this script.")
    print("  - %d sources whose passages were reached only through a research tool and never"
          % len(tool_only))
    print("    written to disk, so their quotes cannot be re-verified offline: %s"
          % ", ".join(tool_only))

    if fails:
        print("\n%d CHECK(S) FAILED" % len(fails)); return 1
    print("\nall checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
