"""Product governance contracts for PrepTürk."""

from hashlib import sha256
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def test_restrained_brand_endorsement_and_language_contract() -> None:
    chrome = read("apps/web/components/Chrome.tsx")
    footer = read("apps/web/components/GovernanceFooter.tsx")
    layout = read("apps/web/app/layout.tsx")

    assert "GovernanceFooter" in chrome
    assert "<GovernanceFooter />" in chrome
    assert 'src="/logo.svg"' in footer
    assert 'alt="PrepTürk"' in footer
    assert "Part of Monarch Castle Technologies." in footer
    assert "Türkçe birincil arayüz" in footer
    assert 'lang="tr"' in layout

    for filename in ("README.md", "README.tr.md", "README.ar.md", "README.ru.md"):
        assert (ROOT / filename).is_file()


def test_sovereign_offline_wording_is_precise_not_absolute() -> None:
    banner = read("apps/web/components/OfflineBanner.tsx")
    api_main = read("apps/api/app/main.py")
    normalized_banner = " ".join(banner.split())

    assert "Çevrimdışı ve yerel çalışma için tasarlandı" in normalized_banner
    assert "ağ yalıtımı dağıtım yapılandırmasıyla doğrulanmalıdır" in normalized_banner
    assert '"airgap_mode": settings.airgap_mode' in api_main
    assert '"outbound_ingestion_enabled": not settings.airgap_mode' in api_main

    readmes = "\n".join(
        read(filename)
        for filename in ("README.md", "README.tr.md", "README.ar.md", "README.ru.md")
    )
    combined = f"{banner}\n{api_main}\n{readmes}"
    for prohibited in (
        "NEVER connects",
        "zero internet connectivity",
        "sıfır internet bağlantısı",
        "guarantees safety",
    ):
        assert prohibited not in combined
    assert readmes.count("AIRGAP_MODE") >= 4
    assert "deployment controls" in readmes
    assert "dağıtım ortamındaki güvenlik duvarı" in readmes


def test_auth_boundaries_and_deterministic_api_worker_contracts() -> None:
    api_main = read("apps/api/app/main.py")
    ingestion_routes = read("apps/api/app/routes/ingestion.py")
    users_routes = read("apps/api/app/routes/users.py")
    scheduler = read("apps/worker/app/jobs/scheduler.py")
    compose = read("docker-compose.yml")

    assert 'app.include_router(auth.router, prefix="/api/auth"' in api_main
    assert 'Depends(get_current_active_user)' in ingestion_routes
    assert "Depends(require_admin)" in users_routes
    assert "def runtime_contract()" in api_main
    assert "return runtime_contract()" in api_main
    assert "for filepath in sorted(glob.glob(pattern)):" in scheduler
    assert "AIRGAP_MODE: ${AIRGAP_MODE:-true}" in compose


def test_threat_model_and_duplicate_tree_decision_are_recorded() -> None:
    threat_model = read("docs/security/threat-model.md")
    duplicate_audit = read("docs/duplicate-tree-audit.md")

    for topic in ("Preparedness data", "Secrets", "Uploads", "Logs", "Worker queues"):
        assert topic in threat_model
    for boundary in ("Trust boundaries", "Mitigations", "Residual risk"):
        assert boundary in threat_model

    assert "5d2b7fc2c19a9e4031b7596336b2f2e33af22ff13c84c9a5433d42be99940d74" in duplicate_audit
    assert "capture_logo.py" in duplicate_audit
    assert "Decision: retain" in duplicate_audit
    assert (ROOT / "prepturk/apps/web/public/logo.png").is_file()


def test_ci_targets_the_real_default_branch_and_license_is_unchanged() -> None:
    workflow = read(".github/workflows/ci.yml")
    assert "branches: [master]" in workflow
    assert sha256((ROOT / "LICENSE").read_bytes()).hexdigest() == (
        "8646d06b972a0f4727975e00c53118f8625b49a009a07b02c57045686c7f5100"
    )
