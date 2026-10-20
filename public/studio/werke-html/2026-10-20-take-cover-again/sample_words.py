"""TAKE COVER, AGAIN, increment 3: what the warner says when it takes a tornado warning back.

    python3 -I sample_words.py TEXT_RAW_DIR

Draws a fixed random sample of the products that took a warning back early (word.js `prod`, built by
build_word.py), fetches each product's text from the Iowa Environmental Mesonet (NWS products are
public domain), and reads the cancelling segment: the segment whose VTEC line carries the action CAN
for a tornado warning. Texts stay outside the repository; the sample's ids, its reasons and the
short sentences quoted on the page go to words.json.

The reading, fixed before any text was read (2026-10-20). A segment's prose is the text between its
headline and its LAT...LON line, lower-cased. Its reason is the first of these that matches:
  error      "error", "erroneous", "mistake", "inadvertent", "test message"
  replaced   "replaced", "new tornado warning", "new warning", "severe thunderstorm warning"
  moved      "moved out", "moved east", "moved north", "moved south", "moved west", "exited",
             "has left", "moved into", "moved across", "no longer in", "out of the warned"
  weakened   "weakened", "diminished", "no longer", "dissipated", "lessened", "decreased", "subsided",
             "below severe", "not tornadic", "no longer appears"
  other      anything else; none found means the cancelling segment was not found in the product.
"Replaced" comes before "moved" because a replacing statement often also says the storm moved.
The sample is 400 products, seed 20261020. The shares are an estimate from the sample, and say so.

Added after the first reading (2026-10-20, same session), and reported beside it, never instead: the
rules above read the whole segment, and its boilerplate (a watch "remains in effect", a "severe
thunderstorm warning remains") moves some segments into "replaced" or "other". A second reading
applies the same rules, in the same order, to the segment's first sentence alone.
"""
import json, re, random, sys, time, pathlib, urllib.request, collections, hashlib

RAW = pathlib.Path(sys.argv[1]); RAW.mkdir(parents=True, exist_ok=True)
HERE = pathlib.Path(__file__).parent
WORD = json.loads((HERE / "word.js").read_text()[len("window.TCA_WORD="):-2])
RULES = [
    ("error", ["error", "erroneous", "mistake", "inadvertent", "test message"]),
    ("replaced", ["replaced", "new tornado warning", "new warning", "severe thunderstorm warning"]),
    ("moved", ["moved out", "moved east", "moved north", "moved south", "moved west", "exited", "has left",
               "moved into", "moved across", "no longer in", "out of the warned"]),
    ("weakened", ["weakened", "diminished", "no longer", "dissipated", "lessened", "decreased", "subsided",
                  "below severe", "not tornadic", "no longer appears"]),
]
N, SEED = 400, 20261020
ids = [WORD["prod"][i] for i in WORD["early"] if WORD["prod"][i]]
sample = random.Random(SEED).sample(sorted(ids), N)


def get(pid, tries=4):
    p = RAW / (pid + ".txt")
    if p.exists():
        return p.read_text()
    for i in range(tries):
        try:
            with urllib.request.urlopen("https://mesonet.agron.iastate.edu/api/1/nwstext/" + pid, timeout=60) as r:
                t = r.read().decode("utf-8", "replace"); p.write_text(t); return t
        except Exception as ex:
            print("retry", pid, ex, file=sys.stderr); time.sleep(2 ** (i + 1))
    return None


def cancelling(text):
    for seg in text.split("$$"):
        if re.search(r"/O\.CAN\.\w{4}\.TO\.W\.", seg):
            body = seg.split("LAT...LON")[0]
            m = re.search(r"\.\.\.(.+?)\.\.\.\s*\n", body, re.S)
            head = re.sub(r"\s+", " ", m.group(1)).strip() if m else ""
            prose = re.sub(r"\s+", " ", body[m.end():] if m else body).strip()
            return head, prose
    return None


out = []
reasons = collections.Counter()
reasons1 = collections.Counter()
for pid in sample:
    t = get(pid)
    if t is None:
        reasons["unfetched"] += 1; out.append({"id": pid, "reason": "unfetched"}); continue
    seg = cancelling(t)
    if not seg:
        reasons["none"] += 1; out.append({"id": pid, "reason": "none"}); continue
    head, prose = seg
    low = prose.lower()
    r = next((name for name, keys in RULES if any(k in low for k in keys)), "other")
    reasons[r] += 1
    first = re.split(r"(?<=\.)\s", prose)[0][:240]
    r1 = next((name for name, keys in RULES if any(k in first.lower() for k in keys)), "other")
    reasons1[r1] += 1
    out.append({"id": pid, "reason": r, "reason_first_sentence": r1, "headline": head[:200], "first": first,
                "sha256": hashlib.sha256(t.encode()).hexdigest()})
found = N - reasons["none"] - reasons["unfetched"]
summary = {"sample": N, "seed": SEED, "population": len(ids), "reasons": dict(reasons),
           "shares_of_found": {k: round(v / found, 3) for k, v in reasons.items() if k not in ("none", "unfetched")},
           "found": found, "reasons_first_sentence": dict(reasons1),
           "shares_first_sentence": {k: round(v / found, 3) for k, v in reasons1.items()}, "items": out}
(HERE / "words.json").write_text(json.dumps(summary, indent=1))
assert "error" not in reasons and "error" not in reasons1
(HERE / "wordsample.js").write_text("window.TCA_WORDSAMPLE=" + json.dumps({k: v for k, v in summary.items() if k != "items"}) + ";\n")
print(json.dumps({k: v for k, v in summary.items() if k != "items"}, indent=1))
