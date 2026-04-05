"""Pydantic models for the Arabic Morphosyntactic Explorer API."""

from app.models.chat import ChatMessage, ChatRequest, ChatResponse, ContextVerse
from app.models.morphology import (
    MorphologyAnalysisRequest,
    MorphologyAnalysisResponse,
    MorphologyResponse,
)
from app.models.verse import (
    ChapterResponse,
    VerseResponse,
    VerseSearchResponse,
    VerseSearchResult,
    WordInfo,
)

__all__ = [
    # Verse models
    "WordInfo",
    "VerseResponse",
    "ChapterResponse",
    "VerseSearchResult",
    "VerseSearchResponse",
    # Morphology models
    "MorphologyResponse",
    "MorphologyAnalysisRequest",
    "MorphologyAnalysisResponse",
    # Chat models
    "ChatRequest",
    "ChatResponse",
    # Chat sub-models
    "ContextVerse",
    "ChatMessage",
]
