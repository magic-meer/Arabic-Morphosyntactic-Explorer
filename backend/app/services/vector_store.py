"""Vector store service for semantic search over Quranic verses using ChromaDB."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Optional imports with graceful fallback
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings

    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    chromadb = None
    ChromaSettings = None

try:
    from sentence_transformers import SentenceTransformer

    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None


@dataclass
class SearchResult:
    """Data class representing a search result from the vector store."""

    chapter: int
    verse: int
    arabic_text: str
    translation: Optional[str]
    similarity: float


class VectorStore:
    """Vector store service for semantic search over Quranic verses.

    Uses ChromaDB for vector storage and sentence-transformers for embeddings.
    Supports adding verses, batch operations, and semantic search.
    """

    COLLECTION_NAME = "quranic_verses"

    def __init__(self, persist_directory: Optional[Path] = None):
        """Initialize the vector store.

        Args:
            persist_directory: Directory for ChromaDB persistence.
                             Defaults to settings.chroma_db_path.
        """
        self._persist_directory = persist_directory or settings.chroma_db_path
        self._client = None
        self._collection = None
        self._model = None

        if not CHROMADB_AVAILABLE:
            logger.warning(
                "chromadb not available. VectorStore will be in limited mode."
            )
            return

        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning(
                "sentence-transformers not available. VectorStore will be in limited mode."
            )
            return

        self._init_client()

    def _init_client(self) -> None:
        """Initialize ChromaDB client and collection."""
        if not CHROMADB_AVAILABLE or not SENTENCE_TRANSFORMERS_AVAILABLE:
            return

        try:
            logger.info(f"Initializing ChromaDB at {self._persist_directory}")

            # Create persistent client
            self._client = chromadb.PersistentClient(
                path=str(self._persist_directory),
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True,
                ),
            )

            # Get or create collection
            self._collection = self._client.get_or_create_collection(
                name=self.COLLECTION_NAME,
                metadata={"description": "Quranic verses with embeddings"},
            )

            # Initialize sentence transformer model
            logger.info("Loading sentence-transformers model...")
            self._model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
            logger.info("Model loaded successfully")

        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            self._client = None
            self._collection = None

    def _get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Get embeddings for a list of texts.

        Args:
            texts: List of text strings to embed

        Returns:
            List of embedding vectors

        Raises:
            RuntimeError: If model is not available
        """
        if self._model is None:
            raise RuntimeError(
                "Embedding model not available. "
                "Ensure sentence-transformers is installed."
            )

        embeddings = self._model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()

    def add_verse(
        self,
        chapter: int,
        verse: int,
        arabic_text: str,
        translation: Optional[str] = None,
    ) -> None:
        """Add a single verse to the vector store.

        Args:
            chapter: Chapter (surah) number
            verse: Verse number
            arabic_text: Arabic text of the verse
            translation: Optional English translation
        """
        if self._collection is None:
            logger.warning("Cannot add verse: collection not initialized")
            return

        # Create unique ID for the verse
        verse_id = f"{chapter}:{verse}"

        # Get embedding for the verse text
        try:
            embedding = self._get_embeddings([arabic_text])[0]
        except Exception as e:
            logger.error(f"Failed to get embedding for verse {verse_id}: {e}")
            return

        # Add to collection
        self._collection.add(
            ids=[verse_id],
            embeddings=[embedding],
            metadatas=[
                {
                    "chapter": chapter,
                    "verse": verse,
                    "arabic_text": arabic_text,
                    "translation": translation or "",
                }
            ],
            documents=[arabic_text],
        )

        logger.debug(f"Added verse {verse_id} to vector store")

    def add_verses_batch(self, verses: list[dict]) -> None:
        """Add multiple verses at once.

        Args:
            verses: List of dictionaries with keys:
                   chapter, verse, arabic_text, translation
        """
        if self._collection is None:
            logger.warning("Cannot add verses: collection not initialized")
            return

        if not verses:
            return

        # Prepare data for batch insert
        ids = []
        embeddings = []
        metadatas = []
        documents = []

        for v in verses:
            verse_id = f"{v['chapter']}:{v['verse']}"
            ids.append(verse_id)
            metadatas.append(
                {
                    "chapter": v["chapter"],
                    "verse": v["verse"],
                    "arabic_text": v["arabic_text"],
                    "translation": v.get("translation", "") or "",
                }
            )
            documents.append(v["arabic_text"])

        # Get embeddings
        try:
            arabic_texts = [v["arabic_text"] for v in verses]
            embeddings = self._get_embeddings(arabic_texts)
        except Exception as e:
            logger.error(f"Failed to get embeddings for batch: {e}")
            return

        # Add to collection
        self._collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents,
        )

        logger.info(f"Added {len(verses)} verses to vector store")

    def search(
        self,
        query: str,
        n_results: int = 5,
        chapter_filter: Optional[int] = None,
    ) -> list[SearchResult]:
        """Search for verses similar to the query.

        Args:
            query: Search query text
            n_results: Number of results to return (default: 5)
            chapter_filter: Optional chapter number to filter results

        Returns:
            List of SearchResult objects sorted by similarity
        """
        if self._collection is None:
            logger.warning("Cannot search: collection not initialized")
            return []

        try:
            # Get query embedding
            query_embedding = self._get_embeddings([query])[0]

            # Prepare where filter for chapter
            where_filter = None
            if chapter_filter is not None:
                where_filter = {"chapter": chapter_filter}

            # Search the collection
            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_filter,
                include=["metadatas", "distances", "documents"],
            )

            # Parse results
            search_results = []
            if results["ids"] and results["ids"][0]:
                for i, verse_id in enumerate(results["ids"][0]):
                    metadata = results["metadatas"][0][i]
                    distance = results["distances"][0][i]

                    # Convert distance to similarity (lower distance = higher similarity)
                    similarity = 1.0 / (1.0 + distance)

                    search_results.append(
                        SearchResult(
                            chapter=metadata["chapter"],
                            verse=metadata["verse"],
                            arabic_text=metadata["arabic_text"],
                            translation=metadata["translation"] or None,
                            similarity=similarity,
                        )
                    )

            logger.debug(f"Found {len(search_results)} results for query: {query}")
            return search_results

        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    def get_verse(
        self,
        chapter: int,
        verse: int,
    ) -> Optional[SearchResult]:
        """Get a specific verse from the vector store.

        Args:
            chapter: Chapter (surah) number
            verse: Verse number

        Returns:
            SearchResult if found, None otherwise
        """
        if self._collection is None:
            logger.warning("Cannot get verse: collection not initialized")
            return None

        verse_id = f"{chapter}:{verse}"

        try:
            result = self._collection.get(
                ids=[verse_id],
                include=["metadatas"],
            )

            if not result["ids"] or not result["ids"][0]:
                return None

            metadata = result["metadatas"][0]

            return SearchResult(
                chapter=metadata["chapter"],
                verse=metadata["verse"],
                arabic_text=metadata["arabic_text"],
                translation=metadata["translation"] or None,
                similarity=1.0,  # Exact match has similarity 1.0
            )

        except Exception as e:
            logger.error(f"Failed to get verse {verse_id}: {e}")
            return None

    def get_verse_count(self) -> int:
        """Get total number of verses in the vector store.

        Returns:
            Number of verses stored
        """
        if self._collection is None:
            return 0

        return self._collection.count()

    def reset(self) -> None:
        """Reset/delete the collection."""
        if self._client is None:
            logger.warning("Cannot reset: client not initialized")
            return

        try:
            self._client.delete_collection(name=self.COLLECTION_NAME)
            logger.info("Vector store collection deleted")

            # Recreate collection
            self._collection = self._client.get_or_create_collection(
                name=self.COLLECTION_NAME,
                metadata={"description": "Quranic verses with embeddings"},
            )

        except Exception as e:
            logger.error(f"Failed to reset vector store: {e}")
