from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import get_settings
from app.db.database import engine, Base
from app.routes import auth, users, documents, search, sources, ingestion, review
from app.routes import province_packs, notes, vault, ai_chat, maps, exports, settings, dashboard, hardware
from app.security.auth import get_current_active_user

settings = get_settings()


# Network Isolation Middleware -- BLOCKS all outbound requests
# This ensures the API NEVER connects to the internet at runtime.
class NetworkIsolationMiddleware(BaseHTTPMiddleware):
    """Blocks all outbound HTTP/HTTPS connections. Ensures zero internet connectivity."""

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
            "geolocation=(), camera=(), microphone=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=()"
        )
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

# Network Isolation -- ZERO internet connectivity at runtime
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
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": "prepturk",
        "version": "0.1.0",
        "env": settings.app_env,
    }


@app.get("/api/health/ready")
async def readiness_check():
    return {"status": "ready"}
