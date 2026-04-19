"""API routes for data provenance / ingestion sanity checks."""

from fastapi import APIRouter

from app.services.vector_store import VectorStore

router = APIRouter(prefix="/provenance", tags=["provenance"])


@router.get("")
async def get_provenance() -> dict:
    """Return a snapshot of data provenance for the vector store and datasets."""
    store = VectorStore()
    return store.verify_data_provenance()
