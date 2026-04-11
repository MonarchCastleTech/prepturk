import logging
import subprocess
import os
from typing import Optional

logger = logging.getLogger("worker.ocr")


async def run_ocr(file_path: str, language: str = "tur+eng") -> str:
    """Run Tesseract OCR on a file (PDF or image).

    Args:
        file_path: Path to the file to OCR
        language: Tesseract language code (default: tur+eng for Turkish+English)

    Returns:
        Extracted text string, or empty string on failure
    """
    if not os.path.exists(file_path):
        logger.error("OCR file not found: %s", file_path)
        return ""

    try:
        # Check if tesseract is available
        if not _tesseract_available():
            logger.error("Tesseract OCR is not installed or not in PATH")
            return ""

        # Create output path
        output_base = file_path + "_ocr_output"

        if file_path.lower().endswith(".pdf"):
            # For PDFs, use tesseract's PDF input directly
            cmd = [
                "tesseract",
                file_path,
                output_base,
                "-l",
                language,
                "--psm",
                "1",
            ]
        else:
            # For images
            cmd = [
                "tesseract",
                file_path,
                output_base,
                "-l",
                language,
                "--psm",
                "3",
            ]

        logger.info("Running Tesseract OCR: %s", " ".join(cmd))

        # Run tesseract synchronously (OCR is typically fast enough)
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
        )

        if result.returncode != 0:
            logger.error(
                "Tesseract failed with code %d: %s",
                result.returncode,
                result.stderr,
            )
            return ""

        # Read output text file
        output_file = output_base + ".txt"
        if os.path.exists(output_file):
            with open(output_file, "r", encoding="utf-8") as f:
                text = f.read()

            # Clean up output file
            try:
                os.remove(output_file)
            except OSError:
                pass

            logger.info("OCR completed, extracted %d characters", len(text))
            return text
        else:
            logger.error("Tesseract output file not found: %s", output_file)
            return ""

    except subprocess.TimeoutExpired:
        logger.error("Tesseract OCR timed out for %s", file_path)
        return ""
    except Exception as exc:
        logger.error("OCR failed for %s: %s", file_path, exc)
        return ""


def _tesseract_available() -> bool:
    """Check if tesseract command is available."""
    try:
        result = subprocess.run(
            ["tesseract", "--version"],
            capture_output=True,
            timeout=10,
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return False
