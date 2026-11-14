"""In Whose Name, state 3 (the check): the two texts this practice read again on 2026-11-14.

Asserts that the passages the page's section "What the check found" rests on stand in the
texts as fetched (not committed: third-party source files stay out of this repository).

Run: python3 check_sources.py <garante-10098477.html> <dpc-grok-2024-09-04.html>
"""
import hashlib
import html
import re
import sys

EXPECT = {
    "garante": ("6863a3d6b7831f58753abe95fdd612cc2e7e703ef58a165eaec40203c720bf16",
                ["limitazione definitiva", "riservandosi ogni altra determinazione"]),
    "dpc": ("cc26965f7580f9076fe63c1be4685d423c6fbafa9920d3d12164272acd5f9dde",
            ["the proceedings have been struck-out on the basis of X’s agreement to continue to adhere to the terms of the undertaking",
             "on a permanent basis"]),
}
for key, path in zip(["garante", "dpc"], sys.argv[1:3]):
    raw = open(path, "rb").read()
    sha, passages = EXPECT[key]
    assert hashlib.sha256(raw).hexdigest() == sha, (key, "not the file read on 2026-11-14")
    t = raw.decode("utf-8", "replace")
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", t, flags=re.S)
    t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))
    for p in passages:
        assert p in t, (key, p)
    print("ok", key, len(passages), "passages")
