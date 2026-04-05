"""Morphology service using CAMeL Tools for Arabic text analysis."""

from typing import Any, Optional

from app.services.corpus_parser import CorpusParser
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Module-level flag for CAMeL Tools availability
_CAMEL_AVAILABLE: Optional[bool] = None
_MorphologyAnalyzer: Optional[type] = None

try:
    from camel_tools.morphology.analyzer import MorphologyAnalyzer

    _CAMEL_AVAILABLE = True
    _MorphologyAnalyzer = MorphologyAnalyzer
except ImportError:
    _CAMEL_AVAILABLE = False
    logger.info("CAMeL Tools not available. Morphology analysis will be limited.")


class MorphologyService:
    """Service for morphological analysis of Arabic text.

    Uses CAMeL Tools for general Arabic text analysis and the
    Quranic Arabic Corpus for verse-specific morphological data.
    """

    def __init__(self) -> None:
        """Initialize the morphology service."""
        self._corpus_parser = CorpusParser()
        self._camel_available = self._check_camel_tools()
        self._analyzer: Optional[Any] = None

        if self._camel_available:
            try:
                # Initialize default CAMeL analyzer
                self._analyzer = _MorphologyAnalyzer("calcea")
                logger.info("CAMeL Tools morphology analyzer initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize CAMeL analyzer: {e}")
                self._camel_available = False

    def _check_camel_tools(self) -> bool:
        """Check if CAMeL Tools is available.

        Returns:
            True if CAMeL Tools is available, False otherwise.
        """
        global _CAMEL_AVAILABLE

        if _CAMEL_AVAILABLE is None:
            try:
                import camel_tools.morphology.analyzer  # noqa: F401

                _CAMEL_AVAILABLE = True
            except ImportError:
                _CAMEL_AVAILABLE = False
                logger.info("CAMeL Tools not installed")

        return _CAMEL_AVAILABLE

    def analyze_word(self, word: str) -> dict[str, Any]:
        """Analyze a single Arabic word using CAMeL Tools.

        Args:
            word: Arabic word to analyze

        Returns:
            Dictionary containing analysis results with keys:
            - form: The original word form
            - tag: POS tag if available
            - features: Dictionary with pos, root, lemma (if available)
            - error: Error message if analysis failed
            - camel_available: Whether CAMeL Tools is available
        """
        result = {
            "form": word,
            "tag": None,
            "features": {},
            "camel_available": self._camel_available,
        }

        if not self._camel_available or self._analyzer is None:
            result["error"] = "CAMeL Tools not available"
            return result

        try:
            # Analyze the word
            analyses = self._analyzer.analyze(word)

            if analyses and len(analyses) > 0:
                # Get first analysis result
                first = analyses[0]

                # Extract features
                features = {}

                # POS (part of speech)
                if hasattr(first, "pos") and first.pos:
                    features["pos"] = first.pos
                    result["tag"] = first.pos

                # Root
                if hasattr(first, "root") and first.root:
                    features["root"] = str(first.root)

                # Lemma
                if hasattr(first, "lemma") and first.lemma:
                    features["lemma"] = str(first.lemma)

                # Diacritization (if available)
                if hasattr(first, "diacritization") and first.diacritization:
                    features["diacritization"] = str(first.diacritization)

                result["features"] = features
            else:
                result["error"] = "No analysis available"

        except Exception as e:
            logger.warning(f"Failed to analyze word '{word}': {e}")
            result["error"] = str(e)

        return result

    def get_quranic_morphology(self, chapter: int, verse: int) -> dict[str, Any]:
        """Get morphological data for a Quranic verse from the corpus.

        Args:
            chapter: Chapter (surah) number
            verse: Verse number

        Returns:
            Dictionary containing:
            - chapter: Chapter number
            - verse: Verse number
            - words: List of word dictionaries with form, tag, features, original_features
            - word_count: Number of words in the verse
        """
        words_data = self._corpus_parser.get_verse(chapter, verse)

        words = []
        for word_data in words_data:
            words.append(
                {
                    "form": word_data.form,
                    "tag": word_data.tag,
                    "features": word_data.features,
                    "original_features": word_data.features.copy(),
                }
            )

        return {
            "chapter": chapter,
            "verse": verse,
            "words": words,
            "word_count": len(words),
        }

    def analyze_text(self, text: str) -> dict[str, Any]:
        """Analyze multiple Arabic words from a text string.

        Args:
            text: Arabic text with space-separated words

        Returns:
            Dictionary containing:
            - text: Original text
            - words: List of word analysis results
            - tokens_count: Number of tokens analyzed
        """
        # Split text into words (space-separated)
        tokens = text.split()

        words = []
        for token in tokens:
            if token.strip():  # Skip empty tokens
                analysis = self.analyze_word(token)
                words.append(analysis)

        return {
            "text": text,
            "words": words,
            "tokens_count": len(words),
        }


# Singleton instance for use across the application
morphology_service = MorphologyService()
