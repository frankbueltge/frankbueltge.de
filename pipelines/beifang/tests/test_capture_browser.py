import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from beifang.capture import capture_page

PAGE = ('<html><head><title>Testseite</title></head><body>'
        '<img src="http://localhost:{port}/pixel.gif">'
        '<script src="http://localhost:{port}/t.js"></script></body></html>')


@pytest.fixture()
def server():
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/":
                body, ct = PAGE.format(port=self.server.server_port).encode(), "text/html"
            elif self.path == "/pixel.gif":
                body, ct = b"GIF89a", "image/gif"
            else:
                body, ct = b"// js", "text/javascript"
            self.send_response(200)
            self.send_header("Content-Type", ct)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *args):
            pass

    srv = HTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=srv.serve_forever, daemon=True)
    thread.start()
    yield srv
    srv.shutdown()


@pytest.mark.browser
def test_capture_records_cross_host_requests_and_title(server):
    port = server.server_port
    cap = capture_page(f"http://127.0.0.1:{port}/", timeout_s=20.0, settle_s=1.0)
    hosts = {r.host for r in cap.requests}
    assert "127.0.0.1" in hosts and "localhost" in hosts  # zweiter Hostname = „Drittanbieter"
    assert cap.http_status == 200
    assert cap.page_title == "Testseite"
    gif = next(r for r in cap.requests if r.url.endswith("/pixel.gif"))
    assert gif.bytes == 6


@pytest.mark.browser
def test_capture_records_referer_on_subrequests(server):
    port = server.server_port
    cap = capture_page(f"http://127.0.0.1:{port}/", timeout_s=20.0, settle_s=1.0)
    sub = [r for r in cap.requests if r.url.endswith(("/t.js", "/pixel.gif"))]
    assert sub, "keine Sub-Requests erfasst"
    assert any(r.referer and "127.0.0.1" in r.referer for r in sub)
