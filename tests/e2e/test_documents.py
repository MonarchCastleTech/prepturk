"""E2E tests for document CRUD operations."""
import pytest
import uuid

import httpx

BASE_URL = "http://localhost:8000"


class TestDocumentCreate:
    @pytest.mark.asyncio
    async def test_create_document(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/documents/",
                json={
                    "title": "Test Belgesi",
                    "summary": "Bu bir test belgesidir.",
                    "category": "emergency",
                    "province": "Ankara",
                    "institution": "Test Kurumu",
                    "trust_level": "community",
                    "storage_mode": "pointer_only",
                    "rights_status": "unknown_review_needed",
                    "topic_tags": ["test", "e2e"],
                },
            )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Belgesi"
        assert data["category"] == "emergency"
        assert data["province"] == "Ankara"
        assert "id" in data
        assert data["child_safe"] is True

    @pytest.mark.asyncio
    async def test_create_document_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/documents/",
                json={"title": "Test"},
            )
        assert response.status_code == 201

    @pytest.mark.asyncio
    async def test_create_document_missing_title(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/documents/",
                json={"summary": "No title here"},
            )
        assert response.status_code == 422


class TestDocumentRead:
    @pytest.mark.asyncio
    async def test_list_documents(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/documents/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_list_documents_pagination(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/documents/?page=1&page_size=10")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_document_by_id(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            created = await client.post(
                "/api/documents/",
                json={
                    "title": "Get By ID Test",
                    "category": "health",
                    "trust_level": "community",
                    "storage_mode": "pointer_only",
                    "rights_status": "unknown_review_needed",
                },
            )
            doc_id = created.json()["id"]

            response = await client.get(f"/api/documents/{doc_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Get By ID Test"
        assert data["id"] == doc_id

    @pytest.mark.asyncio
    async def test_get_nonexistent_document(self):
        fake_id = str(uuid.uuid4())
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get(f"/api/documents/{fake_id}")
        assert response.status_code == 404


class TestDocumentUpdate:
    @pytest.mark.asyncio
    async def test_update_document(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            created = await client.post(
                "/api/documents/",
                json={
                    "title": "Original Title",
                    "trust_level": "community",
                    "storage_mode": "pointer_only",
                    "rights_status": "unknown_review_needed",
                },
            )
            doc_id = created.json()["id"]

            response = await client.put(
                f"/api/documents/{doc_id}",
                json={"title": "Updated Title", "pinned": True},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["pinned"] is True

    @pytest.mark.asyncio
    async def test_update_nonexistent_document(self):
        fake_id = str(uuid.uuid4())
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.put(
                f"/api/documents/{fake_id}",
                json={"title": "New Title"},
            )
        assert response.status_code == 404


class TestDocumentDelete:
    @pytest.mark.asyncio
    async def test_soft_delete_document(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            created = await client.post(
                "/api/documents/",
                json={
                    "title": "To Be Deleted",
                    "trust_level": "community",
                    "storage_mode": "pointer_only",
                    "rights_status": "unknown_review_needed",
                },
            )
            doc_id = created.json()["id"]

            response = await client.delete(f"/api/documents/{doc_id}")
        assert response.status_code == 204

        deleted = await client.get(f"/api/documents/{doc_id}")
        assert deleted.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_document(self):
        fake_id = str(uuid.uuid4())
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.delete(f"/api/documents/{fake_id}")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_hard_delete_document_without_auth_is_rejected(self):
        fake_id = str(uuid.uuid4())
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.delete(f"/api/documents/{fake_id}/hard")
        assert response.status_code in (401, 403)


class TestDocumentFiltering:
    @pytest.mark.asyncio
    async def test_filter_by_category(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/documents/?category=emergency")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_filter_by_trust_level(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/documents/?trust_level=official")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_filter_by_province(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/documents/?province=Ankara")
        assert response.status_code == 200


class TestTrustBadgeAssignment:
    @pytest.mark.asyncio
    async def test_document_trust_level_official(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/documents/",
                json={
                    "title": "Official Document",
                    "trust_level": "official",
                    "storage_mode": "mirrored",
                    "rights_status": "public_download",
                },
            )
        assert response.status_code == 201
        data = response.json()
        assert data["trust_level"] == "official"

    @pytest.mark.asyncio
    async def test_document_trust_level_institutional(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/documents/",
                json={
                    "title": "Institutional Document",
                    "trust_level": "institutional",
                    "storage_mode": "cached",
                    "rights_status": "public_read_limited_redistribution",
                },
            )
        assert response.status_code == 201
        data = response.json()
        assert data["trust_level"] == "institutional"

    @pytest.mark.asyncio
    async def test_update_trust_level(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            created = await client.post(
                "/api/documents/",
                json={
                    "title": "Trust Level Change",
                    "trust_level": "community",
                    "storage_mode": "pointer_only",
                    "rights_status": "unknown_review_needed",
                },
            )
            doc_id = created.json()["id"]

            response = await client.put(
                f"/api/documents/{doc_id}",
                json={"trust_level": "official"},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["trust_level"] == "official"
