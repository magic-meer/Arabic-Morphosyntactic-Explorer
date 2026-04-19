"""RAG Pipeline service for Quranic Q&A combining vector search with Gemini AI."""

from typing import Any, Optional

from app.services.gemini import GeminiService
from app.services.morphology import MorphologyService
from app.services.vector_store import SearchResult, VectorStore
from app.utils.logging import get_logger

logger = get_logger(__name__)


class RAGPipeline:
    """RAG pipeline combining vector search with Gemini AI for grounded Quranic Q&A.

    This service orchestrates:
    1. Vector-based semantic search for relevant verses
    2. Morphological analysis for verse-specific queries
    3. Gemini AI response generation with verse context
    """

    def __init__(
        self,
        vector_store: VectorStore,
        gemini_service: GeminiService,
        morphology_service: MorphologyService,
    ) -> None:
        """Initialize the RAG pipeline.

        Args:
            vector_store: Vector store for semantic search.
            gemini_service: Gemini service for AI responses.
            morphology_service: Morphology service for Arabic analysis.
        """
        self._vector_store = vector_store
        self._gemini_service = gemini_service
        self._morphology_service = morphology_service
        logger.info("RAG pipeline initialized")

    def search_verses(self, query: str, n_results: int = 5) -> list[dict[str, Any]]:
        """Search vector store for relevant verses.

        Args:
            query: Search query text.
            n_results: Number of results to return (default: 5).

        Returns:
            List of dictionaries containing:
            - chapter: Chapter number (surah)
            - verse: Verse number
            - text: Arabic text of the verse
            - translation: English translation
            - relevance: Similarity score (0-1)
        """
        logger.debug(f"Searching for verses with query: {query}")

        try:
            results = self._vector_store.search(query, n_results=n_results)

            verses = []
            for result in results:
                verses.append(
                    {
                        "chapter": result.chapter,
                        "verse": result.verse,
                        "text": result.arabic_text,
                        "translation": result.translation,
                        "relevance": result.similarity,
                    }
                )

            logger.debug(f"Found {len(verses)} relevant verses")
            return verses

        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    def get_verse_context(self, chapter: int, verse: int) -> Optional[dict[str, Any]]:
        """Get specific verse with morphological data.

        Args:
            chapter: Chapter (surah) number.
            verse: Verse number.

        Returns:
            Dictionary containing verse info + morphology, or None if not found.
        """
        logger.debug(f"Getting verse context for {chapter}:{verse}")

        try:
            # Get verse from vector store
            verse_result = self._vector_store.get_verse(chapter, verse)

            if verse_result is None:
                logger.warning(f"Verse {chapter}:{verse} not found in vector store")
                return None

            # Get morphological data
            morphology = self._morphology_service.get_quranic_morphology(chapter, verse)

            return {
                "chapter": verse_result.chapter,
                "verse": verse_result.verse,
                "text": verse_result.arabic_text,
                "translation": verse_result.translation,
                "morphology": morphology,
            }

        except Exception as e:
            logger.error(f"Failed to get verse context: {e}")
            return None

    def process_query(
        self,
        user_message: str,
        include_verses: bool = True,
        specific_verses: Optional[list[dict[str, Any]]] = None,
        model_name: Optional[str] = None,
    ) -> dict[str, Any]:
        """Main RAG pipeline: search + generate response.

        Args:
            user_message: The user's question or message.
            include_verses: Whether to search for relevant verses (default: True).
            specific_verses: Optional list of specific verses to use as context.
                           If provided, ignore include_verses and use these.
            model_name: Optional name of the Gemini model to use.

        Returns:
            Dictionary containing:
            - response: Generated response text from Gemini
            - context_verses: List of verses used as context
            - cached: Whether context was cached (not currently implemented)
        """
        logger.debug(f"Processing query with model {model_name or 'default'}: {user_message[:50]}...")

        # Determine which verses to use
        if specific_verses is not None:
            context_verses = specific_verses
        elif include_verses:
            # Search for relevant verses
            search_results = self.search_verses(user_message, n_results=5)
            context_verses = search_results
        else:
            context_verses = []

        # Generate response with Gemini
        try:
            response = self._gemini_service.generate_response(
                user_message=user_message,
                context_verses=context_verses,
                model_name=model_name,
                cached=False,
            )

            return {
                "response": response,
                "context_verses": context_verses,
                "cached": False,
            }

        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return {
                "response": "I apologize, but I encountered an error processing your query. Please try again.",
                "context_verses": context_verses,
                "cached": False,
            }

    def process_morphology_query(
        self, user_message: str, chapter: int, verse: int
    ) -> dict[str, Any]:
        """Process query about specific verse's morphology.

        Args:
            user_message: The user's question about the verse's morphology.
            chapter: Chapter (surah) number.
            verse: Verse number.

        Returns:
            Dictionary containing:
            - response: Generated response focused on morphology
            - context_verses: List containing the verse used
            - morphology: Morphological data for the verse
        """
        logger.debug(f"Processing morphology query for {chapter}:{verse}")

        # Get verse context with morphology
        verse_context = self.get_verse_context(chapter, verse)

        if verse_context is None:
            return {
                "response": f"I could not find verse {chapter}:{verse} in the corpus.",
                "context_verses": [],
                "morphology": None,
            }

        # Build context for Gemini
        context_verses = [
            {
                "chapter": verse_context["chapter"],
                "verse": verse_context["verse"],
                "text": verse_context["text"],
                "translation": verse_context["translation"],
            }
        ]

        # Add morphology information to the prompt
        morphology = verse_context["morphology"]
        morphology_info = self._format_morphology_context(morphology)

        # Create an enhanced prompt with morphology focus
        enhanced_message = f"""{user_message}

Note: The following morphological analysis is available for reference:
{morphology_info}"""

        # Generate response focused on morphology
        try:
            response = self._gemini_service.generate_response(
                user_message=enhanced_message,
                context_verses=context_verses,
                cached=False,
            )

            return {
                "response": response,
                "context_verses": context_verses,
                "morphology": morphology,
            }

        except Exception as e:
            logger.error(f"Failed to generate morphology response: {e}")
            return {
                "response": "I apologize, but I encountered an error analyzing the morphology of this verse.",
                "context_verses": context_verses,
                "morphology": morphology,
            }

    def _format_morphology_context(self, morphology: dict[str, Any]) -> str:
        """Format morphological data as context string.

        Args:
            morphology: Dictionary from get_quranic_morphology.

        Returns:
            Formatted string with word-by-word morphological analysis.
        """
        if not morphology or not morphology.get("words"):
            return "No morphological data available."

        lines = []
        for word_data in morphology.get("words", []):
            form = word_data.get("form", "")
            tag = word_data.get("tag", "unknown")
            features = word_data.get("features", {})

            # Build feature string
            feature_parts = []
            if root := features.get("root"):
                feature_parts.append(f"root: {root}")
            if lemma := features.get("lemma"):
                feature_parts.append(f"lemma: {lemma}")
            if pos := features.get("pos"):
                feature_parts.append(f"POS: {pos}")

            if feature_parts:
                lines.append(f"  {form} [{tag}]: {', '.join(feature_parts)}")
            else:
                lines.append(f"  {form} [{tag}]")

        return "\n".join(lines)
