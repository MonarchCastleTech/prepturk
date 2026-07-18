"""E2E tests for authentication flows."""
import uuid
from datetime import datetime, timedelta, timezone

import httpx
import jwt
import pytest

BASE_URL = "http://localhost:8000"
TEST_SECRET = "test-e2e-secret-key-for-authentication"


def create_token(user_id: uuid.UUID, secret: str = TEST_SECRET, expires_in_hours: int = 24) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)
    return jwt.encode({"sub": str(user_id), "exp": expire}, secret, algorithm="HS256")


def create_expired_token(user_id: uuid.UUID, secret: str = TEST_SECRET) -> str:
    expire = datetime.now(timezone.utc) - timedelta(hours=1)
    return jwt.encode({"sub": str(user_id), "exp": expire}, secret, algorithm="HS256")


def test_token_helpers_issue_hs256_tokens():
    user_id = uuid.uuid4()
    token = create_token(user_id)

    assert jwt.get_unverified_header(token)["alg"] == "HS256"
    assert jwt.decode(token, TEST_SECRET, algorithms=["HS256"])["sub"] == str(user_id)
    with pytest.raises(jwt.ExpiredSignatureError):
        jwt.decode(create_expired_token(user_id), TEST_SECRET, algorithms=["HS256"])


class TestUserRegistration:
    @pytest.mark.asyncio
    async def test_register_new_user(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/auth/register",
                json={
                    "email": "e2etest@example.com",
                    "username": "e2e_test_user",
                    "password": "securepassword123",
                    "display_name": "E2E Test User",
                    "language": "tr",
                },
            )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "e2e_test_user"
        assert data["email"] == "e2etest@example.com"
        assert data["is_active"] is True
        assert "id" in data
        assert data["totp_enabled"] is False

    @pytest.mark.asyncio
    async def test_register_duplicate_user_fails(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response1 = await client.post(
                "/api/auth/register",
                json={
                    "email": "dup@example.com",
                    "username": "dup_user",
                    "password": "securepassword123",
                },
            )
            assert response1.status_code in (201, 400)

            response2 = await client.post(
                "/api/auth/register",
                json={
                    "email": "dup@example.com",
                    "username": "dup_user",
                    "password": "securepassword123",
                },
            )
            assert response2.status_code == 400

    @pytest.mark.asyncio
    async def test_register_missing_fields_fails(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/auth/register",
                json={"email": "incomplete@example.com"},
            )
            assert response.status_code == 422


class TestLoginFlow:
    @pytest.mark.asyncio
    async def test_login_success(self):
        username = f"login_user_{uuid.uuid4().hex[:8]}"
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            await client.post(
                "/api/auth/register",
                json={
                    "email": f"{username}@example.com",
                    "username": username,
                    "password": "password123",
                },
            )

            response = await client.post(
                "/api/auth/login",
                json={"username": username, "password": "password123"},
            )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == username

    @pytest.mark.asyncio
    async def test_login_wrong_password(self):
        username = f"wrongpw_{uuid.uuid4().hex[:8]}"
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            await client.post(
                "/api/auth/register",
                json={
                    "email": f"{username}@example.com",
                    "username": username,
                    "password": "password123",
                },
            )

            response = await client.post(
                "/api/auth/login",
                json={"username": username, "password": "wrongpassword"},
            )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/auth/login",
                json={"username": "nonexistent_user_xyz", "password": "password123"},
            )
        assert response.status_code == 401


class TestProtectedRouteAccess:
    @pytest.mark.asyncio
    async def test_access_me_with_valid_token(self):
        username = f"protected_{uuid.uuid4().hex[:8]}"
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            reg = await client.post(
                "/api/auth/register",
                json={
                    "email": f"{username}@example.com",
                    "username": username,
                    "password": "password123",
                },
            )
            user_id = reg.json()["id"]

            token = create_token(uuid.UUID(user_id))

            response = await client.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == username

    @pytest.mark.asyncio
    async def test_access_me_without_token(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/auth/me")
        assert response.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_access_me_with_invalid_token(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get(
                "/api/auth/me",
                headers={"Authorization": "Bearer invalid.token.here"},
            )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_access_documents_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/documents/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio
    async def test_access_search_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/search/",
                json={"query": "test", "page": 1, "page_size": 20},
            )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data

    @pytest.mark.asyncio
    async def test_access_notes_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/notes/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio
    async def test_access_vault_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/vault/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio
    async def test_access_ai_conversations_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/ai/conversations")
        assert response.status_code == 200
        data = response.json()
        assert "conversations" in data
        assert "total" in data

    @pytest.mark.asyncio
    async def test_access_ai_chat_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/ai/chat",
                json={
                    "messages": [{"role": "user", "content": "Deprem hazirligi nedir?"}],
                    "mode": "default",
                    "official_only": False,
                    "child_safe": True,
                    "vault_mode": False,
                },
            )
        assert response.status_code == 200
        data = response.json()
        assert "conversation_id" in data
        assert "message_id" in data
        assert "content" in data

    @pytest.mark.asyncio
    async def test_access_province_packs_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/province-packs/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio
    async def test_access_maps_without_auth(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get("/api/maps/layers")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.asyncio
    async def test_fallback_route_with_bad_token_still_rejects(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get(
                "/api/notes/",
                headers={"Authorization": "Bearer invalid.token.here"},
            )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_province_pack_mutation_without_auth_is_rejected(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.post(
                "/api/province-packs/",
                json={"province_code": "06", "province_name": "Ankara"},
            )
        assert response.status_code in (401, 403)


class TestTokenExpiration:
    @pytest.mark.asyncio
    async def test_expired_token_rejected(self):
        fake_user_id = uuid.uuid4()
        expired_token = create_expired_token(fake_user_id)

        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {expired_token}"},
            )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_malformed_token_rejected(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get(
                "/api/auth/me",
                headers={"Authorization": "Bearer not-a-jwt-token-at-all"},
            )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_wrong_secret_token_rejected(self):
        fake_user_id = uuid.uuid4()
        token = jwt.encode(
            {"sub": str(fake_user_id), "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
            "wrong-secret-key",
            algorithm="HS256",
        )

        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            response = await client.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
        assert response.status_code == 401
