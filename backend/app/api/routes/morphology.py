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


@router.post("/analyze-word")
async def analyze_word_endpoint(
    request: dict,
    morphology_service: MorphologyService = Depends(get_morphology_service),
) -> dict:
    """Analyze a single Arabic word: CAMeL morphology + Gemini AI explanation.

    Args:
        request: Dictionary with 'word' key
        morphology_service: Injected morphology service

    Returns:
        WordAnalysisResponse with analyses and AI explanation
    """
    word = request.get("word", "").strip()
    if not word:
        raise HTTPException(status_code=400, detail="Word is required")

    # Step 1: Run CAMeL Tools analysis
    analyses = morphology_service.analyze_word(word)

    # Step 2: Build a prompt for Gemini with the analysis data
    ai_explanation = ""
    try:
        from app.config import settings
        from app.services.gemini import GeminiService

        if settings.gemini_api_key:
            gemini = GeminiService(api_key=settings.gemini_api_key)

            # Format the CAMeL analysis for the prompt
            analysis_summary = ""
            if analyses and not analyses[0].get("error"):
                first = analyses[0]
                analysis_summary = (
                    f"Diacritized: {first.get('diac', 'N/A')}\n"
                    f"Root: {first.get('root', 'N/A')}\n"
                    f"Lemma: {first.get('lex', 'N/A')}\n"
                    f"POS: {first.get('pos', 'N/A')}\n"
                    f"Pattern: {first.get('pattern', 'N/A')}\n"
                    f"Gloss: {first.get('gloss', 'N/A')}\n"
                    f"Gender: {first.get('gen', 'N/A')}\n"
                    f"Number: {first.get('num', 'N/A')}\n"
                    f"Case: {first.get('cas', 'N/A')}\n"
                    f"Mood: {first.get('mod', 'N/A')}\n"
                    f"Voice: {first.get('vox', 'N/A')}\n"
                    f"Aspect: {first.get('asp', 'N/A')}\n"
                    f"Person: {first.get('per', 'N/A')}\n"
                    f"Segmentation: {first.get('d3seg', 'N/A')}\n"
                    f"Buckwalter: {first.get('bw', 'N/A')}\n"
                )

            prompt = (
                f"Analyze the Arabic word '{word}' from a Sarf (صرف - morphology) "
                f"and I'rab (إعراب - syntax) perspective.\n\n"
                f"CAMeL Tools NLP Analysis:\n{analysis_summary}\n"
                f"Based on this data, provide:\n"
                f"1. **Sarf (صرف)**: Explain the word's morphological structure — "
                f"its root, pattern (وزن), form (باب), and how it is derived.\n"
                f"2. **I'rab (إعراب)**: Explain the possible syntactic roles this "
                f"word can take and what the diacritical marks indicate about its "
                f"grammatical case.\n"
                f"3. **Summary**: A brief plain-language summary for a learner.\n\n"
                f"Use Arabic grammatical terms with English translations. "
                f"Be pedagogical and concise."
            )

            ai_explanation = gemini.generate_response(
                user_message=prompt, context_verses=[]
            )
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"AI explanation failed: {e}")
        ai_explanation = "AI explanation is currently unavailable."

    return {
        "word": word,
        "analyses": analyses,
        "ai_explanation": ai_explanation,
    }
