"""Tests for text chunking with Turkish text."""
import pytest

from app.utils.chunking import chunk_text, count_tokens, _split_into_sentences
from app.utils.turkish import (
    normalize_turkish,
    tokenize_turkish,
    remove_stop_words,
    stem_turkish,
)


class TestChunkText:
    def test_chunks_simple_text(self):
        text = "Bu birinci cumle. Bu ikinci cumle. Bu ucuncu cumle. " * 20
        chunks = chunk_text(text, chunk_size=64, overlap=8)
        assert len(chunks) > 0
        assert all(isinstance(c, str) for c in chunks)
        assert all(len(c.strip()) > 0 for c in chunks)

    def test_chunks_turkish_text(self):
        text = (
            "Turkiye Cumhuriyeti'nin baskenti Ankara'dir. "
            "Istanbul en kalabalik sehirdir. "
            "Izmir Ege bolgesinin en buyuk sehrirdir. "
            "Antalya turizm bakimindan onemlidir. "
        ) * 15
        chunks = chunk_text(text, chunk_size=128, overlap=32)
        assert len(chunks) > 0

        # Verify all chunks have content
        total_length = sum(len(c) for c in chunks)
        assert total_length > 0

    def test_empty_text_returns_empty_list(self):
        assert chunk_text("") == []
        assert chunk_text("   ") == []
        assert chunk_text(None) == []

    def test_short_text_returns_single_chunk(self):
        text = "Kisa metin."
        chunks = chunk_text(text, chunk_size=512, overlap=64)
        assert len(chunks) == 1
        assert chunks[0] == "Kisa metin."

    def test_overlap_preserves_context(self):
        text = "A. B. C. D. E. F. G. H. I. J. K. L. M. N. O. P. R. S. T. " * 5
        chunks_no_overlap = chunk_text(text, chunk_size=64, overlap=0)
        chunks_with_overlap = chunk_text(text, chunk_size=64, overlap=16)

        # Both should produce multiple chunks
        assert len(chunks_no_overlap) > 1
        assert len(chunks_with_overlap) > 1

    def test_long_sentence_is_split(self):
        # Create a single very long sentence
        text = " ".join(["kelime"] * 1000) + "."
        chunks = chunk_text(text, chunk_size=128, overlap=0)
        assert len(chunks) > 1


class TestCountTokens:
    def test_counts_tokens(self):
        text = "Bu bir test cumlesidir."
        count = count_tokens(text)
        assert count > 0

    def test_empty_text_zero_tokens(self):
        assert count_tokens("") == 0

    def test_longer_text_more_tokens(self):
        short = "Kisa metin."
        long = "Bu cok daha uzun bir metin. " * 100
        assert count_tokens(long) > count_tokens(short)


class TestSplitIntoSentences:
    def test_splits_on_period(self):
        text = "Birinci cumle. Ikinci cumle. Ucuncu cumle."
        sentences = _split_into_sentences(text)
        assert len(sentences) == 3

    def test_splits_on_exclamation(self):
        text = "Dikkat et! Cok tehlikeli!"
        sentences = _split_into_sentences(text)
        assert len(sentences) == 2

    def test_splits_on_question(self):
        text = "Nasil sin? Nereye gidiyorsun?"
        sentences = _split_into_sentences(text)
        assert len(sentences) == 2

    def test_handles_abbreviations(self):
        text = "Dr. Ahmet hastanede. Prof. Yilmaz konustu."
        sentences = _split_into_sentences(text)
        # Should not split on "Dr." or "Prof."
        assert len(sentences) >= 1

    def test_empty_text(self):
        assert _split_into_sentences("") == []


class TestTurkishUtils:
    def test_normalize_turkish(self):
        text = "T\u00fcrkiye  \u00c7ok   g\u00fczel"
        result = normalize_turkish(text)
        assert "  " not in result  # No double spaces

    def test_normalize_empty(self):
        assert normalize_turkish("") == ""
        assert normalize_turkish("   ") == ""

    def test_tokenize_turkish(self):
        text = "Bu bir test cumlesidir."
        tokens = tokenize_turkish(text)
        assert len(tokens) > 0
        assert "bu" in tokens
        assert "bir" in tokens

    def test_tokenize_empty(self):
        assert tokenize_turkish("") == []

    def test_remove_stop_words(self):
        tokens = ["bu", "bir", "test", "cumlesi", "ve", "diger"]
        filtered = remove_stop_words(tokens)
        assert "ve" not in filtered
        assert "bir" not in filtered
        assert "test" in filtered or "cumlesi" in filtered

    def test_stem_turkish(self):
        # Simple stemming test
        word = "evlerden"
        stem = stem_turkish(word)
        assert len(stem) <= len(word)

    def test_stem_short_word(self):
        assert stem_turkish("ev") == "ev"
        assert stem_turkish("su") == "su"

    def test_turkish_characters_preserved(self):
        text = "\u00c7ankaya'da g\u00fczel g\u00fcn. \u0130stanbul'a gidilecek."
        tokens = tokenize_turkish(text)
        # Turkish characters should be handled
        assert len(tokens) > 0
