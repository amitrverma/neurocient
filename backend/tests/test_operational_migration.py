import importlib.util
from pathlib import Path

import pytest


def _load_migration():
    path = (
        Path(__file__).parents[1]
        / "migrations"
        / "versions"
        / "20261101_0012_operational_control_plane.py"
    )
    spec = importlib.util.spec_from_file_location("operational_migration", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_destructive_downgrade_guard_includes_worker_heartbeat_evidence():
    module = _load_migration()

    assert "worker_heartbeats" in module.PROTECTED_OPERATIONAL_TABLES


def test_populated_worker_heartbeat_blocks_downgrade(monkeypatch):
    module = _load_migration()

    class Result:
        def __init__(self, value):
            self.value = value

        def scalar_one(self):
            return self.value

    class Bind:
        def execute(self, statement, parameters=None):
            sql = str(statement)
            if "to_regclass" in sql:
                return Result(parameters["table_name"])
            if "worker_heartbeats" in sql:
                return Result(1)
            return Result(0)

    monkeypatch.setattr(module.op, "get_bind", lambda: Bind())

    with pytest.raises(RuntimeError, match="operational evidence exists"):
        module.downgrade()
