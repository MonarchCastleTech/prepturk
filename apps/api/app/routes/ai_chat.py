from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
import uuid
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import (
    User, Document, Role, SourceManifest, IngestionRun, Note, ProvincePack, Setting,
    AIConversation, AIMessage, AICitation, DocumentChunk,
)
from app.schemas import *
from app.security.auth import get_local_device_operator

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """AI chat with RAG, citations, and conversation management.

    This implements a mock RAG response system that returns cited responses
    from local documents when documents are available, with proper confidence indicators.
    """
    conversation = None

    # Load or create conversation
    if request.conversation_id:
        result = await db.execute(
            select(AIConversation).where(
                AIConversation.id == request.conversation_id,
                AIConversation.user_id == current_user.id,
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konuşma bulunamadi")
    else:
        # Create new conversation
        user_message = request.messages[-1] if request.messages else None
        title = user_message.content[:100] if user_message else "Yeni konuşma"

        conversation = AIConversation(
            user_id=current_user.id,
            title=title,
            mode=request.mode,
            official_only=request.official_only,
            child_safe=request.child_safe,
            vault_mode=request.vault_mode,
        )
        db.add(conversation)
        await db.flush()

    # Save user message
    user_msg_content = request.messages[-1].content if request.messages else ""
    user_msg = AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=user_msg_content,
    )
    db.add(user_msg)
    await db.flush()

    # RAG: Search for relevant documents
    relevant_docs = []
    relevant_chunks = []
    if request.document_ids:
        result = await db.execute(
            select(Document).where(
                Document.id.in_(request.document_ids),
                Document.deleted_at.is_(None),
            )
        )
        relevant_docs = result.scalars().all()
    else:
        # Search by query
        search_query = user_msg_content.lower()
        doc_query = (
            select(Document)
            .where(
                Document.deleted_at.is_(None),
                or_(
                    Document.title.ilike(f"%{search_query}%"),
                    Document.summary.ilike(f"%{search_query}%"),
                ),
            )
            .limit(5)
        )
        if request.official_only:
            doc_query = doc_query.where(Document.trust_level == "official")
        if request.child_safe:
            doc_query = doc_query.where(Document.child_safe == True)

        doc_result = await db.execute(doc_query)
        relevant_docs = doc_result.scalars().all()

    # Get chunks for relevant documents
    if relevant_docs:
        doc_ids = [d.id for d in relevant_docs]
        chunk_query = (
            select(DocumentChunk)
            .where(DocumentChunk.document_id.in_(doc_ids))
            .limit(10)
        )
        chunk_result = await db.execute(chunk_query)
        relevant_chunks = chunk_result.scalars().all()

    # Generate response based on available documents
    response_content, confidence = _generate_rag_response(
        user_msg_content, relevant_docs, relevant_chunks, request.mode
    )

    # Save assistant message
    assistant_msg = AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=response_content,
        model="local-rag",
        token_count=len(response_content) // 4,
    )
    db.add(assistant_msg)
    await db.flush()

    # Save citations
    citations = []
    for doc in relevant_docs[:3]:
        citation_text = doc.summary or doc.title
        citation = AICitation(
            message_id=assistant_msg.id,
            document_id=doc.id,
            citation_text=citation_text[:500] if citation_text else None,
            page_reference=None,
            chunk_reference=None,
            confidence_score=0.85 if len(relevant_docs) > 0 else 0.5,
        )
        db.add(citation)
        citations.append(
            CitationResponse(
                document_id=doc.id,
                citation_text=citation_text[:500] if citation_text else None,
                page_reference=None,
                confidence_score=0.85,
            )
        )

    conversation.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        message_id=assistant_msg.id,
        content=response_content,
        citations=citations,
        model="local-rag",
        confidence=confidence,
    )


@router.get("/conversations", response_model=dict)
async def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """List user's AI conversations with pagination."""
    query = (
        select(AIConversation)
        .where(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.updated_at.desc())
    )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    conversations = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    return {
        "conversations": [
            {
                "id": c.id,
                "title": c.title,
                "mode": c.mode,
                "official_only": c.official_only,
                "child_safe": c.child_safe,
                "vault_mode": c.vault_mode,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
            }
            for c in conversations
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/conversations/total-count")
async def get_conversations_total_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Get total conversation count."""
    query = select(func.count(AIConversation.id)).where(AIConversation.user_id == current_user.id)
    result = await db.execute(query)
    return {"total": result.scalar()}


@router.get("/conversations/{conv_id}", response_model=dict)
async def get_conversation(
    conv_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Get a conversation with its messages."""
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conv_id,
            AIConversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konuşma bulunamadi")

    msg_result = await db.execute(
        select(AIMessage).where(AIMessage.conversation_id == conv_id).order_by(AIMessage.created_at.asc())
    )
    messages = msg_result.scalars().all()

    messages_data = []
    # Single query: fetch ALL citations for ALL messages at once
    cit_result = await db.execute(
        select(AICitation).where(AICitation.message_id.in_([m.id for m in messages]))
    )
    citations_by_message = {}
    for cit in cit_result.scalars().all():
        citations_by_message.setdefault(cit.message_id, []).append(cit)

    for msg in messages:
        msg_citations = []
        if msg.role == "assistant":
            for c in citations_by_message.get(msg.id, []):
                msg_citations.append(
                    {
                        "document_id": c.document_id,
                        "citation_text": c.citation_text,
                        "page_reference": c.page_reference,
                        "confidence_score": c.confidence_score,
                    }
                )

        messages_data.append(
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "model": msg.model,
                "created_at": msg.created_at,
                "citations": msg_citations,
            }
        )

    return {
        "id": conversation.id,
        "title": conversation.title,
        "mode": conversation.mode,
        "official_only": conversation.official_only,
        "child_safe": conversation.child_safe,
        "vault_mode": conversation.vault_mode,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
        "messages": messages_data,
    }


@router.delete("/conversations/{conv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conv_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Delete a conversation and its messages."""
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conv_id,
            AIConversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konuşma bulunamadi")

    await db.delete(conversation)
    await db.commit()
    return None


@router.delete("/conversations/{conv_id}/messages/{msg_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    conv_id: uuid.UUID,
    msg_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_local_device_operator),
):
    """Delete a specific message from a conversation."""
    result = await db.execute(
        select(AIMessage).where(
            AIMessage.id == msg_id,
            AIMessage.conversation_id == conv_id,
        )
    )
    message = result.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mesaj bulunamadi")

    await db.delete(message)
    await db.commit()
    return None


def _generate_rag_response(
    query: str,
    documents: list[Document],
    chunks: list[DocumentChunk],
    mode: str,
) -> tuple[str, str]:
    """Generate a response based on available documents with confidence level.

    Returns (response_content, confidence_level).
    Confidence levels: 'high', 'medium', 'low', 'no_sources'.
    """
    if not documents and not chunks:
        return (
            f"'{query}' sorunuz icin yerel belgelerde ilgili icerik bulunamadi. "
            "Bu soruyu cevaplayabilmek icin daha fazla belge yuklemeyi veya "
            "farkli bir soru sormayi deneyebilirsiniz.",
            "no_sources",
        )

    # Build context from documents and chunks
    context_parts = []
    for doc in documents[:3]:
        if doc.summary:
            context_parts.append(f"Belge: {doc.title}\nOzet: {doc.summary}")
        else:
            context_parts.append(f"Belge: {doc.title}")

    for chunk in chunks[:5]:
        context_parts.append(chunk.content[:300])

    context = "\n\n".join(context_parts)

    if mode == "official_only":
        prefix = "Asagidaki bilgiler resmi kaynaklardan derlenmistir:\n\n"
    elif mode == "child_safe":
        prefix = "Asagidaki bilgiler cocuklar icin uygun kaynaklardan derlenmistir:\n\n"
    elif mode == "explain_15":
        prefix = "15 yasindaki bir gencte anlatir gibi aciklayayim:\n\n"
    elif mode == "step_by_step":
        prefix = "Adim adim aciklayayim:\n\n"
    elif mode == "compare":
        prefix = "Farkli kaynaklardan bilgileri karsilastirarak sunuyorum:\n\n"
    else:
        prefix = ""

    # Generate a synthesized response
    if len(context) > 2000:
        context = context[:2000] + "..."

    response = (
        f"{prefix}"
        f"Sorunuz: {query}\n\n"
        f"Elimdeki belgelerden cikarilan bilgiler:\n"
    )

    for i, doc in enumerate(documents[:3], 1):
        summary = doc.summary[:200] if doc.summary else "Ozet mevcut degil."
        institution = f" ({doc.institution})" if doc.institution else ""
        response += f"\n{i}. **{doc.title}**{institution}: {summary}"

    if chunks:
        response += "\n\nIlgili iceriklerden alintilar:\n"
        for i, chunk in enumerate(chunks[:3], 1):
            response += f"\n- {chunk.content[:150]}..."

    confidence = "high" if len(documents) >= 2 and len(chunks) >= 3 else "medium" if len(documents) >= 1 else "low"

    return response, confidence
