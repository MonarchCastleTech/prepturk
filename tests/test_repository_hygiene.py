from pathlib import Path
import re
import struct

ROOT = Path(__file__).resolve().parents[1]
README = (ROOT / "README.md").read_text(encoding="utf-8")
MATCH = re.search(r"<!-- repository-hygiene:start -->(.*?)<!-- repository-hygiene:end -->", README, re.S)
CONTRACT = MATCH.group(1) if MATCH else ""
HEADINGS = ["Repository status","Public access","Screenshots","Data and methodology","Update frequency","Quick start","Architecture","Tests","Provenance","Forecast limitations","Security","License","Citation","Masterbrand endorsement"]
METHODOLOGY_EVIDENCE = ["docs/rights-and-provenance.md"]
QUICK_START_COMMANDS = ["docker compose up --build"]
ARCHITECTURE_IDENTIFIERS = ["apps/api/","apps/web/","apps/worker/"]
THIRD_PARTY_EXCLUSIONS = ["AFAD, health, Kiwix, and operator-ingested corpora","logos, trademarks, screenshots, models, and external assets"]
LICENSE_DECISION = "preserve-agpl"


def test_repository_hygiene_documentation_contract():
    assert MATCH, "README must include the managed repository-hygiene block"
    assert "Türkiye's sovereign, airgapped preparedness command center — local AI (RAG over verified AFAD/Health docs), SDR, and Meshtastic mesh that run with zero internet." in CONTRACT
    assert "lifecycle-active" in CONTRACT
    assert re.search(r"not publicly deployed", CONTRACT, re.I)
    for heading in HEADINGS:
        assert f"## {heading}" in CONTRACT
    for evidence in METHODOLOGY_EVIDENCE:
        assert (ROOT / evidence).exists(), evidence
        assert evidence in CONTRACT
    for command in QUICK_START_COMMANDS:
        assert command in CONTRACT
    for identifier in ARCHITECTURE_IDENTIFIERS:
        assert chr(96) + identifier + chr(96) in CONTRACT
    for phrase in ("guaranteed accurate", "official government intelligence", "investment advice"):
        assert phrase not in CONTRACT.lower()


def test_repository_hygiene_local_images_and_social_preview():
    images = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", CONTRACT)
    assert "docs/brand/organization-lockup.png" in images
    assert "docs/social-preview.png" in images
    for image in images:
        assert not re.match(r"https?://", image)
        assert (ROOT / image).is_file(), image
    preview_path = ROOT / "docs/social-preview.png"
    preview = preview_path.read_bytes()
    assert preview[1:4] == b"PNG"
    assert struct.unpack(">II", preview[16:24]) == (1280, 640)
    assert preview_path.stat().st_size < 1_000_000
    assert preview_path.stat().st_size > 5_000
    assert len(set(preview[33:-12])) > 100


def test_repository_hygiene_citation_rights_and_https_policy():
    for filename in ("CITATION.cff", "THIRD_PARTY_NOTICES.md", "LICENSE"):
        assert (ROOT / filename).is_file(), filename
    citation = (ROOT / "CITATION.cff").read_text(encoding="utf-8")
    assert re.search(r"^cff-version: 1\.2\.0", citation, re.M)
    assert re.search(r"^title:", citation, re.M)
    license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
    notice = (ROOT / "THIRD_PARTY_NOTICES.md").read_text(encoding="utf-8")
    if LICENSE_DECISION.endswith("mit"):
        assert "Permission is hereby granted, free of charge" in license_text
    if LICENSE_DECISION == "preserve-apache":
        assert re.search(r"Apache License\s+Version 2\.0", license_text)
    if LICENSE_DECISION == "preserve-agpl":
        assert "GNU AFFERO GENERAL PUBLIC LICENSE" in license_text
    for exclusion in THIRD_PARTY_EXCLUSIONS:
        assert exclusion in notice
    allowed_http = ("http://localhost", "")
    for link in re.findall(r"https?://[^\s)>]+", CONTRACT):
        if link.startswith("http://"):
            assert any(prefix and link.startswith(prefix) for prefix in allowed_http), link
