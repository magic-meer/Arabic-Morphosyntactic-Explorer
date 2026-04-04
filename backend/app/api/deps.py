"""FastAPI dependency injection for singleton services."""

from functools import lru_cache

from app.services.corpus_parser import CorpusParser
from app.services.morphology import MorphologyService
from app.services.vector_store import VectorStore


@lru_cache
def get_vector_store() -> VectorStore:
    """Get singleton VectorStore instance.

    Returns:
        VectorStore singleton instance
    """
    return VectorStore()


@lru_cache
def get_corpus_parser() -> CorpusParser:
    """Get singleton CorpusParser instance.

    Returns:
        CorpusParser singleton instance
    """
    return CorpusParser()


@lru_cache
def get_morphology_service() -> MorphologyService:
    """Get singleton MorphologyService instance.

    Returns:
        MorphologyService singleton instance
    """
    from app.services.morphology import morphology_service

    return morphology_service
