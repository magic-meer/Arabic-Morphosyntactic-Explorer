"""API routes for Arabic Dictionary/Lexicon operations."""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.api.deps import get_lexicon_service
from app.services.lexicon import LexiconService

router = APIRouter(prefix="/dictionary", tags=["dictionary"])

@router.get("/{root}")
async def get_lexicon_entry(
    root: str,
    lexicon_service: LexiconService = Depends(get_lexicon_service)
) -> Dict[str, Any]:
    """Get Lane's Lexicon dictionary entry for an Arabic root.

    Args:
        root: The root word (e.g. 'smw', 'rHm' or Arabic letters)
        lexicon_service: Injected Lexicon Service

    Returns:
        Dictionary entry containing definition and HTML formatting.
    """
    entry = await lexicon_service.lookup_root(root)
    
    if not entry:
        raise HTTPException(
            status_code=404,
            detail=f"Root '{root}' not found in the dictionary.",
        )

    return entry
