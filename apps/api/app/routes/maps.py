from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
import uuid
import os
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting
from app.schemas import *
from app.security.auth import get_local_device_operator

router = APIRouter()


@router.get("/layers", response_model=list[dict])
async def get_map_layers(
    category: Optional[str] = None,
    province: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Get map layers based on available document and geographic data."""
    layers = []

    # Province boundaries layer
    province_query = (
        select(Document.province, func.count(Document.id).label("doc_count"))
        .where(Document.province.isnot(None), Document.deleted_at.is_(None))
        .group_by(Document.province)
    )
    if category:
        province_query = province_query.where(Document.category == category)
    if province:
        province_query = province_query.where(Document.province == province)

    province_result = await db.execute(province_query)
    provinces = province_result.all()

    layers.append(
        {
            "id": "province-boundaries",
            "name": "Il Sinirlari",
            "type": "polygon",
            "provinces": [
                {"name": p.province, "document_count": p.doc_count}
                for p in provinces
            ],
        }
    )

    # Points of interest from documents
    poi_query = (
        select(Document)
        .where(
            Document.province.isnot(None),
            Document.deleted_at.is_(None),
        )
        .limit(100)
    )
    if category:
        poi_query = poi_query.where(Document.category == category)
    if province:
        poi_query = poi_query.where(Document.province == province)

    poi_result = await db.execute(poi_query)
    pois = poi_result.scalars().all()

    layers.append(
        {
            "id": "document-locations",
            "name": "Belge Konumlari",
            "type": "point",
            "points": [
                {
                    "id": d.id,
                    "title": d.title,
                    "category": d.category,
                    "province": d.province,
                    "district": d.district,
                    "institution": d.institution,
                }
                for d in pois
            ],
        }
    )

    # Province packs layer
    pack_query = select(ProvincePack).where(ProvincePack.is_active == True)
    pack_result = await db.execute(pack_query)
    packs = pack_result.scalars().all()

    layers.append(
        {
            "id": "province-packs",
            "name": "Il Paketleri",
            "type": "overlay",
            "packs": [
                {
                    "id": p.id,
                    "province_code": p.province_code,
                    "province_name": p.province_name,
                    "document_count": len(p.included_documents) if p.included_documents else 0,
                    "version": p.version,
                }
                for p in packs
            ],
        }
    )

    return layers


@router.get("/saved-places", response_model=list[dict])
async def list_saved_places(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Get user's saved places from bookmarks."""
    from app.db.models import Bookmark

    result = await db.execute(
        select(Bookmark)
        .where(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
    )
    bookmarks = result.scalars().all()

    places = []
    for bm in bookmarks:
        place = {
            "id": bm.id,
            "document_id": bm.document_id,
            "collection_name": bm.collection_name,
            "notes": bm.notes,
            "created_at": bm.created_at,
        }
        if bm.document_id:
            doc_result = await db.execute(
                select(Document).where(Document.id == bm.document_id, Document.deleted_at.is_(None))
            )
            doc = doc_result.scalar_one_or_none()
            if doc:
                place["document"] = {
                    "title": doc.title,
                    "province": doc.province,
                    "district": doc.district,
                    "category": doc.category,
                }
        places.append(place)

    return places


@router.post("/saved-places", response_model=dict, status_code=status.HTTP_201_CREATED)
async def save_place(
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Save a place/bookmark a document."""
    from app.db.models import Bookmark

    document_id = request.get("document_id")
    if document_id:
        doc_result = await db.execute(
            select(Document).where(Document.id == document_id, Document.deleted_at.is_(None))
        )
        if not doc_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Belge bulunamadi")

        existing = await db.execute(
            select(Bookmark).where(
                Bookmark.user_id == current_user.id,
                Bookmark.document_id == document_id,
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu yer zaten kaydedilmis")

    bookmark = Bookmark(
        user_id=current_user.id,
        document_id=document_id,
        collection_name=request.get("collection_name", "default"),
        notes=request.get("notes"),
    )
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)

    return {
        "id": bookmark.id,
        "document_id": bookmark.document_id,
        "collection_name": bookmark.collection_name,
        "notes": bookmark.notes,
        "created_at": bookmark.created_at,
        "message": "Konum kaydedildi",
    }


@router.delete("/saved-places/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_place(
    place_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Delete a saved place."""
    from app.db.models import Bookmark

    result = await db.execute(
        select(Bookmark).where(
            Bookmark.id == place_id,
            Bookmark.user_id == current_user.id,
        )
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kaydedilen yer bulunamadi")

    await db.delete(bookmark)
    await db.commit()
    return None


@router.post("/gpx/import", response_model=dict)
async def import_gpx(
    file: UploadFile = File(...),
    collection_name: str = Query("default"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Import a GPX file and extract waypoints/tracks."""
    from app.db.models import Bookmark

    content = await file.read()
    content_str = content.decode("utf-8", errors="replace")

    waypoints = _parse_gpx_waypoints(content_str)
    tracks = _parse_gpx_tracks(content_str)

    imported_count = 0
    for wp in waypoints:
        bookmark = Bookmark(
            user_id=current_user.id,
            collection_name=collection_name,
            notes=f"GPX waypoint: {wp.get('name', 'Bilinmeyen')}",
        )
        db.add(bookmark)
        imported_count += 1

    await db.commit()

    return {
        "message": "GPX dosyasi iceri aktarildi",
        "waypoints_imported": imported_count,
        "tracks_count": len(tracks),
        "tracks": tracks[:10],
    }


@router.post("/gpx/export", response_model=dict)
async def export_gpx(
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Export saved places as GPX."""
    from app.db.models import Bookmark

    collection_name = request.get("collection_name", "default")

    query = select(Bookmark).where(
        Bookmark.user_id == current_user.id,
        Bookmark.collection_name == collection_name,
    )
    result = await db.execute(query)
    bookmarks = result.scalars().all()

    gpx_content = _build_gpx_from_bookmarks(bookmarks)

    return {
        "message": "GPX dosyasi olusturuldu",
        "points_count": len(bookmarks),
        "gpx_content": gpx_content,
    }


def _parse_gpx_waypoints(gpx_content: str) -> list[dict]:
    """Parse waypoints from GPX XML content."""
    import re

    waypoints = []
    wpt_pattern = re.compile(
        r'<wpt\s+lat="([^"]+)"\s+lon="([^"]+)">(?:.*?<name>(.*?)</name>)?.*?</wpt>',
        re.DOTALL,
    )

    for match in wpt_pattern.finditer(gpx_content):
        waypoints.append(
            {
                "lat": match.group(1),
                "lon": match.group(2),
                "name": match.group(3) or "",
            }
        )

    return waypoints


def _parse_gpx_tracks(gpx_content: str) -> list[dict]:
    """Parse tracks from GPX XML content."""
    import re

    tracks = []
    trk_pattern = re.compile(r"<trk>(.*?)</trk>", re.DOTALL)
    name_pattern = re.compile(r"<name>(.*?)</name>")

    for match in trk_pattern.finditer(gpx_content):
        trk_content = match.group(1)
        name_match = name_pattern.search(trk_content)
        track_name = name_match.group(1) if name_match else "Bilinmeyen parkur"

        point_count = len(re.findall(r"<trkpt", trk_content))
        tracks.append({"name": track_name, "point_count": point_count})

    return tracks


def _build_gpx_from_bookmarks(bookmarks: list) -> str:
    """Build GPX XML content from bookmarks."""
    gpx_header = '<?xml version="1.0" encoding="UTF-8"?>\n'
    gpx_header += '<gpx version="1.1" creator="prepturk">\n'
    gpx_footer = "</gpx>"

    waypoints = ""
    for bm in bookmarks:
        name = bm.notes or f"Bookmark-{bm.id}"
        lat = "39.9334"
        lon = "32.8597"
        waypoints += f'  <wpt lat="{lat}" lon="{lon}"><name>{name}</name></wpt>\n'

    return f"{gpx_header}\n{waypoints}\n{gpx_footer}"
