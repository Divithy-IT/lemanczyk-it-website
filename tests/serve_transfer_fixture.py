"""Ephemeral loopback server for the private-transfer browser test."""
import importlib.util
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("transfer", root / "transfer/app.py")
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)
# This fixture writes only ~20 MiB. Hosted CI runners can have less than the
# production 8 GiB floor; unit tests separately verify that production policy.
app.RESERVE = 64 * 1024 ** 2
directory = Path(sys.argv[1])
store = app.Store(directory / "state", directory / "auth.json")
server = app.Server(("127.0.0.1", 0), store)
store.origin = f"http://127.0.0.1:{server.server_port}"
print(store.origin, flush=True)
server.serve_forever()
