"""Smoke tests for basic API health and connectivity."""
import pytest

import httpx

BASE_URL = "http://localhost:8000"


class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_health_returns_ok(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["app"] == "prepturk"
        assert "version" in data
        assert "env" in data


class TestReadinessEndpoint:
    @pytest.mark.asyncio
    async def test_readiness_returns_ready(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.get("/api/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"


class TestBasicAPIConnectivity:
    @pytest.mark.asyncio
    async def test_openapi_docs_accessible(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.get("/api/docs")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_openapi_json_accessible(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.get("/api/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data

    @pytest.mark.asyncio
    async def test_auth_routes_exist(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/auth/register",
                json={"email": "missing", "username": "x", "password": "y"},
            )
        assert response.status_code in (201, 400, 409, 422)

    @pytest.mark.asyncio
    async def test_search_route_exists(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post("/api/search/", json={"query": "test"})
        assert response.status_code in (200, 401, 403)


class TestDatabaseConnectivity:
    @pytest.mark.asyncio
    async def test_register_writes_to_database(self):
        """Registering a user proves DB connectivity."""
        import uuid
        username = f"smoke_{uuid.uuid4().hex[:8]}"
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/auth/register",
                json={
                    "email": f"{username}@smoke.test",
                    "username": username,
                    "password": "smoketest123",
                },
            )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == username

    @pytest.mark.asyncio
    async def test_login_reads_from_database(self):
        import uuid
        username = f"smoke_login_{uuid.uuid4().hex[:8]}"
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            await client.post(
                "/api/auth/register",
                json={
                    "email": f"{username}@smoke.test",
                    "username": username,
                    "password": "smoketest123",
                },
            )
            response = await client.post(
                "/api/auth/login",
                json={"username": username, "password": "smoketest123"},
            )
        assert response.status_code == 200
        assert "access_token" in response.json()
