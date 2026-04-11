"""Unit tests for authentication module."""
import pytest
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from jose import jwt
from passlib.context import CryptContext

from app.security.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    verify_totp,
)
from app.core.config import get_settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TestPasswordHashing:
    def test_hash_password_returns_string(self):
        result = get_password_hash("mypassword")
        assert isinstance(result, str)
        assert len(result) > 20

    def test_hash_produces_different_salts(self):
        h1 = get_password_hash("same_password")
        h2 = get_password_hash("same_password")
        assert h1 != h2

    def test_verify_password_correct(self):
        hashed = get_password_hash("correct_password")
        assert verify_password("correct_password", hashed) is True

    def test_verify_password_incorrect(self):
        hashed = get_password_hash("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_verify_password_empty_string(self):
        hashed = get_password_hash("password")
        assert verify_password("", hashed) is False

    def test_verify_unicode_password(self):
        password = "T\u00fcrk\u00e7e \u015fifre"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True


class TestAccessToken:
    def test_create_token_returns_string(self):
        token = create_access_token({"sub": "user-123"})
        assert isinstance(token, str)

    def test_token_contains_subject(self):
        user_id = str(uuid.uuid4())
        token = create_access_token({"sub": user_id})
        payload = jwt.decode(token, get_settings().app_secret_key, algorithms=["HS256"])
        assert payload["sub"] == user_id

    def test_token_has_expiry(self):
        token = create_access_token({"sub": "user-123"})
        payload = jwt.decode(token, get_settings().app_secret_key, algorithms=["HS256"])
        assert "exp" in payload

    def test_token_custom_expiry(self):
        delta = timedelta(hours=2)
        token = create_access_token({"sub": "user-123"}, expires_delta=delta)
        payload = jwt.decode(token, get_settings().app_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"])
        assert exp > datetime.utcnow() + timedelta(hours=1)

    def test_decode_valid_token(self):
        user_id = str(uuid.uuid4())
        token = create_access_token({"sub": user_id})
        payload = decode_access_token(token)
        assert payload["sub"] == user_id

    def test_decode_expired_token_raises(self):
        expired_exp = datetime.utcnow() - timedelta(hours=1)
        token = jwt.encode(
            {"sub": "user-123", "exp": expired_exp},
            get_settings().app_secret_key,
            algorithm="HS256",
        )
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            decode_access_token(token)

    def test_decode_wrong_secret_raises(self):
        token = jwt.encode(
            {"sub": "user-123", "exp": datetime.utcnow() + timedelta(hours=1)},
            "wrong-secret-key",
            algorithm="HS256",
        )
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            decode_access_token(token)

    def test_decode_malformed_token_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            decode_access_token("not-a-valid-token")


class TestTOTPVerification:
    def test_valid_totp(self):
        import pyotp
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        token = totp.now()
        assert verify_totp(token, secret) is True

    def test_invalid_totp_code(self):
        import pyotp
        secret = pyotp.random_base32()
        assert verify_totp("000000", secret) is False

    def test_totp_changes_over_time(self):
        import pyotp
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        code1 = totp.now()
        import time
        time.sleep(31)
        code2 = totp.now()
        assert code1 != code2

    def test_totp_six_digits(self):
        import pyotp
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        token = totp.now()
        assert len(token) == 6
        assert token.isdigit()


class TestCurrentUser:
    @pytest.mark.asyncio
    async def test_get_current_user_success(self):
        from app.security.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials

        user_id = uuid.uuid4()
        token = create_access_token({"sub": str(user_id)})

        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.is_active = True

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        mock_db.execute = AsyncMock(return_value=mock_result)

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        user = await get_current_user(credentials=credentials, db=mock_db)
        assert user.id == user_id
        assert user.is_active is True

    @pytest.mark.asyncio
    async def test_get_current_user_inactive(self):
        from app.security.auth import get_current_user
        from fastapi.security import HTTPAuthorizationCredentials
        from fastapi import HTTPException

        user_id = uuid.uuid4()
        token = create_access_token({"sub": str(user_id)})

        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.is_active = False

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none = MagicMock(return_value=mock_user)
        mock_db.execute = AsyncMock(return_value=mock_result)

        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

        with pytest.raises(HTTPException):
            await get_current_user(credentials=credentials, db=mock_db)

    @pytest.mark.asyncio
    async def test_get_current_active_user_success(self):
        from app.security.auth import get_current_active_user

        mock_user = MagicMock()
        mock_user.is_active = True

        user = await get_current_active_user(current_user=mock_user)
        assert user.is_active is True

    @pytest.mark.asyncio
    async def test_get_current_active_user_inactive(self):
        from app.security.auth import get_current_active_user
        from fastapi import HTTPException

        mock_user = MagicMock()
        mock_user.is_active = False

        with pytest.raises(HTTPException):
            await get_current_active_user(current_user=mock_user)


class TestRoleChecking:
    @pytest.mark.asyncio
    async def test_require_admin_success(self):
        from app.security.auth import require_admin
        from app.db.models import Role

        user_id = uuid.uuid4()
        mock_user = MagicMock()
        mock_user.id = user_id
        mock_user.is_active = True

        admin_role = MagicMock()
        admin_role.name = "admin"

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[admin_role])))
        mock_db.execute = AsyncMock(return_value=mock_result)

        user = await require_admin(current_user=mock_user, db=mock_db)
        assert user.id == user_id

    @pytest.mark.asyncio
    async def test_require_admin_non_admin_fails(self):
        from app.security.auth import require_admin
        from fastapi import HTTPException

        mock_user = MagicMock()
        mock_user.id = uuid.uuid4()
        mock_user.is_active = True

        viewer_role = MagicMock()
        viewer_role.name = "viewer"

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[viewer_role])))
        mock_db.execute = AsyncMock(return_value=mock_result)

        with pytest.raises(HTTPException):
            await require_admin(current_user=mock_user, db=mock_db)


class TestSessionManagement:
    @pytest.mark.asyncio
    async def test_session_model_creation(self):
        from app.db.models import Session

        session = Session(
            user_id=uuid.uuid4(),
            token="test-session-token",
            expires_at=datetime.utcnow() + timedelta(days=1),
        )
        assert session.token == "test-session-token"
        assert session.user_id is not None

    def test_access_token_expiry_from_settings(self):
        settings = get_settings()
        token = create_access_token({"sub": "user-123"})
        payload = jwt.decode(token, settings.app_secret_key, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload["exp"])
        expected_max = datetime.utcnow() + timedelta(hours=settings.session_max_age_hours)
        assert exp <= expected_max + timedelta(seconds=5)
