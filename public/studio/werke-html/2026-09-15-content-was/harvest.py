#!/usr/bin/env python3
"""CONTENT WAS — harvest.

Reads the complete public log dump of the Simple English Wikipedia and the
current list of its article titles, and writes one measurement file,
`counts.json`, beside this script.

Nothing from the source is mirrored into the repository. The two downloaded
files and the intermediate event stream live in a cache directory outside it
(default: ~/.cache/ensemble/content-was, override with $CACHE_DIR). What is
committed is the measurement and, of the text of deleted pages, nothing at all
but its length — see the note under "What is deliberately not recorded".

Sources (both from dumps.wikimedia.org, the host Wikimedia publishes for bulk
reading; it serves no robots.txt, so no published rule was crossed):

  simplewiki-latest-pages-logging.xml.gz   every log entry the wiki has ever
                                           written, from 2004-12-23 on
  simplewiki-latest-all-titles-in-ns0.gz   every article title that exists today

Both are CC BY-SA 4.0 / GFDL. Log comments are written by the administrators
who performed the actions.

What is deliberately not recorded
---------------------------------
MediaWiki's automatic deletion reason quotes the page it is deleting. Those
quotations are the subject of this work, and none of them is written to
`counts.json`, to `data.json`, or to the page. Only their LENGTH in characters
is kept, plus whether the quotation was cut off and by which of the two
mechanisms. A deleted page on a wiki is frequently an attack on a private
person, and republishing it here would make this practice the fourth party to
carry it. Titles are recorded only where the same title carries an article on
the wiki today; every other title is counted and left unnamed.

Usage:  python3 harvest.py [--offline]
"""

import gzip, json, os, re, sys, hashlib, collections, statistics, datetime
import urllib.request
import xml.etree.ElementTree as ET

BASE = "https://dumps.wikimedia.org/simplewiki/latest/"
LOGGING = "simplewiki-latest-pages-logging.xml.gz"
TITLES = "simplewiki-latest-all-titles-in-ns0.gz"
UA = "ensemble-studio-research/1.0 (nightly art practice; github.com/frankbueltge/studio)"
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.environ.get("CACHE_DIR") or os.path.expanduser("~/.cache/ensemble/content-was")

# The namespaces of this wiki, as its own dump header declares them. A log
# title whose prefix is one of these is not in article space.
NS_PREFIXES = {
    "Media", "Special", "Talk", "User", "User talk", "Wikipedia", "Wikipedia talk",
    "File", "File talk", "MediaWiki", "MediaWiki talk", "Template", "Template talk",
    "Help", "Help talk", "Category", "Category talk", "MOS", "MOS talk",
    "TimedText", "TimedText talk", "Module", "Module talk", "Event", "Event talk",
}

# MediaWiki writes the deleted page into the reason with one of these openers.
QUOTE_MARK = re.compile(r"content (?:before blanking )?was: ")
CONTRIB_TAIL = re.compile(r"\s*\((?:and )?the only contributor was ")
# The wiki's published quick-deletion criteria: a letter and a number.
CODE = re.compile(r"\b(?:QD\s*)?([AGURFTP]\d{1,2})\b")
CREATE_PROT = re.compile(r"\[create=(\w+)\]\s*\(([^)]*)\)")

COMMENT_CEILING = 255  # characters; MediaWiki's limit on a log comment


def fetch(name):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if os.path.exists(path):
        return path
    if "--offline" in sys.argv:
        raise SystemExit("missing %s and --offline was given" % path)
    req = urllib.request.Request(BASE + name, headers={"User-Agent": UA})
    print("fetching", name, file=sys.stderr)
    with urllib.request.urlopen(req, timeout=900) as r, open(path, "wb") as f:
        while True:
            b = r.read(1 << 20)
            if not b:
                break
            f.write(b)
    return path


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def strip(tag):
    return tag.rsplit("}", 1)[-1]


def events(path):
    """Yield every delete- and protect-log item in the dump, in log order."""
    with gzip.open(path, "rb") as fh:
        for _, el in ET.iterparse(fh, events=("end",)):
            if strip(el.tag) != "logitem":
                continue
            kids = {strip(c.tag): c for c in el}
            typ = kids["type"].text if "type" in kids else None
            if typ in ("delete", "protect"):
                c = kids.get("comment")
                yield {
                    "ts": kids["timestamp"].text if "timestamp" in kids else None,
                    "type": typ,
                    "action": kids["action"].text if "action" in kids else None,
                    "title": kids["logtitle"].text if "logtitle" in kids else None,
                    "comment": (c.text if c is not None else None),
                    "cdel": (c is not None and c.attrib.get("deleted") == "deleted"),
                    "params": (kids["params"].text if "params" in kids else None),
                }
            el.clear()


def article_space(title):
    return not (":" in title and title.split(":", 1)[0] in NS_PREFIXES)


def read_quote(comment):
    """Return (length, state) for the page text MediaWiki kept in this reason.

    state is one of:
      whole    — the quotation is closed and does not end in the cut marker
      cut-text — MediaWiki cut the page text and said so with '...'
      cut-log  — the comment itself ran into the 255-character ceiling, so the
                 quotation has no closing mark at all
    The text itself is discarded here and never leaves this function.
    """
    m = QUOTE_MARK.search(comment)
    if not m:
        return None
    rest = comment[m.end():]
    if not rest or rest[0] not in "'\"":
        return None
    q, body = rest[0], rest[1:]
    tail = CONTRIB_TAIL.search(body)
    if tail:
        end = body.rfind(q, 0, tail.start())
        closed = end >= 0
        if not closed:
            end = tail.start()
    else:
        end = body.rfind(q)
        closed = end >= 0 and (end == len(body) - 1 or body[end + 1:].strip() == "")
        if end < 0:
            end = len(body)
    text_len = end if end >= 0 else len(body)
    cut_marker = body[:text_len].endswith("...")
    if not closed and len(comment) >= COMMENT_CEILING:
        return (text_len, "cut-log")
    if cut_marker:
        return (text_len, "cut-text")
    if not closed:
        return (text_len, "cut-log")
    return (text_len, "whole")


def parse_expiry(s):
    """The log writes an expiry in two house styles; read both, or say so."""
    s = (s or "").strip()
    for pat, fmt in ((r"(\d{1,2} \w+ \d{4})", "%d %B %Y"),
                     (r"(\w+ \d{1,2}, \d{4})", "%B %d, %Y")):
        m = re.search(pat, s)
        if m:
            try:
                return datetime.datetime.strptime(m.group(1), fmt).strftime("%Y-%m-%d")
            except ValueError:
                pass
    return None


def main():
    log_path = fetch(LOGGING)
    tit_path = fetch(TITLES)

    live = set()
    for line in gzip.open(tit_path, "rt", encoding="utf-8", errors="replace"):
        live.add(line.rstrip("\n").replace("_", " "))
    live.discard("page_title")

    when = collections.defaultdict(list)   # title -> the dates it was emptied
    deletions = collections.Counter()      # title -> times emptied
    restores = collections.Counter()       # title -> times put back
    salt = {}                              # title -> last create-protection seen
    unsalt = {}                            # title -> last unprotect seen
    grounds = collections.Counter()
    by_year = collections.Counter()
    by_year_quoting = collections.Counter()
    by_year_coded = collections.Counter()
    by_ns = collections.Counter()
    quote_lengths = []                     # (length, state) per quoting deletion
    comment_len = collections.Counter()
    n_del = n_quote = n_cdel = n_nocomment = n_notitle = 0
    n_items = 0
    first_ts = last_ts = None
    unreadable_expiry = []
    suppressed = collections.Counter()
    suppressed_mute = 0

    for e in events(log_path):
        n_items += 1
        t = e["title"]
        ts = e["ts"] or ""
        if first_ts is None or (ts and ts < first_ts):
            first_ts = ts
        if ts and (last_ts is None or ts > last_ts):
            last_ts = ts
        if t is None:
            # The log entry exists, and the name of the thing it acted on is
            # withheld. Counted, never guessed at.
            n_notitle += 1
            suppressed[e["action"]] += 1
            if e["cdel"] or not e["comment"]:
                suppressed_mute += 1
            continue
        if e["type"] == "delete" and e["action"] in ("delete", "delete_redir"):
            n_del += 1
            deletions[t] += 1
            when[t].append(ts)
            by_year[ts[:4]] += 1
            by_ns["(article)" if article_space(t) else t.split(":", 1)[0]] += 1
            cm = e["comment"] or ""
            if e["cdel"]:
                n_cdel += 1
            if not cm:
                n_nocomment += 1
            comment_len[len(cm)] += 1
            m = CODE.search(cm)
            grounds[m.group(1) if m else "(no code)"] += 1
            if m:
                by_year_coded[ts[:4]] += 1
            q = read_quote(cm)
            if q:
                n_quote += 1
                by_year_quoting[ts[:4]] += 1
                quote_lengths.append((q[0], q[1], ts[:4]))
        elif e["type"] == "delete" and e["action"] == "restore":
            restores[t] += 1
        elif e["type"] == "protect":
            p = e["params"] or ""
            if "create=" in p:
                m = CREATE_PROT.search(p)
                salt[t] = {"ts": ts, "level": m.group(1) if m else None,
                           "expiry": (m.group(2) if m else None)}
            elif e["action"] == "unprotect":
                unsalt[t] = ts

    # --- the seal, as the log last left it -------------------------------
    now = datetime.datetime.now(datetime.timezone.utc)
    sealed = {}
    for t, s in salt.items():
        if t in unsalt and unsalt[t] > s["ts"]:
            continue                                  # lifted again
        exp = (s["expiry"] or "").strip().lower()
        if exp in ("indefinite", "infinite", "never", ""):
            sealed[t] = {"until": "indefinite", "since": s["ts"], "n": deletions.get(t, 0)}
        else:
            iso = parse_expiry(s["expiry"])
            if iso is None:
                unreadable_expiry.append(s["expiry"])
                continue                              # cannot be read: not counted as sealed
            if iso < now.strftime("%Y-%m-%d"):
                continue                              # the seal has lapsed
            sealed[t] = {"until": iso, "since": s["ts"], "n": deletions.get(t, 0)}

    # --- the wall --------------------------------------------------------
    whole = [L for L, st, _ in quote_lengths if st == "whole"]
    cut_text = [L for L, st, _ in quote_lengths if st == "cut-text"]
    cut_log = [L for L, st, _ in quote_lengths if st == "cut-log"]

    # --- the repeated titles ---------------------------------------------
    art = {t: n for t, n in deletions.items() if article_space(t)}
    repeat = collections.Counter(art.values())
    ordered = sorted(art.items(), key=lambda kv: (-kv[1], kv[0]))
    tail = []
    for t, n in ordered:
        if n < 8:
            break
        is_live = t in live
        tail.append({
            "n": n,
            "live": is_live,
            "title": t if is_live else None,
            # the length of the name we are not printing — the measure kept,
            # the content dropped, which is what the log did to the pages
            "chars": len(t),
            "sealed": (sealed[t]["until"] if t in sealed else None),
            "sealed_since": (sealed[t]["since"][:10] if t in sealed else None),
            "restored": restores.get(t, 0),
            "when": [d[:10] for d in sorted(when[t])],
        })

    out = {
        "_note": "CONTENT WAS — the measurement. Built by harvest.py from two public "
                 "Wikimedia dump files; no text of any deleted page is recorded here, "
                 "only its length in characters.",
        "built": now.strftime("%Y-%m-%d"),
        "source": {
            "host": "dumps.wikimedia.org",
            "wiki": "simplewiki (Simple English Wikipedia)",
            "files": [
                {"name": LOGGING, "sha256": sha256(log_path), "bytes": os.path.getsize(log_path)},
                {"name": TITLES, "sha256": sha256(tit_path), "bytes": os.path.getsize(tit_path)},
            ],
            "licence": "CC BY-SA 4.0 / GFDL",
            "robots": "dumps.wikimedia.org serves no robots.txt (404 on 2026-09-15); "
                      "no published rule was crossed. en.wikipedia.org's robots.txt "
                      "disallows /w/ and /wiki/Special:, so the live API and the live "
                      "log pages were not requested at all.",
        },
        "log": {
            "items_read": n_items,
            "first": first_ts, "last": last_ts,
            "deletions": n_del,
            "distinct_titles_deleted": len(deletions),
            "restores_events": sum(restores.values()),
            "restores_titles": len(restores),
            "titles_without_a_title": n_notitle,
            "titles_without_a_title_by_action": suppressed.most_common(),
            "titles_without_a_title_and_mute": suppressed_mute,
            "comment_suppressed": n_cdel,
            "comment_empty": n_nocomment,
        },
        "namespaces": by_ns.most_common(),
        # per year: deletions, of those the ones that kept a copy of the page,
        # and the ones naming a code from the published criteria
        "by_year": sorted(by_year.items()),
        "by_year_table": [[y, c, by_year_quoting.get(y, 0), by_year_coded.get(y, 0)]
                          for y, c in sorted(by_year.items())],
        "grounds": grounds.most_common(),
        "grounds_with_code": n_del - grounds["(no code)"],
        "quote": {
            "deletions_quoting_the_page": n_quote,
            "whole": len(whole),
            "cut_by_text_limit": len(cut_text),
            "cut_by_comment_ceiling": len(cut_log),
            "characters_preserved_total": sum(L for L, _, _ in quote_lengths),
            "characters_preserved_whole": sum(whole),
            "longest_whole": max(whole) if whole else 0,
            "median_whole": int(statistics.median(whole)) if whole else 0,
            "comment_length_255": comment_len[COMMENT_CEILING],
            "comment_length_hist": [[k, comment_len[k]] for k in sorted(comment_len) if k >= 230],
            "last_year_kept": max((int(y) for y, c in by_year_quoting.items() if c), default=0),
            "years_with_none": sorted(y for y, c in by_year.items()
                                      if by_year_quoting.get(y, 0) == 0),
        },
        "articles": {
            "distinct_titles": len(art),
            "deletions": sum(art.values()),
            "live_today": sum(1 for t in art if t in live),
            "repeat_distribution": sorted(repeat.items()),
            "deleted_8_or_more": len(tail),
        },
        "seal": {
            "titles_sealed_now": len(sealed),
            "article_titles_sealed_now": sum(1 for t in sealed if article_space(t)),
            "indefinite": sum(1 for t in sealed.values() if t["until"] == "indefinite"),
            "sealed_never_deleted": sum(1 for t in sealed if t not in deletions),
            "deletions_before_seal_median": int(statistics.median(
                [s["n"] for s in sealed.values()])) if sealed else 0,
            "deletions_before_seal_max": max([s["n"] for s in sealed.values()]) if sealed else 0,
            "ever_create_protected": len(salt),
            "expiry_unreadable": len(unreadable_expiry),
        },
        "tail": tail,
        # the wall: one entry per deletion that kept the page, as a length only
        # the wall, in log order: [characters kept, state, year of the deletion]
        "wall": [[L, {"whole": 0, "cut-text": 1, "cut-log": 2}[st], int(y)]
                 for L, st, y in quote_lengths],
    }
    with open(os.path.join(HERE, "counts.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    slim = {k: v for k, v in out.items() if k != "wall"}
    print(json.dumps(slim, ensure_ascii=False, indent=1)[:4000])


if __name__ == "__main__":
    main()
