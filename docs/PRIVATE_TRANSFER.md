# Private file transfer

`https://lemanczyk-it.pl/daj/` is a password-protected private transfer inbox.
The website repository owns `transfer/` (Python standard library service and
standalone browser UI); `lemanczyk-infra` owns nginx and the systemd unit.
It is deliberately absent from site navigation and the sitemap. Both HTML and
HTTP responses declare `noindex, nofollow, noarchive`; robots.txt disallows it.
These directives supplement authentication; they do not replace it.

## Use

There are two shared passwords. The uploader password allows uploading, viewing
and downloading. The separate viewer password allows viewing and downloading
finished files only. The server stores the role in its session and denies every
upload API operation (create, inspect partial, append, finalize, delete) to viewers,
even with valid CSRF tokens or forged client role fields. Viewers never see
unfinished uploads in the file list, and the upload form is hidden.

Enter the uploader password, select a file and start uploading. The browser sends
8 MiB chunks, shows percent, measured average speed, estimated remaining time
and approximate finish time. Keep the tab open and the device awake. Screen
wake lock is requested where supported. A stopped transfer can be resumed by
selecting the same original file (name, size and modification time identify it).
Network failures retry up to five times, querying the committed server offset
before each retry. After a browser or service restart, sign in again and select
the file. Upload metadata and bytes survive service restarts.

After the final server confirmation, users with either password can download, copy a
link or view a supported movie. Links require a password by default;
opening a private file link without a session returns to the login page. HTTP ranges
support seeking and resumed downloads. MP4/M4V, WebM, OGV and MOV are offered
for inline video, but actual playback depends on browser codec support. Other
formats download as attachments; there is no transcoding or media execution.

The owner can explicitly publish a selected complete file by adding its random
32-character ID to `public_files` in `/etc/lemanczyk-transfer/auth.json` and
restarting only `lemanczyk-transfer.service`. The same `/daj/file/<id>` then
opens a standalone player and download button without a session. Its
`?stream=1` URL serves the media with HTTP range support, and `?download=1`
downloads the original file with its original filename. All three responses
remain `noindex, nofollow, noarchive` and no-store. No file directory is exposed.
Partial uploads cannot be public even if listed. Other files, the inbox API and
all upload operations retain their existing authentication and role checks.
Omitting `public_files` or setting it to `[]` keeps all files private; malformed
lists fail startup. Removing an ID and restarting revokes its anonymous access.
The list lives only in private host configuration, never in Git. Publishing a
link permits anyone who possesses it to view and download that file.

## Limits and storage

- Maximum file: 16 GiB (also covers a 16 GB film).
- Total declared file sizes: 20 GiB, including unfinished uploads; at most 50
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
28 bounded request workers, eight simultaneous original-file downloads and fifteen
separate playback transfers. Downloads cannot consume playback slots. Inline
range responses are limited to 8 MiB so a paused browser does not hold a slot
for an entire movie; stalled playback writes time out after 15 seconds. Browsers
request subsequent ranges as playback proceeds. Original downloads keep their
full requested range and exact bytes. HEAD requests do not consume transfer
slots; capacity errors include `Retry-After: 10`. Buffers are
128 KiB, never the whole movie. Kernel file cache is reclaimable and also counts
against the service's memory budget.

The shared player and private preview show live playback and download counts.
Playback uses a random per-page token, refreshed every 15 seconds while playing;
pause/end/closing releases it, and a lost heartbeat expires after 45 seconds.
At most fifteen playback leases are admitted globally. Counts describe active
player sessions, not identifiable people; multiple tabs/devices count separately.
Download counts track active response bodies, including canceled connections.
Per-file activity endpoints retain that file's existing public/private access.
Busy players show a Polish waiting message and retry automatically after about
10–12 seconds, preserving their playback position. Downloads have a preflight
check and an HTML waiting page as a fallback. Original downloads are unchanged.

## Credentials and operations

Provision `/etc/lemanczyk-transfer/auth.json` as root, mode 0400, in a root-only
directory. It contains only `salt` (32 random bytes as hex) and `hash` (32-byte
scrypt result as hex, n=16384, r=8, p=1) for upload access. The additional
`viewer_salt` and `viewer_hash` fields use a separate salt and the same parameters
for view/download access. Legacy credentials without both viewer fields keep
viewer access disabled; partially configured viewer fields fail startup.
No plaintext password, password hash,
session token, production filename, public sharing ID or upload content belongs in Git. The unit
passes this file with systemd `LoadCredential`; the app has no direct access to
other `/etc` secrets. No credentials are passed in process arguments or URLs.

Deploy website code first, then the infra unit and proxy. Once credentials are
provisioned, `systemctl enable --now lemanczyk-transfer@8777.service`. The instance
template uses the same DynamicUser and persistent StateDirectory as the legacy
service; `TRANSFER_PORT` selects its loopback listener. Nginx uses port 8777.
Both deployers prefer this instance and fall back to the old unit. They
restart only an already-active transfer service when its managed code/unit
changes. This logs sessions out; any interrupted upload can be resumed. It does
not restart games. The release deployer retains the previous website release;
transfer code rollback additionally requires redeploying the previous five
helper files, not just changing the static-site symlink.

For the initial handover, install and start the new instance before reloading
nginx. The old port-8776 process must remain running until its existing transfers
finish. Disable its boot enablement without stopping it. The infra
`transfer-retire-legacy` helper can run every 15 seconds from a transient timer.
Its root-only `/run/lemanczyk-transfer-legacy.json` captures the old PID, process
start ticks and file descriptors of known running downloads. It updates
`legacy-download-counts.json` in StateDirectory so the new instance counts those
downloads against its eight-download budget. It stops the old unit and its timer
only after the captured files and all old established connections have drained.
Neither handover metadata file belongs in Git. Existing public movie URLs stay
the same. Private in-memory login sessions are not migrated between processes.

Authentication uses opaque, in-memory, 24-hour sessions, Secure/HttpOnly/
SameSite=Strict host-only cookies, an independent CSRF token, exact same-origin
checks, scrypt password verification and bounded per-IP/global login budgets.
Nginx terminates HTTPS, overrides client IP headers and exposes the loopback
service only under `/daj/`. Both nginx request and response buffering are off.
Nginx access logging is disabled for this prefix; application logging contains
error classes only. File responses are private/no-store and cannot be framed.

Check `systemctl status lemanczyk-transfer@8777.service`, `journalctl -u
lemanczyk-transfer@8777.service`, disk free space and `web.slice` memory after changes.
`python3 -m unittest discover -s tests -p 'test_transfer.py' -v` runs live HTTP
tests, including explicit public sharing, viewer read/write authorization, unauthenticated access, CSRF, password throttling, interrupted
chunks, ranges, exact returned bytes and a sparse file offset above 5 GiB.

To remove a completed file, first stop the transfer service, back up metadata,
look up the row locally in `transfers.sqlite3`, remove precisely its matching
`<id>.data` and database row, then start the service again. Do not delete other
state or active uploads. Files on this VPS are not an off-site backup.
