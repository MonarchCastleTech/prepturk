from datetime import datetime, timedelta, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import User, Role, UserRole, Session as SessionModel
from app.schemas import LoginRequest, LoginResponse, RegisterRequest, UserResponse, ChangePasswordRequest
from app.security.auth import (
    get_password_hash,
    create_access_token,
    get_current_active_user,
    pwd_context,
    verify_totp,
)

router = APIRouter()

# Rate limiting: track failed login attempts per IP
_failed_login_attempts: dict[str, list[datetime]] = {}
_MAX_ATTEMPTS = 5
_LOCKOUT_SECONDS = 300


def _check_rate_limit(ip_address: str) -> None:
    """Check if IP has exceeded max login attempts."""
    now = datetime.now(timezone.utc)
    if ip_address in _failed_login_attempts:
        # Remove old attempts
        _failed_login_attempts[ip_address] = [
            t for t in _failed_login_attempts[ip_address]
            if (now - t).total_seconds() < _LOCKOUT_SECONDS
        ]
        if len(_failed_login_attempts[ip_address]) >= _MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Cok fazla basarisiz deneme. {_LOCKOUT_SECONDS // 60} dakika sonra tekrar deneyin.",
            )


def _record_failed_login(ip_address: str) -> None:
    now = datetime.now(timezone.utc)
    if ip_address not in _failed_login_attempts:
        _failed_login_attempts[ip_address] = []
    _failed_login_attempts[ip_address].append(now)


def _clear_failed_logins(ip_address: str) -> None:
    _failed_login_attempts.pop(ip_address, None)


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Rate limiting check (use X-Forwarded-For if behind proxy)
    client_ip = "unknown"  # In production, extract from request.headers
    _check_rate_limit(client_ip)

    result = await db.execute(select(User).where(User.username == request.username))
    user = result.scalar_one_or_none()

    # Verify password using bcrypt (handles salt internally)
    if not user or not pwd_context.verify(request.password, user.password_hash):
        _record_failed_login(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanici adi veya sifre hatali",
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hesap aktif degil")

    # Check TOTP if enabled
    if user.totp_enabled:
        if not request.totp_code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Dogrulama kodu gerekli",
                headers={"X-TOTP-Required": "true"},
            )
        if not user.totp_secret or not verify_totp(request.totp_code, user.totp_secret):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Gecerli bir dogrulama kodu girin",
            )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    # Set httpOnly cookie (more secure than localStorage)
    response.set_cookie(
        key="auth_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=86400,  # 24 hours
        path="/",
    )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    # Clear rate limit on success
    _clear_failed_logins(client_ip)

    return LoginResponse(access_token=access_token, user=UserResponse.model_validate(user))


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    existing = await db.execute(
        select(User).where((User.email == request.email) | (User.username == request.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kullanici zaten mevcut")

    # Create user
    user = User(
        email=request.email,
        username=request.username,
        password_hash=get_password_hash(request.password),
        display_name=request.display_name,
        language=request.language,
    )
    db.add(user)
    await db.flush()

    # Assign default viewer role
    result = await db.execute(select(Role).where(Role.name == "viewer"))
    viewer_role = result.scalar_one_or_none()
    if viewer_role:
        user_role = UserRole(user_id=user.id, role_id=viewer_role.id)
        db.add(user_role)

    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_active_user),
):
    response.delete_cookie(key="auth_token", path="/")
    return {"message": "Oturum kapatildi"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)


@router.post("/me/password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not pwd_context.verify(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mevcut sifre hatali")

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sifre en az 8 karakter olmalidir",
        )

    current_user.password_hash = get_password_hash(request.new_password)
    await db.commit()
    return {"message": "Sifre degistirildi"}


@router.post("/totp/enable")
async def enable_totp(
    response: Response,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate TOTP secret but do NOT enable it yet. User must verify first."""
    import pyotp

    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    # Do NOT set totp_enabled=True here -- user must prove they can generate codes first
    await db.commit()

    return {
        "secret": secret,
        "uri": pyotp.totp.TOTP(secret).provisioning_uri(
            name=current_user.email, issuer_name="prepturk"
        ),
    }


@router.post("/totp/verify")
async def verify_totp_code(
    request: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify a TOTP code and enable 2FA if correct."""
    if not current_user.totp_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="TOTP yapilandirilmamis")

    code = request.get("code", "")
    if verify_totp(code, current_user.totp_secret):
        current_user.totp_enabled = True
        await db.commit()
        return {"message": "TOTP dogrulandi ve aktiflestirildi"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Gecersiz kod")


@router.post("/totp/disable")
async def disable_totp(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    current_user.totp_enabled = False
    current_user.totp_secret = None
    await db.commit()
    return {"message": "TOTP devre disi birakildi"}
