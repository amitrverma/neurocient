import importlib.util
from pathlib import Path

import pytest


def _load_migration():
    path = (
        Path(__file__).parents[1]
        / "migrations"
        / "versions"
        / "20261103_0013_microchallenge_outcomes.py"
    )
    spec = importlib.util.spec_from_file_location("microchallenge_outcomes", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


@pytest.mark.parametrize("non_done_count", [1, 20])
def test_truthful_outcomes_block_unsafe_downgrade(monkeypatch, non_done_count):
    module = _load_migration()

    class Result:
        def scalar_one(self):
            return non_done_count

    class Bind:
        def execute(self, _statement):
            return Result()

    monkeypatch.setattr(module.op, "get_bind", lambda: Bind())

    with pytest.raises(RuntimeError, match="Cannot downgrade microchallenge outcomes"):
        module.downgrade()
