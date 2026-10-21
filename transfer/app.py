#!/usr/bin/env python3
"""Private, bounded-memory, resumable file transfer behind the local nginx.

No uploaded bytes, credentials or runtime metadata belong in a website release.
Only nginx may reach this loopback server. Every file request is authenticated.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import shutil
import socket
import sqlite3
import threading
import time
from collections import deque
from contextlib import closing
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlsplit

GIB = 1024 ** 3
CHUNK = 8 * 1024 ** 2
MAX_FILE = 16 * GIB
QUOTA = 20 * GIB
RESERVE = 8 * GIB
SESSION_TTL = 24 * 3600
COOKIE = "__Secure-daj_session"
IDENTIFIER = re.compile(r"[0-9a-f]{32}\Z")
VIDEO_TYPES = {".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm",
               ".ogv": "video/ogg", ".mov": "video/quicktime"}


class Rejected(Exception):
    def __init__(self, status, message):
        self.status, self.message = status, message


class Store:
    def __init__(self, directory: Path, credential: Path, origin="https://lemanczyk-it.pl"):
        self.directory, self.origin = directory, origin
        directory.mkdir(mode=0o700, parents=True, exist_ok=True)
        self.database = directory / "transfers.sqlite3"
        self.credential = json.loads(credential.read_text())
        # Fail closed on a malformed provisioned credential.
        self.salt = bytes.fromhex(self.credential["salt"])
        self.password_hash = bytes.fromhex(self.credential["hash"])
        if len(self.salt) != 32 or len(self.password_hash) != 32:
            raise ValueError("invalid transfer credential")
        self.lock = threading.RLock()
        self.write_lock = threading.RLock()
        self.password_lock = threading.Lock()
        self.downloads = threading.BoundedSemaphore(3)
        self.sessions = {}
        self.attempts = {}
        self.global_attempts = deque()
        with closing(self.connect()) as db, db:
            db.execute("""CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY, name TEXT NOT NULL, size INTEGER NOT NULL,
                modified INTEGER NOT NULL, ready INTEGER NOT NULL DEFAULT 0,
                created REAL NOT NULL, touched REAL NOT NULL)""")

    def connect(self):
        db = sqlite3.connect(self.database, timeout=10)
        db.row_factory = sqlite3.Row
        return db

    def path(self, identifier):
        if not IDENTIFIER.fullmatch(identifier):
            raise Rejected(404, "Nie znaleziono pliku.")
        return self.directory / (identifier + ".data")

    def row(self, identifier):
        self.path(identifier)
        with closing(self.connect()) as db:
            row = db.execute("SELECT * FROM files WHERE id=?", (identifier,)).fetchone()
        if row is None:
            raise Rejected(404, "Nie znaleziono pliku.")
        return row

    def describe(self, row):
        path = self.path(row["id"])
        return {"id": row["id"], "name": row["name"], "size": row["size"],
                "offset": path.stat().st_size if path.exists() else 0,
                "ready": bool(row["ready"]),
                "video": Path(row["name"]).suffix.lower() in VIDEO_TYPES}

    def login(self, password, address):
        now = time.time()
        with self.password_lock:
            # Bounded maps and a global budget also limit distributed attempts.
            self.attempts = {ip: values for ip, values in self.attempts.items()
                             if values and values[-1] > now - 900}
            values = self.attempts.setdefault(address, deque())
            while values and values[0] < now - 900:
                values.popleft()
            while self.global_attempts and self.global_attempts[0] < now - 300:
                self.global_attempts.popleft()
            if len(values) >= 8 or len(self.global_attempts) >= 40:
                raise Rejected(429, "Za dużo prób. Spróbuj ponownie za kilkanaście minut.")
            values.append(now)
            self.global_attempts.append(now)
            if not isinstance(password, str) or len(password) > 256:
                raise Rejected(401, "Nieprawidłowe hasło.")
            candidate = hashlib.scrypt(password.encode(), salt=self.salt, n=16384, r=8, p=1, dklen=32)
            if not hmac.compare_digest(candidate, self.password_hash):
                raise Rejected(401, "Nieprawidłowe hasło.")
            self.attempts.pop(address, None)
            with self.lock:
                self.sessions = {key: value for key, value in self.sessions.items() if value["expires"] > now}
                if len(self.sessions) >= 256:
                    self.sessions.pop(next(iter(self.sessions)))
                token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
                self.sessions[token] = {"csrf": csrf, "expires": now + SESSION_TTL}
            return token, csrf

    def create(self, data):
        name, size, modified = data.get("name"), data.get("size"), data.get("modified")
        if (not isinstance(name, str) or not name.strip() or len(name.encode()) > 240
                or any(ord(c) < 32 or ord(c) == 127 or c in "/\\" for c in name)):
            raise Rejected(400, "Nieprawidłowa nazwa pliku.")
        if type(size) is not int or not 0 < size <= MAX_FILE:
            raise Rejected(413, "Maksymalny rozmiar pliku to 16 GiB.")
        if type(modified) is not int or modified < 0 or modified > 2 ** 53:
            raise Rejected(400, "Nieprawidłowe dane pliku.")
        with self.write_lock, closing(self.connect()) as db, db:
            # Abandoned partial uploads expire; finished files never expire silently.
            expired = db.execute("SELECT id FROM files WHERE ready=0 AND touched<?", (time.time() - 7 * 86400,)).fetchall()
            for row in expired:
                self.path(row["id"]).unlink(missing_ok=True)
                db.execute("DELETE FROM files WHERE id=?", (row["id"],))
            existing = db.execute("SELECT * FROM files WHERE name=? AND size=? AND modified=?",
                                  (name, size, modified)).fetchone()
            if existing:
                return self.describe(existing)
            reserved = db.execute("SELECT coalesce(sum(size), 0) FROM files").fetchone()[0]
            count = db.execute("SELECT count(*) FROM files").fetchone()[0]
            outstanding = sum(row["size"] - self.describe(row)["offset"] for row in
                              db.execute("SELECT * FROM files WHERE ready=0"))
            if reserved + size > QUOTA or count >= 50:
                raise Rejected(507, "Brak miejsca w prywatnej skrzynce. Skontaktuj się z właścicielem.")
            if shutil.disk_usage(self.directory).free - outstanding - size < RESERVE:
                raise Rejected(507, "Za mało wolnego miejsca na serwerze na cały plik.")
            identifier = secrets.token_hex(16)
            self.path(identifier).touch(mode=0o600, exist_ok=False)
            now = time.time()
            db.execute("INSERT INTO files VALUES (?, ?, ?, ?, 0, ?, ?)",
                       (identifier, name, size, modified, now, now))
            return self.describe(self.row_in(db, identifier))

    @staticmethod
    def row_in(db, identifier):
        return db.execute("SELECT * FROM files WHERE id=?", (identifier,)).fetchone()


def byte_range(value, size):
    if value is None:
        return 0, size - 1, 200
    match = re.fullmatch(r"bytes=(\d*)-(\d*)", value)
    if not match or not any(match.groups()):
        raise Rejected(416, "Nieprawidłowy zakres pliku.")
    first, last = match.groups()
    if first:
        start, end = int(first), min(int(last) if last else size - 1, size - 1)
    else:
        start, end = max(0, size - int(last)), size - 1
    if start >= size or start > end or (not first and int(last) == 0):
        raise Rejected(416, "Nieprawidłowy zakres pliku.")
    return start, end, 206


class Handler(BaseHTTPRequestHandler):
    server_version = "PrivateTransfer"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    @property
    def store(self):
        return self.server.store

    def setup(self):
        super().setup()
        self.connection.settimeout(120)

    def log_message(self, *_args):
        # Do not log passwords, cookies, filenames or request queries.
        pass

    def headers_out(self, status, length, content_type="application/json; charset=utf-8", extra=None):
        self.send_response(status)
        headers = {
            "Content-Type": content_type, "Content-Length": str(length),
            "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive",
            "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
            "X-Frame-Options": "DENY", "Connection": "close",
            "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; media-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
        }
        headers.update(extra or {})
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()
        self.close_connection = True

    def json_out(self, status, data, extra=None):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.headers_out(status, len(body), extra=extra)
        if self.command != "HEAD":
            self.wfile.write(body)

    def body_length(self, maximum):
        if self.headers.get("Transfer-Encoding"):
            raise Rejected(400, "Wymagana długość żądania.")
        values = self.headers.get_all("Content-Length", [])
        if len(values) != 1 or not values[0].isdigit():
            raise Rejected(411, "Wymagana długość żądania.")
        length = int(values[0])
        if not 0 < length <= maximum:
            raise Rejected(413, "Za duża porcja danych.")
        return length

    def json_body(self):
        length = self.body_length(4096)
        raw = self.rfile.read(length)
        if len(raw) != length:
            raise Rejected(400, "Przerwane żądanie.")
        try:
            value = json.loads(raw)
        except (ValueError, UnicodeError):
            raise Rejected(400, "Nieprawidłowe dane.") from None
        if not isinstance(value, dict):
            raise Rejected(400, "Nieprawidłowe dane.")
        return value

    def session(self):
        cookies = SimpleCookie()
        try:
            cookies.load(self.headers.get("Cookie", ""))
        except Exception:
            raise Rejected(401, "Zaloguj się ponownie na /daj/.") from None
        token = cookies[COOKIE].value if COOKIE in cookies else ""
        with self.store.lock:
            value = self.store.sessions.get(token)
            if not value or value["expires"] <= time.time():
                self.store.sessions.pop(token, None)
                raise Rejected(401, "Zaloguj się ponownie na /daj/.")
            return token, value

    def dispatch(self):
        self.path_parts = urlsplit(self.path)
        path = self.path_parts.path
        mutating = self.command in {"POST", "PATCH", "DELETE"}
        if mutating and self.headers.get("Origin") != self.store.origin:
            raise Rejected(403, "Niedozwolone źródło żądania.")
        if self.command in {"GET", "HEAD"} and path in {"/daj/", "/daj/app.js", "/daj/style.css"}:
            name = {"/daj/": "index.html", "/daj/app.js": "app.js", "/daj/style.css": "style.css"}[path]
            body = Path(__file__).with_name(name).read_bytes()
            mime = {"index.html": "text/html", "app.js": "application/javascript", "style.css": "text/css"}[name]
            self.headers_out(200, len(body), mime + "; charset=utf-8")
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        if path == "/daj/api/login" and self.command == "POST":
            token, csrf = self.store.login(self.json_body().get("password"), self.headers.get("X-Real-IP", self.client_address[0]))
            self.json_out(200, {"csrf": csrf}, {"Set-Cookie": f"{COOKIE}={token}; Path=/daj/; Secure; HttpOnly; SameSite=Strict; Max-Age={SESSION_TTL}"})
            return
        try:
            token, session = self.session()
        except Rejected:
            if self.command == "GET" and re.fullmatch(r"/daj/file/[0-9a-f]{32}", path):
                identifier = path.rsplit("/", 1)[1]
                download = "&download=1" if "download" in parse_qs(self.path_parts.query) else ""
                self.headers_out(303, 0, extra={"Location": f"/daj/?file={identifier}{download}"})
                return
            raise
        if mutating and not hmac.compare_digest(self.headers.get("X-Daj-CSRF", ""), session["csrf"]):
            raise Rejected(403, "Odśwież stronę i spróbuj ponownie.")
        if path == "/daj/api/logout" and self.command == "POST":
            with self.store.lock:
                self.store.sessions.pop(token, None)
            self.json_out(200, {"ok": True}, {"Set-Cookie": f"{COOKIE}=; Path=/daj/; Secure; HttpOnly; SameSite=Strict; Max-Age=0"})
        elif path == "/daj/api/status" and self.command == "GET":
            with closing(self.store.connect()) as db:
                files = [self.store.describe(row) for row in db.execute("SELECT * FROM files ORDER BY created DESC")]
            self.json_out(200, {"csrf": session["csrf"], "files": files, "max_file": MAX_FILE, "chunk": CHUNK})
        elif path == "/daj/api/uploads" and self.command == "POST":
            self.json_out(200, self.store.create(self.json_body()))
        elif re.fullmatch(r"/daj/api/uploads/[0-9a-f]{32}(?:/finish)?", path):
            identifier = path.split("/")[4]
            if self.command == "GET" and not path.endswith("/finish"):
                self.json_out(200, self.store.describe(self.store.row(identifier)))
            elif self.command == "PATCH" and not path.endswith("/finish"):
                self.chunk(identifier)
            elif self.command == "POST" and path.endswith("/finish"):
                self.finalize_upload(identifier)
            elif self.command == "DELETE" and not path.endswith("/finish"):
                with self.store.write_lock, closing(self.store.connect()) as db, db:
                    row = self.store.row(identifier)
                    if row["ready"]:
                        raise Rejected(409, "Gotowy plik może usunąć tylko właściciel serwera.")
                    self.store.path(identifier).unlink(missing_ok=True)
                    db.execute("DELETE FROM files WHERE id=?", (identifier,))
                self.json_out(200, {"ok": True})
            else:
                raise Rejected(405, "Niedozwolona metoda.")
        elif re.fullmatch(r"/daj/file/[0-9a-f]{32}", path) and self.command in {"GET", "HEAD"}:
            self.file(path.rsplit("/", 1)[1])
        else:
            raise Rejected(404, "Nie znaleziono strony.")

    def chunk(self, identifier):
        length = self.body_length(CHUNK)
        raw_offset = self.headers.get("Upload-Offset", "")
        if not raw_offset.isdigit():
            raise Rejected(400, "Nieprawidłowa pozycja pliku.")
        # Serialize writes, reservations and deletion. No second temporary copy.
        # A waiting request is rejected so a slow sender cannot exhaust workers.
        if not self.store.write_lock.acquire(blocking=False):
            raise Rejected(409, "Trwa zapisywanie porcji. Spróbuj ponownie.")
        try:
            row = self.store.row(identifier)
            path = self.store.path(identifier)
            offset = path.stat().st_size
            if row["ready"] or int(raw_offset) != offset:
                raise Rejected(409, "Pozycja pliku się zmieniła. Wznów wysyłanie.")
            if offset + length > row["size"]:
                raise Rejected(413, "Porcja przekracza rozmiar pliku.")
            if shutil.disk_usage(self.store.directory).free - length < RESERVE:
                raise Rejected(507, "Pozostało za mało miejsca na serwerze.")
            with path.open("r+b", buffering=0) as output:
                output.seek(offset)
                try:
                    remaining = length
                    while remaining:
                        block = self.rfile.read(min(128 * 1024, remaining))
                        if not block:
                            raise Rejected(400, "Przerwane połączenie. Możesz wznowić wysyłanie.")
                        view = memoryview(block)
                        while view:
                            written = output.write(view)
                            if not written:
                                raise OSError("short write")
                            view = view[written:]
                        remaining -= len(block)
                    os.fsync(output.fileno())
                except BaseException:
                    output.truncate(offset)
                    os.fsync(output.fileno())
                    raise
            with closing(self.store.connect()) as db, db:
                db.execute("UPDATE files SET touched=? WHERE id=?", (time.time(), identifier))
            self.json_out(200, {"offset": offset + length})
        finally:
            self.store.write_lock.release()

    def finalize_upload(self, identifier):
        with self.store.write_lock:
            row = self.store.row(identifier)
            if self.store.path(identifier).stat().st_size != row["size"]:
                raise Rejected(409, "Plik nie został jeszcze wysłany w całości.")
            with closing(self.store.connect()) as db, db:
                db.execute("UPDATE files SET ready=1, touched=? WHERE id=?", (time.time(), identifier))
            self.json_out(200, self.store.describe(self.store.row(identifier)))

    def file(self, identifier):
        row = self.store.row(identifier)
        if not row["ready"]:
            raise Rejected(409, "Plik jest jeszcze wysyłany.")
        size = row["size"]
        try:
            start, end, status = byte_range(self.headers.get("Range"), size)
        except Rejected:
            self.json_out(416, {"message": "Nieprawidłowy zakres pliku."}, {"Content-Range": f"bytes */{size}"})
            return
        mime = VIDEO_TYPES.get(Path(row["name"]).suffix.lower(), "application/octet-stream")
        disposition = "attachment" if "download" in parse_qs(self.path_parts.query) or mime == "application/octet-stream" else "inline"
        headers = {"Accept-Ranges": "bytes", "Content-Disposition": f"{disposition}; filename=\"plik\"; filename*=UTF-8''{quote(row['name'], safe='')}"}
        if status == 206:
            headers["Content-Range"] = f"bytes {start}-{end}/{size}"
        if not self.store.downloads.acquire(blocking=False):
            raise Rejected(429, "Trwają inne pobrania. Spróbuj ponownie za chwilę.")
        try:
            with self.store.path(identifier).open("rb") as source:
                source.seek(start)
                self.headers_out(status, end - start + 1, mime, headers)
                if self.command == "HEAD":
                    return
                remaining = end - start + 1
                while remaining:
                    block = source.read(min(128 * 1024, remaining))
                    if not block:
                        break
                    self.wfile.write(block)
                    remaining -= len(block)
        finally:
            self.store.downloads.release()

    def handle_request(self):
        try:
            self.dispatch()
        except Rejected as exc:
            self.json_out(exc.status, {"message": exc.message})
        except (BrokenPipeError, ConnectionError, socket.timeout):
            self.close_connection = True
        except Exception as exc:
            # Exception class only: no filenames, content, session or secrets.
            print("TRANSFER_ERROR " + type(exc).__name__, flush=True)
            self.json_out(500, {"message": "Błąd serwera. Spróbuj ponownie za chwilę."})

    do_GET = do_HEAD = do_POST = do_PATCH = do_DELETE = handle_request


class Server(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 16

    def __init__(self, address, store):
        self.store = store
        self.workers = threading.BoundedSemaphore(12)
        super().__init__(address, Handler)

    def process_request(self, request, address):
        if not self.workers.acquire(blocking=False):
            request.close()
            return
        try:
            super().process_request(request, address)
        except BaseException:
            self.workers.release()
            raise

    def process_request_thread(self, request, address):
        try:
            super().process_request_thread(request, address)
        finally:
            self.workers.release()


if __name__ == "__main__":
    os.umask(0o077)
    credentials = Path(os.environ["CREDENTIALS_DIRECTORY"]) / "auth.json"
    state = Path(os.environ.get("STATE_DIRECTORY", "/var/lib/lemanczyk-transfer"))
    Server(("127.0.0.1", 8776), Store(state, credentials)).serve_forever()
