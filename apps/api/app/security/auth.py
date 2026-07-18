import sys
import uuid
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.database import get_db
from app.db.models import Role, User, UserRole

settings = get_settings()

# Validate secret key in non-development environments
_DEFAULT_SECRET = "dev-secret-key-change-in-production"
if settings.app_env != "development" and settings.app_secret_key == _DEFAULT_SECRET:
    print(
        "FATAL: APP_SECRET_KEY must be set to a secure random value in production. "
        "Generate one with: python -c 'import secrets; print(secrets.token_hex(32))'",
        file=sys.stderr,
    )
    sys.exit(1)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
DEVICE_OPERATOR_EMAIL = "device-operator@local.prepturk"
DEVICE_OPERATOR_USERNAME = "device_operator"
DEVICE_OPERATOR_DISPLAY_NAME = "Device Operator"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(hours=settings.session_max_age_hours))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.app_secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.app_secret_key, algorithms=["HS256"])
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecerli bir oturum saglanmadi",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    cookie_token: str | None = Cookie(None, alias="auth_token"),
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
) -> User:
    # Try Bearer token first, fall back to cookie
    token = None
    if credentials:
        token = credentials.credentials
    elif cookie_token:
        token = cookie_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecerli bir oturum saglanmadi",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = decode_access_token(token)
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanici bulunamadi")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanici bulunamadi veya aktif degil",
        )
    return user


async def _ensure_device_operator(db: AsyncSession) -> User:
    result = await db.execute(
        select(User).where((User.username == DEVICE_OPERATOR_USERNAME) | (User.email == DEVICE_OPERATOR_EMAIL))
    )
    user = result.scalar_one_or_none()
    if user:
        if not user.is_active:
            user.is_active = True
            await db.commit()
            await db.refresh(user)
        return user

    user = User(
        email=DEVICE_OPERATOR_EMAIL,
        username=DEVICE_OPERATOR_USERNAME,
        password_hash=get_password_hash(uuid.uuid4().hex),
        display_name=DEVICE_OPERATOR_DISPLAY_NAME,
        language="tr",
        is_active=True,
    )
    db.add(user)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        result = await db.execute(
            select(User).where((User.username == DEVICE_OPERATOR_USERNAME) | (User.email == DEVICE_OPERATOR_EMAIL))
        )
        user = result.scalar_one()
    else:
        await db.refresh(user)

    return user


async def get_local_device_operator(
    db: AsyncSession = Depends(get_db),
    cookie_token: str | None = Cookie(None, alias="auth_token"),
    credentials: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
) -> User:
    if credentials or cookie_token:
        return await get_current_user(
            db=db,
            cookie_token=cookie_token,
            credentials=credentials,
        )

    return await _ensure_device_operator(db)


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aktif olmayan kullanici")
    return current_user


async def require_role(required_role: str):
    async def role_checker(
        current_user: User = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db),
    ):
        result = await db.execute(select(Role).join(UserRole).where(UserRole.user_id == current_user.id))
        user_roles = result.scalars().all()
        role_names = {role.name for role in user_roles}
        if "admin" not in role_names and required_role not in role_names:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yetersiz yetki")
        return current_user

    return role_checker


async def require_admin(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Role).join(UserRole).where(UserRole.user_id == current_user.id))
    user_roles = result.scalars().all()
    if not any(role.name == "admin" for role in user_roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yonetici yetkisi gerekli")
    return current_user


def verify_totp(token: str, secret: str) -> bool:
    import pyotp

    totp = pyotp.TOTP(secret)
    return totp.verify(token)
