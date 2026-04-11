import logging
import re
from typing import List

import tiktoken

logger = logging.getLogger("worker.chunking")


def chunk_text(
    text: str,
    chunk_size: int = 512,
    overlap: int = 64,
) -> List[str]:
    """Split text into chunks with overlap.

    Turkish-aware splitting that respects sentence boundaries.

    Args:
        text: Input text to chunk
        chunk_size: Target chunk size in tokens
        overlap: Number of overlapping tokens between chunks

    Returns:
        List of text chunks
    """
    if not text or not text.strip():
        return []

    # Normalize text
    text = re.sub(r"\s+", " ", text).strip()

    # Split into sentences (Turkish-aware)
    sentences = _split_into_sentences(text)

    if not sentences:
        return []

    # Get tokenizer
    try:
        encoder = tiktoken.get_encoding("cl100k_base")
    except Exception:
        # Fallback: use character-based chunking
        return _char_based_chunk(text, chunk_size * 4, overlap * 4)

    chunks = []
    current_tokens = []
    current_sentences = []

    for sentence in sentences:
        sentence_tokens = encoder.encode(sentence)

        # If single sentence exceeds chunk_size, split it
        if len(sentence_tokens) > chunk_size:
            # Flush current buffer first
            if current_tokens:
                chunk_text = " ".join(current_sentences)
                chunks.append(chunk_text)
                current_tokens = []
                current_sentences = []

            # Split long sentence
            sub_chunks = _split_tokens(sentence_tokens, chunk_size, overlap)
            for sub_chunk in sub_chunks:
                try:
                    chunk_str = encoder.decode(sub_chunk)
                    if chunk_str.strip():
                        chunks.append(chunk_str.strip())
                except Exception:
                    pass
            continue

        # Check if adding this sentence exceeds chunk size
        if len(current_tokens) + len(sentence_tokens) > chunk_size and current_tokens:
            # Create chunk
            chunk_text = " ".join(current_sentences)
            chunks.append(chunk_text)

            # Keep overlap
            if overlap > 0:
                overlap_tokens = current_tokens[-overlap:]
                try:
                    overlap_text = encoder.decode(overlap_tokens)
                    current_tokens = overlap_tokens
                    current_sentences = [overlap_text, sentence]
                except Exception:
                    current_tokens = sentence_tokens
                    current_sentences = [sentence]
            else:
                current_tokens = sentence_tokens
                current_sentences = [sentence]
        else:
            current_tokens.extend(sentence_tokens)
            current_sentences.append(sentence)

    # Add remaining
    if current_sentences:
        chunk_text = " ".join(current_sentences)
        if chunk_text.strip():
            chunks.append(chunk_text.strip())

    logger.debug("Created %d chunks from %d characters", len(chunks), len(text))
    return chunks


def _split_into_sentences(text: str) -> List[str]:
    """Split text into sentences, handling Turkish punctuation.

    Turkish sentence endings: . ! ? and special abbreviations.
    """
    # Common Turkish abbreviations that don't end sentences
    abbreviations = [
        "Dr", "Prof", "Doc", "Yrd", "Mr", "Bs", "Bk", "Alb",
        "Yzb", "Uzm", "Op", "Av", "Muh", "Mim", "No", "Cad",
        "Sok", "Bul", "Mah", "Tel", "Fax", "sa", "sn",
        "sf", "vb", "vs", "yy", "yl", "gn", "tk",
        "og", "dz", "hv", "jand", "sah", "org", "tug",
        "tu", "tum", "bfb", "bbl",
    ]

    # Protect abbreviations from sentence splitting
    protected = text
    for abbr in abbreviations:
        protected = protected.replace(f"{abbr}.", f"{abbr}__DOT__")

    # Split on sentence-ending punctuation
    # Turkish sentence endings: . ! ? plus Unicode variants
    parts = re.split(r'(?<=[.!?])\s+', protected)

    # Restore protected abbreviations
    sentences = []
    for part in parts:
        sentence = part.replace("__DOT__", ".")
        if sentence.strip():
            sentences.append(sentence.strip())

    return sentences


def _split_tokens(
    tokens: List[int],
    chunk_size: int,
    overlap: int,
) -> List[List[int]]:
    """Split a token list into chunks with overlap."""
    if len(tokens) <= chunk_size:
        return [tokens]

    chunks = []
    start = 0

    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunks.append(tokens[start:end])

        if end >= len(tokens):
            break

        start = end - overlap
        if start < 0:
            start = 0

    return chunks


def _char_based_chunk(text: str, chunk_chars: int, overlap_chars: int) -> List[str]:
    """Fallback character-based chunking when tokenizer unavailable."""
    if len(text) <= chunk_chars:
        return [text] if text.strip() else []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_chars
        chunk = text[start:end]

        # Try to break at sentence boundary
        if end < len(text):
            last_period = chunk.rfind(".")
            last_newline = chunk.rfind("\n")
            break_point = max(last_period, last_newline)
            if break_point > chunk_chars * 0.5:
                chunk = chunk[: break_point + 1]
                end = start + break_point + 1

        if chunk.strip():
            chunks.append(chunk.strip())

        start = end - overlap_chars
        if start < 0:
            start = 0

    return chunks


def count_tokens(text: str) -> int:
    """Count tokens in text using tiktoken."""
    try:
        encoder = tiktoken.get_encoding("cl100k_base")
        return len(encoder.encode(text))
    except Exception:
        # Fallback: approximate 4 chars per token
        return len(text) // 4
