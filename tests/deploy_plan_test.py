"""Offline checks for the website release deployment plan.

The deployer is POSIX-only (pwd, grp), so this runs on Linux CI and skips on
Windows workstations instead of reporting a false failure.
"""

import importlib.util
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEPLOY = ROOT / "deploy/deploy.py"

if sys.platform == "win32":
    print("website deploy plan check skipped: POSIX-only deployer")
    raise SystemExit(0)

spec = importlib.util.spec_from_file_location("website_deploy", DEPLOY)
deploy = importlib.util.module_from_spec(spec)
# @dataclass resolves annotations through sys.modules, so register before exec.
sys.modules[spec.name] = deploy
spec.loader.exec_module(deploy)

allowlist = json.loads((ROOT / "deploy/allowlist.json").read_text(encoding="utf-8"))
assert "/etc/" in allowlist["forbidden_prefixes"], "secrets and sudoers stay out of reach"
assert "/var/www/html/" in allowlist["forbidden_prefixes"], "the old site is not ours"
assert "/var/www/cs16-fastdl/" in allowlist["forbidden_prefixes"], "FastDL belongs to CS"
assert "/etc/lemanczyk-it/contact-mailer.env" in allowlist["forbidden_exact"], "mailer secrets"

for denied in (
    "/etc/lemanczyk-it/contact-mailer.env",
    "/etc/nginx/sites-available/default",
    "/var/www/html/index.php",
    "/var/www/cs16-fastdl/maps/x.bsp",
    "/var/www/mc-landing/index.html",
    "/opt/game-panel/app.py",
    "/srv/l4d2/server/x",
    "/var/www/lemanczyk-it-releases/../../etc/passwd",
):
    assert not deploy.permitted(Path(denied), allowlist), f"allowlist must deny {denied}"
for allowed in (
    "/var/www/lemanczyk-it-current",
    "/var/www/lemanczyk-it-releases/20260101-abcdefg/index.html",
    "/usr/local/lib/lemanczyk-it-website/bin/website-deploy",
):
    assert deploy.permitted(Path(allowed), allowlist), f"allowlist must permit {allowed}"

# The release name becomes a filesystem path, so a hostile value must be refused.
for commit, date in (
    ("../../etc", "20260101"),
    ("abcdef", "20260101"),
    ("abcdefg", "2026010"),
    ("abcdefg; rm -rf /", "20260101"),
    ("ZZZZZZZ", "20260101"),
):
    os.environ["LEMANCZYK_RELEASE_COMMIT"] = commit
    os.environ["LEMANCZYK_RELEASE_DATE"] = date
    try:
        deploy.release_identity()
    except RuntimeError:
        pass
    else:
        raise AssertionError(f"release identity must be refused: {date}-{commit}")

os.environ["LEMANCZYK_RELEASE_COMMIT"] = "0123456789abcdef0123456789abcdef01234567"
os.environ["LEMANCZYK_RELEASE_DATE"] = "20260101"
commit, date = deploy.release_identity()
assert deploy.release_name(commit, date) == "20260101-0123456", "release name is date and short sha"

# A release directory outside the releases root must never be accepted.
for outside in ("/var/www/lemanczyk-it-releases", "/var/www/html/release", "/tmp/release"):
    try:
        deploy.validate([], Path(outside))
    except RuntimeError:
        pass
    else:
        raise AssertionError(f"release location must be refused: {outside}")


def plan(root: Path, dist: Path, *extra: str) -> list[str]:
    result = subprocess.run(
        [sys.executable, str(DEPLOY), "--root", str(root), "--dist", str(dist), *extra],
        capture_output=True, text=True, check=True, cwd=ROOT,
    )
    return result.stdout.splitlines()


with tempfile.TemporaryDirectory(prefix="website-deploy-plan.") as temporary:
    root = Path(temporary) / "root"
    dist = Path(temporary) / "dist"
    (dist / "assets").mkdir(parents=True)
    (dist / "api").mkdir(parents=True)
    (dist / "index.html").write_text("<!doctype html>\n", encoding="utf-8")
    (dist / "assets/app.css").write_text("body{}\n", encoding="utf-8")
    (dist / "api/contact.php").write_text("<?php\n", encoding="utf-8")
    root.mkdir()

    lines = plan(root, dist)
    summary = next(line for line in lines if line.startswith("PLAN_OK"))
    fields = dict(item.split("=", 1) for item in summary.split("\t")[1:])
    assert fields["release"] == "20260101-0123456", fields
    assert fields["symlink"] == "switch", "an absent symlink must be reported as a switch"
    assert fields["stale"] == "0"
    assert fields["foreign"] == "0"
    assert fields["secrets_touched"] == "0"
    assert fields["changed"] == fields["total"], "an empty root deploys every file"

    targets = {line.split("\t")[2] for line in lines if line.startswith(("CREATE", "UPDATE"))}
    assert "/var/www/lemanczyk-it-releases/20260101-0123456/index.html" in targets, targets
    assert "/var/www/lemanczyk-it-releases/20260101-0123456/api/contact.php" in targets, targets
    assert "/usr/local/lib/lemanczyk-it-website/bin/website-deploy" in targets, targets
    assert not any(target.startswith("/etc/") for target in targets), targets

    # A build that produces nothing must fail loudly rather than publish an
    # empty release over a working site.
    empty = Path(temporary) / "empty"
    empty.mkdir()
    result = subprocess.run(
        [sys.executable, str(DEPLOY), "--root", str(root), "--dist", str(empty)],
        capture_output=True, text=True, cwd=ROOT,
    )
    assert result.returncode != 0, "a missing build must not produce a plan"
    assert "missing build" in result.stderr, result.stderr

print("website deploy plan check passed")
