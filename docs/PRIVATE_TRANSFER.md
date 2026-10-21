# Private file transfer

`https://lemanczyk-it.pl/daj/` is a password-protected private transfer inbox.
The website repository owns `transfer/` (Python standard library service and
standalone browser UI); `lemanczyk-infra` owns nginx and the systemd unit.
It is deliberately absent from site navigation and the sitemap. Both HTML and
HTTP responses declare `noindex, nofollow, noarchive`; robots.txt disallows it.
These directives supplement authentication; they do not replace it.

## Use

Enter the shared password, select a file and start uploading. The browser sends
8 MiB chunks, shows percent, measured average speed, estimated remaining time
and approximate finish time. Keep the tab open and the device awake. Screen
wake lock is requested where supported. A stopped transfer can be resumed by
selecting the same original file (name, size and modification time identify it).
Network failures retry up to five times, querying the committed server offset
before each retry. After a browser or service restart, sign in again and select
the file. Upload metadata and bytes survive service restarts.

After the final server confirmation, authenticated users can download, copy a
link or view a supported movie. All links still require the shared password;
opening a file link without a session returns to the login page. HTTP ranges
support seeking and resumed downloads. MP4/M4V, WebM, OGV and MOV are offered
for inline video, but actual playback depends on browser codec support. Other
formats download as attachments; there is no transcoding or media execution.

## Limits and storage

- Maximum file: 12 GiB (also covers a 10 GB or 10 GiB film).
- Total declared file sizes: 16 GiB, including unfinished uploads; at most 50
  records. New uploads reserve their whole declared size in this budget.
- At least 8 GiB of physical disk free must remain, accounting for other pending
  transfer reservations at creation and checking again before every chunk.
- Partial uploads untouched for seven days are removed when a new transfer is
  created. Users can explicitly remove unfinished uploads. Finished files are
  never automatically deleted and only the server owner can remove them.
- Runtime state: `/var/lib/lemanczyk-transfer/` (systemd DynamicUser places its
  backing directory under `/var/lib/private/lemanczyk-transfer/`). Metadata is
  `transfers.sqlite3`; uploaded files are `<random-id>.data`, outside web roots.
  No uploaded names are interpreted as paths. Do not copy these into Git.
- A file is written once in place, without a full-size temporary copy. A failed
  chunk rolls back to its previous offset. Every complete chunk is fsynced.
  After a process crash, resume uses actual durable file size, including any
  partial chunk that reached disk. A finalization checks the declared size.

The service is in the existing shared 500 MiB `web.slice`, with its own 160 MiB
ceiling, 128 MiB high threshold, no swap, 25% of one CPU, low CPU/I/O priority,
12 bounded request workers and three simultaneous downloads. Buffers are
128 KiB, never the whole movie. Kernel file cache is reclaimable and also counts
against the service's memory budget.

## Credentials and operations

Provision `/etc/lemanczyk-transfer/auth.json` as root, mode 0400, in a root-only
directory. It contains only `salt` (32 random bytes as hex) and `hash` (32-byte
scrypt result as hex, n=16384, r=8, p=1). No plaintext password, password hash,
session token, production filename or upload content belongs in Git. The unit
passes this file with systemd `LoadCredential`; the app has no direct access to
other `/etc` secrets. No credentials are passed in process arguments or URLs.

Deploy website code first, then the infra unit and proxy. Once credentials are
provisioned, `systemctl enable --now lemanczyk-transfer.service`. Both deployers
restart only an already-active transfer service when its managed code/unit
changes. This logs sessions out; any interrupted upload can be resumed. It does
not restart games. The release deployer retains the previous website release;
transfer code rollback additionally requires redeploying the previous four
helper files, not just changing the static-site symlink.

Authentication uses opaque, in-memory, 24-hour sessions, Secure/HttpOnly/
SameSite=Strict host-only cookies, an independent CSRF token, exact same-origin
checks, scrypt password verification and bounded per-IP/global login budgets.
Nginx terminates HTTPS, overrides client IP headers and exposes the loopback
service only under `/daj/`. Both nginx request and response buffering are off.
Nginx access logging is disabled for this prefix; application logging contains
error classes only. File responses are private/no-store and cannot be framed.

Check `systemctl status lemanczyk-transfer.service`, `journalctl -u
lemanczyk-transfer.service`, disk free space and `web.slice` memory after changes.
`python3 -m unittest discover -s tests -p 'test_transfer.py' -v` runs live HTTP
tests, including unauthenticated access, CSRF, password throttling, interrupted
chunks, ranges, exact returned bytes and a sparse file offset above 5 GiB.

To remove a completed file, first stop the transfer service, back up metadata,
look up the row locally in `transfers.sqlite3`, remove precisely its matching
`<id>.data` and database row, then start the service again. Do not delete other
state or active uploads. Files on this VPS are not an off-site backup.
