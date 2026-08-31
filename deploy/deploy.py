#!/usr/bin/env python3
"""Fail-closed release deployment for lemanczyk-it.pl.

The build is NOT run from here. npm executes package install scripts, and this
program runs as root; the build belongs to the unprivileged runner or to the
operator. This program only installs an existing dist/ tree as an immutable
release and switches the served symlink onto it.
"""

from __future__ import annotations

import argparse
import grp
import hashlib
import json
import os
import pwd
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWLIST = ROOT / "deploy/allowlist.json"
DIST = ROOT / "dist"
RELEASES = Path("/var/www/lemanczyk-it-releases")
CURRENT = Path("/var/www/lemanczyk-it-current")
HELPERS = Path("/usr/local/lib/lemanczyk-it-website/bin")
MANIFEST = ".lemanczyk-release.json"
NGINX = "nginx.service"
PHP_FPM = "php8.3-fpm.service"
COMMIT_PATTERN = re.compile(r"\A[0-9a-f]{7,40}\Z")
DATE_PATTERN = re.compile(r"\A[0-9]{8}\Z")


@dataclass(frozen=True)
class Entry:
    source: Path | None
    target: Path
    mode: int = 0o644
    kind: str = "file"


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def load_allowlist() -> dict[str, object]:
    data = json.loads(ALLOWLIST.read_text(encoding="utf-8"))
    if data.get("version") != 1:
        raise RuntimeError("unsupported allowlist version")
    for key in ("exact", "prefixes", "forbidden_prefixes", "forbidden_exact"):
        values = data.get(key)
        if not isinstance(values, list) or any(not Path(item).is_absolute() for item in values):
            raise RuntimeError(f"invalid allowlist field: {key}")
    return data


def permitted(target: Path, allowlist: dict[str, object]) -> bool:
    normalized = Path(os.path.normpath(target))
    forbidden_exact = {Path(item) for item in allowlist["forbidden_exact"]}
    forbidden_prefixes = tuple(Path(item.rstrip("/")) for item in allowlist["forbidden_prefixes"])
    if normalized in forbidden_exact or any(
        normalized == prefix or normalized.is_relative_to(prefix) for prefix in forbidden_prefixes
    ):
        return False
    exact = {Path(item) for item in allowlist["exact"]}
    prefixes = tuple(Path(item.rstrip("/")) for item in allowlist["prefixes"])
    return normalized in exact or any(
        normalized == prefix or normalized.is_relative_to(prefix) for prefix in prefixes
    )


def release_identity() -> tuple[str, str]:
    """Commit and date for the release name.

    The wrapper resolves both as the runner account and passes them in, so root
    never reads git configuration from a tree the runner can write. Values are
    validated here because they end up in a filesystem path.
    """
    commit = os.environ.get("LEMANCZYK_RELEASE_COMMIT", "")
    date = os.environ.get("LEMANCZYK_RELEASE_DATE", "")
    if not commit or not date:
        commit = subprocess.run(
            ["git", "-C", str(ROOT), "rev-parse", "HEAD"],
            check=True, text=True, capture_output=True,
        ).stdout.strip()
        date = subprocess.run(
            ["git", "-C", str(ROOT), "log", "-1", "--format=%cd", "--date=format:%Y%m%d"],
            check=True, text=True, capture_output=True,
        ).stdout.strip()
    if not COMMIT_PATTERN.match(commit) or not DATE_PATTERN.match(date):
        raise RuntimeError(f"invalid release identity: {date}-{commit}")
    return commit, date


def release_name(commit: str, date: str) -> str:
    return f"{date}-{commit[:7]}"


def build_files(dist: Path) -> list[Path]:
    if not (dist / "index.html").is_file():
        raise RuntimeError(
            "missing build: run 'npm ci && npm run build' before deploying"
        )
    return sorted(path for path in dist.rglob("*") if path.is_file() and not path.is_symlink())


def rooted(target: Path, root: Path) -> Path:
    return target if root == Path("/") else root / target.relative_to("/")


def entries(release: Path, sources: list[Path], dist: Path) -> list[Entry]:
    result = [Entry(source, release / source.relative_to(dist)) for source in sources]
    result.append(Entry(ROOT / "deploy/bin/website-deploy", HELPERS / "website-deploy", 0o755))
    return result


def validate(items: list[Entry], release: Path) -> None:
    allowlist = load_allowlist()
    if not release.is_relative_to(RELEASES) or release == RELEASES:
        raise RuntimeError(f"release outside the releases directory: {release}")
    targets: set[Path] = set()
    for entry in items:
        if not entry.target.is_absolute() or not permitted(entry.target, allowlist):
            raise RuntimeError(f"DENIED target outside website allowlist: {entry.target}")
        if entry.target in targets:
            raise RuntimeError(f"duplicate target: {entry.target}")
        targets.add(entry.target)
        if entry.kind == "file" and (entry.source is None or not entry.source.is_file()):
            raise RuntimeError(f"missing source for {entry.target}")
    if not permitted(CURRENT, allowlist):
        raise RuntimeError("the served symlink is not allowlisted")


def changed(entry: Entry, root: Path) -> bool:
    target = rooted(entry.target, root)
    if not target.is_file() or target.is_symlink():
        return True
    if digest(entry.source) != digest(target):
        return True
    if (target.stat().st_mode & 0o7777) != entry.mode:
        return True
    if root == Path("/"):
        status = target.stat()
        return status.st_uid != 0 or status.st_gid != 0
    return False


def stale(release: Path, items: list[Entry], root: Path) -> list[Path]:
    """Files inside the release directory that this build does not produce."""
    base = rooted(release, root)
    if not base.is_dir():
        return []
    managed = {entry.target for entry in items} | {release / MANIFEST}
    found = []
    for path in sorted(base.rglob("*")):
        if not path.is_file() or path.is_symlink():
            continue
        logical = release / path.relative_to(base)
        if logical not in managed:
            found.append(logical)
    return found


def install(entry: Entry, root: Path) -> None:
    target = rooted(entry.target, root)
    if entry.kind == "remove":
        target.unlink(missing_ok=True)
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=f".{target.name}.", dir=target.parent)
    os.close(fd)
    temporary_path = Path(temporary)
    try:
        shutil.copyfile(entry.source, temporary_path)
        temporary_path.chmod(entry.mode)
        if root == Path("/"):
            os.chown(temporary_path, pwd.getpwnam("root").pw_uid, grp.getgrnam("root").gr_gid)
        os.replace(temporary_path, target)
    finally:
        temporary_path.unlink(missing_ok=True)


def symlink_target(root: Path) -> str | None:
    link = rooted(CURRENT, root)
    if not link.is_symlink():
        return None
    return os.readlink(link)


def switch_symlink(release: Path, root: Path) -> None:
    """Atomic swap: a temporary link renamed over the served path."""
    link = rooted(CURRENT, root)
    staging = link.parent / f".{link.name}.new"
    staging.unlink(missing_ok=True)
    staging.symlink_to(release)
    os.replace(staging, link)


def write_manifest(release: Path, commit: str, entries_count: int, root: Path) -> None:
    target = rooted(release / MANIFEST, root)
    payload = {"commit": commit, "release": release.name, "files": entries_count}
    target.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    target.chmod(0o644)
    if root == Path("/"):
        os.chown(target, 0, 0)


def prunable(keep: int, release: Path, current: str | None, root: Path) -> list[Path]:
    base = rooted(RELEASES, root)
    if keep <= 0 or not base.is_dir():
        return []
    protected = {release.name}
    if current:
        protected.add(Path(current).name)
    existing = sorted((path for path in base.iterdir() if path.is_dir()), key=lambda p: p.name)
    candidates = [path for path in existing if path.name not in protected]
    # The release being deployed counts towards the limit even though it does
    # not exist yet, otherwise --keep N always leaves N+1 directories behind.
    total_after = len(existing) + (0 if rooted(release, root).is_dir() else 1)
    surplus = total_after - keep
    return [RELEASES / path.name for path in candidates[:max(0, surplus)]]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="install the release and switch the symlink")
    parser.add_argument("--prune", action="store_true",
                        help="also remove files the build no longer produces")
    parser.add_argument("--keep", type=int, default=0, metavar="N",
                        help="keep only the newest N releases (default: keep every release)")
    parser.add_argument("--root", type=Path, default=Path("/"), help=argparse.SUPPRESS)
    parser.add_argument("--dist", type=Path, default=DIST, help=argparse.SUPPRESS)
    parser.add_argument("--no-reload", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    root = args.root.resolve()

    commit, date = release_identity()
    release = RELEASES / release_name(commit, date)
    current = symlink_target(root)

    dist = args.dist.resolve()
    sources = build_files(dist)
    items = entries(release, sources, dist)
    orphans = stale(release, items, root)
    if args.prune:
        items.extend(Entry(None, path, kind="remove") for path in orphans)
    validate([item for item in items if item.kind == "file"], release)

    changed_items = [item for item in items if changed(item, root) or item.kind == "remove"]
    switching = current != str(release)
    retire = prunable(args.keep, release, current, root)

    for path in ([] if args.prune else orphans):
        print(f"STALE\t-\t{path}")
    for entry in items:
        if entry.kind == "remove":
            action = "DELETE"
        elif entry not in changed_items:
            action = "UNCHANGED"
        else:
            action = "CREATE" if not rooted(entry.target, root).exists() else "UPDATE"
        source = "-" if entry.source is None else entry.source.name
        print(f"{action}\t{source}\t{entry.target}")
    for path in retire:
        print(f"RETIRE\t-\t{path}")
    print(f"SYMLINK\t{current or 'none'}\t{release}\t{'SWITCH' if switching else 'UNCHANGED'}")

    reloads = ",".join(
        name for name, active in ((NGINX, switching or bool(changed_items)),
                                  (PHP_FPM, switching or bool(changed_items))) if active
    ) or "none"
    print(
        f"PLAN_OK\ttotal={len(items)}\tchanged={len(changed_items)}"
        f"\tunchanged={len(items) - len(changed_items)}\tstale={0 if args.prune else len(orphans)}"
        f"\trelease={release.name}\tsymlink={'switch' if switching else 'unchanged'}"
        f"\tretire={len(retire)}\treloads={reloads}\tforeign=0\tsecrets_touched=0"
    )
    if not args.apply:
        return 0
    if root == Path("/") and os.geteuid() != 0:
        raise RuntimeError("--apply requires root")
    if not changed_items and not switching and not retire:
        print("DEPLOY_OK\tchanged=0\treleased=none\tsymlink=unchanged\treloads=none")
        return 0

    rooted(RELEASES, root).mkdir(parents=True, exist_ok=True)
    for entry in sorted(changed_items, key=lambda item: (item.kind == "remove", str(item.target))):
        install(entry, root)
    write_manifest(release, commit, len(sources), root)
    previous = current
    if switching:
        switch_symlink(release, root)
    if root == Path("/") and not args.no_reload:
        subprocess.run(["nginx", "-t"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["systemctl", "reload", NGINX], check=True)
        subprocess.run(["systemctl", "reload", PHP_FPM], check=True)
    for path in retire:
        shutil.rmtree(rooted(path, root))
    print(
        f"DEPLOY_OK\tchanged={len(changed_items)}\treleased={release.name}"
        f"\tprevious={Path(previous).name if previous else 'none'}"
        f"\tsymlink={'switched' if switching else 'unchanged'}\tretired={len(retire)}"
        f"\treloads={reloads}\tsecrets_touched=0"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"DEPLOY_FAILED\t{exc}", file=sys.stderr)
        raise SystemExit(1)
