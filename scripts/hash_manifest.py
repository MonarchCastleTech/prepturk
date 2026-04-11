#!/usr/bin/env python3
"""
prepturk Hash Manifest Generator

Scans a directory and computes SHA256 hashes for all files.
Outputs a JSON manifest with filenames, sizes, and hashes.

Usage:
    python hash_manifest.py <directory> [--output <output.json>]
"""

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def compute_sha256(file_path: str, chunk_size: int = 8192) -> str:
    """Compute SHA256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while True:
            data = f.read(chunk_size)
            if not data:
                break
            sha256.update(data)
    return sha256.hexdigest()


def human_readable_size(size_bytes: int) -> str:
    """Convert bytes to human readable format."""
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


def scan_directory(directory: str) -> dict:
    """Scan directory and compute hashes for all files."""
    dir_path = Path(directory).resolve()

    if not dir_path.exists():
        print(f"Error: Directory not found: {directory}", file=sys.stderr)
        sys.exit(1)

    if not dir_path.is_dir():
        print(f"Error: Not a directory: {directory}", file=sys.stderr)
        sys.exit(1)

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root_directory": str(dir_path),
        "total_files": 0,
        "total_size": 0,
        "files": [],
    }

    for root, dirs, files in os.walk(dir_path):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith(".")]

        for filename in sorted(files):
            if filename.startswith("."):
                continue

            file_path = Path(root) / filename
            relative_path = file_path.relative_to(dir_path)

            try:
                stat = file_path.stat()
                file_hash = compute_sha256(str(file_path))

                file_entry = {
                    "path": str(relative_path),
                    "filename": filename,
                    "size_bytes": stat.st_size,
                    "size_human": human_readable_size(stat.st_size),
                    "sha256": file_hash,
                    "modified": datetime.fromtimestamp(
                        stat.st_mtime, tz=timezone.utc
                    ).isoformat(),
                }

                manifest["files"].append(file_entry)
                manifest["total_files"] += 1
                manifest["total_size"] += stat.st_size

            except (PermissionError, OSError) as e:
                print(f"Warning: Could not process {relative_path}: {e}", file=sys.stderr)

    manifest["total_size_human"] = human_readable_size(manifest["total_size"])

    return manifest


def main():
    if len(sys.argv) < 2:
        print("Usage: python hash_manifest.py <directory> [--output <output.json>]")
        print()
        print("Arguments:")
        print("  directory          Directory to scan")
        print("  --output <file>    Output JSON file (default: manifest.json)")
        sys.exit(1)

    directory = sys.argv[1]
    output_file = "manifest.json"

    # Parse optional output argument
    if len(sys.argv) >= 4 and sys.argv[2] == "--output":
        output_file = sys.argv[3]

    print(f"Scanning directory: {directory}")
    manifest = scan_directory(directory)

    # Write manifest
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\nManifest generated: {output_file}")
    print(f"Total files: {manifest['total_files']}")
    print(f"Total size: {manifest['total_size_human']}")


if __name__ == "__main__":
    main()
