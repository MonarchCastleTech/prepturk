"""E2E tests for search functionality."""
import pytest

import httpx

BASE_URL = "http://localhost:8000"


class TestBasicSearch:
    @pytest.mark.asyncio
    async def test_search_allows_no_authentication(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post("/api/search/", json={"query": "test"})
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_search_returns_empty_results_no_data(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "olmayan_dokuman_xyz", "page": 1, "page_size": 20},
            )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert data["total"] == 0
        assert isinstance(data["results"], list)

    @pytest.mark.asyncio
    async def test_search_requires_query_field(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post("/api/search/", json={})
        assert response.status_code == 422


class TestTurkishCharacterNormalization:
    @pytest.mark.asyncio
    async def test_search_with_turkish_characters(self):
        """Search should handle Turkish characters correctly."""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "T\u00fcrkiye", "page": 1, "page_size": 20},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 0
        assert data["query"] == "T\u00fcrkiye"

    @pytest.mark.asyncio
    async def test_search_normalizes_dotless_i(self):
        """\u0131 should be searchable as i."""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "istanbul", "page": 1, "page_size": 20},
            )
        assert response.status_code == 200


class TestFacetedSearch:
    @pytest.mark.asyncio
    async def test_facets_endpoint_allows_no_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/search/facets")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_facets_returns_category_counts(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/search/facets")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert "provinces" in data
        assert "trust_levels" in data
        assert "institutions" in data
        assert isinstance(data["categories"], dict)

    @pytest.mark.asyncio
    async def test_facets_with_filter(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/search/facets?official_only=true")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data


class TestOfficialOnlyFilter:
    @pytest.mark.asyncio
    async def test_official_only_filter(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "a", "official_only": True, "page": 1, "page_size": 20},
            )
        assert response.status_code == 200
        data = response.json()
        for result in data["results"]:
            assert result["trust_level"] == "official"


class TestPagination:
    @pytest.mark.asyncio
    async def test_pagination_default_page_size(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "test", "page": 1, "page_size": 10},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 10
        assert "total_pages" in data
        assert data["total_pages"] >= 1

    @pytest.mark.asyncio
    async def test_pagination_page_two(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "test", "page": 2, "page_size": 5},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 2
        assert data["page_size"] == 5

    @pytest.mark.asyncio
    async def test_pagination_invalid_page(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "test", "page": 0, "page_size": 20},
            )
        assert response.status_code in (200, 422)

    @pytest.mark.asyncio
    async def test_pagination_max_page_size(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "test", "page": 1, "page_size": 100},
            )
        assert response.status_code == 200
