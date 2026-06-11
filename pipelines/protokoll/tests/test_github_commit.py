import base64
import json

import httpx

from protokoll.github_commit import commit_file


def test_creates_new_file_when_absent():
    calls = []

    def handler(req):
        calls.append(req)
        if req.method == "GET":
            return httpx.Response(404)
        body = json.loads(req.content)
        assert body["message"] == "protokoll: Sitzung vom 2026-06-12"
        assert body["committer"] == {"name": "Protokollführung",
                                     "email": "protokoll@frankbueltge.de"}
        assert base64.b64decode(body["content"]).decode() == '{"a": 1}\n'
        assert "sha" not in body
        return httpx.Response(201, json={"commit": {"sha": "abc123"}})

    sha = commit_file(repo="frankbueltge/frankbueltge.de",
                      path="src/content/protokoll/2026/2026-06-12.json",
                      content='{"a": 1}\n',
                      message="protokoll: Sitzung vom 2026-06-12",
                      token="tok", client=httpx.Client(transport=httpx.MockTransport(handler)))
    assert sha == "abc123"
    assert calls[0].headers["authorization"] == "Bearer tok"


def test_updates_existing_file_with_sha():
    def handler(req):
        if req.method == "GET":
            return httpx.Response(200, json={"sha": "oldsha"})
        assert json.loads(req.content)["sha"] == "oldsha"
        return httpx.Response(200, json={"commit": {"sha": "def456"}})

    sha = commit_file(repo="r/r", path="p.json", content="x", message="m",
                      token="tok", client=httpx.Client(transport=httpx.MockTransport(handler)))
    assert sha == "def456"
