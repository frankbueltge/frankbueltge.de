import hashlib
import json

from beifang.lists_fetch import write_snapshot


def test_write_snapshot(tmp_path):
    write_snapshot(tmp_path, easyprivacy_text="||t.example^\n",
                   tds_text='{"trackers": {}}', now_iso="2026-07-02T10:00:00Z")
    meta = json.loads((tmp_path / "meta.json").read_text())
    assert set(meta) == {"easyprivacy", "tds"}
    assert meta["easyprivacy"]["retrieved_at"] == "2026-07-02T10:00:00Z"
    assert meta["easyprivacy"]["sha256"] == hashlib.sha256(b"||t.example^\n").hexdigest()
    assert (tmp_path / "easyprivacy.txt").read_text() == "||t.example^\n"
