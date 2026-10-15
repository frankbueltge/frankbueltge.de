#!/usr/bin/env python3
"""ONE KNOCK EACH — knock once at each of forty doors and record what answers.

The sibling practice The Field (frankbueltge/field-research, session 144,
2026-09-01) censused forty publishers that had issued expressions of concern
about their own papers, and asked, by hand, whether each publishes a route by
which a stranger can raise a concern. Twenty-seven of forty do. Their committed
census — publisher, concerns, class, route, the sentence that constitutes the
route, and the URL it stands on — is at

  https://raw.githubusercontent.com/frankbueltge/field-research/main/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv

Beside that finding they left a warning: eighteen of the forty doors refused an
ordinary automated request at least once. Reachable by a human, substantially
closed to an instrument. They named it and moved on; it was not their subject.

It is this one. This script knocks once at each of the forty evidence URLs from
this room, on one date, with one plain request that says what it is, and records
four things per door:

  1. what the status line said,
  2. what actually came back — the policy page, or a page asking the caller to
     prove it is not one,
  3. whether the sentence The Field quotes as the route was in what came back,
  4. whether the address that sentence gives — an email, a form URL — was in it.

(2)-(4) are the measurement this room adds. A door can answer 200 and hand back a
page titled "Client Challenge"; a status line is not a door opening. And a door
can open and still not hand the caller the invitation: the page arrives, the
words that make it a door do not. Nobody is written to and nothing is submitted;
every request is an ordinary GET of a public policy page, one per door, spaced.

No fetched page is stored. Only status, headers named below, byte count, a hash,
and the classification tests survive the run — short quotations with their source,
never a copy of anyone's page.

  python3 probe.py            # knock, write probe-log.json  (needs network)
  python3 probe.py --check    # re-knock and compare with the committed log

--check compares only what should be stable across a re-run (which doors answered,
which answered with a challenge, which delivered the sentence and the address). Byte counts, hashes
and timings are recorded but not compared: a page may be edited between knocks,
and that is a fact about the door, not a defect in this file.
"""

import argparse
import csv
import hashlib
import html
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "probe-log.json")

CENSUS_URL = (
    "https://raw.githubusercontent.com/frankbueltge/field-research/main/"
    "artifacts/cycle-001/2026-09-01-a-door-to-knock-on/data/census.csv"
)

# The knock identifies itself. It does not pretend to be a browser: a probe that
# disguises its nature would measure how well it lies, not what the door does.
UA = (
    "EnsembleStudioProbe/1.0 (artistic research; one GET per door; "
    "no submission; contact via https://frankbueltge.de)"
)
TIMEOUT = 25
PAUSE = 2.0
MAX_BYTES = 4_000_000


# ---------------------------------------------------------------- text

_TAG = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.S | re.I)
_ANY_TAG = re.compile(r"<[^>]+>")
_WS = re.compile(r"\s+")

_FOLD = {
    "‘": "'", "’": "'", "‚": "'", "‛": "'",
    "“": '"', "”": '"', "„": '"', "«": '"', "»": '"',
    "‐": "-", "‑": "-", "‒": "-", "–": "-",
    "—": "-", "―": "-", "−": "-",
    " ": " ", " ": " ", " ": " ", " ": " ",
    "​": "", "‌": "", "‍": "", "﻿": "",
    "…": "...",
}


def normalize(s):
    """Casefold, unwrap, and flatten the punctuation a CMS rewrites silently.

    A door is not shut because its typesetter turned an apostrophe round.
    """
    s = unicodedata.normalize("NFKC", s)
    s = "".join(_FOLD.get(ch, ch) for ch in s)
    s = _WS.sub(" ", s)
    return s.strip().casefold()


# Markers of a page whose subject is the caller rather than the caller's request.
#
# CORRECTION, on record. The first list run here also held "captcha" and
# "access denied". Both were wrong and are struck. "captcha" fires on any page
# that merely embeds a form widget — it selected six ordinary policy pages,
# four of which carried the route sentence in full. "access denied" describes a
# refusal, and refusals are classified by their status line, not by their body.
# The struck list is kept here rather than quietly replaced.
#
# What remains selects only a page that says, in its own words, that the caller
# must prove what it is before the page will be shown. It is applied to 2xx
# answers alone, and every door it selects is verified by hand afterwards; the
# check is in CHALLENGES.md beside this file.
CHALLENGE_MARKERS = (
    "client challenge",
    "verification check",
    "checking your browser",
    "just a moment",
    "attention required",
    "please enable javascript to proceed",
    "awswaf",
    "are you a robot",
    "human verification",
    "cf-browser-verification",
)
STRUCK_MARKERS = ("captcha", "access denied")


_TITLE = re.compile(r"<title[^>]*>(.*?)</title>", re.S | re.I)


def title_of(raw_html):
    m = _TITLE.search(raw_html)
    if not m:
        return ""
    return _WS.sub(" ", html.unescape(_ANY_TAG.sub(" ", m.group(1)))).strip()[:120]


def visible_text(body_bytes, charset):
    """Everything a reader would see, plus the attribute values a link hides in.

    mailto: and form targets live in href attributes, so the address test would
    fail on a page that plainly shows the address as a link if we stripped tags
    first. The text test and the address test therefore run over different
    strings, and both are named in the record.
    """
    try:
        raw = body_bytes.decode(charset or "utf-8", errors="replace")
    except (LookupError, UnicodeDecodeError):
        raw = body_bytes.decode("utf-8", errors="replace")
    stripped = _TAG.sub(" ", raw)
    text = html.unescape(_ANY_TAG.sub(" ", stripped))
    return normalize(text), normalize(html.unescape(raw)), title_of(raw)


# ---------------------------------------------------------------- the knock


class Redirects(urllib.request.HTTPRedirectHandler):
    def __init__(self):
        self.chain = []

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.chain.append([code, newurl])
        if len(self.chain) > 5:
            return None
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def knock(url):
    """One GET. Returns what came back, never the page itself."""
    tracker = Redirects()
    opener = urllib.request.build_opener(tracker)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en",
    })
    rec = {"url": url, "redirects": tracker.chain}
    t0 = time.time()
    try:
        with opener.open(req, timeout=TIMEOUT) as resp:
            body = resp.read(MAX_BYTES)
            rec.update(
                outcome="answered",
                status=resp.status,
                final_url=resp.geturl(),
                content_type=resp.headers.get("Content-Type", ""),
                server=resp.headers.get("Server", ""),
                bytes=len(body),
                sha256=hashlib.sha256(body).hexdigest(),
            )
            charset = None
            ct = rec["content_type"]
            if "charset=" in ct.lower():
                charset = ct.lower().split("charset=", 1)[1].split(";")[0].strip()
            rec["_text"], rec["_raw"], rec["title"] = visible_text(body, charset)
    except urllib.error.HTTPError as e:
        body = b""
        try:
            body = e.read(MAX_BYTES)
        except Exception:
            pass
        rec.update(
            outcome="refused",
            status=e.code,
            final_url=e.url if hasattr(e, "url") else url,
            content_type=e.headers.get("Content-Type", "") if e.headers else "",
            server=e.headers.get("Server", "") if e.headers else "",
            bytes=len(body),
            sha256=hashlib.sha256(body).hexdigest(),
        )
        rec["_text"], rec["_raw"], rec["title"] = (
            visible_text(body, None) if body else ("", "", "")
        )
    except Exception as e:  # timeouts, TLS, DNS, connection resets
        rec.update(
            outcome="no_answer",
            status=None,
            final_url=None,
            content_type="",
            server="",
            bytes=0,
            sha256="",
            error=type(e).__name__ + ": " + str(e)[:200],
        )
        rec["_text"], rec["_raw"], rec["title"] = ("", "", "")
    rec["elapsed_ms"] = int((time.time() - t0) * 1000)
    return rec


# ---------------------------------------------------------------- the tests


def longest_fragment(quote_norm, text_norm):
    """The longest run of consecutive words of the route sentence the page did deliver.

    The sentence test is all-or-nothing and a page that reworded four words fails
    it. This is the graded form of the same question, and it is what turned the
    result: on several doors the invitation arrives in full and stops exactly
    where the address would be.
    """
    words = quote_norm.split()
    for n in range(len(words), 0, -1):
        for i in range(len(words) - n + 1):
            frag = " ".join(words[i:i + n])
            if frag in text_norm:
                return n, frag
    return 0, ""


_LITERAL = re.compile(r"^(?:[^\s()<>,;]+@[^\s()<>,;]+|https?://[^\s()<>,;]+)$")


def address_of(row):
    """The literal thing a reader would have to copy down. None where there is none.

    Two rows of the census annotate the address in prose - a second, parallel set
    of addresses in one, a further reporting line in the other. Testing the whole
    annotation as a string would fail on any page in the world, so the leading
    literal address is taken and the annotation is recorded beside it.
    """
    value = (row["route_value"] or "").strip()
    if not value:
        return None, False
    if _LITERAL.match(value):
        return value, False
    head = value.split()[0].strip(",;")
    return (head, True) if _LITERAL.match(head) else (value, True)


def run(rows):
    doors = []
    for i, row in enumerate(rows):
        url = row["evidence_url"].strip()
        rec = knock(url)
        text, raw = rec.pop("_text"), rec.pop("_raw")

        # The first words a reader would see. Kept so that anything this work
        # quotes about a page is fetched rather than typed.
        rec["opening_text"] = text[:200]
        hit = [m for m in CHALLENGE_MARKERS if m in raw]
        rec["challenge_markers"] = hit
        rec["is_challenge"] = bool(hit) and rec["outcome"] == "answered"

        quote = (row["quote"] or "").strip()
        addr, annotated = address_of(row)

        rec["quote_tested"] = quote
        rec["quote_found"] = bool(quote) and normalize(quote) in text
        rec["address_tested"] = addr
        rec["address_annotated"] = annotated
        nq, nfrag = longest_fragment(normalize(quote), text) if quote else (0, "")
        rec["quote_words"] = len(normalize(quote).split()) if quote else 0
        rec["fragment_words"] = nq
        rec["fragment"] = nfrag[:300]
        if addr:
            n = normalize(addr)
            rec["address_found"] = n in text or n in raw
        else:
            rec["address_found"] = None

        rec["publisher"] = row["publisher"]
        rec["concerns"] = int(row["concerns"])
        rec["stratum"] = row["stratum"]
        rec["field_class"] = row["class"]
        rec["route_kind"] = row["route_kind"]
        rec["field_evidence_grade"] = row["evidence_grade"]
        rec["field_machine_blocked"] = row["machine_blocked"].strip().lower() == "true"
        doors.append(rec)

        print(
            f"  [{i+1:2d}/{len(rows)}] {rec['outcome']:9s} "
            f"{str(rec['status']):>4s}  q={int(rec['quote_found'])} "
            f"a={'-' if rec['address_found'] is None else int(rec['address_found'])}  "
            f"{row['publisher'][:44]}",
            file=sys.stderr,
        )
        if i + 1 < len(rows):
            time.sleep(PAUSE)
    return doors


def fetch_census():
    req = urllib.request.Request(CENSUS_URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        raw = r.read()
    return list(csv.DictReader(io.StringIO(raw.decode("utf-8")))), hashlib.sha256(raw).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--out", default=OUT, help="where to write the log")
    args = ap.parse_args()

    rows, census_sha = fetch_census()
    print(f"census: {len(rows)} doors, sha256 {census_sha[:16]}…", file=sys.stderr)

    doors = run(rows)
    log = {
        "work": "ONE KNOCK EACH",
        "knocked_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "census_url": CENSUS_URL,
        "census_sha256": census_sha,
        "user_agent": UA,
        "timeout_s": TIMEOUT,
        "pause_s": PAUSE,
        "vantage": (
            "One machine, one run, one date. Requests leave this room through a "
            "proxying egress with an address of its own; a refusal may answer that "
            "vantage as much as this request. Stated here because it is not a "
            "footnote to the measurement, it is half of it."
        ),
        "doors": doors,
    }

    if args.check:
        if not os.path.exists(args.out):
            print("no committed log to check against", file=sys.stderr)
            return 1
        old = json.load(open(args.out))
        keys = ("outcome", "is_challenge", "quote_found", "address_found")
        bad = []
        for a, b in zip(old["doors"], doors):
            for k in keys:
                if a[k] != b[k]:
                    bad.append(f"{a['publisher']}: {k} {a[k]!r} → {b[k]!r}")
        if old["census_sha256"] != census_sha:
            bad.append("the census itself changed upstream")
        if bad:
            print("CHECK: the doors have moved since the committed knock:", file=sys.stderr)
            for b in bad:
                print("  " + b, file=sys.stderr)
            return 1
        print("CHECK: every door answers as it did.", file=sys.stderr)
        return 0

    with open(args.out, "w") as f:
        json.dump(log, f, indent=1, sort_keys=False)
        f.write("\n")
    print(f"wrote {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
