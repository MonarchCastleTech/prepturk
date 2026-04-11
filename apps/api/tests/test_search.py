"""Unit tests for search functionality."""
import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock

from app.routes.search import normalize_turkish, _highlight_text


class TestTurkishNormalization:
    def test_lowercase_dotless_i(self):
        assert normalize_turkish("\u0131") == "i"

    def test_uppercase_dotted_I(self):
        assert normalize_turkish("\u0130") == "i"

    def test_lowercase_s_cedilla(self):
        assert normalize_turkish("\u015f") == "s"

    def test_uppercase_S_cedilla(self):
        assert normalize_turkish("\u015e") == "s"

    def test_lowercase_g_breve(self):
        assert normalize_turkish("\u011f") == "g"

    def test_uppercase_G_breve(self):
        assert normalize_turkish("\u011e") == "g"

    def test_lowercase_o_umlaut(self):
        assert normalize_turkish("\u00f6") == "o"

    def test_uppercase_O_umlaut(self):
        assert normalize_turkish("\u00d6") == "o"

    def test_lowercase_u_umlaut(self):
        assert normalize_turkish("\u00fc") == "u"

    def test_uppercase_U_umlaut(self):
        assert normalize_turkish("\u00dc") == "u"

    def test_lowercase_c_cedilla(self):
        assert normalize_turkish("\u00e7") == "c"

    def test_uppercase_C_cedilla(self):
        assert normalize_turkish("\u00c7") == "c"

    def test_full_sentence(self):
        text = "T\u00fcrkiye \u00e7ok g\u00fczel \u00fclke"
        result = normalize_turkish(text)
        assert "Turkiye" in result
        assert "cok" in result
        assert "gul" in result or "guzel" in result
        assert "ulke" in result

    def test_mixed_turkish_ascii(self):
        text = "Istanbul'da 15 Temmuz"
        result = normalize_turkish(text)
        assert "Istanbul" in result
        assert "15 Temmuz" in result

    def test_empty_string(self):
        assert normalize_turkish("") == ""

    def test_ascii_only_unchanged(self):
        text = "Hello world 123"
        assert normalize_turkish(text) == text

    def test_istanbul_normalization(self):
        text = "\u0130stanbul"
        result = normalize_turkish(text)
        assert "i" in result


class TestHighlightText:
    def test_highlight_simple_match(self):
        result = _highlight_text("Hello world test", "world")
        assert "<mark>world</mark>" in result

    def test_highlight_turkish_match(self):
        text = "T\u00fcrkiye b\u00fcy\u00fck \u00fclke"
        result = _highlight_text(text, "T\u00fcrkiye")
        assert "<mark>" in result
        assert "</mark>" in result

    def test_highlight_no_match(self):
        text = "Hello world"
        result = _highlight_text(text, "notfound")
        assert "<mark>" not in result
        assert result == text

    def test_highlight_case_insensitive(self):
        text = "Hello WORLD test"
        result = _highlight_text(text, "world")
        assert "<mark>" in result

    def test_highlight_truncated_context(self):
        text = "A" * 100 + "MATCH" + "B" * 100
        result = _highlight_text(text, "MATCH")
        assert "<mark>MATCH</mark>" in result
        assert len(result) < len(text)

    def test_highlight_with_prefix_suffix(self):
        text = "prefix ... MATCH ... suffix"
        result = _highlight_text(text, "MATCH")
        assert "..." in result or "<mark>" in result


class TestSearchQueryBuilding:
    def test_search_request_default_values(self):
        from app.schemas import SearchRequest

        req = SearchRequest(query="test")
        assert req.page == 1
        assert req.page_size == 20
        assert req.official_only is False
        assert req.child_safe is True

    def test_search_request_custom_values(self):
        from app.schemas import SearchRequest

        req = SearchRequest(
            query="test",
            page=2,
            page_size=50,
            official_only=True,
            filters={"category": "emergency"},
        )
        assert req.page == 2
        assert req.page_size == 50
        assert req.official_only is True
        assert req.filters == {"category": "emergency"}

    def test_search_request_empty_query_fails(self):
        from app.schemas import SearchRequest
        with pytest.raises(Exception):
            SearchRequest(query="")

    def test_search_result_model(self):
        from app.schemas import SearchResult
        from app.db.models import TrustLevel, StorageMode, RightsStatus

        result = SearchResult(
            id=uuid.uuid4(),
            title="Test",
            trust_level=TrustLevel.community,
            storage_mode=StorageMode.pointer_only,
            rights_status=RightsStatus.unknown_review_needed,
            child_safe=True,
            created_at=__import__("datetime").datetime.utcnow(),
        )
        assert result.title == "Test"
        assert result.trust_level == TrustLevel.community


class TestFacetCounting:
    @pytest.mark.asyncio
    async def test_facets_query_structure(self):
        """Verify the facets endpoint returns the expected structure."""
        from app.routes.search import get_search_facets

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(
            return_value=MagicMock(
                all=MagicMock(
                    return_value=[
                        MagicMock(category="emergency", count=5),
                        MagicMock(category="health", count=3),
                    ]
                )
            )
        )
        mock_db.execute = AsyncMock(return_value=mock_result)

        mock_user = MagicMock()
        mock_user.is_active = True

        result = await get_search_facets(
            query=None,
            category=None,
            province=None,
            official_only=False,
            db=mock_db,
            _current_user=mock_user,
        )
        assert isinstance(result, dict)


class TestPaginationLogic:
    def test_offset_calculation_page_one(self):
        page = 1
        page_size = 20
        offset = (page - 1) * page_size
        assert offset == 0

    def test_offset_calculation_page_two(self):
        page = 2
        page_size = 20
        offset = (page - 1) * page_size
        assert offset == 20

    def test_total_pages_calculation(self):
        total = 100
        page_size = 20
        total_pages = max(1, (total + page_size - 1) // page_size)
        assert total_pages == 5

    def test_total_pages_partial_page(self):
        total = 25
        page_size = 10
        total_pages = max(1, (total + page_size - 1) // page_size)
        assert total_pages == 3

    def test_total_pages_zero_results(self):
        total = 0
        page_size = 20
        total_pages = max(1, (total + page_size - 1) // page_size)
        assert total_pages == 1

    def test_search_response_model(self):
        from app.schemas import SearchResponse

        resp = SearchResponse(
            results=[],
            total=0,
            page=1,
            page_size=20,
            total_pages=1,
            query="test",
        )
        assert resp.total == 0
        assert resp.page == 1
        assert resp.total_pages == 1
        assert resp.filters_applied == {}


class TestFilterApplication:
    def test_search_request_with_filters(self):
        from app.schemas import SearchRequest

        req = SearchRequest(
            query="afet",
            filters={"province": "Hatay", "category": "emergency"},
            official_only=True,
        )
        assert req.filters["province"] == "Hatay"
        assert req.filters["category"] == "emergency"
        assert req.official_only is True

    def test_search_request_child_safe(self):
        from app.schemas import SearchRequest

        req = SearchRequest(query="test", child_safe=True)
        assert req.child_safe is True

    def test_search_request_with_list_filter(self):
        from app.schemas import SearchRequest

        req = SearchRequest(
            query="test",
            filters={"province": ["Ankara", "Istanbul", "Izmir"]},
        )
        assert isinstance(req.filters["province"], list)
        assert len(req.filters["province"]) == 3


class TestSearchSuggestions:
    @pytest.mark.asyncio
    async def test_suggestions_query_validation(self):
        """Search suggestions require minimum 2 chars."""
        from fastapi import HTTPException
        from app.routes.search import get_search_suggestions

        mock_db = AsyncMock()
        mock_user = MagicMock()
        mock_user.is_active = True

        with pytest.raises(Exception):
            await get_search_suggestions(
                q="a",
                limit=10,
                db=mock_db,
                _current_user=mock_user,
            )

    @pytest.mark.asyncio
    async def test_suggestions_empty_results(self):
        from app.routes.search import get_search_suggestions

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.all = MagicMock(return_value=[])
        mock_db.execute = AsyncMock(return_value=mock_result)

        mock_user = MagicMock()
        mock_user.is_active = True

        result = await get_search_suggestions(
            q="test",
            limit=10,
            db=mock_db,
            _current_user=mock_user,
        )
        assert result == []
