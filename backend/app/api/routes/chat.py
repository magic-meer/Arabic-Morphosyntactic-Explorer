"""API routes for AI chat/tutoring operations."""

from typing import Optional

from fastapi import APIRouter

from app.models.chat import ChatRequest, ChatResponse, ContextVerse
from app.services.rag import RAGPipeline

router = APIRouter(prefix="/chat", tags=["chat"])


def _get_rag_pipeline() -> RAGPipeline:
    """Get or create RAG pipeline singleton.

    Returns:
        RAGPipeline instance
    """
    from app.services.gemini import gemini_service
    from app.services.morphology import morphology_service
    from app.services.vector_store import VectorStore

    vector_store = VectorStore()

    return RAGPipeline(
        vector_store=vector_store,
        gemini_service=gemini_service,
        morphology_service=morphology_service,
    )


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
) -> ChatResponse:
    """AI tutoring conversation endpoint.

    Args:
        request: Chat request with message and optional context

    Returns:
        ChatResponse with AI-generated response and context verses
    """
    # Get RAG pipeline
    rag_pipeline = _get_rag_pipeline()

    # Prepare specific verses if provided
    specific_verses: Optional[list[dict]] = None
    if request.context_verses:
        specific_verses = [
            {
                "chapter": v.chapter,
                "verse": v.verse,
                "text": v.text,
                "translation": None,
            }
            for v in request.context_verses
        ]

    # Process the query
    result = rag_pipeline.process_query(
        user_message=request.message,
        include_verses=request.include_verses,
        specific_verses=specific_verses,
    )

    # Convert context verses
    context_verses = []
    for verse_dict in result.get("context_verses", []):
        context_verses.append(
            ContextVerse(
                chapter=verse_dict.get("chapter", 0),
                verse=verse_dict.get("verse", 0),
                text=verse_dict.get("text", ""),
                relevance=verse_dict.get("relevance", 0.0),
            )
        )

    return ChatResponse(
        response=result.get("response", ""),
        context_verses=context_verses,
        cached=result.get("cached", False),
    )
