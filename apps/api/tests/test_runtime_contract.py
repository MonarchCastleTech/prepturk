"""Deterministic runtime and boundary contracts."""

from app.main import runtime_contract


def test_runtime_contract_is_stable_and_explicit() -> None:
    first = runtime_contract()
    second = runtime_contract()

    assert first == second
    assert first["service"] == "prepturk-api"
    assert first["contract_version"] == "1"
    assert first["airgap_mode"] is not None
    assert first["outbound_ingestion_enabled"] is (not first["airgap_mode"])
    assert first["authentication"] == "bearer-token"
    assert first["authorization"] == "role-based"
