"""API routes for morphology operations."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import get_morphology_service
from app.models.morphology import (
    MorphologyAnalysisRequest,
    MorphologyAnalysisResponse,
    MorphologyFeatures,
    MorphologyWord,
    MorphologyResponse,
)
from app.services.morphology import MorphologyService

router = APIRouter(prefix="/morphology", tags=["morphology"])


def _convert_features(features_dict: dict) -> MorphologyFeatures:
    """Convert dictionary features to MorphologyFeatures model.

    Args:
        features_dict: Dictionary of morphological features

    Returns:
        MorphologyFeatures instance
    """
    return MorphologyFeatures(
        pos=features_dict.get("pos"),
        lemma=features_dict.get("lemma"),
        root=features_dict.get("root"),
        gender=features_dict.get("gender"),
        number=features_dict.get("number"),
        case=features_dict.get("case"),
        mood=features_dict.get("mood"),
        voice=features_dict.get("voice"),
        aspect=features_dict.get("aspect"),
        person=features_dict.get("person"),
        pronominal_suffix=features_dict.get("pronominal_suffix"),
    )


@router.get("/{chapter}/{verse}", response_model=MorphologyResponse)
async def get_verse_morphology(
    chapter: int,
    verse: int,
    morphology_service: MorphologyService = Depends(get_morphology_service),
) -> MorphologyResponse:
    """Get morphological analysis for a Quranic verse.

    Args:
        chapter: Chapter (surah) number
        verse: Verse number within the chapter
        morphology_service: Injected morphology service

    Returns:
        MorphologyResponse with word analyses
    """
    morphology = morphology_service.get_quranic_morphology(chapter, verse)

    if not morphology.get("words"):
        raise HTTPException(
            status_code=404,
            detail=f"Verse {chapter}:{verse} not found in the corpus",
        )

    words = []
    for word_data in morphology.get("words", []):
        features = word_data.get("features", {})
        words.append(
            MorphologyWord(
                form=word_data.get("form", ""),
                tag=word_data.get("tag", ""),
                features=_convert_features(features),
                original_features=word_data.get("original_features"),
            )
        )

    return MorphologyResponse(
        chapter=chapter,
        verse=verse,
        words=words,
    )


@router.post("/analyze", response_model=MorphologyAnalysisResponse)
async def analyze_text(
    request: MorphologyAnalysisRequest,
    morphology_service: MorphologyService = Depends(get_morphology_service),
) -> MorphologyAnalysisResponse:
    """Analyze morphological features of user-entered Arabic text.

    Args:
        request: Analysis request with text to analyze
        morphology_service: Injected morphology service

    Returns:
        MorphologyAnalysisResponse with word analyses
    """
    result = morphology_service.analyze_text(request.text)

    words = []
    for word_data in result.get("words", []):
        features_dict = word_data.get("features", {})
        words.append(
            MorphologyWord(
                form=word_data.get("form", ""),
                tag=word_data.get("tag") or "",
                features=_convert_features(features_dict),
                original_features=None,
            )
        )

    return MorphologyAnalysisResponse(
        text=result.get("text", ""),
        words=words,
        tokens_count=result.get("tokens_count", 0),
    )
