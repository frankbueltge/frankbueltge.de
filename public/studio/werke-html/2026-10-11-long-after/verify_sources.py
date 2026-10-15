"""Checks every dated source in research.json: fetches its URL and looks for its short quote. (Three sources were checked against full-text copies of books that are not linked here; their links now point to a catalogue search, so a rerun reports them as not found.)
Writes verification.json (status per event and date) and raw-manifest.json (SHA-256 of each fetched page).
Fetched pages are kept in raw/ (not committed). Run: python3 -I verify_sources.py"""
import json, hashlib, re, html, subprocess, os, unicodedata
R = json.load(open("research.json"))
os.makedirs("raw", exist_ok=True)

def norm(s):
    s = unicodedata.normalize("NFKC", html.unescape(s or "")).lower()
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"').replace("–", "-").replace("—", "-")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

cache, manifest, out = {}, {}, {}
def fetch(url):
    if url in cache: return cache[url]
    fn = "raw/" + hashlib.sha1(url.encode()).hexdigest()[:16]
    p = subprocess.run(["curl", "-sSL", "-m", "40", "-A", "Mozilla/5.0 (research; studio)", "-o", fn, "-w", "%{http_code}", url], capture_output=True, text=True)
    code = p.stdout.strip()
    text = ""
    if os.path.exists(fn) and code == "200":
        b = open(fn, "rb").read()
        manifest[url] = {"sha256": hashlib.sha256(b).hexdigest(), "bytes": len(b)}
        if b[:4] == b"%PDF":
            text = subprocess.run(["pdftotext", fn, "-"], capture_output=True, text=True).stdout
        else:
            t = b.decode("utf-8", "ignore")
            t = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", t)
            text = re.sub(r"<[^>]+>", " ", t)
    cache[url] = (code, norm(text))
    return cache[url]

for e in R:
    res = {}
    for k in ("occurrence_public", "nearmiss_public"):
        s = e.get(k)
        if not s or not s.get("date"): res[k] = "no date"; continue
        if not s.get("url"): res[k] = "no url"; continue
        code, text = fetch(s["url"])
        q = norm(s.get("quote"))
        if code != "200": res[k] = f"fetch failed ({code or 'error'})"
        elif q and q in text: res[k] = "quote found"
        elif q and len(q) > 30 and q[:40] in text: res[k] = "quote found (opening)"
        else: res[k] = "page fetched, quote not found"
    out[e["event"]] = res
    print(e["event"], res)
json.dump(out, open("verification.json", "w"), indent=1)
json.dump(manifest, open("raw-manifest.json", "w"), indent=1)
