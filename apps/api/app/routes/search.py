from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, text, case
from typing import Optional
import uuid

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_local_device_operator

router = APIRouter()

# Allowlisted filterable fields (prevent probing sensitive fields)
ALLOWED_FILTER_FIELDS = {
    "category", "province", "institution", "trust_level", "storage_mode",
    "rights_status", "language", "review_status", "topic_tags", "source_domain",
    "country", "district", "subcategory", "emergency_relevance", "child_safe",
}

# Turkish character normalization mapping
TURKISH_NORMALIZATION = {
    "\u0131": "i",   # dotless i -> i
    "\u0130": "i",   # dotted I -> i
    "\u015f": "s",   # s-cedilla -> s
    "\u015e": "s",   # S-cedilla -> s
    "\u011f": "g",   # g-breve -> g
    "\u011e": "g",   # G-breve -> g
    "\u00f6": "o",   # o-umlaut -> o
    "\u00d6": "o",   # O-umlaut -> o
    "\u00fc": "u",   # u-umlaut -> u
    "\u00dc": "u",   # U-umlaut -> u
    "\u00e7": "c",   # c-cedilla -> c
    "\u00c7": "c",   # C-cedilla -> c
}


def normalize_turkish(text: str) -> str:
    """Normalize Turkish characters to ASCII equivalents for search."""
    result = text
    for turkish_char, ascii_char in TURKISH_NORMALIZATION.items():
        result = result.replace(turkish_char, ascii_char)
    return result


def _escape_wildcard(value: str) -> str:
    """Escape % and _ characters to prevent ILIKE wildcard abuse."""
    return value.replace("%", r"\%").replace("_", r"\_")


def _get_search_order_by(sort_by: str, normalized_query: str):
    if sort_by == "newest":
        return [Document.created_at.desc(), Document.id.desc()]

    if sort_by == "officiality":
        trust_rank = case(
            (Document.trust_level == "official", 0),
            (Document.trust_level == "institutional", 1),
            (Document.trust_level == "community", 2),
            (Document.trust_level == "personal", 3),
            else_=4,
        )
        return [trust_rank.asc(), Document.created_at.desc(), Document.id.desc()]

    relevance_rank = text(
        "ts_rank("
        "  to_tsvector('turkish', COALESCE(documents.title, '') || ' ' || "
        "  COALESCE(documents.summary, '') || ' ' || COALESCE(documents.abstract, '')), "
        "  plainto_tsquery('turkish', :query)"
        ") DESC"
    ).bindparams(query=normalized_query)
    return [relevance_rank, Document.created_at.desc(), Document.id.desc()]


@router.post("/", response_model=SearchResponse)
async def search_documents(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Search documents using PostgreSQL full-text search with Turkish normalization."""
    normalized_query = normalize_turkish(request.query)

    # Build the base WHERE clause
    where_clauses = [Document.deleted_at.is_(None)]

    if request.official_only:
        where_clauses.append(Document.trust_level == "official")
    if request.child_safe:
        where_clauses.append(Document.child_safe == True)

    # Apply filters with allowlist
    if request.filters:
        for field, value in request.filters.items():
            if field not in ALLOWED_FILTER_FIELDS:
                continue  # Silently ignore disallowed fields
            if not hasattr(Document, field):
                continue
            if isinstance(value, list):
                where_clauses.append(getattr(Document, field).in_(value))
            else:
                where_clauses.append(getattr(Document, field) == value)

    # Escape wildcards in user input for ILIKE
    escaped_query = _escape_wildcard(request.query)

    # Use PostgreSQL full-text search with tsvector
    search_clause = or_(
        Document.title.ilike(f"%{escaped_query}%", escape="\\"),
        Document.summary.ilike(f"%{escaped_query}%", escape="\\"),
        Document.abstract.ilike(f"%{escaped_query}%", escape="\\"),
        text(
            "to_tsvector('turkish', COALESCE(documents.title, '') || ' ' || "
            "COALESCE(documents.summary, '') || ' ' || "
            "COALESCE(documents.abstract, '')) @@ plainto_tsquery('turkish', :query)"
        ).bindparams(query=normalized_query),
    )
    where_clauses.append(search_clause)

    # Count query
    count_query = (
        select(func.count(Document.id))
        .where(and_(*where_clauses))
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Main query with deterministic sorting and highlighting
    offset = (request.page - 1) * request.page_size
    order_by_clauses = _get_search_order_by(request.sort_by, normalized_query)

    query = (
        select(Document)
        .where(and_(*where_clauses))
        .order_by(*order_by_clauses)
        .offset(offset)
        .limit(request.page_size)
    )

    result = await db.execute(query)
    documents = result.scalars().all()

    # Build results with highlights
    results = []
    for doc in documents:
        highlight = None
        if doc.title and request.query.lower() in normalize_turkish(doc.title).lower():
            highlight = _highlight_text(doc.title, request.query)
        elif doc.summary and request.query.lower() in normalize_turkish(doc.summary).lower():
            highlight = _highlight_text(doc.summary[:200], request.query)

        results.append(
            SearchResult(
                id=doc.id,
                title=doc.title,
                subtitle=doc.subtitle,
                institution=doc.institution,
                category=doc.category,
                trust_level=doc.trust_level,
                storage_mode=doc.storage_mode,
                rights_status=doc.rights_status,
                child_safe=doc.child_safe,
                summary=doc.summary,
                created_at=doc.created_at,
                highlight=highlight,
                score=None,
            )
        )

    total_pages = max(1, (total + request.page_size - 1) // request.page_size)

    return SearchResponse(
        results=results,
        total=total,
        page=request.page,
        page_size=request.page_size,
        total_pages=total_pages,
        query=request.query,
        filters_applied=request.filters or {},
    )


@router.get("/facets", response_model=dict)
async def get_search_facets(
    query: Optional[str] = None,
    category: Optional[str] = None,
    province: Optional[str] = None,
    official_only: bool = False,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get faceted search counts for filtering."""
    where_clauses = [Document.deleted_at.is_(None)]

    if official_only:
        where_clauses.append(Document.trust_level == "official")
    if category:
        where_clauses.append(Document.category == category)
    if province:
        where_clauses.append(Document.province == province)
    if query:
        normalized = normalize_turkish(query)
        where_clauses.append(
            or_(
                Document.title.ilike(f"%{query}%"),
                Document.summary.ilike(f"%{query}%"),
                text(
                    "to_tsvector('turkish', COALESCE(documents.title, '') || ' ' || "
                    "COALESCE(documents.summary, '')) @@ plainto_tsquery('turkish', :q)"
                ).bindparams(q=normalized),
            )
        )

    base_query = select().where(and_(*where_clauses))

    # Category facets (bounded)
    cat_query = (
        select(Document.category, func.count(Document.id).label("count"))
        .where(and_(*where_clauses))
        .group_by(Document.category)
        .order_by(func.count(Document.id).desc())
        .limit(50)
    )
    cat_result = await db.execute(cat_query)
    categories = {row.category: row.count for row in cat_result if row.category}

    # Province facets
    prov_query = (
        select(Document.province, func.count(Document.id).label("count"))
        .where(and_(*where_clauses))
        .group_by(Document.province)
        .order_by(func.count(Document.id).desc())
        .limit(20)
    )
    prov_result = await db.execute(prov_query)
    provinces = {row.province: row.count for row in prov_result if row.province}

    # Trust level facets
    trust_query = (
        select(Document.trust_level, func.count(Document.id).label("count"))
        .where(and_(*where_clauses))
        .group_by(Document.trust_level)
    )
    trust_result = await db.execute(trust_query)
    trust_levels = {row.trust_level: row.count for row in trust_result if row.trust_level}

    # Institution facets (bounded)
    inst_query = (
        select(Document.institution, func.count(Document.id).label("count"))
        .where(and_(*where_clauses))
        .group_by(Document.institution)
        .order_by(func.count(Document.id).desc())
        .limit(50)
    )
    inst_result = await db.execute(inst_query)
    institutions = {row.institution: row.count for row in inst_result if row.institution}

    return {
        "categories": categories,
        "provinces": provinces,
        "trust_levels": trust_levels,
        "institutions": institutions,
    }


@router.get("/suggestions", response_model=list[str])
async def get_search_suggestions(
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_local_device_operator),
):
    """Get search suggestions based on document titles and topics."""
    normalized = normalize_turkish(q)

    query = (
        select(Document.title, Document.topic_tags)
        .where(
            and_(
                Document.deleted_at.is_(None),
                or_(
                    Document.title.ilike(f"%{q}%"),
                    Document.summary.ilike(f"%{q}%"),
                ),
            )
        )
        .limit(limit)
    )
    result = await db.execute(query)
    rows = result.all()

    suggestions = []
    for title, tags in rows:
        if title not in suggestions:
            suggestions.append(title)
        if tags:
            for tag in tags:
                if q.lower() in tag.lower() and tag not in suggestions:
                    suggestions.append(tag)

    return suggestions[:limit]


def _highlight_text(text: str, query: str) -> str:
    """Add <mark> tags around matched text."""
    normalized_text = normalize_turkish(text)
    normalized_query = normalize_turkish(query).lower()

    idx = normalized_text.lower().find(normalized_query)
    if idx == -1:
        return text

    start = max(0, idx - 30)
    end = min(len(text), idx + len(query) + 30)
    prefix = "..." if start > 0 else ""
    suffix = "..." if end < len(text) else ""

    matched_text = text[start:end]
    match_idx = normalize_turkish(matched_text).lower().find(normalized_query)
    highlighted = (
        matched_text[:match_idx]
        + "<mark>"
        + matched_text[match_idx : match_idx + len(query)]
        + "</mark>"
        + matched_text[match_idx + len(query) :]
    )

    return f"{prefix}{highlighted}{suffix}"
