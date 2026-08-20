#!/usr/bin/env python3
"""Re-verification of the reading's ATP citations against the cited edition.

Discharges the remedy of the apparatus limitation in `reading/00-protocol.md`
("If the practice ever gains direct access to the edition, citations are
re-verified and the re-verification dated"), executed 2026-08-18 by the session
recorded in `nights/22-seventeenth-bell.md`.

Source: the founder's private repository `frankbueltge/material` —
`atp.pages.txt`, the Massumi 1987 edition extracted and tagged by printed page
number (its README documents the tagging and its caveats). The repository is
private and in copyright: this script emits **verdicts, page numbers and
fragment lengths only** — no text of the edition leaves it. Re-running requires
read access to that repository; the results file commits what the run found.

Method (the material README's own caveat drives it):
1. `atp.pages.txt` is parsed into pages. Printed numbers are taken from
   `[[ATP p. N]]` markers; for unmarked pages (`[[ATP pdf N ...]]`), a printed
   number is inferred when the nearest confirmed neighbours bracket the page
   consistently (prev printed p at distance d, next printed q at distance e,
   q - p == d + e). Verdicts distinguish confirmed from inferred markers.
2. Quotations are extracted from `reading/*.md` as `"..."` followed within a
   short window by `(ATP <pages>...)`. Quotes containing backticks are
   excluded as extraction artifacts and counted.
3. Each quotation is split at elisions ([...], ...) bracketed interpolations,
   and single-quote boundaries (composite quotations wrapping an inner ATP
   quotation test the inner quotation on its own); fragments of >= 12 letters
   are normalized letter-only (strip all non a-z, lowercase — the material
   README's remedy for hyphenation and column spacing).
4. Each fragment is searched on the cited page(s); then on adjacent pages
   (page-break straddles, reported as such); then across the whole tagged
   text with the landing page reported; then fuzzily on the cited page(s)
   (substitutions only, at most max(1, len//25) mismatches — the OCR-deviation
   class); fragments still unfound are checked against `foundation/` to
   classify KsK's own wording carrying an ATP citation.
"""
import json, re, glob, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
MATERIAL = os.environ.get("ATP_PAGES", "/home/user/material/atp.pages.txt")
READING = os.path.join(REPO, "reading")
FOUNDATION = os.path.join(REPO, "foundation", "cartography-not-tracing.en.md")

def norm(s):
    return re.sub(r"[^a-z]", "", s.lower())

# ---- 1. parse pages, infer printed numbers ----
pages, order = {}, []
cur = None
with open(MATERIAL, encoding="utf-8", errors="replace") as f:
    for line in f:
        m = re.match(r"\[\[ATP p\. (\d+)\]\]", line)
        m2 = re.match(r"\[\[ATP pdf (\d+)[^\]]*\]\]", line)
        if m:
            cur = ("p", int(m.group(1))); pages[cur] = []; order.append(cur)
        elif m2:
            cur = ("x", int(m2.group(1))); pages[cur] = []; order.append(cur)
        elif cur is not None:
            pages[cur].append(line)
npages = {k: norm("".join(v)) for k, v in pages.items()}

printed = {k: (k[1], "confirmed") for k in order if k[0] == "p"}
for i, k in enumerate(order):
    if k[0] != "x": continue
    prev = nxt = None
    for j in range(i - 1, -1, -1):
        if order[j][0] == "p": prev = (order[j][1], i - j); break
    for j in range(i + 1, len(order)):
        if order[j][0] == "p": nxt = (order[j][1], j - i); break
    if prev and nxt and nxt[0] - prev[0] == prev[1] + nxt[1]:
        printed[k] = (prev[0] + prev[1], "inferred")
bynum = {}
for k, (n, st) in printed.items():
    bynum.setdefault(n, []).append((k, st))

book_keys = list(order)
book_norm = "".join(npages[k] for k in book_keys)
offsets, off = [], 0
for k in book_keys:
    offsets.append(off); off += len(npages[k])
def page_of_offset(o):
    lo, hi = 0, len(offsets) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if offsets[mid] <= o: lo = mid
        else: hi = mid - 1
    return book_keys[lo]

fnd_norm = norm(open(FOUNDATION, encoding="utf-8").read())

def fuzzy_on(fr, text, maxsub):
    L = len(fr)
    for i in range(0, len(text) - L + 1):
        mm = 0
        for a, b in zip(fr, text[i:i + L]):
            if a != b:
                mm += 1
                if mm > maxsub: break
        else:
            return mm
    return None

# ---- 2./3. extract ----
cite_re = re.compile(r'"([^"]{10,}?)"[^"()]{0,90}\(ATP\s+([0-9][0-9,–‒—\- ]*)')
def parse_pages(s):
    out = []
    for part in re.split(r"[,\s]+", s.strip()):
        part = part.strip(" ,")
        if not part: continue
        m = re.match(r"(\d+)[–‒—-](\d+)$", part)
        if m: out.extend(range(int(m.group(1)), int(m.group(2)) + 1))
        elif part.isdigit(): out.append(int(part))
    return out
def fragments(q):
    parts = re.split(r"\[…\]|\[\.\.\.\]|…|\.\.\.|\[[^\]]*\]|'", q)
    return [norm(p) for p in parts if len(norm(p)) >= 12]

results, artifacts = [], 0
for path in sorted(glob.glob(os.path.join(READING, "*.md"))):
    text = open(path, encoding="utf-8").read()
    for m in cite_re.finditer(text):
        quote, pagestr = m.group(1), m.group(2)
        if "`" in quote:
            artifacts += 1; continue
        cited = parse_pages(pagestr)
        if not cited: continue
        frs = fragments(quote)
        fr_verdicts, statuses = [], []
        for fr in frs:
            hits = [(p, st) for p in cited for k, st in bynum.get(p, []) if fr in npages[k]]
            if hits:
                st = "confirmed" if any(s == "confirmed" for _, s in hits) else "inferred"
                fr_verdicts.append({"len": len(fr), "verdict": "on-cited-page", "marker": st})
                statuses.append("cited-" + st); continue
            zone = sorted({q for p in cited for q in (p - 1, p + 1)} - set(cited))
            zhit = next(((p, st) for p in zone for k, st in bynum.get(p, []) if fr in npages[k]), None)
            if zhit:
                fr_verdicts.append({"len": len(fr), "verdict": "adjacent-page",
                                    "found_on": zhit[0], "marker": zhit[1]})
                statuses.append("adjacent"); continue
            i = book_norm.find(fr)
            if i >= 0:
                k = page_of_offset(i)
                pn = printed.get(k, (None, "unknown"))
                fr_verdicts.append({"len": len(fr), "verdict": "elsewhere",
                                    "found_printed": pn[0], "marker": pn[1]})
                statuses.append("elsewhere"); continue
            maxsub = max(1, len(fr) // 25)
            fz = next(((p, st, fuzzy_on(fr, npages[k], maxsub))
                       for p in cited for k, st in bynum.get(p, [])
                       if fuzzy_on(fr, npages[k], maxsub) is not None), None)
            if fz:
                fr_verdicts.append({"len": len(fr), "verdict": "on-cited-page-fuzzy",
                                    "mismatches": fz[2], "marker": fz[1]})
                statuses.append("cited-fuzzy"); continue
            in_fnd = fr in fnd_norm
            fr_verdicts.append({"len": len(fr), "verdict": "not-in-edition",
                                "verbatim_in_foundation": in_fnd})
            statuses.append("ksk-wording" if in_fnd else "MISS")
        if not statuses: worst = "NO-TESTABLE-FRAGMENT"
        elif "MISS" in statuses: worst = "MISS"
        elif "elsewhere" in statuses: worst = "ELSEWHERE"
        elif "ksk-wording" in statuses: worst = "KSK-WORDING"
        elif "cited-fuzzy" in statuses: worst = "VERIFIED-FUZZY"
        elif "adjacent" in statuses: worst = "ADJACENT"
        elif all(s == "cited-confirmed" for s in statuses): worst = "VERIFIED-CONFIRMED"
        else: worst = "VERIFIED-INFERRED"
        results.append(dict(file=os.path.basename(path), quote=quote, cited=cited,
                            fragments=fr_verdicts, verdict=worst))

tally = {}
for r in results: tally[r["verdict"]] = tally.get(r["verdict"], 0) + 1
out = dict(run="2026-08-18", source="frankbueltge/material atp.pages.txt",
           tally=tally, artifacts_excluded=artifacts, total=len(results),
           results=results)
json.dump(out, open(os.path.join(HERE, "results.json"), "w"), indent=1)
print(json.dumps(tally, indent=1), "artifacts-excluded:", artifacts, "total:", len(results))
