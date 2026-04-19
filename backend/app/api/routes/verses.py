"""API routes for verse operations."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.api.deps import get_corpus_parser, get_morphology_service, get_vector_store, get_quran_dataset
from app.models.verse import (
    VerseResponse,
    VerseSearchResult,
    VerseSearchResponse,
    WordInfo,
)
from app.services.corpus_parser import CorpusParser
from app.services.morphology import MorphologyService
from app.services.vector_store import VectorStore

router = APIRouter(prefix="/verses", tags=["verses"])


class VerseSearchRequest(BaseModel):
    """Request model for verse search."""

    query: str = Field(description="Search query text")
    n_results: int = Field(default=5, description="Number of results to return")
    chapter: Optional[int] = Field(default=None, description="Filter by chapter number")


@router.get("/{chapter}/{verse}", response_model=VerseResponse)
async def get_verse(
    chapter: int,
    verse: int,
    corpus_parser: CorpusParser = Depends(get_corpus_parser),
    morphology_service: MorphologyService = Depends(get_morphology_service),
    quran_dataset = Depends(get_quran_dataset),
) -> VerseResponse:
    """Get a specific verse with morphological data.

    Args:
        chapter: Chapter (surah) number
        verse: Verse number within the chapter
        corpus_parser: Injected corpus parser
        morphology_service: Injected morphology service
        quran_dataset: Injected Uthmani dataset service

    Returns:
        VerseResponse with word and morphological data
    """
    await quran_dataset.load_verses()
    # Get morphological data
    morphology = morphology_service.get_quranic_morphology(chapter, verse)

    if not morphology.get("words"):
        raise HTTPException(
            status_code=404,
            detail=f"Verse {chapter}:{verse} not found in the corpus",
        )

    # Convert to response model
    words = []
    for word_data in morphology.get("words", []):
        features = word_data.get("features", {})
        words.append(
            WordInfo(
                form=word_data.get("form", ""),
                tag=word_data.get("tag", ""),
                lemma=features.get("lemma"),
                root=features.get("root"),
                features=features,
            )
        )

    return VerseResponse(
        chapter=chapter,
        verse=verse,
        words=words,
        verse_text=quran_dataset.get_verse_text(chapter, verse),
        translation=quran_dataset.get_translation(chapter, verse),
        transliteration=" ".join(w.form for w in words)
    )


@router.get("/{chapter}", response_model=dict)
async def get_chapter_verses(
    chapter: int,
    limit: int = Query(
        default=50, ge=1, le=286, description="Maximum verses to return"
    ),
    offset: int = Query(default=0, ge=0, description="Number of verses to skip"),
    corpus_parser: CorpusParser = Depends(get_corpus_parser),
    morphology_service: MorphologyService = Depends(get_morphology_service),
    quran_dataset = Depends(get_quran_dataset),
) -> dict:
    """Get all verses in a chapter with pagination.

    Args:
        chapter: Chapter (surah) number
        limit: Maximum number of verses to return
        offset: Number of verses to skip
        corpus_parser: Injected corpus parser
        morphology_service: Injected morphology service
        quran_dataset: Injected Uthmani dataset service

    Returns:
        Dictionary with chapter number, verses list, and pagination info
    """
    await quran_dataset.load_verses()
    chapter_data = corpus_parser.get_chapter(chapter)

    if not chapter_data:
        raise HTTPException(
            status_code=404,
            detail=f"Chapter {chapter} not found in the corpus",
        )

    verse_numbers = sorted(chapter_data.keys())
    total_verses = len(verse_numbers)

    # Apply pagination
    paginated_verses = verse_numbers[offset : offset + limit]

    verses = []
    for verse_num in paginated_verses:
        morphology = morphology_service.get_quranic_morphology(chapter, verse_num)

        words = []
        for word_data in morphology.get("words", []):
            features = word_data.get("features", {})
            words.append(
                WordInfo(
                    form=word_data.get("form", ""),
                    tag=word_data.get("tag", ""),
                    lemma=features.get("lemma"),
                    root=features.get("root"),
                    features=features,
                )
            )

        verses.append(
            VerseResponse(
                chapter=chapter,
                verse=verse_num,
                words=words,
                verse_text=quran_dataset.get_verse_text(chapter, verse_num),
                translation=quran_dataset.get_translation(chapter, verse_num),
                transliteration=" ".join(w.form for w in words)
            )
        )

    return {
        "chapter": chapter,
        "verse_count": total_verses,
        "verses": verses,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total_verses,
    }


@router.post("/search", response_model=VerseSearchResponse)
async def search_verses(
    request: VerseSearchRequest,
    vector_store: VectorStore = Depends(get_vector_store),
) -> VerseSearchResponse:
    """Search for verses using semantic search.

    Args:
        request: Search request with query and options
        vector_store: Injected vector store

    Returns:
        VerseSearchResponse with search results
    """
    results = vector_store.search(
        query=request.query,
        n_results=request.n_results,
        chapter_filter=request.chapter,
    )

    search_results = []
    for result in results:
        search_results.append(
            VerseSearchResult(
                chapter=result.chapter,
                verse=result.verse,
                arabic_text=result.arabic_text,
                translation=result.translation,
                transliteration=result.transliteration,
                similarity=result.similarity,
            )
        )

    return VerseSearchResponse(
        query=request.query,
        results=search_results,
        count=len(search_results),
    )
