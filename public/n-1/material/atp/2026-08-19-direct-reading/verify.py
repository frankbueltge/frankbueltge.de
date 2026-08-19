#!/usr/bin/env python3
"""Verification of the ATP quotations in reading entry 16 against the cited
edition — the first reading entry written from the edition directly.

Executed 2026-08-19 by the session recorded in `nights/23-sixth-night.md`,
under the citation form of the discharged apparatus limitation
(`reading/00-protocol.md`, dated addition of 2026-08-18): a quotation verified
directly against the edition is cited "(ATP n)" plainly, and its verification
is the dated evidence directory — this one.

Source: the founder's private repository `frankbueltge/material` —
`atp.pages.txt`, the Massumi 1987 edition extracted and tagged by printed page
number. The repository is private and in copyright: this script emits
**verdicts, page numbers, marker status and fragment lengths only** — no text
of the edition leaves it. Re-running requires read access to that repository.

Method (per the material README's caveat and the 2026-08-18 re-verification):
quotations are normalized letter-only (strip all non a-z, lowercase — the
remedy for hyphenation and column spacing) and searched on their cited page,
then on the cited page joined with its neighbours (page-break straddles,
reported as such). Marker status distinguishes pages whose printed number is
confirmed in the extraction from inferred ones.
"""
import json, re, os

MATERIAL = os.environ.get("ATP_PAGES", "/home/user/material/atp.pages.txt")
HERE = os.path.dirname(os.path.abspath(__file__))

def norm(s):
    return re.sub(r"[^a-z]", "", s.lower())

# ---- parse pages ----
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

printed = {k[1]: norm("".join(v)) for k, v in pages.items() if k[0] == "p"}
idx = {k: i for i, k in enumerate(order)}

def page_norm(n):
    return printed.get(n, "")

def joined(n, span=1):
    # cited page joined with up to `span` neighbours on each side, by file order
    key = ("p", n)
    if key not in idx:
        return ""
    i = idx[key]
    parts = []
    for j in range(max(0, i - span), min(len(order), i + span + 1)):
        parts.append(norm("".join(pages[order[j]])))
    return "".join(parts)

quotes = json.load(open(os.path.join(HERE, "quotes.json"), encoding="utf-8"))
results = []
for q in quotes:
    frag = norm(q["quote"])
    cited = q["cited_page"]
    verdict = None
    if frag and frag in page_norm(cited):
        verdict = "on cited page"
    elif frag and frag in joined(cited):
        verdict = "straddles the cited page and a neighbour"
    else:
        verdict = "NOT FOUND at cited page or neighbours"
    results.append({
        "cited": f"ATP {q.get('cite_as', cited)}",
        "fragment_letters": len(frag),
        "marker": "confirmed printed number" if ("p", cited) in pages else "no confirmed marker",
        "verdict": verdict,
    })

out = {
    "run": "2026-08-19, night 06 (record 23)",
    "source": "frankbueltge/material atp.pages.txt (private; see README)",
    "quotations_checked": len(results),
    "results": results,
}
json.dump(out, open(os.path.join(HERE, "results.json"), "w", encoding="utf-8"),
          indent=1, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False))
