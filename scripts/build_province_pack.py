#!/usr/bin/env python3
"""
prepturk Province Pack Builder

Takes a province code, loads the province YAML, queries the API for relevant
documents, and builds a portable pack with a manifest.

Usage:
    python build_province_pack.py <province_code> [--output <dir>] [--api-url <url>]
"""

import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import yaml


def load_province_yaml(province_code: str, packs_dir: str = None) -> dict:
    """Load province YAML manifest."""
    if packs_dir is None:
        packs_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "content",
            "manifests",
            "province-packs",
        )

    # Try exact match first
    yaml_path = None
    for root, dirs, files in os.walk(packs_dir):
        for f in files:
            if f.endswith((".yaml", ".yml")):
                try:
                    with open(os.path.join(root, f), "r", encoding="utf-8") as fh:
                        data = yaml.safe_load(fh)
                        if data and data.get("province_code") == province_code:
                            yaml_path = os.path.join(root, f)
                            break
                except Exception:
                    continue
        if yaml_path:
            break

    if yaml_path is None:
        print(f"Error: Province YAML not found for code: {province_code}")
        sys.exit(1)

    with open(yaml_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def query_api_documents(province_code: str, api_url: str, token: str = None) -> list:
    """Query API for documents relevant to a province."""
    import httpx

    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    documents = []

    # Query by province code
    try:
        response = httpx.get(
            f"{api_url}/api/documents",
            params={"province_code": province_code},
            headers=headers,
            timeout=30,
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                documents.extend(data)
            elif isinstance(data, dict) and "items" in data:
                documents.extend(data["items"])
    except Exception as e:
        print(f"Warning: API query failed: {e}", file=sys.stderr)

    # Also query emergency guides (province_code "00" = all provinces)
    try:
        response = httpx.get(
            f"{api_url}/api/documents",
            params={"province_code": "00", "category": "emergency_guide"},
            headers=headers,
            timeout=30,
        )
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                documents.extend(data)
            elif isinstance(data, dict) and "items" in data:
                documents.extend(data["items"])
    except Exception as e:
        print(f"Warning: API query for emergency guides failed: {e}", file=sys.stderr)

    return documents


def compute_file_hash(file_path: str) -> str:
    """Compute SHA256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def build_pack(
    province_code: str,
    output_dir: str,
    api_url: str,
    token: str = None,
    packs_dir: str = None,
):
    """Build a portable province pack."""
    # Load province data
    print(f"Loading province data for code: {province_code}")
    province_data = load_province_yaml(province_code, packs_dir)
    province_name = province_data.get("province_name", f"Province-{province_code}")
    pack_id = province_data.get("id", f"province-{province_code}")

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    pack_dir = output_path / f"{pack_id}-pack"
    if pack_dir.exists():
        shutil.rmtree(pack_dir)
    pack_dir.mkdir(parents=True)

    print(f"Building pack: {pack_dir}")

    # Copy province YAML
    shutil.copy2(
        Path(packs_dir or os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "content",
            "manifests",
            "province-packs",
        )) / f"{pack_id}.yaml",
        pack_dir / "province.yaml",
    )

    # Query API for documents
    print(f"Querying API: {api_url}")
    documents = query_api_documents(province_code, api_url, token)
    print(f"Found {len(documents)} documents")

    # Create documents directory
    docs_dir = pack_dir / "documents"
    docs_dir.mkdir(exist_ok=True)

    # Build document manifest
    document_manifest = []

    for i, doc in enumerate(documents):
        doc_id = doc.get("id", f"doc-{i}")
        title = doc.get("title", f"Document-{i}")
        # Sanitize filename
        safe_filename = "".join(
            c for c in title if c.isalnum() or c in (" ", "-", "_")
        ).strip()
        safe_filename = safe_filename.replace(" ", "-").lower()
        if not safe_filename:
            safe_filename = f"doc-{i}"

        # Save document metadata as JSON
        doc_file = docs_dir / f"{safe_filename}.json"
        with open(doc_file, "w", encoding="utf-8") as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)

        file_hash = compute_file_hash(str(doc_file))

        document_manifest.append(
            {
                "id": doc_id,
                "title": title,
                "filename": f"{safe_filename}.json",
                "source_type": doc.get("source_type", "unknown"),
                "source_name": doc.get("source_name", ""),
                "source_url": doc.get("source_url", ""),
                "category": doc.get("category", ""),
                "sha256": file_hash,
            }
        )

    # Build pack manifest
    pack_manifest = {
        "pack_id": pack_id,
        "province_code": province_code,
        "province_name": province_name,
        "version": province_data.get("version", "1.0.0"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "region": province_data.get("region", ""),
        "description_tr": province_data.get("description_tr", ""),
        "contacts": province_data.get("contacts", {}),
        "emergency_notes": province_data.get("emergency_notes", []),
        "document_count": len(document_manifest),
        "documents": document_manifest,
        "emergency_level": province_data.get("emergency_level", "unknown"),
        "included_maps": province_data.get("included_maps", []),
        "rights_manifest": province_data.get("rights_manifest", {}),
    }

    # Write pack manifest
    manifest_path = pack_dir / "pack-manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(pack_manifest, f, indent=2, ensure_ascii=False)

    # Create README
    readme_path = pack_dir / "README.md"
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(f"# {province_name} Afet Hazirlik Paketi\n\n")
        f.write(f"**Il Kodu:** {province_code}\n")
        f.write(f"**Bolge:** {province_data.get('region', 'Bilinmiyor')}\n")
        f.write(f"**Olusturma Tarihi:** {pack_manifest['generated_at']}\n")
        f.write(f"**Belge Sayisi:** {len(document_manifest)}\n\n")
        f.write("## Acil Durum Iletisim\n\n")
        contacts = province_data.get("contacts", {})
        for key, contact in contacts.items():
            if isinstance(contact, dict):
                f.write(f"- **{contact.get('name', key)}:** {contact.get('phone', 'N/A')}\n")
        f.write("\n## Acil Durum Notlari\n\n")
        for note in province_data.get("emergency_notes", []):
            f.write(f"- {note}\n")
        f.write("\n## Icerilen Belgeler\n\n")
        for doc in document_manifest:
            f.write(f"- [{doc['title']}]({doc['filename']}) - {doc.get('source_name', '')}\n")

    # Create archive
    archive_path = output_path / f"{pack_id}-pack.zip"
    shutil.make_archive(str(pack_dir), "zip", str(pack_dir))
    archive_path = pack_dir.with_suffix(".zip")
    # shutil.make_archive creates {pack_dir}.zip, move to output
    src_archive = Path(str(pack_dir) + ".zip")
    if src_archive.exists():
        shutil.move(str(src_archive), str(archive_path))

    # Print summary
    print(f"\n{'='*50}")
    print(f"  Province Pack Built Successfully!")
    print(f"{'='*50}")
    print(f"  Pack ID:      {pack_id}")
    print(f"  Province:     {province_name} ({province_code})")
    print(f"  Region:       {pack_manifest['region']}")
    print(f"  Documents:    {len(document_manifest)}")
    print(f"  Output Dir:   {pack_dir}")
    print(f"  Archive:      {archive_path}")
    print(f"{'='*50}")

    return str(pack_dir)


def main():
    parser = argparse.ArgumentParser(
        description="Build a portable province pack for prepturk"
    )
    parser.add_argument("province_code", help="Province code (e.g., 34, 35, 06)")
    parser.add_argument(
        "--output",
        default="./packs",
        help="Output directory (default: ./packs)",
    )
    parser.add_argument(
        "--api-url",
        default="http://localhost:8000",
        help="API base URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--token",
        default=None,
        help="API authentication token",
    )
    parser.add_argument(
        "--packs-dir",
        default=None,
        help="Custom province packs directory",
    )

    args = parser.parse_args()

    build_pack(
        province_code=args.province_code,
        output_dir=args.output,
        api_url=args.api_url,
        token=args.token,
        packs_dir=args.packs_dir,
    )


if __name__ == "__main__":
    main()
