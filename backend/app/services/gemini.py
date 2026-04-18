"""Gemini AI service for conversational Quranic tutoring."""

from typing import Generator

from google import genai
from google.genai import types

from app.utils.logging import get_logger

logger = get_logger(__name__)

# System prompt for Quranic tutoring
SYSTEM_PROMPT = """You are an expert tutor in Classical Arabic, specializing in Quranic linguistics.
Your role is to help students understand the Morphology (الصَرْفُ - Sarf) and Syntax (العَرَبِيَّةُ - I'rab) of Quranic verses.

When answering questions:
1. Always ground your explanations in the provided Quranic verses
2. Explain morphological features including: root (جَذْر), lemma (مَصْدَر), part of speech (فَصْل), gender (جِنْس), number (عَدَد), case (حَالَة)
3. Provide both Arabic technical terms and their English translations
4. Be pedagogical, encouraging, and patient
5. Use clear explanations suitable for learners of varying levels
6. When discussing verse content, reference the specific chapter and verse number

Morphological terms to use:
- جَذْر (root) - The triliteral or quadriliteral root of the word
- مَصْدَر (lemma/root word) - The dictionary form
- فَصْل (part of speech) - noun (اسم), verb (فعل), particle (حرف)
- جِنْس (gender) - masculine (مُذَكَّر), feminine (مُؤَنَّث)
- عَدَد (number) - singular (مُفْرَد), dual (مُثَنَّى), plural (جَمْع)
- حَالَة (case) - nominative (مَرْفُوع), accusative (مَنْصُوب), genitive (مَجْرُور)

Syntax terms to use:
- مُبْتَدَأ (subject/beginning) - The nominal phrase that the sentence starts with
- خَبَر (predicate) - The comment about the subject
- فِعْل (verb) - The verbal predicate
- فَاعِل (agent) - The doer of the action
- مَفْعُول بِهِ (object) - The recipient of the action
- مَجْرُور (genitive) - Prepositional phrase complement

Always maintain respect for the sacred nature of the Quranic text in your explanations."""


class GeminiServiceError(Exception):
    """Exception raised for Gemini service errors."""

    pass


class GeminiService:
    """Service for Gemini AI integration with Quranic tutoring capabilities.

    Uses Gemini 2.0 Flash for conversational tutoring about
    Quranic Arabic morphology and syntax.
    """

    MODEL_NAME = "gemini-2.0-flash"

    def __init__(self, api_key: str) -> None:
        """Initialize the Gemini service.

        Args:
            api_key: Google API key for Gemini access.

        Raises:
            GeminiServiceError: If configuration fails.
        """
        if not api_key:
            raise GeminiServiceError("API key is required")

        try:
            self._client = genai.Client(api_key=api_key)
            logger.info(f"Gemini service initialized with model {self.MODEL_NAME}")
        except Exception as e:
            raise GeminiServiceError(f"Failed to configure Gemini: {e}") from e

    def format_context_verses(self, verses: list[dict]) -> str:
        """Format verses as context string for prompts.

        Args:
            verses: List of verse dictionaries with keys:
                - chapter: Chapter number (surah)
                - verse: Verse number
                - text: Arabic text of the verse
                - translation: Optional English translation

        Returns:
            Formatted string with each verse on a new line in format:
            "[chapter:verse] Arabic text"
        """
        if not verses:
            return ""

        lines = []
        for verse in verses:
            chapter = verse.get("chapter", 0)
            verse_num = verse.get("verse", 0)
            text = verse.get("text", "")

            if text:
                lines.append(f"[{chapter}:{verse_num}] {text}")

        return "\n".join(lines)

    def _build_contents(self, user_message: str, context_verses: list[dict]) -> list[types.Content]:
        """Build the contents list for the API call.

        Args:
            user_message: The user's question or message.
            context_verses: List of verse dictionaries to use as context.

        Returns:
            List of Content objects for the API.
        """
        context_text = self.format_context_verses(context_verses)

        if context_text:
            full_message = f"""Context verses:
{context_text}

User question: {user_message}"""
        else:
            full_message = user_message

        return [types.Content(role="user", parts=[types.Part(text=full_message)])]

    def generate_response(
        self, user_message: str, context_verses: list[dict], cached: bool = True
    ) -> str:
        """Generate a response to user message with context verses.

        Args:
            user_message: The user's question or message.
            context_verses: List of verse dictionaries to use as context.
            cached: Whether to use/create context cache (default: True).

        Returns:
            Generated response text from Gemini.

        Raises:
            GeminiServiceError: If generation fails.
        """
        try:
            context_text = self.format_context_verses(context_verses)
            
            # Use context caching if enabled and context is large enough
            # (In a real app, we'd check if context_text is > 32k tokens, 
            # but here we demonstrate the intent)
            cache_name = None
            if cached and context_text:
                cache_key = f"cache_{hash(context_text)}"
                if cache_key in self._caches:
                    cache_name = self._caches[cache_key]
                else:
                    # Create new cache
                    # Note: This is a demonstration of the Gemini 2.0 caching API
                    try:
                        logger.info("Creating Gemini 2.0 context cache...")
                        cache = self._client.caches.create(
                            model=self.MODEL_NAME,
                            config=types.CreateCachedContentConfig(
                                system_instruction=SYSTEM_PROMPT,
                                contents=[types.Content(role="user", parts=[types.Part(text=f"Context verses:\n{context_text}")])],
                                ttl="1h"
                            )
                        )
                        cache_name = cache.name
                        self._caches[cache_key] = cache_name
                    except Exception as e:
                        logger.warning(f"Failed to create cache: {e}. Proceeding without cache.")

            if cache_name:
                response = self._client.models.generate_content(
                    model=self.MODEL_NAME,
                    contents=[types.Content(role="user", parts=[types.Part(text=f"User question: {user_message}")])],
                    config=types.GenerateContentConfig(
                        cached_content=cache_name,
                    ),
                )
            else:
                contents = self._build_contents(user_message, context_verses)
                response = self._client.models.generate_content(
                    model=self.MODEL_NAME,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                    ),
                )

            if response and response.text:
                return response.text
            else:
                logger.warning("Empty response from Gemini")
                return "I apologize, but I could not generate a response. Please try again."

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise GeminiServiceError(f"Failed to generate response: {e}") from e

    def generate_response_streaming(
        self, user_message: str, context_verses: list[dict]
    ) -> Generator[str, None, None]:
        """Generate a streaming response to user message with context verses.

        Args:
            user_message: The user's question or message.
            context_verses: List of verse dictionaries to use as context.

        Yields:
            Text chunks from the streaming response.

        Raises:
            GeminiServiceError: If generation fails.
        """
        try:
            contents = self._build_contents(user_message, context_verses)

            response = self._client.models.generate_content_stream(
                model=self.MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                ),
            )

            for chunk in response:
                if chunk and chunk.text:
                    yield chunk.text

        except Exception as e:
            logger.error(f"Error in streaming response: {e}")
            raise GeminiServiceError(
                f"Failed to generate streaming response: {e}"
            ) from e

    def is_available(self) -> bool:
        """Check if Gemini API is available.

        Returns:
            True if Gemini is available and responding, False otherwise.
        """
        try:
            # Simple test by generating a minimal response
            response = self._client.models.generate_content(
                model=self.MODEL_NAME,
                contents=[types.Content(role="user", parts=[types.Part(text="test")])],
            )
            return response is not None and response.text is not None
        except Exception as e:
            logger.warning(f"Gemini availability check failed: {e}")
            return False
