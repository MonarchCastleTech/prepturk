from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings
from app.db.database import Base, engine
from app.routes import (
    ai_chat,
    auth,
    dashboard,
    documents,
    exports,
    ingestion,
    maps,
    notes,
    province_packs,
    review,
    search,
    sources,
    users,
    vault,
)
from app.routes import (
    settings as settings_routes,
)

settings = get_settings()


# Browser-facing network policy headers. Actual egress isolation must also be
# enforced by the deployment network and AIRGAP_MODE worker configuration.
class NetworkIsolationMiddleware(BaseHTTPMiddleware):
    """Apply same-origin browser policy and disclose configured runtime mode."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Add strict Content Security Policy headers
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "font-src 'self' data:; "
            "connect-src 'self'; "
            "media-src 'self'; "
            "object-src 'none'; "
            "frame-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "upgrade-insecure-requests"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), camera=(), microphone=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
        )
        response.headers["X-PrepTurk-Airgap-Mode"] = str(settings.airgap_mode).lower()
        response.headers["X-PrepTurk-Network-Policy"] = "deployment-enforced"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables only in development
    # In production, use Alembic migrations
    if settings.app_env == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: dispose engine gracefully
    await engine.dispose()


# Conditionally disable OpenAPI docs in production
docs_url = "/api/docs" if settings.app_env == "development" else None
openapi_url = "/api/openapi.json" if settings.app_env == "development" else None

app = FastAPI(
    title="PrepTurk API",
    description="PrepTurk Offline Command Center - Backend API",
    version="0.1.0",
    docs_url=docs_url,
    openapi_url=openapi_url,
    lifespan=lifespan,
)

# CORS - restricted to specific methods and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://web:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    expose_headers=["X-TOTP-Required"],
)

# Browser policy headers and explicit runtime-mode disclosure
app.add_middleware(NetworkIsolationMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(sources.router, prefix="/api/sources", tags=["sources"])
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["ingestion"])
app.include_router(review.router, prefix="/api/review", tags=["review"])
app.include_router(province_packs.router, prefix="/api/province-packs", tags=["province-packs"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(vault.router, prefix="/api/vault", tags=["vault"])
app.include_router(ai_chat.router, prefix="/api/ai", tags=["ai"])
app.include_router(maps.router, prefix="/api/maps", tags=["maps"])
app.include_router(exports.router, prefix="/api/exports", tags=["exports"])
app.include_router(settings_routes.router, prefix="/api/settings", tags=["settings"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/api/health")
async def health_check():
    return runtime_contract()


def runtime_contract() -> dict[str, str | bool]:
    """Return a deterministic, non-secret runtime capability contract."""
    return {
        "status": "ok",
        "app": "prepturk",
        "service": "prepturk-api",
        "version": "0.1.0",
        "contract_version": "1",
        "env": settings.app_env,
        "airgap_mode": settings.airgap_mode,
        "outbound_ingestion_enabled": not settings.airgap_mode,
        "authentication": "bearer-token",
        "authorization": "role-based",
    }


@app.get("/api/health/ready")
async def readiness_check():
    return {"status": "ready"}
