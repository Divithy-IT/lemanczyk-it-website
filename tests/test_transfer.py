"""Real HTTP tests: authorization, resumed bytes, ranges and disk budgets."""
import hashlib
import http.client
import importlib.util
import json
import os
import socket
import sys
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("transfer", ROOT / "transfer/app.py")
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)


class TransferTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        directory = Path(self.temporary.name)
        salt = os.urandom(32)
        self.password = "fixture-only-" + os.urandom(16).hex()
        credential = directory / "credential.json"
        credential.write_text(json.dumps({"salt": salt.hex(), "hash": hashlib.scrypt(
            self.password.encode(), salt=salt, n=16384, r=8, p=1, dklen=32).hex()}))
        self.store = app.Store(directory / "files", credential)
        self.server = app.Server(("127.0.0.1", 0), self.store)
        self.server_errors = []
        self.server.handle_error = lambda *_args: self.server_errors.append(sys.exc_info()[1])
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.cookie, self.csrf = "", ""
        status, headers, body = self.request("POST", "api/login", {"password": self.password})
        self.assertEqual(status, 200)
        self.cookie = headers["Set-Cookie"].split(";", 1)[0]
        self.csrf = json.loads(body)["csrf"]
        self.assertIn("Secure; HttpOnly; SameSite=Strict", headers["Set-Cookie"])

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temporary.cleanup()
        self.assertEqual(self.server_errors, [])

    def request(self, method, path, body=None, headers=None, auth=True):
        request_headers = {"Origin": "https://lemanczyk-it.pl"}
        if auth:
            request_headers.update({"Cookie": self.cookie, "X-Daj-CSRF": self.csrf})
        if isinstance(body, dict):
            body = json.dumps(body).encode()
            request_headers["Content-Type"] = "application/json"
        request_headers.update(headers or {})
        connection = http.client.HTTPConnection(*self.server.server_address, timeout=5)
        connection.request(method, "/daj/" + path, body, request_headers)
        response = connection.getresponse()
        result = response.status, dict(response.getheaders()), response.read()
        connection.close()
        return result

    def create(self, name="film.mp4", size=16, modified=1):
        status, _, body = self.request("POST", "api/uploads", {"name": name, "size": size, "modified": modified})
        self.assertEqual(status, 200, body)
        return json.loads(body)

    def test_no_public_file_metadata_or_bytes_and_links_return_to_login(self):
        upload = self.create()
        for path in ("api/status", "api/uploads/" + upload["id"]):
            status, headers, body = self.request("GET", path, auth=False)
            self.assertEqual(status, 401)
            self.assertNotIn(b"film.mp4", body)
            self.assertEqual(headers["Cache-Control"], "private, no-store")
            self.assertIn("noindex, nofollow", headers["X-Robots-Tag"])
        status, headers, body = self.request("GET", "file/" + upload["id"], auth=False)
        self.assertEqual(status, 303)
        self.assertEqual(headers["Location"], "/daj/?file=" + upload["id"])
        self.assertEqual(body, b"")
        self.assertEqual(self.request("HEAD", "file/" + upload["id"], auth=False)[0], 401)

    def test_wrong_password_origin_csrf_logout_and_expiration(self):
        self.assertEqual(self.request("POST", "api/login", {"password": "wrong"})[0], 401)
        self.assertEqual(self.request("POST", "api/login", {"password": self.password}, {"Origin": "https://elsewhere.invalid"})[0], 403)
        self.assertEqual(self.request("POST", "api/uploads", {}, {"X-Daj-CSRF": "wrong"})[0], 403)
        self.assertEqual(self.request("POST", "api/logout", {})[0], 200)
        self.assertEqual(self.request("GET", "api/status")[0], 401)
        token, _ = self.store.login(self.password, "test")
        self.cookie = app.COOKIE + "=" + token
        self.store.sessions[token]["expires"] = 0
        self.assertEqual(self.request("GET", "api/status")[0], 401)

    def test_rate_limit(self):
        for _ in range(8):
            self.assertEqual(self.request("POST", "api/login", {"password": "wrong"})[0], 401)
        self.assertEqual(self.request("POST", "api/login", {"password": self.password})[0], 429)

    def test_resuming_conflicting_offsets_finalize_ranges_and_exact_bytes(self):
        upload = self.create()
        identifier = upload["id"]
        path = "api/uploads/" + identifier
        payload = b"0123456789abcdef"
        self.assertEqual(self.request("GET", "file/" + identifier)[0], 409)
        self.assertEqual(self.request("PATCH", path, payload[:7], {"Upload-Offset": "0"})[0], 200)
        self.assertEqual(self.create()["offset"], 7)
        self.assertEqual(self.request("PATCH", path, b"x", {"Upload-Offset": "0"})[0], 409)
        self.assertEqual(self.request("POST", path + "/finish", {})[0], 409)
        self.assertEqual(self.request("PATCH", path, payload[7:], {"Upload-Offset": "7"})[0], 200)
        self.assertEqual(self.request("POST", path + "/finish", {})[0], 200)
        status, headers, body = self.request("GET", "file/" + identifier)
        self.assertEqual((status, body), (200, payload))
        self.assertEqual(headers["Content-Type"], "video/mp4")
        self.assertTrue(headers["Content-Disposition"].startswith("inline;"))
        for value, expected in (("bytes=4-8", payload[4:9]), ("bytes=12-", payload[12:]), ("bytes=-3", payload[-3:])):
            status, headers, body = self.request("GET", "file/" + identifier, headers={"Range": value})
            self.assertEqual((status, body), (206, expected))
            self.assertIn("/16", headers["Content-Range"])
        status, headers, body = self.request("HEAD", "file/" + identifier + "?download=1")
        self.assertEqual((status, body, headers["Content-Length"]), (200, b"", "16"))
        self.assertTrue(headers["Content-Disposition"].startswith("attachment;"))
        for value in ("bytes=16-", "bytes=4-2", "bytes=-0", "bytes=0-1,4-5"):
            self.assertEqual(self.request("GET", "file/" + identifier, headers={"Range": value})[0], 416)
        self.assertEqual(self.request("DELETE", path)[0], 409)

    def test_traversal_size_chunk_and_disk_limits(self):
        for name in ("../film", "a/b", "a\\b", "a\r\nheader", ""):
            self.assertEqual(self.request("POST", "api/uploads", {"name": name, "size": 1, "modified": 1})[0], 400)
        for size in (0, app.MAX_FILE + 1, True):
            self.assertEqual(self.request("POST", "api/uploads", {"name": "x", "size": size, "modified": 1})[0], 413)
        self.assertEqual(self.request("GET", "api/uploads/../../etc/passwd")[0], 404)
        with patch.object(app.shutil, "disk_usage", return_value=type("Disk", (), {"free": app.RESERVE})()):
            self.assertEqual(self.request("POST", "api/uploads", {"name": "x", "size": 1, "modified": 1})[0], 507)
        upload = self.create(size=2)
        path = "api/uploads/" + upload["id"]
        self.assertEqual(self.request("PATCH", path, b"abc", {"Upload-Offset": "0"})[0], 413)
        self.assertEqual(self.store.path(upload["id"]).stat().st_size, 0)
        with patch.object(app, "QUOTA", 2):
            self.assertEqual(self.request("POST", "api/uploads", {"name": "other", "size": 1, "modified": 1})[0], 507)

    def test_interrupted_chunk_is_rolled_back_and_partial_can_be_deleted(self):
        upload = self.create(size=1024 * 1024)
        connection = socket.create_connection(self.server.server_address)
        head = (f"PATCH /daj/api/uploads/{upload['id']} HTTP/1.1\r\nHost: localhost\r\n"
                f"Origin: https://lemanczyk-it.pl\r\nCookie: {self.cookie}\r\nX-Daj-CSRF: {self.csrf}\r\n"
                "Upload-Offset: 0\r\nContent-Length: 1048576\r\n\r\n")
        connection.sendall(head.encode() + b"x" * 140000)
        connection.shutdown(socket.SHUT_WR)
        while connection.recv(4096):
            pass
        connection.close()
        self.assertEqual(self.store.path(upload["id"]).stat().st_size, 0)
        self.assertEqual(self.request("DELETE", "api/uploads/" + upload["id"])[0], 200)
        self.assertFalse(self.store.path(upload["id"]).exists())

    def test_offsets_beyond_four_gib_without_allocating_a_large_file(self):
        # A sparse fixture exercises real HTTP integer/seek handling above 32 bits.
        offset = 5 * app.GIB + 19
        with patch.object(app.shutil, "disk_usage", return_value=type("Disk", (), {"free": 100 * app.GIB})()):
            upload = self.create(size=offset + 4)
        with self.store.path(upload["id"]).open("wb") as output:
            output.truncate(offset)
        path = "api/uploads/" + upload["id"]
        self.assertEqual(self.request("PATCH", path, b"tail", {"Upload-Offset": str(offset)})[0], 200)
        self.assertEqual(self.request("POST", path + "/finish", {})[0], 200)
        status, _, body = self.request("GET", "file/" + upload["id"], headers={"Range": "bytes=-4"})
        self.assertEqual((status, body), (206, b"tail"))


if __name__ == "__main__":
    unittest.main()
