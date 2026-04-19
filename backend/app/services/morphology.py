"""Morphology service using CAMeL Tools for Arabic text analysis."""

from typing import Any, Optional

from app.services.corpus_parser import CorpusParser
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Module-level flag for CAMeL Tools availability
_CAMEL_AVAILABLE: Optional[bool] = None
_Analyzer: Optional[type] = None
_MorphologyDB: Optional[type] = None

try:
    from camel_tools.morphology.database import MorphologyDB
    from camel_tools.morphology.analyzer import Analyzer

    _CAMEL_AVAILABLE = True
    _Analyzer = Analyzer
    _MorphologyDB = MorphologyDB
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
                # Load the default morphological database (MSA)
                # then create an Analyzer instance — per CAMeL Tools Guided Tour
                db = _MorphologyDB.builtin_db()
                self._analyzer = _Analyzer(db)
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

    def analyze_word(self, word: str) -> list[dict[str, Any]]:
        """Analyze a single Arabic word using CAMeL Tools.

        Args:
            word: Arabic word to analyze

        Returns:
            List of analysis candidate dictionaries. Each contains keys like:
            diac, lex, root, gloss, pos, per, asp, vox, mod, gen, num, cas,
            form_gen, form_num, pattern, enc0, prc0-3, stt, d3seg, bw, catib6, ud.
            Returns a single-element list with an error key if analysis fails.
        """
        if not self._camel_available or self._analyzer is None:
            return [{"error": "CAMeL Tools not available", "form": word}]

        try:
            analyses = self._analyzer.analyze(word)

            if not analyses:
                return [{"error": "No analysis available", "form": word}]

            # CAMeL Tools returns list of dicts with all morphological features
            results = []
            for analysis in analyses:
                entry: dict[str, Any] = {}
                # Core fields
                for key in [
                    "diac", "lex", "root", "gloss", "pos", "bw",
                    "per", "asp", "vox", "mod", "gen", "num", "cas", "stt",
                    "form_gen", "form_num", "pattern", "enc0",
                    "prc0", "prc1", "prc2", "prc3",
                    "d1seg", "d2seg", "d3seg", "atbseg",
                    "catib6", "ud", "source",
                ]:
                    val = analysis.get(key) if isinstance(analysis, dict) else getattr(analysis, key, None)
                    if val is not None:
                        entry[key] = str(val)
                if entry:
                    entry["form"] = word
                    results.append(entry)

            return results if results else [{"error": "No features extracted", "form": word}]

        except Exception as e:
            logger.warning(f"Failed to analyze word '{word}': {e}")
            return [{"error": str(e), "form": word}]

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
