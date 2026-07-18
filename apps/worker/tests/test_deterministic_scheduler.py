"""Determinism contracts for manifest discovery."""

from pathlib import Path

from app.jobs.scheduler import _load_manifests


def test_manifest_discovery_is_sorted(tmp_path: Path) -> None:
    (tmp_path / "zulu.yaml").write_text("name: zulu\n", encoding="utf-8")
    (tmp_path / "alpha.yaml").write_text("name: alpha\n", encoding="utf-8")

    assert list(_load_manifests(str(tmp_path))) == ["alpha", "zulu"]
